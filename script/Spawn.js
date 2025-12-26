// ======================================================
// IMPORTS OBRIGATÓRIOS
// ======================================================
import { Enemy } from './Enemy.js';
import {
    CANVAS_WIDTH,
    enemies,
    score,
    BOSS_SCORE_TRIGGER,
} from './globals.js'; // Assumindo que globals está no nível superior
import { spawnBoss } from './spawnBoss.js';


// ==============================================================================
// FUNÇÃO DE SPAWN (spawnRandomEnemy) — EXPORTADA COMO MÓDULO
// ==============================================================================

/**
 * Cria um inimigo aleatório, aplicando escalabilidade e verificando trigger de Boss.
 * @param {Player} player - A instância do jogador para mira do inimigo.
 */
export function spawnRandomEnemy(player) {

    const currentScore = score;

    if (!player) {
        console.error("Tentativa de spawn sem a instância do Player.");
        return;
    }

    // --- Verificação do Boss Trigger ---
    if (typeof BOSS_SCORE_TRIGGER !== 'undefined' && currentScore >= BOSS_SCORE_TRIGGER) {
        // 🛑 CORREÇÃO: Não precisa passar o player se o Boss puder acessá-lo globalmente
        spawnBoss();
        return;
    }

   const enemyTypes = [
        // TIPO 1: PARA E ATACA (weaponLevel: 3, Halo, Tilt)
        {
            imagePath: "../assets/img/Enemy/inimigo3.png", width: 110, height: 80, maxHealth: 150, speed: 250, fireRate: 1500, damage: 20, projectileSpeed: 450,
            projectileImgUM: "../assets/img/projectile/tiro-verde.png",
            projectileImgDois: "../assets/img/projectile/tiro-verde.png",
            projectileImgTres: null,
            minScore: 0,
            scoreValue: 25,
            weaponLevel: 3,
            canStopToAttack: true,
            isRotating: false, isPropulsor: false, isPlasmaHalo: true, enableTilt: true, attackDuration: 3000, shouldContinueDescending: true,
            // 🚀 REDUZIDO: de 20x35 para 12x22
            projWidth: 12, projHeight: 22,
        },
        // TIPO 2: PASSA DIRETO (weaponLevel: 4, Tiro 360)
        {
            imagePath: "../assets/img/Enemy/inimigo4.png", width: 110, height: 80, maxHealth: 150, speed: 200, fireRate: 1500, damage: 20, projectileSpeed: 350,
            projectileImgUM: "../assets/img/projectile/tiro-espinho-amarelo.png",
            projectileImgDois: "../assets/img/projectile/espinho-verde.png",
            projectileImgTres: null,
            minScore: 0,
            scoreValue: 25,
            weaponLevel: 4,
            canStopToAttack: false,
            isRotating: false, isPropulsor: false, isPlasmaHalo: true, enableTilt: true, attackDuration: 3000, shouldContinueDescending: false,
            // 🚀 REDUZIDO: de 35x35 para 18x18 (tiro tipo espinho)
            projWidth: 18, projHeight: 18,
        },
        // TIPO 3: Para e Ataca (Level 4, Tiro Roxo)
        {
            imagePath: "../assets/img/Enemy/inimigo4.png", width: 110, height: 80, maxHealth: 150, speed: 250, fireRate: 1500, damage: 20, projectileSpeed: 300,
            projectileImgUM: "../assets/img/projectile/tiro-espinho-roxo.png",
            projectileImgDois: "../assets/img/projectile/tiro-espinho-roxo.png",
            projectileImgTres: null,
            minScore: 0,
            scoreValue: 25,
            weaponLevel: 4,
            canStopToAttack: true,
            isRotating: false, isPropulsor: false, isPlasmaHalo: true, enableTilt: true, attackDuration: 3000, shouldContinueDescending: true,
            // 🚀 REDUZIDO: de 35x35 para 18x18
            projWidth: 18, projHeight: 18,
        },
        // TIPO 4: Passa direto mais rápido (Level 1)
        {
            imagePath: "../assets/img/Enemy/inimigo3.png", width: 110, height: 80, maxHealth: 150, speed: 350, fireRate: 1500, damage: 20, projectileSpeed: 600,
            projectileImgUM: "../assets/img/projectile/tiro-verde.png",
            projectileImgDois: "../assets/img/projectile/tiro-verde.png",
            projectileImgTres: null,
            minScore: 0,
            scoreValue: 25,
            weaponLevel: 3,
            canStopToAttack: false,
            isRotating: false, isPropulsor: false, isPlasmaHalo: true, enableTilt: true, attackDuration: 3000, shouldContinueDescending: true,
            // 🚀 REDUZIDO: de 20x35 para 12x22
            projWidth: 12, projHeight: 22,
        },
    ];
    // --- Filtrar e Escalar ---
    const availableEnemies = enemyTypes.filter(t => currentScore >= t.minScore);
    if (!availableEnemies.length) return;

    const randomType = availableEnemies[Math.floor(Math.random() * availableEnemies.length)];
    const typeCopy = JSON.parse(JSON.stringify(randomType));

    // Escala de dificuldade (Aplica-se ao typeCopy)
    typeCopy.speed += Math.floor(currentScore / 250);
    typeCopy.maxHealth += Math.floor(currentScore / 150);

    // Determinar se para e ataca
    const canStop = randomType.canStopToAttack;
    let stopY = canStop ? (Math.random() * 150 + 100) : null;
    let attackDuration = typeCopy.attackDuration;
    let shouldContinue = typeCopy.shouldContinueDescending;


    // --- Lista de projéteis ---
    const projectileList = [
        typeCopy.projectileImgUM, typeCopy.projectileImgDois, typeCopy.projectileImgTres
    ].filter(img => img);

    // --- Posição de spawn (Usando CANVAS_WIDTH importado) ---
    const spawnX = Math.random() * (CANVAS_WIDTH - typeCopy.width);
    const spawnY = -typeCopy.height;

    // --- Criar inimigo ---
    const newEnemy = new Enemy(
        spawnX, spawnY,
        typeCopy.width, typeCopy.height,
        typeCopy.imagePath,

        // Parâmetros de Estado e Mira
        player,
        canStop,
        stopY,
        attackDuration,
        shouldContinue,

        // Parâmetros Base
        typeCopy.maxHealth,
        typeCopy.speed,
        typeCopy.fireRate,
        typeCopy.damage,
        typeCopy.projectileSpeed,

        // Projéteis, Score e Level
        projectileList,
        typeCopy.scoreValue,
        typeCopy.weaponLevel,

        // NOVO: Passando Largura e Altura do Projétil
        typeCopy.projWidth,
        typeCopy.projHeight,

        // Parâmetros Visuais
        typeCopy.isRotating,
        typeCopy.isPropulsor,
        typeCopy.isPlasmaHalo,
        typeCopy.enableTilt
    );

    // 🛑 ADICIONA AO ARRAY GLOBAL 'enemies' (agora importado)
    enemies.push(newEnemy);
}