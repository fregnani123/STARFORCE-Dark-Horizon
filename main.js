const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const sqlite3 = require('sqlite3').verbose(); // Import here in main process

let mainWindow;
let db; // Declare db globally in main process

function createWindow() {
    mainWindow = new BrowserWindow({
        fullscreen: true,        // ⬅ TELA CHEIA REAL
        frame: false,            // ⬅ REMOVE A BARRA SUPERIOR
        autoHideMenuBar: true,   // ⬅ OCULTA MENU (ALT mostra temporário)
        icon: path.join(__dirname, "assets", "img", "icon.png"),
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
            autoplayPolicy: 'no-user-gesture-required',
            // 🛡️ Remove os erros de Autofill.enable do console
            disableBlinkFeatures: 'Autofill'
        }
    });

    mainWindow.loadFile(path.join(__dirname, 'public', 'index.html'));
    mainWindow.webContents.openDevTools(); // Abre as ferramentas de desenvolvimento    
}

const { session } = require('electron');

app.whenReady().then(() => {

    // 🔐 CSP FORÇADA (resolve o warning)
    session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
        callback({
            responseHeaders: {
                ...details.responseHeaders,
                'Content-Security-Policy': [
                    "default-src 'self'; " +
                    "script-src 'self'; " +
                    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
                    "font-src https://fonts.gstatic.com; " +
                    "img-src 'self' data:;"
                ]
            }
        });
    });

    // 🚀 SEU CÓDIGO NORMAL
    initDatabase().then(() => {
        createWindow();
    });

    app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});
app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
    if (db) {
        db.close((err) => {
            if (err) console.error("Error closing database:", err.message);
            else console.log("Database closed.");
        });
    }
});

ipcMain.on('close-app', () => {
    app.quit();
});

// SQLite Database Initialization and IPC Handlers
let cachedData = {
    pilotName: "",
    currentMission: 1,
    totalStars: 0,
    unlockedLevels: [1],
    missionStars: {},
    currentShip: 'metal',
    unlockedShips: ['metal']
};

let cachedSettings = {
    musicVolume: 1.0,
    sfxVolume: 1.0,
    musicEnabled: true,
    sfxEnabled: true,
    fullscreen: true,
    particleQuality: 'high',
    showControlHints: true,
    language: 'pt-BR'
};

