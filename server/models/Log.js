// models/Log.js
const mongoose = require("mongoose");

const logSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  username: String,
  role: String,
  action: String, // örnek: "sipariþ oluþturdu", "ödeme aldý"
  details: Object, // örnek: { masa: "Masa 1", tutar: 120 }
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Log", logSchema);
