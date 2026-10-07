import React, { useState, useEffect } from 'react';
import { Cookie, ShieldCheck, X, Check, Settings2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  saveCookieConsent,
  getStoredCookieConsent,
  syncGoogleConsentMode,
} from '../utils/cookieConsent';

export const CookieConsentBanner: React.FC = () => {
  const { setCurrentView } = useApp();
  const [isVisible, setIsVisible] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState({
    essential: true, // Always required for login and survey state
    analytics: true,
    advertising: true, // For Google AdSense personalized ads
  });

  useEffect(() => {
    // Check if user has already made a cookie choice
    const savedConsent = getStoredCookieConsent();
    if (!savedConsent) {
      // Delay slightly for smooth entry
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 900);
      return () => clearTimeout(timer);
    } else {
      // Ensure Google Consent Mode is synchronized with stored choice
      syncGoogleConsentMode(savedConsent.advertising, savedConsent.analytics);
    }
  }, []);

  const handleAcceptAll = () => {
    saveCookieConsent({ analytics: true, advertising: true }, 'accept_all');
    setIsVisible(false);
  };

  const handleRejectNonEssential = () => {
    saveCookieConsent({ analytics: false, advertising: false }, 'essential_only');
    setIsVisible(false);
  };

  const handleSaveCustom = () => {
    saveCookieConsent(
      { analytics: preferences.analytics, advertising: preferences.advertising },
      'custom'
    );
    setIsVisible(false);
    setShowPreferences(false);
  };

  if (!isVisible) return null;

  return (
    <aside
      aria-label="Cookie consent banner"
      id="cookie-consent-banner"
      className="fixed bottom-3 left-3 right-3 sm:left-6 sm:right-auto sm:max-w-xl z-50 bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-2xl shadow-slate-900/15 animate-in fade-in slide-in-from-bottom-5 duration-300"
    >
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
          <Cookie className="w-5 h-5" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
              <span>Cookie &amp; Privacy Choices</span>
              <ShieldCheck className="w-4 h-4 text-purple-600" />
            </h3>
            <button
              onClick={handleRejectNonEssential}
              className="text-slate-400 hover:text-slate-600 p-1 -mr-1 rounded-lg transition-colors cursor-pointer"
              aria-label="Close cookie consent banner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
            We use essential cookies to operate the website. With your permission, we may also use optional cookies for analytics. If advertising is enabled following approval, Google and its partners may use cookies to serve ads, subject to your consent choices where required. See our <button type="button" onClick={() => setCurrentView('privacy')} className="font-semibold text-purple-700 underline cursor-pointer">Privacy Policy</button> for details.
          </p>

          {showPreferences && (
            <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-800">Strictly Necessary</span>
                  <p className="text-[11px] text-slate-400">Required for authentication and reward balances.</p>
                </div>
                <span className="text-[11px] font-bold text-slate-400 uppercase">Always Active</span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-800">Analytics &amp; Performance</span>
                  <p className="text-[11px] text-slate-400">Helps us evaluate survey completion rates.</p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.analytics}
                  onChange={(e) => setPreferences({ ...preferences, analytics: e.target.checked })}
                  className="rounded text-purple-600 focus:ring-purple-500 w-4 h-4 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-800">AdSense &amp; Personalized Ads</span>
                  <p className="text-[11px] text-slate-400">Tailored advertising powered by Google AdSense.</p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.advertising}
                  onChange={(e) => setPreferences({ ...preferences, advertising: e.target.checked })}
                  className="rounded text-purple-600 focus:ring-purple-500 w-4 h-4 cursor-pointer"
                />
              </div>
            </div>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-2">
            {!showPreferences ? (
              <>
                <button
                  id="cookie-consent-accept-all-btn"
                  onClick={handleAcceptAll}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-98"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Accept All</span>
                </button>

                <button
                  id="cookie-consent-reject-btn"
                  onClick={handleRejectNonEssential}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all cursor-pointer active:scale-98"
                >
                  Essential Only
                </button>

                <button
                  id="cookie-consent-customize-btn"
                  onClick={() => setShowPreferences(true)}
                  className="px-3 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Settings2 className="w-3.5 h-3.5" />
                  <span>Preferences</span>
                </button>
              </>
            ) : (
              <>
                <button
                  id="cookie-consent-save-preferences-btn"
                  onClick={handleSaveCustom}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-98"
                >
                  Save Preferences
                </button>
                <button
                  onClick={() => setShowPreferences(false)}
                  className="px-3 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                >
                  Back
                </button>
              </>
            )}

            <button
              onClick={() => setCurrentView('privacy')}
              className="text-[11px] text-purple-700 hover:underline ml-auto font-medium cursor-pointer"
            >
              Privacy Policy
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};
