import React, { useState, useEffect } from 'react';
import { checkAdPlacementAllowed } from '../utils/adPolicy';
import { hasAdvertisingConsent, CONSENT_EVENT_NAME } from '../utils/cookieConsent';

interface AdSenseAdProps {
  slot?: string;
  client?: string;
  format?: 'auto' | 'fluid' | 'rectangle' | 'horizontal';
  responsive?: boolean;
  className?: string;
  label?: string;
  articleStatus?: string;
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
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
  const allowCheck = checkAdPlacementAllowed(currentPath, undefined, articleStatus);
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

  useEffect(() => {
    if (allowCheck.isAllowed && hasConsent && typeof window !== 'undefined') {
      try {
        const adsbygoogle = (window as unknown as { adsbygoogle?: unknown[] }).adsbygoogle;
        if (adsbygoogle) {
          adsbygoogle.push({});
        }
      } catch (err) {
        // Suppress AdSense push errors if already loaded or blocked by privacy extension
        console.debug('AdSense unit note:', err);
      }
    }
  }, [allowCheck.isAllowed, hasConsent]);

  if (!allowCheck.isAllowed) {
    return null;
  }

  // If user declined advertising cookies, do not load or push Google AdSense ads
  if (!hasConsent) {
    return (
      <div className={`my-8 p-4 bg-slate-50/70 border border-dashed border-slate-200 rounded-2xl text-center text-xs text-slate-400 ${className}`}>
        <span className="font-semibold text-slate-500">Sponsored Intelligence Area</span>
        <p className="text-[11px] text-slate-400 mt-0.5">
          Advertising cookies declined — no tracking or personalized ads loaded.
        </p>
      </div>
    );
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
