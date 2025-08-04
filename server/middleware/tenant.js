const mongoose = require("mongoose");
const SubscriptionModel = require("../models/Subscription");
const path = require("path");

const Subscription = SubscriptionModel(mongoose.connection);

module.exports = async function tenantMiddleware(req, res, next) {
  try {
    // 1. Öncelik: Header üzerinden gelen tenant bilgisi
    const tenantId = req.headers["x-tenant-id"];

    // 2. Alternatif: host üzerinden tenant ve sistem tipi çıkar (demo.cafe.emrcore.com.tr)
    const host = req.headers.host || "";
    const parts = host.split(".");

    let subdomain = tenantId || null;
    let systemType = null;

    if (!subdomain && parts.length >= 3 && host.includes("emrcore.com.tr")) {
      subdomain = parts[0];      // "demo"
      systemType = parts[1];     // "cafe"
    }

    if (!subdomain || !host.includes("emrcore.com.tr")) {
      console.warn("⚠️ Subdomain veya tenantId bulunamadı. middleware atlandı.");
      return next();
    }

    // Eğer x-tenant-id varsa, sistemType da header'dan gelmeli veya varsayılmalı
    if (!systemType) {
      systemType = req.headers["x-system-type"] || "cafe"; // Default: cafe
    }

    // Abonelik kontrolü
    const subscription = await Subscription.findOne({ tenantId: subdomain, systemType });
    if (!subscription) {
      return res.status(404).json({ message: "İşletme bulunamadı" });
    }

    // ✅ CRITICAL LINE: tenant database bağlantısını ayarla
    const dbName = `emr-${systemType}_${subdomain}`;
    req.db = mongoose.connection.useDb(dbName);
    req.tenant = subscription;
    req.systemType = systemType;
    req.tenantDbName = dbName;
    req.dataPath = path.join("/var/www/data", systemType, subdomain);

    console.log("✅ tenantMiddleware çalıştı:", dbName);
    next();
  } catch (err) {
    console.error("❌ tenantMiddleware hatası:", err.message);
    res.status(500).json({ message: "Sunucu hatası: " + err.message });
  }
};
