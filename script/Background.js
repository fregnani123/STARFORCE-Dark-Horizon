// ======================================================
// IMPORTS OBRIGATÓRIOS
// ======================================================
// Importa as dimensões fixas do canvas de globals.js
import { CANVAS_WIDTH, CANVAS_HEIGHT } from './globals.js'; 


export class Background {
    // Agora o construtor só recebe dados dinâmicos (caminho e velocidade)
    constructor(imagePath, speed) {
        this.img = new Image();
        this.img.src = imagePath;
        this.speed = speed;
        
        // Usa as constantes importadas DIRETAMENTE
        this.canvasWidth = CANVAS_WIDTH;
        this.canvasHeight = CANVAS_HEIGHT;

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
        
        this.img.onerror = () => {
            console.error(`Falha ao carregar imagem de fundo: ${imagePath}`);
            this.isReady = false;
        };
    }

    update(deltaTime) {
        if (!this.isReady || !this.isScrolling) return;

        // O fator de 5000 no denominador foi mantido, mas o deltaTime está correto.
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