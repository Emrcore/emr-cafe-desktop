const mongoose = require("mongoose");

const TableSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    status: { type: String, default: "empty" }, // �rn: empty, occupied, reserved
    orders: [
      {
        id: { type: String, required: true },       // �r�n ID'si (veritaban� ID olabilir)
        name: { type: String, required: true },     // �r�n ad�
        price: { type: Number, required: true },    // �r�n fiyat�
        qty: { type: Number, required: true },      // �r�n adeti
        notes: { type: String },                    // opsiyonel a��klama
        category: { type: String },                 // opsiyonel kategori
      },
    ],
  },
  {
    timestamps: true, // createdAt & updatedAt otomatik
  }
);

module.exports = (connection) => {
  // Ayn� model iki kez tan�mlan�rsa hata verir; bu y�zden kontrol �art
  try {
    return connection.model("Table");
  } catch (e) {
    return connection.model("Table", TableSchema);
  }
};
