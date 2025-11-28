 // Função de Easing Out Quadrático (mais suave no final)
function easeOutQuad(t) {
    return t * (2 - t);
}

class Player extends GameObject {
    constructor(x, y, width, height, imagePath, maxHealth = 100) {
        super(x, y, width, height, imagePath);
        this.speed = 250;
        this.dx = 0;
        this.dy = 0;
        this.projectiles = [];
        this.fireRate = 200;
        this.fireTimer = 0;

        this.maxHealth = maxHealth;
        this.health = maxHealth;
        this.isAlive = true;

        // ------------------------------
        // ✨ PROPRIEDADES DE ARMA E UPGRADE
        // ------------------------------
        this.weaponLevel = 1; // Começa no Nível 1
        this.maxWeaponLevel = 3;
        
        // ------------------------------
        // 🔥 PROPRIEDADES DO SUPER LASER (NOVO)
        // ------------------------------
        this.superLaserActive = false; // Estado atual do laser
        this.superLaserDuration = 500; // Duração do flash (0.5 segundo)
        this.superLaserTimer = 0;
        this.superLaserDamage = 1000; // Dano massivo
        this.superLaserCost = 100; // Custo em pontos
        this.superLaserReady = false; // Flag para indicar se o custo foi atingido
        // ------------------------------
        
        // ------------------------------
        // 🚨 PROPRIEDADES DE ANIMAÇÃO DE ENTRADA
        // ------------------------------
        this.targetX = x; 
        this.targetY = y; 
        
        this.introDuration = 2000;
        this.introTimer = 0; 
        this.inIntro = true; 

        this.initialScale = 2.5; 
        this.targetScale = 1.0; 
        this.initialX = (CANVAS_WIDTH / 2) - (this.width * this.initialScale / 2); 
        this.initialY = -this.height * this.initialScale; 
        
        this.x = this.initialX; 
        this.y = this.initialY; 
        // ------------------------------

        // [Código do Plasma e 3D...]
        this.plasmaColor = 'rgba(0, 191, 255, 0.7)';
        this.plasmaLength = 40;
        this.plasmaWidth = 20;
        this.plasmaOffset = -10;
        this.plasmaOscillation = 5;
        this.plasmaSpeed = 0.02;

        this.wingRotationX = 0;
        this.wingRotationY = 0;
        this.rollSpeed = 5;
        this.pitchSpeed = 5;
        this.maxRollEffect = 1.0;
        this.maxPitchEffect = 0.5;

        this.lateralDrag = 0.8;
        this.verticalDrag = 0.6;
        this.movementDampeningX = 1;
        this.movementDampeningY = 1;

        this.inputDecay = 0.1;

        this.perspectiveSkewX = 0.5;
        this.perspectiveScaleY = 0.2;
        this.perspectiveRotateZ = 20;
    }
    
    // ------------------------------------------------------------------
    // ✨ MÉTODO: UPGRADE DE ARMA
    // ------------------------------------------------------------------
    upgradeWeapon() {
        if (this.weaponLevel < this.maxWeaponLevel) {
            this.weaponLevel++;
            console.log(`Weapon Upgraded to Level ${this.weaponLevel}!`);
        } else {
            console.log("Weapon is already Max Level!");
        }
    }
    
    // ------------------------------------------------------------------
    // 🔥 MÉTODO: ATIVAR SUPER LASER (Chamado por trySuperLaser no game.js)
    // ------------------------------------------------------------------
    activateSuperLaser() {
        if (this.superLaserActive) return 0; // Já ativo
        
        // A checagem de score é feita em game.js, mas re-confirmação
        if (score >= this.superLaserCost) {
            this.superLaserActive = true;
            this.superLaserTimer = 0;
            return this.superLaserCost; // Retorna o custo para ser subtraído
        }
        return 0; // Não pôde ser ativado
    }

