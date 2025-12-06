class Particle extends GameObject {
    constructor(x, y, size, color, velocityX, velocityY, friction, gravity, maxLife) {
        // Partículas não têm imagem, mas precisam de width/height para o desenho e colisão (se necessário)
        super(x, y, size, size, null); 

        this.color = color;
        this.velocityX = velocityX;
        this.velocityY = velocityY;
        
        // Parâmetros de física (essenciais para detritos realistas)
        this.friction = friction; // Fator de desaceleração (perto de 1.0 para pouco atrito)
        this.gravity = gravity;   // Força vertical (para simular queda ou flutuação)

        // Gerenciamento de Vida
        this.maxLife = maxLife; // Tempo máximo de vida em frames
        this.life = maxLife;    // Vida atual
        this.isAlive = true;
    }

    update() {
        if (!this.isAlive) return;

        // 1. Aplica a física
        
        // Aplica atrito (fricção): Reduz a velocidade horizontal e vertical a cada frame
        this.velocityX *= this.friction;
        this.velocityY *= this.friction;

        // Aplica a gravidade: Aumenta a velocidade vertical
        this.velocityY += this.gravity;

        // 2. Atualiza a posição
        this.x += this.velocityX;
        this.y += this.velocityY;

        // 3. Reduz a vida e verifica se deve morrer
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

        // Para partículas muito brilhantes (plasma), podemos usar 'lighter'
        // Mas para os detritos escuros, é melhor manter o padrão ou usar 'source-over'.
        // Como o 'drawExplosion' usa save/restore, o padrão deve ser suficiente.
        // ctx.globalCompositeOperation = "lighter"; // Descomentar só se quiser as partículas super brilhantes

        ctx.beginPath();
        // Desenha a partícula como um círculo
        ctx.arc(this.x + this.width / 2, this.y + this.height / 2, this.width / 2, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
}