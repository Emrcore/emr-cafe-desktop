import BackButton from "../components/BackButton";
import { useEffect, useState } from "react";
import axios from "../api/axios";
import toast from "react-hot-toast";
import { FileText, FileSpreadsheet, Receipt } from "lucide-react";

export default function Report() {
  const [sales, setSales] = useState([]);
  const [todayOnly, setTodayOnly] = useState(true);
  const [selectedSales, setSelectedSales] = useState([]);

  const fetchData = async () => {
    const today = new Date().toISOString().split("T")[0];
    const res = await axios.get(`/reports${todayOnly ? `?date=${today}` : ""}`);
    setSales(res.data);
    setSelectedSales([]);
  };

  useEffect(() => {
    fetchData();
  }, [todayOnly]);

  const summary = sales.reduce(
    (acc, s) => {
      acc.total += s.total;
      return acc;
    },
    { total: 0 }
  );

  const downloadExcel = () => {
    window.open("/api/reports/excel", "_blank");
  };

  const toggleSelect = (id) => {
    setSelectedSales((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const generateInvoices = async () => {
    try {
      const selected = sales.filter((s) => selectedSales.includes(s._id));
      if (selected.length === 0) return toast.error("Lütfen fatura için satış seçin.");

      for (const s of selected) {
        const response = await axios.post("/invoices/generate", {
          customerName: "",
          paymentType: s.paymentMethod,
          tableId: s.tableId,
          items: s.orders.map((o) => ({
            name: o.name,
            price: o.price,
            quantity: o.qty,
          })),
        });

        const invoiceId = response.data._id;
        window.open(`/api/invoices/${invoiceId}/pdf`, "_blank");
      }

      toast.success("🧾 Faturalar oluşturuldu");
    } catch (err) {
      toast.error("❌ Fatura oluşturulamadı");
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 to-slate-900 text-white p-4">
      <BackButton />
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <FileText size={24} />
        Satış Raporu
      </h2>

      <div className="mb-6 flex items-center gap-4 flex-wrap">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={todayOnly}
            onChange={(e) => setTodayOnly(e.target.checked)}
            className="accent-blue-500"
          />
          <span>Sadece Bugünün Satışları</span>
        </label>

        <button
          onClick={downloadExcel}
          className="bg-green-600 hover:bg-green-700 transition text-white px-4 py-2 rounded flex items-center gap-2"
        >
          <FileSpreadsheet size={16} /> Excel İndir
        </button>

        <button
          onClick={generateInvoices}
          disabled={selectedSales.length === 0}
          className={`bg-blue-600 hover:bg-blue-700 transition text-white px-4 py-2 rounded flex items-center gap-2 ${
            selectedSales.length === 0 ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          <Receipt size={16} /> Seçilenlere Fatura Oluştur
        </button>
      </div>

      <div className="mb-6 bg-slate-700 p-4 rounded-lg shadow-md">
        <p className="text-lg font-semibold">
          Toplam Satış: <span className="text-green-300">{summary.total.toFixed(2)} ₺</span>
        </p>
      </div>

      <div className="space-y-6">
        {sales.map((s, i) => (
          <div
            key={i}
            className="bg-slate-800 border border-slate-700 p-4 rounded-lg shadow-md transition hover:border-blue-500"
          >
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedSales.includes(s._id)}
                onChange={() => toggleSelect(s._id)}
                className="mt-1 accent-blue-500"
              />
              <div>
                <p className="font-semibold">Masa: {s.tableId}</p>
                <p className="text-sm text-slate-300">
                  Toplam: {s.total.toFixed(2)} ₺ — {s.paymentMethod}
                </p>
                <p className="text-xs text-slate-400">
                  {new Date(s.date).toLocaleString()}
                </p>
              </div>
            </label>

            <ul className="ml-6 mt-2 list-disc text-sm text-slate-300">
              {s.orders.map((o, j) => (
                <li key={j}>
                  {o.name} × {o.qty} — {(o.price * o.qty).toFixed(2)} ₺
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
