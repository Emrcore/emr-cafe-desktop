const express = require("express");
const router = express.Router();
const Log = require("../models/Log");

// T�m loglar� getir (admin)
router.get("/", async (req, res) => {
  try {
    const logs = await Log.find().sort({ createdAt: -1 }).limit(100);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: "Log verisi al�namad�" });
  }
});

module.exports = router;
