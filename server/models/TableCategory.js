// models/TableCategory.js
const mongoose = require("mongoose");

module.exports = (connection) => {
  // Ayný connection’da model zaten varsa tekrar þema kurma
  try {
    return connection.model("TableCategory");
  } catch (_) {
    const TableCategorySchema = new mongoose.Schema(
      {
        name: { type: String, required: true, trim: true }, // Örn: Bahçe, Teras, VIP
        color: { type: String, default: "#6b7280" },         // UI rozet rengi
        order: { type: Number, default: 0 },                 // Sýralama
        isDefault: { type: Boolean, default: false },        // Varsayýlan kategori (silinemez)
      },
      { timestamps: true }
    );

    // Ýsteðe baðlý: ayný isimden tek olsun (tenant DB içinde)
    // TableCategorySchema.index({ name: 1 }, { unique: true });

    // JSON çýktýlarda temiz görünüm
    TableCategorySchema.set("toJSON", { virtuals: true });
    TableCategorySchema.set("toObject", { virtuals: true });

    return connection.model("TableCategory", TableCategorySchema);
  }
};
