'use client';

import { useState, useEffect } from 'react';

const AUTH_KEY = 'study_app_authenticated';
const AUTH_TIME_KEY = 'study_app_auth_time';
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuthentication = () => {
      if (typeof window === 'undefined') {
        setIsLoading(false);
        return;
      }

      const isAuth = localStorage.getItem(AUTH_KEY);
      const authTime = localStorage.getItem(AUTH_TIME_KEY);

      if (isAuth === 'true' && authTime) {
        const authTimestamp = parseInt(authTime);
        const currentTime = Date.now();

        // Check if session is still valid (24 hours)
        if (currentTime - authTimestamp < SESSION_DURATION) {
          setIsAuthenticated(true);
        } else {
          // Session expired, clear localStorage
          logout();
        }
      }

      setIsLoading(false);
    };

    checkAuthentication();
  }, []);

  const login = () => {
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem(AUTH_TIME_KEY);
    setIsAuthenticated(false);
  };

  return {
    isAuthenticated,
    isLoading,
    login,
    logout
  };
} 