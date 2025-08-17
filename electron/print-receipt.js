// electron/print-receipt.js
const escpos = require("escpos");

// USB veya Ethernet ba�lant�s�
// USB: const device = new escpos.USB();
// LAN: const device = new escpos.Network("192.168.1.50");
const device = new escpos.USB();

const printer = new escpos.Printer(device, { encoding: "CP857" }); // T�rk�e karakter deste�i

async function printReceipt(invoice) {
  return new Promise((resolve, reject) => {
    try {
      if (!invoice || !invoice.items || invoice.items.length === 0) {
        return reject("Bo� fatura/fi� yazd�r�lamaz.");
      }

      device.open(() => {
        printer
          .align("CT")
          .style("B")
          .size(1, 1)
          .text(invoice.businessName || "��LETME")
          .style("NORMAL")
          .text("-----------------------------")
          .align("LT")
          .text(`Fatura No : ${invoice.invoiceNumber}`)
          .text(`Tarih     : ${new Date(invoice.createdAt).toLocaleString("tr-TR")}`)
          .text(`M��teri   : ${invoice.customerName || "-"}`)
          .text(`�deme T�r�: ${invoice.paymentType}`)
          .text("-----------------------------")
          .align("LT");

        // �r�nler
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
          .text("Te�ekk�r Ederiz")
          .text("www.emrcore.com.tr")
          .cut()
          .cashdraw(2) // ?? Kasa �ekmecesini a�
          .close();

        resolve("Fi� ba�ar�yla yazd�r�ld�.");
      });
    } catch (err) {
      reject(err);
    }
  });
}

module.exports = { printReceipt };
