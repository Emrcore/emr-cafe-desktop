// electron/preload.js
const { contextBridge, ipcRenderer } = require("electron");
const fs = require("fs");
const path = require("path");

let _cachedServerUrl = null;

/** Helpers **/
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
  return /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(t || "");
}

/** Tenant bulma: localStorage -> ENV -> hostname (web) **/
function getTenantId() {
  try {
    const tLS = globalThis?.localStorage?.getItem?.("tenantId");
    if (tLS && isValidTenant(tLS.trim())) return tLS.trim();
  } catch {}

  try {
    const tEnv = process?.env?.EMR_TENANT;
    if (tEnv && isValidTenant(tEnv.trim())) return tEnv.trim();
  } catch {}

  try {
    const host = globalThis?.location?.hostname || "";
    // demo.cafe.emrcore.com.tr => demo
    const m = host.match(/^([a-z0-9-]+)\.cafe\.emrcore\.com\.tr$/i);
    const tHost = m?.[1];
    if (tHost && isValidTenant(tHost)) return tHost;
  } catch {}

  return null;
}

function buildUrlFromTemplate(tpl, tenant) {
  if (!tpl) return null;
  if (tpl.includes("{tenant}")) {
    if (!isValidTenant(tenant)) return null;
    return tpl.replace("{tenant}", tenant);
  }
  // Geriye dönük: sabit serverUrl verildiyse
  return tpl;
}

/** Sunucu URL üretimi **/
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
      const c = readConfig(p);
      if (c) { cfg = c; break; }
    }
  }

  const tenant = getTenantId();
  let url = null;

  if (cfg?.serverUrlTemplate) {
    url = buildUrlFromTemplate(cfg.serverUrlTemplate, tenant);
  } else if (cfg?.serverUrl) {
    url = cfg.serverUrl;
  }

  url = normalizeBase(url);

  if (!url) {
    console.warn("[preload] Server URL oluþturulamadý. Tenant eksik olabilir.");
    _cachedServerUrl = null;
    return null;
  }

  _cachedServerUrl = url;
  return _cachedServerUrl;
}

/** IPC helper’larý **/
function on(channel, listener) {
  ipcRenderer.on(channel, listener);
  return () => ipcRenderer.removeListener(channel, listener);
}
function once(channel, listener) { ipcRenderer.once(channel, listener); }
function off(channel, listener) { ipcRenderer.removeListener(channel, listener); }

/** Renderer’a API **/
contextBridge.exposeInMainWorld("electronAPI", {
  // Sunucu
  getServerUrl: () => getServerUrl(),

  // Tenant yönetimi
  setTenant: (tenantId) => ipcRenderer.invoke("set-tenant", tenantId), // main.js'e kaydeder (userData/tenant.json)
  setTenantLocal: (tenantId) => {
    try {
      if (isValidTenant(tenantId)) globalThis.localStorage?.setItem?.("tenantId", tenantId);
    } catch {}
  },

  // Yazýcýlar
  printReceipt: (data) => ipcRenderer.invoke("print-receipt", data),
  printKitchen: (order) => ipcRenderer.invoke("print-kitchen", order),
  openCashDrawer: () => ipcRenderer.invoke("open-cash-drawer"),   // ?? kasa açma eklendi
  printPDF: (filePath) => ipcRenderer.send("print-pdf", filePath),

  // Updater
  onUpdateAvailable: (cb) => on("update_available", cb),
  onUpdateDownloaded: (cb) => on("update_downloaded", cb),
  onUpdateProgress:  (cb) => on("update_progress", cb),
  onUpdateError:     (cb) => on("update_error", cb),
  quitAndInstall:    () => ipcRenderer.send("quit_and_install"),

  // Event helpers
  on, once, off,

  // App info
  getAppInfo: () => ({
    platform: process.platform,
    arch: process.arch,
    versions: process.versions,
  }),
});
