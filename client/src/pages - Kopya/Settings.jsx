import BackButton from "../components/BackButton";
import { useEffect, useState, useContext } from "react";
import axios from "axios";
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
    axios.get("http://localhost:3001/api/settings").then((res) => {
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
    axios.post("http://localhost:3001/api/settings", form).then(() => {
      setMessage("Ayarlar kaydedildi.");
    });
  };

  if (!user || user.role !== "admin") {
    return <p className="p-4 text-red-500">Bu sayfaya sadece admin erişebilir.</p>;
  }

  return (
  

    <div className="p-4 max-w-xl">
      <BackButton />
      <h2 className="text-2xl font-bold mb-4">Sistem Ayarları</h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          name="firmaAdi"
          value={form.firmaAdi}
          onChange={handleChange}
          placeholder="Firma Adı"
          className="p-2 border rounded"
        />
        <input
          type="number"
          name="kdvOrani"
          value={form.kdvOrani}
          onChange={handleChange}
          step="0.01"
          placeholder="KDV Oranı (örn. 0.08)"
          className="p-2 border rounded"
        />
        <input
          type="number"
          name="servisOrani"
          value={form.servisOrani}
          onChange={handleChange}
          step="0.01"
          placeholder="Servis Oranı (örn. 0.05)"
          className="p-2 border rounded"
        />
        <select
          name="varsayilanOdeme"
          value={form.varsayilanOdeme}
          onChange={handleChange}
          className="p-2 border rounded"
        >
          <option value="nakit">Varsayılan: Nakit</option>
          <option value="kart">Varsayılan: Kart</option>
        </select>
        <input
          type="text"
          name="logoUrl"
          value={form.logoUrl}
          onChange={handleChange}
          placeholder="Logo URL (isteğe bağlı)"
          className="p-2 border rounded"
        />
        <button className="bg-blue-600 text-white px-4 py-2 rounded">
          Kaydet
        </button>
        {message && <p className="text-green-600 text-sm">{message}</p>}
      </form>
    </div>
  );
}
