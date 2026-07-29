import axios from "axios";

const getBaseUrl = () => {
  if (typeof window !== "undefined") {
    const envUrl = process.env.NEXT_PUBLIC_API_URL;
    // If NEXT_PUBLIC_API_URL is missing or set to localhost in browser production, use relative /api/v1
    if (!envUrl || envUrl.includes("localhost:4000")) {
      return "/api/v1";
    }
    return envUrl;
  }
  return process.env.NEXT_PUBLIC_API_URL ?? "/api/v1";
};

export const api = axios.create({
  baseURL: getBaseUrl(),
  withCredentials: true
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("accessToken");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
