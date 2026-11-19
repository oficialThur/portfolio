import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  // A sessão vive num cookie httpOnly; o navegador envia sozinho.
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && window.location.pathname !== "/login") {
      window.location.assign("/login");
    }
    return Promise.reject(error);
  },
);

export default api;
