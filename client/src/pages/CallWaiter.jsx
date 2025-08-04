import { useState } from "react";
import axios from "../api/axios";
import toast from "react-hot-toast";

export default function CallWaiter() {
  const [table, setTable] = useState("");

  const handleCall = async () => {
    if (!table.trim()) return toast.error("Lütfen masa numarası girin");

    try {
      await axios.post("/calls", { tableName: table.trim() });
      toast.success("Garson çağrıldı!");
      setTable("");
    } catch (err) {
      console.error(err);
      toast.error("Çağrı gönderilemedi");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-4">
      <div className="bg-white shadow-md rounded-lg p-6 max-w-md w-full">
        <h1 className="text-xl font-bold mb-4 text-center">Garson Çağır</h1>
        <input
          type="text"
          placeholder="Masa numaranız (örn. Masa 4)"
          value={table}
          onChange={(e) => setTable(e.target.value)}
          className="w-full border px-3 py-2 rounded mb-4"
        />
        <button
          onClick={handleCall}
          className="bg-blue-600 text-white w-full py-2 rounded hover:bg-blue-700"
        >
          Garson Çağır
        </button>
      </div>
    </div>
  );
}
