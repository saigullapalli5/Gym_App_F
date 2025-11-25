import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/auth";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Spinner } from "../";
import { toast } from "react-hot-toast";
import { API_URL } from "../../config";
import { clearAuthCookies } from "../../utils/cookieUtils";

// Helper to get cookie by name
const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return null;
};

const AdminRoute = () => {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const { auth, setAuth, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Declare storedAuth from localStorage
  const storedAuth = JSON.parse(localStorage.getItem("auth") || "{}");

  // Handle unauthorized access
  const handleUnauthorized = useCallback(async () => {
    try {
      // Clear all auth data

      clearAuthCookies();
      localStorage.removeItem("auth");

      // Redirect to login with current location for post-login redirect
      navigate("/login", {
        state: { from: location.pathname },
        replace: true,
      });

      return false;

      // Clear all possible storage
      localStorage.clear();
      sessionStorage.clear();

      // Clear indexedDB if needed
      if (window.indexedDB && window.indexedDB.databases) {
        try {
          const dbs = await window.indexedDB.databases();
          dbs.forEach((db) => {
            if (db.name) {
              window.indexedDB.deleteDatabase(db.name);
            }
          });
        } catch (error) {
          console.warn("Error clearing IndexedDB:", error);
        }
      }

      // Clear service worker caches
      if ("caches" in window) {
        try {
          const cacheNames = await caches.keys();
          await Promise.all(
            cacheNames.map((cacheName) => caches.delete(cacheName))
          );
        } catch (error) {
          console.warn("Error clearing caches:", error);
        }
      }

      // Clear all cookies one more time
      document.cookie.split(";").forEach((cookie) => {
        const name = cookie.split("=")[0].trim();
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${window.location.hostname}`;
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=.${window.location.hostname}`;
      });

      // Reset auth state
      setAuth({ user: null, token: null });

      // Force clear any remaining cookies by redirecting with timestamp to prevent caching
      const timestamp = new Date().getTime();
      window.location.href = `/login?t=${timestamp}`;
    } catch (error) {
      console.error("Error during logout cleanup:", error);
      // Still try to redirect even if cleanup fails
      window.location.href = "/login";
    }
  }, [setAuth]);

  useEffect(() => {
    const verifyAdmin = async () => {
      try {
        setLoading(true);

        // Strictly check for token in cookies
        const token = getCookie("auth_token");

        // If no token in cookies, clear everything and redirect to login
        if (!token) {
          console.log("No auth_token found in cookies, redirecting to login");
          // Clear any existing auth data
          localStorage.removeItem("auth");
          document.cookie =
            "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";

          navigate("/login", {
            state: { from: location.pathname },
            replace: true,
          });
          return;
        }
        // If no token anywhere, redirect to login immediately
        if (!token && (!storedAuth || !storedAuth.token)) {
          console.log("No token found, redirecting to login");
          navigate("/login", {
            state: { from: location.pathname },
            replace: true,
          });
          return;
        }

        // Use token from localStorage if cookie is missing
        if (!token && storedAuth?.token) {
          token = storedAuth.token;
          // Update cookie if it was missing
          document.cookie = `auth_token=${token}; path=/; max-age=${
            7 * 24 * 60 * 60
          }; SameSite=Strict`;
        }

        // 2. Verify token with backend
        const response = await fetch(`${API_URL}/api/v1/auth/user-auth`, {
          method: "GET",
          credentials: "include",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();

        if (data.success) {
          const userData = data.user;
          const isAdminUser = userData.role === 1 || userData.isAdmin;

          // 3. Verify admin access
          if (!isAdminUser) {
            throw new Error("Admin access required");
          }

          // 4. Update auth context without persisting to localStorage
          // We'll handle localStorage separately for admin data
          setAuth(
            {
              user: {
                ...userData,
                isAdmin: true,
              },
              token,
              loading: false,
            },
            false
          ); // false means don't persist to localStorage

          // Store only admin-specific data in localStorage
          const adminData = {
            admin: {
              _id: userData._id,
              name: userData.name,
              email: userData.email,
              role: userData.role,
              isAdmin: true,
            },
            token: token,
            isAdmin: true,
            timestamp: new Date().toISOString(),
          };

          // Store in localStorage
          localStorage.setItem("adminData", JSON.stringify(adminData));
          // Remove any regular user auth data
          localStorage.removeItem("auth");

          setAuthorized(true);
        } else {
          throw new Error(data.message || "Authentication failed");
        }
      } catch (error) {
        console.error("Error verifying admin:", error);
        setLoading(false);

        // Clear all auth data
        setAuth({ user: null, token: null });
        localStorage.removeItem("auth");
        localStorage.removeItem("adminData");
        clearAuthCookies();

        // Show error message
        let errorMessage =
          error.response?.data?.message ||
          error.message ||
          "Authentication failed";
        if (error.response?.status === 403) {
          errorMessage = "You don't have permission to access the admin panel";
        }
        toast.error(errorMessage);

        // Force redirect to login with full page reload
        window.location.href = "/login";
      } finally {
        setLoading(false);
      }
    };

    verifyAdmin();
  }, [auth?.token, setAuth, navigate, location.pathname]);

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner />
        <div className="ml-4">
          <p className="text-lg text-gray-700">Verifying admin access...</p>
          <p className="text-sm text-gray-500">
            Please wait while we verify your administrator privileges.
          </p>
        </div>
      </div>
    );
  }

  // Show unauthorized message briefly before redirect
  if (!authorized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
          <div className="text-red-500 mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 mx-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Access Denied
          </h2>
          <p className="text-gray-600 mb-6">
            You don't have permission to access the admin dashboard. Please
            contact the system administrator if you believe this is an error.
          </p>
          <button
            onClick={() => navigate("/")}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-150 ease-in-out"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  // Render admin content
  return <Outlet />;
};

export default AdminRoute;
