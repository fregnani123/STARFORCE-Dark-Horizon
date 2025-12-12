class Projectile extends GameObject {
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
        super(x, y, width, height, imagePath);

        this.speed = speed;
        this.damage = damage;
        this.owner = owner;
        this.isAlive = true;

        // Propriedades para guiamento
        this.isGuided = isGuided;
        this.target = null;
        
        // *** NOVO: Ângulo de rotação própria (Spin) em Radianos ***
        this.spinAngle = 0; 
        
        // callback para explosão (nível 4)
        this.onExplode = onExplode;

        // ângulo do tiro (Radianos) - Usado para direção do movimento
        if (useAbsoluteAngle) {
            this.angle = angle;
        } else {
            const baseAngle = owner === "player" ? -Math.PI / 2 : Math.PI / 2;
            this.angle = baseAngle + angle;
        }

        // explosivo
        this.isExplosive = false;
        this.explodeAfter = 0;
        this.timer = 0;
    }

    update(deltaTime) {
        
        // Lógica de Guiamento (Seeking Behavior)
        if (this.isGuided && this.target && this.target.isAlive) {
            
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

        // *** CORREÇÃO: Rotação Própria (Spin) - SÓ É CALCULADA SE FOR GUIADO ***
        if (this.isGuided) {
            const SPIN_RATE = 0.15; // Velocidade de giro (Ajuste conforme necessário)
            this.spinAngle += SPIN_RATE;
            
            if (this.spinAngle > Math.PI * 2) {
                this.spinAngle -= Math.PI * 2;
            }
        }
        // ************************************

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

        this.x += vx * (deltaTime / 1000);
        this.y += vy * (deltaTime / 1000);

        // *** ATUALIZAÇÃO FINAL DA ROTAÇÃO PARA GameObject (Aplicada a TODOS) ***
        let totalAngleRadians = this.angle;
        
        // Aplica o giro próprio e o ajuste de compensação visual SOMENTE se for guiado.
        if (this.isGuided) {
            totalAngleRadians += Math.PI / 2 + this.spinAngle;
        } else {
            totalAngleRadians += Math.PI / 2;
        }

        this.rotation = totalAngleRadians * (180 / Math.PI);
        // ***************************************************

        // 🚀 CORRIGIDO: remover só quando REALMENTE sair da tela usando limites dinâmicos
        const margin = 50;
        if (
            this.x < -margin ||
            this.x > CANVAS_WIDTH + margin || 
            this.y < -margin ||
            this.y > CANVAS_HEIGHT + margin
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

