// ======================================================
// IMPORTS OBRIGATÓRIOS
// ======================================================
import { Pickup } from './pickup.js'; // Importa a classe Pickup
import { 
    CANVAS_WIDTH,
    HEALTH_PICKUP_IMAGE, 
    HEALTH_PICKUP_VALUE,
    pickups, // Array global de pickups (exportado como const ou let em globals.js)
    // Assumindo que Enemy não é necessário aqui, mas é passado como argumento.
} from './globals.js'; 


// ----------------------------------------------------
// ✨ FUNÇÃO PARA SPAWN DO ITEM DE VIDA (EXPORTADA)
// ----------------------------------------------------
export function spawnHealthPickup() {
    // Spawn em uma posição X aleatória no topo
    const width = 40;
    const height = 40;
    // Usa CANVAS_WIDTH importado
    const spawnX = Math.random() * (CANVAS_WIDTH - width); 
    const spawnY = -height; 

    // Cria e adiciona o item ao array (Usando Pickup, HEALTH_PICKUP_IMAGE, HEALTH_PICKUP_VALUE importados)
    pickups.push(new Pickup(
        spawnX, spawnY,
        width, height,
        HEALTH_PICKUP_IMAGE,
        { type: 'health', value: HEALTH_PICKUP_VALUE }
    ));

    console.log("Item de Vida Spawnado!");
}


// ----------------------------------------------------
// ✨ FUNÇÃO PARA SPAWN DAS ESTRELAS (EXPORTADA)
// ----------------------------------------------------
export function spawnStarPickups(enemy) {
    // Evita que o mesmo inimigo gere estrelas múltiplas vezes (propriedade interna da instância)
    if (enemy._starDropped) return;
    enemy._starDropped = true;

    const maxStars = 3; 
    const starsToSpawn = Math.floor(Math.random() * maxStars) + 1;

    const spacing = 45;

    // Posição inicial (centro do inimigo)
    const startX = enemy.x + enemy.width / 2;
    const startY = enemy.y + enemy.height / 2;

    for (let i = 0; i < starsToSpawn; i++) {

        // Probabilidades de cada estrela
        const r = Math.random();
        let img = "../assets/img/pickup/estrela-marela.png";
        let value = 1;
        let size = 32;

        if (r > 0.95) { 
            // 5% vermelha
            img = "../assets/img/pickup/estrela-vermelha.png";
            value = 20;
            size = 48;
        }
        else if (r > 0.85) { 
            // 10% azul
            img = "../assets/img/pickup/estrela-azul.png";
            value = 10;
            size = 42;
        }
        else if (r > 0.55) {
            // 30% verde
            img = "../assets/img/pickup/estrela-verde.png";
            value = 3;
            size = 36;
        }

        // Calcula posição horizontal espaçada
        const x = startX - ((starsToSpawn - 1) * spacing) / 2 + i * spacing;
        const y = startY;

        // Adiciona ao array 'pickups' importado
        pickups.push(new Pickup( 
            x,
            y,
            size,
            size,
            img,
            { type: "star", value }
        ));
    }
}