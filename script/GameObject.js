// Arquivo: script/GameObject.js
class GameObject {
    constructor(x, y, width, height, imagePath) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.isAlive = true; 
        
        // 🚨 MELHORIA 1: Inicialização da Rotação
        // Inicializa a rotação para evitar 'undefined' no método draw,
        // garantindo que ela seja tratada como zero por padrão.
        this.rotation = 0; 
        // Nota: Se você não quiser que a rotação seja um recurso padrão,
        // remova esta linha e use 'if (this.rotation !== undefined)' no draw
        // (mas inicializar com 0 é geralmente mais seguro).

        this.img = new Image();
        this.img.src = imagePath;
        this.isReady = false; 
        
        this.img.onload = () => {
            this.isReady = true;
        };
    }

    // 🚨 MELHORIA 2: Método de Colisão (Bounding Box)
    // Verifica se este objeto colidiu com outro objeto (objB)
    checkCollision(objB) {
        // Colisão AABB (Axis-Aligned Bounding Box)
        return (
            this.x < objB.x + objB.width &&
            this.x + this.width > objB.x &&
            this.y < objB.y + objB.height &&
            this.y + this.height > objB.y
        );
    }

    draw(ctx) {
        if (!this.isReady) return;

        // Se a rotação for diferente de 0, desenha com rotação
        if (this.rotation !== 0) { 
            ctx.save();

            // mover pivô para o centro
            const cx = this.x + this.width / 2;
            const cy = this.y + this.height / 2;
            ctx.translate(cx, cy);

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

        // Caso a rotação seja 0 (ou seja, o padrão) → desenho normal
        ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
    }

    // O método update é mantido vazio para ser sobrescrito pelas classes filhas
    update(deltaTime) {} 
}