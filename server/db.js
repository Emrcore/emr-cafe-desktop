// server/db.js
const mongoose = require("mongoose");
const EMR_DOMAIN = "emrcore.com.tr";

// Ayný çözüm mantýðýný burada da tutalým; middleware çalýþmasa da tenant'ý çýkarabilelim.
function resolveTenantAndSystem(req) {
  // 1) Daha önce ayarlanmýþsa kullan
  const t1 = req?.tenant?.id || req?.tenant?.tenantId || null;
  const s1 = req?.tenant?.systemType || req?.systemType || null;
  if (t1 && s1) return { tenant: t1, systemType: s1 };

  // 2) Header / query fallback
  let tenant =
    (req.headers?.["x-tenant-id"] ||
      req.headers?.["x-tenant"] ||
      req.query?.tenant ||
      "") + "";
  let systemType =
    (req.headers?.["x-system-type"] ||
      req.query?.systemtype ||
      req.query?.system ||
      "") + "";
  tenant = tenant.toLowerCase().trim();
  systemType = systemType.toLowerCase().trim();

  // 3) Host: sahintepesi.cafe.emrcore.com.tr
  const rawHost = String(req.headers?.host || "").toLowerCase().split(":")[0];
  if ((!tenant || !systemType) && rawHost.endsWith(EMR_DOMAIN)) {
    const m = rawHost.match(/^([^.]+)\.([^.]+)\.emrcore\.com\.tr$/);
    if (m) {
      tenant ||= m[1];       // sahintepesi
      systemType ||= m[2];   // cafe
    }
  }
  return { tenant: tenant || null, systemType: systemType || null };
}

module.exports.getTenantDb = async function getTenantDb(req) {
  // 0) Middleware zaten ayarladýysa direkt dön
  if (req && req.db) return req.db;

  // 1) Kendimiz çözmeyi deneyelim
  const { tenant, systemType } = resolveTenantAndSystem(req || {});
  if (!tenant || !systemType) {
    throw new Error("TENANT_RESOLVE_FAILED: tenant veya systemType bulunamadý");
  }

  // 2) DB adý ve baðlantý
  const dbName = `emr-${systemType}_${tenant}`; // örn: emr-cafe_sahintepesi
  const conn = mongoose.connection.useDb(dbName);

  // 3) Geriye de not düþelim ki sonraki katmanlar görsün
  if (req) {
    req.db = conn;
    req.tenantDbName = dbName;
    req.systemType = req.systemType || systemType;
    req.tenant = req.tenant || { id: tenant, systemType };
  }

  return conn;
};
