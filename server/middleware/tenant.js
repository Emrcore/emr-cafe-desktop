const mongoose = require("mongoose");
const SubscriptionModel = require("../models/Subscription");
const path = require("path");

// ✅ Parametreli model çağrısı
const Subscription = SubscriptionModel(mongoose.connection);

module.exports = async function tenantMiddleware(req, res, next) {
  try {
    const host = req.headers.host || "";
    const parts = host.split(".");

    // ❗ Frontend istekleri ya da eksik subdomain için middleware'i atla
    if (parts.length < 3 || !host.includes("emrcore.com.tr")) {
      return next();
    }

    const subdomain = parts[0];         // Örn: cafe1
    const systemType = parts[1];        // Örn: cafe

    // ✅ Abonelik sorgusu
    const subscription = await Subscription.findOne({ tenantId: subdomain, systemType });

    if (!subscription) {
      return res.status(404).json({ message: "İşletme bulunamadı" });
    }

    req.tenant = subscription;
    req.systemType = systemType;
    req.tenantDbName = `emr-cafe_${subdomain}`;
    req.dataPath = path.join("/var/www/data", systemType, subdomain);

    next();
  } catch (err) {
    console.error("❌ tenantMiddleware hatası:", err.message);
    res.status(500).json({ message: "Sunucu hatası: " + err.message });
  }
};
