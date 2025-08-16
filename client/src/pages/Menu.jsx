// pages/menu.jsx
import { useEffect, useMemo, useState, useContext } from "react";
import axios from "axios";
import { Dialog } from "@headlessui/react";
import { AuthContext } from "../context/AuthContext";
import toast from "react-hot-toast";

// Yardımcı: Doğru image URL üret
const getImageUrl = (imagePath) => {
  const base = import.meta.env.VITE_SERVER_URL || "";
  if (!imagePath) return `${base}/placeholder.jpg`;
  return imagePath.startsWith("http") ? imagePath : `${base}${imagePath}`;
};

// Bildirim sesi
const playNotifySound = () => {
  const audio = new Audio("/assets/notification.mp3"); // public/assets altında varsayıldı
  audio.play().catch((e) => console.error("Ses çalma hatası:", e));
};

export default function Menu() {
  const { user } = useContext(AuthContext);
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("Tümü");
  const [modalProduct, setModalProduct] = useState(null);
  const [tableNumber, setTableNumber] = useState("");
  const [settings, setSettings] = useState(null);

  // Tenant başlığı: /api/settings > menuTitle > subdomain > EMR Menü
  const tenantTitle = useMemo(() => {
    if (settings?.menuTitle) return settings.menuTitle;
    const host = typeof window !== "undefined" ? window.location.host : "";
    const sub = (host.split(".")[0] || "").trim();
    return sub ? `${sub.toUpperCase()} Menü` : "EMR Menü";
  }, [settings]);

  useEffect(() => {
    axios.get("/api/products")
      .then((res) => setProducts(Array.isArray(res.data) ? res.data : []))
      .catch(() => setProducts([]));

    axios.get("/api/settings")
      .then((res) => setSettings(res.data))
      .catch(() => {});
  }, []);

  const categories = useMemo(
    () => ["Tümü", ...new Set(products.map((p) => p.category || "Genel"))],
    [products]
  );

  const filtered = useMemo(
    () => (selectedCategory === "Tümü" ? products : products.filter((p) => (p.category || "Genel") === selectedCategory)),
    [products, selectedCategory]
  );

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
    <div className="relative min-h-screen p-4 overflow-hidden text-white">
      {/* ---- RGB / Aurora Arkaplan + Animasyonlar ---- */}
      <style>{`
        @keyframes gradientShift {
          0% { background-position: 0% 50% }
          50% { background-position: 100% 50% }
          100% { background-position: 0% 50% }
        }
        @keyframes floatGlow {
          0% { transform: translateY(0px) scale(1); opacity: .45 }
          50% { transform: translateY(-10px) scale(1.03); opacity: .85 }
          100% { transform: translateY(0px) scale(1); opacity: .45 }
        }
        .aurora {
          background: conic-gradient(from 90deg, #22d3ee, #a78bfa, #fb7185, #34d399, #22d3ee);
          filter: blur(60px);
          opacity: .35;
          animation: floatGlow 10s ease-in-out infinite;
        }
        .bg-animated {
          background: linear-gradient(120deg, #0ea5e9, #7c3aed, #f43f5e, #22c55e, #0ea5e9);
          background-size: 300% 300%;
          animation: gradientShift 18s ease infinite;
        }
        .neon-card::before {
          content: "";
          position: absolute;
          inset: -1px;
          border-radius: 16px;
          background: linear-gradient(90deg, #22d3ee, #a78bfa, #fb7185, #34d399, #22d3ee);
          filter: blur(10px);
          opacity: .55;
          z-index: -1;
        }
        .glass {
          background: rgba(15, 23, 42, 0.55);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,.12);
        }
      `}</style>

      <div className="absolute inset-0 bg-animated opacity-15 pointer-events-none" />
      <div className="pointer-events-none absolute -top-24 -left-24 w-[28rem] h-[28rem] rounded-full aurora" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 w-[30rem] h-[30rem] rounded-full aurora" />

      {/* ---- Başlık (Tenant özel) ---- */}
      <header className="relative z-10 max-w-6xl mx-auto flex flex-col items-center gap-3 pt-4 pb-6">
        {settings?.logoUrl && (
          <img
            src={getImageUrl(settings.logoUrl)}
            alt="logo"
            className="h-16 w-16 rounded-full object-cover ring-2 ring-white/30 shadow"
          />
        )}
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-center drop-shadow-[0_6px_18px_rgba(99,102,241,0.45)]">
          🍽️ <span className="bg-gradient-to-r from-cyan-300 via-fuchsia-300 to-violet-300 bg-clip-text text-transparent">
            {tenantTitle}
          </span>
        </h1>
        <div className="h-1 w-48 rounded-full bg-animated" />
      </header>

      {/* ---- Kategoriler (Sticky neon çipler) ---- */}
      <div className="sticky top-0 z-20 mb-6">
        <div className="glass rounded-xl px-3 py-3 backdrop-blur">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {categories.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold transition-all
                    ${active
                      ? "text-white bg-gradient-to-r from-sky-500 via-fuchsia-500 to-rose-500 shadow-lg"
                      : "text-slate-100/90 bg-white/10 hover:bg-white/20 border border-white/10"}`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ---- Ürünler (Neon kartlar) ---- */}
      <main className="relative z-10 max-w-6xl mx-auto">
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {filtered.map((p) => (
            <div
              key={p._id}
              onClick={() => setModalProduct(p)}
              className="relative cursor-pointer rounded-2xl overflow-hidden glass neon-card transition-transform duration-300 hover:-translate-y-1 hover:scale-[1.02]"
            >
              <div className="absolute -inset-x-6 -bottom-6 h-16 bg-animated blur-2xl opacity-30 pointer-events-none" />
              <div className="w-full h-36 overflow-hidden">
                <img
                  src={getImageUrl(p.image)}
                  alt={p.name}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                  loading="lazy"
                />
              </div>
              <div className="p-3">
                <h3 className="text-sm font-semibold truncate">{p.name}</h3>
                <p className="text-[11px] text-slate-200/80">{p.category || "Genel"}</p>
                <p className="text-base font-bold text-sky-300 mt-1">
                  {Number(p.price || 0).toFixed(2)} ₺
                </p>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="text-center text-slate-200/85 mt-10 italic">
            Bu kategoride ürün bulunamadı.
          </p>
        )}

        {/* ---- Garson Çağır (neon blok) ---- */}
        <section className="mt-14 max-w-md mx-auto relative">
          <div className="absolute -inset-0.5 rounded-2xl bg-animated blur opacity-40 pointer-events-none" />
          <div className="relative glass rounded-2xl p-5">
            <h3 className="text-xl font-bold mb-3 text-center">👋 Garson Çağır</h3>
            <input
              type="text"
              placeholder="Masa numarası (örn. Masa 5)"
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              className="w-full rounded px-3 py-2 mb-4 bg-slate-900/60 text-white placeholder:text-slate-400 border border-white/10 focus:outline-none focus:ring-2 focus:ring-sky-400/60"
            />
            <button
              onClick={callWaiter}
              className="w-full py-2 rounded-xl font-semibold text-white bg-gradient-to-r from-sky-500 via-fuchsia-500 to-rose-500 hover:opacity-90 transition-all"
            >
              Garson Çağır
            </button>
          </div>
        </section>
      </main>

      {/* ---- Ürün Detay Modal ---- */}
      <Dialog
        open={!!modalProduct}
        onClose={() => setModalProduct(null)}
        className="fixed z-50 inset-0 flex items-center justify-center bg-black/50 p-4"
      >
        <Dialog.Panel className="glass p-6 rounded-2xl max-w-sm w-full">
          {modalProduct && (
            <>
              <img
                src={getImageUrl(modalProduct.image)}
                alt={modalProduct.name}
                className="h-48 w-full object-cover rounded mb-4"
              />
              <h2 className="text-2xl font-bold mb-1 text-center">{modalProduct.name}</h2>
              <p className="text-sm text-slate-200/85 italic text-center">
                {modalProduct.category || "Genel"}
              </p>
              <p className="text-xl font-semibold text-sky-300 text-center mt-2">
                {Number(modalProduct.price || 0).toFixed(2)} ₺
              </p>
              <button
                onClick={() => setModalProduct(null)}
                className="mt-6 w-full rounded-xl px-4 py-2 text-white bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 transition"
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
