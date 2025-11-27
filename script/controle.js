// Arquivo: script/controle.js (CORRIGIDO)

// Mapeamento de códigos de teclas (Suporta maiúsculas e minúsculas)
const KEY_MAP = {
    // 🚨 NOVO: Mapeamento WASD
    'w': 'up', 'a': 'left', 's': 'down', 'd': 'right',
    'W': 'up', 'A': 'left', 'S': 'down', 'D': 'right',
    
    // Mapeamento das setas (existente)
    'ArrowUp': 'up', 'ArrowDown': 'down',
    'ArrowLeft': 'left', 'ArrowRight': 'right',
    
    // Mapeamento de ações (existente)
    'z': 'bomb', 'x': 'shoot', 
    'Z': 'bomb', 'X': 'shoot'
};

const keys = {
    up: false, down: false, left: false, right: false,
    bomb: false, shoot: false
};

// --- FUNÇÃO CHAMADA PELO gameLoop ---
function updatePlayerMovement() {
    if (!playerShip) return; 
    
    let dx = 0;
    let dy = 0;

    // Movimento
    if (keys.left) { dx = -1; } else if (keys.right) { dx = 1; }
    if (keys.up) { dy = -1; } else if (keys.down) { dy = 1; }

    playerShip.move(dx, dy);
    
    // Ação
    if (keys.shoot) { 
        playerShip.fire();
    }
    // if (keys.bomb) { playerShip.useBomb(); }
}


// --- EVENT LISTENERS (Não precisam de alteração, pois a lógica de e.key.toLowerCase() já suporta) ---
window.addEventListener('keydown', (e) => {
    // Busca a tecla pelo nome exato ou sua versão minúscula
    const keyName = KEY_MAP[e.key] || KEY_MAP[e.key.toLowerCase()];
    
    if (keyName && (keyName === 'up' || keyName === 'down' || keyName === 'left' || keyName === 'right')) {
        e.preventDefault(); 
    }

    if (keyName && keys[keyName] !== undefined) {
        keys[keyName] = true;
    }
});

window.addEventListener('keyup', (e) => {
    const keyName = KEY_MAP[e.key] || KEY_MAP[e.key.toLowerCase()];

    if (keyName && keys[keyName] !== undefined) {
        keys[keyName] = false;
    }
});