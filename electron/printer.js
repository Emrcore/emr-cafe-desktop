// electron/printer.js
const fs = require("fs");
const path = require("path");
const escpos = require("escpos");

let USB, Network;
try { USB = require("escpos-usb"); } catch {}
try { Network = require("escpos-network"); } catch {}

// ---- Kal�c� cihaz cache'i ----
const DEVICES_PATH = path.join(__dirname, "devices.json");
function loadDevices() {
  try { return JSON.parse(fs.readFileSync(DEVICES_PATH, "utf8")); }
  catch { return {}; }
}
function saveDevices(data) {
  fs.mkdirSync(path.dirname(DEVICES_PATH), { recursive: true });
  fs.writeFileSync(DEVICES_PATH, JSON.stringify(data, null, 2), "utf8");
}

// ---- Yard�mc�lar ----
function money(n) { return "?" + Number(n || 0).toFixed(2); }
function divider(width = 42) { return "-".repeat(width); }
function enc() { return (loadDevices().encoding || "cp858"); } // T�rk�e karakter i�in iyi sonu� verir

// ---- Yaz�c� tespit/ba�lant� ----
function detectUsbPrinter() {
  if (!USB) return null;
  // Daha �nce kaydedilmi� id varsa onu kullan
  const cached = loadDevices().usb;
  if (cached?.vendorId && cached?.productId) {
    try {
      const device = new USB(cached.vendorId, cached.productId);
      return { type: "usb", device, info: cached };
    } catch (_) {}
  }

  // �lk bulunan USB yaz�c�y� deneyelim
  try {
    const device = new USB(); // default: ilk ayg�t
    // Vendor/Product id �ekmeye �al�� (baz� s�r�mlerde eri�im farkl�)
    const info = {};
    try {
      info.vendorId = device.device?.deviceDescriptor?.idVendor;
      info.productId = device.device?.deviceDescriptor?.idProduct;
    } catch {}
    // cachele
    const devices = loadDevices();
    devices.usb = { vendorId: info.vendorId, productId: info.productId };
    saveDevices(devices);

    return { type: "usb", device, info };
  } catch (e) {
    return null;
  }
}

function detectNetworkPrinter() {
  // Opsiyonel: env/config ile network fallback
  // �rn: process.env.ESC_POS_HOST ve ESC_POS_PORT (9100)
  const host = process.env.ESC_POS_HOST;
  const port = Number(process.env.ESC_POS_PORT || 9100);
  if (!Network || !host) return null;

  try {
    const device = new Network(host, port);
    const devices = loadDevices();
    devices.network = { host, port };
    saveDevices(devices);
    return { type: "network", device, info: { host, port } };
  } catch {
    return null;
  }
}

function openPrinterSession(workFn) {
  return new Promise((resolve, reject) => {
    const found =
      detectUsbPrinter() ||
      detectNetworkPrinter();

    if (!found) return reject(new Error("Yaz�c� tespit edilemedi"));

    const { device } = found;
    device.open((err) => {
      if (err) return reject(err);

      const printer = new escpos.Printer(device, { encoding: enc() });
      (async () => {
        try {
          await workFn(printer);
          printer.cut();
          printer.close();
          resolve(true);
        } catch (e) {
          try { printer.close(); } catch {}
          reject(e);
        }
      })();
    });
  });
}

// ---- D��a a��lan API ----
async function printReceipt(data) {
  const items = Array.isArray(data?.items) ? data.items : [];
  const subtotal = items.reduce((s, i) => s + Number(i.price) * Number(i.qty), 0);
  const total = data?.total != null ? Number(data.total) : subtotal;
  const date = data?.date ? new Date(data.date) : new Date();
  const payLabel = data?.payment || data?.paymentMethod || "-";

  await openPrinterSession(async (p) => {
    p
      .align("ct")
      .style("b")
      .size(1, 1)
      .text("EMR CAFE")
      .style("normal")
      .size(1, 1)
      .text(`Masa: ${data?.table || "-"}`)
      .text(date.toLocaleString("tr-TR"))
      .text(`�deme: ${payLabel}`)
      .text(divider());

    p.align("lt");
    items.forEach((i) => {
      const name = `${i.name || ""} x${Number(i.qty || 0)}`;
      const totalLine = money(Number(i.qty || 0) * Number(i.price || 0));
      // tek sat�r hizalama
      const width = 42;
      const right = totalLine;
      const leftMax = Math.max(0, width - right.length - 1);
      const left = name.length > leftMax ? name.slice(0, leftMax) : name;
      const pad = " ".repeat(Math.max(1, width - left.length - right.length));
      p.text(left + pad + right);
      if (i.notes) p.text("  ?? " + i.notes);
    });

    p.text(divider());
    p.style("b").text(`TOPLAM: ${money(total)}`).style("normal");
    p.newLine().align("ct").text("Te�ekk�r ederiz").newLine();
  });
}

async function printKitchen(order) {
  const items = Array.isArray(order?.items) ? order.items : [];
  const time = order?.time ? new Date(order.time) : new Date();

  await openPrinterSession(async (p) => {
    p
      .align("ct")
      .style("b")
      .text("EMR CAFE - MUTFAK")
      .style("normal")
      .text(`Masa: ${order?.table || "-"}`)
      .text(time.toLocaleTimeString("tr-TR"))
      .text(divider());

    p.align("lt");
    items.forEach((i) => p.text(`- ${i.name} x${i.qty}`));
    p.newLine();
  });
}

async function openCashDrawer() {
  // ESC/POS: �ekmece pin 2/5; s�releri �o�u yaz�c�da default iyi �al���r
  await openPrinterSession(async (p) => {
    // baz� paketlerde cashdraw(pin) / baz� s�r�mlerde pulse mevcut
    // ikisini de deneyelim:
    try { p.cashdraw(2); } catch {}
    try { p.pulse?.(2); } catch {}
    p.newLine();
  });
}

module.exports = { printReceipt, printKitchen, openCashDrawer };
