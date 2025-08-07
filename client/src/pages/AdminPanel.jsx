import BackButton from "../components/BackButton";
import { Link } from "react-router-dom";
import DarkModeToggle from "../components/DarkModeToggle";
import {
  LayoutGrid,
  Boxes,
  Image,
  Users,
  Settings,
  FileText,
} from "lucide-react";
import { motion } from "framer-motion";

const adminLinks = [
  { to: "/admin/tables", label: "Masa Yönetimi", icon: <LayoutGrid size={24} /> },
  { to: "/admin/products", label: "Ürün Yönetimi", icon: <Boxes size={24} /> },
  { to: "/admin/images", label: "Ürün Görselleri", icon: <Image size={24} /> },
  { to: "/users", label: "Kullanıcılar", icon: <Users size={24} /> },
  { to: "/settings", label: "Ayarlar", icon: <Settings size={24} /> },
  { to: "/report", label: "Raporlar", icon: <FileText size={24} /> },
];

export default function AdminPanel() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 to-slate-900 p-4 text-white">
      <div className="flex justify-between items-center mb-6">
        <BackButton />
        <h2 className="text-2xl font-bold">🛠️ Admin Paneli</h2>
        <DarkModeToggle />
      </div>

      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
        {adminLinks.map((link) => (
          <motion.div
            key={link.to}
            whileHover={{ scale: 1.05 }}
            className="bg-slate-800 border border-slate-700 rounded-xl shadow-md hover:shadow-xl transition-all"
          >
            <Link
              to={link.to}
              className="flex flex-col items-center justify-center p-6 h-full text-center hover:bg-slate-700 rounded-xl"
            >
              <div className="mb-3 text-blue-400">{link.icon}</div>
              <span className="text-lg font-medium">{link.label}</span>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
