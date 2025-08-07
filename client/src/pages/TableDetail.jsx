import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../api/axios";
import toast from "react-hot-toast";
import BackButton from "../components/BackButton";



// tüm import'lar aynı kalabilir

export default function TableDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [table, setTable] = useState(null);
  const [products, setProducts] = useState([]);
  const [allTables, setAllTables] = useState([]);
  const [showTransfer, setShowTransfer] = useState(false);
  const [targetTableId, setTargetTableId] = useState("");

  useEffect(() => {
    if (!id || id === "undefined") {
      toast.error("Geçersiz masa!");
      navigate("/tables");
    }
  }, [id, navigate]);

  useEffect(() => {
    axios.get(`/tables/${id}`).then((res) => setTable(res.data));
    axios.get("/products").then((res) => setProducts(res.data));
    axios.get("/tables").then((res) => setAllTables(res.data));
  }, [id]);

  const addProduct = (product) => {
    const productToSend = {
      id: product._id,
      name: product.name,
      price: product.price,
    };

    axios.post(`/tables/${id}/order`, productToSend)
      .then((res) => {
        setTable(res.data);
        toast.success(`${product.name} eklendi`);
      })
      .catch((err) => {
        console.error("🚨 Ürün ekleme hatası:", err.response?.data || err.message);
        toast.error("Ürün eklenemedi");
      });
  };

  const removeProduct = (product) => {
    axios.post(`/tables/${id}/remove`, { id: product.id }).then((res) => {
      setTable(res.data);
      toast("Ürün silindi", { icon: "🗑️" });
    });
  };

  const handlePayment = async (method) => {
    try {
      const totalAmount = table.orders.reduce((sum, o) => sum + o.price * o.qty, 0);
      if (method === "kart") {
        const posRes = await axios.post("/pos/pay", { amount: totalAmount, method: "sale" });
        if (posRes.data?.error) throw new Error(`POS hatası: ${posRes.data.error}`);
      }

      await axios.post(`/tables/${id}/pay`, { paymentMethod: method });
      await axios.post("/sales", {
        tableId: table.name,
        orders: table.orders.map((o) => ({ name: o.name, qty: o.qty, price: o.price })),
        total: totalAmount,
        paymentMethod: method,
      });

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

  if (!table) return <p className="p-4 text-center text-white">Yükleniyor...</p>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 to-slate-900 text-white p-4">
      <BackButton />
      <h2 className="text-3xl font-bold mb-6">{table.name}</h2>

      <h3 className="font-semibold mb-2">🧾 Aktif Siparişler</h3>
      {table.orders.length === 0 && <p className="mb-4 text-sm text-slate-300">Henüz sipariş girilmedi.</p>}

      {table.orders.map((order) => (
        <div key={order.id} className="flex justify-between items-center mb-2 bg-slate-700 px-4 py-2 rounded shadow">
          <span>{order.name} x{order.qty}</span>
          <button onClick={() => removeProduct(order)} className="text-red-300 hover:text-red-500 text-sm">
            Kaldır
          </button>
        </div>
      ))}

      {table.orders.length > 0 && (
        <div className="mt-6 space-y-4">
          <div className="flex flex-wrap gap-4">
            <button onClick={() => handlePayment("nakit")} className="bg-green-600 px-4 py-2 rounded hover:bg-green-700">
              💵 Nakit Öde
            </button>
            <button onClick={() => handlePayment("kart")} className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700">
              💳 Kartla Öde
            </button>
            <button onClick={() => setShowTransfer(true)} className="bg-yellow-600 px-4 py-2 rounded hover:bg-yellow-700">
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
                {allTables.filter((t) => t._id !== id).map((t) => (
                  <option key={t._id} value={t._id}>{t.name}</option>
                ))}
              </select>
              <div className="mt-3 flex gap-3">
                <button onClick={handleTableTransfer} className="bg-green-600 px-4 py-2 rounded hover:bg-green-700">
                  ✅ Taşı
                </button>
                <button onClick={() => setShowTransfer(false)} className="bg-slate-500 px-4 py-2 rounded hover:bg-slate-600">
                  ❌ İptal
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <h3 className="mt-10 mb-4 font-semibold text-xl">📦 Ürün Ekle</h3>
      {Object.entries(
        products.reduce((groups, product) => {
          const category = product.category || "Diğer";
          if (!groups[category]) groups[category] = [];
          groups[category].push(product);
          return groups;
        }, {})
      ).map(([categoryName, items]) => (
        <div key={categoryName} className="mb-6">
          <h4 className="text-lg font-bold mb-2">{categoryName}</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {items.map((p) => (
              <button
                key={p._id}
                onClick={() => addProduct(p)}
                className="bg-slate-800 hover:bg-slate-700 rounded-lg shadow p-3 flex flex-col items-center text-center transition"
              >
                <img src={p.image || "/default.png"} alt={p.name} className="w-20 h-20 object-cover rounded mb-2" />
                <div className="font-medium text-white">{p.name}</div>
                <div className="text-sm text-slate-400">{p.price} ₺</div>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
