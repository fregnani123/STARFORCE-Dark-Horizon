// ========================
// game-main.js
// ========================

// ------------------------
// CONFIG INICIAL
// ------------------------
let BG_IMAGE_PATH = "";
let MULTI_BACKGROUND_IMAGES = [];
const MIN_LOADING_TIME_MS = 1500;

// imagens padrão essenciais
const DEFAULT_IMAGES = ["../assets/img/nave-player/nave-player.png"];
let IMAGES_TO_LOAD = [...DEFAULT_IMAGES];

// ------------------------
// MISSIONS
// ------------------------
const MISSIONS = [
    { id:1, name:"Missão 1",  bg: "../assets/img/cenarios/cenario-missao-1/cenario-1.png", layers: ["../assets/img/cenarios/cenario-missao-1/cenario-1.png"], music: "../assets/audio/Ultra-Lag-chosic.com_.mp3", scrollSpeed: 100, enemyConfig:{ spawnRate:1.0, difficulty:1 }},
    { id:2, name:"Missão 2",  bg: "", layers: [], music: "", scrollSpeed: 120, enemyConfig:{ spawnRate:1.2, difficulty:2 } },
    // ... missões 3 a 15 (igual ao seu código original)
];

// ------------------------
// UTIL: preload de imagens
// ------------------------
function preloadImages(paths) {
    return Promise.all(paths.map(path => new Promise((resolve) => {
        if (!path) return resolve();
        const img = new Image();
        img.src = path;
        img.onload = resolve;
        img.onerror = () => { console.warn("Falha ao carregar:", path); resolve(); };
    })));
}

function waitCanvasReady() {
    return new Promise(resolve => {
        requestAnimationFrame(() => requestAnimationFrame(resolve));
    });
}

// ------------------------
// Fluxo overlay -> logo -> tela inicial
// ------------------------
document.addEventListener('DOMContentLoaded', () => {
    const loadingOverlay = document.getElementById('loadingOverlay');
    const logoVideo = document.getElementById('logoVideo');
    const startVideo = document.getElementById('startVideo');
    const startScreen = document.getElementById('startScreen');

    if (startScreen) startScreen.classList.add('hidden');
    if (startVideo) startVideo.classList.add('hidden');
    if (logoVideo) logoVideo.classList.add('hidden');

    const LOADING_MS = 2000;
    const LOGO_FALLBACK_MS = 8000;

    setTimeout(() => {
        if (loadingOverlay) loadingOverlay.classList.add('hidden');

        if (logoVideo) {
            logoVideo.classList.remove('hidden');
            setTimeout(() => {
                logoVideo.muted = false;
                logoVideo.play().catch(() => hideLogoAndShowStart());
            }, 200);

            logoVideo._timeout = setTimeout(() => hideLogoAndShowStart(), LOGO_FALLBACK_MS);

            logoVideo.addEventListener('ended', () => {
                clearTimeout(logoVideo._timeout);
                hideLogoAndShowStart();
            }, { once: true });
        } else {
            hideLogoAndShowStart();
        }
    }, LOADING_MS);

    function hideLogoAndShowStart() {
        if (logoVideo) logoVideo.pause();
        if (logoVideo) logoVideo.classList.add('hidden');
        if (startVideo) {
            startVideo.classList.remove('hidden');
            startVideo.play().catch(()=>{});
        }
        if (startScreen) startScreen.classList.remove('hidden');

        try { playBGM('../assets/audio/tela-inicio.mp3', 1); } catch(e){}
    }
});

// ------------------------
// Carrega missão
// ------------------------
function loadMission(id) {
    const mission = MISSIONS.find(m => m.id === Number(id));
    if (!mission) return console.error("Missão inválida:", id);

    window.CURRENT_MISSION = mission;
    BG_IMAGE_PATH = mission.bg;
    MULTI_BACKGROUND_IMAGES = [...mission.layers];

    IMAGES_TO_LOAD.length = 0;
    IMAGES_TO_LOAD.push(...DEFAULT_IMAGES, ...MULTI_BACKGROUND_IMAGES);

    window.SCROLL_SPEED = mission.scrollSpeed;
    window.ENEMY_SETTINGS = mission.enemyConfig;

    if (mission.music) try { playBGM(mission.music, 1); } catch(e){}
}

// ------------------------
// startGame
// ------------------------
const backgroundVideo = document.getElementById("bgVideo");

function startGame() {
    const startScreenDiv = document.getElementById("startScreen");
    const loadingOverlay = document.getElementById("loadingOverlay");
    const mainWrapper = document.getElementById("main-wrapper");

    if (!window.CURRENT_MISSION) loadMission(1);

    if (startScreenDiv) startScreenDiv.classList.add('hidden');
    if (loadingOverlay) loadingOverlay.classList.remove('hidden');

    Promise.all([
        preloadImages(IMAGES_TO_LOAD),
        new Promise(res => setTimeout(res, MIN_LOADING_TIME_MS))
    ])
    .then(async () => {
        await waitCanvasReady();

        const canvas = document.getElementById("gameCanvas");
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "black";
        ctx.fillRect(0,0,canvas.width,canvas.height);

        if (loadingOverlay) loadingOverlay.classList.add('hidden');

        if (backgroundVideo) backgroundVideo.play().catch(()=>{});

        if (mainWrapper) mainWrapper.style.display = "flex";

        // inicializa o jogo
        initGame();
    })
    .catch(err => {
        console.error(err);
        if (loadingOverlay) loadingOverlay.classList.add('hidden');
    });
}

// ------------------------
// initGame
// ------------------------
window.gameBackgrounds = [];

function initGame() {
    const mainWrapper = document.getElementById("main-wrapper");
    if (mainWrapper) mainWrapper.style.display = "none";
    const canvasOverlay = document.getElementById("canvasOverlay");

    const SHIP_WIDTH = 70;
    const SHIP_HEIGHT = 80;
    const mission = window.CURRENT_MISSION || {};
    const scrollSpeed = mission.scrollSpeed || (window.SCROLL_SPEED || 100);

    // limpa elementos antigos
    window.gameBackgrounds = [];

    // background
    try {
        window.gameBackgrounds.push(
            new Background(
                MULTI_BACKGROUND_IMAGES,
                scrollSpeed,
                CANVAS_WIDTH,
                CANVAS_HEIGHT
            )
        );
    } catch(e) { console.warn("Erro Background:", e); }

    // player
    try {
        
        playerShip = new Player(
            0, 0,
            SHIP_WIDTH,
            SHIP_HEIGHT,
            "../assets/img/nave-player/nave-player.png",
            2000
        );
    } catch(e) { console.warn("Erro Player:", e); }

    lastTime = performance.now();
    requestAnimationFrame(gameLoop);

    setTimeout(() => {
        if (canvasOverlay) canvasOverlay.style.display = "none";
        if (mainWrapper) mainWrapper.style.display = "flex";
    }, 500);

    setTimeout(() => {
        try { shootSoundPlay(); } catch(e){}
    }, 2000);
}




// ------------------------
// Ativa nodes de missão
// ------------------------
function attachMissionNodes() {
    const nodes = document.querySelectorAll('.node');
    nodes.forEach(n => {
        const id = n.dataset.mission || n.dataset.index || n.dataset.id;
        n.addEventListener('click', () => {
            loadMission(Number(id));
            startGame();
        });
    });
}
document.addEventListener('DOMContentLoaded', attachMissionNodes);

// Helpers debug
window.loadMission = loadMission;
window.startGame = startGame;
window.initGame = initGame;
window.MISSIONS = MISSIONS;
