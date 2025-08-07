import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import axios from "../api/axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import DarkModeToggle from "../components/DarkModeToggle";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";

export default function Login() {
  const { login } = useContext(AuthContext);
  const [form, setForm] = useState({ username: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const tenant = localStorage.getItem("tenant_url") || "";
      const res = await axios.post("/login", form, {
        headers: {
          "x-tenant-id": tenant,
        },
      });
      login(res.data);
      toast.success("🎉 Giriş başarılı!");
      navigate("/tables");
    } catch (err) {
      toast.error("❌ Kullanıcı adı veya şifre hatalı");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900 relative">
      {/* Geri Butonu */}
      <button
        onClick={() => navigate("/")}
        className="absolute top-4 left-4 text-white hover:text-blue-400 flex items-center"
      >
        <ArrowLeft className="mr-1" /> Geri
      </button>

      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-800 border border-slate-700 text-white w-full max-w-sm p-6 rounded-xl shadow-lg"
      >
        <h2 className="text-2xl font-bold mb-6 text-center tracking-wide">☕ EMR CAFE GİRİŞ</h2>

        <input
          type="text"
          name="username"
          placeholder="Kullanıcı adı"
          onChange={handleChange}
          required
          className="w-full mb-3 p-3 rounded bg-slate-700 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <input
          type="password"
          name="password"
          placeholder="Şifre"
          onChange={handleChange}
          required
          className="w-full mb-6 p-3 rounded bg-slate-700 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <button
          type="submit"
          className="w-full py-2 rounded bg-blue-600 hover:bg-blue-700 transition font-semibold text-white"
        >
          Giriş
        </button>

        <div className="mt-6 flex justify-center">
          <DarkModeToggle />
        </div>
      </motion.form>
    </div>
  );
}
