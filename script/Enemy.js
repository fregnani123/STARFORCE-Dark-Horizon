// Arquivo: script/Enemy.js

class Enemy extends GameObject {
    constructor(x, y, width, height, imagePath, maxHealth, speed, fireRate = 1500, damage = 10, projectileSpeed = 200, projectileImg = "../assets/img/tiroInimigo.png") {
        super(x, y, width, height, imagePath);
        this.maxHealth = maxHealth;
        this.currentHealth = maxHealth;
        this.speed = speed;
        this.isAlive = true;
        
        // Propriedades de Tiro
        this.fireRate = fireRate;
        this.fireDamage = damage; 
        this.fireTimer = fireRate; 
        this.projectileSpeed = projectileSpeed; // Armazenado!
        this.projectileImg = projectileImg;     // Armazenado!
        
        // Movimento Senoidal
        this.amplitude = 50; 
        this.frequency = 0.005;
        this.initialX = x;
    }

    update(deltaTime) {
        const timeFactor = deltaTime / 1000;
        
        // Movimento e Atualização do Timer
        this.y += this.speed * timeFactor;
        const lateralMovement = Math.sin(this.y * this.frequency) * this.amplitude;
        this.x = this.initialX + lateralMovement;
        this.fireTimer += deltaTime;
    }

    takeDamage(damage) {
        this.currentHealth -= damage;
        if (this.currentHealth <= 0) {
            this.isAlive = false;
        }
    }
    
    fire(enemyProjectiles) {
        if (this.fireTimer >= this.fireRate) {
            // Usa as propriedades armazenadas do construtor
            const newProjectile = new Projectile(
                this.x + this.width / 2 - 2, 
                this.y + this.height, 
                30, 30, 
                this.projectileImg,     // Usa a imagem
                this.projectileSpeed,   // Usa a velocidade
                this.fireDamage,        // Usa o dano
                'enemy' 
            );
            enemyProjectiles.push(newProjectile);

            this.fireTimer = 0;
            return true;
        }
        return false;
    }

    draw(ctx) {
        super.draw(ctx); 
    }
}