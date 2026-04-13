// ======================================================
// BOSS1 - DRONE COMMANDER (Missão 1)
// Imagem: boss-1.png + overlay canvas (aura, anel, core)
// HP: 2500 | 3 fases | Aura ciano/verde
// ======================================================
import { Projectile } from './Projectile.js';
import { Particle } from './particle.js';
import { derrotouBoss } from './FimDoGame_NEW.js';
import { playBGM } from './audio_game.js';
import {
    CANVAS_WIDTH,
    CANVAS_HEIGHT,
    setCurrentBoss,
    setBossDefeated,
    particles,
    bossDefeated
} from './globals.js';

export class Boss1 {
    constructor(x, y) {
        this.originalWidth = 200;
        this.originalHeight = 160;
        this.width = this.originalWidth;
        this.height = this.originalHeight;

        this.baseX = x;
        this.targetX = x;
        this.x = x;

        this.startY = -220;
        this.targetY = 60;
        this.y = -220;

        this.moveTimer = 0;
        this.moveInterval = 2000 + Math.random() * 2000;

        this.startScale = 0.1;
        this.targetScale = 1.0;
        this.currentScale = this.startScale;

        this.maxHealth = 2500;
        this.currentHealth = this.maxHealth;
        this.isAlive = true;
        this.speed = 380;
        this.phase = 1;
        this.fireTimer = 0;
        this.weaponCooldown = 1200;
        this.introDone = false;

        this.floatSpeed = 0.003;
        this.floatAmplitude = 8;

        this.exitMode = false;
        this.exitTimer = 0;
        this.exitCooldown = 0;
        this.exitInterval = 8000 + Math.random() * 5000;
        this.exitHideTime = 1000;

        // Visual
        this.ringRotation = 0;
        this.coreGlow = 0;
        this.coreGlowDir = 1;
        this.auraOpacity = 1.0;
        this.auraRotation = 0;

        // Explosion
        this.isExploding = false;
        this.explosionTimer = 0;
        this.explosionDuration = 3000;
        this.explosionRadius = 0;
        this.maxExplosionRadius = CANVAS_WIDTH * 0.8;
        this.particlesGenerated = false;

        // Needed by gameLoop collision check
        this.isReady = true;

        // Imagem do boss
        this._img = new Image();
        this._imgReady = false;
        this._img.onload = () => { this._imgReady = true; };
        this._img.src = '../assets/img/boss/boss-1.png';
    }

    update(deltaTime) {
        const t = deltaTime / 1000;
        const now = Date.now();

        if (this.isExploding) {
            this.explosionTimer += deltaTime;
            this.width = 0;
            this.height = 0;
            const progress = this.explosionTimer / this.explosionDuration;
            this.explosionRadius = progress * this.maxExplosionRadius;
            if (this.explosionTimer >= this.explosionDuration) {
                this.isAlive = false;
                derrotouBoss();
            }
            this.ringRotation += 20 * (deltaTime / 16.67);
            this.auraOpacity = Math.max(0, 1.0 - progress * 1.5);
            return;
        }

        if (!this.introDone) {
            this.y += this.speed * t;
            const progress = Math.min(1.0, (this.y - this.startY) / (this.targetY - this.startY));
            this.currentScale = this.startScale + (this.targetScale - this.startScale) * progress;
            this.width = this.originalWidth * this.currentScale;
            this.height = this.originalHeight * this.currentScale;
            if (this.y >= this.targetY) {
                this.y = this.targetY;
                this.introDone = true;
                this.currentScale = 1.0;
                this.width = this.originalWidth;
                this.height = this.originalHeight;
            }
            return;
        }

        const hpPercent = this.currentHealth / this.maxHealth;

        // Exit mode (appears below 50% HP)
        this.exitCooldown += deltaTime;
        if (!this.exitMode && hpPercent < 0.50 && this.exitCooldown >= this.exitInterval) {
            this.exitMode = true;
            this.exitCooldown = 0;
            this.exitInterval = 5000 + Math.random() * 5000;
            this.exitDirection = Math.random() < 0.5 ? 'left' : 'right';
            this.targetX = this.exitDirection === 'left'
                ? -this.width - 100
                : CANVAS_WIDTH + 100;
            this.exitTimer = 0;
        }

        if (this.exitMode) {
            this.exitTimer += deltaTime;
            this.x += (this.targetX - this.x) * 0.07;
            if (this.exitTimer >= this.exitHideTime) {
                this.x = Math.random() < 0.5 ? -this.width : CANVAS_WIDTH;
                this.targetX = 60 + Math.random() * (CANVAS_WIDTH - this.width - 120);
                this.exitMode = false;
            }
            this.y = this.targetY;
        } else {
            this.moveTimer += deltaTime;
            if (this.moveTimer >= this.moveInterval) {
                this.moveTimer = 0;
                this.moveInterval = 1500 + Math.random() * 2000;
                const opts = [
                    60,
                    CANVAS_WIDTH / 2 - this.width / 2,
                    CANVAS_WIDTH - this.width - 60,
                    60 + Math.random() * (CANVAS_WIDTH - this.width - 120)
                ];
                this.targetX = opts[Math.floor(Math.random() * opts.length)];
            }
            this.x += (this.targetX - this.x) * 0.025;
            this.y = this.targetY + Math.sin(now * this.floatSpeed) * this.floatAmplitude;
        }

        // Visual updates
        this.ringRotation += 2 * (deltaTime / 16.67);
        this.auraRotation += 1.5 * (deltaTime / 16.67);
        this.coreGlow += 0.005 * this.coreGlowDir * deltaTime;
        if (this.coreGlow >= 1) { this.coreGlow = 1; this.coreGlowDir = -1; }
        if (this.coreGlow <= 0) { this.coreGlow = 0; this.coreGlowDir = 1; }

        // Phases
        if (hpPercent < 0.60 && this.phase === 1) {
            this.phase = 2;
            this.weaponCooldown = 850;
        }
        if (hpPercent < 0.25 && this.phase === 2) {
            this.phase = 3;
            this.weaponCooldown = 600;
        }

        this.fireTimer += deltaTime;
    }

