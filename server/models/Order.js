const mongoose = require("mongoose");
const tableSchema = require("./TableSchema"); // Table þema tanýmý ayrý dosyada

const orderSchema = new mongoose.Schema(
  {
    table: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Table", // populate("table") bu isme göre çalýþýr
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
  // ? Table modeli tanýmlý deðilse tanýmla (populate için þart)
  if (!connection.models.Table) {
    connection.model("Table", tableSchema);
  }

  return connection.models.Order || connection.model("Order", orderSchema);
};
