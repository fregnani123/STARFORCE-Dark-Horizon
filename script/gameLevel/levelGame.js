const CONFIG = {
    nodes: 15
};

// 1. Array com os caminhos das 15 imagens (Substitua pelos caminhos reais das suas 15 imagens)
const NODE_IMAGES = [
    '../assets/img/cenario-start/planeta_terra.png', 
    '../assets/img/cenario-start/planeta_terra.png', 
    '../assets/img/cenario-start/planeta_terra.png', 
    '../assets/img/cenario-start/planeta_terra.png', 
    '../assets/img/cenario-start/planeta_terra.png', 
    '../assets/img/cenario-start/planeta_terra.png', 
    '../assets/img/cenario-start/planeta_terra.png', 
    '../assets/img/cenario-start/planeta_terra.png', 
    '../assets/img/cenario-start/planeta_terra.png', 
    '../assets/img/cenario-start/planeta_terra.png', 
    '../assets/img/cenario-start/planeta_terra.png', 
    '../assets/img/cenario-start/planeta_terra.png', 
    '../assets/img/cenario-start/planeta_terra.png', 
    '../assets/img/cenario-start/planeta_terra.png', 
    '../assets/img/cenario-start/planeta_terra.png', 
   
];

const NOME_FASES = [
    'Área 51', // Índice 0
    'Lua de Mel', 
    'Marte Vermelho', 
    'Júpiter Caótico', 
    'Anéis de Saturno', 
    'Urano Gelado', 
    'Netuno Azul', 
    'Cinturão de Asteroides', 
    'Nebulosa', 
    'Buraco Negro', 
    'Estação Espacial', 
    'Cometa Viajante', 
    'Galáxia Andrômeda', 
    'Planeta X', 
    'Universo Infinito', // Índice 14 (Total de 15 fases)
];

// Verifica se o número de itens corresponde ao CONFIG.nodes
if (NODE_IMAGES.length !== CONFIG.nodes) {
    console.error(`O array NODE_IMAGES deve conter ${CONFIG.nodes} imagens.`);
}
// CORREÇÃO: Verifica o NOME_FASES também
if (NOME_FASES.length !== CONFIG.nodes) {
    console.error(`O array NOME_FASES deve conter ${CONFIG.nodes} nomes de fases.`);
}


const nodesEl = document.getElementById('nodes');
const fillEl = document.getElementById('fill');
const playerEl = document.getElementById('player');
const nextBtn = document.getElementById('nextBtn');
const resetBtn = document.getElementById('resetBtn');
const boardEl = document.getElementById('board');
const INFO_PANEL_PADDING_BOTTOM = 30; 

// Começa na primeira fase
let current = 1;

// Lista para controlar quais fases foram concluídas
let completedNodes = Array(CONFIG.nodes).fill(false);

// Inicializa nós
buildNodes(CONFIG.nodes);

// =======================
// Funções principais
// =======================

function buildNodes(n){
    nodesEl.innerHTML = '';

    for(let i=1; i<=n; i++){
        const node = document.createElement('div');
        node.className = 'node';
        node.dataset.index = i;
        
        // CHAVE DE CORREÇÃO: Usa 'i - 1' para acessar o array (índice 0)
        const arrayIndex = i - 1; 
        
        // Define o índice (i) e usa o arrayIndex para buscar o nome da fase.
        node.innerHTML = `<div class='label'>${NOME_FASES[arrayIndex]}</div>`;
        
        // --- Define a imagem de fundo via JavaScript ---
        if (NODE_IMAGES[arrayIndex]) {
            node.style.backgroundImage = `url('${NODE_IMAGES[arrayIndex]}')`;
        }
        
        // Ação de click é apenas para ir para o nó (se permitido)
        node.addEventListener('click', ()=> goTo(i));

        nodesEl.appendChild(node);
    }

    updateUI();
}

function updateUI() {
    const allNodes = Array.from(nodesEl.children);
    if(allNodes.length === 0) return;

    // --- 1. Determina as dimensões e espaçamento ---
    const gapValue = parseInt(getComputedStyle(nodesEl).gap) || 0;
    const nodeSpacing = allNodes[0].offsetHeight + gapValue; 
    
    // --- 2. Atualiza os estilos dos nós (completed, current, locked) ---
    allNodes.forEach((n, idx) => {
        const nodeIndex = idx + 1;

        n.classList.remove('current', 'pulse', 'locked'); 

        if(completedNodes[idx]) {
             n.classList.add('completed');
        } else {
             n.classList.remove('completed');
        }
        
        // Nó Atual (vermelho)
        if(nodeIndex === current) {
            n.classList.add('current', 'pulse');
        } 
        
        // Nó Bloqueado (cinza)
        if (nodeIndex > 1 && !completedNodes[idx - 1] && nodeIndex !== current) {
            n.classList.add('locked');
        }
    });
    
    // --- 3. Atualiza a altura do FILL ---
    const fillHeight = (current - 1) * nodeSpacing;
    fillEl.style.height = `${fillHeight}px`;

    // --- 4. Posiciona o PLAYER ---
    const playerCenterY = INFO_PANEL_PADDING_BOTTOM + (allNodes[0].offsetHeight / 1.3);
    const playerBottom = playerCenterY + ((current - 1) * nodeSpacing);
    playerEl.style.bottom = `${playerBottom}px`;


    // --- 5. Scroll automático ---
    const currentNode = allNodes[current - 1];
    const nodeCenterFromTop = nodesEl.scrollHeight - playerBottom;
    const scrollTopTarget = nodeCenterFromTop - (boardEl.clientHeight / 2);
    boardEl.scrollTo({ top: scrollTopTarget, behavior: 'smooth' });


    // --- 6. Atualiza painel de info ---
    document.getElementById('lvl').textContent = Math.floor(current / 2) + 1;
    const xp = (current % 2) * 50;
    document.getElementById('xp').textContent = `${xp}/100`;
    document.getElementById('cp').textContent = completedNodes.filter(c => c).length;
}

// =======================
// Função de navegação
// =======================
function goTo(step){
    if(step < 1) step = 1;
    if(step > CONFIG.nodes) step = CONFIG.nodes;

    // Permite navegar para trás (se a fase atual for maior que a fase de destino)
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

// Marca a fase atual como concluída e avança
function completeCurrentNode() {
    if (current > CONFIG.nodes) return; 
    
    completedNodes[current - 1] = true;
    goTo(current + 1);
}

// =======================
// Botões e Eventos (sem alterações)
// =======================
nextBtn.addEventListener('click', completeCurrentNode);
resetBtn.addEventListener('click', () => {
    completedNodes.fill(false);
    current = 1;
    updateUI();
});

// =======================
// Drag scroll (Mouse e Touch) (sem alterações)
// =======================
let isDown = false;
let startY;
let scrollTopPos;

const handleDown = (e) => {
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

// Mouse events
boardEl.addEventListener('mousedown', handleDown);
boardEl.addEventListener('mouseup', handleUp);
boardEl.addEventListener('mouseleave', handleUp);
boardEl.addEventListener('mousemove', handleMove);

// Touch events (para mobile)
boardEl.addEventListener('touchstart', handleDown);
boardEl.addEventListener('touchend', handleUp);
boardEl.addEventListener('touchcancel', handleUp);
boardEl.addEventListener('touchmove', handleMove);

// Cursor inicial
boardEl.style.cursor = 'grab';




const menuBtnFases = document.getElementById("menuBtnFases");

menuBtnFases.addEventListener('click', () => {
    // Substitua 'mapaFases.html' pelo nome exato do arquivo HTML de destino.
    window.location.href = 'index.html';
});