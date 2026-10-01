import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Mail,
  Send,
  Sparkles,
  Users,
  CheckCircle2,
  Clock,
  Coins,
  ChevronRight,
  Filter,
  Eye,
  Trash2,
  Copy,
  Download,
  ExternalLink,
  Smartphone,
  Monitor,
  Search,
  Bell,
  Check,
  AlertCircle,
  Tag,
  Globe2,
  RefreshCw,
  Server,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Key,
  Settings2,
  XCircle,
  Loader2,
} from 'lucide-react';
import {
  EmailCampaign,
  EmailTemplateType,
  EmailTargetAudience,
  Campaign,
  User,
} from '../types';
import { validateRealEmail } from '../utils/emailValidation';

export const AdminEmailCampaignTab: React.FC = () => {
  const {
    users,
    campaigns,
    emailCampaigns,
    sendEmailCampaign,
    deleteEmailCampaign,
    showToast,
    newsletterSubscribers,
    currentUser,
  } = useApp();

  // Active surveys that can be featured
  const activeSurveys = useMemo(
    () => campaigns.filter((c) => c.status === 'active' || c.status === 'draft'),
    [campaigns]
  );

  // Compose form state
  const [targetAudience, setTargetAudience] = useState<EmailTargetAudience>('all');
  const [targetCountry, setTargetCountry] = useState<string>('United States');
  const [selectedSurveyIds, setSelectedSurveyIds] = useState<string[]>(() => {
    // Default to first 2 active surveys if available
    return activeSurveys.slice(0, 2).map((s) => s.id);
  });

  const [templateType, setTemplateType] = useState<EmailTemplateType>('new_surveys_alert');
  const [subject, setSubject] = useState<string>('🚀 Fresh Paid Surveys Just Launched: Earn Up to 350 Coins Today!');
  const [previewText, setPreviewText] = useState<string>(
    'Exclusive new consumer feedback studies are now available in your dashboard. Complete them before slots fill.'
  );
  const [headline, setHeadline] = useState<string>('Brand New Surveys Are Waiting For You');
  const [introMessage, setIntroMessage] = useState<string>(
    'Top partner brands have just published new conversational surveys on Voice Flow 360. Your real feedback shapes upcoming consumer products and unlocks instant cash rewards.'
  );
  const [ctaText, setCtaText] = useState<string>('Start Surveys & Claim Rewards');
  const [bonusCoins, setBonusCoins] = useState<number>(0);
  const [sendInAppNotif, setSendInAppNotif] = useState<boolean>(true);

  // Filter & Search states
  const [recipientSearch, setRecipientSearch] = useState<string>('');
  const [subscriberSearch, setSubscriberSearch] = useState<string>('');
  const [isAudiencePreviewOpen, setIsAudiencePreviewOpen] = useState<boolean>(false);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [activeTab, setActiveTab] = useState<'compose' | 'history' | 'subscribers' | 'cpanel_smtp'>('compose');

  // cPanel SMTP Server Routing & Diagnostics State
  const [smtpStatus, setSmtpStatus] = useState<{
    isConfigured: boolean;
    host: string | null;
    port: number;
    secure: boolean;
    user: string | null;
    fromName: string;
    fromEmail: string | null;
    dnsCheck?: {
      checked: boolean;
      resolved: boolean;
      ip?: string;
      error?: string;
    };
  } | null>(null);
  const [isLoadingSmtp, setIsLoadingSmtp] = useState<boolean>(true);
  const [isVerifyingSmtp, setIsVerifyingSmtp] = useState<boolean>(false);
  const [smtpVerifyMessage, setSmtpVerifyMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [testEmailAddress, setTestEmailAddress] = useState<string>(currentUser?.email || '');
  const [testSendType, setTestSendType] = useState<'survey_template' | 'diagnostic'>('survey_template');
  const [isSendingTestEmail, setIsSendingTestEmail] = useState<boolean>(false);
  const [testEmailFeedback, setTestEmailFeedback] = useState<{ ok: boolean; text: string; messageId?: string } | null>(null);
  const [directRecipientEmail, setDirectRecipientEmail] = useState<string>(currentUser?.email || '');
  const [isSendingDirectEmail, setIsSendingDirectEmail] = useState<boolean>(false);
  const [directEmailFeedback, setDirectEmailFeedback] = useState<{ ok: boolean; text: string; messageId?: string } | null>(null);
  const [sendViaSmtp, setSendViaSmtp] = useState<boolean>(true);
  const [showSmtpSetupGuide, setShowSmtpSetupGuide] = useState<boolean>(false);
  const [guideProvider, setGuideProvider] = useState<'hostinger' | 'cpanel'>('hostinger');

  // Fetch SMTP status on component mount
  useEffect(() => {
    fetchSmtpStatus();
  }, []);

  const fetchSmtpStatus = async () => {
    setIsLoadingSmtp(true);
    try {
      const res = await fetch('/api/email/smtp-status');
      if (res.ok) {
        const data = await res.json();
        setSmtpStatus(data);
        if (data.isConfigured) {
          setSendViaSmtp(true);
        }
      }
    } catch (e) {
      console.warn('Failed to fetch SMTP status:', e);
    } finally {
      setIsLoadingSmtp(false);
    }
  };

  const handleVerifySmtp = async () => {
    setIsVerifyingSmtp(true);
    setSmtpVerifyMessage(null);
    try {
      const res = await fetch('/api/email/verify-smtp', { method: 'POST' });
      const data = await res.json();
      if (data.ok) {
        setSmtpVerifyMessage({ ok: true, text: data.message || 'cPanel SMTP server connected and verified!' });
        showToast('cPanel SMTP connection verified!', 'success');
      } else {
        setSmtpVerifyMessage({ ok: false, text: data.message || 'Verification failed. Please check credentials.' });
        showToast(data.message || 'SMTP verification failed', 'error');
      }
    } catch (err: any) {
      setSmtpVerifyMessage({ ok: false, text: err?.message || 'Network error verifying SMTP server' });
    } finally {
      setIsVerifyingSmtp(false);
    }
  };

  const handleSendTestEmail = async () => {
    if (!testEmailAddress.trim() || !testEmailAddress.includes('@')) {
      showToast('Please enter a valid recipient email address', 'error');
      return;
    }
    setIsSendingTestEmail(true);
    setTestEmailFeedback(null);
    try {
      const res = await fetch('/api/email/test-smtp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetEmail: testEmailAddress.trim(),
          customOptions:
            testSendType === 'diagnostic'
              ? { isTechnicalDiagnostic: true }
              : {
                  subject: subject.trim() || '🚀 New Paid Surveys Available: Earn Up to 450 Coins Today!',
                  headline: headline.trim() || 'Fresh Consumer Research Studies Waiting in Your Hub',
                  previewText: previewText.trim() || 'Exclusive brand feedback studies are live now with instant cashout credits.',
                  bodyContent: introMessage.trim(),
                  actionUrl: 'https://voiceflow360.com/surveys',
                  actionText: ctaText.trim() || 'Take Surveys & Claim Coins',
                  bonusCoins: bonusCoins > 0 ? bonusCoins : 50,
                  badge: bonusCoins > 0 ? `Bonus +${bonusCoins} Coins Available` : 'Exclusive Opportunity',
                  subheadline: previewText.trim() || 'Matched Research Opportunities & Instant Credits',
                  featuredSurveys: featuredSurveysList.map((s) => ({
                    title: s.title,
                    category: s.category,
                    rewardCoins: s.rewardCoins,
                    estimatedMinutes: s.estimatedMinutes,
                  })),
                  isTechnicalDiagnostic: false,
                },
        }),
      });
      const data = await res.json();
      if (data.success) {
        setTestEmailFeedback({
          ok: true,
          text: `Success! ${testSendType === 'diagnostic' ? 'Diagnostic verification' : 'Live survey template'} dispatched to ${testEmailAddress.trim()}. Check your inbox or spam folder.`,
          messageId: data.messageId,
        });
        showToast(`Email sent to ${testEmailAddress.trim()}`, 'success');
      } else {
        setTestEmailFeedback({ ok: false, text: data.error || 'Failed to dispatch email.' });
        showToast(data.error || 'Failed to send email', 'error');
      }
    } catch (err: any) {
      setTestEmailFeedback({ ok: false, text: err?.message || 'Network error sending email' });
    } finally {
      setIsSendingTestEmail(false);
    }
  };

  // Direct live send of the current composed campaign to a specified recipient
  const handleSendComposedLivePreview = async () => {
    const recipient = directRecipientEmail.trim();
    if (!recipient || !recipient.includes('@')) {
      showToast('Please enter a valid recipient email address', 'error');
      return;
    }
    setIsSendingDirectEmail(true);
    setDirectEmailFeedback(null);
    try {
      const recipientUser = users.find((u) => u.email.toLowerCase() === recipient.toLowerCase());
      const recipientName = recipientUser?.name || recipient.split('@')[0];

      const res = await fetch('/api/email/send-single', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toEmail: recipient,
          recipientName,
          subject: subject.trim() || '🚀 New Paid Surveys Available: Earn Up to 450 Coins Today!',
          headline: headline.trim() || 'Fresh Consumer Research Studies Waiting in Your Hub',
          messageContent: introMessage
            .replace('{name}', recipientName)
            .replace('{balance}', `${recipientUser?.coinBalance || 150} Coins`),
          actionUrl: 'https://voiceflow360.com/surveys',
          actionText: ctaText.trim() || 'Take Surveys & Claim Coins',
          bonusCoins: bonusCoins > 0 ? bonusCoins : undefined,
          badge: bonusCoins > 0 ? `Bonus +${bonusCoins} Coins Available` : 'Exclusive Survey Alert',
          featuredSurveys: featuredSurveysList.map((s) => ({
            title: s.title,
            category: s.category,
            rewardCoins: s.rewardCoins,
            estimatedMinutes: s.estimatedMinutes,
          })),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setDirectEmailFeedback({
          ok: true,
          text: `Live campaign email successfully delivered to ${recipient}! Check your inbox.`,
          messageId: data.messageId,
        });
        showToast(`Live campaign email sent to ${recipient}!`, 'success');
      } else {
        setDirectEmailFeedback({ ok: false, text: data.error || 'Failed to dispatch live email.' });
        showToast(data.error || 'Failed to send live email', 'error');
      }
    } catch (err: any) {
      setDirectEmailFeedback({ ok: false, text: err?.message || 'Network error sending live email' });
    } finally {
      setIsSendingDirectEmail(false);
    }
  };

  // Dispatching animation state
  const [isDispatching, setIsDispatching] = useState<boolean>(false);
  const [dispatchProgress, setDispatchProgress] = useState<number>(0);
  const [dispatchStatusText, setDispatchStatusText] = useState<string>('');
  const [dispatchSuccessData, setDispatchSuccessData] = useState<EmailCampaign | null>(null);

  // History detail modal state
  const [viewingCampaign, setViewingCampaign] = useState<EmailCampaign | null>(null);

  // Compute countries from users
  const countryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    users.forEach((u) => {
      const country = u.country || 'United States';
      counts[country] = (counts[country] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [users]);

  // Compute targeted recipients list (excludes guest sessions, dummy accounts, and example.com addresses)
  const targetedUsers: User[] = useMemo(() => {
    const isDeliverableUser = (u: User) => {
      if (u.isGuest || (u.id && u.id.startsWith('guest_'))) return false;
      if (!u.email) return false;
      return validateRealEmail(u.email).isValid;
    };

    const deliverableUsers = users.filter(isDeliverableUser);

    if (targetAudience === 'newsletter_subscribers') {
      const subscriberEmails = new Set(
        newsletterSubscribers
          .filter((s) => s.status === 'active' && s.email && validateRealEmail(s.email).isValid)
          .map((s) => s.email.toLowerCase().trim())
      );

      // 1. All registered platform users who have newsletterSubscribed === true or match subscriberEmails
      const subscribedFromUsers = deliverableUsers.filter(
        (u) =>
          u.email &&
          (u.newsletterSubscribed === true || subscriberEmails.has(u.email.toLowerCase().trim()))
      );

      const existingEmails = new Set(subscribedFromUsers.map((u) => u.email.toLowerCase().trim()));

      // 2. Standalone subscribers not yet in registered users list
      const standalone = newsletterSubscribers
        .filter(
          (s) =>
            s.status === 'active' &&
            s.email &&
            validateRealEmail(s.email).isValid &&
            !existingEmails.has(s.email.toLowerCase().trim())
        )
        .map((s) => ({
          id: s.id,
          name: s.userName || s.email.split('@')[0],
          email: s.email,
          role: 'user' as const,
          status: 'active' as const,
          coinBalance: 0,
          totalEarned: 0,
          country: s.country || 'Global',
          createdAt: s.subscribedAt,
          newsletterSubscribed: true,
        }));

      return [...subscribedFromUsers, ...standalone];
    }

    return deliverableUsers.filter((u) => {
      if (targetAudience === 'active_only') {
        return u.status === 'active';
      }
      if (targetAudience === 'specific_country') {
        return (u.country || '').toLowerCase() === targetCountry.toLowerCase();
      }
      if (targetAudience === 'high_earners') {
        return u.totalEarned > 300 || u.coinBalance > 200;
      }
      if (targetAudience === 'new_members') {
        const joinDate = new Date(u.createdAt).getTime();
        const thirtyDaysAgo = Date.now() - 30 * 24 * 3600 * 1000;
        return joinDate >= thirtyDaysAgo;
      }
      return true; // 'all'
    });
  }, [users, newsletterSubscribers, targetAudience, targetCountry]);

  // Filtered sample for audience drawer
  const filteredTargetUsers = useMemo(() => {
    if (!recipientSearch.trim()) return targetedUsers;
    const q = recipientSearch.toLowerCase();
    return targetedUsers.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.country || '').toLowerCase().includes(q)
    );
  }, [targetedUsers, recipientSearch]);

  // Selected surveys objects
  const featuredSurveysList: Campaign[] = useMemo(() => {
    return activeSurveys.filter((s) => selectedSurveyIds.includes(s.id));
  }, [activeSurveys, selectedSurveyIds]);

  const totalPossibleRewardCoins = useMemo(() => {
    return featuredSurveysList.reduce((acc, s) => acc + s.rewardCoins, 0);
  }, [featuredSurveysList]);

  // Handle template selection and apply pre-configured copywriting
  const handleSelectTemplate = (type: EmailTemplateType) => {
    setTemplateType(type);
    const surveyCount = selectedSurveyIds.length || 2;
    const coins = totalPossibleRewardCoins || 300;

    switch (type) {
      case 'new_surveys_alert':
        setSubject(`🚀 ${surveyCount} New Paid Surveys Available: Earn Up to ${coins} Coins Today!`);
        setPreviewText('Exclusive brand feedback studies are live now. Claim your survey spot before quota completes.');
        setHeadline('Fresh Market Research Studies Waiting in Your Hub');
        setIntroMessage(
          'Top consumer brands are looking for your authentic voice! We have unlocked new conversational surveys tailored for your profile. Share your thoughts and receive instant coin credits redeemable for real cash payouts.'
        );
        setCtaText('Take Surveys & Claim Coins');
        setBonusCoins(0);
        break;

      case 'high_reward_spotlight':
        setSubject(`⭐ High-Reward Research Spotlight: Up to ${coins} Coins Awaiting Your Voice`);
        setPreviewText('A premium conversational study has been matched to your profile with guaranteed rewards.');
        setHeadline('Premium High-Payout Research Spotlight');
        setIntroMessage(
          'You have been selected for a priority research cohort. Complete our featured conversational study to unlock high-tier coin rewards. Your verified input directly impacts product releases for global brands.'
        );
        setCtaText('Access Priority Survey');
        setBonusCoins(50);
        break;

      case 'weekly_digest':
        setSubject(`📬 Your Weekly Survey Digest: New Studies & Your Balance Update`);
        setPreviewText('Catch up on this week’s highest paying feedback surveys and community cashout milestones.');
        setHeadline('Weekly Survey Roundup & Earnings Opportunities');
        setIntroMessage(
          'Here is your curated weekly briefing of active consumer studies. Our panel members earned thousands of coins this week—don’t miss out on your share of cash rewards before the weekend!'
        );
        setCtaText('View All Available Surveys');
        setBonusCoins(25);
        break;

      case 're_engagement':
        setSubject(`👋 We Miss You! We Saved ${coins} Coins in Surveys For You`);
        setPreviewText('Come back and complete quick conversational feedback surveys with an extra bonus.');
        setHeadline('Welcome Back: Fresh Surveys Just Landed');
        setIntroMessage(
          'It has been a while since your last survey completion! We have refreshed your dashboard with new interactive surveys from leading brands. Jump back in today and boost your balance toward your next payout.'
        );
        setCtaText('Resume Earning Now');
        setBonusCoins(50);
        break;

      case 'custom_announcement':
        setSubject('Important Update: New Surveys & Rewards on Voice Flow 360');
        setPreviewText('Discover what’s new in our feedback reward platform.');
        setHeadline('Platform News & Survey Announcements');
        setIntroMessage(
          'We are excited to introduce new survey formats, verified brand research partners, and faster payout options across the Voice Flow 360 platform.'
        );
        setCtaText('Explore What’s New');
        setBonusCoins(0);
        break;
    }
  };

  // Toggle survey selection
  const handleToggleSurvey = (surveyId: string) => {
    setSelectedSurveyIds((prev) =>
      prev.includes(surveyId) ? prev.filter((id) => id !== surveyId) : [...prev, surveyId]
    );
  };

  // Select all surveys
  const handleSelectAllSurveys = () => {
    setSelectedSurveyIds(activeSurveys.map((s) => s.id));
  };

  // Clear survey selection
  const handleClearSurveys = () => {
    setSelectedSurveyIds([]);
  };

  // Insert personalization variable
  const handleInsertTag = (tag: string) => {
    setIntroMessage((prev) => prev + ` ${tag}`);
  };

  // Dispatch batch email campaign with real-time simulated progress
  const handleDispatchCampaign = async () => {
    if (!subject.trim()) {
      showToast('Please enter an email subject line', 'error');
      return;
    }
    if (targetedUsers.length === 0) {
      showToast('Selected audience has 0 recipients', 'error');
      return;
    }

    setIsDispatching(true);
    setDispatchProgress(10);
    setDispatchStatusText(`Targeting ${targetedUsers.length} listed recipients (${targetAudience === 'newsletter_subscribers' ? 'Newsletter Subscribers' : 'Members'})...`);

    let deliveredCount = targetedUsers.length;
    let failedCount = 0;

    if (sendViaSmtp && smtpStatus?.isConfigured) {
      await new Promise((r) => setTimeout(r, 400));
      setDispatchProgress(30);
      setDispatchStatusText(`Connecting to cPanel SMTP host (${smtpStatus.host}:${smtpStatus.port})...`);

      await new Promise((r) => setTimeout(r, 500));
      setDispatchProgress(60);
      setDispatchStatusText(`Transmitting batch emails via ${smtpStatus.fromEmail || smtpStatus.user} with rate-limiting...`);

      try {
        const response = await fetch('/api/email/send-campaign', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            recipients: targetedUsers
              .filter((u) => u.email && validateRealEmail(u.email).isValid && !u.isGuest && !u.id?.startsWith('guest_'))
              .map((u) => ({ email: u.email, name: u.name })),
            subject: subject.trim(),
            htmlContent: introMessage.trim(),
            campaignTitle: headline.trim(),
            actionUrl: 'https://voiceflow360.com/surveys',
            actionText: ctaText.trim() || 'View Available Surveys',
            badge: bonusCoins > 0 ? `Bonus +${bonusCoins} Coins Available` : 'Exclusive Research Alert',
            subheadline: previewText.trim() || 'Matched Research Opportunities & Instant Credits',
            bonusCoins: bonusCoins > 0 ? bonusCoins : undefined,
            featuredSurveys: featuredSurveysList.map((s) => ({
              title: s.title,
              category: s.category,
              rewardCoins: s.rewardCoins,
              estimatedMinutes: s.estimatedMinutes,
            })),
          }),
        });

        const batchData = await response.json();
        if (batchData.sent > 0) {
          deliveredCount = batchData.sent;
          failedCount = batchData.failed;
          setDispatchProgress(90);
          setDispatchStatusText(`cPanel SMTP Delivery: ${batchData.sent} sent successfully (${batchData.failed} failed).`);
          showToast(`Dispatched ${batchData.sent} emails directly through cPanel SMTP!`, 'success');
        } else {
          showToast(batchData.message || 'SMTP batch notice: recorded campaign', 'warning');
        }
      } catch (smtpErr: any) {
        console.warn('Real SMTP error occurred, recording campaign:', smtpErr);
        showToast('Real SMTP connection issue: recorded campaign history', 'warning');
      }
    } else {
      // Standard local simulation workflow
      await new Promise((r) => setTimeout(r, 500));
      setDispatchProgress(35);
      setDispatchStatusText('Formatting dynamic personalization tags ({name}, {survey_list})...');

      await new Promise((r) => setTimeout(r, 600));
      setDispatchProgress(70);
      setDispatchStatusText(`Connecting to virtual SMTP relay (${targetedUsers.length} queued)...`);

      await new Promise((r) => setTimeout(r, 600));
      setDispatchProgress(90);
      setDispatchStatusText('Simulating delivery verification and anti-spam deliverability handshakes...');
    }

    await new Promise((r) => setTimeout(r, 500));
    setDispatchProgress(100);
    setDispatchStatusText('Dispatch complete! Generating campaign delivery report...');

    try {
      const created = await sendEmailCampaign({
        subject: subject.trim(),
        previewText: previewText.trim(),
        templateType,
        targetAudience,
        targetCountry: targetAudience === 'specific_country' ? targetCountry : undefined,
        recipientCount: targetedUsers.length,
        recipientSample: targetedUsers.slice(0, 5).map((u) => u.email),
        featuredSurveyIds: selectedSurveyIds,
        headline: headline.trim(),
        introMessage: introMessage.trim(),
        ctaText: ctaText.trim(),
        bonusCoinsIncentive: bonusCoins > 0 ? bonusCoins : undefined,
        sendInAppNotification: sendInAppNotif,
        createdByName: 'Admin Operations',
      });

      // Update delivered counts if available
      if (created && created.stats) {
        created.stats.deliveredCount = deliveredCount;
        created.stats.failedCount = failedCount;
      }

      setDispatchSuccessData(created);
    } catch (err) {
      console.error('Failed to send campaign:', err);
      showToast('Failed to dispatch campaign', 'error');
      setIsDispatching(false);
    }
  };

  // Generate Mailto BCC string to open in real email client
  const handleOpenInMailClient = () => {
    const bccList = targetedUsers.slice(0, 40).map((u) => u.email).join(',');
    const encodedSubject = encodeURIComponent(subject);
    const bodyContent = `${headline}\n\n${introMessage}\n\nFeatured Surveys:\n${featuredSurveysList
      .map((s) => `• ${s.title} — Reward: ${s.rewardCoins} Coins ($${(s.rewardCoins / 100).toFixed(2)})`)
      .join('\n')}\n\nStart now: https://voiceflow360.com/start-earning\n\nVoice Flow 360 Team`;
    const encodedBody = encodeURIComponent(bodyContent);

    window.open(`mailto:notifications@voiceflow360.com?bcc=${encodeURIComponent(bccList)}&subject=${encodedSubject}&body=${encodedBody}`);
    showToast('Opened default mail client with BCC recipient list', 'info');
  };

  // Export CSV of targeted recipients
  const handleExportCSV = () => {
    const csvHeader = 'Name,Email,Country,Status,CoinBalance,TotalEarnedCoins\n';
    const csvRows = targetedUsers
      .map(
        (u) =>
          `"${u.name}","${u.email}","${u.country || ''}","${u.status}",${u.coinBalance},${u.totalEarned}`
      )
      .join('\n');
    const blob = new Blob([csvHeader + csvRows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `voiceflow_recipients_${targetAudience}_${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    showToast(`Exported ${targetedUsers.length} recipients to CSV`, 'success');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white p-6 sm:p-8 rounded-2xl shadow-md border border-purple-800/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/30 text-purple-200 text-xs font-bold uppercase tracking-wider">
              <Mail className="w-3.5 h-3.5" />
              Batch Survey Email Campaign Studio
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Email All Listed Users About New Surveys
            </h1>
            <p className="text-purple-200 text-sm max-w-2xl leading-relaxed">
              Broadcast high-converting email notifications to your listed consumer panel. Feature newly launched surveys, showcase rewards, and drive instant survey participation.
            </p>
          </div>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10 text-center">
              <span className="text-xs text-purple-200 block font-medium">Total Listed Users</span>
              <span className="text-xl sm:text-2xl font-black text-white">{users.length}</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10 text-center">
              <span className="text-xs text-purple-200 block font-medium">Newsletter Alerts</span>
              <span className="text-xl sm:text-2xl font-black text-amber-300">{newsletterSubscribers.length}</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10 text-center">
              <span className="text-xs text-purple-200 block font-medium">Active Surveys</span>
              <span className="text-xl sm:text-2xl font-black text-emerald-400">{activeSurveys.length}</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10 text-center">
              <span className="text-xs text-purple-200 block font-medium">Emails Dispatched</span>
              <span className="text-xl sm:text-2xl font-black text-cyan-300">{emailCampaigns.length}</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10 text-center">
              <span className="text-xs text-purple-200 block font-medium">Avg. Open Rate</span>
              <span className="text-xl sm:text-2xl font-black text-purple-300">71.3%</span>
            </div>
          </div>
        </div>

        {/* Tab Toggle */}
        <div className="flex flex-wrap items-center gap-2 mt-6 pt-4 border-t border-purple-700/40">
          <button
            id="tab-compose-email-btn"
            onClick={() => setActiveTab('compose')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'compose'
                ? 'bg-white text-purple-900 shadow-sm'
                : 'text-purple-200 hover:text-white hover:bg-white/10'
            }`}
          >
            <Sparkles className="w-4 h-4 text-purple-600" />
            Compose &amp; Dispatch Blast
          </button>
          <button
            id="tab-history-email-btn"
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'history'
                ? 'bg-white text-purple-900 shadow-sm'
                : 'text-purple-200 hover:text-white hover:bg-white/10'
            }`}
          >
            <Clock className="w-4 h-4 text-indigo-400" />
            Campaign History ({emailCampaigns.length})
          </button>
          <button
            id="tab-subscribers-email-btn"
            onClick={() => setActiveTab('subscribers')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'subscribers'
                ? 'bg-white text-purple-900 shadow-sm'
                : 'text-purple-200 hover:text-white hover:bg-white/10'
            }`}
          >
            <Bell className="w-4 h-4 text-amber-400" />
            Newsletter Subscribers ({newsletterSubscribers.length})
          </button>
          <button
            id="tab-cpanel-smtp-btn"
            onClick={() => setActiveTab('cpanel_smtp')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'cpanel_smtp'
                ? 'bg-white text-purple-900 shadow-sm'
                : 'text-purple-200 hover:text-white hover:bg-white/10'
            }`}
          >
            <Server className="w-4 h-4 text-emerald-400" />
            <span>cPanel SMTP Mail Routing</span>
            {smtpStatus?.isConfigured ? (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="SMTP Active" />
            ) : (
              <span className="w-2 h-2 rounded-full bg-amber-400" title="Setup Required" />
            )}
          </button>
        </div>
      </div>

      {activeTab === 'compose' ? (
        <div className="space-y-6">
          {/* Outgoing Mail Engine Status Banner */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  smtpStatus?.isConfigured
                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                    : 'bg-amber-50 text-amber-600 border border-amber-200'
                }`}
              >
                <Server className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-slate-900">Outgoing Mail Route:</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[11px] font-extrabold ${
                      smtpStatus?.isConfigured
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {smtpStatus?.isConfigured
                      ? `cPanel SMTP (${smtpStatus.fromEmail || smtpStatus.host})`
                      : 'Simulation / Webmail Export'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {smtpStatus?.isConfigured
                    ? `Live delivery active via ${smtpStatus.host}:${smtpStatus.port}. Dispatched survey blasts arrive in user inboxes.`
                    : 'Configure your cPanel SMTP credentials in environment settings to send directly from your domain.'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setActiveTab('cpanel_smtp')}
              className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold border border-purple-200 flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
            >
              <Settings2 className="w-3.5 h-3.5" />
              <span>Configure &amp; Test Connection</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Form Controls (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Step 1: Audience & Targeting */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-black text-sm">
                      1
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-slate-900">Select Target Audience</h2>
                      <p className="text-xs text-slate-500">Choose which listed members receive this survey blast</p>
                    </div>
                  </div>

                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-700 font-extrabold text-xs">
                    <Users className="w-3.5 h-3.5" />
                    <span>{targetedUsers.length} Recipients</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={() => setTargetAudience('all')}
                    className={`p-3 rounded-xl border text-left flex items-start justify-between transition-all cursor-pointer ${
                      targetAudience === 'all'
                        ? 'border-purple-600 bg-purple-50/50 ring-2 ring-purple-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">All Listed Users</span>
                      <span className="text-[11px] text-slate-500">Every registered customer in database</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-bold">
                      {users.length}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTargetAudience('newsletter_subscribers')}
                    className={`p-3 rounded-xl border text-left flex items-start justify-between transition-all cursor-pointer ${
                      targetAudience === 'newsletter_subscribers'
                        ? 'border-purple-600 bg-purple-50/50 ring-2 ring-purple-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">Newsletter &amp; Survey Alerts</span>
                      <span className="text-[11px] text-slate-500">Visitors subscribed via footer form</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                      {newsletterSubscribers.filter((s) => s.status === 'active').length}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTargetAudience('active_only')}
                    className={`p-3 rounded-xl border text-left flex items-start justify-between transition-all cursor-pointer ${
                      targetAudience === 'active_only'
                        ? 'border-purple-600 bg-purple-50/50 ring-2 ring-purple-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">Active Members Only</span>
                      <span className="text-[11px] text-slate-500">Exclude inactive/suspended accounts</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      {users.filter((u) => u.status === 'active').length}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTargetAudience('high_earners')}
                    className={`p-3 rounded-xl border text-left flex items-start justify-between transition-all cursor-pointer ${
                      targetAudience === 'high_earners'
                        ? 'border-purple-600 bg-purple-50/50 ring-2 ring-purple-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">Power Users (&gt;300 Coins)</span>
                      <span className="text-[11px] text-slate-500">Highest response rate cohort</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                      {users.filter((u) => u.totalEarned > 300).length}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTargetAudience('specific_country')}
                    className={`p-3 rounded-xl border text-left flex items-start justify-between transition-all cursor-pointer ${
                      targetAudience === 'specific_country'
                        ? 'border-purple-600 bg-purple-50/50 ring-2 ring-purple-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">Filter By Country</span>
                      <span className="text-[11px] text-slate-500">Target a specific geographic market</span>
                    </div>
                    <Globe2 className="w-4 h-4 text-indigo-600" />
                  </button>
                </div>

              {/* Country dropdown if selected */}
              {targetAudience === 'specific_country' && (
                <div className="pt-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Target Geographic Market</label>
                  <select
                    value={targetCountry}
                    onChange={(e) => setTargetCountry(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 font-semibold text-slate-800"
                  >
                    {countryCounts.map(([cName, count]) => (
                      <option key={cName} value={cName}>
                        {cName} ({count} listed users)
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Recipient sample toggle button */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
                <button
                  type="button"
                  onClick={() => setIsAudiencePreviewOpen(!isAudiencePreviewOpen)}
                  className="text-purple-700 hover:text-purple-800 font-bold inline-flex items-center gap-1 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  {isAudiencePreviewOpen ? 'Hide Recipient List' : `View ${targetedUsers.length} Recipients`}
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleExportCSV}
                    className="text-slate-600 hover:text-slate-900 font-semibold inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Download className="w-3 h-3" />
                    Export CSV
                  </button>
                </div>
              </div>

              {/* Recipient Sample Drawer */}
              {isAudiencePreviewOpen && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search recipient by name or email..."
                      value={recipientSearch}
                      onChange={(e) => setRecipientSearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                    />
                  </div>

                  <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
                    {filteredTargetUsers.slice(0, 50).map((u) => (
                      <div
                        key={u.id}
                        className="flex items-center justify-between text-[11px] p-1.5 rounded-lg bg-white border border-slate-100"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-purple-100 text-purple-800 font-bold flex items-center justify-center text-[10px]">
                            {u.name.charAt(0)}
                          </div>
                          <div>
                            <span className="font-bold text-slate-800">{u.name}</span>
                            <span className="text-slate-400 ml-1">({u.email})</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-slate-500">
                          <span>{u.country || 'US'}</span>
                          <span className="font-bold text-amber-600">{u.coinBalance} pts</span>
                        </div>
                      </div>
                    ))}
                    {filteredTargetUsers.length > 50 && (
                      <p className="text-center text-[10px] text-slate-400 py-1">
                        ...and {filteredTargetUsers.length - 50} more recipients
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Step 2: Featured Surveys Selection */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-sm">
                    2
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Featured Surveys in Email</h2>
                    <p className="text-xs text-slate-500">Select which new surveys to showcase in the email card</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs">
                  <button
                    type="button"
                    onClick={handleSelectAllSurveys}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors cursor-pointer"
                  >
                    Select All ({activeSurveys.length})
                  </button>
                  <button
                    type="button"
                    onClick={handleClearSurveys}
                    className="px-2 py-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    Clear
                  </button>
                </div>
              </div>

              {/* Total Reward Highlight */}
              <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-emerald-900 font-bold">
                  <Coins className="w-4 h-4 text-amber-500" />
                  <span>
                    {selectedSurveyIds.length} Surveys Selected · Potential Reward Pool:{' '}
                    <strong className="text-emerald-700">{totalPossibleRewardCoins} Coins</strong> ($
                    {(totalPossibleRewardCoins / 100).toFixed(2)})
                  </span>
                </div>
                <span className="text-[11px] text-emerald-700">Auto-embedded in template</span>
              </div>

              {/* Survey List */}
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {activeSurveys.map((survey) => {
                  const isSelected = selectedSurveyIds.includes(survey.id);
                  return (
                    <div
                      key={survey.id}
                      onClick={() => handleToggleSurvey(survey.id)}
                      className={`p-3 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50/40 ring-1 ring-emerald-500/30'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                            isSelected
                              ? 'bg-emerald-600 border-emerald-600 text-white'
                              : 'border-slate-300 bg-white'
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900">{survey.title}</span>
                            <span className="px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-semibold">
                              {survey.category.replace('_', ' ')}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-500 line-clamp-1">{survey.description}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 font-extrabold text-xs">
                          <Coins className="w-3 h-3 text-amber-600" />
                          <span>+{survey.rewardCoins}</span>
                        </div>
                        <span className="text-[11px] text-slate-400 font-medium">~{survey.estimatedMinutes}m</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step 3: Template & Copywriting */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-black text-sm">
                  3
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Email Template &amp; Messaging</h2>
                  <p className="text-xs text-slate-500">Select a pre-designed template or customize the text</p>
                </div>
              </div>

              {/* Templates Selector */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { id: 'new_surveys_alert', label: '🚀 New Survey Alert', desc: 'High urgency launch' },
                  { id: 'high_reward_spotlight', label: '⭐ High-Reward Spotlight', desc: 'Premium payouts' },
                  { id: 'weekly_digest', label: '📬 Weekly Digest', desc: 'Roundup & balance check' },
                  { id: 're_engagement', label: '👋 We Miss You', desc: 'Reactivate members' },
                  { id: 'custom_announcement', label: '✍️ Custom Letter', desc: 'Full custom draft' },
                ].map((tpl) => (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => handleSelectTemplate(tpl.id as EmailTemplateType)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      templateType === tpl.id
                        ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <span className="text-xs font-bold text-slate-900 block leading-tight">{tpl.label}</span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">{tpl.desc}</span>
                  </button>
                ))}
              </div>

              {/* Copywriting Fields */}
              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Subject Line</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. 🚀 3 New Surveys Live: Earn Up to 450 Coins Today!"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Preheader / Preview Text</label>
                  <input
                    type="text"
                    value={previewText}
                    onChange={(e) => setPreviewText(e.target.value)}
                    placeholder="Short snippet visible in email inbox previews..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium text-slate-600 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email Main Headline</label>
                  <input
                    type="text"
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700">Intro Message &amp; Body</label>
                    <div className="flex items-center gap-1 text-[10px] text-slate-400">
                      <span>Insert tag:</span>
                      <button
                        type="button"
                        onClick={() => handleInsertTag('{name}')}
                        className="px-1.5 py-0.5 rounded bg-slate-100 text-purple-700 font-mono hover:bg-purple-50"
                      >
                        {'{name}'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleInsertTag('{current_balance}')}
                        className="px-1.5 py-0.5 rounded bg-slate-100 text-purple-700 font-mono hover:bg-purple-50"
                      >
                        {'{balance}'}
                      </button>
                    </div>
                  </div>
                  <textarea
                    rows={3}
                    value={introMessage}
                    onChange={(e) => setIntroMessage(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-normal text-slate-800 leading-relaxed focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Call to Action Button</label>
                    <input
                      type="text"
                      value={ctaText}
                      onChange={(e) => setCtaText(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Bonus Incentive Coins</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        max="500"
                        step="25"
                        value={bonusCoins}
                        onChange={(e) => setBonusCoins(Number(e.target.value))}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold text-amber-700 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                      />
                      <span className="text-[11px] text-slate-400 shrink-0">
                        {bonusCoins > 0 ? `+$${(bonusCoins / 100).toFixed(2)}` : 'None'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* In-app notification toggle */}
                <div className="pt-2">
                  <label className="flex items-center gap-2.5 p-3 rounded-xl bg-purple-50/60 border border-purple-100 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sendInAppNotif}
                      onChange={(e) => setSendInAppNotif(e.target.checked)}
                      className="rounded text-purple-600 focus:ring-purple-500 h-4 w-4"
                    />
                    <div className="text-xs">
                      <span className="font-bold text-purple-950 block">
                        Broadcast simultaneous In-App Platform Notification
                      </span>
                      <span className="text-purple-700">
                        Displays an immediate notification badge on the user bell icon linking to the survey tab.
                      </span>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Step 4: Dispatch Controls */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-5">
              {/* Direct Live Delivery to Single Recipient */}
              <div className="p-4 rounded-xl bg-purple-50/60 border border-purple-200/80 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-purple-600 shrink-0" />
                    <h4 className="text-xs font-bold text-slate-900">Direct Live Campaign Delivery (Single Recipient)</h4>
                  </div>
                  <span className="text-[10px] text-purple-800 bg-purple-100 font-bold px-2.5 py-0.5 rounded-full self-start sm:self-auto">
                    Live Production Dispatch
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Deliver this complete live branded survey campaign directly to any customer inbox (e.g. <strong>ibrhussain6@gmail.com</strong> or any registered panelist) via cPanel SMTP with real links, survey cards, and bonus coin incentives.
                </p>

                <div className="space-y-2">
                  <div className="flex flex-col sm:flex-row items-center gap-2">
                    <input
                      type="email"
                      value={directRecipientEmail}
                      onChange={(e) => setDirectRecipientEmail(e.target.value)}
                      placeholder="Enter recipient email (e.g. ibrhussain6@gmail.com)"
                      className="w-full px-3 py-2 bg-white border border-purple-200 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleSendComposedLivePreview}
                      disabled={isSendingDirectEmail || !directRecipientEmail.trim()}
                      className="w-full sm:w-auto px-5 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-black text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer transition-colors shrink-0"
                    >
                      {isSendingDirectEmail ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Delivering Email...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Send Live Campaign Now</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="flex items-center gap-2 text-[10px] text-slate-500">
                    <span>Quick Autofill:</span>
                    <button
                      type="button"
                      onClick={() => setDirectRecipientEmail('ibrhussain6@gmail.com')}
                      className="text-purple-700 font-bold hover:underline cursor-pointer bg-purple-100/60 px-2 py-0.5 rounded-md"
                    >
                      ibrhussain6@gmail.com
                    </button>
                    {targetedUsers.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setDirectRecipientEmail(targetedUsers[0]?.email || '')}
                        className="text-purple-700 font-bold hover:underline cursor-pointer bg-purple-100/60 px-2 py-0.5 rounded-md truncate max-w-[180px]"
                      >
                        First Subscriber: {targetedUsers[0]?.email}
                      </button>
                    )}
                  </div>
                </div>

                {directEmailFeedback && (
                  <div
                    className={`p-2.5 rounded-lg text-xs font-medium flex items-center gap-2 ${
                      directEmailFeedback.ok
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-rose-50 text-rose-800 border border-rose-200'
                    }`}
                  >
                    {directEmailFeedback.ok ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    )}
                    <span className="flex-1">{directEmailFeedback.text}</span>
                  </div>
                )}
              </div>

              {/* Broadcast Blast Option */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Broadcast Batch Campaign Blast</h3>
                  <p className="text-xs text-slate-500">
                    Will be dispatched to <strong>{targetedUsers.length} listed {targetAudience === 'newsletter_subscribers' ? 'Newsletter Subscribers' : 'Recipients'}</strong> featuring{' '}
                    <strong>{selectedSurveyIds.length} surveys</strong>.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleOpenInMailClient}
                    title="Open in your default mail app with BCC to all listed users"
                    className="px-3 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open in Mail Client</span>
                  </button>

                  <button
                    id="dispatch-batch-email-btn"
                    type="button"
                    onClick={handleDispatchCampaign}
                    disabled={isDispatching || targetedUsers.length === 0}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-700 hover:to-indigo-800 text-white font-black text-xs sm:text-sm shadow-md flex items-center gap-2 transition-all hover:scale-[1.02] cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    <span>Send Batch Email Blast</span>
                  </button>
                </div>
              </div>

              {/* cPanel Delivery routing indicator */}
              <div className="pt-2 border-t border-slate-100">
                {smtpStatus?.isConfigured ? (
                  <label className="flex items-center gap-2.5 p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sendViaSmtp}
                      onChange={(e) => setSendViaSmtp(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                    />
                    <div className="text-xs">
                      <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                        <Server className="w-3.5 h-3.5 text-emerald-600" />
                        Send directly via cPanel SMTP Server ({smtpStatus.fromEmail || smtpStatus.user})
                      </span>
                      <span className="text-emerald-700 block mt-0.5">
                        Delivers directly to user inboxes via your host mail relay with rate-limiting between emails.
                      </span>
                    </div>
                  </label>
                ) : (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-xs">
                    <div className="flex items-center gap-2">
                      <Server className="w-4 h-4 text-amber-600 shrink-0" />
                      <div>
                        <span className="font-bold text-amber-900 block">Operating in Preview / Simulation Mode</span>
                        <span className="text-amber-700 text-[11px]">
                          To route actual emails directly from your cPanel mailbox, configure SMTP in environment settings.
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab('cpanel_smtp')}
                      className="px-2.5 py-1 rounded-lg bg-amber-200/80 hover:bg-amber-300 text-amber-950 font-bold text-[11px] transition-colors shrink-0"
                    >
                      Connect cPanel
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Live Interactive Email Client Preview (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs sticky top-20">
              {/* Preview Header & Device Selector */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-purple-600" />
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Live Email Preview</h3>
                </div>

                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs">
                  <button
                    type="button"
                    onClick={() => setPreviewDevice('desktop')}
                    className={`px-2 py-1 rounded-md font-bold transition-all ${
                      previewDevice === 'desktop' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
                    }`}
                  >
                    <Monitor className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewDevice('mobile')}
                    className={`px-2 py-1 rounded-md font-bold transition-all ${
                      previewDevice === 'mobile' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Mock Email Client Envelope Bar */}
              <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] space-y-1 font-mono text-slate-600">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">From:</span>
                  <span className="font-sans font-medium text-slate-800 truncate">
                    Voice Flow 360 Surveys &lt;notifications@voiceflow360.com&gt;
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">To:</span>
                  <span className="font-sans font-medium text-purple-700">
                    {targetedUsers[0]?.name || 'Alex Rivers'} &lt;{targetedUsers[0]?.email || 'alex@example.com'}&gt; (+{Math.max(0, targetedUsers.length - 1)} others)
                  </span>
                </div>
                <div className="flex items-center justify-between pt-0.5 border-t border-slate-200/60">
                  <span className="text-slate-400">Subject:</span>
                  <span className="font-sans font-bold text-slate-900 truncate">{subject || 'New Survey Alert'}</span>
                </div>
              </div>

              {/* Email Body Simulated Container */}
              <div
                className={`mt-4 border border-slate-200 rounded-2xl overflow-hidden shadow-inner bg-slate-100 transition-all ${
                  previewDevice === 'mobile' ? 'max-w-[340px] mx-auto' : 'w-full'
                }`}
              >
                {/* Email Header Banner - matching new branded template */}
                <div className="bg-slate-900 p-6 text-center text-white border-b border-slate-800">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 text-slate-200 text-[10px] font-bold tracking-wide uppercase mb-3">
                    <span className="w-5 h-5 rounded-md bg-purple-600 flex items-center justify-center text-white font-black text-[10px]">
                      VF
                    </span>
                    Voice Flow 360 · Research Hub
                  </div>
                  <h4 className="text-lg font-black tracking-tight text-white">{headline || 'New Surveys Available'}</h4>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">{previewText}</p>
                </div>

                {/* Email Main Card Body */}
                <div className="p-5 sm:p-6 bg-white space-y-4 text-xs">
                  {/* Greeting */}
                  <div>
                    <span className="font-extrabold text-slate-900 text-sm">
                      Hi {targetedUsers[0]?.name?.split(' ')[0] || 'Member'},
                    </span>
                    <p className="text-slate-600 mt-1.5 leading-relaxed text-xs">
                      {introMessage
                        .replace('{name}', targetedUsers[0]?.name || 'Member')
                        .replace('{balance}', `${targetedUsers[0]?.coinBalance || 120} Coins`)}
                    </p>
                  </div>

                  {/* Bonus Incentive Tag if active */}
                  {bonusCoins > 0 && (
                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-200/80 flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                        <Coins className="w-4 h-4 text-amber-700" />
                      </div>
                      <div>
                        <div className="text-[11px] font-black text-amber-950">
                          Active Bonus Offer: +{bonusCoins} Bonus Coins
                        </div>
                        <div className="text-[10px] text-amber-800">
                          Complete within 24 hours to unlock your extra ${(bonusCoins / 100).toFixed(2)} USD bonus credit.
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Featured Survey Cards */}
                  <div className="space-y-2.5 pt-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Recommended Research Studies:
                    </span>

                    {featuredSurveysList.length === 0 ? (
                      <p className="text-center py-4 text-slate-400 text-xs italic">
                        No surveys selected. Pick surveys on the left to embed them here!
                      </p>
                    ) : (
                      featuredSurveysList.map((survey) => (
                        <div
                          key={survey.id}
                          className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 space-y-2 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <span className="text-[9px] font-extrabold uppercase tracking-wider text-purple-700 block">
                                {survey.category.replace('_', ' ')}
                              </span>
                              <h5 className="font-extrabold text-slate-900 text-xs">{survey.title}</h5>
                            </div>
                            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-black text-[10px] shrink-0">
                              <Coins className="w-3 h-3 text-emerald-600" />
                              +{survey.rewardCoins} Coins
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-200/60">
                            <span className="inline-flex items-center gap-1 font-medium">
                              <Clock className="w-3 h-3 text-slate-400" />
                              {survey.estimatedMinutes} mins
                            </span>
                            <span className="text-purple-700 font-bold hover:underline cursor-pointer">
                              Start Study &rarr;
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* CTA Button */}
                  <div className="pt-2 text-center">
                    <button
                      type="button"
                      className="w-full py-3 px-5 rounded-xl bg-purple-600 text-white font-extrabold text-xs shadow-md shadow-purple-600/20 hover:bg-purple-700 transition-colors cursor-pointer"
                    >
                      {ctaText} &rarr;
                    </button>
                    <span className="text-[9px] text-slate-400 block mt-1.5 font-medium">
                      Direct single-click link with automatic account recognition
                    </span>
                  </div>

                  {/* Compliance Footer */}
                  <div className="pt-4 border-t border-slate-100 text-[10px] text-slate-400 text-center space-y-1 leading-tight">
                    <p>You received this email because you are registered on Voice Flow 360 with {targetedUsers[0]?.email || 'your email'}.</p>
                    <p>
                      Voice Flow 360 Inc. · Consumer Research Panel ·{' '}
                      <span className="text-purple-600 underline cursor-pointer">Unsubscribe</span> ·{' '}
                      <span className="text-purple-600 underline cursor-pointer">Email Preferences</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      ) : activeTab === 'history' ? (
        /* History & Performance Tab */
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">Email Campaign History &amp; Delivery Logs</h2>
                <p className="text-xs text-slate-500">
                  Track batch dispatch status, delivery confirmation, and estimated member open rates
                </p>
              </div>

              <div className="text-xs font-semibold text-slate-500">
                Showing {emailCampaigns.length} sent campaigns
              </div>
            </div>

            {emailCampaigns.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl space-y-2">
                <Mail className="w-8 h-8 text-slate-300 mx-auto" />
                <h3 className="text-sm font-bold text-slate-700">No email campaigns sent yet</h3>
                <p className="text-xs text-slate-400">
                  Compose your first survey blast above to notify all listed members!
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab('compose')}
                  className="px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold shadow-xs hover:bg-purple-700 transition-colors cursor-pointer"
                >
                  Create Survey Blast
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {emailCampaigns.map((camp) => (
                  <div key={camp.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase">
                          {camp.status}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-semibold">
                          {camp.templateType.replace('_', ' ')}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {new Date(camp.createdAt).toLocaleDateString()} at{' '}
                          {new Date(camp.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-slate-900">{camp.subject}</h4>
                      <p className="text-xs text-slate-500 line-clamp-1">{camp.headline}</p>

                      <div className="flex items-center gap-3 text-xs text-slate-500 pt-1">
                        <span className="inline-flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-purple-600" />
                          <strong>{camp.recipientCount}</strong> recipients
                        </span>
                        <span>·</span>
                        <span>
                          <strong>{camp.featuredSurveyIds.length}</strong> surveys featured
                        </span>
                        {camp.bonusCoinsIncentive && (
                          <>
                            <span>·</span>
                            <span className="text-amber-600 font-bold">+{camp.bonusCoinsIncentive} bonus</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Stats & Actions */}
                    <div className="flex items-center gap-4 shrink-0">
                      <div className="grid grid-cols-2 gap-2 text-center bg-slate-50 p-2 rounded-xl border border-slate-200">
                        <div>
                          <span className="text-[10px] text-slate-400 block font-medium">Est. Open</span>
                          <span className="text-xs font-black text-purple-700">
                            {camp.stats.openRateEstimatedPercent}%
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block font-medium">Est. Click</span>
                          <span className="text-xs font-black text-emerald-700">
                            {camp.stats.clickRateEstimatedPercent}%
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setViewingCampaign(camp)}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 text-purple-600" />
                          <span>View Details</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteEmailCampaign(camp.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                          title="Delete record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : activeTab === 'subscribers' ? (
        /* Newsletter Subscribers Tab */
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">Newsletter &amp; Survey Alert Subscribers</h2>
                <p className="text-xs text-slate-500">
                  Users registered via the footer subscription form to receive new survey alerts and platform updates
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  id="draft-subscribers-campaign-btn"
                  onClick={() => {
                    setTargetAudience('newsletter_subscribers');
                    setActiveTab('compose');
                  }}
                  className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Draft Alert to Subscribers</span>
                </button>

                <button
                  type="button"
                  id="export-subscribers-csv-btn"
                  onClick={() => {
                    const header = 'ID,Email,SubscribedAt,Status,Source,NewSurveys,PlatformUpdates,WeeklyDigest\n';
                    const rows = newsletterSubscribers
                      .map(
                        (s) =>
                          `"${s.id}","${s.email}","${s.subscribedAt}","${s.status}","${s.source}",${s.preferences.newSurveys},${s.preferences.platformUpdates},${s.preferences.weeklyDigest}`
                      )
                      .join('\n');
                    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `newsletter_subscribers_${Date.now()}.csv`;
                    link.click();
                    URL.revokeObjectURL(url);
                    showToast(`Exported ${newsletterSubscribers.length} subscribers to CSV`, 'success');
                  }}
                  className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold rounded-lg border border-purple-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>
                <div className="text-xs font-semibold text-slate-500">
                  {newsletterSubscribers.length} subscribers registered
                </div>
              </div>
            </div>

            {/* Filter Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={subscriberSearch}
                onChange={(e) => setSubscriberSearch(e.target.value)}
                placeholder="Search subscribers by email address..."
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Subscriber List Table */}
            {newsletterSubscribers.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl space-y-2">
                <Bell className="w-8 h-8 text-slate-300 mx-auto" />
                <h3 className="text-sm font-bold text-slate-700">No subscribers signed up yet</h3>
                <p className="text-xs text-slate-400">
                  Subscribers will automatically appear here once visitors register using the footer signup form!
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px]">
                    <tr>
                      <th className="py-2.5 px-3">Subscriber Email</th>
                      <th className="py-2.5 px-3">Preferences</th>
                      <th className="py-2.5 px-3">Subscribed At</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Source</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {newsletterSubscribers
                      .filter((s) => !subscriberSearch.trim() || s.email.toLowerCase().includes(subscriberSearch.toLowerCase()))
                      .map((sub) => (
                        <tr key={sub.id} className="hover:bg-slate-50/80">
                          <td className="py-2.5 px-3 font-semibold text-slate-900">
                            {sub.email}
                          </td>
                          <td className="py-2.5 px-3">
                            <div className="flex flex-wrap gap-1">
                              {sub.preferences.newSurveys && (
                                <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 text-[10px] font-bold">
                                  Survey Alerts
                                </span>
                              )}
                              {sub.preferences.platformUpdates && (
                                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                                  Updates
                                </span>
                              )}
                              {sub.preferences.weeklyDigest && (
                                <span className="px-2 py-0.5 rounded-full bg-sky-100 text-sky-700 text-[10px] font-bold">
                                  Digest
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-2.5 px-3 text-slate-500">
                            {new Date(sub.subscribedAt).toLocaleDateString()}
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold text-[11px]">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              Active
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-400 capitalize">
                            {sub.source || 'footer'}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* cPanel SMTP Routing & Live Diagnostics Tab */
        <div className="space-y-6">
          {/* Main Status & Hero Card */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-purple-100 text-purple-800 uppercase tracking-wide">
                    cPanel Outgoing Mail Relay
                  </span>
                  {smtpStatus?.isConfigured ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      Live &amp; Connected
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                      <AlertCircle className="w-3.5 h-3.5" />
                      Simulation Mode (Awaiting cPanel Credentials)
                    </span>
                  )}
                </div>
                <h2 className="text-xl font-extrabold text-slate-900">
                  Outgoing SMTP Server &amp; Website Mail Routing
                </h2>
                <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
                  Send survey notification blasts, welcome emails, and subscriber alerts directly through your custom cPanel web hosting email server (e.g. <code className="bg-slate-100 px-1 py-0.5 rounded text-purple-700 font-mono">alerts@yourdomain.com</code>) without third-party mailer fees.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={fetchSmtpStatus}
                  disabled={isLoadingSmtp}
                  className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingSmtp ? 'animate-spin' : ''}`} />
                  <span>Refresh Status</span>
                </button>

                <button
                  type="button"
                  id="verify-smtp-server-btn"
                  onClick={handleVerifySmtp}
                  disabled={isVerifyingSmtp || !smtpStatus?.isConfigured}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-xs font-bold shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ShieldCheck className={`w-3.5 h-3.5 ${isVerifyingSmtp ? 'animate-spin' : ''}`} />
                  <span>{isVerifyingSmtp ? 'Testing Handshake...' : 'Verify Server Handshake'}</span>
                </button>
              </div>
            </div>

            {/* Handshake Verification Alert */}
            {smtpVerifyMessage && (
              <div
                className={`p-4 rounded-xl border flex items-start gap-3 ${
                  smtpVerifyMessage.ok
                    ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                    : 'bg-red-50/80 border-red-200 text-red-900'
                }`}
              >
                {smtpVerifyMessage.ok ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                )}
                <div className="text-xs space-y-1.5 flex-1">
                  <span className="font-bold block text-sm">
                    {smtpVerifyMessage.ok ? 'Connection Verified' : 'Connection Error'}
                  </span>
                  <div className="leading-relaxed whitespace-pre-line text-xs">{smtpVerifyMessage.text}</div>
                </div>
              </div>
            )}

            {/* DNS Host Not Found Notice if ENOTFOUND is detected */}
            {(smtpStatus?.dnsCheck && !smtpStatus.dnsCheck.resolved) && (
              <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/90 text-amber-950 space-y-2.5">
                <div className="flex items-center gap-2 text-amber-800 font-bold text-xs">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>DNS Lookup Failed: Server "{smtpStatus.host}" Not Found (getaddrinfo ENOTFOUND)</span>
                </div>
                <p className="text-xs leading-relaxed text-amber-900">
                  The hostname <code className="font-mono bg-amber-100 px-1 py-0.5 rounded text-amber-900 font-bold">{smtpStatus.host}</code> does not exist in public DNS or does not have an active mail A record.
                </p>
                <div className="bg-white/80 p-3 rounded-lg border border-amber-200 text-[11px] space-y-1.5 text-slate-800">
                  <strong className="block text-slate-900 font-bold">How to resolve this in cPanel:</strong>
                  <ol className="list-decimal pl-4 space-y-1 text-slate-700">
                    <li>
                      <strong>Check Outgoing Server in cPanel:</strong> Log in to your cPanel hosting &rarr; open <strong>Email Accounts</strong> &rarr; click <strong>Connect Devices</strong> next to your mailbox. Check the <strong>Outgoing Server</strong> name listed in the blue <em>Secure SSL/TLS Settings</em> box. On shared hosting, it is often your server's unique name (e.g. <code className="text-purple-700 font-mono">mail.yourdomain.com</code>, <code className="text-purple-700 font-mono">cp123.webhosting.com</code>, or your server's IP address), not a generic name.
                    </li>
                    <li>
                      <strong>Or use your Server IP:</strong> If your domain DNS does not have a <code className="text-purple-700 font-mono">mail.</code> record, you can set <code className="text-purple-700 font-mono">SMTP_HOST</code> directly to your cPanel server's numeric IP address (e.g. <code className="text-purple-700 font-mono">198.51.100.25</code>) to bypass DNS lookup completely.
                    </li>
                    <li>
                      <strong>Cloudflare DNS:</strong> If your domain is managed on Cloudflare, make sure the <code className="text-purple-700 font-mono">mail</code> subdomain is set to <em>DNS Only (Grey Cloud)</em>, because Cloudflare HTTP Proxy (Orange Cloud) blocks raw SMTP email traffic on standard ports.
                    </li>
                  </ol>
                </div>
              </div>
            )}

            {/* 4 Diagnostic Parameter Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-1">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[11px] font-semibold text-slate-400 block uppercase">SMTP Host / Server</span>
                  {smtpStatus?.dnsCheck ? (
                    smtpStatus.dnsCheck.resolved ? (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                        DNS OK
                      </span>
                    ) : (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-red-100 text-red-800">
                        ENOTFOUND
                      </span>
                    )
                  ) : null}
                </div>
                <span className="text-sm font-mono font-bold text-slate-900 break-all block">
                  {smtpStatus?.host || 'mail.yourdomain.com'}
                </span>
                <span className="text-[10px] text-slate-500 block">
                  {smtpStatus?.dnsCheck?.resolved
                    ? `Resolved IP: ${smtpStatus.dnsCheck.ip}`
                    : 'Outgoing cPanel server'}
                </span>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-1">
                <span className="text-[11px] font-semibold text-slate-400 block uppercase">Port &amp; Security</span>
                <span className="text-sm font-mono font-bold text-slate-900 block">
                  Port {smtpStatus?.port || 465} ({smtpStatus?.secure ? 'SSL/TLS' : 'STARTTLS/Plain'})
                </span>
                <span className="text-[10px] text-slate-500">cPanel standard SSL port</span>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-1">
                <span className="text-[11px] font-semibold text-slate-400 block uppercase">From / Sender Address</span>
                <span className="text-sm font-mono font-bold text-slate-900 break-all block">
                  {smtpStatus?.fromEmail || smtpStatus?.user || 'alerts@yourdomain.com'}
                </span>
                <span className="text-[10px] text-slate-500">Visible address to subscribers</span>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-1">
                <span className="text-[11px] font-semibold text-slate-400 block uppercase">Sender Display Name</span>
                <span className="text-sm font-bold text-slate-900 block truncate">
                  {smtpStatus?.fromName || 'Voice Flow 360'}
                </span>
                <span className="text-[10px] text-slate-500">Branded inbox title</span>
              </div>
            </div>
          </div>

          {/* Test Email Dispatcher & cPanel Guide Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Test Email Dispatcher (5 cols) */}
            <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Send className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Send Test Email</h3>
                  <p className="text-xs text-slate-500">Verify deliverability to your inbox immediately</p>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Target Recipient Address</label>
                  <input
                    type="email"
                    value={testEmailAddress}
                    onChange={(e) => setTestEmailAddress(e.target.value)}
                    placeholder="youremail@example.com"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Dispatches a real HTML email directly through your cPanel SMTP mail server.
                  </p>
                </div>

                {/* Template Mode Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Email Content Mode</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setTestSendType('survey_template')}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        testSendType === 'survey_template'
                          ? 'border-purple-600 bg-purple-50/70 text-purple-950 font-bold ring-1 ring-purple-500/20'
                          : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 text-xs font-bold">
                        <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                        <span>Survey Alert</span>
                      </div>
                      <p className="text-[10px] text-slate-500 font-normal mt-0.5 leading-tight">
                        Real branded template with surveys &amp; bonus coins
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setTestSendType('diagnostic')}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        testSendType === 'diagnostic'
                          ? 'border-purple-600 bg-purple-50/70 text-purple-950 font-bold ring-1 ring-purple-500/20'
                          : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 text-xs font-bold">
                        <Server className="w-3.5 h-3.5 text-slate-600" />
                        <span>Diagnostic Ping</span>
                      </div>
                      <p className="text-[10px] text-slate-500 font-normal mt-0.5 leading-tight">
                        Server handshake &amp; port connection status
                      </p>
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  id="send-smtp-test-email-btn"
                  onClick={handleSendTestEmail}
                  disabled={isSendingTestEmail || !smtpStatus?.isConfigured}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 text-white text-xs font-bold shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Send className={`w-3.5 h-3.5 ${isSendingTestEmail ? 'animate-spin' : ''}`} />
                  <span>
                    {isSendingTestEmail
                      ? 'Relaying via cPanel SMTP...'
                      : testSendType === 'survey_template'
                      ? 'Dispatch Live Survey Template'
                      : 'Dispatch Technical Diagnostic Ping'}
                  </span>
                </button>

                {testEmailFeedback && (
                  <div
                    className={`p-3 rounded-xl border text-xs space-y-1 ${
                      testEmailFeedback.ok
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                        : 'bg-red-50 border-red-200 text-red-900'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold">
                      {testEmailFeedback.ok ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-600 shrink-0" />
                      )}
                      <span>{testEmailFeedback.ok ? 'Delivery Success' : 'Delivery Failed'}</span>
                    </div>
                    <p className="text-[11px] leading-relaxed whitespace-pre-line">{testEmailFeedback.text}</p>
                    {testEmailFeedback.messageId && (
                      <span className="text-[10px] font-mono text-emerald-700 block truncate">
                        Message ID: {testEmailFeedback.messageId}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Right: How to configure Hostinger / cPanel SMTP (7 cols) */}
            <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                    <Key className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Email Setup Instructions</h3>
                    <p className="text-xs text-slate-500">How to find credentials &amp; connect your domain</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Provider toggle */}
                  <div className="inline-flex p-0.5 rounded-lg bg-slate-100 border border-slate-200 text-[11px] font-semibold">
                    <button
                      type="button"
                      onClick={() => setGuideProvider('hostinger')}
                      className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                        guideProvider === 'hostinger'
                          ? 'bg-purple-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Hostinger (hPanel)
                    </button>
                    <button
                      type="button"
                      onClick={() => setGuideProvider('cpanel')}
                      className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                        guideProvider === 'cpanel'
                          ? 'bg-purple-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Standard cPanel
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowSmtpSetupGuide(!showSmtpSetupGuide)}
                    className="text-purple-700 text-xs font-bold inline-flex items-center gap-1 hover:underline cursor-pointer ml-1"
                  >
                    {showSmtpSetupGuide ? 'Less' : 'DNS FAQ'}
                    {showSmtpSetupGuide ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {guideProvider === 'hostinger' ? (
                /* Hostinger Guide */
                <div className="space-y-3 text-xs text-slate-600 pt-1">
                  <div className="p-3.5 rounded-xl border border-purple-200 bg-purple-50/40 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-purple-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0">
                        1
                      </span>
                      <strong className="text-slate-900">Where to find on Hostinger hPanel</strong>
                    </div>
                    <ol className="list-decimal pl-7 text-[11px] text-slate-600 space-y-1">
                      <li>Log in to your <strong>Hostinger hPanel</strong> (hpanel.hostinger.com).</li>
                      <li>Click <strong>Emails</strong> in the navigation menu and select your domain.</li>
                      <li>If you don't have an address yet, click <strong>Create email account</strong> (e.g. <code className="text-purple-700 font-mono">alerts@yourdomain.com</code>) and set a password.</li>
                      <li>Click <strong>Connect Apps &amp; Devices</strong> (or <em>Configuration Settings</em>) to view your SMTP server details.</li>
                    </ol>
                  </div>

                  <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-purple-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0">
                        2
                      </span>
                      <strong className="text-slate-900">Copy these Hostinger Credentials to Settings</strong>
                    </div>
                    <p className="text-[11px] text-slate-500 pl-7">
                      Open the app <strong>Settings</strong> menu and enter these exact variables (replace username &amp; password with yours):
                    </p>
                    <pre className="mt-2 p-2.5 bg-slate-900 text-purple-200 rounded-lg font-mono text-[10px] overflow-x-auto leading-relaxed">
{`SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=alerts@yourdomain.com
SMTP_PASS=YourHostingerEmailPassword!
SMTP_FROM_NAME="Voice Flow 360"
SMTP_FROM_EMAIL=alerts@yourdomain.com`}
                    </pre>
                  </div>

                  <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0">
                        ✓
                      </span>
                      <strong className="text-emerald-950">Do I need to add DNS records?</strong>
                    </div>
                    <p className="text-[11px] text-emerald-900 pl-7 leading-relaxed">
                      <strong>Usually NO:</strong> If your domain is hosted on Hostinger (using Hostinger nameservers), Hostinger <em>automatically</em> sets up all necessary MX, SPF, and DKIM records for your domain the moment you create your mailbox. You do <strong>not</strong> need to create any custom <code className="text-emerald-950 font-mono font-bold">mail.</code> record, because Hostinger handles outgoing email through <code className="text-emerald-950 font-mono font-bold">smtp.hostinger.com</code>.
                    </p>
                  </div>

                  {showSmtpSetupGuide && (
                    <div className="p-3.5 rounded-xl border border-indigo-100 bg-indigo-50/50 space-y-2">
                      <h4 className="font-bold text-indigo-950 flex items-center gap-1.5 text-xs">
                        <ShieldCheck className="w-4 h-4 text-indigo-600" />
                        Hostinger External DNS Settings (Only if domain uses Cloudflare / other DNS)
                      </h4>
                      <p className="text-[11px] text-indigo-900 leading-relaxed">
                        If your domain points to Cloudflare or another DNS manager instead of Hostinger nameservers, add these records in your DNS manager:
                      </p>
                      <ul className="list-disc pl-5 text-[11px] text-indigo-900 space-y-1 font-mono">
                        <li>MX: mx1.hostinger.com (Priority 5)</li>
                        <li>MX: mx2.hostinger.com (Priority 10)</li>
                        <li>TXT: v=spf1 include:_netblocks.hostinger.com ~all</li>
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                /* cPanel Guide */
                <div className="space-y-3 text-xs text-slate-600 pt-1">
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-purple-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0">
                        1
                      </span>
                      <strong className="text-slate-900">Create Email Account in cPanel</strong>
                    </div>
                    <p className="text-[11px] text-slate-500 pl-7">
                      Log in to your cPanel dashboard &rarr; click <strong>Email Accounts</strong> &rarr; click <strong>+ Create</strong>. Enter an address like <code className="text-purple-700 font-mono">alerts@yourdomain.com</code> and choose a strong password.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-purple-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0">
                        2
                      </span>
                      <strong className="text-slate-900">Get Mail Client Settings</strong>
                    </div>
                    <p className="text-[11px] text-slate-500 pl-7">
                      Next to your email account in cPanel, click <strong>Connect Devices</strong>. Copy the <strong>Outgoing Server</strong> (e.g. <code className="text-purple-700 font-mono">mail.yourdomain.com</code>) and <strong>SMTP Port 465 (SSL)</strong> or <strong>587 (TLS)</strong>.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-purple-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0">
                        3
                      </span>
                      <strong className="text-slate-900">Add Environment Variables in Settings</strong>
                    </div>
                    <p className="text-[11px] text-slate-500 pl-7">
                      Add the following variables in the application Settings menu:
                    </p>
                    <pre className="mt-2 p-2.5 bg-slate-900 text-purple-200 rounded-lg font-mono text-[10px] overflow-x-auto">
{`SMTP_HOST=mail.yourdomain.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=alerts@yourdomain.com
SMTP_PASS=YourEmailPasswordHere!
SMTP_FROM_NAME="Voice Flow 360"
SMTP_FROM_EMAIL=alerts@yourdomain.com`}
                    </pre>
                  </div>

                  {showSmtpSetupGuide && (
                    <div className="p-3.5 rounded-xl border border-indigo-100 bg-indigo-50/40 space-y-2">
                      <h4 className="font-bold text-indigo-950 flex items-center gap-1.5 text-xs">
                        <ShieldCheck className="w-4 h-4 text-indigo-600" />
                        Email Deliverability &amp; Avoiding Spam Folders
                      </h4>
                      <ul className="list-disc pl-5 text-[11px] text-indigo-900 space-y-1">
                        <li>
                          <strong>SPF Record:</strong> In cPanel, navigate to <strong>Email Deliverability</strong> and ensure the status is <em>Valid</em>.
                        </li>
                        <li>
                          <strong>DKIM Key:</strong> cPanel can automatically sign outgoing messages with 2048-bit DKIM keys. Click <em>Install Suggested Record</em> if prompted.
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Dispatch Progress & Success Modal */}
      {isDispatching && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 space-y-5 animate-in fade-in zoom-in-95">
            {!dispatchSuccessData ? (
              <>
                <div className="w-14 h-14 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center mx-auto">
                  <Send className="w-7 h-7 animate-pulse" />
                </div>
                <div className="text-center space-y-1">
                  <h3 className="text-lg font-bold text-slate-900">Dispatching Batch Survey Email</h3>
                  <p className="text-xs text-slate-500">{dispatchStatusText}</p>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1.5">
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-600 to-indigo-600 transition-all duration-300 ease-out"
                      style={{ width: `${dispatchProgress}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] font-bold text-slate-500">
                    <span>Transmitting payload</span>
                    <span>{dispatchProgress}%</span>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div className="text-center space-y-1">
                  <h3 className="text-lg font-bold text-slate-900">Batch Email Successfully Sent!</h3>
                  <p className="text-xs text-slate-500">
                    Survey alert delivered to <strong>{dispatchSuccessData.recipientCount} listed members</strong>.
                  </p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5 text-slate-600">
                  <div className="flex justify-between">
                    <span>Delivered successfully:</span>
                    <strong className="text-emerald-700">{dispatchSuccessData.stats.deliveredCount}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Featured surveys:</span>
                    <strong className="text-purple-700">{dispatchSuccessData.featuredSurveyIds.length}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>In-app notifications sent:</span>
                    <strong className="text-slate-900">
                      {dispatchSuccessData.sendInAppNotification ? 'Yes (All Recipients)' : 'No'}
                    </strong>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsDispatching(false);
                      setDispatchSuccessData(null);
                      setActiveTab('history');
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
                  >
                    View Campaign in History
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Historical Campaign Detail Modal */}
      {viewingCampaign && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl border border-slate-100 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-purple-600" />
                <h3 className="text-base font-bold text-slate-900">Campaign Details</h3>
              </div>
              <button
                type="button"
                onClick={() => setViewingCampaign(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Subject Line</span>
                <span className="font-bold text-slate-900 text-sm">{viewingCampaign.subject}</span>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-400 block text-[10px]">Audience Target</span>
                  <span className="font-bold text-slate-800 capitalize">
                    {viewingCampaign.targetAudience.replace('_', ' ')}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Total Recipients</span>
                  <span className="font-bold text-purple-700">{viewingCampaign.recipientCount} listed users</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Estimated Open Rate</span>
                  <span className="font-bold text-emerald-700">
                    {viewingCampaign.stats.openRateEstimatedPercent}%
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Estimated Click-to-Survey</span>
                  <span className="font-bold text-emerald-700">
                    {viewingCampaign.stats.clickRateEstimatedPercent}%
                  </span>
                </div>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold mb-1">Headline &amp; Body</span>
                <h4 className="font-bold text-slate-900 text-xs">{viewingCampaign.headline}</h4>
                <p className="text-slate-600 mt-1 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  {viewingCampaign.introMessage}
                </p>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold mb-1">
                  Surveys Included ({viewingCampaign.featuredSurveyIds.length})
                </span>
                <div className="space-y-1">
                  {viewingCampaign.featuredSurveyIds.map((sId) => {
                    const found = campaigns.find((c) => c.id === sId);
                    return (
                      <div
                        key={sId}
                        className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100 text-[11px]"
                      >
                        <span className="font-bold text-slate-800">{found?.title || `Survey ID: ${sId}`}</span>
                        <span className="text-amber-600 font-bold">+{found?.rewardCoins || 100} Coins</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setViewingCampaign(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
