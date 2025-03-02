import axios from "axios";
import { getServerSession } from "next-auth";
import { getSession } from "next-auth/react";
import { APP_ROUTES } from "./routes";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

const api = axios.create({
  baseURL: BASE_URL + "/api/v1",
  timeout: 10000,
});

api.interceptors.request.use(
  async (config) => {
    // Get the session (works in both client and server components)
    let session;

    if (typeof window !== undefined) {
      session = await getSession();
    } else {
      session = await getServerSession();
    }

    if (session?.accessToken) {
      config.headers.Authorization = `Bearer ${session.accessToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (typeof window === "undefined") {
        return Promise.reject(error);
      } else {
        window.location.href = APP_ROUTES.LOGIN;
      }
    }
    return Promise.reject(error);
  }
);

export default api;
