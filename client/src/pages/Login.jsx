import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import axios from "../api/axios"; // 🔁 socket ve interceptor destekli axios
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import DarkModeToggle from "../components/DarkModeToggle";

export default function LoginPage() {
  const { login } = useContext(AuthContext);
  const [form, setForm] = useState({ username: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post("/login", form); // ✅ IP yok, otomatik çalışır
      login(res.data);
      toast.success("Giriş başarılı!");
      navigate("/tables");
    } catch (err) {
      toast.error("Kullanıcı adı veya şifre hatalı");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-gray-800 p-6 rounded shadow w-80"
      >
        <h2 className="text-lg font-bold mb-4 text-center dark:text-white">EMR CAFE GİRİŞ</h2>
        <input
          type="text"
          name="username"
          placeholder="Kullanıcı adı"
          className="w-full mb-2 p-2 border rounded dark:bg-gray-700 dark:text-white"
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Şifre"
          className="w-full mb-4 p-2 border rounded dark:bg-gray-700 dark:text-white"
          onChange={handleChange}
          required
        />
        <button className="bg-blue-600 w-full text-white py-2 rounded hover:bg-blue-700 transition">Giriş</button>
        <div className="mt-4 flex justify-center">
          <DarkModeToggle />
        </div>
      </form>
    </div>
  );
}
