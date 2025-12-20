// ======================================================
// IMPORTS OBRIGATÓRIOS
// ======================================================
import { 
    playerShip, 
    CANVAS_WIDTH, 
    CANVAS_HEIGHT, 
    isPaused, 
    lastTime,       // Necessário para ajustar o tempo ao despausar
    score,          // Necessário para atualizar o HUD
    nextWeaponUpgradeCost // Necessário para calcular o progresso do upgrade no HUD
} from './globals.js'; 
import { trySuperLaser, tryUpgradeWeapon } from './btnUpdate.js';
import { gameLoop } from './gameLoop.js'; // Necessário para reiniciar o loop após a pausa


// ======================================================
// ESTADO INTERNO DO MÓDULO DE CONTROLE
// ======================================================

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


// ======================================================
// MOVIMENTO E LÓGICA DE PAUSA (EXPORTADAS)
// ======================================================

/**
 * Calcula o vetor de movimento para o player (chamada do gameLoop).
 */
export function updatePlayerMovement() {
    if (!playerShip) return;

    const SMOOTH_FACTOR = 0.25;
    const THRESHOLD = 2;

    // Prioridade 1: Arrasto (Touch)
    if (touch.isDragging && touch.targetX !== null && touch.targetY !== null) {
        // Limite superior da tela (metade) - Usa CANVAS_HEIGHT importado
        const TOP_LIMIT = CANVAS_HEIGHT / 2; 

        let newX = touch.targetX - touch.xOffset;
        let newY = touch.targetY - touch.yOffset;

        // Limita a posição (Usa CANVAS_WIDTH/HEIGHT importados)
        newX = Math.max(0, Math.min(newX, CANVAS_WIDTH - playerShip.width));
        newY = Math.max(TOP_LIMIT, Math.min(newY, CANVAS_HEIGHT - playerShip.height));

        // Aplica suavização
        playerShip.x += (newX - playerShip.x) * SMOOTH_FACTOR;
        playerShip.y += (newY - playerShip.y) * SMOOTH_FACTOR;

        // Calcula o delta de movimento para efeito de 'roll/pitch' da nave
        let deltaX = 0, deltaY = 0;
        if (touch.lastX !== null) deltaX = playerShip.x - touch.lastX;
        if (touch.lastY !== null) deltaY = playerShip.y - touch.lastY;

        let dx = 0, dy = 0;
        if (deltaX > THRESHOLD) dx = 1;
        else if (deltaX < -THRESHOLD) dx = -1;
        if (deltaY > THRESHOLD) dy = 1;
        else if (deltaY < -THRESHOLD) dy = -1;

        // Move é um método do player, que aplica o vetor de entrada
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

/**
 * Alterna o estado de pausa do jogo (chamada por eventos de teclado e botões).
 */
export function togglePause() {
    // isPaused, lastTime são importados de globals.js
    if (playerShip && !playerShip.inIntro) { 
        isPaused = !isPaused; // Inverte o estado

        const pauseOverlay = document.getElementById('pauseOverlay');
        const pauseButton = document.getElementById('pauseButton');

        if (pauseOverlay) {
            if (isPaused) {
                pauseOverlay.classList.remove('hidden');
                if (pauseButton) pauseButton.classList.add('hidden');
            } else {
                // lastTime = performance.now(); // Ajusta o delta time (variável global)
                // NOTA: lastTime precisaria de um setter em globals.js ou ser gerenciada pelo gameLoop.
                
                pauseOverlay.classList.add('hidden');
                if (pauseButton) pauseButton.classList.remove('hidden');
                gameLoop(performance.now()); // Reinicia o game loop
            }
        }
    }
}


// ======================================================
// ATUALIZAÇÃO DO HUD (EXPORTADA)
// ======================================================

/**
 * Atualiza todos os elementos HTML do HUD (Score, Vida, Arma, Upgrade).
 */
export function updateHTMLHUD() {
 
    if (!playerShip) return;

    // 🚀 LOCALIZA O ELEMENTO NO HTML
    const scoreValueShow = document.getElementById('scoreValue');

    // 🚀 ATUALIZA O TEXTO COM O VALOR DA VARIÁVEL SCORE
    if (scoreValueShow) {
        scoreValueShow.textContent = Math.floor(score); 
    }

  
const healthBar = document.getElementById("healthBar");
const luz_manutençao = document.getElementById("luz-manutençao");

let percent = playerShip.health / playerShip.maxHealth;

if (healthBar && luz_manutençao) {

    /* largura da barra */
    healthBar.style.width = `${percent * 100}%`;

    /* remove animações antigas */
    luz_manutençao.classList.remove("blink-warning", "blink-danger");

    if (percent > 0.5) {
        healthBar.style.setProperty('--ledColor', '#1cff6b');
        luz_manutençao.src = "../assets/img/pickup/manutencao-verde.png";
    } 
    else if (percent > 0.2) {
        healthBar.style.setProperty('--ledColor', '#ffc107');
        luz_manutençao.src = "../assets/img/pickup/manutencao-amarela.png";

        /* pisca lento com pausa */
        luz_manutençao.classList.add("blink-warning");
    } 
    else {
        healthBar.style.setProperty('--ledColor', '#ff3b3b');
        luz_manutençao.src = "../assets/img/pickup/manutencao-vermelha.png";

        /* alerta crítico */
        luz_manutençao.classList.add("blink-danger");
    }
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

    if (upgradeButton && upgradeLabelSpan) {
        if (playerShip.weaponLevel >= playerShip.maxWeaponLevel) {
            upgradeButton.disabled = true;
            upgradeLabelSpan.textContent = "MAX";
            upgradeButton.style.backgroundColor = 'gray';
        } else {
            // Usa nextWeaponUpgradeCost e score importados
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
                // Usa Template Literals
                upgradeLabelSpan.textContent = `${percentage}%`; 
            }
        }
    }
}


// ======================================================
// INICIALIZAÇÃO E LISTENERS (EXPORTADA)
// ======================================================

/**
 * Configura todos os listeners de teclado e toque.
 * Chamada no init.js ou start_game.js após o DOM estar pronto.
 */
export function setupInputListeners() {
    
    // --- FUNÇÕES AUXILIARES DE TOQUE ---
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) return;

    function getCanvasPosition(clientX, clientY) {
        canvasRect = canvas.getBoundingClientRect();
        // Usa CANVAS_WIDTH/HEIGHT importados
        const scaleX = CANVAS_WIDTH / canvasRect.width; 
        const scaleY = CANVAS_HEIGHT / canvasRect.height; 
        return {
            x: (clientX - canvasRect.left) * scaleX,
            y: (clientY - canvasRect.top) * scaleY
        };
    }

    // TECLADO (PC)
    window.addEventListener('keydown', (e) => {
        const keyName = KEY_MAP[e.key] || KEY_MAP[e.key.toLowerCase()];

        if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') { 
            togglePause(); // Função exportada/importada
        }
        
        // Impede o scroll da página ao usar setas
        if (keyName && (keyName === 'up' || keyName === 'down' || keyName === 'left' || keyName === 'right')) {
            e.preventDefault();
        }

        if (keyName && keys[keyName] !== undefined) keys[keyName] = true;

        if (e.key === 'q' || e.key === 'Q') trySuperLaser(); // Função importada
        if (e.key === 'e' || e.key === 'E') {
            tryUpgradeWeapon(); // Função importada
        }
    });

    window.addEventListener('keyup', (e) => {
        const keyName = KEY_MAP[e.key] || KEY_MAP[e.key.toLowerCase()];
        if (keyName && keys[keyName] !== undefined) keys[keyName] = false;
    });

    // EVENTOS DE TOQUE (MOBILE)
    canvas.addEventListener('touchstart', (e) => {
        if (e.target.tagName !== 'CANVAS' || !playerShip || !playerShip.isAlive || e.touches.length !== 1) return;
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
    
    // Adiciona listener de clique/toque ao botão de upgrade (para mobile)
    const upgradeButton = document.getElementById('upgradeButton');
    if (upgradeButton) {
        const upgradeAction = (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (playerShip && !playerShip.inIntro) {
                tryUpgradeWeapon();
            }
        };
        // O listener de 'click' já cobre o 'touchstart' de forma mais limpa se o 'btnUpdate.js' já cuida disso.
        // Se a inicialização for feita aqui, removemos a lógica duplicada do DOMContentLoaded.
        upgradeButton.addEventListener('click', upgradeAction);
        upgradeButton.addEventListener('touchstart', upgradeAction);
    }
}