    takeDamage(dmg, particlesArray) {
        this.currentHealth -= dmg;
        const bar = document.getElementById('bossHealthBar');
        if (bar) bar.style.width = Math.max(0, (this.currentHealth / this.maxHealth) * 100) + '%';

        if (this.currentHealth <= 0 && !this.isExploding) {
            this.isExploding = true;
            this.isAlive = true;
            setBossDefeated(true);
            if (typeof playBGM === 'function') {
                playBGM('../assets/audio/explosaoBoss.mp3', 1);
            }
            if (particlesArray) this.generateParticles(particlesArray);
            const barContainer = document.getElementById('bossHealthBarContainer');
            if (barContainer) barContainer.style.display = 'none';
        }
    }

    fire(arr) {
        if (this.isExploding || !this.introDone) return;
        if (this.fireTimer < this.weaponCooldown) return;
        this.fireTimer = 0;
        switch (this.phase) {
            case 1: this.shootSpread3(arr); break;
            case 2: this.shootSpread5(arr); break;
            case 3: this.shootSpread5(arr); this.shootSideGuns(arr); break;
        }
    }

    shootSpread3(arr) {
        const cx = this.x + this.width / 2;
        const cy = this.y + this.height * 0.85;
        const projs = [
            new Projectile(cx, cy, 20, 35, '../assets/img/projectile/tiro-verde.png', 750, 18, 'enemy', 0),
            new Projectile(cx - 30, cy - 10, 20, 35, '../assets/img/projectile/tiro-verde.png', 750, 18, 'enemy', -0.18),
            new Projectile(cx + 30, cy - 10, 20, 35, '../assets/img/projectile/tiro-verde.png', 750, 18, 'enemy', 0.18),
        ];
        projs.forEach(p => { p.customGlowColor = '#00ff55'; arr.push(p); });
    }

    shootSpread5(arr) {
        const cx = this.x + this.width / 2;
        const cy = this.y + this.height * 0.85;
        for (let i = -2; i <= 2; i++) {
            const p = new Projectile(cx + i * 22, cy, 20, 32, '../assets/img/projectile/tiro-verde.png', 700, 20, 'enemy', i * 0.14);
            p.customGlowColor = '#00ff55';
            arr.push(p);
        }
    }

    shootSideGuns(arr) {
        const cy = this.y + this.height / 2;
        const p1 = new Projectile(this.x - 5, cy, 22, 32, '../assets/img/projectile/espinho-verde.png', 600, 15, 'enemy', 0.5);
        const p2 = new Projectile(this.x + this.width - 13, cy, 22, 32, '../assets/img/projectile/espinho-verde.png', 600, 15, 'enemy', -0.5);
        p1.customGlowColor = '#00ff55';
        p2.customGlowColor = '#00ff55';
        arr.push(p1, p2);
    }

    generateParticles(arr) {
        if (this.particlesGenerated) return;
        const cx = this.x + this.originalWidth / 2;
        const cy = this.y + this.originalHeight / 2;
        for (let i = 0; i < 300; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 2 + Math.random() * 7;
            const g = 150 + Math.floor(Math.random() * 105);
            const b = 100 + Math.floor(Math.random() * 155);
            const color = `rgb(0, ${g - 50}, ${b - 50})`;
            const plasmaColor = `rgba(0, ${g}, ${b}, 1)`;
            const size = 3 + Math.random() * 6;
            const life = 80 + Math.random() * 100;
            arr.push(new Particle(cx, cy, size, color, Math.cos(angle) * speed, Math.sin(angle) * speed, 0.96, 0.08, life));
            if (i % 3 === 0) {
                arr.push(new Particle(cx, cy, size * 0.7, plasmaColor, Math.cos(angle) * speed * 1.5, Math.sin(angle) * speed * 1.5, 0.98, 0.03, life * 0.7));
            }
        }
        this.particlesGenerated = true;
    }

