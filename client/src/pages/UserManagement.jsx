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
        toast.success("✅ Kullanıcı eklendi");
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
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-red-400 text-center p-4">
        <div className="bg-gray-800 p-6 rounded shadow max-w-md">
          <h1 className="text-xl font-bold mb-2">Erişim Reddedildi</h1>
          <p>Bu sayfaya sadece <span className="text-white font-semibold">admin</span> kullanıcıları erişebilir.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-800 to-slate-900 p-4 text-white">
      <BackButton />
      <h2 className="text-3xl font-bold mb-6">👥 Kullanıcı Yönetimi</h2>

      {/* Kullanıcı Ekleme Formu */}
      <form onSubmit={handleAdd} className="bg-slate-800 p-6 rounded shadow-md space-y-4 mb-10 max-w-md mx-auto">
        <input
          type="text"
          placeholder="Kullanıcı adı"
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
          required
          className="w-full p-2 rounded bg-slate-700 text-white border border-slate-600 placeholder-slate-400"
        />
        <input
          type="password"
          placeholder="Şifre"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
          className="w-full p-2 rounded bg-slate-700 text-white border border-slate-600 placeholder-slate-400"
        />
        <select
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
          className="w-full p-2 rounded bg-slate-700 text-white border border-slate-600"
        >
          <option value="garson">Garson</option>
          <option value="kasiyer">Kasiyer</option>
          <option value="admin">Admin</option>
          <option value="mutfak">Mutfak</option>
        </select>
        <button className="w-full bg-blue-600 hover:bg-blue-700 transition py-2 rounded">
          ➕ Kullanıcı Ekle
        </button>
      </form>

      {/* Kullanıcı Listesi */}
      <h3 className="text-2xl font-semibold mb-4">📋 Kayıtlı Kullanıcılar</h3>
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
        {users.map((u, i) => (
          <div
            key={i}
            className="bg-slate-800 rounded p-4 shadow flex items-center justify-between"
          >
            <div>
              <p className="font-medium">{u.username}</p>
              <p className="text-sm text-slate-400">{u.role}</p>
            </div>
            <button
              onClick={() => handleDelete(u.username)}
              className="bg-red-500 hover:bg-red-600 text-white text-sm px-3 py-1 rounded"
            >
              Sil
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
