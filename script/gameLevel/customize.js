// ======================================================
// GERENCIADOR DE CUSTOMIZAÇÃO (HULL / CHASSI)
// ======================================================

import { SHIPS, getShipById, getRarityColor } from '../ships.js';
import { buyShip, selectShip, getCurrentShip, getUnlockedShips, getPlayerData } from '../saveSystem.js';

const div_customize = document.getElementById('customize-hull-overlay');
const btn_close     = document.getElementById('btn-close-customize');
const btn_open      = document.getElementById('btn_customize_open');

let currentPage = 0;
const SHIPS_PER_PAGE = 4;
let selectedShipId = null;

const CUSTOMIZE_I18N = {
    'pt-BR': {
        title: '🚀 HULL & HANGAR MODS',
        pilot: 'PILOTO',
        resources: '⭐ RECURSOS',
        mission: '📡 MISSÃO',
        close: '✕ SAIR',
        speed: 'Velocidade',
        resistance: 'Resistência',
        energy: 'Energia',
        armor: 'BLINDAGEM',
        speedCaps: 'VELOCIDADE',
        slots: 'SLOTS DE ARMAS',
        selectHull: 'Selecione o Chassi',
        inUse: '✅ CHASSI EM USO',
        inUseBtn: 'EM USO',
        unlockGift: '🏆 <span style="color:#ff9900">BRINDE — Complete o jogo uma vez para desbloquear</span>',
        unlockGameBtn: '🏆 COMPLETE O JOGO',
        readyUse: '✅ DESBLOQUEADO — Pronto para uso',
        useHull: 'USAR ESTE CHASSI',
        costPrefix: 'CUSTO',
        youHave: 'Você tem',
        acquire: 'ADQUIRIR',
        insufficient: '⭐ INSUFICIENTES',
        unlockAlienHint: '🏆 Complete o jogo para desbloquear a Nave Alien!',
        activated: 'ativada',
        acquired: 'adquirida',
        lockCard: '🏆 COMPLETE\nO JOGO',
        inUseTag: 'EM USO'
    },
    en: {
        title: '🚀 HULL & HANGAR MODS',
        pilot: 'PILOT',
        resources: '⭐ RESOURCES',
        mission: '📡 MISSION',
        close: '✕ EXIT',
        speed: 'Speed',
        resistance: 'Resistance',
        energy: 'Energy',
        armor: 'ARMOR',
        speedCaps: 'SPEED',
        slots: 'WEAPON SLOTS',
        selectHull: 'Select Hull',
        inUse: '✅ HULL IN USE',
        inUseBtn: 'IN USE',
        unlockGift: '🏆 <span style="color:#ff9900">REWARD — Beat the game once to unlock</span>',
        unlockGameBtn: '🏆 BEAT THE GAME',
        readyUse: '✅ UNLOCKED — Ready to use',
        useHull: 'USE THIS HULL',
        costPrefix: 'COST',
        youHave: 'You have',
        acquire: 'ACQUIRE',
        insufficient: '⭐ NOT ENOUGH',
        unlockAlienHint: '🏆 Beat the game to unlock Alien Ship!',
        activated: 'activated',
        acquired: 'acquired',
        lockCard: '🏆 BEAT\nTHE GAME',
        inUseTag: 'IN USE'
    },
    es: {
        title: '🚀 MODS DE CASCO Y HANGAR',
        pilot: 'PILOTO',
        resources: '⭐ RECURSOS',
        mission: '📡 MISIÓN',
        close: '✕ SALIR',
        speed: 'Velocidad',
        resistance: 'Resistencia',
        energy: 'Energía',
        armor: 'BLINDAJE',
        speedCaps: 'VELOCIDAD',
        slots: 'SLOTS DE ARMAS',
        selectHull: 'Selecciona el casco',
        inUse: '✅ CASCO EN USO',
        inUseBtn: 'EN USO',
        unlockGift: '🏆 <span style="color:#ff9900">RECOMPENSA — Completa el juego una vez para desbloquear</span>',
        unlockGameBtn: '🏆 COMPLETA EL JUEGO',
        readyUse: '✅ DESBLOQUEADO — Listo para usar',
        useHull: 'USAR ESTE CASCO',
        costPrefix: 'COSTO',
        youHave: 'Tienes',
        acquire: 'ADQUIRIR',
        insufficient: '⭐ INSUFICIENTES',
        unlockAlienHint: '🏆 Completa el juego para desbloquear la Nave Alien!',
        activated: 'activada',
        acquired: 'adquirida',
        lockCard: '🏆 COMPLETA\nEL JUEGO',
        inUseTag: 'EN USO'
    }
};

