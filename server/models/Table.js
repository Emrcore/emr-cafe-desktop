// models/Table.js
const mongoose = require("mongoose");

const tableSchema = new mongoose.Schema({
  name: String,
  status: { type: String, default: "empty" },
  orders: [
    {
      id: String,       // �r�n id'si
      name: String,     // �r�n ad�
      price: Number,    // fiyat
      qty: Number,      // miktar
      // di�er �r�n detaylar� varsa ekle
    }
  ],
});

module.exports = (connection) => connection.model("Table", tableSchema);
