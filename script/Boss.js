// ------------------ BOSS COMPLETO REFEITO ------------------
class Boss extends GameObject {
    constructor(x, y, width, height, imagePath, maxHealth = 2000) {

        const originalWidth = width;
        const originalHeight = height;

        super(x, -200, originalWidth, originalHeight, imagePath);

        this.originalWidth = originalWidth;
        this.originalHeight = originalHeight;

        // ---- NOVO SISTEMA DE MOVIMENTO ----
        this.baseX = x;
        this.targetX = x;
        this.moveTimer = 0;
        this.moveInterval = 2000 + Math.random() * 2500;

        this.startScale = 0.1;
        this.targetScale = 1.0;
        this.currentScale = this.startScale;

        this.maxHealth = maxHealth;
        this.currentHealth = maxHealth;
        this.isAlive = true;

        this.speed = 300;
        this.phase = 1;
        this.fireTimer = 0;
        this.weaponCooldown = 900;

        this.introDone = false;
        this.targetY = 80;
        this.startY = this.y;

        this.tiltAngle = 0;
        this.maxTilt = 8;
        this.floatSpeed = 0.003;
        this.floatAmplitude = 5;

        // >>> GIRO RESTAURADO <<<
        this.rotation = 0;
        this.rotationSpeed = 0;  // aumenta conforme HP baixa

        // >>> SISTEMA PARA SAIR DA TELA <<<
        this.exitMode = false;
        this.exitTimer = 0;
        this.exitCooldown = 0;
        this.exitInterval = 6000 + Math.random() * 5000;

        // AURA
        this.auraReady = true;
        this.auraRotation = 0;
        this.auraRotationSpeed = 2;
        this.auraScale = 1.25;
        this.auraOpacity = 0.6;
        this.auraPulseSpeed = 0.005;
        this.waveSpeed = 0.0005;

        this.auraColor = "rgba(0,0,0,0.9)";
    }

    // -------------------------------------------------------
    //                    UPDATE COMPLETO
    // -------------------------------------------------------
    update(deltaTime) {
        const t = deltaTime / 1000;
        const now = Date.now();

        // ------------------ INTRO ANIMAÇÃO ------------------
        if (!this.introDone) {
            this.y += this.speed * t;

            const progress = (this.y - this.startY) / (this.targetY - this.startY);
            this.currentScale = this.startScale + (this.targetScale - this.startScale) * Math.min(1.0, progress);

            this.width = this.originalWidth * this.currentScale;
            this.height = this.originalHeight * this.currentScale;

            if (this.y >= this.targetY) {
                this.y = this.targetY;
                this.introDone = true;
                this.currentScale = 1.0;
                this.width = this.originalWidth;
                this.height = this.originalHeight;
            }
            return;
        }

        const hpPercent = this.currentHealth / this.maxHealth;

        // -----------------------------------------------------
        //         >>> NOVO SISTEMA: BOSS SAI DA TELA <<<
        // -----------------------------------------------------
        this.exitCooldown += deltaTime;

        if (!this.exitMode && hpPercent < 0.70 && this.exitCooldown >= this.exitInterval) {

            this.exitMode = true;
            this.exitCooldown = 0;
            this.exitInterval = 6000 + Math.random() * 7000;

            this.exitDirection = Math.random() < 0.5 ? "left" : "right";

            this.targetX = this.exitDirection === "left"
                ? -this.width - 100
                : CANVAS_WIDTH + 100;

            this.exitTimer = 0;
            this.exitHideTime = 1200;
        }

        if (this.exitMode) {
            this.exitTimer += deltaTime;

            this.x += (this.targetX - this.x) * 0.06;

            if (this.exitTimer >= this.exitHideTime) {
                this.x = Math.random() < 0.5 ? -this.width : CANVAS_WIDTH;
                this.targetX = Math.random() * (CANVAS_WIDTH - this.width);
                this.exitMode = false;
            }

            this.y = this.targetY;
        } else {

            // ------------------ MOVIMENTO ALEATÓRIO NORMAL ------------------
            this.moveTimer += deltaTime;

            if (this.moveTimer >= this.moveInterval) {
                this.moveTimer = 0;
                this.moveInterval = 2000 + Math.random() * 2500;

                const options = [
                    80,
                    CANVAS_WIDTH / 2 - this.width / 2,
                    CANVAS_WIDTH - this.width - 80,
                    Math.random() * (CANVAS_WIDTH - this.width)
                ];

                this.targetX = options[Math.floor(Math.random() * options.length)];
            }

            this.x += (this.targetX - this.x) * 0.02;
            this.y = this.targetY + Math.sin(now * this.floatSpeed) * this.floatAmplitude;
        }

        // tilt suave
        this.tiltAngle = Math.sin(now * 0.002) * this.maxTilt;

        // >>> GIRO AQUI <<<
        this.rotation += this.rotationSpeed * (deltaTime / 16.67);

        // rotações extras da aura
        this.auraRotation += this.auraRotationSpeed * (deltaTime / 16.67);

        // ------------------ FASES PELO HP ------------------
        if (hpPercent < 0.70 && this.phase === 1) {
            this.phase = 2;
            this.weaponCooldown = 700;
            this.rotationSpeed = 1.5; // agora gira
        }

        if (hpPercent < 0.40 && this.phase === 2) {
            this.phase = 3;
            this.weaponCooldown = 500;
            this.rotationSpeed = 3.5; // gira mais rápido
        }

        if (hpPercent < 0.15 && this.phase === 3) {
            this.phase = 4;
            this.weaponCooldown = 350;
            this.rotationSpeed = 7.0; // GIRO VIOLENTO (vermelho)
        }

        this.fireTimer += deltaTime;
    }

