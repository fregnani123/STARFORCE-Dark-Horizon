
class Projectile extends GameObject {
    constructor(x, y, width, height, imagePath, speed, damage, owner = 'player') {
        super(x, y, width, height, imagePath);
        this.speed = speed;
        this.damage = damage;
        this.isAlive = true;
        this.owner = owner; // 'player' ou 'enemy'
    }

    update(deltaTime) {
        // Direção: -1 (cima) para o jogador; 1 (baixo) para o inimigo.
        const direction = this.owner === 'player' ? -1 : 1;
        this.y += direction * this.speed * deltaTime / 1000;

        // Se sair da tela (em cima ou embaixo)
        if (this.y + this.height < 0 || this.y > 600) {
            this.isAlive = false;
        }
    }
}