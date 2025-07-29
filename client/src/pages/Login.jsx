import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "../api/axios";
import toast from "react-hot-toast";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth(); // ✅ Güncel kullanım
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username.trim() || !password.trim()) {
      toast.error("Kullanıcı adı ve şifre gerekli");
      return;
    }

    try {
      const res = await axios.post("/login", { username, password });
      login(res.data.user);
      toast.success("Giriş başarılı");
      navigate("/tables"); // ✅ yönlendirme başarılı giriş sonrası
    } catch (err) {
      toast.error("Giriş başarısız");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
      <form onSubmit={handleSubmit} className="bg-slate-800 p-8 rounded shadow max-w-sm w-full">
        <h2 className="text-xl mb-4 font-semibold text-center">Giriş</h2>
        <input
          type="text"
          placeholder="Kullanıcı Adı"
          className="w-full p-2 mb-4 rounded bg-slate-700 text-white"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Şifre"
          className="w-full p-2 mb-4 rounded bg-slate-700 text-white"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 p-2 rounded">
          Giriş Yap
        </button>
      </form>
    </div>
  );
}
