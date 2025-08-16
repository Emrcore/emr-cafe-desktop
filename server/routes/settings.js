// routes/settings.js
const express = require("express");
const router = express.Router();
const { getTenantDb } = require("../db");            // ✅ sadece gereken fonksiyon
const SettingsModelFactory = require("../models/Settings"); // ✅ factory

// Ayarları getir (yoksa varsayılan oluştur)
router.get("/", async (req, res) => {
  try {
    const connection = await getTenantDb(req);       // ✅ await
    const Settings = SettingsModelFactory(connection);

    let settings = await Settings.findOne({ tenant: req.tenantDbName });

    if (!settings) {
      settings = new Settings({
        tenant: req.tenantDbName,
        menuTitle: "Menü",
        logoUrl: "",
        currency: "₺",
      });
      await settings.save();
    }

    res.json(settings);
  } catch (err) {
    console.error("Ayar okuma hatası:", err);
    res.status(500).json({ message: "Sunucu hatası" });
  }
});

// Ayarları güncelle / oluştur
router.post("/", async (req, res) => {
  try {
    const connection = await getTenantDb(req);       // ✅ await
    const Settings = SettingsModelFactory(connection);

    const data = {
      ...req.body,
      tenant: req.tenantDbName, // güvenlik: doğru tenant'a yaz
    };

    let settings = await Settings.findOne({ tenant: req.tenantDbName });

    if (!settings) {
      settings = new Settings(data);
    } else {
      Object.assign(settings, data);
    }

    await settings.save();
    res.status(200).json({ message: "Ayarlar güncellendi", settings });
  } catch (err) {
    console.error("Ayar güncelleme hatası:", err);
    res.status(500).json({ message: "Sunucu hatası" });
  }
});

module.exports = router;
