import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import axios from "../api/axios";
import KitchenOrderCard from "../components/KitchenOrderCard";
import useSound from "../hooks/useSound";
import soundFile from "../assets/notification.mp3";
import { useNavigate } from "react-router-dom";
import socket from "../socket"; // ✅ Doğru kullanım
import { motion } from "framer-motion";

export default function KitchenOrders() {
  const { user, loading } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const playSound = useSound(soundFile);
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!user || user.role !== "mutfak") {
      navigate("/tables");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get("/orders");
        setOrders(res.data);
      } catch (err) {
        console.error("🚫 Siparişler alınamadı:", err?.response?.data || err.message);
      }
    };

    fetchOrders();

    const handleNewOrder = (newOrder) => {
      setOrders((prev) => {
        const tableId = newOrder.table._id || newOrder.table;
        const existing = prev.find((o) => (o.table._id || o.table) === tableId);
        if (existing) {
          return prev.map((o) =>
            (o.table._id || o.table) === tableId
              ? { ...o, items: [...o.items, ...newOrder.items] }
              : o
          );
        } else {
          return [newOrder, ...prev];
        }
      });
      playSound();
    };

    const handleCompletedOrder = (orderId) => {
      setOrders((prev) => prev.filter((order) => order._id !== orderId));
    };

    socket.on("connect", () => {
      console.log("🔌 Socket bağlı:", socket.id);
    });

    socket.on("disconnect", () => {
      console.log("🔌 Socket bağlantısı kesildi");
    });

    socket.on("new-order", handleNewOrder);
    socket.on("order-completed", handleCompletedOrder);

    return () => {
      socket.off("new-order", handleNewOrder);
      socket.off("order-completed", handleCompletedOrder);
    };
  }, [playSound]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 to-slate-900 text-white p-4">
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold mb-6 text-center"
      >
        🍽️ Mutfak Siparişleri
      </motion.h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {orders.length === 0 ? (
          <div className="col-span-full text-center text-slate-400 text-sm italic">
            Şu anda aktif sipariş yok.
          </div>
        ) : (
          orders.map((order) => (
            <KitchenOrderCard key={order._id} order={order} />
          ))
        )}
      </div>
    </div>
  );
}
