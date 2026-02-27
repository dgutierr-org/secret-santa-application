import React, { useState } from 'react';
import { Gift, Heart, Edit } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useGetMyAssignment, useUserProfile, useSaveUserProfile, useCurrentStage } from '../hooks/useQueries';
import RichTextEditor from './RichTextEditor';

export default function ResolutionStage() {
  const { t } = useLanguage();
  const { data: assignment, isLoading } = useGetMyAssignment();
  const { data: profile } = useUserProfile();
  const { data: currentStage } = useCurrentStage();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(profile?.name || '');
  const [editWishList, setEditWishList] = useState(profile?.wishList || '');

  const profileMutation = useSaveUserProfile();

  // Check if editing is allowed (only during submission stage)
  const isEditingAllowed = currentStage === 'submission';

  const handleEdit = () => {
    if (!isEditingAllowed) return;
    setIsEditing(true);
    setEditName(profile?.name || '');
    setEditWishList(profile?.wishList || '');
  };

  const handleSave = async () => {
    try {
      await profileMutation.mutateAsync({
        name: editName.trim(),
        wishList: editWishList,
      });

      setIsEditing(false);
    } catch (error) {
      console.error('Profile update error:', error);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditName(profile?.name || '');
    setEditWishList(profile?.wishList || '');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center text-white">
          <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>{t('resolution.finding_assignment')}</p>
        </div>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="space-y-8">
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border-4 border-gold-400 text-center">
          <Gift className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-800 mb-4">{t('resolution.no_assignment')}</h2>
          <p className="text-gray-600">
            {t('resolution.no_assignment_desc')}
          </p>
        </div>

        {/* Profile editing section - Edit button hidden during resolution stage */}
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border-4 border-gold-400">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-red-800 flex items-center">
              <Gift className="w-6 h-6 mr-2" />
              {t('submission.your_profile')}
            </h2>
            {!isEditing && isEditingAllowed && (
              <button
                onClick={handleEdit}
                className="flex items-center space-x-2 bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-lg transition-colors"
              >
                <Edit className="w-4 h-4" />
                <span>{t('common.edit')}</span>
              </button>
            )}
          </div>

          {isEditing ? (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('common.name')}</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('profile.wish_list')}</label>
                <RichTextEditor
                  value={editWishList}
                  onChange={setEditWishList}
                  placeholder={t('profile.wish_list_placeholder')}
                />
                <p className="text-sm text-gray-500 mt-1">
                  {t('profile.wish_list_help')}
                </p>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={handleSave}
                  disabled={profileMutation.isPending}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
                >
                  {profileMutation.isPending ? t('submission.saving') : t('submission.save_changes')}
                </button>
                <button
                  onClick={handleCancel}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  {t('common.cancel')}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-700">{t('common.name')}</h3>
                <p className="text-lg">{profile?.name}</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-700">{t('profile.wish_list')}</h3>
                {profile?.wishList && profile.wishList.trim() ? (
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div 
                      className="text-gray-800 prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: profile.wishList }}
                    />
                  </div>
                ) : (
                  <p className="text-gray-500 italic">{t('submission.no_wish_list')}</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Assignment Display */}
      <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border-4 border-gold-400">
        <div className="text-center mb-8">
          <Heart className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-red-800 mb-2">{t('resolution.your_santa_is')}</h1>
          <p className="text-green-700 text-lg">{t('resolution.gifting_to')}</p>
        </div>

        <div className="bg-gradient-to-r from-red-50 to-green-50 rounded-2xl p-8 border-2 border-red-200">
          <div className="flex flex-col items-center space-y-6">
            {/* Profile Info */}
            <div className="flex-1 text-center w-full">
              <h2 className="text-4xl font-bold text-red-800 mb-4">{assignment.name}</h2>
              
              <div className="bg-white rounded-xl p-6 shadow-inner">
                <h3 className="text-xl font-semibold text-green-700 mb-4 flex items-center justify-center">
                  <Gift className="w-5 h-5 mr-2" />
                  {t('resolution.wish_list_title')}
                </h3>
                
                {assignment.wishList && assignment.wishList.trim() ? (
                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <div 
                      className="text-gray-800 prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: assignment.wishList }}
                    />
                  </div>
                ) : (
                  <p className="text-gray-500 italic">{t('resolution.no_wishes')}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <div className="bg-gold-100 border border-gold-300 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gold-800 mb-2">{t('resolution.gift_tips')}</h3>
            <p className="text-gold-700">
              {t('resolution.gift_tips_desc')}
            </p>
          </div>
        </div>
      </div>

      {/* Profile editing section - Edit button hidden during resolution stage */}
      <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border-4 border-gold-400">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-red-800 flex items-center">
            <Gift className="w-6 h-6 mr-2" />
            {t('submission.your_profile')}
          </h2>
          {!isEditing && isEditingAllowed && (
            <button
              onClick={handleEdit}
              className="flex items-center space-x-2 bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-lg transition-colors"
            >
              <Edit className="w-4 h-4" />
              <span>{t('common.edit')}</span>
            </button>
          )}
        </div>

        {isEditing ? (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('common.name')}</label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('profile.wish_list')}</label>
              <RichTextEditor
                value={editWishList}
                onChange={setEditWishList}
                placeholder={t('profile.wish_list_placeholder')}
              />
              <p className="text-sm text-gray-500 mt-1">
                {t('profile.wish_list_help')}
              </p>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={handleSave}
                disabled={profileMutation.isPending}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
              >
                {profileMutation.isPending ? t('submission.saving') : t('submission.save_changes')}
              </button>
              <button
                onClick={handleCancel}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors"
              >
                {t('common.cancel')}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-700">{t('common.name')}</h3>
              <p className="text-lg">{profile?.name}</p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-700">{t('profile.wish_list')}</h3>
              {profile?.wishList && profile.wishList.trim() ? (
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div 
                    className="text-gray-800 prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: profile.wishList }}
                  />
                </div>
              ) : (
                <p className="text-gray-500 italic">{t('submission.no_wish_list')}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
