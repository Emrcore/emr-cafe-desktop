// server/routes/tables.js
if (!global.__tablesRouterLogged) {
  console.log("✅ /api/tables router yüklendi");
  global.__tablesRouterLogged = true;
}

const express = require("express");
const router = express.Router();
const { getTenantDb } = require("../db");
const TableFactory = require("../models/Table");
const TableCategoryFactory = require("../models/TableCategory"); // <-- var
const OrderFactory = require("../models/Order"); // varsa

// Tek noktadan model kur
async function getModels(req) {
  const conn = await getTenantDb(req); // ✅ tenantMiddleware olmasa da içerde çözüyor
  const TableCategory = TableCategoryFactory ? TableCategoryFactory(conn) : null;
  const Table = TableFactory(conn);
  const Order = OrderFactory ? OrderFactory(conn) : null;
  return { Table, TableCategory, Order };
}

// Ortak: tablo listesini TR + sayısal sıralama ile getir
function buildQuery(Table, TableCategory) {
  let q = Table.find();
  if (TableCategory) {
    q = q.populate({ path: "categoryId", model: TableCategory });
  }
  // ������ sayısal sıralama: "Masa 2" -> "Masa 10"dan önce
  return q.collation({ locale: "tr", numericOrdering: true }).sort({ name: 1 });
}

async function listTables(Table, TableCategory) {
  return await buildQuery(Table, TableCategory);
}

// ✅ Tüm masaları getir
router.get("/", async (req, res) => {
  try {
    const { Table, TableCategory } = await getModels(req);
    const tables = await listTables(Table, TableCategory);
    res.json(tables);
  } catch (err) {
    console.error("Masa listeleme hatası:", err);
    res.status(500).json({ message: "Sunucu hatası", detail: err.message });
  }
});

// ✅ Tek masa getir
router.get("/:id", async (req, res) => {
  try {
    const { Table, TableCategory } = await getModels(req);
    let q = Table.findById(req.params.id);
    if (TableCategory) {
      q = q.populate({ path: "categoryId", model: TableCategory });
    }
    const table = await q;
    if (!table) return res.status(404).json({ error: "Masa bulunamadı" });
    res.json(table);
  } catch (err) {
    console.error("Tek masa hatası:", err);
    res.status(500).json({ message: "Sunucu hatası", detail: err.message });
  }
});

// ✅ Masa ekle
router.post("/", async (req, res) => {
  try {
    const { Table, TableCategory } = await getModels(req);
    const { name, categoryId, capacity } = req.body || {};
    if (!name?.trim()) return res.status(400).json({ message: "Masa adı zorunlu" });

    const newTable = await Table.create({
      name: name.trim(),
      status: "empty",
      orders: [],
      categoryId: categoryId || null,
      capacity: Number.isFinite(+capacity) ? +capacity : 0,
    });

    // Güncel listeyi yayınla (TR + numericOrdering)
    const list = await listTables(Table, TableCategory);
    req.io?.emit("tables:update", list);
    res.status(201).json(newTable);
  } catch (err) {
    console.error("Masa ekleme hatası:", err);
    res.status(500).json({ message: "Sunucu hatası", detail: err.message });
  }
});

// ✅ Masa sil
router.delete("/:id", async (req, res) => {
  try {
    const { Table, TableCategory } = await getModels(req);
    await Table.findByIdAndDelete(req.params.id);

    const list = await listTables(Table, TableCategory);
    req.io?.emit("tables:update", list);
    res.status(204).send();
  } catch (err) {
    console.error("Masa silme hatası:", err);
    res.status(500).json({ message: "Sunucu hatası", detail: err.message });
  }
});

// ✅ Masaya ürün ekle + not + mutfağa bildir
router.post("/:id/order", async (req, res) => {
  try {
    const { Table, TableCategory, Order } = await getModels(req);

    const table = await Table.findById(req.params.id);
    if (!table) return res.status(404).json({ error: "Masa bulunamadı" });

    const { id, name, price, qty = 1, notes = "", category } = req.body || {};
    if (!id || !name || typeof price !== "number")
      return res.status(400).json({ message: "Eksik ürün verisi" });

    const existing = table.orders.find(
      (o) => o.id === id && (o.notes || "") === (notes || "")
    );
    if (existing) {
      existing.qty += Number(qty) || 1;
    } else {
      table.orders.push({
        id,
        name,
        price,
        qty: Number(qty) || 1,
        notes,
        category,
      });
    }

    table.status = "occupied";
    await table.save();

    if (Order) {
      const savedOrder = await Order.create({
        table: table._id,
        items: [{ name, quantity: Number(qty) || 1, notes }],
      });
      try {
        const populatedOrder = await Order.findById(savedOrder._id).populate({
          path: "table",
          model: Table,
          select: "name",
        });
        req.io?.emit("new-order", populatedOrder);
      } catch (e) {
        console.warn("Order populate yayın uyarısı:", e.message);
      }
    }

    const list = await listTables(Table, TableCategory);
    req.io?.emit("tables:update", list);
    res.json(table);
  } catch (err) {
    console.error("Sipariş ekleme hatası:", err);
    res.status(500).json({ message: "Sunucu hatası", detail: err.message });
  }
});

// ✅ Masadan ürün sil
router.post("/:id/remove", async (req, res) => {
  try {
    const { Table, TableCategory } = await getModels(req);
    const table = await Table.findById(req.params.id);
    if (!table) return res.status(404).json({ error: "Masa bulunamadı" });

    const productId = req.body?.id;
    table.orders = table.orders.filter((o) => o.id !== productId);
    if (table.orders.length === 0) table.status = "empty";

    await table.save();
    const list = await listTables(Table, TableCategory);
    req.io?.emit("tables:update", list);
    res.json(table);
  } catch (err) {
    console.error("Ürün silme hatası:", err);
    res.status(500).json({ message: "Sunucu hatası", detail: err.message });
  }
});

// ✅ Ödeme işlemi
router.post("/:id/pay", async (req, res) => {
  try {
    const { Table, TableCategory } = await getModels(req);
    const table = await Table.findById(req.params.id);
    if (!table) return res.status(404).json({ error: "Masa bulunamadı" });

    table.orders = [];
    table.status = "empty";
    await table.save();

    const list = await listTables(Table, TableCategory);
    req.io?.emit("tables:update", list);
    res.json({ success: true });
  } catch (err) {
    console.error("Ödeme hatası:", err);
    res.status(500).json({ message: "Sunucu hatası", detail: err.message });
  }
});

// ✅ Masa taşıma işlemi
router.post("/transfer", async (req, res) => {
  try {
    const { fromTableId, toTableId } = req.body || {};
    if (!fromTableId || !toTableId)
      return res.status(400).json({ message: "Gerekli masa ID'leri eksik" });

    const { Table, TableCategory } = await getModels(req);
    const fromTable = await Table.findById(fromTableId);
    const toTable = await Table.findById(toTableId);
    if (!fromTable || !toTable)
      return res.status(404).json({ message: "Masa(lar) bulunamadı" });

    toTable.orders.push(...fromTable.orders);
    toTable.status = toTable.orders.length ? "occupied" : toTable.status;
    fromTable.orders = [];
    fromTable.status = "empty";

    await fromTable.save();
    await toTable.save();

    const list = await listTables(Table, TableCategory);
    req.io?.emit("tables:update", list);
    res.json({ message: "Sipariş başarıyla taşındı" });
  } catch (err) {
    console.error("Masa taşıma hatası:", err);
    res.status(500).json({ message: "Sunucu hatası", detail: err.message });
  }
});

module.exports = router;
