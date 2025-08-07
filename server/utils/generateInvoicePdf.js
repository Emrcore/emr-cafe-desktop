const PDFDocument = require("pdfkit");
const { finished } = require("stream");

function generateInvoicePdf(invoice, res) {
  try {
    if (!invoice.items || invoice.items.length === 0) {
      res.status(400).send("Fatura �r�n listesi bo�. PDF olu�turulamad�.");
      return;
    }

    const doc = new PDFDocument({ size: "A4", margin: 50 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename=fatura-${invoice.invoiceNumber}.pdf`
    );

    // PDF'i yan�t ak���na ba�la
    doc.pipe(res);

    // Ba�l�k
    doc.fontSize(20).text("FATURA", { align: "center" }).moveDown();

    // Bilgiler
    doc.fontSize(12).text(`Fatura No: ${invoice.invoiceNumber}`);
    doc.text(`M��teri: ${invoice.customerName || "-"}`);
    doc.text(`Tarih: ${new Date(invoice.createdAt).toLocaleString("tr-TR")}`);
    doc.text(`�deme T�r�: ${invoice.paymentType}`);
    doc.moveDown();

    // �r�nler
    doc.fontSize(14).text("�r�nler:", { underline: true }).moveDown(0.5);

    invoice.items.forEach((item, i) => {
      const quantity = item.quantity || 1;
      doc
        .fontSize(12)
        .text(`${i + 1}. ${item.name} x${quantity} � ${(item.price * quantity).toFixed(2)} ?`);
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

    doc.end(); // ?? PDF olu�turmay� bitir

    // ? Stream'in d�zg�n bitmesini garanti et
    finished(doc, (err) => {
      if (err) {
        console.error("PDF stream hatas�:", err);
        if (!res.headersSent) res.status(500).send("PDF stream hatas�");
      }
    });
  } catch (error) {
    console.error("PDF olu�turma hatas�:", error);
    if (!res.headersSent) {
      res.status(500).send("PDF olu�turulurken hata olu�tu.");
    }
  }
}

module.exports = generateInvoicePdf;
