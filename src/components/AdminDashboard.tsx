import React, { useState, useMemo } from 'react';
import { AdminBrandsTab } from './AdminBrandsTab';
import { AdminReportingAnalytics } from './AdminReportingAnalytics';
import { useApp } from '../context/AppContext';
import { SEOHead } from './SEOHead';
import { getCountryFlag, COUNTRIES } from '../data/countries';
import {
  isDateTodayWithMode,
  getResponseCoins,
  getDeviceTimezoneLabel,
  TimezoneMode,
} from '../utils/reportingDateUtils';
import {
  Campaign,
  Question,
  QuestionType,
  CampaignCategory,
  CampaignStatus,
  UserAccountStatus,
  User,
  WithdrawalStatus,
} from '../types';
import {
  Shield,
  LayoutDashboard,
  Users,
  MessageSquarePlus,
  BarChart3,
  Gift,
  Settings as SettingsIcon,
  Plus,
  Trash2,
  Edit,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Coins,
  DollarSign,
  Search,
  ArrowUpRight,
  TrendingUp,
  Download,
  Eye,
  Clock,
  Sparkles,
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Globe,
  UserCheck,
  X,
  Check,
  Building2,
  Percent,
  Bot,
  AlertOctagon,
  RefreshCw,
  UserPlus,
  FileCheck2,
  CalendarClock,
  Share2,
  Calendar,
  Mail,
  Send,
  Loader2,
  BookOpen,
  Network,
  Laptop,
  Copy,
} from 'lucide-react';
import { AdminBrandInquiriesTab } from './AdminBrandInquiriesTab';
import { AdminEmailCampaignTab } from './AdminEmailCampaignTab';
import { AdminResearchStudiesTab } from './AdminResearchStudiesTab';

type AdminTab =
  | 'overview'
  | 'reporting'
  | 'brands'
  | 'research_studies'
  | 'inquiries'
  | 'email_campaigns'
  | 'users'
  | 'campaigns'
  | 'builder'
  | 'responses'
  | 'withdrawals'
  | 'settings';

