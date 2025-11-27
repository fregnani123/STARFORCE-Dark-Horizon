// Arquivo: script/game.js

// Variáveis globais (acessíveis a todos os scripts)
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const CANVAS_WIDTH = 500;
const CANVAS_HEIGHT = 750;

canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;

let playerShip;
const enemies = [];
const enemyProjectiles = []; // 🚨 ESSENCIAL: Tiros dos inimigos
let gameBackground;
let lastTime = 0;
let score = 0; // NOVO: Pontuação

// --- Variáveis de Spawn ---
let enemySpawnTimer = 0;
const ENEMY_SPAWN_INTERVAL = 2000;

// --- FUNÇÃO DE COLISÃO (Bounding Box) ---
function checkCollision(objA, objB) {
    return (
        objA.x < objB.x + objB.width &&
        objA.x + objA.width > objB.x &&
        objA.y < objB.y + objB.height &&
        objA.y + objA.height > objB.y
    );
}

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

    enemies.push(new Enemy(
        spawnX, spawnY,
        randomType.width, randomType.height,
        randomType.imagePath,
        randomType.maxHealth,
        randomType.speed,
        randomType.fireRate, // Passa o fireRate
        randomType.damage    // Passa o dano
    ));
}



// --- FUNÇÃO PARA DESENHAR HUD ---
function drawHUD() {
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText(`Score: ${score}`, 10, 30);
    if (playerShip && playerShip.isAlive) {
        ctx.fillText(`Health: ${playerShip.health}`, 10, 60);
    } else if (playerShip && !playerShip.isAlive) {
        ctx.font = '50px Arial';
        ctx.fillStyle = 'red';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
    }
    ctx.textAlign = 'left'; // Reseta o alinhamento
}

// --- LOOP PRINCIPAL DO JOGO ---
function gameLoop(timestamp) {
    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;

    // 1. Atualizar e Desenhar o Fundo (SEMPRE PRIMEIRO)
    gameBackground.update(deltaTime);
    gameBackground.draw(ctx);

    if (playerShip.isAlive) {
        // 2. Lógica de SPawn de Inimigos
        enemySpawnTimer += deltaTime;
        if (enemySpawnTimer >= ENEMY_SPAWN_INTERVAL) {
            spawnRandomEnemy();
            enemySpawnTimer -= ENEMY_SPAWN_INTERVAL;
        }

        // 3. Atualizar a lógica dos objetos e Controle
        if (typeof updatePlayerMovement === 'function') {
            updatePlayerMovement();
        }
        playerShip.update(deltaTime);
        // 🚨 AQUI: Chame o método fire() a cada frame para tiro automático
        playerShip.fire();

        // 4. Loop de Atualização, Tiro do Inimigo e Colisão (Player Projectile vs Enemy)
        for (let i = enemies.length - 1; i >= 0; i--) {
            const enemy = enemies[i];

            // Inimigo atira e atualiza
            if (enemy.y > 0 && enemy.y < CANVAS_HEIGHT) {
                enemy.fire(enemyProjectiles);
            }
            enemy.update(deltaTime);

            // Colisão Projétil do Jogador ➡️ Inimigo
            for (let j = playerShip.projectiles.length - 1; j >= 0; j--) {
                const projectile = playerShip.projectiles[j];

                if (checkCollision(projectile, enemy)) {
                    enemy.takeDamage(projectile.damage);
                    projectile.isAlive = false;
                    playerShip.projectiles.splice(j, 1);

                    if (!enemy.isAlive) {
                        score += 100;
                        break;
                    }
                }
            }

            // Remove inimigos
            if (!enemy.isAlive || enemy.y > CANVAS_HEIGHT + enemy.height) {
                enemies.splice(i, 1);
            } else {
                enemy.draw(ctx);
            }
        }

        // 5. Loop de Colisão (Enemy Projectile vs Player)
        for (let i = enemyProjectiles.length - 1; i >= 0; i--) {
            const projectile = enemyProjectiles[i];
            projectile.update(deltaTime);

            if (checkCollision(projectile, playerShip)) {
                playerShip.takeDamage(projectile.damage);
                projectile.isAlive = false;
                enemyProjectiles.splice(i, 1);
            } else if (!projectile.isAlive) {
                enemyProjectiles.splice(i, 1);
            } else {
                projectile.draw(ctx);
            }
        }
    } // Fim do if (playerShip.isAlive)

    // 6. Desenhar

    // Projéteis do jogador
    playerShip.projectiles.forEach(p => { p.draw(ctx); });

    // Jogador
    playerShip.draw(ctx);

    // Projéteis do inimigo
    enemyProjectiles.forEach(p => { p.draw(ctx); });

    // 7. Desenhar HUD
    drawHUD();

    // 8. Pede o próximo frame
    requestAnimationFrame(gameLoop);
}

// Chama a função de inicialização após o carregamento da página
