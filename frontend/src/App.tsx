import React from 'react';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useUserProfile } from './hooks/useQueries';
import { useActor } from './hooks/useActor';
import { LanguageProvider } from './contexts/LanguageContext';
import LoginPage from './components/LoginPage';
import MainApp from './components/MainApp';
import ProfileSetup from './components/ProfileSetup';
import LoadingSpinner from './components/LoadingSpinner';

function AppContent() {
  const { identity, loginStatus } = useInternetIdentity();
  const { data: profile, isLoading: profileLoading, error: profileError, isFetched } = useUserProfile();
  const { actor, isFetching } = useActor();

  // Show loading while checking authentication or connecting to backend
  if (loginStatus === 'logging-in' || (identity && isFetching)) {
    return <LoadingSpinner 
      messageKey={loginStatus === 'logging-in' ? 'auth.authenticating' : 'auth.connecting_backend'} 
    />;
  }

  // Show login page if not authenticated
  if (!identity) {
    return <LoginPage />;
  }

  // Show loading while backend is connecting or queries are loading (only if we have identity)
  if (!actor || profileLoading) {
    return <LoadingSpinner 
      messageKey={
        !actor ? 'loading.connecting_backend' :
        profileLoading ? 'loading.loading_profile' :
        'loading.checking_permissions'
      }
    />;
  }

  // Handle profile loading errors - if there's an error and no profile, show setup
  if (profileError && !profile) {
    return <ProfileSetup />;
  }

  // Show profile setup if user doesn't have a profile yet
  if (!profile) {
    return <ProfileSetup />;
  }

  // Show main application
  return <MainApp />;
}

export default function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}
