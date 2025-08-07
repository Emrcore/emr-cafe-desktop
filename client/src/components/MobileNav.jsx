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
  Bell,
  ClipboardList,
} from "lucide-react";

export default function MobileNav() {
  const { pathname } = useLocation();
  const { user } = useContext(AuthContext);

  // Menü veya mutfak ekranı ise nav gizle
  if (pathname === "/menu" || pathname === "/kitchen") return null;

  // 🔸 Mutfak kullanıcısı için sadece mutfak sayfası
  if (user?.role === "mutfak") {
    return (
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900 border-t border-slate-700 h-16 flex justify-around items-center">
        <MobileLink path="/kitchen" label="Mutfak" icon={<UtensilsCrossed size={20} />} />
      </nav>
    );
  }

  // 🔸 Garson için sadece masalar ve çağrılar
  if (user?.role === "garson") {
    return (
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900 border-t border-slate-700 h-16 flex justify-around items-center">
        <MobileLink path="/tables" label="Masalar" icon={<LayoutGrid size={20} />} />
        <MobileLink path="/waiter-calls" label="Çağrılar" icon={<Bell size={20} />} />
      </nav>
    );
  }

  // 🔸 Diğer roller (admin, muhasebe)
  const navItems = [
    { path: "/tables", label: "Masalar", icon: <LayoutGrid size={20} /> },
    { path: "/report", label: "Rapor", icon: <FileText size={20} /> },
    { path: "/users", label: "Kullanıcılar", icon: <Users size={20} /> },
    { path: "/settings", label: "Ayarlar", icon: <Settings size={20} /> },
  ];

  if (user?.role === "admin") {
    navItems.push(
      { path: "/report-advanced", label: "G. Rapor", icon: <BarChart2 size={20} /> },
      { path: "/admin/logs", label: "Loglar", icon: <ClipboardList size={20} /> },
      { path: "/admin", label: "Admin", icon: <Shield size={20} /> }
    );
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900 border-t border-slate-700 h-16 flex justify-around items-center">
      {navItems.map((item) => (
        <MobileLink key={item.path} {...item} />
      ))}
    </nav>
  );
}

// 🔧 Ortak alt bileşen
function MobileLink({ path, label, icon }) {
  const { pathname } = useLocation();
  const isActive = pathname === path;

  return (
    <Link
      to={path}
      className={`flex flex-col items-center justify-center transition-all duration-200 relative ${
        isActive
          ? "text-blue-500 font-bold"
          : "text-gray-400 hover:text-blue-400"
      }`}
    >
      {icon}
      <span className="text-[10px] mt-1">{label}</span>
      {isActive && (
        <span className="absolute top-0 left-0 w-full h-1 bg-blue-500 rounded-t-lg animate-pulse" />
      )}
    </Link>
  );
}
