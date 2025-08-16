// pages/AdminTables.jsx
import { useState, useEffect } from "react";
import axios from "../api/axios";
import BackButton from "../components/BackButton";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

const toArray = (v) => {
  if (Array.isArray(v)) return v;
  if (!v) return [];
  if (Array.isArray(v.data)) return v.data;
  if (Array.isArray(v.items)) return v.items;
  if (Array.isArray(v.rows)) return v.rows;
  if (Array.isArray(v.list)) return v.list;
  if (Array.isArray(v.tables)) return v.tables;
  if (Array.isArray(v.result)) return v.result;
  return [];
};

export default function AdminTables() {
  // Masalar
  const [tables, setTables] = useState([]);
  const [newTableName, setNewTableName] = useState("");
  const [newTableCategory, setNewTableCategory] = useState("");

  // Kategoriler
  const [categories, setCategories] = useState([]);
  const [catForm, setCatForm] = useState({ name: "", color: "#6b7280", order: 0 }); // varsayılan renk: slate-500
  const [catOpen, setCatOpen] = useState(true); // üstte açık gelsin

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [tRes, cRes] = await Promise.all([
        axios.get("/tables"),
        axios.get("/table-categories"),
      ]);
      setTables(toArray(tRes?.data));
      setCategories(toArray(cRes?.data));
    } catch (err) {
      console.error("fetchAll error:", err?.response?.data || err?.message);
      toast.error("Veriler alınamadı");
      setTables([]);
      setCategories([]);
    }
  };

  // --- Kategori Ekle ---
  const addCategory = async (e) => {
    e?.preventDefault?.();
    const name = (catForm.name || "").trim();
    if (!name) return toast.error("Kategori adı zorunlu");

    try {
      await axios.post("/table-categories", {
        name,
        color: catForm.color || "#6b7280",
        order: Number(catForm.order) || 0,
      });
      toast.success("📁 Kategori eklendi");
      setCatForm({ name: "", color: "#6b7280", order: 0 });
      await fetchAll();
    } catch (err) {
      console.error("Kategori ekleme hatası:", err.response?.data || err.message);
      toast.error(err.response?.data?.message || "Kategori eklenemedi");
    }
  };

  // --- Masa Ekle ---
  const addTable = async () => {
    const name = newTableName.trim();
    if (!name) return toast.error("Masa adı boş olamaz");

    try {
      await axios.post("/tables", {
        name,
        categoryId: newTableCategory || null,
      });
      toast.success("🪑 Masa eklendi");
      setNewTableName("");
      setNewTableCategory("");
      fetchAll();
    } catch (err) {
      console.error("Masa ekleme hatası:", err.response?.data || err.message);
      toast.error(err.response?.data?.message || "Masa eklenemedi");
    }
  };

  const updateTable = async (id, patch) => {
    try {
      await axios.put(`/tables/${id}`, patch);
      fetchAll();
    } catch (err) {
      console.error("Masa güncelleme hatası:", err.response?.data || err.message);
      toast.error(err.response?.data?.message || "Güncellenemedi");
    }
  };

  const deleteTable = async (id) => {
    if (!window.confirm("Bu masayı silmek istediğinizden emin misiniz?")) return;
    try {
      await axios.delete(`/tables/${id}`);
      toast("Masa silindi", { icon: "🪑" });
      fetchAll();
    } catch (err) {
      toast.error("Masa silinemedi!");
      console.error("Silme hatası:", err.response?.data || err.message);
    }
  };

  const safeTables = Array.isArray(tables) ? tables : [];
  const safeCategories = Array.isArray(categories) ? categories : [];

  const getCatName = (table) =>
    (table?.categoryId && (table.categoryId.name || table.categoryId._id)) || "Kategorisiz";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 to-slate-900 p-4 text-white">
      <BackButton />
      <h2 className="text-2xl font-bold mb-6">🪑 Masa Yönetimi</h2>

      {/* --- KATEGORİ EKLE (ÜST BLOK) --- */}
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">📁 Kategori Ekle</h3>
          <button
            onClick={() => setCatOpen((v) => !v)}
            className="text-sm px-3 py-1 rounded bg-white/10 hover:bg-white/20"
          >
            {catOpen ? "Gizle" : "Göster"}
          </button>
        </div>

        {catOpen && (
          <form onSubmit={addCategory} className="grid gap-3 md:grid-cols-12">
            <input
              className="md:col-span-5 border p-2 rounded bg-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Kategori adı (örn: Bahçe, Teras, VIP)"
              value={catForm.name}
              onChange={(e) => setCatForm((s) => ({ ...s, name: e.target.value }))}
              required
            />
            <input
              type="color"
              className="md:col-span-2 border p-2 rounded bg-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={catForm.color}
              onChange={(e) => setCatForm((s) => ({ ...s, color: e.target.value }))}
              title="Renk"
            />
            <input
              type="number"
              className="md:col-span-2 border p-2 rounded bg-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Sıra (ops.)"
              value={catForm.order}
              onChange={(e) => setCatForm((s) => ({ ...s, order: e.target.value }))}
            />
            <button
              type="submit"
              className="md:col-span-3 bg-emerald-600 hover:bg-emerald-700 transition px-4 py-2 rounded text-white"
            >
              ➕ Kategori Ekle
            </button>
          </form>
        )}

        {/* Mevcut kategorileri küçük rozetlerle göster */}
        {safeCategories.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {safeCategories.map((c) => (
              <span
                key={c._id}
                className="text-xs px-2 py-1 rounded-full"
                style={{ background: c.color || "#6b7280" }}
                title={`Sıra: ${c.order ?? 0}`}
              >
                {c.name}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* --- MASA EKLE --- */}
      <div className="grid gap-2 sm:grid-cols-12 mb-6">
        <input
          value={newTableName}
          onChange={(e) => setNewTableName(e.target.value)}
          placeholder="Yeni masa adı"
          className="sm:col-span-5 border p-2 rounded bg-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <select
          value={newTableCategory}
          onChange={(e) => setNewTableCategory(e.target.value)}
          className="sm:col-span-4 border p-2 rounded bg-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="">Kategori (opsiyonel)</option>
          {safeCategories.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>
        <button
          onClick={addTable}
          className="sm:col-span-3 bg-blue-600 hover:bg-blue-700 transition px-4 py-2 rounded text-white"
        >
          ➕ Masa Ekle
        </button>
      </div>

      {/* --- MASA LİSTESİ --- */}
      <ul className="space-y-3">
        {safeTables.map((table) => {
          const id = table._id || table.id;
          return (
            <motion.li
              key={id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-800 px-4 py-3 rounded-lg shadow border border-slate-700"
            >
              <div className="flex items-center gap-3">
                <span className="font-semibold text-sm">{table.name}</span>
                <span className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full bg-white/10">
                  {getCatName(table)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <select
                  className="border text-sm p-1.5 rounded bg-slate-700 text-white"
                  value={
                    typeof table.categoryId === "object" && table.categoryId?._id
                      ? table.categoryId._id
                      : table.categoryId || ""
                  }
                  onChange={(e) => updateTable(id, { categoryId: e.target.value || null })}
                >
                  <option value="">Kategorisiz</option>
                  {safeCategories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => deleteTable(id)}
                  className="bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700 transition"
                >
                  🗑️ Sil
                </button>
              </div>
            </motion.li>
          );
        })}
      </ul>
    </div>
  );
}
