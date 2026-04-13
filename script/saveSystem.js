// ======================================================
// SISTEMA DE SALVAMENTO - SQLITE3 (via Electron IPC)
// ======================================================

// Cache em memória para acesso síncrono ultra-rápido durante o jogo
let cachedData = {
    pilotName: "",
    currentMission: 1,
    totalStars: 0,
    unlockedLevels: [1],
    missionStars: {},
    currentShip: 'metal',
    unlockedShips: ['metal'],
    weaponLevel: 1,
    hullLevel: 1,
    engineLevel: 1,
    superLaserUnlocked: false,
    wingmanUnlocked: false
};

// Inicializa o "DB" se for a primeira vez
export async function initSaveSystem() {
    // Call the main process to initialize the DB and get initial data
    const initialData = await window.dbAPI.initDb();
    if (initialData) {
        cachedData = initialData;
        console.log("Progresso carregado do SQLite (Renderer Cache):", cachedData.pilotName);
    }
    // The main process handles the creation of the DB and initial record if it doesn't exist.
    // This function in the renderer simply ensures the cache is populated.
}

export function hasSavedGame() {
    // This now relies on the local cache, which is updated from the main process
    return cachedData.pilotName !== "";
}

export function getPlayerData() {
    // Returns the current state from the local cache
    return cachedData;
}

export async function savePlayerData(data) {
    // Update local cache immediately for responsiveness
    cachedData = { ...cachedData, ...data };
    // Send update to main process for persistent storage
    await window.dbAPI.savePlayerData(cachedData);
}

export async function addStars(count, missionId = null) {
    cachedData.totalStars += count;
    if (missionId) {
        if (!cachedData.missionStars) cachedData.missionStars = {};
        cachedData.missionStars[missionId] = (cachedData.missionStars[missionId] || 0) + count;
    }
    await window.dbAPI.addStars({ count, missionId }); // Delegate to main process
}

export async function updateMissionProgress(level) {
    cachedData.currentMission = level;
    if (!cachedData.unlockedLevels.includes(level)) {
        cachedData.unlockedLevels.push(level);
    }
    await window.dbAPI.updateMissionProgress(level);
}

export async function buyShip(shipId) {
    const result = await window.dbAPI.buyShip(shipId);
    if (result.success) {
        cachedData.totalStars = result.totalStars;
        cachedData.unlockedShips = result.unlockedShips;
    }
    return result;
}

export async function selectShip(shipId) {
    const result = await window.dbAPI.selectShip(shipId);
    if (result.success) {
        cachedData.currentShip = result.currentShip;
    }
    return result;
}

export function getCurrentShip() {
    return cachedData.currentShip || 'metal';
}

export function getUnlockedShips() {
    return cachedData.unlockedShips || ['metal'];
}

export function getUpgradeLevels() {
    return {
        weaponLevel:  cachedData.weaponLevel  || 1,
        hullLevel:    cachedData.hullLevel    || 1,
        engineLevel:  cachedData.engineLevel  || 1,
        superLaserUnlocked: cachedData.superLaserUnlocked || false,
        wingmanUnlocked: cachedData.wingmanUnlocked || false,
    };
}

export async function buyUpgrade(upgradeType) {
    const result = await window.dbAPI.buyUpgrade({ upgradeType });
    if (result.success) {
        cachedData[upgradeType + 'Level'] = result.newLevel;
        cachedData.totalStars = result.totalStars;
    }
    return result;
}

export async function buySuperLaserUpgrade() {
    const result = await window.dbAPI.buySuperLaser();
    if (result.success) {
        cachedData.superLaserUnlocked = true;
        cachedData.totalStars = result.totalStars;
    }
    return result;
}

export async function buyWingmanUpgrade() {
    const result = await window.dbAPI.buyWingman();
    if (result.success) {
        cachedData.wingmanUnlocked = true;
        cachedData.totalStars = result.totalStars;
    }
    return result;
}