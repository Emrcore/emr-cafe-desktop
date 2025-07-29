const express = require("express");
const router = express.Router();
const getTenantDb = require("../db");
const SettingsModel = require("../models/Settings");

// Ayarları getir
router.get("/", async (req, res) => {
  try {
    const connection = getTenantDb(req.tenantDbName);
    const Settings = SettingsModel(connection);
    // Her tenant'ta 1 tane settings kaydı olacak
    let settings = await Settings.findOne();
    if (!settings) {
      // Yoksa default kayıt oluştur
      settings = new Settings();
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

    // Tek doküman güncelleme/upsert
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings(req.body);
    } else {
      Object.assign(settings, req.body);
    }
    await settings.save();
    res.json({ message: "Ayarlar güncellendi", settings });
  } catch (err) {
    console.error("Ayar güncelleme hatası:", err);
    res.status(500).json({ message: "Sunucu hatası" });
  }
});

module.exports = router;
