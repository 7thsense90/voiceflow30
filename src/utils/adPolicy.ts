/**
 * Central Ad-Placement Allowlist & AdSense Standards Policy
 *
 * Google AdSense policies strictly prohibit ads on:
 * - Login, registration, and password recovery screens
 * - Wallets, account balances, and withdrawal request views
 * - Survey questionnaires and active conversational survey flows
 * - Private communication, settings, and profile screens
 * - Administrative controls and dashboards
 * - Empty study queues, error screens, and utility views
 * - Unreviewed drafts and preview pages
 *
 * Ads are ONLY permitted on approved, substantive public editorial content:
 * - Published brand research studies (/brand-research-studies/:slug)
 * - Research methodology educational guides (/research-methodology)
 */

export const AD_ALLOWED_PUBLIC_PATHS = [
  '/brand-research-studies',
  '/research-methodology',
  '/brand-insights',
] as const;

export interface AdPolicyCheckResult {
  isAllowed: boolean;
  reason?: string;
}

/**
 * Removes any injected AdSense script tags, ad iframes, auto-ads, and unfilled ad blocks
 * from the DOM when transitioning to an excluded route or when consent is denied.
 */
export function cleanupAdArtifacts(): void {
  if (typeof window === 'undefined') return;

  try {
    // 1. Remove ad script element
    const scriptEl = document.getElementById('google-adsense-script');
    if (scriptEl && scriptEl.parentNode) {
      scriptEl.parentNode.removeChild(scriptEl);
    }

    // 2. Remove all ad tags, iframes, and auto-ads inserted by Google
    const adSelectors = [
      '.google-auto-placed',
      'iframe[id*="aswift"]',
      'iframe[id*="google_ads"]',
      'div[id^="google_ads"]',
      'div[id^="aswift"]',
      'ins.adsbygoogle[data-ad-status]',
    ];

    adSelectors.forEach((sel) => {
      document.querySelectorAll(sel).forEach((el) => {
        try {
          el.remove();
        } catch (_) {}
      });
    });
  } catch (err) {
    console.debug('Ad cleanup note:', err);
  }
}

/**
 * Checks if advertising is strictly permitted on the given path or view name.
 */
export function checkAdPlacementAllowed(
  pathname: string,
  viewName?: string,
  articleStatus?: string
): AdPolicyCheckResult {
  const cleanPath = (pathname || '').toLowerCase().trim();
  const cleanView = (viewName || '').toLowerCase().trim();

  // 1. Hard exclusions - Never allow ads on customer dashboards, survey sessions, wallets, withdrawal pages or administrative areas
  const forbiddenViews = [
    // Customer Dashboards & Workspace
    'dashboard',
    'customer-dashboard',
    'user-dashboard',
    'start-earning',

    // Survey Sessions & Interactive Questionnaires
    'chat',
    'survey-chat',
    'surveys',
    'quizzes',
    'activities',

    // Wallets & Withdrawal Pages
    'wallet',
    'earnings',
    'my-earnings',
    'rewards',
    'rewards-and-withdrawals',
    'rewards-withdrawals',
    'withdraw',
    'withdrawal',
    'payout',
    'cashout',

    // Administrative Areas
    'admin',
    'admin-dashboard',
    'admin-research-studies',

    // Authentication & Sensitive Settings
    'login',
    'register',
    'auth',
    'profile',
    'referrals',
    'invite',
    'contact',

    // Generic directory indexes without editorial articles
    'brand-directory',
  ];

  if (forbiddenViews.includes(cleanView)) {
    return {
      isAllowed: false,
      reason: `Ads strictly prohibited on user transactional, interactive or administrative view: ${cleanView}`,
    };
  }

  // Path-based exclusions (enforces: customer dashboards, survey sessions, wallets, withdrawal pages, administrative areas)
  if (
    cleanPath.includes('/dashboard') ||
    cleanPath.includes('/start-earning') ||
    cleanPath.includes('/chat') ||
    cleanPath.includes('/survey') ||
    cleanPath.includes('/quizzes') ||
    cleanPath.includes('/wallet') ||
    cleanPath.includes('/earnings') ||
    cleanPath.includes('/my-earnings') ||
    cleanPath.includes('/rewards') ||
    cleanPath.includes('/withdraw') ||
    cleanPath.includes('/payout') ||
    cleanPath.includes('/admin') ||
    cleanPath.includes('/login') ||
    cleanPath.includes('/register') ||
    cleanPath.includes('/profile') ||
    cleanPath === '/brand-directory' ||
    cleanPath === '/brands'
  ) {
    return {
      isAllowed: false,
      reason: `Ads strictly prohibited on protected, transactional, wallet or administrative path: ${cleanPath}`,
    };
  }

  // 2. Draft / Unreviewed status exclusion
  if (articleStatus && articleStatus !== 'published') {
    return {
      isAllowed: false,
      reason: `Ads prohibited on unreviewed or draft content (status: ${articleStatus})`,
    };
  }

  // 3. Permitted public editorial content allowlist:
  // - Brand research study detail (/brand-research-studies/:slug) and directory
  // - Research methodology educational articles (/research-methodology/:slug) and library
  // - Brand user research deep dive studies (/brand-insights/:slug, /brands/:slug/user-research-study)
  const isBrandResearchStudyPath =
    cleanPath.startsWith('/brand-research-studies/') || cleanPath === '/brand-research-studies';
  const isResearchMethodologyPath =
    cleanPath.startsWith('/research-methodology/') || cleanPath === '/research-methodology';
  const isBrandInsightStudyPath =
    (cleanPath.startsWith('/brand-insights/') && cleanPath !== '/brand-insights') ||
    cleanPath.endsWith('/user-research-study');

  const isAllowedView =
    cleanView === 'brand-research-study-detail' ||
    cleanView === 'brand-research-studies' ||
    cleanView === 'research-methodology' ||
    cleanView === 'brand-study';

  if (
    isBrandResearchStudyPath ||
    isResearchMethodologyPath ||
    isBrandInsightStudyPath ||
    isAllowedView
  ) {
    return { isAllowed: true };
  }

  // Default to false for policy safety
  return {
    isAllowed: false,
    reason: 'Path is not in the central ad-placement allowlist.',
  };
}
