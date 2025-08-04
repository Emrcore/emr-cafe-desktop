import axios from "axios";

// ?? Subdomain'den tenant çýkar (örn: demo.cafe.emrcore.com.tr › demo)
const getTenantId = () => {
  const host = window.location.hostname;
  if (host.endsWith(".cafe.emrcore.com.tr")) {
    return host.split(".")[0]; // "demo"
  }
  return null; // localhost veya geçersiz durumlar
};

const getBaseURL = () => {
  const host = window.location.hostname;
  if (host.endsWith(".cafe.emrcore.com.tr")) {
    return `https://${host}/api`;
  }
  return "/api"; // localhost için fallback
};

const instance = axios.create({
  baseURL: getBaseURL(),
  headers: {
    "Cache-Control": "no-cache",
    Pragma: "no-cache",
    Expires: "0",
  },
});

// ? Her isteðe tenant header ekle
instance.interceptors.request.use((config) => {
  const tenantId = getTenantId();
  if (tenantId) {
    config.headers["x-tenant-id"] = tenantId;
  }
  return config;
});

// ? Abonelik süresi dolduysa yönlendir
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
