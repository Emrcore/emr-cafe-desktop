const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema(
  {
    tenant: { type: String, required: true }, // subdomain veya i�letme ad�
    currency: { type: String, default: "?" },
    printerIp: String,
    logoUrl: String,             // QR men�de kullan�lacak logo
    menuTitle: String,           // Men� ba�l��� (�rn: Emirhan Cafe Men�s�)
    theme: { type: String, default: "default" },
    // Di�er �zel ayarlar da burada tutulabilir
  },
  { strict: false, timestamps: true }
);

module.exports = (connection) => connection.model("Settings", settingsSchema);
