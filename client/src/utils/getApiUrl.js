// Shared helper to get API base URL at runtime
export const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_URL && import.meta.env.VITE_API_URL !== "/api") {
    return import.meta.env.VITE_API_URL;
  }
  return "/api";
};
