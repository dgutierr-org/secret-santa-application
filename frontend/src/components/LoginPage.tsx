import React from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useLanguage } from '../contexts/LanguageContext';
import { Snowflake, Gift } from 'lucide-react';
import AdminDashboard from './AdminDashboard';
import LanguageSelector from './LanguageSelector';

export default function LoginPage() {
  const { login, loginStatus } = useInternetIdentity();
  const { t } = useLanguage();

  const handleLogin = async () => {
    try {
      await login();
    } catch (error: any) {
      console.error('Login error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-red-800 to-green-900 relative overflow-hidden">
      {/* Language Selector - Top Right with maximum z-index */}
      <div className="absolute top-4 right-4 z-[999999]">
        <LanguageSelector />
      </div>

      {/* Animated snowflakes */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <Snowflake
            key={i}
            className="absolute text-white opacity-20 animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              fontSize: `${Math.random() * 20 + 10}px`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-8">
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-12 max-w-md w-full text-center border-4 border-gold-400">
          <div className="mb-8">
            <Gift className="w-16 h-16 text-red-600 mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-red-800 mb-2">{t('app.title')}</h1>
            <p className="text-green-700 text-lg">{t('app.subtitle')}</p>
          </div>

          <div className="space-y-6">
            <button
              onClick={handleLogin}
              disabled={loginStatus === 'logging-in'}
              className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-4 px-8 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:transform-none"
            >
              {loginStatus === 'logging-in' ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>{t('auth.logging_in')}</span>
                </div>
              ) : (
                t('auth.signup')
              )}
            </button>
          </div>
        </div>

        {/* Admin Dashboard at bottom - will only show if user is logged in and is admin */}
        <div className="mt-8">
          <AdminDashboard />
        </div>
      </div>
    </div>
  );
}
