// ======================================================
// IMPORTS OBRIGATÓRIOS
// ======================================================
import { playerShip } from './globals.js'; // Importa a instância do Player
import { updateMissionProgress, addStars, getPlayerData } from './saveSystem.js';


// ==============================================================================
// FUNÇÕES DE FIM DE JOGO (EXPORTADAS)
// ==============================================================================

/**
 * Encerra o jogo de forma geral (reload da página).
 * Será chamado após a fuga (vitória) ou imediatamente após a derrota.
 */
export function endGame() { // 🛑 CORREÇÃO: Adicionando 'export'
    // 💡 Melhoria: Mostrar uma tela de placar/vitória antes do reload.

    setTimeout(() => {
        // location.reload() reinicia o jogo no Electron ou no navegador
        location.reload(); 
    }, 4000); 
}


/**
 * Lógica de vitória: Inicia a sequência de fuga da nave do jogador.
 * Salva o progresso da missão e as estrelas capturadas.
 */
export function derrotouBoss() {
    console.log("Boss derrotado! Iniciando fuga...");

    // Verifica a existência do jogador antes de manipular suas propriedades
    if (playerShip && playerShip.isAlive) {
        console.log("Nave encontrada. Ativando fuga...");
        
        // Salva o progresso antes de fugir
        try {
            const playerData = getPlayerData();
            const currentMission = playerData.currentMission;
            const starsEarned = playerShip.starsCollected || 0;
            
            // Atualiza o progresso da missão
            updateMissionProgress(currentMission + 1).catch(err => console.error("Erro ao atualizar missão:", err));
            
            // Salva as estrelas capturadas nesta missão
            if (starsEarned > 0) {
                addStars(starsEarned, currentMission).catch(err => console.error("Erro ao salvar estrelas:", err));
                console.log(`Missão ${currentMission} concluída! ${starsEarned} estrelas salvas.`);
            }
        } catch (err) {
            console.error("Erro ao salvar progresso:", err);
        }
        
        // Ativa as propriedades de fuga da classe Player
        playerShip.isExiting = true;
        playerShip.exitSpeed = 0;
        
    } else {
        console.error("ERRO: playerShip não está disponível ou está morta.");
        // Se o player não puder fugir (está morto), chame o encerramento imediato.
        endGame(); // 🛑 Correção: Chama a função exportada/definida no módulo.
    }
}


/**
 * Lógica de derrota: Verifica a saúde do jogador e encerra o jogo.
 * Chamada pelo método takeDamage do Player.js.
 * @param {number} playerHealth - A saúde atual do jogador.
 */
export function endGamePlayer(playerHealth) {
    if (playerHealth <= 0) {
        // Encerra a simulação imediatamente (opcional) ou mostra tela de "Game Over"
        console.log("GAME OVER: Jogador destruído.");
        
        setTimeout(() => {
            location.reload();
        }, 2000);
    } 
}
