// ----------------------------------------------------
// CONSTANTES PRINCIPAIS
// ----------------------------------------------------
const MAX_DELTA_TIME_MS = 100; // Máx delta para travar lag


// ----------------------------------------------------
// VARIÁVEIS GLOBAIS
// ----------------------------------------------------
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 900;

canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;

let playerShip;
const enemies = [];
const enemyProjectiles = [];
let gameBackground;
let lastTime = 0;
let score = 0;

let isPaused = false;
// Super Laser
let superLaserAvailable = true;
let requiredScoreForNextLaser = 0;
let superLaserUsed = false;
let superLaserCharge = 0;
const SUPER_LASER_REQUIREMENT = 100;

// Upgrade Weapon - armas
let nextWeaponUpgradeCost = 200;

// Spawn de inimigos
let enemySpawnTimer = 0;
const ENEMY_SPAWN_INTERVAL = 2000;

// ----------------------------------------------------
// PICKUP DE VIDA (NOVO)
// ----------------------------------------------------
const pickups = [];
let nextHealthPickupScore = 100;
const HEALTH_PICKUP_VALUE = 30;
const HEALTH_PICKUP_IMAGE = "../assets/img/pickup/concerto.png";

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


function updateHTMLHUD() {
    if (!playerShip) return;

    // Score
    document.getElementById("scoreValue").textContent = score;

    // Hull Text
    document.getElementById("hullValue").textContent =
        `${Math.max(0, playerShip.health)} / ${playerShip.maxHealth}`;

    // Health Bar %
    let percent = playerShip.health / playerShip.maxHealth;
    document.getElementById("healthBar").style.width = (150 * percent) + "px";

    // Cores iguais ao seu drawHUD()
    if (percent > 0.5) {
        healthBar.style.background = "#32cd32"; // verde
    } else if (percent > 0.2) {
        healthBar.style.background = "#ffc107"; // amarelo
    } else {
        healthBar.style.background = "#dc3545"; // vermelho
    }

    // Weapon Level
    document.getElementById("weaponValue").textContent = playerShip.weaponLevel;
}

// ----------------------------------------------------
// GAME LOOP
// ----------------------------------------------------
function gameLoop(timestamp) {

    
    let deltaTime = timestamp - lastTime;
    lastTime = timestamp;


    // Se estiver pausado, interrompe a execução da lógica
    if (isPaused) {
        // Apenas continua pedindo o próximo frame, mantendo a tela atualizada
        requestAnimationFrame(gameLoop);
        return; 
    }

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


    if (currentBoss && currentBoss.isAlive) {
        currentBoss.update(deltaTime);
        currentBoss.fire(enemyProjectiles);
        currentBoss.draw(ctx); // usa o draw específico do Boss
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


        // 🔥 Colisão dos tiros do player com o Boss
        if (currentBoss && currentBoss.isAlive) {
            for (let j = playerShip.projectiles.length - 1; j >= 0; j--) {
                const projectile = playerShip.projectiles[j];

                if (checkCollision(projectile, currentBoss)) {

                    const before = currentBoss.currentHealth;

                    currentBoss.takeDamage(projectile.damage);

                    console.log(
                        `%cBOSS HP: ${before} → ${currentBoss.currentHealth} (dano: ${projectile.damage})`,
                        'color: yellow; font-size: 16px; font-weight: bold;'
                    );

                    projectile.isAlive = false;
                    playerShip.projectiles.splice(j, 1);
                }

            }
        }

        // Inimigos
        for (let i = enemies.length - 1; i >= 0; i--) {

            const enemy = enemies[i];

            if (!playerShip.superLaserActive && enemy.y > 0 && enemy.y < CANVAS_HEIGHT) {
                enemy.fire(enemyProjectiles);
            }

            enemy.update(deltaTime);

            // Colisão de projéteis normais
            for (let j = playerShip.projectiles.length - 1; j >= 0; j--) {
                const projectile = playerShip.projectiles[j];

                if (checkCollision(projectile, enemy)) {
                    enemy.takeDamage(projectile.damage);
                    projectile.isAlive = false;
                    playerShip.projectiles.splice(j, 1);

                    if (!enemy.isAlive) {
                        // CORREÇÃO 1: Usa o valor de pontuação do inimigo
                        score += enemy.scoreValue;

                        // CORREÇÃO 2: Usa o valor do inimigo para carregar o Super Laser
                        superLaserCharge = Math.min(
                            superLaserCharge + enemy.scoreValue, // Ajustado para ser dinâmico
                            SUPER_LASER_REQUIREMENT
                        );
                        // NOTA: Se você quiser evitar pontuação dupla de outros tiros
                        // no mesmo frame, adicione 'break;' aqui.
                    }
                }
            }

            // Remoção e Desenho de Inimigos
            if (!enemy.isAlive || enemy.y > CANVAS_HEIGHT + enemy.height) {
                enemies.splice(i, 1);
            } else {
                enemy.draw(ctx);
            }
        }


        // Super laser
        if (playerShip.superLaserActive) {
            // 1. Aplica Dano e Pontua
            for (let i = enemies.length - 1; i >= 0; i--) {
                const enemy = enemies[i];

                if (enemy.isAlive) {
                    const wasAlive = enemy.isAlive;
                    // O dano é aplicado em cada frame que o laser estiver ativo
                    enemy.takeDamage(playerShip.superLaserDamage);

                    if (wasAlive && !enemy.isAlive) {
                        // CORREÇÃO 3: Usa o valor de pontuação do inimigo
                        score += enemy.scoreValue;
                    }
                }
            }

            // 2. Remove todos os inimigos que foram destruídos
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

updateHTMLHUD();


    if (typeof updateUpgradeButton === 'function') {
        updateUpgradeButton();
    }

    requestAnimationFrame(gameLoop);
}


function endGame() {
    setTimeout(() => {
        alert("🎉 Você derrotou o chefe!");

        // Recarrega a página e volta para a tela inicial
        location.reload();

    }, 800);
}
