// ======================================================
// IMPORTS OBRIGATÓRIOS
// ======================================================
import { CONFIG, NODE_IMAGES, getMissionNamesByLanguage } from './missao_construtor.js'; 
import { loadMission, startGame } from '../start_game.js'; // Funções para iniciar a missão
import {openCustomizeHull,closeDiv} from './customize.js';
import { getPlayerData, updateMissionProgress, getCurrentShip } from '../saveSystem.js';
// NOTA: O console.error no topo do código original deve ser movido para a função de inicialização.


// ======================================================
// VARIÁVEIS DE ESTADO DO DESIGNER DE NÍVEL
// ======================================================
// Elementos DOM (serão definidos após DOMContentLoaded)
let nodesEl;
let fillEl;
let playerEl;
let nextBtn;
let resetBtn;
let boardEl;

const INFO_PANEL_PADDING_BOTTOM = 30; 

// Estado de progresso
let current = 1; // Nó atual (1-based)
let completedNodes = Array(CONFIG.nodes).fill(false); // Array de booleanos (0-based)
let missionNames = getMissionNamesByLanguage(localStorage.getItem('sf_language') || 'pt-BR');

const LEVEL_UI_TEXT = {
    'pt-BR': {
        menu: 'Menu',
        pilot: 'Piloto:',
        subtitle: 'Tabuleiro vertical — evolução de fases',
        firstMission: 'PRIMEIRA MISSÃO',
        advance: 'Avançar',
        customize: 'CUSTOMIZE HULL',
        upgrade: 'UPGRADE SHIP',
        level: 'Nível:',
        checkpoints: 'Checkpoints:',
        stars: '⭐ Estrelas:',
        playerTitle: 'Você'
    },
    en: {
        menu: 'Menu',
        pilot: 'Pilot:',
        subtitle: 'Vertical board — mission progression',
        firstMission: 'FIRST MISSION',
        advance: 'Advance',
        customize: 'CUSTOMIZE HULL',
        upgrade: 'UPGRADE SHIP',
        level: 'Level:',
        checkpoints: 'Checkpoints:',
        stars: '⭐ Stars:',
        playerTitle: 'You'
    },
    es: {
        menu: 'Menu',
        pilot: 'Piloto:',
        subtitle: 'Tablero vertical — progresión de fases',
        firstMission: 'PRIMERA MISIÓN',
        advance: 'Avanzar',
        customize: 'PERSONALIZAR CASCO',
        upgrade: 'MEJORAR NAVE',
        level: 'Nivel:',
        checkpoints: 'Puntos de control:',
        stars: '⭐ Estrellas:',
        playerTitle: 'Tú'
    }
};

function normalizeLanguage(lang) {
    if (!lang) return 'pt-BR';
    if (lang.toLowerCase().startsWith('pt')) return 'pt-BR';
    if (lang.toLowerCase().startsWith('es')) return 'es';
    return 'en';
}

