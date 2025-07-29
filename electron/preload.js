const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  // Yazdırma işlemleri (isteğe bağlı kullanılıyorsa)
  printPDF: (filePath) => ipcRenderer.send("print-pdf", filePath),

  // Otomatik güncellemeler
  onUpdateAvailable: (callback) => ipcRenderer.on("update_available", callback),
  onUpdateDownloaded: (callback) => ipcRenderer.on("update_downloaded", callback),
  quitAndInstall: () => ipcRenderer.send("quit_and_install"),
});
