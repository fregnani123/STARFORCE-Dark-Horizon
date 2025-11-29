// ----------------------------------------------------
// CONSTANTES PRINCIPAIS
// ----------------------------------------------------
const MAX_DELTA_TIME_MS = 100; // Máx delta para travar lag


// ----------------------------------------------------
// VARIÁVEIS GLOBAIS
// ----------------------------------------------------
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const CANVAS_WIDTH = 500;
const CANVAS_HEIGHT = 800;

canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;

let playerShip;
const enemies = [];
const enemyProjectiles = [];
let gameBackground;
let lastTime = 0;
let score = 0;

// Super Laser
let superLaserAvailable = true;
let requiredScoreForNextLaser = 0;
let superLaserUsed = false;
let superLaserCharge = 0;
const SUPER_LASER_REQUIREMENT = 500;

// Upgrade Weapon
let nextWeaponUpgradeCost = 100;

// Spawn de inimigos
let enemySpawnTimer = 0;
const ENEMY_SPAWN_INTERVAL = 2000;

// ----------------------------------------------------
// PICKUP DE VIDA (NOVO)
// ----------------------------------------------------
const pickups = [];
let nextHealthPickupScore = 100;
const HEALTH_PICKUP_VALUE = 30;
const HEALTH_PICKUP_IMAGE = "../assets/img/concerto.png";

// ----------------------------------------------------
// FUNÇÕES DE SUPORTE
// ----------------------------------------------------
function checkCollision(objA, objB) {
    return (
        objA.x < objB.x + objB.width &&
        objA.x + objA.width > objB.x &&
        objA.y < objB.y + objB.height &&
        objA.y + objA.height > objB.y
    );
}

function findNearestEnemy(projectile) {
    let nearestEnemy = null;
    let minDistanceSq = Infinity;

    const projCenterX = projectile.x + projectile.width / 2;
    const projCenterY = projectile.y + projectile.height / 2;

    for (const enemy of enemies) {
        if (enemy.isAlive && enemy.y > 0) {
            const enemyCenterX = enemy.x + enemy.width / 2;
            const enemyCenterY = enemy.y + enemy.height / 2;

            const dx = enemyCenterX - projCenterX;
            const dy = enemyCenterY - projCenterY;
            const distanceSq = dx * dx + dy * dy;

            if (distanceSq < minDistanceSq) {
                minDistanceSq = distanceSq;
                nearestEnemy = enemy;
            }
        }
    }
    return nearestEnemy;
}

// ----------------------------------------------------
// HUD
// ----------------------------------------------------
function drawHUD() {
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.textAlign = 'left';

    const PADDING = 20;
    const HUD_Y = CANVAS_HEIGHT - PADDING;

    const BAR_X = PADDING;
    const BAR_Y = HUD_Y - 40;
    const BAR_MAX_WIDTH = 200;
    const BAR_HEIGHT = 15;

    ctx.fillText(`Score: ${score}`, BAR_X, HUD_Y);

    if (playerShip && playerShip.isAlive) {

        ctx.fillStyle = 'white';
        ctx.font = '16px Arial';
        ctx.fillText(
            `HULL: ${Math.max(0, playerShip.health)} / ${playerShip.maxHealth}`,
            BAR_X,
            BAR_Y - 5
        );

        ctx.fillStyle = '#404040';
        ctx.fillRect(BAR_X, BAR_Y, BAR_MAX_WIDTH, BAR_HEIGHT);

        const currentHealthWidth = BAR_MAX_WIDTH * (playerShip.health / playerShip.maxHealth);

        if (playerShip.health > playerShip.maxHealth * 0.5) {
            ctx.fillStyle = '#32cd32';
        } else if (playerShip.health > playerShip.maxHealth * 0.2) {
            ctx.fillStyle = '#ffc107';
        } else {
            ctx.fillStyle = '#dc3545';
        }

        ctx.fillRect(BAR_X, BAR_Y, currentHealthWidth, BAR_HEIGHT);

        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.strokeRect(BAR_X, BAR_Y, BAR_MAX_WIDTH, BAR_HEIGHT);

        ctx.fillStyle = 'white';
        ctx.font = '20px Arial';
        ctx.fillText(`Weapon Lvl: ${playerShip.weaponLevel}`, CANVAS_WIDTH - 150, HUD_Y - 30);
    }

    ctx.textAlign = 'left';
}

