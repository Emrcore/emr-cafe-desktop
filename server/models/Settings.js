// models/Settings.js
const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema({
  currency: { type: String, default: "?" },
  printerIp: String,
  logoUrl: String,
  theme: String,
  // Dilersen di�er ayar alanlar�n� buraya ekle
}, { strict: false }); // �stenirse farkl� anahtarlar i�in

module.exports = (connection) => connection.model("Settings", settingsSchema);