    // -------------------------------------------------------
    //                     DAMAGE SYSTEM
    // -------------------------------------------------------
    takeDamage(dmg) {
        this.currentHealth -= dmg;

        const bar = document.getElementById("bossHealthBar");
        if (bar) bar.style.width = Math.max(0, this.currentHealth / this.maxHealth * 100) + "%";

        const hp = this.currentHealth / this.maxHealth;

        if (hp > 0.50) {
            this.auraRotationSpeed = 2;
            this.auraColor = "rgba(40,0,60,1.0)";
        } else if (hp > 0.30) {
            this.auraRotationSpeed = 3;
            this.auraColor = "rgba(90,0,140,1.0)";
        } else if (hp > 0.15) {
            this.auraRotationSpeed = 4.5;
            this.auraColor = "rgba(200,0,200,1.0)";
        } else {
            this.auraRotationSpeed = 7;
            this.auraColor = "rgba(255,0,0,1.0)";
        }

        if (this.currentHealth <= 0) {
            this.isAlive = false;
            bossDefeated = true;

            const barContainer = document.getElementById("bossHealthBarContainer");
            if (barContainer) barContainer.style.display = "none";

            endGame();
        }
    }

    // -------------------------------------------------------
    //                        ATAQUES
    // -------------------------------------------------------
    fire(arr) {
        if (this.fireTimer < this.weaponCooldown) return;
        this.fireTimer = 0;

        switch (this.phase) {
            case 1: this.shootSingle(arr); break;
            case 2: this.shootTriple(arr); break;
            case 3: this.shootSpray(arr); break;
            case 4: this.shoot360(arr); break;
        }
    }

    shootSingle(arr) {
        const cx = this.x + this.width / 2;
        const cy = this.y + this.height - 10;
        const offset = 105 * this.currentScale;

        arr.push(new Projectile(cx - offset, cy, 35, 35, "../assets/img/projectile/tiro-roxo.png", 350, 25, "enemy", 0));
        arr.push(new Projectile(cx + offset, cy, 35, 35, "../assets/img/projectile/tiro-roxo.png", 350, 25, "enemy", 0));
    }

    shootTriple(arr) {
        const cx = this.x + this.width / 2;
        const cy = this.y + this.height;

        arr.push(new Projectile(cx, cy - 80, 35, 35, "../assets/img/projectile/tiro-roxo.png", 360, 25, "enemy", 0));
        arr.push(new Projectile(cx - 50, cy, 35, 35, "../assets/img/projectile/tiro-roxo.png", 360, 25, "enemy", -0.15));
        arr.push(new Projectile(cx + 50, cy, 35, 35, "../assets/img/projectile/tiro-roxo.png", 360, 25, "enemy", 0.15));
    }

    shootSpray(arr) {
        const cx = this.x + this.width / 2;
        const cy = this.y + this.height;
        for (let i = -3; i <= 3; i++) {
            arr.push(new Projectile(cx, cy, 28, 28, "../assets/img/projectile/tiro-azul-baixo.png", 400, 20, "enemy", i * 0.1));
        }
    }

    shoot360(arr) {
        const cx = this.x + this.width / 2;
        const cy = this.y + this.height / 2;

        const shots = 18;
        const step = Math.PI * 2 / shots;

        for (let i = 0; i < shots; i++) {
            arr.push(new Projectile(cx, cy, 30, 30, "../assets/img/projectile/tiro-espinho-vermelho.png", 420, 20, "enemy", step * i, true));
        }
    }

    // -------------------------------------------------------
    //                      DESENHO
    // -------------------------------------------------------
    draw(ctx) {
        if (!this.isReady) return;

        const cx = this.x + this.width / 2;
        const cy = this.y + this.height / 2;

        // ----- AURA -----
        if (this.auraReady) {
            ctx.save();
            ctx.translate(cx, cy);
            ctx.rotate(this.auraRotation * Math.PI / 180);

            const pulse = Math.sin(Date.now() * this.auraPulseSpeed) * 0.05;
            const baseRadius = Math.max(this.width, this.height) * 0.5 * (this.auraScale + pulse);

            ctx.globalCompositeOperation = "lighter";
            ctx.globalAlpha = this.auraOpacity;

            const layers = 3;
            const now = Date.now();

            for (let i = 0; i < layers; i++) {
                ctx.save();

                const r = baseRadius * (1 + i * 0.1);

                ctx.rotate(i * 10 * Math.PI / 180);

                const ox = Math.sin(now * this.waveSpeed + i) * 3;
                const oy = Math.cos(now * this.waveSpeed + i) * 3;

                ctx.shadowColor = this.auraColor;
                ctx.shadowBlur = r * 0.4;

                const g = ctx.createRadialGradient(ox, oy, 0, ox, oy, r);
                g.addColorStop(0, "rgba(0,0,0,0.35)");
                g.addColorStop(0.65, "rgba(8,15,25,0.09)");
                g.addColorStop(1, "rgba(0,0,0,0)");

                ctx.fillStyle = g;
                ctx.beginPath();
                ctx.arc(ox, oy, r, 0, Math.PI * 2);
                ctx.fill();

                ctx.restore();
            }

            ctx.restore();
            ctx.globalCompositeOperation = "source-over";
        }

        // ----- BOSS -----
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate((this.tiltAngle + this.rotation) * Math.PI / 180);
        ctx.drawImage(this.img, -this.width / 2, -this.height / 2, this.width, this.height);
        ctx.restore();
    }
}
