// Arquivo: script/GameObject.js
class GameObject {
    constructor(x, y, width, height, imagePath) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.isAlive = true; 

        this.img = new Image();
        this.img.src = imagePath;
        this.isReady = false; 
        
        this.img.onload = () => {
            this.isReady = true;
        };
    }

 draw(ctx) {
    if (!this.isReady) return;

    // Se o objeto tiver rotação → desenha com rotação
    if (this.rotation !== undefined) {

        ctx.save();

        // mover pivô para o centro
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);

        // aplicar a rotação
        ctx.rotate(this.rotation * Math.PI / 180);

        // desenhar centralizado
        ctx.drawImage(
            this.img,
            -this.width / 2,
            -this.height / 2,
            this.width,
            this.height
        );

        ctx.restore();
        return;
    }

    // Caso NÃO tenha rotação → desenho normal
    ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
}

    update(deltaTime) {} 
}