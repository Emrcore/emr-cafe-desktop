const express = require("express");
const router = express.Router();
const Invoice = require("../models/Invoice");
const generateInvoicePdf = require("../utils/generateInvoicePdf");

function generateInvoiceNumber() {
  return "INV-" + new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 14);
}

// ? Yeni fatura oluþtur
router.post("/generate", async (req, res) => {
  try {
    const { tableId, paymentType, items = [], customerName } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "En az bir ürün gereklidir." });
    }

    const newInvoice = new Invoice({
      invoiceNumber: generateInvoiceNumber(),
      tableId,
      paymentType,
      customerName,
      items: items.map((item) => ({
        name: item.name,
        price: item.price,
        quantity: item.quantity || 1,
      })),
    });

    const saved = await newInvoice.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error("?? Fatura oluþturma hatasý:", err);
    res.status(500).json({ error: err.message });
  }
});

// ? PDF oluþturma endpoint'i
router.get("/:id/pdf", async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).send("Fatura bulunamadý");

    generateInvoicePdf(invoice, res);
  } catch (err) {
    console.error("PDF oluþturma hatasý:", err);
    res.status(500).send("PDF oluþturulurken hata oluþtu.");
  }
});

module.exports = router;
