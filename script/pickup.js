// ======================================================
// IMPORTS OBRIGATÓRIOS
// ======================================================
import { 
    CANVAS_HEIGHT,
    magnetActive,
    magnetRadius,
    magnetStrength,
    // VARIÁVEIS DE ESTADO QUE SERÃO MANIPULADAS:
    score, // Para score (embora não esteja no switch, é comum em pickups)
    // Se 'playerStars' for uma variável global no globals.js, importe-a aqui:
    // export let playerStars = 0; // Exemplo em globals.js
    // Se for um objeto da janela, mantenha o acesso a window (embora seja melhor modularizar).
} from './globals.js'; 


// ----------------------------------------------------
// ✨ NOVA CLASSE: PICKUP (Item de Vida/Estrela) — FINAL COM MAGNETISMO
// ----------------------------------------------------
export class Pickup {
    // A classe Pickup não precisa estender GameObject, pois não usa o construtor GameObject complexo
    // e o método draw é totalmente customizado. Está OK como classe independente.
    constructor(x, y, width, height, imagePath, effect) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.image = new Image();
        this.image.src = imagePath;
        this.effect = effect;
        
        this.speed = 80; 
        this.isAlive = true;
        
        this.rotation = 0; 
        this.rotationSpeed = 3; // Velocidade de rotação em radianos/segundo
        
        this.vx = 0; // Velocidade horizontal (Imã)
        this.vy = 0; // Velocidade vertical (Imã)
        this.friction = 0.95; // Fricção aplicada às velocidades vx/vy
    }

    update(deltaTime, playerShip, backgroundSpeedY = 0) {
        if (!this.isAlive) return;
        
        const deltaSeconds = deltaTime / 1000;
        
        // -------------------------------------------------
        // 1. MOVIMENTO GRAVITACIONAL E ROLAGEM
        // -------------------------------------------------

        // Move para baixo (Velocidade base)
        this.y += this.speed * deltaSeconds; 

        // Adiciona compensação do background
        this.y += backgroundSpeedY * 0.2; 
        
        // -------------------------------------------------
        // 2. LÓGICA DE ÍMÃ (MAGNETISMO) - USANDO VARIÁVEIS IMPORTADAS
        // -------------------------------------------------
        // NOTA: O typeof magnetActive !== 'undefined' não é mais necessário, 
        // pois a variável foi importada diretamente de globals.js.
        
        if (playerShip && magnetActive) { 
            
            const playerCenterX = playerShip.x + playerShip.width / 2;
            const playerCenterY = playerShip.y + playerShip.height / 2;
            const pickupCenterX = this.x + this.width / 2;
            const pickupCenterY = this.y + this.height / 2;

            const dx = playerCenterX - pickupCenterX;
            const dy = playerCenterY - pickupCenterY;
            const dist = Math.sqrt(dx * dx + dy * dy);

            // Usa magnetRadius importado
            if (dist < magnetRadius && dist > 1) { 
                
                // Força de atração, inversamente proporcional à distância
                // Usa magnetStrength importado
                const attractionFactor = magnetStrength * (1 - dist / magnetRadius) * 200; 
                
                // Normaliza o vetor de direção
                const ux = dx / dist;
                const uy = dy / dist;
                
                // Aplica a força como aceleração à velocidade (vx, vy)
                this.vx += ux * attractionFactor * deltaSeconds;
                this.vy += uy * attractionFactor * deltaSeconds;
            }
        }
        
        // 3. APLICAÇÃO E FRICÇÃO DO MOVIMENTO DO ÍMÃ
        
        this.x += this.vx * deltaSeconds;
        this.y += this.vy * deltaSeconds;

        this.vx *= this.friction;
        this.vy *= this.friction;

        // -------------------------------------------------
        // 4. EFEITOS VISUAIS
        // -------------------------------------------------
        
        this.rotation += this.rotationSpeed * deltaSeconds;

        if (this.rotation > 2 * Math.PI) {
            this.rotation -= 2 * Math.PI;
        }

        // Morte por sair da tela (Usando CANVAS_HEIGHT importado)
        if (this.y > CANVAS_HEIGHT + this.height) { 
            this.isAlive = false;
        }
    }

    draw(ctx) {
        if (!this.isAlive) return;

        ctx.save(); 

        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        ctx.translate(centerX, centerY);

        ctx.rotate(this.rotation); 

        ctx.drawImage(
            this.image, 
            -this.width / 2, 
            -this.height / 2, 
            this.width, 
            this.height
        );

        ctx.restore(); 
    }
    
    // Método para aplicar o efeito ao jogador
    applyEffect(player) {

        switch (this.effect.type) {

            case 'health':
                // player.health é propriedade do objeto Player. OK.
                player.health = Math.min(player.maxHealth, player.health + this.effect.value);
                console.log(`Vida recuperada: +${this.effect.value} → ${player.health}`);
                break;

            case 'star':
                // Se 'playerStars' for uma variável LET exportada de globals.js:
                // if (typeof playerStars !== "undefined") playerStars += this.effect.value;
                
                // Se você realmente deseja usar window.playerStars (variável global externa ao módulo):
                if (typeof window.playerStars === "undefined") window.playerStars = 0;
                window.playerStars += this.effect.value;

                console.log(`⭐ Estrela coletada: +${this.effect.value} → Total: ${window.playerStars}`);
                break;
                
            case 'upgradePoints':
                // Se 'upgradePoints' for uma variável LET exportada de globals.js:
                // upgradePoints += this.effect.value;
                // console.log(`Pontos de Upgrade: +${this.effect.value}`);
                // Break;

            default:
                console.warn("Pickup efeito desconhecido:", this.effect.type);
                break;
        }

        this.isAlive = false;
    }

}