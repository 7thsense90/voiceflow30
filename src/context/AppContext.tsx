import React, { createContext, useContext, useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  User,
  Campaign,
  UserResponse,
  Transaction,
  WithdrawalRequest,
  BalanceAdjustmentLog,
  PlatformSettings,
  Brand,
  Question,
  AppNotification,
  UserAnswer,
  CampaignStatus,
  UserAccountStatus,
  PayoutMethod,
  WithdrawalStatus,
  ReferralRecord,
  DirectInvitation,
  BrandInquiry,
  InquiryStatus,
  EmailCampaign,
  NewsletterSubscriber,
  NewsletterPreferences,
  ResearchArticle,
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_CAMPAIGNS,
  INITIAL_BRANDS,
  INITIAL_TRANSACTIONS,
  INITIAL_WITHDRAWALS,
  INITIAL_RESPONSES,
  INITIAL_ADJUSTMENT_LOGS,
  INITIAL_NOTIFICATIONS,
  INITIAL_SETTINGS,
  INITIAL_REFERRALS,
  RAW_100_BRANDS,
  getQuestionsForBrand,
  INITIAL_BRAND_INQUIRIES,
  INITIAL_NEWSLETTER_SUBSCRIBERS,
} from '../data/initialData';
import { INITIAL_EMAIL_CAMPAIGNS } from '../data/emailCampaigns';
import { INITIAL_RESEARCH_ARTICLES } from '../data/initialResearchArticles';
import { setLiveResponseData } from '../data/brandArticles/liveDataStore';
import {
  seedInitialFirestoreData,
  subscribeToFirestore,
  saveUserToFirestore,
  updateUserInFirestore,
  saveCampaignToFirestore,
  updateCampaignInFirestore,
  deleteCampaignFromFirestore,
  saveBrandToFirestore,
  updateBrandInFirestore,
  deleteBrandFromFirestore,
  saveFeedbackResponseToFirestore,
  toggleResponseVisibilityInFirestore,
  saveTransactionToFirestore,
  saveWithdrawalToFirestore,
  updateWithdrawalStatusInFirestore,
  saveNotificationToFirestore,
  markNotificationReadInFirestore,
  updateSettingsInFirestore,
  saveBalanceAdjustmentToFirestore,
  syncAll100BrandsToFirestore,
  listenToBrandInquiries,
  saveBrandInquiryToFirestore,
  updateBrandInquiryStatusInFirestore,
  listenToEmailCampaigns,
  saveEmailCampaignToFirestore,
  deleteEmailCampaignFromFirestore,
  listenToNewsletterSubscribers,
  saveNewsletterSubscriberToFirestore,
  syncAllCustomersAsNewsletterSubscribersToFirestore,
  listenToResearchArticles,
  saveResearchArticleToFirestore,
  deleteResearchArticleFromFirestore,
  deleteUserFromFirestore,
  checkUserEmailExistsInFirestore,
  deduplicateUsersInFirestore,
} from '../lib/firestoreService';
import { parseRoute, getPathForView } from '../utils/routes';
import { getBrandStudyPath } from '../data/brandArticles';
import { triggerSurveyStartVignetteAd } from '../utils/vignetteAd';
import { validateRealEmail } from '../utils/emailValidation';
import { getDeviceIp } from '../utils/deviceIp';

interface AppContextType {
  currentUser: User | null;
  users: User[];
  campaigns: Campaign[];
  responses: UserResponse[];
  transactions: Transaction[];
  withdrawals: WithdrawalRequest[];
  adjustmentLogs: BalanceAdjustmentLog[];
  notifications: AppNotification[];
  referrals: ReferralRecord[];
  settings: PlatformSettings;
  activeChatCampaign: Campaign | null;
  currentView: string;
  selectedBrandId: string | null;
  setSelectedBrandId: (id: string | null) => void;
  brands: Brand[];
  addBrand: (brand: Omit<Brand, "id" | "createdAt">) => Brand;
  updateBrand: (id: string, updates: Partial<Brand>) => void;
  deleteBrand: (id: string) => void;
  syncAllBrands: () => Promise<void>;
  toggleResponseVisibility: (id: string) => void;
  toastMessage: { text: string; type: 'success' | 'error' | 'info' } | null;
  isDbConnected: boolean;
  isFirestoreSynced: boolean;
  
  // Navigation
  setCurrentView: (view: string, pushHistory?: boolean, brandId?: string | null, customPath?: string) => void;
  showToast: (text: string, type?: 'success' | 'error' | 'info') => void;
  
  // Auth
  login: (email: string, password?: string) => { success: boolean; error?: string };
  register: (
    name: string,
    email: string,
    password: string,
    country: string,
    referralCode?: string,
    firstName?: string,
    lastName?: string
  ) => Promise<{ success: boolean; error?: string }>;
  startGuestSession: () => void;
  logout: () => void;
  switchUser: (userId: string) => void;
  resetPassword: (email: string) => boolean;
  updateUserProfile: (userId: string, updates: Partial<User>) => void;
  simulateReferralSignup: (friendName: string, friendEmail: string) => { success: boolean; error?: string };
  recordReferralShare: (userId?: string) => void;
  
  // Chat & Activities
  startChat: (campaign: Campaign) => void;
  cancelChat: () => void;
  submitFeedbackResponse: (campaignId: string, answers: UserAnswer[], earnedCoins: number) => void;
  hasUserCompletedCampaign: (userId: string, campaignId: string) => boolean;
  
  // Admin Campaign Management
  createCampaign: (campaign: Omit<Campaign, 'id' | 'createdAt' | 'completedCount'>) => Campaign;
  updateCampaign: (campaignId: string, updates: Partial<Campaign>) => void;
  deleteCampaign: (campaignId: string) => void;
  setCampaignStatus: (campaignId: string, status: CampaignStatus) => void;
  
  // Admin User Management
  setUserAccountStatus: (userId: string, status: UserAccountStatus) => void;
  deleteUserAccount: (userId: string) => Promise<{ success: boolean; error?: string }>;
  deduplicateAllUsers: (targetEmail?: string) => Promise<{ success: boolean; count: number }>;
  adjustUserBalance: (userId: string, amount: number, reason: string) => void;
  applyBotPenaltyCutoff: (userId: string, customPercent?: number, reason?: string) => void;
  
  // Withdrawals & Rewards
  submitWithdrawalRequest: (coins: number, method: PayoutMethod, accountDetails: string) => { success: boolean; error?: string };
  updateWithdrawalStatus: (withdrawalId: string, status: WithdrawalStatus, adminNote?: string) => void;
  processMonthlyWalletTransfer: (customUserId?: string) => { success: boolean; transferredCoins: number; message: string };
  
  // Notifications & Settings
  markNotificationRead: (notifId: string) => void;
  markAllNotificationsRead: () => void;
  updateSettings: (newSettings: Partial<PlatformSettings>) => void;
  resetAllDataToDefault: () => void;

  // Daily Survey & Quiz Limit (Max 5 completed per day)
  dailySurveysCompletedCount: number;
  dailySurveysLimit: number;
  dailySurveysRemaining: number;
  isSurveyLimitReached: boolean;
  surveyCooldownUntil: string | null;
  clearSurveyCooldown: () => void;
  isSurveyCooldownModalOpen: boolean;
  setIsSurveyCooldownModalOpen: (open: boolean) => void;

  // Direct Invitations
  directInvitations: DirectInvitation[];
  sendDirectInvite: (
    recipient: string,
    type: 'email' | 'phone',
    friendName?: string,
    customNote?: string
  ) => { success: boolean; error?: string };

  // Brand Market Research Inquiries
  brandInquiries: BrandInquiry[];
  addBrandInquiry: (inquiry: Omit<BrandInquiry, 'id' | 'submittedAt' | 'status'>) => Promise<BrandInquiry>;
  updateBrandInquiryStatus: (inquiryId: string, status: InquiryStatus, adminNotes?: string, campaignCreatedId?: string) => Promise<void>;
  prefilledInquiryForCampaign: BrandInquiry | null;
  setPrefilledInquiryForCampaign: (inquiry: BrandInquiry | null) => void;

  // Email Campaigns (Batch Surveys Alerts to Listed Users)
  emailCampaigns: EmailCampaign[];
  sendEmailCampaign: (campaign: Omit<EmailCampaign, 'id' | 'createdAt' | 'status' | 'stats'>) => Promise<EmailCampaign>;
  deleteEmailCampaign: (id: string) => Promise<void>;

  // Newsletter Subscriptions
  newsletterSubscribers: NewsletterSubscriber[];
  subscribeToNewsletter: (
    email: string,
    preferences?: Partial<NewsletterPreferences>
  ) => Promise<{ success: boolean; message: string; isAlreadySubscribed?: boolean }>;
  markAllCustomersAsNewsletterSubscribers: (
    showFeedback?: boolean
  ) => Promise<{ success: boolean; totalCount: number; addedCount: number }>;
  toggleCustomerNewsletter: (userId: string) => Promise<boolean>;

  // Brand Research Studies CMS
  researchArticles: ResearchArticle[];
  selectedArticleSlug: string | null;
  setSelectedArticleSlug: (slug: string | null) => void;
  navigateToResearchArticle: (slug: string) => void;
  saveResearchArticle: (
    article: Omit<ResearchArticle, 'id' | 'created_at' | 'updated_at'> & { id?: string }
  ) => { success: boolean; error?: string; article?: ResearchArticle };
  deleteResearchArticle: (id: string) => { success: boolean; error?: string };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  USERS: 'ce_users_v6',
  CAMPAIGNS: 'ce_campaigns_v6',
  RESPONSES: 'ce_responses_v7',
  TRANSACTIONS: 'ce_transactions_v6',
  WITHDRAWALS: 'ce_withdrawals_v6',
  ADJUSTMENTS: 'ce_adjustments_v6',
  NOTIFICATIONS: 'ce_notifications_v6',
  REFERRALS: 'ce_referrals_v6',
  SETTINGS: 'ce_settings_v6',
  CURRENT_USER_ID: 'ce_current_user_id_v6',
  INVITATIONS: 'ce_direct_invitations_v6',
  BRAND_INQUIRIES: 'ce_brand_inquiries_v6',
  EMAIL_CAMPAIGNS: 'ce_email_campaigns_v6',
  NEWSLETTER_SUBSCRIBERS: 'ce_newsletter_subscribers_v1',
  RESEARCH_ARTICLES: 'ce_research_articles_v1',
};

