const express = require("express");
const router = express.Router();
const OrderModel = require("../models/Order");
const TableModel = require("../models/Table");
const logAction = require("../utils/logAction"); // ? logAction eklendi

// ? Yeni sipari� olu�tur
router.post("/", async (req, res) => {
  try {
    const Order = OrderModel(req.db);
    const Table = TableModel(req.db);

    const newOrder = new Order({
      table: req.body.tableId,
      items: req.body.items,
      status: "open",
    });

    const savedOrder = await newOrder.save();

    const populatedOrder = await Order.findById(savedOrder._id).populate({
      path: "table",
      model: Table,
      select: "name",
    });

    req.io.emit("new-order", populatedOrder);

    // ? Logla: Sipari� olu�turuldu
    await logAction(req.user, "Sipari� olu�turdu", {
      table: populatedOrder.table?.name,
      items: populatedOrder.items,
    });

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
    ).populate("table");

    if (!updatedOrder) {
      return res.status(404).json({ message: "Sipari� bulunamad�" });
    }

    req.io.emit("order-completed", updatedOrder._id);

    // ? Logla: Sipari� tamamland�
    await logAction(req.user, "Sipari�i tamamlad�", {
      table: updatedOrder.table?.name,
      orderId: updatedOrder._id,
    });

    res.json({ message: "Sipari� tamamland�", order: updatedOrder });
  } catch (err) {
    console.error("? Tamamlama hatas�:", err);
    res.status(500).json({ message: "Tamamlama ba�ar�s�z" });
  }
});

module.exports = router;
