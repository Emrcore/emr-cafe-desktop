import axios from "axios";

const getBaseURL = () => {
  const host = window.location.hostname;

  // E�er subdomain yap�s� do�ruysa: �rn. x.cafe.emrcore.com.tr
  if (host.endsWith(".cafe.emrcore.com.tr")) {
    return `https://${host}/api`;
  }

  return "/api"; // fallback (localhost gibi durumlar)
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
