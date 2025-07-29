const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNo: String,
    saleId: { type: mongoose.Schema.Types.ObjectId, ref: "Sale" },
    customerName: String,
    pdfPath: String,
  },
  { timestamps: true }
);

module.exports = (conn) => conn.model("Invoice", invoiceSchema);
