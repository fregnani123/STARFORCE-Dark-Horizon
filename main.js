const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

let mainWindow;

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
            autoplayPolicy: 'no-user-gesture-required'
        }
    });

    mainWindow.loadFile(path.join(__dirname, 'public', 'index.html'));
}

app.whenReady().then(() => {
    createWindow();

    app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

ipcMain.on('close-app', () => {
    app.quit();
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
});
