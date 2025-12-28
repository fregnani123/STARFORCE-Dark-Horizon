// ======================================================
// IMPORTS OBRIGATÓRIOS
// ======================================================
import { Background } from './Background.js';
import { Player } from './Player.js';
import { playBGM, startShootSoundLoop, stopBGM } from './audio_game.js';
import { gameLoop } from './gameLoop.js';
import {
    playerShip, lastTime, CANVAS_WIDTH, CANVAS_HEIGHT,
    setLastTime, setPlayerShip, gameBackgrounds, isPaused, setPause
} from './globals.js';
import { MISSIONS } from './gameLevel/missao_construtor.js';

// ======================================================
// ESTADO INTERNO E CONFIGURAÇÕES
// ======================================================
let CURRENT_MISSION = null;
let MULTI_BACKGROUND_IMAGES = [];
let SCROLL_SPEED;
let isGameLoopRunning = false;
const MIN_LOADING_TIME_MS = 1500;
const DEFAULT_IMAGES = ["../assets/img/nave-player/nave-player.png"];
let IMAGES_TO_LOAD = [...DEFAULT_IMAGES];

// Referências do DOM
const btnNovoJogo = document.getElementById('novo-jogo');
const creationOverlay = document.getElementById('playerCreationOverlay');
const btnConfirmar = document.getElementById('confirmarPlayer');
const playerNameInput = document.getElementById('playerNameInput');
const cutsceneContainer = document.getElementById('cutsceneContainer');
const historyVideo = document.getElementById('historyVideo');
const timerEl = document.getElementById('videoTimer');
const divIniciar = document.getElementById('div-index');
const divLevel = document.getElementById('container_levelGame');
const startScreen = document.getElementById('startScreen');
const loadingOverlay = document.getElementById('loadingOverlay');

let timerInterval;

// ======================================================
// 1. FLUXO DE CRIAÇÃO E CUTSCENE (HISTÓRIA)
// ======================================================

if (btnNovoJogo) {
    btnNovoJogo.addEventListener('click', () => {
        creationOverlay.classList.remove('hidden');
        setTimeout(() => playerNameInput.focus(), 100);
    });
}

function handleConfirmPlayer() {
    const name = playerNameInput.value.trim().toUpperCase();
    if (name !== "") {
        if (typeof stopBGM === 'function') stopBGM();
        localStorage.setItem('currentPlayerName', name);
        creationOverlay.classList.add('hidden');
        startStoryCutscene();
    } else {
        playerNameInput.style.borderColor = "red";
        setTimeout(() => playerNameInput.style.borderColor = "#ffd900", 1500);
    }
}

if (btnConfirmar) btnConfirmar.addEventListener('click', handleConfirmPlayer);
playerNameInput?.addEventListener('keydown', (e) => e.key === 'Enter' && handleConfirmPlayer());

function startStoryCutscene() {
    if (!cutsceneContainer || !historyVideo) return finishCutscene();
    cutsceneContainer.classList.remove('hidden');
    historyVideo.muted = false;
    historyVideo.play()
        .then(() => startVideoTimer())
        .catch(() => finishCutscene());
    historyVideo.onended = () => finishCutscene();
}

function startVideoTimer() {
    let totalSeconds = 0;
    if (timerEl) timerEl.textContent = "00:00:00";
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        totalSeconds++;
        const hrs = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
        const mins = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
        const secs = String(totalSeconds % 60).padStart(2, '0');
        if (timerEl) timerEl.textContent = `${hrs}:${mins}:${secs}`;
    }, 1000);
}

// 🚀 FUNÇÃO CORRIGIDA: Abre o menu de fases após o vídeo
function finishCutscene() {
    clearInterval(timerInterval);
    if (historyVideo) {
        historyVideo.pause();
        historyVideo.currentTime = 0;
    }

    // Esconde o container do vídeo e a tela de criação
    cutsceneContainer.classList.add('hidden');
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

// ======================================================
// 2. LÓGICA DE CARREGAMENTO INICIAL (LOGO)
// ======================================================

document.addEventListener('DOMContentLoaded', () => {
    const logoVideo = document.getElementById('logoVideo');
    const startVideo = document.getElementById('startVideo');

    const hideLogoAndShowStart = () => {
        if (logoVideo) { logoVideo.pause(); logoVideo.classList.add('hidden'); }
        if (startVideo) { startVideo.classList.remove('hidden'); startVideo.play().catch(() => { }); }
        if (startScreen) startScreen.classList.remove('hidden');
        if (divIniciar) divIniciar.style.display = 'flex';
    };

    setTimeout(() => {
        if (loadingOverlay) loadingOverlay.classList.add('hidden');
        if (logoVideo) {
            logoVideo.classList.remove('hidden');
            logoVideo.muted = false;
            logoVideo.play().catch(hideLogoAndShowStart);
            logoVideo.onended = hideLogoAndShowStart;
            setTimeout(hideLogoAndShowStart, 8000);
        } else {
            hideLogoAndShowStart();
        }
    }, 2000);
});

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
}

export function startGame() {
    const mainWrapper = document.getElementById("main-wrapper");
    const canvasOverlay = document.getElementById("canvasOverlay");

    setPause(false);
    if (!CURRENT_MISSION) loadMission(1);

    if (startScreen) startScreen.classList.add('hidden');
    if (canvasOverlay) canvasOverlay.style.display = "flex";
    if (loadingOverlay) loadingOverlay.classList.remove('hidden');

    Promise.all([
        preloadImages(IMAGES_TO_LOAD),
        new Promise(res => setTimeout(res, MIN_LOADING_TIME_MS))
    ])
    .then(async () => {
        await waitCanvasReady();
        initGame();
        await waitCanvasReady();

        if (loadingOverlay) loadingOverlay.classList.add('hidden');
        if (mainWrapper) {
            mainWrapper.style.display = "flex";
            mainWrapper.classList.remove('hidden');
        }

        const bgVideo = document.getElementById("bgVideo");
        if (bgVideo) bgVideo.play().catch(() => { });

        setTimeout(() => {
            if (typeof startShootSoundLoop === 'function') startShootSoundLoop();
        }, 1000);

        if (!isGameLoopRunning) {
            isGameLoopRunning = true;
            setLastTime(performance.now());
            requestAnimationFrame(gameLoop);
        }
    })
    .catch(err => {
        console.error("Erro ao iniciar jogo:", err);
        if (loadingOverlay) loadingOverlay.classList.add('hidden');
    });
}

export function initGame() {
    const SHIP_WIDTH = 70;
    const SHIP_HEIGHT = 80;
    gameBackgrounds.length = 0;
    gameBackgrounds.push(new Background(MULTI_BACKGROUND_IMAGES, SCROLL_SPEED));
    setPlayerShip(new Player(
        (CANVAS_WIDTH / 2) - (SHIP_WIDTH / 2),
        CANVAS_HEIGHT - SHIP_HEIGHT - 50,
        SHIP_WIDTH, SHIP_HEIGHT,
        "../assets/img/nave-player/nave-player.png", 700
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