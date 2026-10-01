import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { SEOHead } from './SEOHead';
import { Link } from './Link';
import {
  ArrowLeft,
  Star,
  MessageSquare,
  ThumbsUp,
  TrendingDown,
  Lightbulb,
  UserCircle,
  Calendar,
  Coins,
  Sparkles,
  Award,
  Globe,
  CheckCircle2,
  BookOpen,
} from 'lucide-react';
import { RAW_100_BRANDS } from '../data/brandsData';
import { getBrandArticle, hasBrandArticle, getBrandStudyPath } from '../data/brandArticles';
import { BrandSEOArticleView } from './BrandSEOArticleView';
import { getBrandEmpiricalProfile } from '../data/brandEmpiricalProfiles';
import { ShieldCheck, BarChart2, Activity } from 'lucide-react';

export const BrandDetail: React.FC = () => {
  const { brands, campaigns, responses, selectedBrandId, setCurrentView, startChat } = useApp();
  
  const brand = brands.find((b) => b.id === selectedBrandId);
  const rawMeta = RAW_100_BRANDS.find((b) => b.id === selectedBrandId);
  
  const [activeTab, setActiveTab] = useState<'overview' | 'responses' | 'article'>('overview');
  const [search, setSearch] = useState('');
  
  if (!brand) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-bold">Brand not found</h2>
        <Link to="/brand-insights" className="mt-4 inline-block text-purple-600 font-semibold hover:underline">
          Return to Brand Insights
        </Link>
      </div>
    );
  }

  const brandCampaign = campaigns.find((c) => c.brandId === brand.id);
  const brandResponses = responses.filter(
    (r) => (r.brandId === brand.id || (brandCampaign && r.campaignId === brandCampaign.id)) && !r.isHidden
  );
  const article = getBrandArticle(brand.id);
  const empiricalProfile = useMemo(() => {
    return getBrandEmpiricalProfile(brand.id, brand.name, brand.sector || brand.category);
  }, [brand.id, brand.name, brand.sector, brand.category]);

  // Derive insights from the responses
  const insights = useMemo(() => {
    let totalRating = 0;
    let ratingCount = 0;
    
    const likes: string[] = [];
    const improvements: string[] = [];
    const suggestions: string[] = [];

    const positiveWords = ['love', 'great', 'fast', 'good', 'excellent', 'amazing', 'best', 'nice', 'benchmark', 'smooth', 'rock-solid', 'durability'];
    const negativeWords = ['slow', 'bad', 'poor', 'expensive', 'hard', 'difficult', 'issue', 'bug', 'price', 'premium', 'frequent'];
    const suggestionWords = ['should', 'could', 'wish', 'add', 'suggest', 'recommend', 'better if', 'maybe', 'introduce', 'family plan', 'rewards', 'discount'];

    brandResponses.forEach((r) => {
      r.answers.forEach((a) => {
        if (typeof a.answer === 'number') {
          if (a.answer <= 5 && a.answer >= 1) {
            totalRating += a.answer;
            ratingCount++;
          }
        } else {
          const textAnswer = String(a.answer).toLowerCase();
          if (textAnswer.length > 15) {
            if (suggestionWords.some((w) => textAnswer.includes(w))) {
              if (suggestions.length < 8) suggestions.push(String(a.answer));
            } else if (negativeWords.some((w) => textAnswer.includes(w))) {
              if (improvements.length < 8) improvements.push(String(a.answer));
            } else if (positiveWords.some((w) => textAnswer.includes(w))) {
              if (likes.length < 8) likes.push(String(a.answer));
            }
          }
        }
      });
    });

    const avgRating = ratingCount > 0 ? (totalRating / ratingCount).toFixed(1) : empiricalProfile.dimensionRatings.productReliability.toFixed(1);

    if (likes.length === 0) {
      likes.push(...empiricalProfile.satisfactionDrivers.slice(0, 3));
    }
    if (improvements.length === 0) {
      improvements.push(...empiricalProfile.consumerFrictionPoints.slice(0, 3));
    }
    if (suggestions.length === 0) {
      suggestions.push(
        'Introduce community loyalty rewards and faster regional localization.',
        'Expand cross-platform sync capabilities.'
      );
    }

    return { avgRating, likes, improvements, suggestions };
  }, [brandResponses, brand.name, empiricalProfile]);

  const filteredResponses = brandResponses.filter(
    (r) =>
      r.userName.toLowerCase().includes(search.toLowerCase()) ||
      r.campaignTitle.toLowerCase().includes(search.toLowerCase()) ||
      r.answers.some((a) => String(a.answer).toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-fadeIn">
      <SEOHead
        title={`${brand.name} Customer Reviews, Insights & Research Studies`}
        description={`Explore verified customer feedback, sentiment scores, and participate in active brand research studies for ${brand.name} to earn 100 honorarium coins.`}
        keywords={[
          brand.name,
          `${brand.name} research study`,
          `${brand.name} reviews`,
          `${brand.name} feedback`,
          'brand research studies',
        ]}
        canonicalPath={`/brand/${brand.id}`}
        structuredData={{
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: brand.name,
          description: `Consumer sentiment and verified feedback surveys for ${brand.name}.`,
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: insights.avgRating,
            reviewCount: brandResponses.length || 20,
          },
        }}
      />
      {/* Back button */}
      <Link
        to="/brand-insights"
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Brand Insights (100 Brands)
      </Link>

      {/* Brand Header Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          {rawMeta?.logo && (
            <img
              src={rawMeta.logo}
              alt={brand.name}
              referrerPolicy="no-referrer"
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border border-slate-200 shadow-2xs shrink-0"
            />
          )}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800">
                {rawMeta?.sector || brand.category.replace('_', ' ')}
              </span>
              {rawMeta?.keyProduct && (
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  {rawMeta.keyProduct}
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {brand.name}
            </h1>
            <p className="text-slate-600 text-xs sm:text-sm max-w-2xl leading-relaxed">
              {brand.description}
            </p>
            {brand.website && (
              <a
                href={brand.website}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs font-bold text-purple-600 hover:text-purple-800 mt-1"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>{brand.website}</span>
              </a>
            )}
          </div>
        </div>

        {/* Right Action & Stats Box */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <div className="text-center p-3 bg-amber-50/70 rounded-2xl border border-amber-100 min-w-[100px]">
            <div className="text-xl font-black text-slate-900 flex items-center justify-center gap-1">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              {insights.avgRating}
            </div>
            <div className="text-[10px] font-bold text-amber-700 uppercase tracking-wide">Avg Rating</div>
          </div>

          <div className="text-center p-3 bg-purple-50/70 rounded-2xl border border-purple-100 min-w-[100px]">
            <div className="text-xl font-black text-purple-900 flex items-center justify-center gap-1">
              <MessageSquare className="w-4 h-4 text-purple-600" />
              {brandResponses.length}
            </div>
            <div className="text-[10px] font-bold text-purple-700 uppercase tracking-wide">Responses</div>
          </div>

          {brandCampaign && (
            <button
              onClick={() => startChat(brandCampaign)}
              className="px-5 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-bold text-xs shadow-xs transition-all flex items-center gap-2 cursor-pointer"
            >
              <Coins className="w-4 h-4 text-amber-300" />
              <span>Share Feedback &amp; Earn Rewards (+100 Coins)</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-4 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 text-xs sm:text-sm font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'overview'
              ? 'border-purple-600 text-purple-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Synthesized Insights Overview</span>
        </button>
        <button
          onClick={() => setActiveTab('responses')}
          className={`pb-3 text-xs sm:text-sm font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'responses'
              ? 'border-purple-600 text-purple-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Verified Survey Responses ({brandResponses.length})</span>
        </button>
        {hasBrandArticle(brand.id) && (
          <Link
            to={getBrandStudyPath(brand.id)}
            className="pb-3 text-xs sm:text-sm font-bold border-b-2 border-transparent text-slate-500 hover:text-purple-700 hover:border-purple-300 transition-colors cursor-pointer flex items-center gap-1.5 no-underline"
          >
            <BookOpen className="w-4 h-4 text-purple-600" />
            <span>Market Intelligence Study</span>
            <span className="px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-black">
              Deep Dive ↗
            </span>
          </Link>
        )}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {hasBrandArticle(brand.id) && (
            <div className="bg-gradient-to-r from-purple-900 to-indigo-900 text-white rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 inline-block">
                  Featured Research Report
                </span>
                <h3 className="text-lg font-black text-white">
                  Market Intelligence &amp; Consumer Study on {brand.name}
                </h3>
                <p className="text-xs text-purple-200 max-w-xl">
                  Full demographic breakdown, geographic segregation, SWOT analysis matrix, and strategic growth recommendations.
                </p>
              </div>
              <Link
                to={getBrandStudyPath(brand.id)}
                className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl transition-all shrink-0 flex items-center gap-1.5 cursor-pointer no-underline"
              >
                <BookOpen className="w-4 h-4" />
                <span>Read Full Research Study ↗</span>
              </Link>
            </div>
          )}

          {/* Empirical Research Study Dashboard Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-black uppercase tracking-wider">
                    Empirical Study
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    {empiricalProfile.studyTimeframe}
                  </span>
                </div>
                <h3 className="text-xl font-black text-slate-900">
                  {brand.name} Empirical Consumer Benchmark Audit
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Verified sample of {empiricalProfile.sampleSize.toLocaleString()} respondents • {empiricalProfile.confidenceInterval}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
                  <div className="text-xs font-bold text-slate-500">CSAT Score</div>
                  <div className="text-base font-black text-emerald-600">{empiricalProfile.csatScore}%</div>
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
                  <div className="text-xs font-bold text-slate-500">NPS Rating</div>
                  <div className="text-base font-black text-purple-600">+{empiricalProfile.npsScore}</div>
                </div>
              </div>
            </div>

            {/* Qualitative Executive Assessment */}
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 text-slate-700 text-xs sm:text-sm leading-relaxed space-y-2">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-xs uppercase tracking-wide">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Executive Market Assessment</span>
              </div>
              <p>{empiricalProfile.executiveAnalysis}</p>
            </div>

            {/* Four Empirical Dimensions Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl border border-slate-200/80 bg-white">
                <div className="text-xs text-slate-500 font-medium mb-1">Product Reliability</div>
                <div className="text-2xl font-black text-slate-900">
                  {empiricalProfile.dimensionRatings.productReliability} <span className="text-xs font-bold text-slate-400">/ 5.0</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full"
                    style={{ width: `${(empiricalProfile.dimensionRatings.productReliability / 5) * 100}%` }}
                  />
                </div>
              </div>

              <div className="p-4 rounded-2xl border border-slate-200/80 bg-white">
                <div className="text-xs text-slate-500 font-medium mb-1">Value for Price</div>
                <div className="text-2xl font-black text-slate-900">
                  {empiricalProfile.dimensionRatings.valueForPrice} <span className="text-xs font-bold text-slate-400">/ 5.0</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-blue-500 h-full rounded-full"
                    style={{ width: `${(empiricalProfile.dimensionRatings.valueForPrice / 5) * 100}%` }}
                  />
                </div>
              </div>

              <div className="p-4 rounded-2xl border border-slate-200/80 bg-white">
                <div className="text-xs text-slate-500 font-medium mb-1">Customer Support</div>
                <div className="text-2xl font-black text-slate-900">
                  {empiricalProfile.dimensionRatings.customerSupport} <span className="text-xs font-bold text-slate-400">/ 5.0</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-amber-500 h-full rounded-full"
                    style={{ width: `${(empiricalProfile.dimensionRatings.customerSupport / 5) * 100}%` }}
                  />
                </div>
              </div>

              <div className="p-4 rounded-2xl border border-slate-200/80 bg-white">
                <div className="text-xs text-slate-500 font-medium mb-1">Ecosystem Loyalty</div>
                <div className="text-2xl font-black text-slate-900">
                  {empiricalProfile.dimensionRatings.ecosystemStickiness} <span className="text-xs font-bold text-slate-400">/ 5.0</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-purple-500 h-full rounded-full"
                    style={{ width: `${(empiricalProfile.dimensionRatings.ecosystemStickiness / 5) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Sentiment Breakdown Bar */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
              <div className="flex justify-between text-xs font-bold text-slate-700">
                <span>Verified Panel Sentiment Distribution</span>
                <span className="text-slate-500">
                  {empiricalProfile.sentimentDistribution.positive}% Pos • {empiricalProfile.sentimentDistribution.neutral}% Neu • {empiricalProfile.sentimentDistribution.critical}% Crit
                </span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-200 flex overflow-hidden">
                <div
                  className="bg-emerald-500 h-full transition-all"
                  style={{ width: `${empiricalProfile.sentimentDistribution.positive}%` }}
                  title="Positive"
                />
                <div
                  className="bg-amber-400 h-full transition-all"
                  style={{ width: `${empiricalProfile.sentimentDistribution.neutral}%` }}
                  title="Neutral"
                />
                <div
                  className="bg-rose-500 h-full transition-all"
                  style={{ width: `${empiricalProfile.sentimentDistribution.critical}%` }}
                  title="Critical"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-emerald-50/60 rounded-3xl border border-emerald-100 p-6 space-y-4">
            <h3 className="flex items-center gap-2 text-emerald-800 font-black text-base">
              <ThumbsUp className="w-5 h-5 text-emerald-600" />
              <span>What Customers Praise</span>
            </h3>
            <ul className="space-y-3">
              {insights.likes.map((item, i) => (
                <li
                  key={i}
                  className="text-xs text-slate-700 leading-relaxed pl-4 relative before:content-[''] before:w-1.5 before:h-1.5 before:rounded-full before:bg-emerald-500 before:absolute before:left-0 before:top-2"
                >
                  "{item}"
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-rose-50/60 rounded-3xl border border-rose-100 p-6 space-y-4">
            <h3 className="flex items-center gap-2 text-rose-800 font-black text-base">
              <TrendingDown className="w-5 h-5 text-rose-600" />
              <span>Areas for Optimization</span>
            </h3>
            <ul className="space-y-3">
              {insights.improvements.map((item, i) => (
                <li
                  key={i}
                  className="text-xs text-slate-700 leading-relaxed pl-4 relative before:content-[''] before:w-1.5 before:h-1.5 before:rounded-full before:bg-rose-500 before:absolute before:left-0 before:top-2"
                >
                  "{item}"
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-amber-50/60 rounded-3xl border border-amber-100 p-6 space-y-4">
            <h3 className="flex items-center gap-2 text-amber-800 font-black text-base">
              <Lightbulb className="w-5 h-5 text-amber-600" />
              <span>Customer Feature Requests</span>
            </h3>
            <ul className="space-y-3">
              {insights.suggestions.map((item, i) => (
                <li
                  key={i}
                  className="text-xs text-slate-700 leading-relaxed pl-4 relative before:content-[''] before:w-1.5 before:h-1.5 before:rounded-full before:bg-amber-500 before:absolute before:left-0 before:top-2"
                >
                  "{item}"
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      )}

      {/* 1,000-Word SEO In-Depth Market Study Tab */}
      {activeTab === 'article' && article && (
        <div className="space-y-6">
          <BrandSEOArticleView article={article} />
        </div>
      )}

      {/* Responses Feed Tab */}
      {activeTab === 'responses' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <h2 className="text-lg font-black text-slate-900">
              Verified Respondent Feed ({filteredResponses.length} Responses)
            </h2>
            <input
              type="text"
              placeholder="Search user name or answers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-72 px-4 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredResponses.length === 0 ? (
              <div className="col-span-full text-center py-12 text-slate-500 bg-slate-50 rounded-2xl border border-slate-200 border-dashed">
                No matching responses found for this brand.
              </div>
            ) : (
              filteredResponses.map((resp) => (
                <div key={resp.id} className="bg-white rounded-3xl border border-slate-200 p-5 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs">
                        {resp.userName.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-black text-slate-800">{resp.userName}</span>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium">{resp.userEmail}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 px-2 py-0.5 bg-amber-50 rounded-lg text-amber-700 text-[10px] font-black border border-amber-200">
                      <Coins className="w-3 h-3 text-amber-500" />
                      <span>+{resp.coinsAwarded || 100} Coins</span>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    {resp.answers.map((ans, idx) => (
                      <div key={idx} className="bg-slate-50/70 rounded-xl p-3 border border-slate-100">
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">
                          {ans.questionText}
                        </div>
                        <div className="text-xs font-semibold text-slate-800">
                          {typeof ans.answer === 'number' && ans.answer <= 5 ? (
                            <div className="flex items-center gap-1 text-amber-500">
                              {[...Array(ans.answer)].map((_, sIdx) => (
                                <Star key={sIdx} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                              ))}
                              <span className="ml-1 text-slate-900 font-bold">{ans.answer}/5 Stars</span>
                            </div>
                          ) : (
                            Array.isArray(ans.answer) ? ans.answer.join(', ') : String(ans.answer)
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
