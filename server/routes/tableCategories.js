// routes/tableCategories.js
const express = require("express");
const router = express.Router();

const { getTenantDb } = require("../db"); // ? sadece gerekeni al
const TableCategoryFactory = require("../models/TableCategory");

// Liste
router.get("/", async (req, res, next) => {
  try {
    const db = await getTenantDb(req);
    const TableCategory = TableCategoryFactory(db);
    const list = await TableCategory.find().sort({ order: 1, name: 1 });
    res.json(list);
  } catch (e) {
    next(e);
  }
});

// Ekle
router.post("/", async (req, res, next) => {
  try {
    const { name, color, order } = req.body;
    if (!name) return res.status(400).json({ message: "Kategori adý zorunlu" });

    const db = await getTenantDb(req);
    const TableCategory = TableCategoryFactory(db);

    const created = await TableCategory.create({
      name: name.trim(),
      color: color || "#6b7280",
      order: Number.isFinite(order) ? order : 0,
    });

    req.io?.emit("table-category-created", created);
    res.status(201).json(created);
  } catch (e) {
    next(e);
  }
});

// (opsiyonel) Güncelle
router.put("/:id", async (req, res, next) => {
  try {
    const db = await getTenantDb(req);
    const TableCategory = TableCategoryFactory(db);

    const { name, color, order, isDefault } = req.body;
    const updated = await TableCategory.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          ...(name !== undefined ? { name: String(name).trim() } : {}),
          ...(color !== undefined ? { color } : {}),
          ...(order !== undefined ? { order: Number(order) || 0 } : {}),
          ...(isDefault !== undefined ? { isDefault: !!isDefault } : {}),
        },
      },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: "Kategori bulunamadý" });

    req.io?.emit("table-category-updated", updated);
    res.json(updated);
  } catch (e) {
    next(e);
  }
});

// (opsiyonel) Sil
router.delete("/:id", async (req, res, next) => {
  try {
    const db = await getTenantDb(req);
    const TableCategory = TableCategoryFactory(db);

    const existing = await TableCategory.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: "Kategori bulunamadý" });
    if (existing.isDefault) return res.status(400).json({ message: "Varsayýlan kategori silinemez" });

    await TableCategory.deleteOne({ _id: existing._id });

    req.io?.emit("table-category-deleted", { _id: existing._id });
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
