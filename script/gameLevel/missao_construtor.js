// ======================================================
// CONFIGURAÇÕES GLOBAIS DE NÍVEL (EXPORTADAS)
// ======================================================

export const CONFIG = {
    nodes: 15
};

// Array com os caminhos das 15 imagens dos nodes
export const NODE_IMAGES = [
    '../assets/img/cenario-start/planeta_terra.png', 
    '../assets/img/cenario-start/planeta_terra.png', 
    '../assets/img/cenario-start/planeta_terra.png', 
    '../assets/img/cenario-start/planeta_terra.png', 
    '../assets/img/cenario-start/planeta_terra.png', 
    '../assets/img/cenario-start/planeta_terra.png', 
    '../assets/img/cenario-start/planeta_terra.png', 
    '../assets/img/cenario-start/planeta_terra.png', 
    '../assets/img/cenario-start/planeta_terra.png', 
    '../assets/img/cenario-start/planeta_terra.png', 
    '../assets/img/cenario-start/planeta_terra.png', 
    '../assets/img/cenario-start/planeta_terra.png', 
    '../assets/img/cenario-start/planeta_terra.png', 
    '../assets/img/cenario-start/planeta_terra.png', 
    '../assets/img/cenario-start/planeta_terra.png', 
];

// Nomes das fases em MAIÚSCULO
export const NOME_FASES = [
    'INVASÃO', 
    'ÁREA 51', 
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

export const MISSIONS = [
    // NOTA: Os caminhos de imagem e áudio foram mantidos, assumindo que são corretos.

    { id: 1, name: NOME_FASES[0], bg: "../assets/img/cenarios/cenario-missao-1/cenario-1.png", layers: ["../assets/img/cenarios/cenario-missao-1/cenario-1.png"], music: "../../assets/audio/epic-trailer-music-349631.mp3", scrollSpeed: 100, enemyConfig: { spawnRate: 1.0, difficulty: 1 } },

    { id: 2, name: NOME_FASES[1], bg: "../../assets/img/cenarios/cenario-missao-1/2 (2).png", layers: ["../../assets/img/cenarios/cenario-missao-1/2 (2).png"], music: "../assets/audio/Ultra-Lag-chosic.com_.mp3", scrollSpeed: 100, enemyConfig: { spawnRate: 1.0, difficulty: 1 } },

    { id: 3, name: NOME_FASES[2], bg: "../assets/img/cenarios/cenario-missao-1/cenario-1.png", layers: ["../assets/img/cenarios/cenario-missao-1/cenario-1.png"], music: "../assets/audio/Ultra-Lag-chosic.com_.mp3", scrollSpeed: 100, enemyConfig: { spawnRate: 1.0, difficulty: 1 } },

    { id: 4, name: NOME_FASES[3], bg: "../assets/img/cenarios/cenario-missao-1/cenario-1.png", layers: ["../assets/img/cenarios/cenario-missao-1/cenario-1.png"], music: "../assets/audio/Ultra-Lag-chosic.com_.mp3", scrollSpeed: 100, enemyConfig: { spawnRate: 1.0, difficulty: 1 } },

    { id: 5, name: NOME_FASES[4], bg: "../assets/img/cenarios/cenario-missao-1/cenario-1.png", layers: ["../assets/img/cenarios/cenario-missao-1/cenario-1.png"], music: "../assets/audio/Ultra-Lag-chosic.com_.mp3", scrollSpeed: 100, enemyConfig: { spawnRate: 1.0, difficulty: 1 } },

    { id: 6, name: NOME_FASES[5], bg: "../assets/img/cenarios/cenario-missao-1/cenario-1.png", layers: ["../assets/img/cenarios/cenario-missao-1/cenario-1.png"], music: "../assets/audio/Ultra-Lag-chosic.com_.mp3", scrollSpeed: 100, enemyConfig: { spawnRate: 1.0, difficulty: 1 } },

    { id: 7, name: NOME_FASES[6], bg: "../assets/img/cenarios/cenario-missao-1/cenario-1.png", layers: ["../assets/img/cenarios/cenario-missao-1/cenario-1.png"], music: "../assets/audio/Ultra-Lag-chosic.com_.mp3", scrollSpeed: 100, enemyConfig: { spawnRate: 1.0, difficulty: 1 } },

    { id: 8, name: NOME_FASES[7], bg: "../assets/img/cenarios/cenario-missao-1/cenario-1.png", layers: ["../assets/img/cenarios/cenario-missao-1/cenario-1.png"], music: "../assets/audio/Ultra-Lag-chosic.com_.mp3", scrollSpeed: 100, enemyConfig: { spawnRate: 1.0, difficulty: 1 } },

    { id: 9, name: NOME_FASES[8], bg: "../assets/img/cenarios/cenario-missao-1/cenario-1.png", layers: ["../assets/img/cenarios/cenario-missao-1/cenario-1.png"], music: "../assets/audio/Ultra-Lag-chosic.com_.mp3", scrollSpeed: 100, enemyConfig: { spawnRate: 1.0, difficulty: 1 } },

    { id: 10, name: NOME_FASES[9], bg: "../assets/img/cenarios/cenario-missao-1/cenario-1.png", layers: ["../assets/img/cenarios/cenario-missao-1/cenario-1.png"], music: "../assets/audio/Ultra-Lag-chosic.com_.mp3", scrollSpeed: 100, enemyConfig: { spawnRate: 1.0, difficulty: 1 } },

    { id: 11, name: NOME_FASES[10], bg: "../assets/img/cenarios/cenario-missao-1/cenario-1.png", layers: ["../assets/img/cenarios/cenario-missao-1/cenario-1.png"], music: "../assets/audio/Ultra-Lag-chosic.com_.mp3", scrollSpeed: 100, enemyConfig: { spawnRate: 1.0, difficulty: 1 } },

    { id: 12, name: NOME_FASES[11], bg: "../assets/img/cenarios/cenario-missao-1/cenario-1.png", layers: ["../assets/img/cenarios/cenario-missao-1/cenario-1.png"], music: "../assets/audio/Ultra-Lag-chosic.com_.mp3", scrollSpeed: 100, enemyConfig: { spawnRate: 1.0, difficulty: 1 } },

    { id: 13, name: NOME_FASES[12], bg: "../assets/img/cenarios/cenario-missao-1/cenario-1.png", layers: ["../assets/img/cenarios/cenario-missao-1/cenario-1.png"], music: "../assets/audio/Ultra-Lag-chosic.com_.mp3", scrollSpeed: 100, enemyConfig: { spawnRate: 1.0, difficulty: 1 } },

    { id: 14, name: NOME_FASES[13], bg: "../assets/img/cenarios/cenario-missao-1/cenario-1.png", layers: ["../assets/img/cenarios/cenario-missao-1/cenario-1.png"], music: "../assets/audio/Ultra-Lag-chosic.com_.mp3", scrollSpeed: 100, enemyConfig: { spawnRate: 1.0, difficulty: 1 } },

    { id: 15, name: NOME_FASES[14], bg: "../assets/img/cenarios/cenario-missao-1/cenario-1.png", layers: ["../assets/img/cenarios/cenario-missao-1/cenario-1.png"], music: "../assets/audio/Ultra-Lag-chosic.com_.mp3", scrollSpeed: 100, enemyConfig: { spawnRate: 1.0, difficulty: 1 } },

];