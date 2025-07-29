const express = require("express");
const router = express.Router();
const getTenantDb = require("../db");
const SaleModel = require("../models/Sale");

router.post("/", async (req, res) => {
  try {
    const { startDate, endDate } = req.body;
    const connection = getTenantDb(req.tenantDbName);
    const Sale = SaleModel(connection);

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59);

    const sales = await Sale.find({
      $or: [
        { createdAt: { $gte: start, $lte: end } },
        { date: { $gte: start, $lte: end } }
      ]
    });

    const summary = {
      totalSales: 0,
      productSummary: {},
      userSummary: {},
    };

    for (const s of sales) {
      summary.totalSales += Number(s.total || 0);

      for (const item of s.orders || []) {
        const name = item.name || "Bilinmeyen Ürün";

        if (!summary.productSummary[name]) {
          summary.productSummary[name] = { count: 0, total: 0 };
        }

        summary.productSummary[name].count += item.qty || 1;
        summary.productSummary[name].total += (item.price || 0) * (item.qty || 1);
      }

      const user = s.createdBy || "Bilinmiyor";
      summary.userSummary[user] = (summary.userSummary[user] || 0) + Number(s.total || 0);
    }

    res.json({ sales, summary });
  } catch (err) {
    console.error("Rapor hatasý:", err.message);
    res.status(500).json({ message: "Sunucu hatasý" });
  }
});

module.exports = router;
