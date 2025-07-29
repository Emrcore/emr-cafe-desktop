// models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  password: String,
  role: String,
  createdAt: { type: Date, default: Date.now },
});

module.exports = (connection) => connection.model("User", userSchema);
