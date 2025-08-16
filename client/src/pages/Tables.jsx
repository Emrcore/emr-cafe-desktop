// pages/Tables.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import io from "socket.io-client";
import axios from "../api/axios";
import { LogOut, XCircle, CheckCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";

const socket = io({ path: "/socket.io", transports: ["websocket"] });

// Gelen yanıtı güvenle diziye dönüştür
const toArray = (v) => {
  if (Array.isArray(v)) return v;
  if (!v) return [];
  if (Array.isArray(v.data)) return v.data;
  if (Array.isArray(v.items)) return v.items;
  if (Array.isArray(v.rows)) return v.rows;
  if (Array.isArray(v.list)) return v.list;
  if (Array.isArray(v.tables)) return v.tables;
  if (Array.isArray(v.result)) return v.result;
  return [];
};

export default function Tables() {
  const [tables, setTables] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCat, setActiveCat] = useState(null); // null = tümü
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    loadAll();

    // Socket payload'ını normalize et
    socket.on("tables:update", (payload) => {
      setTables(toArray(payload));
    });
    socket.on("table-category-created", loadAll);
    socket.on("table-category-updated", loadAll);
    socket.on("table-category-deleted", loadAll);

    return () => {
      socket.off("tables:update");
      socket.off("table-category-created");
      socket.off("table-category-updated");
      socket.off("table-category-deleted");
      socket.disconnect();
    };
  }, []);

  const loadAll = async () => {
    try {
      const [tRes, cRes] = await Promise.all([
        axios.get("/tables"), // backend'de mümkünse populate("categoryId")
        axios.get("/table-categories"),
      ]);
      setTables(toArray(tRes.data));
      setCategories(toArray(cRes.data));
    } catch (err) {
      console.error("loadAll hata:", err);
      setTables([]);
      setCategories([]);
    }
  };

  const handleLogout = () => {
    logout();
    localStorage.removeItem("tenant_url");
    navigate("/tenant");
  };

  const filteredTables = useMemo(() => {
    const list = Array.isArray(tables) ? tables : [];
    if (!activeCat) return list;
    return list.filter((t) => {
      const cid =
        typeof t?.categoryId === "object" && t?.categoryId?._id
          ? t.categoryId._id
          : t?.categoryId || null;
      return cid === activeCat;
    });
  }, [tables, activeCat]);

  const getCatName = (table) =>
    (table?.categoryId && (table.categoryId.name || table.categoryId._id)) ||
    "Kategorisiz";

  const getCatColor = (table) =>
    (table?.categoryId && table.categoryId.color) || "#ffffff33"; // yarı saydam beyaz fallback

  const safeCategories = Array.isArray(categories) ? categories : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 to-slate-900 text-white p-4">
      {/* Üst Bar */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
        <h2 className="text-2xl font-bold tracking-wide">🍽️ Masalar</h2>

        {/* Kategori Filtre Çipleri */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveCat(null)}
            className={`px-3 py-1.5 rounded-full border text-sm transition ${
              activeCat === null
                ? "bg-white text-slate-900"
                : "bg-white/10 hover:bg-white/20"
            }`}
          >
            Tümü
          </button>
          {safeCategories.map((c) => (
            <button
              key={c._id}
              onClick={() => setActiveCat(c._id)}
              className={`px-3 py-1.5 rounded-full border text-sm transition flex items-center gap-2 ${
                activeCat === c._id
                  ? "bg-white text-slate-900"
                  : "bg-white/10 hover:bg-white/20"
              }`}
              title={c.name}
            >
              <span
                className="inline-block w-2.5 h-2.5 rounded-full"
                style={{ background: c.color }}
              />
              {c.name}
            </button>
          ))}
        </div>

        <button
          onClick={handleLogout}
          className="self-start md:self-auto flex items-center gap-2 bg-red-600 hover:bg-red-700 transition-all px-4 py-2 rounded shadow"
        >
          <LogOut size={18} />
          Çıkış Yap
        </button>
      </div>

      {/* Masa Listesi */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
        {filteredTables.map((table, i) => {
          const tableId = table._id || table.id;
          const isEmpty = table.status === "empty";

          return (
            <motion.div
              key={tableId || i}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                if (!tableId) {
                  alert(
                    "Bu masanın id'si yok! Lütfen yöneticinize bildiriniz."
                  );
                  return;
                }
                navigate(`/table/${tableId}`);
              }}
              className={`p-4 rounded-xl cursor-pointer shadow-lg transition-all duration-200 ${
                isEmpty
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700"
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-lg font-semibold truncate pr-2">
                  {table.name}
                </h3>

                {/* Durum Rozeti */}
                <span className="inline-flex items-center text-xs px-2 py-1 rounded-full bg-white/20">
                  {isEmpty ? (
                    <CheckCircle size={14} className="mr-1" />
                  ) : (
                    <XCircle size={14} className="mr-1" />
                  )}
                  {isEmpty ? "Boş" : "Dolu"}
                </span>
              </div>

              {/* Kategori Rozeti */}
              <div
                className="inline-flex text-[11px] px-2 py-0.5 rounded-full mb-2"
                style={{ background: getCatColor(table) }}
                title={getCatName(table)}
              >
                {getCatName(table)}
              </div>

              <p className="text-sm mb-2">
                {table.orders?.length || 0} sipariş
              </p>

              {table.orders?.length > 0 && (
                <ul className="text-xs space-y-1">
                  {table.orders.map((order, idx) => (
                    <li key={idx} className="border-b border-white/10 pb-1">
                      <span className="font-medium">{order.name}</span> ×{" "}
                      {order.qty}
                      {order.notes ? (
                        <span className="ml-2 italic opacity-90">
                          📝 {order.notes}
                        </span>
                      ) : null}
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
