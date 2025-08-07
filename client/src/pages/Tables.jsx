import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import io from "socket.io-client";
import axios from "../api/axios";
import { LogOut, XCircle, CheckCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";

const socket = io({ path: "/socket.io" });

export default function Tables() {
  const [tables, setTables] = useState([]);
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    axios.get("/tables").then((res) => {
      setTables(res.data);
    });

    socket.on("tables:update", (data) => setTables(data));

    return () => {
      socket.off("tables:update");
      socket.disconnect();
    };
  }, []);

  const handleLogout = () => {
    logout();
    localStorage.removeItem("tenant_url");
    navigate("/tenant");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 to-slate-900 text-white p-4">
      {/* ✅ Sabit Çıkış Butonu */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold tracking-wide">🍽️ Masalar</h2>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 transition-all px-4 py-2 rounded shadow"
        >
          <LogOut size={18} />
          Çıkış Yap
        </button>
      </div>

      {/* ✅ Masa Listesi */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
        {tables.map((table, i) => {
          const tableId = table._id || table.id;
          const isEmpty = table.status === "empty";

          return (
            <motion.div
              key={tableId || i}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                if (!tableId) {
                  alert("Bu masanın id'si yok! Lütfen yöneticinize bildiriniz.");
                  return;
                }
                navigate(`/table/${tableId}`);
              }}
              className={`p-4 rounded-xl cursor-pointer shadow-lg transition-all duration-200 ${
                isEmpty ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold truncate">{table.name}</h3>
                <span className="inline-flex items-center text-sm px-2 py-1 rounded-full bg-white/20">
                  {isEmpty ? (
                    <CheckCircle size={16} className="mr-1" />
                  ) : (
                    <XCircle size={16} className="mr-1" />
                  )}
                  {isEmpty ? "Boş" : "Dolu"}
                </span>
              </div>

              <p className="text-sm mb-2">{table.orders.length} sipariş</p>

              {table.orders.length > 0 && (
                <ul className="text-xs space-y-1">
                  {table.orders.map((order, i) => (
                    <li key={i} className="border-b border-white/10 pb-1">
                      {order.name} × {order.qty}
                    </li>
                  ))}
                </ul>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
