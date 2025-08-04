// models/WaiterCall.js
const mongoose = require("mongoose");

const waiterCallSchema = new mongoose.Schema({
  tableName: String,
  status: { type: String, default: "open" }, // open / done
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("WaiterCall", waiterCallSchema);
