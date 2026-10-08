import React, { useState, useMemo } from 'react';
import { SEOHead } from './SEOHead';
import { Link } from './Link';
import { AdSenseAd } from './AdSenseAd';
import { useApp } from '../context/AppContext';
import {
  RESEARCH_METHODOLOGY_ARTICLES,
  EducationalArticle,
} from '../data/researchMethodologyArticles';
import {
  BookOpen,
  Calendar,
  Clock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  FileText,
  Search,
  Sparkles,
  ChevronRight,
  UserCheck,
  HelpCircle,
  Scale,
  BrainCircuit,
  Share2,
} from 'lucide-react';

export const ResearchMethodologyView: React.FC = () => {
  const { showToast, setCurrentView, selectedMethodologySlug, navigateToMethodologyArticle } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const selectedArticle = useMemo(() => {
    const slugOrId = selectedMethodologySlug;
    if (!slugOrId) {
      if (typeof window !== 'undefined') {
        const match = window.location.pathname.match(/^\/research-methodology\/([a-zA-Z0-9_-]+)$/);
        if (match) {
          return RESEARCH_METHODOLOGY_ARTICLES.find((a) => a.slug === match[1] || a.id === match[1]) || null;
        }
      }
      return null;
    }
    return (
      RESEARCH_METHODOLOGY_ARTICLES.find((a) => a.slug === slugOrId || a.id === slugOrId) ||
      null
    );
  }, [selectedMethodologySlug]);

  const categories = useMemo(() => {
    const set = new Set(RESEARCH_METHODOLOGY_ARTICLES.map((a) => a.category));
    return ['all', ...Array.from(set)];
  }, []);

  const filteredArticles = useMemo(() => {
    return RESEARCH_METHODOLOGY_ARTICLES.filter((article) => {
      const matchesCategory =
        activeCategory === 'all' || article.category === activeCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        article.title.toLowerCase().includes(q) ||
        article.summary.toLowerCase().includes(q) ||
        article.category.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  const handleShare = (article: EducationalArticle) => {
    if (typeof window !== 'undefined') {
      if (navigator.share) {
        navigator
          .share({
            title: article.title,
            text: article.summary,
            url: window.location.href,
          })
          .catch(() => {});
      } else {
        navigator.clipboard.writeText(window.location.href);
        showToast('Article link copied to clipboard!', 'success');
      }
    }
  };

  // If a specific article is open
  if (selectedArticle) {
    return (
      <div className="min-h-screen bg-white pb-24 text-slate-900 selection:bg-purple-200">
        <SEOHead
          title={`${selectedArticle.title} | Voice Flow 360 Research Methodology`}
          description={selectedArticle.summary}
          canonicalPath={`/research-methodology/${selectedArticle.slug}`}
        />

        {/* Top Header / Breadcrumb */}
        <div className="bg-slate-900 text-white border-b border-slate-800 py-4 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <nav className="flex items-center gap-2 text-xs font-semibold text-slate-400">
              <button
                onClick={() => navigateToMethodologyArticle(null)}
                className="hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Methodology Hub</span>
              </button>
              <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
              <span className="text-purple-300 truncate max-w-[220px] sm:max-w-md">
                {selectedArticle.title}
              </span>
            </nav>

            <button
              onClick={() => handleShare(selectedArticle)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Share</span>
            </button>
          </div>
        </div>

        {/* Article Container */}
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12">
          <header className="space-y-4 mb-8">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800">
                {selectedArticle.category}
              </span>
              <span className="inline-flex items-center gap-1 text-xs text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Empirical Research Guide
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-[1.15]">
              {selectedArticle.title}
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-medium">
              {selectedArticle.subtitle}
            </p>

            <div className="flex items-center justify-between py-4 border-y border-slate-100 text-xs text-slate-500 font-medium flex-wrap gap-3">
              <div className="flex items-center gap-4 flex-wrap">
                <span>By <strong>{selectedArticle.author}</strong></span>
                <span>&bull;</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Published {selectedArticle.publishedDate}
                </span>
                <span>&bull;</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  {selectedArticle.readTime}
                </span>
              </div>
              <span className="text-[11px] text-slate-400">
                Last reviewed: {selectedArticle.lastUpdated}
              </span>
            </div>
          </header>

          {/* Top Ad Unit (Permitted on Educational Research Guides) */}
          <div className="my-8">
            <AdSenseAd
              slot="methodology-top"
              className="my-0 bg-slate-50 border-slate-200"
              label="Advertisement"
            />
          </div>

          {/* Abstract / Executive Summary */}
          <div className="p-6 bg-purple-50/60 border border-purple-200/80 rounded-2xl mb-8 space-y-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-purple-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-700" />
              <span>Abstract &amp; Methodological Scope</span>
            </h3>
            <p className="text-sm sm:text-base text-purple-950/90 leading-relaxed">
              {selectedArticle.summary}
            </p>
          </div>

          {/* Main Sections */}
          <div className="space-y-10 font-sans text-slate-800 leading-relaxed">
            {selectedArticle.sections.map((sec, idx) => (
              <section key={idx} className="space-y-4">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight pt-2 border-b border-slate-100 pb-2">
                  {sec.heading}
                </h2>
                {sec.content.map((p, pIdx) => (
                  <p key={pIdx} className="text-sm sm:text-base text-slate-700 leading-relaxed">
                    {p}
                  </p>
                ))}

                {sec.callout && (
                  <div className="my-5 p-5 bg-slate-50 border-l-4 border-purple-600 rounded-r-2xl space-y-1.5">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-purple-900">
                      {sec.callout.title}
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                      {sec.callout.body}
                    </p>
                  </div>
                )}
              </section>
            ))}
          </div>

          {/* Mid/Bottom Ad Unit */}
          <div className="my-10">
            <AdSenseAd
              slot="methodology-mid"
              className="my-0 bg-slate-50 border-slate-200"
              label="Advertisement"
            />
          </div>

          {/* Key Takeaways */}
          <section className="my-10 p-6 sm:p-8 bg-emerald-50/60 border border-emerald-200/80 rounded-3xl space-y-4">
            <div className="flex items-center gap-2 text-emerald-900 font-black text-base">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <h3>Core Methodological Takeaways</h3>
            </div>
            <ul className="space-y-2.5 text-xs sm:text-sm text-emerald-950">
              {selectedArticle.keyTakeaways.map((takeaway, tIdx) => (
                <li key={tIdx} className="flex items-start gap-2.5 leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-2 shrink-0" />
                  <span>{takeaway}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Methodological Limitations Box */}
          <section className="my-8 p-6 bg-slate-50 border border-slate-200 rounded-3xl space-y-2">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-xs uppercase tracking-wider">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <span>Limitations &amp; Boundary Conditions</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {selectedArticle.limitations}
            </p>
          </section>

          {/* Bottom Back Button */}
          <div className="pt-8 border-t border-slate-200 flex items-center justify-between">
            <button
              onClick={() => navigateToMethodologyArticle(null)}
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-2"
            >
              <span>&larr; Back to Methodology Library</span>
            </button>
            <button
              onClick={() => setCurrentView('brand-research-studies')}
              className="px-5 py-2.5 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 text-xs font-bold transition-all cursor-pointer"
            >
              Explore Brand Studies &rarr;
            </button>
          </div>
        </article>
      </div>
    );
  }

  // Hub / Index View
  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 pb-20 selection:bg-purple-200">
      <SEOHead
        title="Research Methodology & Educational Resources | Voice Flow 360"
        description="Explore in-depth educational resources covering conversational survey architecture, response quality auditing, sample size interpretations, ethical participant compensation, and product decision synthesis."
        canonicalPath="/research-methodology"
      />

      {/* Header Banner */}
      <header className="bg-slate-950 text-white border-b border-slate-800 pt-12 pb-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-800 via-indigo-950 to-transparent" />
        <div className="max-w-5xl mx-auto relative z-10 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-300 text-xs font-bold uppercase tracking-wider">
            <BrainCircuit className="w-3.5 h-3.5 text-purple-400" />
            <span>Academic Rigor &amp; Empirical Standards</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
            Research Methodology &amp; Educational Library
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl mx-auto font-normal">
            Understand the scientific, statistical, and operational foundations behind modern conversational consumer research, quality auditing, and ethical participant compensation.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Audited Quality Checks
            </span>
            <span>&bull;</span>
            <span className="flex items-center gap-1.5">
              <Scale className="w-4 h-4 text-indigo-400" />
              Statistical Power Standards
            </span>
            <span>&bull;</span>
            <span className="flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-amber-400" />
              Transparent Participant Compensation
            </span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 space-y-10">
        {/* Search & Category Filter Bar */}
        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search methodology topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  activeCategory === cat
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                {cat === 'all' ? 'All Guides' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Guides List */}
        <div className="space-y-6">
          {filteredArticles.map((article) => (
            <article
              key={article.id}
              onClick={() => navigateToMethodologyArticle(article.slug)}
              className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-2xs hover:shadow-md transition-all cursor-pointer group space-y-4"
            >
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200/60">
                    {article.category}
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
                    <Clock className="w-3.5 h-3.5" />
                    {article.readTime}
                  </span>
                </div>
                <span className="text-xs text-slate-400 font-medium">
                  {article.publishedDate}
                </span>
              </div>

              <div className="space-y-2">
                <h2 className="text-lg sm:text-2xl font-black text-slate-900 group-hover:text-purple-600 transition-colors leading-tight">
                  <Link
                    to={`/research-methodology/${article.slug}`}
                    className="hover:underline text-inherit"
                    onClick={(e) => {
                      e.preventDefault();
                      navigateToMethodologyArticle(article.slug);
                    }}
                  >
                    {article.title}
                  </Link>
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                  {article.summary}
                </p>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-slate-100 text-xs">
                <span className="text-slate-500 font-medium">
                  Author: <strong className="text-slate-700">{article.author}</strong>
                </span>
                <span className="font-bold text-purple-600 group-hover:text-purple-700 flex items-center gap-1">
                  <span>Read Analysis</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </article>
          ))}
        </div>

        {/* Ad Placement Container (Allowed on Educational Library Index) */}
        <div className="my-8">
          <AdSenseAd
            slot="methodology-index-bottom"
            className="my-0 bg-white border-slate-200 shadow-2xs"
            label="Advertisement"
          />
        </div>
      </main>
    </div>
  );
};

export default ResearchMethodologyView;
