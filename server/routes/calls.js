// routes/calls.js
const express = require("express");
const router = express.Router();
const WaiterCall = require("../models/WaiterCall");

// Yeni �a�r� olu�tur
router.post("/", async (req, res) => {
  const { tableName } = req.body;
  if (!tableName) return res.status(400).json({ error: "Masa ad� gerekli" });

  try {
    const newCall = await WaiterCall.create({ tableName });
    req.io.emit("new-call", newCall); // Socket ile garsonlara g�nder
    res.status(201).json(newCall);
  } catch (err) {
    res.status(500).json({ error: "�a�r� olu�turulamad�" });
  }
});

// T�m a��k �a�r�lar
router.get("/", async (req, res) => {
  try {
    const calls = await WaiterCall.find({ status: "open" }).sort({ createdAt: -1 });
    res.json(calls);
  } catch (err) {
    res.status(500).json({ error: "�a�r�lar al�namad�" });
  }
});

// �a�r�y� tamamla
router.put("/:id/done", async (req, res) => {
  try {
    const updated = await WaiterCall.findByIdAndUpdate(
      req.params.id,
      { status: "done" },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "�a�r� kapat�lamad�" });
  }
});

module.exports = router;
