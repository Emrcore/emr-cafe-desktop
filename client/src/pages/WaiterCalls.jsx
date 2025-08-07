import { useEffect, useState, useContext } from "react";
import axios from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import toast from "react-hot-toast";
import socket from "../socket";
import BackButton from "../components/BackButton";

export default function WaiterCalls() {
  const [calls, setCalls] = useState([]);
  const { user } = useContext(AuthContext);

  // 🔊 Ses dosyasını yükle
  const sound = new Audio("../assets/notification.mp3");

  useEffect(() => {
    if (user?.role !== "garson") return;

    fetchCalls();

    // 🔔 Yeni çağrı geldiğinde
    socket.on("new-call", (call) => {
      setCalls((prev) => [call, ...prev]);
      toast.success(`🔔 Yeni çağrı: ${call.tableName}`);
      sound.play().catch((e) => console.warn("🔇 Ses çalınamadı:", e));
    });

    return () => {
      socket.off("new-call");
    };
  }, [user]);

  const fetchCalls = async () => {
    try {
      const res = await axios.get("/calls");
      setCalls(res.data);
    } catch (err) {
      toast.error("Çağrılar alınamadı");
    }
  };

  const completeCall = async (id) => {
    try {
      await axios.put(`/calls/${id}/done`);
      setCalls((prev) => prev.filter((c) => c._id !== id));
      toast.success("✅ Çağrı kapatıldı");
    } catch (err) {
      toast.error("Çağrı kapatılamadı");
    }
  };

  if (user?.role !== "garson") {
    return <div className="p-4 text-red-500">🚫 Bu sayfa sadece garsonlar içindir.</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-slate-800 dark:to-slate-900 p-4">
      <BackButton />
      <h1 className="text-3xl font-bold mb-6 text-yellow-700 dark:text-yellow-300">🔔 Garson Çağrıları</h1>

      {calls.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-300 text-sm">Aktif çağrı yok.</p>
      ) : (
        <ul className="space-y-4">
          {calls.map((call) => (
            <li
              key={call._id}
              className="flex justify-between items-center bg-white dark:bg-yellow-200 border-l-4 border-yellow-500 px-4 py-3 rounded-lg shadow hover:shadow-lg transition"
            >
              <div>
                <div className="text-lg font-semibold text-slate-800">{call.tableName}</div>
                <div className="text-xs text-gray-600">
                  {new Date(call.createdAt).toLocaleTimeString("tr-TR")}
                </div>
              </div>
              <button
                onClick={() => completeCall(call._id)}
                className="bg-green-600 hover:bg-green-700 text-white text-sm px-3 py-1 rounded transition"
              >
                Tamamlandı
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
