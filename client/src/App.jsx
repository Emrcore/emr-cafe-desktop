import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  useNavigate,
} from "react-router-dom";
import Tables from "./pages/Tables";
import AdminImages from "./pages/AdminImages";
import TableDetail from "./pages/TableDetail";
import UserManagement from "./pages/UserManagement";
import Settings from "./pages/Settings";
import Report from "./pages/Report";
import Login from "./pages/Login";
import MobileNav from "./components/MobileNav";
import { AuthProvider, useAuth } from "./context/AuthContext";
import RequireAuth from "./components/RequireAuth";
import AdminTables from "./pages/AdminTables";
import SubscriptionExpired from "./pages/SubscriptionExpired";
import AdminProducts from "./pages/AdminProducts";
import Menu from "./pages/Menu";
import AdminPanel from "./pages/AdminPanel";
import ReportAdvanced from "./pages/ReportAdvanced";
import ToasterProvider from "./components/ToasterProvider";
import toast from "react-hot-toast";
import TenantLogin from "./pages/TenantLogin";

function AppRoutes() {
  const location = useLocation();
  const hideNav = ["/login", "/tenant"].includes(location.pathname);
  const { user } = useAuth();

  useEffect(() => {
    const api = window.electronAPI;
    if (api?.onUpdateAvailable) {
      api.onUpdateAvailable(() => toast("Yeni güncelleme mevcut. İndiriliyor..."));
    }

    if (api?.onUpdateDownloaded) {
      api.onUpdateDownloaded(() => {
        toast.success("Güncelleme indirildi. Uygulama yeniden başlatılıyor...");
        setTimeout(() => api.quitAndInstall?.(), 3000);
      });
    }
  }, []);

  return (
    <div className="pb-16 min-h-screen bg-gray-50 dark:bg-gray-900">
      <Routes>
        <Route path="/tenant" element={<TenantLogin />} />
        <Route path="/login" element={<Login />} />
        <Route path="/subscription-expired" element={<SubscriptionExpired />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/report-advanced" element={<RequireAuth><ReportAdvanced /></RequireAuth>} />
        <Route path="/table/:id" element={<RequireAuth><TableDetail /></RequireAuth>} />
        <Route path="/users" element={<RequireAuth><UserManagement /></RequireAuth>} />
        <Route path="/settings" element={<RequireAuth><Settings /></RequireAuth>} />
        <Route path="/admin/images" element={<RequireAuth><AdminImages /></RequireAuth>} />
        <Route path="/report" element={<RequireAuth><Report /></RequireAuth>} />
        <Route path="/admin/tables" element={<RequireAuth><AdminTables /></RequireAuth>} />
        <Route path="/admin/products" element={<RequireAuth><AdminProducts /></RequireAuth>} />
        <Route path="/admin" element={<RequireAuth><AdminPanel /></RequireAuth>} />
        <Route path="/" element={<RequireAuth><Tables /></RequireAuth>} />
        <Route path="*" element={<h1 className="p-10 text-center text-red-600 text-xl">404 — Sayfa bulunamadı</h1>} />
      </Routes>
      {!hideNav && <MobileNav />}
    </div>
  );
}

function TenantAndLoginRedirect() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const tenant = localStorage.getItem("tenant_url");

  useEffect(() => {
    if (!tenant) {
      navigate("/tenant");
    } else if (!user) {
      navigate("/login");
    }
  }, [tenant, user, navigate]);

  return null;
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <ToasterProvider />
        <TenantAndLoginRedirect />
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}
