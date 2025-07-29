const express = require("express");
const router = express.Router();
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const getTenantDb = require("../db");
const SaleModel = require("../models/Sale");
const InvoiceModel = require("../models/Invoice");
const generateInvoicePDF = require("../utils/generateInvoicePDF"); // ? toplu pdf

// ? Toplu fatura (seçili satýþlara özel PDF)
router.post("/generate", async (req, res) => {
  try {
    const { sales } = req.body;
    if (!sales || !Array.isArray(sales) || sales.length === 0) {
      return res.status(400).json({ message: "Geçersiz satýþ listesi" });
    }

    const buffer = await generateInvoicePDF(sales);

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=fatura_${Date.now()}.pdf`,
    });
    res.send(buffer);
  } catch (err) {
    console.error("Toplu fatura oluþturma hatasý:", err);
    res.status(500).json({ message: "Fatura oluþturulamadý" });
  }
});

// ? Tek satýþa özel fatura oluþturma
router.post("/:saleId", async (req, res) => {
  try {
    const { customerName } = req.body;
    const { saleId } = req.params;

    const connection = getTenantDb(req.tenantDbName);
    const Sale = SaleModel(connection);
    const Invoice = InvoiceModel(connection);

    const sale = await Sale.findById(saleId);
    if (!sale) return res.status(404).json({ message: "Satýþ bulunamadý" });

    if (!Array.isArray(sale.orders) || sale.orders.length === 0) {
      return res.status(400).json({ message: "Sipariþ bilgileri eksik" });
    }

    // Fatura numarasý üret
    const tenantPrefix = (req.tenantDbName || "GENEL").split("_")[0].toUpperCase();
    const last = await Invoice.findOne().sort({ createdAt: -1 });
    const lastNo = last?.invoiceNo?.split("-")?.pop() || "0";
    const nextNo = parseInt(lastNo) + 1;
    const year = new Date().getFullYear();
    const invoiceNo = `${tenantPrefix}-FTR-${year}-${nextNo.toString().padStart(4, "0")}`;

    // PDF yolu
    const invoicesDir = path.join(__dirname, "..", "invoices");
    fs.mkdirSync(invoicesDir, { recursive: true });
    const pdfPath = path.join(invoicesDir, `${invoiceNo}.pdf`);

    const doc = new PDFDocument({ margin: 50 });
    doc.pipe(fs.createWriteStream(pdfPath));

    // Font desteði
    const fontPath = path.join(__dirname, "..", "fonts", "Roboto-Regular.ttf");
    if (fs.existsSync(fontPath)) {
      doc.registerFont("default", fontPath);
      doc.font("default");
    }

    doc.fontSize(18).text(`${tenantPrefix} - Fatura`, { align: "center" }).moveDown();
    doc.fontSize(12).text(`Fatura No: ${invoiceNo}`);
    doc.text(`Tarih: ${new Date().toLocaleString("tr-TR")}`);
    doc.text(`Müþteri: ${customerName || "Genel"}`).moveDown();

    doc.text("Ürünler:", { underline: true }).moveDown(0.5);
    sale.orders.forEach((item) => {
      const line = `${item.qty} x ${item.name} = ${(item.price * item.qty).toFixed(2)} ?`;
      doc.text(line);
    });

    doc.moveDown();
    doc.text(`Toplam Tutar: ${Number(sale.total || 0).toFixed(2)} ?`);
    doc.text(`Ödeme Türü: ${sale.paymentMethod || "Belirtilmemiþ"}`);
    doc.end();

    // Veritabanýna kayýt
    const invoice = await Invoice.create({
      invoiceNo,
      saleId,
      customerName,
      pdfPath: `/invoices/${invoiceNo}.pdf`,
    });

    res.json({ message: "Fatura oluþturuldu", invoice });
  } catch (err) {
    console.error("Fatura oluþturma hatasý:", err);
    res.status(500).json({ message: "Sunucu hatasý" });
  }
});

// ? PDF indirme
router.get("/download/:file", (req, res) => {
  const fileName = req.params.file;
  const filePath = path.join(__dirname, "..", "invoices", fileName);

  if (!fs.existsSync(filePath)) {
    return res.status(404).send("Dosya bulunamadý");
  }

  res.download(filePath);
});

module.exports = router;
