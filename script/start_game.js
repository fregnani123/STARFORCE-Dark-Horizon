// ======================================================
// IMPORTS OBRIGATÓRIOS (Orquestração de Inicialização)
// ======================================================
import { Background } from './Background.js';
import { Player } from './Player.js'; 
import { playBGM, startShootSoundLoop } from './audio_game.js'; 
import { gameLoop } from './gameLoop.js'; 

import { 
    playerShip, 
    lastTime, 
    CANVAS_WIDTH, 
    CANVAS_HEIGHT,
    setLastTime, 
    setPlayerShip, 
    gameBackgrounds 
} from './globals.js'; 

import { MISSIONS } from './gameLevel/missao_construtor.js'; 

// ======================================================
// CONFIGURAÇÃO E ESTADO INTERNO
// ======================================================
let CURRENT_MISSION = null;
let MULTI_BACKGROUND_IMAGES = [];
let SCROLL_SPEED = 100;
let BG_IMAGE_PATH = "";

// 🛑 TRAVA DE SEGURANÇA PARA EVITAR DUPLO LOOP (RESOLVE O PISCAR)
let isGameLoopRunning = false; 

const MIN_LOADING_TIME_MS = 1500;
const DEFAULT_IMAGES = ["../assets/img/nave-player/nave-player.png"];
let IMAGES_TO_LOAD = [...DEFAULT_IMAGES];

// ------------------------
// UTIL: preload de imagens 
// ------------------------
export function preloadImages(paths) {
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
// Fluxo overlay Inicial (Logo)
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
    }
});

// ------------------------
// Carrega missão (ADICIONADO EXPORT)
// ------------------------
export function loadMission(id) {
    const mission = MISSIONS.find(m => m.id === Number(id));
    if (!mission) return console.error("Missão inválida:", id);

    CURRENT_MISSION = mission;
    BG_IMAGE_PATH = mission.bg;
    MULTI_BACKGROUND_IMAGES = [...mission.layers];

    IMAGES_TO_LOAD.length = 0;
    IMAGES_TO_LOAD.push(...DEFAULT_IMAGES, ...MULTI_BACKGROUND_IMAGES);

    SCROLL_SPEED = mission.scrollSpeed;

    if (mission.music) {
        try { playBGM(mission.music, 1); } catch(e){ console.warn(e); }
    }
}

// ------------------------
// startGame (ADICIONADO EXPORT)
// ------------------------
export function startGame() {
    const startScreenDiv = document.getElementById("startScreen");
    const loadingOverlay = document.getElementById("loadingOverlay");
    const mainWrapper = document.getElementById("main-wrapper");
    const canvasOverlay = document.getElementById("canvasOverlay");

    if (!CURRENT_MISSION) loadMission(1);

    if (startScreenDiv) startScreenDiv.classList.add('hidden');
    if (canvasOverlay) canvasOverlay.style.display = "flex";
    
    if (loadingOverlay) loadingOverlay.classList.remove('hidden');

    Promise.all([
        preloadImages(IMAGES_TO_LOAD),
        new Promise(res => setTimeout(res, MIN_LOADING_TIME_MS))
    ])
    .then(async () => {
        await waitCanvasReady();

        // INICIALIZA OS OBJETOS
        initGame();

        await waitCanvasReady();

        if (loadingOverlay) loadingOverlay.classList.add('hidden');
        if (mainWrapper) mainWrapper.style.display = "flex";

        const backgroundVideo = document.getElementById("bgVideo");
        if (backgroundVideo) backgroundVideo.play().catch(()=>{});
        
        // Inicia o som de tiro em loop se necessário
        try { startShootSoundLoop(); } catch(e){}

        // 🛑 SÓ INICIA O LOOP SE ELE NÃO ESTIVER RODANDO
        if (!isGameLoopRunning) {
            isGameLoopRunning = true;
            setLastTime(performance.now());
            requestAnimationFrame(gameLoop);
        }
    })
    .catch(err => {
        console.error("Erro no StartGame:", err);
        if (loadingOverlay) loadingOverlay.classList.add('hidden');
    });
}

// ------------------------
// initGame (ADICIONADO EXPORT)
// ------------------------
export function initGame() {
    const SHIP_WIDTH = 70;
    const SHIP_HEIGHT = 80;

    // Limpa backgrounds antigos antes de criar novos
    gameBackgrounds.length = 0;

    // Criar Background
    try {
        gameBackgrounds.push(
            new Background(
                MULTI_BACKGROUND_IMAGES,
                SCROLL_SPEED,
                CANVAS_WIDTH,
                CANVAS_HEIGHT
            )
        );
    } catch(e) { console.warn("Erro Background:", e); }

    // Criar Player
    try {
        const newPlayer = new Player(
            (CANVAS_WIDTH / 2) - (SHIP_WIDTH / 2), 
            CANVAS_HEIGHT - SHIP_HEIGHT - 50,
            SHIP_WIDTH,
            SHIP_HEIGHT,
            "../assets/img/nave-player/nave-player.png",
            2000
        );
        setPlayerShip(newPlayer);
    } catch(e) { console.warn("Erro Player:", e); }

    setLastTime(performance.now());
}

// ------------------------
// Ativa nodes de missão (ADICIONADO EXPORT)
// ------------------------
export function attachMissionNodes() {
    const nodes = document.querySelectorAll('.node');
    nodes.forEach(n => {
        // Remove listeners antigos clonando o nó (evita execuções duplicadas)
        const newNode = n.cloneNode(true);
        n.parentNode.replaceChild(newNode, n);

        const id = newNode.dataset.mission || newNode.dataset.index || newNode.dataset.id;
        newNode.addEventListener('click', () => {
            loadMission(Number(id));
            startGame();
        });
    });
}

// Inicia os listeners ao carregar o DOM
document.addEventListener('DOMContentLoaded', attachMissionNodes);

// Mantém as referências globais se o seu sistema de designer precisar
window.loadMission = loadMission;
window.startGame = startGame;
window.initGame = initGame;