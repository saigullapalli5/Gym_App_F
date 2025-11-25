import {
  useState,
  useContext,
  createContext,
  useEffect,
  useCallback,
} from "react";
import axios from "axios";
import { toast } from "react-hot-toast";

// Helper function to get cookie by name
const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return null;
};

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [auth, setAuthState] = useState(() => {
    try {
      // First check for admin data
      const storedAdminData = localStorage.getItem('adminData');
      if (storedAdminData) {
        const adminData = JSON.parse(storedAdminData);
        if (adminData.admin && adminData.token) {
          return {
            user: adminData.admin,
            token: adminData.token,
            loading: false,
            isAdmin: true
          };
        }
      }
      
      // If no admin data, check regular auth data
      const storedAuth = localStorage.getItem('auth');
      if (storedAuth) {
        const parsed = JSON.parse(storedAuth);
        // Check if we have both user data and token
        if (parsed.user && parsed.token) {
          return {
            user: parsed.user,
            token: parsed.token,
            loading: false,
            isAdmin: parsed.user.role === 1 || parsed.user.isAdmin
          };
        }
      }
      
      // If no valid localStorage data, check for token in cookie
      const tokenFromCookie = getCookie('auth_token');
      if (tokenFromCookie) {
        return {
          user: null,
          token: tokenFromCookie,
          loading: true,
          isAdmin: false
        };
      }
    } catch (error) {
      console.error('Error initializing auth state:', error);
      // Clear any corrupted data
      localStorage.removeItem('auth');
    }
    
    // Default state if no auth data found
    return { user: null, token: '', loading: false };
  });

  // Verify token with backend
  const verifyToken = useCallback(async (token) => {
    try {
      const { data } = await axios.get("/api/v1/auth/verify-token", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return data.success ? data : null;
    } catch (error) {
      console.error("Token verification failed:", error);
      return null;
    }
  }, []);

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Strictly check for token in cookies first
        const tokenFromCookie = getCookie('auth_token');
        
        // If no token in cookies, clear everything
        if (!tokenFromCookie) {
          localStorage.removeItem('auth');
          setAuthState(prev => ({
            ...prev,
            user: null,
            token: '',
            isAdmin: false,
            loading: false
          }));
          return;
        }
        
        // If we have a token in cookies, verify it
        try {
          const data = await verifyToken(tokenFromCookie);
          
          if (data?.success && data.user) {
            const userData = {
              _id: data.user._id,
              name: data.user.name || "",
              email: data.user.email || "",
              role: data.user.role || 0,
              isAdmin: data.user.role === 1,
              city: data.user.city || "",
              contact: data.user.contact || ""
            };
            
            // Update auth state with user data
            setAuthState({
              user: userData,
              token: tokenFromCookie,
              loading: false,
              isAdmin: data.user.role === 1
            });
            
            // Update localStorage for consistency
            localStorage.setItem('auth', JSON.stringify({
              user: userData,
              token: tokenFromCookie,
              timestamp: new Date().toISOString()
            }));
            
            return;
          }
        } catch (error) {
          console.error('Error verifying token:', error);
        }
        
        // If we reach here, verification failed or no valid token
        localStorage.removeItem('auth');
        document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
        
        setAuthState(prev => ({
          ...prev,
          user: null,
          token: '',
          isAdmin: false,
          loading: false
        }));
        
      } catch (error) {
        console.error("Error initializing auth:", error);
        localStorage.removeItem("auth");
        document.cookie = "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/";
        
        setAuthState(prev => ({
          ...prev,
          user: null,
          token: '',
          isAdmin: false,
          loading: false
        }));
      }
    };

    initializeAuth();
  }, [verifyToken]);

  const setAuth = useCallback((authData, persist = false) => {  // Default to false to prevent accidental cookie storage
    if (authData?.token) {
      // Only set cookie if explicitly told to persist (like during login)
      if (persist) {
        const expires = new Date();
        expires.setDate(expires.getDate() + 7);
        document.cookie = `auth_token=${authData.token}; path=/; expires=${expires.toUTCString()}; secure; samesite=strict`;
      }
      
      // Ensure user data is properly structured
      const userData = authData.user ? {
        _id: authData.user._id,
        name: authData.user.name || "",
        email: authData.user.email || "",
        role: authData.user.role || 0,
        isAdmin: authData.user.role === 1 || authData.user.isAdmin === true,
        city: authData.user.city || "",
        contact: authData.user.contact || ""
      } : null;
      
      const newAuth = {
        user: userData,
        token: authData.token,
        loading: false,
        isAdmin: userData?.isAdmin || false
      };

      // Update state first
      setAuthState(newAuth);

      // Handle storage based on persist flag
      if (persist) {
        try {
          // Prepare auth data for storage
          const storageData = {
            user: userData,
            token: authData.token,
            timestamp: new Date().toISOString()
          };
          
          // Store in localStorage
          localStorage.setItem('auth', JSON.stringify(storageData));
          
          // Set cookie with 7-day expiration
          const expires = new Date();
          expires.setDate(expires.getDate() + 7);
          document.cookie = `auth_token=${authData.token}; path=/; expires=${expires.toUTCString()}; secure; samesite=strict`;
          
          // Store admin data if user is admin
          if (userData?.isAdmin) {
            const adminData = {
              adminId: userData._id,
              adminName: userData.name,
              token: authData.token,
              loginTime: new Date().toISOString(),
            };
            localStorage.setItem('adminData', JSON.stringify(adminData));
          }
        } catch (error) {
          console.error('Error persisting auth data:', error);
        }
      }
    } else {
      // Clear auth
      setAuthState({
        user: null,
        token: "",
        loading: false,
      });
      localStorage.removeItem("auth");
      localStorage.removeItem("adminData");
      document.cookie = "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      // Call server-side logout endpoint
      await fetch(`${process.env.REACT_APP_API}/api/v1/auth/logout`, {
        method: 'POST',
        credentials: 'include', // Important for sending cookies
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth?.token}`
        }
      });
    } catch (error) {
      console.error('Error during server logout:', error);
      // Continue with client-side cleanup even if server logout fails
    } finally {
      // Clear all auth data from localStorage
      localStorage.clear();
      sessionStorage.clear();
      
      // Clear all cookies using our utility
      const clearAuthCookies = () => {
        const domain = window.location.hostname;
        const domainParts = domain.split('.');
        const baseDomain = domainParts.length > 1 
          ? domainParts.slice(-2).join('.')
          : domain;
        
        // List of all possible cookie names that might store auth tokens
        const cookieNames = [
          'auth_token',
          'token',
          'jwt',
          'session',
          'session_id',
          'connect.sid',
          'remember_token'
        ];
        
        // Different cookie settings to try
        const cookieSettings = [
          '', // Default path and domain
          '; path=/' + '; expires=Thu, 01 Jan 1970 00:00:00 GMT',
          '; path=/' + '; domain=' + domain + '; expires=Thu, 01 Jan 1970 00:00:00 GMT',
          '; path=/' + '; domain=.' + domain + '; expires=Thu, 01 Jan 1970 00:00:00 GMT',
        ];
        
        // Add base domain settings if different from current domain
        if (baseDomain !== domain) {
          cookieSettings.push(
            '; path=/' + '; domain=' + baseDomain + '; expires=Thu, 01 Jan 1970 00:00:00 GMT',
            '; path=/' + '; domain=.' + baseDomain + '; expires=Thu, 01 Jan 1970 00:00:00 GMT'
          );
        }
        
        // Clear all cookies with all variations
        cookieNames.forEach(name => {
          cookieSettings.forEach(settings => {
            document.cookie = `${name}=${settings}`;
            document.cookie = `${name}=${settings}; secure`;
            document.cookie = `${name}=${settings}; samesite=strict`;
          });
        });
        
        // Clear all cookies by setting them to empty string with all possible paths
        document.cookie.split(';').forEach(cookie => {
          const name = cookie.split('=')[0].trim();
          cookieSettings.forEach(settings => {
            document.cookie = `${name}=${settings}`;
          });
        });
      };
      clearAuthCookies();
      
      // Clear auth state
      setAuth({
        user: null,
        token: null,
        isAdmin: false,
        loading: false
      });
      
      // Force a full page reload to ensure all state is cleared
      window.location.href = '/login';
    }
  }, [auth?.token, setAuth]);

  const value = {
    auth,
    setAuth,
    logout,
    isAuthenticated: !!auth?.token,
    isAdmin: auth?.user?.role === 1,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context
const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export { AuthProvider, useAuth, AuthContext };
