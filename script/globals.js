// =========================================================================
// 1. VARIÁVEIS DE CONFIGURAÇÃO E CONSTANTES FIXAS
// =========================================================================

// Configuração de Nível e Dificuldade
export const BOSS_SCORE_TRIGGER = 100;
export const MAX_DELTA_TIME_MS = 100;
export const ENEMY_SPAWN_INTERVAL = 2000;
export const SUPER_LASER_REQUIREMENT = 100;

// Configuração de Pickups
export const HEALTH_PICKUP_VALUE = 100;
export const HEALTH_PICKUP_IMAGE = "../assets/img/pickup/concerto.png";
export const magnetRadius = 250;
export const magnetStrength = 100; 

// Configuração do Canvas
export const CANVAS_WIDTH = 600; 
export const CANVAS_HEIGHT = 800; 

// Constante para o cálculo de scroll do Background
export const BACKGROUND_SPEED_DIVISOR = 5000; 


// =========================================================================
// 2. ELEMENTOS DO DOM (Canvas e Contexto)
// =========================================================================
let canvas_ = null;
export let ctx = null; 


// =========================================================================
// 3. VARIÁVEIS DE ESTADO MUTÁVEL (Estado do Jogo)
// =========================================================================

// Variável Persistente (Estado do Logo)
let hasPlayedLogoVideo_ = sessionStorage.getItem('logoVideoPlayed') === 'true';
export let hasPlayedLogoVideo = hasPlayedLogoVideo_; 

// Estado principal do jogo
export let playerShip = null; 
export let currentBoss = null; 
export let bossDefeated = false; 
export let lastTime = 0; 
export let isPaused = false; 

// Arrays de Objetos (Exportados como const, o array em si é mutável)
export const enemies = []; 
export const enemyProjectiles = []; 
export const gameBackgrounds = []; 
export const particles = [];
export const pickups = [];

// Contadores e Flags
export let score = 0;
export let upgradePoints = 0; // 🛑 NOVO SETTER NECESSÁRIO
export let enemySpawnTimer = 0;
export let superLaserCharge = 0;
export let nextWeaponUpgradeCost = 200; // 🛑 NOVO SETTER NECESSÁRIO
export let nextHealthPickupScore = 50; 

// Estado da Arma
export let superLaserAvailable = true; // 🛑 NOVO SETTER NECESSÁRIO
export let requiredScoreForNextLaser = 0; // 🛑 NOVO SETTER NECESSÁRIO
export let superLaserUsed = false; // 🛑 NOVO SETTER NECESSÁRIO
export let magnetActive = true; // 🛑 NOVO SETTER NECESSÁRIO


// =========================================================================
// 4. FUNÇÕES DE UTILIDADE (Setters e Inicialização)
// =========================================================================

/**
 * Inicializa o Canvas e o Contexto 2D. 
 */
export function initCanvasAndContext() {
    canvas_ = document.getElementById('gameCanvas');

    if (canvas_) {
        canvas_.width = CANVAS_WIDTH; 
        canvas_.height = CANVAS_HEIGHT;
        ctx = canvas_.getContext('2d');
    } else {
        console.error("Canvas 'gameCanvas' não encontrado no DOM. O jogo não será desenhado.");
    }
}

// --- SETTERS GERAIS DE ESTADO ---

/** Setter para a instância atual do Boss. */
export function setCurrentBoss(bossInstance) {
    currentBoss = bossInstance;
}

/** Setter para o estado de derrota do Boss. */
export function setBossDefeated(state) {
    bossDefeated = state;
}

/** Setter para o estado de pausa. */
export function setPause(state) {
    isPaused = state;
}

/** Setter para a instância da nave do jogador. */
export function setPlayerShip(newShip) {
    playerShip = newShip;
}

/** Setter para o tempo do último frame (delta time). */
export function setLastTime(time) {
    lastTime = time;
}

/** Setter para o temporizador de spawn. */
export function setEnemySpawnTimer(time) {
    enemySpawnTimer = time;
}

/** Setter para o custo do próximo Health Pickup. */
export function setNextHealthPickupScore(score) {
    nextHealthPickupScore = score;
}

/** Setter para o estado do vídeo de logo. */
export function setLogoVideoPlayed(state) {
    hasPlayedLogoVideo = state;
    sessionStorage.setItem('logoVideoPlayed', state);
}


// --- SETTERS DE ARMA/UPGRADE ---

/** Setter para a carga do Super Laser. */
export function updateSuperLaserCharge(value) {
    superLaserCharge = value;
}

/** 🛑 NOVO: Setter para o custo do próximo upgrade de arma. */
export function setNextWeaponUpgradeCost(cost) {
    nextWeaponUpgradeCost = cost;
}

/** 🛑 NOVO: Setter para a pontuação de upgrade (geralmente alterado via updateUpgradePoints). */
export function setUpgradePoints(points) {
    upgradePoints = points;
}

/** 🛑 NOVO: Setter para o estado de disponibilidade do Super Laser. */
export function setSuperLaserAvailable(state) {
    superLaserAvailable = state;
}

/** 🛑 NOVO: Setter para a pontuação requerida para o próximo laser. */
export function setRequiredScoreForNextLaser(score) {
    requiredScoreForNextLaser = score;
}

/** 🛑 NOVO: Setter para a flag que indica se o laser foi usado. */
export function setSuperLaserUsed(state) {
    superLaserUsed = state;
}

/** 🛑 NOVO: Setter para o estado de magnetismo. */
export function setMagnetActive(state) {
    magnetActive = state;
}

// --- FUNÇÕES DE MUTATOR COM ACUMULAÇÃO ---

/** Adiciona pontos ao score atual. */
export function updateScore(points) {
    score += points;
}

/** Adiciona/Subtrai pontos de upgrade. */
export function updateUpgradePoints(points) {
    upgradePoints += points;
}