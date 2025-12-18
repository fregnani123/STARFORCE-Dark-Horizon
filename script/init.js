// ../script/init.js

import { setupExitButton } from './utils/electron_controls.js'; 
import { initLogoVideoLogic } from './utils/tela_logo_video.js';
import { initTelaInicial, mostrarTelaInicial } from './tela_inicial_module.js';
import { initializeUpgradeButtons } from './btnUpdate.js';
import { setupInputListeners } from './controle.js';
import { initLevelDesigner } from './gameLevel/level_designer.js'; 
import { initCanvasAndContext } from './globals.js';

// Variável de controle para não inicializar duas vezes
let isInitialized = false;

window.addEventListener('DOMContentLoaded', () => {
    if (isInitialized) return;
    isInitialized = true;

    // 1. Inicializa o motor gráfico
    initCanvasAndContext(); 
    
    // 2. Interface e Controles
    setupExitButton();


    initTelaInicial();
    
    initializeUpgradeButtons(); 
    initLevelDesigner();
    
    // 3. Inputs (Garante que os eventos de teclado não dupliquem)
    setupInputListeners(); 

    // 4. Inicia o fluxo do jogo
    initLogoVideoLogic(mostrarTelaInicial); 
    
    console.log("Sistema inicializado: Nave blindada.");
});