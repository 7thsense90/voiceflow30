import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  LaunchedProduct,
  PublicProductReview,
  LAUNCHED_PRODUCTS,
  INITIAL_PRODUCT_REVIEWS,
  PRODUCT_CATEGORIES,
  calculateProductMetrics,
  ProductCalculatedMetrics,
} from '../data/productReviewsData';
import {
  Star,
  Search,
  Filter,
  DollarSign,
  ThumbsUp,
  Heart,
  CheckCircle2,
  Sparkles,
  ShoppingBag,
  MessageSquare,
  PlusCircle,
  X,
  SlidersHorizontal,
  TrendingUp,
  Tag,
  ArrowUpDown,
  Award,
  AlertCircle,
  HelpCircle,
  Info,
  Calendar,
  FileText,
} from 'lucide-react';

const REVIEWS_STORAGE_KEY = 'ce_public_product_reviews_v2';

export const PublicProductReviews: React.FC = () => {
  const { showToast } = useApp();

  // Search, filter, and sort state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'featured' | 'rating' | 'price_low' | 'price_high' | 'reviews'>('featured');

  // Selected product for reviews modal / drawer
  const [activeProduct, setActiveProduct] = useState<LaunchedProduct | null>(null);

  // Review submission modal state
  const [reviewingProduct, setReviewingProduct] = useState<LaunchedProduct | null>(null);

  // Reviews state backed by localStorage, initialized with approved initial reviews
  const [reviews, setReviews] = useState<PublicProductReview[]>(() => {
    try {
      const stored = localStorage.getItem(REVIEWS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((r) => ({
            ...r,
            status: r.status || 'approved',
            ownershipType: r.ownershipType || (r.isSelfReportedOwner ? 'self_reported_owner' : 'prospective_buyer'),
            isSelfReportedOwner: typeof r.isSelfReportedOwner === 'boolean' ? r.isSelfReportedOwner : Boolean(r.verifiedOwner),
          }));
        }
      }
    } catch {
      // Fallback
    }
    return INITIAL_PRODUCT_REVIEWS;
  });

  // Save reviews to localStorage whenever updated
  useEffect(() => {
    try {
      localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(reviews));
    } catch (err) {
      console.warn('Failed to save public reviews to localStorage', err);
    }
  }, [reviews]);

  // Form state for writing a new review
  const [formData, setFormData] = useState({
    authorName: '',
    authorCity: '',
    rating: 5,
    ownershipType: 'self_reported_owner' as PublicProductReview['ownershipType'],
    generalFeeling: '',
    happyWithPurchase: 'very_happy' as PublicProductReview['happyWithPurchase'],
    intentToPurchase: 'definitely_will_buy' as PublicProductReview['intentToPurchase'],
    intentReason: '',
    satisfactionLevel: 'extremely_satisfied' as PublicProductReview['satisfactionLevel'],
    whatTheyLike: '',
    whatTheyDontLike: '',
  });

  // Global aggregate metrics computed strictly from genuine approved reviews
  const overallMetrics = useMemo(() => {
    const approvedReviews = reviews.filter((r) => r.status === 'approved');
    const totalApprovedCount = approvedReviews.length;

    const relevantSatisfaction = approvedReviews.filter(
      (r) =>
        r.isSelfReportedOwner ||
        r.happyWithPurchase !== 'not_purchased_yet' ||
        r.satisfactionLevel !== 'not_applicable'
    );
    const satisfiedCount = relevantSatisfaction.filter(
      (r) =>
        r.satisfactionLevel === 'extremely_satisfied' ||
        r.satisfactionLevel === 'satisfied' ||
        r.happyWithPurchase === 'very_happy' ||
        r.happyWithPurchase === 'happy'
    ).length;

    const satisfactionPct =
      relevantSatisfaction.length > 0
        ? Math.round((satisfiedCount / relevantSatisfaction.length) * 100)
        : null;

    const productsWithApprovedReviews = new Set(approvedReviews.map((r) => r.productId)).size;

    return {
      totalApprovedCount,
      satisfactionPct,
      satisfiedCount,
      satisfactionTotal: relevantSatisfaction.length,
      productsWithApprovedReviews,
    };
  }, [reviews]);

  // Filter and sort products with calculated metrics
  const filteredProductsWithMetrics = useMemo(() => {
    const items = LAUNCHED_PRODUCTS.map((prod) => ({
      product: prod,
      metrics: calculateProductMetrics(prod.id, reviews),
    }));

    return items
      .filter(({ product }) => {
        const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
        const q = searchQuery.toLowerCase().trim();
        const matchesSearch =
          !q ||
          product.name.toLowerCase().includes(q) ||
          product.brand.toLowerCase().includes(q) ||
          product.topFeatures.some((f) => f.toLowerCase().includes(q)) ||
          product.summary.toLowerCase().includes(q);
        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'rating') {
          const ratingA = a.metrics.avgRating ? Number(a.metrics.avgRating) : -1;
          const ratingB = b.metrics.avgRating ? Number(b.metrics.avgRating) : -1;
          if (ratingB !== ratingA) return ratingB - ratingA;
          return b.metrics.reviewCount - a.metrics.reviewCount;
        }
        if (sortBy === 'price_low') return a.product.priceUSD - b.product.priceUSD;
        if (sortBy === 'price_high') return b.product.priceUSD - a.product.priceUSD;
        if (sortBy === 'reviews') return b.metrics.reviewCount - a.metrics.reviewCount;
        return 0; // Featured default order
      });
  }, [selectedCategory, searchQuery, sortBy, reviews]);

  // Handle Review Submission
  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewingProduct) return;

    if (!formData.authorName.trim()) {
      showToast('Please enter your name or nickname to publish your review.', 'error');
      return;
    }
    if (!formData.generalFeeling.trim()) {
      showToast('Please share a few words about what you feel regarding the product.', 'error');
      return;
    }
    if (!formData.whatTheyLike.trim()) {
      showToast('Please specify what you like about the product.', 'error');
      return;
    }

    const newReview: PublicProductReview = {
      id: `rev-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      productId: reviewingProduct.id,
      authorName: formData.authorName.trim(),
      authorCity: formData.authorCity.trim() || 'Community Contributor',
      rating: formData.rating,
      createdAt: 'Just now',
      ownershipType: formData.ownershipType,
      isSelfReportedOwner: formData.ownershipType === 'self_reported_owner',
      status: 'approved',
      generalFeeling: formData.generalFeeling.trim(),
      happyWithPurchase: formData.happyWithPurchase,
      intentToPurchase: formData.intentToPurchase,
      intentReason: formData.intentReason.trim() || 'Evaluated for personal productivity and tech interests.',
      satisfactionLevel: formData.satisfactionLevel,
      whatTheyLike: formData.whatTheyLike.trim(),
      whatTheyDontLike: formData.whatTheyDontLike.trim() || 'No major drawbacks identified.',
    };

    setReviews((prev) => [newReview, ...prev]);
    showToast(`Thank you, ${formData.authorName}! Your review for ${reviewingProduct.name} has been published and approved.`, 'success');

    // Reset and close
    setFormData({
      authorName: '',
      authorCity: '',
      rating: 5,
      ownershipType: 'self_reported_owner',
      generalFeeling: '',
      happyWithPurchase: 'very_happy',
      intentToPurchase: 'definitely_will_buy',
      intentReason: '',
      satisfactionLevel: 'extremely_satisfied',
      whatTheyLike: '',
      whatTheyDontLike: '',
    });
    setReviewingProduct(null);
  };

  // Get active product metrics when modal is opened
  const activeMetrics = useMemo(() => {
    if (!activeProduct) return null;
    return calculateProductMetrics(activeProduct.id, reviews);
  }, [activeProduct, reviews]);

  // Approved reviews for the active product
  const activeApprovedReviews = useMemo(() => {
    if (!activeProduct) return [];
    return reviews.filter((r) => r.productId === activeProduct.id && r.status === 'approved');
  }, [activeProduct, reviews]);

  return (
    <div className="min-h-screen bg-[#f8f9fc] text-slate-800 pb-20">
      {/* Header / Hero Section */}
      <section className="bg-gradient-to-b from-purple-900 via-indigo-900 to-slate-900 text-white pt-10 pb-16 px-4 sm:px-6 lg:px-8 border-b border-indigo-950/60 shadow-md">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-200 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>100+ Newly Launched Products &bull; Public Consumer Feedback</span>
          </div>

          <div className="space-y-3 max-w-3xl">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
              Public Product Reviews
            </h1>
            <p className="text-base sm:text-lg text-purple-100/90 leading-relaxed font-normal">
              Explore authentic public ratings, manufacturer USD launch prices, and baseline technical features for 100+ newly launched devices. Review genuine community feedback, self-reported satisfaction scores, and purchase intent without simulated percentages.
            </p>
          </div>

          {/* Quick Stats Grid — Calculated from Genuine Approved Data */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-2 max-w-4xl">
            {/* 1. Products Listed */}
            <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4">
              <div className="text-2xl sm:text-3xl font-black text-amber-300">
                {LAUNCHED_PRODUCTS.length}+
              </div>
              <div className="text-xs sm:text-sm font-semibold text-purple-200">
                Products Listed
              </div>
              <div className="text-[10px] text-purple-300/80 mt-1">
                Official specifications baseline
              </div>
            </div>

            {/* 2. USD Price Range */}
            <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4">
              <div className="text-2xl sm:text-3xl font-black text-emerald-300">
                $129 - $5,999
              </div>
              <div className="text-xs sm:text-sm font-semibold text-purple-200">
                Published Launch MSRP
              </div>
              <div className="text-[10px] text-purple-300/80 mt-1">
                Documented launch prices (USD)
              </div>
            </div>

            {/* 3. Owner Satisfaction (Genuine Calculation) */}
            <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4">
              <div className="text-2xl sm:text-3xl font-black text-indigo-300">
                {overallMetrics.satisfactionPct !== null ? (
                  `${overallMetrics.satisfactionPct}%`
                ) : (
                  <span className="text-lg font-bold text-indigo-200">Not enough data</span>
                )}
              </div>
              <div className="text-xs sm:text-sm font-semibold text-purple-200">
                Owner Satisfaction
              </div>
              <div className="text-[10px] text-purple-300/80 mt-1">
                {overallMetrics.satisfactionPct !== null ? (
                  `Based on ${overallMetrics.satisfactionTotal} approved response${overallMetrics.satisfactionTotal === 1 ? '' : 's'} (${overallMetrics.satisfiedCount} satisfied)`
                ) : (
                  'Awaiting approved community reviews'
                )}
              </div>
            </div>

            {/* 4. Approved Reviews */}
            <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4">
              <div className="text-2xl sm:text-3xl font-black text-pink-300">
                {overallMetrics.totalApprovedCount}
              </div>
              <div className="text-xs sm:text-sm font-semibold text-purple-200">
                Approved Reviews
              </div>
              <div className="text-[10px] text-purple-300/80 mt-1">
                Self-reported (Unverified purchases)
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        {/* Search, Filter & Sort Controls Card */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xl p-4 sm:p-6 mb-8 space-y-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 sm:gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search 100+ newly launched products by name, brand (e.g. Apple, Sony, Dyson)..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  aria-label="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 shrink-0">
              <ArrowUpDown className="w-4 h-4 text-slate-500" />
              <span className="text-xs font-bold text-slate-500 hidden sm:inline">Sort:</span>
              <select
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-600 cursor-pointer"
              >
                <option value="featured">Featured Order</option>
                <option value="rating">Highest Rated (Approved)</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
                <option value="reviews">Most Reviewed</option>
              </select>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar">
            {PRODUCT_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 sm:px-4 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Data Policy & Results Counter */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 gap-2">
            <span>
              Showing <strong>{filteredProductsWithMetrics.length}</strong> of {LAUNCHED_PRODUCTS.length} products
            </span>
            <div className="flex items-center gap-1.5 text-purple-700 font-medium text-[11px]">
              <Info className="w-3.5 h-3.5 text-purple-600 shrink-0" />
              <span>
                Ratings &amp; satisfaction percentages are calculated exclusively from real approved reviews. Products without reviews display &ldquo;Not enough data&rdquo;.
              </span>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProductsWithMetrics.map(({ product, metrics }) => {
            return (
              <div
                key={product.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
              >
                {/* Product Card Top: Image, Badges & Price */}
                <div>
                  <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

                    {/* Badge */}
                    <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-700/90 text-white backdrop-blur-md shadow-xs">
                        {product.badge}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-900/80 text-purple-200 backdrop-blur-md">
                        {product.brand}
                      </span>
                    </div>

                    {/* Price Tag in USD with Official MSRP indicator */}
                    <div className="absolute bottom-3 left-3 flex flex-col bg-white/95 backdrop-blur-md text-slate-900 px-3 py-1 rounded-xl shadow-md border border-white/60">
                      <div className="flex items-baseline gap-1">
                        <span className="text-base sm:text-lg font-black tracking-tight text-slate-900">
                          ${product.priceUSD.toLocaleString()}
                        </span>
                        <span className="text-[10px] font-extrabold text-purple-700">USD</span>
                      </div>
                      <span className="text-[9px] text-slate-500 font-semibold -mt-0.5">
                        Official Launch MSRP
                      </span>
                    </div>

                    {/* Owner Satisfaction Badge: Display ONLY if calculated from genuine responses */}
                    {metrics.satisfactionPct !== null && (
                      <div className="absolute bottom-3 right-3 bg-emerald-950/85 backdrop-blur-md text-emerald-200 text-xs font-black px-2.5 py-1 rounded-lg border border-emerald-500/30 flex items-center gap-1">
                        <ThumbsUp className="w-3 h-3 text-emerald-400" />
                        <span>
                          {metrics.satisfactionPct}% ({metrics.satisfactionTotal} {metrics.satisfactionTotal === 1 ? 'resp.' : 'resps.'})
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="p-4 sm:p-5 space-y-3">
                    <div>
                      <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                        <span className="font-semibold">{product.categoryLabel}</span>
                        {/* Rating Display: Genuine calculation or 'Not enough data' */}
                        {metrics.avgRating !== null ? (
                          <div
                            className="flex items-center gap-1 text-amber-500 font-bold"
                            title={metrics.ratingExplanation}
                          >
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            <span>{metrics.avgRating}</span>
                            <span className="text-slate-400 font-normal">
                              ({metrics.reviewCount} {metrics.reviewCount === 1 ? 'review' : 'reviews'})
                            </span>
                          </div>
                        ) : (
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded-md">
                            Not enough data (0 reviews)
                          </span>
                        )}
                      </div>
                      <h3 className="text-base sm:text-lg font-extrabold text-slate-900 group-hover:text-purple-600 transition-colors leading-snug">
                        {product.name}
                      </h3>
                    </div>

                    {/* SECTION 1: Official Specifications (Manufacturer Baseline) */}
                    <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-200/70 space-y-2">
                      <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        <span>Manufacturer Specifications:</span>
                        <span className="text-[9.5px] font-normal text-slate-400">
                          {product.specsDate}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {product.summary}
                      </p>
                      <div className="flex flex-wrap gap-1.5 pt-0.5">
                        {product.topFeatures.slice(0, 3).map((feat, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center text-[10.5px] font-semibold px-2 py-0.5 rounded-md bg-white text-slate-700 border border-slate-200"
                          >
                            &bull; {feat}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* SECTION 2: Community Feedback & Metrics (Self-Reported) */}
                    <div className="pt-2 border-t border-slate-200/80 space-y-2">
                      <div className="flex items-center justify-between text-[10.5px] font-extrabold text-purple-900 uppercase tracking-wider">
                        <span>Community Feedback (Self-Reported):</span>
                        <span className="text-[10px] font-medium text-slate-500">
                          {metrics.reviewCount > 0
                            ? `${metrics.reviewCount} Approved ${metrics.reviewCount === 1 ? 'Review' : 'Reviews'}`
                            : '0 Responses'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        {/* Owner Satisfaction Metric Box */}
                        <div className="bg-purple-50/40 p-2 rounded-xl border border-purple-100">
                          <span className="text-slate-500 block text-[10px] font-semibold">
                            Owner Satisfaction:
                          </span>
                          {metrics.satisfactionPct !== null ? (
                            <>
                              <strong className="text-emerald-700 text-xs font-black block">
                                {metrics.satisfactionPct}% ({metrics.satisfactionTotal} {metrics.satisfactionTotal === 1 ? 'response' : 'responses'})
                              </strong>
                              <span
                                className="text-[9.5px] text-slate-500 block mt-0.5 truncate"
                                title={metrics.satisfactionExplanation}
                              >
                                Calc: {metrics.satisfactionCount}/{metrics.satisfactionTotal} satisfied
                              </span>
                            </>
                          ) : (
                            <>
                              <strong className="text-slate-500 text-xs font-bold block">
                                Not enough data
                              </strong>
                              <span className="text-[9.5px] text-slate-400 block mt-0.5">
                                0 owner responses
                              </span>
                            </>
                          )}
                        </div>

                        {/* Intent to Purchase Metric Box */}
                        <div className="bg-purple-50/40 p-2 rounded-xl border border-purple-100">
                          <span className="text-slate-500 block text-[10px] font-semibold">
                            Intent to Purchase:
                          </span>
                          {metrics.intentPct !== null ? (
                            <>
                              <strong className="text-purple-700 text-xs font-black block">
                                {metrics.intentPct}% ({metrics.intentTotal} {metrics.intentTotal === 1 ? 'response' : 'responses'})
                              </strong>
                              <span
                                className="text-[9.5px] text-slate-500 block mt-0.5 truncate"
                                title={metrics.intentExplanation}
                              >
                                Calc: {metrics.intentPositive}/{metrics.intentTotal} plan to buy/own
                              </span>
                            </>
                          ) : (
                            <>
                              <strong className="text-slate-500 text-xs font-bold block">
                                Not enough data
                              </strong>
                              <span className="text-[9.5px] text-slate-400 block mt-0.5">
                                0 intent responses
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Action Buttons */}
                <div className="p-4 sm:p-5 pt-0 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setActiveProduct(product)}
                    className="w-full py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-purple-600" />
                    <span>Reviews ({metrics.reviewCount})</span>
                  </button>

                  <button
                    onClick={() => setReviewingProduct(product)}
                    className="w-full py-2.5 px-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Write Review</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {filteredProductsWithMetrics.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto space-y-3">
            <Search className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No matching products found</h3>
            <p className="text-xs text-slate-500">
              Try adjusting your search query or reset your category filter to see all 105+ products.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="mt-2 px-4 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs"
            >
              Reset Filters
            </button>
          </div>
        )}
      </main>

      {/* Product Details & Reviews View Modal */}
      {activeProduct && activeMetrics && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto animate-fadeIn">
          <div className="relative w-full max-w-3xl my-6 bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-4 sm:p-6 bg-gradient-to-r from-purple-900 to-indigo-900 text-white flex items-center justify-between shrink-0">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-300">
                  {activeProduct.brand} &bull; {activeProduct.categoryLabel}
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
                  {activeProduct.name}
                </h2>
                <div className="flex flex-wrap items-baseline gap-2 mt-1">
                  <span className="text-lg sm:text-xl font-black text-amber-300">
                    ${activeProduct.priceUSD.toLocaleString()} USD
                  </span>
                  <span className="text-xs text-purple-300">
                    (Official Launch MSRP)
                  </span>
                  {activeMetrics.avgRating !== null ? (
                    <span className="text-xs text-purple-200">
                      &bull; {activeMetrics.avgRating} ★ ({activeMetrics.reviewCount} Approved Community {activeMetrics.reviewCount === 1 ? 'Review' : 'Reviews'})
                    </span>
                  ) : (
                    <span className="text-xs text-purple-200">
                      &bull; Not enough data (0 reviews submitted)
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={() => setActiveProduct(null)}
                className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 text-slate-800">
              {/* ============================================================== */}
              {/* SECTION 1: OFFICIAL SPECIFICATIONS & PUBLISHED PRICING BASELINE */}
              {/* ============================================================== */}
              <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200/90 pb-2.5 gap-1">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-slate-700" />
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">
                      Official Specifications &amp; Pricing Baseline
                    </h4>
                  </div>
                  <span className="text-[10px] font-extrabold text-slate-600 bg-white px-2 py-0.5 rounded-md border border-slate-200 w-fit">
                    Manufacturer Baseline &bull; Independent of Community Feedback
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  Product specifications, technical features, and launch prices are sourced directly from official manufacturer documentation and press releases. They are recorded and maintained independently from public consumer feedback.
                </p>

                {/* Sourcing & Verification Metadata */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-white p-3 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">
                      Pricing Documentation:
                    </span>
                    <strong className="text-slate-800 font-semibold block">
                      ${activeProduct.priceUSD.toLocaleString()} USD MSRP
                    </strong>
                    <span className="text-[11px] text-slate-500">
                      {activeProduct.priceSource} &bull; {activeProduct.priceDate}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">
                      Technical Specifications Source:
                    </span>
                    <strong className="text-slate-800 font-semibold block">
                      {activeProduct.specsSource}
                    </strong>
                    <span className="text-[11px] text-slate-500">
                      {activeProduct.specsDate}
                    </span>
                  </div>
                </div>

                {/* Technical Specifications Bullets */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                    Core Hardware &amp; Architectural Features:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {activeProduct.topFeatures.map((feat, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-slate-700 font-semibold bg-white p-2 rounded-lg border border-slate-200/80">
                        <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Summary */}
                <div className="text-xs text-slate-600 bg-white p-3 rounded-xl border border-slate-200/80">
                  <span className="font-bold text-slate-700 block mb-0.5">Architecture Overview:</span>
                  <p>{activeProduct.summary}</p>
                </div>

                {/* Baseline Considerations Breakdown */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-slate-200">
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                      <ThumbsUp className="w-3 h-3" /> Architectural Strengths:
                    </span>
                    <ul className="text-xs text-slate-600 space-y-0.5 list-disc pl-4">
                      {activeProduct.keyPros.map((pro, i) => (
                        <li key={i}>{pro}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-amber-700 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> Baseline Tradeoffs &amp; Considerations:
                    </span>
                    <ul className="text-xs text-slate-600 space-y-0.5 list-disc pl-4">
                      {activeProduct.keyCons.map((con, i) => (
                        <li key={i}>{con}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* ============================================================== */}
              {/* SECTION 2: PUBLIC COMMUNITY FEEDBACK & REVIEWS */}
              {/* ============================================================== */}
              <div className="bg-white p-4 sm:p-5 rounded-2xl border-2 border-purple-200/80 shadow-xs space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-purple-100 pb-3 gap-2">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-purple-600" />
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900 leading-tight">
                        Public Community Feedback &amp; Reviews
                      </h3>
                      <span className="text-[10.5px] text-slate-500 font-medium">
                        Self-reported consumer submissions (Purchases are unverified)
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      const target = activeProduct;
                      setActiveProduct(null);
                      setReviewingProduct(target);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer w-fit"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Add Your Review</span>
                  </button>
                </div>

                {/* Transparency Notice */}
                <div className="bg-purple-50/70 p-3 rounded-xl border border-purple-200/70 text-purple-950 text-xs space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-purple-900">
                    <Info className="w-3.5 h-3.5" />
                    <span>Metrics Calculation &amp; Verification Policy</span>
                  </div>
                  <p className="text-[11.5px] text-purple-900/90 leading-relaxed font-normal">
                    Ratings and percentage scores below are computed strictly from real approved responses. We do not imply purchase verification; reviewer ownership status is self-reported. Items with zero relevant responses display &ldquo;Not enough data&rdquo; rather than a placeholder percentage.
                  </p>
                </div>

                {/* Three Metrics Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  {/* Metric 1: Star Rating */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">
                      Approved Rating:
                    </span>
                    <div className="text-lg font-black text-amber-500 flex items-center gap-1">
                      {activeMetrics.avgRating !== null ? (
                        <>
                          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                          <span>{activeMetrics.avgRating} / 5.0</span>
                        </>
                      ) : (
                        <span className="text-sm font-bold text-slate-500">Not enough data</span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-500 block leading-tight">
                      {activeMetrics.ratingExplanation}
                    </span>
                  </div>

                  {/* Metric 2: Owner Satisfaction */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">
                      Owner Satisfaction:
                    </span>
                    <div className="text-lg font-black text-emerald-700">
                      {activeMetrics.satisfactionPct !== null ? (
                        `${activeMetrics.satisfactionPct}%`
                      ) : (
                        <span className="text-sm font-bold text-slate-500">Not enough data</span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-500 block leading-tight">
                      {activeMetrics.satisfactionExplanation}
                    </span>
                  </div>

                  {/* Metric 3: Intent to Purchase */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">
                      Intent to Purchase:
                    </span>
                    <div className="text-lg font-black text-purple-700">
                      {activeMetrics.intentPct !== null ? (
                        `${activeMetrics.intentPct}%`
                      ) : (
                        <span className="text-sm font-bold text-slate-500">Not enough data</span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-500 block leading-tight">
                      {activeMetrics.intentExplanation}
                    </span>
                  </div>
                </div>

                {/* Approved Reviews List */}
                {activeApprovedReviews.length > 0 ? (
                  <div className="space-y-4 pt-2">
                    <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Approved Reviews ({activeApprovedReviews.length}):
                    </h5>
                    {activeApprovedReviews.map((rev) => (
                      <div
                        key={rev.id}
                        className="p-4 rounded-2xl bg-slate-50/60 border border-slate-200 shadow-xs space-y-3"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-sm text-slate-900">
                                {rev.authorName}
                              </span>
                              {/* Ownership Status Badge — Transparent & Non-misleading */}
                              {rev.isSelfReportedOwner ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                                  Self-reported Owner (Unverified Purchase)
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-700">
                                  Prospective Reviewer (Unverified)
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-400">
                              {rev.authorCity || 'Community Contributor'} &bull; {rev.createdAt}
                            </span>
                          </div>

                          <div className="flex items-center gap-0.5 text-amber-400">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3.5 h-3.5 ${
                                  i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                                }`}
                              />
                            ))}
                          </div>
                        </div>

                        {/* Detailed Community Survey Responses */}
                        <div className="space-y-2 text-xs">
                          {/* 1. What they feel */}
                          <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-slate-900 font-medium">
                            <span className="font-bold text-purple-900 block mb-0.5">
                              Overall Impression &amp; Feeling:
                            </span>
                            &ldquo;{rev.generalFeeling}&rdquo;
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                            {/* 2. Happy with purchase? */}
                            <div className="p-2 rounded-lg bg-white border border-slate-200">
                              <span className="text-slate-500 block">Happy with purchase?</span>
                              <strong className="text-slate-900 capitalize">
                                {rev.happyWithPurchase.replace(/_/g, ' ')}
                              </strong>
                            </div>

                            {/* 3. Intent to purchase? */}
                            <div className="p-2 rounded-lg bg-white border border-slate-200">
                              <span className="text-slate-500 block">Intent to purchase:</span>
                              <strong className="text-slate-900 capitalize">
                                {rev.intentToPurchase.replace(/_/g, ' ')}
                              </strong>
                            </div>

                            {/* 4. Why intent to purchase? */}
                            <div className="p-2 rounded-lg bg-white border border-slate-200 sm:col-span-2">
                              <span className="text-slate-500 block">Reason for intent to purchase:</span>
                              <span className="text-slate-800 font-medium">{rev.intentReason}</span>
                            </div>

                            {/* 5. Satisfaction level? */}
                            <div className="p-2 rounded-lg bg-white border border-slate-200 sm:col-span-2">
                              <span className="text-slate-500 block">Satisfaction level:</span>
                              <strong className="text-emerald-700 capitalize font-bold">
                                {rev.satisfactionLevel.replace(/_/g, ' ')}
                              </strong>
                            </div>
                          </div>

                          {/* 6. What they like */}
                          <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-100 text-emerald-950">
                            <strong className="text-emerald-800 block mb-0.5">
                              &bull; What they like about the product:
                            </strong>
                            <p className="text-slate-700 font-normal">{rev.whatTheyLike}</p>
                          </div>

                          {/* 7. What they don't like */}
                          <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-100 text-amber-950">
                            <strong className="text-amber-800 block mb-0.5">
                              &bull; What they don't like about the product:
                            </strong>
                            <p className="text-slate-700 font-normal">{rev.whatTheyDontLike}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 space-y-2">
                    <p className="text-xs font-bold text-slate-700">
                      No approved community reviews yet for this product.
                    </p>
                    <p className="text-xs text-slate-500 max-w-md mx-auto">
                      All owner satisfaction and purchase intent percentages display &ldquo;Not enough data&rdquo; until real community reviews are submitted and approved.
                    </p>
                    <button
                      onClick={() => {
                        const target = activeProduct;
                        setActiveProduct(null);
                        setReviewingProduct(target);
                      }}
                      className="mt-2 px-4 py-2 bg-purple-600 text-white rounded-xl font-bold text-xs cursor-pointer hover:bg-purple-700"
                    >
                      Write First Review
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Review Submission Modal with All 7 Detailed Questions */}
      {reviewingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto animate-fadeIn">
          <div className="relative w-full max-w-2xl my-6 bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-800 text-white flex items-center justify-between shrink-0">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-200">
                  Public Consumer Feedback
                </span>
                <h3 className="text-lg sm:text-xl font-black text-white">
                  Review {reviewingProduct.name} (${reviewingProduct.priceUSD} USD)
                </h3>
              </div>
              <button
                onClick={() => setReviewingProduct(null)}
                className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmitReview} className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1 text-xs">
              <div className="bg-purple-50 p-3 rounded-xl border border-purple-200/60 text-purple-900 text-[11.5px] leading-relaxed">
                Your feedback helps thousands of consumers evaluate newly launched products. Please answer honestly based on your real experience or evaluation.
              </div>

              {/* Author Info & Ownership Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Your Name or Nickname <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.authorName}
                    onChange={(e) => setFormData({ ...formData, authorName: e.target.value })}
                    placeholder="e.g. Alex Morgan"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-purple-600 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    City / Region (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.authorCity}
                    onChange={(e) => setFormData({ ...formData, authorCity: e.target.value })}
                    placeholder="e.g. New York, NY"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-purple-600 focus:bg-white"
                  />
                </div>
              </div>

              {/* Ownership Status Selection (Non-Misleading, Self-Reported) */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Ownership Status (Self-reported) <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.ownershipType}
                  onChange={(e: any) => setFormData({ ...formData, ownershipType: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:ring-2 focus:ring-purple-600"
                >
                  <option value="self_reported_owner">
                    I own this product (Self-reported owner; purchase is not verified)
                  </option>
                  <option value="prospective_buyer">
                    I do not own this product yet (Prospective evaluation)
                  </option>
                  <option value="tested_only">
                    I tested or tried this product hands-on
                  </option>
                </select>
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Transparency Notice: We do not independently verify purchase receipts or transaction logs.
                </span>
              </div>

              {/* Rating Star Selection */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Overall Star Rating:
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setFormData({ ...formData, rating: star })}
                        className="p-1 text-amber-400 hover:scale-110 transition-transform cursor-pointer"
                        aria-label={`${star} star rating`}
                      >
                        <Star
                          className={`w-6 h-6 ${
                            star <= formData.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  <span className="text-xs font-bold text-slate-700">
                    {formData.rating} out of 5 Stars
                  </span>
                </div>
              </div>

              {/* 1. What they feel about the product */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  1. What do you feel about this product? <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  value={formData.generalFeeling}
                  onChange={(e) => setFormData({ ...formData, generalFeeling: e.target.value })}
                  placeholder="Share your general sentiment, first impressions, build quality feel, or overall vibe..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-purple-600 focus:bg-white"
                />
              </div>

              {/* 2. Are they happy with purchase? */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  2. Are you happy with this purchase?
                </label>
                <select
                  value={formData.happyWithPurchase}
                  onChange={(e: any) => setFormData({ ...formData, happyWithPurchase: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:ring-2 focus:ring-purple-600"
                >
                  <option value="very_happy">Very Happy (Exceeded my expectations)</option>
                  <option value="happy">Happy (Satisfied with the value)</option>
                  <option value="neutral">Neutral (Has pros and cons)</option>
                  <option value="unhappy">Unhappy (Regret purchase or considering return)</option>
                  <option value="not_purchased_yet">Have not purchased yet (Prospective reviewer)</option>
                </select>
              </div>

              {/* 3. Do you have an intent to purchase? */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  3. Do you have an intent to purchase this product?
                </label>
                <select
                  value={formData.intentToPurchase}
                  onChange={(e: any) => setFormData({ ...formData, intentToPurchase: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:ring-2 focus:ring-purple-600"
                >
                  <option value="already_purchased">Already Purchased &amp; Own It</option>
                  <option value="definitely_will_buy">Definitely Plan to Buy</option>
                  <option value="considering">Considering (Waiting for sale/reviews)</option>
                  <option value="unlikely_to_buy">Unlikely to Buy</option>
                  <option value="no_intent">No Intent to Purchase</option>
                </select>
              </div>

              {/* 4. Why do you have an intent to purchase? */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  4. Why do you have an intent to purchase (or not purchase)?
                </label>
                <textarea
                  rows={2}
                  value={formData.intentReason}
                  onChange={(e) => setFormData({ ...formData, intentReason: e.target.value })}
                  placeholder="e.g. Replacing my older model, specific feature upgrade, attractive price, gift for someone..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-purple-600 focus:bg-white"
                />
              </div>

              {/* 5. Are you satisfied with the product? */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  5. Are you satisfied with the product?
                </label>
                <select
                  value={formData.satisfactionLevel}
                  onChange={(e: any) => setFormData({ ...formData, satisfactionLevel: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:ring-2 focus:ring-purple-600"
                >
                  <option value="extremely_satisfied">Extremely Satisfied</option>
                  <option value="satisfied">Satisfied</option>
                  <option value="neutral">Neutral</option>
                  <option value="dissatisfied">Dissatisfied</option>
                  <option value="not_applicable">Not Applicable / Have not tested</option>
                </select>
              </div>

              {/* 6. What they like about the product */}
              <div>
                <label className="font-bold text-emerald-800 block mb-1">
                  6. What do you LIKE about the product? (Standout Pros) <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  value={formData.whatTheyLike}
                  onChange={(e) => setFormData({ ...formData, whatTheyLike: e.target.value })}
                  placeholder="What works well? Standout features, battery, design, performance, value..."
                  className="w-full px-3 py-2 bg-emerald-50/50 border border-emerald-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-600 focus:bg-white"
                />
              </div>

              {/* 7. What they don't like about the product */}
              <div>
                <label className="font-bold text-amber-800 block mb-1">
                  7. What do you NOT like about the product? (Areas for Improvement)
                </label>
                <textarea
                  rows={2}
                  value={formData.whatTheyDontLike}
                  onChange={(e) => setFormData({ ...formData, whatTheyDontLike: e.target.value })}
                  placeholder="Any drawbacks, quirks, missing features, high pricing, or software annoyances?"
                  className="w-full px-3 py-2 bg-amber-50/50 border border-amber-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-amber-600 focus:bg-white"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setReviewingProduct(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Publish Public Review</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicProductReviews;
