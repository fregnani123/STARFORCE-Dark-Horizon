// ============================================================
// UPGRADE SHIP MODULE
// ============================================================
import { getPlayerData, buyUpgrade, buySuperLaserUpgrade, buyWingmanUpgrade } from '../saveSystem.js';

const SUPER_LASER_COST = 200;

const UPGRADE_I18N = {
    'pt-BR': {
        title: '⚡ UPGRADE SHIP',
        pilot: 'PILOTO',
        stars: '⭐ ESTRELAS',
        mission: '📡 MISSÃO',
        close: '✕ SAIR',
        weaponTitle: '🔫 ARMAMENTO',
        hullTitle: '🛡️ BLINDAGEM',
        engineTitle: '🚀 PROPULSÃO',
        laserTitle: '⚡ SUPER LASER',
        wingmanTitle: '🦊 NAVE PARCEIRA',
        levelShort: 'Nv',
        current: '✅ ATUAL',
        unlocked: '✔ DESBLOQUEADO',
        buy: 'COMPRAR',
        wait: 'Aguarde...',
        missionLock: '🔒 Complete a Missão 1 para desbloquear',
        errBuyUpgrade: 'Erro ao comprar upgrade.',
        errWingman: 'Erro ao desbloquear Nave Parceira.',
        errLaser: 'Erro ao desbloquear Super Laser.',
        wingmanName: 'NAVE PARCEIRA',
        wingmanDesc: 'Invoca a nave da raposa android por 15 segundos. Ela combate ao seu lado e mira inimigos automaticamente.',
        keyText: 'Tecla: <strong style="color:#00ffee">F</strong> &nbsp;|&nbsp; Cooldown: 20s',
        laserName: 'SUPER LASER',
        laserDesc: 'Dispara um raio devastador que atravessa todos os inimigos na tela. Carrega durante o combate e pode ser ativado quando estiver 100%.',
        laserBtnTitle: 'Super Laser (Q)',
        laserLockTitle: 'Desbloqueie em UPGRADE SHIP',
        lockedText: 'LOCKED'
    },
    en: {
        title: '⚡ SHIP UPGRADES',
        pilot: 'PILOT',
        stars: '⭐ STARS',
        mission: '📡 MISSION',
        close: '✕ EXIT',
        weaponTitle: '🔫 WEAPONS',
        hullTitle: '🛡️ HULL',
        engineTitle: '🚀 PROPULSION',
        laserTitle: '⚡ SUPER LASER',
        wingmanTitle: '🦊 WINGMAN',
        levelShort: 'Lv',
        current: '✅ CURRENT',
        unlocked: '✔ UNLOCKED',
        buy: 'BUY',
        wait: 'Please wait...',
        missionLock: '🔒 Complete Mission 1 to unlock',
        errBuyUpgrade: 'Error while purchasing upgrade.',
        errWingman: 'Error while unlocking Wingman.',
        errLaser: 'Error while unlocking Super Laser.',
        wingmanName: 'WINGMAN',
        wingmanDesc: 'Summons the android fox wingman for 15 seconds. It fights by your side and targets enemies automatically.',
        keyText: 'Key: <strong style="color:#00ffee">F</strong> &nbsp;|&nbsp; Cooldown: 20s',
        laserName: 'SUPER LASER',
        laserDesc: 'Fires a devastating beam that pierces all enemies on screen. Charges during combat and can be activated at 100%.',
        laserBtnTitle: 'Super Laser (Q)',
        laserLockTitle: 'Unlock in SHIP UPGRADES',
        lockedText: 'LOCKED'
    },
    es: {
        title: '⚡ MEJORAS DE NAVE',
        pilot: 'PILOTO',
        stars: '⭐ ESTRELLAS',
        mission: '📡 MISIÓN',
        close: '✕ SALIR',
        weaponTitle: '🔫 ARMAMENTO',
        hullTitle: '🛡️ BLINDAJE',
        engineTitle: '🚀 PROPULSIÓN',
        laserTitle: '⚡ SUPER LÁSER',
        wingmanTitle: '🦊 NAVE COMPAÑERA',
        levelShort: 'Nv',
        current: '✅ ACTUAL',
        unlocked: '✔ DESBLOQUEADO',
        buy: 'COMPRAR',
        wait: 'Espere...',
        missionLock: '🔒 Completa la Misión 1 para desbloquear',
        errBuyUpgrade: 'Error al comprar mejora.',
        errWingman: 'Error al desbloquear Nave Compañera.',
        errLaser: 'Error al desbloquear Super Láser.',
        wingmanName: 'NAVE COMPAÑERA',
        wingmanDesc: 'Invoca la nave de zorro androide por 15 segundos. Combate a tu lado y apunta a enemigos automáticamente.',
        keyText: 'Tecla: <strong style="color:#00ffee">F</strong> &nbsp;|&nbsp; Enfriamiento: 20s',
        laserName: 'SUPER LÁSER',
        laserDesc: 'Dispara un rayo devastador que atraviesa a todos los enemigos en pantalla. Se carga durante el combate y puede activarse al 100%.',
        laserBtnTitle: 'Super Láser (Q)',
        laserLockTitle: 'Desbloquéalo en MEJORAS DE NAVE',
        lockedText: 'BLOQUEADO'
    }
};

