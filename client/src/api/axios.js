import axios from "axios";

const isElectron = () =>
  !!(window && window.process && window.process.type);

const getTenantId = () => {
  const host = window.location?.hostname || "";
  return host.endsWith(".cafe.emrcore.com.tr") ? host.split(".")[0] : null;
};

const getBaseURL = () => {
  if (isElectron()) {
    const url = window.electronAPI?.getServerUrl?.();
    if (url) return `${url.replace(/\/+$/, "")}/api`;
  }
  const host = window.location?.hostname || "";
  if (host.endsWith(".cafe.emrcore.com.tr")) {
    return `https://${host}/api`;
  }
  return "http://localhost:3001/api";
};

export const getSocketBase = () => {
  if (isElectron()) {
    return window.electronAPI?.getServerUrl?.()?.replace(/\/+$/, "");
  }
  const host = window.location?.hostname || "";
  if (host.endsWith(".cafe.emrcore.com.tr")) {
    return `https://${host}`;
  }
  return "http://localhost:3001";
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

instance.interceptors.request.use((config) => {
  let tenantId = getTenantId();
  if (!tenantId && isElectron() && window.electronAPI?.getTenantId) {
    tenantId = window.electronAPI.getTenantId();
  }
  if (tenantId) {
    config.headers["x-tenant-id"] = tenantId;
  }
  return config;
});

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
