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
] as const;

export interface AdPolicyCheckResult {
  isAllowed: boolean;
  reason?: string;
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

  // 1. Hard exclusions - Never allow ads on sensitive transactional or interactive flows
  const forbiddenViews = [
    'login',
    'register',
    'auth',
    'dashboard',
    'start-earning',
    'earnings',
    'my-earnings',
    'rewards',
    'withdraw',
    'withdrawal',
    'chat',
    'survey-chat',
    'surveys',
    'quizzes',
    'profile',
    'admin',
    'referrals',
    'invite',
    'contact',
  ];

  if (forbiddenViews.includes(cleanView)) {
    return {
      isAllowed: false,
      reason: `Ads strictly prohibited on user transactional or interactive view: ${cleanView}`,
    };
  }

  // Path-based exclusions
  if (
    cleanPath.includes('/login') ||
    cleanPath.includes('/register') ||
    cleanPath.includes('/my-earnings') ||
    cleanPath.includes('/earnings') ||
    cleanPath.includes('/surveys') ||
    cleanPath.includes('/chat') ||
    cleanPath.includes('/admin') ||
    cleanPath.includes('/profile') ||
    cleanPath.includes('/rewards-and-withdrawals')
  ) {
    return {
      isAllowed: false,
      reason: `Ads prohibited on path: ${cleanPath}`,
    };
  }

  // 2. Draft / Unreviewed status exclusion
  if (articleStatus && articleStatus !== 'published') {
    return {
      isAllowed: false,
      reason: `Ads prohibited on unreviewed or draft content (status: ${articleStatus})`,
    };
  }

  // 3. Permitted editorial pages
  if (
    cleanPath.startsWith('/brand-research-studies/') ||
    cleanPath === '/brand-research-studies' ||
    cleanPath.startsWith('/research-methodology') ||
    cleanView === 'brand-research-study-detail' ||
    cleanView === 'research-methodology'
  ) {
    return { isAllowed: true };
  }

  // Default to false for policy safety
  return {
    isAllowed: false,
    reason: 'Path is not in the central ad-placement allowlist.',
  };
}
