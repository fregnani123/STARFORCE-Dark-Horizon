// Arquivo: script/Player.js (FINAL - MOVIMENTO REFINADO E PERSPECTIVA 3D MELHORADA)

class Player extends GameObject {
    constructor(x, y, width, height, imagePath, maxHealth = 100) {
        super(x, y, width, height, imagePath);
        this.speed = 250; 
        this.dx = 0; 
        this.dy = 0; 
        this.projectiles = []; 
        this.fireRate = 200; 
        this.fireTimer = 0; 
        
        this.maxHealth = maxHealth;
        this.health = maxHealth;
        this.isAlive = true;

        // Propriedades para Inclinação (Roll e Pitch)
        this.wingRotationX = 0; // Inclinação Lateral (Roll: -1 a 1)
        this.wingRotationY = 0; // Inclinação Vertical (Pitch: -1 a 1)
        this.rollSpeed = 5; // Velocidade de transição para o roll (lateral)
        this.pitchSpeed = 5; // Velocidade de transição para o pitch (vertical)
        this.maxRollEffect = 1.0; // Intensidade máxima do efeito de roll visual e de arrasto
        this.maxPitchEffect = 0.5; // Intensidade máxima do efeito de pitch visual e de arrasto

        // Fatores de Arrasto e Deslocamento
        this.lateralDrag = 0.8; // Quão a nave "escorrega" lateralmente ao inclinar
        this.verticalDrag = 0.6; // Quão a nave "cai" ao inclinar
        this.movementDampeningX = 1; // Reduz a velocidade de movimento horizontal
        this.movementDampeningY = 1.0; // Mantém a velocidade de movimento vertical (ou ajuste para reduzir)

        // 🚨 NOVOS FATORES para o efeito de PERSPECTIVA 3D NO DRAW
        this.perspectiveSkewX = 0.5; // Distorção horizontal para o efeito de profundidade (quanto maior, mais "torcido")
        this.perspectiveScaleY = 0.2; // Redução de altura para o efeito de profundidade (quanto maior, mais "achatado")
        this.perspectiveRotateZ = 20; // Rotação real (em graus) da nave no eixo Z, além do skew
    }

    move(dx, dy) {
        this.dx = dx;
        this.dy = dy;
    }

    takeDamage(damage) {
        this.health -= damage;
        if (this.health <= 0) {
            this.isAlive = false;
        }
    }

    fire() {
        if (this.fireTimer < this.fireRate || !this.isAlive) return;

        const newProjectile = new Projectile(
            this.x + this.width / 2 - 10, 
            this.y, 
            20, 40, 
            "../assets/img/tiro.png", 
            600, 
            15,
            'player'
        );
        this.projectiles.push(newProjectile);

        this.fireTimer = 0; 
    }
    
