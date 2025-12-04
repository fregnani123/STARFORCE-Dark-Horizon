const { app, BrowserWindow } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        fullscreen: true,       // ⬅ FULLSCREEN REAL (remove taskbar)
        frame: false,           // sem barra de janela
        autoHideMenuBar: true,  // menu só aparece ao ALT
        icon: path.join(__dirname, "assets", "img", "icon.png"),
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true
        }
    });

    mainWindow.loadFile(path.join(__dirname, 'public', 'index.html'));

    // Garante fullscreen habilitado no sistema
    mainWindow.setFullScreenable(true);
}

app.whenReady().then(() => {
    createWindow();

    app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
});
