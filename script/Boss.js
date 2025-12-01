// Arquivo: script/Boss.js
class Boss extends GameObject {
    constructor(x, y, width, height, imagePath, maxHealth = 2000) {
        super(x, y, width, height, imagePath);

        this.maxHealth = maxHealth;
        this.currentHealth = maxHealth;
        this.isAlive = true;

        // Movimento e fases
        this.speed = 80;
        this.phase = 1;
        this.fireTimer = 0;
        this.weaponCooldown = 900;

        // Entrada do boss
        this.introDone = false;
        this.targetY = 80;

        // Rotação do boss
        this.rotation = 0;
        this.rotationSpeed = 0;

        // --- MOVIMENTO VERTICAL SUAVE ---
        this.baseY = y; // Posição Y base para a flutuação
        this.floatAmplitude = 5; // Altura máxima da flutuação (em pixels)
        this.floatSpeed = 0.003; // Velocidade da flutuação

        // --- PLASMA/AURA (MODIFICADO PARA EFEITO IRREGULAR/NÉVOA) ---
        this.auraReady = true; 
        this.auraRotation = 0;          // rotação do plasma
        this.auraRotationSpeed = 2;     // velocidade de rotação
        this.auraScale = 1.25;          // tamanho relativo
        this.auraOpacity = 0.6;         // transparência
        this.auraPulseSpeed = 0.005;    // velocidade do efeito pulsante
        this.waveSpeed = 0.0005;        // Velocidade da onda de irregularidade

        // Cor inicial do plasma (Fase 1: Roxo/Magenta)
        this.auraColor = "rgba(255, 0, 255, 1.0)"; // Magenta/Roxo claro inicial
    }

    update(deltaTime) {
        const t = deltaTime / 1000;

        // Entrada do boss
        if (!this.introDone) {
            this.y += this.speed * t;
            if (this.y >= this.targetY) {
                this.introDone = true;
                this.baseY = this.y; // Define a posição Y final como base para a flutuação
            }
            return;
        }

        // --- MOVIMENTO VERTICAL SUAVE (FLUTUAÇÃO) ---
        this.y = this.baseY + Math.sin(Date.now() * this.floatSpeed) * this.floatAmplitude;

        // Movimento em zig-zag
        this.x += Math.sin(Date.now() * 0.001) * 1.8;

        // Rotação do boss
        this.rotation += this.rotationSpeed * (deltaTime / 16.67);

        // Rotação da aura
        this.auraRotation += this.auraRotationSpeed * (deltaTime / 16.67);

        // Atualização de fase conforme vida
        const hpPercent = this.currentHealth / this.maxHealth;
        if (hpPercent < 0.70 && this.phase === 1) { this.phase = 2; this.weaponCooldown = 700; }
        if (hpPercent < 0.40 && this.phase === 2) { this.phase = 3; this.weaponCooldown = 500; }
        if (hpPercent < 0.15 && this.phase === 3) { this.phase = 4; this.weaponCooldown = 350; }

        this.fireTimer += deltaTime;
    }

    takeDamage(dmg) {
        this.currentHealth -= dmg;

        // Atualiza barra de vida
        const bar = document.getElementById("bossHealthBar");
        if (bar) bar.style.width = Math.max(0, this.currentHealth / this.maxHealth * 100) + "%";

        const hpPercent = this.currentHealth / this.maxHealth;

        // --- AJUSTE DE ROTAÇÃO E COR DO PLASMA CONFORME A VIDA (NOVA PALETA) ---
        if (hpPercent > 0.50) { 
            this.rotationSpeed = 0; 
            this.auraRotationSpeed = 2; 
            // 1. Roxo/Magenta Claro (Alta vida)
            this.auraColor = "rgba(255, 0, 255, 1.0)"; 
        }
        else if (hpPercent > 0.30) { 
            this.rotationSpeed = 1.0; 
            this.auraRotationSpeed = 3; 
            // 2. Roxo Escuro/Índigo (Vida média/Fase 2)
            this.auraColor = "rgba(75, 0, 130, 1.0)"; 
        }
        else if (hpPercent > 0.15) { 
            this.rotationSpeed = 3.0; 
            this.auraRotationSpeed = 4.5; 
            // 3. Roxo Avermelhado/Magenta Escuro (Baixa vida/Fase 3)
            this.auraColor = "rgba(180, 0, 180, 1.0)"; 
        }
        else { 
            this.rotationSpeed = 6.0; 
            this.auraRotationSpeed = 7; 
            // 4. Vermelho Puro (Perigo/Crítico/Fase 4)
            this.auraColor = "rgba(255, 0, 0, 1.0)"; 
        }

        // Verifica morte
        if (this.currentHealth <= 0) {
            this.isAlive = false;
            bossDefeated = true;
            const barContainer = document.getElementById("bossHealthBarContainer");
            if (barContainer) barContainer.style.display = "none";
            endGame();
        }
    }

