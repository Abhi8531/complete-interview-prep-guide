'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import LoginScreen from '@/components/LoginScreen';

const Dashboard = dynamic(() => import('@/components/Dashboard'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading your study dashboard...</p>
      </div>
    </div>
  )
});

export default function Home() {
  const [isClient, setIsClient] = useState(false);
  const { isAuthenticated, isLoading, login } = useAuth();

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Show loading screen while checking authentication or client hydration
  if (!isClient || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    return <LoginScreen onLogin={login} />;
  }

  // Show dashboard if authenticated
  return <Dashboard />;
} 