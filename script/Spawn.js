function spawnRandomEnemy(currentScore = 0) {

    // ⚠️ Quando atingir X pontos, para inimigos comuns e chama o boss
    if (currentScore >= BOSS_SCORE_TRIGGER) {
        spawnBoss();
        return;
    }

    const enemyTypes = [
        // ----------------------------------------------------------
        // NIVEL 1 - Ambos (Propulsor + Halo) <-- CORRIGIDO
        // ----------------------------------------------------------
        {
            imagePath: "../assets/img/Enemy/inimigo3.png",
            width:110,
            height: 80,
            maxHealth: 50,
            speed: 100,
            fireRate: 1500,
            damage: 10,
            projectileSpeed: 250,

            projectileImgUM: "../assets/img/projectile/tiro-espinho-roxo.png",
            projectileImgDois: null,
            projectileImgTres: null,

            minScore: 0,
            scoreValue: 25,
            weaponLevel: 3,

            isRotating: false,
            isPropulsor: false,
            isPlasmaHalo: true
        },

        // ----------------------------------------------------------
        // NIVEL 2 - SÓ Plasma Halo (Brilho) <-- CORRIGIDO
        // ----------------------------------------------------------
        {
            imagePath: "../assets/img/Enemy/inimigo1.png",
            width: 100, height: 60,
            maxHealth: 70,
            speed: 120,
            fireRate: 1400,
            damage: 15,
            projectileSpeed: 270,
            projectileImgUM: "../assets/img/projectile/tiro-laranja.png",
            projectileImgDois:  "../assets/img/projectile/tiro-laranja.png",
            projectileImgTres: null,

            minScore: 0,
            scoreValue: 80,
            weaponLevel: 2,
            isRotating: false,
            isPropulsor: true,  // <-- CORRIGIDO: Deve ter o Propulsor
            isPlasmaHalo: false // <-- CORRIGIDO: Não deve ter o Halo
        },

        // ----------------------------------------------------------
        // NIVEL 3 - Nenhum Efeito Visual Extra <-- CORRIGIDO
        // ----------------------------------------------------------
        {
            imagePath: "../assets/img/Enemy/inimigo1.png",
            width: 130, height: 90,
            maxHealth: 100,
            speed: 130,
            fireRate: 1300,
            damage: 20,
            projectileSpeed: 285,

            projectileImgUM:"../assets/img/projectile/tiro-laranja.png",
            projectileImgDois:"../assets/img/projectile/tiro-laranja.png",
            projectileImgTres:  "../assets/img/projectile/tiro-laranja.png",

            minScore: 300,
            scoreValue: 120,
            weaponLevel: 3,
            isRotating: false,
            isPropulsor: true,
            isPlasmaHalo: false
        },

      
{
    imagePath: "../assets/img/Enemy/inimigo4.png",
    width: 90, 
    height: 90,
    maxHealth: 150,
    speed: 110,
    fireRate: 1100,
    damage: 25,
    projectileSpeed: 300,

    projectileImgUM: "../assets/img/projectile/tiro-espinho-roxo.png",
    projectileImgDois:"../assets/img/projectile/tiro-espinho-roxo.png",
    projectileImgTres: "../assets/img/projectile/tiro-espinho-roxo.png",

    minScore: 500,
    scoreValue: 100,
    weaponLevel: 4,
    isRotating: false,
    isPropulsor: false,
    isPlasmaHalo: true,
    enableTilt: false // <- sem inclinação
}


    ];

    // --- Filtrar tipos permitidos pelo score ---
    const availableEnemies = enemyTypes.filter(t => currentScore >= t.minScore);
    if (!availableEnemies.length) return;

    // --- Pega tipo aleatório ---
    const randomType = availableEnemies[Math.floor(Math.random() * availableEnemies.length)];

    // --- Cópia segura ---
    const typeCopy = JSON.parse(JSON.stringify(randomType));

    // --- Escalonar dificuldade ---
    typeCopy.speed += Math.floor(currentScore / 250);
    typeCopy.maxHealth += Math.floor(currentScore / 150);

    // --- Lista de projéteis usada pelo inimigo ---
    const projectileList = [
        typeCopy.projectileImgUM,
        typeCopy.projectileImgDois,
        typeCopy.projectileImgTres
    ].filter(img => img);

    // --- Posição de spawn ---
    const spawnX = Math.random() * (CANVAS_WIDTH - typeCopy.width);
    const spawnY = -typeCopy.height;

// --- Criar inimigo ---
const newEnemy = new Enemy(
    spawnX, spawnY,
    typeCopy.width, typeCopy.height,
    typeCopy.imagePath,
    typeCopy.maxHealth,
    typeCopy.speed,
    typeCopy.fireRate,
    typeCopy.damage,
    typeCopy.projectileSpeed,
    projectileList,
    typeCopy.weaponLevel,
    typeCopy.scoreValue,
    typeCopy.isRotating,
    typeCopy.isPropulsor,      // Argumento 10: isPropulsor
    typeCopy.isPlasmaHalo,     // Argumento 11: isPlasmaHalo
    typeCopy.enableTilt !== false // Argumento 12: enableTilt (true por padrão)
);

enemies.push(newEnemy);

}


// ----------------------------------------------------
// FUNÇÃO PARA SPAWN DO ITEM DE VIDA (Mantida, pois faz parte do seu código)
// ----------------------------------------------------
function spawnHealthPickup() {
    // Spawn em uma posição X aleatória no topo
    const width = 40;
    const height = 40;
    const spawnX = Math.random() * (CANVAS_WIDTH - width);
    const spawnY = -height; // Começa acima da tela

    // Cria e adiciona o item ao array
    pickups.push(new Pickup(
        spawnX, spawnY,
        width, height,
        HEALTH_PICKUP_IMAGE,
        { type: 'health', value: HEALTH_PICKUP_VALUE }
    ));

    console.log("Item de Vida Spawnado!");
}