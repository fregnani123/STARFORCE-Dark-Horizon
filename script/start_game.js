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
function startGame() {
    // Esconde a tela inicial
    const startScreenDiv = document.getElementById('startScreen');
    if (startScreenDiv) startScreenDiv.classList.add('hidden');

    // Inicia o jogo
    initGame();

    // Música de fundo
    const bgMusic = document.getElementById('bgMusic');
    if (bgMusic) {
        bgMusic.volume = 0.35;
        bgMusic.play();
    }

    // Som do tiro usando Web Audio API
    const shootSoundElement = document.getElementById('shootSound');
    if (shootSoundElement) {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const track = audioCtx.createMediaElementSource(shootSoundElement);
        const gainNode = audioCtx.createGain();
        gainNode.gain.value = 0.1; // controla o volume real (0 a 1)
        track.connect(gainNode).connect(audioCtx.destination);

        setTimeout(() => {
            shootSoundElement.currentTime = 0;
            shootSoundElement.play();
        }, 2000); // espera 2 segundos
    }
}



// Função para disparar o tiro
function shoot() {
    const shootSound = document.getElementById('shootSound');
    if (shootSound) {
        shootSound.currentTime = 0; // Reinicia o som do início
        shootSound.play();          // Toca o tiro
    }
}


// Adiciona o evento ao botão
document.getElementById('startButton').addEventListener('click', startGame);



// --- FUNÇÃO DE INICIALIZAÇÃO (Configuração de objetos) ---
function initGame() {
    // Dimensões da nave usadas no Player.js: width: 100, height: 80
    const SHIP_WIDTH = 80;
    const SHIP_HEIGHT = 85;

    // 0. Cria o Fundo
    gameBackground = new Background(
        "../assets/img/cenarios/cenario.jpg",
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
        "../assets/img/nave-player/nave-player.png",
        2000 
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