    fire(projectiles) {
        if (this.fireTimer < this.weaponCooldown) return;
        this.fireTimer = 0;

        switch (this.phase) {
            case 1: this.shootSingle(projectiles); break;
            case 2: this.shootTriple(projectiles); break;
            case 3: this.shootSpray(projectiles); break;
            case 4: this.shoot360(projectiles); break;
        }
    }

    // --- Tiros ---
    shootSingle(arr) {
        arr.push(new Projectile(this.x + this.width/2 - 15, this.y + this.height, 35, 35,
            "../assets/img/projectile/tiro-roxo.png",  350, 25, "enemy", 0));
    }

    shootTriple(arr) {
        const cx = this.x + this.width / 2;
        const cy = this.y + this.height;
        arr.push(new Projectile(cx, cy, 35, 35, "../assets/img/projectile/tiro-roxo.png", 360, 25, "enemy", 0));
        arr.push(new Projectile(cx - 50, cy, 35, 35, "../assets/img/projectile/tiro-roxo.png", 360, 25, "enemy", -0.15));
        arr.push(new Projectile(cx + 50, cy, 35, 35, "../assets/img/projectile/tiro-roxo.png", 360, 25, "enemy", 0.15));
    }

    shootSpray(arr) {
        const cx = this.x + this.width / 2;
        const cy = this.y + this.height;
        for (let i = -3; i <= 3; i++) {
            arr.push(new Projectile(cx, cy, 28, 28, "../assets/img/projectile/tiro-azul-baixo.png", 400, 20, "enemy", i*0.1));
        }
    }

    shoot360(arr) {
        const cx = this.x + this.width / 2;
        const cy = this.y + this.height / 2;
        const shots = 18;
        const step = (Math.PI * 2) / shots;
        for (let i = 0; i < shots; i++) {
            arr.push(new Projectile(cx, cy, 30, 30, "../assets/img/projectile/tiro-espinho-vermelho.png", 420, 20, "enemy", step*i, true));
        }
    }

    draw(ctx) {
        if (!this.isReady) return;

        const cx = this.x + this.width / 2;
        const cy = this.y + this.height / 2;

        // --- PLASMA/AURA giratório, pulsante e esfumaçado ---
        if (this.auraReady) {
            ctx.save();
            ctx.translate(cx, cy);

            // Rotação do plasma
            ctx.rotate(this.auraRotation * Math.PI / 180);

            // Pulsação suave (raio varia com o tempo)
            const pulse = Math.sin(Date.now() * this.auraPulseSpeed) * 0.05;
            const baseRadius = (Math.max(this.width, this.height) / 2) * (this.auraScale + pulse);
            
            // 1. Configuração do Brilho
            ctx.globalCompositeOperation = 'lighter'; 
            ctx.globalAlpha = this.auraOpacity; 
            
            // 2. Desenho de Múltiplas Camadas (para criar a irregularidade/névoa)
            const numLayers = 3;
            const now = Date.now();

            for (let i = 0; i < numLayers; i++) {
                ctx.save();
                
                const layerRadius = baseRadius * (1 + i * 0.1); 
                
                // Rotacionar cada camada em velocidades diferentes (cria o movimento nebuloso)
                ctx.rotate(i * 10 * Math.PI / 180); 
                
                // Deslocamento para simular irregularidade (usando seno)
                const offsetX = Math.sin(now * this.waveSpeed + i * 1) * 3;
                const offsetY = Math.cos(now * this.waveSpeed + i * 1) * 3;

                // Configurar Shadow Blur para o efeito esfumaçado
                ctx.shadowColor = this.auraColor;
                ctx.shadowBlur = layerRadius * 0.4; 

                ctx.beginPath();
                
                // Gradiente radial para a transição suave de opacidade (efeito esfumaçado)
                const gradient = ctx.createRadialGradient(offsetX, offsetY, 0, offsetX, offsetY, layerRadius);
                gradient.addColorStop(0, this.auraColor.replace('1.0', '0.7')); 
                gradient.addColorStop(0.7, this.auraColor.replace('1.0', '0.2')); 
                gradient.addColorStop(1, this.auraColor.replace('1.0', '0.0')); 
                
                ctx.fillStyle = gradient;
                ctx.arc(offsetX, offsetY, layerRadius, 0, Math.PI * 2);
                ctx.fill();

                ctx.restore();
            }
            
            // Resetar sombra e alpha para o BOSS
            ctx.shadowBlur = 0; 
            ctx.globalAlpha = 1.0;

            ctx.restore();
            ctx.globalCompositeOperation = 'source-over'; // Retorna ao modo normal de composição
        }

        // --- BOSS ---
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(this.rotation * Math.PI / 180);
        ctx.drawImage(this.img, -this.width/2, -this.height/2, this.width, this.height);
        ctx.restore();
    }
}