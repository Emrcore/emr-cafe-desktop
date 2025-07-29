import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { Dialog } from "@headlessui/react";
import { AuthContext } from "../context/AuthContext";

// Yardımcı: Doğru image URL üret
const getImageUrl = (imagePath) => {
  const base = import.meta.env.VITE_SERVER_URL || "";
  return imagePath?.startsWith("http") ? imagePath : `${base}${imagePath}`;
};

export default function Menu() {
  const { user } = useContext(AuthContext);
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("Tümü");
  const [modalProduct, setModalProduct] = useState(null);

  useEffect(() => {
    axios.get("/api/products").then((res) => setProducts(res.data));
  }, []);

  const categories = ["Tümü", ...new Set(products.map((p) => p.category || "Genel"))];
  const filtered =
    selectedCategory === "Tümü"
      ? products
      : products.filter((p) => p.category === selectedCategory);

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-white to-blue-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <h2 className="text-3xl font-bold mb-6 text-center text-blue-800 dark:text-white tracking-tight">
        🍽️ EMR Menü
      </h2>

      {/* Kategori butonları */}
      <div className="flex flex-wrap justify-center gap-2 mb-6">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-1 rounded-full text-sm font-medium border transition ${
              selectedCategory === cat
                ? "bg-blue-600 text-white"
                : "bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-white"
            } hover:scale-105`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Ürün listesi */}
      <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3">
        {filtered.map((p) => (
          <div
            key={p._id}
            onClick={() => setModalProduct(p)}
            className="cursor-pointer rounded-xl shadow-md hover:shadow-xl transition bg-white dark:bg-gray-900 overflow-hidden border dark:border-gray-700"
          >
            <img
              src={getImageUrl(p.image || "/placeholder.jpg")}
              alt={p.name}
              className="h-40 w-full object-cover"
            />
            <div className="p-4">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-1">
                {p.name}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-300 mb-1 italic">
                {p.category}
              </p>
              <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                {p.price.toFixed(2)} ₺
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Boş kategori uyarısı */}
      {filtered.length === 0 && (
        <p className="text-center text-gray-500 mt-10 dark:text-gray-300">
          Bu kategoride ürün bulunamadı.
        </p>
      )}

      {/* Modal */}
      <Dialog
        open={!!modalProduct}
        onClose={() => setModalProduct(null)}
        className="fixed z-50 inset-0 flex items-center justify-center bg-black/50"
      >
        <Dialog.Panel className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-sm mx-auto">
          {modalProduct && (
            <>
              <img
                src={getImageUrl(modalProduct.image || "/placeholder.jpg")}
                alt={modalProduct.name}
                className="h-40 w-full object-cover rounded mb-4"
              />
              <h2 className="text-xl font-bold mb-2 text-gray-800 dark:text-white">
                {modalProduct.name}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-300 italic mb-2">
                {modalProduct.category}
              </p>
              <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                {modalProduct.price.toFixed(2)} ₺
              </p>

              <button
                onClick={() => setModalProduct(null)}
                className="mt-6 px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 w-full"
              >
                Kapat
              </button>
            </>
          )}
        </Dialog.Panel>
      </Dialog>
    </div>
  );
}
