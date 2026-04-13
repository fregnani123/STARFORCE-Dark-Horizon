// ======================================================
// CONFIGURAÇÕES GLOBAIS DE NÍVEL (EXPORTADAS)
// ======================================================

export const CONFIG = {
    nodes: 15
};

// Array com os caminhos das 15 imagens dos nodes (Mapa de seleção)
export const NODE_IMAGES = Array(15).fill('../assets/img/cenario-start/planeta_terra.png');

// Nomes das fases em MAIÚSCULO
export const NOME_FASES = [
    'ÁREA 51',
    'INVASÃO',
    'MARTE VERMELHO',
    'JÚPITER CAÓTICO',
    'ANÉIS DE SATURNO',
    'URANO GELADO',
    'NETUNO AZUL',
    'CINTURÃO DE ASTEROIDES',
    'NEBULOSA',
    'BURACO NEGRO',
    'ESTAÇÃO ESPACIAL',
    'COMETA VIAJANTE',
    'GALÁXIA ANDRÔMEDA',
    'PLANETA X',
    'UNIVERSO INFINITO',
];

// ======================================================
// DEFINIÇÃO DAS MISSÕES (EXPORTADA)
// ======================================================

/**
 * Cada camada (layer) agora define:
 * path: Caminho da imagem
 * factor: Multiplicador de velocidade (0.01 é quase parado, 1.0 é velocidade total)
 */

