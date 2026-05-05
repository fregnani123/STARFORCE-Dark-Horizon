// ======================================================
// SPAWN BOSS 3 — MECHA SPIDER (Missão 2)
// ======================================================
import { Boss3 } from './Boss3.js';
import {
    CANVAS_WIDTH,
    currentBoss,
    bossDefeated,
    setCurrentBoss,
    setBossDefeated
} from './globals.js';

export function spawnBoss3() {
    // 🛑 TRAVA DE SEGURANÇA: Não spawna se já houver um boss ou se já foi derrotado
    if (bossDefeated) return;
    if (currentBoss && currentBoss.isAlive) return;

    const newBoss = new Boss3(CANVAS_WIDTH / 2 - 140, -250);
    setCurrentBoss(newBoss);
    setBossDefeated(false);

    const barContainer = document.getElementById('bossHealthBarContainer');
    const bar = document.getElementById('bossHealthBar');
    if (barContainer) barContainer.style.display = 'block';
    if (bar) bar.style.width = '100%';
}