async function initDatabase() {
    return new Promise((resolve) => {
        const userDataPath = app.getPath('userData');
        const dbPath = path.join(userDataPath, 'starforce_data.db');
        console.log("Caminho do Banco de Dados:", dbPath);

        db = new sqlite3.Database(dbPath, (err) => {
            if (err) {
                console.error("Erro ao abrir banco de dados:", err.message);
                return resolve();
            }

            // Usamos uma Promise interna para garantir que os dados iniciais foram lidos
            db.serialize(() => {
                // Tabela principal de progresso
                db.run(`CREATE TABLE IF NOT EXISTS player_progress (
                    id INTEGER PRIMARY KEY,
                    pilotName TEXT,
                    currentMission INTEGER,
                    totalStars INTEGER,
                    unlockedLevels TEXT,
                    missionStars TEXT,
                    currentShip TEXT DEFAULT 'metal',
                    unlockedShips TEXT DEFAULT '["metal"]',
                    weaponLevel INTEGER DEFAULT 1,
                    hullLevel INTEGER DEFAULT 1,
                    engineLevel INTEGER DEFAULT 1,
                    superLaserUnlocked INTEGER DEFAULT 0
                )`, () => {
                    // Migração: colunas novas em bancos antigos
                    db.all("PRAGMA table_info(player_progress)", (err, columns) => {
        const hasMissionStars  = columns && columns.some(col => col.name === 'missionStars');
                        const hasCurrentShip   = columns && columns.some(col => col.name === 'currentShip');
                        const hasUnlockedShips = columns && columns.some(col => col.name === 'unlockedShips');
                        const hasWeaponLevel   = columns && columns.some(col => col.name === 'weaponLevel');
                        const hasHullLevel     = columns && columns.some(col => col.name === 'hullLevel');
                        const hasEngineLevel   = columns && columns.some(col => col.name === 'engineLevel');

                        if (!hasMissionStars)  db.run("ALTER TABLE player_progress ADD COLUMN missionStars TEXT DEFAULT '{}'");
                        if (!hasCurrentShip)   db.run("ALTER TABLE player_progress ADD COLUMN currentShip TEXT DEFAULT 'metal'");
                        if (!hasUnlockedShips) db.run("ALTER TABLE player_progress ADD COLUMN unlockedShips TEXT DEFAULT '[\"metal\"]'");
                        if (!hasWeaponLevel)   db.run("ALTER TABLE player_progress ADD COLUMN weaponLevel INTEGER DEFAULT 1");
                        if (!hasHullLevel)     db.run("ALTER TABLE player_progress ADD COLUMN hullLevel INTEGER DEFAULT 1");
                        if (!hasEngineLevel)   db.run("ALTER TABLE player_progress ADD COLUMN engineLevel INTEGER DEFAULT 1");
                        const hasSuperLaser = columns && columns.some(col => col.name === 'superLaserUnlocked');
                        if (!hasSuperLaser)    db.run("ALTER TABLE player_progress ADD COLUMN superLaserUnlocked INTEGER DEFAULT 0");
                        const hasWingman = columns && columns.some(col => col.name === 'wingmanUnlocked');
                        if (!hasWingman)       db.run("ALTER TABLE player_progress ADD COLUMN wingmanUnlocked INTEGER DEFAULT 0");
                    });

                    // Tabela para tracking detalhado de estrelas por missão
                    db.run(`CREATE TABLE IF NOT EXISTS mission_stars (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        missionId INTEGER,
                        starsCount INTEGER,
                        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
                    )`, () => {

                        // Tabela de configurações do jogador
                        db.run(`CREATE TABLE IF NOT EXISTS settings (
                            id INTEGER PRIMARY KEY,
                            musicVolume REAL DEFAULT 1.0,
                            sfxVolume REAL DEFAULT 1.0,
                            musicEnabled INTEGER DEFAULT 1,
                            sfxEnabled INTEGER DEFAULT 1,
                            fullscreen INTEGER DEFAULT 1,
                            particleQuality TEXT DEFAULT 'high',
                            showControlHints INTEGER DEFAULT 1,
                            language TEXT DEFAULT 'pt-BR'
                        )`, () => {
                            db.run("INSERT OR IGNORE INTO settings (id) VALUES (1)");
                            db.get("SELECT * FROM settings WHERE id = 1", (err, sRow) => {
                                if (sRow) {
                                    cachedSettings = {
                                        musicVolume:      sRow.musicVolume      ?? 1.0,
                                        sfxVolume:        sRow.sfxVolume        ?? 1.0,
                                        musicEnabled:     sRow.musicEnabled     ? true : false,
                                        sfxEnabled:       sRow.sfxEnabled       ? true : false,
                                        fullscreen:       sRow.fullscreen       ? true : false,
                                        particleQuality:  sRow.particleQuality  || 'high',
                                        showControlHints: sRow.showControlHints ? true : false,
                                        language:         sRow.language         || 'pt-BR'
                                    };
                                }
                            });
                        });

                        db.get("SELECT * FROM player_progress WHERE id = 1", (err, row) => {
                            if (row) {
                                cachedData = {
                                    pilotName: row.pilotName || "",
                                    currentMission: row.currentMission || 1,
                                    totalStars: row.totalStars || 0,
                                    unlockedLevels: row.unlockedLevels ? JSON.parse(row.unlockedLevels) : [1],
                                    missionStars: row.missionStars ? JSON.parse(row.missionStars) : {},
                                    currentShip: row.currentShip || 'metal',
                                    unlockedShips: row.unlockedShips ? JSON.parse(row.unlockedShips) : ['metal'],
                                    weaponLevel: row.weaponLevel || 1,
                                    hullLevel: row.hullLevel || 1,
                                    engineLevel: row.engineLevel || 1,
                                    superLaserUnlocked: row.superLaserUnlocked ? true : false,
                                    wingmanUnlocked: row.wingmanUnlocked ? true : false
                                };
                                console.log("Progresso carregado do SQLite:", cachedData.pilotName);
                            } else {
                                db.run("INSERT OR IGNORE INTO player_progress (id, pilotName, currentMission, totalStars, unlockedLevels, missionStars, currentShip, unlockedShips) VALUES (1, '', 1, 0, '[1]', '{}', 'metal', '[\"metal\"]')", (err) => {
                                    if (err) console.error('Erro ao criar registro inicial:', err.message);
                                    else console.log('Registro inicial do banco de dados preparado.');
                                });
                            }
                            resolve();
                        });
                    });
                });
            });
        });
    });
}

