// ==============================================================================
// FUNÇÃO DE SPAWN (spawnRandomEnemy) — VERSÃO FINAL CORRIGIDA COM TAMANHO DO PROJÉTIL
// ==============================================================================

function spawnRandomEnemy(player, currentScore = 0) {
    // ⚠️ Se 'player' não for passado, ele não funciona.

    // Assumindo CANVAS_WIDTH, BOSS_SCORE_TRIGGER, spawnBoss definidos globalmente

    if (typeof BOSS_SCORE_TRIGGER !== 'undefined' && currentScore >= BOSS_SCORE_TRIGGER) {
        if (typeof spawnBoss === "function") {
            spawnBoss();
        }
        return;
    }

    const enemyTypes = [
        // TIPO 1: PARA E ATACA (weaponLevel: 3, Halo, Tilt)
        {
            imagePath: "../assets/img/Enemy/inimigo3.png", width: 110, height: 80, maxHealth: 50, speed: 250, fireRate: 1500, damage: 20, projectileSpeed: 450,
            projectileImgUM: "../assets/img/projectile/tiro-verde.png", 
            projectileImgDois:"../assets/img/projectile/tiro-verde.png", 
            projectileImgTres: null,
            minScore: 0,
            scoreValue: 25, 
            weaponLevel: 3, 
            canStopToAttack: true,
            isRotating: false, isPropulsor: false, isPlasmaHalo: true, enableTilt: true, attackDuration: 3000, shouldContinueDescending: true,
            
            // 🛑 TAMANHO DO PROJÉTIL TIPO 1
            projWidth: 20, 
            projHeight: 35,
        },
        // TIPO 2: PASSA DIRETO (weaponLevel: 4, Tiro 360)
        {
            imagePath: "../assets/img/Enemy/inimigo4.png", width: 90, height: 90, maxHealth: 50, speed: 200, fireRate: 1500, damage: 20, projectileSpeed: 250,
            projectileImgUM: "../assets/img/projectile/tiro-espinho-amarelo.png", 
            projectileImgDois: "../assets/img/projectile/espinho-verde.png", 
            projectileImgTres: null,
            minScore: 0,
            scoreValue: 25, 
            weaponLevel: 4, 
            canStopToAttack: false,
            isRotating: false, isPropulsor: false, isPlasmaHalo: true, enableTilt: true, attackDuration: 3000, shouldContinueDescending: true,
            
            // 🛑 TAMANHO DO PROJÉTIL TIPO 2
            projWidth: 35, 
            projHeight: 35,
        },

    ];

    // --- Filtrar e Escalar ---
    const availableEnemies = enemyTypes.filter(t => currentScore >= t.minScore);
    if (!availableEnemies.length) return;

    const randomType = availableEnemies[Math.floor(Math.random() * availableEnemies.length)];
    const typeCopy = JSON.parse(JSON.stringify(randomType));

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

    // --- Posição de spawn ---
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
        
        // 🛑 NOVO: Passando Largura e Altura do Projétil para o construtor do Enemy
        typeCopy.projWidth, 
        typeCopy.projHeight,
        
        // Parâmetros Visuais
        typeCopy.isRotating,
        typeCopy.isPropulsor,
        typeCopy.isPlasmaHalo,
        typeCopy.enableTilt 
    );

    // 🛑 ADICIONA AO ARRAY GLOBAL 'enemies'
    if (typeof enemies !== 'undefined') {
        enemies.push(newEnemy);
    } else {
        console.error("A variável global 'enemies' não está definida.");
    }
}