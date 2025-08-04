const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");
const { printReceipt, printKitchen } = require("./printer");

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // Sunucudaki frontend'e bağlan
  win.loadURL("http://185.149.103.223:3001");

  // win.webContents.openDevTools(); // Geliştirici aracı (isteğe bağlı)
}

// IPC: Müşteri fişi yazdırma
ipcMain.handle("print-receipt", async (event, data) => {
  try {
    await printReceipt(data);
  } catch (err) {
    console.error("Fiş yazdırılırken hata:", err);
  }
});

// IPC: Mutfak fişi yazdırma
ipcMain.handle("print-kitchen", async (event, data) => {
  try {
    await printKitchen(data);
  } catch (err) {
    console.error("Mutfak fişi yazdırılırken hata:", err);
  }
});

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
