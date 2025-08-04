const express = require("express");
const router = express.Router();
const OrderModel = require("../models/Order");
const TableModel = require("../models/Table");

// ? Yeni sipariþ oluþtur
router.post("/", async (req, res) => {
  try {
    const Order = OrderModel(req.db); // tenant'a özel Order modeli
    const Table = TableModel(req.db);

    const newOrder = new Order({
      table: req.body.tableId,
      items: req.body.items,
      status: "open", // ?? Güvenli þekilde sunucu belirliyor
    });

    const savedOrder = await newOrder.save();

    // ? Table ismini populate et
    const populatedOrder = await Order.findById(savedOrder._id).populate({
      path: "table",
      model: Table,
      select: "name",
    });

    // ?? Mutfak ekranýna socket ile bildir
    req.io.emit("new-order", populatedOrder);

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
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: "Sipariþ bulunamadý" });
    }

    req.io.emit("order-completed", updatedOrder._id);
    res.json({ message: "Sipariþ tamamlandý", order: updatedOrder });
  } catch (err) {
    console.error("? Tamamlama hatasý:", err);
    res.status(500).json({ message: "Tamamlama baþarýsýz" });
  }
});

module.exports = router;
