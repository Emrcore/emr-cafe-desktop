// models/Settings.js
const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema({
  currency: { type: String, default: "?" },
  printerIp: String,
  logoUrl: String,
  theme: String,
  // Dilersen diðer ayar alanlarýný buraya ekle
}, { strict: false }); // Ýstenirse farklý anahtarlar için

module.exports = (connection) => connection.model("Settings", settingsSchema);