    update(deltaTime) {
        this.fireTimer += deltaTime; 
        const baseMovement = this.speed * deltaTime / 1000;
        
        // --- 1. Movimento e Normalização Diagonal ---
        let finalDx = this.dx;
        let finalDy = this.dy;

        if (this.dx !== 0 && this.dy !== 0) {
            const factor = 1 / Math.sqrt(2);
            finalDx *= factor;
            finalDy *= factor;
        }
        
        // Aplica o dampening de movimento
        this.x += finalDx * baseMovement * this.movementDampeningX; 
        this.y += finalDy * baseMovement * this.movementDampeningY; 

        // --- 2. LÓGICA DE INCLINAÇÃO (ROLL E PITCH) ---
        
        // A. Inclinação Lateral (Roll)
        const targetRoll = this.dx * this.maxRollEffect; // dx controla a intensidade do roll
        this.wingRotationX += (targetRoll - this.wingRotationX) * this.rollSpeed * deltaTime / 1000;
        this.wingRotationX = Math.max(-1, Math.min(1, this.wingRotationX));

        // B. Inclinação Vertical (Pitch)
        const targetPitch = -this.dy * this.maxPitchEffect; // dy controla a intensidade do pitch (negativo para subir/inclinar pra trás)
        this.wingRotationY += (targetPitch - this.wingRotationY) * this.pitchSpeed * deltaTime / 1000;
        this.wingRotationY = Math.max(-1, Math.min(1, this.wingRotationY));


        // --- 3. LÓGICA DE ARRSTO/INÉRCIA (EFEITO REALISTA) ---
        
        // Arrasto Vertical (Baixar / Lentada devido ao ROLL/PITCH)
        // A nave "cai" um pouco ao inclinar lateralmente ou ao levantar o nariz
        const dragDownMovement = (Math.abs(this.wingRotationX) * this.verticalDrag + Math.abs(this.wingRotationY) * 0.2) * deltaTime / 1000;
        this.y += dragDownMovement; 
        
        // Arrasto Horizontal (Deslizar devido ao ROLL)
        // A nave "escorrega" lateralmente na direção do roll
        const dragSideMovement = this.wingRotationX * this.lateralDrag * deltaTime / 1000;
        this.x += dragSideMovement; 
        

        // --- 4. Limite da Tela e Limite Superior ---
        const CANVAS_WIDTH = 500;
        const CANVAS_HEIGHT = 650;
        const TOP_LIMIT = CANVAS_HEIGHT / 2; 

        this.x = Math.max(0, Math.min(this.x, CANVAS_WIDTH - this.width));
        this.y = Math.max(TOP_LIMIT, Math.min(this.y, CANVAS_HEIGHT - this.height)); 
        
        // --- ATUALIZAÇÃO DE PROJÉTEIS ---
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            this.projectiles[i].update(deltaTime);
            // Pequeno efeito no tiro com o pitch da nave
            this.projectiles[i].y += this.wingRotationY * 0.1; 
            if (!this.projectiles[i].isAlive) {
                this.projectiles.splice(i, 1);
            }
        }
    }

    // 🚨 MÉTODO DRAW ATUALIZADO PARA PERSPECTIVA 3D E ROTAÇÃO MAIS NATURAL
    draw(ctx) {
        if (!this.img.complete || !this.isAlive) return;

        ctx.save();

        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        
        ctx.translate(centerX, centerY);

        // --- 1. Efeito de PITCH (Nariz para cima/baixo) ---
        // Achatamento vertical para simular a nave subindo/descendo
        const pitchScaleY = 1 - (Math.abs(this.wingRotationY) * this.perspectiveScaleY); 
        ctx.scale(1, pitchScaleY); // Aplica o achatamento no eixo Y

        // --- 2. Efeito de PERSPECTIVA 3D para o ROLL (asa menor/maior) ---
        // Combinamos skew (distorção) com uma rotação real no eixo Z.
        
        // O skew faz a asa de um lado parecer mais "esticada" e a outra mais "encolhida".
        const skewAmountX = this.wingRotationX * this.perspectiveSkewX; 
        // A rotação real no eixo Z inclina a nave, reforçando o efeito visual.
        const rollAngleInRadians = this.wingRotationX * this.perspectiveRotateZ * (Math.PI / 180); 
        
        // Aplica as transformações em ordem:
        // CUIDADO: ctx.transform() é acumulativo. Se tiver problemas, use ctx.setTransform() ou teste a ordem.
        // Ordem: Rotação Z -> Skew X
        
        // Primeiro, a rotação real da nave
        ctx.rotate(rollAngleInRadians);
        
        // Em seguida, a distorção (skew) para a perspectiva
        ctx.transform(1, 0, skewAmountX, 1, 0, 0); // Parametros: m11, m12, m21, m22, dx, dy

        // 3. Desenha a imagem centralizada
        ctx.drawImage(this.img, 
            -this.width / 2, 
            -this.height / 2, 
            this.width, 
            this.height
        );

        ctx.restore();
    }
}