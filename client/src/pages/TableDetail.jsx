// pages/TableDetail.jsx
import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../api/axios";
import toast from "react-hot-toast";
import BackButton from "../components/BackButton";

export default function TableDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [table, setTable] = useState(null);
  const [products, setProducts] = useState([]);
  const [allTables, setAllTables] = useState([]);

  // transfer
  const [showTransfer, setShowTransfer] = useState(false);
  const [targetTableId, setTargetTableId] = useState("");

  // add modal (adet + not)
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [addQty, setAddQty] = useState(1);
  const [addNote, setAddNote] = useState("");

  // arama & kategori
  const [query, setQuery] = useState("");
  const [selectedCat, setSelectedCat] = useState("Tümü");

  useEffect(() => {
    if (!id || id === "undefined") {
      toast.error("Geçersiz masa!");
      navigate("/tables");
    }
  }, [id, navigate]);

  useEffect(() => {
    const load = async () => {
      try {
        const [t, p, a] = await Promise.all([
          axios.get(`/tables/${id}`),
          axios.get("/products"),
          axios.get("/tables"),
        ]);
        setTable(t.data);
        setProducts(p.data || []);
        setAllTables(a.data || []);
      } catch (e) {
        console.error(e);
        toast.error("Veriler yüklenemedi");
      }
    };
    load();
  }, [id]);

  // Ürün ekleme modalını aç
  const openAddModal = (product) => {
    setSelectedProduct(product);
    setAddQty(1);
    setAddNote("");
    setShowAddModal(true);
  };

  // Ürünü (adet+not ile) ekle
  const confirmAddProduct = async () => {
    if (!selectedProduct) return;
    try {
      const payload = {
        id: selectedProduct._id,
        name: selectedProduct.name,
        price: selectedProduct.price,
        qty: Number(addQty) || 1,
        notes: addNote?.trim() || "",
      };
      const res = await axios.post(`/tables/${id}/order`, payload);
      setTable(res.data);
      toast.success(`${selectedProduct.name} eklendi`);
      setShowAddModal(false);
      setSelectedProduct(null);
    } catch (err) {
      console.error("🚨 Ürün ekleme hatası:", err.response?.data || err.message);
      toast.error("Ürün eklenemedi");
    }
  };

  const removeProduct = async (product) => {
    try {
      const res = await axios.post(`/tables/${id}/remove`, { id: product.id });
      setTable(res.data);
      toast("Ürün silindi", { icon: "🗑️" });
    } catch (e) {
      toast.error("Silme başarısız");
    }
  };

  /** -------------------------------
   *  Yardımcılar: Fiş & Kasa
   *  -------------------------------- */
  const hasElectron = typeof window !== "undefined" && !!window.electronAPI;

  const tryPrintReceipt = async (paymentMethod, totalAmount) => {
    if (!hasElectron || typeof window.electronAPI.printReceipt !== "function") {
      toast.error("⚠️ Fiş cihazı tespit edilemedi");
      return;
    }
    try {
      // Basit fiş verisi (backend/electron printer modülü ile uyumlu olacak)
      const receipt = {
        table: table?.name,
        date: new Date().toISOString(),
        paymentMethod,
        items: (table?.orders || []).map((o) => ({
          name: o.name,
          qty: o.qty,
          price: o.price,
          total: Number(o.price) * Number(o.qty),
          notes: o.notes || "",
        })),
        subtotal: (table?.orders || []).reduce((s, o) => s + o.price * o.qty, 0),
        total: totalAmount,
      };

      await window.electronAPI.printReceipt(receipt);
      toast.success("🖨️ Fiş yazdırıldı");
    } catch (err) {
      console.error("Print error:", err);
      toast.error("⚠️ Fiş cihazı tespit edilemedi");
    }
  };

  const tryOpenCashDrawer = async () => {
    // Backend’de birazdan 'open-cash-drawer' IPC’sini ekleyeceğiz.
    if (!hasElectron || typeof window.electronAPI.openCashDrawer !== "function") {
      toast.error("⚠️ Kasa cihazı tespit edilemedi");
      return;
    }
    try {
      await window.electronAPI.openCashDrawer(); // args yok
      toast.success("🗄️ Kasa açıldı");
    } catch (err) {
      console.error("Drawer error:", err);
      toast.error("⚠️ Kasa cihazı tespit edilemedi");
    }
  };

  const handlePayment = async (method) => {
    try {
      const totalAmount = (table.orders || []).reduce(
        (sum, o) => sum + o.price * o.qty,
        0
      );

      // Kart ise POS satış
      if (method === "kart") {
        const posRes = await axios.post("/pos/pay", {
          amount: totalAmount,
          method: "sale",
        });
        if (posRes.data?.error)
          throw new Error(`POS hatası: ${posRes.data.error}`);
      }

      // Masayı kapat ve satış yaz
      await axios.post(`/tables/${id}/pay`, { paymentMethod: method });
      await axios.post("/sales", {
        tableId: table.name,
        orders: table.orders.map((o) => ({
          name: o.name,
          qty: o.qty,
          price: o.price,
        })),
        total: totalAmount,
        paymentMethod: method,
      });

      // Ödeme başarılı → fiş ve kasa işlemlerini dene (bağımsız uyarılar)
      await tryPrintReceipt(method, totalAmount);
      await tryOpenCashDrawer();

      toast.success("Ödeme alındı ve satış kaydedildi");
      navigate("/tables");
    } catch (err) {
      console.error("❌ Ödeme hatası:", err.response?.data || err.message);
      toast.error("Ödeme işlemi başarısız");
    }
  };

  const handleTableTransfer = async () => {
    if (!targetTableId) return toast.error("Hedef masa seçilmedi");
    try {
      await axios.post("/tables/transfer", {
        fromTableId: id,
        toTableId: targetTableId,
      });
      toast.success("Masa başarıyla taşındı");
      navigate("/tables");
    } catch (err) {
      toast.error("Taşıma işlemi başarısız");
      console.error(err);
    }
  };

  // Kategoriler ve gruplama
  const categories = useMemo(() => {
    const counts = {};
    for (const p of products) {
      const cat = p.category || "Diğer";
      counts[cat] = (counts[cat] || 0) + 1;
    }
    // "Tümü" başa
    return ["Tümü", ...Object.keys(counts).sort((a, b) => a.localeCompare(b, "tr"))]
      .map((name) => ({
        name,
        count: name === "Tümü" ? products.length : products.filter(p => (p.category || "Diğer") === name).length
      }));
  }, [products]);

  const productsByCategory = useMemo(() => {
    // arama filtresi
    const q = query.trim().toLowerCase();
    const pool = q
      ? products.filter((p) => p.name?.toLowerCase().includes(q))
      : products;

    // kategori filtresi
    const filtered = selectedCat === "Tümü"
      ? pool
      : pool.filter((p) => (p.category || "Diğer") === selectedCat);

    // gruplama
    const groups = {};
    for (const p of filtered) {
      const cat = p.category || "Diğer";
      (groups[cat] ||= []).push(p);
    }
    // her kategoride isim sıralı
    Object.values(groups).forEach(arr => arr.sort((a,b)=>a.name.localeCompare(b.name,"tr")));
    return groups;
  }, [products, query, selectedCat]);

  const orderTotal = useMemo(() => {
    if (!table?.orders?.length) return 0;
    return table.orders.reduce((sum, o) => sum + o.price * o.qty, 0);
  }, [table]);

  if (!table)
    return <p className="p-4 text-center text-white">Yükleniyor...</p>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 to-slate-900 text-white p-4">
      <BackButton />
      <h2 className="text-3xl font-bold mb-6">{table.name}</h2>

      {/* Arama + Kategori çipleri */}
      <div className="mb-6 space-y-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ürün ara (örn: latte, ayran...)"
          className="w-full p-3 rounded-lg bg-slate-800 border border-slate-700 focus:outline-none focus:border-sky-500"
        />
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {categories.map((c) => {
            const active = selectedCat === c.name;
            return (
              <button
                key={c.name}
                onClick={() => setSelectedCat(c.name)}
                className={[
                  "whitespace-nowrap px-3 py-1.5 rounded-full text-sm border transition",
                  active
                    ? "bg-sky-600 border-sky-500"
                    : "bg-slate-800 border-slate-700 hover:bg-slate-700"
                ].join(" ")}
                title={`${c.name} (${c.count})`}
              >
                {c.name} <span className="opacity-75">({c.count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Aktif Siparişler */}
      <h3 className="font-semibold mb-2">🧾 Aktif Siparişler</h3>
      {(!table.orders || table.orders.length === 0) && (
        <p className="mb-4 text-sm text-slate-300">Henüz sipariş girilmedi.</p>
      )}

      {table.orders?.map((order, idx) => {
        const lineTotal = (order.price || 0) * (order.qty || 0);
        return (
          <div
            key={`${order.id}-${idx}`}
            className="flex justify-between items-center mb-2 bg-slate-700 px-4 py-2 rounded shadow"
          >
            <div>
              <div className="font-medium">
                {order.name}{" "}
                <span className="text-slate-300">
                  ({order.price?.toFixed ? order.price.toFixed(2) : order.price} ₺)
                </span>{" "}
                x{order.qty}
              </div>
              {order.notes ? (
                <div className="text-xs mt-1 italic opacity-90">📝 {order.notes}</div>
              ) : null}
            </div>

            <div className="flex items-center gap-4">
              <div className="font-semibold">{lineTotal.toFixed(2)} ₺</div>
              <button
                onClick={() => removeProduct(order)}
                className="text-red-300 hover:text-red-500 text-sm"
              >
                Kaldır
              </button>
            </div>
          </div>
        );
      })}

      {/* Toplam tutar */}
      {table.orders?.length > 0 && (
        <div className="mt-3 flex items-center justify-between bg-slate-800 border border-slate-700 rounded-lg px-4 py-3">
          <div className="text-slate-300">Toplam</div>
          <div className="text-xl font-bold">{orderTotal.toFixed(2)} ₺</div>
        </div>
      )}

      {table.orders?.length > 0 && (
        <div className="mt-6 space-y-4">
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => handlePayment("nakit")}
              className="bg-green-600 px-4 py-2 rounded hover:bg-green-700"
            >
              💵 Nakit Öde
            </button>
            <button
              onClick={() => handlePayment("kart")}
              className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700"
            >
              💳 Kartla Öde
            </button>
            <button
              onClick={() => setShowTransfer(true)}
              className="bg-yellow-600 px-4 py-2 rounded hover:bg-yellow-700"
            >
              🔁 Masa Taşı
            </button>
          </div>

          {showTransfer && (
            <div className="mt-4 p-4 bg-slate-800 rounded shadow border border-slate-600">
              <h4 className="font-semibold mb-2">Taşınacak Masayı Seçin</h4>
              <select
                value={targetTableId}
                onChange={(e) => setTargetTableId(e.target.value)}
                className="p-2 rounded bg-slate-700 border border-slate-600 w-full"
              >
                <option value="">Masa Seç</option>
                {allTables
                  .filter((t) => String(t._id) !== String(id))
                  .map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.name}
                    </option>
                  ))}
              </select>
              <div className="mt-3 flex gap-3">
                <button
                  onClick={handleTableTransfer}
                  className="bg-green-600 px-4 py-2 rounded hover:bg-green-700"
                >
                  ✅ Taşı
                </button>
                <button
                  onClick={() => setShowTransfer(false)}
                  className="bg-slate-500 px-4 py-2 rounded hover:bg-slate-600"
                >
                  ❌ İptal
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Ürünler */}
      <h3 className="mt-10 mb-4 font-semibold text-xl">📦 Ürün Ekle</h3>

      {Object.keys(productsByCategory).length === 0 && (
        <p className="text-sm text-slate-300">Eşleşen ürün bulunamadı.</p>
      )}

      {Object.entries(productsByCategory).map(([categoryName, items]) => (
        <div key={categoryName} className="mb-6">
          <h4 className="text-lg font-bold mb-2">{categoryName}</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {items.map((p) => (
              <button
                key={p._id}
                onClick={() => openAddModal(p)}
                className="bg-slate-800 hover:bg-slate-700 rounded-lg shadow p-3 flex flex-col items-center text-center transition"
              >
                <img
                  src={p.image || "/default.png"}
                  alt={p.name}
                  className="w-20 h-20 object-cover rounded mb-2"
                />
                <div className="font-medium text-white">{p.name}</div>
                <div className="text-sm text-slate-400">
                  {Number(p.price).toFixed(2)} ₺
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}

      {/* Add Product Modal */}
      {showAddModal && selectedProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="w-full max-w-md bg-slate-800 border border-slate-700 rounded-xl p-4">
            <h4 className="text-lg font-semibold mb-3">
              {selectedProduct.name} ekle
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-slate-300">Adet</label>
                <input
                  type="number"
                  min={1}
                  value={addQty}
                  onChange={(e) => setAddQty(e.target.value)}
                  className="mt-1 w-full p-2 rounded bg-slate-700 border border-slate-600"
                />
              </div>
              <div className="col-span-2">
                <label className="text-sm text-slate-300">Not (opsiyonel)</label>
                <input
                  value={addNote}
                  onChange={(e) => setAddNote(e.target.value)}
                  placeholder="Örn: az pişmiş, soğansız…"
                  className="mt-1 w-full p-2 rounded bg-slate-700 border border-slate-600"
                />
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setSelectedProduct(null);
                }}
                className="px-4 py-2 rounded bg-slate-600 hover:bg-slate-500"
              >
                İptal
              </button>
              <button
                onClick={confirmAddProduct}
                className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700"
              >
                Ekle
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
