import { useState } from "react";
import axios from "../api/axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { Calendar, BarChart2, FileText, User } from "lucide-react";

export default function ReportAdvanced() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchReport = async () => {
    if (!startDate || !endDate) return alert("Tarih aralığı seçin");
    setLoading(true);
    try {
      const res = await axios.post("/reports-advanced", {
        startDate,
        endDate,
      });
      setSummary(res.data.summary);
    } catch (err) {
      console.error("Rapor hatası:", err);
      alert("Rapor alınamadı");
    }
    setLoading(false);
  };

  const exportExcel = () => {
    const data = summary.detailedProductSummary.map((item) => ({
      Ürün: item.name,
      Adet: item.count,
      Toplam: Number(item.total).toFixed(2),
      "Birim Fiyat": item.unitPrice,
    }));
    const sheet = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, sheet, "Ürün Özeti");
    const blob = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([blob]), "rapor.xlsx");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 to-slate-900 text-white p-4 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <BarChart2 size={24} /> Gelişmiş Satış Raporu
      </h2>

      <div className="flex flex-wrap items-center gap-4 mb-6">
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="bg-slate-700 text-white px-3 py-2 rounded border border-slate-600"
        />
        <span>-</span>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="bg-slate-700 text-white px-3 py-2 rounded border border-slate-600"
        />
        <button
          onClick={fetchReport}
          className="bg-blue-600 hover:bg-blue-700 transition text-white px-4 py-2 rounded flex items-center gap-2"
        >
          <FileText size={16} /> Rapor Al
        </button>
        {summary && (
          <button
            onClick={exportExcel}
            className="bg-green-600 hover:bg-green-700 transition text-white px-4 py-2 rounded flex items-center gap-2"
          >
            📥 Excel
          </button>
        )}
      </div>

      {loading && <p className="text-slate-300">⏳ Rapor yükleniyor...</p>}

      {summary && (
        <div className="space-y-6">
          {/* Özet Kart */}
          <div className="bg-slate-800 p-4 rounded-lg shadow border border-slate-700">
            <p className="mb-1 text-lg">
              💰 <strong>Toplam Satış:</strong>{" "}
              <span className="text-green-300">
                {Number(summary.totalSales || 0).toFixed(2)} ₺
              </span>
            </p>
            <p className="text-md">
              🧾 <strong>KDV Toplam:</strong>{" "}
              <span className="text-yellow-400">
                {Number(summary.totalKDV || 0).toFixed(2)} ₺
              </span>
            </p>
          </div>

          {/* Kullanıcı Bazlı */}
          <div className="bg-slate-800 p-4 rounded-lg shadow border border-slate-700">
            <h3 className="font-bold mb-2 flex items-center gap-2">
              <User size={18} /> Garson / Kullanıcı Bazlı Satış
            </h3>
            <ul className="list-disc list-inside text-slate-300 text-sm">
              {Object.entries(summary.userSummary).map(([user, total]) => (
                <li key={user}>
                  {user}: {Number(total || 0).toFixed(2)} ₺
                </li>
              ))}
            </ul>
          </div>

          {/* Ürün Bazlı Chart */}
          <div className="bg-slate-800 p-4 rounded-lg shadow border border-slate-700">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              🍽️ Ürün Bazlı Satış Grafiği
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={summary.detailedProductSummary.map((item) => ({
                  name: item.name,
                  satış: Number(item.total || 0),
                }))}
              >
                <XAxis dataKey="name" tick={{ fill: "#ccc", fontSize: 12 }} />
                <YAxis tick={{ fill: "#ccc", fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    border: "none",
                    color: "#fff",
                  }}
                  labelStyle={{ color: "#fff" }}
                />
                <Bar dataKey="satış" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
