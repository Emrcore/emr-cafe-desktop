const express = require("express");
const router = express.Router();
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const getTenantDb = require("../db");
const SaleModel = require("../models/Sale");
const InvoiceModel = require("../models/Invoice");
const generateInvoicePDF = require("../utils/generateInvoicePDF"); // ? toplu pdf

// ? Toplu fatura (se�ili sat��lara �zel PDF)
router.post("/generate", async (req, res) => {
  try {
    const { sales } = req.body;
    if (!sales || !Array.isArray(sales) || sales.length === 0) {
      return res.status(400).json({ message: "Ge�ersiz sat�� listesi" });
    }

    const buffer = await generateInvoicePDF(sales);

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=fatura_${Date.now()}.pdf`,
    });
    res.send(buffer);
  } catch (err) {
    console.error("Toplu fatura olu�turma hatas�:", err);
    res.status(500).json({ message: "Fatura olu�turulamad�" });
  }
});

// ? Tek sat��a �zel fatura olu�turma
router.post("/:saleId", async (req, res) => {
  try {
    const { customerName } = req.body;
    const { saleId } = req.params;

    const connection = getTenantDb(req.tenantDbName);
    const Sale = SaleModel(connection);
    const Invoice = InvoiceModel(connection);

    const sale = await Sale.findById(saleId);
    if (!sale) return res.status(404).json({ message: "Sat�� bulunamad�" });

    if (!Array.isArray(sale.orders) || sale.orders.length === 0) {
      return res.status(400).json({ message: "Sipari� bilgileri eksik" });
    }

    // Fatura numaras� �ret
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

    // Font deste�i
    const fontPath = path.join(__dirname, "..", "fonts", "Roboto-Regular.ttf");
    if (fs.existsSync(fontPath)) {
      doc.registerFont("default", fontPath);
      doc.font("default");
    }

    doc.fontSize(18).text(`${tenantPrefix} - Fatura`, { align: "center" }).moveDown();
    doc.fontSize(12).text(`Fatura No: ${invoiceNo}`);
    doc.text(`Tarih: ${new Date().toLocaleString("tr-TR")}`);
    doc.text(`M��teri: ${customerName || "Genel"}`).moveDown();

    doc.text("�r�nler:", { underline: true }).moveDown(0.5);
    sale.orders.forEach((item) => {
      const line = `${item.qty} x ${item.name} = ${(item.price * item.qty).toFixed(2)} ?`;
      doc.text(line);
    });

    doc.moveDown();
    doc.text(`Toplam Tutar: ${Number(sale.total || 0).toFixed(2)} ?`);
    doc.text(`�deme T�r�: ${sale.paymentMethod || "Belirtilmemi�"}`);
    doc.end();

    // Veritaban�na kay�t
    const invoice = await Invoice.create({
      invoiceNo,
      saleId,
      customerName,
      pdfPath: `/invoices/${invoiceNo}.pdf`,
    });

    res.json({ message: "Fatura olu�turuldu", invoice });
  } catch (err) {
    console.error("Fatura olu�turma hatas�:", err);
    res.status(500).json({ message: "Sunucu hatas�" });
  }
});

// ? PDF indirme
router.get("/download/:file", (req, res) => {
  const fileName = req.params.file;
  const filePath = path.join(__dirname, "..", "invoices", fileName);

  if (!fs.existsSync(filePath)) {
    return res.status(404).send("Dosya bulunamad�");
  }

  res.download(filePath);
});

module.exports = router;
