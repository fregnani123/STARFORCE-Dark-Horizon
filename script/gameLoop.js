// GAME LOOP TRANSFERIDO PARA UM ARQUIVO PROPRIO gameLoop.js
// VARIÁVEL DE CONTROLE GLOBAL: Rastreia se o vídeo de abertura já foi exibido.

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

    // Fundo do jogo — PARALLAX correto
    if (gameBackgrounds && gameBackgrounds.length > 0) {

        for (const bg of gameBackgrounds) {
            bg.update(deltaTime);
            bg.draw(ctx);
        }

    } else {
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    }

    // Boss
    if (currentBoss && currentBoss.isAlive) {
        currentBoss.update(deltaTime);
        currentBoss.fire(enemyProjectiles);
        currentBoss.draw(ctx);
    }

    // PLAYER
    if (playerShip && playerShip.isAlive) {

        // Spawn inimigos e pickups
        if (!playerShip.inIntro && !playerShip.superLaserActive) {
            enemySpawnTimer += deltaTime;

            if (enemySpawnTimer >= ENEMY_SPAWN_INTERVAL) {
                if (typeof spawnRandomEnemy === 'function') {
                    spawnRandomEnemy(score);
                }
                enemySpawnTimer -= ENEMY_SPAWN_INTERVAL;
            }

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

        // Atualiza projéteis do player
        for (let i = playerShip.projectiles.length - 1; i >= 0; i--) {
            const projectile = playerShip.projectiles[i];

            projectile.update(deltaTime);

            if (projectile.y + projectile.height < 0) {
                playerShip.projectiles.splice(i, 1);
            }
        }

        // Guiamento dos mísseis
        for (const projectile of playerShip.projectiles) {
            if (projectile.isGuided) {
                if (!projectile.target || !projectile.target.isAlive) {
                    projectile.target = findNearestEnemy(projectile, enemies);
                }
            }
        }

        // Tiro no Boss
        if (currentBoss && currentBoss.isAlive) {
            for (let j = playerShip.projectiles.length - 1; j >= 0; j--) {
                const projectile = playerShip.projectiles[j];

                if (checkCollision(projectile, currentBoss)) {

                    const before = currentBoss.currentHealth;
                    currentBoss.takeDamage(projectile.damage, particles);

                    console.log(
                        `%cBOSS HP: ${before} → ${currentBoss.currentHealth} (dano: ${projectile.damage})`,
                        'color: yellow; font-size: 16px; font-weight: bold;'
                    );

                    projectile.isAlive = false;
                    playerShip.projectiles.splice(j, 1);
                }
            }
        }

        // INIMIGOS
        for (let i = enemies.length - 1; i >= 0; i--) {

            const enemy = enemies[i];

            // tiros dos inimigos
            if (!playerShip.superLaserActive && enemy.y > 0 && enemy.y < CANVAS_HEIGHT) {
                enemy.fire(enemyProjectiles);
            }

            enemy.update(deltaTime);

            // pontuação
            if (enemy.isExploding && enemy.isScored) {
                score += enemy.scoreValue;
                superLaserCharge = Math.min(
                    superLaserCharge + enemy.scoreValue,
                    SUPER_LASER_REQUIREMENT
                );
                enemy.isScored = false;
            }


            // ---------------------------------------------
            // COLISÃO PROJÉTEIS PLAYER > INIMIGO
            // ---------------------------------------------
            for (let j = playerShip.projectiles.length - 1; j >= 0; j--) {
                const projectile = playerShip.projectiles[j];

                if (checkCollision(projectile, enemy)) {

                    enemy.takeDamage(projectile.damage, particles);

                    projectile.isAlive = false;
                    playerShip.projectiles.splice(j, 1);

                    // se o inimigo acabou de morrer → spawn das estrelas
                    if (enemy.isExploding) {
                        spawnStarPickups(enemy);

                        break;
                    }
                }
            }

            // remove ou desenha
            if (!enemy.isAlive || enemy.y > CANVAS_HEIGHT + enemy.height) {
                enemies.splice(i, 1);
                playExplosionSound();
            } else {
                enemy.draw(ctx);
            }
        }

        // PARTÍCULAS
        for (let i = particles.length - 1; i >= 0; i--) {
            const particle = particles[i];
            particle.update();
            if (!particle.isAlive) particles.splice(i, 1);
        }

        // ---------------------------------------------
        // PICKUPS (ÚNICO BLOCO REAL)
        // ---------------------------------------------


        // Loop das pickups
        for (let i = pickups.length - 1; i >= 0; i--) {
            const pickup = pickups[i];

            // Calcula centro da pickup
            const px = pickup.x + pickup.width / 2;
            const py = pickup.y + pickup.height / 2;

            // Centro do player
            const sx = playerShip.x + playerShip.width / 2;
            const sy = playerShip.y + playerShip.height / 2;

            const dx = sx - px;
            const dy = sy - py;

            const distance = Math.sqrt(dx * dx + dy * dy);

            // Magnetismo
            if (distance < magnetRadius) {
                const pull = magnetStrength * (1 - distance / magnetRadius);
                pickup.x += (dx / distance) * pull * 60;
                pickup.y += (dy / distance) * pull * 60;
            }

            // Atualiza posição da pickup
            pickup.update(deltaTime);

            // Coleta
            if (checkCollision(playerShip, pickup)) {
                pickup.applyEffect(playerShip);
                playCoinSound(); // toca som
                pickups.splice(i, 1);
                continue;
            }

            // Remove se fora da tela
            if (pickup.y > CANVAS_HEIGHT + 50) {
                pickups.splice(i, 1);
                continue;
            }

            // Desenha a pickup
            pickup.draw(ctx);
        }


        // SUPER LASER
        if (playerShip.superLaserActive) {

            for (let i = enemies.length - 1; i >= 0; i--) {
                const enemy = enemies[i];

                if (enemy.isAlive) {
                    const wasAlive = enemy.isAlive;
                    enemy.takeDamage(playerShip.superLaserDamage);

                    if (wasAlive && !enemy.isAlive) {
                        score += enemy.scoreValue;
                    }
                }
            }

            enemies.splice(0, enemies.length, ...enemies.filter(e => e.isAlive));
        }

        // PROJÉTEIS INIMIGOS
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

    // desenha projéteis e nave
    if (playerShip) {
        playerShip.projectiles.forEach(p => p.draw(ctx));
        playerShip.draw(ctx);
    }

    // partículas
    particles.forEach(p => p.draw(ctx));

    updateHTMLHUD();

    if (typeof updateUpgradeButton === 'function') {
        updateUpgradeButton();
    }

   
    requestAnimationFrame(gameLoop);
}
