// models/Product.js
const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: String,
  price: Number,
  category: { type: String, default: "Genel" },
  image: String, // �r�n g�rseli i�in
  // Di�er �r�n alanlar�...
});

module.exports = (connection) => connection.model("Product", productSchema);
