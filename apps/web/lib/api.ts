import axios from "axios";
import { handleMockRoute } from "./mockStore";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1",
  withCredentials: true
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("accessToken");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If backend server is unreachable (Network Error / CORS / ECONNREFUSED)
    if (!error.response || error.code === "ERR_NETWORK" || error.message.includes("Network Error")) {
      const config = error.config || {};
      const method = (config.method || "get").toLowerCase();
      const url = config.url || "";
      const reqData = config.data ? JSON.parse(config.data) : undefined;

      console.warn(`[Sandbox Fallback] API server unreachable for ${method.toUpperCase()} ${url}. Using mock store.`);
      
      const mockResult = handleMockRoute(method, url, reqData);
      return Promise.resolve({
        data: mockResult,
        status: 200,
        statusText: "OK",
        headers: {},
        config: config
      });
    }
    return Promise.reject(error);
  }
);

