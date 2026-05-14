import axios from "axios";

import axios from "axios";

// Get API URL from environment variable, with proper fallbacks
const getApiUrl = () => {
  // Production (Vercel): Use environment variable
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/$/, ""); // Remove trailing slash
  }
  
  // Development: Use localhost with Vite proxy
  if (import.meta.env.MODE === "development") {
    return "http://localhost:5000";
  }
  
  // Fallback (should not reach here if env is set properly)
  return "https://find-event-platform.onrender.com";
};

const API_URL = getApiUrl();

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

// Log in development to debug
if (import.meta.env.MODE === "development") {
  console.log("🔍 API URL (dev):", API_URL);
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const data = error.response?.data;

    const normalizedError = {
      message: data?.message || error.message || "An error occurred",
      status: error.response?.status,
      fields: data?.errors || [],
    };

    return Promise.reject(normalizedError);
  },
);

export default api;
