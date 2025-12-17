// ======================================================
// IMPORTS OBRIGATÓRIOS
// ======================================================
import { CONFIG, NODE_IMAGES, NOME_FASES } from './missao_construtor.js'; 
import { loadMission, startGame } from '../start_game/start_game.js'; // Funções para iniciar a missão
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
        
        node.innerHTML = `<div class='label'>${NOME_FASES[arrayIndex]}</div>`;
        
        // Define a imagem de fundo via JavaScript
        if (NODE_IMAGES[arrayIndex]) {
            node.style.backgroundImage = `url('${NODE_IMAGES[arrayIndex]}')`;
        }
        
        // Ação de click: tenta navegar e, se for o nó atual/próximo, inicia a missão
        node.addEventListener('click', ()=> {
            if (i === current) {
                // Se clicar no nó atual (ou no próximo, se permitido), inicia a missão
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

    // --- 4. Posiciona o PLAYER ---
    const playerCenterY = INFO_PANEL_PADDING_BOTTOM + (allNodes[0].offsetHeight / 4);
    const playerBottom = playerCenterY + ((current - 1) * nodeSpacing);
    playerEl.style.bottom = `${playerBottom}px`;


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
export function completeCurrentNode() {
    if (current > CONFIG.nodes) return; 
    
    completedNodes[current - 1] = true;
    goTo(current + 1);
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
    if (NOME_FASES.length !== CONFIG.nodes) {
        console.error(`O array NOME_FASES deve conter ${CONFIG.nodes} nomes de fases.`);
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

    // 3. Constrói a UI
    buildNodes(CONFIG.nodes);
    
    // 4. Anexa Listeners de Ação
    nextBtn.addEventListener('click', completeCurrentNode);
    resetBtn.addEventListener('click', () => {
        completedNodes.fill(false);
        current = 1;
        updateUI();
    });

    // 5. Configura o scroll por arrasto
    setupDragScroll();
    
    // 6. Atualiza o estado inicial
    updateUI();
}