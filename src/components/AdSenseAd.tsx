import React, { useEffect } from 'react';
import { checkAdPlacementAllowed } from '../utils/adPolicy';

interface AdSenseAdProps {
  slot?: string;
  format?: 'auto' | 'fluid' | 'rectangle' | 'horizontal';
  responsive?: boolean;
  className?: string;
  label?: string;
  articleStatus?: string;
}

export const AdSenseAd: React.FC<AdSenseAdProps> = ({
  slot,
  format = 'auto',
  responsive = true,
  className = '',
  label = 'Advertisement',
  articleStatus = 'published',
}) => {
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
  const allowCheck = checkAdPlacementAllowed(currentPath, undefined, articleStatus);

  useEffect(() => {
    if (allowCheck.isAllowed && typeof window !== 'undefined') {
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
  }, [allowCheck.isAllowed]);

  if (!allowCheck.isAllowed) {
    return null;
  }

  return (
    <div className={`my-8 p-3 bg-slate-50/80 border border-slate-200 rounded-2xl text-center overflow-hidden ${className}`}>
      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-2">{label}</span>
      <ins
        className="adsbygoogle block w-full text-center"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-2513423020167554"
        data-ad-slot={slot || '9876543210'}
        data-ad-format={format}
        data-full-width-responsive={responsive ? 'true' : 'false'}
      />
    </div>
  );
};

export default AdSenseAd;
