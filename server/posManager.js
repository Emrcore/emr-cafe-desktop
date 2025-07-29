const axios = require("axios");

async function sendPaymentToPOS({ amount, method }) {
  const POS_TYPE = process.env.POS_TYPE || "mock";

  console.log("?? POS tipi:", POS_TYPE);
  console.log("?? Gönderilen tutar:", amount);

  try {
    if (POS_TYPE === "http") {
      return await axios.post(process.env.POS_ENDPOINT, {
        amount,
        currency: "TRY",
        type: method,
      });
    }

    if (POS_TYPE === "serial") {
      const SerialPort = require("serialport");
      const port = new SerialPort(process.env.SERIAL_PORT || "/dev/ttyUSB0", {
        baudRate: 9600,
      });
      port.write(`SALE:${amount}\n`);
      return { status: "sent-serial" };
    }

    if (POS_TYPE === "sdk") {
      const ffi = require("ffi-napi");
      const posLib = ffi.Library("POSLibrary.dll", {
        StartPayment: ["int", ["double", "string"]],
      });
      const result = posLib.StartPayment(amount, method);
      return { result };
    }

    // POS cihazý yoksa mock test dönüþü
    if (POS_TYPE === "mock") {
      console.log("?? Test modu aktif (POS cihazý baðlý deðil)");
      return { status: "mock-success", test: true };
    }

    return { error: "Bilinmeyen POS tipi" };
  } catch (err) {
    console.error("? POS baðlantý hatasý:", err.message);
    return { error: err.message };
  }
}

module.exports = { sendPaymentToPOS };
