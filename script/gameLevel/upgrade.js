// ============================================================
// UPGRADE SHIP MODULE
// ============================================================
import { getPlayerData, buyUpgrade, buySuperLaserUpgrade, buyWingmanUpgrade } from '../saveSystem.js';

const SUPER_LASER_COST = 200;

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
            <span class="level-badge">Nv ${levelNum}</span>
            <div class="card-icon">${lvl.icon}</div>
            <div class="card-name">${lvl.name}</div>
            <div class="card-desc">${lvl.desc}</div>
        `;

        if (isCurrent) {
            const lbl = document.createElement('div');
            lbl.className = 'status-label current';
            lbl.textContent = '✅ ATUAL';
            card.appendChild(lbl);
        } else if (isUnlocked) {
            const lbl = document.createElement('div');
            lbl.className = 'status-label unlocked';
            lbl.textContent = '✔ DESBLOQUEADO';
            card.appendChild(lbl);
        } else if (isNext) {
            const canAfford = totalStars >= lvl.cost;
            const btn = document.createElement('button');
            btn.className = 'btn-buy-upgrade';
            btn.textContent = `COMPRAR — ${lvl.cost} ⭐`;
            btn.disabled = !canAfford;
            btn.addEventListener('click', async () => {
                btn.disabled = true;
                btn.textContent = 'Aguarde...';
                const result = await buyUpgrade(type);
                if (result.success) {
                    const data = await window.dbAPI.getPlayerData();
                    openUpgradeOverlay(data);
                } else {
                    alert(result.error || 'Erro ao comprar upgrade.');
                    btn.disabled = false;
                    btn.textContent = `COMPRAR — ${lvl.cost} ⭐`;
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
        <div class="card-name">NAVE PARCEIRA</div>
        <div class="card-desc">
            Invoca a nave da raposa android por 15 segundos.
            Ela combate ao seu lado e mira inimigos automaticamente.
            <br><br>
            Tecla: <strong style="color:#00ffee">F</strong> &nbsp;|&nbsp; Cooldown: 20s
        </div>
    `;

    if (isUnlocked) {
        const lbl = document.createElement('div');
        lbl.className = 'status-label current';
        lbl.textContent = '✅ DESBLOQUEADO';
        card.appendChild(lbl);
    } else if (!missionComplete) {
        const lbl = document.createElement('div');
        lbl.className = 'status-label mission-lock';
        lbl.textContent = '🔒 Complete a Missão 1 para desbloquear';
        card.appendChild(lbl);
    } else {
        const canAfford = totalStars >= WINGMAN_COST;
        const btn = document.createElement('button');
        btn.className = 'btn-buy-upgrade';
        btn.textContent = `COMPRAR — ${WINGMAN_COST} ⭐`;
        btn.disabled = !canAfford;
        btn.addEventListener('click', async () => {
            btn.disabled = true;
            btn.textContent = 'Aguarde...';
            const result = await buyWingmanUpgrade();
            if (result.success) {
                const freshData = await window.dbAPI.getPlayerData();
                openUpgradeOverlay(freshData);
            } else {
                alert(result.error || 'Erro ao desbloquear Nave Parceira.');
                btn.disabled = false;
                btn.textContent = `COMPRAR — ${WINGMAN_COST} ⭐`;
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
        <div class="card-name">SUPER LASER</div>
        <div class="card-desc">
            Dispara um raio devastador que atravessa todos os inimigos na tela.
            <br><br>
            Carrega durante o combate e pode ser ativado quando estiver 100%.
        </div>
    `;

    if (isUnlocked) {
        const lbl = document.createElement('div');
        lbl.className = 'status-label current';
        lbl.textContent = '✅ DESBLOQUEADO';
        card.appendChild(lbl);
    } else if (!missionComplete) {
        const lbl = document.createElement('div');
        lbl.className = 'status-label mission-lock';
        lbl.textContent = '🔒 Complete a Missão 1 para desbloquear';
        card.appendChild(lbl);
    } else {
        const canAfford = totalStars >= SUPER_LASER_COST;
        const btn = document.createElement('button');
        btn.className = 'btn-buy-upgrade';
        btn.textContent = `COMPRAR — ${SUPER_LASER_COST} ⭐`;
        btn.disabled = !canAfford;
        btn.addEventListener('click', async () => {
            btn.disabled = true;
            btn.textContent = 'Aguarde...';
            const result = await buySuperLaserUpgrade();
            if (result.success) {
                const freshData = await window.dbAPI.getPlayerData();
                openUpgradeOverlay(freshData);
                syncSuperLaserHUD(true);
            } else {
                alert(result.error || 'Erro ao desbloquear Super Laser.');
                btn.disabled = false;
                btn.textContent = `COMPRAR — ${SUPER_LASER_COST} ⭐`;
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
        btn.title = 'Super Laser (Q)';
        const label = btn.querySelector('.laser-label');
        if (label) label.textContent = '';
    } else {
        // Estado bloqueado — mostra cadeado, impede clique visual
        btn.classList.add('laser-locked');
        btn.title = 'Desbloqueie em UPGRADE SHIP';
        const label = btn.querySelector('.laser-label');
        if (label) label.textContent = '🔒';
        const pct = btn.querySelector('.laser-percent');
        if (pct) pct.textContent = 'LOCKED';
    }
}

function openUpgradeOverlay(data) {
    const overlay = document.getElementById('upgrade-ship-overlay');
    if (!overlay) return;

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

// Inicializa o HUD do super laser conforme o estado salvo
(async () => {
    const data = await window.dbAPI.getPlayerData();
    syncSuperLaserHUD(data?.superLaserUnlocked || false);
})();

export { openUpgradeOverlay, closeUpgradeOverlay, syncSuperLaserHUD };
