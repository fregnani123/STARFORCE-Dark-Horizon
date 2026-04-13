// ======================================================
// IMPORTS OBRIGATÓRIOS
// ======================================================
import { 
    playerShip, 
    score,                  // Variável de estado: Pontuação
    nextWeaponUpgradeCost,  // Variável de estado: Custo
    superLaserCharge,       // Variável de estado: Carga do laser
    SUPER_LASER_REQUIREMENT, // Constante
    
    // 🛑 CORREÇÃO: Imports de Setters 🛑
    updateSuperLaserCharge,
    updateScore // Adicionado preventivamente, caso `tryUpgradeWeapon` precise dele.
} from './globals.js'; 

import { getPlayerData } from './saveSystem.js';

// ------------------------------------------------------------------
// 🛠️ FUNÇÃO PARA ATUALIZAR O BOTÃO DE UPGRADE (EXPORTADA)
// ------------------------------------------------------------------
export function updateUpgradeButton() {
    const button = document.getElementById('upgradeButton');
    if (!button || !playerShip) return;

    // 1. Verifica se o nível máximo foi atingido
    if (playerShip.weaponLevel >= playerShip.maxWeaponLevel) {
        button.textContent = "MAX";
        button.disabled = true;
        button.classList.add("weapon-max");
        return;
    }
    
    // Atualiza o texto para mostrar o custo
    button.textContent = `UPGRADE (${nextWeaponUpgradeCost} ⭐)`;

    // 2. Habilita/Desabilita baseado no score (Usando variáveis importadas)
    if (score >= nextWeaponUpgradeCost) {
        button.disabled = false;
        button.classList.remove("disabled"); 
    } else {
        button.disabled = true;
        button.classList.add("disabled");
    }
    
    // Garante que o neon de "MAX" é removido se não estiver no máximo
    button.classList.remove("weapon-max");
}


// ------------------------------------------------------------------
// --- FUNÇÃO PARA TENTAR UPGRADE DE ARMA POR PONTOS (EXPORTADA) ---
// ------------------------------------------------------------------
export function tryUpgradeWeapon() {
    if (!playerShip || playerShip.weaponLevel >= playerShip.maxWeaponLevel || playerShip.inIntro) {
        return false;
    }

    if (score >= nextWeaponUpgradeCost) {
        
        // NOTA: Assumindo que playerShip.upgradeWeapon(cost) lida com a lógica interna
        // do Player e que o módulo que chama `tryUpgradeWeapon` lida com a subtração
        // do score e atualização do nextWeaponUpgradeCost.
        
        playerShip.upgradeWeapon(nextWeaponUpgradeCost); // Chama método e passa o custo
        
        // Se o score for subtraído aqui, use:
        // updateScore(-nextWeaponUpgradeCost);
        // setNextWeaponUpgradeCost(Math.round(nextWeaponUpgradeCost * 1.5)); // Se este setter existir
        
        console.log(`Upgrade de Arma realizado! Próximo custo: ${nextWeaponUpgradeCost}`);
        return true;
    }
    return false;
}


// ------------------------------------------------------------------
// 🔥 FUNÇÃO PARA ATIVAR SUPER LASER (EXPORTADA)
// ------------------------------------------------------------------
export function trySuperLaser() {
    // ⚠️ Importante: Audio deve ser criado no momento da ação para evitar problemas de playback.
    const superLaserSound = new Audio('../assets/audio/laser.mp3'); 

    if (!playerShip || playerShip.inIntro || playerShip.superLaserActive) return;

    if (superLaserCharge < SUPER_LASER_REQUIREMENT) {
        console.log("Super Laser ainda não carregado.");
        return;
    }

    // 1. Ativa o Laser
    playerShip.activateSuperLaser();
    
    // 2. Toca o som
    superLaserSound.volume = 0.3;
    superLaserSound.play()
        .catch(e => {
            console.warn("Não foi possível reproduzir o áudio (erro no navegador):", e);
        });

    // 3. Reseta a carga (Modifica variável importada)
    // 🛑 CORREÇÃO DA LINHA 101: Usa o Setter para definir a carga como 0
    updateSuperLaserCharge(0);
    
    console.log("🔥 Super Laser ativado! Recarga reiniciada.");
    
    // Força a atualização do botão
    updateSuperLaserButton();
}


// ------------------------------------------------------------------
// 🔥 FUNÇÃO PARA ATUALIZAR BOTÃO DO SUPER LASER (EXPORTADA)
// ------------------------------------------------------------------
export function updateSuperLaserButton() {
    const btn = document.getElementById("superLaserButton");
    const costSpan = document.getElementById("laserCost");

    if (!btn || !costSpan) return;

    // Calcula a porcentagem de carga (Usando variáveis importadas)
    const percent = Math.floor((superLaserCharge / SUPER_LASER_REQUIREMENT) * 100);
    
    // Uso do Operador Ternário para definir o texto
    costSpan.textContent = percent >= 100 ? "MAX" : percent + "%";

    // Ativa o efeito neon quando estiver pronto
    if (percent >= 100) {
        btn.classList.add("ready");
    } else {
        btn.classList.remove("ready");
    }
}


// ------------------------------------------------------------------
// 🔗 FUNÇÃO DE INICIALIZAÇÃO DE LISTENERS (EXPORTADA)
// ------------------------------------------------------------------
/**
 * Anexa os event listeners aos botões de upgrade.
 * Deve ser chamada após o DOMContentLoaded no arquivo de inicialização (ex: start_game.js).
 */
export function initializeUpgradeButtons() {
    // --- Botão de Upgrade de Arma ---
    const upgradeButton = document.getElementById('upgradeButton');
    if (upgradeButton) {
        upgradeButton.addEventListener('click', tryUpgradeWeapon);
    }
    
    // --- Botão de Super Laser ---
    const superLaserButton = document.getElementById('superLaserButton');
    if (superLaserButton) {
        superLaserButton.addEventListener('click', trySuperLaser);
    }
}