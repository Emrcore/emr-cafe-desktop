import axios from "axios";

const getBaseURL = () => {
  const host = window.location.hostname;

  // ? Ger�ek subdomain yap�s�: x.cafe.emrcore.com.tr
  if (host.endsWith(".cafe.emrcore.com.tr")) {
    return `https://${host}/api`;
  }

  // ?? Yerel geli�tirme ortam� i�in fallback
  return "http://localhost:3001/api";
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
