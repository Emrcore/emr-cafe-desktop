// routes/productsUpload.js
const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { getTenantDb } = require("../db");                 // ? sadece gereken
const ProductModelFactory = require("../models/Product"); // ? factory

const router = express.Router();

const UPLOAD_DIR = "/var/www/uploads";
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const fileName = `${Date.now()}-${Math.floor(Math.random() * 9999)}${ext}`;
    cb(null, fileName);
  },
});

const upload = multer({ storage });

// Tek ürün görseli yükle & ürünü güncelle
router.post("/:id/upload", upload.single("image"), async (req, res) => {
  try {
    const productId = req.params.id;
    if (!req.file) return res.status(400).json({ message: "Dosya yüklenmedi" });

    const imageUrl = `/uploads/${req.file.filename}`;

    const connection = await getTenantDb(req);           // ? await
    const Product = ProductModelFactory(connection);

    const updated = await Product.findByIdAndUpdate(
      productId,
      { image: imageUrl },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: "Ürün bulunamadý" });

    res.json({ url: imageUrl, product: updated });
  } catch (err) {
    console.error("Görsel yükleme hatasý:", err);
    res.status(500).json({ message: "Sunucu hatasý" });
  }
});

module.exports = router;
