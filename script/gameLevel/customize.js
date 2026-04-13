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

// ======================================================
// ABERTURA / FECHAMENTO
// ======================================================

export function openCustomizeHull(e) {
    if (e) e.preventDefault();
    if (!div_customize) return;
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
                    ${isAlien ? '🏆 COMPLETE\nO JOGO' : `🔒 ${ship.price}⭐`}
                </span>
            </div>` : ''}
            ${isActive ? `
            <div style="position:absolute;top:4px;left:0;right:0;text-align:center;">
                <span style="font-family:'Orbitron',sans-serif;font-size:0.5rem;color:#ffe600;
                    background:rgba(0,0,0,0.7);padding:1px 6px;border-radius:4px;">EM USO</span>
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
        if (priceEl) priceEl.textContent = '✅ CHASSI EM USO';
        if (btnBuy) setBtnStyle(btnBuy, 'EM USO', true, '#555', '#333', 'default', 'none');

    } else if (isAlien && !isUnlocked) {
        // Nave alien: apenas por conquista
        if (priceEl) priceEl.innerHTML = '🏆 <span style="color:#ff9900">BRINDE — Complete o jogo uma vez para desbloquear</span>';
        if (btnBuy) setBtnStyle(btnBuy, '🏆 COMPLETE O JOGO', true, '#553300', '#221100', 'not-allowed', 'none');

    } else if (isUnlocked) {
        if (priceEl) priceEl.textContent = '✅ DESBLOQUEADO — Pronto para uso';
        if (btnBuy) setBtnStyle(btnBuy, 'USAR ESTE CHASSI', false, '#00aa55', '#007733', 'pointer', '0 0 20px rgba(0,255,100,0.6)');

    } else {
        const playerStars = getPlayerData().totalStars || 0;
        const canAfford   = playerStars >= ship.price;
        if (priceEl) priceEl.textContent = `CUSTO: ${ship.price} ⭐  |  Você tem: ${playerStars} ⭐`;
        if (btnBuy) {
            if (canAfford) setBtnStyle(btnBuy, `ADQUIRIR — ${ship.price} ⭐`, false, '#cc9900', '#aa7700', 'pointer', '0 0 20px rgba(255,200,0,0.7)');
            else setBtnStyle(btnBuy, `⭐ INSUFICIENTES — ${ship.price} ⭐`, true, '#444', '#333', 'not-allowed', 'none');
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
        showFeedback('🏆 Complete o jogo para desbloquear a Nave Alien!', '#ff9900');
        return;
    }

    if (unlocked.includes(selectedShipId)) {
        const result = await selectShip(selectedShipId);
        if (result.success) {
            showFeedback(`✅ ${ship.name} ativada!`, '#00ff88');
            renderCarousel();
            updateShipInfo(selectedShipId);
        }
    } else {
        const result = await buyShip(selectedShipId);
        if (result.success) {
            showFeedback(`✅ ${ship.name} adquirida!`, '#ffd700');
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

if (div_customize) {
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