function normalizeLanguage(lang) {
    if (!lang) return 'pt-BR';
    if (lang.toLowerCase().startsWith('pt')) return 'pt-BR';
    if (lang.toLowerCase().startsWith('es')) return 'es';
    return 'en';
}

function t() {
    const key = normalizeLanguage(localStorage.getItem('sf_language') || 'pt-BR');
    return CUSTOMIZE_I18N[key] || CUSTOMIZE_I18N['pt-BR'];
}

function applyCustomizeStaticLanguage() {
    const i18n = t();

    const title = document.querySelector('#customize-hull-overlay .hull-header-title');
    if (title) title.textContent = i18n.title;

    const pilotTag = document.querySelector('#customize-hull-overlay .hull-tag-label');
    if (pilotTag) pilotTag.textContent = i18n.pilot;

    const chips = document.querySelectorAll('#customize-hull-overlay .hull-chip-label');
    if (chips[0]) chips[0].textContent = i18n.resources;
    if (chips[1]) chips[1].textContent = i18n.mission;

    const closeBtn = document.getElementById('btn-close-customize');
    if (closeBtn) closeBtn.textContent = i18n.close;

    const statLabels = document.querySelectorAll('#customize-hull-overlay .hull-stat-item label');
    if (statLabels[0]) statLabels[0].childNodes[0].nodeValue = `${i18n.speed} `;
    if (statLabels[1]) statLabels[1].childNodes[0].nodeValue = `${i18n.resistance} `;
    if (statLabels[2]) statLabels[2].childNodes[0].nodeValue = `${i18n.energy} `;

    const chassiLabels = document.querySelectorAll('#customize-hull-overlay .chassi-stat-row > span');
    if (chassiLabels[0]) chassiLabels[0].textContent = i18n.armor;
    if (chassiLabels[1]) chassiLabels[1].textContent = i18n.speedCaps;
    if (chassiLabels[2]) chassiLabels[2].textContent = i18n.slots;

    const selectTitle = document.querySelector('#customize-hull-overlay .hull-carousel-section h4');
    if (selectTitle) selectTitle.textContent = i18n.selectHull;
}

// ======================================================
// ABERTURA / FECHAMENTO
// ======================================================

export function openCustomizeHull(e) {
    if (e) e.preventDefault();
    if (!div_customize) return;
    applyCustomizeStaticLanguage();
    div_customize.style.display = 'flex';
    selectedShipId = getCurrentShip();
    renderCarousel();
    updateShipInfo(selectedShipId);
    updateStarDisplay();
}

export function closeDiv(e) {
    if (e) e.preventDefault();
    if (div_customize) div_customize.style.display = 'none';
}

// ======================================================
// CARROSSEL
// ======================================================

function renderCarousel() {
    const grid = document.querySelector('.ship-grid');
    if (!grid) return;

    const unlocked  = getUnlockedShips();
    const start     = currentPage * SHIPS_PER_PAGE;
    const pageShips = SHIPS.slice(start, start + SHIPS_PER_PAGE);

    grid.innerHTML = '';

    pageShips.forEach(ship => {
        const isUnlocked = unlocked.includes(ship.id);
        const isActive   = ship.id === selectedShipId;
        const isAlien    = ship.id === 'alien';

        const item = document.createElement('div');
        item.className = 'ship-item' + (isActive ? ' active' : '');
        item.dataset.shipId = ship.id;

        item.innerHTML = `
            <img class="ship-item-img" src="${ship.image}" alt="${ship.name}"
                style="opacity:${isUnlocked ? '1' : '0.3'};">
            ${!isUnlocked ? `
            <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;
                justify-content:flex-end;padding-bottom:8px;background:rgba(0,0,0,0.35);border-radius:8px;">
                <span style="font-family:'Orbitron',sans-serif;font-size:0.55rem;color:${isAlien ? '#ff9900' : '#ffd700'};text-align:center;line-height:1.3;">
                    ${isAlien ? t().lockCard : `🔒 ${ship.price}⭐`}
                </span>
            </div>` : ''}
            ${isActive ? `
            <div style="position:absolute;top:4px;left:0;right:0;text-align:center;">
                <span style="font-family:'Orbitron',sans-serif;font-size:0.5rem;color:#ffe600;
                    background:rgba(0,0,0,0.7);padding:1px 6px;border-radius:4px;">${t().inUseTag}</span>
            </div>` : ''}
        `;

        item.addEventListener('click', () => onShipCardClick(ship.id));
        grid.appendChild(item);
    });

    // Visibilidade das setas
    const totalPages = Math.ceil(SHIPS.length / SHIPS_PER_PAGE);
    const al = document.querySelector('.nav-arrow-1');
    const ar = document.querySelector('.nav-arrow-2');
    if (al) al.style.opacity = currentPage > 0 ? '1' : '0.2';
    if (ar) ar.style.opacity = currentPage < totalPages - 1 ? '1' : '0.2';
}

