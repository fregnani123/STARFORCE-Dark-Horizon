// =========================================================================
// 1. VARIÁVEIS DE CONFIGURAÇÃO E CONSTANTES FIXAS
// =========================================================================

export const BOSS_SCORE_TRIGGER = 3000;
export const MAX_DELTA_TIME_MS = 100;
export const ENEMY_SPAWN_INTERVAL = 2000;
export const SUPER_LASER_REQUIREMENT = 100;

export const HEALTH_PICKUP_VALUE = 100;
export const HEALTH_PICKUP_IMAGE = "../assets/img/pickup/concerto.png";
export const magnetRadius = 250;
export const magnetStrength = 100; 

export const CANVAS_WIDTH = 600; 
export const CANVAS_HEIGHT = 800; 
export const BACKGROUND_SPEED_DIVISOR = 5000; 

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

export function updateScore(points) { score += points; }
export function updateUpgradePoints(points) { upgradePoints += points; }

export function setLogoVideoPlayed(state) {
    hasPlayedLogoVideo = state;
    sessionStorage.setItem('logoVideoPlayed', state);
}