// ======================================================
// IMPORTS OBRIGATÓRIOS
// ======================================================
import { GameObject } from './GameObject.js';
import { Projectile } from './Projectile.js';
import {
        score,
        CANVAS_WIDTH,
        CANVAS_HEIGHT
} from './globals.js';
import { endGamePlayer } from './FimDaMissao.js';


// Função de easing 
export function easeOutQuad(t) {
        return t * (2 - t);
}


export class Player extends GameObject {
        constructor(x, y, width, height, imagePath, maxHealth = 700, weaponLevel = 1) {
                // Usa as constantes importadas para calcular a posição inicial
                const dynamicTargetX = (CANVAS_WIDTH / 2) - (width / 2);
                const dynamicTargetY = CANVAS_HEIGHT * 0.8;
                super(dynamicTargetX, dynamicTargetY, width, height, imagePath);

                this.speed = 400;
                this.dx = 0;
                this.dy = 0;

                // Projetiles (GameLoop usa playerShip.projectiles.push)
                this.newProjectiles = [];
                this.projectiles = []; // 🛑 CORREÇÃO CRÍTICA 1: Inicializar o array que o gameLoop usa

                this.fireRate = 200;
                this.fireTimer = 0;
                this.maxHealth = maxHealth;
                this.health = maxHealth;
                this.isAlive = true;

                this.updateHullDisplay();

                // Propriedades de Arma e Laser
                this.weaponLevel = weaponLevel;
                this.maxWeaponLevel = 4;
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
                this.targetX = dynamicTargetX;
                this.targetY = dynamicTargetY;
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

                // Propriedades de Fuga
                this.isExiting = false;
                this.exitSpeed = 0;
                this.exitAcceleration = 2000;

                // Timer da bomba (inicializado aqui)
                this.bombTimer = 0;
        }

