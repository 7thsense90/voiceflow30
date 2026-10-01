import React from 'react';

interface AdSenseAdProps {
  slot?: string;
  format?: 'auto' | 'fluid' | 'rectangle' | 'horizontal';
  responsive?: boolean;
  className?: string;
  label?: string;
  adPlacementKey?: 'enableDirectoryBannerAd' | 'enableArticleInContentAd' | 'enableChatBreakAd' | 'enableNewsFeedAd';
}

export const AdSenseAd: React.FC<AdSenseAdProps> = () => {
  // Disabled as requested to remove advertisement banners popping up on pages
  return null;
};

export default AdSenseAd;
