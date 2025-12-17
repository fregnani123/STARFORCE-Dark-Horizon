// ======================================================
// VARIÁVEIS DE ESTADO (Exportadas com 'let' para leitura/escrita)
// ======================================================

// Referência ao objeto de áudio da música de fundo atual
export let currentBGM = null;
// Flag de estado da música
export let isMusicPlaying = false; 

// ======================================================
// FUNÇÕES DE CONTROLE DE MÚSICA DE FUNDO (BGM)
// ======================================================

export function playBGM(musicPath, volume = 1) {
    // 1. Parar e Limpar a Música Anterior
    if (currentBGM) {
        currentBGM.pause();
        currentBGM.currentTime = 0;
    }
    
    // 2. Criar e Configurar a Nova Música
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


export function stopBGM() {
    if (currentBGM) {
        currentBGM.pause();
        currentBGM.currentTime = 0;
        isMusicPlaying = false;
        currentBGM = null; // Limpa a referência
        console.log("Música de fundo parada.");
    }
}

// ======================================================
// FUNÇÕES DE CONTROLE DE EFEITOS SONOROS (SFX)
// ======================================================

export function playCoinSound() {
    // Usa 'const' pois a referência 'sound' só existe dentro desta função
    const sound = new Audio("../assets/audio/moeda.mp3"); 
    sound.volume = 1;
    sound.play().catch(() => { }); 
}

export function playExplosionSound() {
    const sound = new Audio("../assets/audio/explosion-inimigo.mp3"); 
    sound.volume = 1;
    sound.play().catch(() => { }); 
}

// ---------------------------------------------
// SOM TIRO NAVE PLAYER (Requer gerenciamento de loop)
// ---------------------------------------------

// Variável para armazenar a referência do som de tiro em loop
let loopingShootSound = null; 

export function startShootSoundLoop() {
    // Se já estiver tocando, ignora
    if (loopingShootSound) return; 

    const shootSound = new Audio("../assets/audio/laser3.mp3"); 
    shootSound.loop = true; 
    shootSound.playbackRate = 1.6; 
    shootSound.volume = 0.06; 
    
    shootSound.play().catch(() => {
        // Ignora erros
    });
    
    // Armazena a referência para que possa ser parada
    loopingShootSound = shootSound;
}

export function stopShootSoundLoop() {
    if (loopingShootSound) {
        loopingShootSound.pause();
        loopingShootSound.currentTime = 0;
        loopingShootSound = null;
    }
}
// OBSERVAÇÃO: A função original 'shootSoundPlay' foi dividida em 
// 'startShootSoundLoop' e 'stopShootSoundLoop' para melhor controle do som em loop.