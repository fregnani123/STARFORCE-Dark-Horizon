// ======================================================
// IMPORTS OBRIGATÓRIOS
// ======================================================
import { Enemy } from './Enemy.js';
import { Pickup } from './pickup.js';
import {
    CANVAS_WIDTH,
    enemies,
    score,
    BOSS_SCORE_TRIGGER,
    currentMissionId,
    currentMissionDifficulty,
    maxEnemiesOnScreen,
    pickups
} from './globals.js';
import { spawnBoss } from './spawnBoss.js';
import { spawnBoss1 } from './spawnBoss1.js';
import { spawnBoss3 } from './spawnBoss3.js';


// ==============================================================================
// FUNÇÃO DE SPAWN (spawnRandomEnemy) — EXPORTADA COMO MÓDULO
// ==============================================================================

/**
 * Cria um inimigo aleatório, aplicando escalabilidade e verificando trigger de Boss.
 * @param {Player} player - A instância do jogador para mira do inimigo.
 */
// Resolve enemy image path to be mission-specific when possible
function resolveEnemyImagePath(imagePath) {
    // Use currentMissionId imported from globals.js
    const mission = currentMissionId || 1;

    // 🌟 Se for um asset decorativo ou de pickup, não altera o caminho
    if (imagePath.includes('pickup/') || imagePath.includes('cenario-start/')) {
        return imagePath;
    }

    // If path already contains a missao-# folder, replace its number with current mission
    if (/missao-\d+/.test(imagePath)) {
        return imagePath.replace(/missao-\d+/, `missao-${mission}`);
    }

    // Try to extract an enemy number from filename (inimigo-3 or inimigo3)
    const m = imagePath.match(/inimigo-?(\d+)/);
    let num = m ? m[1] : null;
    if (!num) {
        // Fallback: pick a random variant between 1 and 3
        num = Math.floor(Math.random() * 3) + 1;
    }

    return `../assets/img/Enemy/missao-${mission}/inimigo-${num}.png`;
}

