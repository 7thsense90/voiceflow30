/**
 * Centralized Route & SEO Configuration for Voice Flow 360
 * Maps user-facing paths to internal view state and SEO metadata.
 */

import {
  findBrandArticleBySlugOrPath,
  getBrandStudyPath,
  findBrandBySlugOrId,
  FEATURED_BRAND_ARTICLES,
} from '../data/brandArticles';

export interface RouteItem {
  path: string;
  view: string;
  title: string;
  description: string;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly';
  priority: number;
  brandId?: string;
}

export const APP_ROUTES: RouteItem[] = [
  {
    path: '/',
    view: 'about-voiceflow',
    title: 'Voice Flow 360 - Interactive Feedback & Rewards',
    description: 'Voice Flow 360 conversational consumer feedback platform where users participate in chat surveys, answer questions, and earn redeemable coin rewards.',
    changefreq: 'daily',
    priority: 1.0,
  },
  {
    path: '/about',
    view: 'about-voiceflow',
    title: 'About Voice Flow 360 - Independent Brand Intelligence & Research',
    description: 'Learn how Voice Flow 360 conducts independent editorial analysis, consumer sentiment benchmarks, and market research studies.',
    changefreq: 'weekly',
    priority: 0.9,
  },
  {
    path: '/start-earning',
    view: 'dashboard',
    title: 'Brand Research Studies & Participant Rewards | Voice Flow 360',
    description: 'Be a part of brand research studies and earn rewards. Explore live conversational studies, share consumer feedback, and build your redeemable balance.',
    changefreq: 'hourly',
    priority: 0.95,
  },
  {
    path: '/how-to-earn',
    view: 'how-to-earn',
    title: 'Panelist Compensation & Research Honorarium Guide | Voice Flow 360',
    description: 'Understand how Voice Flow 360 compensates verified consumer panelists with research honorariums and credits for completed market studies, brand surveys, and focus questionnaires.',
    changefreq: 'weekly',
    priority: 0.85,
  },
  {
    path: '/for-brands',
    view: 'for-brands',
    title: 'Market Research for Brands & Enterprises - Voice Flow 360',
    description: 'Launch customized market research studies, conversational audio & text surveys, and consumer sentiment research with verified global respondents.',
    changefreq: 'weekly',
    priority: 0.9,
  },
  {
    path: '/surveys',
    view: 'surveys',
    title: 'Survey Catalog & Live Brand Drops',
    description: 'Browse available conversational surveys, sponsor brands, and high-coin feedback opportunities.',
    changefreq: 'hourly',
    priority: 0.9,
  },
  {
    path: '/quizzes',
    view: 'quizzes',
    title: 'Daily Speed Quizzes & Instant Coin Multipliers',
    description: 'Test your general brand knowledge with timed speed trivia and earn instant bonus rewards.',
    changefreq: 'daily',
    priority: 0.85,
  },
  {
    path: '/my-earnings',
    view: 'earnings',
    title: 'My Earnings & Payout History',
    description: 'Check your total coin balance, review pipeline, and submit withdrawal requests.',
    changefreq: 'daily',
    priority: 0.8,
  },
  {
    path: '/brands',
    view: 'brand-directory',
    title: 'Cataloged Brands Directory - Market Research Insights',
    description: 'Search through 100+ global brands cataloged on Voice Flow 360 for independent consumer feedback and survey evaluations.',
    changefreq: 'daily',
    priority: 0.85,
  },
  {
    path: '/brand-directory',
    view: 'brand-directory',
    title: 'Brand Directory & Consumer Insights - Voice Flow 360',
    description: 'Explore the complete directory of 100+ global brands cataloged on Voice Flow 360 for independent consumer research and sentiment evaluations.',
    changefreq: 'daily',
    priority: 0.85,
  },
  {
    path: '/brand-insights',
    view: 'brand-insights',
    title: 'Brand Insights & Real-Time Sentiment Analytics',
    description: 'Explore aggregate consumer sentiment metrics, survey satisfaction scores, and feedback benchmarks across industries.',
    changefreq: 'daily',
    priority: 0.8,
  },
  // Dedicated In-Depth Brand Research Study Routes for Google SEO Indexing
  ...FEATURED_BRAND_ARTICLES.map((art): RouteItem => ({
    path: getBrandStudyPath(art),
    view: 'brand-study',
    title: art.metaTitle,
    description: art.metaDescription,
    changefreq: 'weekly',
    priority: 0.85,
    brandId: art.brandId,
  })),
  {
    path: '/news',
    view: 'news-updates',
    title: 'News, Platform Updates & Operational Policies',
    description: 'Official bulletins, feature updates, rewards policy standards, and editorial research publications.',
    changefreq: 'weekly',
    priority: 0.75,
  },
  {
    path: '/product-reviews',
    view: 'product-reviews',
    title: 'Public Product Reviews - 100+ Newly Launched Devices | Voice Flow 360',
    description: 'Browse verified consumer reviews, pricing in USD, top features, purchase intent, and owner satisfaction across 100+ newly launched tech products and gadgets.',
    changefreq: 'daily',
    priority: 0.9,
  },
  {
    path: '/public-product-reviews',
    view: 'product-reviews',
    title: 'Public Product Reviews - 100+ Newly Launched Devices | Voice Flow 360',
    description: 'Browse verified consumer reviews, pricing in USD, top features, purchase intent, and owner satisfaction across 100+ newly launched tech products and gadgets.',
    changefreq: 'daily',
    priority: 0.85,
  },
  {
    path: '/referrals',
    view: 'referral-program',
    title: 'Referral Program - Earn Lifetime Friend Bonuses',
    description: 'Invite friends to Voice Flow 360 and earn 300 bonus coins plus 10% lifetime referral matching rewards.',
    changefreq: 'weekly',
    priority: 0.7,
  },
  {
    path: '/faq',
    view: 'faq',
    title: 'Frequently Asked Questions & Help Center',
    description: 'Find instant answers regarding survey payouts, coin conversions, account verification, and security audits.',
    changefreq: 'weekly',
    priority: 0.8,
  },
  {
    path: '/privacy',
    view: 'privacy',
    title: 'Privacy Policy & Google AdSense Disclosures',
    description: 'Our policy regarding your personal data, survey privacy, and cookie preferences.',
    changefreq: 'monthly',
    priority: 0.5,
  },
  {
    path: '/terms',
    view: 'terms',
    title: 'Terms of Service & Earning Regulations',
    description: 'Official terms and conditions governing account eligibility, reward redemption, and anti-fraud safeguards.',
    changefreq: 'monthly',
    priority: 0.5,
  },
  {
    path: '/earnings-disclaimer',
    view: 'earnings-disclaimer',
    title: 'Earnings & Research Honorarium Disclaimer - Voice Flow 360',
    description: 'Official Earnings Disclaimer for Voice Flow 360. Clear guidelines on consumer panel compensation, coin conversions, and realistic expectations.',
    changefreq: 'monthly',
    priority: 0.5,
  },
  {
    path: '/contact',
    view: 'contact',
    title: 'Contact Us - Member Support & Brand Partnerships',
    description: 'Reach our dedicated member support team, report issues, or discuss enterprise survey partnerships.',
    changefreq: 'monthly',
    priority: 0.6,
  },
  {
    path: '/sitemap-directory',
    view: 'sitemap-directory',
    title: 'HTML Sitemap & Platform Directory - Voice Flow 360',
    description: 'Complete navigation hierarchy and index of all 147+ platform pages, survey drops, and brand studies on Voice Flow 360.',
    changefreq: 'weekly',
    priority: 0.7,
  },
  {
    path: '/profile',
    view: 'profile',
    title: 'Member Profile & Account Settings',
    description: 'Manage your survey profile demographics, withdrawal preferences, and account security.',
    changefreq: 'monthly',
    priority: 0.4,
  },
  {
    path: '/brand-research-studies',
    view: 'brand-research-studies',
    title: 'Brand Research Studies | Voice Flow 360 Market Intelligence',
    description: 'Independent consumer intelligence, brand sentiment benchmarks, and market research reports published by Voice Flow 360.',
    changefreq: 'daily',
    priority: 0.9,
  },
  {
    path: '/rewards',
    view: 'rewards-and-withdrawals',
    title: 'Rewards & Withdrawals Policy - Transparent Consumer Compensation | Voice Flow 360',
    description: 'Transparent guide to Voice Flow 360 participant compensation: conversion rates, acceptance criteria, thresholds, payment rails, and dispute policies.',
    changefreq: 'weekly',
    priority: 0.85,
  },
  {
    path: '/rewards-and-withdrawals',
    view: 'rewards-and-withdrawals',
    title: 'Rewards & Withdrawals Policy - Transparent Consumer Compensation | Voice Flow 360',
    description: 'Transparent guide to Voice Flow 360 participant compensation: conversion rates, acceptance criteria, thresholds, payment rails, and dispute policies.',
    changefreq: 'weekly',
    priority: 0.85,
  },
  {
    path: '/research-methodology',
    view: 'research-methodology',
    title: 'Research Methodology & Educational Library | Voice Flow 360',
    description: 'Empirical guide to conversational surveys, response quality audits, sample sizes, ethical compensation, and consumer feedback product synthesis.',
    changefreq: 'weekly',
    priority: 0.85,
  },
  {
    path: '/research-methodology/how-conversational-surveys-work',
    view: 'research-methodology',
    title: 'How Conversational Surveys Work: Architecture & Response Dynamics | Voice Flow 360',
    description: 'A comprehensive technical overview of how conversational survey engines administer questions and preserve standardization.',
    changefreq: 'monthly',
    priority: 0.8,
  },
  {
    path: '/research-methodology/how-response-quality-is-assessed',
    view: 'research-methodology',
    title: 'How Response Quality Is Assessed: Multi-Factor Audit Architecture | Voice Flow 360',
    description: 'The protocols, algorithms, and human verification layers used to screen out fraudulent, duplicate, and low-effort feedback.',
    changefreq: 'monthly',
    priority: 0.8,
  },
  {
    path: '/research-methodology/how-to-interpret-survey-sample-sizes',
    view: 'research-methodology',
    title: 'How to Interpret Survey Sample Sizes: Margins of Error, Power & Statistical Weight | Voice Flow 360',
    description: 'A practical guide for navigating convenience samples, sample sizes (n), and representative claims.',
    changefreq: 'monthly',
    priority: 0.8,
  },
  {
    path: '/research-methodology/how-participant-compensation-works',
    view: 'research-methodology',
    title: 'How Participant Compensation Works: Ethical Honorariums, Audits & Payout Rails | Voice Flow 360',
    description: 'The economic mechanics of survey rewards: coin-to-USD conversion rates, escrow integrity, and why ads must never gate earnings.',
    changefreq: 'monthly',
    priority: 0.8,
  },
  {
    path: '/research-methodology/how-consumer-feedback-informs-product-decisions',
    view: 'research-methodology',
    title: 'How Consumer Feedback Informs Product Decisions: From Raw Chat to Enterprise Roadmap | Voice Flow 360',
    description: 'Tracing the analytical journey of qualitative sentiment from consumer conversations into engineering sprints and commercial strategy.',
    changefreq: 'monthly',
    priority: 0.8,
  },
];

