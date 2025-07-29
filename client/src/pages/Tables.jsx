import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import io from "socket.io-client";
import axios from "../api/axios";

const socket = io({ path: "/socket.io" });

export default function Tables() {
  const [tables, setTables] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get("/tables").then((res) => {
      console.log("API'den gelen masalar:", res.data);  // <-- BURAYI EKLE!
      setTables(res.data);
    });

    socket.on("tables:update", (data) => setTables(data));

    return () => {
      socket.off("tables:update");
      socket.disconnect();
    };
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Masalar</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {tables.map((table, i) => {
          const tableId = table._id || table.id; // <-- Hem Mongo hem eski JSON desteği
          console.log("Masa renderlandı:", table, "tableId:", tableId); // <-- BURAYI EKLE!

          return (
            <div
              key={tableId || i}
              onClick={() => {
                console.log("Masa tıklandı. id:", tableId); // <-- BURAYI EKLE!
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
