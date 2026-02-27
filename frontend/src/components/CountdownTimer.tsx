import React, { useState, useEffect } from 'react';
import { Clock, Calendar } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface CountdownTimerProps {
  deadline: Date;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export default function CountdownTimer({ deadline }: CountdownTimerProps) {
  const { t } = useLanguage();
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = deadline.getTime() - new Date().getTime();
      
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
        setIsExpired(false);
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        setIsExpired(true);
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [deadline]);

  if (isExpired) {
    return (
      <div className="text-center">
        <div className="bg-red-100 border-2 border-red-300 rounded-2xl p-6">
          <Calendar className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-red-800 mb-2">{t('submission.deadline_passed')}</h3>
          <p className="text-red-600">{t('submission.waiting_admin')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="text-center">
      <div className="bg-gradient-to-br from-red-500 to-red-600 text-white rounded-xl p-6 shadow-lg mb-6 max-w-lg mx-auto">
        <div className="grid grid-cols-4 gap-3 text-center">
          <div className="flex flex-col items-center">
            <div className="text-xl sm:text-2xl font-bold mb-1">{timeLeft.days.toString().padStart(2, '0')}</div>
            <div className="text-xs sm:text-sm font-medium opacity-90">{t('countdown.days')}</div>
          </div>
          <div className="flex flex-col items-center">
            <div className="text-xl sm:text-2xl font-bold mb-1">{timeLeft.hours.toString().padStart(2, '0')}</div>
            <div className="text-xs sm:text-sm font-medium opacity-90">{t('countdown.hours')}</div>
          </div>
          <div className="flex flex-col items-center">
            <div className="text-xl sm:text-2xl font-bold mb-1">{timeLeft.minutes.toString().padStart(2, '0')}</div>
            <div className="text-xs sm:text-sm font-medium opacity-90">{t('countdown.minutes')}</div>
          </div>
          <div className="flex flex-col items-center">
            <div className="text-xl sm:text-2xl font-bold mb-1">{timeLeft.seconds.toString().padStart(2, '0')}</div>
            <div className="text-xs sm:text-sm font-medium opacity-90">{t('countdown.seconds')}</div>
          </div>
        </div>
      </div>
      
      <div className="bg-green-100 border-2 border-green-300 rounded-xl p-4">
        <Clock className="w-6 h-6 text-green-600 inline mr-2" />
        <span className="text-green-800 font-medium">
          {t('countdown.deadline', { 
            date: deadline.toLocaleDateString(), 
            time: deadline.toLocaleTimeString() 
          })}
        </span>
      </div>
    </div>
  );
}