export function spawnRandomEnemy(player) {

    let missionId = currentMissionId || 0;

    // 🛑 REMAPEAMENTO DA ORDEM DAS MISSÕES (Lógica de Conteúdo)
    // Nova 2 (Ex-3), Nova 3 (Ex-4), Nova 4 (Ex-5), Nova 5 (Ex-2)
    let logicId = missionId;
    if (missionId === 2) logicId = 3;
    else if (missionId === 3) logicId = 4;
    else if (missionId === 4) logicId = 5;
    else if (missionId === 5) logicId = 2;

    const currentScore = typeof score !== 'undefined' ? score : 0;

    if (!player) {
        console.error("Tentativa de spawn sem a instância do Player.");
        return;
    }

    // 🌟 LÓGICA DE ESTRELAS DECORATIVAS PARA MISSÃO 0
    if (missionId === 0) {
        const starSize = Math.random() * 30 + 45; // 🆙 Estrelas Gigantes (45px a 75px)
        pickups.push(new Pickup(
            Math.random() * (CANVAS_WIDTH - starSize),
            -starSize,
            starSize, starSize,
            "../assets/img/pickup/estrela-marela.png",
            { type: 'decorative_star', value: 0 }
        ));
        return;
    }

    // Limite de inimigos simultâneos baseado na dificuldade da missão
    if (enemies.length >= maxEnemiesOnScreen) return;

    // --- Verificação do Boss Trigger ---
    if (typeof BOSS_SCORE_TRIGGER !== 'undefined' && currentScore >= BOSS_SCORE_TRIGGER) {
        // Ajuste de gatilho do Boss baseado na nova ordem
        if (currentMissionId === 1) {
            spawnBoss1();
        } else if (currentMissionId === 2) {
            spawnBoss3(); // Antigo Boss 3 agora na Missão 2
        } else {
            spawnBoss();
        }
        return;
    }

    // HP base escalado pela dificuldade da missão: dif.1=60, dif.5=140, dif.10=250
    const BASE_ENEMY_HP = 40 + (currentMissionDifficulty * 21);

 const enemyTypes = [

    // =========================
    // 🔰 BÁSICOS (1–5)
    // =========================
    {
        imagePath: "../assets/img/Enemy/missao-1/inimigo-1.png",
        width: 100, height: 70,
        maxHealth: BASE_ENEMY_HP,
        speed: 200,
        fireRate: 1600,
        damage: 15,
        projectileSpeed: 350,
        projectileImgUM: "../assets/img/projectile/tiro-laranja.png",
        projectileImgDois: null,
        projectileImgTres: null,
        minScore: 0,
        scoreValue: 20,
        weaponLevel: 1,
        canStopToAttack: false,
        isRotating: false,
        isPropulsor: false,
        isPlasmaHalo: false,
        enableTilt: false,
        attackDuration: 2000,
        shouldContinueDescending: true,
        projWidth: 24, projHeight: 42,
    },

    {
        imagePath: "../assets/img/Enemy/missao-1/inimigo-2.png",
        width: 100, height: 70,
        maxHealth: BASE_ENEMY_HP + 20,
        speed: 180,
        fireRate: 1400,
        damage: 18,
        projectileSpeed: 400,
        projectileImgUM: "../assets/img/projectile/tiro-verde.png",
        projectileImgDois: "../assets/img/projectile/tiro-verde.png",
        projectileImgTres: null,
        minScore: 50,
        scoreValue: 25,
        weaponLevel: 2,
        canStopToAttack: true,
        isPlasmaHalo: true,
        enableTilt: true,
        attackDuration: 2500,
        shouldContinueDescending: true,
        projWidth: 12, projHeight: 20,
    },

    {
        imagePath: "../assets/img/Enemy/inimigo3.png",
        width: 110, height: 80,
        maxHealth: BASE_ENEMY_HP + 30,
        speed: 220,
        fireRate: 1200,
        damage: 20,
        projectileSpeed: 450,
        projectileImgUM: "../assets/img/projectile/tiro-verde.png",
        projectileImgDois: null,
        projectileImgTres: null,
        minScore: 100,
        scoreValue: 30,
        weaponLevel: 2,
        canStopToAttack: false,
        isRotating: true,
        attackDuration: 2000,
        shouldContinueDescending: true,
        projWidth: 12, projHeight: 22,
    },

    {
        imagePath: "../assets/img/Enemy/inimigo4.png",
        width: 110, height: 80,
        maxHealth: BASE_ENEMY_HP + 40,
        speed: 250,
        fireRate: 1300,
        damage: 22,
        projectileSpeed: 500,
        projectileImgUM: "../assets/img/projectile/espinho-verde.png",
        projectileImgDois: null,
        projectileImgTres: null,
        minScore: 150,
        scoreValue: 35,
        weaponLevel: 2,
        canStopToAttack: false,
        enableTilt: true,
        attackDuration: 2000,
        shouldContinueDescending: true,
        projWidth: 14, projHeight: 14,
    },

    {
        imagePath: "../assets/img/Enemy/inimigo3.png",
        width: 110, height: 80,
        maxHealth: BASE_ENEMY_HP + 50,
        speed: 180,
        fireRate: 900,
        damage: 25,
        projectileSpeed: 300,
        projectileImgUM: "../assets/img/projectile/tiro-espinho-roxo.png",
        projectileImgDois: null,
        projectileImgTres: null,
        minScore: 200,
        scoreValue: 40,
        weaponLevel: 3,
        canStopToAttack: true,
        attackDuration: 3000,
        shouldContinueDescending: true,
        projWidth: 18, projHeight: 18,
    },

    // =========================
    // ⚡ RÁPIDOS (6–10)
    // =========================
    {
        imagePath: "../assets/img/Enemy/inimigo1.png",
        width: 110, height: 80,
        maxHealth: BASE_ENEMY_HP - 10,
        speed: 200,
        fireRate: 1800,
        damage: 12,
        projectileSpeed: 600,
        projectileImgUM: "../assets/img/projectile/tiro-laranja.png",
        minScore: 250,
        scoreValue: 35,
        weaponLevel: 1,
        canStopToAttack: false,
        shouldContinueDescending: true,
        projWidth: 24, projHeight: 42,
    },

    {
        imagePath: "../assets/img/Enemy/inimigo2.png",
        width: 110, height: 80,
        maxHealth: BASE_ENEMY_HP,
        speed: 200,
        fireRate: 1500,
        damage: 14,
        projectileSpeed: 650,
        projectileImgUM: "../assets/img/projectile/espinho-verde.png",
        minScore: 300,
        scoreValue: 40,
        weaponLevel: 2,
        canStopToAttack: false,
        isPropulsor: true,
        shouldContinueDescending: true,
        projWidth: 12, projHeight: 12,
    },

    {
        imagePath: "../assets/img/Enemy/inimigo3.png",
        width: 110, height: 80,
        maxHealth: BASE_ENEMY_HP,
        speed: 200,
        fireRate: 1200,
        damage: 16,
        projectileSpeed: 700,
        projectileImgUM: "../assets/img/projectile/tiro-verde.png",
        minScore: 350,
        scoreValue: 45,
        weaponLevel: 2,
        canStopToAttack: false,
        isRotating: true,
        projWidth: 12, projHeight: 20,
    },

    {
        imagePath: "../assets/img/Enemy/inimigo4.png",
        width: 110, height: 80,
        maxHealth: BASE_ENEMY_HP,
        speed: 200,
        fireRate: 1000,
        damage: 18,
        projectileSpeed: 750,
        projectileImgUM: "../assets/img/projectile/espinho-verde.png",
        minScore: 400,
        scoreValue: 50,
        weaponLevel: 3,
        canStopToAttack: false,
        projWidth: 14, projHeight: 14,
    },

    {
        imagePath: "../assets/img/Enemy/inimigo2.png",
        width: 110, height: 80,
        maxHealth: BASE_ENEMY_HP,
        speed: 200,
        fireRate: 800,
        damage: 20,
        projectileSpeed: 800,
        projectileImgUM: "../assets/img/projectile/tiro-espinho-roxo.png",
        minScore: 450,
        scoreValue: 55,
        weaponLevel: 3,
        canStopToAttack: false,
        projWidth: 16, projHeight: 16,
    },

    // =========================
    // 🧱 TANK (11–15)
    // =========================
    {
        imagePath: "../assets/img/Enemy/inimigo4.png",
        width: 140, height: 100,
        maxHealth: BASE_ENEMY_HP * 2,
        speed: 120,
        fireRate: 2000,
        damage: 30,
        projectileSpeed: 250,
        projectileImgUM: "../assets/img/projectile/tiro-verde.png",
        minScore: 500,
        scoreValue: 80,
        weaponLevel: 2,
        canStopToAttack: true,
        attackDuration: 4000,
        projWidth: 16, projHeight: 24,
    },

    {
        imagePath: "../assets/img/Enemy/inimigo3.png",
        width: 150, height: 110,
        maxHealth: BASE_ENEMY_HP * 2.5,
        speed: 100,
        fireRate: 1800,
        damage: 35,
        projectileSpeed: 300,
        projectileImgUM: "../assets/img/projectile/espinho-verde.png",
        minScore: 600,
        scoreValue: 90,
        weaponLevel: 3,
        canStopToAttack: true,
        projWidth: 18, projHeight: 18,
    },

    {
        imagePath: "../assets/img/Enemy/missao-1/inimigo-3.png",
        width: 160, height: 120,
        maxHealth: BASE_ENEMY_HP * 3,
        speed: 90,
        fireRate: 1500,
        damage: 40,
        projectileSpeed: 350,
        projectileImgUM: "../assets/img/projectile/tiro-espinho-roxo.png",
        minScore: 700,
        scoreValue: 100,
        weaponLevel: 4,
        canStopToAttack: true,
        projWidth: 20, projHeight: 20,
    },

    {
        imagePath: "../assets/img/Enemy/inimigo3.png",
        width: 150, height: 110,
        maxHealth: BASE_ENEMY_HP * 2.8,
        speed: 110,
        fireRate: 1300,
        damage: 38,
        projectileSpeed: 400,
        projectileImgUM: "../assets/img/projectile/tiro-verde.png",
        minScore: 800,
        scoreValue: 110,
        weaponLevel: 4,
        canStopToAttack: true,
        projWidth: 18, projHeight: 24,
    },

    {
        imagePath: "../assets/img/Enemy/inimigo4.png",
        width: 170, height: 130,
        maxHealth: BASE_ENEMY_HP * 3.2,
        speed: 80,
        fireRate: 1000,
        damage: 45,
        projectileSpeed: 450,
        projectileImgUM: "../assets/img/projectile/espinho-verde.png",
        minScore: 900,
        scoreValue: 120,
        weaponLevel: 4,
        canStopToAttack: true,
        projWidth: 20, projHeight: 20,
    },

    // =========================
    // ☠️ ELITE / CAÓTICOS (16–20)
    // =========================
    {
        imagePath: "../assets/img/Enemy/inimigo4.png",
        width: 120, height: 90,
        maxHealth: BASE_ENEMY_HP * 2,
        speed: 100,
        fireRate: 600,
        damage: 35,
        projectileSpeed: 600,
        projectileImgUM: "../assets/img/projectile/tiro-espinho-roxo.png",
        projectileImgDois: "../assets/img/projectile/espinho-verde.png",
        minScore: 1000,
        scoreValue: 150,
        weaponLevel: 4,
        canStopToAttack: true,
        isRotating: true,
        projWidth: 18, projHeight: 18,
    },

    {
        imagePath: "../assets/img/Enemy/inimigo3.png",
        width: 110, height: 80,
        maxHealth: BASE_ENEMY_HP * 2.2,
        speed: 150,
        fireRate: 700,
        damage: 32,
        projectileSpeed: 700,
        projectileImgUM: "../assets/img/projectile/tiro-verde.png",
        minScore: 1100,
        scoreValue: 160,
        weaponLevel: 4,
        canStopToAttack: false,
        isRotating: true,
        projWidth: 14, projHeight: 22,
    },

    {
        imagePath: "../assets/img/Enemy/inimigo2.png",
        width: 120, height: 90,
        maxHealth: BASE_ENEMY_HP * 2.5,
        speed: 150,
        fireRate: 500,
        damage: 40,
        projectileSpeed: 750,
        projectileImgUM: "../assets/img/projectile/espinho-verde.png",
        minScore: 1200,
        scoreValue: 170,
        weaponLevel: 4,
        canStopToAttack: true,
        projWidth: 16, projHeight: 16,
    },

    {
        imagePath: "../assets/img/Enemy/inimigo4.png",
        width: 130, height: 100,
        maxHealth: BASE_ENEMY_HP * 3,
        speed: 250,
        fireRate: 400,
        damage: 45,
        projectileSpeed: 800,
        projectileImgUM: "../assets/img/projectile/tiro-espinho-roxo.png",
        minScore: 1300,
        scoreValue: 180,
        weaponLevel: 4,
        canStopToAttack: true,
        projWidth: 20, projHeight: 20,
    },

    {
        imagePath: "../assets/img/Enemy/inimigo4.png",
        width: 140, height: 110,
        maxHealth: BASE_ENEMY_HP * 3.5,
        speed: 200,
        fireRate: 300,
        damage: 50,
        projectileSpeed: 900,
        projectileImgUM: "../assets/img/projectile/espinho-verde.png",
        minScore: 1500,
        scoreValue: 200,
        weaponLevel: 4,
        canStopToAttack: true,
        isRotating: true,
        projWidth: 22, projHeight: 22,
    },
];
    // --- Construir inimigos da missão (3 por missão, 15 missões) ---
    const missionGroup = [];
    for (let j = 0; j < 3; j++) {
        // Seleciona um template a partir do array existente (rotacionando se necessário)
        const idx = (((logicId - 1) * 3) + j) % enemyTypes.length;
        const tmpl = JSON.parse(JSON.stringify(enemyTypes[idx]));

        // Escala baseada na missão (mais forte a cada missão)
        const missionMultiplier = 1 + ((missionId - 1) * 0.10); // +10% por missão
        tmpl.maxHealth = Math.round((tmpl.maxHealth || BASE_ENEMY_HP) * missionMultiplier);
        tmpl.damage = Math.round((tmpl.damage || 10) * missionMultiplier);
        tmpl.speed = Math.round((tmpl.speed || 100) + (missionId - 1) * 10);
        // Deixar inimigos atirarem um pouco mais rápido em missões avançadas
        tmpl.fireRate = Math.max(300, Math.round((tmpl.fireRate || 1000) * Math.max(0.6, 1 - (missionId - 1) * 0.03)));

        // Forçar propriedades por missão
        tmpl.minScore = 0;
        tmpl.isRotating = false; // desativa rotação no próprio eixo para TODOS
        tmpl.imagePath = `../assets/img/Enemy/missao-${missionId}/inimigo-${j + 1}.png`;

        // 🛑 LÓGICA DE INIMIGOS TERRESTRES (Antiga Missão 3)
        if (logicId === 3) {
            if (j === 0) { // Inimigo 1 é avião
                tmpl.speed = 220; 
                tmpl.isWalking = false;
            } else { // Inimigos 2 e 3 são Walkers (Aranhas)
                tmpl.isWalking = true;
                tmpl.speed = 60; // Marcha lenta
                tmpl.walkerType = (j === 2) ? 'heavy' : 'light';
                tmpl.legLength = (j === 2) ? 110 : 85; // 🆙 Aumentado para aparecer fora da nave
                tmpl.legCount = (j === 2) ? 8 : 6;     // 🆙 Mais patas para parecer robótico
                tmpl.isGroup = true; // Virão em bandos
                tmpl.enableTilt = false; 
            }
        }

        // 🛑 LÓGICA PARA MISSÃO 4 (Antiga): 2 Naves de Combate e 1 Aranha Mecânica
        if (logicId === 4) {
            if (j === 2) { // O terceiro tipo (inimigo-3.png) será a aranha
                tmpl.isWalking = true;
                tmpl.speed = 75; // Marcha industrial constante
                tmpl.walkerType = 'heavy';
                tmpl.legLength = 95;
                tmpl.legCount = 8;
                tmpl.isGroup = false; // Spawn individual para ser menos frequente que na Missão 3
                tmpl.enableTilt = false;
            } else {
                tmpl.isWalking = false; // Inimigos 1 e 2 são naves de interceptação
            }
        }

        missionGroup.push(tmpl);
    }

    const availableEnemies = missionGroup.filter(t => currentScore >= t.minScore);
    if (!availableEnemies.length) return;

    const randomType = availableEnemies[Math.floor(Math.random() * availableEnemies.length)];
    const typeCopy = JSON.parse(JSON.stringify(randomType));

    // 🛑 SE FOR GRUPO (Walkers), spawna 3 a 4 unidades
    if (typeCopy.isGroup) {
        const groupSize = Math.floor(Math.random() * 2) + 3; // 3 ou 4
        for (let i = 0; i < groupSize; i++) {
            setTimeout(() => {
                createAndPushEnemy(typeCopy, player, i * 40); // Offset X para não ficarem um em cima do outro
            }, i * 300); // Delay entre eles para formar fila
        }
    } else {
        createAndPushEnemy(typeCopy, player);
    }
}

