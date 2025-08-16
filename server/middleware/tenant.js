// middleware/tenant.js
const mongoose = require("mongoose");
const path = require("path");
const SubscriptionModel = require("../models/Subscription");

const Subscription = SubscriptionModel(mongoose.connection);
const EMR_DOMAIN = "emrcore.com.tr";
const DEFAULT_SYSTEM = "cafe";

module.exports = async function tenantMiddleware(req, res, next) {
  try {
    const rawHost = String(req.headers.host || "").toLowerCase().split(":")[0];

    // 1) Header / query fallback (dev/test kolaylığı)
    let tenant = (req.headers["x-tenant-id"] || req.headers["x-tenant"] || req.query.tenant || "").toLowerCase();
    let systemType = (req.headers["x-system-type"] || req.query.systemtype || req.query.system || "").toLowerCase();

    // 2) Host'tan çıkar (örn: sahintepesi.cafe.emrcore.com.tr)
    if (!tenant && rawHost.endsWith(EMR_DOMAIN)) {
      const m = rawHost.match(/^([^.]+)\.([^.]+)\.emrcore\.com\.tr$/);
      if (m) {
        tenant = m[1];                 // sahintepesi
        systemType = systemType || m[2]; // cafe
      }
    }

    if (!systemType) systemType = DEFAULT_SYSTEM;

    // 3) Basit doğrulama
    if (!tenant || !/^[a-z0-9._-]+$/.test(tenant) || !/^[a-z0-9._-]+$/.test(systemType)) {
      return res.status(404).json({ message: "İşletme bulunamadı" });
    }

    tenant = tenant.trim().toLowerCase();
    systemType = systemType.trim().toLowerCase();

    // 4) Subscription opsiyonel (bloklama yok; abonelik kontrolünü subscriptionCheck yapsın)
    let subscription = null;
    try {
      subscription = await Subscription.findOne({ tenantId: tenant, systemType }).lean();
    } catch (e) {
      console.warn("⚠️ Subscription lookup error:", e.message);
    }

    // 5) Tenant DB bağlantısı ve path
    const dbName = `emr-${systemType}_${tenant}`;     // örn: emr-cafe_sahintepesi
    const tenantConn = mongoose.connection.useDb(dbName);

    req.tenant = {
      id: tenant,
      systemType,
      subscriptionExists: !!subscription,
      subscription, // null olabilir
    };
    req.systemType = systemType;
    req.tenantDbName = dbName;
    req.db = tenantConn;
    req.dataPath = path.join("/var/www/data", systemType, tenant);

    // console.log("✅ tenantMiddleware:", { host: rawHost, tenant, systemType, dbName });

    next();
  } catch (err) {
    console.error("❌ tenantMiddleware hatası:", err);
    res.status(500).json({ message: "Sunucu hatası: " + err.message });
  }
};
