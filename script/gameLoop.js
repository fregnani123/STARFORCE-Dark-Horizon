// ===============================
// GAME LOOP — FINAL CORRIGIDO
// Arquivo: gameLoop.js
// ===============================

// 🛑 VARIÁVEIS GLOBAIS NECESSÁRIAS (ADICIONE ISTO NO SEU ARQUIVO PRINCIPAL SE JÁ NÃO EXISTIR)
// Para o propósito deste bloco de código, definiremos aqui para garantir que não haja erros de referência.
if (typeof BACKGROUND_SPEED_DIVISOR === 'undefined') {
    // Valor usado na sua classe Background.js (Geralmente 5000 ou o valor ajustado para aceleração)
    window.BACKGROUND_SPEED_DIVISOR = 5000; 
}

// Variável global para armazenar o deslocamento Y do background neste frame
let BACKGROUND_SPEED_Y = 0; 
// --------------------------------------------------------------------------------------------------

function gameLoop(timestamp) {

    
    let deltaTime = timestamp - lastTime;
    lastTime = timestamp;

    if (isPaused) {
        requestAnimationFrame(gameLoop);
        return;
    }

    if (deltaTime > MAX_DELTA_TIME_MS) {
        deltaTime = MAX_DELTA_TIME_MS;
    }

    updateSuperLaserButton();

    // ---------------------------------------------
    // BACKGROUND & CÁLCULO DE SCROLL SPEED 🛑 CORREÇÃO AQUI
    // ---------------------------------------------
    
    // Reinicia BACKGROUND_SPEED_Y
    BACKGROUND_SPEED_Y = 0; 
    
    if (gameBackgrounds && gameBackgrounds.length > 0) {
        // 1. Calcula a velocidade de rolagem (deslocamento) do background principal para este frame
        const mainBg = gameBackgrounds[0];
        
        if (mainBg.isScrolling && mainBg.speed && window.BACKGROUND_SPEED_DIVISOR) {
             // 🛑 ATRIBUIÇÃO: Calcula o deslocamento Y para ser usado na compensação de movimento
             BACKGROUND_SPEED_Y = (mainBg.speed * deltaTime) / window.BACKGROUND_SPEED_DIVISOR; 
        }

        // 2. Atualiza e desenha todos os backgrounds
        for (const bg of gameBackgrounds) {
            bg.update(deltaTime);
            bg.draw(ctx);
        }
    } else {
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    }

    // ---------------------------------------------
    // BOSS
    // ---------------------------------------------
    if (currentBoss && currentBoss.isAlive) {
        // Se o BOSS também precisa de compensação de scroll, passe BACKGROUND_SPEED_Y aqui
        currentBoss.update(deltaTime, BACKGROUND_SPEED_Y); 
        currentBoss.fire(enemyProjectiles);
        currentBoss.draw(ctx);
    }

    // ---------------------------------------------
    // PLAYER
    // ---------------------------------------------
    if (playerShip && playerShip.isAlive) {

        // Spawn inimigos e pickups
        if (!playerShip.inIntro && !playerShip.superLaserActive) {

            enemySpawnTimer += deltaTime;

            if (enemySpawnTimer >= ENEMY_SPAWN_INTERVAL) {
                if (typeof spawnRandomEnemy === "function") {
                    spawnRandomEnemy(playerShip, score);
                }
                enemySpawnTimer -= ENEMY_SPAWN_INTERVAL;
            }

            if (score >= nextHealthPickupScore && playerShip.health < playerShip.maxHealth) {
                if (typeof spawnHealthPickup === "function") {
                    spawnHealthPickup();
                }
                nextHealthPickupScore += 50;
            }
        }

        // Movimento player
        if (typeof updatePlayerMovement === "function") {
            updatePlayerMovement();
        }

        playerShip.update(deltaTime);
        playerShip.fire();

        // ---------------------------------------------
        // PROJÉTEIS DO PLAYER
        // ---------------------------------------------
        for (let i = playerShip.projectiles.length - 1; i >= 0; i--) {
            const projectile = playerShip.projectiles[i];

            // Se os projéteis precisam de compensação de scroll (se o player ficasse fixo e o mundo movesse)
            // projectile.update(deltaTime, BACKGROUND_SPEED_Y); 
            projectile.update(deltaTime); // Assumindo que o projétil se move com a referência do mundo.

            if (!projectile.isAlive || projectile.y + projectile.height < 0) {
                playerShip.projectiles.splice(i, 1);
            }
        }

        // Guiamento
        for (const projectile of playerShip.projectiles) {
            if (projectile.isGuided) {
                if (!projectile.target || !projectile.target.isAlive) {
                    projectile.target = findNearestEnemy(projectile, enemies);
                }
            }
        }

        // ---------------------------------------------
        // PLAYER → BOSS
        // ---------------------------------------------
        if (currentBoss && currentBoss.isAlive) {
            for (let j = playerShip.projectiles.length - 1; j >= 0; j--) {
                const projectile = playerShip.projectiles[j];

                if (checkCollision(projectile, currentBoss)) {
                    currentBoss.takeDamage(projectile.damage, particles);
                    projectile.isAlive = false;
                    playerShip.projectiles.splice(j, 1);
                }
            }
        }

        // ---------------------------------------------
        // INIMIGOS
        // ---------------------------------------------
        for (let i = enemies.length - 1; i >= 0; i--) {

            const enemy = enemies[i];

            // 🛑 AGORA BACKGROUND_SPEED_Y ESTÁ DEFINIDO E É PASSADO
            enemy.update(deltaTime, enemyProjectiles, BACKGROUND_SPEED_Y);

            if (enemy.isExploding && enemy.isScored) {
                score += enemy.scoreValue;
                superLaserCharge = Math.min(
                    superLaserCharge + enemy.scoreValue,
                    SUPER_LASER_REQUIREMENT
                );
                enemy.isScored = false;
            }

            // Player → Inimigo
            for (let j = playerShip.projectiles.length - 1; j >= 0; j--) {
                const projectile = playerShip.projectiles[j];

                if (checkCollision(projectile, enemy)) {
                    enemy.takeDamage(projectile.damage, particles);
                    projectile.isAlive = false;
                    playerShip.projectiles.splice(j, 1);

                    if (enemy.isExploding) {
                        spawnStarPickups(enemy);
                        break;
                    }
                }
            }

            if (!enemy.isAlive || enemy.y > CANVAS_HEIGHT + enemy.height) {
                enemies.splice(i, 1);
                playExplosionSound();
            } else {
                enemy.draw(ctx);
            }
        }

        // ---------------------------------------------
        // PARTÍCULAS
        // ---------------------------------------------
        for (let i = particles.length - 1; i >= 0; i--) {
            particles[i].update();
            if (!particles[i].isAlive) particles.splice(i, 1);
        }

    // ---------------------------------------------
// PICKUPS (ÚNICO LOOP)
// ---------------------------------------------
for (let i = pickups.length - 1; i >= 0; i--) {
    const pickup = pickups[i];

    // 🛑 CORREÇÃO AQUI: Passando playerShip E BACKGROUND_SPEED_Y para o update do Pickup.
    // Isso ativa tanto o magnetismo (playerShip) quanto a compensação de rolagem (BACKGROUND_SPEED_Y).
    pickup.update(deltaTime, playerShip, BACKGROUND_SPEED_Y); 

    if (checkCollision(playerShip, pickup)) {
        pickup.applyEffect(playerShip);
        playCoinSound();
        pickups.splice(i, 1);
        continue;
    }

    if (!pickup.isAlive || pickup.y > CANVAS_HEIGHT + 50) {
        pickups.splice(i, 1);
        continue;
    }

    pickup.draw(ctx);
}

        // ---------------------------------------------
        // SUPER LASER
        // ---------------------------------------------
        if (playerShip.superLaserActive) {
            for (let i = enemies.length - 1; i >= 0; i--) {
                const enemy = enemies[i];

                if (enemy.isAlive) {
                    enemy.takeDamage(playerShip.superLaserDamage);

                    if (enemy.isExploding && enemy.isScored) {
                        score += enemy.scoreValue;
                        superLaserCharge = Math.min(
                            superLaserCharge + enemy.scoreValue,
                            SUPER_LASER_REQUIREMENT
                        );
                        enemy.isScored = false;
                    }
                }
            }
        }

        // ---------------------------------------------
        // PROJÉTEIS INIMIGOS
        // ---------------------------------------------
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
    }

    // ---------------------------------------------
    // DESENHO FINAL
    // ---------------------------------------------
    if (playerShip) {
        playerShip.projectiles.forEach(p => p.draw(ctx));
        playerShip.draw(ctx);
    }

    particles.forEach(p => p.draw(ctx));

    updateHTMLHUD();

    if (typeof updateUpgradeButton === "function") {
        updateUpgradeButton();
    }

    requestAnimationFrame(gameLoop);
}