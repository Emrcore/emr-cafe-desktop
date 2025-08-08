const { contextBridge, ipcRenderer } = require("electron");
const fs = require("fs");
const path = require("path");

function getServerUrl() {
  const possiblePaths = [
    path.join(process.resourcesPath, "app.asar.unpacked", "electron", "ip-config.json"),
    path.join(__dirname, "ip-config.json"),
  ];

  for (const p of possiblePaths) {
    try {
      if (fs.existsSync(p)) {
        const data = fs.readFileSync(p, "utf8");
        return JSON.parse(data).serverUrl;
      }
    } catch (err) {
      console.error("ip-config.json okunamadı:", err);
    }
  }

  return null;
}

contextBridge.exposeInMainWorld("electronAPI", {
  // Sunucu URL'si
  getServerUrl: () => getServerUrl(),

  // Yazıcılar
  printReceipt: (data) => ipcRenderer.invoke("print-receipt", data),
  printKitchen: (order) => ipcRenderer.invoke("print-kitchen", order),
  printPDF: (filePath) => ipcRenderer.send("print-pdf", filePath),

  // Otomatik güncelleme
  onUpdateAvailable: (callback) => ipcRenderer.on("update_available", callback),
  onUpdateDownloaded: (callback) => ipcRenderer.on("update_downloaded", callback),
  quitAndInstall: () => ipcRenderer.send("quit_and_install"),
});
