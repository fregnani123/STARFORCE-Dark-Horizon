const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    closeApp: () => ipcRenderer.send('close-app')
});

// Expose DB API to the renderer process
contextBridge.exposeInMainWorld('dbAPI', {
    initDb: () => ipcRenderer.invoke('init-db'),
    getPlayerData: () => ipcRenderer.invoke('get-player-data'),
    savePlayerData: (data) => ipcRenderer.invoke('save-player-data', data),
    addStars: (count) => ipcRenderer.invoke('add-stars', count),
    updateMissionProgress: (level) => ipcRenderer.invoke('update-mission-progress', level),
    hasSavedGame: () => ipcRenderer.invoke('has-saved-game'),
    buyShip: (shipId) => ipcRenderer.invoke('buy-ship', shipId),
    selectShip: (shipId) => ipcRenderer.invoke('select-ship', shipId),
    buyUpgrade: (data) => ipcRenderer.invoke('buy-upgrade', data),
    buySuperLaser: () => ipcRenderer.invoke('buy-superlaser'),
    buyWingman: () => ipcRenderer.invoke('buy-wingman'),
    getSettings: () => ipcRenderer.invoke('get-settings'),
    saveSettings: (data) => ipcRenderer.invoke('save-settings', data),
    toggleFullscreen: () => ipcRenderer.invoke('toggle-fullscreen'),
});
