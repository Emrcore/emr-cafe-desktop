const fs = require("fs");
const path = require("path");

const BASE_DATA_PATH = "/var/www/data";

const defaultFiles = {
  "tables.json": [],
  "products.json": [],
  "sales.json": [],
  "settings.json": {
    masaSayisi: 10,
    paraBirimi: "?",
    servisYuzdesi: 0
  },
  "license.json": {
    lisansKey: "",
    cihazId: "",
    valid: false
  }
};

function createTenantFolders({ subdomain, systemType }) {
  if (!subdomain || !systemType) {
    throw new Error("subdomain ve systemType zorunludur");
  }

  const tenantPath = path.join(BASE_DATA_PATH, systemType, subdomain);

  // klasörü oluþtur
  if (!fs.existsSync(tenantPath)) {
    fs.mkdirSync(tenantPath, { recursive: true });
    console.log("?? Yeni klasör oluþturuldu:", tenantPath);
  } else {
    console.log("?? Klasör zaten mevcut:", tenantPath);
  }

  // varsayýlan dosyalarý oluþtur
  for (const [fileName, defaultContent] of Object.entries(defaultFiles)) {
    const filePath = path.join(tenantPath, fileName);
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(defaultContent, null, 2));
      console.log("? Oluþturuldu:", filePath);
    } else {
      console.log("?? Zaten var:", filePath);
    }
  }
}

module.exports = createTenantFolders;
