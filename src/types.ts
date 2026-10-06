export type QuestionType =
  | 'text'
  | 'single_choice'
  | 'multiple_choice'
  | 'yes_no'
  | 'rating'
  | 'scale'
  | 'quiz';

export type CampaignCategory =
  | 'products'
  | 'services'
  | 'brands'
  | 'social_media'
  | 'market_research'
  | 'quick_questions'
  | 'quizzes';

export type CampaignStatus = 'draft' | 'active' | 'paused' | 'completed' | 'archived';

export type UserRole = 'user' | 'admin';

export type UserAccountStatus = 'active' | 'inactive' | 'suspended';

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  options?: string[];
  required?: boolean;
  order: number;
  reward?: number; // optional individual question reward
  correctAnswer?: string; // for quiz type
  explanation?: string; // for quiz type
  scaleMin?: number;
  scaleMax?: number;
  scaleMinLabel?: string;
  scaleMaxLabel?: string;
  placeholder?: string;
}

export interface Brand {
  id: string;
  name: string;
  category: string;
  sector?: string;
  description: string;
  icon?: string;
  logo?: string;
  keyProduct?: string;
  website?: string;
  createdAt: string;
}

export interface Campaign {
  id: string;
  title: string;
  description: string;
  category: CampaignCategory;
  targetAudience: string;
  estimatedMinutes: number;
  rewardCoins: number;
  status: CampaignStatus;
  questions: Question[];
  createdAt: string;
  completedCount: number;
  icon?: string;
  brandId?: string;
}

export interface UserAnswer {
  questionId: string;
  questionText: string;
  answer: string | string[] | number;
  isCorrect?: boolean;
}

export interface UserResponse {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  campaignId: string;
  campaignTitle: string;
  category: CampaignCategory;
  answers: UserAnswer[];
  completedAt: string;
  coinsAwarded: number;
  earnedCoins?: number; // Backwards-compatible alias
  brandId?: string;
  isHidden?: boolean;
}

export type TransactionType = 'earned' | 'redeemed' | 'bonus' | 'adjustment';
export type TransactionStatus = 'completed' | 'pending' | 'approved' | 'rejected';

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  description: string;
  date: string;
  status: TransactionStatus;
  campaignId?: string;
  withdrawalId?: string;
}

export type PayoutMethod = 'paypal' | 'bank_transfer' | 'gift_card' | 'crypto';
export type WithdrawalStatus = 'pending' | 'approved' | 'processing' | 'completed' | 'rejected';

export interface WithdrawalRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  coins: number;
  usdAmount: number;
  payoutMethod: PayoutMethod;
  accountDetails: string;
  status: WithdrawalStatus;
  requestedAt: string;
  processedAt?: string;
  adminNote?: string;
}

export interface User {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  country: string;
  role: UserRole;
  coinBalance: number;
  totalEarned: number;
  redeemedCoins: number;
  status: UserAccountStatus;
  createdAt: string;
  avatar?: string;
  bio?: string;
  favoriteCategories?: CampaignCategory[];
  isGuest?: boolean;
  referralCode?: string;
  referredBy?: string;
  referralsCount?: number;
  referralCoinsEarned?: number;
  referralCodesSentCount?: number; // Total referral codes/invitation links sent or shared by user
  surveyCooldownUntil?: string; // ISO timestamp when daily survey/quiz limit cooldown expires
  surveyCoinsPendingReview?: number; // Coins earned from customer-filled surveys awaiting monthly quality review
  redeemableCoinBalance?: number; // Reviewed and approved coin balance in Redeemable Wallet ready for bank/cashout transfer
  lastMonthlyReviewDate?: string;
  newsletterSubscribed?: boolean; // True if customer has their email subscribed to platform newsletters & alerts
  newsletterSubscribedAt?: string;
  signupIp?: string; // Captured client/device IP during registration
  lastIp?: string; // Most recently observed device IP
}

export interface DirectInvitation {
  id: string;
  userId: string;
  recipient: string; // email address or phone number
  type: 'email' | 'phone';
  friendName?: string;
  sentAt: string;
  status: 'sent' | 'joined';
  referralCode: string;
}

export interface ReferralRecord {
  id: string;
  referrerId: string;
  referrerName: string;
  referredUserId: string;
  referredUserName: string;
  referredUserEmail: string;
  coinsAwarded: number;
  status: 'completed' | 'pending';
  joinedAt: string;
}

export interface BalanceAdjustmentLog {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  reason: string;
  adminName: string;
  timestamp: string;
  previousBalance: number;
  newBalance: number;
}

