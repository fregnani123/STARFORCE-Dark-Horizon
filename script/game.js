// Arquivo: script/game.js

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
const enemyProjectiles = []; // Tiros dos inimigos
let gameBackground;
let lastTime = 0;
let score = 0; // Pontuação

// Custo para o próximo Upgrade
let nextWeaponUpgradeCost = 100; // Custo inicial (ajuste conforme o desejado)

// Variáveis de Spawn
let enemySpawnTimer = 0;
const ENEMY_SPAWN_INTERVAL = 2000;

// ----------------------------------------------------
// FUNÇÕES DE SUPORTE
// ----------------------------------------------------

// --- FUNÇÃO DE COLISÃO (Bounding Box) ---
function checkCollision(objA, objB) {
    return (
        objA.x < objB.x + objB.width &&
        objA.x + objA.width > objB.x &&
        objA.y < objB.y + objB.height &&
        objA.y + objA.height > objB.y
    );
}

// --- FUNÇÃO PARA TENTAR UPGRADE DE ARMA POR PONTOS ---
// Deve ser chamada pela tecla 'G' ou pelo botão virtual no mobile (em controle.js)
function tryUpgradeWeapon() {
    if (!playerShip || playerShip.weaponLevel >= playerShip.maxWeaponLevel) {
        return false; // Não há nave ou já está no nível máximo
    }

    if (score >= nextWeaponUpgradeCost) {
        score -= nextWeaponUpgradeCost; // Subtrai o custo
        playerShip.upgradeWeapon(); // Chama o método do Player.js
        
        // Define o próximo custo (aumenta o custo em 50%)
        nextWeaponUpgradeCost = Math.round(nextWeaponUpgradeCost * 1.5);
        
        console.log(`Upgrade de Arma realizado! Próximo custo: ${nextWeaponUpgradeCost}`);
        return true;
    }
    return false;
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
        randomType.fireRate, 
        randomType.damage    
    ));
}

