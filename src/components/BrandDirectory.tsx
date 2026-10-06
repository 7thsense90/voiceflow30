import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { SEOHead } from './SEOHead';
import { AdSenseAd } from './AdSenseAd';
import { Link } from './Link';
import { Pagination } from './Pagination';
import {
  Building2,
  Search,
  ArrowRight,
  Star,
  BookOpen,
  Calendar,
  Clock,
  CheckCircle2,
  BarChart3,
  Users,
  Compass,
  FileText,
  Layers,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { RAW_100_BRANDS } from '../data/brandsData';
import { getBrandEmpiricalProfile } from '../data/brandEmpiricalProfiles';
import { getUniqueBrandSentiment, BRAND_UNIQUE_INSIGHTS_MAP } from '../data/brandUniqueInsights';
import { getBrandBenchmarkMetric } from '../data/brandBenchmarks';
import { getBrandStudyPath } from '../data/brandArticles';

export const BrandDirectory: React.FC = () => {
  const { brands, campaigns, responses } = useApp();
  const [search, setSearch] = useState('');
  const [selectedSector, setSelectedSector] = useState<string>('all');
  const [activeSort, setActiveSort] = useState<'rating' | 'reviews' | 'name'>('rating');

  const sectors = useMemo(() => {
    const set = new Set<string>();
    brands.forEach((b) => {
      const sec = b.sector || b.category;
      if (sec) set.add(sec);
    });
    return ['all', ...Array.from(set).slice(0, 12)];
  }, [brands]);

  const enrichedBrands = useMemo(() => {
    return brands.map((brand) => {
      const rawMeta = RAW_100_BRANDS.find((b) => b.id === brand.id);
      const brandCampaign = campaigns.find((c) => c.brandId === brand.id);
      const brandResponses = responses.filter(
        (r) => (r.brandId === brand.id || (brandCampaign && r.campaignId === brandCampaign.id)) && !r.isHidden
      );

      let totalRating = 0;
      let ratingCount = 0;
      brandResponses.forEach((r) => {
        r.answers.forEach((ans) => {
          if (typeof ans.answer === 'number' && ans.answer <= 5 && ans.answer >= 1 && ans.questionId.endsWith('_1')) {
            totalRating += ans.answer;
            ratingCount++;
          }
        });
      });

      const sec = rawMeta?.sector || brand.category;
      const avgRating = ratingCount > 0 ? (totalRating / ratingCount).toFixed(1) : null;
      const keySentiment = getUniqueBrandSentiment(brand.id, sec);
      const uniqueInsight = BRAND_UNIQUE_INSIGHTS_MAP[brand.id];
      const studyUrl = getBrandStudyPath(brand.id);

      return {
        brand,
        rawMeta,
        brandCampaign,
        responsesCount: brandResponses.length,
        keySentiment,
        avgRating,
        numericRating: avgRating ? parseFloat(avgRating) : 0,
        studyUrl,
        leadQuote: uniqueInsight?.insightQuote || brand.description,
        keyDrivers: uniqueInsight?.satisfactionDrivers || [],
      };
    });
  }, [brands, campaigns, responses]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    let result = enrichedBrands.filter((item) => {
      const sectorStr = item.brand.sector || (item.rawMeta ? item.rawMeta.sector : item.brand.category);
      const keyProdStr = item.brand.keyProduct || (item.rawMeta ? item.rawMeta.keyProduct : '');

      const matchesSearch =
        !q ||
        item.brand.name.toLowerCase().includes(q) ||
        item.brand.description.toLowerCase().includes(q) ||
        sectorStr.toLowerCase().includes(q) ||
        keyProdStr.toLowerCase().includes(q) ||
        item.keySentiment.toLowerCase().includes(q);

      const matchesSector =
        selectedSector === 'all' || sectorStr === selectedSector;

      return matchesSearch && matchesSector;
    });

    if (activeSort === 'rating') {
      result.sort((a, b) => b.numericRating - a.numericRating);
    } else if (activeSort === 'reviews') {
      result.sort((a, b) => b.responsesCount - a.responsesCount);
    } else if (activeSort === 'name') {
      result.sort((a, b) => a.brand.name.localeCompare(b.brand.name));
    }

    return result;
  }, [enrichedBrands, search, selectedSector, activeSort]);

  // Featured lead article for editorial magazine presentation
  const heroArticle = filtered.length > 0 ? filtered[0] : null;
  const gridArticles = filtered.length > 1 ? filtered.slice(1) : filtered;

  // Pagination for brand publications
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12; // 12 brands per page for a clean 4-row grid

  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedSector, activeSort]);

  const activeItems = selectedSector === 'all' && !search && heroArticle ? gridArticles : filtered;
  const totalPages = Math.max(1, Math.ceil(activeItems.length / pageSize));
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return activeItems.slice(start, start + pageSize);
  }, [activeItems, currentPage, pageSize]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-10 animate-fadeIn">
      <SEOHead
        title="Brand Intelligence & Consumer Research Directory | Voice Flow 360"
        description="Comprehensive empirical research publications and verified consumer evaluation benchmarks across 100 enterprise and consumer brands."
        keywords={[
          'brand intelligence directory',
          'consumer research studies',
          'market analysis publication',
          'brand ratings journal',
          'verified customer sentiment',
          'enterprise consumer benchmarks',
        ]}
        canonicalPath="/brand-directory"
      />

      {/* Editorial Magazine Header */}
      <header className="border-b border-slate-200/80 pb-8 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold tracking-wide border border-slate-200">
            <BookOpen className="w-3.5 h-3.5 text-purple-600" />
            <span>Brand Intelligence Journal &amp; Empirical Research Hub</span>
          </div>

          <div className="flex items-center gap-3 text-xs font-medium text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Updated Quarterly (2026 Edition)</span>
            </span>
            <span className="text-slate-300">•</span>
            <span className="inline-flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              <span>100 Verified Brands Covered</span>
            </span>
          </div>
        </div>

        <div className="max-w-3xl space-y-2.5">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Brand Intelligence &amp; Consumer Insights Directory
          </h1>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed font-normal">
            Independent empirical research articles, verified customer ratings, and strategic market analyses evaluating customer retention, reliability, and satisfaction drivers across 100 global brands.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="pt-3 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search brand research, sectors, flagship products, or market trends..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl shadow-xs text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition-all placeholder:text-slate-400"
              />
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-semibold text-slate-500 shrink-0">Sort by:</span>
              <div className="inline-flex bg-slate-100 p-1 rounded-xl border border-slate-200/80">
                <button
                  onClick={() => setActiveSort('rating')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeSort === 'rating'
                      ? 'bg-white text-purple-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Rating
                </button>
                <button
                  onClick={() => setActiveSort('reviews')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeSort === 'reviews'
                      ? 'bg-white text-purple-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Evaluations
                </button>
                <button
                  onClick={() => setActiveSort('name')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeSort === 'name'
                      ? 'bg-white text-purple-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Name
                </button>
              </div>
            </div>
          </div>

          {/* Quick sector pill filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {sectors.map((sec) => (
              <button
                key={sec}
                onClick={() => setSelectedSector(sec)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedSector === sec
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                {sec === 'all' ? 'All Publications' : sec}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* No search results view */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8 space-y-4">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
            <Compass className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900">No brand research studies found</h3>
            <p className="text-xs text-slate-500">No publications matched your query "{search}". Try searching another keyword.</p>
          </div>
          <button
            onClick={() => {
              setSearch('');
              setSelectedSector('all');
            }}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            Show All 100 Brand Studies
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Editorial Lead Feature (Shown when not filtering or when on first page) */}
          {heroArticle && selectedSector === 'all' && !search && (
            <article className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden hover:border-slate-300 transition-all">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
                <div className="lg:col-span-4 bg-slate-900 p-7 sm:p-9 text-white flex flex-col justify-between relative overflow-hidden">
                  <div className="space-y-4 relative z-10">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-purple-500/20 text-purple-300 border border-purple-400/30 text-[11px] font-bold tracking-wide uppercase">
                      <Sparkles className="w-3 h-3" />
                      <span>Featured Research Report</span>
                    </div>

                    <div className="flex items-center gap-3.5 pt-2">
                      {heroArticle.rawMeta?.logo ? (
                        <img
                          src={heroArticle.rawMeta.logo}
                          alt={heroArticle.brand.name}
                          referrerPolicy="no-referrer"
                          className="w-14 h-14 rounded-xl object-cover border border-white/20 shadow-md shrink-0 bg-white"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold">
                          <Building2 className="w-7 h-7" />
                        </div>
                      )}
                      <div>
                        <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
                          {heroArticle.brand.name}
                        </h2>
                        <span className="text-xs text-slate-300 font-medium block">
                          {heroArticle.rawMeta?.sector || heroArticle.brand.category}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pt-3 border-t border-white/10">
                      {heroArticle.responsesCount > 0 ? (
                        <>
                          <div className="flex items-center gap-1.5 text-amber-400 font-black text-sm">
                            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                            <span>{heroArticle.avgRating} / 5.0</span>
                          </div>
                          <span className="text-white/30">•</span>
                          <span className="text-xs text-slate-300 font-medium">
                            {heroArticle.responsesCount} Verified {heroArticle.responsesCount === 1 ? 'Response' : 'Responses'}
                          </span>
                        </>
                      ) : (
                        <span className="text-xs text-purple-300 font-semibold">
                          Active Survey • Open for Panelists
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="pt-6 relative z-10">
                    <div className="text-[11px] uppercase tracking-wider text-slate-400 font-bold mb-1">Key Sentiment</div>
                    <p className="text-xs font-semibold text-purple-200">
                      "{heroArticle.keySentiment}"
                    </p>
                  </div>
                </div>

                <div className="lg:col-span-8 p-7 sm:p-9 flex flex-col justify-between space-y-6">
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1 font-semibold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-md border border-purple-100">
                        <FileText className="w-3.5 h-3.5" />
                        <span>1,200+ Word Empirical Analysis</span>
                      </span>
                      <span>•</span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>5 min read</span>
                      </span>
                      <span>•</span>
                      <span className="inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{heroArticle.csatScore}% CSAT Benchmark</span>
                      </span>
                    </div>

                    <Link to={heroArticle.studyUrl} className="group/title block">
                      <h3 className="text-xl sm:text-2xl font-black text-slate-900 group-hover/title:text-purple-700 transition-colors leading-tight">
                        {heroArticle.brand.name} Consumer Sentiment &amp; Market Research Study (2026)
                      </h3>
                    </Link>

                    <blockquote className="text-sm text-slate-700 leading-relaxed font-medium italic border-l-3 border-purple-500 pl-4 py-1 bg-slate-50 rounded-r-xl">
                      "{heroArticle.leadQuote}"
                    </blockquote>

                    {heroArticle.rawMeta?.keyProduct && (
                      <div className="flex items-center gap-2 text-xs text-slate-600">
                        <span className="font-bold text-slate-400 uppercase text-[10px] tracking-wider">Product Scope:</span>
                        <span className="font-semibold text-slate-800">{heroArticle.rawMeta.keyProduct}</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/brands/${heroArticle.brand.id}`}
                        className="text-xs font-semibold text-slate-600 hover:text-purple-700 transition-colors"
                      >
                        View Review Responses &rarr;
                      </Link>
                    </div>

                    <Link
                      to={heroArticle.studyUrl}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs group/btn"
                    >
                      <span>Read Research Publication</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>
                </div>
              </div>
            </article>
          )}

          {/* Editorial Publications Feed / Grid */}
          <div id="brands-grid-top" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedItems.map(
              ({
                brand,
                rawMeta,
                responsesCount,
                keySentiment,
                avgRating,
                studyUrl,
                leadQuote,
              }) => {
                return (
                  <article
                    key={brand.id}
                    className="bg-white rounded-2xl border border-slate-200/85 hover:border-slate-300 shadow-xs hover:shadow-md transition-all group flex flex-col justify-between overflow-hidden"
                  >
                    <div className="p-6 space-y-4">
                      {/* Meta header: Category, reading time, star rating */}
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-bold tracking-wider text-purple-700 uppercase bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100 truncate max-w-[170px]">
                          {rawMeta?.sector || brand.category.replace('_', ' ')}
                        </span>

                        {avgRating ? (
                          <div className="inline-flex items-center gap-1.5 text-xs font-extrabold text-amber-600 bg-amber-50/90 px-2 py-0.5 rounded-md border border-amber-200/60 shrink-0">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                            <span className="font-mono text-slate-900">{avgRating}</span>
                          </div>
                        ) : (
                          <span className="text-[11px] font-semibold text-slate-400">
                            Survey Open
                          </span>
                        )}
                      </div>

                      {/* Brand identity */}
                      <div className="flex items-center gap-3">
                        {rawMeta?.logo ? (
                          <img
                            src={rawMeta.logo}
                            alt={brand.name}
                            referrerPolicy="no-referrer"
                            className="w-11 h-11 rounded-xl object-cover border border-slate-200 shadow-2xs shrink-0 bg-white"
                          />
                        ) : (
                          <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center font-bold">
                            <Building2 className="w-5 h-5" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <Link to={studyUrl} className="group/title block">
                            <h2 className="font-bold text-slate-900 text-base group-hover/title:text-purple-700 transition-colors truncate">
                              {brand.name}
                            </h2>
                          </Link>
                          <span className="text-[11px] text-slate-500 font-medium block truncate">
                            {rawMeta?.keyProduct || 'Enterprise Portfolio'}
                          </span>
                        </div>
                      </div>

                      {/* Strategic Sentiment Tag */}
                      <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 space-y-1">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Key Consumer Perception
                        </div>
                        <p className="text-xs font-semibold text-slate-800 line-clamp-1">
                          "{keySentiment}"
                        </p>
                      </div>

                      {/* Editorial Excerpt */}
                      <p className="text-xs text-slate-600 leading-relaxed font-normal line-clamp-3">
                        {leadQuote}
                      </p>

                      {/* Research Metrics Row: Calculated from Real Records Only */}
                      <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500 font-medium border-t border-slate-100">
                        {responsesCount > 0 ? (
                          <>
                            <span className="inline-flex items-center gap-1 text-purple-700 font-semibold">
                              <Users className="w-3 h-3 text-purple-600" />
                              <span>{responsesCount} Verified {responsesCount === 1 ? 'Response' : 'Responses'}</span>
                            </span>
                            <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Live Panel Audit</span>
                            </span>
                          </>
                        ) : (
                          <>
                            <span className="inline-flex items-center gap-1 text-slate-400">
                              <span>Survey Active</span>
                            </span>
                            <span className="inline-flex items-center gap-1 text-purple-600 font-semibold">
                              <span>Open for Evaluations</span>
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Blog Card Footer CTA */}
                    <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                      <Link
                        to={`/brands/${brand.id}`}
                        className="text-[11px] font-semibold text-slate-600 hover:text-purple-700 transition-colors"
                      >
                        View Responses
                      </Link>

                      <Link
                        to={studyUrl}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-700 hover:text-purple-900 transition-colors group/link"
                      >
                        <span>Editorial Analysis</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover/link:translate-x-0.5 transition-transform" />
                      </Link>
                    </div>
                  </article>
                );
              }
            )}
          </div>

          {/* Pagination Controls */}
          {activeItems.length > 0 && totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={activeItems.length}
              pageSize={pageSize}
              onPageChange={(page) => {
                setCurrentPage(page);
                const el = document.getElementById('brands-grid-top');
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }}
              itemName="brand publications"
              className="mt-8"
            />
          )}
        </div>
      )}

      {/* Google AdSense Directory Placement */}
      <AdSenseAd
        slot="5544332211"
        format="auto"
        label="Advertisement"
        adPlacementKey="enableDirectoryBannerAd"
      />
    </div>
  );
};

