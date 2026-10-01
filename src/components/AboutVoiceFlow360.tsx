import React from 'react';
import { SEOHead } from './SEOHead';
import {
  Sparkles,
  MessageSquareQuote,
  ShieldCheck,
  TrendingUp,
  Globe2,
  Users2,
  Building2,
  Cpu,
  Award,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const AboutVoiceFlow360: React.FC = () => {
  const { setCurrentView, campaigns, brands } = useApp();

  const platformStats = [
    { label: 'Active Respondents', value: '185,000+', icon: Users2, color: 'text-purple-600 bg-purple-50' },
    { label: 'Partner Brands', value: `${brands.length > 0 ? brands.length + 420 : 450}+`, icon: Building2, color: 'text-indigo-600 bg-indigo-50' },
    { label: 'Feedback Processed', value: '5.8M+', icon: MessageSquareQuote, color: 'text-emerald-600 bg-emerald-50' },
  ];

  const coreValues = [
    {
      title: 'Conversational First',
      description: 'We replace outdated, tedious questionnaires with intelligent, natural chat interactions that feel like a friendly dialogue.',
      icon: MessageSquareQuote,
      tag: 'Dynamic Dialogue',
    },
    {
      title: 'Empirical Rigor',
      description: 'Every analysis and benchmark is grounded in representative consumer datasets, ensuring statistically validated brand insights.',
      icon: Award,
      tag: 'Verified Data',
    },
    {
      title: 'Enterprise-Grade Intelligence',
      description: 'We transform genuine human feedback into structured sentiment insights for Fortune 500 companies and emerging innovators.',
      icon: Cpu,
      tag: '360° Insights',
    },
    {
      title: 'Data Privacy & Ethics',
      description: 'Your data belongs to you. Responses are aggregated anonymously to preserve consumer privacy while delivering actionable market truths.',
      icon: ShieldCheck,
      tag: '100% Secure',
    },
  ];

  const milestones = [
    { year: '2023', title: 'Platform Genesis', desc: 'Voice Flow 360 launched with 5 pilot consumer brands and 1,000 community testers.' },
    { year: '2024', title: 'Global Multi-Language Engine', desc: 'Expanded conversational survey nodes across 42 countries with instant localized payouts.' },
    { year: '2025', title: 'AI Sentiment Synthesis', desc: 'Integrated real-time semantic analysis to reward deep qualitative user responses.' },
    { year: '2026', title: 'Voice Flow 360 Ecosystem', desc: 'Surpassed 180K active respondents and launched interactive daily quizzes & brand hubs.' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12 space-y-12 animate-fadeIn">
      <SEOHead
        title="About Voice Flow 360 - Brand Research & Market Intelligence"
        description="Learn how Voice Flow 360 conducts independent brand research studies, consumer sentiment benchmarks, and market intelligence across leading global enterprises."
        keywords={[
          'about voice flow 360',
          'brand research studies',
          'consumer market intelligence',
          'empirical sentiment benchmarks',
        ]}
        canonicalPath="/about"
      />
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-purple-950 to-indigo-950 text-white p-8 sm:p-12 shadow-2xl border border-purple-800/30">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-80 h-80 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-purple-200">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Official Portal Profile</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            About <span className="bg-gradient-to-r from-purple-300 via-pink-300 to-amber-200 bg-clip-text text-transparent">Voice Flow 360</span>
          </h1>

          <p className="text-base sm:text-lg text-purple-100/90 leading-relaxed">
            Voice Flow 360 is the premier independent brand intelligence and consumer research platform. We deliver rigorous empirical case studies, consumer sentiment benchmarks, and strategic brand analyses across leading global industries.
          </p>
        </div>
      </div>

      {/* Platform Live Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {platformStats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow"
            >
              <div className={`w-11 h-11 rounded-xl ${stat.color} flex items-center justify-center mb-3`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {stat.value}
              </div>
              <div className="text-xs font-semibold text-slate-500 mt-0.5">{stat.label}</div>
            </div>
          );
        })}
      </div>

      {/* Mission & Vision Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-6 space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-bold">
            <Award className="w-3.5 h-3.5" />
            <span>Our Core Philosophy</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Every Consumer Perspective Holds 360° Value
          </h2>

          <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
            For decades, market research treated participants as numbers in endless grids of radio buttons. <strong className="text-slate-900">Voice Flow 360</strong> radically re-engineers this paradigm into interactive dialogue.
          </p>

          <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
            When you respond to a Voice Flow 360 survey, you are participating in a guided, conversational experience that respects your time, values your unique context, and pays you immediately.
          </p>

          <div className="space-y-2.5 pt-2">
            {[
              'Zero upfront signup requirements — start answering and earning right now',
              'Fair coin conversions with instant cashout via PayPal, Bank, Crypto & Gift Cards',
              'Direct influence on products from global brands before they hit the market',
              'Real-time transparency on survey reward pools and daily multiplier bonuses',
            ].map((item, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-sm text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-6 bg-gradient-to-tr from-purple-50 via-indigo-50/50 to-white rounded-3xl p-6 sm:p-8 border border-purple-100 shadow-sm space-y-6">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Globe2 className="w-5 h-5 text-indigo-600" />
            <span>The 360° Feedback Loop</span>
          </h3>

          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 flex items-start gap-3.5 shadow-2xs">
              <div className="w-8 h-8 rounded-lg bg-purple-600 text-white font-bold flex items-center justify-center shrink-0 text-sm">
                1
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Brands Post Campaigns</h4>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                  Leading innovators launch conversational surveys targeting feedback on features, pricing, branding, and satisfaction.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 flex items-start gap-3.5 shadow-2xs">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-bold flex items-center justify-center shrink-0 text-sm">
                2
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Community Voices Engage</h4>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                  Members enjoy interactive chat queries, sharing opinions at their own pace with smart adaptive dialog branches.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 flex items-start gap-3.5 shadow-2xs">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0 text-sm">
                3
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Instant Micro-Rewards &amp; Action</h4>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                  Coins hit your digital wallet instantly upon completion, while brands receive aggregated insights to refine products.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Core Pillars Grid */}
      <div className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Why Voice Flow 360 Leads The Industry
          </h2>
          <p className="text-slate-500 text-sm">
            Engineered from the ground up for speed, engagement, and reliable payouts.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {coreValues.map((val, idx) => {
            const Icon = val.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-purple-300 transition-colors"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-extrabold tracking-wider uppercase px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                      {val.tag}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-base">{val.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{val.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Evolution Timeline */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-sm space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">Voice Flow 360 Journey</h3>
            <p className="text-xs text-slate-500">Continuous innovation in conversational reward mechanics</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-2">
          {milestones.map((m, idx) => (
            <div key={idx} className="relative border-l-2 border-purple-200 pl-4 space-y-1.5">
              <span className="inline-block text-xs font-black text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-md">
                {m.year}
              </span>
              <h4 className="font-bold text-slate-900 text-sm">{m.title}</h4>
              <p className="text-xs text-slate-500 leading-relaxed">{m.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Call to Action Card */}
      <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-800 rounded-3xl p-8 sm:p-10 text-white text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2 max-w-xl">
          <h3 className="text-2xl font-extrabold tracking-tight">Be a part of brand research studies and earn rewards</h3>
          <p className="text-purple-100 text-sm leading-relaxed">
            Participate in verified brand studies, contribute qualitative consumer insights, and receive transparent honorarium rewards.
          </p>
        </div>

        <button
          id="about-cta-start-earning-btn"
          onClick={() => setCurrentView('dashboard')}
          className="px-8 py-3.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl text-sm shadow-lg hover:shadow-xl transition-all shrink-0 cursor-pointer flex items-center gap-2"
        >
          <span>Join a Brand Research Study</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
