const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  // ? Müşteri fişi yazdırma (ESC/POS veya simülasyon)
  printReceipt: (data) => ipcRenderer.invoke("print-receipt", data),

  // ? Mutfak fişi yazdırma (ESC/POS veya simülasyon)
  printKitchen: (order) => ipcRenderer.invoke("print-kitchen", order),

  // ? PDF yazdırma (önceden tanımlı)
  printPDF: (filePath) => ipcRenderer.send("print-pdf", filePath),

  // ? Otomatik güncellemeler
  onUpdateAvailable: (callback) => ipcRenderer.on("update_available", callback),
  onUpdateDownloaded: (callback) => ipcRenderer.on("update_downloaded", callback),
  quitAndInstall: () => ipcRenderer.send("quit_and_install"),
});
