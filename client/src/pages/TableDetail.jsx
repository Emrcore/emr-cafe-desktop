import { useParams, useNavigate } from "react-router-dom";
import BackButton from "../components/BackButton";
import { useEffect, useState } from "react";
import axios from "../api/axios";
import toast from "react-hot-toast";

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
      navigate("/");
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

    axios
      .post(`/tables/${id}/order`, productToSend)
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
        const posRes = await axios.post("/pos/pay", {
          amount: totalAmount,
          method: "sale",
        });
        if (posRes.data?.error) throw new Error(`POS hatası: ${posRes.data.error}`);
      }

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

      toast.success("Ödeme alındı ve satış kaydedildi");
      navigate("/");
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
      navigate("/");
    } catch (err) {
      toast.error("Taşıma işlemi başarısız");
      console.error(err);
    }
  };

  if (!table) return <p className="p-4 text-center dark:text-white">Yükleniyor...</p>;

  return (
    <div className="p-4 bg-gray-100 min-h-screen dark:bg-gray-900">
      <BackButton />
      <h2 className="text-2xl font-bold mb-4 dark:text-white">{table.name}</h2>
      <h3 className="font-bold mb-2 dark:text-white">Siparişler</h3>

      {table.orders.map((order) => (
        <div
          key={order.id}
          className="flex justify-between mb-2 border-b pb-1 text-white bg-gray-700 px-2 py-1 rounded"
        >
          <div>{order.name} x{order.qty}</div>
          <button
            onClick={() => removeProduct(order)}
            className="text-sm text-red-300 hover:text-red-500"
          >
            Sil
          </button>
        </div>
      ))}

      {table.orders.length > 0 && (
        <div className="mt-6 flex flex-col gap-3">
          <div className="flex gap-4 flex-wrap">
            <button
              onClick={() => handlePayment("nakit")}
              className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
            >
              Nakit Öde
            </button>
            <button
              onClick={() => handlePayment("kart")}
              className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
            >
              Kartla Öde
            </button>
            <button
              onClick={() => setShowTransfer(true)}
              className="bg-yellow-600 text-white py-2 px-4 rounded hover:bg-yellow-700"
            >
              Masa Taşı
            </button>
          </div>

          {showTransfer && (
            <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded shadow">
              <h4 className="font-bold mb-2 dark:text-white">Masa Seçin</h4>
              <select
                value={targetTableId}
                onChange={(e) => setTargetTableId(e.target.value)}
                className="p-2 rounded border w-full dark:bg-gray-900 dark:text-white"
              >
                <option value="">Hedef Masa Seçin</option>
                {allTables
                  .filter((t) => t._id !== id)
                  .map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.name}
                    </option>
                  ))}
              </select>
              <div className="mt-3 flex gap-3">
                <button
                  onClick={handleTableTransfer}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  Taşı
                </button>
                <button
                  onClick={() => setShowTransfer(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                >
                  İptal
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <h3 className="font-bold mt-6 mb-2 dark:text-white">Ürünler</h3>

      {Object.entries(
        products.reduce((groups, product) => {
          const category = product.category || "Diğer";
          if (!groups[category]) groups[category] = [];
          groups[category].push(product);
          return groups;
        }, {})
      ).map(([categoryName, items]) => (
        <div key={categoryName} className="mb-6">
          <h4 className="text-lg font-semibold mb-2 dark:text-white">{categoryName}</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {items.map((p) => (
              <button
                key={p._id}
                onClick={() => addProduct(p)}
                className="bg-white dark:bg-slate-800 rounded-lg shadow hover:shadow-lg transition p-2 flex flex-col items-center text-center"
              >
                <img
                  src={p.image || "/default.png"}
                  alt={p.name}
                  className="w-24 h-24 object-cover rounded mb-2"
                />
                <div className="font-semibold text-sm text-gray-800 dark:text-white">{p.name}</div>
                <div className="text-xs text-gray-500 dark:text-gray-300">{p.price}₺</div>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