// Função auxiliar para salvar dados no SQLite sem usar IPC internamente
async function saveDataInternal(data) {
    cachedData = { ...cachedData, ...data };
    return new Promise((resolve, reject) => {
        if (!cachedData.missionStars)  cachedData.missionStars  = {};
        if (!cachedData.unlockedShips) cachedData.unlockedShips = ['metal'];
        if (!cachedData.currentShip)   cachedData.currentShip   = 'metal';
        if (!cachedData.weaponLevel)   cachedData.weaponLevel   = 1;
        if (!cachedData.hullLevel)     cachedData.hullLevel     = 1;
        if (!cachedData.engineLevel)   cachedData.engineLevel   = 1;
        if (cachedData.superLaserUnlocked === undefined) cachedData.superLaserUnlocked = false;
        if (cachedData.wingmanUnlocked === undefined) cachedData.wingmanUnlocked = false;

        const stmt = db.prepare(`UPDATE player_progress SET
            pilotName=?, currentMission=?, totalStars=?, unlockedLevels=?,
            missionStars=?, currentShip=?, unlockedShips=?,
            weaponLevel=?, hullLevel=?, engineLevel=?, superLaserUnlocked=?, wingmanUnlocked=?
            WHERE id=1`);
        stmt.run(
            cachedData.pilotName,
            cachedData.currentMission,
            cachedData.totalStars,
            JSON.stringify(cachedData.unlockedLevels),
            JSON.stringify(cachedData.missionStars),
            cachedData.currentShip,
            JSON.stringify(cachedData.unlockedShips),
            cachedData.weaponLevel,
            cachedData.hullLevel,
            cachedData.engineLevel,
            cachedData.superLaserUnlocked ? 1 : 0,
            cachedData.wingmanUnlocked ? 1 : 0,
            function (err) {
                if (err) { console.error("Erro ao salvar dados:", err.message); reject(err); }
                else { resolve(cachedData); }
            }
        );
        stmt.finalize();
    });
}

ipcMain.handle('init-db', async () => {
    return cachedData;
});

ipcMain.handle('get-player-data', () => {
    return cachedData;
});

ipcMain.handle('save-player-data', async (event, data) => {
    return await saveDataInternal(data);
});

ipcMain.handle('add-stars', async (event, data) => {
    const { count, missionId } = data;
    cachedData.totalStars += count;
    if (missionId) {
        if (!cachedData.missionStars) cachedData.missionStars = {};
        cachedData.missionStars[missionId] = (cachedData.missionStars[missionId] || 0) + count;
    }
    return await saveDataInternal(cachedData);
});

ipcMain.handle('update-mission-progress', async (event, level) => {
    cachedData.currentMission = level;
    if (!cachedData.unlockedLevels.includes(level)) {
        cachedData.unlockedLevels.push(level);
    }
    return await saveDataInternal(cachedData);
});

ipcMain.handle('has-saved-game', () => {
    return cachedData.pilotName !== "";
});

ipcMain.handle('buy-ship', async (event, shipId) => {
    // Alien é brinde — não pode ser comprada
    if (shipId === 'alien') return { success: false, error: 'A Nave Alien é um brinde por completar o jogo!' };

    const SHIP_PRICES = { branca: 400, fgl: 750, hibrida: 600, dark: 1000, preta: 1500 };
    const price = SHIP_PRICES[shipId];
    if (price === undefined) return { success: false, error: 'Nave não encontrada' };
    if (!cachedData.unlockedShips) cachedData.unlockedShips = ['metal'];
    if (cachedData.unlockedShips.includes(shipId)) return { success: false, error: 'Nave já desbloqueada' };
    if (cachedData.totalStars < price) return { success: false, error: 'Stars insuficientes' };

    cachedData.totalStars -= price;
    cachedData.unlockedShips = [...cachedData.unlockedShips, shipId];
    await saveDataInternal(cachedData);
    return { success: true, totalStars: cachedData.totalStars, unlockedShips: cachedData.unlockedShips };
});