function applyLevelLanguage(lang) {
    const key = normalizeLanguage(lang);
    const t = LEVEL_UI_TEXT[key] || LEVEL_UI_TEXT['pt-BR'];

    const menuBtn = document.getElementById('menuBtnFases');
    if (menuBtn) menuBtn.textContent = t.menu;

    const titleEl = document.querySelector('#container_levelGame .header .title');
    const pilotEl = document.getElementById('pilotNameDisplay');
    if (titleEl) {
        const pilotName = pilotEl ? pilotEl.textContent : '---';
        titleEl.innerHTML = `${t.pilot} <span id="pilotNameDisplay">${pilotName}</span>`;
    }

    const subtitleEl = document.querySelector('#container_levelGame .header .subtitle');
    if (subtitleEl) subtitleEl.textContent = t.subtitle;

    const reset = document.getElementById('resetBtn');
    if (reset) reset.textContent = t.firstMission;

    const next = document.getElementById('nextBtn');
    if (next) next.textContent = t.advance;

    const customizeLabel = document.querySelector('#btn_customize_open span');
    if (customizeLabel) customizeLabel.textContent = t.customize;

    const upgradeLabel = document.querySelector('#btn-upgrade-open span');
    if (upgradeLabel) upgradeLabel.textContent = t.upgrade;

    const lvlEl = document.getElementById('lvl');
    if (lvlEl && lvlEl.parentElement) {
        lvlEl.parentElement.innerHTML = `${t.level} <strong id="lvl">${lvlEl.textContent}</strong>`;
    }

    const cpEl = document.getElementById('cp');
    if (cpEl && cpEl.parentElement) {
        cpEl.parentElement.innerHTML = `${t.checkpoints} <strong id="cp">${cpEl.textContent}</strong>`;
    }

    const starsEl = document.getElementById('starCountMissions');
    if (starsEl && starsEl.parentElement) {
        starsEl.parentElement.innerHTML = `${t.stars} <strong id="starCountMissions">${starsEl.textContent}</strong>`;
    }

    const playerMarker = document.getElementById('player');
    if (playerMarker) playerMarker.title = t.playerTitle;
}


// =======================
// FUNÇÕES PRINCIPAIS (EXPORTADAS)
// =======================

/**
 * Constrói todos os nodes visuais do tabuleiro.
 * @param {number} n - Número de nodes a construir.
 */
function buildNodes(n){
    nodesEl.innerHTML = '';

    for(let i=1; i<=n; i++){
        const node = document.createElement('div');
        node.className = 'node';
        node.dataset.index = i;
        
        const arrayIndex = i - 1; 
        
        node.innerHTML = `<div class='label'>${missionNames[arrayIndex] || ''}</div>`;
        
        // Define a imagem de fundo via JavaScript
        if (NODE_IMAGES[arrayIndex]) {
            node.style.backgroundImage = `url('${NODE_IMAGES[arrayIndex]}')`;
        }
        
        // Ação de click: verifica se está bloqueado antes de agir
        node.addEventListener('click', ()=> {
            // Bloqueia interação em nós futuros não desbloqueados
            if (i > 1 && !completedNodes[i - 2] && i !== current) return;

            if (i === current) {
                loadMission(i);
                startGame();
            }
            goTo(i);
        });

        nodesEl.appendChild(node);
    }

    updateUI();
}

/**
 * Atualiza classes CSS, altura do fill, posição do player e scroll da tela.
 */