// ======================================================
// CLIQUE EM CARD
// ======================================================

function onShipCardClick(shipId) {
    selectedShipId = shipId;
    renderCarousel();
    updateShipInfo(shipId);
}

// ======================================================
// PAINEL DE INFORMAÇÕES
// ======================================================

function updateShipInfo(shipId) {
    const ship      = getShipById(shipId);
    if (!ship) return;

    const unlocked   = getUnlockedShips();
    const isUnlocked = unlocked.includes(ship.id);
    const isCurrent  = ship.id === getCurrentShip();
    const isAlien    = ship.id === 'alien';

    // Preview
    const preview = document.getElementById('ship-preview-img');
    if (preview) preview.src = ship.image;

    // Nome e raridade
    const nameEl   = document.querySelector('.hull-ship-name');
    const rarityEl = document.querySelector('.hull-rarity');
    if (nameEl)   { nameEl.textContent = ship.name; nameEl.style.color = getRarityColor(ship.rarity); }
    if (rarityEl) { rarityEl.textContent = ship.rarity; rarityEl.style.color = getRarityColor(ship.rarity); rarityEl.style.borderColor = getRarityColor(ship.rarity); }

    // Descrição
    const descEl = document.querySelector('.hull-desc');
    if (descEl) descEl.textContent = ship.description;

    // Stats superiores
    const vSpeed  = document.getElementById('val-speed');
    const vHealth = document.getElementById('val-health');
    const vEnergy = document.getElementById('val-energy');
    const bSpeed  = document.getElementById('stat-speed');
    const bHealth = document.getElementById('stat-health');
    const bEnergy = document.getElementById('stat-energy');
    if (vSpeed)  vSpeed.textContent  = `${ship.speed * 10}%`;
    if (vHealth) vHealth.textContent = `${ship.armor * 10}%`;
    if (vEnergy) vEnergy.textContent = `${ship.slots * 25}%`;
    if (bSpeed)  bSpeed.style.width  = `${ship.speed * 10}%`;
    if (bHealth) bHealth.style.width = `${ship.armor * 10}%`;
    if (bEnergy) bEnergy.style.width = `${ship.slots * 25}%`;

    // Barras do chassi
    const armorFill = document.querySelector('.chassi-fill.armor');
    const speedFill = document.querySelector('.chassi-fill.speed');
    if (armorFill) armorFill.style.width = `${ship.armor * 10}%`;
    if (speedFill) speedFill.style.width = `${ship.speed * 10}%`;

    // Slots
    const slotsEl = document.querySelector('.slots');
    if (slotsEl) {
        slotsEl.innerHTML = '';
        for (let i = 0; i < 4; i++) {
            const slot = document.createElement('span');
            slot.className = 'slot' + (i < ship.slots ? ' active' : '');
            slotsEl.appendChild(slot);
        }
    }

    // Preço e botão
    const priceEl = document.querySelector('.hull-price');
    const btnBuy  = document.querySelector('.btn-buy');

    if (isCurrent) {
        if (priceEl) priceEl.textContent = t().inUse;
        if (btnBuy) setBtnStyle(btnBuy, t().inUseBtn, true, '#555', '#333', 'default', 'none');

    } else if (isAlien && !isUnlocked) {
        // Nave alien: apenas por conquista
        if (priceEl) priceEl.innerHTML = t().unlockGift;
        if (btnBuy) setBtnStyle(btnBuy, t().unlockGameBtn, true, '#553300', '#221100', 'not-allowed', 'none');

    } else if (isUnlocked) {
        if (priceEl) priceEl.textContent = t().readyUse;
        if (btnBuy) setBtnStyle(btnBuy, t().useHull, false, '#00aa55', '#007733', 'pointer', '0 0 20px rgba(0,255,100,0.6)');

    } else {
        const playerStars = getPlayerData().totalStars || 0;
        const canAfford   = playerStars >= ship.price;
        if (priceEl) priceEl.textContent = `${t().costPrefix}: ${ship.price} ⭐  |  ${t().youHave}: ${playerStars} ⭐`;
        if (btnBuy) {
            if (canAfford) setBtnStyle(btnBuy, `${t().acquire} — ${ship.price} ⭐`, false, '#cc9900', '#aa7700', 'pointer', '0 0 20px rgba(255,200,0,0.7)');
            else setBtnStyle(btnBuy, `${t().insufficient} — ${ship.price} ⭐`, true, '#444', '#333', 'not-allowed', 'none');
        }
    }
}