export interface ParsedRoute {
  view: string;
  brandId?: string;
  articleSlug?: string;
  studyPath?: string;
  methodologySlug?: string;
}

/**
 * Parses browser pathname into application view and params
 */
export function parseRoute(pathname: string): ParsedRoute {
  // Strip query strings and clean up input
  let cleanPath = pathname.split('?')[0].trim();

  // Collapse consecutive slashes into a single slash (e.g. // -> /)
  cleanPath = cleanPath.replace(/\/+/g, '/');

  // Normalize any accidentally duplicated prefix (e.g. /brand-insights/brand-insights/ -> /brand-insights/)
  while (cleanPath.startsWith('/brand-insights/brand-insights/')) {
    cleanPath = cleanPath.replace('/brand-insights/brand-insights/', '/brand-insights/');
  }

  // Remove trailing slashes (except root)
  cleanPath = cleanPath.replace(/\/+$/, '') || '/';

  // 1. Check for dedicated brand research study URLs:
  // e.g. /brand-insights/sony-playstation-user-research-study
  // e.g. /brand-insights/nintendo-user-research-study
  // e.g. /brand-insights/:brand/user-research-study
  // e.g. /brands/:brandId/user-research-study
  const studyNestedMatch = cleanPath.match(/^\/(?:brand-insights|brands)\/([a-zA-Z0-9_-]+)\/user-research-study$/);
  if (studyNestedMatch) {
    const matchedArticle = findBrandArticleBySlugOrPath(studyNestedMatch[1]);
    if (matchedArticle) {
      return {
        view: 'brand-study',
        brandId: matchedArticle.brandId,
        articleSlug: matchedArticle.slug,
        studyPath: cleanPath,
      };
    }
    const knownBrand = findBrandBySlugOrId(studyNestedMatch[1]);
    if (knownBrand) {
      return {
        view: 'brand-detail',
        brandId: knownBrand.id,
        studyPath: cleanPath,
      };
    }
  }

  // 1b. Check for individual article URLs: /brand-research-studies/:slug, /brand-insights/:slug, /brand-study/:slug
  const individualArticleMatch = cleanPath.match(/^\/(?:brand-research-studies|brand-insights|brand-study)\/([a-zA-Z0-9_-]+)$/);
  if (
    individualArticleMatch &&
    individualArticleMatch[1] !== 'brand-research-studies' &&
    individualArticleMatch[1] !== 'brand-insights' &&
    individualArticleMatch[1] !== 'brand-case-studies'
  ) {
    const slug = individualArticleMatch[1];
    const matchedBrandArticle = findBrandArticleBySlugOrPath(slug);
    if (matchedBrandArticle) {
      return {
        view: 'brand-study',
        brandId: matchedBrandArticle.brandId,
        articleSlug: matchedBrandArticle.slug,
        studyPath: cleanPath,
      };
    }
    if (cleanPath.startsWith('/brand-research-studies/')) {
      return {
        view: 'brand-research-study-detail',
        articleSlug: slug,
        studyPath: cleanPath,
      };
    }
    const knownBrand = findBrandBySlugOrId(slug);
    if (knownBrand) {
      return {
        view: 'brand-detail',
        brandId: knownBrand.id,
        studyPath: cleanPath,
      };
    }
    return {
      view: 'brand-research-study-detail',
      articleSlug: slug,
      studyPath: cleanPath,
    };
  }

  // 2. Specific brand detail URL: /brands/:brandId
  const brandMatch = cleanPath.match(/^\/brands\/([a-zA-Z0-9_-]+)$/);
  if (brandMatch) {
    const rawBrand = brandMatch[1];
    const knownBrand = findBrandBySlugOrId(rawBrand);
    return { view: 'brand-detail', brandId: knownBrand ? knownBrand.id : rawBrand };
  }

  // 3. Check query string if user navigated via ?brand= or ?article= while on /brand-insights
  if (cleanPath === '/brand-insights' && pathname.includes('?')) {
    const queryPart = pathname.split('?')[1] || '';
    const params = new URLSearchParams(queryPart);
    const queryBrand = params.get('brand') || params.get('article');
    if (queryBrand) {
      const matchedArticle = findBrandArticleBySlugOrPath(queryBrand);
      if (matchedArticle) {
        return {
          view: 'brand-study',
          brandId: matchedArticle.brandId,
          articleSlug: matchedArticle.slug,
          studyPath: getBrandStudyPath(matchedArticle),
        };
      }
    }
  }

  // Default landing page & alias mappings
  if (
    cleanPath === '/' ||
    cleanPath === '/brand-case-studies' ||
    cleanPath === '/case-studies'
  ) {
    return { view: 'brand-case-studies' };
  }
  if (cleanPath === '/brand-insights') {
    return { view: 'brand-insights' };
  }
  if (cleanPath === '/about' || cleanPath === '/about-us' || cleanPath === '/about-voiceflow') {
    return { view: 'about-voiceflow' };
  }
  if (cleanPath === '/start-earning' || cleanPath === '/dashboard') {
    return { view: 'dashboard' };
  }
  if (cleanPath === '/360-earning' || cleanPath === '/360-earning-for-everyone') {
    return { view: 'how-to-earn' };
  }
  if (cleanPath === '/how-to-earn') {
    return { view: 'how-to-earn' };
  }
  if (
    cleanPath === '/for-brands' ||
    cleanPath === '/brand-research' ||
    cleanPath === '/market-research' ||
    cleanPath === '/brand-inquiry'
  ) {
    return { view: 'for-brands' };
  }
  if (cleanPath === '/surveys') {
    return { view: 'surveys' };
  }
  if (cleanPath === '/quizzes') {
    return { view: 'quizzes' };
  }
  if (cleanPath === '/my-earnings' || cleanPath === '/earnings' || cleanPath === '/wallet') {
    return { view: 'earnings' };
  }
  if (
    cleanPath === '/brands' ||
    cleanPath === '/brands/' ||
    cleanPath === '/brand-directory' ||
    cleanPath === '/brand-directory/'
  ) {
    return { view: 'brand-directory' };
  }
  if (cleanPath === '/brand-insights') {
    return { view: 'brand-insights' };
  }
  if (cleanPath === '/news' || cleanPath === '/news-updates') {
    return { view: 'news-updates' };
  }
  if (
    cleanPath === '/product-reviews' ||
    cleanPath === '/public-product-reviews' ||
    cleanPath === '/products' ||
    cleanPath === '/product-reviews/'
  ) {
    return { view: 'product-reviews' };
  }
  if (
    cleanPath === '/referrals' ||
    cleanPath === '/referral-program' ||
    cleanPath === '/referral-earning' ||
    cleanPath === '/referrel-eraning'
  ) {
    return { view: 'referral-program' };
  }
  if (cleanPath === '/faq') {
    return { view: 'faq' };
  }
  if (cleanPath === '/privacy') {
    return { view: 'privacy' };
  }
  if (cleanPath === '/terms') {
    return { view: 'terms' };
  }
  if (
    cleanPath === '/earnings-disclaimer' ||
    cleanPath === '/earnings-disclaimer/' ||
    cleanPath === '/disclaimer' ||
    cleanPath === '/disclaimer/'
  ) {
    return { view: 'earnings-disclaimer' };
  }
  if (cleanPath === '/contact') {
    return { view: 'contact' };
  }
  if (
    cleanPath === '/rewards' ||
    cleanPath === '/rewards/' ||
    cleanPath === '/rewards-and-withdrawals' ||
    cleanPath === '/rewards-withdrawals' ||
    cleanPath === '/payout-policy' ||
    cleanPath === '/rewards-policy'
  ) {
    return { view: 'rewards-and-withdrawals' };
  }
  const methodologyMatch = cleanPath.match(/^\/research-methodology\/([a-zA-Z0-9_-]+)$/);
  if (methodologyMatch) {
    return {
      view: 'research-methodology',
      articleSlug: methodologyMatch[1],
      methodologySlug: methodologyMatch[1],
    };
  }
  if (
    cleanPath === '/research-methodology' ||
    cleanPath === '/research-methodology/' ||
    cleanPath === '/methodology'
  ) {
    return { view: 'research-methodology' };
  }
  if (
    cleanPath === '/sitemap-directory' ||
    cleanPath === '/sitemap.html' ||
    cleanPath === '/site-map' ||
    cleanPath === '/directory'
  ) {
    return { view: 'sitemap-directory' };
  }
  if (cleanPath === '/profile') {
    return { view: 'profile' };
  }
  if (cleanPath === '/login') {
    return { view: 'login' };
  }
  if (cleanPath === '/register') {
    return { view: 'register' };
  }
  if (cleanPath === '/admin') {
    return { view: 'admin' };
  }
  if (cleanPath === '/brand-research-studies') {
    return { view: 'brand-research-studies' };
  }
  if (cleanPath === '/404') {
    return { view: 'not-found' };
  }
  const brandResearchMatch = cleanPath.match(/^\/brand-research-studies\/([a-zA-Z0-9_-]+)$/);
  if (brandResearchMatch) {
    return {
      view: 'brand-research-study-detail',
      articleSlug: brandResearchMatch[1],
      studyPath: `/brand-research-studies/${brandResearchMatch[1]}`,
    };
  }

  // Default fallback for unrecognized non-root paths
  if (cleanPath !== '/' && cleanPath !== '') {
    return { view: 'not-found' };
  }

  // Default fallback
  return { view: 'brand-case-studies' };
}

