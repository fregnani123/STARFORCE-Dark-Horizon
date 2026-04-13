// ======================================================
// IMPORTS OBRIGATÓRIOS
// ======================================================
import { GameObject } from './GameObject.js'; 
import { Projectile } from './Projectile.js'; // Para criar projéteis inimigos
import { Particle } from './particle.js';     // Para gerar partículas na explosão
import { CANVAS_HEIGHT } from './globals.js'; // Para checar os limites da tela

// ==============================================================================
//  Enemy.js — VERSÃO FINAL COM INCLINAÇÃO AÉREA (BANK TURN) E PROJÉTEIS DINÂMICOS
// ==============================================================================

export class Enemy extends GameObject {

    constructor(
        x, y, width, height, imagePath,
        
        // PARÂMETROS DE ESTADOS E MIRA
        targetPlayer, 
        canStopToAttack = true, 
        stopY = null, 
        attackDuration = 4000, 
        shouldContinueDescending = false, 

        // PARÂMETROS BASE
        maxHealth = 50, speed = 100,
        fireRate = 1500, damage = 10,
        projectileSpeed = 200,

        projectileImgs = [],
        scoreValue = 10,
        weaponLevel = 1, 
        
        // PARÂMETROS DE PROJÉTIL
        projectileWidth = 30, 
        projectileHeight = 30, 

        // PARÂMETROS VISUAIS
        isRotating = false,
        isPropulsor = false,
        isPlasmaHalo = true,
        enableTilt = true
    ) {

        super(x, y, width, height, imagePath);

        this.targetPlayer = targetPlayer;
        this.canStopToAttack = canStopToAttack;
        this.shouldContinueDescending = shouldContinueDescending;
        
        this.STATE_DESCENDING = 'DESCENDING';
        this.STATE_ATTACKING = 'ATTACKING';
        this.state = this.STATE_DESCENDING;
        
        this.stopY = stopY === null ? (Math.random() * 150 + 100) : stopY; 
        this.attackDuration = attackDuration;
        this.attackTimer = 0;

        // MOVIMENTO E VIDA
        this.reverseAnimationTimer = 0;
        this.reverseStartPosY = undefined; 
        this.reverseMaxDistance = 20; 
        this.baseSpeed = speed; 
        this.maxHealth = maxHealth;
        this.currentHealth = maxHealth;
        this.isAlive = true;
        this.isScored = false;
        this.isExploding = false;
        this.explosionTimer = 0;
        this.explosionDuration = 500;

        // ONDA SENOIDAL
        this.speed = speed;
        this.initialX = x;
        this.amplitude = 80 + Math.random() * 40; 
        this.frequency = 0.0008 + Math.random() * 0.0004; 
        this.waveTimer = Math.random() * 10000;
        this.lerpRate = 0.08; 

        // TIRO
        this.fireRate = fireRate;
        this.fireDamage = damage;
        this.fireTimer = fireRate - Math.random() * 200; 
        this.projectileSpeed = projectileSpeed;
        this.projectilePaths = projectileImgs.filter(path => path); 
        this.weaponLevel = weaponLevel;
        this.scoreValue = scoreValue;
        this.projectileWidth = projectileWidth;
        this.projectileHeight = projectileHeight;

        // 🛑 CONFIGURAÇÃO DA INCLINAÇÃO (BANK TURN)
        this.isRotating = isRotating;
        this.rotation = 0;
        this.rotationSpeed = 0.05;
        this.enableTilt = enableTilt;
        this.tiltAngle = 0;      // Rotação Z (nariz)
        this.bankFactor = 0;     // Achatamento lateral (escala X)
        this.maxTiltZ = 22;      // Limite de rotação em graus
        this.maxBankScale = 0.5; // Limite de achatamento (50%)
        this.tiltSmoothing = 0.15; 

        // VISUAIS EXTRAS
        this.plasmaPulse = Math.random() * 1000;
        this.isPropulsor = isPropulsor;
        this.isPlasmaHalo = isPlasmaHalo;
        this.enemyPlasmaLength = height * 0.75;
        this.enemyPlasmaWidth = width * 0.1;
        this.enemyPlasmaOscillation = width * 0.03;
        this.enemyPlasmaSpeed = 0.005;
        this.enemyPlasmaOffset = 0;
        this.enemyPlasmaColor = 'rgba(50, 200, 255, 1.0)';
    }

