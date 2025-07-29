const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const router = express.Router();
const getTenantDb = require("../db");
const ProductModel = require("../models/Product");

// ✅ Görsel yükleme için klasör oluştur
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

// ✅ Tüm ürünleri getir
router.get("/", async (req, res) => {
  try {
    const connection = getTenantDb(req.tenantDbName);
    const Product = ProductModel(connection);
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    console.error("Ürün listeleme hatası:", err.message);
    res.status(500).json({ message: "Sunucu hatası" });
  }
});

// ✅ Yeni ürün ekle
router.post("/", async (req, res) => {
  try {
    const connection = getTenantDb(req.tenantDbName);
    const Product = ProductModel(connection);

    const newProduct = new Product({
      name: req.body.name,
      price: Number(req.body.price),
      category: req.body.category || "Genel",
      image: req.body.image || "",
    });

    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (err) {
    console.error("Ürün ekleme hatası:", err.message);
    res.status(500).json({ message: "Sunucu hatası" });
  }
});

// ✅ Ürün sil
router.delete("/:id", async (req, res) => {
  try {
    const connection = getTenantDb(req.tenantDbName);
    const Product = ProductModel(connection);
    await Product.findByIdAndDelete(req.params.id);
    res.status(204).send();
  } catch (err) {
    console.error("Ürün silme hatası:", err.message);
    res.status(500).json({ message: "Sunucu hatası" });
  }
});

// ✅ Ürün güncelle
router.put("/:id", async (req, res) => {
  try {
    const connection = getTenantDb(req.tenantDbName);
    const Product = ProductModel(connection);

    const updateData = {};
    if (req.body.price !== undefined) updateData.price = Number(req.body.price);
    if (req.body.name) updateData.name = req.body.name;
    if (req.body.category) updateData.category = req.body.category;
    if (req.body.image) updateData.image = req.body.image;

    const updated = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json(updated);
  } catch (err) {
    console.error("Ürün güncelleme hatası:", err.message);
    res.status(500).json({ message: "Güncelleme hatası" });
  }
});



module.exports = router;
