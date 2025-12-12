// ======================================================
// FUNÇÕES DE ÁUDIO (Mantidas)
// ======================================================

// Variáveis Globais (currentBGM e isMusicPlaying devem ser declaradas globalmente)
let currentBGM = null;
let isMusicPlaying = false; 

function playBGM(musicPath, volume = 1) {
    // 1. Parar e Limpar a Música Anterior
    if (currentBGM) {
        currentBGM.pause();
        currentBGM.currentTime = 0;
    }
    
    // 2. Criar e Configurar a Nova Música (musicPath AGORA É UMA STRING VÁLIDA)
    currentBGM = new Audio(musicPath);
    currentBGM.volume = volume;
    currentBGM.loop = true;
    isMusicPlaying = true;
    
    // 3. Tentar Reproduzir
    currentBGM.play()
        .then(() => {
            console.log(`Música de fundo iniciada: ${musicPath}`);
        })
        .catch(e => {
            console.warn(`Falha no Autoplay para ${musicPath}:`, e.message);
            isMusicPlaying = false;
        });
}


// ---------------------------------------------
// FUNÇÃO PARA PARAR TODAS AS MÚSICAS
// ---------------------------------------------
function stopBGM() {
    if (currentBGM) {
        currentBGM.pause();
        currentBGM.currentTime = 0;
        isMusicPlaying = false;
        currentBGM = null; // Limpa a referência
        console.log("Música de fundo parada.");
    }
}

// Função para tocar som da moeda
function playCoinSound() {
    const sound = new Audio("../assets/audio/moeda.mp3"); // nova instância sempre
    sound.volume = 1;
    sound.play().catch(() => { }); // evita erro se som bloqueado
}



// ---------------------------------------------
// SOM DE EXPLOSÃO DE NAVE 
// ---------------------------------------------
function playExplosionSound() {
    const sound = new Audio("../assets/audio/explosion-inimigo.mp3"); // nova instância
    sound.volume = 1;
    sound.play().catch(() => { }); // evita erro se bloqueado pelo navegador
}


// ---------------------------------------------
// SOM TIRO NAVE PLAYER (O volume 1 está correto)
// ---------------------------------------------
function shootSoundPlay() {
    // Cria uma nova instância de áudio
    const shootSound = new Audio("../assets/audio/laser3.mp3"); 
    
    // Define a propriedade loop como true
    shootSound.loop = true; 
    
    // Define a velocidade de reprodução
    // 1.5 significa 150% da velocidade normal (mais rápido e com pitch mais alto)
    shootSound.playbackRate = 1.6; 
    
    // Define o volume
    shootSound.volume = 0.06; 
    
    // Inicia a reprodução. O som continuará tocando e repetindo mais rápido.
    shootSound.play().catch(() => {
        // Ignora erros de reprodução automática no navegador
    });
    
    // Observação: Lembre-se que para parar o loop, você precisará de uma referência
    // global para este objeto `shootSound`.
}










 