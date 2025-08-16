// routes/reports.js
const express = require("express");
const router = express.Router();
const XLSX = require("xlsx");
const { getTenantDb } = require("../db");
const SaleModelFactory = require("../models/Sale");

// JSON rapor (isteğe bağlı tarih filtreli)
router.get("/", async (req, res) => {
  try {
    const connection = await getTenantDb(req);         // ✅ await
    const Sale = SaleModelFactory(connection);

    const { date } = req.query;
    const filter = {};

    if (date) {
      // "YYYY-MM-DD" için gün aralığı
      const start = new Date(`${date}T00:00:00.000Z`);
      const end = new Date(`${date}T23:59:59.999Z`);

      // Şemanızda createdAt varsa onu, yoksa date alanını kullan
      filter.$or = [
        { createdAt: { $gte: start, $lte: end } },
        { date: { $gte: start, $lte: end } },
      ];
    }

    const sales = await Sale.find(filter).lean();
    res.json(sales);
  } catch (err) {
    console.error("Satış raporu okuma hatası:", err);
    res.status(500).json({ message: "Sunucu hatası" });
  }
});

// Excel çıktısı
router.get("/excel", async (req, res) => {
  try {
    const connection = await getTenantDb(req);         // ✅ await
    const Sale = SaleModelFactory(connection);

    const sales = await Sale.find().lean();

    const flatRows = sales.flatMap((sale) =>
      (sale.orders || []).map((o) => ({
        Tarih: new Date(sale.createdAt || sale.date).toLocaleString(), // createdAt öncelik
        Masa: sale.tableId,
        Ürün: o.name,
        Adet: o.qty,
        Fiyat: o.price,
        AraToplam: (Number(o.price || 0) * Number(o.qty || 0)).toFixed(2),
        GenelToplam: Number(sale.total || 0).toFixed(2),
        Ödeme: sale.paymentMethod || "",
      }))
    );

    const worksheet = XLSX.utils.json_to_sheet(flatRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Satışlar");

    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
    res.setHeader("Content-Disposition", "attachment; filename=rapor.xlsx");
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.send(buffer);
  } catch (err) {
    console.error("Excel raporu hatası:", err);
    res.status(500).json({ message: "Sunucu hatası" });
  }
});

module.exports = router;
