import axios from "axios";
import Cookies from "js-cookie";
import { BASE_URL } from "./api_url";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    // Get token from Cookie or localStorage fallback
    const token =
      Cookies.get("token") ||
      (typeof window !== "undefined" ? localStorage.getItem("token") : null);

    if (token) {
      // Set x-access-token directly without Bearer
      config.headers["x-access-token"] = token;
      
      // Remove default Authorization header if it was set
      delete config.headers.Authorization;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      Cookies.remove("token");
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        
        // Redirect if unauthorized
        if (
          !window.location.pathname.startsWith("/auth") &&
          !window.location.pathname.startsWith("/unauthorized")
        ) {
          window.location.href =
            "/unauthorized?message=At first login then you access product&redirectTo=/product";
        }
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;