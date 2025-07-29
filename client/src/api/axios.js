import axios from "axios";

// ? Sunucunun bulunduðu subdomain üzerinden baðlanýr
const instance = axios.create({
  baseURL: "/api",
});

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 403) {
      window.location.href = "/subscription-expired"; // abonelik bitmiþse
    }
    return Promise.reject(error);
  }
);

export default instance;
