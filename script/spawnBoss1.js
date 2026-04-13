// ======================================================
// SPAWN BOSS 1 — Drone Commander (Missão 1)
// ======================================================
import { Boss1 } from './Boss1.js';
import {
    CANVAS_WIDTH,
    bossDefeated,
    currentBoss,
    setCurrentBoss,
    setBossDefeated
} from './globals.js';

export function spawnBoss1() {
    if (bossDefeated) return;
    if (currentBoss && currentBoss.isAlive) return;

    const newBoss = new Boss1(CANVAS_WIDTH / 2 - 100, -220);
    setCurrentBoss(newBoss);
    setBossDefeated(false);

    const barContainer = document.getElementById('bossHealthBarContainer');
    const bar = document.getElementById('bossHealthBar');
    if (barContainer) barContainer.style.display = 'block';
    if (bar) bar.style.width = '100%';
}