function setBtnStyle(btn, text, disabled, c1, c2, cursor, shadow) {
    btn.textContent = text;
    btn.disabled    = disabled;
    btn.style.background  = `linear-gradient(90deg, ${c1}, ${c2})`;
    btn.style.cursor      = cursor;
    btn.style.boxShadow   = shadow;
    btn.style.color       = disabled ? '#888' : '#000';
}

// ======================================================
// COMPRAR / USAR
// ======================================================

async function onBuyClick() {
    if (!selectedShipId) return;
    const ship     = getShipById(selectedShipId);
    const unlocked = getUnlockedShips();

    if (ship.id === 'alien' && !unlocked.includes('alien')) {
        showFeedback(t().unlockAlienHint, '#ff9900');
        return;
    }

    if (unlocked.includes(selectedShipId)) {
        const result = await selectShip(selectedShipId);
        if (result.success) {
            showFeedback(`✅ ${ship.name} ${t().activated}!`, '#00ff88');
            renderCarousel();
            updateShipInfo(selectedShipId);
        }
    } else {
        const result = await buyShip(selectedShipId);
        if (result.success) {
            showFeedback(`✅ ${ship.name} ${t().acquired}!`, '#ffd700');
            updateStarDisplay();
            renderCarousel();
            updateShipInfo(selectedShipId);
        } else {
            showFeedback(`❌ ${result.error}`, '#ff4444');
        }
    }
}

// ======================================================
// FEEDBACK VISUAL
// ======================================================

function showFeedback(message, color = '#fff') {
    let fb = document.getElementById('hull-feedback');
    if (!fb) {
        fb = document.createElement('div');
        fb.id = 'hull-feedback';
        fb.style.cssText = `
            position:fixed;bottom:100px;left:50%;transform:translateX(-50%);
            background:rgba(0,0,0,0.9);border:1px solid ${color};color:${color};
            padding:10px 24px;border-radius:8px;font-family:'Orbitron',sans-serif;
            font-size:0.9rem;z-index:99999999;pointer-events:none;
            transition:opacity 0.4s ease;letter-spacing:1px;
        `;
        document.body.appendChild(fb);
    }
    fb.textContent = message;
    fb.style.borderColor = color;
    fb.style.color = color;
    fb.style.opacity = '1';
    clearTimeout(fb._timeout);
    fb._timeout = setTimeout(() => { fb.style.opacity = '0'; }, 2800);
}

// ======================================================
// STARS DISPLAY
// ======================================================

function updateStarDisplay() {
    const data = getPlayerData();
    const stars   = data?.totalStars    || 0;
    const mission = data?.currentMission || 1;
    const pilot   = data?.pilotName     || '—';

    const elStars   = document.getElementById('hull-stars-display');
    const elMission = document.getElementById('hull-mission-display');
    const elPilot   = document.getElementById('hull-pilot-name');

    if (elStars)   elStars.textContent   = stars;
    if (elMission) elMission.textContent = mission;
    if (elPilot)   elPilot.textContent   = pilot.toUpperCase();
}

// ======================================================
// LISTENERS
// ======================================================

if (btn_close) btn_close.addEventListener('click', closeDiv);
if (btn_open)  btn_open.addEventListener('click', openCustomizeHull);

window.addEventListener('sf-language-changed', () => {
    applyCustomizeStaticLanguage();
    if (div_customize && div_customize.style.display === 'flex') {
        renderCarousel();
        if (selectedShipId) updateShipInfo(selectedShipId);
    }
});

if (div_customize) {
    applyCustomizeStaticLanguage();
    div_customize.addEventListener('click', e => {
        if (e.target === div_customize) closeDiv();
    });

    const totalPages = Math.ceil(SHIPS.length / SHIPS_PER_PAGE);
    const arrowLeft  = div_customize.querySelector('.nav-arrow-1');
    const arrowRight = div_customize.querySelector('.nav-arrow-2');

    if (arrowLeft) {
        arrowLeft.style.cursor = 'pointer';
        arrowLeft.addEventListener('click', () => {
            if (currentPage > 0) { currentPage--; renderCarousel(); }
        });
    }
    if (arrowRight) {
        arrowRight.style.cursor = 'pointer';
        arrowRight.addEventListener('click', () => {
            if (currentPage < totalPages - 1) { currentPage++; renderCarousel(); }
        });
    }

    const btnBuy = div_customize.querySelector('.btn-buy');
    if (btnBuy) btnBuy.addEventListener('click', onBuyClick);
}

