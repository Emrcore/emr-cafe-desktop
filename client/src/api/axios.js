import axios from "axios";

// ? Sunucunun bulundu�u subdomain �zerinden ba�lan�r
const instance = axios.create({
  baseURL: "/api",
});

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 403) {
      window.location.href = "/subscription-expired"; // abonelik bitmi�se
    }
    return Promise.reject(error);
  }
);

export default instance;
