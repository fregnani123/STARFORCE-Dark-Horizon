// ======================================================
// IMPORTS OBRIGATÓRIOS
// ======================================================
import { Background } from './Background.js';
import { Player } from './Player.js';
import { playBGM, startShootSoundLoop, stopBGM, stopShootSoundLoop } from './audio_game.js';
import { gameLoop } from './gameLoop.js';
import {
    playerShip, lastTime, CANVAS_WIDTH, CANVAS_HEIGHT,
    setLastTime, setPlayerShip, gameBackgrounds, isPaused, setPause, resetMissionState,
    setShipSpeed, CRUISE_SPEED, setMissionDifficulty, setCurrentMissionId, setBossScoreTrigger, setIsOpeningMission, setOpeningLandingActive,
    setPostLandingCallback
} from './globals.js';
import { MISSIONS } from './gameLevel/missao_construtor.js';
import { getPlayerData, hasSavedGame, savePlayerData, getCurrentShip, getUpgradeLevels } from './saveSystem.js';
import { updateUI } from './gameLevel/level_designer.js';
import { playMenuMusic } from './tela_inicial_module.js';

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
const CUTSCENE_BGM_PATH = '../assets/audio/leberch-space-ambient-509783.mp3';
const OPENING_MISSION_ID = 0;
let shouldAutoStartOpeningMission = false;
let openingMissionTimer = null;
let isFinishingCutscene = false;
let openingCinematicTimers = [];
let openingAwaitingAck = false;
let openingAckCleanup = null;
let openingSkipChronicleCleanup = null;
let openingSkipTriggered = false;
const OPENING_CHRONICLE_TEXT = [
    'INT. ÓRBITA LUNAR - SILÊNCIO ABSOLUTO.',
    'Durante nove séculos, os hangares da FGL-01 permaneceram adormecidos, cobertos por poeira cósmica.',
    'Agora, no limite entre sombra e luz, os reatores despertam e a base retorna ao estado de guerra.',
    'Longe dali, uma assinatura massiva cruza o vazio em direção à Terra.',
    'A ordem ecoa nos canais: todos os pilotos, em posição imediata.'
].join('\n');
const BASE_CALL_TITLE_TEXT = "BASE LUNAR FGL-01 CHAMANDO TODOS OS PILOTOS";
const BASE_CALL_SUBTITLE_TEXT = "Comandante da base em canal aberto. Protocolos Omega restaurados. Identificação de esquadrão em andamento.";
const OPENING_SEQUENCE = [
    { id: 'openingFilmCard', startAt: 0, endAt: 3600 },
    { id: 'openingDevelopersCard', startAt: 4300, endAt: 8200 },
    { id: 'openingRightsCard', startAt: 9000, endAt: 12600 },
    { id: 'openingTimeCard', startAt: 13600, endAt: 18800 },
    { id: 'openingReturnCard', startAt: 19600, endAt: 25600 },
    { id: 'openingStoryCrawl', startAt: 26400, endAt: 54600 },
    { id: 'openingBaseCall', startAt: 55600, endAt: 70000 } // ⏱️ Definido para 30s de leitura confortável
];
const OPENING_BLACKOUTS = [3800, 8500, 13000, 19000, 25800, 54800, 85800];
const OPENING_SUBTITLES = [
    { startAt: 0, endAt: 3600, text: 'Uma produção FGL Software Solutions.' },
    { startAt: 4300, endAt: 8200, text: 'Desenvolvido por Fabiano Fregnani.' },
    { startAt: 9000, endAt: 12600, text: 'Todos os direitos reservados.' },
    { startAt: 13600, endAt: 18800, text: 'Faz 998 anos desde o último sinal enviado pela superfície terrestre.' },
    { startAt: 19600, endAt: 25600, text: 'Agora, a base lunar FGL-01 desperta seus hangares e reacende o protocolo de retorno.' },
    { startAt: 26400, endAt: 35000, text: 'No vazio entre a Lua e a Terra, uma ameaça colossal atravessa a escuridão.' },
    { startAt: 35200, endAt: 44400, text: 'Durante séculos, ninguém respondeu ao chamado do planeta perdido.' },
    { startAt: 44600, endAt: 54600, text: 'Agora, o retorno deixa de ser esperança e se torna mobilização imediata.' },
];
const POST_ACK_BLACKOUTS = [0, 8200];
const POST_ACK_SEQUENCE = [
    { id: 'openingThreatCard', startAt: 800, endAt: 9400 }
];
const POST_ACK_SUBTITLES = [
    { startAt: 900, endAt: 5600, text: 'Base FGL-01: identificamos uma nave gigantesca se aproximando da Terra.' },
    { startAt: 5800, endAt: 9400, text: 'Todos os pilotos em prontidão máxima. Interceptação autorizada.' }
];

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
const levelBoardWrap = document.querySelector('#container_levelGame .wrap');
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

