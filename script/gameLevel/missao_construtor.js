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
    'ARANHA MECÂNICA',
    'FLORESTA',
    'ALTO-MAR',
    'POLO NORTE',
    'VISTA DA TERRA',
    'SEM NOME',
    'SEM NOME',
    'SEM NOME',
    'SEM NOME',
    'SEM NOME',
    'SEM NOME',
    'SEM NOME',
    'SEM NOME',
    'SEM NOME',
];

const NOME_FASES_EN = [
    'AREA 51',
    'INVASION',
    'RED MARS',
    'CHAOTIC JUPITER',
    'SATURN RINGS',
    'FROZEN URANUS',
    'BLUE NEPTUNE',
    'ASTEROID BELT',
    'NEBULA',
    'BLACK HOLE',
    'SPACE STATION',
    'TRAVELER COMET',
    'ANDROMEDA GALAXY',
    'PLANET X',
    'INFINITE UNIVERSE',
];

const NOME_FASES_ES = [
    'AREA 51',
    'INVASION',
    'MARTE ROJO',
    'JUPITER CAOTICO',
    'ANILLOS DE SATURNO',
    'URANO HELADO',
    'NEPTUNO AZUL',
    'CINTURON DE ASTEROIDES',
    'NEBULOSA',
    'AGUJERO NEGRO',
    'ESTACION ESPACIAL',
    'COMETA VIAJERO',
    'GALAXIA ANDROMEDA',
    'PLANETA X',
    'UNIVERSO INFINITO',
];

function normalizeUiLanguage(lang) {
    if (!lang) return 'pt-BR';
    if (lang.toLowerCase().startsWith('pt')) return 'pt-BR';
    if (lang.toLowerCase().startsWith('es')) return 'es';
    return 'en';
}

