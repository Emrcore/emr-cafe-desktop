const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema(
  {
    tenant: { type: String, required: true }, // subdomain veya iþletme adý
    currency: { type: String, default: "?" },
    printerIp: String,
    logoUrl: String,             // QR menüde kullanýlacak logo
    menuTitle: String,           // Menü baþlýðý (örn: Emirhan Cafe Menüsü)
    theme: { type: String, default: "default" },
    // Diðer özel ayarlar da burada tutulabilir
  },
  { strict: false, timestamps: true }
);

module.exports = (connection) => connection.model("Settings", settingsSchema);
