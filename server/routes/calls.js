// routes/calls.js
const express = require("express");
const router = express.Router();
const WaiterCall = require("../models/WaiterCall");

// Yeni çaðrý oluþtur
router.post("/", async (req, res) => {
  const { tableName } = req.body;
  if (!tableName) return res.status(400).json({ error: "Masa adý gerekli" });

  try {
    const newCall = await WaiterCall.create({ tableName });
    req.io.emit("new-call", newCall); // Socket ile garsonlara gönder
    res.status(201).json(newCall);
  } catch (err) {
    res.status(500).json({ error: "Çaðrý oluþturulamadý" });
  }
});

// Tüm açýk çaðrýlar
router.get("/", async (req, res) => {
  try {
    const calls = await WaiterCall.find({ status: "open" }).sort({ createdAt: -1 });
    res.json(calls);
  } catch (err) {
    res.status(500).json({ error: "Çaðrýlar alýnamadý" });
  }
});

// Çaðrýyý tamamla
router.put("/:id/done", async (req, res) => {
  try {
    const updated = await WaiterCall.findByIdAndUpdate(
      req.params.id,
      { status: "done" },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Çaðrý kapatýlamadý" });
  }
});

module.exports = router;