function getRosterPlayerShipPath() {
    const shipId = getCurrentShip() || 'metal';
    // 🛡️ Segurança: Se shipId for inválido ou 'level', força 'metal'
    const validShips = ['metal', 'alien', 'branca', 'fgl', 'hibrida', 'dark', 'preta'];
    const safeShipId = validShips.includes(shipId) ? shipId : 'metal';
    
    return shipId === 'dark'
        ? '../assets/img/nave-player/nave-player-dark.png'
        : `../assets/img/nave-player/nave-${safeShipId}.png`;
}

function clearOpeningAck() {
    if (typeof openingAckCleanup === 'function') {
        openingAckCleanup();
    }
    openingAckCleanup = null;
    openingAwaitingAck = false;
}

function clearOpeningSkipChronicle() {
    if (typeof openingSkipChronicleCleanup === 'function') {
        openingSkipChronicleCleanup();
    }
    openingSkipChronicleCleanup = null;
}

function showLandingBaseOverlay(show, preRender = false) {
    const landingOverlay = document.getElementById('landingBaseOverlay');
    if (!landingOverlay) return;
    // Overlay de base desativado: a zona de pouso é desenhada apenas no canvas.
    landingOverlay.classList.remove('show');
    landingOverlay.classList.remove('prep');
    landingOverlay.classList.add('hidden');
}

function finishOpeningMissionSequence() {
    clearOpeningAck();
    if (openingMissionTimer) {
        clearTimeout(openingMissionTimer);
        openingMissionTimer = null;
    }

    const overlay = document.getElementById('openingMissionOverlay');
    const fadeBlack = document.getElementById('openingFadeBlack');
    const narrationBar = document.getElementById('openingNarrationBar');
    const narrationText = document.getElementById('openingNarrationText');

    if (fadeBlack) {
        fadeBlack.classList.remove('hidden');
        fadeBlack.style.display = 'block';
    }
    if (narrationBar) {
        narrationBar.classList.remove('show');
        narrationBar.classList.add('hidden');
        narrationBar.style.display = 'none';
    }
    if (narrationText) {
        narrationText.textContent = '';
    }

    ['openingPilotRoster', 'openingThreatCard'].forEach((id) => {
        const el = document.getElementById(id);
        if (!el) return;
        el.classList.remove('show');
        el.classList.add('hidden');
    });

    OPENING_SEQUENCE.forEach(({ id }) => {
        const el = document.getElementById(id);
        if (!el) return;
        el.classList.remove('show');
        el.classList.add('hidden');
    });

    clearOpeningSkipChronicle();

    // Transição escurecida antes da base assumir a cena de pouso.
    if (fadeBlack) {
        fadeBlack.classList.add('show');
    }

    setTimeout(() => {
        if (fadeBlack) {
            fadeBlack.classList.remove('show');
            fadeBlack.classList.add('hidden');
        }
        if (overlay) {
            overlay.classList.add('hidden');
            overlay.style.display = 'none';
        }
        // Entra na fase de pouso automático com a base já pré-renderizada para evitar pop visual.
        showLandingBaseOverlay(true, false);
        setOpeningLandingActive(true);
    }, 420);
}

/**
 * Após o pouso na base lunar, escurece a tela e dispara a cutscene da Cena 04.
 */
