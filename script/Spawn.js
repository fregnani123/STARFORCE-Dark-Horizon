// ------------------------------------------------------------------
// --- FUNÇÃO PARA SPAWN ALEATÓRIO ---
function spawnRandomEnemy() {
    const enemyTypes = [
        {
            imagePath: "../assets/img/inimigoverde.png",
            width: 60, height: 60, maxHealth: 50, speed: 100, fireRate: 1500, damage: 10
        },
        {
            imagePath: "../assets/img/inimigo2.png",
            width: 100, height: 80, maxHealth: 200, speed: 50, fireRate: 3000, damage: 25
        }
    ];

    const randomType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
    const spawnX = Math.random() * (CANVAS_WIDTH - randomType.width);
    const spawnY = -randomType.height;

    // Assumindo que a classe Enemy é definida e acessível
    enemies.push(new Enemy(
        spawnX, spawnY,
        randomType.width, randomType.height,
        randomType.imagePath,
        randomType.maxHealth,
        randomType.speed,
        randomType.fireRate, 
        randomType.damage    
    ));
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


 
