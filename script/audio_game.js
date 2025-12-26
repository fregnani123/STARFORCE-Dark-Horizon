// ======================================================
// VARIÁVEIS DE ESTADO (Exportadas com 'let' para leitura/escrita)
// ======================================================


export let isMusicPlaying = false; 



export function stopBGM() {
    if (currentBGM) {
        currentBGM.pause();
        currentBGM.currentTime = 0;
        isMusicPlaying = false;
        currentBGM = null; // Limpa a referência
        console.log("Música de fundo parada.");
    }
}
// audio_game.js

// Armazene a referência da música atual
let currentBGM = null;

// Exemplo de como sua função playBGM deve guardar a referência
export function playBGM(path, volume = 1) {
    if (currentBGM) currentBGM.pause();
    currentBGM = new Audio(path);
    currentBGM.loop = true;
    currentBGM.volume = volume;
    currentBGM.play();
}

export function pauseAllSounds() {
    // 1. Pausa a música de fundo
    if (currentBGM) currentBGM.pause();

    // 2. Para o loop de tiros (se você usa um som contínuo)
    // Se startShootSoundLoop usa um setInterval ou um Audio.loop, 
    // você precisa ter uma função stopShootSoundLoop()
    if (typeof stopShootSoundLoop === 'function') {
        stopShootSoundLoop();
    }

    // 3. Opcional: Pausar todos os elementos de áudio do documento
    const allAudios = document.querySelectorAll('audio');
    allAudios.forEach(audio => audio.pause());
}

export function resumeAllSounds() {
    // Retoma a música de fundo
    if (currentBGM && !currentBGM.ended) {
        currentBGM.play();
    }
    
    // Retoma os tiros se a nave estiver atirando
    if (typeof startShootSoundLoop === 'function') {
        startShootSoundLoop();
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