function normalizeLanguage(lang) {
    if (!lang) return 'pt-BR';
    if (lang.toLowerCase().startsWith('pt')) return 'pt-BR';
    if (lang.toLowerCase().startsWith('es')) return 'es';
    return 'en';
}

function getCurrentLanguage() {
    return normalizeLanguage(localStorage.getItem('sf_language') || 'pt-BR');
}

function t() {
    return UPGRADE_I18N[getCurrentLanguage()] || UPGRADE_I18N['pt-BR'];
}

function applyUpgradeStaticLanguage() {
    const i18n = t();
    const title = document.querySelector('#upgrade-ship-overlay .upgrade-title');
    if (title) title.textContent = i18n.title;

    const tag = document.querySelector('#upgrade-ship-overlay .tag-label');
    if (tag) tag.textContent = i18n.pilot;

    const chips = document.querySelectorAll('#upgrade-ship-overlay .upgrade-stat-chip .chip-label');
    if (chips[0]) chips[0].textContent = i18n.stars;
    if (chips[1]) chips[1].textContent = i18n.mission;

    const close = document.getElementById('btn-close-upgrade');
    if (close) close.textContent = i18n.close;

    const weaponTitle = document.querySelector('#upgrade-col-weapon .upgrade-col-title');
    if (weaponTitle) weaponTitle.textContent = i18n.weaponTitle;

    const hullTitle = document.querySelector('#upgrade-col-hull .upgrade-col-title');
    if (hullTitle) hullTitle.textContent = i18n.hullTitle;

    const engineTitle = document.querySelector('#upgrade-col-engine .upgrade-col-title');
    if (engineTitle) engineTitle.textContent = i18n.engineTitle;

    const laserTitle = document.querySelector('#upgrade-col-laser .upgrade-col-title');
    if (laserTitle) laserTitle.textContent = i18n.laserTitle;

    const wingmanTitle = document.querySelector('#upgrade-col-wingman .upgrade-col-title');
    if (wingmanTitle) wingmanTitle.textContent = i18n.wingmanTitle;
}

const UPGRADE_CONFIG = {
    weapon: {
        label: '🔫 ARMAMENTO',
        levels: [
            { icon: '🔫',  name: 'CANHÃO SIMPLES',      desc: '1 projétil por disparo',          cost: 0   },
            { icon: '🔫🔫', name: 'CANHÃO DUPLO',        desc: '2 projéteis por disparo',         cost: 50  },
            { icon: '💥',  name: 'TRIPLE + BOMBA',       desc: '3 projéteis + Laser especial',    cost: 150 },
            { icon: '⚡',  name: 'GATLING QUÁDRUPLO',    desc: '5 projéteis + Laser aprimorado',  cost: 350 },
        ]
    },
    hull: {
        label: '🛡️ BLINDAGEM',
        levels: [
            { icon: '🛡️',  name: 'CASCO PADRÃO',        desc: '700 HP',   cost: 0   },
            { icon: '🛡️',  name: 'CASCO REFORÇADO',     desc: '800 HP',   cost: 80  },
            { icon: '🛡️',  name: 'CASCO COMPOSTO',      desc: '900 HP',   cost: 180 },
            { icon: '🛡️',  name: 'CASCO MILITAR',       desc: '1000 HP',  cost: 320 },
            { icon: '🛡️',  name: 'BLINDAGEM MÁXIMA',    desc: '1200 HP',  cost: 500 },
        ]
    },
    engine: {
        label: '🚀 PROPULSÃO',
        levels: [
            { icon: '🚀',  name: 'IMPULSOR BÁSICO',      desc: 'Velocidade padrão',          cost: 0   },
            { icon: '🚀',  name: 'IMPULSOR TURBO',       desc: '+10% de velocidade',         cost: 100 },
            { icon: '🚀',  name: 'PROPULSÃO HYPERDRIVE', desc: '+20% de velocidade',         cost: 250 },
        ]
    }
};

