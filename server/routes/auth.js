const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const UserModel = require("../models/User");
const tenantMiddleware = require("../middleware/tenant"); // ? Ekledik

// ? tenantMiddleware'i sadece bu route için uygula
router.post("/", tenantMiddleware, async (req, res) => {
  const { username, password } = req.body;

  try {
    const tenantId = req.tenant?.tenantId || "global";
    console.log("?? Giriþ yapýlan tenant:", tenantId);

    const db = req.db || mongoose.connection;
    const User = UserModel(db);

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

    console.log("? Giriþ baþarýlý:", username);
    res.json({ username: user.username, role: user.role });

  } catch (err) {
    console.error("?? Giriþ sýrasýnda hata:", err.message);
    res.status(500).json({ error: "Sunucu hatasý" });
  }
});

module.exports = router;
