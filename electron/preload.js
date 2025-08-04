const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  // ? M��teri fi�i yazd�rma (ESC/POS veya sim�lasyon)
  printReceipt: (data) => ipcRenderer.invoke("print-receipt", data),

  // ? Mutfak fi�i yazd�rma (ESC/POS veya sim�lasyon)
  printKitchen: (order) => ipcRenderer.invoke("print-kitchen", order),

  // ? PDF yazd�rma (�nceden tan�ml�)
  printPDF: (filePath) => ipcRenderer.send("print-pdf", filePath),

  // ? Otomatik g�ncellemeler
  onUpdateAvailable: (callback) => ipcRenderer.on("update_available", callback),
  onUpdateDownloaded: (callback) => ipcRenderer.on("update_downloaded", callback),
  quitAndInstall: () => ipcRenderer.send("quit_and_install"),
});
