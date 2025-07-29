import { useState, useEffect } from "react";
import axios from "axios";
import BackButton from "../components/BackButton";

export default function AdminTables() {
  const [tables, setTables] = useState([]);
  const [newTableName, setNewTableName] = useState("");

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    const res = await axios.get("http://localhost:3001/api/tables");
    setTables(res.data);
  };

  const addTable = async () => {
    if (!newTableName) return;
    await axios.post("http://localhost:3001/api/tables", {
      name: newTableName
    });
    setNewTableName("");
    fetchTables();
  };

  const deleteTable = async (id) => {
    if (!window.confirm("Bu masayı silmek istediğinizden emin misiniz?")) return;
    await axios.delete(`http://localhost:3001/api/tables/${id}`);
    fetchTables();
  };

  return (
    <div className="p-4">
      <BackButton />
      <h2 className="text-xl font-bold mb-4">Masa Yönetimi</h2>
      <div className="flex gap-2 mb-4">
        <input
          value={newTableName}
          onChange={(e) => setNewTableName(e.target.value)}
          placeholder="Yeni masa adı"
          className="border p-2 flex-1"
        />
        <button onClick={addTable} className="bg-blue-600 text-white px-4 py-2 rounded">
          Ekle
        </button>
      </div>

      <ul>
        {tables.map((table) => (
          <li key={table.id} className="flex justify-between items-center border-b py-2">
            <span>{table.name}</span>
            <button
              onClick={() => deleteTable(table.id)}
              className="bg-red-500 text-white px-2 py-1 rounded text-sm"
            >
              Sil
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
