// ======================================================
// CONFIG
// ======================================================
const BG_IMAGE_PATH = "../assets/img/cenarios/cenario-missao-1/cenario-1.png";
const MIN_LOADING_TIME_MS = 1500;

// Lista de camadas do cenário
const MULTI_BACKGROUND_IMAGES = [
    "../assets/img/cenarios/cenario-missao-1/cenario-1.png",
]; 
 
// ======================================================
// LOADING DO MENU
// ======================================================
document.addEventListener('DOMContentLoaded', () => {
    const overlay = document.getElementById('loadingOverlay');
    const startScreen = document.getElementById('startScreen');
    const menuMusic = document.getElementById('musicaFundo');

    
    const menuImages = [
        "../assets/img/cenario-start/ring-12779.gif",
        BG_IMAGE_PATH
    ];

    const preloadPromises = menuImages.map(path => new Promise((resolve, reject) => {
        const img = new Image();
        img.src = path;
        img.onload = () => resolve();
        img.onerror = () => reject();
    }));

    Promise.all([
        Promise.all(preloadPromises),
        new Promise(res => setTimeout(res, MIN_LOADING_TIME_MS))
    ])
    .then(() => {
        overlay.classList.add('hidden');
        startScreen.classList.remove('hidden');
        if (menuMusic) menuMusic.play().catch(() => {});
    })
    .catch(() => {
        overlay.classList.add('hidden');
        startScreen.classList.remove('hidden');
    });
});

// ======================================================
// PRÉ-CARREGAMENTO DO GAME
// ======================================================
const IMAGES_TO_LOAD = [
    BG_IMAGE_PATH,
    "../assets/img/nave-player/nave-player.png",
    ...MULTI_BACKGROUND_IMAGES
];

function preloadImages(paths) {
    return Promise.all(
        paths.map(path => new Promise((resolve, reject) => {
            const img = new Image();
            img.src = path;
            img.onload = () => resolve();
            img.onerror = () => reject();
        }))
    );
}

function waitCanvasReady() {
    return new Promise(resolve => {
        requestAnimationFrame(() => requestAnimationFrame(resolve));
    });
}

// ======================================================
// START GAME
// ======================================================
let isMusicPlaying = false;
const backgroundVideo = document.getElementById('bgVideo');

function startGame() {
    const startScreenDiv = document.getElementById('startScreen');
    const loadingOverlay = document.getElementById('loadingOverlay');
    const menuMusic = document.getElementById('musicaFundo');

    if (menuMusic) {
        menuMusic.pause();
        menuMusic.currentTime = 0;
    }

    startScreenDiv.classList.add('hidden');
    loadingOverlay.classList.remove('hidden');
    void loadingOverlay.offsetWidth;

    const bgMusic = document.getElementById('bgMusic');
    if (bgMusic) {
        bgMusic.volume = 0.35;
        bgMusic.play().catch(() => {});
        isMusicPlaying = true;
    }

    Promise.all([
        preloadImages(IMAGES_TO_LOAD),
        new Promise(res => setTimeout(res, MIN_LOADING_TIME_MS))
    ])
    .then(async () => {
        await waitCanvasReady();

        const gameCanvas = document.getElementById("gameCanvas");
        const ctx = gameCanvas.getContext("2d");

        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);

        loadingOverlay.classList.add('hidden');

        if (backgroundVideo) {
            backgroundVideo.play().catch(() => {});
        }

        initGame();

        const shootSound = document.getElementById('shootSound');
        if (shootSound) {
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const track = audioCtx.createMediaElementSource(shootSound);
            const gainNode = audioCtx.createGain();
            gainNode.gain.value = 0.02;
            track.connect(gainNode).connect(audioCtx.destination);
        }
    })
    .catch(() => {
        loadingOverlay.classList.add('hidden');
        alert("Erro ao carregar arquivos do jogo. Veja o console.");
    });
}

// ======================================================
// SONS
// ======================================================
function shoot() {
    const shootSound = document.getElementById('shootSound');
    if (shootSound) {
        shootSound.currentTime = 0;
        shootSound.play().catch(() => {});
    }
}

function playSound(src) {
    const snd = new Audio(src);
    snd.play().catch(() => {});
}

// ======================================================
// INICIAR GAME (CORRIGIDO FINAL)
// ======================================================
function initGame() {
    const SHIP_WIDTH = 90;
    const SHIP_HEIGHT = 65;

    window.gameBackgrounds = [];

    // Criar um background que aceita várias camadas
    gameBackgrounds.push(
        new Background(
            MULTI_BACKGROUND_IMAGES, // lista de imagens
            100,                      // velocidade
            CANVAS_WIDTH,
            CANVAS_HEIGHT
        )
    );

    // Criar nave do jogador
    playerShip = new Player(
        0,
        0,
        SHIP_WIDTH,
        SHIP_HEIGHT,
        "../assets/img/nave-player/nave-player.png",
        2000
    );

    lastTime = performance.now();
    requestAnimationFrame(gameLoop);
}
