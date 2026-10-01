import React, { useState } from 'react';
import { SEOHead } from './SEOHead';
import {
  Coins,
  MessageSquare,
  HelpCircle,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  ArrowRight,
  Calculator,
  Sparkles,
  CreditCard,
  Award,
  BookOpen,
  Mic,
  AlertCircle,
  DollarSign,
  Target,
  Check,
  Building2,
  FileCheck,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const HowToEarn: React.FC = () => {
  const { setCurrentView, settings, currentUser } = useApp();
  const [studiesPerWeek, setStudiesPerWeek] = useState(5);
  const [quickPollsPerWeek, setQuickPollsPerWeek] = useState(4);
  const [includeContinuityBonus, setIncludeContinuityBonus] = useState(true);

  // Compensation calculations based on standard research credits
  const avgStudyCredits = 100; // credits
  const avgPollCredits = 40; // credits
  const continuityBonusCredits = 150; // weekly continuity bonus

  const weeklyCredits =
    studiesPerWeek * avgStudyCredits +
    quickPollsPerWeek * avgPollCredits +
    (includeContinuityBonus ? continuityBonusCredits : 0);

  const monthlyCredits = weeklyCredits * 4;
  const monthlyUsd = (monthlyCredits * settings.coinToUsdRate).toFixed(2);
  const weeklyUsd = (weeklyCredits * settings.coinToUsdRate).toFixed(2);

  const steps = [
    {
      step: '01',
      title: 'Study Matching & Criteria Verification',
      description: 'Explore active consumer research studies matched to your demographic profile. Each study displays its estimated completion time, target topic, and research credit allocation.',
      icon: Target,
      color: 'bg-purple-600',
    },
    {
      step: '02',
      title: 'Conversational Feedback & Open Discourse',
      description: 'Engage with our structured conversational interface. Provide authentic qualitative responses, Likert-scale evaluations, and brand perception scores at your natural pace.',
      icon: MessageSquare,
      color: 'bg-indigo-600',
    },
    {
      step: '03',
      title: 'Methodology Review & Data Auditing',
      description: 'To maintain empirical standards for enterprise clients, survey responses undergo automated quality auditing to screen out rushed inputs, bot scripts, and conflicting statements.',
      icon: ShieldCheck,
      color: 'bg-amber-500',
    },
    {
      step: '04',
      title: 'Honorarium Credit & Flexible Disbursement',
      description: 'Verified research credits accrue in your panelist account. Disburse credits as electronic gift vouchers (500 credits min), PayPal transfers (500 credits min), or international bank wire (10,000 credits min). Participate in studies and earn rewards.',
      icon: CreditCard,
      color: 'bg-emerald-600',
    },
  ];

  const studyTypes = [
    {
      title: 'In-Depth Brand Studies',
      reward: '100 - 300 Credits',
      time: '4 - 8 Minutes',
      desc: 'Comprehensive market evaluations exploring product features, customer satisfaction (CSAT), and brand positioning for Fortune 500 enterprises.',
      icon: Building2,
      accent: 'border-purple-200 bg-purple-50/40 text-purple-700',
    },
    {
      title: 'Consumer Sentiment Quick Polls',
      reward: '35 - 75 Credits',
      time: '1 - 2 Minutes',
      desc: 'Rapid pulse questionnaires assessing trending cultural phenomena, advertising reception, and emerging industry topics.',
      icon: HelpCircle,
      accent: 'border-indigo-200 bg-indigo-50/40 text-indigo-700',
    },
    {
      title: 'Product Usability & Concept Feedback',
      reward: '80 - 250 Credits',
      time: '3 - 6 Minutes',
      desc: 'Structured evaluation of prototypes, digital interfaces, packaging concepts, and pricing acceptability.',
      icon: Award,
      accent: 'border-emerald-200 bg-emerald-50/40 text-emerald-700',
    },
    {
      title: 'Panel Continuity & Profile Audits',
      reward: '50 - 150 Credits',
      time: '2 - 3 Minutes',
      desc: 'Periodic demographic refreshes that verify household composition, purchasing authority, and geographic accuracy for research weighting.',
      icon: FileCheck,
      accent: 'border-pink-200 bg-pink-50/40 text-pink-700',
    },
  ];

  const qualityStandards = [
    {
      title: 'Thoughtful Qualitative Detail',
      desc: 'High-value market research relies on qualitative depth. Complete open-text fields with clear, descriptive rationale explaining your consumer preferences.',
      icon: TrendingUp,
    },
    {
      title: 'Consistent Longitudinal Profile',
      desc: 'Empirical datasets require consistent demographic data. Ensure your employment status, household brackets, and regional location remain accurately maintained.',
      icon: ShieldCheck,
    },
    {
      title: 'Unhurried Reading & Attention Verification',
      desc: 'Our data pipeline employs automated timing benchmarks. Taking time to read questions thoroughly prevents automated speed-clicking disqualifications.',
      icon: Sparkles,
    },
    {
      title: 'Transparent Payment Disbursement',
      desc: 'Panelist credits are reviewed under standardized research guidelines. Electronic disbursements to verified accounts are processed within 24 to 48 business hours.',
      icon: CreditCard,
    },
  ];

  const howToEarnFAQSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'How does Voice Flow 360 compensate research panelists?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Panelists receive research credits (honorariums) for completed and quality-verified market research studies, surveys, and polls. Each study clearly states its credit allocation before participation.',
        },
      },
      {
        '@type': 'Question',
        name: 'What are the minimum disbursement thresholds?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Panelists can redeem research credits starting at 500 credits for electronic gift vouchers or PayPal transfers. Direct bank wire transfers carry a 10,000 credits minimum threshold due to international interbank processing standards. Participate in studies and earn rewards.',
        },
      },
      {
        '@type': 'Question',
        name: 'How does Voice Flow 360 verify survey response quality?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Our platform utilizes algorithmic attention checks, completion velocity filters, and qualitative text analysis to ensure research data meets enterprise quality standards before study honorariums are finalized.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is participation considered employment?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No. Panel participation is voluntary independent market research. Credits represent research honorariums and participant compensation for your time and consumer perspective, not salaried wages.',
        },
      },
    ],
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12 space-y-12 animate-fadeIn">
      <SEOHead
        title="Panelist Compensation & Research Honorarium Guide | Voice Flow 360"
        description="Understand how Voice Flow 360 compensates verified consumer panelists with research honorariums and credits for completed market studies, brand surveys, and focus questionnaires."
        keywords={[
          'consumer panel compensation',
          'market research honorarium',
          'verified survey credits',
          'consumer sentiment panel',
          'survey payout thresholds',
          'voice flow 360 panelist guide',
          'ethical consumer research',
        ]}
        canonicalPath="/how-to-earn"
        structuredData={howToEarnFAQSchema}
      />

      {/* Header Banner */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-100 border border-purple-200 text-xs font-bold text-purple-800">
          <Coins className="w-4 h-4 text-purple-700" />
          <span>Brand Research Studies &amp; Panelist Rewards</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          How Brand Research Studies &amp; <span className="text-purple-600">Honorarium Rewards</span> Work
        </h1>
        <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
          Be a part of brand research studies and earn rewards. Voice Flow 360 connects verified consumer panelists with institutional, brand, and academic market research studies, offering fair and transparent compensation for your authentic consumer perspective.
        </p>
      </div>

      {/* 4-Step Verification & Compensation Process */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {steps.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-all relative flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-2xl ${item.color} text-white flex items-center justify-center shadow-sm`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-2xl font-black text-slate-200 tracking-tight">
                    {item.step}
                  </span>
                </div>
                <h3 className="font-extrabold text-slate-900 text-lg mb-2">{item.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{item.description}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs font-semibold text-purple-600">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Standardized Panel Protocol</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Research Honorarium Simulator */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950 text-white rounded-3xl p-6 sm:p-10 shadow-xl border border-purple-800/30">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center gap-2 text-purple-300 text-xs font-bold uppercase tracking-wider">
              <Calculator className="w-4 h-4" />
              <span>Panelist Participation Simulator</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Estimate Your Weekly &amp; Monthly Research Compensation
            </h2>

            <p className="text-purple-200 text-sm leading-relaxed">
              Calculate typical research honorarium credit allocations based on your anticipated weekly participation across verified brand and consumer sentiment studies.
            </p>

            {/* Slider 1: Studies per week */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-semibold">
                <span className="text-purple-200">Brand Studies per week (~100 credits each)</span>
                <span className="text-amber-300 font-bold">{studiesPerWeek} Studies</span>
              </div>
              <input
                type="range"
                min="0"
                max="15"
                value={studiesPerWeek}
                onChange={(e) => setStudiesPerWeek(Number(e.target.value))}
                className="w-full accent-purple-400 bg-white/20 h-2 rounded-lg cursor-pointer"
              />
            </div>

            {/* Slider 2: Quick polls per week */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-semibold">
                <span className="text-purple-200">Quick Pulse Polls per week (~40 credits each)</span>
                <span className="text-amber-300 font-bold">{quickPollsPerWeek} Polls</span>
              </div>
              <input
                type="range"
                min="0"
                max="14"
                value={quickPollsPerWeek}
                onChange={(e) => setQuickPollsPerWeek(Number(e.target.value))}
                className="w-full accent-purple-400 bg-white/20 h-2 rounded-lg cursor-pointer"
              />
            </div>

            {/* Continuity bonus toggle */}
            <label className="flex items-center gap-3 text-sm text-purple-200 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={includeContinuityBonus}
                onChange={(e) => setIncludeContinuityBonus(e.target.checked)}
                className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 accent-purple-500"
              />
              <span>Include Weekly Panel Continuity &amp; Quality Bonus (+150 credits/wk)</span>
            </label>
          </div>

          {/* Results Card */}
          <div className="lg:col-span-5 bg-white/10 backdrop-blur-md rounded-2xl p-6 sm:p-8 border border-white/15 space-y-6 text-center">
            <div>
              <span className="text-xs font-semibold text-purple-200 uppercase tracking-wider block mb-1">
                Estimated Monthly Research Honorarium
              </span>
              <div className="text-4xl sm:text-5xl font-black text-amber-300 tracking-tight">
                {monthlyCredits.toLocaleString()}
              </div>
              <span className="text-xs text-purple-200 mt-1 block">
                Research Credits / month • Participate in studies and earn rewards
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/10">
              <div className="bg-white/5 rounded-xl p-3">
                <span className="text-[11px] text-purple-200 block">Weekly Estimate</span>
                <span className="text-lg font-extrabold text-white">+{weeklyCredits} Credits</span>
              </div>
              <div className="bg-white/5 rounded-xl p-3">
                <span className="text-[11px] text-purple-200 block">Studies Total</span>
                <span className="text-lg font-extrabold text-white">{studiesPerWeek + quickPollsPerWeek} / wk</span>
              </div>
            </div>

            <button
              id="calc-start-earning-btn"
              onClick={() => setCurrentView('start-earning')}
              className="w-full py-3.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl text-sm shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>View Available Research Studies</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Multi-Stream Research Participation Categories */}
      <div className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Research Study Modalities
          </h2>
          <p className="text-slate-500 text-sm">
            Diverse market research formats cater to different schedules and consumer areas of expertise.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {studyTypes.map((stream, idx) => {
            const Icon = stream.icon;
            return (
              <div
                key={idx}
                className={`rounded-2xl p-6 border shadow-xs flex flex-col justify-between ${stream.accent}`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-white text-slate-900 shadow-2xs flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-black text-slate-900 bg-white/80 px-2.5 py-1 rounded-full">
                      {stream.reward}
                    </span>
                  </div>
                  <h3 className="font-extrabold text-slate-900 text-base">{stream.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{stream.desc}</p>
                </div>
                <div className="text-[11px] font-bold text-slate-500 mt-4 pt-3 border-t border-slate-200/60">
                  Est. Duration: {stream.time}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quality Standards & Data Integrity Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-sm space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">Panel Quality &amp; Verification Protocol</h3>
            <p className="text-xs text-slate-500">How Voice Flow 360 guarantees verified, publication-grade market insights</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {qualityStandards.map((tip, idx) => {
            const Icon = tip.icon;
            return (
              <div
                key={idx}
                className="bg-slate-50/70 rounded-2xl p-5 border border-slate-200/70 flex items-start gap-3.5"
              >
                <div className="w-9 h-9 rounded-xl bg-white shadow-2xs text-purple-700 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm mb-1">{tip.title}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{tip.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Payout Rails & Thresholds */}
      <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-10 space-y-6 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
              <CreditCard className="w-4 h-4" />
              <span>Compliant Honorarium Rails</span>
            </div>
            <h3 className="text-2xl font-extrabold tracking-tight">Participant Redemption Options</h3>
          </div>
          <button
            id="how-to-earn-cashout-btn"
            onClick={() => setCurrentView('rewards')}
            className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-xs border border-white/20 transition-all cursor-pointer self-start sm:self-auto"
          >
            Review Redemption Center
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          {[
            { name: 'Electronic Gift Vouchers', min: '500 Credits Min', desc: 'Amazon, Target, Walmart digital codes delivered securely to your verified email address.' },
            { name: 'PayPal Electronic Transfer', min: '500 Credits Min', desc: 'Direct electronic transfer to verified PayPal accounts.' },
            { name: 'International Bank Wire (ACH)', min: '10,000 Credits Min', desc: 'Direct banking transfer subject to correspondent banking fees and interbank standards.' },
          ].map((m, idx) => (
            <div key={idx} className="bg-white/5 rounded-2xl p-5 border border-white/10 space-y-2 text-left">
              <div className="text-sm font-bold text-white">{m.name}</div>
              <div className="text-xs text-amber-300 font-semibold">{m.min}</div>
              <p className="text-xs text-slate-300 leading-relaxed">{m.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Quality Code of Conduct */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-sm space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-bold">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Panelist Code of Conduct</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Guidelines for Verified Research Approval
          </h2>
          <p className="text-slate-600 text-sm leading-relaxed">
            Adhering to these simple research protocols ensures your feedback is seamlessly integrated into final published research reports and honorarium credits are approved without delay.
          </p>
        </div>

        {/* Quality Guidelines: Do's and Don'ts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
          <div className="bg-emerald-50/60 rounded-2xl p-5 border border-emerald-200/80 space-y-3">
            <div className="flex items-center gap-2 text-emerald-800 font-extrabold text-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Best Practices for 100% Submission Acceptance (Do's)</span>
            </div>
            <ul className="text-xs text-slate-700 space-y-2">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                <span><strong>Be Specific:</strong> Reference actual product experiences, software usability hurdles, or customer support interactions.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                <span><strong>Answer Completely:</strong> Take the time to respond to all questions until the final study completion confirmation screen appears.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                <span><strong>Maintain Accuracy:</strong> Ensure your profile responses match your genuine consumer purchasing habits and demographic background.</span>
              </li>
            </ul>
          </div>

          <div className="bg-rose-50/60 rounded-2xl p-5 border border-rose-200/80 space-y-3">
            <div className="flex items-center gap-2 text-rose-800 font-extrabold text-sm">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              <span>Prohibited Practices (Data Flags)</span>
            </div>
            <ul className="text-xs text-slate-700 space-y-2">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-600 mt-1.5 shrink-0" />
                <span><strong>Automated or Bot Submissions:</strong> The use of automated scripts, browser macros, or AI auto-fill tools violates research agreements.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-600 mt-1.5 shrink-0" />
                <span><strong>Rushed Speed-Clicking:</strong> Skipping through structured questionnaires in fractions of a second results in automated invalidation.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-600 mt-1.5 shrink-0" />
                <span><strong>Multiple Accounts or Proxies:</strong> Each panelist is restricted to one verified real-world account to protect dataset integrity.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Disclaimer note */}
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-xs text-slate-500 leading-relaxed text-center">
          <strong>Research Honorarium Disclaimer:</strong> Voice Flow 360 compensates panelists solely for voluntary time and feedback contributed to market research studies. Participation does not constitute employment, partnership, or financial investment. Honorarium credits hold no cash value until redeemed through approved disbursement rails in accordance with platform terms.
        </div>

        {/* Actionable Call to Action Banner */}
        <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-800 text-white rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md">
          <div className="space-y-1.5 text-center sm:text-left">
            <h3 className="text-xl sm:text-2xl font-black tracking-tight">
              Ready to Share Your Consumer Perspective?
            </h3>
            <p className="text-purple-100 text-xs sm:text-sm">
              Join over 185,000 verified panelists shaping product roadmaps for the world's leading brands.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
            {currentUser ? (
              <button
                id="how-to-work-start-earning-btn"
                onClick={() => setCurrentView('start-earning')}
                className="px-6 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Join a Brand Research Study</span>
              </button>
            ) : (
              <>
                <button
                  id="how-to-work-signup-btn"
                  onClick={() => setCurrentView('register')}
                  className="px-6 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Join a Study &amp; Earn Rewards</span>
                </button>
                <button
                  id="how-to-work-login-btn"
                  onClick={() => setCurrentView('login')}
                  className="px-5 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-sm border border-white/20 transition-all cursor-pointer"
                >
                  <span>Log In</span>
                </button>
              </>
            )}
            <button
              id="how-to-work-brand-insights-btn"
              onClick={() => setCurrentView('brand-insights')}
              className="px-5 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-sm border border-white/20 transition-all cursor-pointer"
            >
              <span>Explore Brand Insights</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
