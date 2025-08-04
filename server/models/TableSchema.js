// models/TableSchema.js
const mongoose = require("mongoose");

const tableSchema = new mongoose.Schema({
  name: String,
  status: { type: String, default: "empty" },
  orders: [
    {
      id: String,
      name: String,
      price: Number,
      qty: Number,
    },
  ],
});

module.exports = tableSchema;
