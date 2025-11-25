import axios from "axios";
import { toast } from "react-hot-toast";
// Base URL for API requests
export const BASE_URL = "http://localhost:5000";

// Create axios instance with default config
const api = axios.create({
  baseURL: `${BASE_URL}/api/v1`,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const auth = JSON.parse(localStorage.getItem("auth") || "{}");
    const token = auth?.token;

    // If token exists, add it to the headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Attempt to refresh token
        const response = await axios.post(
          `${BASE_URL}/api/v1/auth/refresh-token`,
          {},
          { withCredentials: true }
        );

        if (response.data?.success) {
          const { token, user } = response.data;

          // Update stored auth data
          const authData = {
            user,
            token,
            timestamp: new Date().toISOString(),
          };
          localStorage.setItem("auth", JSON.stringify(authData));

          // Update the Authorization header
          originalRequest.headers.Authorization = `Bearer ${token}`;

          // Retry the original request
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
        // Redirect to login if refresh fails
        if (window.location.pathname !== "/login") {
          localStorage.removeItem("auth");
          window.location.href = "/login";
        }
      }

      return Promise.reject(error);
    }

    // Handle other errors
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const errorMessage = error.response.data?.message || "An error occurred";

      // Don't show toast for 401 errors (handled above)
      if (error.response.status !== 401) {
        toast.error(errorMessage);
      }

      if (error.response.status === 403) {
        // Handle forbidden access
        console.error("Forbidden access:", errorMessage);
      } else if (error.response.status >= 500) {
        // Handle server errors
        console.error("Server error:", errorMessage);
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error("No response from server:", error.request);
      toast.error(
        "Unable to connect to the server. Please check your connection."
      );
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error("Request error:", error.message);
      toast.error("An error occurred while processing your request.");
    }

    return Promise.reject(error);
  }
);

export default api;
