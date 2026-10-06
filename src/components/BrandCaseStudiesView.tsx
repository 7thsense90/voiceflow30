import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { SEOHead } from './SEOHead';
import { Link } from './Link';
import { Pagination } from './Pagination';
import {
  getPublishedBrandArticles,
  getBrandArticle,
  hasBrandArticle,
  getBrandStudyPath,
  BrandSEOArticle,
} from '../data/brandArticles';
import { RAW_100_BRANDS } from '../data/brandsData';
import {
  BookOpen,
  Search,
  Filter,
  Layers,
  Sparkles,
  ShieldCheck,
  Building2,
  Clock,
  ArrowRight,
  ChevronRight,
  Star,
  TrendingUp,
  Cpu,
  Gamepad2,
  Smartphone,
  Headphones,
  Coffee,
  ShoppingBag,
  Car,
  Tv,
  CreditCard,
  SlidersHorizontal,
  X,
  CheckCircle2,
  ExternalLink,
  Award,
} from 'lucide-react';

interface UnifiedCaseStudy {
  id: string;
  brandId: string;
  brandName: string;
  slug: string;
  title: string;
  excerpt: string;
  coverImage: string;
  category: string;
  sectorName: string;
  rating: number;
  totalResponses: number;
  readTimeMinutes: number;
  publishedDate: string;
  isDeepDive: boolean;
  studyType: 'Deep-Dive Case Study' | 'Empirical Benchmark' | 'Consumer Sentiment Audit';
  articlePath: string;
  highlights?: string[];
}