    move(dx, dy) {
        if (this.inIntro || this.superLaserActive) return; // Não move durante a intro ou laser
        this.dx = dx;
        this.dy = dy;
    }

    takeDamage(damage) {
        // Imunidade durante o Super Laser
        if (this.superLaserActive) return; 

        this.health -= damage;
        if (this.health <= 0) this.isAlive = false;
    }

    fire() {
        // Não pode atirar durante a animação de introdução OU se o Super Laser estiver ativo
        if (this.fireTimer < this.fireRate || !this.isAlive || this.inIntro || this.superLaserActive) return;

        const newProjectiles = [];
        
        // ----------------------------------------------------
        // LÓGICA DE TIRO (NÍVEL 1, 2 E 3)
        // ----------------------------------------------------

        if (this.weaponLevel === 1) {
            // Nível 1: 1 Tiro Central Padrão
            newProjectiles.push(new Projectile(
                this.x + this.width / 2 - 10, this.y - 20,
                20, 40, "../assets/img/tiro.png", 600, 15, 'player'
            ));
            this.fireRate = 200; 
        
        } else if (this.weaponLevel === 2) {
            // Nível 2: 2 Tiros Duplos
            // Tiro Esquerdo
            newProjectiles.push(new Projectile(
                this.x + this.width * 0.25 - 10, this.y - 10,
                20, 40, "../assets/img/tiro.png", 600, 15, 'player'
            ));
            // Tiro Direito
            newProjectiles.push(new Projectile(
                this.x + this.width * 0.75 - 10, this.y - 10,
                20, 40, "../assets/img/tiro.png", 600, 15, 'player'
            ));
            this.fireRate = 200; 

        } else if (this.weaponLevel === 3) {
            // Nível 3: 3 Tiros (Central + 2 Duplos) E a Bomba Guiada
            
            // 1. Padrão de 3 Tiros
            // Tiro Central
            newProjectiles.push(new Projectile(
                this.x + this.width / 2 - 10, this.y - 20,
                20, 40, "../assets/img/tiro.png", 600, 15, 'player'
            ));
            // Tiro Esquerdo
            newProjectiles.push(new Projectile(
                this.x + this.width * 0.15 - 10, this.y - 5,
                20, 40, "../assets/img/tiro.png", 600, 15, 'player'
            ));
            // Tiro Direito
            newProjectiles.push(new Projectile(
                this.x + this.width * 0.85 - 10, this.y - 5,
                20, 40, "../assets/img/tiro.png", 600, 15, 'player'
            ));

            // 2. Bomba Guiada 
            // Para não spamar, vamos atirar a bomba a cada 1000ms (1 segundo)
            if (this.bombTimer === undefined) this.bombTimer = 0;
            const BOMB_FIRE_RATE = 1000;
            
            if (this.bombTimer >= BOMB_FIRE_RATE) {
                newProjectiles.push(new Projectile(
                    this.x + this.width / 2 - 15, this.y - 10, 
                    30, 30, "../assets/img/bomba.png", 
                    250, 
                    50, 
                    'player',
                    true // Flag isGuided = true
                ));
                this.bombTimer = 0;
            }
            this.fireRate = 200; 
        }

        // ----------------------------------------------------

        this.projectiles.push(...newProjectiles);
        this.fireTimer = 0;
    }
    
