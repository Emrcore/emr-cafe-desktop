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

function getUserTenantPath() {
  return path.join(app.getPath("userData"), "tenant.json");
}
function saveTenantId(tenantId) {
  const p = getUserTenantPath();
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, JSON.stringify({ tenantId }, null, 2), "utf8");
}

function readTenantId() {
  // 1) ENV
  if (isValidTenant(process.env.EMR_TENANT)) return process.env.EMR_TENANT.trim();

  // 2) Paket ile gelen dosyalar
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

  // 3) Kullanıcı verisi (runtime)
  const userTenant = readJsonSafe(getUserTenantPath())?.tenantId;
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

// —— Tenant prompt (ilk kurulum) —— //
function openTenantPromptWindow(parent) {
  const prompt = new BrowserWindow({
    parent,
    modal: true,
    width: 420,
    height: 260,
    resizable: false,
    minimizable: false,
    maximizable: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false, // preload’da fs/path kullanabilelim
    },
  });

  const html = `
    <!doctype html>
    <meta charset="utf-8">
    <title>İşletme (Tenant) Ayarı</title>
    <style>
      body{font-family:sans-serif;margin:24px}
      h2{margin:0 0 12px}
      input{width:100%;padding:10px;border:1px solid #ccc;border-radius:8px}
      button{margin-top:12px;padding:10px 14px;border:0;border-radius:8px;background:#0ea5e9;color:#fff;cursor:pointer}
      small{color:#666}
    </style>
    <h2>İşletme Adı (tenant)</h2>
    <p><small>Örn: <b>demo</b> → <code>https://demo.cafe.emrcore.com.tr</code></small></p>
    <input id="t" placeholder="demo" autofocus />
    <button id="ok">Kaydet ve Yeniden Başlat</button>
    <script>
      const re=/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;
      document.getElementById('ok').onclick = async () => {
        const t = document.getElementById('t').value.trim();
        if(!re.test(t)){ alert('Geçersiz tenant'); return; }
        try{
          await window.electronAPI.setTenant(t);
          window.close();
        }catch(e){ alert('Kaydetme hatası: '+e); }
      };
      window.addEventListener('keydown', (e) => { if(e.key==='Enter') document.getElementById('ok').click(); });
    </script>
  `;
  prompt.loadURL("data:text/html;charset=utf-8," + encodeURIComponent(html));

  prompt.on("closed", () => {
    // Tenant yazıldıysa app'ı yeniden başlat
    app.relaunch();
    app.exit(0);
  });
}

// IPC: renderer’dan tenant kaydetme
ipcMain.handle("set-tenant", (_e, tenantId) => {
  if (!isValidTenant(tenantId)) throw new Error("Geçersiz tenant");
  saveTenantId(tenantId);
  return true;
});

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
      sandbox: false,             // ������ PRELOAD için önemli
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
    // Tenant yoksa önce modal ile iste
    openTenantPromptWindow(win);
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
