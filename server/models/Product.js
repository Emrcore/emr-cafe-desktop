// models/Product.js
const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: String,
  price: Number,
  category: { type: String, default: "Genel" },
  image: String, // ürün görseli için
  // Diðer ürün alanlarý...
});

module.exports = (connection) => connection.model("Product", productSchema);