export function getMissionNamesByLanguage(lang) {
    const key = normalizeUiLanguage(lang);
    if (key === 'en') return NOME_FASES_EN;
    if (key === 'es') return NOME_FASES_ES;
    return NOME_FASES;
}

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
        id: 0,
        name: 'ABERTURA LUNAR',
        layers: [
            { path: "../assets/img/cenarios/cenario-missao/inicio-game/background-solo-lua.png", factor: 0.12 },
        ],
        openingShipImage: "../assets/img/cenarios/cenario-missao/inicio-game/nave-lua.png",
        music: "../assets/audio/music-lua.mp3",
        scrollSpeed: 120,
        bossScoreTrigger: 999999,
        enemyConfig: { spawnRate: 0.8, difficulty: 1 },
        openingScene: true,
        allowShoot: false,
    },

    {
        id: 1,
        name: NOME_FASES[1],
        layers: [
            { path: "../assets/img/cenarios/cenario-missao/missao-1/nivel-1.png", factor: 0.20 },
        ],
        music: "../assets/audio/musicaGameUS.mp3",
        scrollSpeed: 450,
        bossScoreTrigger: 2000,
        enemyConfig: { spawnRate: 1.2, difficulty: 1 }
    },

    {
        id: 2,
        name: NOME_FASES[2],
        layers: [{ path: "../assets/img/cenarios/cenario-missao/missao-2/nivel-2.png", factor: 0.1 }],
        music: "../assets/audio/musicaGameUS.mp3",
        scrollSpeed: 450,
        enemyConfig: { spawnRate: 1.1, difficulty: 2 }
    },
    {
        id: 3,
        name: NOME_FASES[3],
        layers: [{ path: "../assets/img/cenarios/cenario-missao/missao-3/nivel-3.png", factor: 0.1 }],
        music: "../assets/audio/musicaGameUS.mp3",
        scrollSpeed: 450,
        enemyConfig: { spawnRate: 1.1, difficulty: 3 }
    },

    {
        id: 4,
        name: NOME_FASES[4],
        layers: [{ path: "../assets/img/cenarios/cenario-missao/missao-4/nivel-4.png", factor: 0.2 }],
        music: "../assets/audio/musicaGameUS.mp3",
        scrollSpeed: 450,
        bossScoreTrigger: 2500,
        enemyConfig: { spawnRate: 1.5, difficulty: 2 }
    },
    {
        id: 5,
        name: NOME_FASES[5],
        layers: [{ path: "../assets/img/cenarios/cenario-missao/missao-5/nivel-5.png", factor: 0.1 }],
        music: "../assets/audio/musicaGameUS.mp3",
        scrollSpeed: 450,
        enemyConfig: { spawnRate: 1.0, difficulty: 2 }
    },


    {
        id: 6,
        name: NOME_FASES[6],
        layers: [
            // Fundo em loop (terra ao longe)
            {
                path: "../assets/img/cenarios/cenario-missao/missao-6/nivel-6.png",
                factor: 0.02
            },
            { path: "../assets/img/cenarios/cenario-missao/missao-6/lua-escura.png", factor: 0.09, oneShot: true, startY: -1, scale: 0.15, x: 0.3 },
            { path: "../assets/img/cenarios/cenario-missao/missao-6/terra.png", factor: 0.05, oneShot: true },
            { path: "../assets/img/cenarios/cenario-missao/missao-6/nave-mae-horizonte.png", factor: 0.20, oneShot: true, startY: 0.1 },

        ],
        music: "../assets/audio/musicaGameUS.mp3",
        scrollSpeed: 100,
        bossScoreTrigger: 3000,
        enemyConfig: { spawnRate: 3.0, difficulty: 2 }
    },

    {
        id: 7,
        name: NOME_FASES[7],
        layers: [{ path: "../assets/img/cenarios/cenario-missao/missao-7/nivel-7.png", factor: 0.1 }],
        music: "../assets/audio/musicaGameUS.mp3",
        scrollSpeed: 100,
        enemyConfig: { spawnRate: 1.2, difficulty: 3 }
    },
    {
        id: 8,
        name: NOME_FASES[8],
        layers: [{ path: "../assets/img/cenarios/cenario-missao/missao-8/nivel-8.png", factor: 0.1 }],
        music: "../assets/audio/musicaGameUS.mp3",
        scrollSpeed: 100,
        enemyConfig: { spawnRate: 1.3, difficulty: 3 }
    },
    {
        id: 9,
        name: NOME_FASES[9],
        layers: [{ path: "../assets/img/cenarios/cenario-missao/missao-9/nivel-9.png", factor: 0.1 }],
        music: "../assets/audio/musicaGameUS.mp3",
        scrollSpeed: 150,
        enemyConfig: { spawnRate: 1.3, difficulty: 4 }
    },
    {
        id: 10,
        name: NOME_FASES[10],
        layers: [{ path: "../assets/img/cenarios/cenario-missao/missao-10/nivel-10.png", factor: 0.1 }],
        music: "../assets/audio/musicaGameUS.mp3",
        scrollSpeed: 200,
        enemyConfig: { spawnRate: 1.4, difficulty: 4 }
    },
    {
        id: 11,
        name: NOME_FASES[11],
        layers: [{ path: "../assets/img/cenarios/cenario-missao/missao-11/nivel-11.png", factor: 0.1 }],
        music: "../assets/audio/musicaGameUS.mp3",
        scrollSpeed: 100,
        enemyConfig: { spawnRate: 1.5, difficulty: 5 }
    },
    {
        id: 12,
        name: NOME_FASES[12],
        layers: [{ path: "../assets/img/cenarios/cenario-missao/missao-12/nivel-12.png", factor: 0.1 }],
        music: "../assets/audio/musicaGameUS.mp3",
        scrollSpeed: 100,
        enemyConfig: { spawnRate: 1.5, difficulty: 5 }
    },
    {
        id: 13,
        name: NOME_FASES[13],
        layers: [{ path: "../assets/img/cenarios/cenario-missao/missao-13/nivel-13.png", factor: 0.1 }],
        music: "../assets/audio/musicaGameUS.mp3",
        scrollSpeed: 100,
        enemyConfig: { spawnRate: 1.6, difficulty: 6 }
    },
    {
        id: 14,
        name: NOME_FASES[14],
        layers: [{ path: "../assets/img/cenarios/cenario-missao/missao-14/nivel-14.png", factor: 0.1 }],
        music: "../assets/audio/musicaGameUS.mp3",
        scrollSpeed: 100,
        enemyConfig: { spawnRate: 1.7, difficulty: 7 }
    },
    {
        id: 15,
        name: NOME_FASES[15],
        layers: [{ path: "../assets/img/cenarios/cenario-missao/missao-15/nivel-15.png", factor: 0.1 }],
        music: "../assets/audio/musicaGameUS.mp3",
        scrollSpeed: 100,
        enemyConfig: { spawnRate: 2.0, difficulty: 10 }
    },
];