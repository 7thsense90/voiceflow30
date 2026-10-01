import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Campaign, CampaignCategory } from '../types';
import { SurveyQualityCooldownBanner } from './SurveyQualityCooldownBanner';
import { SEOHead } from './SEOHead';
import { AdsterraNativeBanner } from './AdsterraNativeBanner';
import { AuthModal } from './AuthModal';
import { createPortal } from 'react-dom';
import {
  Coins,
  Clock,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Search,
  Flame,
  Award,
  Zap,
  Gift,
  HelpCircle,
  FileQuestion,
  BookOpen,
  TrendingUp,
  ChevronRight,
  Layers,
  ArrowUpRight,
  Copy,
  Check,
  Share2,
  Calendar,
  ShieldCheck,
  Wallet,
  Info,
  Shuffle,
  Play,
} from 'lucide-react';

export const CustomerDashboard: React.FC = () => {
  const [authGateMode, setAuthGateMode] = useState<'login' | 'register' | null>(null);
  const {
    currentUser,
    campaigns,
    responses,
    settings,
    startChat,
    setCurrentView,
    hasUserCompletedCampaign,
    brands,
    showToast,
    processMonthlyWalletTransfer,
    isSurveyLimitReached,
    setIsSurveyCooldownModalOpen,
  } = useApp();

  const [copiedCode, setCopiedCode] = useState(false);

  // Strictly enforce that if signed in with an admin user, they are redirected to Admin Dashboard
  useEffect(() => {
    if (currentUser?.role === 'admin') {
      setCurrentView('admin');
    }
  }, [currentUser, setCurrentView]);

  // 4-hour countdown timer
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const nextFourHour = new Date(now);
      const hours = now.getHours();
      const nextBlock = Math.ceil((hours + 1) / 4) * 4;
      nextFourHour.setHours(nextBlock, 0, 0, 0);
      
      let diff = nextFourHour.getTime() - now.getTime();
      if (diff <= 0) {
        diff = 4 * 60 * 60 * 1000;
      }
      setTimeLeft(diff);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const userResponses = currentUser
    ? responses.filter((r) => r.userId === currentUser.id)
    : [];

  const completedCount = userResponses.length;

  // STRICTLY filter out completed surveys so customers never see tasks they already finished!
  const availableSurveys = campaigns.filter(
    (c) => c.status === 'active' && !(currentUser && hasUserCompletedCampaign(currentUser.id, c.id))
  );

  const availableQuizzes = campaigns.filter(
    (c) => c.status === 'active' && c.category === 'quizzes' && !(currentUser && hasUserCompletedCampaign(currentUser.id, c.id))
  );

  // Dynamic shuffle order seed map for available surveys
  const [shuffleSeedMap, setShuffleSeedMap] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    campaigns.forEach((c) => {
      initial[c.id] = Math.random();
    });
    return initial;
  });
  const [isShuffling, setIsShuffling] = useState(false);

  const handleShuffleSurveys = () => {
    setIsShuffling(true);
    const nextMap: Record<string, number> = {};
    campaigns.forEach((c) => {
      nextMap[c.id] = Math.random();
    });
    setShuffleSeedMap(nextMap);
    setTimeout(() => setIsShuffling(false), 500);
    showToast('Surveys shuffled! Fresh mix of available work ready.', 'success');
  };

  // Shuffled available surveys (guaranteed uncompleted)
  const shuffledAvailableSurveys = [...availableSurveys].sort(
    (a, b) => (shuffleSeedMap[a.id] ?? 0.5) - (shuffleSeedMap[b.id] ?? 0.5)
  );

  // Next recommended survey to work on
  const nextWorkSurvey = shuffledAvailableSurveys[0] || null;

  const handleStartSurvey = (survey: Campaign) => {
    if (isSurveyLimitReached) {
      setIsSurveyCooldownModalOpen(true);
    } else {
      startChat(survey);
    }
  };

  const totalEarnedCoins = currentUser ? currentUser.totalEarned : 0;
  const currentCoinBalance = currentUser ? currentUser.coinBalance : 0;
  const pendingSurveyCoins = currentUser?.surveyCoinsPendingReview || 0;
  const redeemableCoins = currentUser?.redeemableCoinBalance ?? Math.max(0, currentCoinBalance - pendingSurveyCoins);

  const pendingSurveyUsd = (pendingSurveyCoins * settings.coinToUsdRate).toFixed(2);
  const redeemableUsd = (redeemableCoins * settings.coinToUsdRate).toFixed(2);

  // 1st of the month schedule calculation
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const nextMonthName = nextMonth.toLocaleDateString(undefined, { month: 'long', day: 'numeric' });
  const daysUntilFirst = Math.max(1, Math.ceil((nextMonth.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

  // Daily Earning Check
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const dailyEarned = currentUser
    ? userResponses
        .filter((r) => new Date(r.completedAt) > oneDayAgo)
        .reduce((sum, r) => sum + r.coinsAwarded, 0)
    : 0;

  const hasReachedDailyLimit = dailyEarned >= 1000;

  // Top spotlight campaign
  const spotlightCampaign =
    availableSurveys.length > 0
      ? availableSurveys.reduce((max, c) => (c.rewardCoins > max.rewardCoins ? c : max), availableSurveys[0])
      : campaigns[0];

  // Recent completed activities for user or platform
  const recentActivities = userResponses.slice(0, 5);

  if (!currentUser) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center py-12 px-4 min-h-[calc(100vh-12rem)]">
        <div className="w-full max-w-md">
          <AuthModal initialMode="login" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-7 pb-8">
      <SEOHead
        title="Brand Research Studies & Participant Dashboard | Voice Flow 360"
        description="Participate in studies and earn rewards. Access live consumer research questionnaires, trivia polls, and honorarium coin balances."
        keywords={[
          'brand research studies',
          'participate in studies',
          'daily paid tasks',
          'share feedback earn rewards',
          'active surveys feed',
          'research dashboard',
        ]}
        canonicalPath="/start-earning"
      />

      {/* Customer View Navigation Switcher: Active Tasks vs My Earnings (New Tab) */}
      <div className="bg-white rounded-2xl p-1.5 border border-slate-200 shadow-2xs flex flex-col sm:flex-row gap-2">
        <button
          id="tab-switcher-surveys"
          onClick={() => setCurrentView('dashboard')}
          className="flex-1 py-2.5 px-3 sm:px-4 rounded-xl text-xs font-black bg-slate-900 text-white shadow-xs flex items-center justify-center gap-2 cursor-pointer"
        >
          <FileQuestion className="w-4 h-4 text-purple-400 shrink-0" />
          <span>Active Studies &amp; Tasks</span>
        </button>

        <button
          id="tab-switcher-earnings"
          onClick={() => setCurrentView('earnings')}
          className="flex-1 py-2.5 px-3 sm:px-4 rounded-xl text-xs font-black bg-slate-50 hover:bg-amber-50 text-slate-700 hover:text-amber-950 border border-slate-200/80 hover:border-amber-300 transition-all flex items-center justify-center gap-2 cursor-pointer group"
        >
          <Coins className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform shrink-0" />
          <span>Participation and Rewards</span>
          <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-black uppercase tracking-wider shrink-0">
            Statement
          </span>
        </button>
      </div>

      {/* 1. Welcome Back Header Card */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-5 sm:gap-6 relative overflow-hidden">
        <div className="flex items-start gap-3.5 sm:gap-4">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-purple-500/20">
            <TrendingUp className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.5]" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px] sm:text-[11px] font-extrabold mb-1.5">
              <Sparkles className="w-3 h-3 shrink-0" />
              <span>Voice Flow 360 • Research Studies Portal</span>
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
              {currentUser ? `Welcome Back, ${currentUser.name.split(' ')[0]}!` : 'Be a Part of Brand Research Studies'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-xl font-medium leading-relaxed">
              Share your honest consumer perspective in brand research studies, test your knowledge in trivia drops, and earn honorarium coin rewards for your time.
            </p>
          </div>
        </div>

        {/* Live Drop Countdown Badge */}
        <div className="bg-gradient-to-r from-purple-50 via-slate-50 to-indigo-50 rounded-2xl p-4 border border-purple-200/60 shrink-0 text-left sm:text-right w-full sm:w-auto">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-800 uppercase tracking-wider">
            <Clock className="w-3.5 h-3.5" />
            <span>Next Survey Drop</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-purple-900 tracking-tight tabular-nums mt-0.5">
            {formatTime(timeLeft)}
          </div>
          <span className="text-[11px] text-slate-500 block">Fresh feedback opportunities refresh</span>
        </div>
      </div>

      {/* 12-Hour Survey Quality Cooldown Banner (Rendered strictly ONLY when 5 surveys are completed!) */}
      <SurveyQualityCooldownBanner />

      {/* 🚀 QUICK WORK HUB: Where to Start Working (High Contrast, Unmissable for Customers) */}
      <div
        id="start-working-now-hub"
        className="bg-gradient-to-br from-purple-900 via-indigo-900 to-slate-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl border-2 border-purple-500/30 relative overflow-hidden"
      >
        {/* Background decorative subtle glows */}
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3 flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-400 to-amber-300 text-slate-950 text-xs font-black uppercase tracking-wider shadow-sm">
                <Sparkles className="w-3.5 h-3.5 fill-slate-950" />
                <span>Join a Research Study</span>
              </span>
              <span className="inline-flex items-center gap-1 text-xs text-purple-200 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Only Uncompleted Studies Shown</span>
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
              {nextWorkSurvey
                ? 'Be a Part of Brand Research Studies & Earn Rewards'
                : 'All Studies Completed! Check Back Soon'}
            </h2>

            <p className="text-sm text-purple-100/90 max-w-2xl leading-relaxed">
              {nextWorkSurvey
                ? 'Contribute your genuine consumer feedback to active brand research studies, review sponsor highlights, and receive honorarium coins credited to your wallet balance!'
                : 'You have completed all currently active studies! Great job! Fresh research studies drop regularly, or you can invite friends for +300 coin referral rewards.'}
            </p>

            {/* 3-Step Simple Beginner Flow */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 max-w-2xl">
              <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-3 border border-white/10 flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-purple-400/30 text-purple-200 font-black text-xs flex items-center justify-center shrink-0">
                  1
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-extrabold text-white">Choose Study</div>
                  <div className="text-[10px] text-purple-200 truncate">Pick uncompleted study</div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-3 border border-white/10 flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-purple-400/30 text-purple-200 font-black text-xs flex items-center justify-center shrink-0">
                  2
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-extrabold text-white">Give Feedback</div>
                  <div className="text-[10px] text-purple-200 truncate">3–5 quick questions</div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-3 border border-white/10 flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center shrink-0">
                  3
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-extrabold text-white">Earn Rewards</div>
                  <div className="text-[10px] text-amber-300 truncate">Participate in studies &amp; earn rewards</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Action / Top Recommended Box */}
          {nextWorkSurvey && (
            <div className="w-full lg:w-96 bg-white/10 backdrop-blur-md rounded-3xl p-5 border border-white/20 shrink-0 space-y-4 shadow-lg">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-purple-400/20 text-purple-200 border border-purple-300/30">
                  Next Recommended Study
                </span>
                <button
                  id="hub-shuffle-btn"
                  onClick={handleShuffleSurveys}
                  className="text-xs text-amber-300 hover:text-amber-200 font-bold flex items-center gap-1.5 transition-colors cursor-pointer group"
                  title="Shuffle to see another survey"
                >
                  <Shuffle className={`w-3.5 h-3.5 ${isShuffling ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-300'}`} />
                  <span>Shuffle</span>
                </button>
              </div>

              <div>
                <h3 className="font-black text-white text-base leading-snug line-clamp-2">
                  {nextWorkSurvey.title}
                </h3>
                <div className="flex items-center gap-3 text-xs text-purple-200 font-medium mt-1.5">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-purple-300" />
                    ~{nextWorkSurvey.estimatedMinutes} min
                  </span>
                  <span>•</span>
                  <span>{nextWorkSurvey.questions.length} Questions</span>
                  <span>•</span>
                  <span className="capitalize">{nextWorkSurvey.category.replace('_', ' ')}</span>
                </div>
              </div>

              {/* Reward Highlights */}
              <div className="bg-white/10 rounded-2xl p-3 flex items-center justify-between">
                <span className="text-xs font-semibold text-purple-200">Research Honorarium:</span>
                <div className="flex items-center gap-1.5">
                  <Coins className="w-4 h-4 text-amber-400" />
                  <span className="text-base font-black text-amber-300">+{nextWorkSurvey.rewardCoins} Coins</span>
                  <span className="text-xs text-purple-200 font-bold">
                    Reward Credits
                  </span>
                </div>
              </div>

              {/* Primary Action Button */}
              <button
                id="hub-start-working-now-btn"
                onClick={() => handleStartSurvey(nextWorkSurvey)}
                className="w-full py-3.5 px-5 bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black text-sm rounded-2xl shadow-lg shadow-amber-400/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <Play className="w-4 h-4 fill-slate-950" />
                <span>Join Research Study (1-Click)</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 2. Metric Summary Row (Pillowy soft-tinted cards matching screenshot) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Card 1: Surveys (Lavender) */}
        <div
          onClick={() => setCurrentView('surveys')}
          className="bg-[#EAE4F8] hover:bg-[#E2DBF5] rounded-3xl p-6 transition-all duration-200 cursor-pointer shadow-2xs group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-[#5B3E96] uppercase tracking-wider">
              Surveys
            </span>
            <div className="w-10 h-10 rounded-2xl bg-white/70 text-[#5B3E96] flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
              <FileQuestion className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-[#321C61] tracking-tight">
              {availableSurveys.length}
            </div>
            <p className="text-xs font-semibold text-[#5B3E96]/80 mt-1">
              Active surveys ready
            </p>
          </div>
        </div>

        {/* Card 2: Quizzes (Sky Blue) */}
        <div
          onClick={() => setCurrentView('quizzes')}
          className="bg-[#DCEEFB] hover:bg-[#D1E8FA] rounded-3xl p-6 transition-all duration-200 cursor-pointer shadow-2xs group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-[#1B6194] uppercase tracking-wider">
              Quizzes
            </span>
            <div className="w-10 h-10 rounded-2xl bg-white/70 text-[#1B6194] flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
              <HelpCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-[#103E61] tracking-tight">
              {availableQuizzes.length}
            </div>
            <p className="text-xs font-semibold text-[#1B6194]/80 mt-1">
              Trivia &amp; knowledge tests
            </p>
          </div>
        </div>

        {/* Card 3: Activities / Completed (Sage/Emerald Green) */}
        <div
          onClick={() => setCurrentView('activities')}
          className="bg-[#DCF5E8] hover:bg-[#D0F0DE] rounded-3xl p-6 transition-all duration-200 cursor-pointer shadow-2xs group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-[#196B3E] uppercase tracking-wider">
              Completed
            </span>
            <div className="w-10 h-10 rounded-2xl bg-white/70 text-[#196B3E] flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-[#0D4425] tracking-tight">
              {completedCount}
            </div>
            <p className="text-xs font-semibold text-[#196B3E]/80 mt-1">
              Feedback submissions
            </p>
          </div>
        </div>

        {/* Card 4: Participation and Rewards Tab (Warm Peach/Gold) */}
        <div
          id="dashboard-card-earnings-link"
          onClick={() => setCurrentView('earnings')}
          className="bg-[#FEF3D6] hover:bg-[#FDECBF] rounded-3xl p-6 transition-all duration-200 cursor-pointer shadow-2xs group flex flex-col justify-between border border-amber-200/50"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-[#8F590A] uppercase tracking-wider">
              Participation and Rewards
            </span>
            <div className="w-10 h-10 rounded-2xl bg-white/70 text-[#8F590A] flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
              <Coins className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-[#5C3702] tracking-tight">
              {currentCoinBalance.toLocaleString()}{' '}
              <span className="text-xs font-bold text-[#8F590A]">Coins</span>
            </div>
            <p className="text-xs font-semibold text-[#8F590A]/90 mt-1 flex items-center justify-between">
              <span>Total Rewards Earned</span>
              <span className="text-[11px] font-bold text-[#8F590A] group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                View Statement <ArrowRight className="w-3 h-3" />
              </span>
            </p>
            <div className="mt-2 pt-2 border-t border-[#8F590A]/20 text-[11px] font-medium text-[#8F590A]">
              Audit by 1st of month • Redeemable after audit
            </div>
          </div>
        </div>
      </div>

      {/* 3. Quick Actions Row (4 pastel action cards matching screenshot) */}
      <div className="space-y-3">
        <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
          Quick Actions
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Action 1: Study Flashcards / Take Surveys */}
          <button
            onClick={() => setCurrentView('surveys')}
            className="bg-[#F0EBFA] hover:bg-[#E6DCF8] border border-purple-200/50 rounded-2xl p-4 text-left transition-all group cursor-pointer flex items-center gap-3.5 shadow-2xs"
          >
            <div className="w-11 h-11 rounded-2xl bg-white text-purple-700 flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
              <FileQuestion className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs font-bold text-slate-900 truncate">
                Study &amp; Surveys
              </h3>
              <p className="text-[11px] text-purple-900/70 truncate mt-0.5">
                Review products &amp; services
              </p>
            </div>
          </button>

          {/* Action 2: Take a Quiz */}
          <button
            onClick={() => setCurrentView('quizzes')}
            className="bg-[#E5F2FC] hover:bg-[#D5E9FA] border border-sky-200/50 rounded-2xl p-4 text-left transition-all group cursor-pointer flex items-center gap-3.5 shadow-2xs"
          >
            <div className="w-11 h-11 rounded-2xl bg-white text-sky-700 flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs font-bold text-slate-900 truncate">
                Take a Quiz
              </h3>
              <p className="text-[11px] text-sky-900/70 truncate mt-0.5">
                Test your knowledge
              </p>
            </div>
          </button>

          {/* Action 3: Practice Skills / Daily Spotlight */}
          <button
            onClick={() => {
              if (spotlightCampaign) {
                startChat(spotlightCampaign);
              } else {
                setCurrentView('surveys');
              }
            }}
            className="bg-[#FDE8EE] hover:bg-[#FCD8E3] border border-pink-200/50 rounded-2xl p-4 text-left transition-all group cursor-pointer flex items-center gap-3.5 shadow-2xs"
          >
            <div className="w-11 h-11 rounded-2xl bg-white text-pink-700 flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs font-bold text-slate-900 truncate">
                Practice Skills
              </h3>
              <p className="text-[11px] text-pink-900/70 truncate mt-0.5">
                High-yield coin bounty
              </p>
            </div>
          </button>

          {/* Action 4: My Earnings & Payouts */}
          <button
            id="quick-action-earnings-btn"
            onClick={() => setCurrentView('earnings')}
            className="bg-[#FEF6E4] hover:bg-[#FDEEC9] border border-amber-200/50 rounded-2xl p-4 text-left transition-all group cursor-pointer flex items-center gap-3.5 shadow-2xs"
          >
            <div className="w-11 h-11 rounded-2xl bg-white text-amber-700 flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
              <Coins className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs font-bold text-slate-900 truncate">
                My Earnings &amp; Payouts
              </h3>
              <p className="text-[11px] text-amber-900/70 truncate mt-0.5">
                Wallet, review &amp; cashouts
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* 4. Daily Spotlight Banner (if active) */}
      {spotlightCampaign && !(currentUser && hasUserCompletedCampaign(currentUser.id, spotlightCampaign.id)) && (
        <div className="bg-gradient-to-r from-purple-50 via-indigo-50/70 to-pink-50 rounded-3xl border border-purple-200/80 p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-purple-500/20">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-purple-800 bg-purple-100 px-2 py-0.5 rounded-md">
                  Featured Spotlight
                </span>
                <span className="text-xs font-extrabold text-amber-800 bg-amber-100/90 px-2 py-0.5 rounded-md">
                  +{spotlightCampaign.rewardCoins} Coins Bounty
                </span>
              </div>
              <h3 className="font-extrabold text-slate-900 text-base mt-1">
                {spotlightCampaign.title}
              </h3>
              <p className="text-xs text-slate-600 line-clamp-1 mt-0.5 max-w-xl">
                {spotlightCampaign.description}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              if (isSurveyLimitReached) {
                setIsSurveyCooldownModalOpen(true);
              } else {
                startChat(spotlightCampaign);
              }
            }}
            className="w-full sm:w-auto px-5 py-2.5 bg-slate-900 hover:bg-purple-700 text-white font-bold text-xs rounded-2xl shadow-xs transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
          >
            <span>
              {isSurveyLimitReached
                ? 'Daily Limit Reached • Invite Friends'
                : `Start Chat (${spotlightCampaign.estimatedMinutes} mins)`}
            </span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Centralized Earning & Payout Card - Transferred to dedicated new tab */}
      <div id="dashboard-earnings-tab-banner" className="bg-gradient-to-r from-amber-50 via-yellow-50/60 to-orange-50/70 border border-amber-200/90 rounded-3xl p-6 sm:p-7 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-500 text-slate-950 flex items-center justify-center font-black shrink-0 shadow-md shadow-amber-400/20">
            <Coins className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                Customer Earnings &amp; Payouts
              </h2>
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300/80">
                Dedicated Tab
              </span>
            </div>
            <p className="text-xs text-slate-600 max-w-xl font-medium leading-relaxed">
              All reward summaries, pending quality review queue, redeemable coin balance, bank transfer requests, crypto cashouts, and transaction history are centralized in your new tab. Participate in studies and earn rewards.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto shrink-0">
          <div className="bg-white/90 border border-amber-200/80 rounded-2xl px-4 py-2 text-center sm:text-left">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Redeemable Now</div>
            <div className="text-sm font-black text-emerald-700">{redeemableCoins.toLocaleString()} Coins</div>
          </div>
          <button
            id="dash-open-earnings-tab-btn"
            onClick={() => setCurrentView('earnings')}
            className="py-3 px-5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-2xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            <span>View Earnings &amp; Payouts</span>
            <ArrowRight className="w-4 h-4 text-amber-400" />
          </button>
        </div>
      </div>

      {/* Referral Earning Tab Pointer Banner */}
      {currentUser && (
        <div
          id="dash-referral-tab-banner"
          className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 rounded-3xl p-6 text-white shadow-lg border border-purple-800/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-5"
        >
          <div className="space-y-1.5 max-w-xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-300/30 text-[11px] font-extrabold uppercase tracking-wider">
              <Gift className="w-3.5 h-3.5 text-amber-400" />
              <span>Referral Program</span>
            </div>
            <h3 className="text-lg sm:text-xl font-black tracking-tight">
              Earn <span className="text-amber-300">300 Coins</span> For Every Friend Who Joins!
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Share your invite link. When friends complete their first research study, you both receive 300 bonus coins credited automatically. Participate in studies and earn rewards.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
            <button
              id="dash-open-referral-hub-btn"
              onClick={() => setCurrentView('referrals')}
              className="w-full sm:w-auto px-5 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <Gift className="w-4 h-4 text-slate-950" />
              <span>Open Referral Program</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* 5. Available Surveys to Work On (Strictly uncompleted surveys, dynamically shuffled) */}
      <div className="space-y-3.5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                Available Research Studies
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[11px] font-black">
                {shuffledAvailableSurveys.length} Ready
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Choose any active study below to participate and share feedback. Completed studies are hidden automatically.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="dashboard-shuffle-list-btn"
              onClick={handleShuffleSurveys}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-900 font-extrabold text-xs rounded-xl shadow-2xs transition-all cursor-pointer group"
              title="Shuffle the list of available studies"
            >
              <Shuffle className={`w-3.5 h-3.5 text-purple-600 transition-transform duration-300 ${isShuffling ? 'animate-spin' : 'group-hover:rotate-180'}`} />
              <span>Shuffle Studies</span>
            </button>

            <button
              onClick={() => setCurrentView('surveys')}
              className="text-xs font-bold text-purple-700 hover:text-purple-900 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>View all</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {shuffledAvailableSurveys.length === 0 ? (
          /* All Surveys Completed State */
          <div className="text-center py-12 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-inner">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h3 className="text-base font-black text-slate-900">
              All Available Studies Completed! 🎉
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto leading-relaxed">
              You have completed every currently active study. Fantastic job! The next study drop refreshes in <strong className="text-purple-700 tabular-nums">{formatTime(timeLeft)}</strong>.
            </p>
            <div className="pt-4 flex flex-wrap items-center justify-center gap-2.5">
              <button
                onClick={() => setCurrentView('quizzes')}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Take Trivia Quizzes
              </button>
              <button
                onClick={() => setCurrentView('referrals')}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Gift className="w-3.5 h-3.5" />
                <span>Invite Friends (+300 Coins)</span>
              </button>
            </div>
          </div>
        ) : (
          /* Available Uncompleted Survey List */
          <div className="space-y-2.5">
            {shuffledAvailableSurveys.slice(0, 6).map((camp, idx) => {
              const bgColors = [
                'bg-purple-50 text-purple-700',
                'bg-sky-50 text-sky-700',
                'bg-emerald-50 text-emerald-700',
                'bg-pink-50 text-pink-700',
              ];

              return (
                <div
                  key={camp.id}
                  onClick={() => handleStartSurvey(camp)}
                  className="bg-white hover:bg-purple-50/40 rounded-2xl border border-slate-200/80 hover:border-purple-300/80 p-3.5 sm:p-4 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 cursor-pointer shadow-2xs group"
                >
                  <div className="flex items-center gap-3 sm:gap-3.5 min-w-0 w-full sm:w-auto">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                        bgColors[idx % bgColors.length]
                      } group-hover:scale-105 transition-transform`}
                    >
                      {camp.category === 'quizzes' ? (
                        <BookOpen className="w-5 h-5" />
                      ) : (
                        <FileQuestion className="w-5 h-5" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-bold text-slate-900 truncate group-hover:text-purple-900 transition-colors">
                        {camp.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>~{camp.estimatedMinutes} min</span>
                        </span>
                        <span>•</span>
                        <span>{camp.questions.length} questions</span>
                        <span>•</span>
                        <span className="capitalize">{camp.category.replace('_', ' ')}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto pt-2.5 sm:pt-0 border-t sm:border-t-0 border-slate-100 shrink-0">
                    <div className="text-xs font-extrabold text-amber-900 bg-amber-50 border border-amber-200/80 px-2.5 py-1 rounded-full">
                      +{camp.rewardCoins} Coins
                    </div>
                    {isSurveyLimitReached ? (
                      <span className="text-xs font-bold text-amber-800 bg-amber-100/90 px-3 py-1.5 rounded-full flex items-center gap-1 group-hover:bg-amber-200 transition-colors">
                        Invite to Earn →
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-white bg-purple-600 group-hover:bg-purple-700 px-3 py-1.5 rounded-xl shadow-2xs transition-all flex items-center gap-1 group-hover:translate-x-0.5">
                        <span>Join Study</span>
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 6. Completed Activity History (Rendered strictly when user has finished activities) */}
      {recentActivities.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
              Your Completed Activities ({completedCount})
            </h2>
            <button
              onClick={() => setCurrentView('profile')}
              className="text-xs font-bold text-purple-700 hover:text-purple-900 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>View full log</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {recentActivities.map((resp) => {
              const dateStr = new Date(resp.completedAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
              });

              return (
                <div
                  key={resp.id}
                  className="bg-white rounded-2xl border border-slate-200/80 p-3.5 transition-all flex items-center justify-between gap-4 shadow-2xs"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-slate-900 truncate">
                        {resp.campaignTitle}
                      </h4>
                      <p className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>Completed {dateStr}</span>
                        <span>•</span>
                        <span className="capitalize">{resp.category.replace('_', ' ')}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full flex items-center gap-1">
                      <Coins className="w-3.5 h-3.5 text-amber-500" />
                      <span>+{resp.coinsAwarded} Coins Earned</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Dedicated Sponsored Partner Native Banner - Placed at page bottom with generous separation from user CTAs */}
      <div className="pt-4 mt-4 border-t border-slate-200/60">
        <AdsterraNativeBanner
          label="Sponsored Partner Deals & Extra Opportunities"
          variant="card"
        />
      </div>
    </div>
  );
};