        // Método que cria projéteis. Ele retorna os projéteis criados.
      fire() {
    // 🚀 Ajuste: Permite atirar na intro se for Missão 0
    const isMissionZero = window.isOpeningMission || false;
    const canFireInIntro = isMissionZero && this.inIntro;

    if (this.fireTimer < this.fireRate || !this.isAlive || (this.inIntro && !canFireInIntro) || this.superLaserActive || this.isExiting) {
        return [];
    }

    const newProjectiles = [];

    // --- NÍVEL DE ARMA 1 ---
    if (this.weaponLevel === 1) {
        // Reduzido de 20x40 para 10x25
        newProjectiles.push(new Projectile(this.x + this.width / 2 - 5, this.y - 20, 10, 25, "../assets/img/projectile/tiro.png", 600, 15, 'player', 0, false, null, false));

    // --- NÍVEL DE ARMA 2 ---
    } else if (this.weaponLevel === 2) {
        // Reduzidos para 10x25
        newProjectiles.push(new Projectile(this.x + this.width * 0.25 - 5, this.y - 10, 10, 25, "../assets/img/projectile/tiro.png", 600, 15, 'player', 0, false, null, false));
        newProjectiles.push(new Projectile(this.x + this.width * 0.75 - 5, this.y - 10, 10, 25, "../assets/img/projectile/tiro.png", 600, 15, 'player', 0, false, null, false));

    // --- NÍVEL DE ARMA 3 ---
    } else if (this.weaponLevel === 3) {
        newProjectiles.push(new Projectile(this.x + this.width / 2 - 5, this.y - 20, 10, 25, "../assets/img/projectile/tiro-azul.png", 600, 15, 'player', 0, false, null, false));
        newProjectiles.push(new Projectile(this.x + this.width * 0.15 - 5, this.y - 5, 10, 25, "../assets/img/projectile/tiro.png", 600, 15, 'player', 0, false, null, false));
        newProjectiles.push(new Projectile(this.x + this.width * 0.85 - 5, this.y - 5, 10, 25, "../assets/img/projectile/tiro.png", 600, 15, 'player', 0, false, null, false));

        const BOMB_FIRE_RATE = 1000;
        if (this.bombTimer >= BOMB_FIRE_RATE) {
            // Bomba reduzida de 50x50 para 30x30
            newProjectiles.push(new Projectile(this.x + this.width / 15 - 15, this.y - 10, 30, 30, "../assets/img/projectile/bomba.png", 250, 50, 'player', 0, false, null, true));
            this.bombTimer = 0;
        }

    // --- NÍVEL DE ARMA 4 ---
    } else if (this.weaponLevel === 4) {
        // Tiro central um pouco maior que os outros, mas menor que o original (de 30x50 para 15x35)
        newProjectiles.push(new Projectile(this.x + this.width / 2 - 7.5, this.y - 25, 15, 35, "../assets/img/projectile/tiro.png", 600, 25, 'player', 0, false, null, false));

        // Outros tiros reduzidos para 10x25
        newProjectiles.push(new Projectile(this.x + this.width * 0.30 - 5, this.y - 10, 10, 25, "../assets/img/projectile/tiro.png", 600, 15, 'player', 0, false, null, false));
        newProjectiles.push(new Projectile(this.x + this.width * 0.70 - 5, this.y - 10, 10, 25, "../assets/img/projectile/tiro.png", 600, 15, 'player', 0, false, null, false));

        const DIAGONAL_ANGLE = 0.08;
        newProjectiles.push(new Projectile(this.x + this.width * 0.05 - 5, this.y, 10, 25, "../assets/img/projectile/tiro-azul-baixo.png", 600, 15, 'player', -DIAGONAL_ANGLE, false, null, false));
        newProjectiles.push(new Projectile(this.x + this.width * 0.95 - 5, this.y, 10, 25, "../assets/img/projectile/tiro-azul-baixo.png", 600, 15, 'player', DIAGONAL_ANGLE, false, null, false));

        const BOMB_FIRE_RATE = 1000;
        if (this.bombTimer >= BOMB_FIRE_RATE) {
            newProjectiles.push(new Projectile(this.x + this.width / 2 - 15, this.y - 10, 30, 30, "../assets/img/projectile/bomba.png", 250, 50, 'player', 0, false, null, true));
            this.bombTimer = 0;
        }
    }

    this.fireTimer = 0;
    return newProjectiles;
}

        update(deltaTime) {
                const t = deltaTime / 1000;
                const REST_Y = CANVAS_HEIGHT * 0.8;

                // LÓGICA DE FUGA (EXIT)
                if (this.isExiting) {
                        this.exitSpeed += this.exitAcceleration * t;
                        this.y -= this.exitSpeed * t;

                        this.wingRotationY = -1;
                        this.wingRotationX = 0;

                        if (this.y + this.height < -100) {
                                this.isAlive = false;
                        }
                        return;
                }

                // Lógica de Introdução
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

                // ... (Lógica de timers) ...
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
                if (this.weaponLevel === 3 || this.weaponLevel === 4) this.bombTimer += deltaTime;

                // Lógica de Movimento Normal
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

                // Limitação de Posição 
                const TOP_LIMIT = CANVAS_HEIGHT * 0.4;
                const BOTTOM_LIMIT = REST_Y;
                this.x = Math.max(0, Math.min(this.x, CANVAS_WIDTH - this.width));
                this.y = Math.max(TOP_LIMIT, Math.min(this.y, BOTTOM_LIMIT));

                // Projéteis
                for (let i = this.projectiles.length - 1; i >= 0; i--) {
                        this.projectiles[i].update(deltaTime);
                        this.projectiles[i].y += this.wingRotationY * 0.1;
                        if (!this.projectiles[i].isAlive) this.projectiles.splice(i, 1);
                }
        }


