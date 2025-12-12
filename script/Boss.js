// ------------------ BOSS COMPLETO REFEITO E CORRIGIDO ------------------
class Boss extends GameObject {
    constructor(x, y, width, height, imagePath, maxHealth = 2000) {

        const originalWidth = width;
        const originalHeight = height;

        super(x, -200, originalWidth, originalHeight, imagePath);

        this.originalWidth = originalWidth;
        this.originalHeight = originalHeight;

        // ... (Outras propriedades mantidas) ...
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
        this.rotation = 0;
        this.rotationSpeed = 0;
        this.exitMode = false;
        this.exitTimer = 0;
        this.exitCooldown = 0;
        this.exitInterval = 6000 + Math.random() * 5000;
        this.auraReady = true;
        this.auraRotation = 0;
        this.auraRotationSpeed = 2;
        this.auraScale = 1.25;
        this.auraOpacity = 0.6;
        this.auraPulseSpeed = 0.005;
        this.waveSpeed = 0.0005;
        this.auraColor = "rgba(0,0,0,0.9)";

        // <<< CORREÇÃO: EXPLOSÃO LONGA E GIGANTE >>>
        this.isExploding = false;
        this.explosionTimer = 0;
        this.explosionDuration = 3000; // 3.0 segundos
        this.explosionRadius = 0;
        // Raio para cobrir quase a tela toda (CANVAS_WIDTH deve ser globalmente definido)
        this.maxExplosionRadius = CANVAS_WIDTH * 0.9;
        this.particlesGenerated = false;
    }

    // -------------------------------------------------------
    // UPDATE COMPLETO (AJUSTADO PARA EXPLOSÃO)
    // -------------------------------------------------------
    update(deltaTime) {
        const t = deltaTime / 1000;
        const now = Date.now();

        // <<< Lógica da Explosão GIGANTE >>>
        if (this.isExploding) {
            this.explosionTimer += deltaTime;

            // Oculta a imagem do Boss e usa o raio para o desenho
            this.width = 0;
            this.height = 0;

            const progress = this.explosionTimer / this.explosionDuration;
            this.explosionRadius = progress * this.maxExplosionRadius;

            if (this.explosionTimer >= this.explosionDuration) {
                this.isAlive = false;
                endGame();
            }
            // Força um giro violento e reduz a aura
            this.rotation += 10 * (deltaTime / 16.67);
            this.auraRotation += this.auraRotationSpeed * (deltaTime / 16.67);
            this.auraOpacity = 0.6 * (1.0 - progress);

            return;
        }

        // ... (Resto do update mantido inalterado) ...

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
        // >>> NOVO SISTEMA: BOSS SAI DA TELA <<<
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
 // ------------------ FASES PELO HP ------------------
if (hpPercent < 0.70 && this.phase === 1) {
    this.phase = 2;
    this.weaponCooldown = 700;
    this.rotationSpeed = 0;   // NÃO GIRA AINDA
}

if (hpPercent < 0.40 && this.phase === 2) {
    this.phase = 3;
    this.weaponCooldown = 500;
    this.rotationSpeed = 0;   // AINDA NÃO GIRA
}

if (hpPercent < 0.15 && this.phase === 3) {
    this.phase = 4;
    this.weaponCooldown = 350;

    // AGORA SIM → COMEÇA A GIRAR
    this.rotationSpeed = 7.0;
}


        this.fireTimer += deltaTime;
    }

 

// -------------------------------------------------------
// DAMAGE SYSTEM (AJUSTADO PARA SOM)
// -------------------------------------------------------
takeDamage(dmg, particlesArray) {
    this.currentHealth -= dmg;

    const bar = document.getElementById("bossHealthBar");
    if (bar) bar.style.width = Math.max(0, this.currentHealth / this.maxHealth * 100) + "%";

    const hp = this.currentHealth / this.maxHealth;

    // ... (Lógica de mudança de aura/fase mantida) ...
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
    // ... (Fim da lógica de aura/fase mantida) ...

    if (this.currentHealth <= 0) {
        if (!this.isExploding) {
            this.isExploding = true;
            this.rotationSpeed = 10;
            this.isAlive = true;
            bossDefeated = true;
            
            // 🔥 CHAMA O SOM DA EXPLOSÃO AQUI!
         
if (typeof playBGM === 'function') {
    // Apenas passe o valor '1' para o segundo parâmetro (volume)
    playBGM('../assets/audio/explosaoBoss.mp3', 1);
}
            
            if (typeof this.generateParticles === 'function' && particlesArray) {
                this.generateParticles(particlesArray);
            }
        }

        const barContainer = document.getElementById("bossHealthBarContainer");
        if (barContainer) barContainer.style.display = "none";
    }
}
    // -------------------------------------------------------
    // ATAQUES (MANTIDOS)
    // -------------------------------------------------------
    fire(arr) {
        if (this.isExploding || this.fireTimer < this.weaponCooldown) return;
        this.fireTimer = 0;
        switch (this.phase) {
            case 1: this.shootSingle(arr); break;
            case 2: this.shootTriple(arr); break;
            case 3: this.shootSpray(arr); break;
            case 4: this.shoot360(arr); break;
        }
    }

shootSingle(arr) {
    // --------------------------------------
    // Disparo normal (mantido do seu código)
    // --------------------------------------
    const cx = this.x + this.width / 2;
    const cy = this.y + this.height * 0.7;
    const offset = 105 * this.currentScale;

    arr.push(new Projectile(cx - offset, cy, 25, 40, "../assets/img/projectile/laser-vermelho.png", 900, 25, "enemy", 0));
    arr.push(new Projectile(cx + offset, cy, 25, 40, "../assets/img/projectile/laser-vermelho.png", 900, 25, "enemy", 0));

    // --------------------------------------
    // Disparo 360 ocasional
    // --------------------------------------
    if (!this.single360Counter) this.single360Counter = 0;
    this.single360Counter++;

    // 1 tiro 360 a cada 4 tiros single
    const intervalo360 = 4;

    if (this.single360Counter >= intervalo360) {
        this.single360Counter = 0;
        this.shoot360(arr); // chama seu método já existente
    }
}