// --- FUNÇÃO PARA ENCONTRAR O INIMIGO MAIS PRÓXIMO (PARA ARMA GUIADA) ---
function findNearestEnemy(projectile) {
    let nearestEnemy = null;
    let minDistanceSq = Infinity; 

    const projCenterX = projectile.x + projectile.width / 2;
    const projCenterY = projectile.y + projectile.height / 2;

    for (const enemy of enemies) {
        // Apenas visa inimigos visíveis e vivos
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


// --- FUNÇÃO PARA DESENHAR HUD ---
function drawHUD() {
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    
    // Score
    ctx.fillText(`Score: ${score}`, 30, CANVAS_HEIGHT - 60); 
    
    if (playerShip && playerShip.isAlive) {
        // Health
        ctx.fillText(`Health: ${Math.max(0, playerShip.health)}`, 30, CANVAS_HEIGHT - 30); 
        // Nível da Arma
        ctx.fillText(`Weapon Lvl: ${playerShip.weaponLevel}`, CANVAS_WIDTH - 150, CANVAS_HEIGHT - 30); 
    } else if (playerShip && !playerShip.isAlive) {
        ctx.font = '50px Arial';
        ctx.fillStyle = 'red';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
    }
    
    // Lógica para atualizar o botão de Upgrade (Assumindo que você criou o botão no HTML)
    const upgradeButton = document.getElementById('upgradeButton');
    if (upgradeButton && playerShip && !playerShip.inIntro) {
        if (playerShip.weaponLevel < playerShip.maxWeaponLevel) {
            upgradeButton.style.display = 'block';
            upgradeButton.textContent = `UPGRADE (${nextWeaponUpgradeCost})`;
            
            // Destaca se o jogador tem dinheiro suficiente
            if (score >= nextWeaponUpgradeCost) {
                upgradeButton.style.backgroundColor = '#28a745'; // Verde
            } else {
                upgradeButton.style.backgroundColor = '#dc3545'; // Vermelho
            }
        } else {
            // Esconde quando a arma está no máximo
            upgradeButton.style.display = 'none';
        }
    }

    ctx.textAlign = 'left'; // Reseta o alinhamento
}

// ----------------------------------------------------
// LOOP PRINCIPAL DO JOGO
// ----------------------------------------------------
function gameLoop(timestamp) {
    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;

    // 1. Atualizar e Desenhar o Fundo (SEMPRE PRIMEIRO)
    gameBackground.update(deltaTime);
    gameBackground.draw(ctx);

    if (playerShip && playerShip.isAlive) { 
        
        // 2. Lógica de SPawn de Inimigos
        if (!playerShip.inIntro) { // Spawnar apenas após a intro
            enemySpawnTimer += deltaTime;
            if (enemySpawnTimer >= ENEMY_SPAWN_INTERVAL) {
                spawnRandomEnemy();
                enemySpawnTimer -= ENEMY_SPAWN_INTERVAL;
            }
        }
        
        // 3. Atualizar a lógica dos objetos e Controle
        if (typeof updatePlayerMovement === 'function') {
            updatePlayerMovement();
        }
        playerShip.update(deltaTime);
        playerShip.fire();

        // ----------------------------------------------------
        // 3.1. ATUALIZAÇÃO E LIMPEZA DOS PROJÉTEIS DO JOGADOR
        // Garante que projéteis que saem da tela sejam removidos
        for (let i = playerShip.projectiles.length - 1; i >= 0; i--) {
            const projectile = playerShip.projectiles[i];
            projectile.update(deltaTime);
            
            // Se saiu da tela (superior)
            if (projectile.y + projectile.height < 0) {
                playerShip.projectiles.splice(i, 1);
            }
        }
        // ----------------------------------------------------
        
        // 4.1. Lógica de Arma Guiada (Nível 3)
        // Busca o inimigo mais próximo para as bombas guiadas
        for (const projectile of playerShip.projectiles) {
            // Se for um projétil guiado e ainda não tiver um alvo
            if (projectile.isGuided && !projectile.target) {
                projectile.target = findNearestEnemy(projectile);
            }
            // Verifica se o alvo ainda está vivo (se o inimigo foi destruído, remove o alvo)
            if (projectile.isGuided && projectile.target && !projectile.target.isAlive) {
                projectile.target = findNearestEnemy(projectile); // Busca um novo alvo
            }
        }
        
        // 5. Loop de Atualização, Tiro do Inimigo e Colisão (Player Projectile vs Enemy)
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
                    
                    // Remove o projétil da colisão
                    projectile.isAlive = false; 
                    playerShip.projectiles.splice(j, 1);
                    
                    // Adicionar pontuação
                    if (!enemy.isAlive) {
                        score += 100;
                    }
                }
            }

            // Remove inimigos mortos ou que saíram da tela
            if (!enemy.isAlive || enemy.y > CANVAS_HEIGHT + enemy.height) {
                enemies.splice(i, 1);
            } else {
                enemy.draw(ctx);
            }
        }

        // 6. Loop de Colisão (Enemy Projectile vs Player)
        for (let i = enemyProjectiles.length - 1; i >= 0; i--) {
            const projectile = enemyProjectiles[i];
            projectile.update(deltaTime);

            if (checkCollision(projectile, playerShip)) {
                playerShip.takeDamage(projectile.damage);
                projectile.isAlive = false;
                enemyProjectiles.splice(i, 1);
            } else if (!projectile.isAlive || projectile.y > CANVAS_HEIGHT) { // Limpa projéteis que saem da tela (por baixo)
                enemyProjectiles.splice(i, 1);
            } else {
                projectile.draw(ctx);
            }
        }
    } // Fim do if (playerShip.isAlive)

    // 7. Desenhar Elementos do Jogador e Projéteis (Para garantir que o último estado seja desenhado, mesmo após a morte)
    if (playerShip) { 
        // Projéteis do jogador
        playerShip.projectiles.forEach(p => { p.draw(ctx); });

        // Jogador
        playerShip.draw(ctx);
    }

    // 8. Desenhar HUD
    drawHUD();

    // 9. Pede o próximo frame
    requestAnimationFrame(gameLoop);
}