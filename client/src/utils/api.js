import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  timeout: 30000,
});

// Pick correct token based on current page
const getToken = () => {
  const isAdmin = window.location.pathname.startsWith("/admin");
  if (isAdmin) {
    return localStorage.getItem("learnify-admin-token");
  }
  return localStorage.getItem("learnify-student-token");
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
