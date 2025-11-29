function spawnRandomEnemy(currentScore = 0) {

    const enemyTypes = [
        // ----------------------------------------------------------
        // NIVEL 1
        // ----------------------------------------------------------
        {
            imagePath: "../assets/img/inimigo1.png",
            width: 60, height: 60,
            maxHealth: 50,
            speed: 100,
            fireRate: 1500,
            damage: 10,
            projectileSpeed: 250,

            projectileImgUM: "../assets/img/tiro1.png",
            projectileImgDois: null,
            projectileImgTres: null,

            minScore: 0,
            scoreValue: 10,
            weaponLevel: 1
        },

        // ----------------------------------------------------------
        // NIVEL 2
        // ----------------------------------------------------------
        {
            imagePath: "../assets/img/inimigo2.png",
            width: 70, height: 80,
            maxHealth: 40,
            speed: 110,
            fireRate: 1400,
            damage: 20,
            projectileSpeed: 270,

            projectileImgUM:"../assets/img/tiro2.png",
            projectileImgDois: "../assets/img/tiro2.png",
            projectileImgTres: null,

            minScore: 0,
            scoreValue: 25,
            weaponLevel: 2
        },

        // ----------------------------------------------------------
        // NIVEL 3
        // ----------------------------------------------------------
        {
            imagePath: "../assets/img/inimigo3.png",
            width: 100, height: 100,
            maxHealth: 90,
            speed: 120,
            fireRate: 1300,
            damage: 14,
            projectileSpeed: 285,

            projectileImgUM:"../assets/img/tiro4.png",
            projectileImgDois: "../assets/img/tiro4.png",
            projectileImgTres: "../assets/img/tiro4.png",

            minScore: 300,
            scoreValue: 35,
            weaponLevel: 3
        },

          // ⭐ NIVEL 4 — DISPARA PARA TODOS OS LADOS (SPREAD)
        {
            imagePath: "../assets/img/inimigo4.png",
            width: 85, height: 85,
            maxHealth: 150,
            speed: 130,
            fireRate: 1100,
            damage: 16,
            projectileSpeed: 300,

            projectileImgDois: "../assets/img/tiro3.png",
            projectileImgTres: "../assets/img/tiro3.png",

            minScore: 600,
            scoreValue: 60,
            weaponLevel: 4
        }

    ];

    // --- Filtrar inimigos liberados ---
    const availableEnemies = enemyTypes.filter(t => currentScore >= t.minScore);
    if (!availableEnemies.length) return;

    // --- Escolher aleatório ---
    const randomType = availableEnemies[Math.floor(Math.random() * availableEnemies.length)];

    // --- Criar cópia segura ---
    const typeCopy = JSON.parse(JSON.stringify(randomType));

    // --- Escala dificuldade ---
    typeCopy.speed += Math.floor(currentScore / 200);
    typeCopy.maxHealth += Math.floor(currentScore / 120);

    // --- Criar lista de projéteis ---
const projectileList = [
    typeCopy.projectileImgUM,
    typeCopy.projectileImgDois,
    typeCopy.projectileImgTres
].filter(img => img !== null && img !== undefined);


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
        typeCopy.scoreValue
    );

    enemies.push(newEnemy);
}















// ----------------------------------------------------
// ✨ NOVO: FUNÇÃO PARA SPAWN DO ITEM DE VIDA
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
// ----------------------------------------------------



