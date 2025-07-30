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
import { AuthProvider } from "./context/AuthContext";
import RequireAuth from "./components/RequireAuth";
import RequireTenant from "./components/RequireTenant";
import AdminTables from "./pages/AdminTables";
import SubscriptionExpired from "./pages/SubscriptionExpired";
import AdminProducts from "./pages/AdminProducts";
import Menu from "./pages/Menu";
import AdminPanel from "./pages/AdminPanel";
import ReportAdvanced from "./pages/ReportAdvanced";
import ToasterProvider from "./components/ToasterProvider";
import toast from "react-hot-toast";
import TenantLogin from "./pages/TenantLogin";

function RedirectToStart() {
  const navigate = useNavigate();

  useEffect(() => {
    const tenant = localStorage.getItem("tenant_url");
    const user = localStorage.getItem("user");

    if (!tenant) {
      navigate("/tenant", { replace: true });
      return;
    }

    if (!user) {
      navigate("/login", { replace: true });
      return;
    }

    // Eğer her şey tamamsa tables'a gönder
    navigate("/tables", { replace: true });
  }, [navigate]);

  return null;
}

function AppRoutes() {
  const location = useLocation();
  const hideNav =
    location.pathname === "/login" || location.pathname === "/tenant";

  useEffect(() => {
    const api = window.electronAPI;
    if (api?.onUpdateAvailable) {
      api.onUpdateAvailable(() => {
        toast("Yeni güncelleme mevcut. İndiriliyor...");
      });
    }

    if (api?.onUpdateDownloaded) {
      api.onUpdateDownloaded(() => {
        toast.success("Güncelleme indirildi. Uygulama yeniden başlatılıyor...");
        setTimeout(() => {
          api.quitAndInstall?.();
        }, 3000);
      });
    }
  }, []);

  return (
    <div className="pb-16 min-h-screen bg-gray-50 dark:bg-gray-900">
      <Routes>
        <Route path="/" element={<RedirectToStart />} /> {/* 🔁 giriş kontrolü */}
        <Route path="/tenant" element={<TenantLogin />} />
        <Route path="/login" element={<Login />} />
        <Route path="/subscription-expired" element={<SubscriptionExpired />} />
        <Route path="/menu" element={<Menu />} />

        {/* Yetkili sayfalar */}
        <Route
          path="/tables"
          element={
            <RequireTenant>
              <RequireAuth>
                <Tables />
              </RequireAuth>
            </RequireTenant>
          }
        />
        <Route
          path="/table/:id"
          element={
            <RequireTenant>
              <RequireAuth>
                <TableDetail />
              </RequireAuth>
            </RequireTenant>
          }
        />
        <Route
          path="/users"
          element={
            <RequireTenant>
              <RequireAuth>
                <UserManagement />
              </RequireAuth>
            </RequireTenant>
          }
        />
        <Route
          path="/settings"
          element={
            <RequireTenant>
              <RequireAuth>
                <Settings />
              </RequireAuth>
            </RequireTenant>
          }
        />
        <Route
          path="/admin/images"
          element={
            <RequireTenant>
              <RequireAuth>
                <AdminImages />
              </RequireAuth>
            </RequireTenant>
          }
        />
        <Route
          path="/report"
          element={
            <RequireTenant>
              <RequireAuth>
                <Report />
              </RequireAuth>
            </RequireTenant>
          }
        />
        <Route
          path="/admin/tables"
          element={
            <RequireTenant>
              <RequireAuth>
                <AdminTables />
              </RequireAuth>
            </RequireTenant>
          }
        />
        <Route
          path="/admin/products"
          element={
            <RequireTenant>
              <RequireAuth>
                <AdminProducts />
              </RequireAuth>
            </RequireTenant>
          }
        />
        <Route
          path="/admin"
          element={
            <RequireTenant>
              <RequireAuth>
                <AdminPanel />
              </RequireAuth>
            </RequireTenant>
          }
        />
        <Route
          path="/report-advanced"
          element={
            <RequireTenant>
              <RequireAuth>
                <ReportAdvanced />
              </RequireAuth>
            </RequireTenant>
          }
        />
        <Route
          path="*"
          element={
            <h1 className="p-10 text-center text-red-600 text-xl">
              404 — Sayfa bulunamadı
            </h1>
          }
        />
      </Routes>
      {!hideNav && <MobileNav />}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <ToasterProvider />
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}