export function updateUI() {
    if(!nodesEl) return;
    const allNodes = Array.from(nodesEl.children);
    if(allNodes.length === 0) return;

    // --- 1. Dimensões e espaçamento ---
    const gapValue = parseInt(getComputedStyle(nodesEl).gap) || 0;
    const nodeSpacing = allNodes[0].offsetHeight + gapValue; 
    
    // --- 2. Atualiza estilos (completed, current, locked) ---
    allNodes.forEach((n, idx) => {
        const nodeIndex = idx + 1;

        n.classList.remove('current', 'pulse', 'locked'); 

        if(completedNodes[idx]) {
             n.classList.add('completed');
        } else {
            n.classList.remove('completed');
        }
        
        // Nó Atual
        if(nodeIndex === current) {
            n.classList.add('current', 'pulse');
        } 
        
        // Nó Bloqueado
        if (nodeIndex > 1 && !completedNodes[idx - 1] && nodeIndex !== current) {
            n.classList.add('locked');
        }
    });
    
    // --- 3. Altura do FILL ---
    const fillHeight = (current - 1) * nodeSpacing;
    fillEl.style.height = `${fillHeight}px`;

    // --- 4. Posiciona o PLAYER e atualiza imagem da nave selecionada ---
    const playerCenterY = INFO_PANEL_PADDING_BOTTOM + (allNodes[0].offsetHeight / 4);
    const playerBottom = playerCenterY + ((current - 1) * nodeSpacing);
    playerEl.style.bottom = `${playerBottom}px`;

    const shipId = getCurrentShip() || 'metal';
    // 🛡️ Fallback para evitar erro 'nave-level.png'
    const validShips = ['metal', 'alien', 'branca', 'fgl', 'hibrida', 'dark', 'preta'];
    const safeShipId = validShips.includes(shipId) ? shipId : 'metal';

    const shipImgPath = safeShipId === 'dark'
        ? '../assets/img/nave-player/nave-player-dark.png'
        : `../assets/img/nave-player/nave-${safeShipId}.png`;
        
    const playerImg = playerEl.querySelector('img');
    if (playerImg && playerImg.src !== shipImgPath) {
        playerImg.src = shipImgPath;
    }


    // --- 5. Scroll automático ---
    // Calcula a posição do nó atual
    const nodeCenterFromTop = nodesEl.scrollHeight - playerBottom;
    const scrollTopTarget = nodeCenterFromTop - (boardEl.clientHeight / 2);
    boardEl.scrollTo({ top: scrollTopTarget, behavior: 'smooth' });


    // --- 6. Atualiza painel de info (HUD) ---
    document.getElementById('lvl').textContent = Math.floor(current / 2) + 1;
    const xp = (current % 2) * 50;
    document.getElementById('xp').textContent = `${xp}/100`;
    document.getElementById('cp').textContent = completedNodes.filter(c => c).length;

    // --- 7. Atualiza o nome do piloto ---
    const data = getPlayerData();
    if (data && data.pilotName) {
        document.getElementById('pilotNameDisplay').textContent = data.pilotName;
    }

    // --- 8. Atualiza o contador de estrelas global na tela de missões ---
    const starDisplay = document.getElementById('starCountMissions');
    if (starDisplay && data) {
        starDisplay.textContent = data.totalStars;
    }
}

/**
 * Move o player para um nó específico (se for válido).
 * @param {number} step - Nó de destino (1-based).
 */
function goTo(step){
    if(step < 1) step = 1;
    if(step > CONFIG.nodes) step = CONFIG.nodes;

    // Permite navegar para trás (sem restrição)
    if (step < current) {
        current = step;
        updateUI();
        return;
    }
    
    // Bloqueia avançar se o nó anterior não estiver concluído
    if (step > 1 && !completedNodes[step - 2]) {
        return;
    }

    current = step;
    updateUI();
}

/**
 * Marca a fase atual como concluída e avança para a próxima (Chamada após a vitória).
 */
export async function completeCurrentNode() { // Make it async
    if (current > CONFIG.nodes) return; 
    
    completedNodes[current - 1] = true;
    const nextLevel = current + 1;
    await updateMissionProgress(nextLevel); // Await the update
    goTo(nextLevel);
}


// =======================
// LÓGICA DE DRAG SCROLL (Mantida e encapsulada)
// =======================
let isDown = false;
let startY;
let scrollTopPos;

const setupDragScroll = () => {
    const handleDown = (e) => {
        const target = (e.touches ? e.touches[0].target : e.target);
        // Não inicia o drag se o clique/toque for em um nó (para permitir a seleção de missão)
        if (target && target.closest && target.closest('.node')) return; 

        isDown = true;
        const pageY = e.touches ? e.touches[0].pageY : e.pageY;
        startY = pageY - boardEl.offsetTop;
        scrollTopPos = boardEl.scrollTop;
        boardEl.style.cursor = 'grabbing';
    };

    const handleUp = () => {
        isDown = false;
        boardEl.style.cursor = 'grab';
    };

    const handleMove = (e) => {
        if(!isDown) return;
        e.preventDefault();
        const pageY = e.touches ? e.touches[0].pageY : e.pageY;
        const y = pageY - boardEl.offsetTop;
        const walk = (startY - y);
        boardEl.scrollTop = scrollTopPos + walk;
    };

    // Anexação de Eventos
    boardEl.addEventListener('mousedown', handleDown);
    boardEl.addEventListener('mouseup', handleUp);
    boardEl.addEventListener('mouseleave', handleUp);
    boardEl.addEventListener('mousemove', handleMove);

    boardEl.addEventListener('touchstart', handleDown);
    boardEl.addEventListener('touchend', handleUp);
    boardEl.addEventListener('touchcancel', handleUp);
    boardEl.addEventListener('touchmove', handleMove, { passive: false });

    boardEl.style.cursor = 'grab';
}


