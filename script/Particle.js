// Arquivo: script/Particle.js

class Particle {
    constructor(x, y, size, color, velocityX, velocityY, lifetime = 300) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.color = color;
        this.velocityX = velocityX;
        this.velocityY = velocityY;
        this.lifetime = lifetime; // Duração em milissegundos
        this.currentLife = 0;
        this.isAlive = true;
        this.gravity = 50; // Para fazer os pedaços caírem um pouco (opcional)
    }

    update(deltaTime) {
        if (!this.isAlive) return;
        
        const timeFactor = deltaTime / 1000;
        this.currentLife += deltaTime;

        if (this.currentLife >= this.lifetime) {
            this.isAlive = false;
            return;
        }

        // Movimento (velocidade e gravidade)
        this.x += this.velocityX * timeFactor;
        this.y += this.velocityY * timeFactor;
        this.velocityY += this.gravity * timeFactor; // Aplica gravidade

        // Desacelera a partícula (fricção)
        this.velocityX *= 0.98;
        this.velocityY *= 0.98;

        // Diminui o tamanho e a opacidade
        const lifeRatio = 1 - (this.currentLife / this.lifetime);
        this.size = Math.max(0, this.size * lifeRatio);
    }

    draw(ctx) {
        if (!this.isAlive || this.size <= 0) return;

        // Calcula a opacidade baseada no tempo de vida
        const opacity = 1 - (this.currentLife / this.lifetime);
        ctx.fillStyle = this.color;
        ctx.globalAlpha = opacity;
        
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); // Desenha um círculo
        ctx.fill();
        
        ctx.globalAlpha = 1; // Reseta a opacidade global
    }
}