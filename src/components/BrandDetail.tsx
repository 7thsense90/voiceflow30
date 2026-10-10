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
import { calculateBrandResearchMetrics, getApprovedProductionResponses } from '../utils/brandMetrics';
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
  const brandResponses = useMemo(
    () => getApprovedProductionResponses(brand.id, responses, campaigns),
    [brand.id, responses, campaigns]
  );
  const article = getBrandArticle(brand.id);

  // Compute stats strictly from approved production records
  const realStats = useMemo(() => {
    const m = calculateBrandResearchMetrics(brand.id, responses, campaigns);
    return {
      hasData: m.hasEnoughData,
      count: m.responseCount,
      avgRating: m.avgRating,
      csat: m.csat,
      nps: m.nps,
      disclosures: m.disclosures,
      praiseQuotes: m.praiseQuotes,
      improvementQuotes: m.improvementQuotes,
      qualitativeQuotes: m.qualitativeQuotes,
    };
  }, [brand.id, responses, campaigns]);

  const insights = useMemo(() => {
    return {
      avgRating: realStats.avgRating,
      likes: realStats.praiseQuotes,
      improvements: realStats.improvementQuotes,
      suggestions: realStats.qualitativeQuotes.slice(0, 5),
    };
  }, [realStats]);

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
          ...(insights.avgRating
            ? {
                aggregateRating: {
                  '@type': 'AggregateRating',
                  ratingValue: insights.avgRating,
                  reviewCount: brandResponses.length,
                },
              }
            : {}),
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
              {realStats.avgRating ?? '—'}
            </div>
            <div className="text-[10px] font-bold text-amber-700 uppercase tracking-wide">
              {realStats.avgRating ? 'Avg Rating' : 'Not enough data'}
            </div>
          </div>

          <div className="text-center p-3 bg-purple-50/70 rounded-2xl border border-purple-100 min-w-[100px]">
            <div className="text-xl font-black text-purple-900 flex items-center justify-center gap-1">
              <MessageSquare className="w-4 h-4 text-purple-600" />
              {realStats.count}
            </div>
            <div className="text-[10px] font-bold text-purple-700 uppercase tracking-wide">
              {realStats.count === 1 ? 'Response' : 'Responses'}
            </div>
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
          <span>Survey Responses ({realStats.count})</span>
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
                  Featured Editorial Analysis
                </span>
                <h3 className="text-lg font-black text-white">
                  Editorial Analysis &amp; Market Intelligence on {brand.name}
                </h3>
                <p className="text-xs text-purple-200 max-w-xl">
                  Comprehensive market landscape overview, product portfolio evaluation, and strategic consumer sentiment analysis.
                </p>
              </div>
              <Link
                to={getBrandStudyPath(brand.id)}
                className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl transition-all shrink-0 flex items-center gap-1.5 cursor-pointer no-underline"
              >
                <BookOpen className="w-4 h-4" />
                <span>Read Analysis ↗</span>
              </Link>
            </div>
          )}

          {/* Genuine Survey Research: Rendered ONLY when calculated from approved production records */}
          {realStats.hasData ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-black uppercase tracking-wider">
                      Consumer Research
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      Quality-Audited Panel Submissions
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-slate-900">
                    {brand.name} Consumer Feedback &amp; Evaluation Overview
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Calculated from {realStats.count} approved survey response{realStats.count === 1 ? '' : 's'}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {realStats.avgRating ? (
                    <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
                      <div className="text-xs font-bold text-slate-500">Average Rating</div>
                      <div className="text-base font-black text-amber-500">{realStats.avgRating} ★</div>
                    </div>
                  ) : (
                    <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
                      <div className="text-xs font-bold text-slate-500">Average Rating</div>
                      <div className="text-xs font-semibold text-slate-400">Not enough data</div>
                    </div>
                  )}
                  {realStats.csat !== null ? (
                    <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
                      <div className="text-xs font-bold text-slate-500">CSAT Score</div>
                      <div className="text-base font-black text-emerald-600">{realStats.csat}%</div>
                    </div>
                  ) : (
                    <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
                      <div className="text-xs font-bold text-slate-500">CSAT Score</div>
                      <div className="text-xs font-semibold text-slate-400">Not enough data</div>
                    </div>
                  )}
                  {realStats.nps !== null ? (
                    <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
                      <div className="text-xs font-bold text-slate-500">NPS Rating</div>
                      <div className="text-base font-black text-purple-600">
                        {realStats.nps > 0 ? '+' : ''}{realStats.nps}
                      </div>
                    </div>
                  ) : (
                    <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
                      <div className="text-xs font-bold text-slate-500">NPS Rating</div>
                      <div className="text-xs font-semibold text-slate-400">Not enough data</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Research Methodology & Fieldwork Disclosures */}
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs text-slate-600 space-y-3">
                <div className="font-bold text-slate-900 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-purple-600" />
                    <span className="text-sm font-extrabold text-slate-900">Research Methodology &amp; Fieldwork Disclosures</span>
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                    Audit Certified
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-[11px]">
                  <div><strong className="text-slate-800">Sample Size:</strong> {realStats.disclosures.sampleSize} approved responses</div>
                  <div><strong className="text-slate-800">Fieldwork Dates:</strong> {realStats.disclosures.fieldworkDates}</div>
                  <div><strong className="text-slate-800">Recruitment Method:</strong> {realStats.disclosures.recruitmentMethod}</div>
                  <div><strong className="text-slate-800">Participant Incentive:</strong> {realStats.disclosures.incentiveDescription}</div>
                  <div><strong className="text-slate-800">Quality Checks:</strong> {realStats.disclosures.screeningMethod}</div>
                  <div><strong className="text-slate-800">Deduplication:</strong> Single submission per panelist enforced</div>
                </div>

                <div className="space-y-1.5 pt-2.5 border-t border-slate-200 text-[11px] text-slate-600">
                  <div>
                    <strong className="text-slate-800">CSAT Calculation:</strong> {realStats.disclosures.csatCalculation}
                  </div>
                  <div>
                    <strong className="text-slate-800">NPS Calculation:</strong> {realStats.disclosures.npsCalculation}
                  </div>
                  <div>
                    <strong className="text-slate-800">Average Rating Calculation:</strong> {realStats.disclosures.ratingCalculation}
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 pt-2 border-t border-slate-200">
                  <strong className="text-slate-600">Limitations:</strong> {realStats.disclosures.limitations}
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-black uppercase tracking-wider">
                  Survey Status: Active &bull; Open for Panelists
                </span>
              </div>
              <h3 className="text-xl font-black text-slate-900">
                {brand.name} Panel Evaluation
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-xl">
                We display response counts and ratings only when supported by genuine approved production records. Not enough data has been recorded for {brand.name} yet. Complete our conversational study to record the first evaluation and earn coin honorariums!
              </p>
              {brandCampaign && (
                <div className="pt-2">
                  <button
                    onClick={() => startChat(brandCampaign)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Start Survey &amp; Earn {brandCampaign.coinsReward} Coins</span>
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-emerald-50/60 rounded-3xl border border-emerald-100 p-6 space-y-4">
            <h3 className="flex items-center gap-2 text-emerald-800 font-black text-base">
              <ThumbsUp className="w-5 h-5 text-emerald-600" />
              <span>What Customers Praise</span>
            </h3>
            <ul className="space-y-3">
              {insights.likes.length > 0 ? (
                insights.likes.map((item, i) => (
                  <li
                    key={i}
                    className="text-xs text-slate-700 leading-relaxed pl-4 relative before:content-[''] before:w-1.5 before:h-1.5 before:rounded-full before:bg-emerald-500 before:absolute before:left-0 before:top-2"
                  >
                    "{item}"
                  </li>
                ))
              ) : (
                <li className="text-xs text-slate-500 italic">
                  No customer praise recorded yet from completed panel surveys.
                </li>
              )}
            </ul>
          </div>

          <div className="bg-rose-50/60 rounded-3xl border border-rose-100 p-6 space-y-4">
            <h3 className="flex items-center gap-2 text-rose-800 font-black text-base">
              <TrendingDown className="w-5 h-5 text-rose-600" />
              <span>Areas for Optimization</span>
            </h3>
            <ul className="space-y-3">
              {insights.improvements.length > 0 ? (
                insights.improvements.map((item, i) => (
                  <li
                    key={i}
                    className="text-xs text-slate-700 leading-relaxed pl-4 relative before:content-[''] before:w-1.5 before:h-1.5 before:rounded-full before:bg-rose-500 before:absolute before:left-0 before:top-2"
                  >
                    "{item}"
                  </li>
                ))
              ) : (
                <li className="text-xs text-slate-500 italic">
                  No consumer friction points recorded yet from completed panel surveys.
                </li>
              )}
            </ul>
          </div>

          <div className="bg-amber-50/60 rounded-3xl border border-amber-100 p-6 space-y-4">
            <h3 className="flex items-center gap-2 text-amber-800 font-black text-base">
              <Lightbulb className="w-5 h-5 text-amber-600" />
              <span>Customer Feature Requests</span>
            </h3>
            <ul className="space-y-3">
              {insights.suggestions.length > 0 ? (
                insights.suggestions.map((item, i) => (
                  <li
                    key={i}
                    className="text-xs text-slate-700 leading-relaxed pl-4 relative before:content-[''] before:w-1.5 before:h-1.5 before:rounded-full before:bg-amber-500 before:absolute before:left-0 before:top-2"
                  >
                    "{item}"
                  </li>
                ))
              ) : (
                <li className="text-xs text-slate-500 italic">
                  No feature suggestions recorded yet from completed panel surveys.
                </li>
              )}
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
              Quality-Audited Panel Feed ({filteredResponses.length} Responses)
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
                        <span className="text-[10px] text-slate-400 font-medium">Panelist &bull; Quality Audited</span>
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