    update(deltaTime) {
        
        // --- CÁLCULO DE POSIÇÃO DE REPOUSO FIXA ---
        const REST_Y = CANVAS_HEIGHT * 0.8;
        // --------------------------------------------------
        
        // ------------------------------
        // 0. LÓGICA DE INTRODUÇÃO
        // ------------------------------
        if (this.inIntro) {
            this.introTimer += deltaTime;
            const linearProgress = Math.min(1, this.introTimer / this.introDuration);
            
            const easedProgress = easeOutQuad(linearProgress);
            
            if (linearProgress < 1) { 
                this.currentScale = this.initialScale + (this.targetScale - this.initialScale) * easedProgress;
                this.y = this.initialY + (REST_Y - this.initialY) * easedProgress;
                this.x = this.initialX + (this.targetX - this.initialX) * easedProgress;
                
                return; 
            } else {
                this.inIntro = false;
                this.x = this.targetX; 
                this.y = REST_Y; 
                this.targetY = REST_Y;
                this.currentScale = this.targetScale; 
                return; 
            }
        }
        
        this.currentScale = 1.0; 
        
        // ------------------------------
        // 🔥 0.1. LÓGICA DO SUPER LASER
        // ------------------------------
        if (this.superLaserActive) {
            this.superLaserTimer += deltaTime;
            
            if (this.superLaserTimer >= this.superLaserDuration) {
                this.superLaserActive = false;
                this.superLaserTimer = 0;
            }
        }
        
        // Incrementa o timer de tiro (normal) e o timer da bomba (separado)
        this.fireTimer += deltaTime;
  if (this.weaponLevel === 3) {
    // Isso garante que o bombTimer é atualizado a cada frame
    this.bombTimer = (this.bombTimer || 0) + deltaTime; 
}

        // --- MOVIMENTO E ANIMAÇÃO 3D (APENAS SE O LASER NÃO ESTIVER ATIVO) ---
        if (!this.superLaserActive) {
            const baseMovement = this.speed * deltaTime / 1000;

            // 1. Movimento e normalização
            let finalDx = this.dx;
            let finalDy = this.dy;

            if (this.dx !== 0 && this.dy !== 0) {
                const factor = 1 / Math.sqrt(2);
                finalDx *= factor;
                finalDy *= factor;
            }

            this.x += finalDx * baseMovement * this.movementDampeningX;
            this.y += finalDy * baseMovement * this.movementDampeningY;

            // [Código do Decaimento para mobile, Roll e Pitch, Arrasto realista...]
            const decayAmount = this.inputDecay * deltaTime / 1000;

            if (this.dx === 0 && Math.abs(this.wingRotationX) > 0.01) {
                this.wingRotationX *= (1 - decayAmount * 5);
            } else if (Math.abs(this.wingRotationX) < 0.01) {
                this.wingRotationX = 0;
            }

            if (this.dy === 0 && Math.abs(this.wingRotationY) > 0.01) {
                this.wingRotationY *= (1 - decayAmount * 5);
            } else if (Math.abs(this.wingRotationY) < 0.01) {
                this.wingRotationY = 0;
            }

            const targetRoll = this.dx * this.maxRollEffect;
            this.wingRotationX += (targetRoll - this.wingRotationX) *
                this.rollSpeed * deltaTime / 1000;
            this.wingRotationX = Math.max(-1, Math.min(1, this.wingRotationX));

            const targetPitch = -this.dy * this.maxPitchEffect;
            this.wingRotationY += (targetPitch - this.wingRotationY) *
                this.pitchSpeed * deltaTime / 1000;
            this.wingRotationY = Math.max(-1, Math.min(1, this.wingRotationY));

            const dragDownMovement =
                (Math.abs(this.wingRotationX) * this.verticalDrag +
                 Math.abs(this.wingRotationY) * 0.2) * deltaTime / 1000;

            this.y += dragDownMovement;

            const dragSideMovement =
                this.wingRotationX * this.lateralDrag * deltaTime / 1000;

            this.x += dragSideMovement;
        }
        
        // ------------------------------
        // 5. Limites da tela 
        // ------------------------------
        
        const TOP_LIMIT = CANVAS_HEIGHT * 0.4; 
        const BOTTOM_LIMIT = REST_Y; 

        this.x = Math.max(0, Math.min(this.x, CANVAS_WIDTH - this.width));
        
        this.y = Math.max(TOP_LIMIT, Math.min(this.y, BOTTOM_LIMIT)); 

        // ------------------------------
        // 6. Atualização dos projéteis
        // ------------------------------
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            this.projectiles[i].update(deltaTime);

            // efeito de pitch nos tiros
            this.projectiles[i].y += this.wingRotationY * 0.1;

            if (!this.projectiles[i].isAlive) {
                this.projectiles.splice(i, 1);
            }
        }
    }

    draw(ctx) {
        if (!this.img.complete || !this.isAlive) return;

        ctx.save();

        const scale = this.inIntro ? this.currentScale : 1.0; 
        
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;

        ctx.translate(centerX, centerY);

        // Pitch (achatamento vertical)
        const pitchScaleY = 1 - (Math.abs(this.wingRotationY) * this.perspectiveScaleY);
        ctx.scale(scale, pitchScaleY * scale); // Aplica a escala de intro e a escala de pitch

        // Roll
        const skewAmountX = this.wingRotationX * this.perspectiveSkewX;
        const rollAngleInRadians =
            this.wingRotationX * this.perspectiveRotateZ * (Math.PI / 180);

        ctx.rotate(rollAngleInRadians);
        ctx.transform(1, 0, skewAmountX, 1, 0, 0);

        // ------------------------------
        // 🔥 DESENHO DO SUPER LASER (FLASH DE TELA)
        // ------------------------------
        if (this.superLaserActive) {
            // Calcula a opacidade com base no tempo para um efeito de fade
            const progress = this.superLaserTimer / this.superLaserDuration;
            const alpha = 1.0 - progress; // Fade out
            
            ctx.globalAlpha = alpha * 0.7; // Transparência máxima de 70%
            ctx.fillStyle = 'rgba(255, 255, 0, 1)'; // Amarelo brilhante
            
            // Desenha um retângulo gigante que cobre toda a tela (usando as coordenadas do canvas em relação ao translate)
            ctx.fillRect(
                -centerX, 
                -centerY, 
                CANVAS_WIDTH, 
                CANVAS_HEIGHT
            );
        }
        // ------------------------------

        // ------------------------------
        // ✨ DESENHO DO PLASMA DE PROPULSÃO
        // ------------------------------
        // Não desenha o plasma normal durante o flash do laser
        if (!this.inIntro && this.isAlive && !this.superLaserActive) {
            const currentPlasmaLength = this.plasmaLength + 
                                         Math.sin(Date.now() * this.plasmaSpeed) * this.plasmaOscillation;
            const currentPlasmaWidth = this.plasmaWidth + 
                                        Math.cos(Date.now() * this.plasmaSpeed * 0.5) * (this.plasmaOscillation / 2);

            const gradient = ctx.createLinearGradient(
                0, 
                this.height / 2 + this.plasmaOffset, 
                0, 
                this.height / 2 + this.plasmaOffset + currentPlasmaLength 
            );
            gradient.addColorStop(0, this.plasmaColor);
            gradient.addColorStop(1, 'rgba(0, 191, 255, 0)');

            ctx.fillStyle = gradient;
            ctx.globalAlpha = 0.8; 

            ctx.fillRect(
                -currentPlasmaWidth / 2, 
                this.height / 2 + this.plasmaOffset, 
                currentPlasmaWidth,
                currentPlasmaLength
            );
            
            ctx.globalAlpha = 1.0; 
        }
        // ------------------------------

        // ------------------------------
        // DESENHO DA NAVE
        // ------------------------------
        // Redefine o alpha para 1.0 antes de desenhar a nave (se o laser não estiver ativo)
        if (!this.superLaserActive) {
             ctx.globalAlpha = 1.0; 
        } else {
             // Reduz a opacidade da nave durante o flash, ou desenha-a em branco (opcional)
             ctx.globalAlpha = 0.5;
        }

        ctx.drawImage(
            this.img,
            -this.width / 2,
            -this.height / 2,
            this.width,
            this.height
        );
        
        ctx.restore();
     
    }
}