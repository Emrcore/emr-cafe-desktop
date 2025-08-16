// routes/sales.js
const express = require("express");
const router = express.Router();
const { getTenantDb } = require("../db");
const SaleModelFactory = require("../models/Sale");

// ?? Sat�� verisi kaydet
router.post("/", async (req, res) => {
  try {
    const connection = await getTenantDb(req);      // ? await
    const Sale = SaleModelFactory(connection);

    const { tableId, orders, total, paymentMethod } = req.body || {};
    if (!tableId || !Array.isArray(orders)) {
      return res.status(400).json({ message: "tableId ve orders zorunludur" });
    }

    const sale = await Sale.create({
      tableId,
      orders,
      total: Number(total || 0),
      paymentMethod,
      createdAt: new Date(), // �eman�zda timestamps:true varsa buna gerek yok
    });

    res.status(201).json(sale);
  } catch (err) {
    console.error("Sat�� kayd� hatas�:", err);
    res.status(500).json({ message: "Sat�� kaydedilemedi" });
  }
});

// ?? Son sat�� kayd�n� getir (fatura i�in)
router.get("/last", async (req, res) => {
  try {
    const { table } = req.query;
    if (!table) return res.status(400).json({ message: "table parametresi gerekli" });

    const connection = await getTenantDb(req);      // ? await
    const Sale = SaleModelFactory(connection);

    const sale = await Sale.findOne({ tableId: table })
      .sort({ createdAt: -1 })
      .lean();

    if (!sale) return res.status(404).json({ message: "Sat�� bulunamad�" });

    res.json(sale);
  } catch (err) {
    console.error("Sat�� sorgulama hatas�:", err);
    res.status(500).json({ message: "Sunucu hatas�" });
  }
});

module.exports = router;
