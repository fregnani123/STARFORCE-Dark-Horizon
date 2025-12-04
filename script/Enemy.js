// Arquivo: script/Enemy.js

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
        // ---- NOVO: Controle do Propulsor/Chama ----
        isPropulsor = false,
        // ---- NOVO: Controle do Plasma Halo (Brilho circular) ----
        isPlasmaHalo = true 
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

        // Rotação
        this.isRotating = isRotating;
        this.rotation = 0;
        this.rotationSpeed = 0.05;

        // Tiro
        this.fireRate = fireRate;
        this.fireDamage = damage;
        this.fireTimer = this.fireRate;
        this.projectileSpeed = projectileSpeed;

        this.projectileImgs = projectileImgs;
        this.weaponLevel = weaponLevel;

        this.scoreValue = scoreValue;

        // Intensidade do plasma (para o pulso)
        this.plasmaPulse = Math.random() * 1000;
        // Controle do propulsor (chama de plasma)
        this.isPropulsor = isPropulsor; 
        // Controle do plasma halo (brilho ao redor)
        this.isPlasmaHalo = isPlasmaHalo; 

        // 🚀 NOVO: PROPRIEDADES DO PLASMA RETANGULAR (ESTILO PLAYER)
        this.enemyPlasmaLength = height * 0.75; 
        this.enemyPlasmaWidth = width * 0.1;
        this.enemyPlasmaOscillation = width * 0.03;
        this.enemyPlasmaSpeed = 0.005;
        // Ponto de emissão: 0 (topo da nave)
        this.enemyPlasmaOffset = 0; 
        
        // 🔵 CORREÇÃO FINAL NO CONSTRUTOR: Garantindo que a cor base seja AZUL-ÁGUA
        this.enemyPlasmaColor = 'rgba(50, 200, 255, 1.0)'; // AZUL-ÁGUA BRILHANTE
    }

    // Imagem do tiro (Mantido)
    getProjectileImg(index) {
        return this.projectileImgs[index]
            || this.projectileImgs[0]
            || "../assets/img/tiroInimigo.png";
    }

    update(deltaTime) {
        const t = deltaTime / 1000;

        // Movimento vertical (Mantido)
        this.y += this.speed * t;
        this.x = this.initialX + Math.sin(this.y * this.frequency) * this.amplitude;

        // Rotação (Mantido)
        if (this.isRotating) {
            this.rotation += this.rotationSpeed * deltaTime;
            if (this.rotation > 360) this.rotation -= 360;
        } else {
            this.rotation = 0;
        }

        this.fireTimer += deltaTime;
        this.plasmaPulse += deltaTime * 0.005; // pulso suave no plasma
    }

    takeDamage(dmg) {
        this.currentHealth -= dmg;
        if (this.currentHealth <= 0) {
            this.isAlive = false;
        }
    }
// -------------------------------------------------
// TIROS (AJUSTADOS PARA SAIR EM 70% DA ALTURA DA NAVE)
// -------------------------------------------------
fire(enemyProjectiles) {
    if (this.fireTimer < this.fireRate) return false;
    this.fireTimer = 0;

    switch (this.weaponLevel) {
        case 2: this.fireDouble(enemyProjectiles); break;
        case 3: this.fireTriple(enemyProjectiles); break;
        case 4: this.fireExplosion360(enemyProjectiles); break;
        default: this.fireSingle(enemyProjectiles);
    }
    return true;
}

