// =================================================================================
// NOVO ARQUIVO: ../script/init.js (CORRIGIDO)
// =================================================================================

import { setupExitButton } from './utils/electron_controls.js'; 
import { initLogoVideoLogic } from './utils/tela_logo_video.js';
import { initTelaInicial, mostrarTelaInicial } from './tela_inicial_module.js';
import { initializeUpgradeButtons } from './btnUpdate.js';
import { setupInputListeners } from './controle.js';
import { initLevelDesigner } from './gameLevel/level_designer.js'; 
import { initCanvasAndContext } from './globals.js'; // 🛑 IMPORTAÇÃO NECESSÁRIA

window.addEventListener('DOMContentLoaded', () => {
    
    // 🛑 1. INICIALIZAÇÃO CRÍTICA DO CANVAS E CONTEXTO 🛑
    // Deve ser a primeira coisa a ser feita para garantir que 'ctx' não seja null.
    initCanvasAndContext(); 
    
    // 2. Configura os elementos de UI/Desktop
    setupExitButton();

    // 3. Configura os listeners da tela inicial e de nível/botões
    initTelaInicial();
    initializeUpgradeButtons(); 
    initLevelDesigner();
    
    // 4. Configura os inputs
    setupInputListeners(); 

    // 5. Inicia a sequência de carregamento do Logo.
    initLogoVideoLogic(mostrarTelaInicial); 
    
    console.log("Sistema de Módulos ES6 inicializado com sucesso!");
});