import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://investai-tww5.onrender.com/api",
});

export default api;