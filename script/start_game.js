// ======================================================
// IMPORTS OBRIGATÓRIOS
// ======================================================
import { Background } from './Background.js';
import { Player } from './Player.js';
import { playBGM, startShootSoundLoop, stopBGM } from './audio_game.js';
import { gameLoop } from './gameLoop.js';
import {
    playerShip, lastTime, CANVAS_WIDTH, CANVAS_HEIGHT,
    setLastTime, setPlayerShip, gameBackgrounds, isPaused, setPause, resetMissionState,
    setShipSpeed, CRUISE_SPEED, setMissionDifficulty, setCurrentMissionId, setBossScoreTrigger
} from './globals.js';
import { MISSIONS } from './gameLevel/missao_construtor.js';
import { getPlayerData, hasSavedGame, savePlayerData, getCurrentShip, getUpgradeLevels } from './saveSystem.js';
import { updateUI } from './gameLevel/level_designer.js';

// ======================================================
// ESTADO INTERNO E CONFIGURAÇÕES
// ======================================================
let CURRENT_MISSION = null;
let MULTI_BACKGROUND_IMAGES = [];
let SCROLL_SPEED;
let isGameLoopRunning = false;
const MIN_LOADING_TIME_MS = 2500;  // 🆙 Aumentado de 1500ms para 2500ms - Loading screen mais visível
const DEFAULT_IMAGES = ["../assets/img/nave-player/nave-metal.png"];  // 🆙 Mudado para nave-metal
let IMAGES_TO_LOAD = [...DEFAULT_IMAGES];

// Referências do DOM
const btnNovoJogo = document.getElementById('novo-jogo');
const btnContinuar = document.getElementById('continuar');
const creationOverlay = document.getElementById('playerCreationOverlay');
const btnConfirmar = document.getElementById('confirmarPlayer');
const playerNameInput = document.getElementById('playerNameInput');
const cutsceneContainer = document.getElementById('cutsceneContainer');
const historiaFrame = document.getElementById('historiaFrame');
const divIniciar = document.getElementById('div-index');
const divLevel = document.getElementById('container_levelGame');
const startScreen = document.getElementById('startScreen');
const loadingOverlay = document.getElementById('loadingOverlay');

function getUiLanguage() {
    const rawLang = localStorage.getItem('sf_language') || 'pt-BR';
    if (rawLang.startsWith('pt')) return 'pt-BR';
    if (rawLang.startsWith('es')) return 'es';
    return 'en';
}

function formatProgressDetails(data) {
    const lang = getUiLanguage();
    if (lang === 'en') return `Level ${data.currentMission}, ${data.totalStars} Stars`;
    if (lang === 'es') return `Nivel ${data.currentMission}, ${data.totalStars} Estrellas`;
    return `Nivel ${data.currentMission}, ${data.totalStars} Estrelas`;
}

// ======================================================
// 1. FLUXO DE CRIAÇÃO E CUTSCENE (HISTÓRIA)
// ======================================================

if (btnNovoJogo) {
    btnNovoJogo.addEventListener('click', () => {
        // Verificar se já existe um jogo salvo
        if (hasSavedGame()) {
            const data = getPlayerData();
            // Mostrar modal de confirmação
            const confirmOverlay = document.getElementById('confirmNewGameOverlay');
            const progressDetails = document.getElementById('progressDetails');
            progressDetails.textContent = formatProgressDetails(data);
            confirmOverlay.classList.remove('hidden');
        } else {
            // Se não há jogo salvo, ir direto para criação
            creationOverlay.classList.remove('hidden');
            setTimeout(() => playerNameInput.focus(), 100);
        }
    });
}

if (btnContinuar) {
    btnContinuar.addEventListener('click', () => {
        if (hasSavedGame()) {
            const data = getPlayerData();
            console.log(`Bem-vindo de volta, Comandante ${data.pilotName}.`);
            // Não para a música — ela continua tocando no tabuleiro
            updateUI();
            finishCutscene();
        }
    });
}