export const AdminDashboard: React.FC = () => {
  const {
    currentUser,
    brands,
    users,
    campaigns,
    responses,
    transactions,
    withdrawals,
    referrals,
    adjustmentLogs,
    brandInquiries,
    emailCampaigns,
    newsletterSubscribers,
    researchArticles,
    markAllCustomersAsNewsletterSubscribers,
    toggleCustomerNewsletter,
    settings,
    createCampaign,
    updateCampaign,
    deleteCampaign,
    setCampaignStatus,
    setUserAccountStatus,
    deleteUserAccount,
    deduplicateAllUsers,
    adjustUserBalance,
    applyBotPenaltyCutoff,
    toggleResponseVisibility,
    updateWithdrawalStatus,
    updateUserProfile,
    updateSettings,
    showToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  // User Management state
  const [userSearch, setUserSearch] = useState('');
  const [userNewsletterFilter, setUserNewsletterFilter] = useState<'all' | 'subscribed' | 'not_subscribed'>('all');
  const [duplicateIpOnlyFilter, setDuplicateIpOnlyFilter] = useState(false);
  const [isBulkMarkingNewsletter, setIsBulkMarkingNewsletter] = useState(false);
  const [userSortField, setUserSortField] = useState<'createdAt' | 'name' | 'totalEarned' | 'country'>('createdAt');
  const [userSortOrder, setUserSortOrder] = useState<'desc' | 'asc'>('desc');
  const [selectedUserForAdjustment, setSelectedUserForAdjustment] = useState<User | null>(null);
  const [adjustmentAmount, setAdjustmentAmount] = useState<number>(100);
  const [adjustmentReason, setAdjustmentReason] = useState('');
  const [editingUserCountryId, setEditingUserCountryId] = useState<string | null>(null);

  // Map of device IP address occurrences across all registered users
  const ipOccurrencesMap = useMemo(() => {
    const counts = new Map<string, number>();
    users.forEach((u) => {
      const ip = (u.signupIp || u.lastIp || '').trim();
      if (ip && ip !== 'Unknown IP' && ip !== '127.0.0.1') {
        counts.set(ip, (counts.get(ip) || 0) + 1);
      }
    });
    return counts;
  }, [users]);

  // Total users who share a duplicate device IP address
  const duplicateIpUsersCount = useMemo(() => {
    return users.filter((u) => {
      const ip = (u.signupIp || u.lastIp || '').trim();
      return ip && ip !== 'Unknown IP' && ip !== '127.0.0.1' && (ipOccurrencesMap.get(ip) || 0) > 1;
    }).length;
  }, [users, ipOccurrencesMap]);

  // Active newsletter subscribers email lookup map
  const activeSubscribersEmailMap = useMemo(() => {
    const map = new Map<string, typeof newsletterSubscribers[0]>();
    newsletterSubscribers.forEach((s) => {
      if (s.status === 'active') {
        map.set(s.email.toLowerCase().trim(), s);
      }
    });
    return map;
  }, [newsletterSubscribers]);

  const isUserSubscribedToNewsletter = (user: User) => {
    if (!user.email || !user.email.includes('@')) return false;
    return Boolean(
      user.newsletterSubscribed ||
        activeSubscribersEmailMap.has(user.email.toLowerCase().trim())
    );
  };

  const customersWithEmailCount = useMemo(
    () => users.filter((u) => u.email && u.email.trim().includes('@')).length,
    [users]
  );

  const subscribedCustomersCount = useMemo(
    () => users.filter((u) => isUserSubscribedToNewsletter(u)).length,
    [users, activeSubscribersEmailMap]
  );

  // Sorted and filtered users calculation
  const sortedAndFilteredUsers = useMemo(() => {
    return users
      .filter((u) => {
        // Duplicate IP address filter
        if (duplicateIpOnlyFilter) {
          const userIp = (u.signupIp || u.lastIp || '').trim();
          if (!userIp || userIp === 'Unknown IP' || userIp === '127.0.0.1' || (ipOccurrencesMap.get(userIp) || 0) <= 1) {
            return false;
          }
        }

        // Newsletter subscription filter
        if (userNewsletterFilter === 'subscribed' && !isUserSubscribedToNewsletter(u)) {
          return false;
        }
        if (userNewsletterFilter === 'not_subscribed' && isUserSubscribedToNewsletter(u)) {
          return false;
        }

        const query = userSearch.toLowerCase().trim();
        if (!query) return true;
        const firstName = (u.firstName || u.name.split(' ')[0] || '').toLowerCase();
        const lastName = (u.lastName || u.name.split(' ').slice(1).join(' ') || '').toLowerCase();
        const fullName = u.name.toLowerCase();
        const email = u.email.toLowerCase();
        const country = (u.country || '').toLowerCase();
        const referralCode = (u.referralCode || '').toLowerCase();
        const signupIp = (u.signupIp || '').toLowerCase();
        const lastIp = (u.lastIp || '').toLowerCase();
        return (
          fullName.includes(query) ||
          firstName.includes(query) ||
          lastName.includes(query) ||
          email.includes(query) ||
          country.includes(query) ||
          referralCode.includes(query) ||
          signupIp.includes(query) ||
          lastIp.includes(query)
        );
      })
      .sort((a, b) => {
        if (userSortField === 'createdAt') {
          const timeA = new Date(a.createdAt || 0).getTime();
          const timeB = new Date(b.createdAt || 0).getTime();
          return userSortOrder === 'desc' ? timeB - timeA : timeA - timeB;
        }
        if (userSortField === 'totalEarned') {
          return userSortOrder === 'desc'
            ? b.totalEarned - a.totalEarned
            : a.totalEarned - b.totalEarned;
        }
        if (userSortField === 'name') {
          return userSortOrder === 'desc'
            ? b.name.localeCompare(a.name)
            : a.name.localeCompare(b.name);
        }
        if (userSortField === 'country') {
          return userSortOrder === 'desc'
            ? (b.country || '').localeCompare(a.country || '')
            : (a.country || '').localeCompare(b.country || '');
        }
        return 0;
      });
  }, [users, userSearch, userSortField, userSortOrder, userNewsletterFilter, duplicateIpOnlyFilter, ipOccurrencesMap]);

  // Bot Penalty Modal state
  const [selectedUserForBotPenalty, setSelectedUserForBotPenalty] = useState<User | null>(null);
  const [customBotPenaltyPercent, setCustomBotPenaltyPercent] = useState<number>(
    settings.botPenaltyCutoffPercent || 60
  );
  const [botPenaltyReason, setBotPenaltyReason] = useState('');

  // Direct Customer Email Modal state
  const [selectedUserForDirectEmail, setSelectedUserForDirectEmail] = useState<User | null>(null);
  const [directEmailTemplateType, setDirectEmailTemplateType] = useState<
    'survey_alert' | 'newsletter' | 'welcome_bonus' | 'custom'
  >('survey_alert');
  const [directEmailSubject, setDirectEmailSubject] = useState('');
  const [directEmailHeadline, setDirectEmailHeadline] = useState('');
  const [directEmailMessage, setDirectEmailMessage] = useState('');
  const [directEmailBonusCoins, setDirectEmailBonusCoins] = useState<number>(50);
  const [directEmailActionText, setDirectEmailActionText] = useState('Take Surveys & Earn Coins');
  const [directEmailActionUrl, setDirectEmailActionUrl] = useState('');
  const [isSendingSingleEmail, setIsSendingSingleEmail] = useState(false);
  const [singleEmailResult, setSingleEmailResult] = useState<{
    ok: boolean;
    msg: string;
    messageId?: string;
  } | null>(null);

  const applyCustomerEmailPreset = (
    type: 'survey_alert' | 'newsletter' | 'welcome_bonus' | 'custom',
    targetUser: User
  ) => {
    setDirectEmailTemplateType(type);
    setSingleEmailResult(null);
    const firstName = targetUser.name ? targetUser.name.split(' ')[0] : 'Member';

    if (type === 'survey_alert') {
      setDirectEmailSubject(`🚀 New High-Reward Surveys Available for You, ${firstName}!`);
      setDirectEmailHeadline(`Fresh Consumer Research Studies Waiting in Your Hub`);
      setDirectEmailMessage(
        `We've matched new high-reward consumer research surveys to your profile. Complete quick conversational surveys today to earn instant coin credits directly to your account balance.`
      );
      setDirectEmailActionText(`Take Surveys & Earn Coins`);
      setDirectEmailActionUrl(`https://voiceflow360.com/surveys`);
      setDirectEmailBonusCoins(50);
    } else if (type === 'newsletter') {
      setDirectEmailSubject(`📰 Voice Flow 360 Newsletter: Platform Highlights & New Research Studies`);
      setDirectEmailHeadline(`Voice Flow 360 Insider: Weekly Survey Opportunities`);
      setDirectEmailMessage(
        `Here is your latest newsletter edition from the Voice Flow 360 research panel. Explore this week's featured brand studies, community payout trends, and new high-yield surveys.`
      );
      setDirectEmailActionText(`Read Newsletter & Start Surveys`);
      setDirectEmailActionUrl(`https://voiceflow360.com/surveys`);
      setDirectEmailBonusCoins(25);
    } else if (type === 'welcome_bonus') {
      setDirectEmailSubject(`🎁 Welcome to Voice Flow 360, ${firstName}! Claim Your Panel Bonus`);
      setDirectEmailHeadline(`Welcome to the Voice Flow 360 Consumer Panel`);
      setDirectEmailMessage(
        `Thank you for joining our community! Complete your profile questionnaires and participate in consumer surveys to earn coins redeemable for real rewards and cash transfers.`
      );
      setDirectEmailActionText(`Explore Surveys & Claim Bonus`);
      setDirectEmailActionUrl(`https://voiceflow360.com/surveys`);
      setDirectEmailBonusCoins(100);
    } else {
      setDirectEmailSubject(`Important Update Regarding Your Voice Flow 360 Account`);
      setDirectEmailHeadline(`Direct Message from the Voice Flow 360 Panel Team`);
      setDirectEmailMessage(`Hello ${firstName}, we are reaching out with an update regarding your Voice Flow 360 account.`);
      setDirectEmailActionText(`View Your Account Dashboard`);
      setDirectEmailActionUrl(`https://voiceflow360.com/my-earnings`);
      setDirectEmailBonusCoins(0);
    }
  };

  const handleSendSingleEmail = async () => {
    if (!selectedUserForDirectEmail?.email) {
      showToast('Selected customer does not have an email address.', 'error');
      return;
    }
    if (!directEmailSubject.trim()) {
      showToast('Please enter an email subject line.', 'error');
      return;
    }
    if (!directEmailMessage.trim()) {
      showToast('Please enter email body content.', 'error');
      return;
    }

    setIsSendingSingleEmail(true);
    setSingleEmailResult(null);

    try {
      const res = await fetch('/api/email/send-single', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toEmail: selectedUserForDirectEmail.email.trim(),
          recipientName: selectedUserForDirectEmail.name,
          subject: directEmailSubject.trim(),
          headline: directEmailHeadline.trim() || directEmailSubject.trim(),
          messageContent: directEmailMessage
            .replace('{name}', selectedUserForDirectEmail.name)
            .replace('{balance}', `${selectedUserForDirectEmail.coinBalance} Coins`),
          actionUrl: directEmailActionUrl.trim() || `https://voiceflow360.com/surveys`,
          actionText: directEmailActionText.trim() || 'Open Voice Flow 360',
          badge:
            directEmailBonusCoins > 0
              ? `Bonus +${directEmailBonusCoins} Coins Available`
              : 'Direct Member Alert',
          bonusCoins: directEmailBonusCoins > 0 ? directEmailBonusCoins : undefined,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSingleEmailResult({
          ok: true,
          msg: `Live email successfully delivered to ${selectedUserForDirectEmail.email}!`,
          messageId: data.messageId,
        });
        showToast(
          `Live email sent to ${selectedUserForDirectEmail.name} (${selectedUserForDirectEmail.email})!`,
          'success'
        );
      } else {
        setSingleEmailResult({
          ok: false,
          msg: data.error || 'Failed to dispatch email.',
        });
        showToast(data.error || 'Failed to send email', 'error');
      }
    } catch (err: any) {
      setSingleEmailResult({
        ok: false,
        msg: err?.message || 'Network error while dispatching email',
      });
      showToast('Failed to connect to email service', 'error');
    } finally {
      setIsSendingSingleEmail(false);
    }
  };

  // Campaign Builder / Editor state
  const [editingCampaignId, setEditingCampaignId] = useState<string | null>(null);
  const [campaignTitle, setCampaignTitle] = useState('');
  const [campaignDesc, setCampaignDesc] = useState('');
  const [campaignBrandId, setCampaignBrandId] = useState<string | undefined>(undefined);
  const [campaignCategory, setCampaignCategory] = useState<CampaignCategory>('products');
  const [campaignAudience, setCampaignAudience] = useState('All active platform users');
  const [campaignEstimatedMin, setCampaignEstimatedMin] = useState<number>(4);
  const [campaignRewardCoins, setCampaignRewardCoins] = useState<number>(100);
  const [campaignStatusInput, setCampaignStatusInput] = useState<CampaignStatus>('active');
  const [questionsList, setQuestionsList] = useState<Question[]>([
    {
      id: `q_${Date.now()}_1`,
      text: 'What do you think about this product or service?',
      type: 'text',
      required: true,
      order: 1,
      placeholder: 'Type your feedback...',
    },
  ]);

  // Response Filter
  const [responseCampaignFilter, setResponseCampaignFilter] = useState<string>('all');
  const [responseSearch, setResponseSearch] = useState<string>('');
  const [selectedResponseDetail, setSelectedResponseDetail] = useState<any | null>(null);

  // Settings inputs
  const [rateInput, setRateInput] = useState(settings.coinToUsdRate || 0.01);
  const [minWithdrawInput, setMinWithdrawInput] = useState(settings.minWithdrawalCoins || 500);
  const [botCutoffInput, setBotCutoffInput] = useState(settings.botPenaltyCutoffPercent || 60);

  // AdSense Optimization switches
  const [adsenseEnabledInput, setAdsenseEnabledInput] = useState(settings.adsenseEnabled !== false);
  const [adClientPubIdInput, setAdClientPubIdInput] = useState(settings.adClientPubId || 'ca-pub-2513423020167554');
  const [enableStickyAnchorInput, setEnableStickyAnchorInput] = useState(settings.enableStickyAnchorAd !== false);
  const [enableDirectoryBannerInput, setEnableDirectoryBannerInput] = useState(settings.enableDirectoryBannerAd !== false);
  const [enableArticleInContentInput, setEnableArticleInContentInput] = useState(settings.enableArticleInContentAd !== false);
  const [enableChatBreakInput, setEnableChatBreakInput] = useState(settings.enableChatBreakAd !== false);
  const [enableNewsFeedInput, setEnableNewsFeedInput] = useState(settings.enableNewsFeedAd !== false);

  // Calculations for Overview KPIs
  const totalUsersCount = users.length;
  const activeUsersCount = users.filter((u) => u.status === 'active').length;
  const suspendedUsersCount = users.filter((u) => u.status === 'suspended').length;
  const totalBrandsCount = brands.length;
  const totalCoinsDistributed = users.reduce((acc, u) => acc + u.totalEarned, 0);
  const totalAvailableLiability = users.reduce((acc, u) => acc + u.coinBalance, 0);
  const totalCoinsRedeemed = users.reduce((acc, u) => acc + u.redeemedCoins, 0);
  const totalCompletedConversations = responses.length;
  const pendingWithdrawalsCount = withdrawals.filter((w) => w.status === 'pending').length;
  const totalAdjustmentsApplied = adjustmentLogs.length;

  // Reporting Analytics Metrics & Timezone Synchronization
  const [timezoneMode, setTimezoneMode] = useState<TimezoneMode>(() => {
    try {
      return (localStorage.getItem('admin_analytics_tz') as TimezoneMode) || 'local';
    } catch {
      return 'local';
    }
  });

  const isDateToday = (dateString: string) => isDateTodayWithMode(dateString, timezoneMode);

  const dailyNewUsersToday = users.filter((u) => isDateToday(u.createdAt)).length;
  const surveysFilledToday = responses.filter((r) => isDateToday(r.completedAt)).length;
  const todaySurveyCoinsEarned = responses
    .filter((r) => isDateToday(r.completedAt))
    .reduce((acc, r) => acc + getResponseCoins(r), 0);
  const totalReferralCodesSent = Math.max(
    users.reduce((acc, u) => acc + (u.referralCodesSentCount || 0), 0),
    referrals.length * 2
  );
  const totalSignupsViaReferral = Math.max(
    users.filter((u) => !!u.referredBy).length,
    referrals.length
  );

  // Open campaign for editing
  const handleEditCampaign = (camp: Campaign) => {
    setEditingCampaignId(camp.id);
    setCampaignTitle(camp.title);
    setCampaignDesc(camp.description);
    setCampaignCategory(camp.category);
    setCampaignAudience(camp.targetAudience);
    setCampaignEstimatedMin(camp.estimatedMinutes);
    setCampaignRewardCoins(camp.rewardCoins);
    setCampaignStatusInput(camp.status);
    setCampaignBrandId(camp.brandId);
    setQuestionsList(camp.questions);
    setActiveTab('builder');
  };

  // Reset builder form
  const handleNewCampaignClick = () => {
    setEditingCampaignId(null);
    setCampaignTitle('');
    setCampaignDesc('');
    setCampaignCategory('products');
    setCampaignAudience('All active platform users');
    setCampaignEstimatedMin(4);
    setCampaignRewardCoins(100);
    setCampaignStatusInput('active');
    setCampaignBrandId(undefined);
    setQuestionsList([
      {
        id: `q_${Date.now()}_1`,
        text: 'How would you rate your overall experience?',
        type: 'rating',
        required: true,
        order: 1,
      },
      {
        id: `q_${Date.now()}_2`,
        text: 'What do you appreciate most about this offering?',
        type: 'single_choice',
        options: ['Quality & Performance', 'Customer Support', 'Pricing & Value', 'Ease of Use'],
        required: true,
        order: 2,
      },
    ]);
    setActiveTab('builder');
  };

  // Save campaign from builder
  const handleSaveCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaignTitle.trim() || questionsList.length === 0) {
      showToast('Please provide a campaign title and at least one question.', 'error');
      return;
    }

    if (editingCampaignId) {
      updateCampaign(editingCampaignId, {
        title: campaignTitle,
        description: campaignDesc,
        category: campaignCategory,
        targetAudience: campaignAudience,
        estimatedMinutes: campaignEstimatedMin,
        rewardCoins: campaignRewardCoins,
        status: campaignStatusInput,
        brandId: campaignBrandId,
        questions: questionsList,
      });
      showToast('Campaign successfully updated in database', 'success');
    } else {
      createCampaign({
        title: campaignTitle,
        description: campaignDesc,
        category: campaignCategory,
        targetAudience: campaignAudience,
        estimatedMinutes: campaignEstimatedMin,
        rewardCoins: campaignRewardCoins,
        status: campaignStatusInput,
        brandId: campaignBrandId,
        questions: questionsList,
      });
    }

    setActiveTab('campaigns');
  };

  // Export CSV
  const handleExportCSV = () => {
    const rows = [
      ['Response ID', 'User ID', 'User Name', 'User Email', 'Campaign Title', 'Coins Awarded', 'Completed Date'],
      ...responses.map((r) => [
        r.id,
        r.userId,
        `"${r.userName}"`,
        r.userEmail,
        `"${r.campaignTitle}"`,
        r.coinsAwarded,
        r.completedAt,
      ]),
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `survey_responses_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Survey responses dataset exported to CSV', 'success');
  };

  // Export Users CSV
  const handleExportUsersCSV = () => {
    const rows = [
      [
        'User ID',
        'First Name',
        'Last Name',
        'Full Name',
        'Email',
        'Device Signup IP',
        'Duplicate Device IP Detected',
        'Country',
        'Date of Joining',
        'Total Earnings (Coins)',
        'Total Earnings (Credits)',
        'Coin Balance',
        'Referral Code Sent',
        'Referrals Count',
        'Joined From Referral ID',
        'Joined From Referral Code',
        'Newsletter Subscribed',
        'Account Status',
        'Role',
      ],
      ...sortedAndFilteredUsers.map((u) => {
        const firstName = u.firstName || u.name.split(' ')[0] || u.name;
        const lastName = u.lastName || u.name.split(' ').slice(1).join(' ') || '';
        const referrer = u.referredBy ? users.find((r) => r.id === u.referredBy) : null;
        const isSubscribed = isUserSubscribedToNewsletter(u);
        const userIp = (u.signupIp || u.lastIp || 'Not Recorded').trim();
        const isDuplicateIp = userIp && userIp !== 'Not Recorded' && userIp !== 'Unknown IP' && userIp !== '127.0.0.1' && (ipOccurrencesMap.get(userIp) || 0) > 1;
        return [
          u.id,
          `"${firstName}"`,
          `"${lastName}"`,
          `"${u.name}"`,
          `"${u.email}"`,
          `"${userIp}"`,
          `"${isDuplicateIp ? `YES (${ipOccurrencesMap.get(userIp)} accounts)` : 'NO'}"`,
          `"${u.country || 'Not Set'}"`,
          `"${u.createdAt || ''}"`,
          u.totalEarned || 0,
          Math.floor((u.totalEarned || 0) / 100),
          u.coinBalance || 0,
          `"${u.referralCode || ''}"`,
          u.referralsCount || 0,
          `"${u.referredBy || ''}"`,
          `"${referrer ? referrer.referralCode || referrer.name : ''}"`,
          `"${isSubscribed ? 'Yes (Active Subscriber)' : 'No'}"`,
          `"${u.status}"`,
          `"${u.role}"`,
        ];
      }),
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `voiceflow_users_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported users dataset with country and referral details to CSV', 'success');
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in">
      <SEOHead
        title="Admin Control Center & Analytics"
        description="Master administration portal for Voice Flow 360 survey management, user accounts, and brand campaigns."
        canonicalPath="/admin"
        noIndex={true}
      />
      {/* Admin Command Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-slate-800">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center shadow-inner">
            <Shield className="w-7 h-7 text-indigo-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                Master Administration Hub
              </span>
              <span className="text-xs text-slate-400">Authenticated: {currentUser?.name}</span>
            </div>
            <h1 className="text-2xl font-black text-white mt-1 tracking-tight">
              Administrative Control Center
            </h1>
            <p className="text-xs text-slate-300 mt-0.5">
              Live database synchronization: {totalUsersCount} Users &bull; {totalBrandsCount} Listed Brands &bull; {campaigns.length} Surveys
            </p>
          </div>
        </div>

        {/* Global Action Shortcuts */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <a
            id="admin-download-code-btn"
            href="/api/download-source"
            download="voiceflow360-source.zip"
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            title="Download full project source code zip for GitHub & Vercel deployment"
          >
            <Download className="w-4 h-4 text-emerald-200" />
            <span>Download Source Code</span>
          </a>
          <button
            id="admin-email-blast-shortcut-btn"
            onClick={() => setActiveTab('email_campaigns')}
            className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Mail className="w-4 h-4 text-purple-200" />
            <span>Email Survey Blast</span>
          </button>
          <button
            onClick={() => setActiveTab('brands')}
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl border border-white/20 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Building2 className="w-4 h-4 text-purple-300" />
            <span>Manage Brands &amp; Surveys</span>
          </button>
          <button
            onClick={handleNewCampaignClick}
            className="px-4 py-2.5 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-500 hover:to-yellow-500 text-slate-950 font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Campaign Flow</span>
          </button>
        </div>
      </div>

      {/* Admin Navigation Tabs Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-2 shadow-xs flex items-center gap-1.5 overflow-x-auto scrollbar-none">
        {[
          { id: 'overview', label: 'Insights & KPIs', icon: LayoutDashboard },
          { id: 'reporting', label: 'Reporting & Analytics', icon: BarChart3 },
          { id: 'brands', label: `Listed Brands (${brands.length})`, icon: Building2 },
          { id: 'research_studies', label: `Brand Research Studies (${researchArticles.length})`, icon: BookOpen },
          { id: 'inquiries', label: `Brand Research Inquiries (${brandInquiries.length})`, icon: Sparkles },
          { id: 'email_campaigns', label: `Email Users (${emailCampaigns.length})`, icon: Mail },
          { id: 'users', label: `Users (${users.length})`, icon: Users },
          { id: 'campaigns', label: `Surveys (${campaigns.length})`, icon: MessageSquarePlus },
          { id: 'builder', label: editingCampaignId ? 'Edit Survey Flow' : 'Survey Flow Builder', icon: Sparkles },
          { id: 'responses', label: `Responses & Bot Audit (${responses.length})`, icon: CheckCircle2 },
          { id: 'withdrawals', label: `Cashouts (${withdrawals.length})`, icon: Gift },
          { id: 'settings', label: 'Exchange Rate & Quality Rules', icon: SettingsIcon },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as AdminTab)}
              className={`px-3.5 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: INSIGHTS & OVERVIEW */}
      {/* ========================================================================= */}
      {activeTab === 'overview' && (
        <div className="space-y-8 animate-in fade-in">
          {/* Executive Reporting Analytics: 6 Core KPIs */}
          <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-7 text-white shadow-lg space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-300 text-xs font-bold uppercase tracking-wider mb-2">
                  <BarChart3 className="w-3.5 h-3.5 text-purple-300" />
                  <span>Executive Growth &amp; Telemetry</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Platform Reporting Analytics
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
                  Core live metrics for registration pace, survey completion volume, and referral virality.
                </p>
              </div>

              <button
                id="overview-launch-reporting-btn"
                onClick={() => setActiveTab('reporting')}
                className="px-4 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 self-start sm:self-auto cursor-pointer"
              >
                <Calendar className="w-4 h-4" />
                <span>Date Range Filters &amp; CSV Export &rarr;</span>
              </button>
            </div>

            {/* Cloud Synchronization & Timezone Header Notice */}
            <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 text-emerald-300 font-bold bg-emerald-950/60 border border-emerald-800/60 px-2.5 py-1 rounded-lg shadow-2xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Cloud Synced: {responses.length.toLocaleString()} surveys, {users.length.toLocaleString()} users</span>
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px]">
                <span className="text-slate-400">Day calculation:</span>
                <button
                  type="button"
                  id="admin-dashboard-tz-toggle-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    const next: TimezoneMode = timezoneMode === 'local' ? 'utc' : 'local';
                    setTimezoneMode(next);
                    try {
                      localStorage.setItem('admin_analytics_tz', next);
                    } catch {}
                  }}
                  className="font-bold text-amber-300 bg-amber-950/50 hover:bg-amber-900/60 border border-amber-600/40 px-2.5 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                  title="Click to toggle between device local time and platform UTC standard for identical counts on mobile and web"
                >
                  <span>{timezoneMode === 'local' ? `Local Time (${getDeviceTimezoneLabel()})` : 'Platform UTC Standard (GMT+0)'}</span>
                  <span className="text-[9px] text-amber-400 underline font-normal ml-1">Switch</span>
                </button>
              </div>
            </div>

            {/* 6 Essential Required Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
              {/* Metric 1: Daily New Users */}
              <div
                id="metric-daily-new-users"
                onClick={() => setActiveTab('reporting')}
                className="bg-gradient-to-br from-indigo-900/40 via-indigo-950/20 to-white/5 hover:from-indigo-900/55 hover:to-white/10 border border-indigo-500/35 hover:border-indigo-400/65 rounded-2xl p-4 transition-all cursor-pointer group shadow-sm hover:shadow-lg hover:shadow-indigo-950/30"
              >
                <div className="flex items-center justify-between text-slate-300 text-xs font-bold">
                  <span className="truncate">Daily New Users</span>
                  <div className="w-7 h-7 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <UserPlus className="w-4 h-4 text-indigo-300 shrink-0" />
                  </div>
                </div>
                <div className="mt-2.5 flex items-baseline justify-between gap-1.5 flex-wrap">
                  <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    {dailyNewUsersToday}
                  </div>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-200 bg-indigo-500/20 border border-indigo-400/30 px-2 py-0.5 rounded-md shrink-0" title={`Calculated based on ${timezoneMode === 'utc' ? 'Platform UTC Day' : 'Local Calendar Day'}`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                    <span>{timezoneMode === 'utc' ? 'UTC Day' : 'Local Day'}</span>
                  </span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-indigo-200/90 font-medium mt-2 pt-2 border-t border-white/10">
                  <span className="truncate">
                    {dailyNewUsersToday > 0 ? `${dailyNewUsersToday} joined today` : 'No signups yet'}
                  </span>
                  <span className="text-slate-400 group-hover:text-indigo-300 text-[9px] uppercase tracking-wider font-semibold transition-colors">
                    Analytics &rarr;
                  </span>
                </div>
              </div>

              {/* Metric 2: Total Users */}
              <div
                id="metric-total-users"
                onClick={() => setActiveTab('users')}
                className="bg-gradient-to-br from-purple-900/40 via-purple-950/20 to-white/5 hover:from-purple-900/55 hover:to-white/10 border border-purple-500/35 hover:border-purple-400/65 rounded-2xl p-4 transition-all cursor-pointer group shadow-sm hover:shadow-lg hover:shadow-purple-950/30"
              >
                <div className="flex items-center justify-between text-slate-300 text-xs font-bold">
                  <span className="truncate">Total Users</span>
                  <div className="w-7 h-7 rounded-xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Users className="w-4 h-4 text-purple-300 shrink-0" />
                  </div>
                </div>
                <div className="mt-2.5 flex items-baseline justify-between gap-1.5 flex-wrap">
                  <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    {totalUsersCount}
                  </div>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-300 bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.5 rounded-md shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>{activeUsersCount} Active</span>
                  </span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-purple-200/90 font-medium mt-2 pt-2 border-t border-white/10">
                  <span className="truncate">Live Cloud Synced</span>
                  <span className="text-slate-400 group-hover:text-purple-300 text-[9px] uppercase tracking-wider font-semibold transition-colors">
                    Registry &rarr;
                  </span>
                </div>
              </div>

              {/* Metric 3: Total Survey Filled */}
              <div
                onClick={() => setActiveTab('reporting')}
                className="bg-white/10 hover:bg-white/15 border border-white/10 rounded-2xl p-4 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between text-slate-300 text-xs font-bold">
                  <span className="truncate">Total Survey Filled</span>
                  <FileCheck2 className="w-4 h-4 text-emerald-400 shrink-0" />
                </div>
                <div className="mt-2 text-2xl font-black text-white">
                  {totalCompletedConversations.toLocaleString()}
                </div>
                <div className="text-[10px] text-emerald-300 font-semibold mt-0.5">
                  All-time completed
                </div>
              </div>

              {/* Metric 4: Total Survey Filled Today */}
              <div
                id="metric-surveys-filled-today"
                onClick={() => setActiveTab('reporting')}
                className="bg-white/10 hover:bg-white/15 border border-white/10 hover:border-amber-400/50 rounded-2xl p-4 transition-all cursor-pointer group shadow-sm hover:shadow-md"
              >
                <div className="flex items-center justify-between text-slate-300 text-xs font-bold">
                  <span className="truncate">Survey Filled Today</span>
                  <CalendarClock className="w-4 h-4 text-amber-400 shrink-0 group-hover:scale-110 transition-transform" />
                </div>
                <div className="mt-2 flex items-baseline justify-between gap-1.5 flex-wrap">
                  <div className="text-2xl font-black text-white tracking-tight">
                    {surveysFilledToday.toLocaleString()}
                  </div>
                  <span className="text-[10px] font-extrabold text-amber-300 bg-amber-500/20 border border-amber-500/30 px-2 py-0.5 rounded-md shrink-0">
                    +{todaySurveyCoinsEarned.toLocaleString()} Coins
                  </span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-amber-300/90 font-medium mt-1.5 pt-1.5 border-t border-white/10">
                  <span className="truncate">
                    {timezoneMode === 'utc' ? 'Platform UTC Day' : 'Local Calendar Day'}
                  </span>
                  <span className="text-slate-400 group-hover:text-amber-300 text-[9px] uppercase tracking-wider font-semibold transition-colors">
                    Analytics &rarr;
                  </span>
                </div>
              </div>

              {/* Metric 5: Total Referral Code Sent */}
              <div
                onClick={() => setActiveTab('reporting')}
                className="bg-white/10 hover:bg-white/15 border border-white/10 rounded-2xl p-4 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between text-slate-300 text-xs font-bold">
                  <span className="truncate">Referral Codes Sent</span>
                  <Share2 className="w-4 h-4 text-sky-400 shrink-0" />
                </div>
                <div className="mt-2 text-2xl font-black text-white">
                  {totalReferralCodesSent}
                </div>
                <div className="text-[10px] text-sky-300 font-semibold mt-0.5">
                  Shared invitations
                </div>
              </div>

              {/* Metric 6: Total Signup via Referral Code */}
              <div
                onClick={() => setActiveTab('reporting')}
                className="bg-white/10 hover:bg-white/15 border border-white/10 rounded-2xl p-4 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between text-slate-300 text-xs font-bold">
                  <span className="truncate">Signup via Referral</span>
                  <Gift className="w-4 h-4 text-rose-400 shrink-0" />
                </div>
                <div className="mt-2 text-2xl font-black text-white">
                  {totalSignupsViaReferral}
                </div>
                <div className="text-[10px] text-rose-300 font-semibold mt-0.5">
                  Viral conversion
                </div>
              </div>
            </div>
          </div>

          {/* Platform Health & Liability KPI Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* KPI 1: Total Users */}
            <div
              onClick={() => setActiveTab('users')}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-indigo-300 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Total Platform Users
                </span>
                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                  <Users className="w-4 h-4 text-indigo-600" />
                </div>
              </div>
              <div className="mt-3 text-3xl font-black text-slate-900">{totalUsersCount}</div>
              <div className="text-xs text-emerald-600 font-bold mt-1 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>{activeUsersCount} Active Accounts</span>
                {suspendedUsersCount > 0 && (
                  <span className="text-rose-600 font-semibold">({suspendedUsersCount} Suspended)</span>
                )}
              </div>
            </div>

            {/* KPI 2: Total Listed Brands */}
            <div
              onClick={() => setActiveTab('brands')}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-purple-300 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Total Listed Brands
                </span>
                <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center group-hover:bg-purple-100 transition-colors">
                  <Building2 className="w-4 h-4 text-purple-600" />
                </div>
              </div>
              <div className="mt-3 text-3xl font-black text-slate-900">{totalBrandsCount}</div>
              <div className="text-xs text-purple-700 font-semibold mt-1 flex items-center gap-1">
                <span>{campaigns.length} Active Surveys Linked</span>
              </div>
            </div>

            {/* KPI 3: Coin Liability & Exchange Rate */}
            <div
              onClick={() => setActiveTab('settings')}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-amber-300 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Total Coins &amp; Reward Credits
                </span>
                <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center group-hover:bg-amber-100 transition-colors">
                  <Coins className="w-4 h-4 text-amber-600" />
                </div>
              </div>
              <div className="mt-3 text-3xl font-black text-slate-900">
                {totalCoinsDistributed.toLocaleString()}
              </div>
              <div className="text-xs text-amber-800 font-bold mt-1">
                ≈ {Math.floor(totalCoinsDistributed / 100).toLocaleString()} Reward Credits (Rate: 100c = 1 Credit)
              </div>
            </div>

            {/* KPI 4: Quality Cutoff & Bot Defense */}
            <div
              onClick={() => setActiveTab('responses')}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-rose-300 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Bot Response Cutoff %
                </span>
                <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center group-hover:bg-rose-100 transition-colors">
                  <Bot className="w-4 h-4 text-rose-600" />
                </div>
              </div>
              <div className="mt-3 text-3xl font-black text-rose-600">
                -{settings.botPenaltyCutoffPercent || 20}%
              </div>
              <div className="text-xs text-slate-500 font-semibold mt-1">
                {totalAdjustmentsApplied} Audits &amp; Penalties Applied
              </div>
            </div>
          </div>

          {/* Detailed Analytics Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Quick Conversion Rate & Liability Manager Panel */}
            <div className="bg-gradient-to-br from-white to-amber-50/50 rounded-2xl border border-amber-200/80 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                  <Coins className="w-4 h-4 text-amber-600" />
                  <span>Coins-to-Credits Conversion Rate</span>
                </h3>
                <span className="text-[10px] font-black uppercase bg-amber-100 text-amber-900 px-2 py-0.5 rounded">
                  Live Config
                </span>
              </div>

              <div className="space-y-3 pt-1">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Credits per 100 Coins:
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step={0.01}
                      min={0.01}
                      value={rateInput}
                      onChange={(e) => setRateInput(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-black text-slate-900"
                    />
                    <button
                      onClick={() => {
                        updateSettings({ coinToUsdRate: rateInput });
                      }}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl shadow-xs cursor-pointer whitespace-nowrap"
                    >
                      Update Rate
                    </button>
                  </div>
                </div>

                {/* Conversion Simulation */}
                <div className="p-3 bg-white rounded-xl border border-amber-200/60 text-xs space-y-1">
                  <div className="flex justify-between text-slate-600">
                    <span>100 Coins:</span>
                    <span className="font-black text-slate-900">1 Reward Credit</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>500 Coins (Redemption min):</span>
                    <span className="font-black text-slate-900">5 Reward Credits</span>
                  </div>
                  <div className="flex justify-between text-slate-600 border-t border-slate-100 pt-1">
                    <span>Active User Coin Balance Liability:</span>
                    <span className="font-black text-amber-700">
                      {Math.floor(totalAvailableLiability / 100).toLocaleString()} Credits
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quality & Bot Response Cutoff Rule Panel */}
            <div className="bg-gradient-to-br from-white to-rose-50/50 rounded-2xl border border-rose-200/80 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                  <Bot className="w-4 h-4 text-rose-600" />
                  <span>Bot &amp; Invalid Response Cutoff %</span>
                </h3>
                <span className="text-[10px] font-black uppercase bg-rose-100 text-rose-900 px-2 py-0.5 rounded">
                  Defense Rule
                </span>
              </div>

              <div className="space-y-3 pt-1">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Cut-off Deduction Penalty Percentage:
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={5}
                      max={100}
                      step={5}
                      value={botCutoffInput}
                      onChange={(e) => setBotCutoffInput(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-black text-slate-900"
                    />
                    <button
                      onClick={() => {
                        updateSettings({ botPenaltyCutoffPercent: botCutoffInput });
                      }}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl shadow-xs cursor-pointer whitespace-nowrap"
                    >
                      Save Cutoff %
                    </button>
                  </div>
                </div>

                <div className="p-3 bg-white rounded-xl border border-rose-200/60 text-xs space-y-1">
                  <p className="text-slate-600 leading-relaxed text-[11px]">
                    When survey auditing flags robotic, repetitive, or invalid submissions, this deduction is subtracted from customer earnings with 1-click.
                  </p>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                    <span className="text-slate-500 font-semibold">Active Cutoff:</span>
                    <span className="font-extrabold text-rose-700">-{botCutoffInput}% deduction</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Listed Brands & Surveys Summary Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-purple-600" />
                    <span>Brand Directory Hub</span>
                  </h3>
                  <span className="text-[10px] font-black uppercase bg-purple-100 text-purple-900 px-2 py-0.5 rounded">
                    {brands.length} Brands
                  </span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Enterprise brands with authentic survey campaigns published to customer exploration views.
                </p>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-600">Total Customer Surveys:</span>
                    <span className="font-black text-slate-900">{campaigns.length} Surveys</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-600">Completed Feedbacks:</span>
                    <span className="font-black text-slate-900">{responses.length} Submissions</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setActiveTab('brands')}
                className="w-full py-2 bg-purple-50 hover:bg-purple-100 text-purple-900 font-extrabold text-xs rounded-xl transition-colors text-center cursor-pointer"
              >
                Open Brand &amp; Survey Creator &rarr;
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB: REPORTING & ANALYTICS WITH DATE FILTERS */}
      {/* ========================================================================= */}
      {activeTab === 'reporting' && <AdminReportingAnalytics />}

      {/* ========================================================================= */}
      {/* TAB 2: BRAND & SURVEY CREATION HUB */}
      {/* ========================================================================= */}
      {activeTab === 'brands' && <AdminBrandsTab />}

      {/* ========================================================================= */}
      {/* TAB 2B: BRAND RESEARCH STUDIES EDITORIAL CMS */}
      {/* ========================================================================= */}
      {activeTab === 'research_studies' && <AdminResearchStudiesTab />}

      {/* ========================================================================= */}
      {/* TAB 2C: BRAND MARKET RESEARCH INQUIRIES */}
      {/* ========================================================================= */}
      {activeTab === 'inquiries' && <AdminBrandInquiriesTab />}

      {/* ========================================================================= */}
      {/* TAB 2D: EMAIL CAMPAIGN BLASTS TO ALL LISTED USERS */}
      {/* ========================================================================= */}
      {activeTab === 'email_campaigns' && <AdminEmailCampaignTab />}

      {/* ========================================================================= */}
      {/* TAB 3: USER ACCOUNTS & MANAGEMENT */}
      {/* ========================================================================= */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6 animate-in fade-in">
          {/* Header & Controls */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">Total Users &amp; Member Records</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {users.length} Registered
                </span>
                <button
                  type="button"
                  onClick={() => setActiveTab('email_campaigns')}
                  className="px-2.5 py-1 rounded-lg bg-purple-100 hover:bg-purple-200 text-purple-800 text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                  title="Send survey email blast to all listed members"
                >
                  <Mail className="w-3 h-3 text-purple-700" />
                  <span>Email All Listed Users</span>
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Inspect member profiles, country of residence, validated emails, referral lineage, earnings, and sort by date of joining.
              </p>
            </div>

            {/* Search and Sorting Toolbar */}
            <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="admin-user-search-input"
                  type="text"
                  placeholder="Search name, email, country, code..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              {/* Sort By Field Dropdown */}
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl p-1">
                <span className="text-[11px] text-slate-500 font-semibold pl-2 hidden sm:inline">Sort:</span>
                <select
                  id="admin-user-sort-field"
                  value={userSortField}
                  onChange={(e) =>
                    setUserSortField(e.target.value as 'createdAt' | 'name' | 'totalEarned' | 'country')
                  }
                  className="bg-transparent text-xs font-semibold text-slate-800 py-1 px-2 focus:outline-none cursor-pointer"
                >
                  <option value="createdAt">Date of Joining</option>
                  <option value="totalEarned">Total Earnings</option>
                  <option value="name">Name (A-Z)</option>
                  <option value="country">Country</option>
                </select>

                {/* Sort Order Toggle */}
                <button
                  id="admin-user-sort-order-toggle"
                  type="button"
                  onClick={() => setUserSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'))}
                  className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-700 transition-colors flex items-center gap-1 text-[11px] font-bold"
                  title={
                    userSortOrder === 'desc'
                      ? 'Currently sorted: Newest / Highest First'
                      : 'Currently sorted: Oldest / Lowest First'
                  }
                >
                  {userSortOrder === 'desc' ? (
                    <>
                      <ArrowDown className="w-3.5 h-3.5 text-indigo-600" />
                      <span className="hidden sm:inline">Newest</span>
                    </>
                  ) : (
                    <>
                      <ArrowUp className="w-3.5 h-3.5 text-indigo-600" />
                      <span className="hidden sm:inline">Oldest</span>
                    </>
                  )}
                </button>
              </div>

              {/* Fast Join Date Sort Button */}
              <button
                type="button"
                onClick={() => {
                  setUserSortField('createdAt');
                  setUserSortOrder((prev) => (userSortField === 'createdAt' && prev === 'desc' ? 'asc' : 'desc'));
                }}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 border cursor-pointer ${
                  userSortField === 'createdAt'
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <CalendarClock className="w-3.5 h-3.5" />
                <span>Sort by Join Date ({userSortField === 'createdAt' && userSortOrder === 'desc' ? 'Newest' : 'Oldest'})</span>
              </button>

              {/* Newsletter Audience Filter Toggle */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setUserNewsletterFilter('all')}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    userNewsletterFilter === 'all'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All ({users.length})
                </button>
                <button
                  type="button"
                  onClick={() => setUserNewsletterFilter('subscribed')}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer ${
                    userNewsletterFilter === 'subscribed'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-emerald-700'
                  }`}
                  title="Filter to subscribers only"
                >
                  <Mail className="w-3 h-3" />
                  <span>Subscribers ({subscribedCustomersCount})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setUserNewsletterFilter('not_subscribed')}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    userNewsletterFilter === 'not_subscribed'
                      ? 'bg-slate-800 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Filter to non-subscribers only"
                >
                  Not Subscribed ({users.length - subscribedCustomersCount})
                </button>
              </div>

              {/* Duplicate IP Filter Toggle */}
              <button
                type="button"
                onClick={() => setDuplicateIpOnlyFilter((prev) => !prev)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs border ${
                  duplicateIpOnlyFilter
                    ? 'border-red-400 bg-red-600 text-white shadow-red-200'
                    : duplicateIpUsersCount > 0
                    ? 'border-red-300 bg-red-50 hover:bg-red-100 text-red-800'
                    : 'border-slate-200 bg-slate-50 text-slate-600'
                }`}
                title="Filter users who share the same device IP address to detect referral abuse"
              >
                <Network className="w-3.5 h-3.5" />
                <span>Duplicate IPs</span>
                {duplicateIpUsersCount > 0 && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-black ${
                      duplicateIpOnlyFilter ? 'bg-white text-red-700' : 'bg-red-200 text-red-900'
                    }`}
                  >
                    {duplicateIpUsersCount}
                  </span>
                )}
              </button>

              {/* Bulk Mark All With Email as Subscribers Button */}
              <button
                type="button"
                disabled={isBulkMarkingNewsletter}
                onClick={async () => {
                  setIsBulkMarkingNewsletter(true);
                  await markAllCustomersAsNewsletterSubscribers(true);
                  setIsBulkMarkingNewsletter(false);
                }}
                className="px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-800 cursor-pointer shadow-2xs"
                title="Mark all registered customers with an email as active newsletter subscribers"
              >
                <Mail className="w-3.5 h-3.5 text-purple-600" />
                <span>{isBulkMarkingNewsletter ? 'Syncing...' : 'Mark All With Email as Subscribers'}</span>
                <span className="px-1.5 py-0.5 rounded-md bg-purple-200 text-purple-900 text-[10px] font-mono">
                  {subscribedCustomersCount}/{customersWithEmailCount}
                </span>
              </button>

              {/* Deduplicate Accounts Button */}
              <button
                type="button"
                onClick={async () => {
                  if (window.confirm('Scan and clean duplicate user accounts? (Older/highest earning profile will be preserved)')) {
                    await deduplicateAllUsers();
                  }
                }}
                className="px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 cursor-pointer shadow-2xs"
                title="Detect and safely merge accounts registered with the same email"
              >
                <RefreshCw className="w-3.5 h-3.5 text-amber-600" />
                <span>Clean Duplicates</span>
              </button>

              {/* Export Users CSV Button */}
              <button
                type="button"
                onClick={handleExportUsersCSV}
                className="px-3 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 cursor-pointer shadow-2xs"
                title="Export user registry to CSV file"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <div className="text-[10px] uppercase font-bold text-slate-400">Total Users</div>
              <div className="text-lg font-black text-slate-900 mt-0.5">{users.length}</div>
            </div>
            <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-200/80">
              <div className="text-[10px] uppercase font-bold text-purple-600 flex items-center gap-1">
                <Mail className="w-3 h-3" />
                <span>Newsletter</span>
              </div>
              <div className="text-lg font-black text-purple-900 mt-0.5 flex items-baseline gap-1.5">
                <span>{subscribedCustomersCount}</span>
                <span className="text-[11px] font-semibold text-emerald-700">
                  ({customersWithEmailCount > 0 && subscribedCustomersCount === customersWithEmailCount ? '100%' : `${Math.round((subscribedCustomersCount / Math.max(1, customersWithEmailCount)) * 100)}%`})
                </span>
              </div>
            </div>
            <div className={`p-3 rounded-xl border transition-colors ${
              duplicateIpUsersCount > 0 ? 'bg-red-50/70 border-red-200' : 'bg-slate-50 border-slate-200/80'
            }`}>
              <div className="text-[10px] uppercase font-bold text-red-600 flex items-center gap-1">
                <Network className="w-3 h-3" />
                <span>Duplicate IPs</span>
              </div>
              <div className="text-lg font-black text-red-900 mt-0.5 flex items-baseline gap-1.5">
                <span>{duplicateIpUsersCount}</span>
                <span className="text-[11px] font-medium text-red-700">
                  {duplicateIpUsersCount > 0 ? 'Risk Accounts' : 'Clean'}
                </span>
              </div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <div className="text-[10px] uppercase font-bold text-slate-400">Total Countries</div>
              <div className="text-lg font-black text-slate-900 mt-0.5">
                {new Set(users.map((u) => u.country).filter(Boolean)).size} Countries
              </div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <div className="text-[10px] uppercase font-bold text-slate-400">Platform Total Earnings</div>
              <div className="text-lg font-black text-amber-700 mt-0.5">
                {users.reduce((acc, u) => acc + (u.totalEarned || 0), 0).toLocaleString()} Coins
              </div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <div className="text-[10px] uppercase font-bold text-slate-400">Referred Onboardings</div>
              <div className="text-lg font-black text-indigo-700 mt-0.5">
                {users.filter((u) => u.referredBy).length} Users
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div id="admin-users-table-container" className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-xs">
            <table className="w-full text-left text-xs min-w-[1250px]">
              <thead className="bg-slate-50 text-slate-600 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3.5">First &amp; Last Name</th>
                  <th className="py-3 px-3.5">Email Address</th>
                  <th className="py-3 px-3.5">
                    <div className="flex items-center gap-1">
                      <Network className="w-3 h-3 text-indigo-600" />
                      <span>Device Signup IP</span>
                    </div>
                  </th>
                  <th className="py-3 px-3.5">
                    <div className="flex items-center gap-1">
                      <Mail className="w-3 h-3 text-purple-600" />
                      <span>Newsletter</span>
                    </div>
                  </th>
                  <th
                    className="py-3 px-3.5 cursor-pointer hover:bg-slate-100 transition-colors"
                    onClick={() => {
                      setUserSortField('country');
                      setUserSortOrder((prev) => (userSortField === 'country' && prev === 'desc' ? 'asc' : 'desc'));
                    }}
                  >
                    <div className="flex items-center gap-1">
                      <span>Country</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th
                    className="py-3 px-3.5 cursor-pointer hover:bg-slate-100 transition-colors bg-indigo-50/40 text-indigo-950 font-bold"
                    onClick={() => {
                      setUserSortField('createdAt');
                      setUserSortOrder((prev) => (userSortField === 'createdAt' && prev === 'desc' ? 'asc' : 'desc'));
                    }}
                  >
                    <div className="flex items-center gap-1">
                      <span>Date of Joining</span>
                      {userSortField === 'createdAt' ? (
                        userSortOrder === 'desc' ? (
                          <ArrowDown className="w-3 h-3 text-indigo-600" />
                        ) : (
                          <ArrowUp className="w-3 h-3 text-indigo-600" />
                        )
                      ) : (
                        <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      )}
                    </div>
                  </th>
                  <th
                    className="py-3 px-3.5 cursor-pointer hover:bg-slate-100 transition-colors"
                    onClick={() => {
                      setUserSortField('totalEarned');
                      setUserSortOrder((prev) => (userSortField === 'totalEarned' && prev === 'desc' ? 'asc' : 'desc'));
                    }}
                  >
                    <div className="flex items-center gap-1">
                      <span>Total Earning</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th className="py-3 px-3.5">Referral Code Sent</th>
                  <th className="py-3 px-3.5">Customer Join From Referral</th>
                  <th className="py-3 px-3.5">Role / Status</th>
                  <th className="py-3 px-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {sortedAndFilteredUsers.map((u) => {
                  const firstName = u.firstName || u.name.split(' ')[0] || u.name;
                  const lastName = u.lastName || u.name.split(' ').slice(1).join(' ') || '—';
                  const countryFlag = getCountryFlag(u.country);
                  
                  // Lookup referrer info if joined from a referral
                  const referrerUser = u.referredBy ? users.find((ref) => ref.id === u.referredBy) : null;
                  const joinDate = u.createdAt ? new Date(u.createdAt) : null;
                  const isSubscribed = isUserSubscribedToNewsletter(u);
                  const formattedDate = joinDate
                    ? joinDate.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })
                    : 'Pre-launch';
                  const formattedTime = joinDate
                    ? joinDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                    : '';

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* First & Last Name */}
                      <td className="py-3.5 px-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs flex-shrink-0">
                            {firstName.charAt(0)}
                            {lastName !== '—' ? lastName.charAt(0) : ''}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 leading-tight">
                              {firstName} {lastName !== '—' ? lastName : ''}
                            </div>
                            <div className="text-[10px] text-slate-400 font-medium">
                              First: <span className="text-slate-700 font-semibold">{firstName}</span> | Last:{' '}
                              <span className="text-slate-700 font-semibold">{lastName}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Email Address */}
                      <td className="py-3.5 px-3.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[11px] text-slate-800 font-medium">{u.email}</span>
                          {users.filter((item) => item.email && item.email.toLowerCase().trim() === (u.email || '').toLowerCase().trim()).length > 1 && (
                            <span className="px-1.5 py-0.2 rounded-full text-[9px] font-extrabold bg-amber-100 text-amber-800 border border-amber-300" title="Multiple accounts share this email address">
                              Duplicate ({users.filter((item) => item.email && item.email.toLowerCase().trim() === (u.email || '').toLowerCase().trim()).length})
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                          <div className="inline-flex items-center gap-1 text-[10px] text-emerald-700 font-semibold">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Real Email</span>
                          </div>
                          {isSubscribed && (
                            <span className="inline-flex items-center gap-1 text-[9px] font-bold text-purple-700 bg-purple-50 border border-purple-200/80 px-1.5 py-0.5 rounded-md">
                              <Mail className="w-2.5 h-2.5" />
                              <span>Subscribed</span>
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Device Signup IP Address */}
                      <td className="py-3.5 px-3.5 align-middle">
                        {(() => {
                          const displayIp = (u.signupIp || u.lastIp || '').trim();
                          const hasIp = displayIp && displayIp !== 'Unknown IP';
                          const duplicateCount = hasIp && displayIp !== '127.0.0.1' ? ipOccurrencesMap.get(displayIp) || 0 : 0;
                          const isDuplicate = duplicateCount > 1;

                          return (
                            <div className="space-y-1.5 min-w-[135px]">
                              {hasIp ? (
                                <div className="space-y-1">
                                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-50 hover:bg-slate-100/90 border border-slate-200/80 transition-colors group">
                                    <Globe className="w-3 h-3 text-slate-400 flex-shrink-0" />
                                    <span
                                      className={`font-mono text-[11px] tracking-tight select-all ${
                                        isDuplicate ? 'text-rose-700 font-bold' : 'text-slate-800 font-semibold'
                                      }`}
                                      title={displayIp}
                                    >
                                      {displayIp}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (navigator.clipboard) {
                                          navigator.clipboard.writeText(displayIp);
                                          showToast(`Copied ${displayIp} to clipboard`, 'info');
                                        }
                                      }}
                                      className="text-slate-400 hover:text-slate-700 p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                      title="Copy IP address"
                                    >
                                      <Copy className="w-2.5 h-2.5" />
                                    </button>
                                  </div>

                                  {isDuplicate ? (
                                    <div
                                      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-rose-50 border border-rose-200 text-rose-800 text-[9px] font-bold"
                                      title={`IP collision: ${duplicateCount} registered accounts share this device IP`}
                                    >
                                      <AlertTriangle className="w-2.5 h-2.5 text-rose-600 flex-shrink-0" />
                                      <span>{duplicateCount} accounts on device</span>
                                    </div>
                                  ) : (
                                    <div className="inline-flex items-center gap-1 text-[9px] text-emerald-700 font-medium">
                                      <Check className="w-2.5 h-2.5 text-emerald-600" />
                                      <span>Verified unique device</span>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className="space-y-1">
                                  <div
                                    className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-50/80 border border-amber-200/80 text-amber-800 text-[10px] font-medium"
                                    title="IP address was not captured at signup (privacy proxy or pre-migration benchmark)"
                                  >
                                    <Clock className="w-2.5 h-2.5 text-amber-600 flex-shrink-0" />
                                    <span>Not captured</span>
                                  </div>
                                  <div className="text-[9px] text-slate-400 italic">
                                    Privacy proxy / benchmark
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })()}
                      </td>

                      {/* Newsletter Status */}
                      <td className="py-3.5 px-3.5">
                        {isSubscribed ? (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Subscribed</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => toggleCustomerNewsletter(u.id)}
                              className="text-[10px] text-slate-400 hover:text-red-600 underline block font-medium transition-colors cursor-pointer"
                              title="Unsubscribe customer from newsletter"
                            >
                              Unsubscribe
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                              <XCircle className="w-3 h-3 text-slate-400" />
                              <span>Not Subscribed</span>
                            </span>
                            {u.email && u.email.includes('@') && (
                              <button
                                type="button"
                                onClick={() => toggleCustomerNewsletter(u.id)}
                                className="text-[10px] text-indigo-600 hover:text-indigo-800 font-bold underline block transition-colors cursor-pointer"
                                title="Subscribe customer to newsletter"
                              >
                                Subscribe
                              </button>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Country */}
                      <td className="py-3.5 px-3.5">
                        {editingUserCountryId === u.id ? (
                          <div className="flex items-center gap-1">
                            <select
                              value={u.country || ''}
                              onChange={(e) => {
                                updateUserProfile(u.id, { country: e.target.value.trim() });
                                setEditingUserCountryId(null);
                                showToast(
                                  e.target.value
                                    ? `Assigned ${e.target.value} to ${u.name}`
                                    : `Country cleared (undisclosed) for ${u.name}`,
                                  'success'
                                );
                              }}
                              onBlur={() => setEditingUserCountryId(null)}
                              autoFocus
                              className="text-xs px-2 py-1 bg-white border border-indigo-400 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 max-w-[170px]"
                            >
                              <option value="">— Undisclosed / Keep Empty —</option>
                              {COUNTRIES.map((c) => (
                                <option key={c.code} value={c.name}>
                                  {c.flag} {c.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        ) : u.country && u.country.trim() && u.country.trim() !== 'Global / Unset' ? (
                          <div
                            onClick={() => setEditingUserCountryId(u.id)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 hover:border-indigo-300 hover:bg-indigo-50/50 cursor-pointer transition-colors"
                            title="Click to edit or clear country"
                          >
                            <span className="text-base leading-none">{countryFlag}</span>
                            <span>{u.country}</span>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setEditingUserCountryId(u.id)}
                            className="text-slate-300 hover:text-indigo-600 text-xs font-normal transition-colors cursor-pointer py-1 px-2.5 rounded hover:bg-slate-100"
                            title="Not disclosed — Click to assign country"
                          >
                            —
                          </button>
                        )}
                      </td>

                      {/* Date of Joining */}
                      <td className="py-3.5 px-3.5 bg-indigo-50/20">
                        <div className="font-bold text-slate-900">{formattedDate}</div>
                        <div className="text-[10px] text-slate-500 font-medium">{formattedTime}</div>
                      </td>

                      {/* Total Earning */}
                      <td className="py-3.5 px-3.5">
                        <div className="font-black text-slate-900 text-xs">
                          {(u.totalEarned || 0).toLocaleString()} Coins
                        </div>
                        <div className="text-[10px] text-amber-700 font-bold">
                          ≈ ${((u.totalEarned || 0) * settings.coinToUsdRate).toFixed(2)} USD
                        </div>
                        <div className="text-[9px] text-slate-400 mt-0.5">
                          Bal: {u.coinBalance.toLocaleString()} Coins
                        </div>
                      </td>

                      {/* Referral Code Sent (their code & outgoing shares) */}
                      <td className="py-3.5 px-3.5">
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 border border-amber-200/70 rounded-md font-mono font-black text-amber-900 text-[11px]">
                          {u.referralCode || 'VF-USER'}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-1">
                          <span className="font-bold text-slate-800">{u.referralsCount || 0}</span> joined &bull;{' '}
                          <span className="font-bold text-slate-800">{u.referralCodesSentCount || 0}</span> sent
                        </div>
                      </td>

                      {/* Customer Join From Referral */}
                      <td className="py-3.5 px-3.5">
                        {referrerUser ? (
                          <div className="space-y-0.5">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-50 border border-indigo-200 rounded text-[10px] font-bold text-indigo-700">
                              Joined via {referrerUser.referralCode || 'Referral'}
                            </span>
                            <div className="text-[10px] text-slate-600 truncate max-w-[140px]" title={referrerUser.name}>
                              by {referrerUser.firstName || referrerUser.name}
                            </div>
                            <div className="text-[9px] text-slate-400 truncate max-w-[140px]" title={referrerUser.email}>
                              {referrerUser.email}
                            </div>
                            {/* Referral Same-IP fraud detector indicator */}
                            {(() => {
                              const userIp = (u.signupIp || u.lastIp || '').trim();
                              const referrerIp = (referrerUser.signupIp || referrerUser.lastIp || '').trim();
                              if (userIp && referrerIp && userIp !== 'Unknown IP' && userIp !== '127.0.0.1' && userIp === referrerIp) {
                                return (
                                  <div className="mt-1 inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-red-100 border border-red-300 text-red-800 text-[9px] font-black" title="CRITICAL: Referrer and Referred customer have identical device IP addresses. Possible self-referral fraud.">
                                    <AlertTriangle className="w-2.5 h-2.5 text-red-600" />
                                    <span>Same IP as Referrer!</span>
                                  </div>
                                );
                              }
                              return null;
                            })()}
                          </div>
                        ) : u.referredBy ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-50 border border-indigo-200 rounded text-[10px] font-bold text-indigo-700">
                            Referred: {u.referredBy}
                          </span>
                        ) : (
                          <span className="inline-block px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-[10px] font-medium">
                            Direct Registration
                          </span>
                        )}
                      </td>

                      {/* Role & Status */}
                      <td className="py-3.5 px-3.5">
                        <div className="space-y-1">
                          <span
                            className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider inline-block ${
                              u.role === 'admin'
                                ? 'bg-purple-100 text-purple-800 border border-purple-200'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {u.role}
                          </span>
                          <select
                            value={u.status}
                            onChange={(e) =>
                              setUserAccountStatus(u.id, e.target.value as UserAccountStatus)
                            }
                            className={`block text-[10px] font-bold px-1.5 py-0.5 rounded border focus:outline-none ${
                              u.status === 'active'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : u.status === 'suspended'
                                ? 'bg-rose-50 text-rose-800 border-rose-200'
                                : 'bg-slate-50 text-slate-700 border-slate-200'
                            }`}
                          >
                            <option value="active">Active</option>
                            <option value="suspended">Suspended</option>
                            <option value="inactive">Inactive</option>
                          </select>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-3.5 text-right space-y-1">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedUserForDirectEmail(u);
                            applyCustomerEmailPreset('survey_alert', u);
                          }}
                          className="w-full px-2 py-1 bg-purple-50 hover:bg-purple-100 text-purple-800 font-extrabold text-[10px] rounded-lg transition-colors cursor-pointer border border-purple-200/80 inline-flex items-center justify-center gap-1"
                          title="Send Live Branded Email to Customer"
                        >
                          <Mail className="w-3 h-3 text-purple-600" />
                          <span>Send Email</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setSelectedUserForBotPenalty(u);
                            setCustomBotPenaltyPercent(settings.botPenaltyCutoffPercent || 60);
                            setBotPenaltyReason(
                              `Flagged for robotic / low-effort response (-${settings.botPenaltyCutoffPercent || 60}% cutoff applied)`
                            );
                          }}
                          className="w-full px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-extrabold text-[10px] rounded-lg transition-colors cursor-pointer border border-rose-200/80 inline-flex items-center justify-center gap-1"
                          title="Apply Bot/Invalid Response Cutoff"
                        >
                          <Bot className="w-3 h-3" />
                          <span>Bot Cutoff (-{settings.botPenaltyCutoffPercent || 60}%)</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setSelectedUserForAdjustment(u);
                            setAdjustmentAmount(100);
                            setAdjustmentReason('');
                          }}
                          className="w-full px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[10px] rounded-lg transition-colors cursor-pointer"
                        >
                          Adjust Balance
                        </button>

                        {u.role !== 'admin' && u.email.toLowerCase() !== 'ibrhussain6@gmail.com' && (
                          <button
                            type="button"
                            onClick={async () => {
                              if (window.confirm(`Delete account for ${u.name} (${u.email})? This cannot be undone.`)) {
                                await deleteUserAccount(u.id);
                              }
                            }}
                            className="w-full px-2 py-1 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-[10px] rounded-lg transition-colors cursor-pointer border border-red-200/80 inline-flex items-center justify-center gap-1"
                            title="Permanently remove this user record"
                          >
                            <Trash2 className="w-3 h-3 text-red-600" />
                            <span>Delete User</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* User Balance Adjustment Modal */}
          {selectedUserForAdjustment && (
            <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 text-sm">
                    Manual Balance Adjustment: {selectedUserForAdjustment.name}
                  </h3>
                  <button
                    onClick={() => setSelectedUserForAdjustment(null)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Current Coin Balance
                    </label>
                    <div className="p-2 bg-slate-50 border border-slate-200 rounded-xl font-bold">
                      {selectedUserForAdjustment.coinBalance} Coins (≈ $
                      {(
                        selectedUserForAdjustment.coinBalance * settings.coinToUsdRate
                      ).toFixed(2)}{' '}
                      USD)
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Adjustment Amount (Coins)
                    </label>
                    <input
                      type="number"
                      step={10}
                      value={adjustmentAmount}
                      onChange={(e) => setAdjustmentAmount(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                    />
                    <span className="text-[10px] text-slate-400 mt-0.5 block">
                      Use positive for rewards (+100) or negative for penalty deductions (-100).
                    </span>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Reason for Audit Trail
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. VIP community bonus, survey quality penalty"
                      value={adjustmentReason}
                      onChange={(e) => setAdjustmentReason(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    onClick={() => setSelectedUserForAdjustment(null)}
                    className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (!adjustmentReason.trim()) {
                        showToast('Please provide a reason for the adjustment log.', 'error');
                        return;
                      }
                      adjustUserBalance(
                        selectedUserForAdjustment.id,
                        adjustmentAmount,
                        adjustmentReason
                      );
                      setSelectedUserForAdjustment(null);
                    }}
                    className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs"
                  >
                    Confirm Adjustment
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Bot Penalty Cutoff Modal */}
          {selectedUserForBotPenalty && (
            <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 border-2 border-rose-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-rose-700">
                    <Bot className="w-5 h-5" />
                    <h3 className="font-extrabold text-sm">
                      Apply Quality / Bot Response Cutoff
                    </h3>
                  </div>
                  <button
                    onClick={() => setSelectedUserForBotPenalty(null)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-xs text-slate-600">
                  Applying cutoff penalty to user <strong>{selectedUserForBotPenalty.name}</strong> ({selectedUserForBotPenalty.email}).
                </p>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Cut-off Percentage to Deduct:
                    </label>
                    <input
                      type="number"
                      min={5}
                      max={100}
                      step={5}
                      value={customBotPenaltyPercent}
                      onChange={(e) => setCustomBotPenaltyPercent(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-black text-rose-600"
                    />
                    <div className="text-[11px] text-slate-500 font-semibold mt-1">
                      Deduction from balance: ~{Math.round((selectedUserForBotPenalty.coinBalance * customBotPenaltyPercent) / 100)} Coins
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Audit Reason &amp; Notification Notice:
                    </label>
                    <input
                      type="text"
                      value={botPenaltyReason}
                      onChange={(e) => setBotPenaltyReason(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    onClick={() => setSelectedUserForBotPenalty(null)}
                    className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      applyBotPenaltyCutoff(
                        selectedUserForBotPenalty.id,
                        customBotPenaltyPercent,
                        botPenaltyReason
                      );
                      setSelectedUserForBotPenalty(null);
                    }}
                    className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-extrabold text-xs shadow-xs"
                  >
                    Apply -{customBotPenaltyPercent}% Penalty
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Direct Customer Live Email Modal */}
          {selectedUserForDirectEmail && (
            <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
              <div className="bg-white rounded-2xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl space-y-4 my-8 animate-in zoom-in-95 border border-slate-200 max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-purple-100 flex items-center justify-center text-purple-700">
                        <Mail className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                          Send Live Email to {selectedUserForDirectEmail.name}
                        </h3>
                        <div className="flex flex-wrap items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                          <span className="font-mono text-slate-700 font-semibold">{selectedUserForDirectEmail.email}</span>
                          <span>&bull;</span>
                          <span>{selectedUserForDirectEmail.coinBalance} Coins</span>
                          <span>&bull;</span>
                          <span
                            className={`font-bold px-1.5 py-0.2 rounded text-[10px] ${
                              selectedUserForDirectEmail.newsletterSubscribed
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {selectedUserForDirectEmail.newsletterSubscribed ? 'Newsletter Subscribed' : 'Standard Member'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedUserForDirectEmail(null)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Template Preset Pills */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Select Email Template / Preset:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <button
                      type="button"
                      onClick={() => applyCustomerEmailPreset('survey_alert', selectedUserForDirectEmail)}
                      className={`p-2 rounded-xl border text-left transition-all ${
                        directEmailTemplateType === 'survey_alert'
                          ? 'border-purple-600 bg-purple-50/70 text-purple-900 ring-2 ring-purple-600/20'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <div className="font-extrabold text-xs">🚀 Survey Alert</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">Matched studies & bonus</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => applyCustomerEmailPreset('newsletter', selectedUserForDirectEmail)}
                      className={`p-2 rounded-xl border text-left transition-all ${
                        directEmailTemplateType === 'newsletter'
                          ? 'border-purple-600 bg-purple-50/70 text-purple-900 ring-2 ring-purple-600/20'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <div className="font-extrabold text-xs">📰 Newsletter</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">Community & payout digest</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => applyCustomerEmailPreset('welcome_bonus', selectedUserForDirectEmail)}
                      className={`p-2 rounded-xl border text-left transition-all ${
                        directEmailTemplateType === 'welcome_bonus'
                          ? 'border-purple-600 bg-purple-50/70 text-purple-900 ring-2 ring-purple-600/20'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <div className="font-extrabold text-xs">🎁 Welcome Bonus</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">Onboarding gift coins</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => applyCustomerEmailPreset('custom', selectedUserForDirectEmail)}
                      className={`p-2 rounded-xl border text-left transition-all ${
                        directEmailTemplateType === 'custom'
                          ? 'border-purple-600 bg-purple-50/70 text-purple-900 ring-2 ring-purple-600/20'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <div className="font-extrabold text-xs">✍️ Custom Message</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">Direct personalized note</div>
                    </button>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Subject Line</label>
                    <input
                      type="text"
                      value={directEmailSubject}
                      onChange={(e) => setDirectEmailSubject(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Email subject..."
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Header Headline</label>
                      <input
                        type="text"
                        value={directEmailHeadline}
                        onChange={(e) => setDirectEmailHeadline(e.target.value)}
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Banner headline..."
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Bonus Coins Offer</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          step={10}
                          min={0}
                          value={directEmailBonusCoins}
                          onChange={(e) => setDirectEmailBonusCoins(Math.max(0, Number(e.target.value)))}
                          className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-amber-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                        <span className="text-[11px] text-slate-500 font-semibold whitespace-nowrap">
                          {directEmailBonusCoins > 0 ? `+$${(directEmailBonusCoins / 100).toFixed(2)} USD` : 'No bonus'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-bold text-slate-700">Body Content</label>
                      <span className="text-[10px] text-slate-400">Personalization tags: &#123;name&#125;, &#123;balance&#125;</span>
                    </div>
                    <textarea
                      rows={3}
                      value={directEmailMessage}
                      onChange={(e) => setDirectEmailMessage(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500 leading-relaxed"
                      placeholder="Message content..."
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">CTA Button Text</label>
                      <input
                        type="text"
                        value={directEmailActionText}
                        onChange={(e) => setDirectEmailActionText(e.target.value)}
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Action Link URL</label>
                      <input
                        type="url"
                        value={directEmailActionUrl}
                        onChange={(e) => setDirectEmailActionUrl(e.target.value)}
                        placeholder="https://..."
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Delivery Result Feedback Box */}
                {singleEmailResult && (
                  <div
                    className={`p-3 rounded-xl text-xs font-medium flex items-center gap-2 ${
                      singleEmailResult.ok
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-rose-50 text-rose-800 border border-rose-200'
                    }`}
                  >
                    {singleEmailResult.ok ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    )}
                    <div className="flex-1">
                      <div>{singleEmailResult.msg}</div>
                      {singleEmailResult.messageId && (
                        <div className="text-[10px] text-emerald-700/80 font-mono mt-0.5">
                          cPanel Delivery Message ID: {singleEmailResult.messageId}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Footer Controls */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100">
                  <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                    <span>Transmitted via configured cPanel SMTP credentials.</span>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <button
                      type="button"
                      onClick={() => setSelectedUserForDirectEmail(null)}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition-colors cursor-pointer"
                    >
                      Close
                    </button>
                    <button
                      type="button"
                      onClick={handleSendSingleEmail}
                      disabled={isSendingSingleEmail || !directEmailSubject.trim() || !directEmailMessage.trim()}
                      className="px-5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl font-black text-xs shadow-md shadow-purple-600/20 flex items-center gap-1.5 disabled:opacity-50 transition-all cursor-pointer"
                    >
                      {isSendingSingleEmail ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Delivering Email...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Send Live Email to {selectedUserForDirectEmail.name.split(' ')[0]}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: CAMPAIGNS & SURVEYS CATALOG */}
      {/* ========================================================================= */}
      {activeTab === 'campaigns' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6 animate-in fade-in">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Survey Campaigns Catalog</h2>
              <p className="text-xs text-slate-500">
                Manage live surveys, questions count, rewards, and public customer discovery status.
              </p>
            </div>

            <button
              onClick={handleNewCampaignClick}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Campaign Flow</span>
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {campaigns.map((camp) => (
              <div
                key={camp.id}
                className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-slate-900">{camp.title}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        camp.status === 'active'
                          ? 'bg-emerald-100 text-emerald-800'
                          : camp.status === 'paused'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {camp.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-1">{camp.description}</p>
                  <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-0.5">
                    <span className="font-bold text-amber-600">+{camp.rewardCoins} Coins</span>
                    <span>&bull;</span>
                    <span>{camp.questions.length} Questions</span>
                    <span>&bull;</span>
                    <span>{camp.completedCount} Completions</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <select
                    value={camp.status}
                    onChange={(e) =>
                      setCampaignStatus(camp.id, e.target.value as CampaignStatus)
                    }
                    className="text-xs font-bold px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                  >
                    <option value="active">Active</option>
                    <option value="paused">Paused</option>
                    <option value="completed">Completed</option>
                    <option value="archived">Archived</option>
                  </select>

                  <button
                    onClick={() => handleEditCampaign(camp)}
                    className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-50 rounded-lg cursor-pointer"
                    title="Edit Campaign Flow"
                  >
                    <Edit className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      if (confirm(`Delete campaign "${camp.title}" from database?`)) {
                        deleteCampaign(camp.id);
                      }
                    }}
                    className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                    title="Delete Campaign"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: SURVEY FLOW BUILDER */}
      {/* ========================================================================= */}
      {activeTab === 'builder' && (
        <form
          onSubmit={handleSaveCampaign}
          className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6 animate-in fade-in"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {editingCampaignId ? 'Edit Campaign Flow' : 'Create New Campaign Flow'}
              </h2>
              <p className="text-xs text-slate-500">
                Build engaging, conversational question sequences with instant reward delivery.
              </p>
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl shadow-xs cursor-pointer"
            >
              Save &amp; Publish Survey
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Campaign Title *
              </label>
              <input
                type="text"
                required
                value={campaignTitle}
                onChange={(e) => setCampaignTitle(e.target.value)}
                placeholder="e.g. Next-Gen Gaming Feedback"
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Target Category
              </label>
              <select
                value={campaignCategory}
                onChange={(e) => setCampaignCategory(e.target.value as CampaignCategory)}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
              >
                <option value="products">Products &amp; Gadgets</option>
                <option value="services">Services &amp; Apps</option>
                <option value="brands">Brand Perception</option>
                <option value="social_media">Social Media &amp; Habits</option>
                <option value="market_research">Market Research</option>
                <option value="quick_questions">Quick Questions</option>
                <option value="quizzes">Trivia &amp; Quizzes</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Reward Coins per Completion
              </label>
              <input
                type="number"
                step={10}
                value={campaignRewardCoins}
                onChange={(e) => setCampaignRewardCoins(Number(e.target.value))}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Estimated Minutes
              </label>
              <input
                type="number"
                min={1}
                max={20}
                value={campaignEstimatedMin}
                onChange={(e) => setCampaignEstimatedMin(Number(e.target.value))}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Linked Brand (Optional)
              </label>
              <select
                value={campaignBrandId || ''}
                onChange={(e) => setCampaignBrandId(e.target.value || undefined)}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
              >
                <option value="">No Brand (Generic Campaign)</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.category})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Question Sequence List */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                Question Sequence ({questionsList.length})
              </h3>
              <button
                type="button"
                onClick={() => {
                  setQuestionsList((prev) => [
                    ...prev,
                    {
                      id: `q_${Date.now()}_${prev.length + 1}`,
                      text: `Question ${prev.length + 1}`,
                      type: 'rating',
                      required: true,
                      order: prev.length + 1,
                    },
                  ]);
                }}
                className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-lg flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Question</span>
              </button>
            </div>

            <div className="space-y-3">
              {questionsList.map((q, idx) => (
                <div
                  key={q.id || idx}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-black uppercase text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                      Step {idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        if (questionsList.length <= 1) return;
                        setQuestionsList((prev) => prev.filter((_, i) => i !== idx));
                      }}
                      className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="md:col-span-2">
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Question Text
                      </label>
                      <input
                        type="text"
                        required
                        value={q.text}
                        onChange={(e) => {
                          const val = e.target.value;
                          setQuestionsList((prev) =>
                            prev.map((item, i) => (i === idx ? { ...item, text: val } : item))
                          );
                        }}
                        className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Response Format
                      </label>
                      <select
                        value={q.type}
                        onChange={(e) => {
                          const newType = e.target.value as QuestionType;
                          setQuestionsList((prev) =>
                            prev.map((item, i) =>
                              i === idx
                                ? {
                                    ...item,
                                    type: newType,
                                    options:
                                      newType === 'single_choice' || newType === 'multiple_choice'
                                        ? item.options || ['Option A', 'Option B', 'Option C']
                                        : undefined,
                                  }
                                : item
                            )
                          );
                        }}
                        className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                      >
                        <option value="rating">Rating (1 to 5 Stars)</option>
                        <option value="scale">Scale (1 to 10 Slider)</option>
                        <option value="single_choice">Single Choice</option>
                        <option value="multiple_choice">Multiple Choice</option>
                        <option value="yes_no">Yes / No</option>
                        <option value="text">Free Text Input</option>
                        <option value="quiz">Trivia Quiz</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </form>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: RESPONSES & BOT QUALITY AUDIT */}
      {/* ========================================================================= */}
      {activeTab === 'responses' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6 animate-in fade-in">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">
                  Feedback Responses &amp; Bot Defense Audit
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-800">
                  Cutoff: -{settings.botPenaltyCutoffPercent || 60}%
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Inspect raw user opinions, detect robotic or invalid answers, and apply cutoff deductions with 1-click.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={responseCampaignFilter}
                onChange={(e) => setResponseCampaignFilter(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl"
              >
                <option value="all">All Campaigns ({responses.length})</option>
                {campaigns.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>

              <button
                onClick={handleExportCSV}
                className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {responses
              .filter(
                (r) =>
                  responseCampaignFilter === 'all' || r.campaignId === responseCampaignFilter
              )
              .map((r) => {
                // Heuristic Quality Check: text length < 8 chars or single repeated characters
                const hasShortText = r.answers.some(
                  (a) => typeof a.answer === 'string' && a.answer.trim().length > 0 && a.answer.trim().length < 6
                );

                return (
                  <div
                    key={r.id}
                    className="py-4 hover:bg-slate-50/70 p-4 rounded-xl transition-colors space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-xs text-slate-900">{r.userName}</span>
                          <span className="text-[11px] text-slate-400">({r.userEmail})</span>
                          {hasShortText && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                              Low Effort Flag
                            </span>
                          )}
                        </div>
                        <h4 className="font-bold text-xs text-indigo-700 mt-0.5">
                          {r.campaignTitle}
                        </h4>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            applyBotPenaltyCutoff(
                              r.userId,
                              settings.botPenaltyCutoffPercent || 60,
                              `Quality Penalty: Invalid/Low-effort response on "${r.campaignTitle}" (-${settings.botPenaltyCutoffPercent || 60}% cutoff applied)`
                            );
                          }}
                          className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 text-[10px] font-black rounded-lg border border-rose-200 transition-colors cursor-pointer flex items-center gap-1"
                          title="Apply configured Cut-off % penalty deduction"
                        >
                          <Bot className="w-3 h-3" />
                          <span>Deduct -{settings.botPenaltyCutoffPercent || 60}% Penalty</span>
                        </button>

                        <button
                          onClick={() => toggleResponseVisibility(r.id)}
                          className={`p-1 rounded-lg text-xs font-bold cursor-pointer ${
                            r.isHidden
                              ? 'text-slate-400 hover:text-slate-600 bg-slate-100'
                              : 'text-indigo-600 hover:bg-indigo-50'
                          }`}
                          title={r.isHidden ? 'Reveal Response' : 'Hide / Flag Response'}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Answers Preview */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {r.answers.map((ans, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 bg-white rounded-lg border border-slate-200/80 text-[11px]"
                        >
                          <span className="font-bold text-slate-600 block truncate">
                            Q{idx + 1}: {ans.questionText}
                          </span>
                          <span className="font-extrabold text-slate-900 mt-0.5 block">
                            {Array.isArray(ans.answer) ? ans.answer.join(', ') : String(ans.answer)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 7: CASHOUTS & WITHDRAWALS */}
      {/* ========================================================================= */}
      {activeTab === 'withdrawals' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">User Cashout Requests</h2>
              <p className="text-xs text-slate-500">
                Audit and disburse user rewards calculated with the active conversion rate.
              </p>
            </div>
            <span className="text-xs font-bold text-slate-500">
              {withdrawals.length} Total Requests
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold text-[10px] tracking-wider border-y border-slate-200">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">USD Amount</th>
                  <th className="py-3 px-4">Method</th>
                  <th className="py-3 px-4">Account Details</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Admin Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {withdrawals.map((wd) => (
                  <tr key={wd.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{wd.userName}</div>
                      <div className="text-[11px] text-slate-400">{wd.userEmail}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-extrabold text-slate-900">${wd.usdAmount.toFixed(2)} USD</span>
                      <div className="text-[10px] text-amber-700 font-semibold">{wd.coins} Coins</div>
                    </td>
                    <td className="py-3.5 px-4 font-bold uppercase text-slate-700">
                      {wd.payoutMethod.replace('_', ' ')}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600 max-w-xs truncate">
                      {wd.accountDetails}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          wd.status === 'completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : wd.status === 'pending'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {wd.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1.5">
                      {wd.status === 'pending' && (
                        <>
                          <button
                            onClick={() =>
                              updateWithdrawalStatus(wd.id, 'completed', 'Approved and sent')
                            }
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded-lg cursor-pointer"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => {
                              const note = prompt('Reason for rejection (coins refunded):');
                              if (note !== null) {
                                updateWithdrawalStatus(
                                  wd.id,
                                  'rejected',
                                  note || 'Rejected by administrator'
                                );
                              }
                            }}
                            className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-[11px] rounded-lg cursor-pointer"
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 8: PLATFORM SETTINGS & AUDIT LOGS */}
      {/* ========================================================================= */}
      {activeTab === 'settings' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Exchange Rate & Bot Cutoff Config */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-6">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                Reward Conversion Rates &amp; Bot Defense Cutoff
              </h2>
              <p className="text-xs text-slate-500">
                Manage global conversion values and automatic penalty rates deducted for low-effort/bot survey responses.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-2">
              {/* Setting 1: Conversion Rate */}
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-2">
                <label className="block text-xs font-extrabold text-amber-950">
                  Coins-to-USD Conversion Rate ($ / Coin)
                </label>
                <input
                  type="number"
                  step={0.001}
                  value={rateInput}
                  onChange={(e) => setRateInput(Number(e.target.value))}
                  className="w-full px-3.5 py-2 text-xs font-black bg-white border border-amber-300 rounded-xl focus:outline-none"
                />
                <span className="text-[11px] font-bold text-amber-800 block">
                  100 Coins = ${(100 * rateInput).toFixed(2)} USD
                </span>
              </div>

              {/* Setting 2: Bot Cutoff % */}
              <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200/80 space-y-2">
                <label className="block text-xs font-extrabold text-rose-950">
                  Bot / Invalid Response Cut-off %
                </label>
                <input
                  type="number"
                  min={5}
                  max={100}
                  step={5}
                  value={botCutoffInput}
                  onChange={(e) => setBotCutoffInput(Number(e.target.value))}
                  className="w-full px-3.5 py-2 text-xs font-black bg-white border border-rose-300 rounded-xl focus:outline-none"
                />
                <span className="text-[11px] font-bold text-rose-800 block">
                  Deducts -{botCutoffInput}% from customer earnings
                </span>
              </div>

              {/* Setting 3: Min Cashout */}
              <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200/80 space-y-2">
                <label className="block text-xs font-extrabold text-indigo-950">
                  Minimum Cashout Threshold (Coins)
                </label>
                <input
                  type="number"
                  step={50}
                  value={minWithdrawInput}
                  onChange={(e) => setMinWithdrawInput(Number(e.target.value))}
                  className="w-full px-3.5 py-2 text-xs font-black bg-white border border-indigo-300 rounded-xl focus:outline-none"
                />
                <span className="text-[11px] font-bold text-indigo-800 block">
                  Min cashout: ${(minWithdrawInput * rateInput).toFixed(2)} USD
                </span>
              </div>
            </div>

            {/* Google AdSense Optimization & Inventory Switches */}
            <div className="mt-6 pt-6 border-t border-indigo-200/60 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <span>Google AdSense Optimization &amp; Placements</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold uppercase">
                      Policy Compliant
                    </span>
                  </h3>
                  <p className="text-xs text-slate-600">
                    Control active advertiser units across high-value inventory views. All units enforce Better Ads Standards and strict labels.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={adsenseEnabledInput}
                    onChange={(e) => setAdsenseEnabledInput(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  <span className="ml-2 text-xs font-bold text-slate-900">
                    {adsenseEnabledInput ? 'Global Ads Active' : 'Master Killswitch (Disabled)'}
                  </span>
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1 md:col-span-2">
                  <label className="text-xs font-extrabold text-slate-700 block">
                    Google AdSense Publisher Client ID
                  </label>
                  <input
                    type="text"
                    value={adClientPubIdInput}
                    onChange={(e) => setAdClientPubIdInput(e.target.value.trim())}
                    placeholder="ca-pub-2513423020167554"
                    className="w-full px-3.5 py-2 text-xs font-mono font-bold bg-white border border-indigo-300 rounded-xl focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-500">
                    Configured for your primary approved account. Matches verification script in index.html.
                  </span>
                </div>

                {/* Switch 1: Sticky Anchor Ad */}
                <div className="p-3.5 rounded-xl bg-white/80 border border-indigo-100 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">
                      Sticky Anchor Ad (Desktop &amp; Mobile)
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Bottom anchored responsive leaderboard banner
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={enableStickyAnchorInput}
                    onChange={(e) => setEnableStickyAnchorInput(e.target.checked)}
                    className="w-4 h-4 text-purple-600 rounded border-slate-300 focus:ring-purple-500"
                  />
                </div>

                {/* Switch 2: Brand Directory & Insights Banner */}
                <div className="p-3.5 rounded-xl bg-white/80 border border-indigo-100 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">
                      Brand Directory &amp; Insights Banner
                    </span>
                    <span className="text-[11px] text-slate-500">
                      High-intent brand exploration directory placement
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={enableDirectoryBannerInput}
                    onChange={(e) => setEnableDirectoryBannerInput(e.target.checked)}
                    className="w-4 h-4 text-purple-600 rounded border-slate-300 focus:ring-purple-500"
                  />
                </div>

                {/* Switch 3: Brand Research Case Study Articles */}
                <div className="p-3.5 rounded-xl bg-white/80 border border-indigo-100 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">
                      In-Content Article Placements
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Between SWOT &amp; Strategy in 2,500+ word brand case studies
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={enableArticleInContentInput}
                    onChange={(e) => setEnableArticleInContentInput(e.target.checked)}
                    className="w-4 h-4 text-purple-600 rounded border-slate-300 focus:ring-purple-500"
                  />
                </div>

                {/* Switch 4: Conversational Break Ad */}
                <div className="p-3.5 rounded-xl bg-white/80 border border-indigo-100 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">
                      Survey Completion Break Ad
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Renders after survey submission alongside feedback receipt
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={enableChatBreakInput}
                    onChange={(e) => setEnableChatBreakInput(e.target.checked)}
                    className="w-4 h-4 text-purple-600 rounded border-slate-300 focus:ring-purple-500"
                  />
                </div>

                {/* Switch 5: News & Market Updates Feed */}
                <div className="p-3.5 rounded-xl bg-white/80 border border-indigo-100 flex items-center justify-between md:col-span-2">
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">
                      News &amp; Market Updates Feed
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Editorial feed banner in the News &amp; Insights section
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={enableNewsFeedInput}
                    onChange={(e) => setEnableNewsFeedInput(e.target.checked)}
                    className="w-4 h-4 text-purple-600 rounded border-slate-300 focus:ring-purple-500"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end">
              <button
                type="button"
                onClick={() => {
                  updateSettings({
                    coinToUsdRate: rateInput,
                    minWithdrawalCoins: minWithdrawInput,
                    botPenaltyCutoffPercent: botCutoffInput,
                    adsenseEnabled: adsenseEnabledInput,
                    adClientPubId: adClientPubIdInput,
                    enableStickyAnchorAd: enableStickyAnchorInput,
                    enableDirectoryBannerAd: enableDirectoryBannerInput,
                    enableArticleInContentAd: enableArticleInContentInput,
                    enableChatBreakAd: enableChatBreakInput,
                    enableNewsFeedAd: enableNewsFeedInput,
                  });
                }}
                className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Save Platform Settings to Database</span>
              </button>
            </div>
          </div>

          {/* Audit Logs Table */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h2 className="text-base font-extrabold text-slate-900">
              Administrator Quality Audit &amp; Adjustment Logs
            </h2>
            <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto pr-1">
              {adjustmentLogs.map((log) => (
                <div key={log.id} className="py-3 text-xs flex items-center justify-between gap-4">
                  <div>
                    <span className="font-extrabold text-slate-900">{log.userName}</span>
                    <p className="text-slate-600 mt-0.5">{log.reason}</p>
                    <span className="text-[10px] text-slate-400">
                      By {log.adminName} &bull; {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <div className="text-right">
                    <span
                      className={`font-black ${
                        log.amount >= 0 ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {log.amount >= 0 ? `+${log.amount}` : log.amount} Coins
                    </span>
                    <div className="text-[10px] text-slate-400">
                      {log.previousBalance} &rarr; {log.newBalance}
                    </div>
                  </div>
                </div>
              ))}
              {adjustmentLogs.length === 0 && (
                <div className="py-6 text-center text-slate-400 text-xs font-medium">
                  No adjustments logged yet.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
