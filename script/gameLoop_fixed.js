// ======================================================
// IMPORTS OBRIGATÓRIOS (ORQUESTRAÇÃO DO JOGO)
// ======================================================
import { 
    lastTime, isPaused, MAX_DELTA_TIME_MS, 
    CANVAS_WIDTH, CANVAS_HEIGHT, ctx, 
    playerShip, enemies, enemyProjectiles, currentBoss, gameBackgrounds, 
    score, superLaserCharge, SUPER_LASER_REQUIREMENT, 
    enemySpawnTimer, ENEMY_SPAWN_INTERVAL, nextHealthPickupScore, 
    particles, pickups, BACKGROUND_SPEED_DIVISOR,
    // 🛑 IMPORTAÇÃO DOS SETTERS PARA MODIFICAR O ESTADO GLOBAL 🛑
    setLastTime, 
    setEnemySpawnTimer,
    updateScore,
    updateSuperLaserCharge,
    // 🛑 CORREÇÃO CRÍTICA: Adicionar o setter de Health Pickup
    setNextHealthPickupScore,
} from './globals.js'; 

// Importa funções de utilidade e controle
import { checkCollision, findNearestEnemy } from './utils.js'; 
import { updateSuperLaserButton, updateUpgradeButton } from './btnUpdate.js';
import { spawnRandomEnemy } from './Spawn.js'; 
import { spawnHealthPickup, spawnStarPickups } from './spawnItem.js'; 
import { updatePlayerMovement, updateHTMLHUD } from './controle.js';
import { playExplosionSound, playCoinSound } from './audio_game.js';

// Variável local para o deslocamento do background neste frame
let BACKGROUND_SPEED_Y = 0; 
// Acumulador para score por movimento
let movementScoreAccumulator = 0;
// --------------------------------------------------------------------------------------------------

/**
 * Função principal do Game Loop.
 * @param {DOMHighResTimeStamp} timestamp - Tempo atual fornecido pelo requestAnimationFrame.
 */
