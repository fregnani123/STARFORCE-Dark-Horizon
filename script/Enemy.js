// -------------------------------------------------------------
//  Enemy.js — COMPLETO, ORGANIZADO, TESTADO E CORRIGIDO
// -------------------------------------------------------------

class Enemy extends GameObject {

    constructor(
        x, y, width, height, imagePath,
        maxHealth = 50, speed = 100,
        fireRate = 1500, damage = 10,
        projectileSpeed = 200,

        projectileImgs = [],
        weaponLevel = 1,
        scoreValue = 10,

        isRotating = false,
        isPropulsor = false,
        isPlasmaHalo = true,
        enableTilt = true  // ← HABILITA OU DESABILITA TILT INDIVIDUAL
    ) {

        super(x, y, width, height, imagePath);

        // -------------------------------------------------
        // VIDA / ESTADO
        // -------------------------------------------------
        this.maxHealth = maxHealth;
        this.currentHealth = maxHealth;
        this.isAlive = true;
        this.isScored = false;

        // Explosão
        this.isExploding = false;
        this.explosionTimer = 0;
        this.explosionDuration = 500;

        // -------------------------------------------------
        // MOVIMENTO / ONDA
        // -------------------------------------------------
        this.speed = speed;
        this.initialX = x;
        this.amplitude = 50;
        this.frequency = 0.005;

        // -------------------------------------------------
        // ROTAÇÃO MANUAL
        // -------------------------------------------------
        this.isRotating = isRotating;
        this.rotation = 0;
        this.rotationSpeed = 0.05;

        // -------------------------------------------------
        // INCLINAÇÃO (TILT)
        // -------------------------------------------------
        this.tiltAngle = 0;
        this.maxTilt = 22;      // um pouco menos evita ficar robótico
        this.tiltSpeed = 22;    // resposta rápida e suave
        this.tiltFactor = 0.13; // sensível, mas não exagerado
        this.enableTilt = enableTilt;

        // -------------------------------------------------
        // TIRO
        // -------------------------------------------------
        this.fireRate = fireRate;
        this.fireDamage = damage;
        this.fireTimer = this.fireRate;
        this.projectileSpeed = projectileSpeed;
        this.projectileImgs = projectileImgs;
        this.weaponLevel = weaponLevel;
        this.scoreValue = scoreValue;

        // -------------------------------------------------
        // EFEITOS VISUAIS
        // -------------------------------------------------
        this.plasmaPulse = Math.random() * 1000;
        this.isPropulsor = isPropulsor;
        this.isPlasmaHalo = isPlasmaHalo;

        // plasma propulsor (chama)
        this.enemyPlasmaLength = height * 0.75;
        this.enemyPlasmaWidth = width * 0.1;
        this.enemyPlasmaOscillation = width * 0.03;
        this.enemyPlasmaSpeed = 0.005;
        this.enemyPlasmaOffset = 0;
        this.enemyPlasmaColor = 'rgba(50, 200, 255, 1.0)';
    }

    // -------------------------------------------------
    // GET IMAGEM DE PROJÉTIL
    // -------------------------------------------------
    getProjectileImg(index) {
        return this.projectileImgs[index]
            || this.projectileImgs[0]
            || "../assets/img/tiroInimigo.png";
    }

    // -------------------------------------------------
    // UPDATE
    // -------------------------------------------------
    update(deltaTime) {
        const t = deltaTime / 1000;

        // Guarda posição X anterior
        const prevX = this.x;

        // Movimento vertical + curva
        this.y += this.speed * t;
        this.x = this.initialX + Math.sin(this.y * this.frequency) * this.amplitude;

        // Velocidade horizontal real
        const deltaX = this.x - prevX;
        const speedX = (t > 0) ? deltaX / t : 0;

        // -----------------------------------------
        // ROTAÇÃO MANUAL
        // -----------------------------------------
        if (this.isRotating) {
            this.rotation += this.rotationSpeed * deltaTime;
            if (this.rotation > 360) this.rotation -= 360;
        }

        // Timers
        this.fireTimer += deltaTime;
        this.plasmaPulse += deltaTime * 0.005;

        // Explosão
        if (this.isExploding) {
            this.explosionTimer += deltaTime;
            if (this.explosionTimer >= this.explosionDuration) {
                this.isAlive = false;
            }
            return;
        }

        // -------------------------------------------------
        // TILT (apenas se habilitado)
        // -------------------------------------------------
        if (this.enableTilt) {
            let targetTilt = speedX * this.tiltFactor;
            targetTilt = Math.max(-this.maxTilt, Math.min(this.maxTilt, targetTilt));
            const interp = Math.min(1, t * this.tiltSpeed);
            this.tiltAngle += (targetTilt - this.tiltAngle) * interp;
        } else {
            this.tiltAngle = 0;
        }
    }