function triggerPostLandingCutscene() {
    const mainWrapper = document.getElementById('main-wrapper');
    const loadingOverlay = document.getElementById('loadingOverlay');
    const divLevel = document.getElementById('container_levelGame');
    const overlay = document.getElementById('openingMissionOverlay');

    // 🛑 MUSICA: Troca a música da missão pela música da história
    stopBGM();
    playBGM(CUTSCENE_BGM_PATH, 0.65);

    // 1. Ativa o loading imediatamente para esconder o tabuleiro que possa estar por baixo
    if (loadingOverlay) {
        loadingOverlay.classList.remove('hidden');
        loadingOverlay.style.display = 'flex';
    }

    // 2. Esconde o canvas do jogo e a div de missões
    if (mainWrapper) mainWrapper.style.display = 'none';
    if (divLevel) divLevel.style.display = 'none';

    if (overlay) {
        overlay.classList.add('hidden');
        overlay.style.display = 'none';
    }

    setPause(true);

    setTimeout(() => {
        loadCena04Cutscene();
        // Esconde o loading assim que a cutscene começa a carregar (o iframe cobrirá a tela)
        if (loadingOverlay) {
            loadingOverlay.classList.add('hidden');
            loadingOverlay.style.display = 'none';
        }
    }, 1200);
}

/**
 * Carrega historia-cena04.html dentro do iframe de cutscene,
 * segue o mesmo padrão do historia.html existente.
 */
function loadCena04Cutscene() {
    const container = document.getElementById('cutsceneContainer');
    const frame = document.getElementById('historiaFrame');
    if (!container || !frame) return;

    isFinishingCutscene = false; // 🛑 Reseta para permitir o encerramento da cena

    const lang = localStorage.getItem('sf_language') || 'pt-BR';
    const storyUrl = `historia-cena04.html?lang=${encodeURIComponent(lang)}&t=${Date.now()}`;

    frame.src = 'about:blank';
    setTimeout(() => {
        frame.src = storyUrl;
    }, 50);

    container.classList.remove('hidden');
    container.style.display = 'flex';
}

/**
 * Recebe o postMessage do iframe quando a Cena 04 termina e continua o fluxo.
 */
function finishCena04Cutscene() {
    if (isFinishingCutscene) return;
    isFinishingCutscene = true;

    const frame = document.getElementById('historiaFrame');
    if (frame) frame.src = '';

    const cutsceneContainer = document.getElementById('cutsceneContainer');
    if (cutsceneContainer) {
        cutsceneContainer.classList.add('hidden');
        cutsceneContainer.style.display = 'none';
    }

    // Restaura o vídeo de fundo do tabuleiro (que foi escondido na missão 0)
    const levelVideo = document.getElementById('video-background');
    if (levelVideo) levelVideo.style.display = 'block';

    // 🛑 RESTAURA A TELA DE MISSÕES: Tira o display: none e força o flex
    if (divLevel) {
        divLevel.style.display = 'flex';
        divLevel.classList.remove('hidden');
    }
    if (levelBoardWrap) {
        levelBoardWrap.style.display = 'flex';
        levelBoardWrap.classList.remove('hidden');
    }

    updateUI(); // Atualiza XP, Estrelas e os nós das missões no mapa
    playMenuMusic(); // Toca a música do tabuleiro

    // Libera os controles e despausa
    setPause(false);
}

function queueOpeningTimer(callback, delayMs) {
    openingCinematicTimers.push(setTimeout(callback, delayMs));
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
            
            // Garante que o tabuleiro de missões esteja visível e funcional
            if (levelBoardWrap) levelBoardWrap.style.display = 'flex';
            if (divLevel) {
                divLevel.style.display = 'flex';
                divLevel.classList.remove('hidden');
            }
            
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
        shouldAutoStartOpeningMission = true;
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

    isFinishingCutscene = false;

    stopBGM();
    playBGM(CUTSCENE_BGM_PATH, 0.65);

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
    if (e.data === 'historiaCena04Ended') finishCena04Cutscene();
});

function startVideoTimer() { /* legado — substituído pelo iframe */ }