    getProjectileImg(index) {
        return this.projectilePaths[index] || this.projectilePaths[0] || "../assets/img/tiroInimigo.png";
    }

    update(deltaTime, enemyProjectilesArr, backgroundSpeedY = 0) {
        if (!this.isAlive) return;

        const t = deltaTime / 1000;
        const prevX = this.x; // Guardamos o X anterior para calcular a velocidade horizontal real
        
        const correctedBackgroundSpeedY = backgroundSpeedY * 0.2; 
        const scrollCompensation = correctedBackgroundSpeedY * t;
        
        if (this.isRotating) {
            this.rotation += this.rotationSpeed * deltaTime;
            if (this.rotation > 360) this.rotation -= 360;
        }

        this.plasmaPulse += deltaTime * 0.005;

        // --- 1. LÓGICA DE MOVIMENTO DE ESTADOS ---
        if (this.state === this.STATE_DESCENDING) {
            let verticalMovement = this.speed * t;
            if (this.speed > 0) verticalMovement += scrollCompensation;
            this.y += verticalMovement; 
            
            if (this.speed < 0 && this.reverseStartPosY !== undefined) {
                this.reverseAnimationTimer += deltaTime;
                const accelerationDuration = 300; 
                const totalProgress = Math.min(1, this.reverseAnimationTimer / accelerationDuration); 
                const recoilDuration = 100; 
                const recoilProgress = Math.min(1, this.reverseAnimationTimer / recoilDuration);
                const easeOutRecoil = 1 - Math.pow(1 - recoilProgress, 5); 
                const displacement = this.reverseMaxDistance * easeOutRecoil;
                
                if (recoilProgress < 1) {
                    this.y = this.reverseStartPosY - displacement;
                } else {
                    const targetSpeed = -Math.abs(this.baseSpeed) * 1.5;
                    const accelerationProgress = Math.min(1, (this.reverseAnimationTimer - recoilDuration) / (accelerationDuration - recoilDuration));
                    this.speed = 0 + (targetSpeed - 0) * accelerationProgress; 
                    this.y += this.speed * t;
                }
                this.y = Math.round(this.y);
                if (totalProgress === 1) {
                    this.speed = -Math.abs(this.baseSpeed) * 1.5;
                    this.reverseStartPosY = undefined; 
                }
            }

            // Movimento Horizontal (Onda)
            this.waveTimer += deltaTime;
            this.x = this.initialX + Math.sin(this.waveTimer * this.frequency) * this.amplitude;
            
            if (this.canStopToAttack && this.y >= this.stopY && this.speed > 0) {
                this.y = Math.round(this.stopY); 
                this.initialX = this.x; 
                this.waveTimer = 0; 
                this.speed = 0; 
                this.state = this.STATE_ATTACKING;
                this.attackTimer = 0;
                this.fireTimer = this.fireRate - Math.random() * 200;
            }
            
            if (enemyProjectilesArr) {
                this.fireTimer += deltaTime;
                if (this.fireTimer >= this.fireRate) {
                    this.fireTimer = 0;
                    this.fire(enemyProjectilesArr); 
                }
            }

            if (this.y > window.CANVAS_HEIGHT + this.height || this.y < -this.height) {
                   this.isAlive = false;
            }

        } else if (this.state === this.STATE_ATTACKING) {
            this.y = this.stopY; 
            this.waveTimer += deltaTime;
            const targetXFlutuation = this.initialX + Math.sin(this.waveTimer * 0.005) * 5; 
            const lerpFactor = 1.0 - Math.pow(1.0 - this.lerpRate, t * 60); 
            this.x = this.x + (targetXFlutuation - this.x) * lerpFactor; 
            
            this.attackTimer += deltaTime;
            this.fireTimer += deltaTime;

            if (this.fireTimer >= this.fireRate) {
                this.fireTimer = 0; 
                if (this.targetPlayer && enemyProjectilesArr) { 
                    if (this.weaponLevel === 4) {
                        this.fireExplosion360(enemyProjectilesArr);
                    } else {
                         this.fireAttacking(enemyProjectilesArr); 
                    }
                }
            }
            
            if (this.attackTimer >= this.attackDuration) {
                if (this.shouldContinueDescending) {
                    this.initialX = this.x; 
                    this.waveTimer = 0; 
                    if (Math.random() < 0.5) {
                        this.state = this.STATE_DESCENDING;
                        this.speed = Math.abs(this.baseSpeed) * 2.0; 
                    } else {
                        this.y = this.stopY; 
                        this.state = this.STATE_DESCENDING; 
                        this.speed = 0; 
                        this.reverseStartPosY = this.y; 
                        this.reverseAnimationTimer = 0; 
                    }
                } else {
                    this.isAlive = false; 
                }
            }
        } 
        
        // -------------------------------------------------
        // 🛑 CÁLCULO DA INCLINAÇÃO DINÂMICA (BANK TURN)
        // -------------------------------------------------
        if (this.enableTilt) {
            // Velocidade horizontal (px/segundo)
            const horizontalVelocity = (this.x - prevX) / t;
            
            // 1. Rotação do Nariz (Z)
            let targetTilt = horizontalVelocity * 0.06;
            targetTilt = Math.max(-this.maxTiltZ, Math.min(this.maxTiltZ, targetTilt));
            
            // 2. Achatamento de Bank (Escala X) - Simula a asa levantando
            let targetBank = Math.abs(horizontalVelocity) * 0.002; 
            targetBank = Math.max(0, Math.min(this.maxBankScale, targetBank));

            const interp = Math.min(1, t * this.tiltSmoothing * 10); 
            this.tiltAngle += (targetTilt - this.tiltAngle) * interp;
            this.bankFactor += (targetBank - this.bankFactor) * interp;
        } else {
            this.tiltAngle = 0;
            this.bankFactor = 0;
        }
        
        if (this.isExploding) {
            this.explosionTimer += deltaTime;
            if (this.explosionTimer >= this.explosionDuration) this.isAlive = false;
            return;
        }
    }
    
