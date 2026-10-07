import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { SEOHead } from './SEOHead';
import {
  HelpCircle,
  Coins,
  CreditCard,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Search,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ArrowRight,
  Gift,
  DollarSign,
  Users,
  Smartphone,
  AlertCircle,
  Percent,
  Calendar,
  Award,
} from 'lucide-react';

interface FAQItem {
  id: string;
  category: 'conversion' | 'payouts' | 'eligibility' | 'account';
  categoryLabel: string;
  question: string;
  shortAnswer: string;
  detailedAnswer: string[];
  keyTakeaways?: string[];
  highlightBadge?: string;
}

const FAQ_ITEMS: FAQItem[] = [
  // --- Coin Conversion Rates ---
  {
    id: 'coin-rate',
    category: 'conversion',
    categoryLabel: 'Reward Credits',
    question: 'How do research study coins convert into rewards?',
    shortAnswer: '100 Coins = 1 Reward Unit (10 points per coin).',
    detailedAnswer: [
      'Voice Flow 360 uses a transparent, standardized reward coin valuation where 100 coins equals 1 Reward Unit.',
      'There are no floating exchange rates, hidden algorithmic dilutions, or sudden point devaluations. When a brand research study awards 150 coins, you receive 150 verified reward coins directly in your balance. Participate in studies and earn rewards.',
    ],
    keyTakeaways: [
      '100 Coins = 1 Reward Unit',
      '500 Coins = Minimum Reward Redemption',
      '1,000 Coins = Level 1 Reward Tier',
      '2,500 Coins = Level 2 Reward Tier',
    ],
    highlightBadge: '100 Coins = 1 Reward Unit',
  },
  {
    id: 'credit-speed',
    category: 'conversion',
    categoryLabel: 'Reward Credits',
    question: 'How quickly are survey coins credited to my account?',
    shortAnswer: 'Coins are logged in your account upon survey completion, pending monthly quality review on the 1st of each month.',
    detailedAnswer: [
      'The moment you complete a conversational chat survey or trivia session, the reward coins are logged in your account ledger as pending research credits.',
      'Submissions undergo quality and attentiveness verification during the monthly billing cycle. On the 1st of each month, reviewed and approved earnings transfer to your Redeemable Wallet for cashout.',
    ],
    keyTakeaways: [
      'Survey coins logged in your account ledger upon completion',
      'Monthly review cycle transfers approved coins on the 1st of each month',
      'Audited balance unlocks cashout once reaching 2,000 Coins ($20.00 USD)',
    ],
  },
  {
    id: 'coin-expiration',
    category: 'conversion',
    categoryLabel: 'Reward Credits',
    question: 'Do my earned coins ever expire?',
    shortAnswer: 'No. Your coins never expire as long as your account remains active.',
    detailedAnswer: [
      'Your earned coins belong to you and never expire due to arbitrary calendar deadlines.',
      'To keep an account active, simply log in at least once every 12 months. You can accumulate coins at your own pace until you are ready to redeem your target cashout amount via Direct Bank Transfer or Cryptocurrency.',
    ],
  },

  // --- Payout Thresholds & Cashout ---
  {
    id: 'monthly-wallet-review',
    category: 'payouts',
    categoryLabel: 'Payouts & Cashout',
    question: 'How do survey earnings get added to my Redeemable Wallet?',
    shortAnswer: 'All survey reward coins are reviewed and transferred to your Redeemable Wallet by the 1st of every month.',
    detailedAnswer: [
      'When you complete conversational feedback surveys and trivia sessions, your earned reward coins are recorded in your account under review to safeguard research integrity.',
      'By the 1st of every month, following automated quality and compliance verification, your total approved earnings are transferred directly into your Redeemable Wallet.',
      'Once transferred to your Redeemable Wallet, you can request a disbursement via Direct Bank Transfer or Cryptocurrency.',
    ],
    keyTakeaways: [
      'Monthly audit cycle: transfers on the 1st of every month',
      'Protects brand research authenticity and ensures reliable disbursements',
      'Once in Redeemable Wallet, funds are fully unlocked for cashout at 2,000 Coins ($20.00 USD)',
    ],
    highlightBadge: 'Transfers on 1st of Month',
  },
  {
    id: 'payout-threshold',
    category: 'payouts',
    categoryLabel: 'Payouts & Cashout',
    question: 'What is the minimum redemption threshold?',
    shortAnswer: 'Minimum redemption is 2,000 Coins ($20.00 USD) for both Bank Transfer and Cryptocurrency.',
    detailedAnswer: [
      'To provide an honest, verifiable compensation process with zero platform fees, our minimum withdrawal threshold is standardized across all rails: 2,000 Coins ($20.00 USD).',
      '• Direct Bank Transfer (ACH / SEPA / Wire): Minimum cashout is 2,000 Coins ($20.00 USD) with $0 platform fee.',
      '• Cryptocurrency (USDT / BTC): Minimum cashout is 2,000 Coins ($20.00 USD) with standard network miner fee.',
    ],
    keyTakeaways: [
      '2,000 Coins ($20.00 USD) unified cashout threshold',
      'Direct Bank Transfer and Cryptocurrency supported',
      'Zero platform fee deducted from your payout',
    ],
    highlightBadge: 'Min 2,000 Coins ($20.00)',
  },
  {
    id: 'bank-policy',
    category: 'payouts',
    categoryLabel: 'Payouts & Cashout',
    question: 'What are the withdrawal processing requirements?',
    shortAnswer: 'Earnings are audited during the month and move to your Redeemable Wallet on the 1st of each month. Redemptions require a minimum of 2,000 Coins ($20.00 USD).',
    detailedAnswer: [
      'Completed survey earnings enter Pending Review where automated quality checks and human reviews verify answer integrity.',
      'On the 1st of every month, all approved earnings automatically transfer to your Redeemable Wallet.',
      'Once in your Redeemable Wallet, you can request a cashout via Bank Transfer or Cryptocurrency as soon as your balance reaches 2,000 Coins ($20.00 USD).',
    ],
    keyTakeaways: [
      'Monthly review cycle: transfers on 1st of each month',
      '2,000 Coins ($20.00 USD) threshold unlocks withdrawal',
      'Zero platform fees on Bank Transfer disbursements',
    ],
  },
  {
    id: 'payout-methods',
    category: 'payouts',
    categoryLabel: 'Payouts & Cashout',
    question: 'What payout methods are supported?',
    shortAnswer: 'Direct Bank Transfer (ACH, SEPA, Wire) and Cryptocurrency (USDT, BTC).',
    detailedAnswer: [
      'We support reliable, operational payment rails for verified participants:',
      '• Direct Bank Transfer: Direct electronic deposit via ACH, SEPA, or domestic/international wire to your verified bank account (Minimum 2,000 Coins / $20.00 USD).',
      '• Cryptocurrency (USDT / BTC): Fast transfer directly to your verified cryptocurrency wallet address (Minimum 2,000 Coins / $20.00 USD).',
      'We do not promise speculative, unverified payout rails. Only operational bank and crypto channels are provided.',
    ],
    keyTakeaways: [
      'Bank Transfer: ACH, SEPA, Wire (2,000 Coins / $20 min)',
      'Crypto: USDT / BTC (2,000 Coins / $20 min)',
      'Zero platform fees on bank transfers',
    ],
  },
  {
    id: 'payout-time',
    category: 'payouts',
    categoryLabel: 'Payouts & Cashout',
    question: 'How long does it take to receive my payout after requesting it?',
    shortAnswer: 'Redemptions from your Redeemable Wallet are typically processed within 24 to 48 business hours.',
    detailedAnswer: [
      'Once your earnings are moved to your Redeemable Wallet on the 1st of the month, any cashout request you submit is reviewed and dispatched by platform administrators within 24 to 48 hours.',
      'Bank transfers typically settle into your checking or savings account within 1 to 3 business days depending on your local bank processing times.',
    ],
  },
  {
    id: 'cashout-fees',
    category: 'payouts',
    categoryLabel: 'Payouts & Cashout',
    question: 'Are there any redemption or cashout processing fees?',
    shortAnswer: 'Zero fees. What you cash out is 100% what you receive in your account.',
    detailedAnswer: [
      'Voice Flow 360 does not charge any redemption or processing fees.',
      'By setting the bank minimum in alignment with banking policies, we absorb all corporate banking overhead so you receive the full value of your redeemable coins. Participate in studies and earn rewards.',
    ],
  },

  // --- Survey Participation Eligibility ---
  {
    id: 'eligibility-requirements',
    category: 'eligibility',
    categoryLabel: 'Participation Eligibility',
    question: 'Who is eligible to participate in surveys on Voice Flow 360?',
    shortAnswer: 'Anyone aged 13 or older (or 18+ depending on jurisdiction) with an internet-connected device.',
    detailedAnswer: [
      'Voice Flow 360 is open to participants globally. Whether you are a student, full-time professional, stay-at-home parent, or retiree, your voice is valuable to consumer brands.',
      'You only need an active email address and an internet connection. There are no prior qualifications, educational prerequisites, or special equipment needed.',
    ],
    keyTakeaways: [
      'Ages 13+ eligible (or 18+ where local regulations require)',
      'Worldwide accessibility with global and localized brand studies',
      '100% free membership — no subscription or entry fee ever',
    ],
    highlightBadge: 'Open to All',
  },
  {
    id: 'survey-limit',
    category: 'eligibility',
    categoryLabel: 'Participation Eligibility',
    question: 'How many surveys and quizzes can I take per day? How can I earn more once I reach the limit?',
    shortAnswer: 'Members can complete up to 5 surveys and quizzes combined per day. For more earnings, invite friends to earn unlimited coins!',
    detailedAnswer: [
      'To safeguard authentic data for sponsoring brands and maintain high-quality respondent engagement, Voice Flow 360 permits up to 5 completed surveys and quizzes combined per calendar day.',
      'Once your 5th survey or quiz is finished, daily earning from surveys and quizzes pauses until the midnight daily reset.',
      'Want to keep earning after reaching the 5-survey limit? You can earn unlimited coins by inviting other people! You have 3 simple options: copy your link, share via WhatsApp, or share directly on your social profiles. Customer will be paid 300 Coins only when someone joins from the invitations. Participate in studies and earn rewards.',
    ],
    keyTakeaways: [
      'Maximum 5 survey & quiz completions per day (5 daily earnings)',
      'New survey & quiz slots unlock automatically at daily reset',
      'Earn unlimited bonus coins by inviting friends (+300 Coins paid when friend joins)',
      '3 simple sharing options: Copy link, share on WhatsApp, or share on social profiles',
    ],
    highlightBadge: 'Max 5 Surveys / Day • Unlimited Referrals',
  },
  {
    id: 'device-compatibility',
    category: 'eligibility',
    categoryLabel: 'Participation Eligibility',
    question: 'What devices and web browsers are supported?',
    shortAnswer: 'All modern smartphones, tablets, and desktop computers running Chrome, Safari, Firefox, or Edge.',
    detailedAnswer: [
      'Voice Flow 360 is built as a lightweight, responsive Progressive Web Application. You do not need to download heavy mobile apps from an app store or grant intrusive device permissions.',
      'You can effortlessly start a chat survey on your phone during your commute, and continue on your laptop or tablet at home.',
    ],
  },
  {
    id: 'quality-standards',
    category: 'eligibility',
    categoryLabel: 'Participation Eligibility',
    question: 'What happens if I give rushed, repetitive, or dishonest answers?',
    shortAnswer: 'Thoughtful, authentic feedback is required. Bot responses and gibberish are flagged by automated quality filters.',
    detailedAnswer: [
      'Brand partners pay for real, thoughtful human perspectives. Voice Flow 360 incorporates automated semantic validation to detect repetitive text, nonsensical copy-pasting, and rapid bot clicking.',
      'Maintaining an authentic response style protects your reputation rating and ensures you are prioritized for exclusive, high-reward surveys and VIP campaign drops.',
    ],
  },

  // --- Account & Security ---
  {
    id: 'welcome-bonus',
    category: 'account',
    categoryLabel: 'Account & Security',
    question: 'Is there a sign-up bonus for new members?',
    shortAnswer: 'Yes! New members receive a 50 coin welcome bonus upon registration.',
    detailedAnswer: [
      'As soon as you register your free account, 50 coins are credited to your account balance to kickstart your earning journey. Participate in studies and earn rewards.',
      'You can also collect daily streak bonuses by checking in each day and completing the daily trivia challenge.',
    ],
  },
  {
    id: 'referral-bonus',
    category: 'account',
    categoryLabel: 'Account & Security',
    question: 'How does the Referral Program work and how much can I earn?',
    shortAnswer: 'Earn 300 coins per referred friend plus a 10% lifetime dividend on their completed surveys.',
    detailedAnswer: [
      'Every member receives a personalized referral code and direct share link in the "Invite & Earn 300" tab.',
      'When your friend registers and completes their first survey, you receive a 300 coin reward. Additionally, you earn an ongoing 10% dividend on all survey coins they accumulate, credited automatically without deducting from their payout. Participate in studies and earn rewards.',
    ],
    keyTakeaways: [
      '300 Bonus Coins upon friend’s first completed study',
      '10% Lifetime survey dividend paid on their earnings',
      'No limit to how many friends you can invite',
    ],
  },
  {
    id: 'privacy-safety',
    category: 'account',
    categoryLabel: 'Account & Security',
    question: 'How is my private data and survey feedback protected?',
    shortAnswer: 'All survey responses are completely anonymized and aggregated into high-level sentiment reports.',
    detailedAnswer: [
      'Your privacy is our utmost priority. Sponsoring brands only receive aggregated statistical trends and anonymized opinion data (e.g., "78% of respondents prefer recyclable packaging").',
      'We never sell your email address, phone number, payment details, or personal identity to advertisers or third-party marketing brokers.',
    ],
  },
];

