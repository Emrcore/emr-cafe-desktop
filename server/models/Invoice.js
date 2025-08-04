const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: { type: String, required: true, unique: true }, // FTR-000001 gibi
  tableName: String,
  total: Number,
  paymentType: String,
  createdAt: { type: Date, default: Date.now },
  orders: [
    {
      productName: String,
      quantity: Number,
      price: Number
    }
  ]
});

module.exports = mongoose.model("Invoice", invoiceSchema);
