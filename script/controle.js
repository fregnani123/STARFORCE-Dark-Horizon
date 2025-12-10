// Mapeamento de teclas (PC)
const KEY_MAP = {
    'w': 'up', 'a': 'left', 's': 'down', 'd': 'right',
    'W': 'up', 'A': 'left', 'S': 'down', 'D': 'right',
    'ArrowUp': 'up', 'ArrowDown': 'down',
    'ArrowLeft': 'left', 'ArrowRight': 'right',
    'z': 'bomb', 'x': 'shoot',
    'Z': 'bomb', 'X': 'shoot'
};

const keys = {
    up: false, down: false, left: false, right: false,
    bomb: false, shoot: false
};

// Controle por toque (mobile)
const touch = {
    isDragging: false,
    targetX: null,
    targetY: null,
    xOffset: 0,
    yOffset: 0,
    lastX: null,
    lastY: null
};

let canvasRect;


// MOVIMENTO DA NAVE (PC + MOBILE)
function updatePlayerMovement() {
    if (!playerShip) return;

    const SMOOTH_FACTOR = 0.25;
    const THRESHOLD = 2;

    // Prioridade 1: Arrasto
    if (touch.isDragging && touch.targetX !== null && touch.targetY !== null) {
        const TOP_LIMIT = CANVAS_HEIGHT / 2;

        let newX = touch.targetX - touch.xOffset;
        let newY = touch.targetY - touch.yOffset;

        newX = Math.max(0, Math.min(newX, CANVAS_WIDTH - playerShip.width));
        newY = Math.max(TOP_LIMIT, Math.min(newY, CANVAS_HEIGHT - playerShip.height));

        playerShip.x += (newX - playerShip.x) * SMOOTH_FACTOR;
        playerShip.y += (newY - playerShip.y) * SMOOTH_FACTOR;

        let deltaX = 0, deltaY = 0;
        if (touch.lastX !== null) deltaX = playerShip.x - touch.lastX;
        if (touch.lastY !== null) deltaY = playerShip.y - touch.lastY;

        let dx = 0, dy = 0;
        if (deltaX > THRESHOLD) dx = 1;
        else if (deltaX < -THRESHOLD) dx = -1;

        if (deltaY > THRESHOLD) dy = 1;
        else if (deltaY < -THRESHOLD) dy = -1;

        playerShip.move(dx, dy);

        touch.lastX = playerShip.x;
        touch.lastY = playerShip.y;

    } else {
        // Prioridade 2: Teclado
        let dx = 0, dy = 0;

        if (keys.left) dx = -1;
        else if (keys.right) dx = 1;
        if (keys.up) dy = -1;
        else if (keys.down) dy = 1;

        playerShip.move(dx, dy);
        if (keys.shoot) playerShip.fire();

        touch.lastX = null;
        touch.lastY = null;
    }
}


// TECLADO (PC)
window.addEventListener('keydown', (e) => {
    const keyName = KEY_MAP[e.key] || KEY_MAP[e.key.toLowerCase()];

    if (event.key === 'p' || event.key === 'P' || event.key === 'Escape') { 
        togglePause();
    }
    
    if (keyName && (keyName === 'up' || keyName === 'down' || keyName === 'left' || keyName === 'right')) {
        e.preventDefault();
    }

    if (keyName && keys[keyName] !== undefined) keys[keyName] = true;

    if (e.key === 'q' || e.key === 'Q') trySuperLaser();
    if (e.key === 'e' || e.key === 'E') {
        if (typeof tryUpgradeWeapon === 'function') tryUpgradeWeapon();
    }
});

window.addEventListener('keyup', (e) => {
    const keyName = KEY_MAP[e.key] || KEY_MAP[e.key.toLowerCase()];
    if (keyName && keys[keyName] !== undefined) keys[keyName] = false;
});


