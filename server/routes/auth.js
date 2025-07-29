const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose"); // ?? Global ba�lant�
const UserModel = require("../models/User");

const User = UserModel(mongoose.connection); // ?? Global ba�lant�dan model �ret

// Login
router.post("/", async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      console.log("? Kullan�c� bulunamad�:", username);
      return res.status(401).json({ error: "Kullan�c� bulunamad�" });
    }

    const match = await bcrypt.compare(password, user.password);
    console.log("?? �ifre kontrol�:", match);

    if (!match) {
      console.log("? �ifre hatal�:", username);
      return res.status(401).json({ error: "�ifre hatal�" });
    }

    // Giri� ba�ar�l�
    console.log("? Giri� ba�ar�l�:", username);
    res.json({ username: user.username, role: user.role });

  } catch (err) {
    console.error("?? Giri� s�ras�nda hata:", err.message);
    res.status(500).json({ error: "Sunucu hatas�" });
  }
});

module.exports = router;
