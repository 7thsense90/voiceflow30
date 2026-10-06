import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  LaunchedProduct,
  PublicProductReview,
  LAUNCHED_PRODUCTS,
  INITIAL_PRODUCT_REVIEWS,
  PRODUCT_CATEGORIES,
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
  ShieldCheck,
  Award,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

const REVIEWS_STORAGE_KEY = 'ce_public_product_reviews_v1';

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

  // Reviews state backed by localStorage
  const [reviews, setReviews] = useState<PublicProductReview[]>(() => {
    try {
      const stored = localStorage.getItem(REVIEWS_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
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
    verifiedOwner: true,
    generalFeeling: '',
    happyWithPurchase: 'very_happy' as PublicProductReview['happyWithPurchase'],
    intentToPurchase: 'definitely_will_buy' as PublicProductReview['intentToPurchase'],
    intentReason: '',
    satisfactionLevel: 'extremely_satisfied' as PublicProductReview['satisfactionLevel'],
    whatTheyLike: '',
    whatTheyDontLike: '',
  });

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    return LAUNCHED_PRODUCTS.filter((prod) => {
      const matchesCategory = selectedCategory === 'all' || prod.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        prod.name.toLowerCase().includes(q) ||
        prod.brand.toLowerCase().includes(q) ||
        prod.topFeatures.some((f) => f.toLowerCase().includes(q)) ||
        prod.summary.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    }).sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'price_low') return a.priceUSD - b.priceUSD;
      if (sortBy === 'price_high') return b.priceUSD - a.priceUSD;
      if (sortBy === 'reviews') return b.reviewCount - a.reviewCount;
      return 0; // Default order
    });
  }, [selectedCategory, searchQuery, sortBy]);

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
      authorCity: formData.authorCity.trim() || 'Verified Panelist',
      rating: formData.rating,
      createdAt: 'Just now',
      verifiedOwner: formData.verifiedOwner,
      generalFeeling: formData.generalFeeling.trim(),
      happyWithPurchase: formData.happyWithPurchase,
      intentToPurchase: formData.intentToPurchase,
      intentReason: formData.intentReason.trim() || 'Interested in product innovations and value.',
      satisfactionLevel: formData.satisfactionLevel,
      whatTheyLike: formData.whatTheyLike.trim(),
      whatTheyDontLike: formData.whatTheyDontLike.trim() || 'No major issues observed.',
    };

    setReviews((prev) => [newReview, ...prev]);
    showToast(`Thank you, ${formData.authorName}! Your review for ${reviewingProduct.name} has been published.`, 'success');

    // Reset and close
    setFormData({
      authorName: '',
      authorCity: '',
      rating: 5,
      verifiedOwner: true,
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

  // Get reviews count for a specific product
  const getProductReviews = (productId: string) => {
    return reviews.filter((r) => r.productId === productId);
  };

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
              Explore authentic public ratings, pricing in USD, and standout features for 100+ newly launched devices. Share your purchase experience, intent to buy, satisfaction scores, and what you love or dislike about each product.
            </p>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-2 max-w-4xl">
            <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4">
              <div className="text-2xl sm:text-3xl font-black text-amber-300">105+</div>
              <div className="text-xs sm:text-sm font-semibold text-purple-200">New Products Listed</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4">
              <div className="text-2xl sm:text-3xl font-black text-emerald-300">$199 - $5,999</div>
              <div className="text-xs sm:text-sm font-semibold text-purple-200">Transparent USD Prices</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4">
              <div className="text-2xl sm:text-3xl font-black text-indigo-300">89% Avg</div>
              <div className="text-xs sm:text-sm font-semibold text-purple-200">Owner Satisfaction</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4">
              <div className="text-2xl sm:text-3xl font-black text-pink-300">100% Public</div>
              <div className="text-xs sm:text-sm font-semibold text-purple-200">Open For Reviews</div>
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
                <option value="rating">Highest Rated</option>
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

          <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
            <span>
              Showing <strong>{filteredProducts.length}</strong> of {LAUNCHED_PRODUCTS.length} products
            </span>
            <span className="text-purple-600 font-semibold">
              Live Verified Public Consumer Insights
            </span>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => {
            const productReviewsList = getProductReviews(product.id);
            const hasReviews = productReviewsList.length > 0;
            const calculatedRating = hasReviews
              ? (productReviewsList.reduce((sum, r) => sum + r.rating, 0) / productReviewsList.length).toFixed(1)
              : null;
            const calculatedSatisfaction = hasReviews
              ? Math.round(
                  (productReviewsList.filter((r) => r.rating >= 4).length / productReviewsList.length) * 100
                )
              : null;

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

                    {/* Price Tag in USD */}
                    <div className="absolute bottom-3 left-3 flex items-baseline gap-1 bg-white/95 backdrop-blur-md text-slate-900 px-3 py-1 rounded-xl shadow-md border border-white/60">
                      <span className="text-base sm:text-lg font-black tracking-tight text-slate-900">
                        ${product.priceUSD.toLocaleString()}
                      </span>
                      <span className="text-[10px] font-extrabold text-purple-700">USD</span>
                    </div>

                    {/* Real Satisfaction Indicator */}
                    {calculatedSatisfaction !== null && (
                      <div className="absolute bottom-3 right-3 bg-emerald-950/80 backdrop-blur-md text-emerald-200 text-xs font-black px-2.5 py-1 rounded-lg border border-emerald-500/30 flex items-center gap-1">
                        <ThumbsUp className="w-3 h-3 text-emerald-400" />
                        <span>{calculatedSatisfaction}% Positive</span>
                      </div>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="p-4 sm:p-5 space-y-3">
                    <div>
                      <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                        <span className="font-semibold">{product.categoryLabel}</span>
                        {calculatedRating ? (
                          <div className="flex items-center gap-1 text-amber-500 font-bold">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            <span>{calculatedRating}</span>
                            <span className="text-slate-400 font-normal">({productReviewsList.length})</span>
                          </div>
                        ) : (
                          <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider">
                            No reviews yet
                          </span>
                        )}
                      </div>
                      <h3 className="text-base sm:text-lg font-extrabold text-slate-900 group-hover:text-purple-600 transition-colors leading-snug">
                        {product.name}
                      </h3>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {product.summary}
                    </p>

                    {/* Top Features Bullets */}
                    <div className="space-y-1.5 pt-1">
                      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Top Features:
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {product.topFeatures.slice(0, 3).map((feat, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-md bg-purple-50 text-purple-800 border border-purple-200/60"
                          >
                            &bull; {feat}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Sentiment & Intent Scores */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-[11px]">
                      <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                        <span className="text-slate-500 block">Intent to Purchase:</span>
                        <strong className="text-purple-700 text-xs font-black">
                          {product.intentToPurchaseRate}% High Intent
                        </strong>
                      </div>
                      <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                        <span className="text-slate-500 block">Launch Year:</span>
                        <strong className="text-slate-800 text-xs font-black">
                          {product.releaseYear}
                        </strong>
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
                    <span>Reviews ({productReviewsList.length})</span>
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

        {filteredProducts.length === 0 && (
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
      {activeProduct && (
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
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-lg sm:text-xl font-black text-amber-300">
                    ${activeProduct.priceUSD.toLocaleString()} USD
                  </span>
                  {getProductReviews(activeProduct.id).length > 0 ? (
                    <span className="text-xs text-purple-200">
                      &bull;{' '}
                      {(
                        getProductReviews(activeProduct.id).reduce((s, r) => s + r.rating, 0) /
                        getProductReviews(activeProduct.id).length
                      ).toFixed(1)}{' '}
                      ★ ({getProductReviews(activeProduct.id).length} Verified Reviews)
                    </span>
                  ) : (
                    <span className="text-xs text-purple-200">
                      &bull; Open for Verified Reviews
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
              {/* Product Highlights */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-500">
                  Top Product Features &amp; Specifications:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {activeProduct.topFeatures.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-slate-700 font-semibold">
                      <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>

                {/* Pros vs Cons breakdown */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200/80">
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                      <ThumbsUp className="w-3 h-3" /> Standout Highlights:
                    </span>
                    <ul className="text-xs text-slate-600 space-y-0.5 list-disc pl-4">
                      {activeProduct.keyPros.map((pro, i) => (
                        <li key={i}>{pro}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-amber-700 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> Areas for Consideration:
                    </span>
                    <ul className="text-xs text-slate-600 space-y-0.5 list-disc pl-4">
                      {activeProduct.keyCons.map((con, i) => (
                        <li key={i}>{con}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Public Reviews Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-purple-600" />
                    <h3 className="text-base font-extrabold text-slate-900">
                      Public Reviews &amp; Owner Feedback
                    </h3>
                  </div>

                  <button
                    onClick={() => {
                      const target = activeProduct;
                      setActiveProduct(null);
                      setReviewingProduct(target);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Add Your Review</span>
                  </button>
                </div>

                {getProductReviews(activeProduct.id).length > 0 ? (
                  <div className="space-y-4">
                    {getProductReviews(activeProduct.id).map((rev) => (
                      <div
                        key={rev.id}
                        className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-sm text-slate-900">
                                {rev.authorName}
                              </span>
                              {rev.verifiedOwner && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                  <ShieldCheck className="w-3 h-3" /> Verified Owner
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-400">
                              {rev.authorCity} &bull; {rev.createdAt}
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

                        {/* Answers to User's Specific Questions */}
                        <div className="space-y-2 text-xs">
                          {/* 1. What they feel */}
                          <div className="bg-purple-50/60 p-2.5 rounded-xl border border-purple-100 text-purple-950 font-medium">
                            <span className="font-bold text-purple-900 block mb-0.5">
                              Overall Impression &amp; Feeling:
                            </span>
                            "{rev.generalFeeling}"
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                            {/* 2. Happy with purchase? */}
                            <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                              <span className="text-slate-500 block">Happy with purchase?</span>
                              <strong className="text-slate-900 capitalize">
                                {rev.happyWithPurchase.replace(/_/g, ' ')}
                              </strong>
                            </div>

                            {/* 3. Intent to purchase? */}
                            <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                              <span className="text-slate-500 block">Intent to purchase:</span>
                              <strong className="text-slate-900 capitalize">
                                {rev.intentToPurchase.replace(/_/g, ' ')}
                              </strong>
                            </div>

                            {/* 4. Why intent to purchase? */}
                            <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 sm:col-span-2">
                              <span className="text-slate-500 block">Reason for intent to purchase:</span>
                              <span className="text-slate-800 font-medium">{rev.intentReason}</span>
                            </div>

                            {/* 5. Satisfaction level? */}
                            <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 sm:col-span-2">
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
                    <p className="text-xs text-slate-500">
                      Be the first person in the community to share your thoughts on this product!
                    </p>
                    <button
                      onClick={() => {
                        const target = activeProduct;
                        setActiveProduct(null);
                        setReviewingProduct(target);
                      }}
                      className="px-4 py-2 bg-purple-600 text-white rounded-xl font-bold text-xs"
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
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmitReview} className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1 text-xs">
              <div className="bg-purple-50 p-3 rounded-xl border border-purple-200/60 text-purple-900 text-[11px] leading-relaxed">
                Your feedback helps thousands of consumers evaluate newly launched products. Please answer honestly based on your real experience or evaluation!
              </div>

              {/* Author Info & Rating */}
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
