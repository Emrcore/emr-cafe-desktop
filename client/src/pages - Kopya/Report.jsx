import BackButton from "../components/BackButton";
import { useEffect, useState } from "react";
import axios from "axios";

export default function Report() {
  const [sales, setSales] = useState([]);
  const [todayOnly, setTodayOnly] = useState(true);

  const fetchData = async () => {
    const today = new Date().toISOString().split("T")[0];
    const res = await axios.get(`http://localhost:3001/api/reports${todayOnly ? `?date=${today}` : ""}`);
    setSales(res.data);
  };

  useEffect(() => {
    fetchData();
  }, [todayOnly]);

  const summary = sales.reduce(
    (acc, s) => {
      acc.total += s.total;
      acc.kdv += s.kdv;
      acc.servis += s.servis;
      return acc;
    },
    { total: 0, kdv: 0, servis: 0 }
  );

  const downloadExcel = () => {
    window.open("http://localhost:3001/api/reports/excel", "_blank");
  };

  return (
  
    <div className="p-4">
      <BackButton />
      <h2 className="text-2xl font-bold mb-4">Satış Raporu</h2>

      <div className="mb-4 flex items-center gap-4">
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
      </div>

      <div className="mb-4">
        <p><strong>Toplam Satış:</strong> {summary.total.toFixed(2)} ₺</p>
        <p><strong>KDV:</strong> {summary.kdv.toFixed(2)} ₺</p>
        <p><strong>Servis:</strong> {summary.servis.toFixed(2)} ₺</p>
      </div>

      <div className="border-t pt-4">
        {sales.map((s, i) => (
          <div key={i} className="mb-3 border-b pb-2">
            <p><strong>Masa:</strong> {s.tableId}</p>
            <p><strong>Toplam:</strong> {s.total.toFixed(2)} ₺ - {s.paymentMethod}</p>
            <p className="text-sm text-gray-600">{new Date(s.date).toLocaleString()}</p>
            <ul className="ml-4 list-disc text-sm">
              {s.orders.map((o, j) => (
                <li key={j}>{o.name} x{o.qty} - {o.price * o.qty} ₺</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
