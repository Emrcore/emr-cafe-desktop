const express = require("express");
const router = express.Router();
const XLSX = require("xlsx");
const getTenantDb = require("../db");
const SaleModel = require("../models/Sale");

// JSON rapor (isteğe bağlı tarih filtreli)
router.get("/", async (req, res) => {
  try {
    const connection = getTenantDb(req.tenantDbName);
    const Sale = SaleModel(connection);

    const { date } = req.query;
    let filter = {};
    if (date) {
      // Yalnızca belirli günün satışları (örn: "2025-07-23")
      filter.date = {
        $gte: new Date(date + "T00:00:00.000Z"),
        $lte: new Date(date + "T23:59:59.999Z"),
      };
    }

    const sales = await Sale.find(filter);
    res.json(sales);
  } catch (err) {
    console.error("Satış raporu okuma hatası:", err.message);
    res.status(500).json({ message: "Sunucu hatası" });
  }
});

// Excel çıktısı
router.get("/excel", async (req, res) => {
  try {
    const connection = getTenantDb(req.tenantDbName);
    const Sale = SaleModel(connection);

    const sales = await Sale.find();

    const flatRows = sales.flatMap((sale) =>
      sale.orders.map((o) => ({
        Tarih: new Date(sale.date).toLocaleString(),
        Masa: sale.tableId,
        Ürün: o.name,
        Adet: o.qty,
        Fiyat: o.price,
        AraToplam: o.price * o.qty,
        GenelToplam: sale.total?.toFixed(2) || "",
        Ödeme: sale.paymentMethod,
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
    console.error("Excel raporu hatası:", err.message);
    res.status(500).json({ message: "Sunucu hatası" });
  }
});

module.exports = router;
