// src/pages/AdminImages.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import BackButton from "../components/BackButton";
import toast from "react-hot-toast";

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
    <div className="p-4">
      <BackButton />
      <h2 className="text-2xl font-bold mb-6">Ürün Görselleri</h2>

      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
        {products.map((p) => (
          <div
            key={p._id}
            className="rounded shadow border p-4 flex flex-col items-center dark:bg-gray-800"
          >
            <img
              src={`${p.image || "/placeholder.jpg"}?v=${Date.now()}`}
              alt={p.name}
              className="w-full h-40 object-cover rounded mb-3"
            />
            <p className="font-bold text-center text-gray-800 dark:text-white">
              {p.name}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-300 italic mb-2">
              {p.category}
            </p>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleUpload(e, p._id)}
              className="text-sm"
            />
          </div>
        ))}
      </div>
    </div>
  );
}