const mongoose = require("mongoose");

const tenantSchema = new mongoose.Schema({
  name: String,
  subdomain: { type: String, unique: true },
  systemType: String,
  createdAt: { type: Date, default: Date.now },
  subscriptionEnd: { type: Date, required: true },
  // Di�er alanlar...
});

module.exports = mongoose.model("Tenant", tenantSchema);
