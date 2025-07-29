import { useEffect, useState } from "react";
import BackButton from "../components/BackButton";
import axios from "axios";

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ name: "", price: "", category: "" });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const res = await axios.get("http://localhost:3001/api/products");
    setProducts(res.data);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const addProduct = async () => {
    if (!form.name || !form.price) return;
    await axios.post("http://localhost:3001/api/products", form);
    setForm({ name: "", price: "", category: "" });
    fetchProducts();
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("Bu ürünü silmek istediğinize emin misiniz?")) return;
    await axios.delete(`http://localhost:3001/api/products/${id}`);
    fetchProducts();
  };

  return (
    <div className="p-4">
        <BackButton />
      <h2 className="text-xl font-bold mb-4">Ürün Yönetimi</h2>

      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Ürün adı"
          className="border p-2 flex-1"
        />
        <input
          name="price"
          type="number"
          value={form.price}
          onChange={handleChange}
          placeholder="Fiyat"
          className="border p-2 w-32"
        />
        <input
          name="category"
          value={form.category}
          onChange={handleChange}
          placeholder="Kategori"
          className="border p-2 w-40"
        />
        <button onClick={addProduct} className="bg-green-600 text-white px-4 py-2 rounded">
          Ekle
        </button>
      </div>

      <ul>
        {products.map((p) => (
          <li key={p.id} className="flex justify-between items-center border-b py-2">
            <span>{p.name} - {p.price}₺ [{p.category}]</span>
            <button
              onClick={() => deleteProduct(p.id)}
              className="bg-red-500 text-white px-2 py-1 rounded text-sm"
            >
              Sil
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
