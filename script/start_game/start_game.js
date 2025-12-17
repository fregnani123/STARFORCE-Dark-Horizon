// ======================================================
// IMPORTS OBRIGATÓRIOS (Orquestração de Inicialização)
// ======================================================
// Classes de Objetos
import { Background } from '../Background.js';
import { Player } from '../Player.js'; 

// Funções de Outros Módulos
import { playBGM, startShootSoundLoop } from '../audio_game.js'; 
import { gameLoop } from '../gameLoop.js'; 
import { initLogoVideoLogic } from '../utils/tela_logo_video.js'; 
import { mostrarTelaInicial } from '../tela_inicial_module.js'; 
import { setupInputListeners } from '../controle.js'; 

// Variáveis de Estado/Configuração (do globals.js)
import { 
    playerShip, 
    lastTime, 
    CANVAS_WIDTH, 
    CANVAS_HEIGHT,
    setLastTime, 
    // 🛑 CORREÇÃO CRÍTICA: Adiciona o Setter para o Player 🛑
    setPlayerShip, 
    gameBackgrounds 
} from '../globals.js'; 

// Variável que contém a definição das missões 
import { MISSIONS } from '../gameLevel/missao_construtor.js'; 


// ======================================================
// CONFIGURAÇÃO INICIAL
// ======================================================
// Variáveis internas ao módulo
let CURRENT_MISSION = null;
let BG_IMAGE_PATH = "";
let MULTI_BACKGROUND_IMAGES = [];

const MIN_LOADING_TIME_MS = 1500;
const DEFAULT_IMAGES = ["../assets/img/nave-player/nave-player.png"];
let IMAGES_TO_LOAD = [...DEFAULT_IMAGES];

// Variáveis de Scroll e Inimigos (Usadas na Missão)
let SCROLL_SPEED = 100;
let ENEMY_SETTINGS = {};


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

// UTIL: Espera por 2 frames para garantir que o canvas esteja pronto
function waitCanvasReady() {
    return new Promise(resolve => {
        requestAnimationFrame(() => requestAnimationFrame(resolve));
    });
}


// ------------------------
// Carrega missão (EXPORTADA)
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
    ENEMY_SETTINGS = mission.enemyConfig;

    if (mission.music) {
        try { 
            playBGM(mission.music, 1); 
        } catch(e){
            console.warn("Erro ao tocar música da missão:", e);
        }
    }
}

// ------------------------
// startGame (EXPORTADA)
// ------------------------
export function startGame() {
    const startScreenDiv = document.getElementById("div-index"); 
    const levelGameDiv = document.getElementById("container_levelGame"); 
    const loadingOverlay = document.getElementById("loadingOverlay");
    const mainWrapper = document.getElementById("main-wrapper"); 

    if (!CURRENT_MISSION) loadMission(1);

    // ESCONDE TELAS E MOSTRA LOADING
    if (startScreenDiv) startScreenDiv.style.display = 'none';
    if (levelGameDiv) levelGameDiv.style.display = 'none';
    
    if (loadingOverlay) loadingOverlay.classList.remove('hidden');

    Promise.all([
        preloadImages(IMAGES_TO_LOAD), 
        new Promise(res => setTimeout(res, MIN_LOADING_TIME_MS))
    ])
    .then(async () => {
        await waitCanvasReady();

        // 1. INICIALIZA OBJETOS DO JOGO
        initGame(); 

        await waitCanvasReady();

        // 3. ESCONDE LOADING
        if (loadingOverlay) loadingOverlay.classList.add('hidden');

        // 4. MOSTRA JOGO (Mantendo a lógica contraintuitiva que você corrigiu)
        if (mainWrapper) {
            levelGameDiv.style.display='flex'; // Mantido conforme sua solicitação
            mainWrapper.style.display = "flex";
        }

        // 5. Inicia o vídeo de fundo do jogo 
        const backgroundVideo = document.getElementById("bgVideo");
        if (backgroundVideo) backgroundVideo.play().catch(()=>{});
        
        // 6. Começa o som de tiro do player 
        startShootSoundLoop(); 
    })
    .catch(err => {
        console.error("Falha ao iniciar o jogo:", err);
        if (loadingOverlay) loadingOverlay.classList.add('hidden');
    });
}

// ------------------------
// initGame (EXPORTADA)
// ------------------------
export function initGame() {
    const mainWrapper = document.getElementById("main-wrapper");

    const SHIP_WIDTH = 70;
    const SHIP_HEIGHT = 80;
    const mission = CURRENT_MISSION || {};
    const scrollSpeed = SCROLL_SPEED; 

    // limpa elementos antigos 
    gameBackgrounds.length = 0; 

    // background
    try {
        gameBackgrounds.push(
            new Background(
                MULTI_BACKGROUND_IMAGES,
                scrollSpeed
            )
        );
    } catch(e) { console.warn("Erro Background:", e); }

try {
        // CORREÇÃO DE POSIÇÃO (Para garantir que a nave apareça no Canvas)
        const newPlayer = new Player(
            (CANVAS_WIDTH / 2) - (SHIP_WIDTH / 2), 
            CANVAS_HEIGHT - SHIP_HEIGHT - 50, 
            SHIP_WIDTH,
            SHIP_HEIGHT,
            "../assets/img/nave-player/nave-player.png",
            2000
        );
        
        // Usa o Setter (agora importado)
        setPlayerShip(newPlayer); 
        
    } catch(e) { console.warn("Erro Player:", e); }

    // Usa o Setter
    setLastTime(performance.now());
    
    requestAnimationFrame(gameLoop);
}

/**
 * Anexa listeners aos nodes da missão.
 */
export function attachMissionNodes() {
    const nodes = document.querySelectorAll('.node');
    nodes.forEach(n => {
        const id = n.dataset.mission || n.dataset.index || n.dataset.id;
        n.addEventListener('click', () => {
            loadMission(Number(id)); 
            startGame(); 
        });
    });
}