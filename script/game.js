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
let particles = []; // 🚀 DECLARAÇÃO ESSENCIAL: Array para gerenciar todas as partículas ativas
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

    // --- 1. Atualização de Score e Vida (Mantido) ---
    document.getElementById("scoreValue").textContent = score;
    // ... (Seu código para Health Bar) ...
    const healthBar = document.getElementById("healthBar");
    let percent = playerShip.health / playerShip.maxHealth;
    if (healthBar) {
        healthBar.style.width = (150 * percent) + "px";
        if (percent > 0.5) {
            healthBar.style.background = "#32cd32";
        } else if (percent > 0.2) {
            healthBar.style.background = "#ffc107";
        } else {
            healthBar.style.background = "#dc3545";
        }
    }

    // --- 2. Atualiza o Nível da Arma (id="weaponValue") ---
    const weaponValueDisplay = document.getElementById("weaponValue");
    if (weaponValueDisplay) {
        weaponValueDisplay.textContent = playerShip.weaponLevel;
        if (playerShip.weaponLevel >= playerShip.maxWeaponLevel) {
            weaponValueDisplay.style.color = '#32cd32';
        } else {
            weaponValueDisplay.style.color = 'white';
        }
    }

    // --- 3. Foco Total no Botão de Upgrade: MOSTRAR APENAS A PORCENTAGEM ---
    const upgradeButton = document.getElementById('upgradeButton');
    // Assumimos que a porcentagem vai no rótulo principal que as imagens mostram
    const upgradeLabelSpan = upgradeButton ? upgradeButton.querySelector('.upgrade-label') : null;
    const upgradePercentDisplay = document.getElementById('upgradePercent'); // Este será usado apenas para o custo se necessário.

    if (upgradeButton && upgradeLabelSpan) {

        if (playerShip.weaponLevel >= playerShip.maxWeaponLevel) {
            // Nível Máximo
            upgradeButton.disabled = true;
            upgradeLabelSpan.textContent = "MAX"; // Mostra que está no máximo
            if (upgradePercentDisplay) upgradePercentDisplay.textContent = ""; // Limpa o span interno
            upgradeButton.style.backgroundColor = 'gray';

        } else {
            const cost = nextWeaponUpgradeCost;
            const currentScore = score;

            // Cálculo da Porcentagem
            let rawPercentage = (currentScore / cost) * 100;
            let percentage = Math.min(100, Math.floor(rawPercentage));

            if (percentage >= 100) {
                // PRONTO!
                upgradeButton.disabled = false;
                upgradeButton.style.backgroundColor = 'green';

                // Manda o texto principal do botão para "UPGRADE PRONTO"
                upgradeLabelSpan.textContent = "UP";

            } else {
                // Em Progresso: MOSTRA SÓ A PORCENTAGEM
                upgradeButton.disabled = true;
                upgradeButton.style.backgroundColor = '';

                // Manda o texto principal do botão para a PORCENTAGEM DE CARREGAMENTO
                upgradeLabelSpan.textContent = `${percentage}%`;

            }
        }
    }
}

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

                    // 💥 CORREÇÃO CRÍTICA AQUI!
                    // Passe o array global 'particles' como segundo argumento.
                    currentBoss.takeDamage(projectile.damage, particles); 
                    //                                          ^^^^^^^^^

                    console.log(
                        `%cBOSS HP: ${before} → ${currentBoss.currentHealth} (dano: ${projectile.damage})`,
                        'color: yellow; font-size: 16px; font-weight: bold;'
                    );

                    projectile.isAlive = false;
                    playerShip.projectiles.splice(j, 1);
                }

            }
        }
        //     // Inimigos
        for (let i = enemies.length - 1; i >= 0; i--) {

            const enemy = enemies[i];

            if (!playerShip.superLaserActive && enemy.y > 0 && enemy.y < CANVAS_HEIGHT) {
                enemy.fire(enemyProjectiles);
            }

            enemy.update(deltaTime);

            // 1. ✅ NOVO: GESTÃO DO SCORE E CARGA DO LASER (Verifica a flag isScored do Enemy.js)
            // Se o inimigo está explodindo E ainda não pontuou (isScored = true no takeDamage), pontua agora.
            if (enemy.isExploding && enemy.isScored) {
                // 1a. Contabiliza o Score
                score += enemy.scoreValue;

                // 1b. Contabiliza a Carga do Laser
                superLaserCharge = Math.min(
                    superLaserCharge + enemy.scoreValue,
                    SUPER_LASER_REQUIREMENT
                );

                // 1c. Desativa a flag para que o score e a carga não sejam dados novamente
                enemy.isScored = false;
            }
            // DENTRO DO SEU LOOP DE ATUALIZAÇÃO (Game.js)

            // Colisão de projéteis normais
            for (let j = playerShip.projectiles.length - 1; j >= 0; j--) {
                const projectile = playerShip.projectiles[j];

                if (checkCollision(projectile, enemy)) {

                    // 🚀 LINHA CORRIGIDA: PASSA O ARRAY 'particles' 🚀
                    enemy.takeDamage(projectile.damage, particles);

                    // Remove o projétil *sempre* que colide
                    projectile.isAlive = false;
                    playerShip.projectiles.splice(j, 1);

                    // Se a vida do inimigo zerou no takeDamage, saímos do loop interno
                    if (enemy.isExploding) {
                        break; // Não precisamos checar mais colisões contra este inimigo morrendo
                    }
                }
            }

            // Remoção e Desenho de Inimigos
            // A remoção só ocorre se:
            // 1. !enemy.isAlive (após os 500ms da explosão)
            // 2. O inimigo saiu da tela por baixo
            if (!enemy.isAlive || enemy.y > CANVAS_HEIGHT + enemy.height) {
                enemies.splice(i, 1);
            } else {
                enemy.draw(ctx);
            }
        } // <--- FIM DO LOOP DE INIMIGOS AQUI

        // ---------------------------------------------------
        // 🚀 CORREÇÃO 1: UPDATE DE PARTÍCULAS (MOVIDO PARA CÁ)
        // ---------------------------------------------------
        for (let i = particles.length - 1; i >= 0; i--) {
            const particle = particles[i];

            // Atualiza a posição, aplicando atrito e gravidade
            particle.update();

            // Remove a partícula se a vida dela (life) acabou
            if (!particle.isAlive) {
                particles.splice(i, 1);
            }
        }
        // ---------------------------------------------------


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

    // ---------------------------------------------------
    // 🎨 CORREÇÃO 2: DRAW DE PARTÍCULAS (ADICIONADO AQUI)
    // ---------------------------------------------------
    if (particles) {
        particles.forEach(p => p.draw(ctx));
    }
    // ---------------------------------------------------


    updateHTMLHUD();


    if (typeof updateUpgradeButton === 'function') {
        updateUpgradeButton();
    }

    requestAnimationFrame(gameLoop);
}


 
/**
 * Inicia a sequência de fuga da nave do jogador.
 * A variável global 'playerShip' (instância de Player) deve estar acessível.
 */
function derrotouBoss() {
    console.log("Boss derrotado! Iniciando fuga...");
    
    // 🛑 CORREÇÃO AQUI: Mudando de 'player' para 'playerShip'
    if (typeof playerShip !== 'undefined' && playerShip instanceof Player) {
        console.log("Nave do jogador (playerShip) ENCONTRADA. Ativando fuga...");
        
        // Ativa o modo de fuga na instância correta
        playerShip.isExiting = true;
        playerShip.exitSpeed = 0; // Garante que comece do zero.
    } else {
        console.error("ERRO: A variável 'playerShip' não é uma instância de Player ou não está definida.");
    }
}

/**
 * Função principal de fim de jogo.
 */
function endGame() {
    // 1. Inicia a sequência de fuga da nave
    derrotouBoss(); 
    
    // 2. Recarrega a página após um tempo.
    setTimeout(() => {
        location.reload();
    }, 4000);
}