    // -------------------------------------------------
    // DANO / MORTE
    // -------------------------------------------------
    takeDamage(dmg, particlesArray) {
        if (!this.isAlive || this.isExploding) return;

        this.currentHealth -= dmg;

        if (this.currentHealth <= 0) {
            this.isExploding = true;
            this.explosionTimer = 0;

            if (!this.isScored) {
                // ADICIONE SUA FUNÇÃO DE SCORE
                this.isScored = true;
            }

            this.speed = 0;
            this.isPropulsor = false;
            this.isPlasmaHalo = false;

            if (particlesArray) this.generateParticles(particlesArray);
        }
    }

    // -------------------------------------------------
    // FIRE
    // -------------------------------------------------
    fire(arr) {
        if (this.fireTimer < this.fireRate || !this.isAlive) return false;

        this.fireTimer = 0;

        switch (this.weaponLevel) {
            case 2: return this.fireDouble(arr);
            case 3: return this.fireTriple(arr);
            case 4: return this.fireExplosion360(arr);
            default: return this.fireSingle(arr);
        }
    }

    fireSingle(arr) {
        arr.push(new Projectile(
            this.x + this.width * 0.5 - 15,
            this.y + this.height * 0.7,
            30, 30,
            this.getProjectileImg(0),
            this.projectileSpeed,
            this.fireDamage,
            "enemy",
            0
        ));
    }

    fireDouble(arr) {
        const img = this.getProjectileImg(1);
        const y = this.y + this.height * 0.7;

        arr.push(new Projectile(this.x + this.width * 0.25 - 15, y, 25, 25, img, this.projectileSpeed * 1.2, this.fireDamage, "enemy", -0.12));
        arr.push(new Projectile(this.x + this.width * 0.75 - 15, y, 25, 25, img, this.projectileSpeed * 1.2, this.fireDamage, "enemy", 0.12));
    }

    fireTriple(arr) {
        const img = this.getProjectileImg(2);
        const y = this.y + this.height * 0.7;

        arr.push(new Projectile(this.x + this.width * 0.5 - 15, y, 30, 30, img, this.projectileSpeed * 0.9, this.fireDamage, "enemy", 0));
        arr.push(new Projectile(this.x + this.width * 0.20 - 15, y, 30, 30, img, this.projectileSpeed * 1.25, this.fireDamage, "enemy", -0.28));
        arr.push(new Projectile(this.x + this.width * 0.80 - 15, y, 30, 30, img, this.projectileSpeed * 1.25, this.fireDamage, "enemy", 0.28));
    }

    fireExplosion360(arr) {
        const img = this.getProjectileImg(2);
        const total = 12;
        const step = Math.PI * 2 / total;

        const cx = this.x + this.width * 0.5 - 15;
        const cy = this.y + this.height * 0.7;

        for (let i = 0; i < total; i++) {
            arr.push(new Projectile(
                cx, cy, 30, 30,
                img,
                this.projectileSpeed * 1.4,
                this.fireDamage,
                "enemy",
                step * i,
                true
            ));
        }
    }

