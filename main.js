const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");
const { autoUpdater } = require("electron-updater");

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  win.loadURL("http://185.149.103.223:3001");

  // ?? Otomatik güncelleme kontrolü
  autoUpdater.checkForUpdatesAndNotify();

  autoUpdater.on("update-available", () => {
    win.webContents.send("update_available");
  });

  autoUpdater.on("update-downloaded", () => {
    win.webContents.send("update_downloaded");
  });
}

app.whenReady().then(() => {
  createWindow();
});