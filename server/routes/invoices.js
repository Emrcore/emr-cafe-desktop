const express = require("express");
const router = express.Router();
const Invoice = require("../models/Invoice");
const generateInvoicePdf = require("../utils/generateInvoicePdf");

router.get("/:id/pdf", async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).send("Fatura bulunamadý");

    generateInvoicePdf(invoice, res);
  } catch (err) {
    res.status(500).send("Hata: " + err.message);
  }
});

module.exports = router;
