import axios from "axios";

export const api = axios.create({
  baseURL: "/api/v1",
  withCredentials: true
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    // If baseURL is missing or points to localhost:4000 on production host, use relative /api/v1
    if (!config.baseURL || config.baseURL.includes("localhost:4000")) {
      config.baseURL = "/api/v1";
    }
    const token = localStorage.getItem("accessToken");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
