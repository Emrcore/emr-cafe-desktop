// models/Sale.js
const mongoose = require("mongoose");

const saleSchema = new mongoose.Schema({
  tableId: String,
  orders: [
    {
      id: String,
      name: String,
      price: Number,
      qty: Number,
    }
  ],
  total: Number,
  paymentMethod: String,
  date: { type: Date, default: Date.now }
});

module.exports = (connection) => connection.model("Sale", saleSchema);
