import BackButton from "../components/BackButton";
import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

export default function UserManagement() {
  const { user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ username: "", password: "", role: "garson" });
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = () => {
    axios.get("http://localhost:3001/api/users").then((res) => setUsers(res.data));
  };

  const handleAdd = (e) => {
    e.preventDefault();
    axios
      .post("http://localhost:3001/api/users", form)
      .then(() => {
        setMessage("Kullanıcı eklendi.");
        setForm({ username: "", password: "", role: "garson" });
        fetchUsers();
      })
      .catch((err) => {
        setMessage(err.response?.data?.message || "Hata oluştu.");
      });
  };

  const handleDelete = (username) => {
    if (!window.confirm("Kullanıcı silinsin mi?")) return;
    axios.delete(`http://localhost:3001/api/users/${username}`).then(() => {
      fetchUsers();
    });
  };

  if (!user || user.role !== "admin") {
    return <p className="p-4 text-red-500">Bu sayfaya sadece admin erişebilir.</p>;
  }

  return (


    <div className="p-4">
      <BackButton />
      <h2 className="text-xl font-bold mb-4">Kullanıcı Yönetimi</h2>

      <form onSubmit={handleAdd} className="mb-6">
        <div className="flex flex-col gap-2 mb-2">
          <input
            type="text"
            placeholder="Kullanıcı adı"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            required
            className="p-2 border rounded"
          />
          <input
            type="password"
            placeholder="Şifre"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
            className="p-2 border rounded"
          />
          <select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            className="p-2 border rounded"
          >
            <option value="garson">Garson</option>
            <option value="kasiyer">Kasiyer</option>
            <option value="admin">Admin</option>
            <option value="mutfak">Mutfak</option>
          </select>
        </div>
        <button className="bg-blue-600 text-white py-2 px-4 rounded">Ekle</button>
        {message && <p className="mt-2 text-sm text-green-600">{message}</p>}
      </form>

      <h3 className="font-bold mb-2">Kayıtlı Kullanıcılar</h3>
      <ul>
        {users.map((u, i) => (
          <li key={i} className="flex justify-between items-center border-b py-1">
            <span>{u.username} ({u.role})</span>
            <button
              onClick={() => handleDelete(u.username)}
              className="text-red-600 text-sm"
            >
              Sil
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
