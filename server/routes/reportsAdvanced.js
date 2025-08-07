const express = require("express");
const router = express.Router();
const getTenantDb = require("../db");
const SaleModel = require("../models/Sale");
const ProductModel = require("../models/Product");

router.post("/", async (req, res) => {
  try {
    const { startDate, endDate } = req.body;
    const connection = getTenantDb(req.tenantDbName);
    const Sale = SaleModel(connection);
    const Product = ProductModel(connection);

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59);

    const [sales, existingProducts] = await Promise.all([
      Sale.find({
        $or: [
          { createdAt: { $gte: start, $lte: end } },
          { date: { $gte: start, $lte: end } }
        ]
      }),
      Product.find({}, "name")
    ]);

    const existingProductNames = new Set(existingProducts.map(p => p.name));

    const summary = {
      totalSales: 0,
      productSummary: {},
      userSummary: {},
    };

    for (const s of sales) {
      const filteredOrders = (s.orders || []).filter(item =>
        existingProductNames.has(item.name)
      );

      if (filteredOrders.length === 0) continue;

      summary.totalSales += Number(s.total || 0);

      for (const item of filteredOrders) {
        const name = item.name || "Bilinmeyen Ürün";
        const qty = item.qty || 1;
        const price = item.price || 0;

        if (!summary.productSummary[name]) {
          summary.productSummary[name] = { count: 0, total: 0 };
        }

        summary.productSummary[name].count += qty;
        summary.productSummary[name].total += price * qty;
      }

      const user = s.createdBy || "Bilinmiyor";
      summary.userSummary[user] = (summary.userSummary[user] || 0) + Number(s.total || 0);
    }

    // Ýsteðe baðlý: Satýþ sayýsý ve fiyatlarý hem birlikte hem ayrý göstermek
    const detailedProductSummary = Object.entries(summary.productSummary).map(
      ([name, { count, total }]) => ({
        name,
        count,
        total,
        unitPrice: count > 0 ? (total / count).toFixed(2) : "0.00"
      })
    );

    res.json({ sales, summary: { ...summary, detailedProductSummary } });
  } catch (err) {
    console.error("Rapor hatasý:", err.message);
    res.status(500).json({ message: "Sunucu hatasý" });
  }
});

module.exports = router;
