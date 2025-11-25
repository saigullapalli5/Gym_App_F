import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/auth";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Spinner } from "../";
import { toast } from "react-hot-toast";
import { API_URL } from "../../config";
import axios from "axios";

// Helper to get cookie by name
const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return null;
};

const PrivateRoute = ({ adminOnly = false }) => {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const { auth, setAuth } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        setLoading(true);

        // Declare storedAuth from localStorage
        const storedAuth = JSON.parse(localStorage.getItem("auth") || "{}");

        // 1. Strictly check for token in cookies first
        let token = getCookie("auth_token");

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

        // Use token from localStorage if cookie is missing
        if (!token && storedAuth?.token) {
          token = storedAuth.token;
          // Update cookie if it was missing
          document.cookie = `auth_token=${token}; path=/; max-age=${
            7 * 24 * 60 * 60
          }; SameSite=Strict`;
        }

        // 2. Verify token with backend
        const response = await axios.get(`${API_URL}/api/v1/auth/user-auth`, {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.data.success) {
          const userData = response.data.user;
          const isAdminUser = userData.role === 1 || userData.isAdmin;

          // 3. Check admin access if required
          if (adminOnly && !isAdminUser) {
            throw new Error("Admin access required");
          }

          // 4. Update auth context with fresh data
          setAuth({
            user: {
              ...userData,
              isAdmin: isAdminUser,
            },
            token,
            loading: false,
          });

          setAuthorized(true);
        } else {
          throw new Error(response.data.message || "Authentication failed");
        }
      } catch (error) {
        console.error("Authentication check failed:", error);

        // Clear any existing auth data
        setAuth({ user: null, token: null });
        localStorage.removeItem("auth");
        document.cookie =
          "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";

        // Don't show toast for missing token (handled by redirect)
        if (error.message !== "No authentication token found") {
          let errorMessage =
            error.response?.data?.message ||
            error.message ||
            "Authentication failed";
          if (error.response?.status === 403) {
            errorMessage = "You don't have permission to access this page";
          }
          toast.error(errorMessage);
        }

        // Always redirect to login for any auth error
        navigate("/login", {
          state: {
            from: location.pathname,
            message: "Please log in to continue",
          },
          replace: true,
        });
      } finally {
        setLoading(false);
      }
    };

    verifyAuth();
  }, [auth?.token, setAuth, navigate, location.pathname]);

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  // Show unauthorized message briefly before redirect
  if (!authorized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-lg font-medium mb-4">
          {adminOnly ? "Admin access required" : "Authentication required"}
        </p>
        <p>Redirecting to login...</p>
      </div>
    );
  }

  // Render protected content
  return <Outlet />;
};

export default PrivateRoute;
