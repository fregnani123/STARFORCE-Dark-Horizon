// Arquivo: script/start.js (CORRIGIDO PARA INICIALIZAÇÃO E POSIÇÃO CORRETA)

// --- Variável de Controle de Áudio ---
let isMusicPlaying = false; 


// --- FUNÇÃO PARA TENTAR TOCAR A MÚSICA ---
function tryPlayMusic() {
    if (isMusicPlaying) return; 
    
    const music = document.getElementById('bgMusic');
    if (music) {
        music.play()
            .then(() => {
                isMusicPlaying = true;
                console.log("Música de fundo iniciada.");
            })
            .catch(error => {
                console.log("Falha na reprodução, o navegador bloqueou. Necessita de interação do usuário.", error);
            });
    }
}

// 🚨 FUNÇÃO PRINCIPAL: Inicia o Jogo e a Música após o clique do usuário
function startGame() {
    
    const startScreenDiv = document.getElementById('startScreen');
    if (startScreenDiv) {
        startScreenDiv.classList.add('hidden'); 
    }
    
    tryPlayMusic();
    
    initGame();
}


// --- FUNÇÃO DE INICIALIZAÇÃO (Configuração de objetos) ---
function initGame() {
    // Dimensões da nave usadas no Player.js: width: 100, height: 80
    const SHIP_WIDTH = 100;
    const SHIP_HEIGHT = 80;

    // 0. Cria o Fundo
    gameBackground = new Background(
        "../assets/img/cenario.jpg",
        150,
        CANVAS_WIDTH,
        CANVAS_HEIGHT
    );

    // 1. Cria a nave do jogador
    // 🚨 CORREÇÃO: Usamos a posição final de repouso (80%) para que a ANIMAÇÃO DO PLAYER.JS funcione.
    const playerTargetX = CANVAS_WIDTH / 2 - (SHIP_WIDTH / 2);
    const playerTargetY = CANVAS_HEIGHT * 0.8; 

    playerShip = new Player(
        playerTargetX, 
        playerTargetY, 
        SHIP_WIDTH, 
        SHIP_HEIGHT, 
        "../assets/img/nave.png",
        500 
    );
    
    // 🚨 CORREÇÃO: Inicializa a variável global 'lastTime' para sincronizar o gameLoop
    if (typeof lastTime !== 'undefined') {
        lastTime = performance.now();
    }
    
    // 2. Inicia o loop principal do jogo
    requestAnimationFrame(gameLoop);
}

// 🚨 VINCULAÇÃO: A função startGame() deve ser vinculada ao BOTÃO (startButton)
document.addEventListener('DOMContentLoaded', () => {
    const startButton = document.getElementById('startButton');
    if (startButton) {
        startButton.addEventListener('click', startGame);
    }
});