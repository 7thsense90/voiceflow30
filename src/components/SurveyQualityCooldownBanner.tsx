import React from 'react';
import { useApp } from '../context/AppContext';
import { SurveyCooldownTimer } from './SurveyCooldownTimer';
import { Clock, ShieldCheck, Sparkles, RotateCcw, Info, UserPlus, Gift } from 'lucide-react';

export const SurveyQualityCooldownBanner: React.FC = () => {
  const {
    currentUser,
    isSurveyLimitReached,
    surveyCooldownUntil,
    clearSurveyCooldown,
    setIsSurveyCooldownModalOpen,
    setCurrentView,
  } = useApp();

  // Business rule: Never display anything about the limit until 5 surveys/quizzes are completed
  if (!isSurveyLimitReached || !surveyCooldownUntil) {
    return null;
  }

  const unlockDate = new Date(surveyCooldownUntil);
  const formattedTime = unlockDate.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  const isAdmin = currentUser?.role === 'admin';

  return (
    <div
      id="survey-quality-cooldown-banner"
      className="bg-gradient-to-r from-amber-500/15 via-yellow-500/10 to-emerald-500/15 border-2 border-amber-400/90 rounded-3xl p-5 sm:p-6 shadow-sm relative overflow-hidden animate-in fade-in"
    >
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5 relative z-10">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 shadow-md shadow-amber-500/20">
            <Clock className="w-6 h-6 stroke-[2.5]" />
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-200/90 text-amber-950">
                <ShieldCheck className="w-3 h-3" />
                <span>Daily Limit Reached • 5 Surveys & Quizzes Completed</span>
              </span>
            </div>

            <h3 className="text-base sm:text-lg font-black text-slate-950">
              Daily Earning Cap Reached (5/5) — Next Slots Unlock In:
            </h3>

            <p className="text-xs text-slate-700 max-w-xl leading-relaxed">
              Customers can take a maximum of 5 surveys &amp; quizzes per day. <strong>Want to keep earning today?</strong> Share your link on social profiles, WhatsApp, or copy link — you will be credited <strong>300 Reward Coins</strong> only when someone joins from the invitations! Participate in studies and earn rewards.
            </p>
          </div>
        </div>

        {/* Live Countdown & Actions */}
        <div className="flex flex-wrap items-center gap-2.5 self-stretch md:self-auto justify-between md:justify-end">
          <SurveyCooldownTimer targetDate={surveyCooldownUntil} size="md" />

          <button
            id="banner-invite-friends-btn"
            onClick={() => setIsSurveyCooldownModalOpen(true)}
            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 text-xs font-black rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Invite Friends (+300 Coins)</span>
          </button>

          <button
            id="view-cooldown-details-btn"
            onClick={() => setIsSurveyCooldownModalOpen(true)}
            className="px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
            title="View details & send invite via email/phone"
          >
            <Info className="w-3.5 h-3.5 text-slate-500" />
            <span>Options</span>
          </button>

          {isAdmin && (
            <button
              id="banner-admin-reset-btn"
              onClick={clearSurveyCooldown}
              className="px-3 py-2 bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
              title="Reset daily limit for testing (Admin only)"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
