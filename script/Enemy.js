// Arquivo: script/Enemy.js

class Enemy extends GameObject {
    constructor(
        x, y, width, height, imagePath,
        maxHealth = 50, speed = 100,
        fireRate = 1500, damage = 10,
        projectileSpeed = 200,

        projectileImgs = [],    // até 3 imagens de tiro

        weaponLevel = 1,        // nível da arma do inimigo
        scoreValue = 10,        // pontuação ao morrer
        
        // NOVO: Flag para ativar ou desativar a rotação. Padrão é FALSE.
        isRotating = false 
    ) {
        super(x, y, width, height, imagePath);

        // Vida
        this.maxHealth = maxHealth;
        this.currentHealth = maxHealth;
        this.isAlive = true;

        // Movimento
        this.speed = speed;
        this.initialX = x;
        this.amplitude = 50;
        this.frequency = 0.005;

        // ** ROTAÇÃO ADICIONADA **
        this.isRotating = isRotating; // Flag que controla a rotação
        this.rotation = 0;            // Propriedade usada pelo GameObject.draw(ctx)
        this.rotationSpeed = 0.05;    // Velocidade em graus por milissegundo

        // Tiro
        this.fireRate = fireRate;
        this.fireDamage = damage;
        this.fireTimer = this.fireRate;
        this.projectileSpeed = projectileSpeed;

        this.projectileImgs = projectileImgs;
        this.weaponLevel = weaponLevel;

        this.scoreValue = scoreValue;
    }

    // Retorna imagem do tiro com fallback seguro
    getProjectileImg(index) {
        return this.projectileImgs[index]
            || this.projectileImgs[0]
            || "../assets/img/tiroInimigo.png";
    }

    update(deltaTime) {
        const t = deltaTime / 1000;

        // Move para baixo
        this.y += this.speed * t;

        // Movimento senoidal lateral
        this.x = this.initialX + Math.sin(this.y * this.frequency) * this.amplitude;

        // ** LÓGICA DE ROTAÇÃO CONDICIONAL **
        if (this.isRotating) {
            this.rotation += this.rotationSpeed * deltaTime;
            // Mantém o ângulo entre 0 e 360 graus
            if (this.rotation > 360) {
                this.rotation -= 360;
            }
        } else {
            // Garante que inimigos que não devem girar fiquem em 0
            this.rotation = 0;
        }

        this.fireTimer += deltaTime;
    }

    takeDamage(dmg) {
        this.currentHealth -= dmg;
        if (this.currentHealth <= 0) {
            this.isAlive = false;
        }
    }

    fire(enemyProjectiles) {
        if (this.fireTimer < this.fireRate) return false;
        this.fireTimer = 0;

        switch (this.weaponLevel) {
            case 2:
                this.fireDouble(enemyProjectiles);
                break;

            case 3:
                this.fireTriple(enemyProjectiles);
                break;

            case 4:
                this.fireExplosion360(enemyProjectiles);
                break;

            default:
                this.fireSingle(enemyProjectiles);
        }

        return true;
    }

    // -------------------------------------------------
    // TIROS
    // -------------------------------------------------

    // 1 – tiro único
    fireSingle(arr) {
        arr.push(new Projectile(
            this.x + this.width * 0.5 - 15,
            this.y + this.height,
            30, 30,
            this.getProjectileImg(0),
            this.projectileSpeed,
            this.fireDamage,
            "enemy",
            0
        ));
    }

    // 2 – Dois tiros separados
    fireDouble(arr) {
        const img = this.getProjectileImg(1);

        const leftX = this.x + this.width * 0.25 - 15;
        const rightX = this.x + this.width * 0.75 - 15;

        arr.push(new Projectile(
            leftX,
            this.y + this.height,
            25, 25,
            img,
            this.projectileSpeed * 1.2,
            this.fireDamage,
            "enemy",
            -0.12
        ));

        arr.push(new Projectile(
            rightX,
            this.y + this.height,
            25, 25,
            img,
            this.projectileSpeed * 1.2,
            this.fireDamage,
            "enemy",
            +0.12
        ));
    }

    // 3 – Três tiros espaçados
    fireTriple(arr) {
        const img = this.getProjectileImg(2);

        const centerX = this.x + this.width * 0.5 - 15;
        const leftX = this.x + this.width * 0.20 - 15;
        const rightX = this.x + this.width * 0.80 - 15;

        arr.push(new Projectile(
            centerX, this.y + this.height,
            30, 30,
            img,
            this.projectileSpeed * 0.9,
            this.fireDamage,
            "enemy",
            0
        ));

        arr.push(new Projectile(
            leftX, this.y + this.height,
            30, 30,
            img,
            this.projectileSpeed * 1.25,
            this.fireDamage,
            "enemy",
            -0.28
        ));

        arr.push(new Projectile(
            rightX, this.y + this.height,
            30, 30,
            img,
            this.projectileSpeed * 1.25,
            this.fireDamage,
            "enemy",
            +0.28
        ));
    }


    // 4 – explosão instantânea 360° com 12 tiros
    fireExplosion360(arr) {
        const img = this.getProjectileImg(2);

        const totalShots = 12;
        const angleStep = (Math.PI * 2) / totalShots;

        const cx = this.x + this.width * 0.5 - 15;
        const cy = this.y + this.height * 0.5;

        for (let i = 0; i < totalShots; i++) {
            const angle = angleStep * i;

            arr.push(new Projectile(
                cx, cy,
                30, 30,
                img,
                this.projectileSpeed * 1.4,
                this.fireDamage,
                "enemy",
                angle,
                true   // usa ângulo absoluto
            ));
        }
    }

    draw(ctx) {
        super.draw(ctx);
    }
}