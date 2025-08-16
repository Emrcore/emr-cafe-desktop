// pages/AdminProducts.jsx
import { useEffect, useMemo, useState } from "react";
import BackButton from "../components/BackButton";
import axios from "../api/axios";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

/** Görsel adresini üret */
const getImageUrl = (imagePath) => {
  const base = import.meta.env.VITE_API_BASE_URL?.replace(/\/api$/, "") || "";
  if (!imagePath) return "/default.png";
  return imagePath.startsWith("http") ? imagePath : `${base}${imagePath}`;
};

const PAGE_SIZE = 12;

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Ekleme formu
  const [form, setForm] = useState({ name: "", price: "", category: "" });

  // Filtreler
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState(""); // debounce için
  const [selectedCat, setSelectedCat] = useState("Tümü");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortKey, setSortKey] = useState("name_asc");

  // Sayfalama
  const [page, setPage] = useState(1);

  // Düzenleme paneli
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState(null); // {_id,name,price,category,image}

  /** İlk yükleme */
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/products");
      setProducts(res.data || []);
    } catch (e) {
      console.error(e);
      toast.error("Ürünler yüklenemedi");
    } finally {
      setLoading(false);
    }
  };

  /** Arama inputunu debounce et (300ms) */
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q.trim().toLowerCase()), 300);
    return () => clearTimeout(t);
  }, [q]);

  /** Kategori istatistiği (çipler) */
  const categories = useMemo(() => {
    const map = {};
    for (const p of products) {
      const c = p.category || "Diğer";
      map[c] = (map[c] || 0) + 1;
    }
    const arr = Object.entries(map)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name, "tr"));
    return [{ name: "Tümü", count: products.length }, ...arr];
  }, [products]);

  /** Filtrelenmiş + sıralı liste */
  const filtered = useMemo(() => {
    let list = [...products];

    // Arama
    if (debouncedQ) {
      list = list.filter((p) =>
        (p.name || "").toLowerCase().includes(debouncedQ)
      );
    }

    // Kategori
    if (selectedCat !== "Tümü") {
      list = list.filter((p) => (p.category || "Diğer") === selectedCat);
    }

    // Fiyat aralığı
    const min = minPrice !== "" ? Number(minPrice) : null;
    const max = maxPrice !== "" ? Number(maxPrice) : null;
    if (min != null) list = list.filter((p) => Number(p.price) >= min);
    if (max != null) list = list.filter((p) => Number(p.price) <= max);

    // Sıralama
    list.sort((a, b) => {
      const pa = Number(a.price);
      const pb = Number(b.price);
      const na = (a.name || "").toLowerCase();
      const nb = (b.name || "").toLowerCase();

      switch (sortKey) {
        case "price_asc":
          return pa - pb;
        case "price_desc":
          return pb - pa;
        case "name_desc":
          return nb.localeCompare(na, "tr");
        case "name_asc":
        default:
          return na.localeCompare(nb, "tr");
      }
    });

    return list;
  }, [products, debouncedQ, selectedCat, minPrice, maxPrice, sortKey]);

  /** Sayfalama verileri */
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageSafe = Math.min(page, totalPages);
  const pageItems = useMemo(() => {
    const start = (pageSafe - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, pageSafe]);

  /** Ekleme */
  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const addProduct = async () => {
    if (!form.name?.trim() || form.price === "") {
      return toast.error("Ad ve fiyat zorunlu");
    }
    try {
      await axios.post("/products", {
        name: form.name.trim(),
        price: Number(form.price),
        category: form.category?.trim() || "",
      });
      toast.success("✅ Ürün eklendi");
      setForm({ name: "", price: "", category: "" });
      await fetchProducts();
      // Arama/filtre resetlemek istersen buraya ekleyebilirsin
    } catch (e) {
      toast.error("❌ Ürün eklenemedi");
    }
  };

  /** Silme */
  const deleteProduct = async (id) => {
    if (!window.confirm("Bu ürünü silmek istediğinize emin misiniz?")) return;
    try {
      await axios.delete(`/products/${id}`);
      toast("🗑️ Ürün silindi");
      await fetchProducts();
    } catch {
      toast.error("Silme başarısız");
    }
  };

  /** Düzenleme panelini aç/kapat */
  const openEdit = (p) => {
    setEditing({ ...p, price: Number(p.price) });
    setEditOpen(true);
  };
  const closeEdit = () => {
    setEditOpen(false);
    setEditing(null);
  };

  /** Düzenlemeyi kaydet */
  const saveEdit = async () => {
    if (!editing?._id) return;
    try {
      await axios.put(`/products/${editing._id}`, {
        name: editing.name?.trim(),
        category: editing.category?.trim(),
        price: Number(editing.price),
      });
      toast.success("💾 Ürün güncellendi");
      closeEdit();
      await fetchProducts();
    } catch (e) {
      console.error(e);
      toast.error("❌ Güncellenemedi");
    }
  };

  /** Görsel yükleme (listeden ve panelden ortak) */
  const handleImageUpload = async (e, id) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("image", file);
    try {
      await axios.post(`/products/${id}/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("📸 Resim yüklendi");
      await fetchProducts();
    } catch {
      toast.error("❌ Resim yüklenemedi");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 to-slate-900 p-4 text-white">
      <BackButton />
      <h2 className="text-2xl font-bold mb-6">📦 Ürün Yönetimi</h2>

      {/* Arama & Filtreler */}
      <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-3">
          <input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
            placeholder="Ürün ara (ad)"
            className="flex-1 p-2 rounded bg-slate-800 border border-slate-700 focus:outline-none focus:border-sky-500"
          />
          <select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value)}
            className="p-2 rounded bg-slate-800 border border-slate-700"
          >
            <option value="name_asc">Ada göre (A→Z)</option>
            <option value="name_desc">Ada göre (Z→A)</option>
            <option value="price_asc">Fiyata göre (Artan)</option>
            <option value="price_desc">Fiyata göre (Azalan)</option>
          </select>
          <input
            type="number"
            inputMode="decimal"
            placeholder="Min ₺"
            value={minPrice}
            onChange={(e) => {
              setMinPrice(e.target.value);
              setPage(1);
            }}
            className="w-28 p-2 rounded bg-slate-800 border border-slate-700"
          />
          <input
            type="number"
            inputMode="decimal"
            placeholder="Max ₺"
            value={maxPrice}
            onChange={(e) => {
              setMaxPrice(e.target.value);
              setPage(1);
            }}
            className="w-28 p-2 rounded bg-slate-800 border border-slate-700"
          />
        </div>

        {/* Kategori çipleri */}
        <div className="flex gap-2 overflow-x-auto mt-3 no-scrollbar">
          {categories.map((c) => {
            const active = selectedCat === c.name;
            return (
              <button
                key={c.name}
                onClick={() => {
                  setSelectedCat(c.name);
                  setPage(1);
                }}
                className={[
                  "whitespace-nowrap px-3 py-1.5 rounded-full text-sm border transition",
                  active
                    ? "bg-sky-600 border-sky-500"
                    : "bg-slate-800 border-slate-700 hover:bg-slate-700",
                ].join(" ")}
                title={`${c.name} (${c.count})`}
              >
                {c.name} <span className="opacity-75">({c.count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Ekleme formu */}
      <div className="flex flex-col sm:flex-row gap-2 mb-6">
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Ürün adı"
          className="border p-2 rounded flex-1 bg-slate-700 text-white border-slate-600"
        />
        <input
          name="price"
          type="number"
          value={form.price}
          onChange={handleChange}
          placeholder="Fiyat"
          className="border p-2 rounded w-28 bg-slate-700 text-white border-slate-600"
        />
        <input
          name="category"
          value={form.category}
          onChange={handleChange}
          placeholder="Kategori"
          className="border p-2 rounded w-36 bg-slate-700 text-white border-slate-600"
        />
        <button
          onClick={addProduct}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-all"
        >
          ➕ Ekle
        </button>
      </div>

      {/* Liste */}
      <div className="bg-slate-800/40 border border-slate-700 rounded-xl">
        {loading ? (
          <div className="p-6 text-center text-slate-300">Yükleniyor…</div>
        ) : filtered.length === 0 ? (
          <div className="p-6 text-center text-slate-300">Eşleşen ürün yok.</div>
        ) : (
          <ul className="divide-y divide-slate-700">
            {pageItems.map((p) => (
              <motion.li
                key={p._id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between gap-4 p-3"
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <label className="relative cursor-pointer group">
                    <img
                      src={getImageUrl(p.image)}
                      alt={p.name}
                      className="w-16 h-16 object-cover rounded border border-slate-600 group-hover:opacity-90"
                    />
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, p._id)}
                    />
                    <span className="absolute bottom-1 right-1 text-[10px] bg-black/60 px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100">
                      Değiştir
                    </span>
                  </label>

                <div className="min-w-0">
                    <div className="font-semibold truncate">{p.name}</div>
                    <div className="text-xs text-slate-400 italic truncate">
                      {(p.category || "Diğer")}
                    </div>
                    <div className="text-sm mt-1">{Number(p.price).toFixed(2)} ₺</div>
                  </div>
                </div>

                <div className="flex gap-2 items-center">
                  <button
                    onClick={() => openEdit(p)}
                    className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700"
                  >
                    Düzenle
                  </button>
                  <button
                    onClick={() => deleteProduct(p._id)}
                    className="bg-red-500 text-white px-3 py-1 rounded text-xs hover:bg-red-600"
                  >
                    Sil
                  </button>
                </div>
              </motion.li>
            ))}
          </ul>
        )}
      </div>

      {/* Sayfalama */}
      {filtered.length > PAGE_SIZE && (
        <div className="flex justify-center items-center gap-2 mt-4">
          <button
            disabled={pageSafe === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-3 py-1.5 rounded bg-slate-800 border border-slate-700 disabled:opacity-50"
          >
            ◀
          </button>
          <div className="text-sm text-slate-300">
            Sayfa {pageSafe} / {totalPages}
          </div>
          <button
            disabled={pageSafe === totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="px-3 py-1.5 rounded bg-slate-800 border border-slate-700 disabled:opacity-50"
          >
            ▶
          </button>
        </div>
      )}

      {/* Sağdan kayan düzenleme paneli */}
      <AnimatePresence>
        {editOpen && editing && (
          <motion.div
            className="fixed inset-0 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="absolute inset-0 bg-black/50"
              onClick={closeEdit}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 30 }}
              className="absolute right-0 top-0 h-full w-full sm:w-[480px] bg-slate-900 border-l border-slate-700 p-4 overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">Ürün Düzenle</h3>
                <button
                  onClick={closeEdit}
                  className="text-slate-300 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <label className="relative cursor-pointer group">
                    <img
                      src={getImageUrl(editing.image)}
                      alt={editing.name}
                      className="w-24 h-24 object-cover rounded border border-slate-600"
                    />
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, editing._id)}
                    />
                    <span className="absolute bottom-1 right-1 text-[10px] bg-black/60 px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100">
                      Değiştir
                    </span>
                  </label>

                  <div className="flex-1">
                    <label className="text-sm text-slate-300">Ad</label>
                    <input
                      value={editing.name || ""}
                      onChange={(e) => setEditing((s) => ({ ...s, name: e.target.value }))}
                      className="mt-1 w-full p-2 rounded bg-slate-800 border border-slate-700"
                      placeholder="Ürün adı"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm text-slate-300">Kategori</label>
                  <input
                    value={editing.category || ""}
                    onChange={(e) =>
                      setEditing((s) => ({ ...s, category: e.target.value }))
                    }
                    className="mt-1 w-full p-2 rounded bg-slate-800 border border-slate-700"
                    placeholder="Kategori"
                  />
                </div>

                <div>
                  <label className="text-sm text-slate-300">Fiyat (₺)</label>
                  <input
                    type="number"
                    inputMode="decimal"
                    value={editing.price ?? ""}
                    onChange={(e) =>
                      setEditing((s) => ({ ...s, price: e.target.value }))
                    }
                    className="mt-1 w-full p-2 rounded bg-slate-800 border border-slate-700"
                    placeholder="0.00"
                  />
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <button
                    onClick={closeEdit}
                    className="px-4 py-2 rounded bg-slate-700 hover:bg-slate-600"
                  >
                    İptal
                  </button>
                  <button
                    onClick={saveEdit}
                    className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700"
                  >
                    Kaydet
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