async function handleConfirmPlayer() { // Make it async
    const name = playerNameInput.value.trim().toUpperCase();
    if (name !== "") {
        if (typeof stopBGM === 'function') stopBGM();
        // Reset completo: zera tudo incluindo upgrades, estrelas e naves
        await savePlayerData({
            pilotName: name,
            currentMission: 1,
            totalStars: 0,
            unlockedLevels: [1],
            missionStars: {},
            currentShip: 'metal',
            unlockedShips: ['metal'],
            weaponLevel: 1,
            hullLevel: 1,
            engineLevel: 1,
            superLaserUnlocked: false,
            wingmanUnlocked: false
        });
        updateUI();
        creationOverlay.classList.add('hidden');
        playerNameInput.value = '';
        startStoryCutscene();
    } else {
        playerNameInput.style.borderColor = "red";
        setTimeout(() => playerNameInput.style.borderColor = "#ffd900", 1500);
    }
}

// Botão Cancelar - Voltar para Menu
document.getElementById('cancelarPlayer')?.addEventListener('click', () => {
    creationOverlay.classList.add('hidden');
    playerNameInput.value = ''; // Limpar input
});

// Botão Confirmar Reset - Apagar e começar novo jogo
document.getElementById('confirmarReset')?.addEventListener('click', async () => {
    const confirmOverlay = document.getElementById('confirmNewGameOverlay');
    confirmOverlay.classList.add('hidden');
    
    // Mostrar overlay de criação
    creationOverlay.classList.remove('hidden');
    playerNameInput.value = ''; // Limpar
    playerNameInput.focus();
});

// Botão Cancelar Reset - Voltar
document.getElementById('cancelarReset')?.addEventListener('click', () => {
    document.getElementById('confirmNewGameOverlay').classList.add('hidden');
});

// ESC para cancelar (em ambas as telas)
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        e.preventDefault();
        
        // Se está no modal de confirmação, fechar
        const confirmOverlay = document.getElementById('confirmNewGameOverlay');
        if (confirmOverlay && !confirmOverlay.classList.contains('hidden')) {
            confirmOverlay.classList.add('hidden');
            return;
        }
        
        // Se está na criação de piloto, fechar e voltar ao menu
        if (creationOverlay && !creationOverlay.classList.contains('hidden')) {
            creationOverlay.classList.add('hidden');
            playerNameInput.value = '';
            return;
        }
    }
});

if (btnConfirmar) btnConfirmar.addEventListener('click', handleConfirmPlayer);
playerNameInput?.addEventListener('keydown', (e) => e.key === 'Enter' && handleConfirmPlayer());

function startStoryCutscene() {
    if (!cutsceneContainer) return finishCutscene();
    cutsceneContainer.classList.remove('hidden');
    cutsceneContainer.style.display = 'flex';

    const rawLang = localStorage.getItem('sf_language') || 'pt-BR';
    const lang = rawLang.startsWith('pt') ? 'pt-BR' : (rawLang.startsWith('es') ? 'es' : 'en');
    const storyUrl = `historia.html?lang=${encodeURIComponent(lang)}&t=${Date.now()}`;

    // Carrega historia.html no iframe e força refresh para evitar cache antigo.
    if (historiaFrame) {
        historiaFrame.src = 'about:blank';
        requestAnimationFrame(() => {
            historiaFrame.src = storyUrl;
        });
    } else {
        // Fallback de segurança caso o iframe não exista no DOM.
        window.location.href = storyUrl;
    }
}

// Escuta a mensagem do iframe quando a história terminar
window.addEventListener('message', (e) => {
    if (e.data === 'historiaEnded') finishCutscene();
});

function startVideoTimer() { /* legado — substituído pelo iframe */ }


