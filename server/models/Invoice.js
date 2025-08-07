const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: { type: String, required: true },
  tableId: String,
  paymentType: String,
  customerName: String,
  items: [
    {
      name: String,
      price: Number,
      quantity: Number,
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Invoice", invoiceSchema);