function createAndPushEnemy(typeCopy, player, offsetX = 0) {
    if (enemies.length >= maxEnemiesOnScreen) return;

    // 🛑 CORREÇÃO: Define currentScore para evitar erro de referência
    const currentScore = typeof score !== 'undefined' ? score : 0;

    const spawnX = Math.max(0, Math.min(CANVAS_WIDTH - typeCopy.width, (Math.random() * (CANVAS_WIDTH - typeCopy.width)) + offsetX));
    const spawnY = -typeCopy.height;

    const canStop = typeCopy.canStopToAttack;
    let stopY = canStop ? (Math.random() * 150 + 100) : null;

    const projectileList = [
        typeCopy.projectileImgUM, typeCopy.projectileImgDois, typeCopy.projectileImgTres
    ].filter(img => img);

    // Garantir imagem correta e resolver caminhos
    const finalImagePath = resolveEnemyImagePath(typeCopy.imagePath);
    
    // Escala de dificuldade baseada no score
    const finalSpeed = typeCopy.speed + Math.floor(currentScore / 250);
    const finalHealth = typeCopy.maxHealth + Math.floor(currentScore / 150);

    const newEnemy = new Enemy(
        spawnX, spawnY,
        typeCopy.width, typeCopy.height,
        finalImagePath,

        // Parâmetros de Estado e Mira
        player,
        canStop,
        stopY,
        typeCopy.attackDuration,
        typeCopy.shouldContinueDescending,

        // Parâmetros Base
        finalHealth,
        finalSpeed,
        typeCopy.fireRate,
        typeCopy.damage,
        typeCopy.projectileSpeed,

        // Projéteis, Score e Level
        projectileList,
        typeCopy.scoreValue,
        typeCopy.weaponLevel,

        // Projétil
        typeCopy.projWidth,
        typeCopy.projHeight,

        // Parâmetros Visuais
        false, // isRotating
        typeCopy.isPropulsor,
        typeCopy.isPlasmaHalo,
        typeCopy.enableTilt,

        // Parâmetros de caminhada (Missão 3)
        typeCopy.isWalking,
        typeCopy.walkerType,
        typeCopy.legLength,
        typeCopy.legCount
    );

    // 🛑 ADICIONA AO ARRAY GLOBAL 'enemies' (agora importado)
    enemies.push(newEnemy);
}