const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose"); // ?? Global baðlantý
const UserModel = require("../models/User");

const User = UserModel(mongoose.connection); // ?? Global baðlantýdan model üret

// Login
router.post("/", async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      console.log("? Kullanýcý bulunamadý:", username);
      return res.status(401).json({ error: "Kullanýcý bulunamadý" });
    }

    const match = await bcrypt.compare(password, user.password);
    console.log("?? Þifre kontrolü:", match);

    if (!match) {
      console.log("? Þifre hatalý:", username);
      return res.status(401).json({ error: "Þifre hatalý" });
    }

    // Giriþ baþarýlý
    console.log("? Giriþ baþarýlý:", username);
    res.json({ username: user.username, role: user.role });

  } catch (err) {
    console.error("?? Giriþ sýrasýnda hata:", err.message);
    res.status(500).json({ error: "Sunucu hatasý" });
  }
});

module.exports = router;
