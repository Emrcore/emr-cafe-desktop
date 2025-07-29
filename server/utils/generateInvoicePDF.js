const PDFDocument = require("pdfkit");

module.exports = async function generateInvoicePDF(sales) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument();
      const buffers = [];

      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      doc.fontSize(16).text("TOPLU FATURA", { align: "center" }).moveDown();

      sales.forEach((sale, idx) => {
        doc.fontSize(12).text(`Masa: ${sale.tableId}`);
        doc.text(`Tutar: ${sale.total} ?`);
        doc.text(`Tarih: ${new Date(sale.date).toLocaleString("tr-TR")}`);
        doc.text("Sipariþler:");
        sale.orders.forEach((o) => {
          doc.text(`- ${o.name} x${o.qty} = ${o.price * o.qty} ?`);
        });
        doc.moveDown();
      });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};
