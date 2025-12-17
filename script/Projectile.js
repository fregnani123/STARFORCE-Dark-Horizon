// ======================================================
// IMPORTS OBRIGATÓRIOS
// ======================================================
import { GameObject } from './GameObject.js'; // 1. Herança (GameObject)
import { CANVAS_WIDTH, CANVAS_HEIGHT } from './globals.js'; // 2. Limites da tela (Globals)


export class Projectile extends GameObject {
    constructor(
        x, y,
        width, height,
        imagePath,
        speed,
        damage,
        owner = "player",
        angle = 0,
        useAbsoluteAngle = false,
        onExplode = null,
        // Argumento para guiamento
        isGuided = false 
    ) {
        // Chamada do construtor da classe pai (GameObject)
        super(x, y, width, height, imagePath);

        this.speed = speed;
        this.damage = damage;
        this.owner = owner;
        this.isAlive = true;

        // Propriedades para guiamento
        this.isGuided = isGuided;
        this.target = null;
        
        // Propriedades de rotação
        this.spinAngle = 0; 
        this.onExplode = onExplode;

        // ângulo do tiro (Radianos)
        if (useAbsoluteAngle) {
            this.angle = angle;
        } else {
            // Usa Math.PI, que é nativo do JavaScript e não precisa de import
            const baseAngle = owner === "player" ? -Math.PI / 2 : Math.PI / 2;
            this.angle = baseAngle + angle;
        }

        // Propriedades de explosão
        this.isExplosive = false;
        this.explodeAfter = 0;
        this.timer = 0;
    }

    update(deltaTime) {
        
        // Lógica de Guiamento (Seeking Behavior)
        if (this.isGuided && this.target && this.target.isAlive) {
            // ... (Lógica de guiamento original, que usa Math.atan2, Math.PI) ...
            
            const projCenterX = this.x + this.width / 2;
            const projCenterY = this.y + this.height / 2;
            const targetCenterX = this.target.x + this.target.width / 2;
            const targetCenterY = this.target.y + this.target.height / 2;

            const targetAngle = Math.atan2(
                targetCenterY - projCenterY,
                targetCenterX - projCenterX
            );

            const TURN_RATE = 0.05; 
            
            let angleDifference = targetAngle - this.angle;
            
            while (angleDifference > Math.PI) angleDifference -= 2 * Math.PI;
            while (angleDifference < -Math.PI) angleDifference += 2 * Math.PI;

            this.angle += angleDifference * TURN_RATE;
        }

        // Rotação Própria (Spin) - A rotação em radianos é necessária para o desenho
        if (this.isGuided) {
            const SPIN_RATE = 0.15;
            this.spinAngle += SPIN_RATE;
            
            if (this.spinAngle > Math.PI * 2) {
                this.spinAngle -= Math.PI * 2;
            }
        }

        // explosivo → conta tempo
        if (this.isExplosive) {
            this.timer += deltaTime;
            if (this.timer >= this.explodeAfter) {
                this.explode();
                return;
            }
        }

        // mover usando sen/cos
        const vx = Math.cos(this.angle) * this.speed;
        const vy = Math.sin(this.angle) * this.speed;

        // Otimizado: Multiplicar a velocidade pelo delta time fracionário
        const deltaFraction = deltaTime / 1000;

        this.x += vx * deltaFraction;
        this.y += vy * deltaFraction;

        // ATUALIZAÇÃO FINAL DA ROTAÇÃO PARA GameObject
        let totalAngleRadians = this.angle;
        
        if (this.isGuided) {
            totalAngleRadians += Math.PI / 2 + this.spinAngle;
        } else {
            totalAngleRadians += Math.PI / 2;
        }

        this.rotation = totalAngleRadians * (180 / Math.PI);

        // 🚀 CORRIGIDO: Remoção fora da tela usando CONSTANTES IMPORTADAS
        const margin = 50;
        if (
            this.x < -margin ||
            this.x > CANVAS_WIDTH + margin || // <-- USANDO CANVAS_WIDTH IMPORTADO
            this.y < -margin ||
            this.y > CANVAS_HEIGHT + margin // <-- USANDO CANVAS_HEIGHT IMPORTADO
        ) {
            this.isAlive = false;
        }
    }

    // explosão do nível 4 - gera 8 tiros em 360°
    explode() {
        this.isAlive = false;

        if (!this.onExplode) return;

        const total = 8;
        const step = (Math.PI * 2) / total;

        for (let i = 0; i < total; i++) {
            const ang = step * i;

            // RECRIANDO INSTÂNCIA DE PROJECTILE: Note que a classe Projectile é usada aqui
            // Sem o export na definição da classe, isso não funcionaria em um módulo.
            this.onExplode(new Projectile( 
                this.x,
                this.y,
                this.width,
                this.height,
                this.imagePath,
                this.speed * 1.2,
                this.damage,
                "enemy",
                ang,
                true
            ));
        }
    }
}