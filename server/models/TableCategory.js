// models/TableCategory.js
const mongoose = require("mongoose");

module.exports = (connection) => {
  // Ayn� connection�da model zaten varsa tekrar �ema kurma
  try {
    return connection.model("TableCategory");
  } catch (_) {
    const TableCategorySchema = new mongoose.Schema(
      {
        name: { type: String, required: true, trim: true }, // �rn: Bah�e, Teras, VIP
        color: { type: String, default: "#6b7280" },         // UI rozet rengi
        order: { type: Number, default: 0 },                 // S�ralama
        isDefault: { type: Boolean, default: false },        // Varsay�lan kategori (silinemez)
      },
      { timestamps: true }
    );

    // �ste�e ba�l�: ayn� isimden tek olsun (tenant DB i�inde)
    // TableCategorySchema.index({ name: 1 }, { unique: true });

    // JSON ��kt�larda temiz g�r�n�m
    TableCategorySchema.set("toJSON", { virtuals: true });
    TableCategorySchema.set("toObject", { virtuals: true });

    return connection.model("TableCategory", TableCategorySchema);
  }
};
