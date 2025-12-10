// BOSS derrotado → fuga
function derrotouBoss() {
    console.log("Boss derrotado! Iniciando fuga...");

    if (typeof playerShip !== 'undefined' && playerShip instanceof Player) {
        console.log("Nave encontrada. Ativando fuga...");

        playerShip.isExiting = true;
        playerShip.exitSpeed = 0;
    } else {
        console.error("ERRO: playerShip não é uma instância válida de Player.");
    }
}


// Fim de jogo
function endGame() {
    derrotouBoss();

    setTimeout(() => {
        location.reload();
    }, 4000);
}

function endGamePlayer(PlayerHealth) {
    if(PlayerHealth <= 0){
  setTimeout(() => {
        location.reload();
    }, 2000);
    } 

  
}