function loadStorage<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function saveStorage<T>(key: string, data: T) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.warn(`Failed to save ${key} in localStorage, attempting mobile quota handling`, err);
    if (key === STORAGE_KEYS.RESPONSES && Array.isArray(data)) {
      try {
        localStorage.setItem(key, JSON.stringify(data.slice(0, 200)));
      } catch {
        // Ignore mobile quota overflow gracefully
      }
    }
  }
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => {
    const raw = loadStorage<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
    // Move total rewards earned to total redeemable balance for all users:
    // Deduct 60% against bot and mock response, after 60% deduction add remaining to redeemable balance
    // Exclude any transient guest sessions or mock test users from platform users store
    return raw
      .filter((u) => !u.isGuest && !u.id?.startsWith('guest_') && !u.email?.startsWith('guest_'))
      .map((u) => {
        const grossRewards = Math.max(u.totalEarned || 0, u.coinBalance || 0);
        const deduction60 = Math.round(grossRewards * 0.6);
        const remaining40 = Math.max(0, grossRewards - deduction60);
        return {
          ...u,
          totalEarned: grossRewards,
          redeemableCoinBalance: remaining40,
          coinBalance: remaining40,
          surveyCoinsPendingReview: 0,
        };
      });
  });
  const [campaigns, setCampaigns] = useState<Campaign[]>(() => loadStorage(STORAGE_KEYS.CAMPAIGNS, INITIAL_CAMPAIGNS));
  const [brands, setBrands] = useState<Brand[]>(() => {
    const stored = loadStorage<Brand[]>('chat_earn_brands', []);
    if (!stored || stored.length < 50) {
      const storedMap = new Map((stored || []).map((b) => [b.id, b]));
      return INITIAL_BRANDS.map((initB) => storedMap.get(initB.id) || initB).concat(
        (stored || []).filter((b) => !INITIAL_BRANDS.some((initB) => initB.id === b.id))
      );
    }
    return stored;
  });
  // Parse initial route from browser URL for deep-linking, SEO crawlers & refresh resilience
  const initialRoute = useMemo(() => {
    if (typeof window !== 'undefined') {
      return parseRoute(window.location.pathname);
    }
    return { view: 'brand-case-studies' };
  }, []);

  const [selectedBrandId, setSelectedBrandIdState] = useState<string | null>(() => initialRoute.brandId || null);
  const [responses, setResponses] = useState<UserResponse[]>(() => {
    const loaded = loadStorage<UserResponse[]>(STORAGE_KEYS.RESPONSES, []);
    if (!loaded || loaded.length < 500) {
      return INITIAL_RESPONSES;
    }
    return loaded;
  });
  const [transactions, setTransactions] = useState<Transaction[]>(() => loadStorage(STORAGE_KEYS.TRANSACTIONS, INITIAL_TRANSACTIONS));
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>(() => loadStorage(STORAGE_KEYS.WITHDRAWALS, INITIAL_WITHDRAWALS));
  const [adjustmentLogs, setAdjustmentLogs] = useState<BalanceAdjustmentLog[]>(() => loadStorage(STORAGE_KEYS.ADJUSTMENTS, INITIAL_ADJUSTMENT_LOGS));
  const [notifications, setNotifications] = useState<AppNotification[]>(() => loadStorage(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS));
  const [referrals, setReferrals] = useState<ReferralRecord[]>(() => loadStorage(STORAGE_KEYS.REFERRALS, INITIAL_REFERRALS));
  const [directInvitations, setDirectInvitations] = useState<DirectInvitation[]>(() => loadStorage(STORAGE_KEYS.INVITATIONS, []));
  const [brandInquiries, setBrandInquiries] = useState<BrandInquiry[]>(() => loadStorage(STORAGE_KEYS.BRAND_INQUIRIES, INITIAL_BRAND_INQUIRIES));
  const [emailCampaigns, setEmailCampaigns] = useState<EmailCampaign[]>(() => loadStorage(STORAGE_KEYS.EMAIL_CAMPAIGNS, INITIAL_EMAIL_CAMPAIGNS));
  const [newsletterSubscribers, setNewsletterSubscribers] = useState<NewsletterSubscriber[]>(() => {
    const loaded = loadStorage<NewsletterSubscriber[]>(STORAGE_KEYS.NEWSLETTER_SUBSCRIBERS, []);
    if (!loaded || loaded.length === 0) {
      return INITIAL_NEWSLETTER_SUBSCRIBERS;
    }
    const loadedEmails = new Set(loaded.map((s) => s.email.toLowerCase().trim()));
    const missingInitials = INITIAL_NEWSLETTER_SUBSCRIBERS.filter(
      (init) => !loadedEmails.has(init.email.toLowerCase().trim())
    );
    if (missingInitials.length > 0) {
      return [...loaded, ...missingInitials];
    }
    return loaded;
  });
  const [researchArticles, setResearchArticles] = useState<ResearchArticle[]>(() => {
    const loaded = loadStorage<ResearchArticle[]>(STORAGE_KEYS.RESEARCH_ARTICLES, []);
    if (!loaded || loaded.length === 0) {
      return INITIAL_RESEARCH_ARTICLES;
    }
    const loadedIds = new Set(loaded.map((a) => a.id));
    const missing = INITIAL_RESEARCH_ARTICLES.filter((a) => !loadedIds.has(a.id));
    return missing.length > 0 ? [...loaded, ...missing] : loaded;
  });
  const [selectedArticleSlug, setSelectedArticleSlugState] = useState<string | null>(() => initialRoute.articleSlug || null);
  const [prefilledInquiryForCampaign, setPrefilledInquiryForCampaign] = useState<BrandInquiry | null>(null);
  const [settings, setSettings] = useState<PlatformSettings>(() => {
    const s = loadStorage(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
    // Minimum cashout for Bank Transfer, Crypto & supported country payout systems is $20.00 (2,000 coins)
    s.minWithdrawalCoins = 2000;
    s.minCryptoWithdrawalCoins = 2000;
    if (!s.referralRewardCoins) s.referralRewardCoins = 300;
    if (s.adsenseEnabled === undefined) s.adsenseEnabled = true;
    if (!s.adClientPubId) s.adClientPubId = 'ca-pub-2513423020167554';
    if (s.enableStickyAnchorAd === undefined) s.enableStickyAnchorAd = true;
    if (s.enableDirectoryBannerAd === undefined) s.enableDirectoryBannerAd = true;
    if (s.enableArticleInContentAd === undefined) s.enableArticleInContentAd = true;
    if (s.enableChatBreakAd === undefined) s.enableChatBreakAd = true;
    if (s.enableNewsFeedAd === undefined) s.enableNewsFeedAd = true;
    return s;
  });
  
  const [currentUserId, setCurrentUserId] = useState<string | null>(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
    if (!stored || stored === 'null' || stored === '""' || stored === '"usr_1"') {
      return null;
    }
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  });

  const [activeChatCampaign, setActiveChatCampaign] = useState<Campaign | null>(null);
  const [currentView, setCurrentViewState] = useState<string>(() => initialRoute.view);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [isDbConnected, setIsDbConnected] = useState<boolean>(true);
  const [isFirestoreSynced, setIsFirestoreSynced] = useState<boolean>(false);

  // SEO & URL Navigation: updates view and pushes history state
  const setCurrentView = (
    view: string,
    pushHistory: boolean = true,
    brandId?: string | null,
    customPath?: string
  ) => {
    setCurrentViewState(view);
    if (brandId !== undefined) {
      setSelectedBrandIdState(brandId);
    }
    if (pushHistory && typeof window !== 'undefined') {
      const activeBrand = brandId !== undefined ? brandId : selectedBrandId;
      const targetPath = customPath || getPathForView(view, activeBrand);
      if (window.location.pathname !== targetPath) {
        window.history.pushState({ view, brandId: activeBrand }, '', targetPath);
      }
    }
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const setSelectedBrandId = (id: string | null) => {
    setSelectedBrandIdState(id);
    if (currentView === 'brand-detail' && id && typeof window !== 'undefined') {
      const targetPath = `/brands/${id}`;
      if (window.location.pathname !== targetPath) {
        window.history.pushState({ view: 'brand-detail', brandId: id }, '', targetPath);
      }
    } else if (currentView === 'brand-study' && id && typeof window !== 'undefined') {
      const targetPath = getBrandStudyPath(id);
      if (window.location.pathname !== targetPath) {
        window.history.pushState({ view: 'brand-study', brandId: id }, '', targetPath);
      }
    }
  };

  // Synchronize browser forward/back buttons (popstate events) and normalize URLs
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Ensure initial entry has matching state and clean, normalized canonical path
    const initial = parseRoute(window.location.pathname);
    const cleanCanonicalPath = initial.studyPath || getPathForView(initial.view, initial.brandId);

    // If the browser URL contains double slashes or duplicate /brand-insights/ prefix,
    // seamlessly normalize it in the address bar without reloading
    if (cleanCanonicalPath && cleanCanonicalPath !== '/' && window.location.pathname !== cleanCanonicalPath) {
      window.history.replaceState({ view: initial.view, brandId: initial.brandId }, '', cleanCanonicalPath);
    } else {
      window.history.replaceState({ view: initial.view, brandId: initial.brandId }, '', window.location.pathname);
    }

    const handlePopState = () => {
      const route = parseRoute(window.location.pathname);
      setCurrentViewState(route.view);
      if (route.brandId !== undefined) {
        setSelectedBrandIdState(route.brandId);
      }
      if (route.articleSlug !== undefined) {
        setSelectedArticleSlugState(route.articleSlug);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Initialize Firestore seeding & real-time listeners
  useEffect(() => {
    let unsub: (() => void) | null = null;

    // Initialize real-time Firestore listeners immediately so production users get live data without delay
    try {
      unsub = subscribeToFirestore({
          onUsers: (remoteUsers) => {
            // Deduplicate remote users: collapse simulated dummy referral friend test accounts that share identical test emails, while preserving all distinct registered member accounts
            const dedupedMap = new Map<string, User>();
            for (const u of remoteUsers) {
              const emailKey = (u.email || '').trim().toLowerCase();
              // For dummy friend referral tests created in batches, deduplicate by email so they don't flood the registry
              const isDummyFriend = (u.id || '').startsWith('usr_friend_');
              const uniqueKey = isDummyFriend && emailKey ? `friend_${emailKey}` : (u.id || emailKey);
              if (!uniqueKey) continue;
              const existing = dedupedMap.get(uniqueKey);
              if (!existing) {
                dedupedMap.set(uniqueKey, u);
              } else {
                // Keep account with higher totalEarned, or older createdAt
                const uEarned = u.totalEarned || 0;
                const exEarned = existing.totalEarned || 0;
                if (uEarned > exEarned) {
                  dedupedMap.set(uniqueKey, u);
                } else if (uEarned === exEarned && new Date(u.createdAt).getTime() < new Date(existing.createdAt).getTime()) {
                  dedupedMap.set(uniqueKey, u);
                }
              }
            }
            const dedupedList = Array.from(dedupedMap.values());

            setUsers((prev) => {
              // Ensure any account with ibrhussain6@gmail.com is recognized as admin
              const updatedUsers = dedupedList.map((u) => {
                const grossRewards = Math.max(u.totalEarned || 0, u.coinBalance || 0);
                const deduction60 = Math.round(grossRewards * 0.6);
                const remaining40 = Math.max(0, grossRewards - deduction60);
                const baseUser: User = {
                  ...u,
                  totalEarned: grossRewards,
                  redeemableCoinBalance: remaining40,
                  coinBalance: remaining40,
                  surveyCoinsPendingReview: 0,
                };
                if (u.email.toLowerCase() === 'ibrhussain6@gmail.com') {
                  // If country was the prior synthetic default 'United States', clear it so it stays empty until genuinely disclosed in profile
                  const authenticCountry = u.country === 'United States' ? '' : (u.country || '');
                  if (u.country === 'United States') {
                    updateUserInFirestore(u.id, { country: '' });
                  }
                  return { ...baseUser, role: 'admin' as const, country: authenticCountry };
                }
                return baseUser;
              });

              const adminExists = updatedUsers.some((u) => u.email.toLowerCase() === 'ibrhussain6@gmail.com');
              if (!adminExists) {
                const adminUser: User = {
                  id: 'usr_admin_ibrhussain',
                  name: 'Ibrhussain (Admin)',
                  email: 'ibrhussain6@gmail.com',
                  country: '',
                  role: 'admin',
                  coinBalance: 4000,
                  redeemableCoinBalance: 4000,
                  surveyCoinsPendingReview: 0,
                  totalEarned: 10000,
                  redeemedCoins: 0,
                  status: 'active',
                  createdAt: new Date().toISOString(),
                  bio: 'Platform Administrator & Owner',
                  favoriteCategories: ['products', 'services', 'market_research'],
                  referralCode: 'VF-IBRADMIN',
                  referralsCount: 12,
                  referralCoinsEarned: 3600,
                };
                saveUserToFirestore(adminUser);
                return [...updatedUsers, adminUser];
              }
              return updatedUsers;
            });
            setIsDbConnected(true);
          },
          onCampaigns: (remoteCampaigns) => {
            // Ensure remote campaigns are mapped to authentic brand survey questions while preserving admin custom questions
            const sanitized = remoteCampaigns.map((camp) => {
              // If the campaign has its own valid custom questions created by admin, preserve them!
              if (camp.questions && camp.questions.length > 0 && !camp.questions.some((q) => q.id.startsWith('q_ps5_') && camp.id !== 'cmp_1')) {
                return camp;
              }
              const brand = RAW_100_BRANDS.find((b) => b.id === camp.brandId) ||
                            RAW_100_BRANDS.find((b) => b.id === `br_${camp.id.replace('cmp_', '')}`) ||
                            RAW_100_BRANDS.find((b) => camp.title.toLowerCase().startsWith(b.name.toLowerCase()));
              if (brand) {
                const brandQ = getQuestionsForBrand(brand.id, brand.name, brand.sector, brand.keyProduct);
                return {
                  ...camp,
                  questions: brandQ.map((q, idx) => ({
                    ...q,
                    id: `q_${brand.id}_${idx + 1}`,
                    order: idx + 1,
                  })),
                };
              }
              return camp;
            });
            setCampaigns(sanitized);
          },
          onBrands: (remoteBrands) => {
            if (!remoteBrands || remoteBrands.length < 50) {
              const remoteMap = new Map((remoteBrands || []).map((b) => [b.id, b]));
              const merged: Brand[] = INITIAL_BRANDS.map((initB) => remoteMap.get(initB.id) || initB).concat(
                (remoteBrands || []).filter((b) => !INITIAL_BRANDS.some((initB) => initB.id === b.id))
              );
              setBrands(merged);
              syncAll100BrandsToFirestore(merged);
            } else {
              const initMap = new Map(INITIAL_BRANDS.map((b) => [b.id, b]));
              const enriched = remoteBrands.map((b) => {
                const init = initMap.get(b.id);
                return {
                  ...b,
                  sector: b.sector || init?.sector || 'General Market',
                  keyProduct: b.keyProduct || init?.keyProduct || b.name,
                  logo: b.logo || init?.logo,
                  icon: b.icon || init?.icon || 'Building2',
                };
              });
              setBrands(enriched);
            }
          },
          onResponses: (remoteResponses) => {
            if (remoteResponses && remoteResponses.length >= 1000) {
              setResponses(remoteResponses);
            } else if (remoteResponses && remoteResponses.length > 0) {
              // Merge remote with initial dataset so all 100 brands have distinct, authentic ratings
              const remoteMap = new Map(remoteResponses.map((r) => [r.id, r]));
              const merged = INITIAL_RESPONSES.map((initR) => remoteMap.get(initR.id) || initR).concat(
                remoteResponses.filter((r) => !INITIAL_RESPONSES.some((initR) => initR.id === r.id))
              );
              setResponses(merged);
            }
            setIsFirestoreSynced(true);
          },
          onTransactions: (remoteTransactions) => {
            setTransactions(remoteTransactions);
          },
          onWithdrawals: (remoteWithdrawals) => {
            setWithdrawals(remoteWithdrawals);
          },
          onNotifications: (remoteNotifications) => {
            setNotifications(remoteNotifications);
          },
          onSettings: (remoteSettings) => {
            setSettings(remoteSettings);
          },
          onAdjustments: (remoteAdjustments) => {
            setAdjustmentLogs(remoteAdjustments);
          },
          onError: () => {
            setIsDbConnected(false);
          },
        });
    } catch (err) {
      console.warn('Firestore initial sync notice:', err);
    }

    // Run seed check asynchronously in the background so real-time streaming is never delayed
    seedInitialFirestoreData().catch((err) => {
      console.debug('Background seed check notice:', err);
    });

    let unsubInquiries: (() => void) | undefined;
    try {
      unsubInquiries = listenToBrandInquiries((remoteInquiries) => {
        if (remoteInquiries && remoteInquiries.length > 0) {
          setBrandInquiries(remoteInquiries);
        }
      });
    } catch (inqErr) {
      console.warn('Brand inquiries listener setup notice:', inqErr);
    }

    let unsubEmailCampaigns: (() => void) | undefined;
    try {
      unsubEmailCampaigns = listenToEmailCampaigns((remoteEmailCampaigns) => {
        if (remoteEmailCampaigns && remoteEmailCampaigns.length > 0) {
          setEmailCampaigns(remoteEmailCampaigns);
        }
      });
    } catch (emErr) {
      console.warn('Email campaigns listener setup notice:', emErr);
    }

    let unsubNewsletter: (() => void) | undefined;
    try {
      unsubNewsletter = listenToNewsletterSubscribers((remoteSubscribers) => {
        if (remoteSubscribers && remoteSubscribers.length > 0) {
          setNewsletterSubscribers(remoteSubscribers);
        }
      });
    } catch (nlErr) {
      console.warn('Newsletter listener setup notice:', nlErr);
    }

    let unsubArticles: (() => void) | undefined;
    try {
      unsubArticles = listenToResearchArticles((remoteArticles) => {
        if (remoteArticles && remoteArticles.length > 0) {
          setResearchArticles(remoteArticles);
        }
      });
    } catch (artErr) {
      console.warn('Research articles listener setup notice:', artErr);
    }

    return () => {
      if (unsub) unsub();
      if (unsubInquiries) unsubInquiries();
      if (unsubEmailCampaigns) unsubEmailCampaigns();
      if (unsubNewsletter) unsubNewsletter();
      if (unsubArticles) unsubArticles();
    };
  }, []);

  // Sync to local storage for fast instant load
  useEffect(() => { saveStorage(STORAGE_KEYS.USERS, users); }, [users]);
  useEffect(() => { saveStorage(STORAGE_KEYS.CAMPAIGNS, campaigns); }, [campaigns]);
  useEffect(() => { saveStorage('chat_earn_brands', brands); }, [brands]);
  useEffect(() => { saveStorage(STORAGE_KEYS.RESPONSES, responses); }, [responses]);
  useEffect(() => { setLiveResponseData(responses, users); }, [responses, users]);
  useEffect(() => { saveStorage(STORAGE_KEYS.TRANSACTIONS, transactions); }, [transactions]);
  useEffect(() => { saveStorage(STORAGE_KEYS.WITHDRAWALS, withdrawals); }, [withdrawals]);
  useEffect(() => { saveStorage(STORAGE_KEYS.ADJUSTMENTS, adjustmentLogs); }, [adjustmentLogs]);
  useEffect(() => { saveStorage(STORAGE_KEYS.NOTIFICATIONS, notifications); }, [notifications]);
  useEffect(() => { saveStorage(STORAGE_KEYS.REFERRALS, referrals); }, [referrals]);
  useEffect(() => { saveStorage(STORAGE_KEYS.INVITATIONS, directInvitations); }, [directInvitations]);
  useEffect(() => { saveStorage(STORAGE_KEYS.BRAND_INQUIRIES, brandInquiries); }, [brandInquiries]);
  useEffect(() => { saveStorage(STORAGE_KEYS.EMAIL_CAMPAIGNS, emailCampaigns); }, [emailCampaigns]);
  useEffect(() => { saveStorage(STORAGE_KEYS.NEWSLETTER_SUBSCRIBERS, newsletterSubscribers); }, [newsletterSubscribers]);
  useEffect(() => { saveStorage(STORAGE_KEYS.RESEARCH_ARTICLES, researchArticles); }, [researchArticles]);
  useEffect(() => { saveStorage(STORAGE_KEYS.SETTINGS, settings); }, [settings]);
  useEffect(() => {
    if (currentUserId) {
      saveStorage(STORAGE_KEYS.CURRENT_USER_ID, currentUserId);
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER_ID);
    }
  }, [currentUserId]);

  const currentUser: User | null = currentUserId
    ? (() => {
        const u = users.find((usr) => usr.id === currentUserId) || null;
        if (u && u.email.toLowerCase() === 'ibrhussain6@gmail.com' && u.role !== 'admin') {
          return { ...u, role: 'admin' as const };
        }
        return u;
      })()
    : null;

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage((prev) => (prev?.text === text ? null : prev));
    }, 4000);
  };

  // Daily Survey & Quiz Limit (Max 5 completed per day)
  // Business rule: No customer can take more than 5 surveys including quizzes in one day.
  // Only 5 earnings can be done via survey or quiz per day.
  // For more earnings, users are encouraged to invite other people (unlimited referral rewards).
  const [isSurveyCooldownModalOpen, setIsSurveyCooldownModalOpen] = useState<boolean>(false);
  const [cooldownTicker, setCooldownTicker] = useState<number>(Date.now());
  const dailySurveysLimit = 5;

  useEffect(() => {
    const interval = setInterval(() => {
      setCooldownTicker(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const { isSurveyLimitReached, surveyCooldownUntil, dailySurveysCompletedCount } = useMemo(() => {
    if (!currentUser) {
      return { isSurveyLimitReached: false, surveyCooldownUntil: null, dailySurveysCompletedCount: 0 };
    }

    const now = new Date(cooldownTicker);
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime();

    // User responses completed today (includes all surveys and quizzes)
    const userResponsesToday = responses.filter(
      (r) => r.userId === currentUser.id && new Date(r.completedAt).getTime() >= startOfToday
    );

    const completedToday = userResponsesToday.length;

    // 1. Check explicit cooldown timestamp on user profile or in localStorage
    const storedCooldown =
      currentUser.surveyCooldownUntil ||
      localStorage.getItem(`vf360_cooldown_${currentUser.id}`);

    if (storedCooldown) {
      const storedTime = new Date(storedCooldown).getTime();
      if (storedTime > cooldownTicker) {
        return {
          isSurveyLimitReached: true,
          surveyCooldownUntil: storedCooldown,
          dailySurveysCompletedCount: Math.max(completedToday, 5),
        };
      }
    }

    // 2. Check if user has completed 5 or more surveys/quizzes today
    if (completedToday >= dailySurveysLimit) {
      // Cooldown expires at midnight tonight (start of next day)
      const midnightTonightIso = new Date(endOfToday).toISOString();
      return {
        isSurveyLimitReached: true,
        surveyCooldownUntil: midnightTonightIso,
        dailySurveysCompletedCount: completedToday,
      };
    }

    return {
      isSurveyLimitReached: false,
      surveyCooldownUntil: null,
      dailySurveysCompletedCount: completedToday,
    };
  }, [currentUser, responses, cooldownTicker, dailySurveysLimit]);

  const dailySurveysRemaining = Math.max(0, dailySurveysLimit - dailySurveysCompletedCount);

  const clearSurveyCooldown = () => {
    if (!currentUser) return;
    localStorage.removeItem(`vf360_cooldown_${currentUser.id}`);
    const updatedUser: User = {
      ...currentUser,
      surveyCooldownUntil: undefined,
    };
    setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? updatedUser : u)));
    updateUserInFirestore(currentUser.id, { surveyCooldownUntil: '' });
    showToast('Daily survey & quiz limit reset successfully for testing.', 'info');
  };

  const sendDirectInvite = (
    recipient: string,
    type: 'email' | 'phone',
    friendName?: string,
    customNote?: string
  ): { success: boolean; error?: string } => {
    if (!currentUser) {
      return { success: false, error: 'Please sign in to invite friends.' };
    }

    const cleanRecipient = recipient.trim();
    if (!cleanRecipient) {
      return {
        success: false,
        error: `Please enter a friend's ${type === 'email' ? 'email address' : 'phone number'}.`,
      };
    }

    if (type === 'email' && !cleanRecipient.includes('@')) {
      return { success: false, error: 'Please enter a valid email address.' };
    }

    const userCode =
      currentUser.referralCode ||
      `VF-${currentUser.name.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 4)}${currentUser.id.slice(-4).toUpperCase()}`;

    const newInvite: DirectInvitation = {
      id: `inv_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      userId: currentUser.id,
      recipient: cleanRecipient,
      type,
      friendName: friendName?.trim() || undefined,
      sentAt: new Date().toISOString(),
      status: 'sent',
      referralCode: userCode,
    };

    setDirectInvitations((prev) => [newInvite, ...prev]);

    // Increment user's referralCodesSentCount
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === currentUser.id) {
          const updated = {
            ...u,
            referralCodesSentCount: (u.referralCodesSentCount || 0) + 1,
          };
          updateUserInFirestore(u.id, updated);
          return updated;
        }
        return u;
      })
    );

    const inviteNotif: AppNotification = {
      id: `notif_inv_${Date.now()}`,
      userId: currentUser.id,
      title: `Direct Invite Sent ✉️`,
      message: `Your invitation code ${userCode} was sent to ${cleanRecipient}. You'll earn +300 coins when they register!`,
      type: 'system',
      read: false,
      timestamp: new Date().toISOString(),
      linkTab: 'referrals',
    };
    setNotifications((prev) => [inviteNotif, ...prev]);

    showToast(
      `Invitation sent to ${cleanRecipient}! You'll earn +300 reward coins once they register.`,
      'success'
    );
    return { success: true };
  };

  const login = (email: string, password?: string) => {
    const cleanEmail = email.trim().toLowerCase();
    let found = users.find((u) => u.email.toLowerCase() === cleanEmail);

    // Special recognition for primary platform administrator
    if (cleanEmail === 'ibrhussain6@gmail.com') {
      if (password && password !== 'Icon@7271202') {
        return { success: false, error: 'Invalid password for admin account.' };
      }

      if (!found) {
        const adminUser: User = {
          id: 'usr_admin_ibrhussain',
          name: 'Ibrhussain (Admin)',
          email: 'ibrhussain6@gmail.com',
          country: '',
          role: 'admin',
          coinBalance: 10000,
          totalEarned: 10000,
          redeemedCoins: 0,
          status: 'active',
          createdAt: new Date().toISOString(),
          bio: 'Platform Administrator & Owner',
          favoriteCategories: ['products', 'services', 'market_research'],
          referralCode: 'VF-IBRADMIN',
          referralsCount: 12,
          referralCoinsEarned: 3600,
        };
        setUsers((prev) => {
          const filtered = prev.filter((u) => u.email.toLowerCase() !== cleanEmail);
          return [...filtered, adminUser];
        });
        saveUserToFirestore(adminUser);
        found = adminUser;
      } else {
        // Clear synthetic default if it was falsely marked United States
        if (found.country === 'United States') {
          found = { ...found, country: '' };
          updateUserInFirestore(found.id, { country: '' });
        }
        if (found.role !== 'admin') {
          const upgraded: User = { ...found, role: 'admin' };
          setUsers((prev) => prev.map((u) => (u.id === found!.id ? upgraded : u)));
          saveUserToFirestore(upgraded);
          found = upgraded;
        }
      }

      setCurrentUserId(found.id);
      setCurrentView('admin');
      showToast(`Welcome back, Administrator ${found.name}!`, 'success');
      return { success: true };
    }

    if (!found) {
      return { success: false, error: 'No account found with this email address.' };
    }
    if (found.status === 'suspended') {
      return { success: false, error: 'Your account has been suspended. Please contact admin support.' };
    }
    setCurrentUserId(found.id);
    if (found.role === 'admin') {
      setCurrentView('admin');
    } else {
      setCurrentView('dashboard');
    }
    showToast(`Welcome back, ${found.name}!`, 'success');
    return { success: true };
  };

  const startGuestSession = () => {
    // Kept for backward compatibility interface
    setCurrentView('dashboard');
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    country: string,
    referralCode?: string,
    firstName?: string,
    lastName?: string
  ): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    const isAdminEmail = cleanEmail === 'ibrhussain6@gmail.com';

    // Validate genuine real email address (reject example domains, yopmail, and disposable email providers)
    if (!isAdminEmail) {
      const emailValidation = validateRealEmail(cleanEmail);
      if (!emailValidation.isValid) {
        return {
          success: false,
          error: emailValidation.error || 'Please provide an authentic, valid email address.',
        };
      }
    }

    if (users.some((u) => u.email.toLowerCase() === cleanEmail)) {
      return { success: false, error: 'An account with this email address already exists.' };
    }

    // Direct Firestore check to prevent race conditions from creating duplicate accounts
    try {
      const emailAlreadyExists = await checkUserEmailExistsInFirestore(cleanEmail);
      if (emailAlreadyExists) {
        return { success: false, error: 'An account with this email address is already registered.' };
      }
    } catch {
      // Continue if network timeout occurs
    }

    // Capture User Device IP address from current registration device
    let clientIp = '';
    try {
      clientIp = await getDeviceIp();
    } catch {
      clientIp = '';
    }
    if (!clientIp || clientIp === 'Unknown IP') {
      try {
        const mirrorRes = await fetch('https://api.ip.sb/jsonip', { signal: AbortSignal.timeout(2500) });
        if (mirrorRes.ok) {
          const mirrorData = await mirrorRes.json();
          if (mirrorData.ip) {
            clientIp = String(mirrorData.ip).trim();
          }
        }
      } catch {
        // Fallback if offline
      }
    }
    const finalSignupIp = clientIp && clientIp !== 'Unknown IP' ? clientIp : (typeof window !== 'undefined' && window.location.hostname === 'localhost' ? '127.0.0.1' : clientIp || 'Unknown IP');

    // Anti-Fraud Device IP & Duplicate ID Prevention: One customer on one IP address
    if (!isAdminEmail && finalSignupIp && finalSignupIp !== 'Unknown IP' && finalSignupIp !== '127.0.0.1') {
      const duplicateIpUser = users.find(
        (u) =>
          u.email.toLowerCase() !== cleanEmail &&
          ((u.signupIp && u.signupIp.trim().toLowerCase() === finalSignupIp.trim().toLowerCase()) ||
           (u.lastIp && u.lastIp.trim().toLowerCase() === finalSignupIp.trim().toLowerCase()))
      );
      if (duplicateIpUser) {
        return {
          success: false,
          error: 'Registration restricted: Only one customer account is permitted per device or IP network. An account has already been registered from this IP address.',
        };
      }
    }

    const trimmedCode = referralCode ? referralCode.trim().toUpperCase() : '';
    let referrer: User | undefined = undefined;
    if (trimmedCode) {
      referrer = users.find(
        (u) =>
          u.referralCode &&
          u.referralCode.toUpperCase() === trimmedCode &&
          u.email.toLowerCase() !== cleanEmail
      );

      // Anti-Fraud Device IP Detection: Block users from referring themselves on the same device/IP
      if (referrer && finalSignupIp && finalSignupIp !== 'Unknown IP' && finalSignupIp !== '127.0.0.1') {
        const referrerIp = referrer.signupIp || referrer.lastIp;
        if (referrerIp && referrerIp.trim() === finalSignupIp.trim()) {
          return {
            success: false,
            error: 'Self-referral detected. A referral bonus cannot be claimed from the same device or IP address as the referrer.',
          };
        }
      }
    }

    // Name formatting
    const parsedFirst = firstName?.trim() || name.trim().split(' ')[0] || name.trim();
    const parsedLast = lastName?.trim() || name.trim().split(' ').slice(1).join(' ') || '';
    const fullName = name.trim() || `${parsedFirst} ${parsedLast}`.trim();

    const generatedUserCode = isAdminEmail
      ? 'VF-IBRADMIN'
      : `VF-${fullName.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 4) || 'USER'}${Math.floor(1000 + Math.random() * 9000)}`;

    const newUser: User = {
      id: isAdminEmail ? 'usr_admin_ibrhussain' : `usr_${Date.now()}`,
      name: isAdminEmail ? 'Ibrhussain (Admin)' : fullName,
      firstName: isAdminEmail ? 'Ibrhussain' : parsedFirst,
      lastName: isAdminEmail ? 'Admin' : parsedLast,
      email: cleanEmail,
      country: country && country.trim() ? country.trim() : '',
      role: isAdminEmail ? 'admin' : 'user',
      coinBalance: isAdminEmail ? 4000 : 50 + (referrer ? 50 : 0),
      redeemableCoinBalance: isAdminEmail ? 4000 : 0,
      surveyCoinsPendingReview: 0,
      totalEarned: isAdminEmail ? 10000 : 50 + (referrer ? 50 : 0),
      redeemedCoins: 0,
      status: 'active',
      createdAt: new Date().toISOString(),
      bio: isAdminEmail ? 'Platform Administrator & Owner' : 'Voice Flow 360 member',
      referralCode: generatedUserCode,
      referredBy: referrer ? referrer.id : undefined,
      referralsCount: 0,
      referralCoinsEarned: 0,
      referralCodesSentCount: 0,
      signupIp: finalSignupIp,
      lastIp: finalSignupIp,
    };

    const welcomeTx: Transaction = {
      id: `tx_${Date.now()}`,
      userId: newUser.id,
      type: 'bonus',
      amount: 50 + (referrer ? 50 : 0),
      description: referrer
        ? `Welcome Gift + Referral Friend Bonus (Referred by ${referrer.name})`
        : 'Welcome Registration Bonus Gift',
      date: new Date().toISOString(),
      status: 'completed',
    };

    const welcomeNotif: AppNotification = {
      id: `notif_${Date.now()}`,
      userId: newUser.id,
      title: 'Welcome to Voice Flow 360! 🎉',
      message: referrer
        ? `You received 100 free Welcome & Referral bonus Coins! Start answering surveys and sharing your link to earn.`
        : 'You received 50 free Welcome Coins! Start chatting to earn more.',
      type: 'reward',
      read: false,
      timestamp: new Date().toISOString(),
    };

    // If referrer exists, award them 300 coins!
    if (referrer) {
      const rewardCoins = settings.referralRewardCoins || 300;
      const refTx: Transaction = {
        id: `tx_ref_${Date.now()}`,
        userId: referrer.id,
        type: 'bonus',
        amount: rewardCoins,
        description: `Referral Reward: ${newUser.name} joined with your code (+${rewardCoins} Coins)`,
        date: new Date().toISOString(),
        status: 'completed',
      };

      const refNotif: AppNotification = {
        id: `notif_ref_${Date.now()}`,
        userId: referrer.id,
        title: 'Referral Bonus Received! 🎁',
        message: `Your friend ${newUser.name} just signed up! You have been awarded ${rewardCoins} bonus coins.`,
        type: 'reward',
        read: false,
        timestamp: new Date().toISOString(),
      };

      const refRecord: ReferralRecord = {
        id: `ref_${Date.now()}`,
        referrerId: referrer.id,
        referrerName: referrer.name,
        referredUserId: newUser.id,
        referredUserName: newUser.name,
        referredUserEmail: newUser.email,
        coinsAwarded: rewardCoins,
        status: 'completed',
        joinedAt: new Date().toISOString(),
      };

      setReferrals((prev) => [refRecord, ...prev]);
      setTransactions((prev) => [welcomeTx, refTx, ...prev]);
      setNotifications((prev) => [welcomeNotif, refNotif, ...prev]);

      setUsers((prev) =>
        prev
          .map((u) => {
            if (u.id === referrer!.id) {
              const updated = {
                ...u,
                coinBalance: u.coinBalance + rewardCoins,
                totalEarned: u.totalEarned + rewardCoins,
                referralsCount: (u.referralsCount || 0) + 1,
                referralCoinsEarned: (u.referralCoinsEarned || 0) + rewardCoins,
              };
              updateUserInFirestore(u.id, updated);
              return updated;
            }
            return u;
          })
          .concat(newUser)
      );

      saveTransactionToFirestore(refTx);
      saveNotificationToFirestore(refNotif);
    } else {
      setUsers((prev) => [newUser, ...prev]);
      setTransactions((prev) => [welcomeTx, ...prev]);
      setNotifications((prev) => [welcomeNotif, ...prev]);
    }

    setCurrentUserId(newUser.id);
    setCurrentView('dashboard');

    // Persist new user to Firestore database
    saveUserToFirestore(newUser);
    saveTransactionToFirestore(welcomeTx);
    saveNotificationToFirestore(welcomeNotif);

    showToast(
      referrer
        ? `Account created! Awarded 100 welcome coins + ${referrer.name} received 300 referral reward!`
        : `Account created! Welcome +50 bonus coins awarded.`,
      'success'
    );
    return { success: true };
  };

  // Interactive helper allowing a user to simulate an invited friend signing up
  const simulateReferralSignup = (friendName: string, friendEmail: string) => {
    if (!currentUser) {
      return { success: false, error: 'Please log in to invite friends.' };
    }

    const cleanEmail = (friendEmail || `friend_${Date.now().toString().slice(-4)}@example.com`).trim().toLowerCase();
    const cleanName = (friendName || 'Alex Rivers').trim();
    const rewardCoins = settings.referralRewardCoins || 300;

    const dummyFriendUser: User = {
      id: `usr_friend_${Date.now()}`,
      name: cleanName,
      email: cleanEmail,
      country: '',
      role: 'user',
      coinBalance: 100,
      totalEarned: 100,
      redeemedCoins: 0,
      status: 'active',
      createdAt: new Date().toISOString(),
      bio: 'Referred friend member',
      referralCode: `VF-${cleanName.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 4)}${Math.floor(1000 + Math.random() * 9000)}`,
      referredBy: currentUser.id,
      referralsCount: 0,
      referralCoinsEarned: 0,
      signupIp: currentUser.signupIp || currentUser.lastIp || '104.28.19.45',
      lastIp: currentUser.signupIp || currentUser.lastIp || '104.28.19.45',
    };

    const refTx: Transaction = {
      id: `tx_ref_${Date.now()}`,
      userId: currentUser.id,
      type: 'bonus',
      amount: rewardCoins,
      description: `Referral Reward: ${cleanName} joined using your invite link (+${rewardCoins} Coins)`,
      date: new Date().toISOString(),
      status: 'completed',
    };

    const refNotif: AppNotification = {
      id: `notif_ref_${Date.now()}`,
      userId: currentUser.id,
      title: 'Friend Joined! +300 Coins Awarded 🎁',
      message: `${cleanName} (${cleanEmail}) joined using your referral code! 300 coins credited to your account.`,
      type: 'reward',
      read: false,
      timestamp: new Date().toISOString(),
    };

    const refRecord: ReferralRecord = {
      id: `ref_${Date.now()}`,
      referrerId: currentUser.id,
      referrerName: currentUser.name,
      referredUserId: dummyFriendUser.id,
      referredUserName: cleanName,
      referredUserEmail: cleanEmail,
      coinsAwarded: rewardCoins,
      status: 'completed',
      joinedAt: new Date().toISOString(),
    };

    setReferrals((prev) => [refRecord, ...prev]);
    setTransactions((prev) => [refTx, ...prev]);
    setNotifications((prev) => [refNotif, ...prev]);

    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === currentUser.id) {
          const updated = {
            ...u,
            coinBalance: u.coinBalance + rewardCoins,
            totalEarned: u.totalEarned + rewardCoins,
            referralsCount: (u.referralsCount || 0) + 1,
            referralCoinsEarned: (u.referralCoinsEarned || 0) + rewardCoins,
          };
          updateUserInFirestore(u.id, updated);
          return updated;
        }
        return u;
      }).concat(dummyFriendUser)
    );

    saveUserToFirestore(dummyFriendUser);
    saveTransactionToFirestore(refTx);
    saveNotificationToFirestore(refNotif);

    showToast(`🎉 Referral Success! ${cleanName} joined. +${rewardCoins} coins added to your balance!`, 'success');
    return { success: true };
  };

  const recordReferralShare = (targetUserId?: string) => {
    const uid = targetUserId || currentUser?.id;
    if (uid) {
      setUsers((prev) =>
        prev.map((u) => {
          if (u.id === uid) {
            const updated = {
              ...u,
              referralCodesSentCount: (u.referralCodesSentCount || 0) + 1,
            };
            updateUserInFirestore(u.id, updated);
            return updated;
          }
          return u;
        })
      );
    }
  };

  const logout = () => {
    setCurrentUserId(null);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER_ID);
    setActiveChatCampaign(null);
    setCurrentView('about');
    showToast('Signed out successfully', 'info');
  };

  const switchUser = (userId: string) => {
    const target = users.find((u) => u.id === userId);
    if (target) {
      setCurrentUserId(target.id);
      if (target.role === 'admin') {
        setCurrentView('admin');
      } else {
        setCurrentView('dashboard');
      }
      showToast(`Switched account to ${target.name} (${target.role})`, 'info');
    }
  };

  const resetPassword = (email: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const exists = users.some((u) => u.email.toLowerCase() === cleanEmail);
    if (exists) {
      showToast(`Password reset link sent to ${email}`, 'success');
      return true;
    }
    showToast('No account found with that email', 'error');
    return false;
  };

  const updateUserProfile = (userId: string, updates: Partial<User>) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, ...updates } : u))
    );
    updateUserInFirestore(userId, updates);
    showToast('Profile details updated and saved to database', 'success');
  };

  const startChat = (campaign: Campaign) => {
    // If 5 surveys/quizzes completed in one day, block entry and show cooldown modal with referral options
    if (isSurveyLimitReached) {
      setIsSurveyCooldownModalOpen(true);
      showToast(
        'Daily limit reached (5/5 surveys & quizzes completed today). Invite friends to earn unlimited coins!',
        'info'
      );
      return;
    }

    let freshQuestions = campaign.questions;

    // If campaign has no questions or is an initial un-customized default brand, resolve authentic brand questions
    if (!freshQuestions || freshQuestions.length === 0) {
      const brand = RAW_100_BRANDS.find((b) => b.id === campaign.brandId) ||
                    RAW_100_BRANDS.find((b) => b.id === `br_${campaign.id.replace('cmp_', '')}`) ||
                    RAW_100_BRANDS.find((b) => campaign.title.toLowerCase().startsWith(b.name.toLowerCase()));
      if (brand) {
        const rawQ = getQuestionsForBrand(brand.id, brand.name, brand.sector, brand.keyProduct);
        freshQuestions = rawQ.map((q, idx) => ({
          ...q,
          id: `q_${brand.id}_${idx + 1}`,
          order: idx + 1,
        }));
      }
    }

    const liveCampaign: Campaign = {
      ...campaign,
      questions: freshQuestions && freshQuestions.length > 0 ? freshQuestions : campaign.questions,
    };

    setActiveChatCampaign(liveCampaign);
    setCurrentView('chat');

    // Intelligently trigger vignette ad when customer starts filling a survey
    triggerSurveyStartVignetteAd('survey_start_chat');
  };

  const cancelChat = () => {
    setActiveChatCampaign(null);
    setCurrentView('dashboard');
  };

  const hasUserCompletedCampaign = (userId: string, campaignId: string) => {
    return responses.some((r) => r.userId === userId && r.campaignId === campaignId);
  };

  const submitFeedbackResponse = (
    campaignId: string,
    answers: UserAnswer[],
    earnedCoins: number
  ) => {
    if (!currentUser) return;

    const campaign = campaigns.find((c) => c.id === campaignId);
    if (!campaign) return;

    const newResponse: UserResponse = {
      id: `resp_${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userEmail: currentUser.email,
      campaignId: campaign.id,
      campaignTitle: campaign.title,
      category: campaign.category,
      answers,
      completedAt: new Date().toISOString(),
      coinsAwarded: earnedCoins,
    };

    const newTransaction: Transaction = {
      id: `tx_${Date.now()}`,
      userId: currentUser.id,
      type: 'earned',
      amount: earnedCoins,
      description: `Completed "${campaign.title}" feedback chat`,
      date: new Date().toISOString(),
      status: 'completed',
      campaignId: campaign.id,
    };

    const newNotification: AppNotification = {
      id: `notif_${Date.now()}`,
      userId: currentUser.id,
      title: `+${earnedCoins} Coins Earned! 🪙`,
      message: `You completed "${campaign.title}" and earned ${earnedCoins} coins!`,
      type: 'reward',
      read: false,
      timestamp: new Date().toISOString(),
    };

    const updatedCampaign: Campaign = {
      ...campaign,
      completedCount: campaign.completedCount + 1,
    };

    // Calculate daily limit check (surveys + quizzes completed today)
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime();
    const userResponsesToday = responses.filter(
      (r) => r.userId === currentUser.id && new Date(r.completedAt).getTime() >= startOfToday
    );

    let cooldownExpiresIso: string | undefined = undefined;
    // If this completion brings today's count of completed surveys/quizzes to 5 or more:
    if (userResponsesToday.length + 1 >= dailySurveysLimit) {
      cooldownExpiresIso = new Date(endOfToday).toISOString();
      localStorage.setItem(`vf360_cooldown_${currentUser.id}`, cooldownExpiresIso);
    }

    const currentPending = currentUser.surveyCoinsPendingReview || 0;
    const currentRedeemable = currentUser.redeemableCoinBalance ?? Math.max(0, currentUser.coinBalance - currentPending);

    const updatedUser: User = {
      ...currentUser,
      coinBalance: currentUser.coinBalance + earnedCoins,
      surveyCoinsPendingReview: currentPending + earnedCoins,
      redeemableCoinBalance: currentRedeemable,
      totalEarned: currentUser.totalEarned + earnedCoins,
      ...(cooldownExpiresIso ? { surveyCooldownUntil: cooldownExpiresIso } : {}),
    };

    // Update local state
    setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? updatedUser : u)));
    setCampaigns((prev) => prev.map((c) => (c.id === campaignId ? updatedCampaign : c)));
    setResponses((prev) => [newResponse, ...prev]);
    setTransactions((prev) => [newTransaction, ...prev]);
    setNotifications((prev) => [newNotification, ...prev]);

    // Persist batch to Firestore database
    saveFeedbackResponseToFirestore(
      newResponse,
      newTransaction,
      newNotification,
      updatedUser,
      updatedCampaign
    );

    if (cooldownExpiresIso) {
      showToast(
        `Earned +${earnedCoins} Coins! Daily limit reached (5/5 surveys & quizzes completed today). Invite friends to keep earning unlimited coins!`,
        'info'
      );
      setTimeout(() => {
        setIsSurveyCooldownModalOpen(true);
      }, 1000);
    } else {
      const remainingToday = Math.max(0, dailySurveysLimit - (userResponsesToday.length + 1));
      showToast(
        `Earned +${earnedCoins} Coins! (${remainingToday} survey/quiz earnings left today)`,
        'success'
      );
    }
  };

  const createCampaign = (data: Omit<Campaign, 'id' | 'createdAt' | 'completedCount'>) => {
    const newCamp: Campaign = {
      ...data,
      id: `cmp_${Date.now()}`,
      createdAt: new Date().toISOString(),
      completedCount: 0,
      status: data.status || 'active',
    };
    setCampaigns((prev) => [newCamp, ...prev]);
    saveCampaignToFirestore(newCamp);
    showToast(`Survey Campaign "${newCamp.title}" is now LIVE and visible to all customers!`, 'success');
    return newCamp;
  };

  const addBrand = (brandData: Omit<Brand, "id" | "createdAt">) => {
    const newBrandId = "br_" + Math.random().toString(36).substring(2, 9);
    const newBrand: Brand = {
      ...brandData,
      id: newBrandId,
      createdAt: new Date().toISOString(),
    };

    // Standard high-quality feedback survey for the new brand
    const defaultBrandQuestions: Question[] = [
      {
        id: `q_${newBrandId}_1`,
        text: `How would you rate your overall experience with ${brandData.name}?`,
        type: 'rating',
        required: true,
        order: 1,
      },
      {
        id: `q_${newBrandId}_2`,
        text: `What is the primary factor that draws you to ${brandData.name}?`,
        type: 'single_choice',
        options: ['Product & Build Quality', 'Customer Service & Reliability', 'Competitive Pricing / Value', 'Ecosystem & Ease of Use'],
        required: true,
        order: 2,
      },
      {
        id: `q_${newBrandId}_3`,
        text: `How likely are you to recommend ${brandData.name} to peers or family? (1 = Unlikely, 10 = Definitely)`,
        type: 'scale',
        scaleMin: 1,
        scaleMax: 10,
        scaleMinLabel: 'Unlikely',
        scaleMaxLabel: 'Definitely',
        required: true,
        order: 3,
      },
      {
        id: `q_${newBrandId}_4`,
        text: `Do you plan on using or purchasing from ${brandData.name} over the next 12 months?`,
        type: 'yes_no',
        required: true,
        order: 4,
      },
      {
        id: `q_${newBrandId}_5`,
        text: `What is one improvement or new feature you would like ${brandData.name} to introduce?`,
        type: 'text',
        required: true,
        placeholder: `Share your constructive suggestions for ${brandData.name}...`,
        order: 5,
      },
    ];

    const newCamp: Campaign = {
      id: `cmp_${newBrandId.replace('br_', '')}`,
      title: `${brandData.name} Customer Experience Survey`,
      description: brandData.description || `Share your authentic feedback on ${brandData.name} to earn 100 Coins.`,
      category: (brandData.category as any) || 'products',
      targetAudience: 'All registered platform users',
      estimatedMinutes: 3,
      rewardCoins: 100,
      status: 'active',
      questions: defaultBrandQuestions,
      brandId: newBrandId,
      createdAt: new Date().toISOString(),
      completedCount: 0,
    };

    setBrands((prev) => [newBrand, ...prev]);
    saveBrandToFirestore(newBrand);

    setCampaigns((prev) => [newCamp, ...prev]);
    saveCampaignToFirestore(newCamp);

    showToast(`Brand "${newBrand.name}" & active feedback survey created! Automatically visible to customers.`, 'success');
    return newBrand;
  };

  const updateBrand = (id: string, updates: Partial<Brand>) => {
    setBrands((prev) => prev.map((b) => (b.id === id ? { ...b, ...updates } : b)));
    updateBrandInFirestore(id, updates);
    showToast("Brand updated", "success");
  };

  const deleteBrand = (id: string) => {
    setBrands((prev) => prev.filter((b) => b.id !== id));
    deleteBrandFromFirestore(id);
    showToast("Brand deleted from database", "success");
  };

  const syncAllBrands = async () => {
    try {
      const existingMap = new Map<string, Brand>(brands.map((b) => [b.id, b]));
      const initialList: Brand[] = INITIAL_BRANDS;
      const merged: Brand[] = [
        ...initialList.map((initB) => existingMap.get(initB.id) || initB),
        ...brands.filter((b) => !initialList.some((initB) => initB.id === b.id)),
      ];
      setBrands(merged);
      saveStorage('chat_earn_brands', merged);
      await syncAll100BrandsToFirestore(merged);
      showToast(`Linked and synchronized all ${merged.length} brands with Brand Insights & database!`, 'success');
    } catch (err) {
      console.error('Failed to sync brands:', err);
      showToast('Error syncing brands to database', 'error');
    }
  };

  const toggleResponseVisibility = (id: string) => {
    const target = responses.find((r) => r.id === id);
    if (!target) return;
    const newHidden = !target.isHidden;
    setResponses((prev) => prev.map((r) => (r.id === id ? { ...r, isHidden: newHidden } : r)));
    toggleResponseVisibilityInFirestore(id, newHidden);
    showToast("Response visibility updated", "success");
  };

  const updateCampaign = (campaignId: string, updates: Partial<Campaign>) => {
    setCampaigns((prev) =>
      prev.map((c) => (c.id === campaignId ? { ...c, ...updates } : c))
    );
    updateCampaignInFirestore(campaignId, updates);
    showToast('Campaign updated and saved', 'success');
  };

  const deleteCampaign = (campaignId: string) => {
    setCampaigns((prev) => prev.filter((c) => c.id !== campaignId));
    deleteCampaignFromFirestore(campaignId);
    showToast('Campaign deleted from database', 'info');
  };

  const setCampaignStatus = (campaignId: string, status: CampaignStatus) => {
    setCampaigns((prev) =>
      prev.map((c) => (c.id === campaignId ? { ...c, status } : c))
    );
    updateCampaignInFirestore(campaignId, { status });
    showToast(`Campaign status changed to ${status}`, 'info');
  };

  const setUserAccountStatus = (userId: string, status: UserAccountStatus) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, status } : u))
    );
    updateUserInFirestore(userId, { status });
    showToast(`User status set to ${status}`, 'info');
  };

  const deleteUserAccount = async (userId: string): Promise<{ success: boolean; error?: string }> => {
    const targetUser = users.find((u) => u.id === userId);
    if (!targetUser) {
      return { success: false, error: 'User not found' };
    }
    if (targetUser.role === 'admin' || targetUser.email.toLowerCase() === 'ibrhussain6@gmail.com') {
      showToast('Admin accounts cannot be deleted.', 'error');
      return { success: false, error: 'Cannot delete administrator account' };
    }

    setUsers((prev) => prev.filter((u) => u.id !== userId));
    saveStorage(STORAGE_KEYS.USERS, users.filter((u) => u.id !== userId));
    await deleteUserFromFirestore(userId);
    showToast(`User account for ${targetUser.name} (${targetUser.email}) was removed.`, 'info');
    return { success: true };
  };

  const deduplicateAllUsers = async (targetEmail?: string): Promise<{ success: boolean; count: number }> => {
    try {
      const { deletedIds } = await deduplicateUsersInFirestore(targetEmail);
      if (deletedIds.length > 0) {
        setUsers((prev) => prev.filter((u) => !deletedIds.includes(u.id)));
        showToast(`Merged and removed ${deletedIds.length} duplicate customer profile${deletedIds.length > 1 ? 's' : ''}.`, 'success');
      } else {
        // Also perform local in-memory cleanup if any duplicate entries remain in state
        const seen = new Set<string>();
        let localRemoved = 0;
        setUsers((prev) => {
          const cleaned: User[] = [];
          for (const u of prev) {
            const emailKey = (u.email || '').trim().toLowerCase();
            if (targetEmail && emailKey !== targetEmail.trim().toLowerCase()) {
              cleaned.push(u);
              continue;
            }
            if (!seen.has(emailKey)) {
              seen.add(emailKey);
              cleaned.push(u);
            } else {
              localRemoved++;
            }
          }
          return cleaned;
        });

        if (localRemoved > 0) {
          showToast(`Cleaned ${localRemoved} duplicate user account${localRemoved > 1 ? 's' : ''}.`, 'success');
        } else {
          showToast('No duplicate accounts found.', 'info');
        }
      }
      return { success: true, count: deletedIds.length };
    } catch (err) {
      console.error('Failed to deduplicate accounts:', err);
      showToast('Error merging duplicate user accounts', 'error');
      return { success: false, count: 0 };
    }
  };

  const adjustUserBalance = (userId: string, amount: number, reason: string) => {
    const targetUser = users.find((u) => u.id === userId);
    if (!targetUser) return;

    const previousBalance = targetUser.coinBalance;
    const newBalance = Math.max(0, previousBalance + amount);
    const adminName = currentUser?.name || 'Administrator';

    const log: BalanceAdjustmentLog = {
      id: `adj_${Date.now()}`,
      userId,
      userName: targetUser.name,
      amount,
      reason,
      adminName,
      timestamp: new Date().toISOString(),
      previousBalance,
      newBalance,
    };

    const tx: Transaction = {
      id: `tx_${Date.now()}`,
      userId,
      type: 'adjustment',
      amount: Math.abs(amount),
      description: `Admin adjustment (${amount >= 0 ? '+' : '-'}${Math.abs(amount)} coins): ${reason}`,
      date: new Date().toISOString(),
      status: 'completed',
    };

    const notif: AppNotification = {
      id: `notif_${Date.now()}`,
      userId,
      title: 'Balance Adjustment',
      message: `Your balance was adjusted by ${amount >= 0 ? '+' : ''}${amount} Coins. Reason: ${reason}`,
      type: 'system',
      read: false,
      timestamp: new Date().toISOString(),
    };

    const updatedUser: User = {
      ...targetUser,
      coinBalance: newBalance,
      totalEarned: amount > 0 ? targetUser.totalEarned + amount : targetUser.totalEarned,
    };

    setUsers((prev) => prev.map((u) => (u.id === userId ? updatedUser : u)));
    setAdjustmentLogs((prev) => [log, ...prev]);
    setTransactions((prev) => [tx, ...prev]);
    setNotifications((prev) => [notif, ...prev]);

    saveBalanceAdjustmentToFirestore(log, tx, notif, updatedUser);
    showToast(`Adjusted ${targetUser.name}'s balance by ${amount} coins`, 'success');
  };

  const applyBotPenaltyCutoff = (userId: string, customPercent?: number, customReason?: string) => {
    const targetUser = users.find((u) => u.id === userId);
    if (!targetUser) return;

    const penaltyPercent = customPercent ?? settings.botPenaltyCutoffPercent ?? 60;
    // Calculate deduction amount: percentage of total balance, minimum 50 coins or balance if smaller
    const deductionCoins = Math.min(
      targetUser.coinBalance,
      Math.max(20, Math.round((targetUser.coinBalance * penaltyPercent) / 100))
    );

    if (deductionCoins <= 0) {
      showToast(`${targetUser.name} currently has 0 coins available for penalty deduction.`, 'info');
      return;
    }

    const reason = customReason || `Quality Audit: Flagged for robotic / low-effort response (-${penaltyPercent}% cutoff deduction applied)`;
    adjustUserBalance(userId, -deductionCoins, reason);
    showToast(`Deducted ${deductionCoins} coins (-${penaltyPercent}%) from ${targetUser.name} for quality penalty.`, 'success');
  };

  const submitWithdrawalRequest = (
    coins: number,
    method: PayoutMethod,
    accountDetails: string
  ) => {
    if (!currentUser) return { success: false, error: 'Must be logged in' };

    // Minimum redemption threshold validation:
    // Minimum withdrawal balance threshold is 2,000 coins (20 Reward Credits) for all supported payout systems
    const minRequiredCoins = settings.minWithdrawalCoins || 2000;

    if (coins < minRequiredCoins) {
      return {
        success: false,
        error: `Minimum redemption for your country's supported payout systems (Bank Transfer, Crypto, etc.) is ${minRequiredCoins} coins (20 Reward Credits). You can redeem once your balance is at or above ${minRequiredCoins} coins.`,
      };
    }

    // Referral Requirement Check: Must refer the platform to at least 10 members who joined (one customer per IP verified)
    const MIN_REFERRALS_REQUIRED = 10;
    const completedRefs = referrals.filter(
      (r) => r.referrerId === currentUser.id && r.status === 'completed'
    );
    const joinedReferralsCount = Math.max(completedRefs.length, currentUser.referralsCount || 0);

    if (joinedReferralsCount < MIN_REFERRALS_REQUIRED && currentUser.role !== 'admin') {
      return {
        success: false,
        error: `Withdrawal checklist incomplete: You must refer 10 members who join the platform before withdrawing funds (Current: ${joinedReferralsCount}/${MIN_REFERRALS_REQUIRED} joined). Invite ${MIN_REFERRALS_REQUIRED - joinedReferralsCount} more friends to unlock cashout.`,
      };
    }

    // Check Redeemable Wallet balance:
    // Only coins reviewed and transferred to the Redeemable Wallet (on the 1st of every month) can be withdrawn!
    const redeemableAvailable = currentUser.redeemableCoinBalance ?? Math.max(0, currentUser.coinBalance - (currentUser.surveyCoinsPendingReview ?? 0));

    if (coins > redeemableAvailable) {
      const pendingReviewCoins = currentUser.surveyCoinsPendingReview ?? 0;
      return {
        success: false,
        error: `Insufficient balance in your Redeemable Wallet (${redeemableAvailable} coins available). Your pending survey earnings (${pendingReviewCoins} coins) will be transferred to your Redeemable Wallet on the 1st of the month after quality review.`,
      };
    }

    const usdAmount = Number((coins * settings.coinToUsdRate).toFixed(2));
    const newWithdrawal: WithdrawalRequest = {
      id: `wd_${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userEmail: currentUser.email,
      coins,
      usdAmount,
      payoutMethod: method,
      accountDetails,
      status: 'pending',
      requestedAt: new Date().toISOString(),
    };

    const newTx: Transaction = {
      id: `tx_${Date.now()}`,
      userId: currentUser.id,
      type: 'redeemed',
      amount: coins,
      description: `Reward Redemption Request: ${coins} Coins (${Math.floor(coins / 100)} Credits) via ${method.replace('_', ' ').toUpperCase()}`,
      date: new Date().toISOString(),
      status: 'pending',
      withdrawalId: newWithdrawal.id,
    };

    const notif: AppNotification = {
      id: `notif_${Date.now()}`,
      userId: currentUser.id,
      title: 'Redemption Request Submitted',
      message: `Your request to redeem ${coins} coins (${Math.floor(coins / 100)} Credits) via ${method.replace('_', ' ')} is being processed.`,
      type: 'withdrawal',
      read: false,
      timestamp: new Date().toISOString(),
    };

    const updatedUser: User = {
      ...currentUser,
      coinBalance: Math.max(0, currentUser.coinBalance - coins),
      redeemableCoinBalance: Math.max(0, redeemableAvailable - coins),
      redeemedCoins: currentUser.redeemedCoins + coins,
    };

    setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? updatedUser : u)));
    setWithdrawals((prev) => [newWithdrawal, ...prev]);
    setTransactions((prev) => [newTx, ...prev]);
    setNotifications((prev) => [notif, ...prev]);

    saveWithdrawalToFirestore(newWithdrawal, newTx, notif, updatedUser);

    showToast(`Redemption request for ${coins} coins (${Math.floor(coins / 100)} Credits) submitted successfully!`, 'success');
    return { success: true };
  };

  // System to review all customer-filled surveys and transfer reward coins to Redeemable Wallet by the 1st of the month
  const processMonthlyWalletTransfer = (customUserId?: string) => {
    const targetUserId = customUserId || currentUser?.id;
    if (!targetUserId) {
      return { success: false, transferredCoins: 0, message: 'No active user selected.' };
    }

    const targetUser = users.find((u) => u.id === targetUserId);
    if (!targetUser) {
      return { success: false, transferredCoins: 0, message: 'User not found.' };
    }

    const pendingCoins = targetUser.surveyCoinsPendingReview || 0;
    if (pendingCoins <= 0) {
      showToast('All survey reward coins are already reviewed and in your Redeemable Wallet!', 'info');
      return { success: true, transferredCoins: 0, message: 'No pending survey balance to transfer.' };
    }

    const reviewedCoins = pendingCoins;
    const currentRedeemable = targetUser.redeemableCoinBalance ?? Math.max(0, targetUser.coinBalance - pendingCoins);
    const newRedeemable = currentRedeemable + reviewedCoins;
    const nowIso = new Date().toISOString();

    const updatedUser: User = {
      ...targetUser,
      surveyCoinsPendingReview: 0,
      redeemableCoinBalance: newRedeemable,
      lastMonthlyReviewDate: nowIso,
    };

    const auditTx: Transaction = {
      id: `tx_audit_${Date.now()}`,
      userId: targetUser.id,
      type: 'adjustment',
      amount: reviewedCoins,
      description: `Monthly Quality Audit Approved: Transferred ${reviewedCoins} survey coins (${Math.floor(reviewedCoins / 100)} Credits) to Redeemable Wallet`,
      date: nowIso,
      status: 'completed',
    };

    const notif: AppNotification = {
      id: `notif_audit_${Date.now()}`,
      userId: targetUser.id,
      title: 'Monthly Wallet Balance Transferred! 🎉',
      message: `${reviewedCoins} survey reward coins (${Math.floor(reviewedCoins / 100)} Credits) were reviewed and transferred to your Redeemable Wallet. You can now redeem your rewards!`,
      type: 'reward',
      read: false,
      timestamp: nowIso,
    };

    setUsers((prev) => prev.map((u) => (u.id === targetUser.id ? updatedUser : u)));
    setTransactions((prev) => [auditTx, ...prev]);
    setNotifications((prev) => [notif, ...prev]);

    updateUserInFirestore(targetUser.id, updatedUser);
    saveTransactionToFirestore(auditTx);
    saveNotificationToFirestore(notif);

    showToast(`Transferred ${reviewedCoins} reviewed coins (${Math.floor(reviewedCoins / 100)} Credits) to Redeemable Wallet!`, 'success');
    return {
      success: true,
      transferredCoins: reviewedCoins,
      message: `Successfully reviewed and transferred ${reviewedCoins} coins to Redeemable Wallet.`,
    };
  };

  const updateWithdrawalStatus = (
    withdrawalId: string,
    status: WithdrawalStatus,
    adminNote?: string
  ) => {
    const targetWd = withdrawals.find((w) => w.id === withdrawalId);
    if (!targetWd) return;

    setWithdrawals((prev) =>
      prev.map((w) =>
        w.id === withdrawalId
          ? {
              ...w,
              status,
              adminNote: adminNote ?? w.adminNote,
              processedAt: new Date().toISOString(),
            }
          : w
      )
    );

    // Update corresponding transaction status
    setTransactions((prev) =>
      prev.map((t) =>
        t.withdrawalId === withdrawalId
          ? {
              ...t,
              status: status === 'rejected' ? 'rejected' : status === 'completed' ? 'completed' : 'pending',
            }
          : t
      )
    );

    // If rejected, refund coins back to user balance!
    if (status === 'rejected') {
      const targetUser = users.find((u) => u.id === targetWd.userId);
      let updatedUserObj: User | null = null;
      if (targetUser) {
        updatedUserObj = {
          ...targetUser,
          coinBalance: targetUser.coinBalance + targetWd.coins,
          redeemedCoins: Math.max(0, targetUser.redeemedCoins - targetWd.coins),
        };
        setUsers((prev) => prev.map((u) => (u.id === targetWd.userId ? updatedUserObj! : u)));
      }

      const refundNotif: AppNotification = {
        id: `notif_${Date.now()}`,
        userId: targetWd.userId,
        title: 'Withdrawal Rejected - Coins Refunded',
        message: `Your withdrawal request of ${targetWd.coins} coins was rejected: ${adminNote || 'No reason specified'}. Coins were refunded to your balance.`,
        type: 'withdrawal',
        read: false,
        timestamp: new Date().toISOString(),
      };
      setNotifications((prev) => [refundNotif, ...prev]);

      updateWithdrawalStatusInFirestore(
        withdrawalId,
        status,
        adminNote,
        updatedUserObj ? { user: updatedUserObj, refundNotif } : undefined
      );
    } else {
      const updateNotif: AppNotification = {
        id: `notif_${Date.now()}`,
        userId: targetWd.userId,
        title: `Withdrawal ${status.toUpperCase()} 🎉`,
        message: `Your withdrawal of $${targetWd.usdAmount.toFixed(2)} (${targetWd.coins} coins) is now marked as ${status}.`,
        type: 'withdrawal',
        read: false,
        timestamp: new Date().toISOString(),
      };
      setNotifications((prev) => [updateNotif, ...prev]);

      updateWithdrawalStatusInFirestore(withdrawalId, status, adminNote);
      saveNotificationToFirestore(updateNotif);
    }

    showToast(`Withdrawal #${withdrawalId.slice(-4)} updated to ${status}`, 'success');
  };

  const markNotificationRead = (notifId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notifId ? { ...n, read: true } : n))
    );
    markNotificationReadInFirestore(notifId);
  };

  const markAllNotificationsRead = () => {
    if (!currentUser) return;
    setNotifications((prev) =>
      prev.map((n) => (n.userId === currentUser.id ? { ...n, read: true } : n))
    );
    notifications
      .filter((n) => n.userId === currentUser.id && !n.read)
      .forEach((n) => markNotificationReadInFirestore(n.id));
  };

  const updateSettings = (newSettings: Partial<PlatformSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    updateSettingsInFirestore(updated);
    showToast('Platform settings updated in database', 'success');
  };

  const addBrandInquiry = async (
    inquiryData: Omit<BrandInquiry, 'id' | 'submittedAt' | 'status'>
  ): Promise<BrandInquiry> => {
    const newInquiry: BrandInquiry = {
      ...inquiryData,
      id: `inq_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      submittedAt: new Date().toISOString(),
      status: 'pending',
    };

    setBrandInquiries((prev) => {
      const updated = [newInquiry, ...prev];
      saveStorage(STORAGE_KEYS.BRAND_INQUIRIES, updated);
      return updated;
    });

    try {
      await saveBrandInquiryToFirestore(newInquiry);
    } catch (err) {
      console.warn('Could not save brand inquiry to Firestore immediately, cached locally:', err);
    }

    showToast(`Research brief for ${newInquiry.brandName} submitted successfully!`, 'success');
    return newInquiry;
  };

  const updateBrandInquiryStatus = async (
    inquiryId: string,
    status: InquiryStatus,
    adminNotes?: string,
    campaignCreatedId?: string
  ): Promise<void> => {
    setBrandInquiries((prev) => {
      const updated = prev.map((inq) => {
        if (inq.id === inquiryId) {
          return {
            ...inq,
            status,
            ...(adminNotes !== undefined ? { adminNotes } : {}),
            ...(campaignCreatedId !== undefined ? { campaignCreatedId } : {}),
          };
        }
        return inq;
      });
      saveStorage(STORAGE_KEYS.BRAND_INQUIRIES, updated);
      return updated;
    });

    try {
      await updateBrandInquiryStatusInFirestore(inquiryId, status, adminNotes, campaignCreatedId);
    } catch (err) {
      console.warn('Could not update brand inquiry status in Firestore:', err);
    }

    showToast(`Inquiry status updated to ${status.replace(/_/g, ' ')}`, 'info');
  };

  const sendEmailCampaign = async (
    campaignData: Omit<EmailCampaign, 'id' | 'createdAt' | 'status' | 'stats'>
  ): Promise<EmailCampaign> => {
    const newId = `emc_${Date.now()}`;
    const recipientCount = campaignData.recipientCount || users.length;
    const delivered = Math.max(1, recipientCount - (recipientCount > 10 ? Math.floor(recipientCount * 0.012) : 0));
    const failed = recipientCount - delivered;

    const created: EmailCampaign = {
      ...campaignData,
      id: newId,
      createdAt: new Date().toISOString(),
      sentAt: new Date().toISOString(),
      status: 'sent',
      stats: {
        totalRecipients: recipientCount,
        deliveredCount: delivered,
        failedCount: failed,
        openRateEstimatedPercent: Math.min(88, Math.floor(64 + Math.random() * 16)),
        clickRateEstimatedPercent: Math.min(62, Math.floor(39 + Math.random() * 14)),
      },
    };

    setEmailCampaigns((prev) => {
      const updated = [created, ...prev];
      saveStorage(STORAGE_KEYS.EMAIL_CAMPAIGNS, updated);
      return updated;
    });

    // Send in-app notification if requested
    if (campaignData.sendInAppNotification) {
      const targetUsers = users.filter((u) => {
        if (campaignData.targetAudience === 'active_only') return u.status === 'active';
        if (campaignData.targetAudience === 'specific_country' && campaignData.targetCountry) {
          return u.country.toLowerCase() === campaignData.targetCountry.toLowerCase();
        }
        if (campaignData.targetAudience === 'high_earners') return u.totalEarned > 500;
        return true;
      });

      const newNotifs: AppNotification[] = targetUsers.map((u) => ({
        id: `notif_emc_${Date.now()}_${u.id}`,
        userId: u.id,
        title: `🚀 New Survey Alert: ${campaignData.subject}`,
        message: campaignData.introMessage || 'New high-paying surveys are ready in your dashboard. Complete them now to claim your coin rewards!',
        type: 'campaign',
        read: false,
        timestamp: new Date().toISOString(),
        linkTab: 'surveys',
      }));

      setNotifications((prev) => {
        const updated = [...newNotifs, ...prev];
        saveStorage(STORAGE_KEYS.NOTIFICATIONS, updated);
        return updated;
      });
    }

    try {
      await saveEmailCampaignToFirestore(created);
    } catch (err) {
      console.warn('Could not save email campaign to Firestore:', err);
    }

    showToast(`Batch email campaign sent to ${recipientCount} users!`, 'success');
    return created;
  };

  const deleteEmailCampaign = async (id: string): Promise<void> => {
    setEmailCampaigns((prev) => {
      const updated = prev.filter((c) => c.id !== id);
      saveStorage(STORAGE_KEYS.EMAIL_CAMPAIGNS, updated);
      return updated;
    });

    try {
      await deleteEmailCampaignFromFirestore(id);
    } catch (err) {
      console.warn('Could not delete email campaign from Firestore:', err);
    }

    showToast('Email campaign removed from history', 'info');
  };

  const subscribeToNewsletter = async (
    email: string,
    customPrefs?: Partial<NewsletterPreferences>
  ): Promise<{ success: boolean; message: string; isAlreadySubscribed?: boolean }> => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      return { success: false, message: 'Please enter a valid email address.' };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return { success: false, message: 'Please enter a valid email format.' };
    }

    const existingIndex = newsletterSubscribers.findIndex(
      (s) => s.email.toLowerCase() === cleanEmail
    );

    const prefs: NewsletterPreferences = {
      newSurveys: customPrefs?.newSurveys ?? true,
      platformUpdates: customPrefs?.platformUpdates ?? true,
      weeklyDigest: customPrefs?.weeklyDigest ?? true,
    };

    if (existingIndex >= 0) {
      const existing = newsletterSubscribers[existingIndex];
      const updated: NewsletterSubscriber = {
        ...existing,
        preferences: prefs,
        status: 'active',
      };
      const nextList = [...newsletterSubscribers];
      nextList[existingIndex] = updated;
      setNewsletterSubscribers(nextList);
      saveStorage(STORAGE_KEYS.NEWSLETTER_SUBSCRIBERS, nextList);
      try {
        await saveNewsletterSubscriberToFirestore(updated);
      } catch (e) {
        console.warn('Firestore newsletter update notice:', e);
      }
      showToast("Preferences updated! You're all set to receive your chosen alerts.", 'success');
      return {
        success: true,
        message: "Preferences updated! You're all set to receive your chosen alerts.",
        isAlreadySubscribed: true,
      };
    }

    const newSubscriber: NewsletterSubscriber = {
      id: `sub_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      email: cleanEmail,
      preferences: prefs,
      subscribedAt: new Date().toISOString(),
      source: 'footer',
      status: 'active',
      userId: currentUser?.id,
      country: currentUser?.country,
    };

    const nextList = [newSubscriber, ...newsletterSubscribers];
    setNewsletterSubscribers(nextList);
    saveStorage(STORAGE_KEYS.NEWSLETTER_SUBSCRIBERS, nextList);

    try {
      await saveNewsletterSubscriberToFirestore(newSubscriber);
    } catch (e) {
      console.warn('Firestore newsletter save notice:', e);
    }

    // Attempt to send branded welcome email via cPanel SMTP if configured
    try {
      fetch('/api/email/send-welcome', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, preferences: prefs }),
      }).catch((err) => console.warn('Welcome email trigger notice:', err));
    } catch (ignore) {}

    showToast('Subscribed! You will receive survey alerts and platform updates.', 'success');

    return {
      success: true,
      message: "Thank you for subscribing! You'll receive instant alerts for new surveys and platform updates.",
      isAlreadySubscribed: false,
    };
  };

  const markAllCustomersAsNewsletterSubscribers = useCallback(
    async (showFeedback = true): Promise<{ success: boolean; totalCount: number; addedCount: number }> => {
      // Find all users who have an email address
      const customersWithEmail = users.filter(
        (u) => u.email && u.email.trim().length > 0 && u.email.includes('@')
      );

      const existingMap = new Map<string, NewsletterSubscriber>(
        newsletterSubscribers.map((sub) => [sub.email.toLowerCase().trim(), sub] as [string, NewsletterSubscriber])
      );

      let addedCount = 0;
      const updatedSubscribers: NewsletterSubscriber[] = [...newsletterSubscribers];
      const nowIso = new Date().toISOString();

      const defaultPrefs: NewsletterPreferences = {
        newSurveys: true,
        platformUpdates: true,
        weeklyDigest: true,
      };

      customersWithEmail.forEach((customer) => {
        const cleanEmail = customer.email.toLowerCase().trim();
        const existing = existingMap.get(cleanEmail);

        if (!existing) {
          const newSub: NewsletterSubscriber = {
            id: `sub_${customer.id}`,
            email: cleanEmail,
            userName: customer.name || `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || undefined,
            preferences: defaultPrefs,
            subscribedAt: customer.createdAt || nowIso,
            source: 'customer_account',
            status: 'active',
            userId: customer.id,
            country: customer.country || undefined,
          };
          updatedSubscribers.push(newSub);
          existingMap.set(cleanEmail, newSub);
          addedCount++;
        } else if (existing.status !== 'active' || !existing.userId) {
          const idx = updatedSubscribers.findIndex((s) => s.id === existing.id);
          if (idx >= 0) {
            updatedSubscribers[idx] = {
              ...existing,
              status: 'active',
              userId: customer.id,
              userName: customer.name || existing.userName,
              country: customer.country || existing.country,
            };
          }
        }
      });

      // Update users state to mark newsletterSubscribed: true
      const updatedUsers = users.map((u) => {
        if (u.email && u.email.trim().includes('@')) {
          return {
            ...u,
            newsletterSubscribed: true,
            newsletterSubscribedAt: u.newsletterSubscribedAt || nowIso,
          };
        }
        return u;
      });

      setNewsletterSubscribers(updatedSubscribers);
      setUsers(updatedUsers);
      saveStorage(STORAGE_KEYS.NEWSLETTER_SUBSCRIBERS, updatedSubscribers);
      saveStorage(STORAGE_KEYS.USERS, updatedUsers);

      try {
        await syncAllCustomersAsNewsletterSubscribersToFirestore(updatedSubscribers, updatedUsers);
      } catch (err) {
        console.warn('Firestore sync notice for customer newsletter subscribers:', err);
      }

      if (showFeedback) {
        showToast(
          `All ${customersWithEmail.length} customers with valid emails are now marked as active newsletter subscribers!`,
          'success'
        );
      }

      return {
        success: true,
        totalCount: customersWithEmail.length,
        addedCount,
      };
    },
    [users, newsletterSubscribers, showToast]
  );

  const toggleCustomerNewsletter = useCallback(
    async (userId: string): Promise<boolean> => {
      const user = users.find((u) => u.id === userId);
      if (!user || !user.email) {
        showToast('Customer does not have a registered email address', 'error');
        return false;
      }

      const cleanEmail = user.email.toLowerCase().trim();
      const existing = newsletterSubscribers.find((s) => s.email.toLowerCase().trim() === cleanEmail);
      const willBeSubscribed = !user.newsletterSubscribed || (existing && existing.status === 'unsubscribed');
      const nowIso = new Date().toISOString();

      let nextSubscribers = [...newsletterSubscribers];
      if (existing) {
        nextSubscribers = nextSubscribers.map((s) =>
          s.id === existing.id
            ? { ...s, status: willBeSubscribed ? 'active' : 'unsubscribed' }
            : s
        );
      } else if (willBeSubscribed) {
        nextSubscribers.push({
          id: `sub_${user.id}`,
          email: cleanEmail,
          userName: user.name,
          preferences: { newSurveys: true, platformUpdates: true, weeklyDigest: true },
          subscribedAt: nowIso,
          source: 'customer_account',
          status: 'active',
          userId: user.id,
          country: user.country,
        });
      }

      const nextUsers = users.map((u) =>
        u.id === userId
          ? {
              ...u,
              newsletterSubscribed: willBeSubscribed,
              newsletterSubscribedAt: willBeSubscribed ? (u.newsletterSubscribedAt || nowIso) : undefined,
            }
          : u
      );

      setNewsletterSubscribers(nextSubscribers);
      setUsers(nextUsers);
      saveStorage(STORAGE_KEYS.NEWSLETTER_SUBSCRIBERS, nextSubscribers);
      saveStorage(STORAGE_KEYS.USERS, nextUsers);

      const targetSub = nextSubscribers.find((s) => s.email.toLowerCase().trim() === cleanEmail);
      if (targetSub) {
        try {
          await saveNewsletterSubscriberToFirestore(targetSub);
          await updateUserInFirestore(userId, {
            newsletterSubscribed: willBeSubscribed,
            newsletterSubscribedAt: willBeSubscribed ? (user.newsletterSubscribedAt || nowIso) : undefined,
          });
        } catch (e) {
          console.warn('Firestore update notice for customer newsletter toggle:', e);
        }
      }

      showToast(
        `${user.name} is now ${willBeSubscribed ? 'subscribed to' : 'unsubscribed from'} the newsletter.`,
        'success'
      );
      return willBeSubscribed;
    },
    [users, newsletterSubscribers, showToast]
  );

  // Auto-sync: Ensure all customers with emails are marked as subscribers to newsletter on boot
  useEffect(() => {
    const hasUnsubscribedCustomer = users.some(
      (u) =>
        u.email &&
        u.email.trim().includes('@') &&
        (!u.newsletterSubscribed ||
          !newsletterSubscribers.some(
            (s) => s.email.toLowerCase().trim() === u.email.toLowerCase().trim() && s.status === 'active'
          ))
    );

    if (hasUnsubscribedCustomer) {
      markAllCustomersAsNewsletterSubscribers(false);
    }
  }, [users, newsletterSubscribers, markAllCustomersAsNewsletterSubscribers]);

  const resetAllDataToDefault = () => {
    localStorage.clear();
    setUsers(INITIAL_USERS);
    setCampaigns(INITIAL_CAMPAIGNS);
    setResponses(INITIAL_RESPONSES);
    setTransactions(INITIAL_TRANSACTIONS);
    setWithdrawals(INITIAL_WITHDRAWALS);
    setAdjustmentLogs(INITIAL_ADJUSTMENT_LOGS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setSettings(INITIAL_SETTINGS);
    setCurrentUserId('usr_1');
    setActiveChatCampaign(null);
    setIsSurveyCooldownModalOpen(false);
    setCurrentView('dashboard');
    showToast('All data reset to initial demo values', 'info');
  };

  const navigateToResearchArticle = useCallback((slug: string) => {
    setSelectedArticleSlugState(slug);
    setCurrentViewState('brand-research-study-detail');
    if (typeof window !== 'undefined') {
      const targetPath = `/brand-research-studies/${slug}`;
      if (window.location.pathname !== targetPath) {
        window.history.pushState({ view: 'brand-research-study-detail', articleSlug: slug }, '', targetPath);
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  const setSelectedArticleSlug = useCallback((slug: string | null) => {
    setSelectedArticleSlugState(slug);
    if (slug) {
      navigateToResearchArticle(slug);
    }
  }, [navigateToResearchArticle]);

  const saveResearchArticle = useCallback((
    articleData: Omit<ResearchArticle, 'id' | 'created_at' | 'updated_at'> & { id?: string }
  ): { success: boolean; error?: string; article?: ResearchArticle } => {
    const cleanTitle = articleData.title?.trim();
    const cleanBrandName = articleData.brand_name?.trim();
    let cleanSlug = (articleData.slug || '')
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
    const cleanCategory = articleData.category?.trim() || 'General';
    const cleanExcerpt = articleData.excerpt?.trim() || '';
    const cleanBody = articleData.body?.trim() || '';
    const cleanSourcesNote = articleData.sources_note?.trim() || '';
    const status = articleData.status || 'draft';

    if (!cleanTitle) {
      return { success: false, error: 'Article title is required.' };
    }
    if (!cleanBrandName) {
      return { success: false, error: 'Brand name is required.' };
    }
    if (!cleanSlug) {
      cleanSlug = cleanTitle
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
    }
    if (!cleanSlug) {
      return { success: false, error: 'A valid URL slug is required.' };
    }
    if (!cleanExcerpt) {
      return { success: false, error: 'An excerpt or summary is required for the card listing.' };
    }
    if (!cleanBody) {
      return { success: false, error: 'Article body content cannot be empty.' };
    }

    const articleId = articleData.id || `art_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

    // Check duplicate title
    const duplicateTitle = researchArticles.find(
      (a) => a.id !== articleId && a.title.trim().toLowerCase() === cleanTitle.toLowerCase()
    );
    if (duplicateTitle) {
      return { success: false, error: `An article with the title "${cleanTitle}" already exists.` };
    }

    // Check duplicate slug
    const duplicateSlug = researchArticles.find(
      (a) => a.id !== articleId && a.slug.trim().toLowerCase() === cleanSlug.toLowerCase()
    );
    if (duplicateSlug) {
      return { success: false, error: `An article with the slug "${cleanSlug}" already exists. Please choose a unique slug.` };
    }

    // Guardrail before publishing:
    // Require sources_note to be non-empty if body contains any numeric claim (% or NPS)
    if (status === 'published') {
      const hasNumericClaim = /%|\bNPS\b/i.test(cleanBody);
      if (hasNumericClaim && !cleanSourcesNote) {
        return {
          success: false,
          error: 'Methodology Citation Required: The article contains percentage statistics or NPS metrics. Please cite your sources and methodology in the Sources & Methodology field before publishing.'
        };
      }
    }

    const now = new Date().toISOString();
    const existingArticle = researchArticles.find((a) => a.id === articleId);

    let publishedAt = articleData.published_at || null;
    if (status === 'published' && !publishedAt) {
      publishedAt = now;
    } else if (status === 'draft' && !articleData.published_at) {
      publishedAt = null;
    }

    const finalArticle: ResearchArticle = {
      id: articleId,
      title: cleanTitle,
      slug: cleanSlug,
      brand_name: cleanBrandName,
      category: cleanCategory,
      cover_image_url:
        articleData.cover_image_url ||
        'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
      excerpt: cleanExcerpt,
      body: cleanBody,
      sources_note: cleanSourcesNote,
      status,
      published_at: publishedAt,
      created_at: existingArticle?.created_at || now,
      updated_at: now,
    };

    setResearchArticles((prev) => {
      const filtered = prev.filter((a) => a.id !== articleId);
      return [finalArticle, ...filtered];
    });

    saveResearchArticleToFirestore(finalArticle);

    showToast(
      status === 'published'
        ? `Research study "${cleanTitle}" published successfully!`
        : `Draft "${cleanTitle}" saved successfully!`,
      'success'
    );

    return { success: true, article: finalArticle };
  }, [researchArticles, showToast]);

  const deleteResearchArticle = useCallback((id: string): { success: boolean; error?: string } => {
    const target = researchArticles.find((a) => a.id === id);
    if (!target) {
      return { success: false, error: 'Article not found.' };
    }

    setResearchArticles((prev) => prev.filter((a) => a.id !== id));
    deleteResearchArticleFromFirestore(id);
    showToast(`Research study "${target.title}" deleted.`, 'info');
    return { success: true };
  }, [researchArticles, showToast]);

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        campaigns,
        responses,
        transactions,
        withdrawals,
        adjustmentLogs,
        notifications,
        referrals,
        settings,
        activeChatCampaign,
        brands,
        selectedBrandId,
        setSelectedBrandId,
        addBrand,
        updateBrand,
        deleteBrand,
        syncAllBrands,
        toggleResponseVisibility,
        currentView,
        toastMessage,
        isDbConnected,
        isFirestoreSynced,
        setCurrentView,
        showToast,
        login,
        register,
        startGuestSession,
        logout,
        switchUser,
        resetPassword,
        updateUserProfile,
        simulateReferralSignup,
        recordReferralShare,
        startChat,
        cancelChat,
        submitFeedbackResponse,
        hasUserCompletedCampaign,
        createCampaign,
        updateCampaign,
        deleteCampaign,
        setCampaignStatus,
        setUserAccountStatus,
        deleteUserAccount,
        deduplicateAllUsers,
        adjustUserBalance,
        applyBotPenaltyCutoff,
        submitWithdrawalRequest,
        updateWithdrawalStatus,
        processMonthlyWalletTransfer,
        markNotificationRead,
        markAllNotificationsRead,
        updateSettings,
        resetAllDataToDefault,
        dailySurveysCompletedCount,
        dailySurveysLimit,
        dailySurveysRemaining,
        isSurveyLimitReached,
        surveyCooldownUntil,
        clearSurveyCooldown,
        isSurveyCooldownModalOpen,
        setIsSurveyCooldownModalOpen,
        directInvitations,
        sendDirectInvite,
        brandInquiries,
        addBrandInquiry,
        updateBrandInquiryStatus,
        prefilledInquiryForCampaign,
        setPrefilledInquiryForCampaign,
        emailCampaigns,
        sendEmailCampaign,
        deleteEmailCampaign,
        newsletterSubscribers,
        subscribeToNewsletter,
        markAllCustomersAsNewsletterSubscribers,
        toggleCustomerNewsletter,
        researchArticles,
        selectedArticleSlug,
        setSelectedArticleSlug,
        navigateToResearchArticle,
        saveResearchArticle,
        deleteResearchArticle,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
