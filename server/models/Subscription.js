const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema({
  tenantId: { type: String, required: true, unique: true },
  businessName: { type: String, required: true },
  startDate: { type: Date, required: true },
  expiryDate: { type: Date, required: true },
  status: { type: String, enum: ["active", "expired"], default: "active" }
});

// Çoklu baðlantý desteði (tenant bazlý baðlantý için)
module.exports = (conn) => {
  return conn.models.Subscription || conn.model("Subscription", subscriptionSchema);
};
