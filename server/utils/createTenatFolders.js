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

  // klas�r� olu�tur
  if (!fs.existsSync(tenantPath)) {
    fs.mkdirSync(tenantPath, { recursive: true });
    console.log("?? Yeni klas�r olu�turuldu:", tenantPath);
  } else {
    console.log("?? Klas�r zaten mevcut:", tenantPath);
  }

  // varsay�lan dosyalar� olu�tur
  for (const [fileName, defaultContent] of Object.entries(defaultFiles)) {
    const filePath = path.join(tenantPath, fileName);
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(defaultContent, null, 2));
      console.log("? Olu�turuldu:", filePath);
    } else {
      console.log("?? Zaten var:", filePath);
    }
  }
}

module.exports = createTenantFolders;
