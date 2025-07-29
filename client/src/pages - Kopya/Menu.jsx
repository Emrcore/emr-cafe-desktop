import { useEffect, useState } from "react";
import axios from "axios";

export default function Menu() {
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("Tümü");

  useEffect(() => {
    axios.get("http://localhost:3001/api/products").then((res) => setProducts(res.data));
  }, []);

  const categories = ["Tümü", ...new Set(products.map((p) => p.category || "Genel"))];
  const filtered = selectedCategory === "Tümü"
    ? products
    : products.filter((p) => p.category === selectedCategory);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Menü</h2>

      <div className="flex flex-wrap gap-2 mb-4">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1 rounded border ${
              selectedCategory === cat ? "bg-blue-600 text-white" : "bg-white text-gray-700"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <ul>
        {filtered.map((p) => (
          <li key={p.id} className="border-b py-2">
            <div className="font-medium">{p.name}</div>
            <div className="text-sm text-gray-500">{p.price}₺ — {p.category}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
