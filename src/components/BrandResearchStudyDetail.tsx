import React, { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { AdSenseAd } from './AdSenseAd';
import { SEOHead } from './SEOHead';
import {
  BookOpen,
  Calendar,
  Clock,
  ArrowLeft,
  ShieldCheck,
  Building2,
  Share2,
  FileText,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

interface BrandResearchStudyDetailProps {
  slug?: string;
}

export const BrandResearchStudyDetail: React.FC<BrandResearchStudyDetailProps> = ({ slug: propSlug }) => {
  const {
    currentUser,
    researchArticles,
    selectedArticleSlug,
    navigateToResearchArticle,
    setCurrentView,
    showToast,
  } = useApp();

  const activeSlug =
    propSlug ||
    selectedArticleSlug ||
    (typeof window !== 'undefined'
      ? (window.location.pathname.match(/^\/brand-research-studies\/([a-zA-Z0-9_-]+)/)?.[1] ||
         window.location.pathname.split('/').pop() ||
         '')
      : '');

  // Find the target article
  const rawArticle = useMemo(() => {
    if (!activeSlug) return null;
    return researchArticles.find(
      (a) => a.slug.toLowerCase() === activeSlug.toLowerCase()
    );
  }, [researchArticles, activeSlug]);

  // Phase 6 Requirement: Unreviewed drafts remain private until an authorized reviewer approves them.
  // Only admins can preview unreviewed drafts or rejected articles.
  const article = useMemo(() => {
    if (!rawArticle) return null;
    if (rawArticle.status !== 'published' && currentUser?.role !== 'admin') {
      return null;
    }
    return rawArticle;
  }, [rawArticle, currentUser?.role]);

  // Related articles in same category or general (excluding current)
  const relatedArticles = useMemo(() => {
    if (!article) return [];
    return researchArticles
      .filter((a) => a.id !== article.id && a.status === 'published')
      .slice(0, 3);
  }, [researchArticles, article]);

  // Word count and read time
  const readTimeMinutes = useMemo(() => {
    if (!article?.body) return 3;
    const words = article.body.split(/\s+/).filter(Boolean).length;
    return Math.max(2, Math.ceil(words / 200));
  }, [article]);

  const formattedDate = useMemo(() => {
    if (!article?.published_at) return 'Recent Analysis';
    return new Date(article.published_at).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  }, [article]);

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      if (navigator.share) {
        navigator.share({
          title: article?.title || 'Brand Research Study',
          text: article?.excerpt,
          url: window.location.href,
        }).catch(() => {});
      } else {
        navigator.clipboard.writeText(window.location.href);
        showToast('Article link copied to clipboard!', 'success');
      }
    }
  };

  // If article not found
  if (!article) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 bg-slate-50">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-sm text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto">
            <BookOpen className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-black text-slate-900">Study Not Found</h2>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            The requested brand research study could not be located or may have been archived.
          </p>
          <button
            onClick={() => setCurrentView('brand-research-studies')}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to All Research Studies</span>
          </button>
        </div>
      </div>
    );
  }

  // Helper to render Markdown-formatted text cleanly
  const renderFormattedBody = (rawText: string) => {
    const lines = rawText.split('\n');
    const elements: React.ReactNode[] = [];
    let inList = false;
    let listItems: string[] = [];

    const flushList = (keyPrefix: string) => {
      if (inList && listItems.length > 0) {
        elements.push(
          <ul key={`${keyPrefix}-list`} className="my-4 space-y-2 pl-5 list-disc text-slate-700 leading-relaxed text-sm sm:text-base">
            {listItems.map((item, idx) => (
              <li key={idx} dangerouslySetInnerHTML={{ __html: parseInlineMarkdown(item) }} />
            ))}
          </ul>
        );
        listItems = [];
        inList = false;
      }
    };

    lines.forEach((line, index) => {
      const trimmed = line.trim();

      // Heading 2
      if (trimmed.startsWith('## ')) {
        flushList(`flush-${index}`);
        elements.push(
          <h2
            key={index}
            className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-8 mb-4 border-b border-slate-100 pb-2"
          >
            {trimmed.replace(/^##\s+/, '')}
          </h2>
        );
        return;
      }

      // Heading 3
      if (trimmed.startsWith('### ')) {
        flushList(`flush-${index}`);
        elements.push(
          <h3
            key={index}
            className="text-lg sm:text-xl font-extrabold text-slate-800 tracking-tight mt-6 mb-3"
          >
            {trimmed.replace(/^###\s+/, '')}
          </h3>
        );
        return;
      }

      // Blockquote
      if (trimmed.startsWith('> ')) {
        flushList(`flush-${index}`);
        elements.push(
          <blockquote
            key={index}
            className="my-5 pl-4 py-2 border-l-4 border-purple-500 bg-purple-50/50 rounded-r-xl italic text-slate-700 text-sm sm:text-base leading-relaxed"
          >
            {trimmed.replace(/^>\s+/, '')}
          </blockquote>
        );
        return;
      }

      // Bullet item
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        inList = true;
        listItems.push(trimmed.replace(/^[-*]\s+/, ''));
        return;
      }

      // Empty line
      if (!trimmed) {
        flushList(`flush-${index}`);
        return;
      }

      // Regular paragraph
      flushList(`flush-${index}`);
      elements.push(
        <p
          key={index}
          className="my-4 text-slate-700 text-sm sm:text-base leading-relaxed"
          dangerouslySetInnerHTML={{ __html: parseInlineMarkdown(trimmed) }}
        />
      );
    });

    flushList('final');
    return elements;
  };

  // Helper for inline markdown (**bold**, *italic*, [text](url))
  const parseInlineMarkdown = (text: string) => {
    let output = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Bold
    output = output.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-slate-900">$1</strong>');
    // Italic
    output = output.replace(/\*(.*?)\*/g, '<em class="italic text-slate-800">$1</em>');
    // Links
    output = output.replace(
      /\[(.*?)\]\((https?:\/\/.*?)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-purple-600 hover:text-purple-800 underline font-semibold">$1</a>'
    );

    return output;
  };

  return (
    <div className="min-h-screen bg-white pb-24">
      <SEOHead
        title={article.title}
        description={article.excerpt}
        canonicalPath={`/brand-research-studies/${article.slug}`}
        ogType="article"
        ogImage={article.cover_image_url}
        structuredData={{
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: article.title,
          description: article.excerpt,
          image: article.cover_image_url,
          datePublished: article.published_at || article.created_at,
          dateModified: article.updated_at || article.published_at || article.created_at,
          author: {
            '@type': 'Organization',
            name: 'Voice Flow 360 Research Team',
          },
          publisher: {
            '@type': 'Organization',
            name: 'Voice Flow 360',
          },
          about: {
            '@type': 'Brand',
            name: article.brand_name,
          },
        }}
      />

      {/* Top Editorial Breadcrumb & Navigation Bar */}
      <div className="bg-slate-900 text-white border-b border-slate-800 py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <nav className="flex items-center gap-2 text-xs font-semibold text-slate-400">
            <button
              onClick={() => setCurrentView('landing')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Home
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <button
              onClick={() => setCurrentView('brand-research-studies')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Brand Research Studies
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <span className="text-purple-300 truncate max-w-[200px] sm:max-w-xs">{article.brand_name}</span>
          </nav>

          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors cursor-pointer"
            title="Share article"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Share</span>
          </button>
        </div>
      </div>

      {/* Main Article Container */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12">
        {/* Article Meta Header */}
        <header className="space-y-4 mb-8">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-purple-100 text-purple-800">
              <Building2 className="w-3.5 h-3.5 text-purple-700" />
              {article.brand_name}
            </span>
            <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-slate-100 text-slate-700">
              {article.category}
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Verified Analysis
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-indigo-700 font-semibold bg-indigo-50 px-2.5 py-0.5 rounded-md border border-indigo-200">
              {article.study_type_classification === 'commissioned' ? 'Commissioned Study' : 'Independent Research (Not Commissioned)'}
            </span>
            {article.is_illustrative_demo && (
              <span className="inline-flex items-center gap-1 text-xs text-amber-700 font-semibold bg-amber-50 px-2.5 py-0.5 rounded-md border border-amber-200">
                Illustrative Case Example
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-[1.15]">
            {article.title}
          </h1>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-medium">
            {article.excerpt}
          </p>

          <div className="flex items-center justify-between py-4 border-y border-slate-100 text-xs text-slate-500 font-medium">
            <div className="flex items-center gap-4 flex-wrap">
              <span>By <strong>Voice Flow 360 Research Desk</strong></span>
              <span>&bull;</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {formattedDate}
              </span>
              <span>&bull;</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {readTimeMinutes} min read
              </span>
            </div>
          </div>
        </header>

        {/* Featured Cover Photo */}
        <div className="relative rounded-3xl overflow-hidden bg-slate-100 border border-slate-200 mb-10 shadow-sm aspect-16/9">
          <img
            src={article.cover_image_url}
            alt={article.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-2 right-3 px-2.5 py-1 bg-black/60 backdrop-blur-xs rounded-lg text-white text-[10px] font-medium">
            Independent Market Evaluation &bull; {article.brand_name}
          </div>
        </div>

        {/* Top In-Article Ad Placement Zone (Reserved for research study template only) */}
        <div className="my-8">
          <AdSenseAd
            slot="research-study-mid"
            className="my-0 bg-slate-50 border-slate-200"
            label="Advertisement"
          />
        </div>

        {/* Article Body Content */}
        <div className="article-body font-sans text-slate-800 leading-relaxed space-y-4">
          {renderFormattedBody(article.body)}
        </div>

        {/* Mid-Article Ad Placement Zone */}
        <div className="my-10">
          <AdSenseAd
            slot="research-study-bottom"
            className="my-0 bg-slate-50 border-slate-200"
            label="Advertisement"
          />
        </div>

        {/* Comprehensive Research Transparency & Methodology Audit Box */}
        {(() => {
          const isEmpiricalSurvey = Boolean(
            article.valid_responses_count && article.valid_responses_count > 0 && !article.is_illustrative_demo
          );

          return (
            <section className="my-10 p-6 sm:p-8 bg-slate-50 rounded-3xl border border-slate-200/90 shadow-2xs space-y-6">
              <div className="flex items-center justify-between flex-wrap gap-2 pb-4 border-b border-slate-200">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900 tracking-tight">
                      {isEmpiricalSurvey
                        ? 'Empirical Survey Methodology & Data Integrity Disclosure'
                        : 'Editorial Analysis & Sourcing Methodology Disclosure'}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Published in accordance with Voice Flow 360 Research Transparency Standards
                    </p>
                  </div>
                </div>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                  isEmpiricalSurvey
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-900 border border-amber-200'
                }`}>
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {isEmpiricalSurvey ? 'Verified Empirical Survey' : 'Source-Based Editorial Analysis'}
                </span>
              </div>

              {isEmpiricalSurvey ? (
                /* Genuine survey study with actual panel data */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {article.research_question && (
                    <div className="p-3.5 rounded-xl bg-white border border-slate-200 md:col-span-2">
                      <span className="font-bold text-slate-800 uppercase tracking-wider block mb-1">
                        Primary Research Question
                      </span>
                      <p className="text-slate-700 leading-relaxed font-medium">
                        {article.research_question}
                      </p>
                    </div>
                  )}

                  <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1">
                    <span className="font-bold text-slate-800 uppercase tracking-wider block">
                      Fieldwork Dates
                    </span>
                    <p className="text-slate-600">
                      {article.fieldwork_dates || 'Verified platform research period'}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1">
                    <span className="font-bold text-slate-800 uppercase tracking-wider block">
                      Verified Sample Size (n)
                    </span>
                    <p className="text-slate-600 font-semibold text-purple-700">
                      {article.valid_responses_count?.toLocaleString()} valid, accepted responses
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1">
                    <span className="font-bold text-slate-800 uppercase tracking-wider block">
                      Recruitment Method
                    </span>
                    <p className="text-slate-600">
                      {article.recruitment_method || 'Opt-in conversational survey panel with double-blind qualification'}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1">
                    <span className="font-bold text-slate-800 uppercase tracking-wider block">
                      Geographic Scope
                    </span>
                    <p className="text-slate-600">
                      {article.participant_geography || 'Target panel geographic distribution'}
                    </p>
                  </div>

                  {article.participant_demographics && (
                    <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1 md:col-span-2">
                      <span className="font-bold text-slate-800 uppercase tracking-wider block">
                        Participant Characteristics
                      </span>
                      <p className="text-slate-600">
                        {article.participant_demographics}
                      </p>
                    </div>
                  )}

                  <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1 md:col-span-2">
                    <span className="font-bold text-amber-800 uppercase tracking-wider block">
                      Sample Limitations &amp; Potential Bias
                    </span>
                    <p className="text-slate-600 leading-relaxed">
                      {article.sample_limitations ||
                        'Convenience sample derived from opted-in panel respondents. Percentages reflect sample responses and are not generalized as representative of the entire population without demographic weighting.'}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1 md:col-span-2 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="font-bold text-slate-800 uppercase tracking-wider block">
                        Auditor / Reviewer
                      </span>
                      <p className="text-slate-600">
                        {article.reviewer_name || 'Voice Flow 360 Research Standards Desk'}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-slate-800 uppercase tracking-wider block">
                        Research Classification
                      </span>
                      <span className="text-slate-600 font-semibold">
                        {article.study_type_classification === 'commissioned' ? 'Commissioned Enterprise Study' : 'Independent Research (Uncommissioned)'}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                /* Source-based editorial article: NO panel sample, recruitment, geographic-scope, or fieldwork claims */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1">
                    <span className="font-bold text-slate-800 uppercase tracking-wider block">
                      Editorial Method
                    </span>
                    <p className="text-slate-600 leading-relaxed">
                      Secondary market synthesis, financial telemetry, product teardowns, and sentiment indexing compiled by Voice Flow 360 editorial desk.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1">
                    <span className="font-bold text-slate-800 uppercase tracking-wider block">
                      Author &amp; Reviewer
                    </span>
                    <p className="text-slate-600 leading-relaxed">
                      <strong>Author:</strong> Voice Flow 360 Industry Intelligence Desk<br />
                      <strong>Reviewer:</strong> {article.reviewer_name || 'Voice Flow 360 Research Standards Desk'}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1.5 md:col-span-2">
                    <span className="font-bold text-slate-800 uppercase tracking-wider block">
                      Primary Linked Sources &amp; Public References
                    </span>
                    <ul className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                      <li className="flex items-center gap-1.5 p-2 bg-slate-50 rounded-lg border border-slate-100">
                        <ExternalLink className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                        <a
                          href={`https://www.google.com/finance?q=${encodeURIComponent(article.brand_name)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-purple-700 hover:text-purple-900 font-medium truncate"
                        >
                          SEC &amp; Financial Disclosures
                        </a>
                      </li>
                      <li className="flex items-center gap-1.5 p-2 bg-slate-50 rounded-lg border border-slate-100">
                        <ExternalLink className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                        <a
                          href={`https://www.statista.com/search/?q=${encodeURIComponent(article.brand_name)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-purple-700 hover:text-purple-900 font-medium truncate"
                        >
                          Industry Benchmark Telemetry
                        </a>
                      </li>
                      <li className="flex items-center gap-1.5 p-2 bg-slate-50 rounded-lg border border-slate-100">
                        <ExternalLink className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                        <a
                          href={`https://www.trustpilot.com/search?query=${encodeURIComponent(article.brand_name)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-purple-700 hover:text-purple-900 font-medium truncate"
                        >
                          Public Customer Feedback Signals
                        </a>
                      </li>
                    </ul>
                  </div>

                  <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 space-y-1 md:col-span-2">
                    <span className="font-bold text-amber-900 uppercase tracking-wider block">
                      Editorial Limitations &amp; Scope
                    </span>
                    <p className="text-amber-950 leading-relaxed">
                      Editorial synthesis based on publicly available market filings, corporate disclosures, and secondary benchmarking. This article does not use a direct respondent survey panel; fieldwork dates, panel recruitment, and convenience sample counts are excluded. Empirical study classifications are reserved strictly for genuine survey research conducted with verified respondents.
                    </p>
                  </div>
                </div>
              )}

              {article.sources_note && (
                <div className="pt-3 border-t border-slate-200 text-xs text-slate-500 leading-relaxed">
                  <strong>Source Note:</strong> {article.sources_note}
                </div>
              )}
            </section>
          );
        })()}

        {/* Mandatory Persistent Footer Disclaimer */}
        <div className="my-10 p-5 bg-amber-50/70 border border-amber-200/80 rounded-2xl text-center">
          <div className="flex items-center justify-center gap-1.5 text-amber-900 font-extrabold text-xs mb-1">
            <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
            <span>Editorial Notice</span>
          </div>
          <p className="text-xs text-amber-900/90 font-semibold leading-relaxed">
            Independent analysis by Voice Flow 360. Not affiliated with, endorsed by, or sponsored by {article.brand_name}.
          </p>
        </div>

        {/* Related Studies Grid */}
        {relatedArticles.length > 0 && (
          <div className="mt-16 pt-10 border-t border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                More Brand Research Studies
              </h3>
              <button
                onClick={() => setCurrentView('brand-research-studies')}
                className="text-xs font-bold text-purple-600 hover:text-purple-800 flex items-center gap-1 cursor-pointer"
              >
                <span>View all studies</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {relatedArticles.map((rel) => (
                <div
                  key={rel.id}
                  onClick={() => navigateToResearchArticle(rel.slug)}
                  className="bg-slate-50 hover:bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white text-slate-700 border border-slate-200">
                      {rel.brand_name}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-purple-600 transition-colors line-clamp-2 leading-snug">
                      {rel.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 line-clamp-2">
                      {rel.excerpt}
                    </p>
                  </div>
                  <div className="pt-3 text-[11px] font-bold text-purple-600 flex items-center gap-1 mt-2">
                    <span>Read Analysis</span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Return Button */}
        <div className="mt-12 text-center">
          <button
            onClick={() => setCurrentView('brand-research-studies')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to All Brand Research Studies</span>
          </button>
        </div>
      </article>
    </div>
  );
};
