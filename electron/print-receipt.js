// electron/print-receipt.js
const escpos = require("escpos");

// USB veya Ethernet baðlantýsý
// USB: const device = new escpos.USB();
// LAN: const device = new escpos.Network("192.168.1.50");
const device = new escpos.USB();

const printer = new escpos.Printer(device, { encoding: "CP857" }); // Türkçe karakter desteði

async function printReceipt(invoice) {
  return new Promise((resolve, reject) => {
    try {
      if (!invoice || !invoice.items || invoice.items.length === 0) {
        return reject("Boþ fatura/fiþ yazdýrýlamaz.");
      }

      device.open(() => {
        printer
          .align("CT")
          .style("B")
          .size(1, 1)
          .text(invoice.businessName || "ÝÞLETME")
          .style("NORMAL")
          .text("-----------------------------")
          .align("LT")
          .text(`Fatura No : ${invoice.invoiceNumber}`)
          .text(`Tarih     : ${new Date(invoice.createdAt).toLocaleString("tr-TR")}`)
          .text(`Müþteri   : ${invoice.customerName || "-"}`)
          .text(`Ödeme Türü: ${invoice.paymentType}`)
          .text("-----------------------------")
          .align("LT");

        // Ürünler
        invoice.items.forEach((item) => {
          const qty = item.quantity || 1;
          const line = `${item.name} x${qty}   ${(item.price * qty).toFixed(2)}?`;
          printer.text(line);
        });

        // Toplam
        const total = invoice.items.reduce(
          (sum, item) => sum + item.price * (item.quantity || 1),
          0
        );
        printer
          .text("-----------------------------")
          .align("RT")
          .style("B")
          .text(`TOPLAM: ${total.toFixed(2)}?`)
          .style("NORMAL")
          .text("-----------------------------")
          .align("CT")
          .text("Teþekkür Ederiz")
          .text("www.emrcore.com.tr")
          .cut()
          .cashdraw(2) // ?? Kasa çekmecesini aç
          .close();

        resolve("Fiþ baþarýyla yazdýrýldý.");
      });
    } catch (err) {
      reject(err);
    }
  });
}

module.exports = { printReceipt };
