import React, { useState } from 'react';
import { Clock, Users, Gift, Edit, Play } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useUserProfile, useListParticipantNames, useSaveUserProfile, useGetDeadline, useCurrentStage, useTriggerResolution } from '../hooks/useQueries';
import CountdownTimer from './CountdownTimer';
import ParticipantsList from './ParticipantsList';
import RichTextEditor from './RichTextEditor';

export default function SubmissionStage() {
  const { t } = useLanguage();
  const { data: profile } = useUserProfile();
  const { data: participants = [] } = useListParticipantNames();
  const { data: backendDeadline } = useGetDeadline();
  const { data: currentStage } = useCurrentStage();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(profile?.name || '');
  const [editWishList, setEditWishList] = useState(profile?.wishList || '');

  const profileMutation = useSaveUserProfile();
  const triggerResolutionMutation = useTriggerResolution();

  // Convert backend deadline (bigint nanoseconds) to JavaScript Date
  // If no deadline is set, default to December 20 of the current year
  const deadline = React.useMemo(() => {
    if (backendDeadline && backendDeadline > 0n) {
      return new Date(Number(backendDeadline / 1000000n)); // Convert nanoseconds to milliseconds
    }
    
    // Default to December 20 of the current year at 11:59 PM
    const currentYear = new Date().getFullYear();
    return new Date(currentYear, 11, 20, 23, 59, 59); // Month is 0-indexed, so 11 = December
  }, [backendDeadline]);

  // Check if deadline has passed
  const hasDeadlinePassed = deadline ? new Date() > deadline : false;

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

  const handleTriggerResolution = async () => {
    try {
      await triggerResolutionMutation.mutateAsync();
    } catch (error) {
      console.error('Failed to trigger resolution:', error);
    }
  };

  return (
    <div className="space-y-8">
      {/* Countdown Timer */}
      <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border-4 border-gold-400">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-4 mb-4">
            <Clock className="w-12 h-12 text-red-600" />
          </div>
          <h2 className="text-3xl font-bold text-red-800 mb-4">
            {currentStage === 'resolution' ? t('submission.resolution_active') : t('submission.time_until_deadline')}
          </h2>
          
          {currentStage === 'submission' ? (
            <CountdownTimer deadline={deadline} />
          ) : (
            <div className="text-lg text-green-700 font-semibold">
              {t('submission.assignments_distributed')}
            </div>
          )}

          {/* Resolution Trigger Section - Available to all users after deadline */}
          {currentStage === 'submission' && hasDeadlinePassed && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl">
              <h3 className="text-lg font-semibold text-green-800 mb-2">{t('submission.ready_resolution')}</h3>
              <p className="text-green-700 mb-4">
                {t('submission.deadline_passed_desc')}
              </p>
              
              {participants.length >= 2 ? (
                <button 
                  onClick={handleTriggerResolution}
                  disabled={triggerResolutionMutation.isPending}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors disabled:opacity-50 font-semibold"
                >
                  {triggerResolutionMutation.isPending ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>{t('submission.assigning_santas')}</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Play className="w-5 h-5" />
                      <span>{t('submission.start_resolution')}</span>
                    </div>
                  )}
                </button>
              ) : (
                <div className="text-yellow-700 bg-yellow-100 border border-yellow-300 rounded-lg p-3">
                  <p className="font-medium">{t('submission.need_more_participants')}</p>
                  <p className="text-sm">{t('submission.need_two_participants')}</p>
                </div>
              )}

              {/* Error Message */}
              {triggerResolutionMutation.error && (
                <div className="mt-3 text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="font-medium">{t('submission.error_starting')}</p>
                  <p className="text-sm">{triggerResolutionMutation.error.message}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Profile Section - Edit button only visible during submission stage */}
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

        {/* Participants Section */}
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border-4 border-gold-400">
          <h2 className="text-2xl font-bold text-red-800 mb-6 flex items-center">
            <Users className="w-6 h-6 mr-2" />
            {t('submission.participants_count', { count: participants.length })}
          </h2>
          <ParticipantsList participants={participants} />
        </div>
      </div>
    </div>
  );
}
