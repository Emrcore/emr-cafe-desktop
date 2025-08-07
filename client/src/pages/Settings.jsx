import BackButton from "../components/BackButton";
import { useEffect, useState, useContext } from "react";
import axios from "../api/axios";
import { AuthContext } from "../context/AuthContext";

export default function Settings() {
  const { user } = useContext(AuthContext);
  const [form, setForm] = useState({
    firmaAdi: "",
    kdvOrani: 0.08,
    servisOrani: 0.05,
    varsayilanOdeme: "nakit",
    logoUrl: ""
  });
  const [message, setMessage] = useState("");

  useEffect(() => {
    axios.get("/settings").then((res) => {
      setForm(res.data);
    });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const parsedValue = name === "kdvOrani" || name === "servisOrani" ? parseFloat(value) : value;
    setForm({ ...form, [name]: parsedValue });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post("/settings", form).then(() => {
      setMessage("Ayarlar kaydedildi.");
    });
  };

  if (!user || user.role !== "admin") {
    return (
      <div className="p-6 text-center text-red-500 font-semibold bg-red-100 dark:bg-red-900 rounded-lg mx-4 mt-6">
        Bu sayfaya sadece <strong>admin</strong> kullanıcılar erişebilir.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 to-slate-900 text-white p-4">
      <div className="max-w-xl mx-auto">
        <BackButton />
        <h2 className="text-2xl font-bold mb-6">⚙️ Sistem Ayarları</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 text-sm text-slate-300">Firma Adı</label>
            <input
              type="text"
              name="firmaAdi"
              value={form.firmaAdi}
              onChange={handleChange}
              placeholder="Firma Adı"
              className="w-full p-2 rounded bg-slate-700 text-white border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm text-slate-300">KDV Oranı</label>
            <input
              type="number"
              name="kdvOrani"
              value={form.kdvOrani}
              onChange={handleChange}
              step="0.01"
              placeholder="0.08"
              className="w-full p-2 rounded bg-slate-700 text-white border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm text-slate-300">Servis Oranı</label>
            <input
              type="number"
              name="servisOrani"
              value={form.servisOrani}
              onChange={handleChange}
              step="0.01"
              placeholder="0.05"
              className="w-full p-2 rounded bg-slate-700 text-white border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm text-slate-300">Varsayılan Ödeme Türü</label>
            <select
              name="varsayilanOdeme"
              value={form.varsayilanOdeme}
              onChange={handleChange}
              className="w-full p-2 rounded bg-slate-700 text-white border border-slate-600"
            >
              <option value="nakit">Nakit</option>
              <option value="kart">Kart</option>
            </select>
          </div>

          <div>
            <label className="block mb-1 text-sm text-slate-300">Logo URL (isteğe bağlı)</label>
            <input
              type="text"
              name="logoUrl"
              value={form.logoUrl}
              onChange={handleChange}
              placeholder="https://..."
              className="w-full p-2 rounded bg-slate-700 text-white border border-slate-600"
            />
          </div>

          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 transition px-4 py-2 rounded text-white font-semibold"
          >
            Kaydet
          </button>

          {message && (
            <div className="mt-4 bg-green-600 text-white p-2 rounded text-sm shadow">
              ✅ {message}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
