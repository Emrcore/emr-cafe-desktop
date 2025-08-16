// models/Table.js
const mongoose = require("mongoose");

module.exports = (connection) => {
  // Ayný connection'da model zaten derlenmiþse direkt onu döndür.
  if (connection.models.Table) return connection.models.Table;

  // Alt belge (sipariþ satýrý)
  const OrderItemSchema = new mongoose.Schema(
    {
      id: { type: String, required: true, trim: true },   // ürün ID (string/ObjectId-string)
      name: { type: String, required: true, trim: true }, // ürün adý
      price: { type: Number, required: true, min: 0 },    // birim fiyat
      qty: { type: Number, required: true, min: 1, default: 1 }, // adet
      notes: { type: String, trim: true, default: "" },   // opsiyonel açýklama
      category: { type: String, trim: true },             // opsiyonel (ürün kategori adý)
    },
    { _id: false }
  );

  const TableSchema = new mongoose.Schema(
    {
      name: { type: String, required: true, trim: true },
      status: {
        type: String,
        enum: ["empty", "occupied", "reserved"],
        default: "empty",
        index: true,
      },
      capacity: { type: Number, default: 0, min: 0 },

      // Masa kategorisi (örn: Bahçe, Teras, VIP)
      categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "TableCategory", // Ayný connection’da "TableCategory" modeli olmalý
        default: null,
        index: true,
      },

      orders: { type: [OrderItemSchema], default: [] },
    },
    {
      timestamps: true, // createdAt & updatedAt
      toJSON: { virtuals: true, versionKey: false },
      toObject: { virtuals: true, versionKey: false },
    }
  );

  // Ýsim için performans indeks (unique istersen aþaðýdaki satýrý aç,
  // ama önce tenant DB'lerinde çakýþma olup olmayacaðýný kontrol et)
  // TableSchema.index({ name: 1 }, { unique: true });

  // Koleksiyon adýný açýkça veriyoruz: "tables"
  return connection.model("Table", TableSchema, "tables");
};
