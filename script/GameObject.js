export class GameObject {
    constructor(x, y, width, height, imagePath) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.isAlive = true; 
        
        // Inicialização da Rotação
        this.rotation = 0; 

        // 🚨 CORREÇÃO CRÍTICA: Impedir o carregamento de imagem se imagePath for null (como em Particle)
        if (imagePath) {
            this.img = new Image();
            this.img.src = imagePath;
            this.isReady = false; 
            
            this.img.onload = () => {
                this.isReady = true;
            };
            this.img.onerror = () => {
                console.error(`Falha ao carregar imagem: ${imagePath}`);
                // Em caso de falha, definimos como pronto e removemos a imagem para evitar erros no draw
                this.isReady = true; 
                this.img = null;
            };
        } else {
            // Se não houver imagePath (ex: Partículas), definimos a imagem como nula
            // e o objeto como 'pronto' para ser desenhado por seus métodos específicos (como Particle.draw)
            this.img = null;
            this.isReady = true; 
        }
    }

    // 🚨 Método de Colisão (Bounding Box)
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

   // MODIFICAÇÃO EM ../script/GameObject.js:draw(ctx)

// Em ../script/GameObject.js

// ... (métodos checkCollision e construtor)

draw(ctx) {
    // Se a imagem não estiver pronta, mostra o fallback (corrigido para o seu código)
    if (!this.isReady || !this.img || !this.isAlive) {
        if (this.isAlive) { // Desenha o fallback apenas se o objeto estiver vivo
            ctx.fillStyle = 'red';
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
        return; 
    }

    // --- Lógica de desenho padrão (Imagem Carregada) ---

    // Se houver rotação, usamos ctx.save/restore
    if (this.rotation !== 0) { 
        ctx.save();
        
        // 1. Calcula o centro de rotação (pivô)
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        
        // 2. Move a origem do canvas para o centro do objeto
        ctx.translate(centerX, centerY);
        
        // 3. ROTACIONA (CRÍTICO: Converte de graus para radianos)
        const rotationInRadians = this.rotation * (Math.PI / 180);
        ctx.rotate(rotationInRadians); 
        
        // 4. Desenha a imagem centralizada na nova origem (0, 0)
        ctx.drawImage(
            this.img, 
            -this.width / 2, // Deslocamento para X: metade da largura para a esquerda
            -this.height / 2, // Deslocamento para Y: metade da altura para cima
            this.width, 
            this.height
        );
        
        // 5. Restaura o canvas ao estado original (sem rotação/translação)
        ctx.restore();

    } else {
        // Caso a rotação seja 0 (desenho normal)
        ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
    }
}

    // O método update é mantido vazio para ser sobrescrito pelas classes filhas
    update(deltaTime) {} 
}