// 🚀 FUNÇÃO CORRIGIDA: Abre o menu de fases após a história
function finishCutscene() {
    // Descarrega o iframe para libertar memória
    if (historiaFrame) historiaFrame.src = '';

    // Esconde o container da história e a tela de criação
    cutsceneContainer.classList.add('hidden');
    cutsceneContainer.style.display = '';
    creationOverlay.classList.add('hidden');

    // MOSTRA O MENU DE FASES
    if (startScreen) startScreen.classList.remove('hidden');
    if (divIniciar) divIniciar.style.display = 'none';
    if (divLevel) divLevel.style.display = 'flex';
}

// Atalhos Cutscene
document.getElementById('skipCutscene')?.addEventListener('click', finishCutscene);
window.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT') return;
    if (e.key === "Escape" && !cutsceneContainer.classList.contains('hidden')) finishCutscene();
});

// Startup orchestration handled by init.js → tela_logo_video.js

// ======================================================
// 3. CORE DO JOGO (START E INIT)
// ======================================================

export function loadMission(id) {
    const mission = MISSIONS.find(m => m.id === Number(id));
    if (!mission) return;
    CURRENT_MISSION = mission;
    MULTI_BACKGROUND_IMAGES = [...mission.layers];
    IMAGES_TO_LOAD = [...DEFAULT_IMAGES, ...MULTI_BACKGROUND_IMAGES];
    SCROLL_SPEED = mission.scrollSpeed;
    if (mission.music) playBGM(mission.music, 1);
    // Configura dificuldade global (spawn rate, max inimigos, HP base)
    setMissionDifficulty(mission.enemyConfig?.difficulty || 1);
    // Configura missão atual e trigger do boss
    setCurrentMissionId(mission.id);
    setBossScoreTrigger(mission.bossScoreTrigger || 3000);
}

export function startGame() {
    const mainWrapper = document.getElementById("main-wrapper");
    const gameContainer = document.getElementById("gameContainer");
    const canvasOverlay = document.getElementById("canvasOverlay");
    const loadingOverlay = document.getElementById("loadingOverlay");

    // 🔴 RESETAR TUDO DA MISSÃO ANTES DE COMEÇAR
    resetMissionState();
    
    setPause(false);
    if (!CURRENT_MISSION) loadMission(1);

    // 1️⃣ PRIMEIRO: ESCONDER TELA ANTERIOR
    if (startScreen) startScreen.classList.add('hidden');
    
    // 2️⃣ SEGUNDO: MOSTRAR LOADING OVERLAY IMEDIATAMENTE (sem hidden class)
    if (loadingOverlay) {
        loadingOverlay.classList.remove('hidden');
        loadingOverlay.style.display = "flex";  // 📍 Garantir display visível
        loadingOverlay.style.zIndex = "99999999";  // 📍 Z-index altíssimo
    }
    
    // 3️⃣ TERCEIRO: ESCONDER OS CONTAINERS DO JOGO ANTERIOR
    if (mainWrapper) mainWrapper.style.display = "none";
    if (gameContainer) gameContainer.style.display = "none";
    if (canvasOverlay) canvasOverlay.style.display = "none";

    Promise.all([
        preloadImages(IMAGES_TO_LOAD),
        new Promise(res => setTimeout(res, MIN_LOADING_TIME_MS))  // ⏱️ Esperar 2.5s mínimo
    ])
    .then(async () => {
        await waitCanvasReady();
        initGame();
        await waitCanvasReady();

        // 📍 Adicionar delay extra antes de fechar o loading
        await new Promise(res => setTimeout(res, 800));

        // 4️⃣ AGORA SIM: FECHAR LOADING
        if (loadingOverlay) {
            loadingOverlay.classList.add('hidden');
            loadingOverlay.style.display = "none";
        }
        
        // 5️⃣ MOSTRAR JOGO NOVO (LIMPO)
        if (canvasOverlay) canvasOverlay.style.display = "flex";
        if (mainWrapper) {
            mainWrapper.style.display = "flex";
            mainWrapper.classList.remove('hidden');
        }
        if (gameContainer) gameContainer.style.display = "flex";

        const bgVideo = document.getElementById("bgVideo");
        if (bgVideo) bgVideo.play().catch(() => { });

        setTimeout(() => {
            if (typeof startShootSoundLoop === 'function') startShootSoundLoop();
        }, 2500); // Aguarda a intro da nave terminar (introDuration = 2000ms) + margem

        if (!isGameLoopRunning) {
            isGameLoopRunning = true;
            setLastTime(performance.now());
            requestAnimationFrame(gameLoop);
        }
    })
    .catch(err => {
        console.error("Erro ao iniciar jogo:", err);
        if (loadingOverlay) {
            loadingOverlay.classList.add('hidden');
            loadingOverlay.style.display = "none";
        }
    });
}

