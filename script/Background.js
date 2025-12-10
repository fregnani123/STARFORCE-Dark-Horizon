// Arquivo: script/Background.js (FINAL COM ATMOSPHERIC BLUR)
class Background {
    constructor(imagePath, speed, canvasWidth, canvasHeight) {
        this.img = new Image();
        this.img.src = imagePath;
        this.speed = speed;
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;

        this.visualScale = 0.8;

        this.y1 = 0;
        this.isReady = false;
        this.isScrolling = true;

        this.img.onload = () => {
            this.isReady = true;

            // fator para manter proporção
            const ratio = this.canvasWidth / this.img.width;

            // altura escalonada
            this.scaledHeight = this.img.height * ratio * this.visualScale;

            // iniciar de baixo para cima
            this.y1 = this.canvasHeight - this.scaledHeight;
        };
    }

    update(deltaTime) {
        if (!this.isReady || !this.isScrolling) return;

        const movement = this.speed * deltaTime / 5000;
        this.y1 += movement;

        if (this.y1 >= 0) {
            this.y1 = 0;
            this.isScrolling = false;
        }
    }

    draw(ctx) {
        if (!this.isReady) return;

        // 🌫️ ADICIONA DESFOQUE ATMOSFÉRICO
        ctx.filter = "blur(1.5px) brightness(0.95)";

        // desenha com blur
        ctx.drawImage(
            this.img,
            0,
            this.y1,
            this.canvasWidth,
            this.scaledHeight
        );

        // 🔄 RESETA FILTRO para não afetar sprites do jogo
        ctx.filter = "none";
    }
}
