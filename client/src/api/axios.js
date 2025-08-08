import axios from "axios";

// Subdomain'den tenant çýkar (örn: demo.cafe.emrcore.com.tr › "demo")
const getTenantId = () => {
  const host = window.location?.hostname || "";
  return host.endsWith(".cafe.emrcore.com.tr") ? host.split(".")[0] : null;
};

// Baz URL'yi belirle (Electron > Prod Web > Dev)
const getBaseURL = () => {
  // 1) Electron: preload üzerinden ip-config.json'daki serverUrl
  const electronUrl = window.electronAPI?.getServerUrl?.();
  if (electronUrl) {
    return `${electronUrl.replace(/\/+$/, "")}/api`; // sona /api ekle
  }

  // 2) Prod Web (subdomain)
  const host = window.location?.hostname || "";
  if (host.endsWith(".cafe.emrcore.com.tr")) {
    return `https://${host}/api`;
  }

  // 3) Dev fallback
  return "http://localhost:3001/api";
};

const instance = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true,
  headers: {
    "Cache-Control": "no-cache",
    Pragma: "no-cache",
    Expires: "0",
  },
});

// Her isteðe tenant header ekle (sadece prod subdomain'de anlamlý)
instance.interceptors.request.use((config) => {
  const tenantId = getTenantId();
  if (tenantId) {
    config.headers["x-tenant-id"] = tenantId;
  }
  return config;
});

// Abonelik süresi dolduysa yönlendir
instance.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 403) {
      window.location.href = "/subscription-expired";
    }
    return Promise.reject(err);
  }
);

export default instance;
