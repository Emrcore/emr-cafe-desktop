// main.js
const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");
const fs = require("fs");
const { printReceipt, printKitchen } = require("./printer");
const { autoUpdater } = require("electron-updater");

// —— Tek instance ——
if (!app.requestSingleInstanceLock()) {
  app.quit();
}
app.setAppUserModelId("com.emrcore.cafe");

// Logger (ops.)
try {
  const log = require("electron-log");
  autoUpdater.logger = log;
  autoUpdater.logger.transports.file.level = "info";
} catch (_) {}

function readServerUrl() {
  const candidates = [
    // Paketlenmiş senaryo (extraResources / asarUnpack)
    path.join(process.resourcesPath, "electron", "ip-config.json"),
    path.join(process.resourcesPath, "app.asar.unpacked", "electron", "ip-config.json"),
    // Geliştirme/sandbox
    path.join(__dirname, "ip-config.json"),
    path.join(process.cwd(), "electron", "ip-config.json"),
    path.join(process.cwd(), "ip-config.json"),
  ];

  for (const p of candidates) {
    try {
      if (fs.existsSync(p)) {
        const { serverUrl } = JSON.parse(fs.readFileSync(p, "utf8"));
        if (typeof serverUrl === "string" && serverUrl.trim()) {
          const base = serverUrl.trim().replace(/\/+$/, "");
          return base;
        }
      }
    } catch (_) {}
  }
  // Fallback
  return "http://185.149.103.223:3001";
}

let win;

function wireAutoUpdater() {
  autoUpdater.allowPrerelease = false;
  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;

  autoUpdater.on("update-available", (info) => {
    win?.webContents.send("update_available", info);
    dialog.showMessageBox(win, {
      type: "info",
      title: "Güncelleme var",
      message: "Yeni sürüm indiriliyor...",
    });
  });

  autoUpdater.on("download-progress", (progress) => {
    win?.webContents.send("update_progress", progress);
  });

  autoUpdater.on("update-downloaded", (info) => {
    win?.webContents.send("update_downloaded", info);
    dialog.showMessageBox(win, {
      type: "info",
      title: "Güncelleme indirildi",
      message: "Uygulama şimdi yeniden başlayarak güncellenecek.",
      buttons: ["Şimdi Güncelle"]
    }).then(() => autoUpdater.quitAndInstall());
  });

  autoUpdater.on("error", (err) => {
    win?.webContents.send("update_error", String(err));
  });
}

function createWindow() {
  win = new BrowserWindow({
    width: 1200,
    height: 800,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      backgroundThrottling: false
    },
  });

  const base = readServerUrl();

  // Updater event’lerini önce bağla
  wireAutoUpdater();
  autoUpdater.checkForUpdatesAndNotify();

  // Dış URL’yi yükle
  try {
    win.loadURL(base);
  } catch (e) {
    dialog.showMessageBox(win, {
      type: "error",
      title: "Bağlantı Hatası",
      message: `Sunucuya bağlanılamadı: ${base}\nLütfen internet bağlantınızı veya sunucuyu kontrol edin.`
    });
  }

  // win.webContents.openDevTools(); // opsiyonel
}

// Yazdırma IPC’leri
ipcMain.handle("print-receipt", async (_event, data) => {
  try { await printReceipt(data); }
  catch (err) { console.error("Fiş yazdırılırken hata:", err); }
});
ipcMain.handle("print-kitchen", async (_event, data) => {
  try { await printKitchen(data); }
  catch (err) { console.error("Mutfak fişi yazdırılırken hata:", err); }
});
ipcMain.on("print-pdf", (_event, filePath) => {
  // PDF yazdırma/önizleme işlemleri
});

app.whenReady().then(() => {
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("second-instance", () => {
  if (win) {
    if (win.isMinimized()) win.restore();
    win.focus();
  }
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
