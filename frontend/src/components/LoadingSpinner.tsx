import React from 'react';
import { Gift } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface LoadingSpinnerProps {
  messageKey?: string;
  message?: string;
}

export default function LoadingSpinner({ 
  messageKey = 'common.loading',
  message
}: LoadingSpinnerProps) {
  const { t } = useLanguage();
  
  const displayMessage = message || t(messageKey);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-red-800 to-green-900 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-8">
        <div className="relative mb-6">
          <Gift className="w-16 h-16 text-gold-400 mx-auto mb-4 animate-bounce" />
          <div className="absolute inset-0 w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto"></div>
        </div>
        
        <p className="text-white text-lg font-medium mb-2">{displayMessage}</p>
        <p className="text-white/70 text-sm mb-6">{t('loading.ho_ho_wait')}</p>
      </div>
    </div>
  );
}
