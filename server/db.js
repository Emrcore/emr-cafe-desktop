// db.js
const mongoose = require("mongoose");

// Connection cache � her tenant'�n db'si i�in tek ba�lant�
const connections = {};

/**
 * Her tenant i�in uygun Mongoose ba�lant�s� d�nd�r�r.
 * @param {string} dbName - Tenant veritaban� ad� (�rn: emr-cafe_lastsummer)
 * @returns {mongoose.Connection}
 */
function getTenantDb(dbName) {
  if (!dbName) throw new Error("dbName belirtilmedi!");

  // Ba�lant� �nceden a��ld�ysa onu kullan
  if (connections[dbName]) {
    return connections[dbName];
  }

  // Yeni ba�lant� a�
  const uri = `mongodb://127.0.0.1:27017/${dbName}`;
  const connection = mongoose.createConnection(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  // Ba�lant� cache'le
  connections[dbName] = connection;

  // Hatalar� logla
  connection.on("error", (err) => {
    console.error(`? [${dbName}] ba�lant� hatas�:`, err);
  });

  connection.once("open", () => {
    console.log(`? [${dbName}] veritaban�na ba�lan�ld�`);
  });

  return connection;
}

module.exports = getTenantDb;