        // Métodos de Estado

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
                if (this.inIntro || this.superLaserActive || this.isExiting) return;
                this.dx = dx;
                this.dy = dy;
        }

        updateHullDisplay() {
                const healthBar = document.getElementById('healthBar');
                const hullText = document.getElementById('hullValue');
                const hullLife = document.getElementById('hullLife');
                if (healthBar) healthBar.style.width = `${this.health}%`;
                if (hullText) hullText.textContent = `${this.maxHealth}`;
                if (hullLife) hullLife.textContent = `${this.health}`;
        }

        takeDamage(damage) {
                if (this.superLaserActive) return;
                this.health -= damage;
                if (this.health < 0) this.health = 0;
                this.updateHullDisplay();
                if (this.health <= 0) this.isAlive = false;

                endGamePlayer(this.health);
        }

    draw(ctx) {
    if (!this.isAlive) return;

    // 🚀 BLINDAGEM 1: Se a imagem não estiver pronta, não limpamos o frame anterior para ela.
    // Usamos naturalWidth porque ele é mais estável que .complete para imagens em cache.
    const isImgReady = this.img && (this.img.naturalWidth > 0 || this.img.complete);
    if (!isImgReady) return; 

    // 🚀 BLINDAGEM 2: Arredondamento de Pixel. 
    // O Canvas pisca/treme se você desenha em coordenadas decimais (ex: 10.55).
    const centerX = Math.round(this.x + this.width / 2);
    const centerY = Math.round(this.y + this.height / 2);

    // --- Super Laser Épico ---
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
        if (this.openingLandingScale) {
                scale *= this.openingLandingScale;
        }
    if (this.superLaserPulsing) {
        const pulseProgress = Math.min(1, this.superLaserPulseTimer / this.superLaserPulseDuration);
        const eased = easeOutQuad(pulseProgress);
        scale = 1 + (this.superLaserScaleAmount - 1) * (1 - eased);
    }

    // 🚀 Translação com valores inteiros para evitar flicker
    ctx.translate(centerX, centerY);
    
    const pitchScaleY = 1 - (Math.abs(this.wingRotationY) * this.perspectiveScaleY);
    ctx.scale(scale, pitchScaleY * scale);

    const skewAmountX = this.wingRotationX * this.perspectiveSkewX;
    const rollAngleInRadians = this.wingRotationX * this.perspectiveRotateZ * (Math.PI / 180);
    ctx.rotate(rollAngleInRadians);
    ctx.transform(1, 0, skewAmountX, 1, 0, 0);

    // --- Plasma traseiro da nave (Propulsor) ---
    if (!this.inIntro && this.isAlive && !this.superLaserActive) {
        let currentPlasmaColor = this.plasmaColor;
        let currentPlasmaLength = this.plasmaLength;

        if (this.isExiting) {
            currentPlasmaColor = 'rgba(0, 200, 255, 1.0)';
            currentPlasmaLength = 150 + Math.random() * 50;
        } else {
            currentPlasmaLength = this.plasmaLength + Math.sin(Date.now() * this.plasmaSpeed) * this.plasmaOscillation;
        }

        const plasmaWidth = this.plasmaWidth + Math.cos(Date.now() * this.plasmaSpeed * 0.5) * (this.plasmaOscillation / 2);
        const gradientStart = this.height / 2 + this.plasmaOffset;
        const gradientEnd = gradientStart + currentPlasmaLength;

        const gradient = ctx.createLinearGradient(0, gradientStart, 0, gradientEnd);
        gradient.addColorStop(0, currentPlasmaColor);
        gradient.addColorStop(1, 'rgba(0, 191, 255, 0)');

        ctx.fillStyle = gradient;
        ctx.globalAlpha = 0.8;
        ctx.fillRect(-plasmaWidth / 2, gradientStart, plasmaWidth, currentPlasmaLength);
        ctx.globalAlpha = 1.0;
    }

    // --- Desenha a nave (Apenas se a imagem estiver pronta) ---
    // 🚀 Renderização Pixel-Perfect
    ctx.imageSmoothingEnabled = false;
    ctx.globalAlpha = 1.0;
    ctx.drawImage(
        this.img, 
        Math.floor(-this.width / 2), 
        Math.floor(-this.height / 2), 
        this.width, 
        this.height
    );

    ctx.restore();
}
}