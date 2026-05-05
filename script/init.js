// ../script/init.js

import { setupExitButton } from './utils/electron_controls.js'; 
import { initLogoVideoLogic } from './utils/tela_logo_video.js';
import { initTelaInicial, mostrarTelaInicial } from './tela_inicial_module.js';
import { initializeUpgradeButtons } from './btnUpdate.js';
import { setupInputListeners } from './controle.js';
import { initLevelDesigner } from './gameLevel/level_designer.js'; 
import { initCanvasAndContext } from './globals.js';
import { initSaveSystem, savePlayerData, getPlayerData, hasSavedGame } from './saveSystem.js';
import './gameLevel/customize.js';  // Carrega o sistema de customização
import './gameLevel/upgrade.js';   // Carrega o sistema de upgrades
import './settings.js';            // Carrega o sistema de configurações

// Variável de controle para não inicializar duas vezes
let isInitialized = false;

window.addEventListener('DOMContentLoaded', async () => { // Keep async
    if (isInitialized) return;
    isInitialized = true;

    // 0. Inicializa Banco de Dados SQLite e aguarda leitura
    await initSaveSystem();

    // Aplica configurações de áudio salvas
    try {
        const savedSettings = await window.dbAPI.getSettings();
        const { applyAudioSettings } = await import('./audio_game.js');
        applyAudioSettings(savedSettings);
    } catch(e) { /* ignora se não disponível */ }

    // 1. Inicializa o motor gráfico
    initCanvasAndContext(); 
    
    // 2. Interface e Controles
    setupExitButton();

    // Gerenciamento do botão Continuar
    const btnContinuar = document.getElementById('continuar');
    if (btnContinuar) {
        const checkSave = () => {
            const salvo = hasSavedGame();
            btnContinuar.disabled = !salvo;
            if (salvo) {
                btnContinuar.classList.add('btn-continuar-pulse');
                btnContinuar.style.opacity = "1";
                btnContinuar.style.pointerEvents = "auto";
            } else {
                btnContinuar.classList.remove('btn-continuar-pulse');
                btnContinuar.style.opacity = "0.4"; 
                btnContinuar.style.pointerEvents = "none";
            }
        };
        checkSave();
    }

    initTelaInicial();
    
    initializeUpgradeButtons(); 
    initLevelDesigner();
    
    // 3. Inputs (Garante que os eventos de teclado não dupliquem)
    setupInputListeners(); 

    // 4. Inicia o fluxo do jogo
    // Se voltou de uma missão (morte ou conclusão), vai direto para a tela de missões
    if (sessionStorage.getItem('goToMissions')) {
        sessionStorage.removeItem('goToMissions');
        // Esconde o loading overlay antes de mostrar as missões
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) { loadingOverlay.classList.add('hidden'); loadingOverlay.style.display = 'none'; }
        // Navega direto para o mapa de missões sem cutscene
        const divMenu = document.getElementById('div-index');
        const divLevel = document.getElementById('container_levelGame');
        const cutscene = document.getElementById('cutsceneContainer');
        const creation = document.getElementById('playerCreationOverlay');
        if (divMenu)   divMenu.style.display   = 'none';
        if (cutscene)  cutscene.classList.add('hidden');
        if (creation)  creation.classList.add('hidden');
        if (divLevel)  divLevel.style.display  = 'flex';
    } else {
        initLogoVideoLogic(mostrarTelaInicial);
    }
    
    console.log("Sistema inicializado: Nave blindada.");
});