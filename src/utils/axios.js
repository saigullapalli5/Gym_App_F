import axios from "axios";
import { toast } from "react-hot-toast";

// Create axios instance with default config
const API = axios.create({
  baseURL:
    (import.meta.env.VITE_BASE_URL || "https://gym-app-b.onrender.com") +
    "/api/v1",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 30000, // 30 seconds
});

// Request interceptor - runs before each request
API.interceptors.request.use(
  (config) => {
    // Get auth from localStorage
    const auth = localStorage.getItem("auth");
    const token = auth ? JSON.parse(auth).token : null;

    // Set Authorization header if token exists
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handles responses and errors
API.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      // Clear auth data
      localStorage.removeItem("auth");

      // Only redirect if not already on login page
      if (window.location.pathname !== "/login") {
        // Store the current location to redirect back after login
        const returnTo = window.location.pathname + window.location.search;
        window.location.href = `/login?returnTo=${encodeURIComponent(
          returnTo
        )}`;
      }

      // Show error toast
      toast.error("Your session has expired. Please log in again.");
    }

    // Handle other errors
    const errorMessage = error.response?.data?.message || "An error occurred";

    // Show error toast for non-401 errors
    if (error.response?.status !== 401) {
      toast.error(errorMessage);

      console.error("API Error:", {
        status: error.response?.status,
        message: errorMessage,
        url: originalRequest?.url,
      });
    }

    return Promise.reject(error);
  }
);

// Add a method to set the auth token
API.setAuthToken = (token) => {
  if (token) {
    API.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    // Also update localStorage
    const auth = localStorage.getItem("auth");
    if (auth) {
      const authData = JSON.parse(auth);
      localStorage.setItem("auth", JSON.stringify({ ...authData, token }));
    }
  } else {
    delete API.defaults.headers.common["Authorization"];
    localStorage.removeItem("auth");
  }
};

export default API;
