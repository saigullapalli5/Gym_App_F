import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/auth";
import toast from "react-hot-toast";

const Header = () => {
  const { auth, setAuth } = useAuth();
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const clearAllStorage = () => {
    try {
      // Clear all localStorage data
      localStorage.clear();
      
      // Clear all sessionStorage data
      sessionStorage.clear();
      
      // List of known cookie names that might store tokens
      const tokenCookies = [
        'token',
        'access_token',
        'refresh_token',
        'auth_token',
        'jwt',
        'jwt_token',
        'session',
        'session_id',
        'user_session',
        'remember_me'
      ];
      
      // Clear all cookies
      const cookies = document.cookie.split(';');
      const hostname = window.location.hostname;
      const domainParts = hostname.split('.');
      
      // Function to clear a cookie with all possible variations
      const clearCookie = (name) => {
        // Clear for all paths and domains
        const domains = [
          '',
          `domain=${hostname}`,
          `domain=.${hostname}`,
          ...(domainParts.length > 2 ? [`domain=.${domainParts.slice(-2).join('.')}`] : [])
        ];
        
        const paths = ['/', ''];
        
        domains.forEach(domain => {
          paths.forEach(path => {
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; ${domain ? domain + ';' : ''} path=${path};`;
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; ${domain ? domain + ';' : ''} path=${path}; secure`;
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; ${domain ? domain + ';' : ''} path=${path}; secure; samesite=strict`;
          });
        });
      };
      
      // Clear all existing cookies
      cookies.forEach(cookie => {
        const eqPos = cookie.indexOf('=');
        const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
        clearCookie(name);
      });
      
      // Clear all known token cookies
      tokenCookies.forEach(cookieName => {
        clearCookie(cookieName);
      });
      
      // Clear authentication tokens and other known keys
      const knownKeys = ['auth', 'token', 'refreshToken', 'user', 'adminData', 'rememberMe'];
      knownKeys.forEach(key => {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
      });
      
      return true;
    } catch (error) {
      console.error('Error clearing storage:', error);
      return false;
    }
  };

  const handleLogout = async () => {
    try {
      // Clear auth state first
      setAuth({ user: null, token: "" });
      
      // Clear all storage
      const storageCleared = clearAllStorage();
      
      // Clear any indexedDB databases
      if (window.indexedDB && window.indexedDB.databases) {
        try {
          const dbs = await window.indexedDB.databases();
          await Promise.all(
            dbs.map(db => 
              db.name ? window.indexedDB.deleteDatabase(db.name) : Promise.resolve()
            )
          );
        } catch (e) {
          console.error('Error clearing IndexedDB:', e);
        }
      }

      // Clear service worker caches
      if ('caches' in window) {
        try {
          const cacheNames = await caches.keys();
          await Promise.all(cacheNames.map(cacheName => caches.delete(cacheName)));
        } catch (e) {
          console.error('Error clearing caches:', e);
        }
      }
      
      // Clear any remaining auth state in memory
      if (window.gapi && window.gapi.auth2) {
        try {
          const auth2 = window.gapi.auth2.getAuthInstance();
          if (auth2) await auth2.signOut();
        } catch (e) {
          console.error('Error signing out of Google:', e);
        }
      }

      // Force a hard reload to clear any remaining state
      toast.success("Successfully logged out");
      window.location.href = '/';
      window.location.reload(true);
      
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Error during logout. Please try again.');
    }
  };

  return (
    <header className="bg-gradient-to-r from-fuchsia-300 to-indigo-500 shadow-md py-4 w-full fixed top-0 z-50 ;">
      <div className="container mx-auto px-6 flex justify-between items-center">
        {/* Logo (Stylized Text) */}
        <Link to="/" className="flex items-center space-x-2">
          <span className="text-3xl sm:text-4xl font-extrabold text-violet-600 tracking-widest">
            Gym<span className="text-slate-950">Master</span>
          </span>
        </Link>

        {/* Hamburger Menu for Mobile */}
        <button
          className="lg:hidden text-white focus:outline-none"
          onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
        >
          <svg
            className="w-8 h-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 6h16M4 12h16m-7 6h7"
            />
          </svg>
        </button>

        {/* Navigation Links */}
        <nav className="hidden lg:flex space-x-8 items-center">
          {auth?.user ? (
            <ul className="flex space-x-6 text-lg">
              <li>
                <Link
                  to="/"
                  className="text-white hover:text-yellow-400 transition-all duration-300"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/exercise"
                  className="text-white hover:text-yellow-400 transition-all duration-300"
                >
                  Exercises
                </Link>
              </li>
              {auth.user.name === "admin" && (
                <li>
                  <Link
                    to="/admin/plans/create"
                    className="text-white hover:text-yellow-400 transition-all duration-300"
                  >
                    Create Plan
                  </Link>
                </li>
              )}
            </ul>
          ) : null}

          {auth?.user ? (
            <div className="flex items-center space-x-4">
              <Link
                to={auth.user.isAdmin ? "/admin" : "/dashboard/user"}
                className="text-white font-semibold hover:text-yellow-400 transition-all duration-300 capitalize"
              >
                {auth.user.name}
                {auth.user.isAdmin && (
                  <span className="ml-2 px-2 py-0.5 bg-yellow-500 text-black text-xs rounded-full">
                    Admin
                  </span>
                )}
              </Link>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200"
              >
                Logout
              </button>
            </div>
          ) : (
            <>
              <Link
                to="/register"
                className="text-white hover:text-yellow-400 transition-all duration-300"
              >
                Register
              </Link>
              <Link
                to="/login"
                className="text-white hover:text-yellow-400 transition-all duration-300"
              >
                Login
              </Link>
            </>
          )}
        </nav>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-blue-600 py-4">
          <ul className="flex flex-col space-y-4 items-center text-lg">
            {auth?.user ? (
              <>
                <li>
                  <Link
                    to="/"
                    className="text-white hover:text-yellow-400 transition-all duration-300"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    to="/exercise"
                    className="text-white hover:text-yellow-400 transition-all duration-300"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Exercises
                  </Link>
                </li>
                <li>
                  <Link
                    to="/feedback"
                    className="text-white hover:text-yellow-400 transition-all duration-300"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Feedback
                  </Link>
                </li>
                {auth.user.name === "admin" && (
                  <li>
                    <Link
                      to="/admin/plans/create"
                      className="text-white hover:text-yellow-400 transition-all duration-300"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Create Plan
                    </Link>
                  </li>
                )}
              </>
            ) : null}
            {auth?.user ? (
              <>
                <Link
                  to={auth.user.name === "admin" ? "/admin" : "/dashboard/user"}
                  className="text-white font-semibold hover:text-yellow-400 transition-all duration-300 capitalize"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {auth.user.name}
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="text-white hover:text-yellow-400 transition-all duration-300"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/register"
                  className="text-white hover:text-yellow-400 transition-all duration-300"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Register
                </Link>
                <Link
                  to="/login"
                  className="text-white hover:text-yellow-400 transition-all duration-300"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
              </>
            )}
          </ul>
        </div>
      )}
    </header>
  );
};

export default Header;
