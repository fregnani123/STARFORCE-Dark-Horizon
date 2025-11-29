// Arquivo: script/Projectile.js

class Projectile extends GameObject {
    constructor(
        x, y,
        width, height,
        imagePath,
        speed,
        damage,
        owner = "player",
        angle = 0,
        useAbsoluteAngle = false,
        onExplode = null
    ) {
        super(x, y, width, height, imagePath);

        this.speed = speed;
        this.damage = damage;
        this.owner = owner;
        this.isAlive = true;

        // callback para explosão (nível 4)
        this.onExplode = onExplode;

        // ângulo do tiro
        if (useAbsoluteAngle) {
            this.angle = angle;  // usado na explosão 360°
        } else {
            const baseAngle = owner === "player" ? -Math.PI / 2 : Math.PI / 2;
            this.angle = baseAngle + angle;
        }

        // explosivo
        this.isExplosive = false;
        this.explodeAfter = 0;
        this.timer = 0;
    }

    update(deltaTime) {

        // explosivo → conta tempo
        if (this.isExplosive) {
            this.timer += deltaTime;
            if (this.timer >= this.explodeAfter) {
                this.explode();
                return; // cancela movimento depois da explosão
            }
        }

        // mover usando sen/cos
        const vx = Math.cos(this.angle) * this.speed;
        const vy = Math.sin(this.angle) * this.speed;

        this.x += vx * (deltaTime / 1000);
        this.y += vy * (deltaTime / 1000);

        // remover só quando REALMENTE sair da tela
        if (
            this.x < -50 ||
            this.x > 850 ||
            this.y < -50 ||
            this.y > 850
        ) {
            this.isAlive = false;
        }
    }

    // explosão do nível 4 - gera 8 tiros em 360°
    explode() {
        this.isAlive = false;

        if (!this.onExplode) return;

        const total = 8;
        const step = (Math.PI * 2) / total;

        for (let i = 0; i < total; i++) {
            const ang = step * i;

            this.onExplode(new Projectile(
                this.x,
                this.y,
                this.width,
                this.height,
                this.imagePath,
                this.speed * 1.2,
                this.damage,
                "enemy",
                ang,
                true
            ));
        }
    }
}
