import React, { useState, useMemo, useEffect } from 'react';
import { SEOHead } from './SEOHead';
import { Link } from './Link';
import {
  BarChart3,
  TrendingUp,
  Users,
  Sparkles,
  Building2,
  Search,
  Star,
  Gamepad2,
  Cpu,
  Coffee,
  ShoppingBag,
  Car,
  Plane,
  Layers,
  BookOpen,
  Calendar,
  Clock,
  ArrowRight,
  ShieldCheck,
  Award,
  ArrowUpRight,
  FileText,
  CheckCircle2,
  Globe2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { RAW_100_BRANDS, BrandMeta } from '../data/brandsData';
import { getPublishedBrandArticles, getBrandArticle, hasBrandArticle, getBrandStudyPath } from '../data/brandArticles';
import { AdSenseAd } from './AdSenseAd';
import { getBrandEmpiricalProfile } from '../data/brandEmpiricalProfiles';
import { getUniqueBrandInsight, getUniqueBrandSentiment } from '../data/brandUniqueInsights';
import { getBrandBenchmarkMetric } from '../data/brandBenchmarks';

export const BrandInsights: React.FC = () => {
  const { brands, responses, setCurrentView } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'rating' | 'feedback' | 'name'>('rating');
  const [showInsights, setShowInsights] = useState<boolean>(true);

  // If visitor arrives with ?brand= or ?article= query parameters, immediately route to the dedicated canonical study URL
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const paramBrand = params.get('brand') || params.get('article');
      if (paramBrand && hasBrandArticle(paramBrand)) {
        const path = getBrandStudyPath(paramBrand);
        setCurrentView('brand-study', true, paramBrand, path);
      }
    }
  }, [setCurrentView]);

  // Map live synchronized brands with computed metrics from live responses
  const brandsIntelligence = useMemo(() => {
    return brands.map((brand) => {
      const meta = RAW_100_BRANDS.find((b) => b.id === brand.id);
      const sector = brand.sector || meta?.sector || 'General Market';
      const keyProduct = brand.keyProduct || meta?.keyProduct || brand.name;
      const logo = brand.logo || meta?.logo || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80';
      const icon = brand.icon || meta?.icon || 'Building2';

      const enrichedBrand: BrandMeta = {
        id: brand.id,
        name: brand.name,
        category: (brand.category as any) || meta?.category || 'products',
        sector,
        description: brand.description || meta?.description || '',
        website: brand.website || meta?.website || '',
        icon,
        logo,
        keyProduct,
      };

      const brandResponses = responses.filter(
        (r) => r.brandId === brand.id
      );

      // Compute star rating from rating questions
      let totalStars = 0;
      let starsCount = 0;
      const qualitativeQuotes: string[] = [];

      brandResponses.forEach((r) => {
        r.answers.forEach((ans) => {
          if (typeof ans.answer === 'number' && ans.answer <= 5 && ans.answer >= 1 && ans.questionId.endsWith('_1')) {
            totalStars += ans.answer;
            starsCount++;
          }
          if (typeof ans.answer === 'string' && ans.answer.length > 20) {
            qualitativeQuotes.push(ans.answer);
          }
        });
      });

      // Calculate authentic metrics strictly from real records
      const avgStar = starsCount > 0 ? (totalStars / starsCount).toFixed(1) : null;
      const realResponseCount = brandResponses.length;
      const topInsight = getUniqueBrandInsight(
        brand.id,
        brand.name,
        keyProduct,
        sector,
        qualitativeQuotes
      );
      const keySentiment = getUniqueBrandSentiment(brand.id, sector);

      // Determine category filter bucket
      let categoryBucket = 'tech';
      let offeringLabel = 'Signature Offering';
      const id = brand.id.toLowerCase();
      const sec = sector.toLowerCase();
      if (sec.includes('gaming') || sec.includes('esports') || sec.includes('vr') || id.includes('playstation') || id.includes('nintendo') || id.includes('steam') || id.includes('xbox') || id.includes('epic') || id.includes('riot') || id.includes('roblox') || id.includes('blizzard') || id.includes('ea_') || id.includes('rockstar') || id.includes('ubisoft') || id.includes('cdprojekt') || id.includes('capcom') || id.includes('square') || id.includes('unity')) {
        categoryBucket = 'gaming';
        offeringLabel = 'Flagship System / Title';
      } else if (sec.includes('hardware') || sec.includes('electronics') || sec.includes('mobile') || id.includes('apple') || id.includes('samsung') || id.includes('google') || id.includes('surface') || id.includes('dell') || id.includes('asus') || id.includes('lenovo') || id.includes('hp') || id.includes('sony_') || id.includes('lg_') || id.includes('bose') || id.includes('gopro') || id.includes('dji') || id.includes('logitech') || id.includes('razer')) {
        categoryBucket = 'tech';
        offeringLabel = 'Flagship Hardware';
      } else if (sec.includes('saas') || sec.includes('software') || sec.includes('ai') || sec.includes('cloud') || id.includes('openai') || id.includes('notion') || id.includes('figma') || id.includes('canva') || id.includes('discord') || id.includes('slack') || id.includes('zoom') || id.includes('github') || id.includes('duolingo') || id.includes('grammarly') || id.includes('adobe') || id.includes('dropbox') || id.includes('spotify') || id.includes('netflix') || id.includes('youtube')) {
        categoryBucket = 'saas';
        offeringLabel = 'Core Platform';
      } else if (sec.includes('food') || sec.includes('beverage') || sec.includes('coffee') || id.includes('starbucks') || id.includes('mcdonalds') || id.includes('chipotle') || id.includes('dominos') || id.includes('subway') || id.includes('coca') || id.includes('pepsi') || id.includes('redbull') || id.includes('nespresso') || id.includes('oatly') || id.includes('dunkin') || id.includes('shake') || id.includes('taco') || id.includes('beyond') || id.includes('benandjerrys')) {
        categoryBucket = 'food';
        offeringLabel = 'Signature Menu Item';
      } else if (sec.includes('fashion') || sec.includes('apparel') || id.includes('nike') || id.includes('adidas') || id.includes('lululemon') || id.includes('zara') || id.includes('hm') || id.includes('uniqlo') || id.includes('gymshark') || id.includes('patagonia') || id.includes('levis') || id.includes('underarmour')) {
        categoryBucket = 'fashion';
        offeringLabel = 'Key Collection';
      } else if (sec.includes('auto') || sec.includes('ev') || id.includes('tesla') || id.includes('porsche') || id.includes('bmw') || id.includes('mercedes') || id.includes('toyota') || id.includes('hyundai') || id.includes('ford') || id.includes('rivian') || id.includes('lucid') || id.includes('volvo')) {
        categoryBucket = 'auto';
        offeringLabel = 'Flagship Vehicle';
      } else if (sec.includes('travel') || sec.includes('airline') || sec.includes('hospitality') || id.includes('airbnb') || id.includes('uber') || id.includes('lyft') || id.includes('booking') || id.includes('delta') || id.includes('marriott') || id.includes('expedia') || id.includes('hilton') || id.includes('emirates') || id.includes('doordash')) {
        categoryBucket = 'travel';
        offeringLabel = 'Core Hospitality Service';
      } else {
        categoryBucket = 'retail';
        offeringLabel = 'Primary Offering';
      }

      return {
        brand: enrichedBrand,
        brandResponsesCount: realResponseCount,
        avgStar,
        realResponseCount,
        topInsight,
        keySentiment,
        offeringLabel,
        categoryBucket,
      };
    });
  }, [brands, responses]);

  const categories = useMemo(() => {
    const counts: Record<string, number> = {};
    brandsIntelligence.forEach((b) => {
      counts[b.categoryBucket] = (counts[b.categoryBucket] || 0) + 1;
    });

    return [
      { id: 'all', label: `All Sectors (${brands.length})`, icon: Layers },
      { id: 'gaming', label: `Games & Esports (${counts['gaming'] || 0})`, icon: Gamepad2 },
      { id: 'tech', label: `Tech & Hardware (${counts['tech'] || 0})`, icon: Cpu },
      { id: 'saas', label: `AI & Software (${counts['saas'] || 0})`, icon: Sparkles },
      { id: 'food', label: `Food & Beverage (${counts['food'] || 0})`, icon: Coffee },
      { id: 'fashion', label: `Fashion & Apparel (${counts['fashion'] || 0})`, icon: ShoppingBag },
      { id: 'auto', label: `Automotive & EV (${counts['auto'] || 0})`, icon: Car },
      { id: 'travel', label: `Travel & Airlines (${counts['travel'] || 0})`, icon: Plane },
      { id: 'retail', label: `Retail & E-Com (${counts['retail'] || 0})`, icon: Building2 },
    ];
  }, [brands.length, brandsIntelligence]);

  const filteredBrands = useMemo(() => {
    return brandsIntelligence
      .filter((item) => {
        const matchesCat = selectedCategory === 'all' || item.categoryBucket === selectedCategory;
        const q = searchQuery.toLowerCase();
        const matchesQuery =
          !q ||
          item.brand.name.toLowerCase().includes(q) ||
          item.brand.sector.toLowerCase().includes(q) ||
          item.brand.keyProduct.toLowerCase().includes(q) ||
          item.topInsight.toLowerCase().includes(q);
        return matchesCat && matchesQuery;
      })
      .sort((a, b) => {
        if (sortBy === 'rating') return parseFloat(b.avgStar) - parseFloat(a.avgStar);
        if (sortBy === 'feedback') return b.brandResponsesCount - a.brandResponsesCount;
        return a.brand.name.localeCompare(b.brand.name);
      });
  }, [brandsIntelligence, selectedCategory, searchQuery, sortBy]);

  const totalAllResponses = responses.length;

  // Split the real, currently-published brand studies for the blog layout.
  // This list only contains brands with enough real verified survey
  // responses (see getPublishedBrandArticles) — it can be empty early on
  // and grows automatically as more responses come in.
  const publishedArticles = useMemo(() => getPublishedBrandArticles(), [responses]);
  const leadArticle = publishedArticles[0];
  const secondaryArticles = publishedArticles.slice(1, 4);

  return (
    <div className="min-h-screen bg-slate-50/70 pb-20 animate-fadeIn">
      <SEOHead
        title="Brand Insights & Product Intelligence Blog | Voice Flow 360"
        description="Comprehensive product reviews, consumer sentiment analyses, and empirical benchmark reports for brands seeking objective feedback on products and services."
        keywords={[
          'brand product insights',
          'consumer intelligence blog',
          'market research reports',
          'product customer feedback',
          'brand benchmark studies',
          'customer sentiment analytics',
        ]}
        canonicalPath="/brand-insights"
      />

      {/* Editorial Blog Header & Publication Banner */}
      <header className="bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950 text-white pt-12 pb-14 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-300 text-xs font-bold uppercase tracking-wider">
              <BookOpen className="w-3.5 h-3.5 text-purple-400" />
              <span>Voice Flow 360 Research Publication • Product &amp; Service Intelligence</span>
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold">
              <Link
                to="/for-brands"
                className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <span>For Enterprise Brands</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <div className="max-w-3xl space-y-3">
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
              Brand &amp; Product Intelligence Journal
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
              In-depth research studies, customer perception audits, and empirical product reviews designed for brands that want to understand how real consumers evaluate their products and services.
            </p>
          </div>

          {/* Publication Metrics Bar (B2B / Editorial) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-800/80">
            <div className="bg-white/5 backdrop-blur-xs p-3.5 rounded-2xl border border-white/10">
              <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
                <Building2 className="w-3.5 h-3.5 text-purple-400" />
                <span>Monitored Brands</span>
              </div>
              <p className="text-xl font-black text-white mt-1">
                {brands.length > 0 ? `${brands.length} Cataloged` : 'Active Directory'}
              </p>
              <p className="text-[11px] text-slate-400">Gaming, Tech, Auto, Retail</p>
            </div>

            <div className="bg-white/5 backdrop-blur-xs p-3.5 rounded-2xl border border-white/10">
              <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
                <Users className="w-3.5 h-3.5 text-emerald-400" />
                <span>Verified Panel Data</span>
              </div>
              <p className="text-xl font-black text-white mt-1">
                {totalAllResponses > 0 ? `${totalAllResponses.toLocaleString()} Responses` : 'Live Responses'}
              </p>
              <p className="text-[11px] text-slate-400">Authentic Consumer Evaluations</p>
            </div>

            <div className="bg-white/5 backdrop-blur-xs p-3.5 rounded-2xl border border-white/10">
              <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
                <FileText className="w-3.5 h-3.5 text-indigo-400" />
                <span>In-Depth Articles</span>
              </div>
              <p className="text-xl font-black text-white mt-1">
                {publishedArticles.length} Published
              </p>
              <p className="text-[11px] text-slate-400">Independent Editorial Analyses</p>
            </div>

            <div className="bg-white/5 backdrop-blur-xs p-3.5 rounded-2xl border border-white/10">
              <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                <span>Research Standard</span>
              </div>
              <p className="text-xl font-black text-white mt-1">Independent</p>
              <p className="text-[11px] text-slate-400">Objective Methodology</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Magazine & Blog Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 space-y-12">

        {/* Featured Blog Stories (Lead Article + Secondary Bento) */}
        {leadArticle && (
          <section className="space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <h2 className="text-lg font-black text-slate-900 tracking-tight">
                  Featured Product Research Studies
                </h2>
              </div>
              <span className="text-xs font-bold text-slate-500">
                Editorial Deep Dives &amp; Brand Audits
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Lead Feature Article (7 cols) */}
              <Link
                to={getBrandStudyPath(leadArticle)}
                className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs hover:shadow-md transition-all group flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="px-3 py-1 bg-purple-100 text-purple-900 text-[11px] font-bold rounded-full uppercase tracking-wider">
                      Featured Cover Story
                    </span>
                    <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {leadArticle.readingTimeMinutes} min read ({leadArticle.wordCount} words)
                    </span>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-black text-slate-900 group-hover:text-purple-700 transition-colors leading-tight">
                    {leadArticle.brandName}: Product Evolution &amp; Verified Consumer Sentiment Study
                  </h3>

                  <p className="text-sm text-slate-600 leading-relaxed line-clamp-3">
                    {leadArticle.executiveSummary}
                  </p>

                  <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-100">
                    <div className="bg-slate-50 p-2.5 rounded-xl text-center">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">CSAT Rating</span>
                      <span className="text-base font-black text-emerald-600">
                        {leadArticle.keyMetrics.customerSatisfactionScore}%
                      </span>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-xl text-center">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">NPS Score</span>
                      <span className="text-base font-black text-purple-600">
                        +{leadArticle.keyMetrics.npsScore}
                      </span>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-xl text-center">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">Format</span>
                      <span className="text-xs font-black text-slate-800">
                        Editorial Desk
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-purple-700 group-hover:translate-x-0.5 transition-transform">
                  <span>Read Analysis</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </Link>

              {/* Secondary Articles Column (5 cols) */}
              <div className="lg:col-span-5 flex flex-col gap-4">
                {secondaryArticles.map((art) => (
                  <Link
                    key={art.brandId}
                    to={getBrandStudyPath(art)}
                    className="flex-1 bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:shadow-md transition-all group flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-purple-800 bg-purple-50 px-2 py-0.5 rounded-md">
                          Research Report
                        </span>
                        <span className="text-[11px] font-semibold text-slate-400">
                          {art.readingTimeMinutes} min read
                        </span>
                      </div>

                      <h4 className="text-base font-black text-slate-900 group-hover:text-purple-700 transition-colors line-clamp-1">
                        {art.brandName} Consumer &amp; Product Analysis
                      </h4>

                      <p className="text-xs text-slate-600 line-clamp-2 mt-1 leading-relaxed">
                        {art.executiveSummary}
                      </p>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-700 group-hover:text-purple-700 transition-colors">
                      <span className="text-[11px]">View Study</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Brand Insights Filter & Search Header */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                All 100 Brand Product Intelligence Profiles
              </h2>
              <p className="text-xs text-slate-600 mt-0.5">
                Explore real consumer sentiment, signature products, and qualitative feedback across major sectors.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowInsights(!showInsights)}
                className={`px-3 py-1.5 border rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                  showInsights
                    ? 'bg-purple-50 text-purple-800 border-purple-200 hover:bg-purple-100'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
                title={showInsights ? 'Hide customer quotes on cards' : 'Show customer quotes on cards'}
              >
                <Sparkles className={`w-3.5 h-3.5 ${showInsights ? 'text-purple-600' : 'text-slate-400'}`} />
                <span>{showInsights ? 'Hide Quotes' : 'Show Quotes'}</span>
              </button>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex flex-col md:flex-row items-center justify-between gap-3">
              {/* Category Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
                {categories.map((c) => {
                  const IconComp = c.icon;
                  return (
                    <button
                      key={c.id}
                      onClick={() => setSelectedCategory(c.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                        selectedCategory === c.id
                          ? 'bg-purple-600 text-white shadow-xs'
                          : 'text-slate-600 hover:bg-slate-100 bg-slate-50'
                      }`}
                    >
                      <IconComp className="w-3.5 h-3.5" />
                      <span>{c.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Search & Sort */}
              <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
                <div className="relative flex-1 md:w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search 100 brands, products, sectors..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
                >
                  <option value="rating">Top Rated ⭐</option>
                  <option value="feedback">Most Feedback 💬</option>
                  <option value="name">Alphabetical (A-Z)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Brand Intelligence Magazine Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBrands.map((item) => {
            const {
              brand,
              realResponseCount,
              avgStar,
              topInsight,
              keySentiment,
              offeringLabel,
            } = item;
            const hasArticle = hasBrandArticle(brand.id);
            return (
              <article
                key={brand.id}
                className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div className="space-y-3.5">
                  {/* Top Brand Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={brand.logo}
                        alt={brand.name}
                        referrerPolicy="no-referrer"
                        className="w-12 h-12 rounded-2xl object-cover border border-slate-200 shadow-2xs shrink-0"
                      />
                      <Link to={`/brands/${brand.id}`} className="group/name min-w-0">
                        <h3 className="font-black text-slate-900 text-base group-hover/name:text-purple-700 transition-colors truncate">
                          {brand.name}
                        </h3>
                        <span className="text-[11px] font-bold text-slate-500 block truncate">
                          {brand.sector}
                        </span>
                      </Link>
                    </div>

                    <div className="text-right shrink-0">
                      {avgStar ? (
                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-50/80 border border-amber-200/60 justify-end">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500 shrink-0" />
                          <span className="text-xs font-black text-slate-900 tracking-tight font-mono">{avgStar}</span>
                        </div>
                      ) : (
                        <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider block">
                          Survey Active
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Strategic Brand Perception Tag (Unique per brand) */}
                  <div>
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-purple-50 text-purple-800 border border-purple-100 tracking-tight line-clamp-1">
                      {keySentiment}
                    </span>
                  </div>

                  {/* Dynamic Sector-Specific Offering Pill */}
                  <div className="text-[11px] font-semibold text-slate-600 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100 flex items-center justify-between gap-2">
                    <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider shrink-0">{offeringLabel}</span>
                    <span className="text-slate-800 font-bold truncate">{brand.keyProduct}</span>
                  </div>

                  {/* Real Metrics Row */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-slate-50/80 rounded-xl p-2 border border-slate-100 text-center">
                      <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Responses</span>
                      <span className="text-xs font-black text-slate-800">
                        {realResponseCount > 0 ? `${realResponseCount} Verified` : '0 (Active)'}
                      </span>
                    </div>
                    <div className="bg-slate-50/80 rounded-xl p-2 border border-slate-100 text-center">
                      <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Honorarium</span>
                      <span className="text-xs font-black text-emerald-600">100+ Coins</span>
                    </div>
                  </div>

                  {/* Top Consumer Insight Quote Box */}
                  {showInsights && (
                    <div
                      id={`brand-insight-quote-${brand.id}`}
                      className="bg-gradient-to-br from-purple-50/70 via-indigo-50/30 to-purple-50/50 rounded-2xl p-3.5 border border-purple-100/90 shadow-2xs"
                    >
                      <div className="flex items-center justify-between text-[11px] font-bold text-purple-900 mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                          <span className="font-semibold tracking-tight">Consumer Evaluation</span>
                        </div>
                        <span className="text-[10px] font-bold text-purple-700/90 bg-purple-100/70 px-1.5 py-0.5 rounded-md">
                          {realResponseCount > 0 ? `${realResponseCount} records` : 'Survey Open'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed italic font-normal line-clamp-3">
                        "{topInsight}"
                      </p>
                    </div>
                  )}
                </div>

                {/* Action Buttons for Brand Intelligence (Editorial / B2B) */}
                <div className="mt-5 pt-4 border-t border-slate-100 space-y-2">
                  {hasArticle ? (
                    <Link
                      to={getBrandStudyPath(brand.id)}
                      className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs text-center"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Read Analysis</span>
                    </Link>
                  ) : (
                    <Link
                      to={`/brands/${brand.id}`}
                      className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs transition-colors cursor-pointer text-center block"
                    >
                      <span>Explore Brand Intelligence</span>
                    </Link>
                  )}

                  <div className="flex items-center gap-2">
                    <Link
                      to={`/brands/${brand.id}`}
                      className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-xs transition-colors cursor-pointer text-center block truncate"
                    >
                      View Responses ({realResponseCount})
                    </Link>

                    <Link
                      to="/for-brands"
                      className="flex-1 py-2 bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200/80 rounded-xl font-bold text-xs transition-colors cursor-pointer text-center block truncate"
                    >
                      Request Brand Audit
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* Empty state */}
        {filteredBrands.length === 0 && (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
            <p className="text-base font-bold text-slate-700">No brands found matching "{searchQuery}"</p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
              }}
              className="px-4 py-2 bg-purple-600 text-white text-xs font-bold rounded-xl cursor-pointer"
            >
              Clear Filters &amp; Show All 100 Brands
            </button>
          </div>
        )}

        {/* For Brands CTA Section */}
        <section className="bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950 text-white p-8 sm:p-10 rounded-3xl shadow-xl border border-purple-500/20 space-y-6">
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-300 text-xs font-bold">
              <Building2 className="w-3.5 h-3.5 text-purple-400" />
              <span>Voice Flow 360 Enterprise Solutions</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Want Independent Consumer Intelligence for Your Brand?
            </h2>

            <p className="text-xs sm:text-sm text-purple-200/90 leading-relaxed">
              Join enterprise brands that leverage our verified consumer panels, sentiment analytics, and custom product feedback audits. Gain actionable clarity to refine your product roadmap.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              to="/for-brands"
              className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl transition-all flex items-center gap-2 shadow-sm"
            >
              <Building2 className="w-4 h-4" />
              <span>Request Brand Market Study</span>
            </Link>

            <button
              onClick={() => setCurrentView('contact')}
              className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl border border-white/20 transition-all cursor-pointer"
            >
              Contact Research Team
            </button>
          </div>
        </section>

        {/* Compliant Ad Placement */}
        <AdSenseAd
          slot="4433221100"
          format="auto"
          label="Advertisement"
          adPlacementKey="enableDirectoryBannerAd"
        />
      </div>
    </div>
  );
};

