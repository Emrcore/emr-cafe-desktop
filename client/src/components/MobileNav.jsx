import { Link, useLocation } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import {
  LayoutGrid,
  FileText,
  Users,
  Settings,
  Shield,
  BarChart2,
  UtensilsCrossed,
} from "lucide-react";

export default function MobileNav() {
  const { pathname } = useLocation();
  const { user } = useContext(AuthContext);

  // Menü ve mutfak ekranlarında nav gizle
  if (pathname === "/menu" || pathname === "/kitchen") return null;

  // Eğer mutfak kullanıcısıysa, sadece mutfak menüsü gösterilsin
  if (user?.role === "mutfak") {
    return (
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-700 shadow-md flex justify-around items-center h-16 z-50">
        <Link
          to="/kitchen"
          className={`flex flex-col items-center justify-center h-full px-3 transition-all ${
            pathname === "/kitchen"
              ? "text-blue-600 dark:text-blue-400 font-semibold"
              : "text-gray-500 dark:text-gray-300"
          }`}
        >
          <UtensilsCrossed size={18} />
          <span className="text-xs">Mutfak</span>
        </Link>
      </nav>
    );
  }

  // Diğer roller için varsayılan menü
  const navItems = [
    { path: "/tables", label: "Masalar", icon: <LayoutGrid size={18} /> },
    { path: "/report", label: "Rapor", icon: <FileText size={18} /> },
    { path: "/users", label: "Kullanıcılar", icon: <Users size={18} /> },
    { path: "/settings", label: "Ayarlar", icon: <Settings size={18} /> },
  ];

  if (user?.role === "admin") {
    navItems.push(
      {
        path: "/report-advanced",
        label: "G. Rapor",
        icon: <BarChart2 size={18} />,
      },
      { path: "/admin", label: "Admin", icon: <Shield size={18} /> }
    );
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-700 shadow-md flex justify-around items-center h-16 z-50">
      {navItems.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          className={`flex flex-col items-center justify-center h-full px-3 transition-all ${
            pathname === item.path
              ? "text-blue-600 dark:text-blue-400 font-semibold"
              : "text-gray-500 dark:text-gray-300"
          }`}
        >
          {item.icon}
          <span className="text-xs">{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}