export interface PlatformSettings {
  coinToUsdRate: number; // e.g., 0.01 ($1 per 100 coins)
  minWithdrawalCoins: number; // e.g., 10000 coins ($100.00 min for Bank Transfer / standard wallets)
  minCryptoWithdrawalCoins: number; // e.g., 500 coins ($5.00 min for Crypto redemption)
  platformName: string;
  allowNewRegistrations: boolean;
  bonusForQuizCorrectAnswer: number;
  referralRewardCoins: number; // 300 coins per friend signup
  botPenaltyCutoffPercent: number; // percentage deducted for flagged low-effort/bot responses (e.g., 20%)
  qualityAuditEnabled: boolean;
  // Google AdSense Global Optimization & Placement Switches
  adsenseEnabled?: boolean; // Global master killswitch for AdSense ads
  adClientPubId?: string; // Publisher ID, default "ca-pub-2513423020167554"
  enableStickyAnchorAd?: boolean; // Bottom sticky anchor ad banner on mobile/desktop
  enableDirectoryBannerAd?: boolean; // Brand Directory leaderboard unit
  enableArticleInContentAd?: boolean; // In-depth Brand Research study articles in-content ad
  enableChatBreakAd?: boolean; // Survey conversational break ads
  enableNewsFeedAd?: boolean; // News and updates feed ad unit
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'reward' | 'campaign' | 'system' | 'withdrawal';
  read: boolean;
  timestamp: string;
  linkTab?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'bot' | 'user' | 'system';
  text: string;
  timestamp: string;
  questionId?: string;
  questionType?: QuestionType;
  options?: string[];
  scaleMin?: number;
  scaleMax?: number;
  scaleMinLabel?: string;
  scaleMaxLabel?: string;
  isQuizResult?: boolean;
  isCorrect?: boolean;
  explanation?: string;
  isAdBreak?: boolean;
  adIndex?: number;
}

export type MarketResearchMethodology =
  | 'conversational_voice_text'
  | 'concept_feature_validation'
  | 'brand_perception_awareness'
  | 'pricing_sensitivity'
  | 'usability_product_feedback'
  | 'competitor_benchmark'
  | 'custom_study';

export type InquiryStatus = 'pending' | 'in_review' | 'contacted' | 'campaign_created' | 'closed';

export interface BrandInquiry {
  id: string;
  brandName: string;
  brandLogo?: string;
  productOrServiceName: string;
  productCategory?: string;
  methodology: MarketResearchMethodology;
  sampleSize: number;
  geographicRegion: string;
  targetDemographics: {
    ageGroups: string[];
    gender: 'all' | 'male' | 'female' | 'non_binary';
    additionalNotes?: string;
  };
  contactInfo: {
    contactName: string;
    workEmail: string;
    phone?: string;
    companyWebsite?: string;
    timeline?: string;
  };
  message?: string;
  estimatedPriceUsd?: number;
  submittedAt: string;
  status: InquiryStatus;
  campaignCreatedId?: string;
  adminNotes?: string;
}

export type EmailCampaignStatus = 'draft' | 'sending' | 'sent' | 'scheduled';
export type EmailTargetAudience = 'all' | 'active_only' | 'specific_country' | 'high_earners' | 'new_members' | 'newsletter_subscribers' | 'single_customer';
export type EmailTemplateType =
  | 'new_surveys_alert'
  | 'high_reward_spotlight'
  | 'weekly_digest'
  | 're_engagement'
  | 'custom_announcement'
  | 'monthly_earning_credited';

export interface EmailCampaignStats {
  totalRecipients: number;
  deliveredCount: number;
  failedCount: number;
  openRateEstimatedPercent: number;
  clickRateEstimatedPercent: number;
}

export interface EmailCampaign {
  id: string;
  subject: string;
  previewText: string;
  templateType: EmailTemplateType;
  targetAudience: EmailTargetAudience;
  targetCountry?: string;
  recipientCount: number;
  recipientSample?: string[]; // sample emails
  featuredSurveyIds: string[];
  headline: string;
  introMessage: string;
  ctaText: string;
  customBodyHtml?: string;
  bonusCoinsIncentive?: number;
  sendInAppNotification: boolean;
  status: EmailCampaignStatus;
  createdAt: string;
  sentAt?: string;
  createdByName: string;
  stats: EmailCampaignStats;
}

export interface NewsletterPreferences {
  newSurveys: boolean;      // Instant alerts for new high-paying surveys & brand studies
  platformUpdates: boolean; // Platform announcements, payout enhancements & bonus drops
  weeklyDigest: boolean;    // Weekly digest & top earner highlights
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  userName?: string;
  preferences: NewsletterPreferences;
  subscribedAt: string;
  source: string;
  status: 'active' | 'unsubscribed';
  userId?: string;
  country?: string;
}

export type ResearchArticleStatus = 'draft' | 'under_review' | 'published' | 'rejected' | 'archived';

export interface ResearchArticle {
  id: string;
  title: string;
  slug: string;
  brand_name: string;
  category: string;
  cover_image_url: string;
  excerpt: string;
  body: string;
  sources_note: string;
  status: ResearchArticleStatus;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  // Rigorous editorial & empirical research study metadata
  research_question?: string;
  fieldwork_dates?: string;
  valid_responses_count?: number;
  recruitment_method?: string;
  participant_geography?: string;
  participant_demographics?: string;
  sample_limitations?: string;
  reviewer_name?: string;
  reviewed_at?: string | null;
  review_notes?: string;
  study_type_classification?: 'independent' | 'commissioned';
  is_illustrative_demo?: boolean;
}

