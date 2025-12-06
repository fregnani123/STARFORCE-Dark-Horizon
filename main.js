const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        fullscreen: true,
        frame: false,
        autoHideMenuBar: true,
        icon: path.join(__dirname, "assets", "img", "icon.png"),
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'), // obrigatório
            nodeIntegration: false,
            contextIsolation: true,
            autoplayPolicy: 'no-user-gesture-required'
        }
    });

    mainWindow.loadFile(path.join(__dirname, 'public', 'index.html'));
    mainWindow.setFullScreenable(true);
}

app.whenReady().then(() => {
    createWindow();

    app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

// IPC para fechar o app
ipcMain.on('close-app', () => {
    app.quit();
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
});
