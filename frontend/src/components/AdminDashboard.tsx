import React, { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useLanguage } from '../contexts/LanguageContext';
import { Settings, Clock, RotateCcw, ChevronDown, ChevronUp, CheckCircle, AlertCircle, UserCheck, Play, Undo2, Trash2, Users } from 'lucide-react';
import { useUserProfile, useListParticipantNames, useGetDeadline, useSetDeadline, useResetRound, useGetAssignmentNames, useCurrentStage, useTriggerResolution, useRollbackToSubmission, useDeleteParticipant } from '../hooks/useQueries';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export default function AdminDashboard() {
  const { identity } = useInternetIdentity();
  const { t } = useLanguage();
  const { data: profile } = useUserProfile();
  const { data: participants = [] } = useListParticipantNames();
  const { data: backendDeadline } = useGetDeadline();
  const { data: assignmentNames = [], isLoading: assignmentsLoading, error: assignmentsError } = useGetAssignmentNames();
  const { data: currentStage } = useCurrentStage();
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'assignments' | 'participants'>('overview');
  const [deadlineInput, setDeadlineInput] = useState('');
  const [showResetSuccess, setShowResetSuccess] = useState(false);
  const [showResolutionSuccess, setShowResolutionSuccess] = useState(false);
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);

  const setDeadlineMutation = useSetDeadline();
  const resetRoundMutation = useResetRound();
  const triggerResolutionMutation = useTriggerResolution();
  const rollbackMutation = useRollbackToSubmission();
  const deleteParticipantMutation = useDeleteParticipant();

  // Convert backend Time (bigint nanoseconds) to JavaScript Date
  // If no deadline is set, default to December 20 of the current year
  const deadline = React.useMemo(() => {
    if (backendDeadline && backendDeadline > 0n) {
      return new Date(Number(backendDeadline / 1000000n)); // Convert nanoseconds to milliseconds
    }
    
    // Default to December 20 of the current year at 11:59 PM
    const currentYear = new Date().getFullYear();
    return new Date(currentYear, 11, 20, 23, 59, 59); // Month is 0-indexed, so 11 = December
  }, [backendDeadline]);

  // Initialize deadline input when deadline data is loaded
  React.useEffect(() => {
    if (deadline && !deadlineInput) {
      // Format date for datetime-local input
      const year = deadline.getFullYear();
      const month = String(deadline.getMonth() + 1).padStart(2, '0');
      const day = String(deadline.getDate()).padStart(2, '0');
      const hours = String(deadline.getHours()).padStart(2, '0');
      const minutes = String(deadline.getMinutes()).padStart(2, '0');
      setDeadlineInput(`${year}-${month}-${day}T${hours}:${minutes}`);
    } else if (!deadline && !deadlineInput) {
      // Set default to December 20 of current year
      const currentYear = new Date().getFullYear();
      const defaultDate = new Date(currentYear, 11, 20, 23, 59); // December 20, 11:59 PM
      const year = defaultDate.getFullYear();
      const month = String(defaultDate.getMonth() + 1).padStart(2, '0');
      const day = String(defaultDate.getDate()).padStart(2, '0');
      const hours = String(defaultDate.getHours()).padStart(2, '0');
      const minutes = String(defaultDate.getMinutes()).padStart(2, '0');
      setDeadlineInput(`${year}-${month}-${day}T${hours}:${minutes}`);
    }
  }, [deadline, deadlineInput]);

  // Show success message and hide after 3 seconds
  React.useEffect(() => {
    if (showResetSuccess) {
      const timer = setTimeout(() => {
        setShowResetSuccess(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showResetSuccess]);

  // Show resolution success message and hide after 3 seconds
  React.useEffect(() => {
    if (showResolutionSuccess) {
      const timer = setTimeout(() => {
        setShowResolutionSuccess(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showResolutionSuccess]);

  // Show delete success message and hide after 3 seconds
  React.useEffect(() => {
    if (showDeleteSuccess) {
      const timer = setTimeout(() => {
        setShowDeleteSuccess(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showDeleteSuccess]);

  // Only show for authenticated users with profiles
  // Admin check is done in MainApp based on registrationTime
  if (!identity || !profile) {
    return null;
  }

  const handleUpdateDeadline = async () => {
    if (!deadlineInput) return;
    
    try {
      const selectedDate = new Date(deadlineInput);
      // Convert to nanoseconds (backend expects Time as bigint nanoseconds)
      const timeInNanoseconds = BigInt(selectedDate.getTime() * 1000000);
      await setDeadlineMutation.mutateAsync(timeInNanoseconds);
    } catch (error) {
      console.error('Failed to update deadline:', error);
    }
  };

  const handleResetRound = async () => {
    try {
      await resetRoundMutation.mutateAsync();
      setShowResetSuccess(true);
    } catch (error) {
      console.error('Failed to reset round:', error);
    }
  };

  const handleTriggerResolution = async () => {
    try {
      await triggerResolutionMutation.mutateAsync();
      setShowResolutionSuccess(true);
    } catch (error) {
      console.error('Failed to trigger resolution:', error);
    }
  };

  const handleRollback = async () => {
    try {
      await rollbackMutation.mutateAsync();
    } catch (error) {
      console.error('Failed to rollback to submission:', error);
    }
  };

  const handleDeleteParticipant = async (participantName: string) => {
    try {
      await deleteParticipantMutation.mutateAsync(participantName);
      setShowDeleteSuccess(true);
    } catch (error) {
      console.error('Failed to delete participant:', error);
    }
  };

  // Delete is only available during submission stage
  const isDeleteAvailable = currentStage === 'submission';

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
      {/* Admin Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 text-white hover:bg-white/10 transition-colors rounded-2xl"
      >
        <div className="flex items-center space-x-3">
          <Settings className="w-5 h-5 text-gold-400" />
          <span className="font-medium">{t('admin.dashboard')}</span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5" />
        ) : (
          <ChevronDown className="w-5 h-5" />
        )}
      </button>

      {/* Admin Content */}
      {isExpanded && (
        <div className="border-t border-white/20 p-4">
          {/* Tab Navigation with horizontal scroll on mobile */}
          <div className="overflow-x-auto -mx-4 px-4 mb-6">
            <div className="flex space-x-2 min-w-max">
              {[
                { id: 'overview', label: t('admin.overview'), icon: Settings },
                { id: 'assignments', label: t('admin.assignments'), icon: UserCheck },
                { id: 'participants', label: t('admin.participants_count'), icon: Users },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-white/20 text-white'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="bg-white/5 rounded-xl p-6">
            {activeTab === 'overview' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white mb-4">{t('admin.system_overview')}</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white/10 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Settings className="w-5 h-5 text-blue-400" />
                      <span className="text-white font-medium">{t('admin.participants_count')}</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{participants.length}</p>
                  </div>
                  
                  <div className="bg-white/10 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Clock className="w-5 h-5 text-yellow-400" />
                      <span className="text-white font-medium">{t('admin.stage')}</span>
                    </div>
                    <p className="text-lg font-semibold text-white capitalize">{currentStage || 'Submission'}</p>
                  </div>
                </div>

                {/* Deadline Status Section with Update Functionality */}
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-4">
                    <Clock className="w-5 h-5 text-orange-400" />
                    <span className="text-white font-medium">{t('admin.deadline_status')}</span>
                  </div>
                  
                  {/* Current Deadline Display */}
                  {deadline && (
                    <div className="mb-4">
                      <p className="text-white/90 mb-1">
                        {t('submission.current_deadline', { 
                          date: deadline.toLocaleDateString(), 
                          time: deadline.toLocaleTimeString() 
                        })}
                      </p>
                    </div>
                  )}

                  {/* Deadline Update Controls */}
                  <div className="space-y-3">
                    <div className="flex space-x-3">
                      <input
                        type="datetime-local"
                        value={deadlineInput}
                        onChange={(e) => setDeadlineInput(e.target.value)}
                        className="bg-white/20 text-white rounded-lg px-3 py-2 border border-white/30 focus:border-white/50 focus:outline-none text-sm flex-1"
                      />
                      <button 
                        onClick={handleUpdateDeadline}
                        disabled={setDeadlineMutation.isPending || !deadlineInput}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 text-sm"
                      >
                        {setDeadlineMutation.isPending ? t('admin.updating') : t('common.update')}
                      </button>
                    </div>
                    
                    {/* Success Message */}
                    {setDeadlineMutation.isSuccess && (
                      <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-3">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-400" />
                          <span className="text-green-300 text-sm">{t('admin.deadline_updated')}</span>
                        </div>
                      </div>
                    )}
                    
                    {/* Error Message */}
                    {setDeadlineMutation.error && (
                      <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3">
                        <div className="flex items-center space-x-2">
                          <AlertCircle className="w-4 h-4 text-red-400" />
                          <span className="text-red-300 text-sm">
                            {setDeadlineMutation.error.message}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Resolution Trigger - Always visible and functional for admin */}
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <Play className="w-5 h-5 text-green-400" />
                    <span className="text-white font-medium">{t('admin.admin_resolution_control')}</span>
                  </div>
                  
                  {participants.length >= 2 ? (
                    <button 
                      onClick={handleTriggerResolution}
                      disabled={triggerResolutionMutation.isPending || currentStage === 'resolution'}
                      className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors disabled:opacity-50 font-semibold w-full"
                    >
                      {triggerResolutionMutation.isPending ? (
                        <div className="flex items-center justify-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>{t('submission.assigning_santas')}</span>
                        </div>
                      ) : currentStage === 'resolution' ? (
                        <div className="flex items-center justify-center space-x-2">
                          <CheckCircle className="w-5 h-5" />
                          <span>{t('admin.resolution_already_active')}</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center space-x-2">
                          <Play className="w-5 h-5" />
                          <span>{t('admin.trigger_resolution')}</span>
                        </div>
                      )}
                    </button>
                  ) : (
                    <div className="text-yellow-700 bg-yellow-100 border border-yellow-300 rounded-lg p-3">
                      <p className="font-medium">{t('submission.need_more_participants')}</p>
                      <p className="text-sm">{t('submission.need_two_participants')}</p>
                    </div>
                  )}

                  {/* Success Message */}
                  {showResolutionSuccess && (
                    <div className="mt-3 bg-green-500/20 border border-green-500/50 rounded-lg p-3">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="text-green-300 text-sm">
                          Resolution triggered successfully! Assignments have been made.
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Error Message */}
                  {triggerResolutionMutation.error && (
                    <div className="mt-3 text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="font-medium">{t('submission.error_starting')}</p>
                      <p className="text-sm">{triggerResolutionMutation.error.message}</p>
                    </div>
                  )}

                  <p className="text-white/70 text-sm mt-2">
                    {t('admin.admin_trigger_desc')}
                  </p>
                </div>

                {/* Rollback to Submission - Only visible during resolution stage */}
                {currentStage === 'resolution' && (
                  <div className="bg-white/10 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-3">
                      <Undo2 className="w-5 h-5 text-purple-400" />
                      <span className="text-white font-medium">{t('admin.rollback_to_submission')}</span>
                    </div>
                    
                    <p className="text-white/70 text-sm mb-3">
                      {t('admin.rollback_desc')}
                    </p>

                    <button 
                      onClick={handleRollback}
                      disabled={rollbackMutation.isPending}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors disabled:opacity-50 font-semibold w-full"
                    >
                      {rollbackMutation.isPending ? (
                        <div className="flex items-center justify-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>{t('admin.rolling_back')}</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center space-x-2">
                          <Undo2 className="w-5 h-5" />
                          <span>{t('admin.rollback_to_submission')}</span>
                        </div>
                      )}
                    </button>

                    {/* Success Message */}
                    {rollbackMutation.isSuccess && (
                      <div className="mt-3 bg-green-500/20 border border-green-500/50 rounded-lg p-3">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-400" />
                          <span className="text-green-300 text-sm">{t('admin.rollback_success')}</span>
                        </div>
                      </div>
                    )}

                    {/* Error Message */}
                    {rollbackMutation.error && (
                      <div className="mt-3 bg-red-500/20 border border-red-500/50 rounded-lg p-3">
                        <div className="flex items-center space-x-2">
                          <AlertCircle className="w-4 h-4 text-red-400" />
                          <span className="text-red-300 text-sm">
                            {rollbackMutation.error.message}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Reset Round Button */}
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <RotateCcw className="w-5 h-5 text-orange-400" />
                    <span className="text-white font-medium">{t('admin.reset_round')}</span>
                  </div>
                  
                  <p className="text-white/70 text-sm mb-3">
                    Reset the entire round, archiving current data and starting fresh.
                  </p>

                  <button 
                    onClick={handleResetRound}
                    disabled={resetRoundMutation.isPending}
                    className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg transition-colors disabled:opacity-50 font-semibold w-full"
                  >
                    {resetRoundMutation.isPending ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>{t('admin.resetting')}</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center space-x-2">
                        <RotateCcw className="w-5 h-5" />
                        <span>{t('admin.reset_round')}</span>
                      </div>
                    )}
                  </button>

                  {/* Success Message */}
                  {showResetSuccess && (
                    <div className="mt-3 bg-green-500/20 border border-green-500/50 rounded-lg p-3">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="text-green-300 text-sm">Round reset successfully! All data has been cleared.</span>
                      </div>
                    </div>
                  )}

                  {/* Error Message */}
                  {resetRoundMutation.error && (
                    <div className="mt-3 bg-red-500/20 border border-red-500/50 rounded-lg p-3">
                      <div className="flex items-center space-x-2">
                        <AlertCircle className="w-4 h-4 text-red-400" />
                        <span className="text-red-300 text-sm">
                          {resetRoundMutation.error.message}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Info messages */}
                {currentStage === 'resolution' && (
                  <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-green-300 text-sm">
                        {t('admin.resolution_active')}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'assignments' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white mb-4">{t('admin.secret_santa_assignments')}</h3>
                
                {assignmentsLoading ? (
                  <div className="bg-white/10 rounded-lg p-4 text-center">
                    <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-white/70">{t('admin.loading_assignments')}</p>
                  </div>
                ) : assignmentsError ? (
                  <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <AlertCircle className="w-5 h-5 text-red-400" />
                      <span className="font-medium text-red-300">{t('admin.error_loading_assignments')}</span>
                    </div>
                    <p className="text-red-300 text-sm">
                      {assignmentsError.message}
                    </p>
                    {currentStage === 'submission' && (
                      <p className="text-red-200 text-xs mt-2">
                        {t('admin.assignments_only_resolution')}
                      </p>
                    )}
                  </div>
                ) : assignmentNames.length > 0 ? (
                  <div className="space-y-3">
                    <p className="text-white/80 text-sm mb-4">
                      {t('admin.all_assignment_pairs')}
                    </p>
                    {assignmentNames.map(([santaName, recipientName], index) => (
                      <div
                        key={index}
                        className="bg-white/10 rounded-lg p-4 flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="text-center">
                            <p className="text-white font-medium text-sm">{t('admin.secret_santa')}</p>
                            <p className="text-white/90 font-semibold">
                              {santaName}
                            </p>
                          </div>
                          <div className="text-gold-400 text-xl">→</div>
                          <div className="text-center">
                            <p className="text-white font-medium text-sm">{t('admin.recipient')}</p>
                            <p className="text-white/90 font-semibold">
                              {recipientName}
                            </p>
                          </div>
                        </div>
                        <div className="text-white/60 text-sm">
                          #{index + 1}
                        </div>
                      </div>
                    ))}
                    
                    <div className="mt-4 p-3 bg-green-500/20 border border-green-500/50 rounded-lg">
                      <p className="text-green-300 text-sm text-center">
                        {t('admin.pairs_assigned', { 
                          count: assignmentNames.length,
                          pairs: assignmentNames.length === 1 ? t('admin.pair') : t('admin.pairs')
                        })}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white/10 rounded-lg p-4 text-center">
                    <UserCheck className="w-12 h-12 text-white/50 mx-auto mb-4" />
                    <p className="text-white/70">{t('admin.no_assignments')}</p>
                    <p className="text-white/50 text-sm mt-2">
                      {currentStage === 'submission' 
                        ? t('admin.assignments_after_resolution')
                        : t('admin.assignments_after_begin')
                      }
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'participants' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white mb-4">{t('admin.delete_participant')}</h3>
                
                {showDeleteSuccess && (
                  <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-3 mb-4">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-green-300 text-sm">{t('admin.delete_success')}</span>
                    </div>
                  </div>
                )}

                {!isDeleteAvailable && (
                  <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-3 mb-4">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4 text-yellow-400" />
                      <span className="text-yellow-300 text-sm">
                        {currentStage === 'resolution' 
                          ? 'Participant deletion is only available during the submission stage. Use rollback to return to submission stage first.'
                          : 'Participant deletion is only available during the submission stage.'
                        }
                      </span>
                    </div>
                  </div>
                )}

                {participants.length === 0 ? (
                  <div className="bg-white/10 rounded-lg p-4 text-center">
                    <Users className="w-12 h-12 text-white/50 mx-auto mb-4" />
                    <p className="text-white/70">{t('participants.no_participants')}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-white/80 text-sm mb-4">
                      Manage participants. You can delete other participants during the submission stage, but not yourself.
                    </p>
                    {participants.map((participantName, index) => {
                      const isCurrentUser = participantName === profile.name;
                      const canDelete = isDeleteAvailable && !isCurrentUser;
                      
                      return (
                        <div
                          key={`${participantName}-${index}`}
                          className="bg-white/10 rounded-lg p-4 flex items-center justify-between"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                              <Users className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <p className="text-white font-medium">{participantName}</p>
                              {isCurrentUser && (
                                <p className="text-xs text-gold-400">{t('participants.you')}</p>
                              )}
                            </div>
                          </div>
                          
                          {canDelete ? (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <button
                                  className="text-red-400 hover:text-red-300 hover:bg-red-500/20 p-2 rounded-lg transition-colors"
                                  title={t('admin.delete_participant')}
                                >
                                  <Trash2 className="w-5 h-5" />
                                </button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="bg-gray-900 border-gray-700">
                                <AlertDialogHeader>
                                  <AlertDialogTitle className="text-white">
                                    {t('admin.delete_confirm')}
                                  </AlertDialogTitle>
                                  <AlertDialogDescription className="text-gray-300">
                                    {t('admin.delete_confirm_desc', { name: participantName })}
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel className="bg-gray-700 text-white hover:bg-gray-600">
                                    {t('common.cancel')}
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteParticipant(participantName)}
                                    className="bg-red-600 text-white hover:bg-red-700"
                                  >
                                    {deleteParticipantMutation.isPending ? t('admin.deleting') : t('common.delete')}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          ) : (
                            !isCurrentUser && (
                              <div className="text-white/40 p-2">
                                <Trash2 className="w-5 h-5" />
                              </div>
                            )
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {deleteParticipantMutation.error && (
                  <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4 text-red-400" />
                      <span className="text-red-300 text-sm">
                        {deleteParticipantMutation.error.message}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
