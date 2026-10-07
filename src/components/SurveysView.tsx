import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Campaign, CampaignCategory } from '../types';
import { SurveyQualityCooldownBanner } from './SurveyQualityCooldownBanner';
import { SEOHead } from './SEOHead';
import { AuthModal } from './AuthModal';
import {
  FileQuestion,
  Search,
  Filter,
  Coins,
  Clock,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  HelpCircle,
  TrendingUp,
  Tag,
  Building2,
  SlidersHorizontal,
  UserPlus,
  Share2,
  Shuffle,
  Play,
  Check,
} from 'lucide-react';

const CATEGORIES: { id: 'all' | CampaignCategory; label: string }[] = [
  { id: 'all', label: 'All Surveys & Quizzes' },
  { id: 'products', label: 'Products' },
  { id: 'services', label: 'Services' },
  { id: 'quizzes', label: 'Trivia & Quizzes' },
  { id: 'social_media', label: 'Social Media' },
  { id: 'market_research', label: 'Market Research' },
  { id: 'quick_questions', label: 'Quick Questions' },
];

export const SurveysView: React.FC = () => {
  const {
    currentUser,
    campaigns,
    responses,
    startChat,
    hasUserCompletedCampaign,
    brands,
    setCurrentView,
    currentView,
    isSurveyLimitReached,
    setIsSurveyCooldownModalOpen,
    dailySurveysCompletedCount,
    dailySurveysLimit,
    showToast,
    settings,
  } = useApp();

  // Strictly nothing visible to unauthenticated customers
  if (!currentUser) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center py-12 px-4 min-h-[calc(100vh-12rem)]">
        <div className="w-full max-w-md">
          <AuthModal initialMode="login" />
        </div>
      </div>
    );
  }

  const [selectedCategory, setSelectedCategory] = useState<'all' | CampaignCategory>(
    currentView === 'quizzes' ? 'quizzes' : 'all'
  );
  // Default to 'available' so completed surveys are NEVER shown when customers look for work to do
  const [statusFilter, setStatusFilter] = useState<'available' | 'completed' | 'all'>('available');
  const [searchQuery, setSearchQuery] = useState('');
  // Default to 'shuffled' so surveys keep shuffling and presenting fresh variety
  const [sortBy, setSortBy] = useState<'shuffled' | 'reward' | 'time' | 'newest'>('shuffled');

  // Dynamic shuffle order seed map
  const [shuffleSeedMap, setShuffleSeedMap] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    campaigns.forEach((c) => {
      initial[c.id] = Math.random();
    });
    return initial;
  });
  const [isShuffling, setIsShuffling] = useState(false);

  const handleShuffle = () => {
    setIsShuffling(true);
    const newMap: Record<string, number> = {};
    campaigns.forEach((c) => {
      newMap[c.id] = Math.random();
    });
    setShuffleSeedMap(newMap);
    setSortBy('shuffled');
    setTimeout(() => setIsShuffling(false), 500);
    showToast('Surveys shuffled! Fresh mix of available work loaded.', 'success');
  };

  const userResponses = currentUser
    ? responses.filter((r) => r.userId === currentUser.id)
    : [];

  // Available (strictly uncompleted) active campaigns
  const availableUncompletedCampaigns = campaigns.filter(
    (c) => c.status === 'active' && !(currentUser && hasUserCompletedCampaign(currentUser.id, c.id))
  );

  const completedCampaignsCount = currentUser
    ? campaigns.filter((c) => hasUserCompletedCampaign(currentUser.id, c.id)).length
    : 0;

  const filteredCampaigns = campaigns
    .filter((c) => {
      if (c.status !== 'active') return false;

      if (selectedCategory !== 'all' && c.category !== selectedCategory) {
        return false;
      }

      const isCompleted = currentUser
        ? hasUserCompletedCampaign(currentUser.id, c.id)
        : false;

      // When in 'available' mode (default), strictly hide completed surveys!
      if (statusFilter === 'available' && isCompleted) return false;
      if (statusFilter === 'completed' && !isCompleted) return false;

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const brandName = c.brandId
          ? brands.find((b) => b.id === c.brandId)?.name.toLowerCase() || ''
          : '';
        const matchTitle = c.title.toLowerCase().includes(query);
        const matchDesc = c.description.toLowerCase().includes(query);
        const matchCat = c.category.toLowerCase().includes(query);
        const matchBrand = brandName.includes(query);
        if (!matchTitle && !matchDesc && !matchCat && !matchBrand) {
          return false;
        }
      }

      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'shuffled') {
        return (shuffleSeedMap[a.id] ?? 0.5) - (shuffleSeedMap[b.id] ?? 0.5);
      }
      if (sortBy === 'reward') return b.rewardCoins - a.rewardCoins;
      if (sortBy === 'time') return a.estimatedMinutes - b.estimatedMinutes;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const totalAvailableCoins = availableUncompletedCampaigns.reduce((sum, c) => sum + c.rewardCoins, 0);

  // Top recommended available uncompleted survey for 1-click start
  const topNextSurvey = filteredCampaigns.find(
    (c) => !(currentUser && hasUserCompletedCampaign(currentUser.id, c.id))
  ) || availableUncompletedCampaigns[0] || null;

  return (
    <div className="space-y-6">
      <SEOHead
        title="Browse Paid Surveys & Brand Research Studies"
        description="Browse active paid surveys and consumer studies from world-class brands. Earn up to 250 coins per completed study with pending credits verified for monthly redeemable payouts."
        keywords={[
          'paid surveys catalog',
          'online consumer studies',
          'earn money answering surveys',
          'chat feedback rewards',
          'market research rewards',
          'brand feedback studies',
        ]}
        canonicalPath="/surveys"
        structuredData={{
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: 'Available Brand Feedback Surveys & Studies',
          description:
            'Interactive conversational surveys and brand studies allowing users to earn redeemable coin rewards for authentic consumer opinions.',
          provider: {
            '@type': 'Organization',
            name: 'Voice Flow 360',
          },
        }}
      />
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 md:p-8 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-5 sm:gap-6">
        <div className="min-w-0 flex-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-bold uppercase tracking-wider mb-2.5 sm:mb-3">
            <FileQuestion className="w-3.5 h-3.5" />
            <span>Survey Catalog</span>
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight break-words">
            Explore Feedback Surveys
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1.5 max-w-2xl leading-relaxed break-words">
            Choose from interactive brand feedback surveys, evaluate flagship products and services, and earn direct coin rewards.
          </p>
        </div>

        {/* Available Bounty Summary */}
        <div className="bg-gradient-to-br from-purple-50 via-indigo-50 to-purple-100/60 rounded-2xl p-4 border border-purple-200/70 w-full md:w-auto md:min-w-[220px] text-left shrink-0">
          <span className="text-[11px] font-bold text-purple-700 uppercase tracking-wider block">
            Available Bounty
          </span>
          <div className="flex items-center gap-2 mt-1">
            <Coins className="w-5 h-5 text-amber-500 shrink-0" />
            <span className="text-xl sm:text-2xl font-black text-slate-900">
              +{totalAvailableCoins.toLocaleString()}
            </span>
            <span className="text-xs font-semibold text-purple-700">Coins</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {campaigns.filter((c) => c.status === 'active').length} active topics ready
          </p>
        </div>
      </div>

      {/* Survey Quality Cooldown Banner (Rendered strictly ONLY when 5 surveys completed) */}
      <SurveyQualityCooldownBanner />

      {/* 🚀 Quick Work Starter: Where to Start Working */}
      {statusFilter === 'available' && topNextSurvey && (
        <div
          id="surveys-quick-work-starter"
          className="bg-gradient-to-br from-purple-900 via-indigo-900 to-slate-900 rounded-3xl p-5 sm:p-7 text-white shadow-lg border-2 border-purple-400/30 relative overflow-hidden"
        >
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 relative z-10">
            <div className="space-y-2.5 flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider shadow-xs">
                  <Sparkles className="w-3.5 h-3.5 fill-slate-950" />
                  <span>Start Working Here</span>
                </span>
                <span className="text-xs text-purple-200 font-medium">
                  • Only uncompleted surveys shown
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug">
                {topNextSurvey.title}
              </h2>

              <p className="text-xs sm:text-sm text-purple-100/85 max-w-xl leading-relaxed">
                {topNextSurvey.description}
              </p>

              {/* 3-Step Simple Work Flow */}
              <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-purple-200 font-medium">
                <span className="flex items-center gap-1">
                  <span className="w-5 h-5 rounded-full bg-purple-400/30 text-white font-black text-[10px] flex items-center justify-center">1</span>
                  Pick Survey
                </span>
                <span>→</span>
                <span className="flex items-center gap-1">
                  <span className="w-5 h-5 rounded-full bg-purple-400/30 text-white font-black text-[10px] flex items-center justify-center">2</span>
                  Answer Questions &amp; 5s Sponsor Break
                </span>
                <span>→</span>
                <span className="flex items-center gap-1">
                  <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] flex items-center justify-center">3</span>
                  Earn Coins
                </span>
              </div>
            </div>

            {/* Quick Action Area */}
            <div className="w-full lg:w-auto bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-stretch justify-between gap-3 shrink-0">
              <div className="flex items-center justify-between gap-4">
                <div className="text-left">
                  <div className="text-[10px] text-purple-200 uppercase tracking-wider font-bold">Reward</div>
                  <div className="text-lg font-black text-amber-300 flex items-center gap-1.5">
                    <Coins className="w-4 h-4 text-amber-400" />
                    <span>+{topNextSurvey.rewardCoins} Coins</span>
                  </div>
                </div>
                <div className="text-right text-xs text-purple-200 font-medium">
                  <div>~{topNextSurvey.estimatedMinutes} min</div>
                  <div>{topNextSurvey.questions.length} Questions</div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  id="start-next-survey-direct-btn"
                  onClick={() => {
                    if (isSurveyLimitReached) {
                      setIsSurveyCooldownModalOpen(true);
                    } else {
                      startChat(topNextSurvey);
                    }
                  }}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <Play className="w-4 h-4 fill-slate-950" />
                  <span>Start Working (1-Click)</span>
                </button>

                <button
                  id="quick-shuffle-btn"
                  onClick={handleShuffle}
                  className="py-3 px-3 bg-white/15 hover:bg-white/25 text-white font-bold text-xs rounded-xl border border-white/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  title="Shuffle to see a different survey"
                >
                  <Shuffle className={`w-3.5 h-3.5 ${isShuffling ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">Shuffle</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters & Search Controls */}
      <div className="bg-white rounded-3xl p-3.5 sm:p-5 border border-slate-200/80 shadow-xs space-y-3 sm:space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 sm:gap-4">
          {/* Search */}
          <div className="relative flex-1 w-full md:max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search surveys by keyword, brand, or topic..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
            />
          </div>

          {/* Status, Shuffle & Sort Controls */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-2.5 w-full md:w-auto">
            {/* Status Tabs: Default is 'available' (uncompleted only) */}
            <div className="bg-slate-100 p-1 rounded-2xl flex items-center gap-1 flex-1 sm:flex-initial overflow-x-auto scrollbar-none">
              <button
                onClick={() => setStatusFilter('available')}
                className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  statusFilter === 'available'
                    ? 'bg-white text-purple-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Only surveys you haven't completed yet"
              >
                Available ({availableUncompletedCampaigns.length})
              </button>
              <button
                onClick={() => setStatusFilter('completed')}
                className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  statusFilter === 'completed'
                    ? 'bg-white text-emerald-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Surveys you have already finished"
              >
                Completed ({completedCampaignsCount})
              </button>
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-2.5 py-1.5 rounded-xl text-[11px] sm:text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  statusFilter === 'all'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All
              </button>
            </div>

            {/* Shuffle Surveys Button */}
            <button
              id="catalog-shuffle-surveys-btn"
              onClick={handleShuffle}
              className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-purple-50 to-indigo-50 hover:from-purple-100 hover:to-indigo-100 border border-purple-200 text-purple-900 font-extrabold text-xs rounded-2xl shadow-2xs transition-all cursor-pointer group"
              title="Shuffle surveys to get a fresh random mix"
            >
              <Shuffle className={`w-3.5 h-3.5 text-purple-600 transition-transform duration-300 ${isShuffling ? 'animate-spin' : 'group-hover:rotate-180'}`} />
              <span className="whitespace-nowrap">Shuffle</span>
            </button>

            {/* Sort Dropdown */}
            <div className="flex items-center justify-between sm:justify-start gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-2xl text-xs text-slate-600 flex-1 sm:flex-initial">
              <div className="flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-medium text-slate-400">Sort:</span>
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value="shuffled">🎲 Shuffled Mix (Default)</option>
                <option value="reward">💰 Highest Reward</option>
                <option value="time">⚡ Shortest Duration</option>
                <option value="newest">✨ Newest First</option>
              </select>
            </div>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none pt-0.5">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Referral Encouragement Banner when daily limit of 5 is reached */}
      {isSurveyLimitReached && (
        <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-emerald-500/10 border-2 border-amber-300 rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 shadow-sm font-black">
              <UserPlus className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-200 text-amber-950">
                  Daily Cap (5/5) Reached
                </span>
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  Earn Unlimited Via Referrals
                </span>
              </div>
              <h4 className="text-sm sm:text-base font-black text-slate-900 mt-1">
                Completed 5/5 activities today? Invite others to earn unlimited coins!
              </h4>
              <p className="text-xs text-slate-600 mt-0.5 leading-relaxed max-w-2xl">
                In one day, only 5 earnings can be done via surveys or quizzes. For more earning, copy your link, share via WhatsApp, or share on your social profiles. Customer will be paid <strong>300 Coins ($3.00)</strong> only when someone joins from the invitations!
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsSurveyCooldownModalOpen(true)}
            className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 text-xs font-black rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
            <span>Invite Friends Now</span>
          </button>
        </div>
      )}

      {/* Surveys Grid */}
      {filteredCampaigns.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200/80 p-8 shadow-xs">
          {statusFilter === 'available' && availableUncompletedCampaigns.length === 0 ? (
            <div className="max-w-md mx-auto space-y-3">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-3 shadow-inner">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-black text-slate-900">All Available Surveys Completed! 🎉</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                You have finished all currently available brand studies! Great job. Fresh surveys drop every 4 hours. In the meantime, you can earn unlimited coins by inviting friends (+300 coins per invite) or review your completed submissions.
              </p>
              <div className="pt-3 flex flex-wrap items-center justify-center gap-2.5">
                <button
                  id="view-completed-history-btn"
                  onClick={() => setStatusFilter('completed')}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  View Completed History ({completedCampaignsCount})
                </button>
                <button
                  id="invite-friends-empty-btn"
                  onClick={() => setCurrentView('referrals')}
                  className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Invite Friends (+300 Coins)</span>
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <HelpCircle className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-900">No surveys found</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                No active surveys match your selected category or search filters.
              </p>
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setStatusFilter('available');
                  setSearchQuery('');
                  handleShuffle();
                }}
                className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Reset Filters &amp; Shuffle
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCampaigns.map((camp) => {
            const isCompleted = currentUser
              ? hasUserCompletedCampaign(currentUser.id, camp.id)
              : false;
            const brand = camp.brandId
              ? brands.find((b) => b.id === camp.brandId)
              : null;

            return (
              <div
                key={camp.id}
                className={`rounded-3xl border transition-all flex flex-col justify-between p-4 sm:p-6 hover:shadow-md ${
                  isCompleted
                    ? 'bg-white/80 border-emerald-200/80'
                    : 'bg-white border-slate-200/90 hover:border-purple-200'
                }`}
              >
                <div>
                  {/* Top Bar: Category Pill & Coin Reward */}
                  <div className="flex items-center justify-between gap-2 mb-2.5 sm:mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg bg-slate-100 text-slate-700 shrink-0">
                      {camp.category.replace('_', ' ')}
                    </span>
                    <div className="flex items-center gap-1.5 text-xs font-extrabold text-amber-900 bg-gradient-to-r from-amber-100 to-yellow-100 px-2.5 py-1 sm:px-3 sm:py-1 rounded-full border border-amber-300/60 shrink-0">
                      <Coins className="w-3.5 h-3.5 text-amber-600" />
                      <span>+{camp.rewardCoins} Coins</span>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3 className="font-extrabold text-slate-900 text-sm sm:text-base leading-snug break-words">
                    {camp.title}
                  </h3>
                  <p className="text-xs text-slate-600 mt-1.5 sm:mt-2 line-clamp-2 leading-relaxed break-words">
                    {camp.description}
                  </p>

                  {/* Brand Sponsor tag if available */}
                  {brand && (
                    <div className="mt-3 flex items-center gap-1.5 text-[10px] sm:text-[11px] text-purple-700 bg-purple-50/70 border border-purple-100 px-2.5 py-1 rounded-xl w-fit max-w-full">
                      <Building2 className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                      <span className="truncate">Sponsored by <strong>{brand.name}</strong></span>
                    </div>
                  )}
                </div>

                {/* Bottom Meta & Action */}
                <div className="pt-4 border-t border-slate-100 mt-4 flex flex-wrap sm:flex-nowrap items-center justify-between gap-2.5">
                  <div className="text-xs text-slate-500 flex items-center gap-2 font-medium shrink-0">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      ~{camp.estimatedMinutes} min
                    </span>
                    <span>•</span>
                    <span>{camp.questions.length} Qs</span>
                  </div>

                  {isCompleted ? (
                    <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3.5 py-2 rounded-2xl border border-emerald-200 w-full sm:w-auto">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Completed</span>
                    </div>
                  ) : isSurveyLimitReached ? (
                    <button
                      id={`survey-cooldown-btn-${camp.id}`}
                      onClick={() => setIsSurveyCooldownModalOpen(true)}
                      className="w-full sm:w-auto px-3.5 py-2 bg-gradient-to-r from-amber-50 to-amber-100 hover:from-amber-100 hover:to-amber-200 text-amber-950 border border-amber-300 font-bold text-xs rounded-2xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs whitespace-nowrap"
                      title="Daily limit reached (5/5 surveys & quizzes completed). Click to invite friends and earn unlimited coins!"
                    >
                      <UserPlus className="w-3.5 h-3.5 text-amber-700" />
                      <span>Invite to Earn (+300)</span>
                    </button>
                  ) : (
                    <button
                      id={`survey-start-chat-btn-${camp.id}`}
                      onClick={() => startChat(camp)}
                      className="w-full sm:w-auto px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs rounded-2xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer hover:scale-102"
                    >
                      <span>Start {camp.category === 'quizzes' ? 'Quiz' : 'Chat'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
