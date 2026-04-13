// ======================================================
// IMPORTS OBRIGATÓRIOS
// ======================================================
import { 
    playerShip, 
    CANVAS_WIDTH, 
    CANVAS_HEIGHT, 
    isPaused, 
    lastTime,
    score,
    nextWeaponUpgradeCost,
   currentShipSpeed, setShipSpeed, CRUISE_SPEED, SOUND_SPEED, setPause, setLastTime, resetMissionState,
   updateScore,
   currentWingman, setCurrentWingman,
} from './globals.js';

import { getPlayerData } from './saveSystem.js';
import { trySuperLaser, tryUpgradeWeapon } from './btnUpdate.js';
import { gameLoop } from './gameLoop.js';
import { WingmanShip, WINGMAN_COOLDOWN_MS } from './WingmanShip.js';

 
// ======================================================
// ESTADO INTERNO DO MÓDULO DE CONTROLE
// ======================================================

// Cooldown do wingman
let wingmanLastUsed = -Infinity;

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
// Velocimetro - Imã Itens 
// ======================================================
 

export function updateFictionalStats() {
    const speedEl = document.getElementById('shipSpeed');
    const magEl = document.getElementById('magStrength');

    // --- 1. CONTROLE DE VELOCIDADE ---
    
    if (keys.up) { 
        // Acelera até a velocidade do som
        if (currentShipSpeed < SOUND_SPEED) {
            setShipSpeed(currentShipSpeed + 2);
        }
    } else if (keys.down) { 
        // Desacelera, mas não deixa baixar da velocidade de cruzeiro
        if (currentShipSpeed > CRUISE_SPEED) {
            setShipSpeed(currentShipSpeed - 2);
        }
    }

    // Tecla R: Retorno suave para a velocidade de cruzeiro
    if (keys.r || keys.R) {
        if (currentShipSpeed > CRUISE_SPEED) {
            setShipSpeed(Math.max(CRUISE_SPEED, currentShipSpeed - 5));
        } else if (currentShipSpeed < CRUISE_SPEED) {
            setShipSpeed(Math.min(CRUISE_SPEED, currentShipSpeed + 5));
        }
    }

    // --- 2. OSCILAÇÃO REALISTA (Vibração do painel) ---
    // Usamos o tempo (Date.now) para criar uma onda senoidal suave
    // Isso faz o número "tremer" levemente entre -1 e +1
    const vibration = Math.sin(Date.now() * 0.005) * 1.5;
    const speedWithVibration = currentShipSpeed + vibration;

    // --- 3. ATUALIZAÇÃO DA TELA ---
    if (speedEl) {
        // Exibe o número com a vibração, mas sem casas decimais picadas
        speedEl.textContent = Math.floor(speedWithVibration);
    }

    if (magEl) {
        // Magnetismo também pode ter uma micro oscilação para parecer real
        const magVibration = Math.cos(Date.now() * 0.002) * 0.1;
        magEl.textContent = (12.0 + magVibration).toFixed(1);
    }
}

// ======================================================
// MOVIMENTO E LÓGICA DE PAUSA (EXPORTADAS)
// ======================================================

/**
 * Calcula o vetor de movimento para o player (chamada do gameLoop).
 */
// Acumulador de score por movimento (5 pts a cada 3 segundos de jogo)
let _movScoreLast = 0;
let _movScoreTimer = 0;

export function updatePlayerMovement() {
    if (!playerShip) return;

    // Score por movimento/tempo (ativo enquanto jogando)
    const now = Date.now();
    if (_movScoreLast === 0) _movScoreLast = now;
    const elapsed = now - _movScoreLast;
    _movScoreLast = now;
    if (!isPaused && playerShip.isAlive && !playerShip.inIntro) {
        _movScoreTimer += elapsed;
        if (_movScoreTimer >= 3000) {
            updateScore(5);
            _movScoreTimer -= 3000;
        }
    }

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
    updateFictionalStats()
}

/**
 * Alterna o estado de pausa do jogo (chamada por eventos de teclado e botões).
 */

import { pauseAllSounds, resumeAllSounds } from './audio_game.js';
// ... outros imports

