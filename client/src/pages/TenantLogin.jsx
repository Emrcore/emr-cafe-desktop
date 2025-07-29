import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";

export default function TenantLogin() {
  const [tenant, setTenant] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = tenant.trim().toLowerCase();

    if (!trimmed) return alert("İşletme adı girin");

    const domain = `https://${trimmed}.emrcore.com.tr`;
    localStorage.setItem("tenant_url", domain);

    try {
      // BaseURL ayarlı olmayan özel istek (axios.get direkt kullanıldı)
      await axios.get(`${domain}/api/ping`);
      navigate("/login");
    } catch (err) {
      alert(`Sunucuya bağlanılamadı: ${domain}`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
      <form
        onSubmit={handleSubmit}
        className="bg-slate-800 p-8 rounded shadow max-w-sm w-full"
      >
        <h2 className="text-xl mb-4 font-semibold text-center">İşletme Adı</h2>
        <input
          type="text"
          placeholder="örnek: cafe1"
          className="w-full p-2 mb-4 rounded bg-slate-700 text-white"
          value={tenant}
          onChange={(e) => setTenant(e.target.value)}
        />
        <button
          type="submit"
          className="w-full bg-emerald-500 hover:bg-emerald-600 p-2 rounded"
        >
          Devam Et
        </button>
      </form>
    </div>
  );
}