// ----------------------------------------------------
// GAME LOOP
// ----------------------------------------------------
function gameLoop(timestamp) {
    let deltaTime = timestamp - lastTime;
    lastTime = timestamp;

    if (deltaTime > MAX_DELTA_TIME_MS) {
        deltaTime = MAX_DELTA_TIME_MS;
    }

    // 🔥 Atualiza a % do Super Laser no botão
    updateSuperLaserButton();

    // Fundo
    if (gameBackground) {
        gameBackground.update(deltaTime);
        gameBackground.draw(ctx);
    } else {
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    }

    if (playerShip && playerShip.isAlive) {

        // Spawn de inimigos
        if (!playerShip.inIntro && !playerShip.superLaserActive) {
            enemySpawnTimer += deltaTime;
            if (enemySpawnTimer >= ENEMY_SPAWN_INTERVAL) {
                if (typeof spawnRandomEnemy === 'function') {
                    spawnRandomEnemy(score); // passa o score atual
                }
                enemySpawnTimer -= ENEMY_SPAWN_INTERVAL;
            }

            // PICKUP DE VIDA
            if (score >= nextHealthPickupScore && playerShip.health < playerShip.maxHealth) {
                if (typeof spawnHealthPickup === 'function') {
                    spawnHealthPickup();
                }
                nextHealthPickupScore += 100;
            }
        }

        // Movimento do player
        if (typeof updatePlayerMovement === 'function') {
            updatePlayerMovement();
        }

        playerShip.update(deltaTime);
        playerShip.fire();

        // Projetéis do player
        for (let i = playerShip.projectiles.length - 1; i >= 0; i--) {
            const projectile = playerShip.projectiles[i];

            projectile.update(deltaTime);
            if (projectile.y + projectile.height < 0) {
                playerShip.projectiles.splice(i, 1);
            }
        }

        // Arma guiada
        for (const projectile of playerShip.projectiles) {
            if (projectile.isGuided && !projectile.target) {
                projectile.target = findNearestEnemy(projectile);
            }
            if (projectile.isGuided && projectile.target && !projectile.target.isAlive) {
                projectile.target = findNearestEnemy(projectile);
            }
        }

        // Inimigos
        for (let i = enemies.length - 1; i >= 0; i--) {
            const enemy = enemies[i];

            if (!playerShip.superLaserActive && enemy.y > 0 && enemy.y < CANVAS_HEIGHT) {
                enemy.fire(enemyProjectiles);
            }

            enemy.update(deltaTime);

            for (let j = playerShip.projectiles.length - 1; j >= 0; j--) {
                const projectile = playerShip.projectiles[j];

                if (checkCollision(projectile, enemy)) {
                    enemy.takeDamage(projectile.damage);
                    projectile.isAlive = false;
                    playerShip.projectiles.splice(j, 1);

                    if (!enemy.isAlive) {
                        score += 100;
                        superLaserCharge = Math.min(
                            superLaserCharge + 100,
                            SUPER_LASER_REQUIREMENT
                        );
                    }
                }
            }

            if (!enemy.isAlive || enemy.y > CANVAS_HEIGHT + enemy.height) {
                enemies.splice(i, 1);
            } else {
                enemy.draw(ctx);
            }
        }

        // Super laser
        if (playerShip.superLaserActive) {
            for (let i = enemies.length - 1; i >= 0; i--) {
                const enemy = enemies[i];

                if (enemy.isAlive) {
                    const wasAlive = enemy.isAlive;
                    enemy.takeDamage(playerShip.superLaserDamage);

                    if (wasAlive && !enemy.isAlive) {
                        score += 100;
                    }
                }
            }

            enemies.splice(
                0,
                enemies.length,
                ...enemies.filter(e => e.isAlive)
            );
        }

        // Projetéis inimigos
        if (!playerShip.superLaserActive) {
            for (let i = enemyProjectiles.length - 1; i >= 0; i--) {
                const projectile = enemyProjectiles[i];

                projectile.update(deltaTime);

                if (checkCollision(projectile, playerShip)) {
                    playerShip.takeDamage(projectile.damage);
                    projectile.isAlive = false;
                    enemyProjectiles.splice(i, 1);
                } else if (!projectile.isAlive || projectile.y > CANVAS_HEIGHT) {
                    enemyProjectiles.splice(i, 1);
                } else {
                    projectile.draw(ctx);
                }
            }
        } else {
            enemyProjectiles.length = 0;
        }

        // PICKUPS
        for (let i = pickups.length - 1; i >= 0; i--) {
            const pickup = pickups[i];

            pickup.update(deltaTime);

            if (checkCollision(pickup, playerShip)) {
                pickup.applyEffect(playerShip);
            }

            if (!pickup.isAlive || pickup.y > CANVAS_HEIGHT) {
                pickups.splice(i, 1);
            } else {
                pickup.draw(ctx);
            }
        }
    }

    // Desenha projéteis
    if (playerShip) {
        playerShip.projectiles.forEach(p => p.draw(ctx));
        playerShip.draw(ctx);
    }

    drawHUD();

    if (typeof updateUpgradeButton === 'function') {
        updateUpgradeButton();
    }

    requestAnimationFrame(gameLoop);
}
