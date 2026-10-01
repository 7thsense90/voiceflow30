import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface SurveyCooldownTimerProps {
  targetDate: string | null;
  size?: 'sm' | 'md' | 'lg';
  showLabels?: boolean;
  onExpire?: () => void;
  className?: string;
}

export const SurveyCooldownTimer: React.FC<SurveyCooldownTimerProps> = ({
  targetDate,
  size = 'md',
  showLabels = true,
  onExpire,
  className = '',
}) => {
  const [timeLeft, setTimeLeft] = useState<{
    hours: number;
    minutes: number;
    seconds: number;
    totalMs: number;
  }>(() => calculateTimeLeft(targetDate));

  function calculateTimeLeft(target: string | null) {
    if (!target) {
      return { hours: 0, minutes: 0, seconds: 0, totalMs: 0 };
    }
    const diff = new Date(target).getTime() - Date.now();
    if (diff <= 0) {
      return { hours: 0, minutes: 0, seconds: 0, totalMs: 0 };
    }
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    return { hours, minutes, seconds, totalMs: diff };
  }

  useEffect(() => {
    if (!targetDate) return;

    const interval = setInterval(() => {
      const updated = calculateTimeLeft(targetDate);
      setTimeLeft(updated);
      if (updated.totalMs <= 0) {
        clearInterval(interval);
        if (onExpire) {
          onExpire();
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate, onExpire]);

  const pad = (n: number) => n.toString().padStart(2, '0');

  if (size === 'sm') {
    return (
      <span className={`inline-flex items-center gap-1.5 font-mono font-bold text-xs ${className}`}>
        <Clock className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
        <span>
          {pad(timeLeft.hours)}:{pad(timeLeft.minutes)}:{pad(timeLeft.seconds)}
        </span>
      </span>
    );
  }

  if (size === 'lg') {
    return (
      <div className={`flex items-center justify-center gap-2 sm:gap-3 ${className}`}>
        {/* Hours */}
        <div className="flex flex-col items-center">
          <div className="w-14 sm:w-16 py-2 sm:py-2.5 bg-slate-900 text-white rounded-2xl shadow-sm border border-slate-800 text-center font-mono font-black text-xl sm:text-2xl tracking-wider">
            {pad(timeLeft.hours)}
          </div>
          {showLabels && (
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1.5">
              Hours
            </span>
          )}
        </div>

        <span className="font-mono font-bold text-xl sm:text-2xl text-slate-400 mb-4 sm:mb-5 animate-pulse">
          :
        </span>

        {/* Minutes */}
        <div className="flex flex-col items-center">
          <div className="w-14 sm:w-16 py-2 sm:py-2.5 bg-slate-900 text-white rounded-2xl shadow-sm border border-slate-800 text-center font-mono font-black text-xl sm:text-2xl tracking-wider">
            {pad(timeLeft.minutes)}
          </div>
          {showLabels && (
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1.5">
              Mins
            </span>
          )}
        </div>

        <span className="font-mono font-bold text-xl sm:text-2xl text-slate-400 mb-4 sm:mb-5 animate-pulse">
          :
        </span>

        {/* Seconds */}
        <div className="flex flex-col items-center">
          <div className="w-14 sm:w-16 py-2 sm:py-2.5 bg-slate-900 text-amber-400 rounded-2xl shadow-sm border border-slate-800 text-center font-mono font-black text-xl sm:text-2xl tracking-wider">
            {pad(timeLeft.seconds)}
          </div>
          {showLabels && (
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1.5">
              Secs
            </span>
          )}
        </div>
      </div>
    );
  }

  // Medium default size
  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <div className="px-2.5 py-1 bg-slate-900 text-white rounded-xl font-mono font-bold text-sm shadow-xs border border-slate-800">
        {pad(timeLeft.hours)}h
      </div>
      <span className="font-mono text-slate-400 font-bold">:</span>
      <div className="px-2.5 py-1 bg-slate-900 text-white rounded-xl font-mono font-bold text-sm shadow-xs border border-slate-800">
        {pad(timeLeft.minutes)}m
      </div>
      <span className="font-mono text-slate-400 font-bold">:</span>
      <div className="px-2.5 py-1 bg-slate-900 text-amber-400 rounded-xl font-mono font-bold text-sm shadow-xs border border-slate-800">
        {pad(timeLeft.seconds)}s
      </div>
    </div>
  );
};
