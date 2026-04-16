// ======================================================
// IMPORTS OBRIGATÓRIOS
// ======================================================
import { playerShip, currentMissionId } from './globals.js';
import { updateMissionProgress, addStars, getPlayerData } from './saveSystem.js';
import { stopShootSoundLoop } from './audio_game.js';


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
 */
export function derrotouBoss() {
 console.log("Boss derrotado! Iniciando fuga...");

// Verifica a existência do jogador antes de manipular suas propriedades
if (playerShip && playerShip.isAlive) {
 console.log("Nave encontrada. Ativando fuga...");
 
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