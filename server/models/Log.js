const mongoose = require("mongoose");

const logSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  username: String,
  role: String,
  action: String,
  details: Object,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Log", logSchema);
