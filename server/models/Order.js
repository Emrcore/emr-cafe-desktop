// models/Order.js
const mongoose = require("mongoose");
const tableSchema = require("./TableSchema"); // Table �ema tan�m� ayr� dosyada

// Her bir sipari� kalemi (mutfak sat�r�)
const orderItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },     // �r�n ad� (mutfakta g�sterilecek)
    quantity: { type: Number, default: 1 },     // adet
    notes: { type: String, default: "" },       // ?? garson notu (mutfak g�rs�n)
    // �stersen ileride productId tutmak i�in:
    // productId: { type: String }
  },
  { _id: false } // alt dok�man; ayr� _id gerekmez
);

const orderSchema = new mongoose.Schema(
  {
    table: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Table", // populate("table") bu isme g�re �al���r
      required: true,
    },
    items: [orderItemSchema],                   // ?? not�lu item �emas�
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
  // Table modeli tan�ml� de�ilse tan�mla (populate i�in �art)
  if (!connection.models.Table) {
    connection.model("Table", tableSchema);
  }
  return connection.models.Order || connection.model("Order", orderSchema);
};