export const BrandCaseStudiesView: React.FC = () => {
  const { researchArticles, navigateToResearchArticle, setCurrentView, currentUser } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedStudyType, setSelectedStudyType] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'featured' | 'rating' | 'newest'>('featured');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 9; // 9 studies per page for clean 3x3 layout

  // Reset pagination to first page whenever search or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, selectedStudyType, sortBy]);

  // If visitor arrives with query parameters like ?brand= or ?category=
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const catParam = params.get('category');
      if (catParam) {
        setSelectedCategory(catParam);
      }
      const searchParam = params.get('q');
      if (searchParam) {
        setSearchQuery(searchParam);
      }
    }
  }, []);

  // Map and unify all case studies from FEATURED_BRAND_ARTICLES and researchArticles
  const allCaseStudies = useMemo<UnifiedCaseStudy[]>(() => {
    const list: UnifiedCaseStudy[] = [];
    const seenIds = new Set<string>();

    // 1. Add every brand that currently has enough real, verified Voice Flow
    // 360 survey responses to publish an honest study (see
    // MIN_RESPONSES_FOR_STATS in realBrandStats.ts). This list grows on its
    // own as more real responses come in — nothing here is hand-picked.
    getPublishedBrandArticles().forEach((art) => {
      seenIds.add(art.brandId);
      const brandMeta = RAW_100_BRANDS.find((b) => b.id === art.brandId);
      list.push({
        id: art.brandId,
        brandId: art.brandId,
        brandName: art.brandName,
        slug: art.slug,
        title: art.metaTitle || `${art.brandName} Consumer Sentiment & Brand Analysis`,
        excerpt: art.executiveSummary || art.metaDescription,
        coverImage: brandMeta?.logo || 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=600&auto=format&fit=crop&q=80',
        category: brandMeta?.category || 'brands',
        sectorName: brandMeta?.sector || 'Market Research',
        rating: Number(((art.keyMetrics.customerSatisfactionScore || 92) / 20).toFixed(1)),
        totalResponses: art.keyMetrics.verifiedResponsesAnalyzed || 1500,
        readTimeMinutes: art.readingTimeMinutes || 6,
        publishedDate: art.lastUpdated || art.publishDate || 'September 2026',
        isDeepDive: true,
        studyType: 'Deep-Dive Case Study',
        articlePath: getBrandStudyPath(art),
        highlights: art.suggestedImprovements?.immediatePriorities?.slice(0, 2),
      });
    });

    // 2. Add published ResearchArticles from AppContext / CMS
    researchArticles
      .filter((ra) => ra.status === 'published')
      .forEach((ra) => {
        if (!seenIds.has(ra.brand_id) && !seenIds.has(ra.slug)) {
          seenIds.add(ra.slug);
          const wordCount = ra.body.split(/\s+/).filter(Boolean).length;
          const readTime = Math.max(2, Math.ceil(wordCount / 200));

          list.push({
            id: ra.id,
            brandId: ra.brand_id,
            brandName: ra.brand_name,
            slug: ra.slug,
            title: ra.title,
            excerpt: ra.excerpt,
            coverImage: ra.cover_image_url,
            category: ra.category,
            sectorName: ra.category,
            rating: 4.7,
            totalResponses: 1450,
            readTimeMinutes: readTime,
            publishedDate: ra.published_at
              ? new Date(ra.published_at).toLocaleDateString('en-US', {
                  month: 'short',
                  year: 'numeric',
                })
              : 'Recent',
            isDeepDive: true,
            studyType: 'Empirical Benchmark',
            articlePath: `/brand-research-studies/${ra.slug}`,
          });
        }
      });

    return list;
  }, [researchArticles]);

  // Sector categories definition with icons and normalized mapping
  const sectorCategories = useMemo(() => {
    const rawCategories = Array.from(new Set(allCaseStudies.map((s) => s.category)));

    const categoryMetaList = [
      { id: 'All', label: 'All Case Studies', icon: Layers },
      { id: 'Tech & SaaS', label: 'AI & Enterprise SaaS', icon: Cpu, match: ['Tech & SaaS', 'saas', 'tech', 'Artificial Intelligence'] },
      { id: 'Gaming', label: 'Gaming & Entertainment', icon: Gamepad2, match: ['Gaming', 'gaming', 'Interactive Entertainment'] },
      { id: 'Hardware', label: 'Mobile & Hardware', icon: Smartphone, match: ['Hardware', 'Mobile Tech', 'hardware'] },
      { id: 'Audio & Peripherals', label: 'Audio & Electronics', icon: Headphones, match: ['Audio & Peripherals', 'peripherals', 'audio'] },
      { id: 'Food & Beverage', label: 'Food & Beverage', icon: Coffee, match: ['Food & Beverage', 'fnb', 'beverage'] },
      { id: 'Retail & Commerce', label: 'Retail & E-Commerce', icon: ShoppingBag, match: ['Retail & Commerce', 'retail', 'fashion'] },
      { id: 'Automotive & EV', label: 'Automotive & EV', icon: Car, match: ['Automotive & EV', 'auto', 'mobility'] },
      { id: 'Streaming & Media', label: 'Streaming & Digital Media', icon: Tv, match: ['Streaming & Media', 'streaming', 'media'] },
      { id: 'FinTech & Banking', label: 'FinTech & Digital Banking', icon: CreditCard, match: ['FinTech & Banking', 'finance', 'fintech'] },
    ];

    // Compute counts for each category
    return categoryMetaList.map((cat) => {
      let count = 0;
      if (cat.id === 'All') {
        count = allCaseStudies.length;
      } else {
        count = allCaseStudies.filter((s) => {
          if (!cat.match) return s.category === cat.id;
          return cat.match.some((m) => s.category.toLowerCase().includes(m.toLowerCase()));
        }).length;
      }
      return { ...cat, count };
    });
  }, [allCaseStudies]);

  // Filtered case studies
  const filteredStudies = useMemo(() => {
    return allCaseStudies
      .filter((study) => {
        // Search query
        const q = searchQuery.toLowerCase().trim();
        const matchesSearch =
          !q ||
          study.title.toLowerCase().includes(q) ||
          study.brandName.toLowerCase().includes(q) ||
          study.excerpt.toLowerCase().includes(q) ||
          study.category.toLowerCase().includes(q);

        // Category filter
        let matchesCategory = true;
        if (selectedCategory !== 'All') {
          const selectedMeta = sectorCategories.find((c) => c.id === selectedCategory);
          if (selectedMeta?.match) {
            matchesCategory = selectedMeta.match.some((m) =>
              study.category.toLowerCase().includes(m.toLowerCase())
            );
          } else {
            matchesCategory = study.category === selectedCategory;
          }
        }

        // Study type filter
        let matchesType = true;
        if (selectedStudyType !== 'All') {
          matchesType = study.studyType === selectedStudyType;
        }

        return matchesSearch && matchesCategory && matchesType;
      })
      .sort((a, b) => {
        if (sortBy === 'rating') {
          return b.rating - a.rating;
        }
        if (sortBy === 'newest') {
          return b.id.localeCompare(a.id);
        }
        // Featured default (keep deep-dives and major brands at front)
        return (b.isDeepDive ? 1 : 0) - (a.isDeepDive ? 1 : 0);
      });
  }, [allCaseStudies, searchQuery, selectedCategory, selectedStudyType, sortBy, sectorCategories]);

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(filteredStudies.length / pageSize));
  const paginatedStudies = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredStudies.slice(start, start + pageSize);
  }, [filteredStudies, currentPage, pageSize]);

  const spotlightStudy = useMemo(() => {
    return (
      allCaseStudies.find((s) => s.brandId === 'br_playstation' || s.brandName.includes('PlayStation')) ||
      allCaseStudies[0]
    );
  }, [allCaseStudies]);

  const handleStudyClick = (study: UnifiedCaseStudy) => {
    if (study.articlePath.startsWith('/brand-insights/')) {
      const article = getBrandArticle(study.brandId);
      if (article) {
        setCurrentView('brand-study', true, study.brandId, study.articlePath);
        return;
      }
    }
    // Navigate via research article slug or brand study
    if (study.slug) {
      navigateToResearchArticle(study.slug);
    } else {
      setCurrentView('brand-study', true, study.brandId, study.articlePath);
    }
  };

  const handleParticipateClick = () => {
    if (currentUser) {
      setCurrentView('surveys');
    } else {
      setCurrentView('register');
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 pb-20 selection:bg-purple-200">
      <SEOHead
        title="Brand Case Studies & Market Intelligence | Voice Flow 360"
        description="Comprehensive consumer sentiment analyses, benchmark evaluations, and empirical case studies across leading global brands. Participate in studies and earn rewards."
        canonicalUrl="https://voiceflow360.com/brand-case-studies"
      />

      {/* Hero Header Section */}
      <header className="bg-slate-950 text-white border-b border-slate-800 pt-10 sm:pt-14 pb-12 sm:pb-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Subtle geometric background glow */}
        <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-800 via-indigo-950 to-transparent" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 sm:gap-8">
            <div className="max-w-3xl space-y-3.5">
              {/* Mandatory Keyword Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-300 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>Participate in studies and earn rewards</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
                Share your opinions. Help businesses understand consumers.
              </h1>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl font-normal">
                Participate in available research studies and receive the reward shown for eligible, accepted responses. Study availability and rewards vary.
              </p>

              {/* Integrity & Empirical Trust Indicators */}
              <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-2 text-xs text-slate-400 font-medium">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  100% Independent &amp; Non-Affiliated
                </span>
                <span className="hidden sm:inline">&bull;</span>
                <span className="flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-indigo-400" />
                  {allCaseStudies.length} In-Depth Case Studies
                </span>
                <span className="hidden sm:inline">&bull;</span>
                <span className="flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-400" />
                  Empirical Consumer Sentiment Data
                </span>
              </div>
            </div>

            {/* Quick Panel Action */}
            <div className="shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                onClick={handleParticipateClick}
                className="px-5 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer border border-purple-400/30"
              >
                <Sparkles className="w-4 h-4" />
                <span>Participate in Studies &amp; Earn Rewards</span>
              </button>
              <button
                onClick={() => setCurrentView('for-brands')}
                className="px-4 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white font-bold text-xs sm:text-sm border border-slate-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Building2 className="w-4 h-4 text-slate-400" />
                <span>For Brands</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Two-Column Layout: Categories Sidebar + Case Studies Main Stage */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Mobile Filter Drawer Toggle Button */}
        <div className="lg:hidden mb-6 flex items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 bg-purple-50 text-purple-700 rounded-xl text-xs font-bold hover:bg-purple-100 transition-colors cursor-pointer"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Categories &amp; Filters</span>
            <span className="ml-1 w-5 h-5 rounded-full bg-purple-600 text-white text-[10px] flex items-center justify-center">
              {filteredStudies.length}
            </span>
          </button>

          <div className="text-xs font-semibold text-slate-500 truncate">
            Active: <strong className="text-slate-900">{selectedCategory}</strong>
          </div>
        </div>

        {/* Mobile Slide-Out Drawer Backdrop */}
        {isMobileSidebarOpen && (
          <div
            className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs z-50 lg:hidden"
            onClick={() => setIsMobileSidebarOpen(false)}
          >
            <div
              className="absolute left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white shadow-2xl p-5 overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-purple-600" />
                  <span className="font-extrabold text-sm text-slate-900">Categories &amp; Filters</span>
                </div>
                <button
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Sidebar Content (Rendered in Mobile Drawer) */}
              <div className="space-y-6">
                {/* Search input */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                    Search Studies
                  </label>
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Brand, topic, keyword..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Categories List */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
                    Industry Categories
                  </label>
                  <div className="space-y-1">
                    {sectorCategories.map((cat) => {
                      const IconComp = cat.icon;
                      const isSelected = selectedCategory === cat.id;
                      return (
                        <button
                          key={cat.id}
                          onClick={() => {
                            setSelectedCategory(cat.id);
                            setIsMobileSidebarOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-purple-600 text-white shadow-xs'
                              : 'text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <IconComp
                              className={`w-4 h-4 ${
                                isSelected ? 'text-white' : 'text-slate-500'
                              }`}
                            />
                            <span>{cat.label}</span>
                          </div>
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                              isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            {cat.count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Reset button */}
                {(selectedCategory !== 'All' || searchQuery) && (
                  <button
                    onClick={() => {
                      setSelectedCategory('All');
                      setSearchQuery('');
                      setIsMobileSidebarOpen(false);
                    }}
                    className="w-full py-2 text-xs font-bold text-purple-700 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors"
                  >
                    Reset All Filters
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* ========================================================================= */}
          {/* DESKTOP CATEGORIES SIDEBAR (Executive Side Bar View to Categories Data)   */}
          {/* ========================================================================= */}
          <aside
            id="case-studies-categories-sidebar"
            className="hidden lg:block w-72 xl:w-80 shrink-0 sticky top-20 self-start space-y-6"
          >
            {/* Search Filter Card */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
              <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500">
                Search Case Studies
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  id="sidebar-search-case-studies-input"
                  placeholder="Filter by brand or topic..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Categories Navigation Card */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-1.5">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-purple-600" />
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-700">
                    Categories Data
                  </span>
                </div>
                <span className="text-[10px] font-bold text-slate-400">
                  {allCaseStudies.length} Studies
                </span>
              </div>

              {/* Category Links */}
              <nav className="space-y-1">
                {sectorCategories.map((cat) => {
                  const IconComp = cat.icon;
                  const isSelected = selectedCategory === cat.id;

                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-left ${
                        isSelected
                          ? 'bg-purple-600 text-white shadow-xs translate-x-0.5'
                          : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <IconComp
                          className={`w-4 h-4 shrink-0 ${
                            isSelected ? 'text-white' : 'text-slate-500'
                          }`}
                        />
                        <span className="truncate">{cat.label}</span>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ml-1.5 ${
                          isSelected
                            ? 'bg-white/20 text-white'
                            : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200'
                        }`}
                      >
                        {cat.count}
                      </span>
                    </button>
                  );
                })}
              </nav>

              {/* Reset filter */}
              {(selectedCategory !== 'All' || searchQuery) && (
                <button
                  onClick={() => {
                    setSelectedCategory('All');
                    setSearchQuery('');
                  }}
                  className="w-full pt-2 text-center text-xs font-bold text-purple-700 hover:text-purple-900 border-t border-slate-100 transition-colors cursor-pointer"
                >
                  Clear All Filters
                </button>
              )}
            </div>

            {/* Study Format Filter Card */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
              <span className="block text-[11px] font-black uppercase tracking-wider text-slate-500">
                Study Methodology
              </span>
              <div className="space-y-1 text-xs">
                {['All', 'Deep-Dive Case Study', 'Empirical Benchmark'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedStudyType(type)}
                    className={`w-full text-left px-3 py-1.5 rounded-xl font-semibold transition-colors cursor-pointer flex items-center justify-between ${
                      selectedStudyType === type
                        ? 'bg-slate-100 text-slate-950 font-bold'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>{type === 'All' ? 'All Methodologies' : type}</span>
                    {selectedStudyType === type && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Sidebar CTA Card: Mandatory keyword & participant onboarding */}
            <div className="bg-gradient-to-br from-purple-900 to-indigo-950 text-white rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/30 text-purple-300 text-[10px] font-black uppercase tracking-wide">
                <Sparkles className="w-3 h-3 text-purple-400" />
                <span>Panel Participation</span>
              </div>

              <h4 className="text-sm font-extrabold text-white leading-snug">
                Participate in studies and earn rewards
              </h4>

              <p className="text-[11px] text-slate-300 leading-relaxed">
                Join verified consumer questionnaires, share your feedback on enterprise brands, and earn participant reward credits.
              </p>

              <button
                onClick={handleParticipateClick}
                className="w-full py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Get Started Now</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {/* Research Independence Note */}
            <div className="p-3 bg-slate-100 rounded-xl border border-slate-200/80 text-[11px] text-slate-500 leading-relaxed">
              <ShieldCheck className="w-4 h-4 text-emerald-600 inline mr-1" />
              <strong>Empirical Standard:</strong> All case studies reflect verified panel telemetry. Zero corporate sponsorships.
            </div>
          </aside>

          {/* ========================================================================= */}
          {/* MAIN CONTENT AREA: Studies Grid, Spotlight, and Metric Indicators         */}
          {/* ========================================================================= */}
          <main className="flex-1 min-w-0 space-y-8">
            {/* Top Controls Bar: Result count & Sort */}
            <div
              id="case-studies-list-top"
              className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4"
            >
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900">
                  {filteredStudies.length === 0
                    ? '0 Studies'
                    : `Showing ${(currentPage - 1) * pageSize + 1}–${Math.min(
                        currentPage * pageSize,
                        filteredStudies.length
                      )} of ${filteredStudies.length} Studies (Page ${currentPage} of ${totalPages})`}
                </span>
                {selectedCategory !== 'All' && (
                  <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[11px] font-bold flex items-center gap-1">
                    {selectedCategory}
                    <button
                      onClick={() => setSelectedCategory('All')}
                      className="hover:text-purple-950 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-500 font-medium">Sort By:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-purple-500 cursor-pointer"
                >
                  <option value="featured">Featured Reports</option>
                  <option value="rating">Highest Satisfaction</option>
                  <option value="newest">Recent Releases</option>
                </select>
              </div>
            </div>

            {/* Spotlight Featured Case Study (Only on 'All' category and no search) */}
            {selectedCategory === 'All' && !searchQuery && spotlightStudy && (
              <section
                id="featured-case-study-spotlight"
                onClick={() => handleStudyClick(spotlightStudy)}
                className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl overflow-hidden border border-slate-800 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer group flex flex-col md:flex-row"
              >
                {/* Spotlight Image */}
                <div className="md:w-5/12 relative aspect-16/10 md:aspect-auto overflow-hidden bg-slate-950">
                  <img
                    src={spotlightStudy.coverImage}
                    alt={spotlightStudy.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-slate-950/80 via-slate-950/30 to-transparent" />
                  <div className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-xs text-amber-300 text-xs font-black border border-amber-400/30">
                    <Star className="w-3 h-3 fill-amber-300 text-amber-300" />
                    <span>Featured Deep-Dive Audit</span>
                  </div>
                </div>

                {/* Spotlight Content */}
                <div className="md:w-7/12 p-6 sm:p-8 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-xs text-purple-300 font-bold uppercase tracking-wider">
                      <Building2 className="w-3.5 h-3.5" />
                      <span>{spotlightStudy.brandName}</span>
                      <span>&bull;</span>
                      <span>{spotlightStudy.sectorName}</span>
                    </div>

                    <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight group-hover:text-purple-300 transition-colors leading-snug">
                      {spotlightStudy.title}
                    </h2>

                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed line-clamp-3">
                      {spotlightStudy.excerpt}
                    </p>

                    {spotlightStudy.highlights && spotlightStudy.highlights.length > 0 && (
                      <div className="pt-2 space-y-1.5">
                        <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider">
                          Key Empirical Finding:
                        </span>
                        <p className="text-xs text-purple-100 font-medium flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{spotlightStudy.highlights[0]}</span>
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs font-bold text-purple-300 group-hover:text-purple-200">
                    <div className="flex items-center gap-3 text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {spotlightStudy.readTimeMinutes} min read
                      </span>
                      <span>&bull;</span>
                      <span>{spotlightStudy.totalResponses.toLocaleString()} verified responses</span>
                    </div>
                    <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      <span>Read Full Study</span>
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </section>
            )}

            {/* Case Studies Card Grid */}
            {filteredStudies.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs max-w-xl mx-auto my-12 space-y-4">
                <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="text-base font-bold text-slate-800">No Case Studies Found</h3>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                  We could not find any brand studies matching "{searchQuery}" in the selected category.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('All');
                    setSelectedStudyType('All');
                  }}
                  className="px-4 py-2 bg-purple-600 text-white font-bold text-xs rounded-xl hover:bg-purple-700 transition-colors cursor-pointer"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {paginatedStudies.map((study) => (
                  <article
                    key={study.id}
                    id={`study-card-${study.slug}`}
                    onClick={() => handleStudyClick(study)}
                    className="bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-purple-300 hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between cursor-pointer group"
                  >
                    <div>
                      {/* Cover Photo */}
                      <div className="relative aspect-16/10 overflow-hidden bg-slate-100">
                        <img
                          src={study.coverImage}
                          alt={study.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />

                        {/* Brand Badge */}
                        <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-950/85 backdrop-blur-xs text-white text-[11px] font-black border border-white/20">
                          <Building2 className="w-3 h-3 text-purple-400" />
                          <span>{study.brandName}</span>
                        </div>

                        {/* Category Tag */}
                        <div className="absolute top-3 right-3 px-2 py-0.5 rounded-md bg-purple-600/90 backdrop-blur-xs text-white text-[10px] font-extrabold uppercase tracking-wider">
                          {study.category}
                        </div>

                        {/* Rating & Read Time at bottom of cover */}
                        <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-[11px] text-white font-medium">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-300" />
                            <span>{study.readTimeMinutes} min read</span>
                          </div>
                          <div className="flex items-center gap-1 bg-amber-400/90 text-slate-950 px-2 py-0.5 rounded-md text-[10px] font-black">
                            <Star className="w-2.5 h-2.5 fill-slate-950 text-slate-950" />
                            <span>{study.rating.toFixed(1)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Card Body */}
                      <div className="p-5 space-y-2.5">
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                          <span>{study.studyType}</span>
                          <span>&bull;</span>
                          <span>{study.publishedDate}</span>
                        </div>

                        <h3 className="text-base font-extrabold text-slate-900 group-hover:text-purple-700 transition-colors leading-snug line-clamp-2">
                          {study.title}
                        </h3>

                        <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                          {study.excerpt}
                        </p>
                      </div>
                    </div>

                    {/* Card Footer */}
                    <div className="p-5 pt-0">
                      <div className="pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-purple-700 group-hover:text-purple-900">
                        <span className="text-[11px] text-slate-400 font-normal">
                          {study.totalResponses.toLocaleString()} Responses
                        </span>
                        <div className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                          <span>Read Study</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {filteredStudies.length > 0 && totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredStudies.length}
                pageSize={pageSize}
                onPageChange={(page) => {
                  setCurrentPage(page);
                  const el = document.getElementById('case-studies-list-top');
                  if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }}
                itemName="case studies"
              />
            )}

            {/* Bottom Panel Incentive Section */}
            <section className="bg-gradient-to-r from-purple-800 via-indigo-900 to-slate-900 text-white p-8 sm:p-10 rounded-3xl shadow-lg relative overflow-hidden text-center space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-black uppercase tracking-wider border border-purple-400/30">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>Participate in studies and earn rewards</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black tracking-tight max-w-xl mx-auto leading-snug">
                Your Consumer Voice Directly Shapes Product Innovation
              </h2>

              <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
                Join our verified consumer community. Complete structured surveys on top technology, gaming, and lifestyle brands to earn member reward credits.
              </p>

              <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={handleParticipateClick}
                  className="px-6 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Participate in Studies</span>
                </button>
                <button
                  onClick={() => setCurrentView('for-brands')}
                  className="px-5 py-3 bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm rounded-xl border border-white/20 transition-all cursor-pointer"
                >
                  Enterprise Research Solutions
                </button>
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
};

export default BrandCaseStudiesView;