fireSingle(arr) { 
    arr.push(new Projectile(
        this.x + this.width * 0.5 - 15,
        this.y + this.height * 0.7, // ✅ AJUSTADO: 70% da altura
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

    const leftX = this.x + this.width * 0.25 - 15;
    const rightX = this.x + this.width * 0.75 - 15;
    const lowMidY = this.y + this.height * 0.7; // Coordenada Y em 70%

    arr.push(new Projectile(leftX, lowMidY, 25, 25, img, this.projectileSpeed * 1.2, this.fireDamage, "enemy", -0.12)); // ✅ AJUSTADO
    arr.push(new Projectile(rightX, lowMidY, 25, 25, img, this.projectileSpeed * 1.2, this.fireDamage, "enemy", 0.12));  // ✅ AJUSTADO
}

fireTriple(arr) {
    const img = this.getProjectileImg(2);

    const cx = this.x + this.width * 0.5 - 15;
    const lx = this.x + this.width * 0.20 - 15;
    const rx = this.x + this.width * 0.80 - 15;
    const lowMidY = this.y + this.height * 0.7; // Coordenada Y em 70%

    arr.push(new Projectile(cx, lowMidY, 30, 30, img, this.projectileSpeed * 0.9, this.fireDamage, "enemy", 0));         // ✅ AJUSTADO
    arr.push(new Projectile(lx, lowMidY, 30, 30, img, this.projectileSpeed * 1.25, this.fireDamage, "enemy", -0.28));    // ✅ AJUSTADO
    arr.push(new Projectile(rx, lowMidY, 30, 30, img, this.projectileSpeed * 1.25, this.fireDamage, "enemy", 0.28));    // ✅ AJUSTADO
}

fireExplosion360(arr) {
    const img = this.getProjectileImg(2);
    const total = 12;
    const step = Math.PI * 2 / total;

    const cx = this.x + this.width * 0.5 - 15;
    const cy = this.y + this.height * 0.7; // ✅ AJUSTADO para 70%

    for (let i = 0; i < total; i++) {
        arr.push(new Projectile(
            cx, cy,
            30, 30,
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
    // DESENHO: Plasma Padrão (Halo) (Mantido)
    // -------------------------------------------------
    drawPlasmaHalo(ctx) {
        const pulse = (Math.sin(this.plasmaPulse) + 1) * 0.5;  
        const radius = Math.max(this.width, this.height) * 0.65;

        ctx.save();
        const cx = this.x + this.width / 2;
        const cy = this.y + this.height / 2;

        const grad = ctx.createRadialGradient(
            cx, cy, radius * 0.1,
            cx, cy, radius
        );

        // Cor do Halo é azul (Mantido)
        grad.addColorStop(0, `rgba(80,150,255, ${0.22 + pulse * 0.12})`);
        grad.addColorStop(0.6, `rgba(50,120,255, ${0.09 + pulse * 0.06})`);
        grad.addColorStop(1, "rgba(0,0,0,0)");

        ctx.globalCompositeOperation = "lighter";
        ctx.fillStyle = grad;

        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

// -------------------------------------------------
// DESENHO: Propulsor (Chama de Plasma) - ESTILO PLAYER (fillRect invertido)
// -------------------------------------------------
drawPropulsor(ctx) {
    // 1. Calcular a pulsação (Mantido)
    const plasmaLength = this.enemyPlasmaLength + Math.sin(Date.now() * this.enemyPlasmaSpeed) * this.enemyPlasmaOscillation;
    const plasmaWidth = this.enemyPlasmaWidth + Math.cos(Date.now() * this.enemyPlasmaSpeed * 0.5) * (this.enemyPlasmaOscillation / 2);

    ctx.save();
    
    // 2. Aplicar Translação e Rotação (Mantido)
    const cx = this.x + this.width / 2;
    const cy = this.y + this.height / 2;
    ctx.translate(cx, cy);

    if (this.isRotating) {
        ctx.rotate(this.rotation * Math.PI / 180);
    }
    
    // 3. Criar Gradiente
    const gradientStart = -this.height / 5 + this.enemyPlasmaOffset; 
    const gradientEnd = gradientStart - plasmaLength; 

    const gradient = ctx.createLinearGradient(0, gradientStart, 0, gradientEnd);
    
    // 💨 GRADIENTE AZUL COM TRANSPARÊNCIA DISSIPANDO 💨
    // NOTA: Usamos valores RGB fixos para garantir o controle exato do Alpha (opacidade)
    
    // Ponto 0.0: Saída da nave: Azul Escuro, opacidade 70% (menos transparente)
    gradient.addColorStop(0.0, 'rgba(0, 50, 100, 0.7)'); 
    
    // Ponto 0.15: Transição rápida para a cor principal, opacidade 50%
    gradient.addColorStop(0.15, 'rgba(50, 200, 255, 0.5)'); 
    
    // Ponto 0.3: O corpo do propulsor: Opacidade 40% (Já está bem transparente)
    gradient.addColorStop(0.3, 'rgba(50, 200, 255, 0.4)'); 
    
    // Ponto 1.0: Ponta do propulsor: Totalmente transparente
    gradient.addColorStop(1.0, 'rgba(0, 50, 100, 0.0)'); 

    ctx.fillStyle = gradient;
    ctx.globalCompositeOperation = "lighter"; // Mantém o brilho
    ctx.globalAlpha = 1.0; // Deixa o controle de transparência para o gradiente
    
    // 4. Desenhar o Retângulo (Propulsor) (Mantido)
    ctx.fillRect(
        -plasmaWidth / 2, 
        gradientStart, 
        plasmaWidth, 
        -plasmaLength
    );
    
    ctx.globalAlpha = 1.0;
    ctx.restore();
}
    // -------------------------------------------------
    // DESENHO PRINCIPAL (Mantido)
    // -------------------------------------------------
    draw(ctx) {
        // Desenha o propulsor (chama) se ativado
        if (this.isPropulsor) {
            this.drawPropulsor(ctx);
        }

        // Desenha o plasma halo (o brilho circular) SOMENTE se isPlasmaHalo for TRUE
        if (this.isPlasmaHalo) {
            this.drawPlasmaHalo(ctx);
        }

        // Desenha a nave por cima de todos os efeitos de plasma
        super.draw(ctx);
    }
}