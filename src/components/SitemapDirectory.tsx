import React, { useState } from 'react';
import { SEOHead } from './SEOHead';
import { Link } from './Link';
import {
  FileText,
  Search,
  ExternalLink,
  Building2,
  Compass,
  CheckCircle2,
  BookOpen,
  Sparkles,
  ArrowRight,
  Layers,
} from 'lucide-react';
import { BRAND_STUDY_PATHS } from '../data/brandArticles';
import { RAW_100_BRANDS } from '../data/brandsData';
import { RESEARCH_METHODOLOGY_ARTICLES } from '../data/researchMethodologyArticles';

export const SitemapDirectory: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const coreRoutes = [
    { path: '/brand-case-studies', title: 'Brand Case Studies (Default Landing)', desc: 'Primary landing portal featuring verified consumer sentiment intelligence, benchmark analytics, and brand case studies.' },
    { path: '/', title: 'Home & Brand Sentiment Benchmarks', desc: 'Main entry portal featuring live community earnings and brand insights.' },
    { path: '/about', title: 'About Voice Flow 360', desc: 'Mission, transparent survey operations, and platform statistics.' },
    { path: '/start-earning', title: 'Start Earning (Member Dashboard)', desc: 'Live survey inventory, speed quizzes, and coin balance management.' },
    { path: '/how-to-earn', title: 'Panelist Compensation & Research Honorarium Guide', desc: 'Explanation of research credits, quality auditing, and compliant disbursement rails.' },
    { path: '/for-brands', title: 'For Brands & Enterprises', desc: 'B2B market research inquiries, consumer sentiment studies, and targeted panels.' },
    { path: '/surveys', title: 'Survey Catalog & Live Drops', desc: 'Browse available conversational surveys and sponsor brand drops.' },
    { path: '/quizzes', title: 'Daily Speed Quizzes', desc: 'Test general knowledge and brand trivia for instant coin multipliers.' },
    { path: '/brand-directory', title: 'Brand Directory & Consumer Insights', desc: 'Search through 100+ global brands cataloged on Voice Flow 360 for independent consumer feedback and survey evaluations.' },
    { path: '/product-reviews', title: 'Public Product Reviews (100+ Tech Launches)', desc: 'Genuine community feedback, USD pricing, and manufacturer baseline specifications for newly launched consumer devices.' },
    { path: '/brand-insights', title: 'Brand Insights & Analytics', desc: 'Aggregate customer sentiment scores and industry research.' },
    { path: '/brand-research-studies', title: 'Brand Research Studies Index', desc: 'Long-form editorial research articles evaluating customer satisfaction and brand loyalty.' },
    { path: '/research-methodology', title: 'Research Methodology & Editorial Standards', desc: 'Methodological framework for desk research, empirical synthesis, and consumer panel auditing.' },
    { path: '/rewards-and-withdrawals', title: 'Rewards & Withdrawals Policy', desc: 'Transparent conversion rates (100 Coins = $1.00 USD), minimum thresholds, and disbursement schedules.' },
    { path: '/news', title: 'News, Platform Updates & Operational Policies', desc: 'Platform enhancements, rewards policy standards, and research publications.' },
    { path: '/referrals', title: 'Referral Program', desc: 'Earn 300 bonus coins plus 10% lifetime referral earnings.' },
    { path: '/faq', title: 'Frequently Asked Questions', desc: 'Instant answers to payout thresholds, security audits, and rules.' },
    { path: '/privacy', title: 'Privacy Policy & Disclosures', desc: 'Privacy practices, data rights, and cookie preferences.' },
    { path: '/terms', title: 'Terms of Service', desc: 'Platform rules, user agreements, and anti-fraud guidelines.' },
    { path: '/earnings-disclaimer', title: 'Earnings & Honorarium Disclaimer', desc: 'Disclosure regarding survey availability, response acceptance, and realistic participant expectations.' },
    { path: '/contact', title: 'Contact Support & Inquiries', desc: 'Member assistance and enterprise brand inquiry desk.' },
  ];

  const methodologyArticles = RESEARCH_METHODOLOGY_ARTICLES.map((a) => ({
    path: `/research-methodology/${a.slug}`,
    title: a.title,
    desc: a.summary,
    category: a.category,
    readTime: a.readTime,
  }));

  const brandStudies = Object.entries(BRAND_STUDY_PATHS).map(([brandId, path]) => {
    const matchedBrand = RAW_100_BRANDS.find((b) => b.id === brandId);
    const title = matchedBrand
      ? `${matchedBrand.name} - User Research & Consumer Study`
      : `${brandId.replace('br_', '').replace(/_/g, ' ').toUpperCase()} Research Study`;
    return {
      brandId,
      path,
      title,
      sector: matchedBrand?.sector || 'Consumer Technology',
    };
  });

  const catalogedBrands = RAW_100_BRANDS.map((b) => ({
    path: `/brands/${b.id}`,
    title: `${b.name} (${b.sector})`,
    desc: b.description,
    sector: b.sector,
  }));

  const q = searchQuery.toLowerCase().trim();

  const filteredCore = coreRoutes.filter(
    (r) => !q || r.title.toLowerCase().includes(q) || r.path.toLowerCase().includes(q) || r.desc.toLowerCase().includes(q)
  );

  const filteredMethodology = methodologyArticles.filter(
    (m) => !q || m.title.toLowerCase().includes(q) || m.path.toLowerCase().includes(q) || m.desc.toLowerCase().includes(q) || m.category.toLowerCase().includes(q)
  );

  const filteredStudies = brandStudies.filter(
    (s) => !q || s.title.toLowerCase().includes(q) || s.path.toLowerCase().includes(q) || s.sector.toLowerCase().includes(q)
  );

  const filteredBrands = catalogedBrands.filter(
    (b) => !q || b.title.toLowerCase().includes(q) || b.path.toLowerCase().includes(q) || b.sector.toLowerCase().includes(q)
  );

  const totalPublished =
    coreRoutes.length +
    methodologyArticles.length +
    brandStudies.length +
    catalogedBrands.length;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      <SEOHead
        title="Published Platform Directory & Site Sitemap - Voice Flow 360"
        description={`Comprehensive index and directory of all ${totalPublished} published pages on Voice Flow 360, including core earning portals, research methodology articles, brand research analyses, and cataloged brand profiles.`}
        canonicalPath="/sitemap-directory"
      />

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/15 backdrop-blur-md rounded-full text-xs font-bold text-purple-200 border border-white/20">
            <Compass className="w-3.5 h-3.5" />
            <span>Published Platform Directory &amp; Hierarchy • voiceflow360.com</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Complete Platform Sitemap &amp; Directory
          </h1>
          <p className="text-purple-100 text-sm sm:text-base leading-relaxed">
            Direct access to all <strong>{totalPublished} published pages</strong> across Voice Flow 360 (https://voiceflow360.com).
            This directory provides structured navigation for readers, researchers, and automated crawlers across all active routes.
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <a
              id="view-xml-sitemap-btn"
              href="https://voiceflow360.com/sitemap.xml"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl shadow transition-all cursor-pointer"
            >
              <FileText className="w-4 h-4 text-slate-950" />
              <span>View Live XML Sitemap (Google Format)</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-70" />
            </a>
            <a
              id="view-robots-txt-btn"
              href="https://voiceflow360.com/robots.txt"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white font-bold text-xs rounded-xl border border-white/20 transition-all cursor-pointer"
            >
              <span>View Robots.txt</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-70" />
            </a>
          </div>
        </div>
      </div>

      {/* Filter and Stats Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={`Search all ${totalPublished} published pages...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs font-semibold text-slate-600">
          <span className="flex items-center gap-1.5 text-purple-700">
            <CheckCircle2 className="w-4 h-4" />
            <span>{coreRoutes.length} Core Portals</span>
          </span>
          <span className="flex items-center gap-1.5 text-blue-700">
            <BookOpen className="w-4 h-4" />
            <span>{methodologyArticles.length} Methodology Articles</span>
          </span>
          <span className="flex items-center gap-1.5 text-indigo-700">
            <Sparkles className="w-4 h-4" />
            <span>{brandStudies.length} Research Articles</span>
          </span>
          <span className="flex items-center gap-1.5 text-emerald-700">
            <Building2 className="w-4 h-4" />
            <span>{catalogedBrands.length} Cataloged Brands</span>
          </span>
        </div>
      </div>

      {/* Section 1: Core Platform Hubs */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
              1
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Core Platform Pages ({filteredCore.length})</h2>
              <p className="text-xs text-slate-500">Primary user hubs, earning guides, and legal policies</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCore.map((route, idx) => (
            <Link
              key={idx}
              to={route.path}
              className="p-4 rounded-2xl border border-slate-100 hover:border-purple-200 hover:bg-purple-50/40 transition-all flex flex-col justify-between group"
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-purple-600 bg-purple-50 px-2 py-0.5 rounded">
                    {route.path}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-purple-700 transition-colors">
                  {route.title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">{route.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Section 2: Research Methodology Articles */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              2
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Research Methodology Articles ({filteredMethodology.length})
              </h2>
              <p className="text-xs text-slate-500">
                Standards on survey dynamics, response auditing, sample size power, and panel ethics
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMethodology.map((art, idx) => (
            <Link
              key={idx}
              to={art.path}
              className="p-4 rounded-2xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all flex flex-col justify-between group"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold text-[10px]">
                    {art.category}
                  </span>
                  <span className="text-slate-400 font-mono text-[11px]">{art.readTime}</span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-700 transition-colors line-clamp-2">
                  {art.title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{art.desc}</p>
              </div>

              <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-600 group-hover:text-blue-800">
                <span className="font-mono text-[10px] text-slate-400 truncate max-w-[170px]">{art.path}</span>
                <span className="flex items-center gap-1">
                  <span>Read Analysis</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Section 3: Dedicated In-Depth Brand Research Articles */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
              3
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Brand Research Articles ({filteredStudies.length})
              </h2>
              <p className="text-xs text-slate-500">
                In-depth consumer sentiment analyses and published editorial research
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredStudies.map((study, idx) => (
            <Link
              key={idx}
              to={study.path}
              className="p-3.5 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/40 transition-all flex flex-col justify-between group"
            >
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider bg-indigo-50 px-1.5 py-0.5 rounded">
                  {study.sector}
                </span>
                <h3 className="text-xs font-bold text-slate-900 group-hover:text-indigo-700 transition-colors line-clamp-1">
                  {study.title}
                </h3>
                <p className="text-[11px] font-mono text-slate-400 truncate">{study.path}</p>
              </div>

              <div className="pt-2 mt-2 border-t border-slate-100 flex items-center justify-end text-[11px] font-bold text-indigo-600 group-hover:text-indigo-800">
                <span className="flex items-center gap-1">
                  <span>Read Analysis</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Section 4: Cataloged Brand Directory Profiles */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              4
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Cataloged Brand Profile Hubs ({filteredBrands.length})
              </h2>
              <p className="text-xs text-slate-500">100 cataloged consumer brands with interactive consumer feedback surveys</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
          {filteredBrands.map((b, idx) => (
            <Link
              key={idx}
              to={b.path}
              className="p-2.5 rounded-xl border border-slate-100 hover:border-emerald-300 hover:bg-emerald-50/40 transition-all flex flex-col justify-between group text-center"
            >
              <h4 className="text-xs font-bold text-slate-800 group-hover:text-emerald-700 truncate">
                {b.title}
              </h4>
              <span className="text-[10px] font-mono text-slate-400 truncate mt-0.5">{b.path}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

export default SitemapDirectory;