    takeDamage(dmg, particlesArray) {
        if (!this.isAlive || this.isExploding) return;
        this.currentHealth -= dmg;
        if (this.currentHealth <= 0) {
            this.isExploding = true;
            this.explosionTimer = 0;
            this.speed = 0; 
            this.isScored = true;
            if (particlesArray) this.generateParticles(particlesArray);
        }
    }
    
    fireAttacking(arr) {
        if (!this.targetPlayer) return;
        switch (this.weaponLevel) {
            case 1: return this.fireTowardsTarget(arr);
            case 2: return this.fireDouble(arr, true); 
            case 3: return this.fireTriple(arr, true); 
            default: return this.fireTowardsTarget(arr); 
        }
    }

    fire(arr) {
        if (!arr) return;
        switch (this.weaponLevel) {
            case 2: return this.fireDouble(arr, true); 
            case 3: return this.fireTriple(arr, true); 
            case 4: return this.fireExplosion360(arr);
            default: return this.fireSingle(arr);
        }
    }

    fireTowardsTarget(arr) { 
        if (!this.targetPlayer) return;
        const targetX = this.targetPlayer.x + this.targetPlayer.width / 2;
        const targetY = this.targetPlayer.y + this.targetPlayer.height / 2;
        const originX = this.x + this.width / 2;
        const originY = this.y + this.height / 2;
        const angle = Math.atan2(targetY - originY, targetX - originX); 
        arr.push(new Projectile(originX - (this.projectileWidth / 2), originY, this.projectileWidth, this.projectileHeight, this.getProjectileImg(0), this.projectileSpeed * 1.5, this.fireDamage, "enemy", angle, true));
    }