function renderLevels(type, currentLevel, totalStars) {
    const container = document.getElementById(`${type}-levels`);
    if (!container) return;
    container.innerHTML = '';

    const config = UPGRADE_CONFIG[type];

    config.levels.forEach((lvl, idx) => {
        const levelNum = idx + 1;
        const isUnlocked = levelNum < currentLevel;
        const isCurrent  = levelNum === currentLevel;
        const isNext     = levelNum === currentLevel + 1;
        const isLocked   = levelNum > currentLevel + 1;

        const card = document.createElement('div');
        card.className = `upgrade-card ${isCurrent ? 'state-current' : isUnlocked ? 'state-unlocked' : 'state-locked'}`;

        card.innerHTML = `
            <span class="level-badge">${t().levelShort} ${levelNum}</span>
            <div class="card-icon">${lvl.icon}</div>
            <div class="card-name">${lvl.name}</div>
            <div class="card-desc">${lvl.desc}</div>
        `;

        if (isCurrent) {
            const lbl = document.createElement('div');
            lbl.className = 'status-label current';
            lbl.textContent = t().current;
            card.appendChild(lbl);
        } else if (isUnlocked) {
            const lbl = document.createElement('div');
            lbl.className = 'status-label unlocked';
            lbl.textContent = t().unlocked;
            card.appendChild(lbl);
        } else if (isNext) {
            const canAfford = totalStars >= lvl.cost;
            const btn = document.createElement('button');
            btn.className = 'btn-buy-upgrade';
            btn.textContent = `${t().buy} — ${lvl.cost} ⭐`;
            btn.disabled = !canAfford;
            btn.addEventListener('click', async () => {
                btn.disabled = true;
                btn.textContent = t().wait;
                const result = await buyUpgrade(type);
                if (result.success) {
                    const data = await window.dbAPI.getPlayerData();
                    openUpgradeOverlay(data);
                } else {
                    alert(result.error || t().errBuyUpgrade);
                    btn.disabled = false;
                    btn.textContent = `${t().buy} — ${lvl.cost} ⭐`;
                }
            });
            card.appendChild(btn);
        }

        container.appendChild(card);

        // Arrow between cards (not after last)
        if (idx < config.levels.length - 1) {
            const arrow = document.createElement('div');
            arrow.className = 'upgrade-arrow';
            arrow.textContent = '↓';
            container.appendChild(arrow);
        }
    });
}

function renderWingman(data) {
    const container = document.getElementById('wingman-levels');
    if (!container) return;
    container.innerHTML = '';

    const WINGMAN_COST = 300;
    const isUnlocked     = data?.wingmanUnlocked || false;
    const currentMission = data?.currentMission || 1;
    const missionComplete = currentMission > 1;
    const totalStars     = data?.totalStars ?? 0;

    const card = document.createElement('div');
    card.className = `upgrade-card ${isUnlocked ? 'state-current' : 'state-locked'}`;
    card.innerHTML = `
        <div class="card-icon">🦊</div>
        <div class="card-name">${t().wingmanName}</div>
        <div class="card-desc">
            ${t().wingmanDesc}
            <br><br>
            ${t().keyText}
        </div>
    `;

    if (isUnlocked) {
        const lbl = document.createElement('div');
        lbl.className = 'status-label current';
        lbl.textContent = t().unlocked;
        card.appendChild(lbl);
    } else if (!missionComplete) {
        const lbl = document.createElement('div');
        lbl.className = 'status-label mission-lock';
        lbl.textContent = t().missionLock;
        card.appendChild(lbl);
    } else {
        const canAfford = totalStars >= WINGMAN_COST;
        const btn = document.createElement('button');
        btn.className = 'btn-buy-upgrade';
        btn.textContent = `${t().buy} — ${WINGMAN_COST} ⭐`;
        btn.disabled = !canAfford;
        btn.addEventListener('click', async () => {
            btn.disabled = true;
            btn.textContent = t().wait;
            const result = await buyWingmanUpgrade();
            if (result.success) {
                const freshData = await window.dbAPI.getPlayerData();
                openUpgradeOverlay(freshData);
            } else {
                alert(result.error || t().errWingman);
                btn.disabled = false;
                btn.textContent = `${t().buy} — ${WINGMAN_COST} ⭐`;
            }
        });
        card.appendChild(btn);
    }

    container.appendChild(card);
}

