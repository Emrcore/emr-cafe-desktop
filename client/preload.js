const { contextBridge, ipcRenderer } = require("electron");
const fs = require("fs");
const path = require("path");

// ? config.json verisi
const configPath = path.join(__dirname, "..", "config", "config.json");
const config = JSON.parse(fs.readFileSync(configPath));

// ? Electron API k�pr�s�
contextBridge.exposeInMainWorld("electronAPI", {
  printPDF: (filePath) => ipcRenderer.send("print-pdf", filePath),

  // ?? Otomatik g�ncelleme olaylar�
  onUpdateAvailable: (callback) => ipcRenderer.on("update_available", callback),
  onUpdateDownloaded: (callback) => ipcRenderer.on("update_downloaded", callback),
  quitAndInstall: () => ipcRenderer.send("quit_and_install"),
});

// ? Config'e eri�im
contextBridge.exposeInMainWorld("emrConfig", {
  get: () => config,
});
