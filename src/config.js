// Base URL for API requests - using environment variable
export const API_URL =
  import.meta.env.VITE_BASE_URL || "https://gym-app-b.onrender.com";

// You can add other configuration constants here as needed
export default {
  API_URL,
};
