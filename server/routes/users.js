// routes/users.js
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const { getTenantDb } = require("../db");          // ✅ destructure
const UserModelFactory = require("../models/User"); // ✅ factory

// Kullanıcıları listele (şifre hariç)
router.get("/", async (req, res) => {
  try {
    const connection = await getTenantDb(req);       // ✅ await
    const User = UserModelFactory(connection);       // ✅ factory kullan
    const users = await User.find({}, { password: 0 });
    res.json(users);
  } catch (err) {
    console.error("Kullanıcı listeleme hatası:", err);
    res.status(500).json({ message: "Sunucu hatası" });
  }
});

// Kullanıcı ekle
router.post("/", async (req, res) => {
  try {
    const { username, password, role } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: "Kullanıcı adı ve şifre zorunlu" });
    }

    const connection = await getTenantDb(req);       // ✅ await
    const User = UserModelFactory(connection);

    const existing = await User.findOne({ username });
    if (existing) return res.status(400).json({ message: "Kullanıcı zaten var" });

    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashed, role });
    await user.save();

    res.status(201).json({ message: "Kullanıcı eklendi" });
  } catch (err) {
    console.error("Kullanıcı ekleme hatası:", err);
    res.status(500).json({ message: "Sunucu hatası" });
  }
});

// Kullanıcı sil
router.delete("/:username", async (req, res) => {
  try {
    const connection = await getTenantDb(req);       // ✅ await
    const User = UserModelFactory(connection);

    await User.deleteOne({ username: req.params.username });
    res.json({ message: "Kullanıcı silindi" });
  } catch (err) {
    console.error("Kullanıcı silme hatası:", err);
    res.status(500).json({ message: "Sunucu hatası" });
  }
});

module.exports = router;