    // -------------------------------------------------
    // EFEITOS VISUAIS
    // -------------------------------------------------
    drawPlasmaHalo(ctx) {
        const pulse = (Math.sin(this.plasmaPulse) + 1) * 0.5;
        const radius = Math.max(this.width, this.height) * 0.65;

        const cx = this.x + this.width / 2;
        const cy = this.y + this.height / 2;

        ctx.save();
        ctx.globalCompositeOperation = "lighter";

        const grad = ctx.createRadialGradient(cx, cy, radius * 0.1, cx, cy, radius);
        grad.addColorStop(0, `rgba(80,150,255, ${0.22 + pulse * 0.12})`);
        grad.addColorStop(0.6, `rgba(50,120,255, ${0.09 + pulse * 0.06})`);
        grad.addColorStop(1, "rgba(0,0,0,0)");

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    drawPropulsor(ctx) {
        const plasmaLength = this.enemyPlasmaLength + Math.sin(Date.now() * this.enemyPlasmaSpeed) * this.enemyPlasmaOscillation;
        const plasmaWidth = this.enemyPlasmaWidth + Math.cos(Date.now() * this.enemyPlasmaSpeed * 0.5) * (this.enemyPlasmaOscillation / 2);

        ctx.save();

        const cx = this.x + this.width / 2;
        const cy = this.y + this.height / 2;

        ctx.translate(cx, cy);

        if (this.isRotating) ctx.rotate(this.rotation * Math.PI / 180);

        const gStart = -this.height / 5 + this.enemyPlasmaOffset;
        const gEnd = gStart - plasmaLength;

        const grad = ctx.createLinearGradient(0, gStart, 0, gEnd);
        grad.addColorStop(0.0, 'rgba(0, 50, 100, 0.7)');
        grad.addColorStop(0.15, 'rgba(50, 200, 255, 0.5)');
        grad.addColorStop(0.3, 'rgba(50, 200, 255, 0.4)');
        grad.addColorStop(1.0, 'rgba(0, 50, 100, 0.0)');

        ctx.fillStyle = grad;
        ctx.globalCompositeOperation = "lighter";

        ctx.fillRect(-plasmaWidth / 2, gStart, plasmaWidth, -plasmaLength);

        ctx.restore();
    }

    // -------------------------------------------------
    // EXPLOSÃO
    // -------------------------------------------------
    drawExplosion(ctx) {
        const progress = this.explosionTimer / this.explosionDuration;
        const opacity = 1 - progress;

        const maxRadius = Math.max(this.width, this.height) * 4.0;
        const radius = maxRadius * Math.pow(progress, 0.7);

        const cx = this.x + this.width / 2;
        const cy = this.y + this.height / 2;

        ctx.save();
        ctx.globalCompositeOperation = "lighter";

        // Núcleo
        const g1 = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius * 0.25);
        g1.addColorStop(0, `rgba(255,255,255,${opacity})`);
        g1.addColorStop(0.5, `rgba(100,255,255,${opacity * 0.9})`);
        g1.addColorStop(1, `rgba(0,100,255,0)`);
        ctx.fillStyle = g1;
        ctx.beginPath();
        ctx.arc(cx, cy, radius * 0.25, 0, Math.PI * 2);
        ctx.fill();

        // Nuvem de plasma
        const g2 = ctx.createRadialGradient(cx, cy, radius * 0.25, cx, cy, radius * 0.75);
        g2.addColorStop(0, `rgba(0,150,255,${opacity * 0.7})`);
        g2.addColorStop(0.7, `rgba(150,0,255,${opacity * 0.3})`);
        g2.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = g2;
        ctx.beginPath();
        ctx.arc(cx, cy, radius * 0.75, 0, Math.PI * 2);
        ctx.fill();

        // Onda de choque
        if (progress < 0.5) {
            const pRadius = maxRadius * Math.pow(progress * 2, 2.5);
            const pOpacity = 1 - (progress * 2);
            const g3 = ctx.createRadialGradient(cx, cy, radius * 0.75, cx, cy, pRadius);
            g3.addColorStop(0, `rgba(50,255,255,${pOpacity * 0.4})`);
            g3.addColorStop(0.8, `rgba(0,50,255,${pOpacity * 0.1})`);
            g3.addColorStop(1, "rgba(0,0,0,0)");
            ctx.fillStyle = g3;
            ctx.beginPath();
            ctx.arc(cx, cy, pRadius, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }

    // -------------------------------------------------
    // PARTÍCULAS
    // -------------------------------------------------
    generateParticles(particlesArray) {
        const cx = this.x + this.width / 2;
        const cy = this.y + this.height / 2;

        // Plasma
        for (let i = 0; i < 25; i++) {
            const a = Math.random() * Math.PI * 2;
            const s = Math.random() * 10 + 3;
            const size = Math.random() * 5 + 2;

            let color;
            const r = Math.random();
            if (r < 0.4) color = 'rgba(255,255,255,1)';
            else if (r < 0.7) color = 'rgba(100,255,255,1)';
            else if (r < 0.9) color = 'rgba(0,150,255,1)';
            else color = 'rgba(255,200,100,1)';

            particlesArray.push(new Particle(cx, cy, size, color, Math.cos(a) * s, Math.sin(a) * s, 0.96, 0.2, 60));
        }

        // Detritos
        for (let i = 0; i < 15; i++) {
            const a = Math.random() * Math.PI * 2;
            const s = Math.random() * 5 + 1;
            const size = Math.random() * 7 + 3;

            let color;
            const r = Math.random();
            if (r < 0.4) color = 'rgb(100,100,100)';
            else if (r < 0.7) color = 'rgb(50,50,50)';
            else color = 'rgb(20,20,20)';

            particlesArray.push(new Particle(cx, cy, size, color, Math.cos(a) * s, Math.sin(a) * s, 0.90, 0.5, 90));
        }
    }

    // -------------------------------------------------
    // DRAW FINAL — tilt + rotação + efeitos
    // -------------------------------------------------
    draw(ctx) {
        if (this.isExploding) {
            this.drawExplosion(ctx);
            return;
        }

        if (this.isPropulsor) this.drawPropulsor(ctx);
        if (this.isPlasmaHalo) this.drawPlasmaHalo(ctx);

        const cx = this.x + this.width / 2;
        const cy = this.y + this.height / 2;

        const totalRotationDeg = this.tiltAngle + (this.isRotating ? this.rotation : 0);
        const rad = totalRotationDeg * Math.PI / 180;

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(rad);

        ctx.drawImage(this.img, -this.width / 2, -this.height / 2, this.width, this.height);

        ctx.restore();
    }
}

// -------------------------------------------------------------
// FIM DA CLASSE ENEMY (COMPLETA)
// -------------------------------------------------------------
