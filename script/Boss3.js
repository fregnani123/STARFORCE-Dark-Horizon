// ======================================================
// BOSS 3 — MECHA SPIDER "VOID WEAVER" (Missão 2)
// Sistema: Muro de Proteção + Patas Procedurais
// HP: 4500 | Escudo: 1500 | Estilo: Tanque Aracnídeo (Original da Missão 3)
// ======================================================
import { Projectile } from './Projectile.js';
import { GameObject } from './GameObject.js';
import { Particle } from './particle.js';
import { derrotouBoss } from './FimDaMissao.js';
import { playBGM } from './audio_game.js';
import {
    CANVAS_WIDTH,
    CANVAS_HEIGHT,
    setCurrentBoss,
    setBossDefeated,
    particles,
    playerShip,
} from './globals.js';

// Função auxiliar para cálculos de animação suave
const lerp = (a, b, t) => a + (b - a) * t;

export class Boss3 extends GameObject {
    constructor(x, y) {
        const width = 320;
        const height = 180;
        // Inicializa o GameObject corretamente
        super(x, -350, width, height, '../assets/img/boss/boss-3.png');

        this.originalWidth = width;
        this.originalHeight = height;

        this.targetX = x;
        this.targetY = 130; // Posição de descanso na tela
        
        // Variáveis de Escala (Correção do Erro NaN)
        this.startScale = 0.5;
        this.targetScale = 1.0;
        this.currentScale = 0.5;

        // Status de Vida e Muro (Escudo)
        this.maxHealth = 4500;
        this.currentHealth = this.maxHealth;
        this.shieldHealth = 1500; // HP do Muro de Energia
        this.maxShieldHealth = 1500;
        this.shieldActive = true;

        // Configuração das Patas
        this.legCount = 8;
        this.legLength = 160;
        this.moveTimer = 0;
        this.moveInterval = 3000;

        this.isAlive = true;
        this.speed = 180;
        this.phase = 1;
        this.fireTimer = 0;
        this.weaponCooldown = 1000;
        this.introDone = false;

        this.floatSpeed = 0.0015;
        this.floatAmplitude = 15;
        this.rotation = 0; 

        // Visual
        this.auraOpacity = 0.7;
        this.auraRotation = 0;

        // Explosion
        this.isExploding = false;
        this.explosionTimer = 0;
        this.explosionDuration = 3000;
        this.explosionRadius = 0;
        this.maxExplosionRadius = CANVAS_WIDTH * 0.9;
        this.particlesGenerated = false;

        this.isBoss = true;
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
            this.auraRotation += 20 * (deltaTime / 16.67);
            this.auraOpacity = Math.max(0, 1.0 - progress * 1.5);
            return;
        }

        // Intro: Caindo do teto
        if (!this.introDone) {
            this.y += this.speed * t;
            
            // Cálculo de progresso seguro (sem NaN)
            const range = this.targetY - (-350);
            const progress = Math.max(0, Math.min(1.0, (this.y - (-350)) / range));
            
            this.currentScale = this.startScale + (this.targetScale - this.startScale) * progress;
            this.width = this.originalWidth * this.currentScale;
            this.height = this.originalHeight * this.currentScale;

            if (this.y >= this.targetY) {
                this.y = this.targetY;
                this.introDone = true;
            }
            return;
        }

        // Movimentação Lateral de Spider
        this.moveTimer += deltaTime;
        if (this.moveTimer >= this.moveInterval) {
            this.moveTimer = 0;
            this.targetX = 100 + Math.random() * (CANVAS_WIDTH - this.width - 200);
            this.moveInterval = 1500 + Math.random() * 3000;
        }
        this.x += (this.targetX - this.x) * 0.04;
        this.y = this.targetY + Math.sin(now * this.floatSpeed) * this.floatAmplitude;

        // 🎯 Inteligência de Mira Visual: O corpo acompanha o Player suavemente
        if (playerShip && playerShip.isAlive) {
            const centerX = this.x + this.width / 2;
            const centerY = this.y + this.height / 2;
            const targetAngle = Math.atan2((playerShip.y + playerShip.height / 2) - centerY, (playerShip.x + playerShip.width / 2) - centerX);
            const targetRotationDeg = (targetAngle - Math.PI / 2) * (180 / Math.PI);
            
            let diff = targetRotationDeg - this.rotation;
            while (diff > 180) diff -= 360;
            while (diff < -180) diff += 360;
            this.rotation += diff * 0.05; // Ajuste o 0.05 para um giro mais rápido ou lento
        }

        // Visual updates
        this.auraRotation += 2 * (deltaTime / 16.67);

        // Phases
        const hpPercent = this.currentHealth / this.maxHealth;
        if (hpPercent < 0.60 && this.phase === 1) {
            this.phase = 2;
            this.weaponCooldown = 800;
        }
        if (hpPercent < 0.25 && this.phase === 2) {
            this.phase = 3;
            this.weaponCooldown = 500;
        }

