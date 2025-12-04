// Arquivo: script/start.js (CORRIGIDO PARA TEMPO MÍNIMO DE ANIMAÇÃO)

// ----------------------------------------------------------------------
// Variáveis Globais (Assumidas - Devem ser definidas em um escopo global)
// ----------------------------------------------------------------------


// --- LISTA DE RECURSOS PARA PRÉ-CARREGAMENTO ---
const IMAGES_TO_LOAD = [
    "../assets/img/cenarios/cenario.jpg", 
    "../assets/img/nave-player/nave-player.png",
    // Adicione aqui todos os assets visuais críticos (inimigos, UI, etc.)
];

// 🚨 NOVO: Tempo mínimo que a tela de loading deve aparecer (em milissegundos)
const MIN_LOADING_TIME_MS = 1500; // 1.5 segundos


// --- PRÉ-CARREGAMENTO DE IMAGENS (Promise) ---
function preloadImages(imagePaths) {
    console.log("Iniciando pré-carregamento de recursos críticos...");
    const promises = imagePaths.map(path => new Promise((resolve, reject) => {
        const img = new Image();
        img.src = path;
        img.onload = () => resolve(img);
        img.onerror = () => {
            console.error("Falha ao carregar imagem:", path);
            reject(new Error(`Falha ao carregar ${path}`));
        };
    }));
    return Promise.all(promises);
}


// --- Variável de Controle de Áudio ---
let isMusicPlaying = false; 

// --- FUNÇÃO PARA TENTAR TOCAR A MÚSICA (Mantida por consistência) ---
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


// --- FUNÇÃO PRINCIPAL: INICIAR O JOGO APÓS PRÉ-CARREGAMENTO ---
function startGame() {
    const startScreenDiv = document.getElementById('startScreen');
    const loadingOverlay = document.getElementById('loadingOverlay');

    // 1. Esconde a tela inicial
    if (startScreenDiv) startScreenDiv.classList.add('hidden');

    // 2. MOSTRA O LOADING IMEDIATAMENTE e força a renderização para Electron
    if (loadingOverlay) {
        loadingOverlay.classList.remove('hidden');
        // Mantém a correção para forçar o render no Electron
        void loadingOverlay.offsetWidth; 
    }

    // MÚSICA: Inicia a música de fundo
    const bgMusic = document.getElementById('bgMusic');
    if (bgMusic) {
        bgMusic.volume = 0.35;
        bgMusic.play().catch(e => console.log("Música iniciada."));
        isMusicPlaying = true;
    }

    // 3. 🚨 NOVO: Cria a promessa de tempo mínimo
    const minTimePromise = new Promise(resolve => {
        // Resolve a promessa APENAS após o tempo mínimo
        setTimeout(resolve, MIN_LOADING_TIME_MS);
    });

    // 4. Promessa de carregamento real
    const preloadPromise = preloadImages(IMAGES_TO_LOAD);

    // 5. Espera que AMBAS as promessas sejam resolvidas
    Promise.all([preloadPromise, minTimePromise])
        .then(() => {
            console.log("Tempo mínimo atingido e pré-carregamento concluído. Iniciando o jogo...");
            
            // ESCONDE O LOADING após o carregamento e tempo mínimo
            if (loadingOverlay) loadingOverlay.classList.add('hidden');
            
            // Inicia o jogo
            initGame();

            // Configuração do som do tiro
            const shootSoundElement = document.getElementById('shootSound');
            if (shootSoundElement) {
                const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                const track = audioCtx.createMediaElementSource(shootSoundElement);
                const gainNode = audioCtx.createGain();
                gainNode.gain.value = 0.07; 
                track.connect(gainNode).connect(audioCtx.destination);

                setTimeout(() => {
                    shootSoundElement.currentTime = 0;
                    shootSoundElement.play();
                }, 2000); 
            }
        })
        .catch(error => {
            // Garante que o loading seja escondido mesmo em caso de erro
            if (loadingOverlay) loadingOverlay.classList.add('hidden'); 
            console.error("Erro fatal ao carregar recursos. O jogo não pode iniciar.", error);
            alert("Erro ao carregar arquivos do jogo. Verifique o console.");
        });
}

// Função para disparar o tiro
function shoot() {
    const shootSound = document.getElementById('shootSound');
    if (shootSound) {
        shootSound.currentTime = 0; // Reinicia o som do início
        shootSound.play();          // Toca o tiro
    }
}


// --- FUNÇÃO DE INICIALIZAÇÃO (Configuração de objetos) ---
function initGame() {
    // Dimensões da nave usadas no Player.js: width: 100, height: 80
    const SHIP_WIDTH = 90;
    const SHIP_HEIGHT = 65;
    
    // Posição FINAL de repouso (80%)
    const playerTargetX = CANVAS_WIDTH / 2 - (SHIP_WIDTH / 2);
    const playerTargetY = CANVAS_HEIGHT * 0.8; 
    
    // Posição INICIAL (fora da tela, para a animação de introdução)
    const playerStartX = playerTargetX;
    const playerStartY = -SHIP_HEIGHT; // Começa acima da tela

    // 0. Cria o Fundo
    gameBackground = new Background(
        "../assets/img/cenarios/cenario.jpg",
        150, // Velocidade de scroll (exemplo)
        CANVAS_WIDTH,
        CANVAS_HEIGHT
    );

    // 1. Cria a nave do jogador
    playerShip = new Player(
        playerStartX, // Ponto de partida fora da tela
        playerStartY, // Ponto de partida fora da tela
        SHIP_WIDTH, 
        SHIP_HEIGHT, 
        "../assets/img/nave-player/nave-player.png",
        2000 
    );
    
    // Inicializa a variável global 'lastTime' para sincronizar o gameLoop
    if (typeof lastTime !== 'undefined') {
        lastTime = performance.now();
    }
    
    // 2. Inicia o loop principal do jogo
    requestAnimationFrame(gameLoop);
}


// --- VINCULAÇÃO DE EVENTOS (Listener) ---

document.addEventListener('DOMContentLoaded', () => {
    const startButton = document.getElementById('startButton');
    if (startButton) {
        startButton.addEventListener('click', startGame);
    }
    
    // Vínculo do botão de pausa (Onde `togglePause` está definido)
    const btnPause = document.getElementById('pauseButton');
    if (btnPause) {
        btnPause.addEventListener('click', togglePause);
    }
});


// --- FUNÇÃO PARA PAUSAR/RETOMAR O JOGO ---
function togglePause() {
    // Só permite pausar/retomar se a nave não estiver na introdução
    if (playerShip && !playerShip.inIntro) { 
        isPaused = !isPaused; // Inverte o estado
        
        // Obtém os elementos necessários
        const pauseOverlay = document.getElementById('pauseOverlay');
        const pauseButton = document.getElementById('pauseButton'); 
        
        if (pauseOverlay) {
            if (isPaused) {
                // === PAUSANDO O JOGO ===
                pauseOverlay.classList.remove('hidden');
                
                if (pauseButton) {
                    pauseButton.classList.add('hidden'); 
                }
                
                console.log("Jogo Pausado.");
            } else {
                // === RETOMANDO O JOGO ===
                lastTime = performance.now(); 
                pauseOverlay.classList.add('hidden');
                
                if (pauseButton) {
                    pauseButton.classList.remove('hidden'); 
                }
                
                console.log("Jogo Retomado.");
                
                requestAnimationFrame(gameLoop); 
            }
        } else {
            console.log(isPaused ? "Jogo Pausado." : "Jogo Retomado.");
        }
    }
}