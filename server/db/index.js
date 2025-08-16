// db/index.js
const mongoose = require("mongoose");

// K���k yard�mc�lar
function sanitize(s = "") {
  return String(s).toLowerCase().replace(/[^a-z0-9-_]/g, "");
}
function buildDbName(input, fallbackPrefix = "emr-cafe") {
  // input: req veya { tenantInfo: { systemType, subdomain } } olabilir
  const systemType =
    input?.tenantInfo?.systemType ||
    (typeof input === "object" && input.systemType) ||
    "cafe";
  const subdomain =
    input?.tenantInfo?.subdomain ||
    (typeof input === "object" && input.subdomain) ||
    "";

  const prefix = sanitize(`emr-${systemType}`) || sanitize(fallbackPrefix);
  const tenant = sanitize(subdomain);
  return tenant ? `${prefix}_${tenant}` : prefix;
}

const cache = new Map();
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017";

/** Base connect (tek kez) */
async function ensureBase() {
  if (mongoose.connection?.readyState === 1) return mongoose.connection;
  return mongoose.connect(MONGO_URI);
}

/** �STENEN: �stek nesnesi ile tenant DB a� */
async function getTenantDb(req) {
  const dbName = req?.tenantDbName || buildDbName(req);
  return getTenantDbByName(dbName);
}

/** �simle tenant DB a� (router�lar�n �o�u buna ge�ebilir) */
async function getTenantDbByName(dbName) {
  if (!dbName || typeof dbName !== "string") {
    throw new Error("Ge�ersiz db ad�: " + String(dbName));
  }
  if (cache.has(dbName)) return cache.get(dbName);

  const base = await ensureBase();
  const conn = base.useDb(dbName, { noListener: true });
  console.log(`? [${dbName}] veritaban�na ba�lan�ld�`);
  cache.set(dbName, conn);
  return conn;
}

module.exports = { getTenantDb, getTenantDbByName, buildDbName };
