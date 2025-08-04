// printer.js (g�ncellenmi�)
const fs = require("fs");
const path = require("path");

const isSimulated = true;

async function printReceipt(data) {
  const output = `
  EMR CAFE
  Masa: ${data.table}
  Tarih: ${data.date}
  �deme: ${data.payment}

  ${data.items.map(i => `- ${i.name} x${i.qty} ?${i.price}`).join("\n")}

  Toplam: ?${data.total}
  `;

  writeSimulated("receipt", output);
}

async function printKitchen(order) {
  const output = `
  EMR CAFE - MUTFAK
  Masa: ${order.table}
  Saat: ${order.time}

  ${order.items.map(i => `- ${i.name} x${i.qty}`).join("\n")}
  `;

  writeSimulated("kitchen", output);
}

function writeSimulated(type, content) {
  if (isSimulated) {
    const filePath = path.join(__dirname, "output", `${type}-${Date.now()}.txt`);
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, content.trim(), "utf8");
    console.log(`[TEST] ${type} fi�i yaz�ld� � ${filePath}`);
  }
}

module.exports = { printReceipt, printKitchen };
