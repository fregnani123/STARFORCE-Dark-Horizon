// ======================================================
// WINGMAN SHIP — Nave Parceira (15 segundos)
// Tecla F para ativar (requer upgrade desbloqueado)
// ======================================================
import { Projectile } from './Projectile.js';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from './globals.js';

const WINGMAN_DURATION     = 15000; // ms
const WINGMAN_FIRE_RATE    = 500;   // ms entre tiros
const WINGMAN_SPEED        = 25;    // dano por projétil
const WINGMAN_PROJ_SPEED   = 1000;
const WINGMAN_IMAGE        = '../assets/img/nave-player/nave-alien.png';
const WINGMAN_PROJ_IMAGE   = '../assets/img/projectile/tiro.png';
const WINGMAN_COOLDOWN     = 20000; // 20s de cooldown após acabar
const WINGMAN_ENGAGE_RANGE = 520;   // raio para caça de alvo
const WINGMAN_LEASH_RANGE  = 300;   // limite máximo longe do player
const WINGMAN_ORBIT_X      = 120;   // raio horizontal da órbita
const WINGMAN_ORBIT_Y      = 55;    // raio vertical da órbita

export class WingmanShip {
    constructor(playerX, playerY) {
        this.width  = 70;
        this.height = 80;

        // Começa à direita do player e entra vindo de fora da tela
        this.x = CANVAS_WIDTH + 80;
        this.y = playerY;
        this.entering = true;
        this.enterTargetX = playerX + 110;

        this.targetX = playerX + 110;
        this.targetY = playerY - 10;

        this.projectiles = [];
        this.fireTimer   = 0;
        this.timer       = 0;
        this.isAlive     = true;
        this.isLeaving   = false;
        this.leaveSpeedY = 0;
        this.orbitAngle  = 0;

        // Flash ao entrar
        this.flashTimer = 800;

        this.img = new Image();
        this.img.src = WINGMAN_IMAGE;
        this.imgReady = false;
        this.img.onload = () => { this.imgReady = true; };
    }

    /** Retorna o progresso do timer em [0..1] */
    get progress() {
        return Math.max(0, 1 - this.timer / WINGMAN_DURATION);
    }

    update(deltaTime, playerX, playerY, enemiesList = []) {
        if (!this.isAlive) return;

        const dt = deltaTime / 1000;

        // --- Entrada lateral ---
        if (this.entering) {
            this.x -= 900 * dt;
            if (this.x <= this.enterTargetX) {
                this.x = this.enterTargetX;
                this.entering = false;
            }
            return; // não dispara enquanto entra
        }

        this.timer += deltaTime;
        if (this.flashTimer > 0) this.flashTimer -= deltaTime;

        // --- Inicia saída quando o tempo acabar ---
        if (this.timer >= WINGMAN_DURATION && !this.isLeaving) {
            this.isLeaving = true;
            this.leaveSpeedY = 0;
        }

        if (this.isLeaving) {
            this.leaveSpeedY += 3000 * dt;
            this.y -= this.leaveSpeedY * dt;
            if (this.y + this.height < -120) this.isAlive = false;
            // Atualiza e desenha projéteis mesmo saindo
            this._updateProjectiles(deltaTime);
            return;
        }

        // --- IA: caça alvo próximo; sem alvo, orbita o player ---
        const nearest = this._findNearestEnemy(enemiesList);
        this.orbitAngle += dt * 2.3;

        if (nearest && this._distanceTo(nearest.x + nearest.width / 2, nearest.y + nearest.height / 2) <= WINGMAN_ENGAGE_RANGE) {
            const enemyCenterX = nearest.x + nearest.width / 2;
            const enemyCenterY = nearest.y + nearest.height / 2;
            const flank = enemyCenterX >= playerX ? -85 : 85;
            this.targetX = enemyCenterX + flank;
            this.targetY = enemyCenterY - 70;
        } else {
            this.targetX = playerX + Math.cos(this.orbitAngle) * WINGMAN_ORBIT_X;
            this.targetY = playerY - 10 + Math.sin(this.orbitAngle) * WINGMAN_ORBIT_Y;
        }

        // Leash: não deixa se afastar demais do jogador
        const dxPlayer = this.targetX - playerX;
        const dyPlayer = this.targetY - playerY;
        const distPlayer = Math.hypot(dxPlayer, dyPlayer);
        if (distPlayer > WINGMAN_LEASH_RANGE) {
            const s = WINGMAN_LEASH_RANGE / distPlayer;
            this.targetX = playerX + dxPlayer * s;
            this.targetY = playerY + dyPlayer * s;
        }

        this.x += (this.targetX - this.x) * 8 * dt;
        this.y += (this.targetY - this.y) * 8 * dt;

        // --- Mantém dentro da tela ---
        this.x = Math.max(0, Math.min(CANVAS_WIDTH - this.width,  this.x));
        this.y = Math.max(0, Math.min(CANVAS_HEIGHT - this.height, this.y));

        // --- Auto-fire ---
        this.fireTimer += deltaTime;
        if (this.fireTimer >= WINGMAN_FIRE_RATE) {
            this.fireTimer = 0;
            this._fire(enemiesList);
        }

        this._updateProjectiles(deltaTime);
    }

