// models/Order.js
const mongoose = require("mongoose");
const tableSchema = require("./TableSchema"); // Table þema tanýmý ayrý dosyada

// Her bir sipariþ kalemi (mutfak satýrý)
const orderItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },     // ürün adý (mutfakta gösterilecek)
    quantity: { type: Number, default: 1 },     // adet
    notes: { type: String, default: "" },       // ?? garson notu (mutfak görsün)
    // Ýstersen ileride productId tutmak için:
    // productId: { type: String }
  },
  { _id: false } // alt doküman; ayrý _id gerekmez
);

const orderSchema = new mongoose.Schema(
  {
    table: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Table", // populate("table") bu isme göre çalýþýr
      required: true,
    },
    items: [orderItemSchema],                   // ?? not’lu item þemasý
    status: {
      type: String,
      enum: ["open", "completed"],
      default: "open",
      index: true,
    },
  },
  { timestamps: true }
);

module.exports = (connection) => {
  // Table modeli tanýmlý deðilse tanýmla (populate için þart)
  if (!connection.models.Table) {
    connection.model("Table", tableSchema);
  }
  return connection.models.Order || connection.model("Order", orderSchema);
};
