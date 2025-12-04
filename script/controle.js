// Arquivo: script/controle.js (SUPORTE A TECLADO E ARRASTO MOBILE)

// Mapeamento de códigos de teclas (Suporta teclado para PC/Desktop)
const KEY_MAP = {
    // Mapeamento WASD e Setas
    'w': 'up', 'a': 'left', 's': 'down', 'd': 'right',
    'W': 'up', 'A': 'left', 'S': 'down', 'D': 'right',
    'ArrowUp': 'up', 'ArrowDown': 'down',
    'ArrowLeft': 'left', 'ArrowRight': 'right',
    
    // Ações
    'z': 'bomb', 'x': 'shoot', 
    'Z': 'bomb', 'X': 'shoot'
};

const keys = {
    up: false, down: false, left: false, right: false,
    bomb: false, shoot: false
};

// --- LÓGICA DE CONTROLE DE ARRASTO (MOBILE) ---
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

// --- FUNÇÃO CHAMADA PELO gameLoop (VERIFICA PRIORIDADES) ---
function updatePlayerMovement() {
    if (!playerShip) return; 
    
    const SMOOTH_FACTOR = 0.25;  // quanto menor, mais suave
    const THRESHOLD = 2;          // para inclinação da nave

    // --- PRIORIDADE 1: LÓGICA DE ARRASTO (DRAG) ---
    if (touch.isDragging && touch.targetX !== null && touch.targetY !== null) {
        const TOP_LIMIT = CANVAS_HEIGHT / 2; 

        // 1. Calcula a Nova Posição Absoluta
        let newX = touch.targetX - touch.xOffset;
        let newY = touch.targetY - touch.yOffset;
        
        // Aplica limites de tela
        newX = Math.max(0, Math.min(newX, CANVAS_WIDTH - playerShip.width));
        newY = Math.max(TOP_LIMIT, Math.min(newY, CANVAS_HEIGHT - playerShip.height));
        
        // 2. Interpolação suave da posição (LERP)
        playerShip.x += (newX - playerShip.x) * SMOOTH_FACTOR;
        playerShip.y += (newY - playerShip.y) * SMOOTH_FACTOR;

        // 3. Calcula delta para inclinação
        let deltaX = 0, deltaY = 0;
        if (touch.lastX !== null) deltaX = playerShip.x - touch.lastX;
        if (touch.lastY !== null) deltaY = playerShip.y - touch.lastY;

        // 4. Define dx/dy para animação de inclinação
        let dx = 0, dy = 0;
        if (deltaX > THRESHOLD) dx = 1;
        else if (deltaX < -THRESHOLD) dx = -1;
        if (deltaY > THRESHOLD) dy = 1;
        else if (deltaY < -THRESHOLD) dy = -1;

        playerShip.move(dx, dy); 

        // 5. Atualiza histórico de toque
        touch.lastX = playerShip.x;
        touch.lastY = playerShip.y;

    } else {
        // --- PRIORIDADE 2: LÓGICA DE TECLADO (PC) ---
        let dx = 0, dy = 0;

        if (keys.left) dx = -1;
        else if (keys.right) dx = 1;
        if (keys.up) dy = -1;
        else if (keys.down) dy = 1;

        playerShip.move(dx, dy);

        if (keys.shoot) playerShip.fire();

        // Reseta histórico de toque
        touch.lastX = null;
        touch.lastY = null;
    }
}

// --- LÓGICA DE TECLADO (PC) ---
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
    if (e.key === 'g' || e.key === 'G') {
        if (typeof tryUpgradeWeapon === 'function') tryUpgradeWeapon();
    }
});

window.addEventListener('keyup', (e) => {
    const keyName = KEY_MAP[e.key] || KEY_MAP[e.key.toLowerCase()];
    if (keyName && keys[keyName] !== undefined) keys[keyName] = false;
});

// --- LÓGICA DE TOQUE (DRAG CONTROL E BOTÕES VIRTUAIS) ---
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

    // TOUCH START
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

    // TOUCH MOVE
    canvas.addEventListener('touchmove', (e) => {
        if (!touch.isDragging || e.touches.length !== 1) return;
        e.preventDefault();
        const touchPos = getCanvasPosition(e.touches[0].clientX, e.touches[0].clientY);
        touch.targetX = touchPos.x;
        touch.targetY = touchPos.y;
    }, { passive: false });

    // TOUCH END / CANCEL
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

    // BOTÃO DE UPGRADE (PC + MOBILE)
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
