import { useEffect, useState, useContext } from "react";
import axios from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import toast from "react-hot-toast";
import socket from "../socket"; // socket.io-client bağlantısı

export default function WaiterCalls() {
  const [calls, setCalls] = useState([]);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (user?.role !== "garson") return;

    fetchCalls();

    socket.on("new-call", (call) => {
      setCalls((prev) => [call, ...prev]);
      toast.success(`Yeni çağrı: ${call.tableName}`);
    });

    return () => {
      socket.off("new-call");
    };
  }, [user]);

  const fetchCalls = async () => {
    const res = await axios.get("/calls");
    setCalls(res.data);
  };

  const completeCall = async (id) => {
    try {
      await axios.put(`/calls/${id}/done`);
      setCalls((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      toast.error("Çağrı kapatılamadı");
    }
  };

  if (user?.role !== "garson") {
    return <div className="p-4">Bu sayfa sadece garsonlar içindir.</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Garson Çağrıları</h1>
      {calls.length === 0 ? (
        <p>Aktif çağrı yok.</p>
      ) : (
        <ul className="space-y-4">
          {calls.map((call) => (
            <li
              key={call._id}
              className="border p-4 rounded flex justify-between items-center bg-yellow-100"
            >
              <div>
                <div className="font-semibold">{call.tableName}</div>
                <div className="text-sm text-gray-500">
                  {new Date(call.createdAt).toLocaleTimeString()}
                </div>
              </div>
              <button
                onClick={() => completeCall(call._id)}
                className="bg-green-600 text-white px-3 py-1 rounded"
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
