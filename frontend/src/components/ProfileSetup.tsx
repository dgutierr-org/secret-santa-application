import React, { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useLanguage } from '../contexts/LanguageContext';
import { useSaveUserProfile } from '../hooks/useQueries';
import { useActor } from '../hooks/useActor';
import { Gift, AlertCircle } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';
import LanguageSelector from './LanguageSelector';
import RichTextEditor from './RichTextEditor';

export default function ProfileSetup() {
  const { identity } = useInternetIdentity();
  const { t } = useLanguage();
  const [name, setName] = useState('');
  const [wishList, setWishList] = useState('');

  const profileMutation = useSaveUserProfile();
  const { actor, isFetching } = useActor();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) return;
    
    if (!actor) {
      return;
    }

    try {
      await profileMutation.mutateAsync({
        name: name.trim(),
        wishList: wishList,
      });
    } catch (error) {
      console.error('Profile setup error:', error);
    }
  };

  // Show loading spinner while connecting or during operations
  if (isFetching || profileMutation.isPending) {
    return <LoadingSpinner 
      messageKey={
        isFetching ? "profile.establishing_connection" :
        "profile.setting_up"
      } 
    />;
  }

  const canSubmit = actor && name.trim() && !profileMutation.isPending;

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-red-800 to-green-900 p-8">
      {/* Language Selector - Top Right with maximum z-index */}
      <div className="absolute top-4 right-4 z-[999999]">
        <LanguageSelector />
      </div>

      <div className="max-w-2xl mx-auto">
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border-4 border-gold-400">
          <div className="text-center mb-8">
            <Gift className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-red-800 mb-2">{t('profile.setup_title')}</h1>
            <p className="text-green-700">{t('profile.setup_subtitle')}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('profile.your_name')} *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('profile.enter_name')}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-red-500 focus:outline-none transition-colors"
                required
              />
            </div>

            {/* Wish List Rich Text Editor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('profile.wish_list')}
              </label>
              <RichTextEditor
                value={wishList}
                onChange={setWishList}
                placeholder={t('profile.wish_list_placeholder')}
              />
              <p className="text-sm text-gray-500 mt-1">
                {t('profile.wish_list_help')}
              </p>
            </div>

            {/* Error Display */}
            {profileMutation.error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <span className="font-medium text-red-700">{t('profile.setup_failed')}</span>
                </div>
                <p className="text-red-600 text-sm">
                  {profileMutation.error.message}
                </p>
                <p className="text-red-500 text-xs mt-1">
                  {t('profile.check_connection')}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={!canSubmit}
              className={`w-full font-bold py-4 px-8 rounded-full transition-all duration-300 shadow-lg ${
                canSubmit
                  ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white transform hover:scale-105'
                  : 'bg-gray-400 text-gray-600 cursor-not-allowed'
              }`}
            >
              {!actor ? (
                <div className="flex items-center justify-center space-x-2">
                  <AlertCircle className="w-5 h-5" />
                  <span>{t('profile.waiting_backend')}</span>
                </div>
              ) : profileMutation.isPending ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>{t('profile.setting_up')}</span>
                </div>
              ) : (
                t('profile.join_santa')
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
