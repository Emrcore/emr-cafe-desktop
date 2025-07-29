// middleware/checkSubscription.js

const Tenant = require("../models/Tenant");

module.exports = async function (req, res, next) {
  try {
    const host = req.headers.host;
    const subdomain = host.split(".")[0];

    const tenant = await Tenant.findOne({ subdomain });

    if (!tenant) {
      return res.status(404).json({ message: "İşletme bulunamadı" });
    }

    const now = new Date();
    if (new Date(tenant.subscriptionEnd) < now) {
      return res.status(403).json({ message: "Abonelik süresi dolmuş." });
    }

    req.tenant = tenant;
    next();
  } catch (err) {
    console.error("Abonelik kontrol hatası:", err);
    res.status(500).json({ message: "Sunucu hatası" });
  }
};
