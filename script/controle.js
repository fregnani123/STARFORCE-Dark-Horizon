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
    xOffset: 0, // Deslocamento inicial do toque em relação ao centro da nave
    yOffset: 0
};
let canvasRect; // Para armazenar a posição e o tamanho do canvas na tela

// --- FUNÇÃO CHAMADA PELO gameLoop (VERIFICA PRIORIDADES) ---
function updatePlayerMovement() {
    if (!playerShip) return; 
    
    // --- 🚨 PRIORIDADE 1: LÓGICA DE ARRASTO (DRAG) ---
    // Se houver um toque ativo, o movimento é direto para a posição do toque.
    if (touch.isDragging && touch.targetX !== null && touch.targetY !== null) {
        
        // Define a nova posição da nave
        let newX = touch.targetX - touch.xOffset;
        let newY = touch.targetY - touch.yOffset;
        
        // Limite superior do mapa (usando constantes globais)
        const TOP_LIMIT = CANVAS_HEIGHT / 2; 

        // Aplica a nova posição com limites de tela
        playerShip.x = Math.max(0, Math.min(newX, CANVAS_WIDTH - playerShip.width));
        playerShip.y = Math.max(TOP_LIMIT, Math.min(newY, CANVAS_HEIGHT - playerShip.height));
        
        // No modo arrasto, o dx e dy são 0, pois a posição é absoluta (importante para o roll/pitch visual!)
        playerShip.move(0, 0);

        // Dispara tiro (se o tiro não for 100% automático, aqui seria o lugar)
        // Se o tiro for automático no game.js, não precisa disso:
        // playerShip.fire(); 

    } else {
        // --- PRIORIDADE 2: LÓGICA DE TECLADO (PC) ---
        
        let dx = 0;
        let dy = 0;

        // Movimento (baseado nas teclas ativas)
        if (keys.left) { dx = -1; } else if (keys.right) { dx = 1; }
        if (keys.up) { dy = -1; } else if (keys.down) { dy = 1; }

        // Usa o método de movimento por velocidade
        playerShip.move(dx, dy); 
        
        // Ação do teclado (se necessário, ex: botão X)
        if (keys.shoot) { 
            playerShip.fire();
        }
        // if (keys.bomb) { playerShip.useBomb(); }
    }
}


// --- LÓGICA DE TECLADO (PC) ---

window.addEventListener('keydown', (e) => {
    const keyName = KEY_MAP[e.key] || KEY_MAP[e.key.toLowerCase()];
    
    // Previne o scroll da página ao usar as setas
    if (keyName && (keyName === 'up' || keyName === 'down' || keyName === 'left' || keyName === 'right')) {
        e.preventDefault(); 
    }

    if (keyName && keys[keyName] !== undefined) {
        keys[keyName] = true;
    }
});

window.addEventListener('keyup', (e) => {
    const keyName = KEY_MAP[e.key] || KEY_MAP[e.key.toLowerCase()];

    if (keyName && keys[keyName] !== undefined) {
        keys[keyName] = false;
    }
});


// --- 🚨 LÓGICA DE TOQUE (DRAG CONTROL) ---

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) return;
    
    // Função auxiliar para mapear coordenadas da tela para coordenadas do Canvas (jogo)
    function getCanvasPosition(clientX, clientY) {
        // Recalcula o tamanho real do canvas na tela (necessário para responsividade)
        canvasRect = canvas.getBoundingClientRect(); 
        
        // Calcula a posição do toque dentro do canvas (0 a 1)
        const scaleX = CANVAS_WIDTH / canvasRect.width;
        const scaleY = CANVAS_HEIGHT / canvasRect.height;

        const canvasX = (clientX - canvasRect.left) * scaleX;
        const canvasY = (clientY - canvasRect.top) * scaleY;

        return { x: canvasX, y: canvasY };
    }

    // --- TOUCH START ---
    canvas.addEventListener('touchstart', (e) => {
        if (!playerShip || !playerShip.isAlive || e.touches.length !== 1) return;
        e.preventDefault(); 
        
        const touchPos = getCanvasPosition(e.touches[0].clientX, e.touches[0].clientY);
        
        // Calcula o deslocamento (offset)
        touch.xOffset = touchPos.x - playerShip.x;
        touch.yOffset = touchPos.y - playerShip.y;
        
        // Ativa o modo arrasto
        touch.targetX = touchPos.x;
        touch.targetY = touchPos.y;
        touch.isDragging = true;
        
    }, { passive: false });

    // --- TOUCH MOVE ---
    canvas.addEventListener('touchmove', (e) => {
        if (!touch.isDragging || e.touches.length !== 1) return;
        e.preventDefault();
        
        const touchPos = getCanvasPosition(e.touches[0].clientX, e.touches[0].clientY);
        
        // Atualiza a posição alvo
        touch.targetX = touchPos.x;
        touch.targetY = touchPos.y;

    }, { passive: false });

    // --- TOUCH END / CANCEL ---
    const handleTouchEnd = (e) => {
        // Desativa o arrasto
        if (touch.isDragging) {
            touch.isDragging = false;
            touch.targetX = null;
            touch.targetY = null;
        }
    };
    
    canvas.addEventListener('touchend', handleTouchEnd);
    canvas.addEventListener('touchcancel', handleTouchEnd);
});