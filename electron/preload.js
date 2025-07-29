const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  // Yazd�rma i�lemleri (iste�e ba�l� kullan�l�yorsa)
  printPDF: (filePath) => ipcRenderer.send("print-pdf", filePath),

  // Otomatik g�ncellemeler
  onUpdateAvailable: (callback) => ipcRenderer.on("update_available", callback),
  onUpdateDownloaded: (callback) => ipcRenderer.on("update_downloaded", callback),
  quitAndInstall: () => ipcRenderer.send("quit_and_install"),
});
