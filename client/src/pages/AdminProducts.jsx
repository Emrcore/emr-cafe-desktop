import { useEffect, useState } from "react";
import BackButton from "../components/BackButton";
import axios from "../api/axios";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

const getImageUrl = (imagePath) => {
  const base = import.meta.env.VITE_API_BASE_URL?.replace(/\/api$/, "") || "";
  return imagePath?.startsWith("http") ? imagePath : `${base}${imagePath}`;
};

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ name: "", price: "", category: "" });
  const [editingId, setEditingId] = useState(null);
  const [editedPrice, setEditedPrice] = useState("");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const res = await axios.get("/products");
    setProducts(res.data);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const addProduct = async () => {
    if (!form.name || !form.price) return;
    await axios.post("/products", form);
    toast.success("✅ Ürün eklendi");
    setForm({ name: "", price: "", category: "" });
    fetchProducts();
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("Bu ürünü silmek istediğinize emin misiniz?")) return;
    await axios.delete(`/products/${id}`);
    toast("🗑️ Ürün silindi");
    fetchProducts();
  };

  const startEdit = (product) => {
    setEditingId(product._id);
    setEditedPrice(product.price);
  };

  const saveEdit = async (id) => {
    try {
      await axios.put(`/products/${id}`, { price: Number(editedPrice) });
      toast.success("💾 Fiyat güncellendi");
      setEditingId(null);
      fetchProducts();
    } catch (err) {
      toast.error("❌ Fiyat güncellenemedi");
    }
  };

  const handleImageUpload = async (e, id) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    try {
      await axios.post(`/products/${id}/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("📸 Resim yüklendi");
      fetchProducts();
    } catch (err) {
      toast.error("❌ Resim yüklenemedi");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 to-slate-900 p-4 text-white">
      <BackButton />
      <h2 className="text-2xl font-bold mb-6">📦 Ürün Yönetimi</h2>

      {/* Ürün Ekleme Formu */}
      <div className="flex flex-col sm:flex-row gap-2 mb-6">
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Ürün adı"
          className="border p-2 rounded flex-1 bg-slate-700 text-white"
        />
        <input
          name="price"
          type="number"
          value={form.price}
          onChange={handleChange}
          placeholder="Fiyat"
          className="border p-2 rounded w-28 bg-slate-700 text-white"
        />
        <input
          name="category"
          value={form.category}
          onChange={handleChange}
          placeholder="Kategori"
          className="border p-2 rounded w-36 bg-slate-700 text-white"
        />
        <button
          onClick={addProduct}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-all"
        >
          ➕ Ekle
        </button>
      </div>

      {/* Ürün Listesi */}
      <ul className="space-y-4">
        {products.map((p) => (
          <motion.li
            key={p._id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between border-b pb-3 gap-4"
          >
            <div className="flex items-center gap-4 flex-1">
              <img
                src={getImageUrl(p.image)}
                alt={p.name}
                className="w-16 h-16 object-cover rounded border border-slate-600 hover:scale-105 transition-transform"
              />
              <div>
                <div className="font-semibold">{p.name}</div>
                <div className="text-sm text-slate-400 italic">{p.category}</div>
                {editingId === p._id ? (
                  <input
                    type="number"
                    className="border rounded px-2 py-1 mt-1 w-24 text-black"
                    value={editedPrice}
                    onChange={(e) => setEditedPrice(e.target.value)}
                  />
                ) : (
                  <div className="text-sm mt-1">{p.price} ₺</div>
                )}
              </div>
            </div>

            <div className="flex gap-2 items-center">
              <label className="text-xs text-blue-300 cursor-pointer hover:underline">
                Resim Seç
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, p._id)}
                />
              </label>

              {editingId === p._id ? (
                <button
                  onClick={() => saveEdit(p._id)}
                  className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700"
                >
                  Kaydet
                </button>
              ) : (
                <button
                  onClick={() => startEdit(p)}
                  className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700"
                >
                  Düzenle
                </button>
              )}
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
    </div>
  );
}