    shootTriple(arr) {
        const cx = this.x + this.width / 2;
        const cy = this.y + this.height;
        arr.push(new Projectile(cx, cy - 80, 25, 40,"../assets/img/projectile/tiro-laranja.png", 900, 25, "enemy", 0));
        arr.push(new Projectile(cx - 50, cy, 28, 40, "../assets/img/projectile/tiro-laranja.png",900, 25, "enemy", -0.15));
        arr.push(new Projectile(cx + 50, cy, 25, 40, "../assets/img/projectile/tiro-laranja.png",900, 25, "enemy", 0.15));
    }

    shootSpray(arr) {
        const cx = this.x + this.width / 2;
        const cy = this.y + this.height;
        for (let i = -3; i <= 3; i++) {
            arr.push(new Projectile(cx, cy, 28, 28,"../assets/img/projectile/tiro-laranja.png", 400, 20, "enemy", i * 0.1));
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
    // PARTÍCULAS (MANTIDO)
    // -------------------------------------------------------
    generateParticles(arr) {
        if (this.particlesGenerated) return;

        const cx = this.x + this.width / 2;
        const cy = this.y + this.height / 2;

        const numParticles = 400;

        for (let i = 0; i < numParticles; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 2 + Math.random() * 8;
            const color = `rgb(${20 + Math.random() * 50}, ${20 + Math.random() * 50}, ${20 + Math.random() * 50})`;

            let plasmaColor;
            if (this.phase === 4) {
                plasmaColor = `rgba(255, ${Math.random() * 100}, ${Math.random() * 100}, 1)`;
            } else {
                plasmaColor = `rgba(${100 + Math.random() * 155}, 0, ${200 + Math.random() * 55}, 1)`;
            }

            const size = 3 + Math.random() * 7;
            const life = 100 + Math.random() * 100;
            const friction = 0.96;
            const gravity = 0.1;

            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;

            arr.push(new Particle(cx, cy, size, color, vx, vy, friction, gravity, life));

            if (i % 4 === 0) {
                arr.push(new Particle(cx, cy, size * 0.8, plasmaColor, vx * 1.5, vy * 1.5, 0.98, 0.05, life * 0.7));
            }
        }
        this.particlesGenerated = true;
    }

    // -------------------------------------------------------
    // DESENHO (CORRIGIDO)
    // -------------------------------------------------------
    draw(ctx) {
        if (!this.isReady) return;

        // Se estiver explodindo, use originalWidth/Height para calcular o centro, pois this.width/height são 0.
        const cx = this.isExploding ? this.x + this.originalWidth / 2 : this.x + this.width / 2;
        const cy = this.isExploding ? this.y + this.originalHeight / 2 : this.y + this.height / 2;

        if (this.isExploding) {
            this.drawExplosion(ctx);
        }

        // ----- AURA -----
        if (this.auraReady) {
            ctx.save();
            ctx.translate(cx, cy);
            ctx.rotate(this.auraRotation * Math.PI / 180);

            const pulse = Math.sin(Date.now() * this.auraPulseSpeed) * 0.05;
            // Usa originalWidth/Height para calcular o raio base da aura durante a explosão
            const baseRadius = (this.isExploding ? Math.max(this.originalWidth, this.originalHeight) : Math.max(this.width, this.height)) * 0.5 * (this.auraScale + pulse);

            ctx.globalCompositeOperation = "lighter";
            // globalAlpha da aura é controlado no update da explosão
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

        // ----- BOSS IMAGEM -----
        if (!this.isExploding) {
            ctx.save();
            ctx.translate(cx, cy);
            ctx.rotate((this.tiltAngle + this.rotation) * Math.PI / 180);
            ctx.drawImage(this.img, -this.width / 2, -this.height / 2, this.width, this.height);
            ctx.restore();
        }
    }

    // -------------------------------------------------------
    // <<< DRAW EXPLOSION GIGANTE (CORRIGIDO) >>>
    // -------------------------------------------------------
    drawExplosion(ctx) {
        // Usa originalWidth/Height para obter o centro correto, independentemente de this.width ser 0.
        const cx = this.x + this.originalWidth / 2;
        const cy = this.y + this.originalHeight / 2;

        const currentRadius = this.explosionRadius;
        const maxRadius = this.maxExplosionRadius;
        const progress = this.explosionTimer / this.explosionDuration;

        // Efeito de brilho intenso (Plasma e Fogo)
        ctx.save();
        ctx.globalCompositeOperation = "lighter";

        // Diminui o brilho de forma não-linear (dura mais tempo com brilho alto, desaparece rapidamente)
        ctx.globalAlpha = 1.0 - progress * progress;

        // --- 1. Núcleo Interno (Branco Puro/Flash) ---
        // Expande o flash branco.
        const innerRadius = currentRadius * 0.4;
        let g1 = ctx.createRadialGradient(cx, cy, innerRadius * 0.1, cx, cy, innerRadius);
        g1.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
        g1.addColorStop(0.8, 'rgba(255, 200, 50, 0.8)');
        g1.addColorStop(1, 'rgba(255, 150, 0, 0.0)');
        ctx.fillStyle = g1;
        ctx.beginPath();
        ctx.arc(cx, cy, innerRadius, 0, Math.PI * 2);
        ctx.fill();

        // --- 2. Onda de Choque Externa (Laranja/Vermelho Forte) ---
        // Expande até o tamanho total (maxRadius)
        let g2 = ctx.createRadialGradient(cx, cy, currentRadius * 0.3, cx, cy, maxRadius);
        g2.addColorStop(0, 'rgba(255, 100, 0, 0.8)');
        g2.addColorStop(0.5, 'rgba(255, 0, 0, 0.4)');
        g2.addColorStop(1, 'rgba(255, 0, 0, 0)');
        ctx.fillStyle = g2;
        ctx.beginPath();
        ctx.arc(cx, cy, maxRadius, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}