import React, { useState } from 'react';
import { Mail, Send, CheckCircle2, AlertCircle, Bell, Sparkles, ShieldCheck, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { NewsletterPreferences } from '../types';

interface NewsletterSignupProps {
  variant?: 'footer' | 'inline' | 'compact';
  onSubscribed?: (email: string) => void;
  className?: string;
}

export const NewsletterSignup: React.FC<NewsletterSignupProps> = ({
  variant = 'footer',
  onSubscribed,
  className = '',
}) => {
  const { currentUser, subscribeToNewsletter, newsletterSubscribers } = useApp();

  const [email, setEmail] = useState<string>(() => currentUser?.email || '');
  const [preferences, setPreferences] = useState<NewsletterPreferences>({
    newSurveys: true,
    platformUpdates: true,
    weeklyDigest: false,
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<{
    subscribedEmail: string;
    message: string;
    isAlreadySubscribed?: boolean;
  } | null>(null);

  const totalSubscribersCount = 48500 + newsletterSubscribers.length;

  const handleTogglePref = (key: keyof NewsletterPreferences) => {
    setPreferences((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      // Ensure at least one preference is selected
      if (!next.newSurveys && !next.platformUpdates && !next.weeklyDigest) {
        return prev;
      }
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmed = email.trim();
    if (!trimmed) {
      setErrorMessage('Please enter your email address to receive alerts.');
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(trimmed)) {
      setErrorMessage('Please provide a valid email format (e.g., alex@domain.com).');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await subscribeToNewsletter(trimmed, preferences);
      if (res.success) {
        setSuccessInfo({
          subscribedEmail: trimmed,
          message: res.message,
          isAlreadySubscribed: res.isAlreadySubscribed,
        });
        if (onSubscribed) {
          onSubscribed(trimmed);
        }
      } else {
        setErrorMessage(res.message || 'Unable to subscribe at this time. Please try again.');
      }
    } catch {
      setErrorMessage('An unexpected error occurred. Please check your connection and retry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setSuccessInfo(null);
    setErrorMessage(null);
    setEmail('');
  };

  return (
    <div
      id="newsletter-signup-card"
      className={`relative overflow-hidden rounded-2xl border border-slate-700/80 bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-950 text-slate-100 p-6 sm:p-8 shadow-xl ${className}`}
    >
      {/* Subtle Background Glow Accents */}
      <div
        className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full bg-purple-500/10 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-amber-500/10 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative z-10">
        {successInfo ? (
          /* Success Confirmation View */
          <div
            id="newsletter-signup-success-view"
            className="flex flex-col items-center text-center py-4 sm:py-6 animate-fade-in"
          >
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mb-4 shadow-lg shadow-emerald-950/40">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-900/60 border border-emerald-700/60 text-emerald-300 text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{successInfo.isAlreadySubscribed ? 'Preferences Saved' : 'Subscription Confirmed'}</span>
            </span>

            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {successInfo.isAlreadySubscribed
                ? 'Your Alert Preferences Are Active!'
                : "You're on the Priority Survey Alert List!"}
            </h3>

            <p className="text-slate-300 text-sm max-w-lg mt-2 leading-relaxed">
              We have linked <span className="font-semibold text-white underline decoration-purple-400">{successInfo.subscribedEmail}</span>.
              Whenever high-yield brand questionnaires or exciting platform updates roll out, you will receive prompt notifications.
            </p>

            {/* Active alerts summary pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-xs">
              {preferences.newSurveys && (
                <span className="flex items-center gap-1 bg-purple-950/80 border border-purple-600/40 text-purple-200 px-3 py-1 rounded-full font-medium">
                  <Bell className="w-3 h-3 text-purple-400" />
                  New Survey Alerts
                </span>
              )}
              {preferences.platformUpdates && (
                <span className="flex items-center gap-1 bg-amber-950/80 border border-amber-600/40 text-amber-200 px-3 py-1 rounded-full font-medium">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  Platform Updates
                </span>
              )}
              {preferences.weeklyDigest && (
                <span className="flex items-center gap-1 bg-sky-950/80 border border-sky-600/40 text-sky-200 px-3 py-1 rounded-full font-medium">
                  <Mail className="w-3 h-3 text-sky-400" />
                  Weekly Earnings Digest
                </span>
              )}
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                id="newsletter-subscribe-another-btn"
                onClick={handleResetForm}
                className="px-4 py-2 text-xs font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-600/60 rounded-xl transition-colors cursor-pointer"
              >
                Register Another Email
              </button>
            </div>
          </div>
        ) : (
          /* Default Subscription Form */
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 lg:gap-10">
            {/* Left Column: Heading & Value Proposition */}
            <div className="max-w-xl">
              <div className="flex items-center gap-2 mb-2.5">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-950/70 border border-purple-500/40 text-purple-300 text-xs font-extrabold tracking-wide uppercase">
                  <Bell className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
                  <span>Stay Informed</span>
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  • {totalSubscribersCount.toLocaleString()}+ Members Subscribed
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug">
                Get New Survey Alerts & Platform Updates
              </h3>

              <p className="text-slate-300 text-sm mt-2 leading-relaxed">
                Be the first to know when high-paying brand questionnaires launch (earn up to 500 coins per study), and receive real-time notices on new payout methods, bonus codes, and platform improvements.
              </p>

              {/* Preference Checkboxes */}
              <div className="mt-4 flex flex-wrap items-center gap-3 text-xs">
                <label
                  id="pref-survey-alerts-label"
                  onClick={() => handleTogglePref('newSurveys')}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all cursor-pointer select-none ${
                    preferences.newSurveys
                      ? 'bg-purple-900/40 border-purple-500/50 text-purple-200 shadow-2xs font-semibold'
                      : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded flex items-center justify-center border transition-colors ${
                      preferences.newSurveys
                        ? 'bg-purple-600 border-purple-500 text-white'
                        : 'border-slate-600 bg-slate-900'
                    }`}
                  >
                    {preferences.newSurveys && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <span>New Survey Alerts</span>
                </label>

                <label
                  id="pref-platform-updates-label"
                  onClick={() => handleTogglePref('platformUpdates')}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all cursor-pointer select-none ${
                    preferences.platformUpdates
                      ? 'bg-amber-900/40 border-amber-500/50 text-amber-200 shadow-2xs font-semibold'
                      : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded flex items-center justify-center border transition-colors ${
                      preferences.platformUpdates
                        ? 'bg-amber-600 border-amber-500 text-white'
                        : 'border-slate-600 bg-slate-900'
                    }`}
                  >
                    {preferences.platformUpdates && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <span>Platform Updates &amp; Bonus Drops</span>
                </label>

                <label
                  id="pref-weekly-digest-label"
                  onClick={() => handleTogglePref('weeklyDigest')}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all cursor-pointer select-none ${
                    preferences.weeklyDigest
                      ? 'bg-sky-900/40 border-sky-500/50 text-sky-200 shadow-2xs font-semibold'
                      : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded flex items-center justify-center border transition-colors ${
                      preferences.weeklyDigest
                        ? 'bg-sky-600 border-sky-500 text-white'
                        : 'border-slate-600 bg-slate-900'
                    }`}
                  >
                    {preferences.weeklyDigest && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <span>Weekly Digest</span>
                </label>
              </div>
            </div>

            {/* Right Column: Input Box & Submit Action */}
            <div className="w-full lg:max-w-md">
              <form onSubmit={handleSubmit} className="space-y-2.5">
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                    <Mail className="w-5 h-5" />
                  </div>
                  <input
                    id="newsletter-email-input"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    placeholder="Enter your email for instant alerts..."
                    aria-label="Email address for survey alerts and platform updates"
                    required
                    disabled={isSubmitting}
                    className={`w-full pl-11 pr-32 py-3.5 bg-slate-950/90 text-white text-sm placeholder-slate-400 rounded-xl border focus:outline-none transition-all shadow-inner ${
                      errorMessage
                        ? 'border-rose-500 focus:ring-2 focus:ring-rose-500/40'
                        : 'border-slate-700 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30'
                    }`}
                  />
                  <button
                    type="submit"
                    id="newsletter-submit-btn"
                    disabled={isSubmitting}
                    className="absolute right-1.5 top-1.5 bottom-1.5 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 shadow-md hover:shadow-purple-600/30 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-95"
                  >
                    {isSubmitting ? (
                      <span className="inline-flex items-center gap-1.5">
                        <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Subscribing...</span>
                      </span>
                    ) : (
                      <>
                        <span>Subscribe</span>
                        <Send className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>

                {/* Error Message */}
                {errorMessage && (
                  <div
                    id="newsletter-error-message"
                    className="flex items-center gap-1.5 text-xs text-rose-400 font-medium bg-rose-950/40 border border-rose-800/50 px-3 py-1.5 rounded-lg animate-shake"
                  >
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Trust & Privacy Notice */}
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Zero spam guarantee • Unsubscribe anytime</span>
                  </span>
                  <span className="text-slate-500 hidden sm:inline">
                    100% Free Forever
                  </span>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
