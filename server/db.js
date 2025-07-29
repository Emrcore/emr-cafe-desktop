// db.js
const mongoose = require("mongoose");

// Connection cache — her tenant'ýn db'si için tek baðlantý
const connections = {};

/**
 * Her tenant için uygun Mongoose baðlantýsý döndürür.
 * @param {string} dbName - Tenant veritabaný adý (örn: emr-cafe_lastsummer)
 * @returns {mongoose.Connection}
 */
function getTenantDb(dbName) {
  if (!dbName) throw new Error("dbName belirtilmedi!");

  // Baðlantý önceden açýldýysa onu kullan
  if (connections[dbName]) {
    return connections[dbName];
  }

  // Yeni baðlantý aç
  const uri = `mongodb://127.0.0.1:27017/${dbName}`;
  const connection = mongoose.createConnection(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  // Baðlantý cache'le
  connections[dbName] = connection;

  // Hatalarý logla
  connection.on("error", (err) => {
    console.error(`? [${dbName}] baðlantý hatasý:`, err);
  });

  connection.once("open", () => {
    console.log(`? [${dbName}] veritabanýna baðlanýldý`);
  });

  return connection;
}

module.exports = getTenantDb;
