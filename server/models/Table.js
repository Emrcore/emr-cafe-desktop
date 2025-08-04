const mongoose = require("mongoose");

const TableSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    status: { type: String, default: "empty" }, // örn: empty, occupied, reserved
    orders: [
      {
        id: { type: String, required: true },       // ürün ID'si (veritabaný ID olabilir)
        name: { type: String, required: true },     // ürün adý
        price: { type: Number, required: true },    // ürün fiyatý
        qty: { type: Number, required: true },      // ürün adeti
        notes: { type: String },                    // opsiyonel açýklama
        category: { type: String },                 // opsiyonel kategori
      },
    ],
  },
  {
    timestamps: true, // createdAt & updatedAt otomatik
  }
);

module.exports = (connection) => {
  // Ayný model iki kez tanýmlanýrsa hata verir; bu yüzden kontrol þart
  try {
    return connection.model("Table");
  } catch (e) {
    return connection.model("Table", TableSchema);
  }
};
