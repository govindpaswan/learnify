import axios from "axios";

// In production (Render), frontend is served by Express
// So API is on same domain → just use /api
// In development, Vite proxy handles /api → localhost:5000
const BASE_URL = import.meta.env.VITE_API_URL || "/api";

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 60000,
});

// Pick correct token based on current page
const getToken = () => {
  const isAdmin = window.location.pathname.startsWith("/admin");
  return isAdmin
    ? localStorage.getItem("learnify-admin-token")
    : localStorage.getItem("learnify-student-token");
};

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      const isAdmin = window.location.pathname.startsWith("/admin");
      if (isAdmin) {
        localStorage.removeItem("learnify-admin-token");
        window.location.href = "/admin/login";
      } else {
        localStorage.removeItem("learnify-student-token");
        window.location.href = "/login";
      }
    }
    return Promise.reject(err);
  }
);

export default api;
