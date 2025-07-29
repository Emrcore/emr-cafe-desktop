const mongoose = require("mongoose");

const tenantSchema = new mongoose.Schema({
  name: String,
  subdomain: { type: String, unique: true },   // Örn: lastsummer
  systemType: {                                 // Örn: cafe, depo, market
    type: String,
    enum: ["cafe", "depo", "market"],           // Dilersen ileride çoðaltabilirsin
    required: true
  },
  subscriptionEnd: { type: Date, required: true }
}, { timestamps: true });

// ? Tek satýrda model yükleme:
module.exports = mongoose.models.Tenant || mongoose.model("Tenant", tenantSchema);
