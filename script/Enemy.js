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

        // 💥 PROPRIEDADES DA EXPLOSÃO
        this.isExploding = false;
        this.explosionTimer = 0;
        this.explosionDuration = 500; // Duração da explosão em ms

        // ✅ FLAG PARA GARANTIR QUE O SCORE SEJA CONTABILIZADO APENAS UMA VEZ
        this.isScored = false;
        // Fim das propriedades da explosão

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

        // 🚀 PROPRIEDADES DO PLASMA RETANGULAR (ESTILO PLAYER)
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

        // Movimento vertical
        this.y += this.speed * t;
        this.x = this.initialX + Math.sin(this.y * this.frequency) * this.amplitude;

        // Rotação
        if (this.isRotating) {
            this.rotation += this.rotationSpeed * deltaTime;
            if (this.rotation > 360) this.rotation -= 360;
        } else {
            this.rotation = 0;
        }

        this.fireTimer += deltaTime;
        this.plasmaPulse += deltaTime * 0.005;

        // 💥 ATUALIZAÇÃO DO TIMER DA EXPLOSÃO
        if (this.isExploding) {
            this.explosionTimer += deltaTime;

            // ✅ MARCAR COMO MORTO APÓS A ANIMAÇÃO (ETAPA 2 da morte)
            if (this.explosionTimer >= this.explosionDuration) {
                // A nave é marcada como morta para ser removida na próxima iteração do jogo principal
                this.isAlive = false;
            }
        }
    }


    takeDamage(dmg, particlesArray) { // 🚨 ATENÇÃO: Adicionamos o argumento particlesArray!
        this.currentHealth -= dmg;

        // Certifique-se de que a vida está realmente abaixo ou igual a zero
        if (this.currentHealth <= 0) {

            // 💥 INICIA A EXPLOSÃO (ETAPA 1 da morte)
            if (!this.isExploding) {
                this.isExploding = true;
                this.explosionTimer = 0;

                // ✅ CONTABILIZA O SCORE IMEDIATAMENTE.
                if (!this.isScored) {
                    // *** CHAME SUA FUNÇÃO GLOBAL DE SCORE AQUI ***
                    this.isScored = true;
                }

                // Paramos o movimento e os efeitos visuais normais durante a explosão
                this.speed = 0;
                this.isPropulsor = false;
                this.isPlasmaHalo = false;

                // 🚀 LINHA ESSENCIAL QUE ESTAVA FALTANDO! 🚀
                // Passa o array global de partículas para que a função generateParticles o preencha
                if (particlesArray) {
                    this.generateParticles(particlesArray);
                }
            }
        }
    }
    // -------------------------------------------------
    // MÉTODOS DE TIRO (MANTIDOS)
    // -------------------------------------------------
    fire(enemyProjectiles) {
        if (this.fireTimer < this.fireRate || !this.isAlive) return false;
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
        const lowMidY = this.y + this.height * 0.7;

        arr.push(new Projectile(this.x + this.width * 0.25 - 15, lowMidY, 25, 25, img, this.projectileSpeed * 1.2, this.fireDamage, "enemy", -0.12));
        arr.push(new Projectile(this.x + this.width * 0.75 - 15, lowMidY, 25, 25, img, this.projectileSpeed * 1.2, this.fireDamage, "enemy", 0.12));
    }

    fireTriple(arr) {
        const img = this.getProjectileImg(2);
        const lowMidY = this.y + this.height * 0.7;

        arr.push(new Projectile(this.x + this.width * 0.5 - 15, lowMidY, 30, 30, img, this.projectileSpeed * 0.9, this.fireDamage, "enemy", 0));
        arr.push(new Projectile(this.x + this.width * 0.20 - 15, lowMidY, 30, 30, img, this.projectileSpeed * 1.25, this.fireDamage, "enemy", -0.28));
        arr.push(new Projectile(this.x + this.width * 0.80 - 15, lowMidY, 30, 30, img, this.projectileSpeed * 1.25, this.fireDamage, "enemy", 0.28));
    }

    fireExplosion360(arr) {
        const img = this.getProjectileImg(2);
        const total = 12;
        const step = Math.PI * 2 / total;

        const cx = this.x + this.width * 0.5 - 15;
        const cy = this.y + this.height * 0.7;

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
        // ... (código drawPlasmaHalo mantido)
        ctx.save();
        const cx = this.x + this.width / 2;
        const cy = this.y + this.height / 2;

        const grad = ctx.createRadialGradient(
            cx, cy, radius * 0.1,
            cx, cy, radius
        );

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
    // DESENHO: Propulsor (Chama de Plasma) - MANTIDO
    // -------------------------------------------------
    drawPropulsor(ctx) {
        const plasmaLength = this.enemyPlasmaLength + Math.sin(Date.now() * this.enemyPlasmaSpeed) * this.enemyPlasmaOscillation;
        const plasmaWidth = this.enemyPlasmaWidth + Math.cos(Date.now() * this.enemyPlasmaSpeed * 0.5) * (this.enemyPlasmaOscillation / 2);

        ctx.save();
        const cx = this.x + this.width / 2;
        const cy = this.y + this.height / 2;
        ctx.translate(cx, cy);

        if (this.isRotating) {
            ctx.rotate(this.rotation * Math.PI / 180);
        }

        const gradientStart = -this.height / 5 + this.enemyPlasmaOffset;
        const gradientEnd = gradientStart - plasmaLength;

        const gradient = ctx.createLinearGradient(0, gradientStart, 0, gradientEnd);

        gradient.addColorStop(0.0, 'rgba(0, 50, 100, 0.7)');
        gradient.addColorStop(0.15, 'rgba(50, 200, 255, 0.5)');
        gradient.addColorStop(0.3, 'rgba(50, 200, 255, 0.4)');
        gradient.addColorStop(1.0, 'rgba(0, 50, 100, 0.0)');

        ctx.fillStyle = gradient;
        ctx.globalCompositeOperation = "lighter";
        ctx.globalAlpha = 1.0;

        ctx.fillRect(
            -plasmaWidth / 2,
            gradientStart,
            plasmaWidth,
            -plasmaLength
        );

        ctx.globalAlpha = 1.0;
        ctx.restore();
    }
    // DENTRO DA CLASSE Enemy...

    // -------------------------------------------------
    // NOVO: GERAÇÃO DE PARTÍCULAS DO PROPULSOR
    // -------------------------------------------------
    // DENTRO DA CLASSE Enemy { ... }
    // DENTRO DA CLASSE Enemy...
    // DENTRO DA CLASSE Enemy { ... AQUI ... }

    // 💥 DESENHO DA EXPLOSÃO DE PLASMA AZUL (SCIENTIFIC-FICTION)
    drawExplosion(ctx) {
        if (!this.isExploding) return;

        // Progress: De 0.0 (início) a 1.0 (fim)
        const progress = this.explosionTimer / this.explosionDuration;

        // Opacidade: Vai de 1.0 (brilho total) para 0.0 (desaparecimento)
        const opacity = 1.0 - progress;

        // Raio máximo e Raio atual (cresce com o tempo)
        const maxRadius = Math.max(this.width, this.height) * 4.0; // Aumentamos um pouco o raio
        const currentRadius = maxRadius * Math.pow(progress, 0.7); // Crescimento um pouco mais suave

        const cx = this.x + this.width / 2;
        const cy = this.y + this.height / 2;

        ctx.save();
        // Mantém "lighter" para o efeito de brilho intenso
        ctx.globalCompositeOperation = "lighter";

        // --- 1. O NÚCLEO BRANCO-GELO E CIANO QUENTE ---
        // O ponto mais quente e brilhante (Branco/Ciano)
        const grad1 = ctx.createRadialGradient(cx, cy, 0, cx, cy, currentRadius * 0.25);
        // Cores: O núcleo é sempre branco/ciano muito brilhante
        grad1.addColorStop(0, `rgba(255, 255, 255, ${opacity})`);          // Branco Puro
        grad1.addColorStop(0.5, `rgba(100, 255, 255, ${opacity * 0.9})`);  // Ciano Brilhante
        grad1.addColorStop(1, `rgba(0, 100, 255, 0)`);                     // Azul
        ctx.fillStyle = grad1;
        ctx.beginPath();
        ctx.arc(cx, cy, currentRadius * 0.25, 0, Math.PI * 2);
        ctx.fill();

        // --- 2. A NUVEM DE PLASMA AZUL-VIOLETA ---
        // Camada intermediária que define a cor principal do plasma.
        const grad2 = ctx.createRadialGradient(cx, cy, currentRadius * 0.25, cx, cy, currentRadius * 0.75);
        // Cores: Tons profundos de azul e violeta
        grad2.addColorStop(0, `rgba(0, 150, 255, ${opacity * 0.7})`);       // Azul Claro
        grad2.addColorStop(0.7, `rgba(150, 0, 255, ${opacity * 0.3})`);     // Violeta Profundo
        grad2.addColorStop(1, `rgba(0, 0, 0, 0)`);                         // Transparente
        ctx.fillStyle = grad2;
        ctx.beginPath();
        ctx.arc(cx, cy, currentRadius * 0.75, 0, Math.PI * 2);
        ctx.fill();

        // --- 3. ⚡ A ONDA DE CHOQUE RÁPIDA (Pulso Final Ciano) ⚡ ---
        // Esta onda se propaga rapidamente e usa a cor ciano/elétrica.
        if (progress < 0.5) {
            // Aumenta o raio rapidamente para simular o pulso
            const pulseRadius = maxRadius * Math.pow(progress * 2, 2.5);
            const pulseOpacity = 1.0 - (progress * 2); // Opacidade some em 50% do tempo

            const grad3 = ctx.createRadialGradient(cx, cy, currentRadius * 0.75, cx, cy, pulseRadius);
            // Cores: Ciano elétrico e luz fraca
            grad3.addColorStop(0, `rgba(50, 255, 255, ${pulseOpacity * 0.4})`);   // Ciano Elétrico
            grad3.addColorStop(0.8, `rgba(0, 50, 255, ${pulseOpacity * 0.1})`);  // Azul Fraco
            grad3.addColorStop(1, `rgba(0, 0, 0, 0)`);
            ctx.fillStyle = grad3;
            ctx.beginPath();
            ctx.arc(cx, cy, pulseRadius, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }
    // -------------------------------------------------
    // NOVO: GERAÇÃO DE PARTÍCULAS (AGORA COM DETRITOS)
    // -------------------------------------------------
    generateParticles(particlesArray) {
        const center = { x: this.x + this.width / 2, y: this.y + this.height / 2 };

        // --- Partículas de Plasma/Fogo (Ciano/Amarelo/Branco) ---
        const numPlasmaParticles = 25;
        for (let i = 0; i < numPlasmaParticles; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 10 + 3; // Mais rápido
            const velocityX = Math.cos(angle) * speed;
            const velocityY = Math.sin(angle) * speed;

            const size = Math.random() * 5 + 2; // Tamanho entre 2 e 7

            // Cores de plasma: Branco, Ciano, Azul Claro, com chance de Amarelo
            let color;
            const randColor = Math.random();
            if (randColor < 0.4) color = 'rgba(255, 255, 255, 1)'; // Branco brilhante
            else if (randColor < 0.7) color = 'rgba(100, 255, 255, 1)'; // Ciano
            else if (randColor < 0.9) color = 'rgba(0, 150, 255, 1)'; // Azul Claro
            else color = 'rgba(255, 200, 100, 1)'; // Amarelo (núcleo quente)

            particlesArray.push(new Particle(
                center.x,
                center.y,
                size,
                color,
                velocityX,
                velocityY,
                0.96, // Fricção
                0.2,  // Gravidade leve (para simular dispersão no espaço e leve "queda")
                60    // Vida em frames (aprox. 1 segundo)
            ));
        }

        // --- Partículas de Detrito da Nave (Cinza/Preto/Metálico) ---
        const numDebrisParticles = 15; // Menos detritos do que plasma
        for (let i = 0; i < numDebrisParticles; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 5 + 1; // Mais lento que o plasma
            const velocityX = Math.cos(angle) * speed;
            const velocityY = Math.sin(angle) * speed;

            const size = Math.random() * 7 + 3; // Detritos podem ser maiores (3 a 10)

            // Cores de detrito: Tons de cinza, preto para metal queimado
            let color;
            const randColor = Math.random();
            if (randColor < 0.4) color = 'rgb(100, 100, 100)'; // Cinza escuro
            else if (randColor < 0.7) color = 'rgb(50, 50, 50)';   // Cinza muito escuro
            else color = 'rgb(20, 20, 20)';                       // Quase preto (carbonizado)

            // Detritos terão um pouco mais de atrito e gravidade (se houver) e vida mais longa
            particlesArray.push(new Particle(
                center.x,
                center.y,
                size,
                color,
                velocityX,
                velocityY,
                0.90, // Mais fricção (desacelera mais rápido)
                0.5,  // Um pouco mais de "gravidade" (para dar um arco de queda)
                90    // Vida mais longa em frames (aprox. 1.5 segundos)
            ));
        }
    }
    // -------------------------------------------------
    // DESENHO PRINCIPAL (CORRIGIDO)
    // -------------------------------------------------
    draw(ctx) {

        // 1. SEMPRE desenhe o efeito de explosão se estiver explodindo
        if (this.isExploding) {
            // LINHA 334: Onde a chamada ocorre!
            this.drawExplosion(ctx);
        }

        // 2. Desenhe a nave e seus efeitos normais SOMENTE SE NÃO estiver explodindo.
        if (!this.isExploding) {

            // Desenha o propulsor (chama) se ativado
            if (this.isPropulsor) {
                this.drawPropulsor(ctx);
            }

            // Desenha o plasma halo (o brilho circular) SOMENTE se isPlasmaHalo for TRUE
            if (this.isPlasmaHalo) {
                this.drawPlasmaHalo(ctx);
            }

            // Desenha a imagem da nave (GameObject) por cima de todos os efeitos de plasma
            super.draw(ctx);
        }
    }
}