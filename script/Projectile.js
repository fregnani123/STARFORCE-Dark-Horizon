import { GameObject } from './GameObject.js';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from './globals.js';

export class Projectile extends GameObject {
    constructor(x, y, width, height, imagePath, speed, damage, owner = "player", angle = 0, useAbsoluteAngle = false, onExplode = null, isGuided = false) {
        super(x, y, width, height, imagePath);

        this.speed = speed;
        this.damage = damage;
        this.owner = owner;
        this.isAlive = true;
        this.isGuided = isGuided;
        this.target = null;
        this.spinAngle = 0; 
        this.onExplode = onExplode;

        // --- SISTEMA DE RASTRO ---
        this.trail = [];
        this.maxTrailSteps = 6; // Quantidade de vultos atrás do tiro

        if (useAbsoluteAngle) {
            this.angle = angle;
        } else {
            const baseAngle = owner === "player" ? -Math.PI / 2 : Math.PI / 2;
            this.angle = baseAngle + angle;
        }

        this.isExplosive = false;
        this.explodeAfter = 0;
        this.timer = 0;
    }

    update(deltaTime) {
        // Salva a posição atual para o rastro ANTES de mover
        this.trail.unshift({ x: this.x, y: this.y, rotation: this.rotation });
        if (this.trail.length > this.maxTrailSteps) this.trail.pop();

        if (this.isGuided && this.target && this.target.isAlive) {
            const projCenterX = this.x + this.width / 2;
            const projCenterY = this.y + this.height / 2;
            const targetCenterX = this.target.x + this.target.width / 2;
            const targetCenterY = this.target.y + this.target.height / 2;
            const targetAngle = Math.atan2(targetCenterY - projCenterY, targetCenterX - projCenterX);

            const TURN_RATE = 0.05; 
            let angleDifference = targetAngle - this.angle;
            while (angleDifference > Math.PI) angleDifference -= 2 * Math.PI;
            while (angleDifference < -Math.PI) angleDifference += 2 * Math.PI;
            this.angle += angleDifference * TURN_RATE;
        }

        const vx = Math.cos(this.angle) * this.speed;
        const vy = Math.sin(this.angle) * this.speed;
        const deltaFraction = deltaTime / 1000;

        this.x += vx * deltaFraction;
        this.y += vy * deltaFraction;

        let totalAngleRadians = this.angle + Math.PI / 2;
        this.rotation = totalAngleRadians * (180 / Math.PI);

        const margin = 50;
        if (this.x < -margin || this.x > CANVAS_WIDTH + margin || this.y < -margin || this.y > CANVAS_HEIGHT + margin) {
            this.isAlive = false;
        }
    }

   draw(ctx) {
        if (!this.isReady || !this.img) return;

        const glowColor = this.customGlowColor || (this.owner === "player" ? "#00f2ff" : "#ff3366");

        // --- 1. DESENHA O RASTRO (TRAIL) ---
        ctx.save();
        this.trail.forEach((pos, index) => {
            const ratio = (this.maxTrailSteps - index) / this.maxTrailSteps;
            ctx.globalAlpha = ratio * 0.3; // Rastro um pouco mais sutil
            
            const w = this.width * (0.6 + ratio * 0.4);
            const h = this.height * (0.6 + ratio * 0.4);
            
            ctx.save();
            ctx.translate(pos.x + this.width / 2, pos.y + this.height / 2);
            ctx.rotate(pos.rotation * Math.PI / 180);
            ctx.drawImage(this.img, -w / 2, -h / 2, w, h);
            ctx.restore();
        });
        ctx.restore();

        // --- 2. DESENHA O TIRO PRINCIPAL COM BRILHO TURBO ---
        ctx.save();
        
        // Ativa o modo de mesclagem aditiva para o brilho "estourar"
        ctx.globalCompositeOperation = "lighter";

        // A. Aura de cor externa (Glow Suave)
        ctx.beginPath();
        let gradient = ctx.createRadialGradient(
            this.x + this.width / 2, this.y + this.height / 2, 0,
            this.x + this.width / 2, this.y + this.height / 2, this.width
        );
        gradient.addColorStop(0, glowColor);
        gradient.addColorStop(1, "transparent");
        ctx.fillStyle = gradient;
        ctx.globalAlpha = 0.6;
        ctx.fill();

        // B. Sombra Neon no Sprite
        ctx.shadowBlur = 12; // Aumentado para dar mais presença
        ctx.shadowColor = glowColor;
        
        // Desenha a imagem real (via GameObject)
        super.draw(ctx);

        // C. Núcleo central de "Energia" (Branco)
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2, this.y + this.height / 2, this.width / 5, 0, Math.PI * 2);
        ctx.fillStyle = "white";
        ctx.globalAlpha = 0.9;
        ctx.fill();

        ctx.restore();
    }
    explode() {
        this.isAlive = false;
        if (!this.onExplode) return;
        const total = 8;
        const step = (Math.PI * 2) / total;
        for (let i = 0; i < total; i++) {
            this.onExplode(new Projectile(this.x, this.y, this.width, this.height, this.imagePath, this.speed * 1.2, this.damage, this.owner, step * i, true));
        }
    }
}
