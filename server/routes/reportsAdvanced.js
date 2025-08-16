// routes/reportsAdvanced.js
const express = require("express");
const router = express.Router();
const { getTenantDb } = require("../db");
const SaleModelFactory = require("../models/Sale");
const ProductModelFactory = require("../models/Product");

router.post("/", async (req, res) => {
  try {
    const { startDate, endDate } = req.body || {};
    if (!startDate || !endDate) {
      return res.status(400).json({ message: "startDate ve endDate zorunludur" });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    // gün sonuna kadar dahil et
    end.setHours(23, 59, 59, 999);

    const connection = await getTenantDb(req); // ? await
    const Sale = SaleModelFactory(connection);
    const Product = ProductModelFactory(connection);

    // Ürün isimleri set'i (silinen ürünleri dýþlamak için)
    const [sales, existingProducts] = await Promise.all([
      Sale.find({
        $or: [
          { createdAt: { $gte: start, $lte: end } },
          { date: { $gte: start, $lte: end } }, // bazý þemalarda 'date' alaný olabilir
        ],
      }).lean(),
      Product.find({}, "name").lean(),
    ]);

    const existingProductNames = new Set(existingProducts.map((p) => p.name));

    const summary = {
      totalSales: 0,
      productSummary: {}, // { [name]: { count, total } }
      userSummary: {},    // { [username]: total }
    };

    for (const s of sales) {
      const filteredOrders = (s.orders || []).filter((item) =>
        existingProductNames.has(item.name)
      );
      if (filteredOrders.length === 0) continue;

      summary.totalSales += Number(s.total || 0);

      for (const item of filteredOrders) {
        const name = item.name || "Bilinmeyen Ürün";
        const qty = Number(item.qty || 1);
        const price = Number(item.price || 0);

        if (!summary.productSummary[name]) {
          summary.productSummary[name] = { count: 0, total: 0 };
        }
        summary.productSummary[name].count += qty;
        summary.productSummary[name].total += price * qty;
      }

      const user = s.createdBy || "Bilinmiyor";
      summary.userSummary[user] = (summary.userSummary[user] || 0) + Number(s.total || 0);
    }

    // Detaylý ürün özeti (birim fiyat dahil)
    const detailedProductSummary = Object.entries(summary.productSummary).map(
      ([name, { count, total }]) => ({
        name,
        count,
        total,
        unitPrice: count > 0 ? Number(total / count).toFixed(2) : "0.00",
      })
    );

    res.json({
      salesCount: sales.length,
      summary: { ...summary, detailedProductSummary },
    });
  } catch (err) {
    console.error("Rapor hatasý:", err);
    res.status(500).json({ message: "Sunucu hatasý" });
  }
});

module.exports = router;
