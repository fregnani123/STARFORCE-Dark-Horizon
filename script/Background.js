import { CANVAS_WIDTH, CANVAS_HEIGHT } from './globals.js'; 

export class Background {
    constructor(imagePaths, baseSpeed) {
        this.canvasWidth = CANVAS_WIDTH;
        this.canvasHeight = CANVAS_HEIGHT;
        this.baseSpeed = baseSpeed;
        
        this.layers = imagePaths.map((path, index) => {
            const img = new Image();
            img.src = path;

            // 🚀 AJUSTE DE VELOCIDADE:
            let factor = 1.0; 
            if (index === 0) factor = 0.02; // Fundo Profundo (mais lento)
            else if (index === 1) factor = 0.05; // Camada 2 (Estrelas) - Mais rápida que a anterior, mas ainda suave
            else factor = 0.15; // Restante (Cenário principal)

            return {
                img: img,
                y: 0,
                isReady: false,
                scaledHeight: 0,
                speedFactor: factor 
            };
        });

        this.initLayers();
    }

    initLayers() {
        this.layers.forEach(layer => {
            layer.img.onload = () => {
                layer.isReady = true;
                const ratio = this.canvasWidth / layer.img.width;
                layer.scaledHeight = layer.img.height * ratio;
                layer.y = this.canvasHeight - layer.scaledHeight;
            };
        });
    }

    update(deltaTime) {
        const deltaFraction = deltaTime / 1000;
        this.layers.forEach(layer => {
            if (!layer.isReady) return;
            layer.y += (this.baseSpeed * layer.speedFactor) * deltaFraction;
            if (layer.y >= layer.scaledHeight) {
                layer.y -= layer.scaledHeight;
            }
        });
    }

    draw(ctx) {
        this.layers.forEach((layer, index) => {
            if (!layer.isReady) return;

            ctx.save();
            
            // 🚀 REMOVIDO TRANSPARÊNCIA E BLUR DA CAMADA 2
            // Mantemos opacidade total e sem filtros para as camadas 0 e 1
            if (index <= 1) {
                ctx.globalAlpha = 1.0;
                ctx.filter = "none";
            } else {
                ctx.globalAlpha = 1.0;
                ctx.filter = "none";
            }

            // Desenho das duas cópias para o loop infinito
            ctx.drawImage(layer.img, 0, layer.y, this.canvasWidth, layer.scaledHeight);
            ctx.drawImage(layer.img, 0, layer.y - layer.scaledHeight, this.canvasWidth, layer.scaledHeight);

            ctx.restore();
        });
    }
}