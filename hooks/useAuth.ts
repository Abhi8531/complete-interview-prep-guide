'use client';

import { useState, useEffect } from 'react';

const AUTH_KEY = 'study_app_authenticated';
const AUTH_TIME_KEY = 'study_app_auth_time';
const LAST_ACTIVITY_KEY = 'study_app_last_activity';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuthentication = () => {
      if (typeof window === 'undefined') {
        setIsLoading(false);
        return;
      }

      // Clear any existing authentication data to force re-login every time
      localStorage.removeItem(AUTH_KEY);
      localStorage.removeItem(AUTH_TIME_KEY);
      localStorage.removeItem(LAST_ACTIVITY_KEY);
      
      // Always set as not authenticated to require password entry
      setIsAuthenticated(false);
      setIsLoading(false);
    };

    checkAuthentication();
  }, []);

  const login = () => {
    const currentTime = Date.now();
    localStorage.setItem(AUTH_KEY, 'true');
    localStorage.setItem(AUTH_TIME_KEY, currentTime.toString());
    localStorage.setItem(LAST_ACTIVITY_KEY, currentTime.toString());
    setIsAuthenticated(true);
  };

  const logout = () => {
    // Clear all auth-related data
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem(AUTH_TIME_KEY);
    localStorage.removeItem(LAST_ACTIVITY_KEY);
    
    setIsAuthenticated(false);
    
    // Force page reload to reset application state
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  return {
    isAuthenticated,
    isLoading,
    login,
    logout
  };
} 