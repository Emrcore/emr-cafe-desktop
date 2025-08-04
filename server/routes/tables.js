console.log("✅ /api/tables router yüklendi");

const express = require("express");
const router = express.Router();
const getTenantDb = require("../db");
const TableModel = require("../models/Table");
const OrderModel = require("../models/Order");

const getTableModel = (req) => {
  const connection = getTenantDb(req.tenantDbName);
  return TableModel(connection);
};

const getOrderModel = (req) => {
  const connection = getTenantDb(req.tenantDbName);
  return OrderModel(connection);
};

// ✅ Tüm masaları getir
router.get("/", async (req, res) => {
  try {
    const Table = getTableModel(req);
    const tables = await Table.find();
    res.json(tables);
  } catch (err) {
    console.error("Masa listeleme hatası:", err);
    res.status(500).json({ message: "Sunucu hatası" });
  }
});

// ✅ Tek masa getir
router.get("/:id", async (req, res) => {
  try {
    const Table = getTableModel(req);
    const table = await Table.findById(req.params.id);
    if (!table) return res.status(404).json({ error: "Masa bulunamadı" });
    res.json(table);
  } catch (err) {
    res.status(500).json({ message: "Sunucu hatası" });
  }
});

// ✅ Masa ekle
router.post("/", async (req, res) => {
  try {
    const Table = getTableModel(req);
    const newTable = new Table({
      name: req.body.name,
      status: "empty",
      orders: [],
    });
    await newTable.save();
    req.io.emit("tables:update", await Table.find());
    res.status(201).json(newTable);
  } catch (err) {
    res.status(500).json({ message: "Sunucu hatası" });
  }
});

// ✅ Masa sil
router.delete("/:id", async (req, res) => {
  try {
    const Table = getTableModel(req);
    await Table.findByIdAndDelete(req.params.id);
    req.io.emit("tables:update", await Table.find());
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ message: "Sunucu hatası" });
  }
});

// ✅ Masaya ürün ekle + mutfağa bildir
router.post("/:id/order", async (req, res) => {
  try {
    const Table = getTableModel(req);
    const Order = getOrderModel(req);

    const table = await Table.findById(req.params.id);
    if (!table) return res.status(404).json({ error: "Masa bulunamadı" });

    const order = req.body;
    if (!order.id || !order.name || typeof order.price !== "number") {
      return res.status(400).json({ message: "Eksik ürün verisi" });
    }

    // ✅ Masaya siparişi ekle
    const existing = table.orders.find((o) => o.id === order.id);
    if (existing) {
      existing.qty += 1;
    } else {
      table.orders.push({ ...order, qty: 1 });
    }

    table.status = "occupied";
    await table.save();

    // ✅ Mutfak siparişi oluştur
    const newOrder = new Order({
      table: table._id,
      items: [{ name: order.name, quantity: 1 }],
    });
    const savedOrder = await newOrder.save();
    const populatedOrder = await Order.findById(savedOrder._id).populate({
      path: "table",
      model: Table,
      select: "name",
    });

    // ������ Canlı bildirim
    req.io.emit("tables:update", await Table.find());
    req.io.emit("new-order", populatedOrder);

    res.json(table);
  } catch (err) {
    console.error("Sipariş ekleme hatası:", err);
    res.status(500).json({ message: "Sunucu hatası" });
  }
});

// ✅ Masadan ürün sil
router.post("/:id/remove", async (req, res) => {
  try {
    const Table = getTableModel(req);
    const table = await Table.findById(req.params.id);
    if (!table) return res.status(404).json({ error: "Masa bulunamadı" });

    const productId = req.body.id;
    table.orders = table.orders.filter((o) => o.id !== productId);
    if (table.orders.length === 0) table.status = "empty";

    await table.save();
    req.io.emit("tables:update", await Table.find());
    res.json(table);
  } catch (err) {
    res.status(500).json({ message: "Sunucu hatası" });
  }
});

// ✅ Ödeme işlemi
router.post("/:id/pay", async (req, res) => {
  try {
    const { paymentMethod } = req.body;
    const Table = getTableModel(req);
    const table = await Table.findById(req.params.id);
    if (!table) return res.status(404).json({ error: "Masa bulunamadı" });

    const total = table.orders.reduce((sum, item) => sum + item.price * item.qty, 0);

    table.orders = [];
    table.status = "empty";
    await table.save();
    req.io.emit("tables:update", await Table.find());

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Sunucu hatası" });
  }
});

// ✅ Masa taşıma işlemi
router.post("/transfer", async (req, res) => {
  try {
    const { fromTableId, toTableId } = req.body;
    if (!fromTableId || !toTableId) {
      return res.status(400).json({ message: "Gerekli masa ID'leri eksik" });
    }

    const Table = getTableModel(req);
    const fromTable = await Table.findById(fromTableId);
    const toTable = await Table.findById(toTableId);

    if (!fromTable || !toTable) {
      return res.status(404).json({ message: "Masa(lar) bulunamadı" });
    }

    toTable.orders = [...toTable.orders, ...fromTable.orders];
    toTable.status = "occupied";
    fromTable.orders = [];
    fromTable.status = "empty";

    await fromTable.save();
    await toTable.save();

    req.io.emit("tables:update", await Table.find());
    res.json({ message: "Sipariş başarıyla taşındı" });
  } catch (err) {
    console.error("Masa taşıma hatası:", err);
    res.status(500).json({ message: "Sunucu hatası" });
  }
});

module.exports = router;
