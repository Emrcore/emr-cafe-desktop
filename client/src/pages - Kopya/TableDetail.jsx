import { useParams, useNavigate } from "react-router-dom";
import BackButton from "../components/BackButton";
import { useEffect, useState } from "react";
import axios from "axios";

export default function TableDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [table, setTable] = useState(null);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    axios.get(`http://localhost:3001/api/tables/${id}`).then((res) => setTable(res.data));
    axios.get(`http://localhost:3001/api/products`).then((res) => setProducts(res.data));
  }, [id]);

  const addProduct = (product) => {
    axios.post(`http://localhost:3001/api/tables/${id}/order`, product)
      .then((res) => setTable(res.data));
  };

  const removeProduct = (product) => {
    axios.post(`http://localhost:3001/api/tables/${id}/remove`, { id: product.id })
      .then((res) => setTable(res.data));
  };

  const handlePayment = (method) => {
    axios.post(`http://localhost:3001/api/tables/${id}/pay`, {
      paymentMethod: method
    }).then(() => {
      alert("Ödeme alındı!");
      navigate("/");
    });
  };

  const handlePrint = () => {
    axios.post(`http://localhost:3001/api/tables/${id}/print`).then((res) => {
      const relativePath = res.data.path; // örn: /data/adisyon-Masa1.pdf
      if (window.electronAPI?.printPDF) {
        window.electronAPI.printPDF(relativePath);
      } else {
        window.open(`http://localhost:3001${relativePath}`, "_blank");
      }
    });
  };

  if (!table) return <p>Yükleniyor...</p>;

  return (
    <div className="p-4">
        <BackButton />
      <h2 className="text-2xl font-bold mb-4">{table.name}</h2>

      <h3 className="font-bold mb-2">Siparişler</h3>
      {table.orders.map((order) => (
        <div key={order.id} className="flex justify-between mb-2 border-b pb-1">
          <div>{order.name} x{order.qty}</div>
          <div className="flex gap-2">
            <button onClick={() => removeProduct(order)} className="text-red-500">Sil</button>
          </div>
        </div>
      ))}

      {table.orders.length > 0 && (
        <div className="mt-6 flex flex-col gap-3">
          <div className="flex gap-4">
            <button
              onClick={() => handlePayment("nakit")}
              className="bg-green-600 text-white py-2 px-4 rounded"
            >
              Nakit Öde
            </button>
            <button
              onClick={() => handlePayment("kart")}
              className="bg-blue-600 text-white py-2 px-4 rounded"
            >
              Kartla Öde
            </button>
          </div>
          <button
            onClick={handlePrint}
            className="bg-gray-700 text-white py-2 px-4 rounded"
          >
            Adisyon Yazdır
          </button>
        </div>
      )}

      <h3 className="font-bold mt-6 mb-2">Ürünler</h3>
      <div className="grid grid-cols-2 gap-2">
        {products.map((p) => (
          <button key={p.id} onClick={() => addProduct(p)} className="p-2 bg-blue-100 rounded">
            {p.name} - {p.price}₺
          </button>
        ))}
      </div>
    </div>
  );
}