function renderSuperLaser(data) {
    const container = document.getElementById('laser-levels');
    if (!container) return;
    container.innerHTML = '';

    const isUnlocked = data?.superLaserUnlocked || false;
    const currentMission = data?.currentMission || 1;
    const missionComplete = currentMission > 1;  // completou ao menos a missão 1
    const totalStars = data?.totalStars ?? 0;

    // Card único do Super Laser
    const card = document.createElement('div');
    card.className = `upgrade-card ${isUnlocked ? 'state-current' : 'state-locked'}`;

    card.innerHTML = `
        <div class="card-icon">⚡</div>
        <div class="card-name">${t().laserName}</div>
        <div class="card-desc">
            ${t().laserDesc}
        </div>
    `;

    if (isUnlocked) {
        const lbl = document.createElement('div');
        lbl.className = 'status-label current';
        lbl.textContent = t().unlocked;
        card.appendChild(lbl);
    } else if (!missionComplete) {
        const lbl = document.createElement('div');
        lbl.className = 'status-label mission-lock';
        lbl.textContent = t().missionLock;
        card.appendChild(lbl);
    } else {
        const canAfford = totalStars >= SUPER_LASER_COST;
        const btn = document.createElement('button');
        btn.className = 'btn-buy-upgrade';
        btn.textContent = `${t().buy} — ${SUPER_LASER_COST} ⭐`;
        btn.disabled = !canAfford;
        btn.addEventListener('click', async () => {
            btn.disabled = true;
            btn.textContent = t().wait;
            const result = await buySuperLaserUpgrade();
            if (result.success) {
                const freshData = await window.dbAPI.getPlayerData();
                openUpgradeOverlay(freshData);
                syncSuperLaserHUD(true);
            } else {
                alert(result.error || t().errLaser);
                btn.disabled = false;
                btn.textContent = `${t().buy} — ${SUPER_LASER_COST} ⭐`;
            }
        });
        card.appendChild(btn);
    }

    container.appendChild(card);
}

// Sincroniza o visual do botão de super laser no HUD do jogo
function syncSuperLaserHUD(isUnlocked) {
    const btn = document.getElementById('superLaserButton');
    if (!btn) return;

    if (isUnlocked) {
        // Estado normal — remove estilo de bloqueado
        btn.classList.remove('laser-locked');
        btn.title = t().laserBtnTitle;
        const label = btn.querySelector('.laser-label');
        if (label) label.textContent = '';
    } else {
        // Estado bloqueado — mostra cadeado, impede clique visual
        btn.classList.add('laser-locked');
        btn.title = t().laserLockTitle;
        const label = btn.querySelector('.laser-label');
        if (label) label.textContent = '🔒';
        const pct = btn.querySelector('.laser-percent');
        if (pct) pct.textContent = t().lockedText;
    }
}

function openUpgradeOverlay(data) {
    const overlay = document.getElementById('upgrade-ship-overlay');
    if (!overlay) return;

    applyUpgradeStaticLanguage();

    const stars   = data?.totalStars   ?? 0;
    const mission = data?.currentMission ?? 1;
    const pilot   = data?.pilotName    ?? '—';

    const elStars   = document.getElementById('upgrade-stars-display');
    const elMission = document.getElementById('upgrade-mission-display');
    const elPilot   = document.getElementById('upgrade-pilot-name');

    if (elStars)   elStars.textContent   = stars;
    if (elMission) elMission.textContent = mission;
    if (elPilot)   elPilot.textContent   = pilot.toUpperCase();

    renderLevels('weapon', data?.weaponLevel || 1, stars);
    renderLevels('hull',   data?.hullLevel   || 1, stars);
    renderLevels('engine', data?.engineLevel || 1, stars);
    renderSuperLaser(data);
    renderWingman(data);

    overlay.classList.remove('hidden');
}

function closeUpgradeOverlay() {
    const overlay = document.getElementById('upgrade-ship-overlay');
    if (overlay) overlay.classList.add('hidden');
}

// Wire up open/close buttons
const btnOpen  = document.getElementById('btn-upgrade-open');
const btnClose = document.getElementById('btn-close-upgrade');

if (btnOpen) {
    btnOpen.addEventListener('click', async () => {
        const data = await window.dbAPI.getPlayerData();
        openUpgradeOverlay(data);
    });
}
if (btnClose) {
    btnClose.addEventListener('click', closeUpgradeOverlay);
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeUpgradeOverlay();
});

window.addEventListener('sf-language-changed', async () => {
    applyUpgradeStaticLanguage();
    const overlay = document.getElementById('upgrade-ship-overlay');
    const data = await window.dbAPI.getPlayerData();
    if (overlay && !overlay.classList.contains('hidden')) {
        openUpgradeOverlay(data);
    } else {
        syncSuperLaserHUD(data?.superLaserUnlocked || false);
    }
});

// Inicializa o HUD do super laser conforme o estado salvo
(async () => {
    applyUpgradeStaticLanguage();
    const data = await window.dbAPI.getPlayerData();
    syncSuperLaserHUD(data?.superLaserUnlocked || false);
})();

export { openUpgradeOverlay, closeUpgradeOverlay, syncSuperLaserHUD };
