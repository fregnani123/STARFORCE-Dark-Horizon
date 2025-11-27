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
    // Armazenar a posição anterior para calcular o delta de movimento
    lastX: null,
    lastY: null
};
let canvasRect; 

// --- FUNÇÃO CHAMADA PELO gameLoop (VERIFICA PRIORIDADES) ---
function updatePlayerMovement() {
    if (!playerShip) return; 
    
    // --- PRIORIDADE 1: LÓGICA DE ARRASTO (DRAG) ---
    if (touch.isDragging && touch.targetX !== null && touch.targetY !== null) {
        
        const TOP_LIMIT = CANVAS_HEIGHT / 2; 

        // 1. Calcula a Nova Posição Absoluta
        let newX = touch.targetX - touch.xOffset;
        let newY = touch.targetY - touch.yOffset;
        
        // Aplica a nova posição com limites de tela
        newX = Math.max(0, Math.min(newX, CANVAS_WIDTH - playerShip.width));
        newY = Math.max(TOP_LIMIT, Math.min(newY, CANVAS_HEIGHT - playerShip.height));
        
        // 2. CALCULA O DELTA DE POSIÇÃO PARA SABER A DIREÇÃO DE INCLINAÇÃO
        let deltaX = 0;
        let deltaY = 0;

        if (touch.lastX !== null) {
            deltaX = newX - touch.lastX;
        }
        if (touch.lastY !== null) {
            deltaY = newY - touch.lastY;
        }

        // 3. Define DX e DY para a ANIMAÇÃO DE INCLINAÇÃO
        let dx = 0;
        let dy = 0;

        // Limite de 0.5 é um "threshold" para garantir que a nave não incline em pequenos movimentos.
        if (deltaX > 0.5) {
            dx = 1;
        } else if (deltaX < -0.5) {
            dx = -1;
        }

        if (deltaY > 0.5) {
            dy = 1;
        } else if (deltaY < -0.5) {
            dy = -1;
        }

        // 4. Move a nave (Atualiza this.dx/this.dy no Player.js para a animação)
        playerShip.move(dx, dy); 
        
        // 5. Aplica a nova posição e atualiza o histórico
        playerShip.x = newX;
        playerShip.y = newY;
        touch.lastX = newX;
        touch.lastY = newY;
        
    } else {
        // --- PRIORIDADE 2: LÓGICA DE TECLADO (PC) ---
        
        let dx = 0;
        let dy = 0;

        // Movimento (baseado nas teclas ativas)
        if (keys.left) { dx = -1; } else if (keys.right) { dx = 1; }
        if (keys.up) { dy = -1; } else if (keys.down) { dy = 1; }

        // Usa o método de movimento por velocidade
        playerShip.move(dx, dy); 
        
        // Ação do teclado
        if (keys.shoot) { 
            playerShip.fire();
        }
        // if (keys.bomb) { playerShip.useBomb(); }

        // Reseta o histórico de toque quando o drag não está ativo
        touch.lastX = null;
        touch.lastY = null;
    }
}


// --- LÓGICA DE TECLADO (PC) ---

window.addEventListener('keydown', (e) => {
    const keyName = KEY_MAP[e.key] || KEY_MAP[e.key.toLowerCase()];
    
    if (keyName && (keyName === 'up' || keyName === 'down' || keyName === 'left' || keyName === 'right')) {
        e.preventDefault(); 
    }

    if (keyName && keys[keyName] !== undefined) {
        keys[keyName] = true;
    }

    // Ação de Upgrade para PC (Tecla G)
    if (e.key === 'g' || e.key === 'G') {
        // Chama a função definida em game.js
        if (typeof tryUpgradeWeapon === 'function') {
            tryUpgradeWeapon();
        }
    }

});

window.addEventListener('keyup', (e) => {
    const keyName = KEY_MAP[e.key] || KEY_MAP[e.key.toLowerCase()];

    if (keyName && keys[keyName] !== undefined) {
        keys[keyName] = false;
    }
});


// --- LÓGICA DE TOQUE (DRAG CONTROL E BOTÕES VIRTUAIS) ---

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) return;
    
    // Assumimos que CANVAS_WIDTH e CANVAS_HEIGHT são globais, definidas em game.js

    function getCanvasPosition(clientX, clientY) {
        canvasRect = canvas.getBoundingClientRect(); 
        
        const scaleX = CANVAS_WIDTH / canvasRect.width;
        const scaleY = CANVAS_HEIGHT / canvasRect.height;

        const canvasX = (clientX - canvasRect.left) * scaleX;
        const canvasY = (clientY - canvasRect.top) * scaleY;

        return { x: canvasX, y: canvasY };
    }

    // --- TOUCH START ---
    canvas.addEventListener('touchstart', (e) => {
        // Verifica se o toque não foi em um elemento de interface (como o botão de upgrade)
        if (e.target.tagName !== 'CANVAS') return;

        if (!playerShip || !playerShip.isAlive || e.touches.length !== 1) return;
        e.preventDefault(); 
        
        const touchPos = getCanvasPosition(e.touches[0].clientX, e.touches[0].clientY);
        
        touch.xOffset = touchPos.x - playerShip.x;
        touch.yOffset = touchPos.y - playerShip.y;
        
        touch.targetX = touchPos.x;
        touch.targetY = touchPos.y;
        touch.isDragging = true;

        // Inicializa o LASTX/Y NO TOUCH START
        touch.lastX = playerShip.x;
        touch.lastY = playerShip.y;
        
    }, { passive: false });

    // --- TOUCH MOVE ---
    canvas.addEventListener('touchmove', (e) => {
        if (!touch.isDragging || e.touches.length !== 1) return;
        e.preventDefault();
        
        const touchPos = getCanvasPosition(e.touches[0].clientX, e.touches[0].clientY);
        
        touch.targetX = touchPos.x;
        touch.targetY = touchPos.y;

    }, { passive: false });

    // --- TOUCH END / CANCEL ---
    const handleTouchEnd = (e) => {
        if (touch.isDragging) {
            touch.isDragging = false;
            touch.targetX = null;
            touch.targetY = null;
            
            // ZERA O DX/DY da nave no final do toque 
            if (playerShip) {
                playerShip.move(0, 0); 
            }
            // Zera o histórico de posição
            touch.lastX = null;
            touch.lastY = null;
        }
    };
    
    canvas.addEventListener('touchend', handleTouchEnd);
    canvas.addEventListener('touchcancel', handleTouchEnd);

    
    // ----------------------------------------------------
    // ✨ NOVO: VINCULAÇÃO DO BOTÃO VIRTUAL DE UPGRADE
    // ----------------------------------------------------
    const upgradeButton = document.getElementById('upgradeButton');
    if (upgradeButton) {
        
        // Vincula o clique (PC/Mouse)
        upgradeButton.addEventListener('click', (e) => {
            e.stopPropagation(); // Impede que o clique caia no canvas
            if (playerShip && !playerShip.inIntro) {
                if (typeof tryUpgradeWeapon === 'function') {
                    tryUpgradeWeapon();
                }
            }
        });
        
        // Adiciona suporte a toque (Mobile)
        upgradeButton.addEventListener('touchstart', (e) => {
            e.preventDefault(); // Evita o zoom e outros comportamentos padrão
            e.stopPropagation(); // Impede que o toque inicie o drag no canvas
            if (playerShip && !playerShip.inIntro) {
                if (typeof tryUpgradeWeapon === 'function') {
                    tryUpgradeWeapon();
                }
            }
        });
    }
    // ----------------------------------------------------

});