// ======================================================
// FUNÇÃO DE INICIALIZAÇÃO (CHAMADA NO DOMContentLoaded)
// ======================================================
/**
 * Configura o designer de níveis, carrega os elementos DOM e anexa listeners.
 */
export function initLevelDesigner() {
    // 1. Verifica consistência dos dados (usando CONFIG importado)
    if (NODE_IMAGES.length !== CONFIG.nodes) {
        console.error(`O array NODE_IMAGES deve conter ${CONFIG.nodes} imagens.`);
    }
    if (missionNames.length !== CONFIG.nodes) {
        console.error(`O array de nomes de fases deve conter ${CONFIG.nodes} itens.`);
    }
    
    // 2. Captura elementos DOM
    nodesEl = document.getElementById('nodes');
    fillEl = document.getElementById('fill');
    playerEl = document.getElementById('player');
    nextBtn = document.getElementById('nextBtn');
    resetBtn = document.getElementById('resetBtn');
    boardEl = document.getElementById('board');
    
    if (!nodesEl || !fillEl || !playerEl || !nextBtn || !resetBtn || !boardEl) {
        console.error("ERRO: Elementos do Level Designer não encontrados no DOM.");
        return;
    }

    // Sincroniza estado interno com o progresso salvo
    const data = getPlayerData();
    if (data && data.pilotName !== "") {
        current = data.currentMission || 1;
        completedNodes = completedNodes.map((_, idx) => (idx + 1) < current);
    }

    // 3. Constrói a UI
    missionNames = getMissionNamesByLanguage(localStorage.getItem('sf_language') || 'pt-BR');
    buildNodes(CONFIG.nodes);
    applyLevelLanguage(localStorage.getItem('sf_language') || 'pt-BR');
    
    // 4. Anexa Listeners de Ação
    nextBtn.addEventListener('click', completeCurrentNode);
    resetBtn.addEventListener('click', () => {
        completedNodes.fill(false);
        current = 1;
        updateUI();
    });

    // Botão Menu - Volta para menu inicial
    const menuBtn = document.getElementById('menuBtnFases');
    if (menuBtn) {
        menuBtn.addEventListener('click', () => {
            // Parar música do jogo se estiver tocando
            const bgVideo = document.getElementById('bgVideo');
            if (bgVideo) bgVideo.pause();
            
            // Parar vídeo de background do jogo
            const videoBackground = document.getElementById('video-background');
            if (videoBackground) videoBackground.pause();
            
            // Esconder tela de missões
            const levelContainer = document.getElementById('container_levelGame');
            if (levelContainer) levelContainer.style.display = 'none';
            
            // Mostrar menu inicial
            const divIndex = document.getElementById('div-index');
            if (divIndex) divIndex.style.display = 'flex';
            
            // Parar vídeo do menu se ele estiver tocando (pode estar pausado)
            const videoFundo = document.getElementById('video-fundo');
            if (videoFundo) {
                videoFundo.currentTime = 0; // Reinicia do começo
            }
            
            // Retomar música do menu
            if (typeof window.playBGM === 'function') {
                window.playBGM('../assets/audio/musicaGameUS.mp3', 1);
            }
        });
    }

    // 5. Configura o scroll por arrasto
    setupDragScroll();
    
    // 6. Atualiza o estado inicial
    updateUI();

    window.addEventListener('sf-language-changed', (e) => {
        const lang = e.detail || localStorage.getItem('sf_language') || 'pt-BR';
        missionNames = getMissionNamesByLanguage(lang);
        buildNodes(CONFIG.nodes);
        applyLevelLanguage(lang);
    });
}