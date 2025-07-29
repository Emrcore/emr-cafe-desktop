import BackButton from "../components/BackButton";
import { useEffect, useState } from "react";
import axios from "../api/axios";
import toast from "react-hot-toast";

export default function Report() {
  const [sales, setSales] = useState([]);
  const [todayOnly, setTodayOnly] = useState(true);
  const [selectedSales, setSelectedSales] = useState([]);

  const fetchData = async () => {
    const today = new Date().toISOString().split("T")[0];
    const res = await axios.get(`/reports${todayOnly ? `?date=${today}` : ""}`);
    setSales(res.data);
    setSelectedSales([]); // Tarih değiştiğinde seçim sıfırlanır
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

  const generateInvoice = async () => {
    try {
      const selected = sales.filter((s) => selectedSales.includes(s._id));
      if (selected.length === 0) return toast.error("Lütfen fatura için satış seçin.");

      const response = await axios.post("/invoices/generate", { sales: selected }, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `fatura_${Date.now()}.pdf`);
      document.body.appendChild(link);
      link.click();
      toast.success("Fatura indirildi");
    } catch (err) {
      toast.error("Fatura oluşturulamadı");
      console.error(err);
    }
  };

  return (
    <div className="p-4">
      <BackButton />
      <h2 className="text-2xl font-bold mb-4">Satış Raporu</h2>

      <div className="mb-4 flex items-center gap-4 flex-wrap">
        <label>
          <input
            type="checkbox"
            checked={todayOnly}
            onChange={(e) => setTodayOnly(e.target.checked)}
          />
          <span className="ml-2">Sadece Bugünün Satışları</span>
        </label>

        <button
          onClick={downloadExcel}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Excel Olarak İndir
        </button>

        <button
          onClick={generateInvoice}
          disabled={selectedSales.length === 0}
          className={`bg-blue-600 text-white px-4 py-2 rounded ${selectedSales.length === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          Seçilenlere Fatura Oluştur
        </button>
      </div>

      <div className="mb-4">
        <p><strong>Toplam Satış:</strong> {summary.total.toFixed(2)} ₺</p>
      </div>

      <div className="border-t pt-4 space-y-4">
        {sales.map((s, i) => (
          <div key={i} className="border-b pb-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedSales.includes(s._id)}
                onChange={() => toggleSelect(s._id)}
              />
              <div>
                <p><strong>Masa:</strong> {s.tableId}</p>
                <p><strong>Toplam:</strong> {s.total.toFixed(2)} ₺ - {s.paymentMethod}</p>
                <p className="text-sm text-gray-600">{new Date(s.date).toLocaleString()}</p>
              </div>
            </label>
            <ul className="ml-8 list-disc text-sm mt-2">
              {s.orders.map((o, j) => (
                <li key={j}>{o.name} x{o.qty} - {(o.price * o.qty).toFixed(2)} ₺</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
