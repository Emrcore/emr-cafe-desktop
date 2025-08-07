import { useEffect, useState } from "react";
import axios from "axios";
import BackButton from "../components/BackButton";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

export default function AdminImages() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    axios.get("/api/products").then((res) => setProducts(res.data));
  }, []);

  const handleUpload = async (e, id) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);
    try {
      const res = await axios.post(`/api/products/${id}/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setProducts((prev) =>
        prev.map((p) =>
          p._id === id ? { ...p, image: res.data.url } : p
        )
      );
      toast.success("Resim yüklendi");
    } catch (err) {
      toast.error("Resim yüklenemedi");
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen p-4 bg-gradient-to-br from-slate-800 to-slate-900 text-white">
      <div className="mb-6">
        <BackButton />
        <motion.h2
          className="text-3xl font-bold mt-4"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Ürün Görselleri
        </motion.h2>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
        {products.map((p) => (
          <motion.div
            key={p._id}
            whileHover={{ scale: 1.03 }}
            className="rounded-xl p-4 shadow-lg border border-slate-700 bg-slate-800/80 backdrop-blur-sm"
          >
            <div className="relative overflow-hidden rounded-lg mb-3">
              <img
                src={`${p.image || "/placeholder.jpg"}?v=${Date.now()}`}
                alt={p.name}
                className="w-full h-40 object-cover rounded transition-transform duration-300 hover:scale-105"
              />
            </div>

            <h3 className="text-lg font-semibold truncate">{p.name}</h3>
            <span className="text-xs inline-block px-2 py-1 bg-slate-700 rounded-full mb-3">
              {p.category}
            </span>

            <label className="block">
              <span className="text-sm text-slate-300">Resim Yükle:</span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleUpload(e, p._id)}
                className="mt-1 text-sm file:px-3 file:py-1 file:rounded file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700"
              />
            </label>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
