import React from 'react';
import { SEOHead } from './SEOHead';
import { Link } from './Link';
import { useApp } from '../context/AppContext';
import {
  Coins,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Clock,
  ArrowRight,
  Sparkles,
  DollarSign,
  Building2,
  Wallet,
  Calendar,
  FileText,
  BadgeAlert,
  Mail,
  RefreshCw,
  Eye,
} from 'lucide-react';

export const RewardsAndWithdrawals: React.FC = () => {
  const { settings, currentUser, setCurrentView } = useApp();

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 pb-20 selection:bg-purple-200">
      <SEOHead
        title="Rewards & Withdrawals Policy - Transparent Consumer Compensation | Voice Flow 360"
        description="Comprehensive guide to Voice Flow 360 participant compensation: coin-to-currency conversion rates, acceptance criteria, withdrawal thresholds, payment methods, and dispute procedures."
        canonicalPath="/rewards-and-withdrawals"
      />

      {/* Header Banner */}
      <header className="bg-slate-950 text-white border-b border-slate-800 pt-12 pb-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-800 via-indigo-950 to-transparent" />
        <div className="max-w-5xl mx-auto relative z-10 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-300 text-xs font-bold uppercase tracking-wider">
            <Coins className="w-3.5 h-3.5 text-purple-400" />
            <span>Transparency &amp; Operational Standards</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
            Rewards &amp; Withdrawals
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl mx-auto font-normal">
            We operate an honest, verifiable consumer honorarium system. Learn exactly how research coins are earned, audited, converted, and disbursed to eligible participants.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              100 Coins = $1.00 USD Fixed Ratio
            </span>
            <span>&bull;</span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-indigo-400" />
              Monthly Quality Audit Cycle
            </span>
            <span>&bull;</span>
            <span className="flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-amber-400" />
              Bank Transfer &amp; Crypto Rails
            </span>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 space-y-12">
        {/* Core Conversion & Upfront Disclosure */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
              <DollarSign className="w-5 h-5" />
            </div>
            <h2 className="text-base font-extrabold text-slate-900">Fixed Conversion Rate</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every coin is pegged to an exact, non-fluctuating value: <strong>100 Coins = $1.00 USD</strong> ({settings.coinToUsdRate.toFixed(2)} USD per coin). No algorithmic token dilution or hidden conversion haircuts.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
              <Eye className="w-5 h-5" />
            </div>
            <h2 className="text-base font-extrabold text-slate-900">Upfront Reward Disclosure</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every research questionnaire clearly displays its estimated completion time and exact honorarium credit amount (typically <strong>50 to 300 Coins</strong>) before you begin.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h2 className="text-base font-extrabold text-slate-900">Separation From Ads</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Research honorariums are strictly paid by our enterprise market research budget. <strong>Coins are never awarded for watching or clicking ads</strong>, and ad viewing is never required to participate or withdraw.
            </p>
          </div>
        </section>

        {/* Balance States Explained */}
        <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-2xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Three Distinct Balance States
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              How user balances progress from completed response to disbursement.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600" />
                <h3 className="font-bold text-xs uppercase tracking-wider text-amber-900">1. Pending Review</h3>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                Immediately upon completing a survey, coins enter the Pending Review queue. During the calendar month, responses undergo automated and human quality audits to verify attentiveness, consistency, and completeness.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <h3 className="font-bold text-xs uppercase tracking-wider text-emerald-900">2. Redeemable Wallet</h3>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                On the <strong>1st of every month</strong>, all reviewed and approved survey earnings automatically transfer into your Redeemable Wallet. Only coins in this state are eligible for cashout requests.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-200 space-y-2">
              <div className="flex items-center gap-2">
                <Wallet className="w-4 h-4 text-purple-600" />
                <h3 className="font-bold text-xs uppercase tracking-wider text-purple-900">3. Withdrawn / Disbursed</h3>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                Once a redemption request is submitted and processed, funds are transmitted to your selected disbursement destination and marked as Withdrawn in your auditable ledger.
              </p>
            </div>
          </div>
        </section>

        {/* Eligibility & Acceptance Criteria vs Reasons for Rejection */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 text-emerald-700 font-black text-sm uppercase tracking-wide">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>Eligibility &amp; Acceptance Criteria</span>
            </div>
            <ul className="space-y-3 text-xs text-slate-600">
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <span><strong>Age Requirement:</strong> You must be at least 18 years of age (or the legal age of majority in your jurisdiction) to participate.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <span><strong>Authentic Opinions:</strong> Provide coherent, thoughtful feedback based on genuine personal experiences with the product or category.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <span><strong>Attentiveness:</strong> Read prompts completely and provide relevant qualitative input rather than repetitive filler text.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <span><strong>Complete Questionnaires:</strong> Answer all mandatory questions in the conversational survey flow to reach the final confirmation checkpoint.</span>
              </li>
            </ul>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 text-rose-700 font-black text-sm uppercase tracking-wide">
              <BadgeAlert className="w-5 h-5 text-rose-600" />
              <span>Reasons Responses May Be Rejected</span>
            </div>
            <ul className="space-y-3 text-xs text-slate-600">
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                <span><strong>Speeding / Rushed Input:</strong> Completing questionnaires in an impossibly short timeframe that precludes reading questions.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                <span><strong>Contradictory Answers:</strong> Submitting mutually conflicting responses across cross-check questions (e.g. claiming to never own a device, then rating daily device usage).</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                <span><strong>AI / Automated Spam:</strong> Submitting copy-pasted LLM filler, gibberish strings, or using automated headless browser scripts.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                <span><strong>Duplicate Submissions:</strong> Operating multiple accounts or submitting multiple responses to the same study campaign.</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Withdrawal Thresholds & Payment Methods */}
        <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-2xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Withdrawal Thresholds, Methods &amp; Processing Times
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Source of truth for operational disbursement options.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead>
                <tr className="border-b border-slate-200 text-slate-900 font-bold uppercase tracking-wider text-[11px] bg-slate-50/60">
                  <th className="py-3 px-4">Payment Rail</th>
                  <th className="py-3 px-4">Minimum Cashout</th>
                  <th className="py-3 px-4">Supported Countries</th>
                  <th className="py-3 px-4">Platform Fee</th>
                  <th className="py-3 px-4">Expected Processing Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-purple-600" />
                    <span>Bank Transfer (ACH / SEPA / Wire)</span>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-800">2,000 Coins ($20.00 USD)</td>
                  <td className="py-3.5 px-4">US, UK, EU, Canada, Australia &amp; 40+ countries</td>
                  <td className="py-3.5 px-4 font-semibold text-emerald-600">$0.00 (Zero platform fee)</td>
                  <td className="py-3.5 px-4">2 to 5 business days after 1st of month</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-amber-600" />
                    <span>Cryptocurrency (USDT / BTC)</span>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-800">2,000 Coins ($20.00 USD)</td>
                  <td className="py-3.5 px-4">Global (subject to local crypto regulations)</td>
                  <td className="py-3.5 px-4 font-semibold text-emerald-600">Standard network miner fee</td>
                  <td className="py-3.5 px-4">24 to 48 hours after 1st of month</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-[11px] text-slate-400 italic">
            Note: Intermediary recipient bank fees may vary by destination institution. We do not invent payout methods or rates; only operational rails are offered.
          </p>
        </section>

        {/* Identity, Inactivity & Dispute Process */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-3">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <span>Identity Verification</span>
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              To comply with anti-fraud safeguards and international financial standards, accounts may undergo email confirmation and duplicate recipient verification prior to processing large disbursements.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-3">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>Inactivity &amp; Expiration</span>
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Earned coins do not expire as long as your account remains active. An account is considered active if you sign in or complete at least one activity within any <strong>12-month period</strong>.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-3">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Mail className="w-4 h-4 text-purple-600" />
              <span>Dispute &amp; Support Process</span>
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              If a response is rejected or you have a balance discrepancy, you may appeal within <strong>14 business days</strong> by emailing <a href="mailto:support@voiceflow360.com" className="text-purple-600 underline font-bold">support@voiceflow360.com</a> with your session details for secondary human review.
            </p>
          </div>
        </section>

        {/* Call to action */}
        <section className="bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-950 text-white p-8 rounded-3xl text-center space-y-4">
          <h2 className="text-2xl font-black tracking-tight">Ready to Share Your Perspectives?</h2>
          <p className="text-xs sm:text-sm text-purple-200 max-w-xl mx-auto leading-relaxed">
            Join conversational research studies matching your demographic profile. Help businesses understand consumer priorities and receive verified research compensation.
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            {currentUser ? (
              <>
                <button
                  onClick={() => setCurrentView('surveys')}
                  className="px-6 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl text-xs sm:text-sm shadow-md transition-all cursor-pointer"
                >
                  Browse Available Studies
                </button>
                <button
                  onClick={() => setCurrentView('earnings')}
                  className="px-6 py-3 bg-white text-purple-950 font-black rounded-xl text-xs sm:text-sm shadow-md transition-all cursor-pointer hover:bg-purple-50"
                >
                  Go to My Earnings Wallet
                </button>
              </>
            ) : (
              <button
                onClick={() => setCurrentView('register')}
                className="px-6 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl text-xs sm:text-sm shadow-md transition-all cursor-pointer"
              >
                Create Panelist Account
              </button>
            )}
            <Link
              to="/how-to-earn"
              className="px-5 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-xs sm:text-sm border border-white/20 transition-all"
            >
              How Studies Work
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
};

export default RewardsAndWithdrawals;
