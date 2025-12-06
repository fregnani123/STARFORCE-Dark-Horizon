class GameObject {
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

    draw(ctx) {
        // Se isReady for false (imagem carregando) OU se não houver imagem E o objeto for desenhado por aqui
        if (!this.isReady) return;

        // Se this.img for nulo (como é para Partículas),
        // o draw padrão não fará nada, confiando que a classe filha (Particle, etc.)
        // implementará seu próprio desenho.
        if (!this.img) return; 

        // Se a rotação for diferente de 0, desenha com rotação
        if (this.rotation !== 0) { 
            ctx.save();

            // mover pivô para o centro
            const cx = this.x + this.width / 2;
            const cy = this.y + this.height / 2;
            ctx.translate(cx, cy);

            // aplicar a rotação (conversão de graus para radianos)
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