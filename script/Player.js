function easeOutQuad(t) {
    return t * (2 - t);
}

class Player extends GameObject {
    constructor(x, y, width, height, imagePath, maxHealth = 100) {
        super(x, y, width, height, imagePath);
        
        // ... (Propriedades existentes mantidas) ...
        this.speed = 250;
        this.dx = 0;
        this.dy = 0;
        this.projectiles = [];
        this.fireRate = 200;
        this.fireTimer = 0;
        this.maxHealth = maxHealth;
        this.health = maxHealth;
        this.isAlive = true;
        this.updateHullDisplay();

        // ... (Propriedades de Arma e Laser mantidas) ...
        this.weaponLevel = 1;
        this.maxWeaponLevel = 3;
        this.superLaserActive = false;
        this.superLaserDuration = 500;
        this.superLaserTimer = 0;
        this.superLaserDamage = 1000;
        this.superLaserCost = 100;
        this.superLaserReady = false;
        this.superLaserPulseDuration = 200;
        this.superLaserPulseTimer = 0;
        this.superLaserPulsing = false;
        this.superLaserScaleAmount = 1.5;

        // Intro
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

        // Plasma e 3D
        this.plasmaColor = 'rgba(255, 119, 0, 0.76)';
        this.plasmaLength = 45;
        this.plasmaWidth = 10;
        this.plasmaOffset = -15; 
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
        
        // 🚀 PROPRIEDADES DE FUGA
        this.isExiting = false;
        this.exitSpeed = 0;
        this.exitAcceleration = 2000; // Pixels por segundo ao quadrado
    }

    // ... (upgradeWeapon, activateSuperLaser, move, updateHullDisplay, takeDamage, fire - MANTIDOS) ...

    upgradeWeapon() {
        if (this.weaponLevel < this.maxWeaponLevel) {
            this.weaponLevel++;
            console.log(`Weapon Upgraded to Level ${this.weaponLevel}!`);
        } else {
            console.log("Weapon is already Max Level!");
        }
    }

    activateSuperLaser() {
        if (this.superLaserActive) return 0;
        if (score >= this.superLaserCost) { 
            this.superLaserActive = true;
            this.superLaserTimer = 0;
            this.superLaserPulsing = true;
            this.superLaserPulseTimer = 0;
            return this.superLaserCost;
        }
        return 0;
    }

    move(dx, dy) {
        if (this.inIntro || this.superLaserActive || this.isExiting) return; // Bloqueia movimento na fuga
        this.dx = dx;
        this.dy = dy;
    }

    updateHullDisplay() {
        const healthBar = document.getElementById('healthBar');
        const hullText = document.getElementById('hullValue');
        const hullLife = document.getElementById('hullLife');
        if (healthBar) healthBar.style.width = `${this.health}%`;
        if (hullText) hullText.textContent = this.health;
        if (hullLife) hullLife.textContent = this.health;
    }

    takeDamage(damage) {
        if (this.superLaserActive) return;
        this.health -= damage;
        if (this.health < 0) this.health = 0;
        this.updateHullDisplay();
        if (this.health <= 0) this.isAlive = false;
    }


    fire() {
        if (this.fireTimer < this.fireRate || !this.isAlive || this.inIntro || this.superLaserActive || this.isExiting) return; // Bloqueia tiro na fuga

        const newProjectiles = [];
        if (this.weaponLevel === 1) {
            newProjectiles.push(new Projectile(this.x + this.width / 2 - 10, this.y - 20, 20, 40, "../assets/img/projectile/tiro.png", 600, 15, 'player'));
        } else if (this.weaponLevel === 2) {
            newProjectiles.push(new Projectile(this.x + this.width * 0.25 - 10, this.y - 10, 20, 40, "../assets/img/projectile/tiro.png", 600, 15, 'player'));
            newProjectiles.push(new Projectile(this.x + this.width * 0.75 - 10, this.y - 10, 20, 40, "../assets/img/projectile/tiro.png", 600, 15, 'player'));
        } else if (this.weaponLevel === 3) {
            newProjectiles.push(new Projectile(this.x + this.width / 2 - 10, this.y - 20, 20, 40, "../assets/img/projectile/tiro-azul.png", 600, 15, 'player'));
            newProjectiles.push(new Projectile(this.x + this.width * 0.15 - 10, this.y - 5, 20, 40,"../assets/img/projectile/tiro.png", 600, 15, 'player'));
            newProjectiles.push(new Projectile(this.x + this.width * 0.85 - 10, this.y - 5, 20, 40, "../assets/img/projectile/tiro.png", 600, 15, 'player'));
            if (this.bombTimer === undefined) this.bombTimer = 0;
            const BOMB_FIRE_RATE = 1000;
            if (this.bombTimer >= BOMB_FIRE_RATE) {
                newProjectiles.push(new Projectile(this.x + this.width / 15 - 15, this.y - 10, 30, 50, "../assets/img/projectile/bomba.png", 250, 50, 'player', false));
                this.bombTimer = 0;
            }
        }
        this.projectiles.push(...newProjectiles);
        this.fireTimer = 0;
    }


