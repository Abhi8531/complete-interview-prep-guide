'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';

const AUTH_KEY = 'study_app_authenticated';
const AUTH_TIME_KEY = 'study_app_auth_time';
const LAST_ACTIVITY_KEY = 'study_app_last_activity';
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const INACTIVITY_TIMEOUT = 5 * 60 * 1000; // 5 minutes in milliseconds

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const warningTimeoutRef = useRef<NodeJS.Timeout>();

  // Update last activity timestamp
  const updateActivity = useCallback(() => {
    if (typeof window !== 'undefined' && isAuthenticated) {
      localStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString());
    }
  }, [isAuthenticated]);

  // Check for inactivity
  const checkInactivity = useCallback(() => {
    if (typeof window === 'undefined' || !isAuthenticated) return;

    const lastActivity = localStorage.getItem(LAST_ACTIVITY_KEY);
    if (lastActivity) {
      const timeSinceActivity = Date.now() - parseInt(lastActivity);
      
      if (timeSinceActivity >= INACTIVITY_TIMEOUT) {
        toast.error('🔒 Session expired due to inactivity. Please login again.', {
          duration: 4000,
          style: {
            background: '#EF4444',
            color: 'white',
          },
        });
        logout();
      }
    }
  }, [isAuthenticated]);

  // Setup activity listeners
  useEffect(() => {
    if (!isAuthenticated || typeof window === 'undefined') return;

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    // Add event listeners for user activity
    events.forEach(event => {
      document.addEventListener(event, updateActivity, { passive: true });
    });

    // Set initial activity timestamp
    updateActivity();

    // Check inactivity every 30 seconds
    const activityCheckInterval = setInterval(checkInactivity, 30000);

    // Warning at 4 minutes (1 minute before logout)
    warningTimeoutRef.current = setTimeout(() => {
      if (isAuthenticated) {
        toast.warning('⚠️ You will be logged out in 1 minute due to inactivity', {
          duration: 5000,
          style: {
            background: '#F59E0B',
            color: 'white',
          },
        });
      }
    }, 4 * 60 * 1000);

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, updateActivity);
      });
      clearInterval(activityCheckInterval);
      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current);
      }
    };
  }, [isAuthenticated, updateActivity, checkInactivity]);

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
          // Initialize activity timestamp if not exists
          if (!localStorage.getItem(LAST_ACTIVITY_KEY)) {
            localStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString());
          }
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
    const currentTime = Date.now();
    localStorage.setItem(AUTH_KEY, 'true');
    localStorage.setItem(AUTH_TIME_KEY, currentTime.toString());
    localStorage.setItem(LAST_ACTIVITY_KEY, currentTime.toString());
    setIsAuthenticated(true);
  };

  const logout = useCallback(() => {
    // Clear all auth-related data
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem(AUTH_TIME_KEY);
    localStorage.removeItem(LAST_ACTIVITY_KEY);
    
    // Clear timeouts
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
    }
    
    setIsAuthenticated(false);
    
    // Force page reload to reset application state
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  }, []);

  return {
    isAuthenticated,
    isLoading,
    login,
    logout
  };
} 