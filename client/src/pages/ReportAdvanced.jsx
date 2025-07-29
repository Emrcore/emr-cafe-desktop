import { useState } from "react";
import axios from "../api/axios";
import { format } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export default function ReportAdvanced() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchReport = async () => {
    if (!startDate || !endDate) return alert("Tarih aralığı seçin");
    setLoading(true);
    try {
      const res = await axios.post("/reports-advanced", { startDate, endDate });
      setSummary(res.data.summary);
    } catch (err) {
      console.error("Rapor hatası:", err);
      alert("Rapor alınamadı");
    }
    setLoading(false);
  };

  const exportExcel = () => {
    const data = Object.entries(summary.productSummary).map(([name, val]) => ({
      Ürün: name,
      Adet: val.count || 0,
      Toplam: Number(val.total || 0).toFixed(2),
    }));
    const sheet = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, sheet, "Ürün Özeti");
    const blob = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([blob]), "rapor.xlsx");
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h2 className="text-xl font-bold mb-4">📊 Gelişmiş Satış Raporu</h2>

      <div className="flex flex-wrap items-center gap-4 mb-4">
        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="border px-2 py-1 rounded" />
        <span>-</span>
        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="border px-2 py-1 rounded" />
        <button onClick={fetchReport} className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700">
          Rapor Al
        </button>
        {summary && (
          <button onClick={exportExcel} className="bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700">
            Excel
          </button>
        )}
      </div>

      {loading && <p>Yükleniyor...</p>}

      {summary && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
            <p>💵 <strong>Toplam Satış:</strong> {Number(summary.totalSales || 0).toFixed(2)} ₺</p>
            <p>🧾 <strong>KDV Toplam:</strong> {Number(summary.totalKDV || 0).toFixed(2)} ₺</p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
            <h3 className="font-bold mb-2">🧍 Garson / Kullanıcı Bazlı Satış</h3>
            <ul className="list-disc list-inside">
              {Object.entries(summary.userSummary).map(([user, total]) => (
                <li key={user}>
                  {user}: {Number(total || 0).toFixed(2)} ₺
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
            <h3 className="font-bold mb-2">🍽️ Ürün Bazlı Satış</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={Object.entries(summary.productSummary).map(([name, val]) => ({
                  name,
                  satış: Number(val.total || 0),
                }))}
              >
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="satış" fill="#3182ce" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
