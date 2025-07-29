// models/Table.js
const mongoose = require("mongoose");

const tableSchema = new mongoose.Schema({
  name: String,
  status: { type: String, default: "empty" },
  orders: [
    {
      id: String,       // ürün id'si
      name: String,     // ürün adý
      price: Number,    // fiyat
      qty: Number,      // miktar
      // diðer ürün detaylarý varsa ekle
    }
  ],
});

module.exports = (connection) => connection.model("Table", tableSchema);
