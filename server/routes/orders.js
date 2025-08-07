const express = require("express");
const router = express.Router();
const OrderModel = require("../models/Order");
const TableModel = require("../models/Table");
const logAction = require("../utils/logAction"); // ? logAction eklendi

// ? Yeni sipariþ oluþtur
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

    // ? Logla: Sipariþ oluþturuldu
    await logAction(req.user, "Sipariþ oluþturdu", {
      table: populatedOrder.table?.name,
      items: populatedOrder.items,
    });

    res.status(201).json(populatedOrder);
  } catch (err) {
    console.error("? Sipariþ oluþturma hatasý:", err);
    res.status(500).json({ message: "Sipariþ oluþturulamadý" });
  }
});

// ? Açýk sipariþleri getir
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
    console.error("? Sipariþ çekme hatasý:", err);
    res.status(500).json({ message: "Sipariþler alýnamadý" });
  }
});

// ? Sipariþi tamamla
router.put("/:id/complete", async (req, res) => {
  try {
    const Order = OrderModel(req.db);
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { status: "completed" },
      { new: true }
    ).populate("table");

    if (!updatedOrder) {
      return res.status(404).json({ message: "Sipariþ bulunamadý" });
    }

    req.io.emit("order-completed", updatedOrder._id);

    // ? Logla: Sipariþ tamamlandý
    await logAction(req.user, "Sipariþi tamamladý", {
      table: updatedOrder.table?.name,
      orderId: updatedOrder._id,
    });

    res.json({ message: "Sipariþ tamamlandý", order: updatedOrder });
  } catch (err) {
    console.error("? Tamamlama hatasý:", err);
    res.status(500).json({ message: "Tamamlama baþarýsýz" });
  }
});

module.exports = router;