ipcMain.handle('select-ship', async (event, shipId) => {
    if (!cachedData.unlockedShips) cachedData.unlockedShips = ['metal'];
    if (!cachedData.unlockedShips.includes(shipId)) return { success: false, error: 'Nave não desbloqueada' };
    cachedData.currentShip = shipId;
    await saveDataInternal(cachedData);
    return { success: true, currentShip: cachedData.currentShip };
});

ipcMain.handle('buy-upgrade', async (event, { upgradeType }) => {
    // Definição dos upgrades: tipo → [ {level, cost} ]
    const UPGRADE_COSTS = {
        weapon: [0, 50, 150, 350],   // index = nível atual, custo para ir ao próximo
        hull:   [0, 80, 180, 320, 500],
        engine: [0, 100, 250]
    };
    const MAX_LEVELS = { weapon: 4, hull: 5, engine: 3 };

    const levelKey = upgradeType + 'Level';  // e.g. 'weaponLevel'
    const currentLevel = cachedData[levelKey] || 1;
    const maxLevel = MAX_LEVELS[upgradeType];

    if (currentLevel >= maxLevel) return { success: false, error: 'Nível máximo atingido!' };

    const cost = UPGRADE_COSTS[upgradeType][currentLevel]; // custo do nível atual → próximo
    if (cachedData.totalStars < cost) return { success: false, error: 'Stars insuficientes!' };

    cachedData.totalStars -= cost;
    cachedData[levelKey] = currentLevel + 1;
    await saveDataInternal(cachedData);
    return { success: true, newLevel: cachedData[levelKey], totalStars: cachedData.totalStars };
});

ipcMain.handle('buy-superlaser', async () => {
    const SUPER_LASER_COST = 200;
    if (cachedData.superLaserUnlocked) return { success: false, error: 'Super Laser já desbloqueado!' };
    if ((cachedData.currentMission || 1) <= 1)
        return { success: false, error: 'Complete a Missão 1 primeiro!' };
    if (cachedData.totalStars < SUPER_LASER_COST)
        return { success: false, error: 'Stars insuficientes!' };

    cachedData.totalStars -= SUPER_LASER_COST;
    cachedData.superLaserUnlocked = true;
    await saveDataInternal(cachedData);
    return { success: true, totalStars: cachedData.totalStars };
});

ipcMain.handle('buy-wingman', async () => {
    const WINGMAN_COST = 300;
    if (cachedData.wingmanUnlocked) return { success: false, error: 'Nave Parceira já desbloqueada!' };
    if ((cachedData.currentMission || 1) <= 1)
        return { success: false, error: 'Complete a Missão 1 primeiro!' };
    if (cachedData.totalStars < WINGMAN_COST)
        return { success: false, error: 'Stars insuficientes!' };

    cachedData.totalStars -= WINGMAN_COST;
    cachedData.wingmanUnlocked = true;
    await saveDataInternal(cachedData);
    return { success: true, totalStars: cachedData.totalStars };
});

// ── SETTINGS IPC ──────────────────────────────────────────
ipcMain.handle('get-settings', () => {
    return cachedSettings;
});

ipcMain.handle('save-settings', async (event, data) => {
    cachedSettings = { ...cachedSettings, ...data };
    return new Promise((resolve, reject) => {
        db.run(`UPDATE settings SET
            musicVolume=?, sfxVolume=?, musicEnabled=?, sfxEnabled=?,
            fullscreen=?, particleQuality=?, showControlHints=?, language=?
            WHERE id=1`,
            [
                cachedSettings.musicVolume,
                cachedSettings.sfxVolume,
                cachedSettings.musicEnabled ? 1 : 0,
                cachedSettings.sfxEnabled   ? 1 : 0,
                cachedSettings.fullscreen   ? 1 : 0,
                cachedSettings.particleQuality,
                cachedSettings.showControlHints ? 1 : 0,
                cachedSettings.language
            ],
            (err) => {
                if (err) { console.error('Erro ao salvar settings:', err.message); reject(err); }
                else resolve(cachedSettings);
            }
        );
    });
});

ipcMain.handle('toggle-fullscreen', () => {
    if (mainWindow) {
        const isNow = !mainWindow.isFullScreen();
        mainWindow.setFullScreen(isNow);
        cachedSettings.fullscreen = isNow;
        return isNow;
    }
    return false;
});
