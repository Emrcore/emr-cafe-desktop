// models/Tenant.js
const { Schema } = require("mongoose");

module.exports = (conn) => {
  if (conn.models.Tenant) return conn.models.Tenant;
  const TenantSchema = new Schema({
    subdomain:   { type: String, required: true, index: true },
    systemType:  { type: String, required: true, index: true }, // "cafe"
    subscriptionEnd: { type: Date },
  }, { timestamps: true });

  return conn.model("Tenant", TenantSchema, "tenants");
};