    draw(ctx) {
        if (this.isExploding) {
            const cx = this.x + this.originalWidth / 2;
            const cy = this.y + this.originalHeight / 2;
            this._drawExplosion(ctx, cx, cy);
            return;
        }

        const cx = this.x + this.width / 2;
        const cy = this.y + this.height / 2;
        const s = this.currentScale;
        const hpPercent = this.currentHealth / this.maxHealth;

        // Aura color by phase
        let auraR, auraG, auraB;
        if (hpPercent > 0.6) { auraR = 0; auraG = 255; auraB = 150; }
        else if (hpPercent > 0.25) { auraR = 100; auraG = 255; auraB = 0; }
        else { auraR = 255; auraG = 80; auraB = 0; }

        ctx.save();
        ctx.translate(cx, cy);
        ctx.scale(s, s);

        // === OUTER AURA ===
        ctx.save();
        ctx.rotate(this.auraRotation * Math.PI / 180);
        const auraGrad = ctx.createRadialGradient(0, 0, 35, 0, 0, 120);
        auraGrad.addColorStop(0, `rgba(${auraR},${auraG},${auraB},0.18)`);
        auraGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.beginPath();
        ctx.arc(0, 0, 120, 0, Math.PI * 2);
        ctx.fillStyle = auraGrad;
        ctx.fill();
        ctx.restore();

        // === IMAGEM DO BOSS (base) ===
        if (this._imgReady) {
            ctx.save();
            ctx.shadowColor = `rgb(${auraR},${auraG},${auraB})`;
            ctx.shadowBlur = 20 + this.coreGlow * 15;
            ctx.drawImage(this._img, -this.originalWidth / 2, -this.originalHeight / 2, this.originalWidth, this.originalHeight);
            ctx.restore();
        }

        // === ROTATING DASHED RING ===
        ctx.save();
        ctx.rotate(this.ringRotation * Math.PI / 180);
        ctx.strokeStyle = `rgba(${auraR},${auraG},${auraB},0.85)`;
        ctx.lineWidth = 2;
        ctx.setLineDash([8, 5]);
        ctx.beginPath();
        ctx.arc(0, 0, 38, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
        // 4 nodes
        for (let i = 0; i < 4; i++) {
            const a = (i / 4) * Math.PI * 2;
            ctx.beginPath();
            ctx.arc(Math.cos(a) * 38, Math.sin(a) * 38, 3.5, 0, Math.PI * 2);
            ctx.fillStyle = '#fff';
            ctx.fill();
        }
        ctx.restore();

        // === GLOWING CORE ===
        ctx.save();
        const coreR = 14 + this.coreGlow * 6;
        const coreGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, coreR + 8);
        coreGrad.addColorStop(0, '#ffffff');
        coreGrad.addColorStop(0.35, `rgba(${auraR},${auraG},${auraB},1)`);
        coreGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.beginPath();
        ctx.arc(0, 0, coreR + 8, 0, Math.PI * 2);
        ctx.fillStyle = coreGrad;
        ctx.fill();
        ctx.restore();

        // === DETAIL LINES ===
        ctx.save();
        ctx.strokeStyle = `rgba(${auraR},${auraG},${auraB},0.3)`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-50, -22); ctx.lineTo(50, -22);
        ctx.moveTo(-50, 22);  ctx.lineTo(50, 22);
        ctx.stroke();
        ctx.restore();

        ctx.restore(); // end translate/scale
    }

    _drawExplosion(ctx, cx, cy) {
        const progress = this.explosionTimer / this.explosionDuration;

        // White flash core
        const alpha = Math.max(0, 1.0 - progress * 2.2);
        if (alpha > 0) {
            const wGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, this.explosionRadius * 0.4);
            wGrad.addColorStop(0, `rgba(255,255,255,${alpha})`);
            wGrad.addColorStop(0.5, `rgba(180,255,220,${alpha * 0.5})`);
            wGrad.addColorStop(1, 'rgba(0,200,100,0)');
            ctx.beginPath();
            ctx.arc(cx, cy, this.explosionRadius * 0.4, 0, Math.PI * 2);
            ctx.fillStyle = wGrad;
            ctx.fill();
        }

        // Expanding cyan shockwave
        const shockAlpha = Math.max(0, (1 - progress) * 0.65);
        const sGrad = ctx.createRadialGradient(cx, cy, this.explosionRadius * 0.75, cx, cy, this.explosionRadius);
        sGrad.addColorStop(0, `rgba(0,255,150,${shockAlpha})`);
        sGrad.addColorStop(0.5, `rgba(0,200,255,${shockAlpha * 0.7})`);
        sGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.beginPath();
        ctx.arc(cx, cy, this.explosionRadius, 0, Math.PI * 2);
        ctx.fillStyle = sGrad;
        ctx.fill();
    }
}