export function togglePause() {
    if (playerShip && !playerShip.inIntro) { 
        const novoEstado = !isPaused;
        setPause(novoEstado); 

        const pauseOverlay = document.getElementById('pauseOverlay');

        if (novoEstado) { 
            // ⏸️ JOGO PAUSADO
            pauseOverlay.classList.remove('hidden');
            pauseAllSounds(); // <--- PARA OS SONS
        } else { 
            // ▶️ JOGO RETOMADO
            pauseOverlay.classList.add('hidden');
            setLastTime(performance.now());
            resumeAllSounds(); // <--- VOLTA OS SONS
            requestAnimationFrame(gameLoop); 
        }
    }
}


// ======================================================
// ATUALIZAÇÃO DO HUD (EXPORTADA)
// ======================================================

/**
 * Atualiza todos os elementos HTML do HUD (Score, Vida, Arma, Upgrade).
 */
/**
 * Atualiza todos os elementos HTML do HUD (Score, Vida, Arma, Upgrade).
 */
export function updateHTMLHUD() {
    if (!playerShip) return;

    // 1. ATUALIZAÇÃO DO SCORE
    const scoreValueShow = document.getElementById('scoreValue');
    if (scoreValueShow) {
        scoreValueShow.textContent = Math.floor(score); 
    }

    // 1.1 ATUALIZAÇÃO DE ESTRELAS NO HUD
    const starCountEl = document.getElementById('starCount');
    if (starCountEl) {
        const data = getPlayerData();
        starCountEl.textContent = data ? data.totalStars : 0;
    }

    // 2. SELEÇÃO DE ELEMENTOS
    const healthBar = document.getElementById("healthBar");
    const luz_manutençao = document.getElementById("luz-manutençao");
    const telechamada = document.querySelector('.telechamada');
    const infoNave = document.querySelector('.info-nave');
    const videoPiloto = document.querySelector('.video-piloto');

    let percent = playerShip.health / playerShip.maxHealth;

    if (healthBar && luz_manutençao) {
        healthBar.style.width = `${Math.max(0, percent * 100)}%`;
        luz_manutençao.classList.remove("blink-warning", "blink-danger");

        // FUNÇÃO AUXILIAR PARA PARAR O VÍDEO E VOLTAR AO NORMAL
        const pararAlertaPiloto = () => {
            if (telechamada) telechamada.style.display = 'none';
            if (infoNave) infoNave.style.display = 'flex';
            if (videoPiloto) {
                videoPiloto.pause();      // 🛑 Para o vídeo imediatamente
                videoPiloto.muted = true;   // 🔇 Muta para garantir que o áudio suma
                videoPiloto.currentTime = 0; // Volta para o início
            }
        };

        if (percent > 0.5) {
            // --- ESTADO VERDE ---
            healthBar.style.setProperty('--ledColor', '#1cff6b');
            luz_manutençao.src = "../assets/img/pickup/manutencao-verde.png";
            pararAlertaPiloto(); // Garante que o vídeo pare se recuperou vida
        } 
        else if (percent > 0.2) {
            // --- ESTADO AMARELO ---
            healthBar.style.setProperty('--ledColor', '#ffc107');
            luz_manutençao.src = "../assets/img/pickup/manutencao-amarela.png";
            luz_manutençao.classList.add("blink-warning");
            pararAlertaPiloto(); // 🚀 Mata o vídeo e o áudio se sair do crítico
        } 
        else {
            // --- 🚨 ESTADO VERMELHO (ALERTA CRÍTICO) ---
            healthBar.style.setProperty('--ledColor', '#ff3b3b');
            luz_manutençao.src = "../assets/img/pickup/manutencao-vermelha.png";
            luz_manutençao.classList.add("blink-danger");

            // Só inicia o vídeo se ele ainda não estiver aparecendo (evita loop de play)
            if (telechamada && telechamada.style.display !== 'block') {
                telechamada.style.display = 'block';
                if (infoNave) infoNave.style.display = 'none';

                if (videoPiloto) {
                    videoPiloto.muted = false; // 🔊 Abre o áudio
                    videoPiloto.play().catch(e => console.log("Erro Play:", e));

                    // Se o vídeo acabar sozinho antes do player curar, ele fecha a div
                    videoPiloto.onended = () => {
                        telechamada.style.display = 'none';
                        if (infoNave) infoNave.style.display = 'block';
                        videoPiloto.muted = true;
                    };
                }
            }
        }
    }

    if (typeof updateFictionalStats === "function") {
        updateFictionalStats();
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

    // --- TECLADO (PC) ---
    window.addEventListener('keydown', (e) => {
        // 🛑 BLOQUEIO RESOLVIDO: Se o foco for um campo de texto, ignora os comandos do jogo
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

        const keyName = KEY_MAP[e.key] || KEY_MAP[e.key.toLowerCase()];

        if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') { 
            togglePause();
        }
        
        if (keyName && (keyName === 'up' || keyName === 'down' || keyName === 'left' || keyName === 'right')) {
            // Só impede o scroll se NÃO estiver digitando
            e.preventDefault();
        }

        if (keyName && keys[keyName] !== undefined) keys[keyName] = true;

        if (e.key === 'q' || e.key === 'Q') {
            const sd = getPlayerData();
            if (sd && sd.superLaserUnlocked) trySuperLaser();
        }
        if (e.key === 'e' || e.key === 'E') tryUpgradeWeapon();

        // Tecla F — ativa nave parceira (wingman)
        if (e.key === 'f' || e.key === 'F') {
            const sd = getPlayerData();
            const now = Date.now();
            if (sd && sd.wingmanUnlocked && !currentWingman && playerShip && playerShip.isAlive && !playerShip.inIntro) {
                if (now - wingmanLastUsed >= WINGMAN_COOLDOWN_MS) {
                    wingmanLastUsed = now;
                    setCurrentWingman(new WingmanShip(playerShip.x, playerShip.y));
                }
            }
        }
    });

    window.addEventListener('keyup', (e) => {
        // Também ignora o "soltar tecla" se estiver no input
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

        const keyName = KEY_MAP[e.key] || KEY_MAP[e.key.toLowerCase()];
        if (keyName && keys[keyName] !== undefined) keys[keyName] = false;
    });

    // --- EVENTOS DE TOQUE (Ajustados para não quebrar inputs externos) ---
    canvas.addEventListener('touchstart', (e) => {
        // Só executa a lógica se o toque for EXCLUSIVAMENTE no Canvas
        if (e.target !== canvas || !playerShip || !playerShip.isAlive || e.touches.length !== 1) return;
        
        e.preventDefault(); // Impede o scroll apenas no canvas

        const touchPos = getCanvasPosition(e.touches[0].clientX, e.touches[0].clientY);
        touch.xOffset = touchPos.x - playerShip.x;
        touch.yOffset = touchPos.y - playerShip.y;
        touch.targetX = touchPos.x;
        touch.targetY = touchPos.y;
        touch.isDragging = true;
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

    // ===== PAUSE MENU BUTTONS =====
    const pauseContinueBtn = document.getElementById('pauseContinueBtn');
    if (pauseContinueBtn) {
        pauseContinueBtn.addEventListener('click', togglePause);
    }

    // Botão SAIR DA MISSÃO
    const pauseExitBtn = document.getElementById('pauseExitBtn');
    if (pauseExitBtn) {
        pauseExitBtn.addEventListener('click', () => {
            // 1. PRIMEIRO: Esconder canvas IMEDIATAMENTE (sem delay visual)
            const mainWrapper = document.getElementById('main-wrapper');
            const gameContainer = document.getElementById('gameContainer');
            if (mainWrapper) mainWrapper.style.display = 'none';
            if (gameContainer) gameContainer.style.display = 'none';
            
            // 2. RESETAR TUDO DA MISSÃO (sem aparecer na tela)
            resetMissionState();
            
            // 3. Parar todos os sons
            pauseAllSounds();
            
            // 4. Parar vídeos do jogo
            const bgVideo = document.getElementById('bgVideo');
            if (bgVideo) bgVideo.pause();
            
            const videoBackground = document.getElementById('video-background');
            if (videoBackground) videoBackground.pause();
            
            // 5. Fecha overlay de pausa
            const pauseOverlay = document.getElementById('pauseOverlay');
            if (pauseOverlay) pauseOverlay.classList.add('hidden');
            
            // 6. Mostrar tela de missões
            const levelContainer = document.getElementById('container_levelGame');
            if (levelContainer) levelContainer.style.display = 'flex';
            
            // 7. Resetar estado de pausa
            setPause(false);
            
            // 8. Reset do loop do jogo
            if (playerShip && playerShip.isAlive) {
                playerShip.isAlive = false;
            }
        });
    }
}