export const MISSIONS = [

    {
        id: 1,
        name: NOME_FASES[1],
        layers: [
            { path: "../assets/img/cenarios/cenario-missao/missao-1/nivel-1.png", factor: 0.20 },
        ],
        music: "../assets/audio/musicaGameUS.mp3",
        scrollSpeed: 350,
        bossScoreTrigger: 1000,
        enemyConfig: { spawnRate: 1.2, difficulty: 1 }
    },

    {
        id: 2,
        name: NOME_FASES[0],
        layers: [
            // Fundo em loop (terra ao longe)
            {
                path: "../assets/img/cenarios/cenario-missao/missao-2/nivel-2.png",
                factor: 0.02
            },                      
            { path: "../assets/img/cenarios/cenario-missao/missao-2/lua-escura.png", factor: 0.09, oneShot: true, startY: -1, scale: 0.15, x: 0.3 },
            { path: "../assets/img/cenarios/cenario-missao/missao-2/terra.png", factor: 0.05, oneShot: true },
            { path: "../assets/img/cenarios/cenario-missao/missao-2/nave-mae-horizonte.png", factor: 0.20, oneShot: true, startY: 0.1 },

        ],
        music: "../assets/audio/musicaGameUS.mp3",
        scrollSpeed: 100,
        bossScoreTrigger: 3000,
        enemyConfig: { spawnRate: 3.0, difficulty: 2 }
    },

    {
        id: 3,
        name: NOME_FASES[2],
        layers: [
            { path: "../assets/img/cenarios/marte_fundo.png", factor: 0.05 },
            { path: "../assets/img/cenarios/marte_chao.png", factor: 1.0 }     // Chao move na velocidade base
        ],
        music: "../assets/audio/Ultra-Lag-chosic.com_.mp3",
        scrollSpeed: 100,
        enemyConfig: { spawnRate: 1.0, difficulty: 2 }
    },
    {
        id: 4,
        name: NOME_FASES[3],
        layers: [{ path: "../assets/img/cenarios/cenario-missao-1/cenario-1.png", factor: 0.1 }],
        music: "../assets/audio/Ultra-Lag-chosic.com_.mp3",
        scrollSpeed: 100,
        enemyConfig: { spawnRate: 1.0, difficulty: 2 }
    },
    {
        id: 5,
        name: NOME_FASES[4],
        layers: [{ path: "../assets/img/cenarios/cenario-missao-1/cenario-1.png", factor: 0.1 }],
        music: "../assets/audio/Ultra-Lag-chosic.com_.mp3",
        scrollSpeed: 100,
        enemyConfig: { spawnRate: 1.1, difficulty: 2 }
    },
    {
        id: 6,
        name: NOME_FASES[5],
        layers: [{ path: "../assets/img/cenarios/cenario-missao-1/cenario-1.png", factor: 0.1 }],
        music: "../assets/audio/Ultra-Lag-chosic.com_.mp3",
        scrollSpeed: 100,
        enemyConfig: { spawnRate: 1.1, difficulty: 3 }
    },
    {
        id: 7,
        name: NOME_FASES[6],
        layers: [{ path: "../assets/img/cenarios/cenario-missao-1/cenario-1.png", factor: 0.1 }],
        music: "../assets/audio/Ultra-Lag-chosic.com_.mp3",
        scrollSpeed: 100,
        enemyConfig: { spawnRate: 1.2, difficulty: 3 }
    },
    {
        id: 8,
        name: NOME_FASES[7],
        layers: [{ path: "../assets/img/cenarios/cenario-missao-1/cenario-1.png", factor: 0.1 }],
        music: "../assets/audio/Ultra-Lag-chosic.com_.mp3",
        scrollSpeed: 100,
        enemyConfig: { spawnRate: 1.3, difficulty: 3 }
    },
    {
        id: 9,
        name: NOME_FASES[8],
        layers: [{ path: "../assets/img/cenarios/cenario-missao-1/cenario-1.png", factor: 0.1 }],
        music: "../assets/audio/Ultra-Lag-chosic.com_.mp3",
        scrollSpeed: 150,
        enemyConfig: { spawnRate: 1.3, difficulty: 4 }
    },
    {
        id: 10,
        name: NOME_FASES[9],
        layers: [{ path: "../assets/img/cenarios/cenario-missao-1/cenario-1.png", factor: 0.1 }],
        music: "../assets/audio/Ultra-Lag-chosic.com_.mp3",
        scrollSpeed: 200,
        enemyConfig: { spawnRate: 1.4, difficulty: 4 }
    },
    {
        id: 11,
        name: NOME_FASES[10],
        layers: [{ path: "../assets/img/cenarios/cenario-missao-1/cenario-1.png", factor: 0.1 }],
        music: "../assets/audio/Ultra-Lag-chosic.com_.mp3",
        scrollSpeed: 100,
        enemyConfig: { spawnRate: 1.5, difficulty: 5 }
    },
    {
        id: 12,
        name: NOME_FASES[11],
        layers: [{ path: "../assets/img/cenarios/cenario-missao-1/cenario-1.png", factor: 0.1 }],
        music: "../assets/audio/Ultra-Lag-chosic.com_.mp3",
        scrollSpeed: 100,
        enemyConfig: { spawnRate: 1.5, difficulty: 5 }
    },
    {
        id: 13,
        name: NOME_FASES[12],
        layers: [{ path: "../assets/img/cenarios/cenario-missao-1/cenario-1.png", factor: 0.1 }],
        music: "../assets/audio/Ultra-Lag-chosic.com_.mp3",
        scrollSpeed: 100,
        enemyConfig: { spawnRate: 1.6, difficulty: 6 }
    },
    {
        id: 14,
        name: NOME_FASES[13],
        layers: [{ path: "../assets/img/cenarios/cenario-missao-1/cenario-1.png", factor: 0.1 }],
        music: "../assets/audio/Ultra-Lag-chosic.com_.mp3",
        scrollSpeed: 100,
        enemyConfig: { spawnRate: 1.7, difficulty: 7 }
    },
    {
        id: 15,
        name: NOME_FASES[14],
        layers: [{ path: "../assets/img/cenarios/cenario-missao-1/cenario-1.png", factor: 0.1 }],
        music: "../assets/audio/Ultra-Lag-chosic.com_.mp3",
        scrollSpeed: 100,
        enemyConfig: { spawnRate: 2.0, difficulty: 10 }
    },
];