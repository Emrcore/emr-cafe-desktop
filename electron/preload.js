const { contextBridge, ipcRenderer } = require("electron");
const fs = require("fs");
const path = require("path");

let _cachedServerUrl = null;

/** K���k yard�mc�lar **/
function readConfig(filePath) {
  try {
    const text = fs.readFileSync(filePath, "utf8");
    const obj = JSON.parse(text);
    return obj || null;
  } catch {
    return null;
  }
}
function normalizeBase(url) {
  if (!url) return null;
  return url.replace(/\/+$/, "");
}
function isValidTenant(t) {
  // a�z 0�9 ve tire, ba�/sonda harf-rakam, toplam <=63
  return /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(t || "");
}
function buildUrlFromTemplate(tpl, tenant) {
  if (!tpl) return null;
  if (tpl.includes("{tenant}")) {
    if (!isValidTenant(tenant)) return null;
    return tpl.replace("{tenant}", tenant);
  }
  // Geriye d�n�k: serverUrl varsa direkt d�ner
  return tpl;
}
function getTenantId() {
  try {
    // Renderer localStorage'� preload�da eri�ilebilir (contextIsolation a��kken de)
    const t = window?.localStorage?.getItem?.("tenantId");
    return t && t.trim();
  } catch {
    return null;
  }
}

/** Ana fonksiyon: server URL �retimi **/
function getServerUrl() {
  if (_cachedServerUrl) return _cachedServerUrl;

  const candidates = [
    path.join(process.resourcesPath, "app.asar.unpacked", "electron", "ip-config.json"),
    path.join(process.resourcesPath, "electron", "ip-config.json"),
    path.join(__dirname, "ip-config.json"),
    path.join(process.cwd(), "electron", "ip-config.json"),
    path.join(process.cwd(), "ip-config.json"),
  ];

  let cfg = null;
  for (const p of candidates) {
    if (fs.existsSync(p)) {
      cfg = readConfig(p);
      if (cfg) break;
    }
  }

  // 1) �ablon �zerinden �ret
  const tenant = getTenantId();
  let url = null;
  if (cfg?.serverUrlTemplate) {
    url = buildUrlFromTemplate(cfg.serverUrlTemplate, tenant);
  } else if (cfg?.serverUrl) {
    // Geriye d�n�k destek
    url = cfg.serverUrl;
  }

  // 2) Normalizasyon
  url = normalizeBase(url);

  // 3) IP fallback�� KALDIR: tenant yoksa bilin�li �ekilde null d�nd�relim
  if (!url) {
    console.warn("[preload] Server URL olu�turulamad�. Tenant bo� olabilir.");
    _cachedServerUrl = null;
    return null;
  }

  _cachedServerUrl = url;
  return _cachedServerUrl;
}

/** Event helper�lar ve expose k�sm� sende nas�lsa ayn� kals�n **/
function on(channel, listener) {
  ipcRenderer.on(channel, listener);
  return () => ipcRenderer.removeListener(channel, listener);
}
function once(channel, listener) { ipcRenderer.once(channel, listener); }
function off(channel, listener) { ipcRenderer.removeListener(channel, listener); }

contextBridge.exposeInMainWorld("electronAPI", {
  getServerUrl: () => getServerUrl(),
  printReceipt: (data) => ipcRenderer.invoke("print-receipt", data),
  printKitchen: (order) => ipcRenderer.invoke("print-kitchen", order),
  printPDF: (filePath) => ipcRenderer.send("print-pdf", filePath),
  onUpdateAvailable: (cb) => on("update_available", cb),
  onUpdateDownloaded: (cb) => on("update_downloaded", cb),
  onUpdateProgress:  (cb) => on("update_progress", cb),
  onUpdateError:     (cb) => on("update_error", cb),
  quitAndInstall:    () => ipcRenderer.send("quit_and_install"),
  on, once, off,
  getAppInfo: () => ({
    platform: process.platform,
    arch: process.arch,
    versions: process.versions,
  }),
});
