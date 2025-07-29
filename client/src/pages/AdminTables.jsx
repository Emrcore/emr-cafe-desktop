import { useState, useEffect } from "react";
import axios from "../api/axios";
import BackButton from "../components/BackButton";
import toast from "react-hot-toast";

export default function AdminTables() {
  const [tables, setTables] = useState([]);
  const [newTableName, setNewTableName] = useState("");

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    const res = await axios.get("/tables");
    setTables(res.data);
  };

  const addTable = async () => {
    const trimmedName = newTableName.trim();
    if (!trimmedName) {
      toast.error("Masa adı boş olamaz");
      return;
    }

    try {
      await axios.post("/tables", { name: trimmedName });
      toast.success("Masa eklendi");
      setNewTableName("");
      fetchTables();
    } catch (err) {
      console.error("Masa ekleme hatası:", err.response?.data || err.message);
      toast.error("Masa eklenemedi");
    }
  };

  const deleteTable = async (id) => {
    if (!window.confirm("Bu masayı silmek istediğinizden emin misiniz?")) return;
    try {
      await axios.delete(`/tables/${id}`);
      toast("Masa silindi", { icon: "🪑" });
      fetchTables();
    } catch (err) {
      toast.error("Masa silinemedi!");
      console.error("Silme hatası:", err.response?.data || err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      <BackButton />
      <h2 className="text-2xl font-bold mb-4 dark:text-white">Masa Yönetimi</h2>

      <div className="flex flex-col sm:flex-row gap-2 mb-6">
        <input
          value={newTableName}
          onChange={(e) => setNewTableName(e.target.value)}
          placeholder="Yeni masa adı"
          className="border p-2 flex-1 rounded dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={addTable}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Ekle
        </button>
      </div>

      <ul className="space-y-2">
        {tables.map((table) => (
          <li
            key={table._id || table.id}
            className="flex justify-between items-center border-b pb-1 text-sm dark:text-white"
          >
            <span>{table.name}</span>
            <button
              onClick={() => deleteTable(table._id || table.id)}
              className="bg-red-500 text-white px-3 py-1 rounded text-xs hover:bg-red-600"
            >
              Sil
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
