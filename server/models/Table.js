// models/Table.js
const mongoose = require("mongoose");

module.exports = (connection) => {
  // Ayn� connection'da model zaten derlenmi�se direkt onu d�nd�r.
  if (connection.models.Table) return connection.models.Table;

  // Alt belge (sipari� sat�r�)
  const OrderItemSchema = new mongoose.Schema(
    {
      id: { type: String, required: true, trim: true },   // �r�n ID (string/ObjectId-string)
      name: { type: String, required: true, trim: true }, // �r�n ad�
      price: { type: Number, required: true, min: 0 },    // birim fiyat
      qty: { type: Number, required: true, min: 1, default: 1 }, // adet
      notes: { type: String, trim: true, default: "" },   // opsiyonel a��klama
      category: { type: String, trim: true },             // opsiyonel (�r�n kategori ad�)
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

      // Masa kategorisi (�rn: Bah�e, Teras, VIP)
      categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "TableCategory", // Ayn� connection�da "TableCategory" modeli olmal�
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

  // �sim i�in performans indeks (unique istersen a�a��daki sat�r� a�,
  // ama �nce tenant DB'lerinde �ak��ma olup olmayaca��n� kontrol et)
  // TableSchema.index({ name: 1 }, { unique: true });

  // Koleksiyon ad�n� a��k�a veriyoruz: "tables"
  return connection.model("Table", TableSchema, "tables");
};