    _updateProjectiles(deltaTime) {
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const p = this.projectiles[i];
            p.update(deltaTime);
            if (!p.isAlive || p.y + p.height < 0) {
                this.projectiles.splice(i, 1);
            }
        }
    }

    _fire(enemiesList = []) {
        const nearest = this._findNearestEnemy(enemiesList);

        // Calcula ângulo absoluto em direção ao inimigo (ou reto pra cima)
        let angle = -Math.PI / 2; // padrão: reto pra cima
        if (nearest) {
            const dx = (nearest.x + nearest.width  / 2) - (this.x + this.width  / 2);
            const dy = (nearest.y + nearest.height / 2) - (this.y + this.height / 2);
            angle = Math.atan2(dy, dx);
        }

        const p = new Projectile(
            this.x + this.width / 2 - 5,
            this.y,
            10, 22,
            WINGMAN_PROJ_IMAGE,
            WINGMAN_PROJ_SPEED,
            WINGMAN_SPEED,
            'player',
            angle,
            true   // useAbsoluteAngle
        );
        p.customGlowColor = '#00ffee';
        this.projectiles.push(p);
    }

    _findNearestEnemy(enemiesList = []) {
        let nearest = null;
        let minDist = Infinity;
        for (const e of enemiesList) {
            if (!e || !e.isAlive || e.isExploding) continue;
            const dx = (e.x + e.width / 2) - (this.x + this.width / 2);
            const dy = (e.y + e.height / 2) - (this.y + this.height / 2);
            const dist = Math.hypot(dx, dy);
            if (dist < minDist) {
                minDist = dist;
                nearest = e;
            }
        }
        return nearest;
    }

    _distanceTo(x, y) {
        return Math.hypot((x - (this.x + this.width / 2)), (y - (this.y + this.height / 2)));
    }

    draw(ctx) {
        if (!this.isAlive) return;

        ctx.save();

        // Desenha projéteis
        for (const p of this.projectiles) p.draw(ctx);

        // Efeito de flash ao entrar
        if (this.flashTimer > 0) {
            ctx.globalAlpha = 0.4 + 0.6 * Math.abs(Math.sin(Date.now() / 60));
        }

        // Glow ciano
        ctx.shadowBlur  = 24;
        ctx.shadowColor = '#00ffee';

        if (this.imgReady) {
            ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
        } else {
            ctx.fillStyle = '#00ffee';
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }

        ctx.restore();

        // --- Barra de tempo ---
        if (!this.isLeaving) {
            const bw = this.width;
            const bh = 4;
            const bx = this.x;
            const by = this.y - 10;
            ctx.fillStyle = 'rgba(0,0,0,0.5)';
            ctx.fillRect(bx, by, bw, bh);
            const pct = this.progress;
            ctx.fillStyle = pct > 0.4 ? '#00ffee' : '#ff6600';
            ctx.fillRect(bx, by, bw * pct, bh);

            // Label "PARCEIRO"
            ctx.save();
            ctx.font = '9px Orbitron, monospace';
            ctx.fillStyle = '#00ffee';
            ctx.textAlign = 'center';
            ctx.fillText('PARCEIRO', bx + bw / 2, by - 3);
            ctx.restore();
        }
    }
}

/** Tempo de cooldown (ms) entre usos */
export const WINGMAN_COOLDOWN_MS = WINGMAN_COOLDOWN;
