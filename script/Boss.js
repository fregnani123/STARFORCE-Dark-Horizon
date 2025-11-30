// arquivo: script/Boss.js

class Boss extends GameObject {
    constructor(x, y, width, height, imagePath, maxHealth = 2000) {
        super(x, y, width, height, imagePath);

        this.maxHealth = maxHealth;
        this.currentHealth = maxHealth;
        this.isAlive = true;

        // Movimento
        this.speed = 80;
        this.phase = 1;          
        this.fireTimer = 0;

        // padrão do boss
        this.weaponCooldown = 900;

        // Controle de entrada
        this.introDone = false;
        this.targetY = 80;      

        // ⭐ ROTACIONAR
        this.rotation = 0;            // ângulo atual
        this.rotationSpeed = 0.3;     // velocidade inicial
    }

    update(deltaTime) {
        const t = deltaTime / 1000;

        // 🔥 MOVIMENTO DE ENTRADA
        if (!this.introDone) {
            this.y += this.speed * t;

            if (this.y >= this.targetY) {
                this.introDone = true;
            }
            return;
        }

        // 🔥 MOVIMENTO PRINCIPAL (zigzag lento)
        this.x += Math.sin(Date.now() * 0.001) * 1.8;

        // ⭐ ATUALIZA A ROTAÇÃO
        this.rotation += this.rotationSpeed * (deltaTime / 16.67);

        // Fases conforme vida
        const hpPercent = this.currentHealth / this.maxHealth;

        if (hpPercent < 0.70 && this.phase === 1) {
            this.phase = 2;
            this.weaponCooldown = 700;
        }
        if (hpPercent < 0.40 && this.phase === 2) {
            this.phase = 3;
            this.weaponCooldown = 500;
        }
        if (hpPercent < 0.15 && this.phase === 3) {
            this.phase = 4;
            this.weaponCooldown = 350;
        }

        this.fireTimer += deltaTime;
    }

    takeDamage(dmg) {
        this.currentHealth -= dmg;

        // Atualiza a barra
        const bar = document.getElementById("bossHealthBar");
        if (bar) {
            const pct = Math.max(0, this.currentHealth / this.maxHealth * 100);
            bar.style.width = pct + "%";
        }

        // ⭐ AJUSTAR VELOCIDADE DO GIRO CONFORME VIDA
        const hpPercent = this.currentHealth / this.maxHealth;

        if (hpPercent <= 0.15) {
            this.rotationSpeed = 6;   // muito rápido
        } else if (hpPercent <= 0.40) {
            this.rotationSpeed = 2.5; // médio
        } else if (hpPercent <= 0.70) {
            this.rotationSpeed = 1;   // um pouco mais rápido
        } else {
            this.rotationSpeed = 0.3; // padrão
        }

        // Morreu
   if (this.currentHealth <= 0) {
    this.isAlive = false;

    bossDefeated = true;  // <<< MARCA COMO DERROTADO

    const barContainer = document.getElementById("bossHealthBarContainer");
    if (barContainer) barContainer.style.display = "none";

    endGame();  // <<< CHAMA O FIM OU PRÓXIMA FASE
}

    }

    fire(projectiles) {
        if (this.fireTimer < this.weaponCooldown) return;
        this.fireTimer = 0;

        switch (this.phase) {
            case 1:
                this.shootSingle(projectiles);
                break;
            case 2:
                this.shootTriple(projectiles);
                break;
            case 3:
                this.shootSpray(projectiles);
                break;
            case 4:
                this.shoot360(projectiles);
                break;
        }
    }

    // TIROS DO BOSS

    shootSingle(arr) {
        arr.push(new Projectile(
            this.x + this.width / 2 - 15,
            this.y + this.height,
            35, 35,
            "../assets/img/tiro.png",
            350,
            25,
            "enemy",
            0
        ));
    }

    shootTriple(arr) {
        const cx = this.x + this.width / 2 - 15;
        const cy = this.y + this.height;

        arr.push(new Projectile(cx, cy, 35, 35, "../assets/img/tiro.png", 360, 25, "enemy", 0));
        arr.push(new Projectile(cx - 50, cy, 35, 35, "../assets/img/tiro.png", 360, 25, "enemy", -0.15));
        arr.push(new Projectile(cx + 50, cy, 35, 35, "../assets/img/tiro.png", 360, 25, "enemy", +0.15));
    }

    shootSpray(arr) {
        const cx = this.x + this.width / 2 - 15;
        const cy = this.y + this.height;

        for (let i = -3; i <= 3; i++) {
            arr.push(new Projectile(
                cx, cy, 28, 28,
                "../assets/img/tiro.png",
                400,
                20,
                "enemy",
                i * 0.10
            ));
        }
    }

    shoot360(arr) {
        const cx = this.x + this.width / 2 - 15;
        const cy = this.y + this.height / 2;

        const shots = 18;
        const step = (Math.PI * 2) / shots;

        for (let i = 0; i < shots; i++) {
            arr.push(new Projectile(
                cx, cy, 30, 30,
                "../assets/img/tiro.png",
                420,
                20,
                "enemy",
                step * i,
                true
            ));
        }
    }
 
}
