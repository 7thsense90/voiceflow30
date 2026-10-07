import React, { useState, useEffect, useMemo } from 'react';
import { BrandSEOArticle } from '../data/brandArticles/types';
import { getBrandStudyPath } from '../data/brandArticles';
import { getBrandSourceLinks } from '../utils/brandSources';
import { SEOHead } from './SEOHead';
import { Link } from './Link';
import { AdSenseAd } from './AdSenseAd';
import { useApp } from '../context/AppContext';
import {
  ArrowLeft,
  BookOpen,
  Clock,
  FileText,
  Sparkles,
  Award,
  TrendingUp,
  Users,
  Globe2,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  ShieldCheck,
  Building2,
  Share2,
  Volume2,
  VolumeX,
  Play,
  Pause,
  ChevronDown,
  MessageSquare,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';

interface BrandSEOArticleViewProps {
  article: BrandSEOArticle;
  onBack?: () => void;
}

export const BrandSEOArticleView: React.FC<BrandSEOArticleViewProps> = ({ article, onBack }) => {
  const { campaigns, startChat, setCurrentView } = useApp();
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioSpeed, setAudioSpeed] = useState<number>(1);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);
  const [copiedLink, setCopiedLink] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);

  // Find matching campaign to let user take the survey
  const matchingCampaign = campaigns.find((c) => c.brandId === article.brandId);

  // Reading progress tracker
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const currentProgress = Math.min(100, Math.max(0, (window.scrollY / totalHeight) * 100));
        setReadingProgress(currentProgress);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const dedicatedPath = getBrandStudyPath(article);
  const sourceLinks = useMemo(() => getBrandSourceLinks(article.brandId, article.brandName), [article.brandId, article.brandName]);

  const handleCopyLink = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      const fullUrl = `${window.location.origin}${dedicatedPath}`;
      navigator.clipboard.writeText(fullUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleStartSurvey = () => {
    if (matchingCampaign) {
      startChat(matchingCampaign);
    } else {
      setCurrentView('surveys');
    }
  };

  // Convert markdown lines into styled elements
  const renderMarkdownContent = (content: string) => {
    const lines = content.split('\n');
    const elements: React.ReactNode[] = [];

    lines.forEach((line, index) => {
      const trimmed = line.trim();

      if (trimmed.startsWith('## ')) {
        elements.push(
          <h2
            key={`h2-${index}`}
            id={`section-${index}`}
            className="text-2xl sm:text-3xl font-black text-slate-900 mt-10 mb-4 pt-6 border-t border-slate-200 tracking-tight"
          >
            {trimmed.replace('## ', '')}
          </h2>
        );
      } else if (trimmed.startsWith('### ')) {
        elements.push(
          <h3
            key={`h3-${index}`}
            className="text-xl font-bold text-purple-950 mt-6 mb-3 tracking-tight flex items-center gap-2"
          >
            <span className="w-2 h-2 rounded-full bg-purple-600 inline-block"></span>
            <span>{trimmed.replace('### ', '')}</span>
          </h3>
        );
      } else if (trimmed.startsWith('- ')) {
        const bulletText = trimmed.replace('- ', '');
        // Check for bold prefix
        elements.push(
          <li key={`li-${index}`} className="ml-5 list-disc text-slate-700 leading-relaxed text-sm my-1.5 marker:text-purple-500">
            <span dangerouslySetInnerHTML={{
              __html: bulletText.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-slate-900">$1</strong>')
            }} />
          </li>
        );
      } else if (trimmed.startsWith('1. ') || trimmed.startsWith('2. ') || trimmed.startsWith('3. ')) {
        elements.push(
          <div key={`num-${index}`} className="flex items-start gap-3 my-3 bg-purple-50/50 p-4 rounded-xl border border-purple-100">
            <span className="w-6 h-6 rounded-lg bg-purple-600 text-white font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
              {trimmed.substring(0, 1)}
            </span>
            <div
              className="text-sm text-slate-800 leading-relaxed"
              dangerouslySetInnerHTML={{
                __html: trimmed.substring(3).replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-slate-900">$1</strong>')
              }}
            />
          </div>
        );
      } else if (trimmed.startsWith('---')) {
        elements.push(<hr key={`hr-${index}`} className="my-8 border-slate-200" />);
      } else if (trimmed.startsWith('|') && trimmed.includes('|')) {
        // Table row or separator
        if (trimmed.includes('---')) {
          return; // skip separator row in simple table render
        }
        const cells = trimmed.split('|').filter((c) => c.trim().length > 0);
        elements.push(
          <div key={`table-row-${index}`} className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200 my-1 text-xs">
            {cells.map((cell, cIdx) => (
              <span key={cIdx} className={cIdx === 0 ? 'font-bold text-slate-900' : 'text-slate-700'}>
                {cell.replace(/\*\*/g, '').trim()}
              </span>
            ))}
          </div>
        );
      } else if (trimmed.length > 0) {
        elements.push(
          <p
            key={`p-${index}`}
            className="text-slate-700 text-sm sm:text-base leading-relaxed my-4 font-normal"
            dangerouslySetInnerHTML={{
              __html: trimmed.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-slate-900">$1</strong>')
            }}
          />
        );
      }
    });

    return elements;
  };

  return (
    <article className="max-w-5xl mx-auto px-4 py-8 space-y-8 animate-fadeIn">
      {/* Dynamic SEO Meta Tags & Schema Markup */}
      <SEOHead
        title={article.metaTitle}
        description={article.metaDescription}
        keywords={article.targetKeywords}
        canonicalPath={dedicatedPath}
        ogType="article"
        structuredData={[
          {
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: article.metaTitle,
            description: article.metaDescription,
            author: {
              '@type': 'Person',
              name: article.author.name,
              jobTitle: article.author.role,
              worksFor: {
                '@type': 'Organization',
                name: article.author.organization,
              },
            },
            publisher: {
              '@type': 'Organization',
              name: 'Voice Flow 360',
            },
            datePublished: article.publishDate,
            dateModified: article.lastUpdated,
            mainEntityOfPage: {
              '@type': 'WebPage',
              '@id': typeof window !== 'undefined' ? `${window.location.origin}${dedicatedPath}` : dedicatedPath,
            },
            wordCount: article.wordCount,
            about: {
              '@type': 'Brand',
              name: article.brandName,
            },
          },
          {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              {
                '@type': 'ListItem',
                position: 1,
                name: 'Home',
                item: typeof window !== 'undefined' ? `${window.location.origin}/` : '/',
              },
              {
                '@type': 'ListItem',
                position: 2,
                name: 'Brand Insights',
                item: typeof window !== 'undefined' ? `${window.location.origin}/brand-insights` : '/brand-insights',
              },
              {
                '@type': 'ListItem',
                position: 3,
                name: `${article.brandName} User Research Study`,
                item: typeof window !== 'undefined' ? `${window.location.origin}${dedicatedPath}` : dedicatedPath,
              },
            ],
          },
          {
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: article.faqs.map((faq) => ({
              '@type': 'Question',
              name: faq.question,
              acceptedAnswer: {
                '@type': 'Answer',
                text: faq.answer,
              },
            })),
          },
        ]}
      />

      {/* Progress Bar (Sticky Top) */}
      <div className="fixed top-0 left-0 right-0 h-1.5 bg-slate-100 z-50">
        <div
          className="h-full bg-gradient-to-r from-purple-600 via-indigo-600 to-amber-500 transition-all duration-150"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      {/* Breadcrumb & Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2 flex-wrap">
          {onBack ? (
            <button
              onClick={onBack}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-700 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-xl transition-all cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Brand Insights</span>
            </button>
          ) : (
            <Link
              to="/brand-insights"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-700 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-xl transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>All Brand Insights</span>
            </Link>
          )}

          <span className="text-slate-300">/</span>
          <Link
            to={`/brands/${article.brandId}`}
            className="text-xs font-bold text-slate-700 hover:text-purple-700 transition-colors"
          >
            {article.brandName}
          </Link>
          <span className="text-slate-300">/</span>
          <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-lg border border-purple-200/70">
            Editorial Analysis
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 rounded-lg text-[11px] font-mono text-slate-600 border border-slate-200">
            <Globe2 className="w-3 h-3 text-purple-600" />
            <span>{dedicatedPath}</span>
          </div>

          <button
            onClick={handleCopyLink}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl transition-all cursor-pointer"
            title="Copy Dedicated URL for SEO Sharing"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{copiedLink ? 'Dedicated Link Copied! 🔗' : 'Share Study'}</span>
          </button>

          <button
            onClick={handleStartSurvey}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 px-3.5 py-1.5 rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Participate in Audit</span>
          </button>
        </div>
      </div>

      {/* Hero Header & Badges */}
      <header className="space-y-4">
        <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
          <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-800 border border-purple-200 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span>In-Depth Market Review</span>
          </span>
          <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-800 border border-slate-200 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />
            <span>Editorial Analysis</span>
          </span>
          <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>{article.readingTimeMinutes} min read ({article.wordCount} words)</span>
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
          {article.brandName}: Comprehensive Consumer Sentiment, Demographics &amp; Strategic Brand Insights
        </h1>

        <p className="text-base sm:text-lg text-slate-700 leading-relaxed font-normal bg-purple-50/60 p-5 rounded-2xl border border-purple-100/80">
          <strong className="font-bold text-purple-950 block mb-1">Executive Summary:</strong>
          {article.executiveSummary}
        </p>

        {/* Author Byline & Simulated Audio Narration */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-700 to-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-xs">
              {article.author.name.split(' ').map((n) => n[0]).join('')}
            </div>
            <div>
              <div className="text-xs font-black text-slate-900">{article.author.name}</div>
              <div className="text-[11px] font-medium text-slate-500">
                {article.author.role} • {article.author.organization}
              </div>
            </div>
          </div>

          {/* Interactive Simulated Narration Player */}
          <div className="inline-flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700">
            <button
              onClick={() => setIsPlayingAudio(!isPlayingAudio)}
              className="inline-flex items-center gap-1.5 text-purple-700 hover:text-purple-900 font-bold cursor-pointer"
            >
              {isPlayingAudio ? (
                <>
                  <Pause className="w-4 h-4 fill-purple-700" />
                  <span>Pause Audio Summary</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-purple-700" />
                  <span>Listen to Article</span>
                </>
              )}
            </button>

            {isPlayingAudio && (
              <div className="flex items-center gap-1 px-2 py-0.5 bg-purple-100 rounded text-purple-800 text-[10px] font-bold animate-pulse">
                <Volume2 className="w-3 h-3" />
                <span>Playing @ {audioSpeed}x</span>
              </div>
            )}

            <button
              onClick={() => {
                const nextSpeed = audioSpeed === 1 ? 1.25 : audioSpeed === 1.25 ? 1.5 : 1;
                setAudioSpeed(nextSpeed);
              }}
              className="text-[11px] font-bold text-slate-500 hover:text-slate-800 ml-1 cursor-pointer"
            >
              {audioSpeed}x
            </button>
          </div>
        </div>
      </header>

      {/* Primary KPI Scorecard Grid */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="p-3 bg-purple-50/50 rounded-2xl border border-purple-100">
          <div className="text-[11px] font-bold text-purple-700 uppercase tracking-wider mb-1">Customer CSAT</div>
          <div className="text-3xl font-black text-purple-950">{article.keyMetrics.customerSatisfactionScore}%</div>
          <div className="text-[10px] font-semibold text-purple-700 mt-0.5">Satisfaction Index</div>
        </div>

        <div className="p-3 bg-indigo-50/50 rounded-2xl border border-indigo-100">
          <div className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider mb-1">Net Promoter (NPS)</div>
          <div className="text-3xl font-black text-indigo-950">+{article.keyMetrics.npsScore}</div>
          <div className="text-[10px] font-semibold text-indigo-700 mt-0.5">Customer Advocacy</div>
        </div>

        <div className="p-3 bg-emerald-50/50 rounded-2xl border border-emerald-100">
          <div className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider mb-1">Positive Sentiment</div>
          <div className="text-3xl font-black text-emerald-950">{article.keyMetrics.positiveSentiment}%</div>
          <div className="text-[10px] font-semibold text-emerald-700 mt-0.5">{article.keyMetrics.negativeSentiment}% Neg / {article.keyMetrics.neutralSentiment}% Neut</div>
        </div>

        <div className="p-3 bg-amber-50/50 rounded-2xl border border-amber-100">
          <div className="text-[11px] font-bold text-amber-700 uppercase tracking-wider mb-1">Analysis Type</div>
          <div className="text-xl sm:text-2xl font-black text-amber-950 mt-1">Editorial</div>
          <div className="text-[10px] font-semibold text-amber-700 mt-0.5">Market Synthesis Desk</div>
        </div>
      </section>

      {/* Editorial Methodology, Linked Sources, Reviewer & Limitations Disclosure */}
      <section className="bg-slate-50/90 rounded-3xl p-6 sm:p-7 border border-slate-200/90 text-xs text-slate-700 space-y-4 leading-relaxed shadow-2xs">
        <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
            <ShieldCheck className="w-4 h-4 text-purple-600" />
            <span>Editorial Methodology, Sources &amp; Transparency Disclosure</span>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
            Source-Based Editorial Analysis
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1">
            <span className="font-bold text-slate-900 uppercase tracking-wider block text-[11px]">
              Editorial Method
            </span>
            <p className="text-slate-600 text-xs">
              {sourceLinks.editorialMethodText}
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1">
            <span className="font-bold text-slate-900 uppercase tracking-wider block text-[11px]">
              Author &amp; Reviewer
            </span>
            <p className="text-slate-600 text-xs">
              <strong>Author:</strong> {article.author.name} ({article.author.role})<br />
              <strong>Reviewed &amp; Audited by:</strong> Voice Flow 360 Research Standards Desk
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1.5 md:col-span-2">
            <span className="font-bold text-slate-900 uppercase tracking-wider block text-[11px]">
              Primary Linked Sources &amp; Public References
            </span>
            <ul className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <li className="flex flex-col p-2.5 bg-slate-50 rounded-lg border border-slate-100 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-purple-700">
                  <ExternalLink className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                  <a
                    href={sourceLinks.officialPortal.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-purple-900 truncate"
                  >
                    {sourceLinks.officialPortal.label}
                  </a>
                </div>
                <span className="text-[10px] text-slate-500 leading-tight">
                  {sourceLinks.officialPortal.note}
                </span>
              </li>
              <li className="flex flex-col p-2.5 bg-slate-50 rounded-lg border border-slate-100 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-purple-700">
                  <ExternalLink className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                  <a
                    href={sourceLinks.corporateFilings.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-purple-900 truncate"
                  >
                    {sourceLinks.corporateFilings.label}
                  </a>
                </div>
                <span className="text-[10px] text-slate-500 leading-tight">
                  {sourceLinks.corporateFilings.note}
                </span>
              </li>
              <li className="flex flex-col p-2.5 bg-slate-50 rounded-lg border border-slate-100 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-purple-700">
                  <ExternalLink className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                  <a
                    href={sourceLinks.customerReviews.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-purple-900 truncate"
                  >
                    {sourceLinks.customerReviews.label}
                  </a>
                </div>
                <span className="text-[10px] text-slate-500 leading-tight">
                  {sourceLinks.customerReviews.note}
                </span>
              </li>
            </ul>
          </div>

          <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 space-y-1 md:col-span-2">
            <span className="font-bold text-amber-900 uppercase tracking-wider block text-[11px]">
              Editorial Limitations &amp; Separation Notice
            </span>
            <p className="text-amber-950 text-xs leading-relaxed">
              This publication is an editorial desk synthesis based on secondary sources, not a direct respondent probability survey. Fieldwork dates, recruitment procedures, and panel sample sizes are excluded from editorial analyses because no primary panel was fielded for this report. Empirical study classifications and panel methodologies are strictly reserved for genuine survey studies supported by actual respondent data.
            </p>
          </div>
        </div>
      </section>

      {/* Consumer Perception Matrix: What People Say, Feel, Think */}
      <section className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-purple-600" />
            <h2 className="text-xl font-black text-slate-900">What Consumers Say, Feel &amp; Think</h2>
          </div>
          <div className="flex items-center gap-3 text-xs font-bold">
            <span className="text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg">
              Emotional Connection: {article.brandPerception.emotionalConnectionRating}/100
            </span>
            <span className="text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
              Brand Trust: {article.brandPerception.brandTrustScore}/100
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2">
            <h3 className="text-xs font-black uppercase text-purple-800 tracking-wider flex items-center gap-1.5">
              <span>💬 What People Say</span>
            </h3>
            <ul className="space-y-2">
              {article.brandPerception.whatPeopleSay.map((quote, idx) => (
                <li key={idx} className="text-xs text-slate-700 italic leading-relaxed border-l-2 border-purple-400 pl-2">
                  {quote}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2">
            <h3 className="text-xs font-black uppercase text-indigo-800 tracking-wider flex items-center gap-1.5">
              <span>❤️ What People Feel</span>
            </h3>
            <ul className="space-y-2">
              {article.brandPerception.whatPeopleFeel.map((item, idx) => (
                <li key={idx} className="text-xs text-slate-700 leading-relaxed border-l-2 border-indigo-400 pl-2">
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2">
            <h3 className="text-xs font-black uppercase text-blue-800 tracking-wider flex items-center gap-1.5">
              <span>🧠 What People Think</span>
            </h3>
            <ul className="space-y-2">
              {article.brandPerception.whatPeopleThink.map((item, idx) => (
                <li key={idx} className="text-xs text-slate-700 leading-relaxed border-l-2 border-blue-400 pl-2">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Demographic & Geographic Segregation */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Demographics Card */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-600" />
            <h2 className="text-lg font-black text-slate-900">Demographic Breakdown</h2>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider">Age Group Representation</h3>
            {article.demographicBreakdown.ageGroups.map((age, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-800">{age.label}</span>
                  <span className="text-purple-700">{age.percentage}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-600 rounded-full" style={{ width: `${age.percentage}%` }} />
                </div>
                {age.description && (
                  <p className="text-[11px] text-slate-500">{age.description}</p>
                )}
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold">
            <span className="text-slate-500 uppercase tracking-wider">Gender Split</span>
            <div className="flex gap-3">
              {article.demographicBreakdown.genderSplit.map((g, idx) => (
                <span key={idx} className="text-slate-700">
                  {g.label}: <strong className="text-purple-700">{g.percentage}%</strong>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Global Market Distribution & Regional Estimates Card */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe2 className="w-5 h-5 text-indigo-600" />
              <div>
                <h2 className="text-lg font-black text-slate-900">Global Market Distribution</h2>
                <p className="text-[10px] text-slate-400">Secondary industry filings &amp; market share telemetry</p>
              </div>
            </div>
            <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg">
              {article.geographicSegregation.dominantTerritory}
            </span>
          </div>

          <div className="space-y-3">
            {article.geographicSegregation.regions.map((reg, idx) => (
              <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-900">{reg.region}</span>
                  <span className="text-indigo-700">{reg.sharePercentage}% Global Share</span>
                </div>
                <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${reg.sharePercentage}%` }} />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-600 pt-0.5">
                  <span>Key: {reg.keyMarkets}</span>
                  <span className="text-emerald-600 font-bold">{reg.growthTrend}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-xs font-medium text-emerald-900 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Fastest Growing Region: <strong>{article.geographicSegregation.fastestGrowingRegion}</strong></span>
          </div>
        </div>
      </section>

      {/* SWOT Analysis Matrix */}
      <section className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Award className="w-5 h-5 text-amber-500" />
          <h2 className="text-xl font-black text-slate-900">Strategic SWOT Analysis Matrix</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Strengths */}
          <div className="bg-emerald-50/50 p-5 rounded-2xl border border-emerald-200/70 space-y-2">
            <h3 className="text-xs font-black uppercase text-emerald-900 tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Core Strengths &amp; Moats</span>
            </h3>
            <ul className="space-y-1.5">
              {article.swotAnalysis.strengths.map((str, idx) => (
                <li key={idx} className="text-xs text-slate-700 leading-relaxed flex items-start gap-1.5">
                  <span className="text-emerald-500 font-black">•</span>
                  <span>{str}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Weaknesses */}
          <div className="bg-rose-50/50 p-5 rounded-2xl border border-rose-200/70 space-y-2">
            <h3 className="text-xs font-black uppercase text-rose-900 tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>Weak Areas &amp; Consumer Friction</span>
            </h3>
            <ul className="space-y-1.5">
              {article.swotAnalysis.weaknesses.map((weak, idx) => (
                <li key={idx} className="text-xs text-slate-700 leading-relaxed flex items-start gap-1.5">
                  <span className="text-rose-500 font-black">•</span>
                  <span>{weak}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Opportunities */}
          <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-200/70 space-y-2">
            <h3 className="text-xs font-black uppercase text-blue-900 tracking-wider flex items-center gap-1.5">
              <Lightbulb className="w-4 h-4 text-blue-600" />
              <span>Strategic Opportunities</span>
            </h3>
            <ul className="space-y-1.5">
              {article.swotAnalysis.opportunities.map((opp, idx) => (
                <li key={idx} className="text-xs text-slate-700 leading-relaxed flex items-start gap-1.5">
                  <span className="text-blue-500 font-black">•</span>
                  <span>{opp}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Threats */}
          <div className="bg-amber-50/50 p-5 rounded-2xl border border-amber-200/70 space-y-2">
            <h3 className="text-xs font-black uppercase text-amber-900 tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              <span>Market Threats &amp; Headwinds</span>
            </h3>
            <ul className="space-y-1.5">
              {article.swotAnalysis.threats.map((thr, idx) => (
                <li key={idx} className="text-xs text-slate-700 leading-relaxed flex items-start gap-1.5">
                  <span className="text-amber-500 font-black">•</span>
                  <span>{thr}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Mid-Article Compliant In-Content Ad Placement */}
      <AdSenseAd
        slot="5544332211"
        format="auto"
        responsive={true}
        className="my-8"
        label="Advertisement"
        adPlacementKey="enableArticleInContentAd"
      />

      {/* Suggested Improvements & Strategic Roadmap */}
      <section className="bg-gradient-to-br from-slate-900 to-purple-950 text-white p-6 sm:p-8 rounded-3xl shadow-lg space-y-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold">
            <Lightbulb className="w-3.5 h-3.5" />
            <span>Strategic Advisory</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight">Suggested Improvements &amp; Roadmap</h2>
          <p className="text-xs text-purple-200">
            Actionable strategic priorities synthesized from market performance signals, competitor benchmarking, and consumer sentiment trends.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white/10 backdrop-blur-xs p-5 rounded-2xl border border-white/10 space-y-3">
            <h3 className="text-xs font-black uppercase text-amber-300 tracking-wider">
              ⚡ Immediate Action Priorities
            </h3>
            <ul className="space-y-2">
              {article.suggestedImprovements.immediatePriorities.map((item, idx) => (
                <li key={idx} className="text-xs text-purple-100 leading-relaxed flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white/10 backdrop-blur-xs p-5 rounded-2xl border border-white/10 space-y-3">
            <h3 className="text-xs font-black uppercase text-purple-300 tracking-wider">
              🚀 Long-Term Strategic Moves (2026–2030)
            </h3>
            <ul className="space-y-2">
              {article.suggestedImprovements.longTermStrategicMoves.map((item, idx) => (
                <li key={idx} className="text-xs text-purple-100 leading-relaxed flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-purple-400 text-slate-950 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Full 1,000+ Word Editorial Deep Dive */}
      <section className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-xs space-y-6">
        <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
          <BookOpen className="w-5 h-5 text-purple-600" />
          <h2 className="text-xl font-black text-slate-900">Complete Research Report (1,000+ Words)</h2>
        </div>

        <div className="prose prose-purple max-w-none">
          {renderMarkdownContent(article.fullArticleMarkdown)}
        </div>
      </section>

      {/* Frequently Asked Questions (FAQ) Section with Rich Accordion */}
      <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <HelpCircle className="w-5 h-5 text-purple-600" />
          <h2 className="text-xl font-black text-slate-900">Frequently Asked Questions &amp; Search Queries</h2>
        </div>

        <div className="space-y-3">
          {article.faqs.map((faq, idx) => {
            const isExpanded = expandedFaq === idx;
            return (
              <div
                key={idx}
                className="border border-slate-200 rounded-2xl overflow-hidden transition-all"
              >
                <button
                  onClick={() => setExpandedFaq(isExpanded ? null : idx)}
                  className="w-full text-left p-4 bg-slate-50 hover:bg-slate-100 font-bold text-sm text-slate-900 flex items-center justify-between gap-4 cursor-pointer"
                >
                  <span>{faq.question}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-purple-600 transition-transform ${
                      isExpanded ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {isExpanded && (
                  <div className="p-4 bg-white text-xs sm:text-sm text-slate-700 leading-relaxed border-t border-slate-100">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Call to Action: Contribute to Study or Inquire as a Brand */}
      <section className="bg-gradient-to-r from-purple-700 via-purple-800 to-indigo-800 text-white p-8 rounded-3xl text-center space-y-4 shadow-xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/30 text-purple-200 text-xs font-black border border-purple-400/30">
          <Building2 className="w-4 h-4 text-purple-200" />
          <span>Product Intelligence &amp; Brand Advisory</span>
        </div>

        <h3 className="text-2xl sm:text-3xl font-black tracking-tight max-w-xl mx-auto">
          Want Direct Consumer Intelligence for {article.brandName}?
        </h3>

        <p className="text-xs sm:text-sm text-purple-200 max-w-lg mx-auto">
          Voice Flow 360 conducts independent market audits and bespoke consumer panels to help product and marketing leaders make data-backed decisions.
        </p>

        <div className="pt-2 flex flex-wrap justify-center gap-3">
          <button
            onClick={() => setCurrentView('for-brands')}
            className="px-6 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm rounded-2xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            <Building2 className="w-4 h-4" />
            <span>Request Brand Intelligence Audit</span>
          </button>

          <button
            onClick={onBack || (() => setCurrentView('brand-insights'))}
            className="px-5 py-3 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-2xl border border-white/20 transition-all cursor-pointer"
          >
            Explore Other 90+ Brand Insights
          </button>
        </div>
      </section>
    </article>
  );
};
