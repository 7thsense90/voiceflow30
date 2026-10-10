import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { INITIAL_RESEARCH_ARTICLES } from '../data/initialResearchArticles';
import { AdSenseAd } from './AdSenseAd';
import { Pagination } from './Pagination';
import {
  BookOpen,
  Search,
  Calendar,
  Clock,
  ArrowRight,
  ShieldCheck,
  Building2,
  Sparkles,
  Layers,
  ChevronRight,
  SlidersHorizontal,
} from 'lucide-react';

export const BrandResearchStudiesIndex: React.FC = () => {
  const { researchArticles, navigateToResearchArticle, setCurrentView } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Only display published articles to the public
  const publishedArticles = useMemo(() => {
    const list = researchArticles.filter((a) => a.status === 'published');
    if (list.length === 0) {
      return INITIAL_RESEARCH_ARTICLES.filter((a) => a.status === 'published');
    }
    const ids = new Set(list.map((a) => a.id));
    const missing = INITIAL_RESEARCH_ARTICLES.filter((a) => a.status === 'published' && !ids.has(a.id));
    return missing.length > 0 ? [...list, ...missing] : list;
  }, [researchArticles]);

  // Extract all categories available
  const categories = useMemo(() => {
    const set = new Set<string>();
    publishedArticles.forEach((a) => {
      if (a.category) set.add(a.category);
    });
    return ['All', ...Array.from(set)];
  }, [publishedArticles]);

  // Filtered list
  const filteredArticles = useMemo(() => {
    return publishedArticles.filter((article) => {
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        article.title.toLowerCase().includes(query) ||
        article.brand_name.toLowerCase().includes(query) ||
        article.excerpt.toLowerCase().includes(query) ||
        article.category.toLowerCase().includes(query);

      const matchesCategory =
        selectedCategory === 'All' || article.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [publishedArticles, searchQuery, selectedCategory]);

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 9; // 9 studies per page

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory]);

  const totalPages = Math.max(1, Math.ceil(filteredArticles.length / pageSize));
  const paginatedArticles = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredArticles.slice(start, start + pageSize);
  }, [filteredArticles, currentPage, pageSize]);

  return (
    <div className="min-h-screen bg-slate-50/60 pb-20">
      {/* Editorial Header Hero Banner */}
      <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950 text-white pt-14 pb-16 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-6">
            <button
              onClick={() => setCurrentView('landing')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Home
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <span className="text-purple-300">Brand Research Studies</span>
          </nav>

          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-300 text-xs font-bold uppercase tracking-wider">
              <BookOpen className="w-3.5 h-3.5 text-purple-400" />
              <span>Independent Intelligence Reports</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
              Brand Research Studies
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Independent editorial analysis of consumer products, brand strategies and market trends, based on publicly available sources. Each article includes its sources and limitations.
            </p>

            <div className="flex items-center gap-4 pt-2 text-xs text-slate-400 font-medium">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Independent &amp; Non-Affiliated Analysis
              </span>
              <span>&bull;</span>
              <span className="flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-indigo-400" />
                {publishedArticles.length} Articles
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        {/* Search & Filter Bar */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-lg border border-slate-200/80 mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              id="input-search-research-studies"
              placeholder="Search by brand name, topic, or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all"
            />
          </div>

          {/* Category Tabs / Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
            <SlidersHorizontal className="w-4 h-4 text-slate-400 mr-1 shrink-0 hidden lg:block" />
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Top Reserved Editorial Ad Placement Zone */}
        <div className="mb-10">
          <AdSenseAd
            slot="research-studies-index-top"
            className="my-0 bg-white border-slate-200"
            label="Advertisement"
          />
        </div>

        {/* Articles Grid */}
        {filteredArticles.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs max-w-xl mx-auto my-12">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No Research Studies Found</h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              We couldn't find any studies matching your filter criteria. Try clearing your search query or selecting a different category.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
              }}
              className="mt-4 px-4 py-2 bg-purple-50 text-purple-700 font-bold text-xs rounded-xl hover:bg-purple-100 transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <>
            <div id="articles-grid-top" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {paginatedArticles.map((article) => {
                const formattedDate = article.published_at
                  ? new Date(article.published_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })
                  : 'Recent';

                // Approximate word count and read time
                const wordCount = article.body.split(/\s+/).filter(Boolean).length;
                const readTimeMinutes = Math.max(2, Math.ceil(wordCount / 200));

                return (
                  <article
                    key={article.id}
                    id={`card-study-${article.slug}`}
                    onClick={() => navigateToResearchArticle(article.slug)}
                    className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-purple-200 hover:-translate-y-1 transition-all duration-200 flex flex-col cursor-pointer group"
                  >
                    {/* Cover Photo */}
                    <div className="relative aspect-16/10 overflow-hidden bg-slate-100">
                      <img
                        src={article.cover_image_url}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />

                      {/* Brand Badge */}
                      <div className="absolute top-3.5 left-3.5 flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-xs text-white text-[11px] font-extrabold border border-white/20">
                        <Building2 className="w-3 h-3 text-purple-400" />
                        <span>{article.brand_name}</span>
                      </div>

                      {/* Category Tag */}
                      <div className="absolute top-3.5 right-3.5 px-2.5 py-0.5 rounded-md bg-purple-600/90 backdrop-blur-xs text-white text-[10px] font-bold uppercase tracking-wider">
                        {article.category}
                      </div>

                      {/* Read Time */}
                      <div className="absolute bottom-3 left-3.5 flex items-center gap-1 text-[11px] font-medium text-slate-200">
                        <Clock className="w-3 h-3 text-slate-300" />
                        <span>{readTimeMinutes} min read</span>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2 text-[11px] text-slate-400 font-medium">
                          <span className="inline-block text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                            Editorial Analysis
                          </span>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            <time dateTime={article.published_at || undefined}>{formattedDate}</time>
                          </div>
                        </div>

                        <h2 className="text-lg font-black text-slate-900 group-hover:text-purple-600 transition-colors tracking-tight leading-snug line-clamp-2">
                          {article.title}
                        </h2>

                        <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">
                          {article.excerpt}
                        </p>
                      </div>

                      {/* Card Footer Link */}
                      <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-purple-600 group-hover:text-purple-700">
                        <span>Read Analysis</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* Pagination Controls */}
            {filteredArticles.length > 0 && totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredArticles.length}
                pageSize={pageSize}
                onPageChange={(page) => {
                  setCurrentPage(page);
                  const el = document.getElementById('articles-grid-top');
                  if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }}
                itemName="Articles"
                className="mt-8"
              />
            )}
          </>
        )}

        {/* Bottom Reserved Editorial Ad Placement Zone */}
        <div className="mt-14">
          <AdSenseAd
            slot="research-studies-index-bottom"
            className="my-0 bg-white border-slate-200"
            label="Advertisement"
          />
        </div>

        {/* Persistent Section Integrity Note */}
        <div className="mt-12 p-6 bg-slate-100/80 rounded-2xl border border-slate-200/80 text-center max-w-3xl mx-auto">
          <p className="text-xs text-slate-500 leading-relaxed font-medium">
            <strong>Editorial &amp; Research Independence:</strong> All published reports within this section are prepared independently by Voice Flow 360 analysts. Analyses do not represent an endorsement, sponsorship, or partnership with the depicted companies.
          </p>
        </div>
      </div>
    </div>
  );
};
