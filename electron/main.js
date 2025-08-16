// main.js
const { app, BrowserWindow, ipcMain, dialog, shell, globalShortcut } = require("electron");
const path = require("path");
const fs = require("fs");
const { printReceipt, printKitchen } = require("./printer");
const { autoUpdater } = require("electron-updater");

// —— Tek instance —— //
if (!app.requestSingleInstanceLock()) app.quit();
app.setAppUserModelId("com.emrcore.cafe");

// —— Logger (opsiyonel) —— //
try {
  const log = require("electron-log");
  autoUpdater.logger = log;
  autoUpdater.logger.transports.file.level = "info";
} catch (_) {}

// —— Yardımcılar —— //
const isValidTenant = (t) => /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test((t || "").trim());
const normalizeBase = (url) => (url ? url.replace(/\/+$/, "") : null);

function readJsonSafe(p) {
  try {
    if (!fs.existsSync(p)) return null;
    return JSON.parse(fs.readFileSync(p, "utf8"));
  } catch {
    return null;
  }
}

function readTenantId() {
  // 1) ENV
  if (isValidTenant(process.env.EMR_TENANT)) return process.env.EMR_TENANT.trim();

  // 2) Paket ile gelen dosyalar (build’e koymak istersen)
  const candidateTenantFiles = [
    path.join(process.resourcesPath, "electron", "tenant.json"),
    path.join(process.resourcesPath, "app.asar.unpacked", "electron", "tenant.json"),
    path.join(__dirname, "tenant.json"),
  ];
  for (const p of candidateTenantFiles) {
    const data = readJsonSafe(p);
    const t = data?.tenantId;
    if (isValidTenant(t)) return t.trim();
  }

  // 3) Kullanıcı verisi (runtime’da yazılabilir)
  const userTenantPath = path.join(app.getPath("userData"), "tenant.json");
  const userTenant = readJsonSafe(userTenantPath)?.tenantId;
  if (isValidTenant(userTenant)) return userTenant.trim();

  return null;
}

function readServerBaseUrl() {
  const cfgCandidates = [
    // Paket
    path.join(process.resourcesPath, "electron", "ip-config.json"),
    path.join(process.resourcesPath, "app.asar.unpacked", "electron", "ip-config.json"),
    // Geliştirme
    path.join(__dirname, "ip-config.json"),
    path.join(process.cwd(), "electron", "ip-config.json"),
    path.join(process.cwd(), "ip-config.json"),
  ];

  let cfg = null;
  for (const p of cfgCandidates) {
    const c = readJsonSafe(p);
    if (c) { cfg = c; break; }
  }

  // 1) serverUrl (doğrudan)
  if (typeof cfg?.serverUrl === "string" && cfg.serverUrl.trim()) {
    return normalizeBase(cfg.serverUrl.trim());
  }

  // 2) serverUrlTemplate + tenant
  if (typeof cfg?.serverUrlTemplate === "string" && cfg.serverUrlTemplate.includes("{tenant}")) {
    const tenant = readTenantId();
    if (isValidTenant(tenant)) {
      const filled = cfg.serverUrlTemplate.replace("{tenant}", tenant);
      return normalizeBase(filled);
    }
  }

  // —— IP fallback YOK —— //
  return null;
}

// —— Updater bağla —— //
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

// —— Pencere —— //
function createWindow() {
  win = new BrowserWindow({
    width: 1200,
    height: 800,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      backgroundThrottling: false,
    },
  });

  // Dış bağlantıları sistem tarayıcısında aç
  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  // Prod’da hızlı debug: Ctrl+Shift+I
  app.whenReady().then(() => {
    globalShortcut.register("Control+Shift+I", () => {
      const focused = BrowserWindow.getFocusedWindow();
      if (focused) focused.webContents.openDevTools();
    });
  });

  // Updater
  wireAutoUpdater();
  autoUpdater.checkForUpdatesAndNotify();

  const base = readServerBaseUrl();
  if (!base) {
    dialog.showMessageBoxSync({
      type: "error",
      title: "Sunucu adresi bulunamadı",
      message:
        "Sunucu URL’i oluşturulamadı.\n" +
        "- ip-config.json içinde 'serverUrl' ya da\n" +
        "- 'serverUrlTemplate' (örn: https://{tenant}.cafe.emrcore.com.tr) belirtin.\n" +
        "- Tenant kimliğini ENV (EMR_TENANT) ya da tenant.json ile sağlayın.",
      buttons: ["Kapat"]
    });
    app.quit();
    return;
  }

  try {
    win.loadURL(base); // Örn: https://demo.cafe.emrcore.com.tr
  } catch (e) {
    dialog.showMessageBox(win, {
      type: "error",
      title: "Bağlantı Hatası",
      message: `Sunucuya bağlanılamadı: ${base}\nLütfen internet bağlantınızı veya sunucuyu kontrol edin.`
    });
  }
}

// —— Yazdırma IPC’leri —— //
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

// —— App lifecycle —— //
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
  globalShortcut.unregisterAll();
  if (process.platform !== "darwin") app.quit();
});
