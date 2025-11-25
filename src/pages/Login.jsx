import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/auth";
import { Input } from "../components";
import API from "../utils/axios";
import AOS from "aos";
import "aos/dist/aos.css";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { setAuth } = useAuth();

  // Function to set cookie
  const setCookie = (name, value, days) => {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    const expires = "expires=" + date.toUTCString();
    document.cookie = name + "=" + value + ";" + expires + ";path=/";
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const toastId = toast.loading('Signing in...');

    try {
      const res = await API.post("/auth/login", {
        email,
        password,
      });

      console.log("Login response:", res.data);

      if (res?.data?.success) {
        const { user, token, message } = res.data;

        // Validate required fields
        if (!user?._id || !token) {
          throw new Error("Invalid login response from server");
        }

        // Prepare user data with isAdmin flag
        const userData = {
          _id: user._id,
          name: user.name || "",
          email: user.email || "",
          role: user.role || 0,
          isAdmin: user.role === 1,
          city: user.city || "",
          contact: user.contact || ""
        };

        // Store auth data in localStorage and set cookie only during login
        const authData = {
          user: userData,
          token: token,
          timestamp: new Date().toISOString()
        };
        
        // Store in localStorage
        localStorage.setItem('auth', JSON.stringify(authData));
        
        // Set cookie with 7-day expiration only during login
        const expires = new Date();
        expires.setDate(expires.getDate() + 7);
        document.cookie = `auth_token=${token}; path=/; expires=${expires.toUTCString()}; secure; samesite=strict`;
        
        // Update auth context without triggering cookie storage
        setAuth({
          user: userData,
          token: token
        }, false);  // Pass false to prevent additional cookie storage

        // Show success message
        toast.success(message || "Login successful", { id: toastId });

        // Navigate based on role
        const redirectTo = user.role === 1 ? "/dashboard/admin" : "/dashboard/user";
        navigate(redirectTo, { replace: true });
        
      } else {
        throw new Error(res?.data?.message || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error(error.message || "Login failed. Please try again.", { id: toastId });
      
      // Clear any partial data on error
      localStorage.removeItem("auth");
      document.cookie = "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    }
  };

  useEffect(() => {
    AOS.init();
  }, []);

  return (
    <div className="bg-gray-900">
      <div className="container mx-auto px-6">
        <form
          className="flex w-full h-screen justify-center items-center flex-col gap-5"
          onSubmit={onSubmit}
          data-aos="fade-up" // Add AOS animation
        >
          <h2 className="text-center text-4xl text-white font-bold">Login</h2>

          <Input
            type="email"
            placeholder="Email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            // pattern="[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}$"
            data-aos="zoom-in" // Add AOS animation
          />

          <Input
            type="password"
            placeholder="Password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            // pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$"
            data-aos="zoom-in" // Add AOS animation
          />

          <Link
            to="/forgot-password"
            className="text-white opacity-85 font-medium"
            data-aos="fade-in" // Add AOS animation
          >
            forgot password?{" "}
            <span className="underline text-blue-600 font-semibold">
              Reset Password
            </span>
          </Link>

          <button
            type="submit"
            className="btn px-5 py-2 font-normal outline-none border border-white rounded-sm text-xl text-white hover:text-black hover:bg-white transition-all ease-in w-full max-w-[750px]"
            data-aos="slide-up" // Add AOS animation
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
