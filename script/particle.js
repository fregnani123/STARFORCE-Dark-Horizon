// ======================================================
// IMPORTS OBRIGATÓRIOS
// ======================================================
import { GameObject } from './GameObject.js'; 
// Não precisa de globals.js, pois usa a herança e o 'ctx' é passado no draw.


export class Particle extends GameObject {
    constructor(x, y, size, color, velocityX, velocityY, friction, gravity, maxLife) {
        // Partículas não têm imagem (imagePath = null), mas usam o 'size' para width/height.
        super(x, y, size, size, null); 

        this.color = color;
        this.velocityX = velocityX;
        this.velocityY = velocityY;
        
        // Parâmetros de física
        this.friction = friction; 
        this.gravity = gravity; 

        // Gerenciamento de Vida
        this.maxLife = maxLife; 
        this.life = maxLife; 
        this.isAlive = true;
    }

    // Nota: O método update aqui não utiliza 'deltaTime'. 
    // Em jogos modernos, seria ideal passá-lo para garantir que a física seja 
    // independente da taxa de quadros (framerate). 
    // Por enquanto, mantenho como está para evitar quebras em seu código.
    update() {
        if (!this.isAlive) return;

        // 1. Aplica a física (baseada em frames)
        this.velocityX *= this.friction;
        this.velocityY *= this.friction;
        this.velocityY += this.gravity;

        // 2. Atualiza a posição
        this.x += this.velocityX;
        this.y += this.velocityY;

        // 3. Reduz a vida (baseada em frames)
        this.life--;
        if (this.life <= 0) {
            this.isAlive = false;
        }
    }

    draw(ctx) {
        if (!this.isAlive) return;

        // Calcula a opacidade baseada na vida restante (fade-out)
        const opacity = this.life / this.maxLife;
        
        ctx.save();
        
        // Aplica a opacidade
        ctx.globalAlpha = opacity;
        
        // Define a cor
        ctx.fillStyle = this.color;

        ctx.beginPath();
        // Desenha a partícula como um círculo
        // Usa this.width/2 para o raio (já que width = size)
        ctx.arc(this.x + this.width / 2, this.y + this.height / 2, this.width / 2, 0, Math.PI * 2); 
        ctx.fill();
        
        ctx.restore();
    }
}