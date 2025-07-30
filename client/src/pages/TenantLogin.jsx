import { useState } from "react";

export default function TenantLogin() {
  const [tenant, setTenant] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = tenant.trim().toLowerCase();

    if (!trimmed) return alert("İşletme adı girin");

    const fullDomain = `https://${trimmed}.cafe.emrcore.com.tr`;

    try {
      const res = await fetch(`${fullDomain}/api/ping`);

      if (res.ok) {
        // ✅ Doğrudan işletmenin subdomainine yönlendir
        window.location.href = fullDomain;
      } else {
        alert("Sunucuya ulaşılamadı.");
      }
    } catch (err) {
      alert("Bağlantı hatası! Sunucu çalışıyor mu?");
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
          Giriş Yap
        </button>
      </form>
    </div>
  );
}