/**
 * Returns canonical path corresponding to view and optional brand ID or article slug
 */
export function getPathForView(
  view: string,
  brandId?: string | null,
  articleSlug?: string | null
): string {
  if (view === 'brand-study') {
    if (articleSlug) {
      return articleSlug.startsWith('/brand-insights/')
        ? articleSlug
        : `/brand-insights/${articleSlug}`;
    }
    if (brandId) {
      return getBrandStudyPath(brandId);
    }
    if (
      typeof window !== 'undefined' &&
      (window.location.pathname.startsWith('/brand-insights/') ||
        window.location.pathname.startsWith('/brand-study/'))
    ) {
      return window.location.pathname;
    }
    return '/brand-case-studies';
  }

  if (view === 'brand-detail' && brandId) {
    return `/brands/${brandId}`;
  }

  if (view === 'brand-research-study-detail') {
    if (articleSlug) {
      return `/brand-research-studies/${articleSlug}`;
    }
    if (
      typeof window !== 'undefined' &&
      window.location.pathname.startsWith('/brand-research-studies/')
    ) {
      const match = window.location.pathname.match(/^\/brand-research-studies\/([a-zA-Z0-9_-]+)/);
      if (match && match[1] && match[1] !== 'brand-research-studies') {
        return `/brand-research-studies/${match[1]}`;
      }
    }
    return '/brand-research-studies';
  }

  switch (view) {
    case 'brand-case-studies':
    case 'case-studies':
    case 'landing':
      return '/brand-case-studies';
    case 'about-voiceflow':
    case 'about':
      return '/about';
    case 'dashboard':
    case 'start-earning':
      return '/start-earning';
    case '360-earning-for-everyone':
    case '360-earning':
    case 'earning-for-everyone':
    case 'how-to-earn':
      return '/how-to-earn';
    case 'for-brands':
    case 'brand-research':
    case 'market-research':
      return '/for-brands';
    case 'surveys':
      return '/surveys';
    case 'quizzes':
      return '/quizzes';
    case 'earnings':
    case 'my-earnings':
    case 'wallet':
      return '/my-earnings';
    case 'brand-directory':
      return '/brand-directory';
    case 'brand-detail':
      return brandId ? `/brands/${brandId}` : '/brand-directory';
    case 'brand-insights':
      return '/brand-insights';
    case 'news':
    case 'news-updates':
      return '/news';
    case 'product-reviews':
    case 'public-product-reviews':
    case 'products':
      return '/product-reviews';
    case 'referrals':
    case 'referral-program':
    case 'referral-earning':
    case 'referrel-eraning':
    case 'invite':
      return '/referrals';
    case 'faq':
      return '/faq';
    case 'privacy':
      return '/privacy';
    case 'terms':
      return '/terms';
    case 'earnings-disclaimer':
    case 'disclaimer':
      return '/earnings-disclaimer';
    case 'contact':
      return '/contact';
    case 'rewards':
    case 'rewards-and-withdrawals':
    case 'rewards-withdrawals':
    case 'payout-policy':
      return '/rewards';
    case 'research-methodology':
    case 'methodology':
      return articleSlug ? `/research-methodology/${articleSlug}` : '/research-methodology';
    case 'sitemap-directory':
      return '/sitemap-directory';
    case 'profile':
      return '/profile';
    case 'login':
      return '/login';
    case 'register':
      return '/register';
    case 'admin':
      return '/admin';
    case 'brand-research-studies':
      return '/brand-research-studies';
    case 'brand-research-study-detail':
      return articleSlug ? `/brand-research-studies/${articleSlug}` : '/brand-research-studies';
    case 'not-found':
      return '/404';
    default:
      return '/brand-case-studies';
  }
}
