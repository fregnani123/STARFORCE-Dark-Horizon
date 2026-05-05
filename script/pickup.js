// ======================================================
// IMPORTS OBRIGATÓRIOS
// ======================================================
import { 
    CANVAS_HEIGHT,
    magnetActive,
    magnetRadius,
    magnetStrength,
    currentMissionId,
    // Importamos a função para atualizar as estrelas com segurança
    updatePlayerStars 
} from './globals.js'; 

// ----------------------------------------------------
// ✨ CLASSE PICKUP - COM MAGNETISMO E CONTADOR MODULAR
// ----------------------------------------------------
export class Pickup {
    constructor(x, y, width, height, imagePath, effect) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.image = new Image();
        this.image.src = imagePath;
        this.effect = effect;
        
        this.speed = 80; 
        this.isAlive = true;
        this.rotation = 0; 
        this.rotationSpeed = 3; 
        
        this.vx = 0; // Velocidade horizontal (Ímã)
        this.vy = 0; // Velocidade vertical (Ímã)
        this.friction = 0.95; 
    }

    update(deltaTime, playerShip, backgroundSpeedY = 0) {
        if (!this.isAlive) return;
        
        const deltaSeconds = deltaTime / 1000;
        
        // 1. Movimento Base e Scroll
        this.y += this.speed * deltaSeconds; 
        this.y += backgroundSpeedY * 0.2; 
        
        // 2. Lógica de Ímã (Magnetismo)
        if (playerShip && magnetActive) { 
            const playerCenterX = playerShip.x + playerShip.width / 2;
            const playerCenterY = playerShip.y + playerShip.height / 2;
            const pickupCenterX = this.x + this.width / 2;
            const pickupCenterY = this.y + this.height / 2;

            const dx = playerCenterX - pickupCenterX;
            const dy = playerCenterY - pickupCenterY;
            const dist = Math.sqrt(dx * dx + dy * dy);

            // 🧲 Magnetismo 3x mais forte para estrelas decorativas da Missão 0
            const isDecorative = this.effect.type === 'decorative_star';
            const effectiveRadius = isDecorative ? magnetRadius * 1.5 : magnetRadius;
            
            if (dist < effectiveRadius && dist > 1) { 
                const attractionFactor = magnetStrength * (1 - dist / effectiveRadius) * (isDecorative ? 600 : 200); 
                const ux = dx / dist;
                const uy = dy / dist;
                
                this.vx += ux * attractionFactor * deltaSeconds;
                this.vy += uy * attractionFactor * deltaSeconds;
            }
        }
        
        // 3. Aplicação física do movimento
        this.x += this.vx * deltaSeconds;
        this.y += this.vy * deltaSeconds;
        this.vx *= this.friction;
        this.vy *= this.friction;

        // 4. Rotação Visual
        this.rotation += this.rotationSpeed * deltaSeconds;
        if (this.rotation > 2 * Math.PI) this.rotation -= 2 * Math.PI;

        // Limite da tela
        if (this.y > CANVAS_HEIGHT + this.height) { 
            this.isAlive = false;
        }
    }

    draw(ctx) {
        if (!this.isAlive) return;
        ctx.save(); 
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        ctx.translate(centerX, centerY);

        // ✨ Efeito de Brilho Neon para Estrelas
        if (this.effect.type === 'star' || this.effect.type === 'decorative_star') {
            ctx.shadowBlur = 15;
            ctx.shadowColor = "#ffd700";
        }

        ctx.rotate(this.rotation); 
        ctx.drawImage(this.image, -this.width / 2, -this.height / 2, this.width, this.height);
        ctx.restore(); 
    }
    
    applyEffect(player) {
        switch (this.effect.type) {
            case 'health':
                player.health = Math.min(player.maxHealth, player.health + this.effect.value);
                console.log(`Vida: +${this.effect.value}`);
                break;

            case 'star':
                // 🚀 USA A FUNÇÃO DO GLOBALS PARA SOMAR AS ESTRELAS
                updatePlayerStars(this.effect.value);
                break;
            
            case 'decorative_star':
                // Apenas barulho e visual, não altera o banco de dados
                break;
                
            case 'upgradePoints':
                // Se futuramente usar pontos de upgrade separados
                break;

            default:
                console.warn("Efeito desconhecido:", this.effect.type);
        }
        this.isAlive = false;
    }
}