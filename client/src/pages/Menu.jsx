import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { Dialog } from "@headlessui/react";
import { AuthContext } from "../context/AuthContext";
import toast from "react-hot-toast";

// Yardımcı: Doğru image URL üret
const getImageUrl = (imagePath) => {
  const base = import.meta.env.VITE_SERVER_URL || "";
  return imagePath?.startsWith("http") ? imagePath : `${base}${imagePath}`;
};

const playNotifySound = () => {
  const audio = new Audio("../assets/notification.mp3");
  audio.play().catch((e) => console.error("Ses çalma hatası:", e));
};

export default function Menu() {
  const { user } = useContext(AuthContext);
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("Tümü");
  const [modalProduct, setModalProduct] = useState(null);
  const [tableNumber, setTableNumber] = useState("");

  useEffect(() => {
    axios.get("/api/products").then((res) => setProducts(res.data));
  }, []);

  const categories = ["Tümü", ...new Set(products.map((p) => p.category || "Genel"))];
  const filtered =
    selectedCategory === "Tümü"
      ? products
      : products.filter((p) => p.category === selectedCategory);

  const callWaiter = async () => {
    if (!tableNumber.trim()) return toast.error("Lütfen masa numarasını girin");
    try {
      await axios.post("/api/calls", { tableName: tableNumber.trim() });
      toast.success("Garson çağrıldı!");
      playNotifySound();
      setTableNumber("");
    } catch (err) {
      console.error(err);
      toast.error("Garson çağrısı başarısız");
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-white to-blue-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <h2 className="text-4xl font-black mb-6 text-center text-blue-800 dark:text-white tracking-tight drop-shadow-xl">
        🍽️ EMR Menü
      </h2>

      {/* Kategoriler - yatay scroll + sticky */}
      <div className="sticky top-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur pb-3 mb-6 overflow-x-auto whitespace-nowrap scrollbar-hide">
        <div className="flex gap-3 px-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 shadow-sm hover:scale-105 ${
                selectedCategory === cat
                  ? "bg-gradient-to-r from-blue-600 to-blue-400 text-white shadow-md"
                  : "bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-100"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Ürünler */}
      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {filtered.map((p) => (
          <div
            key={p._id}
            onClick={() => setModalProduct(p)}
            className="cursor-pointer rounded-xl shadow-lg hover:shadow-2xl transition transform hover:scale-105 bg-white dark:bg-slate-900 overflow-hidden border dark:border-gray-700 group"
          >
            <div className="relative w-full h-48 overflow-hidden">
              <img
                src={getImageUrl(p.image || "/placeholder.jpg")}
                alt={p.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
            </div>
            <div className="p-4">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white truncate">{p.name}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 italic">{p.category}</p>
              <p className="text-lg font-bold text-blue-600 dark:text-blue-400 mt-1">
                {p.price.toFixed(2)} ₺
              </p>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-gray-500 mt-10 dark:text-gray-300 italic">
          Bu kategoride ürün bulunamadı.
        </p>
      )}

      {/* Garson Çağırma */}
      <div className="mt-14 max-w-md mx-auto bg-white dark:bg-gray-900 p-5 rounded-xl shadow-xl border dark:border-gray-700 relative">
        <h3 className="text-xl font-bold mb-3 text-center text-gray-800 dark:text-white">
          👋 Garson Çağır
        </h3>
        <input
          type="text"
          placeholder="Masa numarası (örn. Masa 5)"
          value={tableNumber}
          onChange={(e) => setTableNumber(e.target.value)}
          className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 mb-4 bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
        />
        <button
          onClick={callWaiter}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:to-blue-700 text-white font-semibold py-2 rounded transition-all duration-300 shadow-md"
        >
          Garson Çağır
        </button>
      </div>

      {/* Ürün Detay Modal */}
      <Dialog
        open={!!modalProduct}
        onClose={() => setModalProduct(null)}
        className="fixed z-50 inset-0 flex items-center justify-center bg-black/40 p-4"
      >
        <Dialog.Panel className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-sm w-full shadow-xl animate-fadeIn">
          {modalProduct && (
            <>
              <img
                src={getImageUrl(modalProduct.image || "/placeholder.jpg")}
                alt={modalProduct.name}
                className="h-48 w-full object-cover rounded mb-4"
              />
              <h2 className="text-2xl font-bold mb-2 text-gray-800 dark:text-white text-center">
                {modalProduct.name}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-300 italic text-center">
                {modalProduct.category}
              </p>
              <p className="text-xl font-semibold text-blue-600 dark:text-blue-400 text-center mt-2">
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
