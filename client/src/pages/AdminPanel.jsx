// Güncellenmiş AdminPanel Sayfası: src/pages/AdminPanel.jsx
import BackButton from "../components/BackButton";
import { Link } from "react-router-dom";
import DarkModeToggle from "../components/DarkModeToggle";

const adminLinks = [
  { to: "/admin/tables", label: "Masa Yönetimi" },
  { to: "/admin/products", label: "Ürün Yönetimi" },
  { to: "/admin/images", label: "Ürün Görselleri" },
  { to: "/users", label: "Kullanıcılar" },
  { to: "/settings", label: "Ayarlar" },
  { to: "/report", label: "Raporlar" },
];

export default function AdminPanel() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      <BackButton />
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold dark:text-white">Admin Paneli</h2>
        <DarkModeToggle />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {adminLinks.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className="p-4 rounded-lg shadow bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 font-medium hover:bg-blue-50 dark:hover:bg-gray-700 transition"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}