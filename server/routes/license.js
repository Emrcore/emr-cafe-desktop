const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");

// Dinamik lisans dosyasý yolu
const getLicenseFile = (req) => path.join(req.dataPath, "license.json");

function readJSON(file) {
  try {
    return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file)) : {};
  } catch (err) {
    console.error(`? Lisans dosyasý okunamadý (${file}):`, err.message);
    return {};
  }
}

router.post("/", (req, res) => {
  const license = readJSON(getLicenseFile(req));
  const { lisansKey, cihazId } = req.body;

  const isValid =
    license.lisansKey === lisansKey &&
    license.cihazId === cihazId &&
    license.valid === true;

  res.json({ valid: isValid });
});

module.exports = router;