export function gameLoop(timestamp) {

    // --- 1. CÁLCULO DO DELTA TIME E PAUSA ---
    let deltaTime = timestamp - lastTime;

// 🛑 ADICIONE ISSO AQUI: Limpa o canvas COMPLETAMENTE antes de desenhar
    ctx.save(); // Salva o estado do contexto
    ctx.setTransform(1, 0, 0, 1, 0, 0); // Reseta qualquer translação/zoom
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT); // Limpa rastro
    ctx.fillStyle = "black"; // Ou a cor do seu fundo
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.restore(); // Restaura para os desenhos seguintes
    
    setLastTime(timestamp); 

    if (isPaused) {
        requestAnimationFrame(gameLoop);
        return;
    }

    if (deltaTime > MAX_DELTA_TIME_MS) {
        deltaTime = MAX_DELTA_TIME_MS;
    }

    updateSuperLaserButton(); 

    // ---------------------------------------------
    // BACKGROUND & CÁLCULO DE SCROLL SPEED
    // ---------------------------------------------
   // ---------------------------------------------
    // BACKGROUND & LIMPEZA DE TELA
    // ---------------------------------------------
    BACKGROUND_SPEED_Y = 0; 

    // 🛑 CORREÇÃO DEFINITIVA DO RASTRO (FLASH) 🛑
    // Em vez de clearRect, usamos fillRect preto para atropelar qualquer rastro de movimento.
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    if (gameBackgrounds && gameBackgrounds.length > 0) {
        // ... restante do código do background ...
        const mainBg = gameBackgrounds[0];
        
        if (mainBg.isScrolling && mainBg.speed && BACKGROUND_SPEED_DIVISOR) {
            BACKGROUND_SPEED_Y = (mainBg.speed * deltaTime) / BACKGROUND_SPEED_DIVISOR; 
        }

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
        currentBoss.update(deltaTime, BACKGROUND_SPEED_Y); 
        currentBoss.fire(enemyProjectiles);
        currentBoss.draw(ctx);
    }

    // PLAYER & SPAWN
    // --------------------------------------------- 
    if (playerShip && playerShip.isAlive) {

        // Spawn inimigos e pickups
        if (!playerShip.inIntro && !playerShip.superLaserActive) {

            // Usa Setter para manipular enemySpawnTimer
            setEnemySpawnTimer(enemySpawnTimer + deltaTime); 
            
            if (enemySpawnTimer >= ENEMY_SPAWN_INTERVAL) {
                spawnRandomEnemy(playerShip); 
                // Usa Setter para subtrair do timer
                setEnemySpawnTimer(enemySpawnTimer - ENEMY_SPAWN_INTERVAL);
            }

            // Lógica de spawn de vida
            if (score >= nextHealthPickupScore && playerShip.health < playerShip.maxHealth) {
                spawnHealthPickup(); 
                // 🛑 CORREÇÃO FINAL: Usa Setter para nextHealthPickupScore (Linha 110)
                setNextHealthPickupScore(nextHealthPickupScore + 50);
            }
        }

        // Movimento player
        updatePlayerMovement(); 
        playerShip.update(deltaTime);
        const newProjectiles = playerShip.fire(); 
        playerShip.projectiles.push(...newProjectiles);
        
        // --- PROJÉTEIS DO PLAYER ---
        for (let i = playerShip.projectiles.length - 1; i >= 0; i--) {
            const projectile = playerShip.projectiles[i];
            projectile.update(deltaTime);
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

        // --- COLISÃO PLAYER PROJÉTEIS → BOSS ---
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

        // --- INIMIGOS ---
        for (let i = enemies.length - 1; i >= 0; i--) {
            const enemy = enemies[i];
            enemy.update(deltaTime, enemyProjectiles, BACKGROUND_SPEED_Y);

            // Lógica de pontuação e superLaserCharge (Na destruição do inimigo)
            if (enemy.isExploding && enemy.isScored) {
                updateScore(enemy.scoreValue); 

                const newCharge = Math.min(
                    superLaserCharge + enemy.scoreValue,
                    SUPER_LASER_REQUIREMENT
                );
                updateSuperLaserCharge(newCharge);

                enemy.isScored = false;
            }

            // Colisão Player Projéteis → Inimigo
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

        // --- PARTÍCULAS ---
        for (let i = particles.length - 1; i >= 0; i--) {
            particles[i].update();
            if (!particles[i].isAlive) particles.splice(i, 1);
        }

        // --- PICKUPS (Colisão com Player) ---
        for (let i = pickups.length - 1; i >= 0; i--) {
            const pickup = pickups[i];

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

        // --- SUPER LASER (Dano Ao Inimigo) ---
        if (playerShip.superLaserActive) {
            for (let i = enemies.length - 1; i >= 0; i--) {
                const enemy = enemies[i];

                if (enemy.isAlive) {
                    enemy.takeDamage(playerShip.superLaserDamage, particles); 

                    // Lógica de pontuação/carga (Repetida, mas necessária para dano do laser)
                    if (enemy.isExploding && enemy.isScored) {
                        updateScore(enemy.scoreValue); 
                        
                        const newCharge = Math.min(
                            superLaserCharge + enemy.scoreValue,
                            SUPER_LASER_REQUIREMENT
                        );
                        updateSuperLaserCharge(newCharge);

                        enemy.isScored = false;
                    }
                }
            }
            // Limpa projéteis inimigos quando o laser está ativo (Mutação direta do Array Const)
            enemyProjectiles.length = 0; 
        }

        // --- PROJÉTEIS INIMIGOS (Colisão com Player) ---
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
    updateUpgradeButton(); 

    // Chama o próximo frame (recursividade do Game Loop)
    requestAnimationFrame(gameLoop); 
}
