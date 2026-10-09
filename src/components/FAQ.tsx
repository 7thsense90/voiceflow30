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
    categoryLabel: 'Coin Conversion',
    question: 'How do research study coins convert into rewards?',
    shortAnswer: '100 Coins = $1.00 USD ($0.01 per coin).',
    detailedAnswer: [
      'Voice Flow 360 uses a transparent, fixed conversion rate: 100 coins equals $1.00 USD ($0.01 per coin).',
      'There are no floating exchange rates, hidden algorithmic dilutions, or sudden point devaluations. When a brand research study awards 150 coins, you receive 150 verified reward coins ($1.50 USD value) in your ledger.',
      'Accrued coins maintain this published fixed ratio, protecting your accumulated earnings from retroactive devaluation.',
    ],
    keyTakeaways: [
      '100 Coins = $1.00 USD fixed valuation ($0.01 per coin)',
      '2,000 Coins ($20.00 USD) = Standard minimum cashout threshold',
      'Zero algorithmic token dilution or hidden conversion haircuts',
      'Only reviewed and approved coins become redeemable on 1st of month',
    ],
    highlightBadge: '100 Coins = $1.00 USD',
  },
  {
    id: 'credit-speed',
    category: 'conversion',
    categoryLabel: 'Coin Conversion',
    question: 'How quickly are survey coins credited to my account?',
    shortAnswer: 'Coins are logged immediately in Pending Review upon survey completion, and only approved coins become redeemable on the 1st of each month.',
    detailedAnswer: [
      'The moment you complete a conversational chat survey, the earned reward coins are immediately recorded in your account ledger under Pending Review.',
      'Throughout the calendar month, submissions undergo quality and attentiveness verification to ensure research authenticity.',
      'On the 1st of each month, all reviewed and approved coins automatically transfer to your Redeemable Wallet. Note that monthly reward approval (on the 1st of each month) is separate from withdrawal processing (which begins after you submit an eligible cashout request).',
    ],
    keyTakeaways: [
      'Coins logged immediately in Pending Review upon completion',
      'Monthly approval: only reviewed and approved coins become redeemable on the 1st of each month',
      'Monthly reward approval is distinct from withdrawal processing',
    ],
  },
  {
    id: 'coin-expiration',
    category: 'conversion',
    categoryLabel: 'Coin Conversion',
    question: 'Do my earned coins ever expire?',
    shortAnswer: 'No. Your coins never expire as long as your account remains active.',
    detailedAnswer: [
      'Your earned coins belong to you and never expire due to arbitrary calendar deadlines.',
      'To keep an account active, simply sign in or complete at least one activity within any 12-month period. You can accumulate coins at your own pace until you reach the standardized 2,000 coin ($20.00 USD) minimum threshold to redeem via Direct Bank Transfer or Cryptocurrency.',
    ],
    keyTakeaways: [
      'Earned coins never expire while account is active',
      '12-month activity window to maintain active status',
      'Accumulate at your own pace toward the 2,000 coin minimum',
    ],
  },

  // --- Payout Thresholds & Cashout ---
  {
    id: 'monthly-wallet-review',
    category: 'payouts',
    categoryLabel: 'Payouts & Cashout',
    question: 'How do survey earnings get added to my Redeemable Wallet?',
    shortAnswer: 'Only reviewed and approved coins become redeemable on the 1st of each month.',
    detailedAnswer: [
      'When you complete conversational feedback surveys, earned coins enter Pending Review where automated quality checks and human reviews verify answer integrity.',
      'On the 1st of each calendar month, all reviewed and approved earnings automatically transfer into your Redeemable Wallet. Coins that fail quality or attentiveness standards are not approved.',
      'It is important to distinguish monthly reward approval from withdrawal processing: monthly approval certifies your survey responses and unlocks the coins into your Redeemable Wallet on the 1st; withdrawal processing begins only when you submit an eligible redemption request (minimum 2,000 Coins / $20.00 USD).',
    ],
    keyTakeaways: [
      'Monthly quality audit cycle: only approved coins transfer on the 1st of each month',
      'Distinguishes monthly reward approval from withdrawal processing',
      'Unlocked for withdrawal at 2,000 Coins ($20.00 USD)',
    ],
    highlightBadge: 'Transfers on 1st of Month',
  },
  {
    id: 'payout-threshold',
    category: 'payouts',
    categoryLabel: 'Payouts & Cashout',
    question: 'What is the minimum redemption threshold?',
    shortAnswer: 'Minimum withdrawal is 2,000 coins ($20.00 USD) for bank transfer and cryptocurrency.',
    detailedAnswer: [
      'To provide an honest, verifiable compensation process with zero platform fees, our minimum withdrawal threshold is standardized across all payout rails at 2,000 Coins ($20.00 USD).',
      '• Direct Bank Transfer (ACH / SEPA / Wire): Minimum cashout is 2,000 Coins ($20.00 USD).',
      '• Cryptocurrency (USDT / BTC): Minimum cashout is 2,000 Coins ($20.00 USD).',
      'Only reviewed and approved coins currently in your Redeemable Wallet count toward the 2,000 coin threshold. Pending review balances must be approved on the 1st of the month before they can be redeemed.',
    ],
    keyTakeaways: [
      '2,000 Coins ($20.00 USD) minimum withdrawal for bank transfer and cryptocurrency',
      'Standardized minimum applies equally across both payment rails',
      'Must have 2,000 approved coins in Redeemable Wallet to withdraw',
    ],
    highlightBadge: 'Min 2,000 Coins ($20.00)',
  },
  {
    id: 'bank-policy',
    category: 'payouts',
    categoryLabel: 'Payouts & Cashout',
    question: 'What are the withdrawal processing requirements?',
    shortAnswer: 'Withdrawals require at least 2,000 redeemable coins ($20.00 USD). Only reviewed and approved coins can be withdrawn.',
    detailedAnswer: [
      'Our withdrawal process follows three clear operational stages:',
      '1. Monthly Reward Approval: Throughout the month, coins stay in Pending Review. On the 1st of each month, reviewed and approved coins transfer into your Redeemable Wallet.',
      '2. Cashout Request: Once your Redeemable Wallet reaches at least 2,000 Coins ($20.00 USD), you can submit a withdrawal request specifying your payment method (Direct Bank Transfer or Cryptocurrency) and destination details.',
      '3. Withdrawal Processing & Disbursement: Platform administrators verify and process the withdrawal request. Bank transfers are expected 2–5 business days after an eligible withdrawal request is processed. Cryptocurrency transfers are expected 24–48 hours after processing.',
    ],
    keyTakeaways: [
      'Withdrawal processing is distinct from monthly reward approval',
      '2,000 Coins ($20.00 USD) minimum redeemable balance required',
      'Bank transfers: expected 2–5 business days after processing',
      'Cryptocurrency: expected 24–48 hours after processing',
    ],
  },
  {
    id: 'payout-methods',
    category: 'payouts',
    categoryLabel: 'Payouts & Cashout',
    question: 'What payout methods are supported?',
    shortAnswer: 'Direct Bank Transfer (ACH, SEPA, Wire) and Cryptocurrency (USDT, BTC).',
    detailedAnswer: [
      'We support genuine, operational payment rails for eligible, verified participants:',
      '• Direct Bank Transfer: Direct electronic deposit via ACH, SEPA, or domestic/international wire to your verified bank account in 40+ countries (Minimum 2,000 Coins / $20.00 USD).',
      '• Cryptocurrency (USDT / BTC): Fast transfer directly to your verified cryptocurrency wallet address (Minimum 2,000 Coins / $20.00 USD).',
      'Both methods require a minimum of 2,000 approved coins ($20.00 USD) in your Redeemable Wallet. Voice Flow 360 does not invent unverified or speculative payout rails.',
    ],
    keyTakeaways: [
      'Bank Transfer: ACH, SEPA, Wire (2,000 Coins / $20 min)',
      'Crypto: USDT / BTC (2,000 Coins / $20 min)',
      'Zero platform fees charged by Voice Flow 360',
    ],
  },
  {
    id: 'payout-time',
    category: 'payouts',
    categoryLabel: 'Payouts & Cashout',
    question: 'How long does it take to receive my payout after requesting it?',
    shortAnswer: 'Bank transfers are expected 2–5 business days after an eligible request is processed; cryptocurrency is expected 24–48 hours after processing.',
    detailedAnswer: [
      'It is essential to distinguish monthly reward approval from withdrawal processing:',
      '• Monthly Reward Approval (1st of Month): Survey coins are reviewed and approved on the 1st of every month, transferring into your Redeemable Wallet.',
      '• Withdrawal Request & Processing: When you submit an eligible withdrawal request from your Redeemable Wallet (minimum 2,000 Coins / $20.00 USD), the request is audited and processed by administrators.',
      '• Bank Transfers: Expected 2 to 5 business days after the withdrawal request is processed, depending on international ACH/SEPA/wire clearance and recipient institution settlement times.',
      '• Cryptocurrency: Expected 24 to 48 hours after processing, subject to standard blockchain network confirmations.',
    ],
    keyTakeaways: [
      'Bank transfers: expected 2–5 business days after processing',
      'Cryptocurrency: expected 24–48 hours after processing',
      'Withdrawal processing is separate from the 1st-of-month reward approval',
    ],
  },
  {
    id: 'cashout-fees',
    category: 'payouts',
    categoryLabel: 'Payouts & Cashout',
    question: 'Are there any redemption or cashout processing fees?',
    shortAnswer: 'Voice Flow 360 charges zero platform fees. Intermediary bank fees and blockchain network miner fees are separate and determined by external networks.',
    detailedAnswer: [
      'Zero Platform Fees: Voice Flow 360 does not charge any cashout, membership, or administrative fees on your withdrawals ($0.00 platform fee).',
      'Bank Transfer Fees: While Voice Flow 360 charges zero platform fees, your receiving bank or intermediary correspondent banks may independently apply incoming wire or foreign exchange fees depending on your local institution’s policies.',
      'Cryptocurrency Network Fees: Voice Flow 360 charges zero platform fees, but cryptocurrency transactions are subject to standard blockchain network miner or gas fees required by the network (e.g. USDT or BTC) at the time of broadcast.',
      'Because external bank or blockchain fees may apply depending on your provider, we explain our zero platform fees separately from those external third-party costs.',
    ],
    keyTakeaways: [
      '$0.00 platform fee from Voice Flow 360 on all cashouts',
      'Intermediary bank wire/FX fees determined by recipient institution',
      'Cryptocurrency transactions subject to standard network miner fees',
    ],
  },

  // --- Survey Participation Eligibility ---
  {
    id: 'eligibility-requirements',
    category: 'eligibility',
    categoryLabel: 'Participation Eligibility',
    question: 'Who is eligible to participate in surveys on Voice Flow 360?',
    shortAnswer: 'Participants must be at least 18 years old and meet the applicable age-of-majority requirement in their jurisdiction.',
    detailedAnswer: [
      'Participants must be at least 18 years old and meet the applicable age-of-majority requirement in their jurisdiction to participate in Voice Flow 360 research studies and earn rewards.',
      'Participants must have an active email address and an internet-connected device. Membership is 100% free with no subscription or entry fees.',
      'Eligible participants must provide genuine, attentive personal feedback based on actual consumer experience. Operating multiple accounts, using automated scripts, or submitting fraudulent data will disqualify responses and forfeit accrued rewards.',
    ],
    keyTakeaways: [
      'Participants must be at least 18 years old and meet the applicable age-of-majority requirement in their jurisdiction',
      'Valid internet connection and email address required',
      '100% free participation — zero entry or registration fees',
    ],
    highlightBadge: 'Ages 18+ & Legal Majority',
  },
  {
    id: 'survey-limit',
    category: 'eligibility',
    categoryLabel: 'Participation Eligibility',
    question: 'How many surveys and quizzes can I take per day? How can I earn more once I reach the limit?',
    shortAnswer: 'Members can complete up to 5 surveys and quizzes combined per day. For more earnings, invite friends to earn coins upon accepted participation!',
    detailedAnswer: [
      'To safeguard authentic data for sponsoring brands and maintain high-quality respondent engagement, Voice Flow 360 permits up to 5 completed surveys and quizzes combined per calendar day.',
      'Once your 5th survey or quiz is finished, daily earning from surveys and quizzes pauses until the midnight daily reset.',
      'Want to keep earning after reaching the 5-survey limit? You can earn bonus coins by inviting others to join! When someone registers through your invitation and completes their first eligible study, you receive 300 bonus coins.',
    ],
    keyTakeaways: [
      'Maximum 5 survey & quiz completions per day',
      'New survey & quiz slots unlock automatically at daily reset',
      'Earn 300 bonus coins when an invited friend completes their first study',
      '3 simple sharing options: Copy link, share on WhatsApp, or share on social profiles',
    ],
    highlightBadge: 'Max 5 Surveys / Day',
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
      'As soon as you register your free account, 50 coins are credited to your account balance to kickstart your earning journey.',
      'Welcome bonus coins transfer to your Redeemable Wallet following the monthly review cycle on the 1st of the month, counting toward the 2,000 coin minimum withdrawal threshold.',
    ],
  },
  {
    id: 'referral-bonus',
    category: 'account',
    categoryLabel: 'Account & Security',
    question: 'How does the Referral Program work and how much can I earn?',
    shortAnswer: 'Earn 300 coins per referred friend who completes their first eligible study, plus a 10% lifetime dividend on their survey earnings.',
    detailedAnswer: [
      'Every member receives a personalized referral code and direct share link in the "Invite & Earn 300" tab.',
      'When your friend registers and completes their first eligible survey, you receive a 300 coin reward. Additionally, you earn an ongoing 10% dividend on all survey coins they accumulate, credited automatically without deducting from their payout.',
      'Referral earnings undergo the same monthly quality review before transferring to your Redeemable Wallet on the 1st of each month.',
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
    shortAnswer: 'Sponsoring brands receive aggregated research reports, verbatim quotations, and transcribed audio feedback without your private contact or payment details.',
    detailedAnswer: [
      'Your account security is our priority. Sponsoring brands receive aggregated statistical trends, verbatim answers, and transcribed feedback for market research. Private account identifiers (passwords, emails, payment details) are never sold or shared with brand clients.',
      'Because verbatim answers and spoken audio snippets may reflect individual personal perspectives, responses are not described as completely anonymous. You maintain full control over what personal information you disclose in free-text and audio answers.',
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
  const [calcCoins, setCalcCoins] = useState<number>(2000);

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

  const calculatedUsd = (calcCoins / 100).toFixed(2);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-10 animate-fadeIn text-slate-900">
      <SEOHead
        title="Frequently Asked Questions (FAQ) - Coin Conversion, Payouts & Eligibility"
        description="Clear answers to common questions about Voice Flow 360: 100 coins = $1 USD conversion, 2,000 coin ($20) minimum withdrawal for bank transfer and cryptocurrency, monthly approval on the 1st of each month, and age eligibility."
        keywords={[
          'voice flow 360 faq',
          '100 coins equals 1 dollar',
          'coin conversion rate',
          'survey payout threshold',
          '2000 coins 20 dollars',
          'survey eligibility requirements age 18',
          'bank transfer cashout processing 2-5 days',
          'crypto withdrawal 24-48 hours',
          'monthly reward approval 1st of month',
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
          Clear, transparent rules regarding our reward coins valuation (100 Coins = $1.00 USD), 1st-of-the-month approval cycle, and standardized 2,000 Coins ($20.00 USD) minimum cashout policy across bank transfers and cryptocurrency. Eligible participants must be at least 18 years old and meet the applicable age-of-majority requirement.
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
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Monthly Approval</p>
            <p className="text-xl font-extrabold text-slate-900">1st of Every Month</p>
            <p className="text-xs text-purple-700 font-semibold">Only approved coins become redeemable</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
            <Award className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Minimum Withdrawal</p>
            <p className="text-xl font-extrabold text-slate-900">2,000 Coins ($20.00)</p>
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
                Coin Conversion &amp; Withdrawal Calculator
              </h2>
              <p className="text-slate-300 text-xs sm:text-sm">
                Calculate your estimated USD cash value (100 Coins = $1.00 USD) and check withdrawal eligibility against our standardized 2,000 coin ($20.00 USD) minimum threshold.
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 text-right shrink-0">
              <span className="text-xs text-purple-200 font-medium block">Estimated Cash Value</span>
              <span className="text-2xl sm:text-3xl font-extrabold text-amber-300">
                ${calculatedUsd} <span className="text-sm font-normal text-white">USD</span>
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs text-slate-300">
              <span>Adjust Coin Amount:</span>
              <span className="font-extrabold text-white text-sm">
                {calcCoins.toLocaleString()} coins (${calculatedUsd} USD)
              </span>
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
              <span>500 coins ($5.00)</span>
              <span>2,000 coins ($20.00 min withdrawal)</span>
              <span>5,000 coins ($50.00)</span>
              <span>10,000 coins ($100.00)</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="bg-white/5 rounded-xl p-3 border border-white/10 text-center">
              <span className="text-[11px] text-slate-300 block">Bank Transfer (Min 2,000)</span>
              <span className={`text-xs sm:text-sm font-bold block mt-1 ${calcCoins >= 2000 ? 'text-emerald-400' : 'text-amber-300'}`}>
                {calcCoins >= 2000 ? 'Eligible ($20+) • 2–5 days' : `Needs ${(2000 - calcCoins).toLocaleString()} more`}
              </span>
            </div>
            <div className="bg-white/5 rounded-xl p-3 border border-white/10 text-center">
              <span className="text-[11px] text-slate-300 block">Crypto USDT/BTC (Min 2,000)</span>
              <span className={`text-xs sm:text-sm font-bold block mt-1 ${calcCoins >= 2000 ? 'text-emerald-400' : 'text-amber-300'}`}>
                {calcCoins >= 2000 ? 'Eligible ($20+) • 24–48 hrs' : `Needs ${(2000 - calcCoins).toLocaleString()} more`}
              </span>
            </div>
            <div className="bg-white/5 rounded-xl p-3 border border-white/10 text-center">
              <span className="text-[11px] text-slate-300 block">Conversion Rate</span>
              <span className="text-xs sm:text-sm font-bold text-amber-300 block mt-1">
                100 Coins = $1.00 USD
              </span>
            </div>
            <div className="bg-white/5 rounded-xl p-3 border border-white/10 text-center">
              <span className="text-[11px] text-slate-300 block">Monthly Approval</span>
              <span className="text-xs sm:text-sm font-bold text-purple-300 block mt-1">
                1st of Every Month
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
              { id: 'conversion', label: 'Coin Conversion' },
              { id: 'payouts', label: 'Payouts & Cashout' },
              { id: 'eligibility', label: 'Participation Eligibility' },
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
              Try searching with broader terms like "conversion", "bank transfer", "coins", or switch category filters.
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
              Browse active brand research studies, contribute your insights, and withdraw your approved earnings once reaching the 2,000 coin ($20.00 USD) threshold via Direct Bank Transfer or Cryptocurrency.
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
