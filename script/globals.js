import { addStars } from './saveSystem.js';

// =========================================================================
// 1. VARIÁVEIS DE CONFIGURAÇÃO E CONSTANTES FIXAS
// =========================================================================

export let BOSS_SCORE_TRIGGER = 3000;
export let currentMissionId = 1;
export const MAX_DELTA_TIME_MS = 100;
export let ENEMY_SPAWN_INTERVAL = 1000;
export const SUPER_LASER_REQUIREMENT = 100;

export const HEALTH_PICKUP_VALUE = 100;
export const HEALTH_PICKUP_IMAGE = "../assets/img/pickup/concerto.png";
export const magnetRadius = 250;
export const magnetStrength = 100; 

export const CANVAS_WIDTH = 1000; 
export const CANVAS_HEIGHT = 800; 
export const BACKGROUND_SPEED_DIVISOR = 5000; 

// Valores iniciais estáveis
 
export let currentShipSpeed = 10760 ; 
export const CRUISE_SPEED = 10760;      // Mínimo (sua variável base)
export const SOUND_SPEED = 11760;       // Máximo (Velocidade do som aprox. em km/h)
export let currentMagStrength = 12.0;

// 🚀 Adicione essas funções para permitir a alteração
export function setShipSpeed(value) {
    currentShipSpeed = value;
}

export let currentMissionDifficulty = 1;  // dificuldade da missão atual (1-10)
export let maxEnemiesOnScreen = 6;        // limite de inimigos simultâneos

export function setMissionDifficulty(difficulty) {
    currentMissionDifficulty = Math.max(1, Math.min(10, difficulty));
    // Ajusta intervalo de spawn: missão 1 = 2800ms, missão 10 = 700ms
    ENEMY_SPAWN_INTERVAL = Math.max(700, 3000 - (currentMissionDifficulty * 230));
    // Ajusta máximo de inimigos na tela: missão 1 = 3, missão 10 = 8
    maxEnemiesOnScreen = Math.min(8, 2 + currentMissionDifficulty);
}

// =========================================================================
// 2. VARIÁVEIS ÍTENS STARS
// =========================================================================

export let playerStars = 0;

export async function updatePlayerStars(value) { // Make it async
    playerStars += value;
    
    // Sincroniza com o banco de dados local
    await addStars(value); // Await the async call
}

// Simulação de oscilação fictícia
 
 

// Chame essa função dentro do seu updateHTMLHUD()  
// =========================================================================
// 2. ELEMENTOS DO DOM E CONTEXTO (BLINDADO)
// =========================================================================
let canvas_ = null;
export let ctx = null; 

/**
 * Inicializa o Canvas e o Contexto 2D. 
 * Removido 'desynchronized' para eliminar o flicker (piscar).
 */
export function initCanvasAndContext() {
    canvas_ = document.getElementById('gameCanvas');

    if (canvas_) {
        canvas_.width = CANVAS_WIDTH; 
        canvas_.height = CANVAS_HEIGHT;

        // alpha: false melhora performance. 
        // desynchronized: REMOVIDO pois causa screen tearing e flicker.
        ctx = canvas_.getContext('2d', { 
            alpha: false 
        });

        // Configurações críticas de renderização
        ctx.imageSmoothingEnabled = false; // Mantém o estilo Pixel Art nítido
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    } else {
        console.error("Canvas 'gameCanvas' não encontrado.");
    }
}

// =========================================================================
// 3. VARIÁVEIS DE ESTADO MUTÁVEL
// =========================================================================

// Estado do Vídeo/Logo
let hasPlayedLogoVideo_ = sessionStorage.getItem('logoVideoPlayed') === 'true';
export let hasPlayedLogoVideo = hasPlayedLogoVideo_; 

// Estado principal
export let playerShip = null; 
export let currentBoss = null; 
export let bossDefeated = false; 
export let lastTime = 0; 
export let isPaused = false; 
export let currentWingman = null;
export function setCurrentWingman(w) { currentWingman = w; }

// Arrays mutáveis
export const enemies = []; 
export const enemyProjectiles = []; 
export const gameBackgrounds = []; 
export const particles = [];
export const pickups = [];

// Contadores e Pontuação
export let score = 0;
export let upgradePoints = 0;
export let enemySpawnTimer = 0;
export let superLaserCharge = 0;
export let nextWeaponUpgradeCost = 200; 
export let nextHealthPickupScore = 50; 

// Estado da Arma
export let superLaserAvailable = true; 
export let requiredScoreForNextLaser = 0; 
export let superLaserUsed = false; 
export let magnetActive = true; 

// Gerenciador de Assets (Imagens pré-carregadas)
export const ASSETS = {
    tiro: new Image(),
    tiroAzul: new Image(),
    bomba: new Image(),
    player: new Image() 
};

// =========================================================================
// 4. SETTERS (Para compatibilidade com Módulos ES6)
// =========================================================================

export function setPlayerShip(newShip) { playerShip = newShip; }
export function setCurrentBoss(bossInstance) { currentBoss = bossInstance; }
export function setBossDefeated(state) { bossDefeated = state; }
export function setPause(state) { isPaused = state; }
export function setLastTime(time) { lastTime = time; }
export function setEnemySpawnTimer(time) { enemySpawnTimer = time; }
export function setNextHealthPickupScore(val) { nextHealthPickupScore = val; }
export function updateSuperLaserCharge(val) { superLaserCharge = val; }
export function setNextWeaponUpgradeCost(cost) { nextWeaponUpgradeCost = cost; }
export function setUpgradePoints(points) { upgradePoints = points; }
export function setSuperLaserAvailable(state) { superLaserAvailable = state; }
export function setRequiredScoreForNextLaser(val) { requiredScoreForNextLaser = val; }
export function setSuperLaserUsed(state) { superLaserUsed = state; }
export function setMagnetActive(state) { magnetActive = state; }
export function setCurrentMissionId(id) { currentMissionId = id; }
export function setBossScoreTrigger(val) { BOSS_SCORE_TRIGGER = val; }

export function updateScore(points) { score += points; }
export function updateUpgradePoints(points) { upgradePoints += points; }

// =========================================================================
// 5. FUNÇÃO PARA RESETAR TUDO DA MISSÃO
// =========================================================================

export function resetMissionState() {
    // Limpar todos os inimigos
    enemies.length = 0;
    
    // Limpar todos os projéteis dos inimigos
    enemyProjectiles.length = 0;
    
    // Limpar partículas
    particles.length = 0;
    
    // Limpar pickups
    pickups.length = 0;
    
    // Resetar backgrounds
    gameBackgrounds.length = 0;
    
    // Resetar variáveis de estado
    score = 0;
    upgradePoints = 0;
    playerStars = 0;
    enemySpawnTimer = 0;
    superLaserCharge = 0;
    bossDefeated = false;
    currentBoss = null;
    superLaserAvailable = true;
    superLaserUsed = false;
    requiredScoreForNextLaser = 0;
    nextHealthPickupScore = 50;
    nextWeaponUpgradeCost = 200;
    magnetActive = true;
    
    console.log('✅ Estado da missão resetado completamente');
}

export function setLogoVideoPlayed(state) {
    hasPlayedLogoVideo = state;
    sessionStorage.setItem('logoVideoPlayed', state);
}
