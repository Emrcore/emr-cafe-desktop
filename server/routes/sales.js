const express = require("express");
const router = express.Router();
const getTenantDb = require("../db");
const SaleModel = require("../models/Sale");

// ? Satýþ verisi kaydet
router.post("/", async (req, res) => {
  try {
    const connection = getTenantDb(req.tenantDbName);
    const Sale = SaleModel(connection);

    const { tableId, orders, total, paymentMethod } = req.body;

    const sale = await Sale.create({
      tableId,
      orders,
      total: Number(total || 0), // ? toFixed hatasýna karþý önlem
      paymentMethod,
      createdAt: new Date()
    });

    res.status(201).json(sale);
  } catch (err) {
    console.error("Satýþ kaydý hatasý:", err.message);
    res.status(500).json({ message: "Satýþ kaydedilemedi" });
  }
});

// ? Son satýþ kaydýný getir (fatura için)
router.get("/last", async (req, res) => {
  try {
    const { table } = req.query;
    const connection = getTenantDb(req.tenantDbName);
    const Sale = SaleModel(connection);

    const sale = await Sale.findOne({ tableId: table })
      .sort({ createdAt: -1 })
      .limit(1);

    if (!sale) return res.status(404).json({ message: "Satýþ bulunamadý" });

    res.json(sale);
  } catch (err) {
    console.error("Satýþ sorgulama hatasý:", err.message);
    res.status(500).json({ message: "Sunucu hatasý" });
  }
});

module.exports = router;
