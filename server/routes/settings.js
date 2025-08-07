const express = require("express");
const router = express.Router();
const getTenantDb = require("../db");
const SettingsModel = require("../models/Settings");

// Ayarları getir
router.get("/", async (req, res) => {
  try {
    const connection = getTenantDb(req.tenantDbName);
    const Settings = SettingsModel(connection);

    let settings = await Settings.findOne({ tenant: req.tenantDbName });

    if (!settings) {
      // Yeni default ayarlar
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

// Ayarları güncelle
router.post("/", async (req, res) => {
  try {
    const connection = getTenantDb(req.tenantDbName);
    const Settings = SettingsModel(connection);

    const data = {
      ...req.body,
      tenant: req.tenantDbName, // her ihtimale karşı tenant eşlemesi
    };

    let settings = await Settings.findOne({ tenant: req.tenantDbName });

    if (!settings) {
      settings = new Settings(data);
    } else {
      Object.assign(settings, data);
    }

    await settings.save();
    res.json({ message: "Ayarlar güncellendi", settings });
  } catch (err) {
    console.error("Ayar güncelleme hatası:", err);
    res.status(500).json({ message: "Sunucu hatası" });
  }
});

module.exports = router;
