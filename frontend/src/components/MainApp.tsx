import React from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { useLanguage } from '../contexts/LanguageContext';
import { Power, Gift } from 'lucide-react';
import SubmissionStage from './SubmissionStage';
import ResolutionStage from './ResolutionStage';
import AdminDashboard from './AdminDashboard';
import LoadingSpinner from './LoadingSpinner';
import LanguageSelector from './LanguageSelector';
import { useUserProfile, useCurrentStage, useIsAdmin } from '../hooks/useQueries';

export default function MainApp() {
  const { clear, identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const { t } = useLanguage();
  const { data: profile } = useUserProfile();
  const { data: currentStage, isLoading: stageLoading } = useCurrentStage();
  const { data: isAdmin, isLoading: adminLoading } = useIsAdmin();

  // Refetch admin status when profile or participants change
  React.useEffect(() => {
    if (identity) {
      queryClient.invalidateQueries({ 
        queryKey: ['isAdmin', identity.getPrincipal().toString()] 
      });
    }
  }, [profile, identity, queryClient]);

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  // Show loading while determining stage
  if (stageLoading) {
    return <LoadingSpinner messageKey="main.loading_state" />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-red-800 to-green-900">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <Gift className="w-8 h-8 text-gold-400" />
              <h1 className="text-2xl font-bold text-white">{t('app.title')}</h1>
            </div>

            <div className="flex items-center space-x-3">
              <LanguageSelector />
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors"
                title={t('common.logout')}
              >
                <Power className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentStage === 'submission' ? (
          <SubmissionStage />
        ) : (
          <ResolutionStage />
        )}
      </main>

      {/* Admin Dashboard - Only visible to last participant (by registrationTime) */}
      {!adminLoading && isAdmin && (
        <div className="border-t border-white/20 bg-white/5 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <AdminDashboard />
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white/10 backdrop-blur-sm border-t border-white/20 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center">
          <p className="text-white/80">
            {t('footer.built_with_love')}{' '}
            <a
              href="https://caffeine.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold-400 hover:text-gold-300 transition-colors"
            >
              {t('footer.caffeine_ai')}
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
