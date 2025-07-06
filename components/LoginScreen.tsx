'use client';

import { useState } from 'react';
import { Shield, Lock, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

interface LoginScreenProps {
  onLogin: () => void;
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const CORRECT_PASSWORD = "Lesss Gooo";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Add a small delay for better UX
    await new Promise(resolve => setTimeout(resolve, 800));

    if (password === CORRECT_PASSWORD) {
      toast.success('🎉 Welcome back, Abhishek! Access granted.', {
        duration: 3000,
        style: {
          background: '#10B981',
          color: 'white',
        },
      });
      
      // Store authentication in localStorage
      localStorage.setItem('study_app_authenticated', 'true');
      localStorage.setItem('study_app_auth_time', Date.now().toString());
      
      setTimeout(() => {
        onLogin();
      }, 1000);
    } else {
      toast.error('❌ Incorrect password. Access denied.', {
        duration: 4000,
        style: {
          background: '#EF4444',
          color: 'white',
        },
      });
      setPassword('');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center mobile-padding safe-top safe-bottom">
      <div className="max-w-md w-full">
        {/* Logo/Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="mx-auto h-12 w-12 sm:h-16 sm:w-16 bg-blue-600 rounded-full flex items-center justify-center mb-3 sm:mb-4">
            <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
          </div>
          <h1 className="text-responsive-xl font-bold text-gray-900 mb-2">
            Complete Interview Prep
          </h1>
          <p className="text-responsive-sm text-gray-600">
            Private Study Platform
          </p>
        </div>

        {/* Welcome Message */}
        <div className="bg-white rounded-lg shadow-xl p-6 sm:p-8 border border-gray-200 mx-2 sm:mx-0">
          <div className="text-center mb-6">
            <h2 className="text-responsive-lg font-semibold text-gray-900 mb-2">
              👋 Hi Abhishek, Welcome!
            </h2>
            <p className="text-responsive-sm text-gray-600">
              Please enter your password to verify your identity
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit}>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="block w-full pl-10 pr-12 py-3 sm:py-3 text-base border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 tap-target"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center tap-target"
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !password.trim()}
              className="w-full flex justify-center py-3 px-4 mt-6 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors tap-target"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Verifying...
                </div>
              ) : (
                'Access Study Platform'
              )}
            </button>
          </form>

          {/* Additional Info */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              🔒 This is a private study platform for Abhishek's interview preparation
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 sm:mt-8">
          <p className="text-responsive-xs text-gray-500">
            Secured with 🛡️ authentication • Built with Next.js
          </p>
        </div>
      </div>
    </div>
  );
} 