// EVENTOS DE TOQUE (MOBILE)
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) return;

    function getCanvasPosition(clientX, clientY) {
        canvasRect = canvas.getBoundingClientRect();
        const scaleX = CANVAS_WIDTH / canvasRect.width;
        const scaleY = CANVAS_HEIGHT / canvasRect.height;
        return {
            x: (clientX - canvasRect.left) * scaleX,
            y: (clientY - canvasRect.top) * scaleY
        };
    }

    canvas.addEventListener('touchstart', (e) => {
        if (e.target.tagName !== 'CANVAS') return;
        if (!playerShip || !playerShip.isAlive || e.touches.length !== 1) return;
        e.preventDefault();

        const touchPos = getCanvasPosition(e.touches[0].clientX, e.touches[0].clientY);

        touch.xOffset = touchPos.x - playerShip.x;
        touch.yOffset = touchPos.y - playerShip.y;
        touch.targetX = touchPos.x;
        touch.targetY = touchPos.y;
        touch.isDragging = true;
        touch.lastX = playerShip.x;
        touch.lastY = playerShip.y;
    }, { passive: false });

    canvas.addEventListener('touchmove', (e) => {
        if (!touch.isDragging || e.touches.length !== 1) return;
        e.preventDefault();
        const touchPos = getCanvasPosition(e.touches[0].clientX, e.touches[0].clientY);
        touch.targetX = touchPos.x;
        touch.targetY = touchPos.y;
    }, { passive: false });

    const handleTouchEnd = () => {
        if (touch.isDragging) {
            touch.isDragging = false;
            touch.targetX = null;
            touch.targetY = null;
            if (playerShip) playerShip.move(0, 0);
            touch.lastX = null;
            touch.lastY = null;
        }
    };

    canvas.addEventListener('touchend', handleTouchEnd);
    canvas.addEventListener('touchcancel', handleTouchEnd);

    const upgradeButton = document.getElementById('upgradeButton');
    if (upgradeButton) {
        const upgradeAction = (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (playerShip && !playerShip.inIntro && typeof tryUpgradeWeapon === 'function') {
                tryUpgradeWeapon();
            }
        };
        upgradeButton.addEventListener('click', upgradeAction);
        upgradeButton.addEventListener('touchstart', upgradeAction);
    }
});

// HUD
function updateHTMLHUD() {
    if (!playerShip) return;

    // Score e Vida
    document.getElementById("scoreValue").textContent = score;

    const healthBar = document.getElementById("healthBar");
    let percent = playerShip.health / playerShip.maxHealth;
    if (healthBar) {
        healthBar.style.width = (150 * percent) + "px";
        if (percent > 0.5) healthBar.style.background = "#32cd32";
        else if (percent > 0.2) healthBar.style.background = "#ffc107";
        else healthBar.style.background = "#dc3545";
    }

    // Nível da Arma
    const weaponValueDisplay = document.getElementById("weaponValue");
    if (weaponValueDisplay) {
        weaponValueDisplay.textContent = playerShip.weaponLevel;
        weaponValueDisplay.style.color =
            playerShip.weaponLevel >= playerShip.maxWeaponLevel
                ? '#32cd32'
                : 'white';
    }

    // Botão de Upgrade
    const upgradeButton = document.getElementById('upgradeButton');
    const upgradeLabelSpan = upgradeButton ? upgradeButton.querySelector('.upgrade-label') : null;
    const upgradePercentDisplay = document.getElementById('upgradePercent');

    if (upgradeButton && upgradeLabelSpan) {

        if (playerShip.weaponLevel >= playerShip.maxWeaponLevel) {
            upgradeButton.disabled = true;
            upgradeLabelSpan.textContent = "MAX";
            if (upgradePercentDisplay) upgradePercentDisplay.textContent = "";
            upgradeButton.style.backgroundColor = 'gray';

        } else {
            const cost = nextWeaponUpgradeCost;
            const currentScore = score;

            let rawPercentage = (currentScore / cost) * 100;
            let percentage = Math.min(100, Math.floor(rawPercentage));

            if (percentage >= 100) {
                upgradeButton.disabled = false;
                upgradeButton.style.backgroundColor = 'green';
                upgradeLabelSpan.textContent = "UP";

            } else {
                upgradeButton.disabled = true;
                upgradeButton.style.backgroundColor = '';
                upgradeLabelSpan.textContent = `${percentage}%`;
            }
        }
    }
}


// INÍCIO DO JOGO + BOTÃO DE PAUSA
document.addEventListener('DOMContentLoaded', () => {
    const startButton = document.getElementById('startButton');
    if (startButton) startButton.addEventListener('click', startGame);

    const btnPause = document.getElementById('pauseButton');
    if (btnPause) btnPause.addEventListener('click', togglePause);
});


// PAUSAR / RETOMAR O JOGO
function togglePause() {
    if (playerShip && !playerShip.inIntro) { 
        isPaused = !isPaused;

        const pauseOverlay = document.getElementById('pauseOverlay');
        const pauseButton = document.getElementById('pauseButton');

        if (pauseOverlay) {
            if (isPaused) {
                pauseOverlay.classList.remove('hidden');
                if (pauseButton) pauseButton.classList.add('hidden');
            } else {
                lastTime = performance.now();
                pauseOverlay.classList.add('hidden');
                if (pauseButton) pauseButton.classList.remove('hidden');
                requestAnimationFrame(gameLoop);
            }
        }
    }
}


// SAIR DO JOGO (Desktop)
window.addEventListener('DOMContentLoaded', () => {
    const exitButton = document.getElementById('exit');

    exitButton.addEventListener('click', () => {
        if (window.electronAPI && window.electronAPI.closeApp) {
            window.electronAPI.closeApp();
        } else {
            alert("Funcionalidade disponível apenas no desktop.");
        }
    });
});


const continuarGame = document.getElementById("continuar");

continuarGame.addEventListener('click', () => {
    // Substitua 'mapaFases.html' pelo nome exato do arquivo HTML de destino.
    window.location.href = '../public/game_level.html';
});

