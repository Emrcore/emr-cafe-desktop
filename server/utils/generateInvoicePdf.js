const PDFDocument = require("pdfkit");
const fs = require("fs");

function generateInvoicePdf(invoice, res) {
  const doc = new PDFDocument({ size: "A4", margin: 50 });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `inline; filename="${invoice.invoiceNumber}.pdf"`);

  doc.pipe(res);

  // Ba�l�k
  doc.fontSize(20).text("EMR CAFE", { align: "center" });
  doc.fontSize(12).text(`Fatura No: ${invoice.invoiceNumber}`, { align: "center" });
  doc.text(`Tarih: ${new Date(invoice.createdAt).toLocaleString("tr-TR")}`, { align: "center" });
  doc.moveDown();

  // Masa bilgileri
  doc.text(`Masa: ${invoice.tableName}`);
  doc.text(`�deme T�r�: ${invoice.paymentType}`);
  doc.moveDown();

  // Sipari� listesi
  doc.text("�r�nler:", { underline: true });
  invoice.orders.forEach((item) => {
    doc.text(`${item.productName} x${item.quantity} = ?${item.price * item.quantity}`);
  });

  // Toplam
  const total = invoice.total;
  const vat = total * 0.1;
  const subTotal = total - vat;

  doc.moveDown();
  doc.text(`Ara Toplam: ?${subTotal.toFixed(2)}`);
  doc.text(`KDV (%10): ?${vat.toFixed(2)}`);
  doc.text(`Toplam: ?${total.toFixed(2)}`);

  doc.end();
}

module.exports = generateInvoicePdf;