export const FAQ: React.FC = () => {
  const { setCurrentView } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'conversion' | 'payouts' | 'eligibility' | 'account'>('all');
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({
    'coin-rate': true,
    'payout-threshold': true,
    'survey-limit': true,
  });

  // Interactive Calculator State
  const [calcCoins, setCalcCoins] = useState<number>(500);

  const toggleItem = (id: string) => {
    setOpenItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const expandAll = () => {
    const allExpanded: Record<string, boolean> = {};
    FAQ_ITEMS.forEach((item) => {
      allExpanded[item.id] = true;
    });
    setOpenItems(allExpanded);
  };

  const collapseAll = () => {
    setOpenItems({});
  };

  // Filter FAQ items
  const filteredFAQs = useMemo(() => {
    return FAQ_ITEMS.filter((item) => {
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const query = searchQuery.trim().toLowerCase();
      if (!query) return matchesCategory;

      const inQuestion = item.question.toLowerCase().includes(query);
      const inShortAnswer = item.shortAnswer.toLowerCase().includes(query);
      const inDetailed = item.detailedAnswer.some((line) => line.toLowerCase().includes(query));
      const inCategory = item.categoryLabel.toLowerCase().includes(query);

      return matchesCategory && (inQuestion || inShortAnswer || inDetailed || inCategory);
    });
  }, [selectedCategory, searchQuery]);

  // Schema.org FAQPage Structured Data for Google rich search results
  const faqSchemaData = useMemo(() => {
    return {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: FAQ_ITEMS.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `${item.shortAnswer} ${item.detailedAnswer.join(' ')}`,
        },
      })),
    };
  }, []);

  const calculatedCredits = Math.floor(calcCoins / 100);
  const calculatedUsd = (calcCoins / 100).toFixed(2);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-10 animate-fadeIn text-slate-900">
      <SEOHead
        title="Frequently Asked Questions (FAQ) - Coin Conversion, Payouts & Eligibility"
        description="Find clear answers to common questions about Voice Flow 360: reward coins, redemption thresholds, survey eligibility, and redemption methods. Participate in studies and earn rewards."
        keywords={[
          'voice flow 360 faq',
          'coin conversion rate',
          'survey payout threshold',
          'how much are coins worth',
          'survey eligibility requirements',
          'bank transfer cashout minimum',
          'crypto withdrawal threshold',
          '12 hour survey limit',
          'earn money survey questions',
        ]}
        canonicalPath="/faq"
        structuredData={faqSchemaData}
      />

      {/* Hero Header Section */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-100 border border-purple-200 text-xs font-bold text-purple-800 shadow-2xs">
          <HelpCircle className="w-4 h-4 text-purple-600" />
          <span>Help &amp; Knowledge Center</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
          Frequently Asked Questions
        </h1>
        <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
          Clear, transparent rules regarding our reward coins valuation, 1st-of-the-month wallet review cycle, and standardized 2,000 Coins ($20.00 USD) minimum cashout policy across all payment rails. Participate in studies and earn rewards.
        </p>
      </div>

      {/* Quick Interactive Metric Summary Banners */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
            <Coins className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Conversion Rate</p>
            <p className="text-xl font-extrabold text-slate-900">100 Coins = $1.00 USD</p>
            <p className="text-xs text-slate-500">Fixed $0.01 per coin ratio</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-800 flex items-center justify-center shrink-0">
            <Calendar className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Monthly Transfer</p>
            <p className="text-xl font-extrabold text-slate-900">1st of Every Month</p>
            <p className="text-xs text-purple-700 font-semibold">Reviewed &amp; added to wallet</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
            <Award className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Minimum Redemption</p>
            <p className="text-xl font-extrabold text-slate-900">Min 2,000 Coins ($20)</p>
            <p className="text-xs text-emerald-600 font-semibold">Bank Transfer &amp; Crypto</p>
          </div>
        </div>
      </div>

      {/* Interactive Coin & Cashout Converter Card */}
      <div className="bg-gradient-to-br from-purple-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-purple-800/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 text-purple-200 text-xs font-bold border border-purple-400/30">
                <Percent className="w-3.5 h-3.5" />
                <span>Interactive Earnings Estimator</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold mt-2">
                Reward Credits &amp; Redemption Calculator
              </h2>
              <p className="text-slate-300 text-xs sm:text-sm">
                Calculate your estimated reward credits and check redemption eligibility across payout methods. Participate in studies and earn rewards.
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 text-right shrink-0">
              <span className="text-xs text-purple-200 font-medium block">Reward Credits</span>
              <span className="text-2xl sm:text-3xl font-extrabold text-amber-300">
                {calculatedCredits} <span className="text-sm font-normal text-white">Credits</span>
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs text-slate-300">
              <span>Adjust Coin Amount:</span>
              <span className="font-extrabold text-white text-sm">{calcCoins.toLocaleString()} coins ({calculatedCredits} Credits)</span>
            </div>
            <input
              id="faq-coin-converter-slider"
              type="range"
              min="500"
              max="20000"
              step="250"
              value={calcCoins}
              onChange={(e) => setCalcCoins(Number(e.target.value))}
              className="w-full h-2.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-400"
            />
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>500 coins</span>
              <span>2,000 coins (Min cashout)</span>
              <span>5,000 coins</span>
              <span>10,000 coins</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="bg-white/5 rounded-xl p-3 border border-white/10 text-center">
              <span className="text-[11px] text-slate-300 block">Bank Transfer (Min 2,000)</span>
              <span className={`text-xs sm:text-sm font-bold block mt-1 ${calcCoins >= 2000 ? 'text-emerald-400' : 'text-amber-300'}`}>
                {calcCoins >= 2000 ? 'Eligible ($20+)' : `Needs ${(2000 - calcCoins).toLocaleString()} more`}
              </span>
            </div>
            <div className="bg-white/5 rounded-xl p-3 border border-white/10 text-center">
              <span className="text-[11px] text-slate-300 block">Crypto USDT (Min 2,000)</span>
              <span className={`text-xs sm:text-sm font-bold block mt-1 ${calcCoins >= 2000 ? 'text-emerald-400' : 'text-amber-300'}`}>
                {calcCoins >= 2000 ? 'Eligible ($20+)' : `Needs ${(2000 - calcCoins).toLocaleString()} more`}
              </span>
            </div>
            <div className="bg-white/5 rounded-xl p-3 border border-white/10 text-center">
              <span className="text-[11px] text-slate-300 block">Estimated USD Value</span>
              <span className="text-xs sm:text-sm font-bold text-amber-300 block mt-1">
                ${calculatedUsd} USD
              </span>
            </div>
            <div className="bg-white/5 rounded-xl p-3 border border-white/10 text-center">
              <span className="text-[11px] text-slate-300 block">Transfer to Redeemable</span>
              <span className="text-xs sm:text-sm font-bold text-purple-300 block mt-1">
                Every 1st of Month
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar & Category Controls */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-4">
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            id="faq-search-input"
            type="text"
            placeholder="Search questions (e.g., '100 coins', 'payout threshold', 'bank transfer', '1st of month', 'age limit')..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white transition-all text-slate-900 placeholder:text-slate-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'all', label: 'All Questions' },
              { id: 'conversion', label: 'Coin Conversion Rates' },
              { id: 'payouts', label: 'Payout Thresholds' },
              { id: 'eligibility', label: 'Survey Eligibility' },
              { id: 'account', label: 'Account & Security' },
            ].map((tab) => (
              <button
                key={tab.id}
                id={`faq-filter-btn-${tab.id}`}
                onClick={() => setSelectedCategory(tab.id as any)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedCategory === tab.id
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Expand / Collapse Toggle */}
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <button
              id="faq-expand-all-btn"
              onClick={expandAll}
              className="hover:text-purple-600 transition-colors cursor-pointer"
            >
              Expand All
            </button>
            <span>•</span>
            <button
              id="faq-collapse-all-btn"
              onClick={collapseAll}
              className="hover:text-purple-600 transition-colors cursor-pointer"
            >
              Collapse All
            </button>
          </div>
        </div>
      </div>

      {/* FAQ Accordion List */}
      <div className="space-y-4">
        {filteredFAQs.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-xs space-y-3">
            <AlertCircle className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No questions matched your query</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try searching with broader terms like "conversion", "paypal", "coins", or switch category filters.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="mt-2 px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-800 text-xs font-bold rounded-xl transition-all cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          filteredFAQs.map((faq) => {
            const isOpen = !!openItems[faq.id];
            return (
              <div
                key={faq.id}
                id={`faq-item-${faq.id}`}
                className={`bg-white rounded-3xl border transition-all duration-200 overflow-hidden ${
                  isOpen
                    ? 'border-purple-300 shadow-md ring-1 ring-purple-100'
                    : 'border-slate-200/80 shadow-xs hover:border-slate-300'
                }`}
              >
                <button
                  id={`faq-toggle-${faq.id}`}
                  onClick={() => toggleItem(faq.id)}
                  className="w-full p-5 sm:p-6 flex items-start justify-between gap-4 text-left cursor-pointer transition-colors"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {faq.categoryLabel}
                      </span>
                      {faq.highlightBadge && (
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                          {faq.highlightBadge}
                        </span>
                      )}
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 pt-0.5">
                      {faq.question}
                    </h3>
                    <p className="text-xs sm:text-sm font-medium text-purple-700">
                      {faq.shortAnswer}
                    </p>
                  </div>

                  <div className={`p-2 rounded-xl shrink-0 transition-colors ${
                    isOpen ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 sm:px-6 pb-6 pt-1 border-t border-slate-100 space-y-4 animate-fadeIn">
                    <div className="space-y-2 text-sm text-slate-600 leading-relaxed">
                      {faq.detailedAnswer.map((para, idx) => (
                        <p key={idx}>{para}</p>
                      ))}
                    </div>

                    {faq.keyTakeaways && faq.keyTakeaways.length > 0 && (
                      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/70 space-y-2">
                        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                          Key Highlights:
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {faq.keyTakeaways.map((takeaway, tIdx) => (
                            <div key={tIdx} className="flex items-start gap-2 text-xs text-slate-700">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                              <span>{takeaway}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Bottom Contact & Action Prompts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
        {/* Card 1: Start Earning Now */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl p-6 border border-amber-200/80 shadow-xs space-y-4">
          <div className="w-10 h-10 rounded-2xl bg-amber-200/70 text-amber-900 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-amber-700" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Participate in studies and earn rewards</h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Browse dozens of active brand research studies, contribute your insights for up to 250 coins per study, and redeem rewards with our standardized 2,000 coin ($20.00 USD) threshold. Participate in studies and earn rewards.
            </p>
          </div>
          <button
            id="faq-cta-start-earning"
            onClick={() => setCurrentView('dashboard')}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <span>Join a Brand Research Study</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Card 2: Still Have Questions */}
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-3xl p-6 border border-purple-200/80 shadow-xs space-y-4">
          <div className="w-10 h-10 rounded-2xl bg-purple-200/70 text-purple-900 flex items-center justify-center">
            <Users className="w-5 h-5 text-purple-700" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Have an unanswered question?</h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Our support team is available to assist with redemption verifications, brand partnership inquiries, and account guidance.
            </p>
          </div>
          <button
            id="faq-cta-contact-support"
            onClick={() => setCurrentView('contact')}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <span>Contact Support</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