// 🚀 FUNÇÃO CORRIGIDA: Abre o menu de fases após a história
function finishCutscene() {
    if (isFinishingCutscene) return;
    isFinishingCutscene = true;

    stopBGM();

    // Descarrega o iframe para libertar memória
    if (historiaFrame) historiaFrame.src = '';

    // Esconde o container da história e a tela de criação
    cutsceneContainer.classList.add('hidden');
    cutsceneContainer.style.display = '';
    creationOverlay.classList.add('hidden');

    if (shouldAutoStartOpeningMission) {
        shouldAutoStartOpeningMission = false;
        if (divIniciar) divIniciar.style.display = 'none';
        if (divLevel) divLevel.style.display = 'flex';
        if (levelBoardWrap) levelBoardWrap.style.display = 'none';
        loadMission(OPENING_MISSION_ID);
        startGame();
        return;
    }

    playMenuMusic();

    // MOSTRA O MENU DE FASES
    if (startScreen) startScreen.classList.remove('hidden');
    if (divIniciar) divIniciar.style.display = 'none';
    if (divLevel) divLevel.style.display = 'flex';
}

// Atalhos Cutscene
document.getElementById('skipCutscene')?.addEventListener('click', () => {
    // 🛑 CORREÇÃO DO BOTÃO PULAR: Verifica se é a Cena 04 ou a Intro Inicial
    if (historiaFrame && (historiaFrame.src.includes('historia-cena04.html') || historiaFrame.contentWindow.location.href.includes('historia-cena04.html'))) {
        finishCena04Cutscene();
    } else {
        finishCutscene();
    }
});

window.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT') return;
    if (e.key === "Escape") {
        // 1. Se estiver no Intro da Missão 0
        const openingOverlay = document.getElementById('openingMissionOverlay');
        if (openingOverlay && !openingOverlay.classList.contains('hidden')) {
            finishOpeningMissionSequence();
            stopBGM();
            return;
        }

        // 2. Se estiver em uma Cutscene (História)
        if (!cutsceneContainer.classList.contains('hidden')) {
            if (historiaFrame && (historiaFrame.src.includes('historia-cena04.html') || historiaFrame.contentWindow.location.href.includes('historia-cena04.html'))) {
                finishCena04Cutscene();
            } else {
                finishCutscene();
            }
        }
    }
});

// Startup orchestration handled by init.js → tela_logo_video.js

// ======================================================
// 3. CORE DO JOGO (START E INIT)
// ======================================================

