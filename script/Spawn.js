// 🎯 Score necessário para chamar o boss
const BOSS_SCORE_TRIGGER = 3000;  // altere se quiser
let bossDefeated = false;

let currentBoss = null;

function spawnBoss() {
    if (bossDefeated) return; // já foi morto → não cria mais
    if (currentBoss && currentBoss.isAlive) return; // já existe vivo

    currentBoss = new Boss(
        CANVAS_WIDTH / 2 - 150,
        -300,
        300, // Largura
        300, // Altura (AGORA IGUAL À LARGURA)
        "../assets/img/boss/boss.png",
        16000
    );

    // 🔥 ATIVA A BARRA DE VIDA DO BOSS
    const barContainer = document.getElementById("bossHealthBarContainer");
    const bar = document.getElementById("bossHealthBar");

    if (barContainer) {
        barContainer.style.display = "block";
    }

    if (bar) {
        bar.style.width = "100%"; // reinicia ao aparecer
    }
}


function spawnRandomEnemy(currentScore = 0) {

    // ⚠️ Quando atingir X pontos, para inimigos comuns e chama o boss
    if (currentScore >= BOSS_SCORE_TRIGGER) {
        spawnBoss();
        return;
    }

    const enemyTypes = [
        // ----------------------------------------------------------
        // NIVEL 1
        // ----------------------------------------------------------
        // Objeto de Configuração do Inimigo (Exemplo)

        {
            imagePath: "../assets/img/Enemy/boss-estrela (1).png",
            width: 60, height: 60,
            maxHealth: 50,
            speed: 100,
            fireRate: 1500,
            damage: 10,
            projectileSpeed: 250,

            projectileImgUM: "../assets/img/projectile/tiro-espinho-cinza.png",
            projectileImgDois: null,
            projectileImgTres: null,

            minScore: 0,
            scoreValue: 10,
            weaponLevel: 4,

            // NOVO: Flag para que este inimigo gire
            isRotating: true
        },

        // ----------------------------------------------------------
        // NIVEL 2
        // ----------------------------------------------------------
        {
            imagePath: "../assets/img/Enemy/inimigo4.png",
            width: 100, height: 60,
            maxHealth: 40,
            speed: 110,
            fireRate: 1400,
            damage: 20,
            projectileSpeed: 270,

            projectileImgUM: "../assets/img/projectile/tiro-espinho-roxo.png",
            projectileImgDois: "../assets/img/projectile/tiro-espinho-roxo.png",
            projectileImgTres: null,

            minScore: 0,
            scoreValue: 25,
            weaponLevel: 2,
             // NOVO: Flag para que este inimigo gire
            isRotating: false
        },

        // ----------------------------------------------------------
        // NIVEL 3
        // ----------------------------------------------------------
        {
            imagePath: "../assets/img/Enemy/inimigo3.png",
            width: 100, height: 100,
            maxHealth: 90,
            speed: 120,
            fireRate: 1300,
            damage: 14,
            projectileSpeed: 285,

            projectileImgUM: "../assets/img/projectile/tiro-azul-baixo.png",
            projectileImgDois: "../assets/img/projectile/tiro-azul-baixo.png",
            projectileImgTres: "../assets/img/projectile/tiro-azul-baixo.png",

            minScore: 300,
            scoreValue: 35,
            weaponLevel: 3,
             // NOVO: Flag para que este inimigo gire
            isRotating: false
        },

        // ⭐ NIVEL 4 — DISPARA PARA TODOS OS LADOS (SPREAD)
        {
            imagePath: "../assets/img/Enemy/inimigo4.png",
            width: 85, height: 85,
            maxHealth: 150,
            speed: 130,
            fireRate: 1100,
            damage: 16,
            projectileSpeed: 300,

            projectileImgDois: "../assets/img/projectile/tiro-roxo.png",
            projectileImgTres: "../assets/img/projectile/tiro-roxo.png",

            minScore: 500,
            scoreValue: 60,
            weaponLevel: 4,
             // NOVO: Flag para que este inimigo gire
            isRotating: false
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
    typeCopy.speed += Math.floor(currentScore / 200);
    typeCopy.maxHealth += Math.floor(currentScore / 120);

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
    typeCopy.isRotating || false // <--- O NOVO ARGUMENTO!
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



