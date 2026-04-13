// ======================================================
// IMPORTS OBRIGATÓRIOS
// ======================================================
import { playerShip, currentMissionId } from './globals.js';
import { updateMissionProgress, addStars, getPlayerData } from './saveSystem.js';
import { stopShootSoundLoop } from './audio_game.js';


// ==============================================================================
// FUNÇÕES DE FIM DE JOGO (EXPORTADAS)
// ==============================================================================

export function endGame() {
    setTimeout(() => {
        location.reload(); 
    }, 4000); 
}


/**
 * Mostra a tela "Missão Completa", libera a próxima missão e volta ao mapa.
 */
export function derrotouBoss() {
    console.log("Boss derrotado! Missão completa.");

    stopShootSoundLoop();

    // Libera a próxima missão no banco de dados
    const nextMission = (currentMissionId || 1) + 1;
    updateMissionProgress(nextMission).catch(err => console.warn("updateMissionProgress:", err));

    // Mostra overlay de missão completa
    const overlay = document.getElementById('missionCompleteOverlay');
    const subtitle = document.getElementById('missionCompleteSubtitle');
    const btn = document.getElementById('missionCompleteBtn');

    if (subtitle) subtitle.textContent = `MISSÃO ${currentMissionId} — CONCLUÍDA`;

    if (overlay) {
        overlay.classList.remove('hidden');
        overlay.style.display = 'flex';
    }

    if (btn) {
        btn.onclick = () => { location.reload(); };
    }
}


/**
 * Lógica de derrota.
 */
export function endGamePlayer(playerHealth) {
    if (playerHealth <= 0) {
        console.log("GAME OVER: Jogador destruído.");
        stopShootSoundLoop();
        setTimeout(() => {
            location.reload();
        }, 2000);
    } 
}