export function loadMission(id) {
    const mission = MISSIONS.find(m => m.id === Number(id));
    if (!mission) return;
    CURRENT_MISSION = mission;
    setIsOpeningMission(!!mission.openingScene);
    MULTI_BACKGROUND_IMAGES = [...mission.layers];

    // Configuração de Skins para Missão 1
    let missionEnemySkins = [];
    if (mission.id === 1) {
        missionEnemySkins = [
            // "../assets/img/inimigos/inimigo1.png",
            // "../assets/img/inimigos/inimigo-black.png"
        ];
    }

    // 🛑 CORREÇÃO: Extrair apenas os caminhos das imagens para o preload
    const backgroundPaths = MULTI_BACKGROUND_IMAGES
        .map(layer => layer.path)
        .filter(path => typeof path === 'string');

    // 🌟 Adiciona a estrela de pickup para a missão 0
    const missionIdNum = Number(id);
    const extraAssets = [];
    if (missionIdNum === 0) {
        extraAssets.push("../assets/img/pickup/estrela-marela.png");
    }

    IMAGES_TO_LOAD = [...DEFAULT_IMAGES, ...backgroundPaths, ...missionEnemySkins, ...extraAssets];
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
    setIsOpeningMission(!!CURRENT_MISSION?.openingScene);
    
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

    // 🛑 ESCONDE O VÍDEO DO TABULEIRO SE FOR MISSÃO 0
    const levelVideo = document.getElementById('video-background');
    if (levelVideo) {
        levelVideo.style.display = (CURRENT_MISSION?.id === 0) ? 'none' : 'block';
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

        if (CURRENT_MISSION?.openingScene) {
            startOpeningMissionOverlay();
        } else {
            stopOpeningMissionOverlay();
        }

        const bgVideo = document.getElementById("bgVideo");
        if (bgVideo) bgVideo.play().catch(() => { });

        // 🔇 Garante que o som de tiro pare se a missão não permitir disparos
        if (CURRENT_MISSION?.allowShoot === false) {
            if (typeof stopShootSoundLoop === 'function') stopShootSoundLoop();
        }

        if (CURRENT_MISSION?.allowShoot !== false) {
            setTimeout(() => {
                if (typeof startShootSoundLoop === 'function') startShootSoundLoop();
            }, 2500); // Aguarda a intro da nave terminar (introDuration = 2000ms) + margem
        }

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

function startOpeningMissionOverlay() {
    stopOpeningMissionOverlay();
    setOpeningLandingActive(false);
    showLandingBaseOverlay(true, true);
    openingSkipTriggered = false;

    // Registra callback para disparar cutscene da Cena 04 apos o pouso
    setPostLandingCallback(triggerPostLandingCutscene);

    const overlay = document.getElementById('openingMissionOverlay');
    const mainWrapper = document.getElementById('main-wrapper');
    if (overlay) {
        overlay.classList.remove('hidden');
        overlay.style.display = 'block';
    }
    if (mainWrapper) {
        mainWrapper.classList.add('opening-clean-view');
    }

    const sequenceElements = OPENING_SEQUENCE
        .map(({ id }) => document.getElementById(id))
        .filter(Boolean);
    const fadeBlack = document.getElementById('openingFadeBlack');
    const narrationBar = document.getElementById('openingNarrationBar');
    const narrationText = document.getElementById('openingNarrationText');
    const roster = document.getElementById('openingPilotRoster');
    const threatCard = document.getElementById('openingThreatCard');
    const ackButton = document.getElementById('openingAckButton');
    const pilotOneName = document.getElementById('openingPilotOneName');
    const pilotOneShip = document.getElementById('openingPilotOneShip');
    const pilotTwoShip = document.getElementById('openingPilotTwoShip');
    const playerData = getPlayerData?.() || {};
    const skipChronicleButton = document.getElementById('openingSkipChronicle');
    const skipIntroAllButton = document.getElementById('openingSkipIntroAll');
    const storyChronicle = document.getElementById('openingStoryCrawl');
    const baseCall = document.getElementById('openingBaseCall');
    const scriptText = document.getElementById('openingScriptText');

    sequenceElements.forEach((el) => {
        if (!el) return;
        el.classList.remove('hidden');
        el.classList.remove('show');
    });
    [roster, threatCard].forEach((el) => {
        if (!el) return;
        el.classList.remove('hidden');
        el.classList.remove('show');
    });
    if (fadeBlack) {
        fadeBlack.classList.remove('hidden');
        fadeBlack.classList.remove('show');
    }
    if (narrationBar) {
        narrationBar.classList.remove('hidden');
        narrationBar.classList.remove('show');
    }
    if (narrationText) {
        narrationText.textContent = '';
    }
    if (pilotOneName) {
        pilotOneName.textContent = playerData.pilotName || 'FABIANO FREGNANI';
    }
    if (pilotOneShip) {
        pilotOneShip.src = getRosterPlayerShipPath();
    }
    if (pilotTwoShip) {
        pilotTwoShip.src = '../assets/img/cenarios/cenario-missao/inicio-game/nave-lua.png';
    }
    if (ackButton) {
        ackButton.disabled = true; // 🚫 Desativado conforme solicitado
        ackButton.style.display = 'none'; // 🚫 Escondido para não poluir
    }
    if (skipChronicleButton) {
        skipChronicleButton.classList.remove('hidden');
    }
    clearOpeningAck();
    clearOpeningSkipChronicle();
    if (scriptText) {
        scriptText.textContent = OPENING_CHRONICLE_TEXT;
        // Reinicia a animacao de subida ao iniciar a crônica
        scriptText.style.animation = 'none';
        void scriptText.offsetWidth;
        scriptText.style.animation = '';
    }

    // ⏭️ Lógica de Pular Tudo
    if (skipIntroAllButton) {
        skipIntroAllButton.onclick = () => {
            finishOpeningMissionSequence();
            stopBGM();
        };
    }

    const queueCard = (element, startAt, endAt) => {
        if (!element) return;
        queueOpeningTimer(() => element.classList.add('show'), startAt);
        queueOpeningTimer(() => element.classList.remove('show'), endAt);
    };

    // ⌨️ Função para efeito de digitação
    const startTypewriter = (element, text, speed = 25) => {
        if (!element) return;
        element.textContent = "";
        let i = 0;
        const type = () => {
            if (!element.parentElement) return; // Segurança se o elemento for removido
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
                // Armazena o timeout para poder cancelar se pular a cena
                openingCinematicTimers.push(setTimeout(type, speed));
            }
        };
        type();
    };

    const queueBlackout = (startAt) => {
        if (!fadeBlack) return;
        queueOpeningTimer(() => fadeBlack.classList.add('show'), startAt);
        queueOpeningTimer(() => fadeBlack.classList.remove('show'), startAt + 550);
    };

    const queueSubtitle = ({ startAt, endAt, text }) => {
        if (!narrationBar || !narrationText) return;
        queueOpeningTimer(() => {
            narrationText.textContent = text;
            narrationBar.classList.add('show');
        }, startAt);
        queueOpeningTimer(() => {
            narrationBar.classList.remove('show');
        }, endAt);
    };

    // 📟 Prepara os textos da Capitã para digitação
    const baseCallTitleEl = baseCall?.querySelector('.opening-title');
    const baseCallSubEl = baseCall?.querySelector('.opening-subtitle');

    if (baseCallTitleEl) baseCallTitleEl.textContent = "";
    if (baseCallSubEl) baseCallSubEl.textContent = "";

    // Agenda o início da digitação sincronizado com a aparição do card
    const baseCallStartAt = OPENING_SEQUENCE.find(s => s.id === 'openingBaseCall')?.startAt || 55600;
    
    queueOpeningTimer(() => {
        startTypewriter(baseCallTitleEl, BASE_CALL_TITLE_TEXT, 45); // ⌨️ Digitação mais lenta (Título)
        openingCinematicTimers.push(setTimeout(() => {
            startTypewriter(baseCallSubEl, BASE_CALL_SUBTITLE_TEXT, 55); // ⌨️ Digitação mais lenta (Subtítulo)
        }, 1800)); 
    }, baseCallStartAt + 800); // 800ms após o card começar a aparecer (fade-in)

    const showRosterAndWaitAck = () => {
        if (!roster || !ackButton) return;
        openingAwaitingAck = true;
        roster.classList.add('show');
        if (narrationText) {
            narrationText.textContent = 'Perfis confirmados. Pressione OK para entrar na escuta.';
            narrationBar?.classList.add('show');
        }

        let autoSkipTimer;

        const continueSequence = () => {
            if (!openingAwaitingAck) return;
            if (autoSkipTimer) clearTimeout(autoSkipTimer); // 🛑 Cancela o pulo automático se o jogador interagir
            clearOpeningAck();
            ackButton.disabled = true;
            roster.classList.remove('show');
            narrationBar?.classList.remove('show');

            POST_ACK_BLACKOUTS.forEach((offset) => queueBlackout(offset));
            POST_ACK_SEQUENCE.forEach(({ id, startAt, endAt }) => {
                queueCard(document.getElementById(id), startAt, endAt);
            });
            // 🚫 Legendas removidas para evitar redundância

            openingMissionTimer = setTimeout(finishOpeningMissionSequence, 11200);
        };

        // 🕒 Inicia cronômetro de 15 segundos para avançar automaticamente para a Nave-Mãe
        autoSkipTimer = setTimeout(continueSequence, 15000);

        const onKeyDown = (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                continueSequence();
            }
        };

        ackButton.addEventListener('click', continueSequence);
        window.addEventListener('keydown', onKeyDown);
        openingAckCleanup = () => {
            if (autoSkipTimer) clearTimeout(autoSkipTimer);
            ackButton.removeEventListener('click', continueSequence);
            window.removeEventListener('keydown', onKeyDown);
        };
    };

    const chronicleStart = OPENING_SEQUENCE.find((s) => s.id === 'openingStoryCrawl')?.startAt || 26400;
    const baseCallStart = OPENING_SEQUENCE.find((s) => s.id === 'openingBaseCall')?.startAt || 55600;

    const jumpToBaseCallNow = () => {
        if (openingSkipTriggered) return;
        openingSkipTriggered = true;

        openingCinematicTimers.forEach((timerId) => clearTimeout(timerId));
        openingCinematicTimers = [];
        clearOpeningSkipChronicle();

        if (storyChronicle) {
            storyChronicle.classList.remove('show');
            storyChronicle.classList.add('hidden');
        }
        if (baseCall) {
            baseCall.classList.remove('hidden');
            baseCall.classList.add('show');
        }
        if (fadeBlack) {
            fadeBlack.classList.remove('show');
        }

        // 🚀 Inicia a digitação imediatamente ao pular para esta fase
        if (baseCallTitleEl) baseCallTitleEl.textContent = "";
        if (baseCallSubEl) baseCallSubEl.textContent = "";
        
        startTypewriter(baseCallTitleEl, BASE_CALL_TITLE_TEXT, 45);
        openingCinematicTimers.push(setTimeout(() => {
            startTypewriter(baseCallSubEl, BASE_CALL_SUBTITLE_TEXT, 55);
        }, 1500));

        queueOpeningTimer(() => {
            if (baseCall) baseCall.classList.remove('show');
            narrationBar?.classList.remove('show');
            showRosterAndWaitAck();
        }, 20000); // 🕒 20s de leitura após pular a crônica
    };

    if (skipChronicleButton) {
        const onSkip = () => jumpToBaseCallNow();
        skipChronicleButton.addEventListener('click', onSkip);
        openingSkipChronicleCleanup = () => {
            skipChronicleButton.removeEventListener('click', onSkip);
        };
    }

    OPENING_SEQUENCE.forEach(({ id, startAt, endAt }) => {
        queueCard(document.getElementById(id), startAt, endAt);
    });
    OPENING_BLACKOUTS.forEach(queueBlackout);
    // 🚫 Legendas da crônica removidas (o jogador já lê no card central)
    queueOpeningTimer(showRosterAndWaitAck, 86600); // 🕒 Próxima etapa sincronizada (31s após início da chamada)

    openingMissionTimer = null;
}

