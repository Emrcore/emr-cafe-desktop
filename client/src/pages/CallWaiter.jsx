import { useState } from "react";
import axios from "../api/axios";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

export default function CallWaiter() {
  const [table, setTable] = useState("");

  const handleCall = async () => {
    if (!table.trim()) return toast.error("Lütfen masa numarası girin");

    try {
      await axios.post("/calls", { tableName: table.trim() });
      toast.success("🔔 Garson çağrıldı!");
      setTable("");
    } catch (err) {
      console.error(err);
      toast.error("❌ Çağrı gönderilemedi");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900 px-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-slate-800 border border-slate-700 shadow-xl rounded-xl p-6 w-full max-w-md text-white"
      >
        <h1 className="text-2xl font-bold mb-6 text-center">📣 Garson Çağır</h1>

        <input
          type="text"
          placeholder="Masa numaranız (örn. Masa 4)"
          value={table}
          onChange={(e) => setTable(e.target.value)}
          className="w-full bg-slate-700 text-white border border-slate-600 px-4 py-2 rounded-lg mb-4 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <button
          onClick={handleCall}
          className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-700 transition font-semibold text-white"
        >
          🔔 Garson Çağır
        </button>
      </motion.div>
    </div>
  );
}
