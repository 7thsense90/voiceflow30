import React, { useState } from 'react';
import { SEOHead } from './SEOHead';
import {
  Megaphone,
  Sparkles,
  Calendar,
  Gift,
  Coins,
  ShieldCheck,
  TrendingUp,
  Tag,
  ArrowRight,
  Bell,
  CheckCircle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const NewsUpdates: React.FC = () => {
  const { setCurrentView } = useApp();
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [subscribed, setSubscribed] = useState(false);
  const [emailInput, setEmailInput] = useState('');

  const tags = [
    { id: 'all', label: 'All Updates' },
    { id: 'releases', label: 'Platform Features' },
    { id: 'rewards', label: 'Rewards & Policies' },
    { id: 'editorial', label: 'Editorial & Research' },
    { id: 'security', label: 'Quality & Privacy' },
  ];

  const articles = [
    {
      id: 'news-1',
      title: 'Conversational Survey Engine & Daily Participation Pacing',
      date: 'September 2026',
      tag: 'releases',
      tagLabel: 'Platform Feature',
      tagColor: 'bg-purple-100 text-purple-800',
      icon: Sparkles,
      iconColor: 'bg-purple-600',
      readTime: '2 min read',
      summary:
        'Our interactive chat interface guides participants through structured conversational surveys, logging earned coins directly to pending balances with daily participation pacing to preserve survey attentiveness.',
      details: [
        'Immediate recording of completed survey coins into your Pending Review ledger',
        'Daily participation pacing of up to 5 completed surveys/quizzes to safeguard focus and answer quality',
        'Responsive web application optimized for desktop and mobile browsers without requiring app store downloads',
      ],
    },
    {
      id: 'news-2',
      title: 'Transparent Rewards Policy & Monthly Quality Review Cycle',
      date: 'August 2026',
      tag: 'rewards',
      tagLabel: 'Rewards Policy',
      tagColor: 'bg-emerald-100 text-emerald-800',
      icon: Coins,
      iconColor: 'bg-emerald-600',
      readTime: '2 min read',
      summary:
        'Voice Flow 360 operates a clear, verifiable rewards framework: 100 coins = $1.00 USD, a standardized 2,000 coin ($20.00 USD) withdrawal threshold, and an audited monthly approval cycle.',
      details: [
        'Pending survey credits are held during the calendar month for quality verification before becoming withdrawable',
        'On the 1st of each month, reviewed and approved coins transfer automatically into your Redeemable Wallet',
        'Disbursements via Direct Bank Transfer (expected 2–5 business days after processing) and Cryptocurrency (expected 24–48 hours after processing) with zero platform fees',
      ],
    },
    {
      id: 'news-3',
      title: 'Launch of Independent Brand Intelligence & Editorial Analysis Desk',
      date: 'August 2026',
      tag: 'editorial',
      tagLabel: 'Research Desk',
      tagColor: 'bg-indigo-100 text-indigo-800',
      icon: Megaphone,
      iconColor: 'bg-indigo-600',
      readTime: '2 min read',
      summary:
        'We launched the Brand Insights library, publishing independent editorial analysis of products, brand strategies, and market trends based on publicly available documentation, corporate filings, and verified benchmarks.',
      details: [
        'Direct citations to manufacturer technical specifications and public regulatory filings',
        'Clear editorial labels distinguishing secondary desk research from genuine empirical survey data',
        'Objective product evaluations across consumer electronics, audio, gaming, and software sectors',
      ],
    },
    {
      id: 'news-4',
      title: 'Response Quality Auditing & Privacy Protection Architecture',
      date: 'July 2026',
      tag: 'security',
      tagLabel: 'Quality & Privacy',
      tagColor: 'bg-amber-100 text-amber-800',
      icon: ShieldCheck,
      iconColor: 'bg-amber-600',
      readTime: '2 min read',
      summary:
        'To preserve research integrity for participating organizations, our multi-stage quality review screens submissions for rushed completion times, contradictory responses, repetitive filler, and automated bot activity.',
      details: [
        'Attentiveness and consistency audits applied to survey responses prior to monthly reward approval',
        'Granular cookie consent controls integrated with Google Consent Mode v2, strictly respecting Essential Only choices',
        'Aggregated research and verbatim sentiment reporting ensuring private account credentials and contact details are never sold or shared with external parties',
      ],
    },
  ];

  const filteredArticles = articles.filter(
    (a) => selectedTag === 'all' || a.tag === selectedTag
  );

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput) return;
    setSubscribed(true);
    setEmailInput('');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:py-12 space-y-10 animate-fadeIn">
      <SEOHead
        title="News, Platform Updates & Operational Policies"
        description="Stay updated with the latest Voice Flow 360 platform releases, transparent rewards policy standards, quality review procedures, and independent editorial research publications."
        keywords={[
          'voice flow 360 news',
          'platform releases',
          'rewards policy updates',
          'survey quality review',
          'editorial research publications',
        ]}
        canonicalPath="/news-updates"
      />
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-bold">
            <Megaphone className="w-3.5 h-3.5" />
            <span>Voice Flow 360 Official Bulletin</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            News, Updates &amp; Releases
          </h1>
          <p className="text-sm text-slate-500">
            Stay informed on platform enhancements, rewards policies, and editorial research publications.
          </p>
        </div>

        <button
          onClick={() => setCurrentView('dashboard')}
          className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer self-start sm:self-auto shrink-0"
        >
          <span>Go to Start Earning</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Filter Tags */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {tags.map((t) => (
          <button
            key={t.id}
            onClick={() => setSelectedTag(t.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedTag === t.id
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white border border-slate-200/80 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* News Articles Feed */}
      <div className="space-y-6">
        {filteredArticles.map((article) => {
          const Icon = article.icon;
          return (
            <article
              key={article.id}
              className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs hover:shadow-md transition-all space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className={`w-10 h-10 rounded-2xl ${article.iconColor} text-white flex items-center justify-center shadow-xs`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <span className={`inline-block text-[11px] font-extrabold px-2.5 py-0.5 rounded-full ${article.tagColor}`}>
                      {article.tagLabel}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-400 font-medium">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {article.date}
                  </span>
                  <span>•</span>
                  <span>{article.readTime}</span>
                </div>
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight leading-snug">
                  {article.title}
                </h2>
                <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                  {article.summary}
                </p>
              </div>

              {/* Key Bullet Highlights */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/60 space-y-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Key Highlights
                </span>
                {article.details.map((bullet, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                    <CheckCircle className="w-3.5 h-3.5 text-purple-600 shrink-0 mt-0.5" />
                    <span>{bullet}</span>
                  </div>
                ))}
              </div>
            </article>
          );
        })}
      </div>

      {/* Newsletter / Notifications Box */}
      <div className="bg-gradient-to-br from-purple-900 via-indigo-900 to-slate-950 text-white rounded-3xl p-8 sm:p-10 shadow-xl space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-amber-300">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-extrabold">Stay Informed on Platform &amp; Research Updates</h3>
            <p className="text-xs text-purple-200 mt-0.5">
              Subscribe to get alerts when platform enhancements, rewards policies, and editorial publications are released.
            </p>
          </div>
        </div>

        {subscribed ? (
          <div className="bg-white/10 rounded-2xl p-4 border border-emerald-400/30 flex items-center gap-3 text-emerald-300 text-sm font-bold">
            <CheckCircle className="w-5 h-5" />
            <span>Thank you for subscribing! You will receive notifications for platform releases and editorial publications.</span>
          </div>
        ) : (
          <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-xl">
            <input
              type="email"
              placeholder="Enter your email for platform updates..."
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              required
              className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-xs sm:text-sm text-white placeholder:text-purple-200/60 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:bg-white/15"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg transition-all cursor-pointer whitespace-nowrap"
            >
              Get Updates
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
