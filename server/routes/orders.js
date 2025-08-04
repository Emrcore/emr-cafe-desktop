const express = require("express");
const router = express.Router();
const OrderModel = require("../models/Order");
const TableModel = require("../models/Table");

// ? Yeni sipari� olu�tur
router.post("/", async (req, res) => {
  try {
    const Order = OrderModel(req.db); // tenant'a �zel Order modeli
    const Table = TableModel(req.db);

    const newOrder = new Order({
      table: req.body.tableId,
      items: req.body.items,
      status: "open", // ?? G�venli �ekilde sunucu belirliyor
    });

    const savedOrder = await newOrder.save();

    // ? Table ismini populate et
    const populatedOrder = await Order.findById(savedOrder._id).populate({
      path: "table",
      model: Table,
      select: "name",
    });

    // ?? Mutfak ekran�na socket ile bildir
    req.io.emit("new-order", populatedOrder);

    res.status(201).json(populatedOrder);
  } catch (err) {
    console.error("? Sipari� olu�turma hatas�:", err);
    res.status(500).json({ message: "Sipari� olu�turulamad�" });
  }
});

// ? A��k sipari�leri getir
router.get("/", async (req, res) => {
  try {
    const Order = OrderModel(req.db);
    const Table = TableModel(req.db);

    const orders = await Order.find({ status: "open" })
      .populate({
        path: "table",
        model: Table,
        select: "name",
      })
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    console.error("? Sipari� �ekme hatas�:", err);
    res.status(500).json({ message: "Sipari�ler al�namad�" });
  }
});

// ? Sipari�i tamamla
router.put("/:id/complete", async (req, res) => {
  try {
    const Order = OrderModel(req.db);
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { status: "completed" },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: "Sipari� bulunamad�" });
    }

    req.io.emit("order-completed", updatedOrder._id);
    res.json({ message: "Sipari� tamamland�", order: updatedOrder });
  } catch (err) {
    console.error("? Tamamlama hatas�:", err);
    res.status(500).json({ message: "Tamamlama ba�ar�s�z" });
  }
});

module.exports = router;
