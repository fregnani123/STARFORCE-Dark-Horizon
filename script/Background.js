import { CANVAS_WIDTH, CANVAS_HEIGHT } from './globals.js'; 

export class Background {
    constructor(layersConfig, baseSpeed) {
        this.canvasWidth = CANVAS_WIDTH;
        this.canvasHeight = CANVAS_HEIGHT;
        this.baseSpeed = baseSpeed;
        
        // layersConfig agora recebe o array de objetos da missão [{path, factor, oneShot?, startY?, scale?, x?}, ...]
        this.layers = layersConfig.map((config) => {
            const img = new Image();

            return {
                img: img,
                path: config.path,
                y: 0,
                isReady: false,
                scaledHeight: 0,
                speedFactor: config.factor || 0.1,
                oneShot: config.oneShot === true,
                startYFraction: config.startY !== undefined ? config.startY : null,
                // scale: fração do tamanho original (1.0 = ocupa toda a largura, 0.3 = 30%)
                scale: config.scale !== undefined ? config.scale : 1.0,
                // x: posição horizontal em fração da largura (0 = esquerda, 0.5 = centro, 1 = direita)
                xFraction: config.x !== undefined ? config.x : 0,
                done: false
            };
        });

        this.initLayers();
    }

    initLayers() {
        this.layers.forEach(layer => {
            if (!layer.path || layer.path.endsWith('/') || String(layer.path).includes('undefined')) return;

            const finalizeLayer = () => {
                layer.isReady = true;
                const ratio = this.canvasWidth / layer.img.width;
                // scaledHeight considera o scale da camada
                layer.scaledHeight = layer.img.height * ratio * layer.scale;
                layer.scaledWidth  = this.canvasWidth * layer.scale;

                if (layer.oneShot) {
                    if (layer.startYFraction !== null) {
                        // startY explícito (lua, nave-mãe etc.)
                        layer.y = layer.startYFraction * this.canvasHeight;
                    } else {
                        // Sem startY: começa na mesma posição de uma layer normal (fundo da tela)
                        layer.y = this.canvasHeight - layer.scaledHeight;
                    }
                } else {
                    layer.y = this.canvasHeight - layer.scaledHeight;
                }
            };

            layer.img.onload = () => {
                finalizeLayer();
            };

            layer.img.src = layer.path;

            // Em alguns cenários de cache o onload pode não disparar; finaliza manualmente.
            if (layer.img.complete && layer.img.naturalWidth > 0) {
                finalizeLayer();
            }
        });
    }

    update(deltaTime) {
        const deltaFraction = deltaTime / 1000;
        this.layers.forEach(layer => {
            if (!layer.isReady || layer.done) return;

            layer.y += (this.baseSpeed * layer.speedFactor) * deltaFraction;

            if (layer.oneShot) {
                // Para de desenhar quando a imagem saiu completamente pela parte de baixo
                if (layer.y > this.canvasHeight) {
                    layer.done = true;
                }
            } else {
                // Loop infinito normal
                if (layer.y >= layer.scaledHeight) {
                    layer.y -= layer.scaledHeight;
                }
            }
        });
    }

    draw(ctx) {
        this.layers.forEach((layer, index) => {
            if (!layer.isReady || layer.done) return;

            ctx.save();

            if (layer.oneShot) {
                // Sem tiling — tamanho e posição X controlados por scale/xFraction
                const w = layer.scaledWidth  || this.canvasWidth;
                const h = layer.scaledHeight || this.canvasWidth; // fallback
                const x = layer.xFraction * (this.canvasWidth - w);
                ctx.drawImage(layer.img, x, layer.y, w, h);
            } else {
                // Camada 1 (loop) mantém brilho sutil
                if (index === 1) {
                    ctx.shadowBlur = 15;
                    ctx.shadowColor = "rgba(255, 255, 200, 0.4)";
                }
                // Tiling infinito: tile atual + cópia acima
                ctx.drawImage(layer.img, 0, layer.y, this.canvasWidth, layer.scaledHeight);
                ctx.drawImage(layer.img, 0, layer.y - layer.scaledHeight, this.canvasWidth, layer.scaledHeight);
            }

            ctx.restore();
        });
    }
}