export function initGame() {
    const SHIP_WIDTH = 70;
    const SHIP_HEIGHT = 80;

    const shipId  = getCurrentShip() || 'metal';
    const shipImg = shipId === 'dark'
        ? `../assets/img/nave-player/nave-player-dark.png`
        : `../assets/img/nave-player/nave-${shipId}.png`;

    const { weaponLevel, hullLevel, engineLevel } = getUpgradeLevels();
    const HULL_HP = [700, 800, 900, 1000, 1200];
    const maxHealth = HULL_HP[(hullLevel || 1) - 1] || 700;

    // Aplicar bônus de velocidade do motor
    const ENGINE_SPEED_BONUS = [0, 0, 0.10, 0.20];  // +0%, +10%, +20%
    const speedBonus = ENGINE_SPEED_BONUS[(engineLevel || 1) - 1] || 0;
    setShipSpeed(Math.round(CRUISE_SPEED * (1 + speedBonus)));

    gameBackgrounds.length = 0;
    gameBackgrounds.push(new Background(MULTI_BACKGROUND_IMAGES, SCROLL_SPEED));
    setPlayerShip(new Player(
        (CANVAS_WIDTH / 2) - (SHIP_WIDTH / 2),
        CANVAS_HEIGHT - SHIP_HEIGHT - 50,
        SHIP_WIDTH, SHIP_HEIGHT,
        shipImg, maxHealth, weaponLevel || 1
    ));
    setLastTime(performance.now());
}

// ======================================================
// UTILS E EVENTOS
// ======================================================

function preloadImages(paths) {
    return Promise.all(paths.map(path => new Promise((resolve) => {
        const img = new Image();
        img.src = path;
        img.onload = resolve;
        img.onerror = resolve;
    })));
}

function waitCanvasReady() {
    return new Promise(res => requestAnimationFrame(() => requestAnimationFrame(res)));
}

export function attachMissionNodes() {
    document.querySelectorAll('.node').forEach(n => {
        n.addEventListener('click', () => {
            loadMission(n.dataset.mission || n.dataset.id);
            startGame();
        });
    });
}

document.addEventListener('DOMContentLoaded', attachMissionNodes);

// Animação Manche Menu
const bgMenu = document.getElementById('background');
const manche = document.getElementById('manche');
let targetMoveX = 0, currentMoveX = 0, targetRotation = 0, currentRotation = 0;

function animateMenu() {
    currentMoveX += (targetMoveX - currentMoveX) * 0.08;
    currentRotation += (targetRotation - currentRotation) * 0.08;
    if (bgMenu) bgMenu.style.transform = `translate(calc(-50% + ${currentMoveX}px), -50%) rotate(${currentRotation}deg)`;
    if (manche) manche.style.transform = `translateX(calc(-50% + ${currentMoveX * 3.2}px)) rotate(${currentRotation * 0.9}deg)`;
    requestAnimationFrame(animateMenu);
}
animateMenu();

document.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 'a') { targetMoveX = -12; targetRotation = -6; }
    if (e.key.toLowerCase() === 'd') { targetMoveX = 12; targetRotation = 6; }
});
document.addEventListener('keyup', () => { targetMoveX = 0; targetRotation = 0; });

window.startGame = startGame;
window.loadMission = loadMission;