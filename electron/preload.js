const { contextBridge, ipcRenderer } = require("electron");
const fs = require("fs");
const path = require("path");

let _cachedServerUrl = null;

function safeReadJson(filePath) {
  try {
    const text = fs.readFileSync(filePath, "utf8");
    const obj = JSON.parse(text);
    return (obj && typeof obj.serverUrl === "string" && obj.serverUrl.trim())
      ? obj.serverUrl.trim()
      : null;
  } catch (_) {
    return null;
  }
}

function normalizeBase(url) {
  if (!url) return null;
  const clean = url.replace(/\/+$/, "");
  // Ýstersen sadece https'e zorla:
  // if (clean.startsWith("http://")) return clean.replace("http://", "https://");
  return clean;
}

function getServerUrl() {
  if (_cachedServerUrl) return _cachedServerUrl;

  const candidates = [
    path.join(process.resourcesPath, "app.asar.unpacked", "electron", "ip-config.json"),
    path.join(process.resourcesPath, "electron", "ip-config.json"),
    path.join(__dirname, "ip-config.json"),
    path.join(process.cwd(), "electron", "ip-config.json"),
    path.join(process.cwd(), "ip-config.json"),
  ];

  for (const p of candidates) {
    if (fs.existsSync(p)) {
      const url = safeReadJson(p);
      if (url) {
        _cachedServerUrl = normalizeBase(url);
        return _cachedServerUrl;
      }
    }
  }

  _cachedServerUrl = "http://185.149.103.223:3001"; // Fallback
  return _cachedServerUrl;
}

// ——— Event helper'larý ———
function on(channel, listener) {
  ipcRenderer.on(channel, listener);
  return () => ipcRenderer.removeListener(channel, listener); // unsubscribe helper
}

function once(channel, listener) {
  ipcRenderer.once(channel, listener);
}

function off(channel, listener) {
  ipcRenderer.removeListener(channel, listener);
}

contextBridge.exposeInMainWorld("electronAPI", {
  // Sunucu
  getServerUrl: () => getServerUrl(),

  // Yazýcýlar
  printReceipt: (data) => ipcRenderer.invoke("print-receipt", data),
  printKitchen: (order) => ipcRenderer.invoke("print-kitchen", order),
  printPDF: (filePath) => ipcRenderer.send("print-pdf", filePath),

  // Otomatik güncelleme
  onUpdateAvailable: (cb) => on("update_available", cb),
  onUpdateDownloaded: (cb) => on("update_downloaded", cb),
  onUpdateProgress:  (cb) => on("update_progress", cb),
  onUpdateError:     (cb) => on("update_error", cb),
  quitAndInstall:    () => ipcRenderer.send("quit_and_install"),

  // Event yönetimi (opsiyonel genel amaçlý)
  on,
  once,
  off,

  // Uygulama bilgisi (opsiyonel)
  getAppInfo: () => ({
    platform: process.platform,
    arch: process.arch,
    versions: process.versions,
  }),
});
