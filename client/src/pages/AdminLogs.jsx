import { useEffect, useState, useContext } from "react";
import axios from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { motion } from "framer-motion";

export default function AdminLogs() {
  const { user } = useContext(AuthContext);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role !== "admin") return;

    const fetchLogs = async () => {
      try {
        const res = await axios.get("/logs");
        setLogs(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Log alma hatası:", err);
        setLogs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [user]);

  if (user?.role !== "admin") {
    return (
      <div className="p-4 text-center text-red-500 font-semibold">
        Bu sayfa yalnızca admin kullanıcılar içindir.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 to-slate-900 text-white p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">🔍 Kullanıcı İşlem Geçmişi</h1>

      {loading ? (
        <div className="text-center text-slate-300 animate-pulse">Yükleniyor...</div>
      ) : logs.length === 0 ? (
        <p className="text-center text-slate-400">Log kaydı bulunamadı.</p>
      ) : (
        <ul className="space-y-4">
          {logs.map((log) => (
            <motion.li
              key={log._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-800 border border-slate-700 p-4 rounded-xl shadow hover:shadow-lg transition-all"
            >
              <div className="flex justify-between flex-wrap">
                <div className="text-sm text-slate-200 font-medium">
                  👤 {log.username} <span className="text-slate-400">({log.role})</span>
                </div>
                <div className="text-xs text-slate-400">
                  {new Date(log.createdAt).toLocaleString()}
                </div>
              </div>

              <div className="mt-2 text-sm italic text-blue-400">
                {log.action}
              </div>

              {log.details && (
                <pre className="text-xs mt-3 bg-slate-900 p-3 rounded overflow-x-auto text-slate-300 border border-slate-700">
                  {JSON.stringify(log.details, null, 2)}
                </pre>
              )}
            </motion.li>
          ))}
        </ul>
      )}
    </div>
  );
}
