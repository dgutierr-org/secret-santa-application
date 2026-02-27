import React from 'react';
import { Users, User } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useUserProfile } from '../hooks/useQueries';

interface ParticipantsListProps {
  participants: string[];
}

// Component to display individual participant
function ParticipantItem({ name, index }: { name: string; index: number }) {
  const { t } = useLanguage();
  const { data: currentUserProfile } = useUserProfile();
  
  const isCurrentUser = currentUserProfile?.name === name;
  
  return (
    <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-red-50 to-green-50 rounded-xl border border-red-200 hover:shadow-md transition-shadow">
      <div className="flex-shrink-0">
        <div className="w-10 h-10 bg-red-200 rounded-full flex items-center justify-center border-2 border-red-300">
          <User className="w-5 h-5 text-red-600" />
        </div>
      </div>
      <div className="flex-1">
        <p className="font-medium text-gray-800">{name}</p>
        {isCurrentUser && (
          <p className="text-xs text-blue-600 font-medium">{t('participants.you')}</p>
        )}
      </div>
      <div className="text-green-600 text-sm font-medium">
        {t('participants.joined')}
      </div>
    </div>
  );
}

export default function ParticipantsList({ participants }: ParticipantsListProps) {
  const { t } = useLanguage();

  if (participants.length === 0) {
    return (
      <div className="text-center py-8">
        <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">{t('participants.no_participants')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-600 mb-4">
        {t('participants.hidden_wish_lists')}
      </p>
      
      <div className="grid gap-3">
        {participants.map((name, index) => (
          <ParticipantItem 
            key={`${name}-${index}`} 
            name={name} 
            index={index} 
          />
        ))}
      </div>
      
      <div className="mt-6 p-4 bg-gold-50 border border-gold-200 rounded-xl">
        <p className="text-sm text-gold-800 text-center">
          {t('participants.people_joined', { 
            count: participants.length,
            people: participants.length === 1 ? t('participants.person_has') : t('participants.people_have')
          })}
        </p>
      </div>
    </div>
  );
}
