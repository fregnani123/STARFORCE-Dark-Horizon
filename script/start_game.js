// Arquivo: script/game.js

// --- Variável de Controle de Áudio ---
let isMusicPlaying = false; 


// --- FUNÇÃO PARA TENTAR TOCAR A MÚSICA ---
function tryPlayMusic() {
    if (isMusicPlaying) return; 
    
    const music = document.getElementById('bgMusic');
    if (music) {
        // Tenta tocar a música.
        music.play()
            .then(() => {
                isMusicPlaying = true; // Sucesso!
                console.log("Música de fundo iniciada.");
            })
            .catch(error => {
                console.log("Falha na reprodução, o navegador bloqueou. Necessita de interação do usuário.", error);
            });
    }
}

// 🚨 FUNÇÃO PRINCIPAL: Inicia o Jogo e a Música após o clique do usuário
function startGame() {
    
    // 🚨 MUDANÇA AQUI: Busca a div com ID 'startScreen' e adiciona a classe 'hidden'
    const startScreenDiv = document.getElementById('startScreen');
    if (startScreenDiv) {
        // Adiciona a classe 'hidden' (que remove a opacidade e desabilita cliques no CSS)
        startScreenDiv.classList.add('hidden'); 
    }
    
    // Tenta iniciar a música
    tryPlayMusic();
    
    // Inicia a lógica principal do jogo
    initGame();
}


// --- FUNÇÃO DE INICIALIZAÇÃO (Configuração de objetos) ---
function initGame() {
    
    // 0. Cria o Fundo
    gameBackground = new Background(
        "../assets/img/cenario.png",
        150,
        CANVAS_WIDTH,
        CANVAS_HEIGHT
    );

    // 1. Cria a nave do jogador
    playerShip = new Player(
        // Posição X: Centraliza a nave
        CANVAS_WIDTH / 2 - (75 / 2), 
        // Posição Y: Coloca a nave a 75px da borda inferior
        CANVAS_HEIGHT - 75, 
        75, // LARGURA
        75, // ALTURA (Igual à largura para não distorcer)
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