// generateInvoicePdf.js
const PDFDocument = require("pdfkit");
const { finished } = require("stream");
const fs = require("fs");
const path = require("path");

/** ===================== Yardýmcýlar ===================== **/
function toMoney(n) {
  const v = Number(n || 0);
  return "?" + v.toFixed(2);
}
function safeFileName(name) {
  return String(name ?? "NA").replace(/[^\w.-]+/g, "_");
}
function getTenantName(invoice) {
  // Sende hangi alan varsa onu alalým:
  const name =
    invoice?.tenantName ||
    invoice?.businessName ||
    invoice?.companyName ||
    invoice?.tenant?.displayName ||
    "EMR CAFE";
  try {
    return String(name).toLocaleUpperCase("tr-TR");
  } catch {
    return String(name).toUpperCase();
  }
}

/**
 * Monospace bir font gömmeye çalýþýr:
 *   - ./fonts/DejaVuSansMono.ttf
 *   - ../fonts/DejaVuSansMono.ttf
 *   - resources içinde (electron paketlemede)
 * Yoksa "Courier" fallback.
 */
function pickMonoFont() {
  const candidates = [
    path.join(__dirname, "fonts", "DejaVuSansMono.ttf"),
    path.join(process.cwd(), "fonts", "DejaVuSansMono.ttf"),
    path.join(process.resourcesPath || "", "fonts", "DejaVuSansMono.ttf"),
  ].filter(Boolean);

  for (const p of candidates) {
    try {
      if (fs.existsSync(p)) return p;
    } catch {}
  }
  return null;
}

/**
 * Monospaced sütun hizalama (42 karakter geniþlik tipik fiþ ölçüsü)
 * name | qty | unit | total
 * 24   | 4   | 6    | 8   (toplam 42)
 */
function formatLine(name, qty, unit, total, width = 42) {
  const col = { name: 24, qty: 4, unit: 6, total: 8 };
  const trimPad = (str, len, align = "left") => {
    let s = String(str ?? "");
    if (s.length > len) s = s.slice(0, len);
    if (s.length < len) {
      const pad = " ".repeat(len - s.length);
      s = align === "right" ? pad + s : s + pad;
    }
    return s;
  };

  const n = trimPad(name, col.name, "left");
  const q = trimPad(qty, col.qty, "right");
  const u = trimPad(unit, col.unit, "right");
  const t = trimPad(total, col.total, "right");
  const line = `${n}${q}${u}${t}`;
  return line.length > width ? line.slice(0, width) : line;
}
const divider = (w = 42) => "-".repeat(w);

/** ===================== Ana Fonksiyon ===================== **/
function generateInvoicePdf(invoice, res) {
  try {
    if (!invoice || !Array.isArray(invoice.items) || invoice.items.length === 0) {
      return res.status(400).send("Fatura ürün listesi boþ. PDF oluþturulamadý.");
    }

    // Fiþ tarzý için margin küçük tut, monospaced font kullan
    const doc = new PDFDocument({ size: "A4", margin: 36 }); // ~ dar kenar

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename=fatura-${safeFileName(invoice.invoiceNumber)}.pdf`
    );

    // Ýstemci baðlantýyý kapatýrsa doc'u sonlandýr
    res.on("close", () => {
      try { doc.end(); } catch (_) {}
    });

    // Hata yakalama
    doc.on("error", (err) => {
      console.error("PDF oluþturma hatasý:", err);
      if (!res.headersSent) res.status(500).send("PDF oluþturulurken hata oluþtu.");
    });

    // PDF'i yanýt akýþýna baðla
    doc.pipe(res);

    // ==== FONT ====
    const monoPath = pickMonoFont();
    if (monoPath) {
      doc.font(monoPath);
    } else {
      doc.font("Courier"); // fallback
    }

    // ==== Ýçerik ====
    const createdAt = invoice.createdAt ? new Date(invoice.createdAt) : new Date();
    const tenantTitle = getTenantName(invoice);
    const widthChars = 42; // hizalamalar bununla uyumlu

    // Baþlýk — Ýþletme adý büyük puntoda
    doc
      .fontSize(16)
      .text(tenantTitle, { align: "center" })
      .moveDown(0.2);

    doc
      .fontSize(12)
      .text("FÝÞ / SATIÞ DÖKÜMÜ", { align: "center" })
      .text(divider(widthChars), { align: "left" });

    // Fatura/fiþ metaveri
    const metaLeft = [
      `Fiþ No : ${invoice.invoiceNumber ?? "-"}`,
      `Tarih  : ${createdAt.toLocaleString("tr-TR")}`,
      `Müþteri: ${invoice.customerName || "-"}`,
      `Ödeme  : ${invoice.paymentType || "-"}`,
    ];
    metaLeft.forEach((l) => doc.text(l));
    doc.text(divider(widthChars));

    // Sütun baþlýklarý
    doc.fontSize(11).text(
      formatLine("Ürün", "Adet", "Birim", "Tutar", widthChars)
    );
    doc.text(divider(widthChars));

    // Satýrlar
    let subtotal = 0;
    invoice.items.forEach((item) => {
      const qty = Number(item.quantity || 1);
      const price = Number(item.price || 0);
      const lineTotal = qty * price;
      subtotal += lineTotal;

      // Ürün adýný çok uzunsa satýr altýna kýr (fiþ görseli için)
      const name = String(item.name || "-");
      const nameColWidth = 24;
      const chunks = [];

      // Basit kýrma: name'i 24’er karaktere böl
      for (let i = 0; i < name.length; i += nameColWidth) {
        chunks.push(name.slice(i, i + nameColWidth));
      }

      // Ýlk satýr tam sütun, alt satýrlar sadece isim kolonu
      chunks.forEach((chunk, idx) => {
        if (idx === 0) {
          doc.text(
            formatLine(
              chunk,
              String(qty),
              toMoney(price),
              toMoney(lineTotal),
              widthChars
            )
          );
        } else {
          // Devam satýrý (sadece ürün adý kolonu)
          doc.text(formatLine(chunk, "", "", "", widthChars));
        }
      });

      if (item.notes) {
        // Not varsa bir alt satýrda göster
        doc.text(formatLine("  ?? " + String(item.notes), "", "", "", widthChars));
      }
    });

    doc.text(divider(widthChars));

    // Toplamlar (KDV/iskonto yoksa direkt toplam)
    const total = invoice.total != null ? Number(invoice.total) : subtotal;

    doc
      .fontSize(12)
      .text(formatLine("Ara Toplam", "", "", toMoney(subtotal), widthChars))
      .text(formatLine("Genel Toplam", "", "", toMoney(total), widthChars));

    doc.moveDown(1);
    doc.fontSize(11).text("Teþekkür ederiz.", { align: "center" });

    // PDF’i bitir
    doc.end();

    // Stream düzgün kapandý mý takip et (opsiyonel)
    finished(res, (err) => {
      if (err) {
        console.error("PDF stream hatasý:", err);
        // headers zaten gönderilmiþ olur; burada ekstra cevap göndermeyiz
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
