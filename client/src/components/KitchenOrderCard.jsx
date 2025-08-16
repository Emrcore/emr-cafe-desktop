// components/KitchenOrderCard.jsx
import axios from "../api/axios";
import { toast } from "react-hot-toast";
import { useState } from "react";
import socket from "../socket"; // 🔌 socket bağlantısı

export default function KitchenOrderCard({ order = {} }) {
  const [loading, setLoading] = useState(false);

  const tableName =
    typeof order.table === "object"
      ? order.table?.name || "Masa"
      : `Masa (${order.table || "?"})`;

  const items = Array.isArray(order.items) ? order.items : [];
  const completed = order.status === "completed";

  const handleComplete = async () => {
    if (completed) return;
    try {
      setLoading(true);
      await axios.put(`/orders/${order._id}/complete`);
      toast.success("Sipariş tamamlandı");

      // Sunucu zaten publish ediyorsa buna gerek olmayabilir; istersen bırak.
      socket.emit("order-completed", order._id);
    } catch (err) {
      console.error("❌ Sipariş tamamlama hatası:", err?.response?.data || err.message);
      toast.error("Sipariş tamamlanamadı");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow flex flex-col gap-2">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-bold text-slate-800 dark:text-white">{tableName}</h2>
        <button
          onClick={handleComplete}
          disabled={loading || completed}
          className="bg-green-600 hover:bg-green-700 text-white text-sm px-3 py-1 rounded transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {completed ? "Tamamlandı" : loading ? "..." : "Tamamla"}
        </button>
      </div>

      {items.length === 0 ? (
        <div className="text-sm text-slate-500 dark:text-slate-400 italic">
          Kalem yok.
        </div>
      ) : (
        <ul className="text-sm list-disc list-inside text-gray-700 dark:text-gray-200 pl-1 space-y-1">
          {items.map((item, index) => {
            const qty = item.quantity ?? item.qty ?? 1;
            const notes = (item.notes || "").trim();
            return (
              <li key={`${item.name}-${index}`}>
                {qty}× {item.name}
                {notes && (
                  <span className="ml-2 text-xs italic opacity-90">📝 {notes}</span>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
