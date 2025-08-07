const PDFDocument = require("pdfkit");
const { finished } = require("stream");

function generateInvoicePdf(invoice, res) {
  try {
    if (!invoice.items || invoice.items.length === 0) {
      res.status(400).send("Fatura ürün listesi boþ. PDF oluþturulamadý.");
      return;
    }

    const doc = new PDFDocument({ size: "A4", margin: 50 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename=fatura-${invoice.invoiceNumber}.pdf`
    );

    // PDF'i yanýt akýþýna baðla
    doc.pipe(res);

    // Baþlýk
    doc.fontSize(20).text("FATURA", { align: "center" }).moveDown();

    // Bilgiler
    doc.fontSize(12).text(`Fatura No: ${invoice.invoiceNumber}`);
    doc.text(`Müþteri: ${invoice.customerName || "-"}`);
    doc.text(`Tarih: ${new Date(invoice.createdAt).toLocaleString("tr-TR")}`);
    doc.text(`Ödeme Türü: ${invoice.paymentType}`);
    doc.moveDown();

    // Ürünler
    doc.fontSize(14).text("Ürünler:", { underline: true }).moveDown(0.5);

    invoice.items.forEach((item, i) => {
      const quantity = item.quantity || 1;
      doc
        .fontSize(12)
        .text(`${i + 1}. ${item.name} x${quantity} — ${(item.price * quantity).toFixed(2)} ?`);
    });

    // Toplam
    const total = invoice.items.reduce(
      (sum, item) => sum + item.price * (item.quantity || 1),
      0
    );
    doc.moveDown();
    doc.fontSize(14).text(`Toplam Tutar: ${total.toFixed(2)} ?`, {
      align: "right",
    });

    doc.end(); // ?? PDF oluþturmayý bitir

    // ? Stream'in düzgün bitmesini garanti et
    finished(doc, (err) => {
      if (err) {
        console.error("PDF stream hatasý:", err);
        if (!res.headersSent) res.status(500).send("PDF stream hatasý");
      }
    });
  } catch (error) {
    console.error("PDF oluþturma hatasý:", error);
    if (!res.headersSent) {
      res.status(500).send("PDF oluþturulurken hata oluþtu.");
    }
  }
}

module.exports = generateInvoicePdf;
