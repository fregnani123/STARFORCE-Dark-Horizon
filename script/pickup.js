// ----------------------------------------------------
// ✨ NOVA CLASSE: PICKUP (Item de Vida)
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
    
    // ⚙️ AJUSTE 1: Velocidade de descida mais lenta (ex: 80 em vez de 150)
    this.speed = 80; 
    
    this.isAlive = true;
    
    // ⚙️ NOVO: Propriedades de Rotação
    this.rotation = 0; // Ângulo inicial em radianos
    this.rotationSpeed = 3; // Velocidade em radianos por segundo (ajuste este valor para mudar a velocidade do giro)
}
   // Dentro de class Pickup { ...
update(deltaTime) {
    if (!this.isAlive) return;
    
    const deltaSeconds = deltaTime / 1000;
    
    // Move para baixo (Mais lento agora: 80)
    this.y += this.speed * deltaSeconds; 
    
    // ⚙️ AJUSTE 2: Atualiza o ângulo de rotação
    this.rotation += this.rotationSpeed * deltaSeconds;

    // Garante que o ângulo não fique muito grande (opcional)
    if (this.rotation > 2 * Math.PI) {
        this.rotation -= 2 * Math.PI;
    }
}
  // Dentro de class Pickup { ...
draw(ctx) {
    if (!this.isAlive) return;

    // 1. Salva o estado atual do contexto (para não afetar outros desenhos)
    ctx.save(); 

    // 2. Move o ponto de origem para o centro da imagem do pickup
    const centerX = this.x + this.width / 2;
    const centerY = this.y + this.height / 2;
    ctx.translate(centerX, centerY);

    // 3. Rotaciona o Canvas pelo ângulo acumulado
    ctx.rotate(this.rotation); 

    // 4. Desenha a imagem (agora desenhamos a partir do centro rotacionado, então as coordenadas são negativas)
    ctx.drawImage(
        this.image, 
        -this.width / 2, // - metade da largura
        -this.height / 2, // - metade da altura
        this.width, 
        this.height
    );

    // 5. Restaura o contexto para as configurações salvas (limpa a rotação e translação)
    ctx.restore(); 
}
    
    // Método para aplicar o efeito ao jogador (assumindo que player tem maxHealth)
    applyEffect(player) {
        if (this.effect.type === 'health') {
             // Garante que a vida não exceda o máximo
            player.health = Math.min(player.maxHealth, player.health + this.effect.value); 
        }
        this.isAlive = false; // Item é consumido após o uso
        console.log(`Vida recuperada: ${this.effect.value}. Vida atual: ${player.health}`);
    }
}
// ----------------------------------------------------