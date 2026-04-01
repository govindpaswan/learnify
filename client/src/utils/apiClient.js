import axios from "axios";

const apiClient = axios.create({
  baseURL: "https://learnify-server-lhub.onrender.com",
  withCredentials: true,
});

export default apiClient;
