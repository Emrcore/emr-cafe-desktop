import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import io from "socket.io-client";
import axios from "../api/axios";
import { LogOut } from "lucide-react"; // ✅ ikon eklendi
import { useAuth } from "../context/AuthContext";

const socket = io({ path: "/socket.io" });

export default function Tables() {
  const [tables, setTables] = useState([]);
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    axios.get("/tables").then((res) => {
      console.log("API'den gelen masalar:", res.data);
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
    <div className="p-4">
      {/* ✅ Sağ üst çıkış butonu */}
      <div className="flex justify-end mb-4">
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
        >
          <LogOut size={18} />
          Çıkış Yap
        </button>
      </div>

      <h2 className="text-xl font-bold mb-4">Masalar</h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {tables.map((table, i) => {
          const tableId = table._id || table.id;
          console.log("Masa renderlandı:", table, "tableId:", tableId);

          return (
            <div
              key={tableId || i}
              onClick={() => {
                console.log("Masa tıklandı. id:", tableId);
                if (!tableId) {
                  alert("Bu masanın id'si yok! Lütfen yöneticinize bildiriniz.");
                  return;
                }
                navigate(`/table/${tableId}`);
              }}
              className={`p-4 rounded-lg shadow cursor-pointer text-white ${
                table.status === "empty" ? "bg-green-500" : "bg-red-500"
              }`}
            >
              <h3 className="text-lg font-bold">{table.name}</h3>
              <p className="text-sm">{table.orders.length} sipariş</p>
              {table.orders.length > 0 && (
                <ul className="text-xs mt-2 space-y-1">
                  {table.orders.map((order, i) => (
                    <li key={i}>
                      {order.name} x{order.qty}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
