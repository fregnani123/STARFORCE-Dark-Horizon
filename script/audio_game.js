// ======================================================
// VARIÁVEIS DE ESTADO (Exportadas com 'let' para leitura/escrita)
// ======================================================

export let isMusicPlaying = false;

// Configurações de áudio aplicadas pelas settings
let _musicVolume = 1.0;
let _sfxVolume   = 1.0;
let _musicEnabled = true;
let _sfxEnabled   = true;

export function applyAudioSettings(settings) {
    _musicVolume  = settings.musicVolume  ?? 1.0;
    _sfxVolume    = settings.sfxVolume    ?? 1.0;
    _musicEnabled = settings.musicEnabled ?? true;
    _sfxEnabled   = settings.sfxEnabled   ?? true;

    // Aplica imediatamente na música em toco
    if (currentBGM) {
        currentBGM.volume = _musicEnabled ? _musicVolume : 0;
    }
    if (loopingShootSound) {
        loopingShootSound.volume = _sfxEnabled ? Math.min(_sfxVolume * 0.06, 1) : 0;
    }
}

export function getMusicVolume()  { return _musicVolume; }
export function getSfxVolume()    { return _sfxVolume; }
export function isMusicEnabled()  { return _musicEnabled; }
export function isSfxEnabled()    { return _sfxEnabled; }

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

export function playBGM(path, volume = 1) {
    if (currentBGM) currentBGM.pause();
    if (!_musicEnabled) return;
    currentBGM = new Audio(path);
    currentBGM.loop = true;
    currentBGM.volume = _musicVolume * volume;
    currentBGM.play();
    isMusicPlaying = true;
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
    if (!_sfxEnabled) return;
    const sound = new Audio("../assets/audio/moeda.mp3"); 
    sound.volume = _sfxVolume;
    sound.play().catch(() => { }); 
}

export function playExplosionSound() {
    if (!_sfxEnabled) return;
    const sound = new Audio("../assets/audio/explosion-inimigo.mp3"); 
    sound.volume = _sfxVolume;
    sound.play().catch(() => { }); 
}

// ---------------------------------------------
// SOM TIRO NAVE PLAYER (Requer gerenciamento de loop)
// ---------------------------------------------

// Variável para armazenar a referência do som de tiro em loop
let loopingShootSound = null; 

export function startShootSoundLoop() {
    if (loopingShootSound) return; 
    if (!_sfxEnabled) return;

    const shootSound = new Audio("../assets/audio/laser3.mp3"); 
    shootSound.loop = true; 
    shootSound.playbackRate = 1.6; 
    shootSound.volume = _sfxVolume * 0.06; 
    
    shootSound.play().catch(() => {});
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