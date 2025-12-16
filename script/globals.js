// ... outras variáveis globais ...

// =========================================================================
// VARIÁVEL PERSISTENTE POR SESSÃO (USANDO sessionStorage)
// O estado será resetado toda vez que o jogo for fechado e reaberto.
// =========================================================================
let hasPlayedLogoVideo = sessionStorage.getItem('logoVideoPlayed') === 'true'; 

// ...


// CONSTANTES PRINCIPAIS
const MAX_DELTA_TIME_MS = 100; // Máx delta para travar lag

// 🚀 CORRIGIDO: Constantes de tamanho fixo do Canvas (600x900)
const CANVAS_WIDTH = 600; 
const CANVAS_HEIGHT = 800; 

// VARIÁVEIS GLOBAIS
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// ❌ REMOVIDO: Variáveis dinâmicas (CANVAS_WIDTH/HEIGHT = window.innerWidth/Height)

// 🚀 CORRIGIDO: Definir o tamanho do Canvas com as constantes fixas
canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;

// ❌ REMOVIDO: A função adjustCanvasSize e o window.addEventListener('resize')

let playerShip;
const enemies = [];
const enemyProjectiles = [];
let gameBackground;
let lastTime = 0;
let score = 0;

// Pontuação de upgrade para a nave
let upgradePoints = 0;

let isPaused = false;

// Super Laser
let superLaserAvailable = true;
let requiredScoreForNextLaser = 0;
let superLaserUsed = false;
let superLaserCharge = 0;
const SUPER_LASER_REQUIREMENT = 100;

// Upgrade Weapon - armas
let nextWeaponUpgradeCost = 200;

// Spawn de inimigos
let enemySpawnTimer = 0;
const ENEMY_SPAWN_INTERVAL = 2000;
let particles = []; // Array para gerenciar todas as partículas ativas

// Variáveis globais do ímã
let magnetActive = true;        
let magnetRadius = 250;

// 🛑 AUMENTAR A FORÇA: De 0.15 para um valor muito mais alto, como 100 ou 200.
// Isto deve forçar a aceleração dos pickups.
let magnetStrength = 100; // Valor muito mais agressivo (ajuste conforme o teste)

// PICKUP DE VIDA
const pickups = [];
let nextHealthPickupScore = 50;
const HEALTH_PICKUP_VALUE = 100;
const HEALTH_PICKUP_IMAGE = "../assets/img/pickup/concerto.png";