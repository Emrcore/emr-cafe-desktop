import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import axios from "../api/axios";
import KitchenOrderCard from "../components/KitchenOrderCard";
import useSound from "../hooks/useSound";
import soundFile from "../assets/notification.mp3";
import { useNavigate } from "react-router-dom";
import * as socketModule from "../socket";
const socket = socketModule.socket;

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
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">🍽️ Mutfak Siparişleri</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {orders.length === 0 ? (
          <p className="text-gray-500 col-span-full">Henüz sipariş yok.</p>
        ) : (
          orders.map((order) => (
            <KitchenOrderCard key={order._id} order={order} />
          ))
        )}
      </div>
    </div>
  );
}
