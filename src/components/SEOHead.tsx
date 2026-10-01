import React, { useEffect } from 'react';

export interface SEOHeadProps {
  title: string;
  description: string;
  keywords?: string[];
  canonicalPath?: string;
  ogType?: 'website' | 'article';
  ogImage?: string;
  structuredData?: Record<string, unknown> | Array<Record<string, unknown>>;
  noIndex?: boolean;
}

/**
 * Reusable SEO Head component providing dynamic meta tags, Open Graph tags,
 * canonical links, and Schema.org JSON-LD structured data.
 * React 19 natively hoists title/meta/link to <head>, and this component
 * also ensures DOM meta tags and canonical links are immediately synced for
 * external crawlers, social share bots, and browser history.
 */
export const SEOHead: React.FC<SEOHeadProps> = ({
  title,
  description,
  keywords,
  canonicalPath = '',
  ogType = 'website',
  ogImage,
  structuredData,
  noIndex = false,
}) => {
  // Format formatted brand title
  const siteName = 'Voice Flow 360';
  const fullTitle = title.includes('Voice Flow 360') ? title : `${title} | Voice Flow 360`;

  // Compute canonical URL
  const origin =
    typeof window !== 'undefined' &&
    window.location.hostname !== 'localhost' &&
    !window.location.hostname.includes('.run.app')
      ? window.location.origin
      : 'https://voiceflow360.com';
  const cleanPath = canonicalPath ? (canonicalPath.startsWith('/') ? canonicalPath : `/${canonicalPath}`) : '';
  const canonicalUrl = `${origin}${cleanPath}`;
  const defaultImage = `${origin}/og-image.png`;
  const shareImage = ogImage || defaultImage;

  const defaultKeywords = [
    'market research',
    'consumer feedback',
    'voice flow 360',
    'chat surveys',
    'brand insights',
    'research honorariums',
    'consumer rewards',
    'user research studies',
    'verified opinions',
  ];
  const combinedKeywords = keywords && keywords.length > 0 
    ? Array.from(new Set([...keywords, ...defaultKeywords])).join(', ')
    : defaultKeywords.join(', ');

  // Direct DOM Head synchronization for crawlers, social bots & dynamic SPA updates
  useEffect(() => {
    // 1. Update Title
    document.title = fullTitle;

    // Helper to upsert meta tag
    const upsertMeta = (attributeName: string, attributeValue: string, content: string) => {
      let tag = document.querySelector(`meta[${attributeName}="${attributeValue}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute(attributeName, attributeValue);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    };

    // Helper to upsert link tag
    const upsertLink = (rel: string, href: string) => {
      let tag = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
      if (!tag) {
        tag = document.createElement('link');
        tag.setAttribute('rel', rel);
        document.head.appendChild(tag);
      }
      tag.setAttribute('href', href);
    };

    // 2. Standard Meta Tags
    upsertMeta('name', 'description', description);
    upsertMeta('name', 'keywords', combinedKeywords);
    upsertMeta('name', 'robots', noIndex ? 'noindex, nofollow' : 'index, follow');

    // 3. Canonical Link
    upsertLink('canonical', canonicalUrl);

    // 4. Open Graph Tags
    upsertMeta('property', 'og:title', fullTitle);
    upsertMeta('property', 'og:description', description);
    upsertMeta('property', 'og:type', ogType);
    upsertMeta('property', 'og:url', canonicalUrl);
    upsertMeta('property', 'og:site_name', siteName);
    upsertMeta('property', 'og:image', shareImage);
    upsertMeta('property', 'og:locale', 'en_US');

    // 5. Twitter Card Tags
    upsertMeta('name', 'twitter:card', 'summary_large_image');
    upsertMeta('name', 'twitter:title', fullTitle);
    upsertMeta('name', 'twitter:description', description);
    upsertMeta('name', 'twitter:image', shareImage);
    upsertMeta('name', 'twitter:url', canonicalUrl);

    // 6. Structured Data (JSON-LD)
    const scriptId = 'dynamic-seo-structured-data';
    let scriptTag = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (structuredData) {
      if (!scriptTag) {
        scriptTag = document.createElement('script');
        scriptTag.id = scriptId;
        scriptTag.type = 'application/ld+json';
        document.head.appendChild(scriptTag);
      }
      scriptTag.text = JSON.stringify(structuredData);
    } else if (scriptTag) {
      scriptTag.remove();
    }
  }, [fullTitle, description, combinedKeywords, canonicalUrl, shareImage, ogType, noIndex, structuredData, siteName]);

  return (
    <>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={combinedKeywords} />
      <link rel="canonical" href={canonicalUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={shareImage} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={shareImage} />
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      )}
    </>
  );
};