    update(deltaTime) {
        const t = deltaTime / 1000;
        const REST_Y = CANVAS_HEIGHT * 0.8; 

        // 🚀 LÓGICA DE FUGA (EXIT)
        if (this.isExiting) {
            // Acelera verticalmente
            this.exitSpeed += this.exitAcceleration * t; 
            this.y -= this.exitSpeed * t;
            
            // Foca o propulsor e gira levemente para cima
            this.wingRotationY = -1; 
            this.wingRotationX = 0; 
            
            // Se o jogador sair da tela, não precisa mais ser atualizado.
            if (this.y + this.height < -100) {
                this.isAlive = false; 
            }
            return; // Bloqueia o resto da lógica de movimento/introdução
        }
        
        // ... (Lógica de Introdução e Super Laser - MANTIDAS) ...
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

        if (this.superLaserActive) {
            this.superLaserTimer += deltaTime;
            if (this.superLaserTimer >= this.superLaserDuration) {
                this.superLaserActive = false;
                this.superLaserTimer = 0;
            }
        }

        if (this.superLaserPulsing) {
            this.superLaserPulseTimer += deltaTime;
            if (this.superLaserPulseTimer >= this.superLaserPulseDuration) {
                this.superLaserPulsing = false;
                this.superLaserPulseTimer = 0;
            }
        }

        this.fireTimer += deltaTime;
        if (this.weaponLevel === 3) this.bombTimer = (this.bombTimer || 0) + deltaTime;
        
        // ... (Lógica de Movimento Normal - MANTIDA) ...
        if (!this.superLaserActive) {
            const baseMovement = this.speed * t;
            let finalDx = this.dx;
            let finalDy = this.dy;
            if (this.dx !== 0 && this.dy !== 0) {
                const factor = 1 / Math.sqrt(2);
                finalDx *= factor;
                finalDy *= factor;
            }
            this.x += finalDx * baseMovement * this.movementDampeningX;
            this.y += finalDy * baseMovement * this.movementDampeningY;

            const decayAmount = this.inputDecay * t;
            if (this.dx === 0 && Math.abs(this.wingRotationX) > 0.01) this.wingRotationX *= (1 - decayAmount * 5);
            if (this.dy === 0 && Math.abs(this.wingRotationY) > 0.01) this.wingRotationY *= (1 - decayAmount * 5);

            const targetRoll = this.dx * this.maxRollEffect;
            this.wingRotationX += (targetRoll - this.wingRotationX) * this.rollSpeed * t;
            this.wingRotationX = Math.max(-1, Math.min(1, this.wingRotationX));

            const targetPitch = -this.dy * this.maxPitchEffect;
            this.wingRotationY += (targetPitch - this.wingRotationY) * this.pitchSpeed * t;
            this.wingRotationY = Math.max(-1, Math.min(1, this.wingRotationY));

            const dragDownMovement = (Math.abs(this.wingRotationX) * this.verticalDrag + Math.abs(this.wingRotationY) * 0.2) * t;
            this.y += dragDownMovement;

            const dragSideMovement = this.wingRotationX * this.lateralDrag * t;
            this.x += dragSideMovement;
        }

        const TOP_LIMIT = CANVAS_HEIGHT * 0.4;
        const BOTTOM_LIMIT = REST_Y;
        this.x = Math.max(0, Math.min(this.x, CANVAS_WIDTH - this.width));
        this.y = Math.max(TOP_LIMIT, Math.min(this.y, BOTTOM_LIMIT));

        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            this.projectiles[i].update(deltaTime);
            this.projectiles[i].y += this.wingRotationY * 0.1;
            if (!this.projectiles[i].isAlive) this.projectiles.splice(i, 1);
        }
    }

    // ... (draw - MANTIDO) ...

    draw(ctx) {
        if (!this.img.complete || !this.isAlive) return;

        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;

        // --- Super Laser Épico: múltiplas ondas concêntricas ---
        if (this.superLaserActive) {
            const progress = this.superLaserTimer / this.superLaserDuration;
            const alphaBase = 1.0 - progress;
            const maxRadius = Math.sqrt(CANVAS_WIDTH ** 2 + CANVAS_HEIGHT ** 2); 

            ctx.save();
            for (let i = 0; i < 3; i++) {
                const waveProgress = Math.min(1, (progress + i * 0.1));
                const radius = maxRadius * waveProgress;
                const alpha = alphaBase * (1 - i * 0.3);

                const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
                gradient.addColorStop(0, `rgba(0, 191, 255, ${alpha})`); 
                gradient.addColorStop(0.4, `rgba(0, 255, 255, ${alpha * 0.7})`); 
                gradient.addColorStop(0.7, `rgba(255, 255, 0, ${alpha * 0.5})`); 
                gradient.addColorStop(1, `rgba(255, 255, 0, 0)`); 

                ctx.fillStyle = gradient;

                const stretchX = 1 + Math.abs(this.wingRotationX) * (1.5 + i * 0.5);
                const stretchY = 1 + Math.abs(this.wingRotationY) * (0.5 + i * 0.2);

                ctx.translate(centerX, centerY);
                ctx.scale(stretchX, stretchY);
                ctx.translate(-centerX, -centerY);

                ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT); 
            }
            ctx.restore();
        }

        ctx.save();

        // --- Escala base + pulso ---
        let scale = this.inIntro ? this.currentScale : 1.0;
        if (this.superLaserPulsing) {
            const pulseProgress = Math.min(1, this.superLaserPulseTimer / this.superLaserPulseDuration);
            const eased = easeOutQuad(pulseProgress);
            scale = 1 + (this.superLaserScaleAmount - 1) * (1 - eased);
        }

        ctx.translate(centerX, centerY);
        const pitchScaleY = 1 - (Math.abs(this.wingRotationY) * this.perspectiveScaleY);
        ctx.scale(scale, pitchScaleY * scale);

        const skewAmountX = this.wingRotationX * this.perspectiveSkewX;
        const rollAngleInRadians = this.wingRotationX * this.perspectiveRotateZ * (Math.PI / 180);
        ctx.rotate(rollAngleInRadians);
        ctx.transform(1, 0, skewAmountX, 1, 0, 0);

        // --- Plasma traseiro da nave (Propulsor) ---
        // O propulsor fica mais forte e azulado durante a fuga
        if (!this.inIntro && this.isAlive && !this.superLaserActive) {
            
            let currentPlasmaColor = this.plasmaColor;
            let currentPlasmaLength = this.plasmaLength;

            if (this.isExiting) {
                // Plasma azul/branco mais intenso para a super velocidade
                currentPlasmaColor = 'rgba(0, 200, 255, 1.0)'; 
                currentPlasmaLength = 150 + Math.random() * 50; // Plasma longo
            } else {
                currentPlasmaLength = this.plasmaLength + Math.sin(Date.now() * this.plasmaSpeed) * this.plasmaOscillation;
            }

            const plasmaWidth = this.plasmaWidth + Math.cos(Date.now() * this.plasmaSpeed * 0.5) * (this.plasmaOscillation / 2);
            
            const gradientStart = this.height / 2 + this.plasmaOffset; 
            const gradientEnd = this.height / 2 + this.plasmaOffset + currentPlasmaLength;
            
            const gradient = ctx.createLinearGradient(0, gradientStart, 0, gradientEnd);
            
            gradient.addColorStop(0, currentPlasmaColor);
            gradient.addColorStop(1, 'rgba(0, 191, 255, 0)');
            
            ctx.fillStyle = gradient;
            ctx.globalAlpha = 0.8;
            
            ctx.fillRect(-plasmaWidth / 2, gradientStart, plasmaWidth, currentPlasmaLength);
            
            ctx.globalAlpha = 1.0;
        }

        // --- Desenha a nave ---
        ctx.globalAlpha = 1.0;
        ctx.drawImage(this.img, -this.width / 2, -this.height / 2, this.width, this.height);

        ctx.restore();
    }
}