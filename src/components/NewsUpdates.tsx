import React, { useState } from 'react';
import { SEOHead } from './SEOHead';
import { AdSenseAd } from './AdSenseAd';
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
    { id: 'releases', label: 'Feature Releases' },
    { id: 'payouts', label: 'Payout Reports' },
    { id: 'partnerships', label: 'New Brands' },
    { id: 'community', label: 'Community' },
  ];

  const articles = [
    {
      id: 'news-1',
      title: 'Voice Flow 360 Ecosystem Upgrade: Instant Public Earning & Speed Quizzes',
      date: 'September 2026',
      tag: 'releases',
      tagLabel: 'Feature Release',
      tagColor: 'bg-purple-100 text-purple-800',
      icon: Sparkles,
      iconColor: 'bg-purple-600',
      readTime: '2 min read',
      summary:
        'We have completely overhauled the entry gateway! All visitors can now dive straight into the Survey Catalog and Speed Quizzes with zero upfront registration friction. Start earning coins on question #1.',
      details: [
        'Instant guest-to-member persistent wallet synchronization',
        'Speed trivia challenges with instant correct-answer bonus multipliers',
        'Enhanced mobile chat interface with adaptive question bubbles',
      ],
    },
    {
      id: 'news-2',
      title: 'Monthly Payout Record: Over $145,000 Dispatched to Global Survey Participants',
      date: 'August 2026',
      tag: 'payouts',
      tagLabel: 'Payout Report',
      tagColor: 'bg-emerald-100 text-emerald-800',
      icon: Coins,
      iconColor: 'bg-emerald-600',
      readTime: '3 min read',
      summary:
        'Last month was our biggest reward distribution to date! Over 18,200 cashout requests were successfully fulfilled across Direct Bank Transfer and Cryptocurrency rails with zero platform fees.',
      details: [
        'Average withdrawal processing speed reduced to under 4 hours',
        'Zero redemption fees on all standard coin transfers',
        'Top earner of the month accrued 24,500 coins (~$245.00)',
      ],
    },
    {
      id: 'news-3',
      title: '6 Global Tech & Lifestyle Brands Join Voice Flow 360 Partner Directory',
      date: 'August 2026',
      tag: 'partnerships',
      tagLabel: 'New Brands',
      tagColor: 'bg-indigo-100 text-indigo-800',
      icon: Megaphone,
      iconColor: 'bg-indigo-600',
      readTime: '2 min read',
      summary:
        'We welcome expanded conversational survey campaigns from Nike, Spotify, Tesla, Starbucks, Apple, and Netflix. Check out the dedicated Brand Insights portal to see live research metrics.',
      details: [
        'Exclusive 1.5x coin bonuses on AI & Sustainability feedback categories',
        'Direct brand-sponsored mystery drops available daily at 12:00 PM UTC',
        'Direct qualitative feedback synthesized for product R&D teams',
      ],
    },
    {
      id: 'news-4',
      title: 'Platform Security & Anti-Fraud Engine 2.0 Deployment',
      date: 'July 2026',
      tag: 'releases',
      tagLabel: 'Security',
      tagColor: 'bg-amber-100 text-amber-800',
      icon: ShieldCheck,
      iconColor: 'bg-amber-600',
      readTime: '3 min read',
      summary:
        'To ensure our research studies receive 100% human, authentic perspectives and that honest community members get maximum rewards, we deployed our upgraded AI bot-filtration protocols.',
      details: [
        'Zero impact on genuine conversational survey takers',
        'Sub-second payout risk verifications without withholding user balances',
        'Secure TLS/HTTPS transport encryption for survey submissions',
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
        title="News, Earning Strategies & Platform Updates"
        description="Stay updated with the latest Voice Flow 360 platform releases, new paying brand partners, payout reports, and high-yield survey drops."
        keywords={[
          'survey platform updates',
          'earning strategies',
          'survey drops news',
          'payout milestone reports',
          'new brand partnerships',
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
            Stay informed on platform enhancements, payout milestones, and upcoming survey drops.
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

      {/* Google AdSense In-Article Responsive Banner */}
      <AdSenseAd
        slot="9876543210"
        format="auto"
        label="Advertisement"
        adPlacementKey="enableNewsFeedAd"
      />

      {/* Newsletter / Notifications Box */}
      <div className="bg-gradient-to-br from-purple-900 via-indigo-900 to-slate-950 text-white rounded-3xl p-8 sm:p-10 shadow-xl space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-amber-300">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-extrabold">Never Miss New Brand Research Study Drops</h3>
            <p className="text-xs text-purple-200 mt-0.5">
              Subscribe to get alerts when verified brand studies and research cohorts launch.
            </p>
          </div>
        </div>

        {subscribed ? (
          <div className="bg-white/10 rounded-2xl p-4 border border-emerald-400/30 flex items-center gap-3 text-emerald-300 text-sm font-bold">
            <CheckCircle className="w-5 h-5" />
            <span>Thank you for subscribing! You will receive priority notifications for newly dropped campaigns.</span>
          </div>
        ) : (
          <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-xl">
            <input
              type="email"
              placeholder="Enter your email for campaign alerts..."
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              required
              className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-xs sm:text-sm text-white placeholder:text-purple-200/60 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:bg-white/15"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg transition-all cursor-pointer whitespace-nowrap"
            >
              Get Campaign Alerts
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
