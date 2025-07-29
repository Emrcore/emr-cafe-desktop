const mongoose = require("mongoose");

const tenantSchema = new mongoose.Schema({
  name: String,
  subdomain: { type: String, unique: true },   // �rn: lastsummer
  systemType: {                                 // �rn: cafe, depo, market
    type: String,
    enum: ["cafe", "depo", "market"],           // Dilersen ileride �o�altabilirsin
    required: true
  },
  subscriptionEnd: { type: Date, required: true }
}, { timestamps: true });

// ? Tek sat�rda model y�kleme:
module.exports = mongoose.models.Tenant || mongoose.model("Tenant", tenantSchema);