        this.fireTimer += deltaTime;
    }

    takeDamage(dmg, particlesArray) {
        // 🧱 Lógica do Muro (Escudo)
        if (this.shieldHealth > 0) {
            this.shieldHealth -= dmg;
            // Partículas elétricas no escudo
            if (particlesArray) {
                for(let i=0; i<2; i++) {
                    particlesArray.push(new Particle(this.x + this.width/2 + (Math.random()-0.5)*250, this.y + this.height * 0.9, 4, '#00f2ff', 0, 2, 0.9, 0.1, 15));
                }
            }
            if (this.shieldHealth <= 0) {
                this.shieldActive = false;
                this.auraOpacity = 1.0; // Brilho aumenta quando o escudo cai
            }
            return; // Bloqueia dano no boss enquanto tem escudo
        }

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
            case 1: this.shootNeedles(arr); break;
            case 2: this.shootWeb(arr); break;
            case 3: 
                this.shootNeedles(arr); 
                if (Math.random() < 0.3) this.shootAcidRain(arr); 
                break;
        }
    }

    shootNeedles(arr) {
        const cx = this.x + this.width / 2;
        const cy = this.y + this.height * 0.8;

        let angleToPlayer = Math.PI / 2; // Padrão: reto para baixo
        if (playerShip && playerShip.isAlive) {
            angleToPlayer = Math.atan2((playerShip.y + playerShip.height / 2) - cy, (playerShip.x + playerShip.width / 2) - cx);
        }

        for (let i = -2; i <= 2; i++) {
            // Centraliza o leque de agulhas na direção do jogador
            const p = new Projectile(cx + i * 30, cy, 22, 38, '../assets/img/projectile/tiro-verde.png', 650, 18, 'enemy', angleToPlayer + (i * 0.15), true);
            p.customGlowColor = "#adff2f";
            arr.push(p);
        }
    }

    shootWeb(arr) {
        const cx = this.x + this.width / 2;
        const cy = this.y + this.height * 0.8;

        let angleToPlayer = Math.PI / 2;
        if (playerShip && playerShip.isAlive) {
            angleToPlayer = Math.atan2((playerShip.y + playerShip.height / 2) - cy, (playerShip.x + playerShip.width / 2) - cx);
        }

        for (let i = -1; i <= 1; i++) {
            // Dispara a teia de plasma verde focada no alvo
            const p = new Projectile(cx + i * 50, cy, 35, 35, '../assets/img/projectile/espinho-verde.png', 500, 25, 'enemy', angleToPlayer + (i * 0.35), true);
            p.customGlowColor = "#00ff44";
            arr.push(p);
        }
    }

    shootAcidRain(arr) {
        const cx = this.x + this.width / 2;
        const cy = this.y + this.height / 2;
        const total = 18;
        for (let i = 0; i < total; i++) {
            const angle = (i / total) * Math.PI * 2;
            const p = new Projectile(cx, cy, 24, 24, '../assets/img/projectile/tiro-espinho-roxo.png', 400, 25, 'enemy', angle, true);
            p.customGlowColor = "#cc00ff";
            arr.push(p);
        }
    }

    drawSpiderLegs(ctx) {
        const time = performance.now() / 140;
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;

        ctx.save();
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        for (let i = 0; i < this.legCount; i++) {
            const baseAngle = (i / this.legCount) * Math.PI * 2 + (Math.sin(time * 0.05) * 0.05);
            const stepOffset = i * (Math.PI / 4);
            const extension = Math.sin(time + stepOffset) * (this.legLength * 0.25);
            const lift = Math.abs(Math.cos(time + stepOffset)) * 25;

            const currentLength = this.legLength + extension;
            const startX = centerX + Math.cos(baseAngle) * (this.width * 0.25);
            const startY = centerY + Math.sin(baseAngle) * (this.height * 0.25);
            const endX = centerX + Math.cos(baseAngle) * currentLength;
            const endY = centerY + Math.sin(baseAngle) * currentLength;

            const midX = (startX + endX) / 2;
            const midY = (startY + endY) / 2 - lift;

            // Sombra no solo
            ctx.strokeStyle = "rgba(0,0,0,0.3)";
            ctx.lineWidth = 14;
            ctx.beginPath(); ctx.moveTo(startX + 10, startY + 15); ctx.lineTo(endX + 10, endY + 15); ctx.stroke();

            // Estrutura Mecânica (Cor Metal Grafite / Quase Preto)
            ctx.strokeStyle = "#121212";
            ctx.lineWidth = 12;
            ctx.beginPath(); ctx.moveTo(startX, startY); ctx.lineTo(midX, midY); ctx.stroke();

            ctx.strokeStyle = "#2a2a2a";
            ctx.lineWidth = 8;
            ctx.beginPath(); ctx.moveTo(midX, midY); ctx.lineTo(endX, endY); ctx.stroke();

            // Juntas Hidráulicas
            ctx.fillStyle = this.shieldActive ? "#00ff44" : "#ff3300";
            ctx.beginPath(); ctx.arc(midX, midY, 6, 0, Math.PI * 2); ctx.fill();
        }
        ctx.restore();
    }

    drawShield(ctx) {
        if (!this.shieldActive) return;
        const cx = this.x + this.width / 2;
        const cy = this.y + this.height * 0.8;
        
        ctx.save();
        ctx.setLineDash([15, 6]);
        ctx.strokeStyle = `rgba(0, 242, 255, ${0.3 + Math.sin(Date.now()*0.008)*0.2})`;
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.arc(cx, cy, 210, Math.PI * 0.1, Math.PI * 0.9);
        ctx.stroke();
        
        ctx.fillStyle = "#00f2ff";
        ctx.font = "bold 16px Orbitron";
        ctx.textAlign = "center";
        ctx.fillText(`ENERGY WALL: ${Math.floor((this.shieldHealth/this.maxShieldHealth)*100)}%`, cx, cy + 45);
        ctx.restore();
    }

    generateParticles(arr) {
        if (this.particlesGenerated) return;
        const cx = this.x + this.originalWidth / 2;
        const cy = this.y + this.originalHeight / 2;
        for (let i = 0; i < 400; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 2 + Math.random() * 7;
            const color = `#00ff44`;
            const size = 3 + Math.random() * 6;
            const life = 80 + Math.random() * 100;
            arr.push(new Particle(cx, cy, size, color, Math.cos(angle) * speed, Math.sin(angle) * speed, 0.96, 0.08, life));
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

        this.drawSpiderLegs(ctx);
        this.drawShield(ctx);

        const cx = this.x + this.width / 2;
        const cy = this.y + this.height / 2;

        ctx.save();
        ctx.translate(cx, cy);
        
        // Pequeno tremor de "fúria" se estiver sem muro
        if (!this.shieldActive) ctx.translate((Math.random()-0.5)*6, (Math.random()-0.5)*6);
        
        ctx.scale(this.currentScale, this.currentScale);

        // 🔄 Aplica a rotação no torso da aranha para encarar o player
        ctx.rotate(this.rotation * Math.PI / 180);

        // === OUTER AURA ===
        const auraGrad = ctx.createRadialGradient(0, 0, 50, 0, 0, 200);
        auraGrad.addColorStop(0, this.shieldActive ? `rgba(0, 255, 68, 0.08)` : `rgba(255, 50, 0, 0.15)`);
        auraGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.beginPath(); ctx.arc(0, 0, 200, 0, Math.PI * 2);
        ctx.fillStyle = auraGrad;
        ctx.fill();

        // === IMAGEM DO BOSS (corpo) ===
        if (this.img && (this.img.complete || this.img.naturalWidth > 0)) {
            ctx.shadowColor = this.shieldActive ? "#00ff44" : "#ff3300";
            ctx.shadowBlur = 30;
            ctx.drawImage(this.img, -this.originalWidth / 2, -this.originalHeight / 2, this.originalWidth, this.originalHeight);
        }

        ctx.restore(); // end translate/scale
    }

    _drawExplosion(ctx, cx, cy) {
        const progress = this.explosionTimer / this.explosionDuration;

        // White flash core
        const alpha = Math.max(0, 1.0 - progress * 2.2);
        if (alpha > 0) {
            const wGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, this.explosionRadius * 0.4);
            wGrad.addColorStop(0, `rgba(255,255,255,${alpha})`);
            wGrad.addColorStop(0.5, `rgba(0,255,68,${alpha * 0.5})`);
            wGrad.addColorStop(1, 'rgba(0,200,100,0)');
            ctx.beginPath();
            ctx.arc(cx, cy, this.explosionRadius * 0.4, 0, Math.PI * 2);
            ctx.fillStyle = wGrad;
            ctx.fill();
        }

        // Expanding cyan shockwave
        const shockAlpha = Math.max(0, (1 - progress) * 0.65);
        const sGrad = ctx.createRadialGradient(cx, cy, this.explosionRadius * 0.75, cx, cy, this.explosionRadius);
        sGrad.addColorStop(0, `rgba(0,255,68,${shockAlpha})`);
        sGrad.addColorStop(0.5, `rgba(20,60,30,${shockAlpha * 0.7})`);
        sGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.beginPath();
        ctx.arc(cx, cy, this.explosionRadius, 0, Math.PI * 2);
        ctx.fillStyle = sGrad;
        ctx.fill();
    }
}
