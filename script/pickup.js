// ----------------------------------------------------
// ✨ NOVA CLASSE: PICKUP (Item de Vida/Estrela) — FINAL COM MAGNETISMO
// ----------------------------------------------------
class Pickup {
    constructor(x, y, width, height, imagePath, effect) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.image = new Image();
        this.image.src = imagePath;
        this.effect = effect;
        
        // ⚙️ Velocidade de descida
        this.speed = 80; 
        
        this.isAlive = true;
        
        // ⚙️ Propriedades de Rotação
        this.rotation = 0; 
        this.rotationSpeed = 3; 
        
        // 🛑 NOVAS PROPRIEDADES DE MOVIMENTO (Para o ímã)
        this.vx = 0; // Velocidade horizontal (Imã)
        this.vy = 0; // Velocidade vertical (Imã)

        // 🛑 Propriedade de Desaceleração para o Imã
        this.friction = 0.95; // Fricção aplicada às velocidades vx/vy (quanto menor, mais rápido para)
    }

    // Dentro de class Pickup { ...
    update(deltaTime, playerShip, backgroundSpeedY = 0) { // Agora aceita playerShip e backgroundSpeedY
        if (!this.isAlive) return;
        
        const deltaSeconds = deltaTime / 1000;
        
        // -------------------------------------------------
        // 1. MOVIMENTO GRAVITACIONAL E ROLAGEM
        // -------------------------------------------------

        // Move para baixo (Velocidade base)
        this.y += this.speed * deltaSeconds; 

        // Adiciona compensação do background (ajuste o 0.2 se necessário)
        this.y += backgroundSpeedY * 0.2; 
        
        // -------------------------------------------------
        // 2. LÓGICA DE ÍMÃ (MAGNETISMO) 🛑 ADICIONADO AQUI!
        // -------------------------------------------------
        if (playerShip && typeof magnetActive !== 'undefined' && magnetActive) {
            
            const playerCenterX = playerShip.x + playerShip.width / 2;
            const playerCenterY = playerShip.y + playerShip.height / 2;
            const pickupCenterX = this.x + this.width / 2;
            const pickupCenterY = this.y + this.height / 2;

            const dx = playerCenterX - pickupCenterX;
            const dy = playerCenterY - pickupCenterY;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < magnetRadius && dist > 1) {
                
                // Força de atração, inversamente proporcional à distância
                const attractionFactor = magnetStrength * (1 - dist / magnetRadius) * 200; // Multiplicado por 200 para dar sensibilidade
                
                // Normaliza o vetor de direção
                const ux = dx / dist;
                const uy = dy / dist;
                
                // Aplica a força como aceleração à velocidade (vx, vy)
                this.vx += ux * attractionFactor * deltaSeconds;
                this.vy += uy * attractionFactor * deltaSeconds;
            }
        }
        
        // 3. APLICAÇÃO E FRICÇÃO DO MOVIMENTO DO ÍMÃ
        
        // Aplica o movimento lateral e vertical do Imã
        this.x += this.vx * deltaSeconds;
        this.y += this.vy * deltaSeconds;

        // Aplica fricção para desacelerar o movimento do Imã quando a força não é aplicada
        this.vx *= this.friction;
        this.vy *= this.friction;

        // -------------------------------------------------
        // 4. EFEITOS VISUAIS
        // -------------------------------------------------
        
        // Atualiza o ângulo de rotação
        this.rotation += this.rotationSpeed * deltaSeconds;

        if (this.rotation > 2 * Math.PI) {
            this.rotation -= 2 * Math.PI;
        }

        // Morte por sair da tela
        if (this.y > CANVAS_HEIGHT + this.height) {
            this.isAlive = false;
        }
    }

    // Dentro de class Pickup { ...
    draw(ctx) {
        if (!this.isAlive) return;

        // 1. Salva o estado atual do contexto
        ctx.save(); 

        // 2. Move o ponto de origem para o centro da imagem do pickup
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        ctx.translate(centerX, centerY);

        // 3. Rotaciona o Canvas
        ctx.rotate(this.rotation); 

        // 4. Desenha a imagem (a partir do centro rotacionado)
        ctx.drawImage(
            this.image, 
            -this.width / 2, 
            -this.height / 2, 
            this.width, 
            this.height
        );

        // 5. Restaura o contexto
        ctx.restore(); 
    }
    
    // Método para aplicar o efeito ao jogador
    applyEffect(player) {

        switch (this.effect.type) {

            case 'health':
                player.health = Math.min(player.maxHealth, player.health + this.effect.value);
                console.log(`Vida recuperada: +${this.effect.value} → ${player.health}`);
                break;

            case 'star':
                if (typeof window.playerStars === "undefined") window.playerStars = 0;

                window.playerStars += this.effect.value;

                console.log(`⭐ Estrela coletada: +${this.effect.value} → Total: ${window.playerStars}`);
                break;

            default:
                console.warn("Pickup efeito desconhecido:", this.effect.type);
                break;
        }

        this.isAlive = false;
    }

}