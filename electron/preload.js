const { contextBridge, ipcRenderer } = require("electron");
const fs = require("fs");
const path = require("path");

const configPath = path.join(__dirname, "..", "config", "config.json");
const config = JSON.parse(fs.readFileSync(configPath));

contextBridge.exposeInMainWorld("electronAPI", {
  printPDF: (filePath) => ipcRenderer.send("print-pdf", filePath),
});

contextBridge.exposeInMainWorld("emrConfig", {
  get: () => config,
});
