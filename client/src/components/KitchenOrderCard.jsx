import axios from "../api/axios";
import { toast } from "react-hot-toast";
import { useState } from "react";

export default function KitchenOrderCard({ order }) {
  const [loading, setLoading] = useState(false);

  const handleComplete = async () => {
    try {
      setLoading(true);
      await axios.put(`/orders/${order._id}/complete`);
      toast.success("Sipariş tamamlandı");
    } catch (err) {
      console.error("❌ Sipariş tamamlama hatası:", err?.response?.data || err.message);
      toast.error("Sipariş tamamlanamadı");
    } finally {
      setLoading(false);
    }
  };

  const tableName =
    typeof order.table === "object"
      ? order.table?.name || "Masa"
      : `Masa (${order.table})`;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold">{tableName}</h2>
        <button
          onClick={handleComplete}
          className="bg-green-600 hover:bg-green-700 text-white text-sm px-3 py-1 rounded disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "..." : "Tamamla"}
        </button>
      </div>

      <ul className="text-sm list-disc list-inside text-gray-700 dark:text-gray-200">
        {order.items.map((item, index) => (
          <li key={index}>
            {(item.quantity ?? item.qty ?? 1)}x {item.name}
          </li>
        ))}
      </ul>
    </div>
  );
}
