import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import io from "socket.io-client";

const socket = io("http://localhost:3001");

export default function Tables() {
  const [tables, setTables] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:3001/api/tables")
      .then((res) => res.json())
      .then(setTables);

    socket.on("tables:update", (data) => setTables(data));

    return () => socket.off("tables:update");
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Masalar</h2>
      <div className="grid grid-cols-2 gap-4">
        {tables.map((table) => (
          <div
            key={table.id}
            onClick={() => navigate(`/table/${table.id}`)}
            className={`p-6 text-white rounded-lg shadow cursor-pointer ${
              table.status === "empty" ? "bg-green-500" : "bg-red-500"
            }`}
          >
            <h2 className="text-xl font-bold">{table.name}</h2>
            <p>{table.orders.length} sipariş</p>
          </div>
        ))}
      </div>
    </div>
  );
}
