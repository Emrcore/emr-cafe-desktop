// server/middleware/subscriptionCheck.js
const mongoose = require("mongoose");
const EMR_DOMAIN = "emrcore.com.tr";

// Tenant modelini dayanıklı şekilde yükle:
//  - ESM/CJS default/named export
//  - Fabrika (conn => model) veya doğrudan Model
//  - Hiçbiri tutmazsa: fallback şema ile admin conn'da model tanımla
function getTenantModel() {
  const adminConn = mongoose.connection;

  // Zaten derlenmişse
  if (adminConn.models.Tenant) return adminConn.models.Tenant;

  let mod;
  try {
    mod = require("../models/Tenant");
  } catch (_) {
    mod = null;
  }
  const candidate = mod && (mod.default || mod);

  // Fabrika ise
  if (typeof candidate === "function") {
    try {
      const m = candidate(adminConn);
      if (m && typeof m.findOne === "function") return m;
    } catch (_) {}
  }
  // Doğrudan Model ise
  if (candidate && typeof candidate.findOne === "function") {
    return candidate;
  }

  // Fallback: adminConn üzerinde hızlı şema ile derle
  const { Schema } = mongoose;
  const TenantSchema = new Schema(
    {
      subdomain: { type: String, index: true },
      systemType: { type: String, index: true },
      subscriptionEnd: { type: Date }
    },
    { timestamps: true }
  );
  return adminConn.model("Tenant", TenantSchema, "tenants");
}

const Tenant = getTenantModel();

function resolveTenantAndSystem(req) {
  // tenantMiddleware bıraktıysa onu kullan
  const t1 = req?.tenant?.id || req?.tenant?.tenantId || null;
  const s1 = req?.tenant?.systemType || req?.systemType || null;
  if (t1 && s1) return { tenant: t1, systemType: s1 };

  // header/query fallback
  let tenant =
    (req.headers["x-tenant-id"] ||
      req.headers["x-tenant"] ||
      req.query.tenant ||
      "") + "";
  let systemType =
    (req.headers["x-system-type"] ||
      req.query.systemtype ||
      req.query.system ||
      "") + "";
  tenant = tenant.toLowerCase().trim();
  systemType = systemType.toLowerCase().trim();

  // host: sahintepesi.cafe.emrcore.com.tr
  const rawHost = String(req.headers.host || "").toLowerCase().split(":")[0];
  if ((!tenant || !systemType) && rawHost.endsWith(EMR_DOMAIN)) {
    const m = rawHost.match(/^([^.]+)\.([^.]+)\.emrcore\.com\.tr$/);
    if (m) {
      tenant ||= m[1];
      systemType ||= m[2];
    }
  }
  return { tenant: tenant || null, systemType: systemType || null };
}

module.exports = async function checkSubscription(req, res, next) {
  try {
    const { tenant, systemType } = resolveTenantAndSystem(req);
    if (!tenant || !systemType) {
      return res.status(404).json({ message: "İşletme bulunamadı" });
    }

    // Admin (emr-admin) DB'den kontrol
    const record = await Tenant.findOne(
      { subdomain: tenant, systemType },
      { subdomain: 1, systemType: 1, subscriptionEnd: 1 }
    ).lean();

    if (!record) {
      return res.status(404).json({ message: "İşletme bulunamadı" });
    }

    const now = new Date();
    const end = record.subscriptionEnd ? new Date(record.subscriptionEnd) : null;
    if (!end || now > end) {
      return res.status(403).json({ message: "Abonelik süresi dolmuş." });
    }

    // Akış notları
    req.subscription = { tenantId: tenant, systemType, endsAt: end };
    if (!req.tenant) req.tenant = { id: tenant, systemType };
    else req.tenant.systemType ||= systemType;

    next();
  } catch (err) {
    console.error("Abonelik kontrol hatası:", err);
    res.status(500).json({ message: "Sunucu hatası" });
  }
};
