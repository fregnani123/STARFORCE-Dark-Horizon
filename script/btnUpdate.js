// ------------------------------------------------------------------
// 🛠️ FUNÇÃO PARA ATUALIZAR O BOTÃO DE UPGRADE (CORRIGIDA)
// ------------------------------------------------------------------
function updateUpgradeButton() {
    const button = document.getElementById('upgradeButton');
    if (!button || !playerShip) return;

    // 1. Verifica se o nível máximo foi atingido
    if (playerShip.weaponLevel >= playerShip.maxWeaponLevel) {
        button.textContent = "MAX";
        button.disabled = true;

        // Ativa o neon corretamente 🎇
        button.classList.add("weapon-max");

        return;
    }

}
// ------------------------------------------------------------------

// --- FUNÇÃO PARA TENTAR UPGRADE DE ARMA POR PONTOS ---
function tryUpgradeWeapon() {
    if (!playerShip || playerShip.weaponLevel >= playerShip.maxWeaponLevel || playerShip.inIntro) {
        return false;
    }

    if (score >= nextWeaponUpgradeCost) {
        score -= nextWeaponUpgradeCost; // Subtrai o custo
        playerShip.upgradeWeapon(); // Chama o método do Player.js

        // Define o próximo custo (aumenta o custo em 50%)
        nextWeaponUpgradeCost = Math.round(nextWeaponUpgradeCost * 1.5);

        console.log(`Upgrade de Arma realizado! Próximo custo: ${nextWeaponUpgradeCost}`);
        return true;
    }
    return false;
}

// ----------------------------------------------------
// EVENT LISTENER E INICIALIZAÇÃO
// ----------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    // Isso garante que o elemento do botão existe antes de tentar anexar o listener.
    const upgradeButton = document.getElementById('upgradeButton');
    if (upgradeButton) {
        upgradeButton.addEventListener('click', tryUpgradeWeapon);
    }
    // Outras inicializações, como a chamada para iniciar o gameLoop, devem estar aqui.
});


// ------------------------------------------------------------------
// 🔥 FUNÇÃO PARA ATIVAR SUPER LASER 
// ------------------------------------------------------------------

const superLaserButto = document.getElementById('superLaserButton');
superLaserButto.addEventListener('click', trySuperLaser)

function trySuperLaser() {
 
    if (!playerShip || playerShip.inIntro || playerShip.superLaserActive) return;

 
    if (superLaserCharge < SUPER_LASER_REQUIREMENT) {
        console.log("Super Laser ainda não carregado.");
        return;
    }

 
    playerShip.activateSuperLaser();
 
    const superLaserSound = new Audio('../assets/audio/laser.mp3'); 

 
    superLaserSound.volume = 0.3; // ajusta volume
    
    // Tentar tocar
    superLaserSound.play()
        .catch(e => {
            console.warn("Não foi possível reproduzir o áudio (erro no navegador):", e);
        });


    // 3. Reseta a carga para começar do zero de novo
    superLaserCharge = 0;

    console.log("🔥 Super Laser ativado! Recarga reiniciada.");
}


const superLaserButton = document.getElementById('superLaserButton')

function updateSuperLaserButton() {
    const btn = document.getElementById("superLaserButton");
    const costSpan = document.getElementById("laserCost");

    const percent = Math.floor((superLaserCharge / SUPER_LASER_REQUIREMENT) * 100);
    // 2. USO DO OPERADOR TERNÁRIO para definir o texto do costSpan
    costSpan.textContent = percent >= 100 ? "MAX" : percent + "%";

    // Ativa o efeito neon quando estiver pronto
    if (percent >= 100) {
        btn.classList.add("ready");
    } else {
        btn.classList.remove("ready");
    }
}




