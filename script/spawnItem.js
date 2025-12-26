// ======================================================
// IMPORTS OBRIGATÓRIOS
// ======================================================
import { Pickup } from './pickup.js'; 
import { 
    CANVAS_WIDTH,
    HEALTH_PICKUP_IMAGE, 
    HEALTH_PICKUP_VALUE,
    pickups
} from './globals.js'; 

// ----------------------------------------------------
// ✨ SPAWN DE VIDA
// ----------------------------------------------------
export function spawnHealthPickup() {
    const width = 40;
    const height = 40;
    const spawnX = Math.random() * (CANVAS_WIDTH - width); 
    const spawnY = -height; 

    pickups.push(new Pickup(
        spawnX, spawnY,
        width, height,
        HEALTH_PICKUP_IMAGE,
        { type: 'health', value: HEALTH_PICKUP_VALUE }
    ));
}

// ----------------------------------------------------
// ✨ SPAWN DE ESTRELAS (CHAMADO NA MORTE DO INIMIGO)
// ----------------------------------------------------
export function spawnStarPickups(enemy) {
    if (enemy._starDropped) return;
    enemy._starDropped = true;

    const maxStars = 3; 
    const starsToSpawn = Math.floor(Math.random() * maxStars) + 1;
    const spacing = 45;

    const startX = enemy.x + enemy.width / 2;
    const startY = enemy.y + enemy.height / 2;

    for (let i = 0; i < starsToSpawn; i++) {
        const r = Math.random();
        let img = "../assets/img/pickup/estrela-marela.png";
        let value = 1;
        let size = 32;

        // Lógica de raridade das estrelas
        if (r > 0.95) { 
            img = "../assets/img/pickup/estrela-vermelha.png";
            value = 20;
            size = 48;
        }
        else if (r > 0.85) { 
            img = "../assets/img/pickup/estrela-azul.png";
            value = 10;
            size = 42;
        }
        else if (r > 0.55) {
            img = "../assets/img/pickup/estrela-verde.png";
            value = 3;
            size = 36;
        }

        const x = startX - ((starsToSpawn - 1) * spacing) / 2 + i * spacing;
        const y = startY;

        pickups.push(new Pickup( 
            x, y,
            size, size,
            img,
            { type: "star", value: value }
        ));
    }
}