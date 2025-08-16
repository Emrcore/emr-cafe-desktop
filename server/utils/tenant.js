// utils/tenant.js
function sanitizeDbPart(s = "") {
  // Mongo dbName s�n�rl� karakter kabul eder
  return String(s).toLowerCase().replace(/[^a-z0-9-_]/g, "");
}

/**
 * req i�inden tenant kimli�ini string olarak �retir.
 * Kabul edilen alanlar: req.tenant, req.tenantId, req.subdomain, req.tenantInfo.subdomain, req.headers['x-tenant']
 */
function resolveTenantId(req) {
  const t =
    req.tenant ??
    req.tenantId ??
    req.subdomain ??
    req?.tenantInfo?.subdomain ??
    req?.headers?.["x-tenant"];

  // t obje geldiyse, subdomain veya name alan�n� dene
  if (t && typeof t === "object") {
    const candidate = t.subdomain ?? t.name ?? t.id ?? "";
    return sanitizeDbPart(candidate);
  }
  return sanitizeDbPart(t || "");
}

/** Proje �n eki ile birle�ik DB ad� �ret (�rn: emr-cafe_demo) */
function buildDbName(req, fallbackPrefix = "emr-cafe") {
  const tenant = resolveTenantId(req);
  const prefix =
    req?.tenantInfo?.systemType
      ? sanitizeDbPart(`emr-${req.tenantInfo.systemType}`)
      : sanitizeDbPart(fallbackPrefix);

  // Son: emr-cafe_demo
  return tenant ? `${prefix}_${tenant}` : prefix;
}

module.exports = { resolveTenantId, buildDbName };
