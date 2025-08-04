const mongoose = require("mongoose");
const tableSchema = require("./TableSchema"); // Table �ema tan�m� ayr� dosyada

const orderSchema = new mongoose.Schema(
  {
    table: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Table", // populate("table") bu isme g�re �al���r
      required: true,
    },
    items: [
      {
        name: String,
        quantity: Number,
      },
    ],
    status: {
      type: String,
      enum: ["open", "completed"],
      default: "open",
    },
  },
  { timestamps: true }
);

module.exports = (connection) => {
  // ? Table modeli tan�ml� de�ilse tan�mla (populate i�in �art)
  if (!connection.models.Table) {
    connection.model("Table", tableSchema);
  }

  return connection.models.Order || connection.model("Order", orderSchema);
};
