const express = require("express");
const router = express.Router();

router.post("/pay", (req, res) => {
  console.log("? /api/pos/pay iste�i geldi!");
  res.json({ status: "OK", test: true });
});

module.exports = router;
