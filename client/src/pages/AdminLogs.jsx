import { useEffect, useState } from "react";
import axios from "../api/axios";

export default function AdminLogs() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    axios.get("/logs").then((res) => setLogs(res.data));
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Kullanıcı Logları</h1>
      <ul className="space-y-2">
        {logs.map((log) => (
          <li key={log._id} className="border-b py-2 text-sm">
            <b>{log.username}</b> ({log.role}) - {log.action}<br />
            <span className="text-gray-500">{new Date(log.createdAt).toLocaleString()}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
