// Arquivo: script/Background.js (FINAL COM ESCALA DE VISUALIZAÇÃO)
class Background {
    constructor(imagePath, speed, canvasWidth, canvasHeight) {
        this.img = new Image();
        this.img.src = imagePath;
        this.speed = speed;
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        
        // NOVO: Fator de escala para visualização. 
        // Use 1.0 para tamanho real, 0.5 para 50% do tamanho.
        // Vou usar 0.8 como exemplo, mas você pode ajustar!
        this.visualScale = 0.8; 
        
        this.y1 = 0; 
        this.isReady = false;
        this.isScrolling = true; 

        this.img.onload = () => {
            this.isReady = true;
            
            // Altura real da imagem, escalonada
            this.scaledHeight = this.img.height * this.visualScale;
            
            // Altura real da imagem (largura do canvas / largura original) * altura original)
            // Calculamos o fator de escala que faremos.
            const ratio = this.canvasWidth / this.img.width;
            this.scaledHeight = this.img.height * ratio * this.visualScale;
            
            // Move o topo da imagem para que o rodapé (scaledHeight) comece no topo do canvas.
            // Para rolar todo o conteúdo da imagem escalonada.
            this.y1 = this.canvasHeight - this.scaledHeight;
        };
    }

    update(deltaTime) {
        if (!this.isReady || !this.isScrolling) return;

        const movement = this.speed * deltaTime / 5000; // controla a velocidade do mapa da rolagem do cenário
        
        this.y1 += movement;
        
        // Condição de Parada (Stopping Condition): 
        // Para quando o topo da imagem escalonada (y1) atinge o topo do canvas (0).
        if (this.y1 >= 0) {
            this.y1 = 0; // Fixa a imagem no lugar
            this.isScrolling = false; // Para o movimento
        }
    }

    draw(ctx) {
        if (this.isReady) {
            // Desenha a imagem forçando a largura do canvas, mas usando a altura ESCALONADA.
            ctx.drawImage(this.img, 
                0, 
                this.y1, 
                this.canvasWidth,       // Força a largura de 400px para preencher o canvas
                this.scaledHeight       // Usa a altura calculada e escalonada
            );
        }
    }
}