    fireSingle(arr) {
        const y = this.y + this.height * 0.7;
        const xSpawn = this.x + this.width * 0.5 - (this.projectileWidth / 2);
        arr.push(new Projectile(xSpawn, y, this.projectileWidth, this.projectileHeight, this.getProjectileImg(0), this.projectileSpeed, this.fireDamage, "enemy", Math.PI / 2, true));
    }

    fireDouble(arr, isTargeted = false) {
        const img = this.getProjectileImg(1) || this.getProjectileImg(0);
        const y = this.y + this.height * 0.7;
        let targetX = this.targetPlayer ? this.targetPlayer.x + this.targetPlayer.width / 2 : this.x + this.width / 2;
        let targetY = this.targetPlayer ? this.targetPlayer.y + this.targetPlayer.height / 2 : Infinity;
        const spread = 0.35; 
        const PROJ_WIDTH = this.projectileWidth;
        const PROJ_HEIGHT = this.projectileHeight;
        const xCenterOffset = this.x + this.width * 0.5;
        const xLeft = this.x + this.width * 0.20 - (PROJ_WIDTH / 2);
        const xRight = this.x + this.width * 0.80 - (PROJ_WIDTH / 2);
        let baseAngle = Math.PI / 2; 
        if (isTargeted) {
             const originY = this.y + this.height / 2;
             baseAngle = Math.atan2(targetY - originY, targetX - xCenterOffset);
        } 
        arr.push(new Projectile(xLeft, y, PROJ_WIDTH, PROJ_HEIGHT, img, this.projectileSpeed * 1.2, this.fireDamage, "enemy", baseAngle - spread, true));
        arr.push(new Projectile(xRight, y, PROJ_WIDTH, PROJ_HEIGHT, img, this.projectileSpeed * 1.2, this.fireDamage, "enemy", baseAngle + spread, true));
    }

    fireTriple(arr, isTargeted = false) {
        const img = this.getProjectileImg(2) || this.getProjectileImg(0);
        const y = this.y + this.height * 0.7;
        let targetX = this.targetPlayer ? this.targetPlayer.x + this.targetPlayer.width / 2 : this.x + this.width / 2;
        let targetY = this.targetPlayer ? this.targetPlayer.y + this.targetPlayer.height / 2 : Infinity;
        const spread = 0.15; 
        const PROJ_WIDTH = this.projectileWidth; 
        const PROJ_HEIGHT = this.projectileHeight; 
        const xCenterOffset = this.x + this.width * 0.5; 
        const xCenter = xCenterOffset - (PROJ_WIDTH / 2); 
        const xLeft = this.x + this.width * 0.20 - (PROJ_WIDTH / 2);
        const xRight = this.x + this.width * 0.80 - (PROJ_WIDTH / 2);
        let baseAngle = Math.PI / 2; 
        if (isTargeted) {
             const originY = this.y + this.height / 2;
             baseAngle = Math.atan2(targetY - originY, targetX - xCenterOffset);
        }
        arr.push(new Projectile(xCenter, y, PROJ_WIDTH, PROJ_HEIGHT, img, this.projectileSpeed * 0.9, this.fireDamage, "enemy", baseAngle, true));
        arr.push(new Projectile(xLeft, y, PROJ_WIDTH, PROJ_HEIGHT, img, this.projectileSpeed * 1.25, this.fireDamage, "enemy", baseAngle - spread, true));
        arr.push(new Projectile(xRight, y, PROJ_WIDTH, PROJ_HEIGHT, img, this.projectileSpeed * 1.25, this.fireDamage, "enemy", baseAngle + spread, true));
    }

    fireExplosion360(arr) {
        const img = this.getProjectileImg(2);
        const total = 12;
        const step = Math.PI * 2 / total;
        const PROJ_WIDTH = this.projectileWidth; 
        const PROJ_HEIGHT = this.projectileHeight; 
        const cx = this.x + this.width / 2;
        const cy = this.y + this.height / 2;
        const xSpawn = cx - (PROJ_WIDTH / 2); 
        const ySpawn = cy - (PROJ_HEIGHT / 2);
        for (let i = 0; i < total; i++) {
            arr.push(new Projectile(xSpawn, ySpawn, PROJ_WIDTH, PROJ_HEIGHT, img, this.projectileSpeed * 1.4, this.fireDamage, "enemy", step * i, true));
        }
    }
    
