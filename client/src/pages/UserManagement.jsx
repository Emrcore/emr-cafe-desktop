import BackButton from "../components/BackButton";
import { useEffect, useState, useContext } from "react";
import axios from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function UserManagement() {
  const { user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ username: "", password: "", role: "garson" });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = () => {
    axios.get("/users").then((res) => setUsers(res.data));
  };

  const handleAdd = (e) => {
    e.preventDefault();
    axios
      .post("/users", form)
      .then(() => {
        toast.success("Kullanıcı eklendi");
        setForm({ username: "", password: "", role: "garson" });
        fetchUsers();
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || "Hata oluştu.");
      });
  };

  const handleDelete = (username) => {
    if (!window.confirm("Kullanıcı silinsin mi?")) return;
    axios.delete(`/users/${username}`).then(() => {
      toast("Kullanıcı silindi", { icon: "👤" });
      fetchUsers();
    });
  };

  if (!user || user.role !== "admin") {
    return <p className="p-4 text-red-500">Bu sayfaya sadece admin erişebilir.</p>;
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      <BackButton />
      <h2 className="text-2xl font-bold mb-4 dark:text-white">Kullanıcı Yönetimi</h2>

      <form onSubmit={handleAdd} className="space-y-3 mb-6">
        <input
          type="text"
          placeholder="Kullanıcı adı"
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
          required
          className="p-2 border rounded w-full dark:bg-gray-800 dark:text-white"
        />
        <input
          type="password"
          placeholder="Şifre"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
          className="p-2 border rounded w-full dark:bg-gray-800 dark:text-white"
        />
        <select
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
          className="p-2 border rounded w-full dark:bg-gray-800 dark:text-white"
        >
          <option value="garson">Garson</option>
          <option value="kasiyer">Kasiyer</option>
          <option value="admin">Admin</option>
          <option value="mutfak">Mutfak</option>
        </select>
        <button className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 w-full">Ekle</button>
      </form>

      <h3 className="font-bold mb-2 dark:text-white">Kayıtlı Kullanıcılar</h3>
      <ul className="space-y-2">
        {users.map((u, i) => (
          <li
            key={i}
            className="flex justify-between items-center border-b pb-1 text-sm dark:text-white"
          >
            <span>{u.username} ({u.role})</span>
            <button
              onClick={() => handleDelete(u.username)}
              className="text-xs bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
            >
              Sil
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
