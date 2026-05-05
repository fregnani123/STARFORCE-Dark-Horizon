// ======================================================
// IMPORTS
// ======================================================
import { playerShip, currentMissionId, playerStars, score } from './globals.js';
import { updateMissionProgress, getPlayerData } from './saveSystem.js';
import { stopShootSoundLoop } from './audio_game.js';

function reloadToMissions() {
    sessionStorage.setItem('goToMissions', '1');
    location.reload();
}

export function endGame() {
    setTimeout(() => { reloadToMissions(); }, 4000);
}

export function derrotouBoss() {
    console.log('Boss derrotado! Missao completa.');
    stopShootSoundLoop();

    const nextMission = (currentMissionId || 1) + 1;
    updateMissionProgress(nextMission).catch(err => console.warn('updateMissionProgress:', err));

    const data = getPlayerData();
    const overlay  = document.getElementById('missionCompleteOverlay');
    const subtitle = document.getElementById('missionCompleteSubtitle');
    const btn      = document.getElementById('missionCompleteBtn');
    const mcPilot  = document.getElementById('mc-pilot');
    const mcScore  = document.getElementById('mc-score');
    const mcStarsM = document.getElementById('mc-stars-mission');
    const mcStarsT = document.getElementById('mc-stars-total');
    const mcWeapon = document.getElementById('mc-weapon');
    const mcNext   = document.getElementById('mc-next');

    if (subtitle) subtitle.textContent = 'MISSAO ' + currentMissionId + ' — CONCLUIDA';
    if (mcPilot)  mcPilot.textContent  = (data && data.pilotName) ? data.pilotName.toUpperCase() : '—';
    if (mcScore)  mcScore.textContent  = score || 0;
    if (mcStarsM) mcStarsM.textContent = (playerStars || 0) + ' ⭐';
    if (mcStarsT) mcStarsT.textContent = ((data && data.totalStars) ? data.totalStars : 0) + ' ⭐';
    if (mcWeapon) mcWeapon.textContent = 'LV ' + ((data && data.weaponLevel) ? data.weaponLevel : 1);
    if (mcNext)   mcNext.textContent   = 'MISSAO ' + nextMission;

    if (overlay) { overlay.classList.remove('hidden'); overlay.style.display = 'flex'; }

    if (btn) {
        btn.onclick = () => {
            btn.disabled = true;
            btn.textContent = '🚀 DECOLANDO...';
            if (playerShip && playerShip.isAlive) {
                playerShip.isExiting = true;
                playerShip.exitSpeed = 0;
            }
            setTimeout(() => { reloadToMissions(); }, 1800);
        };
    }
}

export function endGamePlayer(playerHealth) {
    if (playerHealth <= 0) {
        console.log('GAME OVER: Jogador destruido.');
        stopShootSoundLoop();
        setTimeout(() => { reloadToMissions(); }, 2000);
    }
}