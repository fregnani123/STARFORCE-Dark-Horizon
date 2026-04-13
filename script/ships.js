// ======================================================
// DADOS DE NAVES DO JOGO
// ======================================================

export const SHIPS = [
  {
    id: 'metal',
    name: 'NAVE METAL',
    description: 'Engenho de guerra estelar projetado para dominar batalhas no espaço profundo e dentro da atmosfera planetária.',
    image: '../assets/img/nave-player/nave-metal.png',
    price: 0,        // Grátis (inicial)
    armor: 8,        // 0-10
    speed: 7,        // 0-10
    slots: 3,        // Slots de armas
    unlocked: true,  // Já começa desbloqueada
    rarity: 'COMUM'
  },
  {
    id: 'alien',
    name: 'NAVE ALIEN',
    description: 'Tecnologia extraterrestre com design aerodinâmico. Desbloqueada apenas por quem completou o jogo.',
    image: '../assets/img/nave-player/nave-alien.png',
    price: 0,
    rewardOnly: true,          // Não pode ser comprada — é brinde por completar o jogo
    armor: 6,
    speed: 9,
    slots: 2,
    unlocked: false,
    rarity: 'RARO'
  },
  {
    id: 'branca',
    name: 'NAVE BRANCA',
    description: 'Design clássico com revestimento resistente. Confiável e balanceada.',
    image: '../assets/img/nave-player/nave-branca.png',
    price: 400,      // 400 Stars
    armor: 7,
    speed: 8,
    slots: 3,
    unlocked: false,
    rarity: 'INCOMUM'
  },
  {
    id: 'fgl',
    name: 'NAVE FGL',
    description: 'Protótipo futurista com energia plasmática. Máxima potência.',
    image: '../assets/img/nave-player/nave-fgl.png',
    price: 750,      // 750 Stars
    armor: 5,
    speed: 10,
    slots: 4,
    unlocked: false,
    rarity: 'ÉPICO'
  },
  {
    id: 'hibrida',
    name: 'NAVE HÍBRIDA',
    description: 'Combina o melhor de dois mundos. Equilibrada em todos os aspectos.',
    image: '../assets/img/nave-player/nave-hibrida.png',
    price: 600,      // 600 Stars
    armor: 7,
    speed: 8,
    slots: 3,
    unlocked: false,
    rarity: 'RARO'
  },
  {
    id: 'dark',
    name: 'NAVE DARK',
    description: 'Navio de ataque especializado. Silencioso e letal. Para pilotos experientes.',
    image: '../assets/img/nave-player/nave-player-dark.png',
    price: 1000,     // 1000 Stars
    armor: 9,
    speed: 6,
    slots: 2,
    unlocked: false,
    rarity: 'LENDÁRIO'
  },
  {
    id: 'preta',
    name: 'NAVE PRETA',
    description: 'Poder absoluto. A mais poderosa nave jamais construída. O pináculo da engenharia.',
    image: '../assets/img/nave-player/nave-preta.png',
    price: 1500,     // 1500 Stars (máximo)
    armor: 10,       // Máximo
    speed: 7,
    slots: 4,
    unlocked: false,
    rarity: 'LENDÁRIO'
  }
];

// ======================================================
// FUNÇÕES AUXILIARES
// ======================================================

/**
 * Obter dados de uma nave pelo ID
 */
export function getShipById(shipId) {
  return SHIPS.find(ship => ship.id === shipId) || null;
}

/**
 * Obter todos as naves desbloqueadas
 */
export function getUnlockedShips() {
  return SHIPS.filter(ship => ship.unlocked);
}

/**
 * Obter todas as naves bloqueadas
 */
export function getLockedShips() {
  return SHIPS.filter(ship => !ship.unlocked);
}

/**
 * Verificar se uma nave pode ser comprada
 */
export function canAffordShip(shipId, playerStars) {
  const ship = getShipById(shipId);
  if (!ship || ship.unlocked) return false;  // Já desbloqueada ou não existe
  return playerStars >= ship.price;
}

/**
 * Obter valor de um atributo de nave
 */
export function getShipStat(shipId, statName) {
  const ship = getShipById(shipId);
  return ship ? ship[statName] : 0;
}

/**
 * Converter raridade para cor para display
 */
export function getRarityColor(rarity) {
  const colors = {
    'COMUM': '#FFFFFF',
    'INCOMUM': '#00AA00',
    'RARO': '#0055FF',
    'ÉPICO': '#AA00FF',
    'LENDÁRIO': '#FF5500'
  };
  return colors[rarity] || '#FFFFFF';
}
