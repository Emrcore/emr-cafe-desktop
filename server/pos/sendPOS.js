const { exec } = require("child_process");

function sendPOSCommand({ tableName, total }) {
  const amountFormatted = total.toFixed(2);

  // Örnek: COM3 portuna yazı gönder
  const command = `echo ${amountFormatted} > \\\\.\\COM3`;

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error("❌ POS yönlendirme hatası:", error.message);
      return;
    }
    console.log("✅ POS yönlendirme tamamlandı:", stdout);
  });
}

module.exports = sendPOSCommand;
