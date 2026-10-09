import React, { useState, useEffect } from 'react';
import { checkAdPlacementAllowed } from '../utils/adPolicy';
import { hasAdvertisingConsent, CONSENT_EVENT_NAME } from '../utils/cookieConsent';
import { useApp } from '../context/AppContext';

interface AdSenseAdProps {
  slot?: string;
  client?: string;
  format?: 'auto' | 'fluid' | 'rectangle' | 'horizontal';
  responsive?: boolean;
  className?: string;
  label?: string;
  articleStatus?: string;
}

function ensureAdSenseScriptLoaded(clientId: string) {
  if (typeof window === 'undefined') return;
  const scriptId = 'google-adsense-script';
  if (!document.getElementById(scriptId)) {
    const script = document.createElement('script');
    script.id = scriptId;
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`;
    document.head.appendChild(script);
  }
}

export const AdSenseAd: React.FC<AdSenseAdProps> = ({
  slot,
  client = 'ca-pub-9382580390401269',
  format = 'auto',
  responsive = true,
  className = '',
  label = 'Advertisement',
  articleStatus = 'published',
}) => {
  const { settings, currentView } = useApp();
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
  const allowCheck = checkAdPlacementAllowed(currentPath, currentView, articleStatus);
  const [hasConsent, setHasConsent] = useState<boolean>(() => hasAdvertisingConsent());

  // Listen to cookie consent updates in real time
  useEffect(() => {
    const handleConsentChange = () => {
      setHasConsent(hasAdvertisingConsent());
    };

    window.addEventListener(CONSENT_EVENT_NAME, handleConsentChange);
    window.addEventListener('storage', handleConsentChange);

    return () => {
      window.removeEventListener(CONSENT_EVENT_NAME, handleConsentChange);
      window.removeEventListener('storage', handleConsentChange);
    };
  }, []);

  const isEnabled = settings.adsenseEnabled !== false;

  useEffect(() => {
    if (allowCheck.isAllowed && hasConsent && isEnabled && typeof window !== 'undefined') {
      ensureAdSenseScriptLoaded(client);
      try {
        const adsbygoogle = (window as unknown as { adsbygoogle?: unknown[] }).adsbygoogle;
        if (adsbygoogle) {
          adsbygoogle.push({});
        }
      } catch (err) {
        // Suppress push note if already pushed or blocked by privacy filter
        console.debug('AdSense placement note:', err);
      }
    }
  }, [allowCheck.isAllowed, hasConsent, isEnabled, client]);

  // Strict Policy: Do not render ads or empty promotional placeholders on unallowed routes,
  // when consent has not been granted, or when adsense is globally disabled.
  if (!allowCheck.isAllowed || !hasConsent || !isEnabled) {
    return null;
  }

  return (
    <div className={`my-8 p-3 bg-slate-50/80 border border-slate-200 rounded-2xl text-center overflow-hidden ${className}`}>
      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-2">{label}</span>
      <ins
        className="adsbygoogle block w-full text-center"
        style={{ display: 'block' }}
        data-ad-client={client || "ca-pub-9382580390401269"}
        data-ad-slot={slot || '9876543210'}
        data-ad-format={format}
        data-full-width-responsive={responsive ? 'true' : 'false'}
      />
    </div>
  );
};

export default AdSenseAd;