function stopOpeningMissionOverlay() {
    if (openingMissionTimer) {
        clearTimeout(openingMissionTimer);
        openingMissionTimer = null;
    }
    openingCinematicTimers.forEach((timerId) => clearTimeout(timerId));
    openingCinematicTimers = [];
    clearOpeningSkipChronicle();
    clearOpeningAck();
    showLandingBaseOverlay(false);
    const mainWrapper = document.getElementById('main-wrapper');
    if (mainWrapper) {
        mainWrapper.classList.remove('opening-clean-view');
    }
    const overlay = document.getElementById('openingMissionOverlay');
    const fadeBlack = document.getElementById('openingFadeBlack');
    const narrationBar = document.getElementById('openingNarrationBar');
    const narrationText = document.getElementById('openingNarrationText');
    if (overlay) {
        overlay.classList.add('hidden');
        overlay.style.display = 'none';
    }
    if (fadeBlack) {
        fadeBlack.classList.remove('show');
        fadeBlack.classList.add('hidden');
        fadeBlack.style.display = 'none';
    }
    if (narrationBar) {
        narrationBar.classList.remove('show');
        narrationBar.classList.add('hidden');
    }
    if (narrationText) {
        narrationText.textContent = '';
    }
    ['openingPilotRoster', 'openingThreatCard'].forEach((id) => {
        const el = document.getElementById(id);
        if (!el) return;
        el.classList.remove('show');
        el.classList.add('hidden');
    });
    OPENING_SEQUENCE.forEach(({ id }) => {
        const el = document.getElementById(id);
        if (!el) return;
        el.classList.remove('show');
        el.classList.add('hidden');
    });
}

export function initGame() {
    const SHIP_WIDTH = 70;
    const SHIP_HEIGHT = 80;

    const shipId  = getCurrentShip() || 'metal';
    const defaultShipImg = shipId === 'dark'
        ? `../assets/img/nave-player/nave-player-dark.png`
        : `../assets/img/nave-player/nave-${shipId}.png`;
    const shipImg = CURRENT_MISSION?.openingScene && CURRENT_MISSION?.openingShipImage
        ? CURRENT_MISSION.openingShipImage
        : defaultShipImg;

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
    // 🛡️ Filtra apenas strings válidas para evitar [object Object]
    const validPaths = paths.filter(p => typeof p === 'string' && p.length > 0);
    return Promise.all(validPaths.map(path => new Promise((resolve) => {
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