    drawPlasmaHalo(ctx) {
        const pulse = (Math.sin(this.plasmaPulse) + 1) * 0.5;
        const radius = Math.max(this.width, this.height) * 0.65;
        const cx = Math.round(this.x + this.width / 2);
        const cy = Math.round(this.y + this.height / 2);
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        const grad = ctx.createRadialGradient(cx, cy, radius * 0.1, cx, cy, radius);
        grad.addColorStop(0, `rgba(80,150,255, ${0.22 + pulse * 0.12})`);
        grad.addColorStop(0.6, `rgba(50,120,255, ${0.09 + pulse * 0.06})`);
        grad.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    drawPropulsor(ctx) {
        const cx = Math.round(this.x + this.width / 2);
        const cy = Math.round(this.y + this.height / 2);
        ctx.save();
        ctx.translate(cx, cy);
        if (this.isRotating) ctx.rotate(this.rotation * Math.PI / 180);
        const grad = ctx.createLinearGradient(0, -this.height/5, 0, -this.height);
        grad.addColorStop(0.0, 'rgba(0, 50, 100, 0.7)');
        grad.addColorStop(0.3, 'rgba(50, 200, 255, 0.4)');
        grad.addColorStop(1.0, 'rgba(0, 50, 100, 0.0)');
        ctx.fillStyle = grad;
        ctx.globalCompositeOperation = "lighter";
        ctx.fillRect(-this.width*0.05, -this.height/5, this.width*0.1, -this.height*0.5);
        ctx.restore();
    }

    drawExplosion(ctx) {
        const progress = this.explosionTimer / this.explosionDuration;
        const opacity = 1 - progress;
        const radius = Math.max(this.width, this.height) * 4.0 * Math.pow(progress, 0.7);
        const cx = this.x + this.width / 2;
        const cy = this.y + this.height / 2;
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        const g1 = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius * 0.25);
        g1.addColorStop(0, `rgba(255,255,255,${opacity})`);
        g1.addColorStop(1, `rgba(0,100,255,0)`);
        ctx.fillStyle = g1;
        ctx.beginPath();
        ctx.arc(cx, cy, radius * 0.25, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    generateParticles(particlesArray) {
        const cx = this.x + this.width / 2;
        const cy = this.y + this.height / 2;
        for (let i = 0; i < 25; i++) {
            const a = Math.random() * Math.PI * 2;
            const s = Math.random() * 10 + 3;
            particlesArray.push(new Particle(cx, cy, Math.random() * 5 + 2, 'rgba(0,150,255,1)', Math.cos(a) * s, Math.sin(a) * s, 0.96, 0.2, 60));
        }
    }

    draw(ctx) {
        if (this.isExploding) {
            this.drawExplosion(ctx);
            return;
        }

        if (this.isPropulsor) this.drawPropulsor(ctx);
        if (this.isPlasmaHalo) this.drawPlasmaHalo(ctx);

        const cx = Math.round(this.x + this.width / 2);
        const cy = Math.round(this.y + this.height / 2);

        ctx.save();
        ctx.translate(cx, cy);
        
        // 🛑 APLICAÇÃO DO BANK TURN (INCLINAÇÃO AÉREA)
        // 1. Reduz a largura (Efeito 3D de deitar a asa)
        ctx.scale(1.0 - this.bankFactor, 1.0); 
        
        // 2. Gira o nariz na direção da curva
        const totalRotationDeg = this.tiltAngle + (this.isRotating ? this.rotation : 0);
        ctx.rotate(totalRotationDeg * Math.PI / 180);

        if (this.img && this.img.complete) {
              ctx.drawImage(this.img, -this.width / 2, -this.height / 2, this.width, this.height);
        }
        
        ctx.restore();
    }
}