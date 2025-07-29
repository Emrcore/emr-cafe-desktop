import axios from "axios";

const getBaseURL = () => {
  const saved = localStorage.getItem("tenant_url");
  if (saved) return saved + "/api";

  // Eðer .cafe.emrcore.com.tr altýndaysa subdomain çýkar
  const host = window.location.hostname;
  if (host.endsWith(".cafe.emrcore.com.tr")) {
    return `https://${host}/api`;
  }

  return "/api"; // fallback
};

const instance = axios.create({
  baseURL: getBaseURL(),
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
