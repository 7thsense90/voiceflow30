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

  // 1. Hard exclusions - Never allow ads on customer dashboards, survey sessions, wallets, withdrawal pages or administrative areas
  const forbiddenViews = [
    // Customer Dashboards
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
    cleanPath.includes('/profile')
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
