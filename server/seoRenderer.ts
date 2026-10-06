/**
 * Server-Side SEO & Semantic Content Renderer
 * 
 * Injects dynamic page-specific <title>, <meta description>, <link rel="canonical">,
 * Open Graph / Twitter tags, Schema.org JSON-LD structured data, and rich
 * pre-rendered HTML content into the initial HTTP response before client hydration.
 * 
 * Solves the critical AdSense crawler issue where CSR single-page apps return
 * identical empty shells and homepage canonicals on every subpage.
 */

import {
  findBrandArticleBySlugOrPath,
  getBrandStudyPath,
  getPublishedBrandArticles,
  findBrandBySlugOrId,
  BrandSEOArticle,
} from '../src/data/brandArticles/index';
import { RAW_100_BRANDS, BrandMeta } from '../src/data/brandsData';
import { LAUNCHED_PRODUCTS } from '../src/data/productReviewsData';
import { INITIAL_RESEARCH_ARTICLES } from '../src/data/initialResearchArticles';
import { ResearchArticle } from '../src/types';

export interface PageSeoResult {
  title: string;
  description: string;
  canonicalUrl: string;
  ogType: 'website' | 'article';
  keywords: string;
  structuredData?: Record<string, unknown>;
  htmlContent: string;
}

function escapeHtml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

const DEFAULT_KEYWORDS =
  'market research, consumer sentiment, brand feedback, user research studies, voice flow 360, consumer opinions, research rewards, product surveys';

/**
 * Resolves the SEO metadata and semantic pre-rendered HTML content for a given URL path.
 */
export function getPageSeoAndContent(requestPath: string): PageSeoResult {
  const origin = 'https://voiceflow360.com';
  let cleanPath = (requestPath || '/').split('?')[0].trim();
  cleanPath = cleanPath.replace(/\/+/g, '/');
  cleanPath = cleanPath.replace(/\/+$/, '') || '/';

  // 1. Check for dedicated Brand User Research Studies
  // Pattern: /brand-insights/:slug, /brands/:slug/user-research-study, etc.
  const studyNestedMatch = cleanPath.match(/^\/(?:brand-insights|brands)\/([a-zA-Z0-9_-]+)\/user-research-study$/);
  const studyDirectMatch = cleanPath.match(/^\/brand-insights\/([a-zA-Z0-9_-]+)$/);
  
  let targetArticleSlug = '';
  if (studyNestedMatch) {
    targetArticleSlug = studyNestedMatch[1];
  } else if (studyDirectMatch && studyDirectMatch[1] !== 'brand-insights') {
    targetArticleSlug = studyDirectMatch[1];
  }

  if (targetArticleSlug) {
    const article = findBrandArticleBySlugOrPath(targetArticleSlug);
    if (article) {
      return renderBrandStudySeo(origin, article);
    }
    const ra = INITIAL_RESEARCH_ARTICLES.find(
      (a) => a.slug.toLowerCase() === targetArticleSlug.toLowerCase() || a.id.toLowerCase() === targetArticleSlug.toLowerCase()
    );
    if (ra) {
      return renderBrandResearchStudyArticleSeo(origin, ra);
    }
    const knownBrand = findBrandBySlugOrId(targetArticleSlug);
    if (knownBrand) {
      return renderBrandDetailSeo(origin, knownBrand);
    }
  }

  // 1b. Check for Brand Research Studies (CMS Section)
  // Pattern: /brand-research-studies/:slug
  const researchStudyMatch = cleanPath.match(/^\/brand-research-studies\/([a-zA-Z0-9_-]+)$/);
  if (researchStudyMatch && researchStudyMatch[1] !== 'brand-research-studies') {
    const slug = researchStudyMatch[1].toLowerCase();
    const article = INITIAL_RESEARCH_ARTICLES.find(
      (a) => a.slug.toLowerCase() === slug || a.id.toLowerCase() === slug
    );
    if (article) {
      return renderBrandResearchStudyArticleSeo(origin, article);
    }
    const brandArticle = findBrandArticleBySlugOrPath(slug);
    if (brandArticle) {
      return renderBrandStudySeo(origin, brandArticle);
    }
  }

  if (cleanPath === '/brand-research-studies') {
    return renderBrandResearchStudiesIndexSeo(origin, INITIAL_RESEARCH_ARTICLES);
  }

  // 2. Check for Brand Directory item: /brands/:brandId
  const brandDetailMatch = cleanPath.match(/^\/brands\/([a-zA-Z0-9_-]+)$/);
  if (brandDetailMatch && brandDetailMatch[1] !== 'brands') {
    const brandId = brandDetailMatch[1];
    const brand = RAW_100_BRANDS.find(
      (b) => b.id.toLowerCase() === brandId.toLowerCase() || b.id.replace(/^br_/, '').toLowerCase() === brandId.toLowerCase()
    );
    if (brand) {
      return renderBrandDetailSeo(origin, brand);
    }
  }

  // 3. Static High-Value Platform Pages
  switch (cleanPath) {
    case '/about':
    case '/about-us':
    case '/about-voiceflow':
      return renderAboutPageSeo(origin);

    case '/for-brands':
    case '/brand-research':
    case '/market-research':
      return renderForBrandsPageSeo(origin);

    case '/how-to-earn':
      return renderHowToEarnPageSeo(origin);

    case '/360-earning':
    case '/360-earning-for-everyone':
      return render360EarningPageSeo(origin);

    case '/earnings-disclaimer':
    case '/disclaimer':
      return renderEarningsDisclaimerSeo(origin);

    case '/faq':
      return renderFaqPageSeo(origin);

    case '/privacy':
      return renderPrivacyPageSeo(origin);

    case '/terms':
      return renderTermsPageSeo(origin);

    case '/contact':
      return renderContactPageSeo(origin);

    case '/rewards':
    case '/rewards/':
    case '/rewards-and-withdrawals':
    case '/rewards-withdrawals':
    case '/payout-policy':
    case '/rewards-policy':
      return renderRewardsAndWithdrawalsSeo(origin);

    case '/research-methodology':
      return renderResearchMethodologySeo(origin);

    case '/sitemap-directory':
    case '/sitemap.html':
      return renderSitemapDirectorySeo(origin);

    case '/brands':
      return renderBrandDirectorySeo(origin);

    case '/brand-insights':
      return renderBrandInsightsIndexSeo(origin);

    case '/brand-research-studies':
      return renderBrandResearchStudiesIndexSeo(origin, INITIAL_RESEARCH_ARTICLES);

    case '/news':
    case '/news-updates':
      return renderNewsPageSeo(origin);

    case '/product-reviews':
    case '/public-product-reviews':
    case '/products':
      return renderPublicProductReviewsSeo(origin);

    case '/referrals':
    case '/referral-program':
      return renderReferralsPageSeo(origin);

    case '/surveys':
      return renderSurveysCatalogSeo(origin);

    case '/start-earning':
    case '/dashboard':
      return renderStartEarningSeo(origin);

    case '/brand-case-studies':
    case '/case-studies':
    case '/':
    default:
      return renderHomepageSeo(origin);
  }
}

function simpleMarkdownToHtml(markdown: string): string {
  if (!markdown) return '';
  const lines = markdown.split('\n');
  const htmlParts: string[] = [];
  let inList = false;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      if (inList) {
        htmlParts.push('</ul>');
        inList = false;
      }
      continue;
    }

    if (line.startsWith('### ')) {
      if (inList) { htmlParts.push('</ul>'); inList = false; }
      htmlParts.push(`<h3 class="text-lg font-bold text-slate-900 mt-6 mb-2">${escapeHtml(line.slice(4))}</h3>`);
    } else if (line.startsWith('## ')) {
      if (inList) { htmlParts.push('</ul>'); inList = false; }
      htmlParts.push(`<h2 class="text-xl font-bold text-slate-900 mt-8 mb-3 pb-2 border-b border-slate-200">${escapeHtml(line.slice(3))}</h2>`);
    } else if (line.startsWith('# ')) {
      if (inList) { htmlParts.push('</ul>'); inList = false; }
      htmlParts.push(`<h1 class="text-2xl font-bold text-slate-900 mt-8 mb-4">${escapeHtml(line.slice(2))}</h1>`);
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      if (!inList) {
        htmlParts.push('<ul class="list-disc list-inside space-y-1.5 my-3 text-slate-700">');
        inList = true;
      }
      const itemContent = escapeHtml(line.slice(2)).replace(/\\*\\*(.*?)\\*\\*/g, '<strong>$1</strong>');
      htmlParts.push(`<li>${itemContent}</li>`);
    } else {
      if (inList) { htmlParts.push('</ul>'); inList = false; }
      const formatted = escapeHtml(line).replace(/\\*\\*(.*?)\\*\\*/g, '<strong>$1</strong>');
      htmlParts.push(`<p class="text-slate-700 leading-relaxed mb-4">${formatted}</p>`);
    }
  }

  if (inList) {
    htmlParts.push('</ul>');
  }

  return htmlParts.join('\n');
}

/**
 * Brand Research Studies CMS Index Page SSR
 */
function renderBrandResearchStudiesIndexSeo(origin: string, articles: ResearchArticle[]): PageSeoResult {
  const publishedArticles = articles.filter((a) => a.status === 'published');
  const canonicalUrl = `${origin}/brand-research-studies`;
  const title = `Brand Research Studies & Market Intelligence | Voice Flow 360`;
  const description = `Explore empirical consumer sentiment research studies, brand satisfaction benchmarks, Net Promoter Scores, and market analysis across leading brands.`;

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Brand Research Studies & Consumer Intelligence',
    url: canonicalUrl,
    description,
    publisher: {
      '@type': 'Organization',
      name: 'Voice Flow 360',
      url: origin,
      logo: `${origin}/favicon.ico`,
    },
    hasPart: publishedArticles.map((article) => ({
      '@type': 'Article',
      headline: article.title,
      url: `${origin}/brand-research-studies/${article.slug}`,
      about: article.brand_name,
      datePublished: article.published_at || article.created_at,
    })),
  };

  const articleCardsHtml = publishedArticles
    .map(
      (article) => `
    <article class="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col">
      ${
        article.cover_image_url
          ? `
        <div class="h-48 overflow-hidden bg-slate-100">
          <img src="${escapeHtml(article.cover_image_url)}" alt="${escapeHtml(article.title)}" class="w-full h-full object-cover" loading="lazy" />
        </div>
      `
          : ''
      }
      <div class="p-6 flex-1 flex flex-col justify-between">
        <div>
          <div class="flex items-center gap-2 text-xs font-semibold text-purple-700 mb-2">
            <span class="bg-purple-50 px-2.5 py-0.5 rounded-md">${escapeHtml(article.category)}</span>
            <span class="text-slate-400">&bull;</span>
            <span class="text-slate-600 font-medium">${escapeHtml(article.brand_name)}</span>
          </div>
          <h2 class="text-lg font-bold text-slate-900 leading-snug mb-2">
            <a href="/brand-research-studies/${escapeHtml(article.slug)}" class="hover:text-purple-600 transition-colors">
              ${escapeHtml(article.title)}
            </a>
          </h2>
          <p class="text-sm text-slate-600 line-clamp-3 mb-4 leading-relaxed">
            ${escapeHtml(article.excerpt)}
          </p>
        </div>
        <div class="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>${article.published_at ? new Date(article.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent'}</span>
          <a href="/brand-research-studies/${escapeHtml(article.slug)}" class="text-purple-600 font-bold hover:underline">
            Read Study &rarr;
          </a>
        </div>
      </div>
    </article>
  `
    )
    .join('\n');

  const htmlContent = `
    <div class="ssr-page-wrapper max-w-6xl mx-auto px-4 sm:px-6 py-10 text-slate-800 font-sans">
      <nav aria-label="Breadcrumb" class="text-xs text-slate-500 mb-6 flex items-center gap-2">
        <a href="/" class="text-purple-600 hover:underline">Home</a> &gt;
        <span class="text-slate-700 font-semibold">Brand Research Studies</span>
      </nav>

      <!-- Ad Placement Zone: Header Sponsor -->
      <div class="ad-unit-zone ad-header-slot my-4 p-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 text-center text-xs text-slate-400 font-mono" data-ad-zone="brand-research-index-top">
        Sponsored Research Announcement &bull; Ad Placement Zone
      </div>

      <header class="mb-10 space-y-3">
        <div class="inline-block px-3 py-1 bg-purple-100 text-purple-800 text-xs font-bold rounded-full uppercase tracking-wider">
          Market Intelligence &bull; Independent Empirical Studies
        </div>
        <h1 class="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Brand Research Studies
        </h1>
        <p class="text-base sm:text-lg text-slate-600 max-w-3xl leading-relaxed">
          In-depth, independent analysis evaluating consumer sentiment, hardware adoption, software ecosystem engagement, and customer satisfaction benchmarks across major consumer and enterprise brands.
        </p>
      </header>

      <section class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        ${articleCardsHtml}
      </section>

      <!-- Ad Placement Zone: Mid-Index Sponsor -->
      <div class="ad-unit-zone ad-mid-slot my-8 p-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 text-center text-xs text-slate-400 font-mono" data-ad-zone="brand-research-index-mid">
        Commercial Partnership Notice &bull; Ad Placement Zone
      </div>

      <footer class="mt-12 pt-6 border-t border-slate-200 text-center text-xs text-slate-500 space-y-2">
        <p>Independent analysis by Voice Flow 360. Brand research studies are published for informational and research purposes.</p>
        <p>&copy; ${new Date().getFullYear()} Voice Flow 360. All rights reserved.</p>
      </footer>
    </div>
  `;

  return {
    title,
    description,
    canonicalUrl,
    ogType: 'website',
    keywords:
      'brand research studies, consumer sentiment, market benchmarks, Net Promoter Score, empirical research, Voice Flow 360',
    structuredData,
    htmlContent,
  };
}

/**
 * Individual Brand Research Study Article SSR
 */
function renderBrandResearchStudyArticleSeo(origin: string, article: ResearchArticle): PageSeoResult {
  const canonicalUrl = `${origin}/brand-research-studies/${article.slug}`;
  const title = `${article.title} | Voice Flow 360`;
  const description = article.excerpt;

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonicalUrl,
    },
    headline: article.title,
    description: article.excerpt,
    image: article.cover_image_url || `${origin}/favicon.ico`,
    datePublished: article.published_at || article.created_at,
    dateModified: article.updated_at || article.published_at || article.created_at,
    author: {
      '@type': 'Organization',
      name: 'Voice Flow 360 Research Team',
      url: origin,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Voice Flow 360',
      url: origin,
      logo: `${origin}/favicon.ico`,
    },
    about: {
      '@type': 'Organization',
      name: article.brand_name,
    },
  };

  const bodyHtml = simpleMarkdownToHtml(article.body);
  const formattedDate = article.published_at
    ? new Date(article.published_at).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Recent Publication';

  const htmlContent = `
    <div class="ssr-page-wrapper max-w-4xl mx-auto px-4 sm:px-6 py-10 text-slate-800 font-sans">
      <nav aria-label="Breadcrumb" class="text-xs text-slate-500 mb-6 flex items-center gap-2">
        <a href="/" class="text-purple-600 hover:underline">Home</a> &gt;
        <a href="/brand-research-studies" class="text-purple-600 hover:underline">Brand Research Studies</a> &gt;
        <span class="text-slate-700 font-semibold truncate max-w-[260px]">${escapeHtml(article.brand_name)}</span>
      </nav>

      <!-- Ad Placement Zone: Top Banner Slot -->
      <div class="ad-unit-zone ad-top-slot mb-6 p-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 text-center text-xs text-slate-400 font-mono" data-ad-zone="brand-research-detail-top">
        Sponsored Industry Intelligence &bull; Ad Placement Zone
      </div>

      <article class="space-y-8">
        <header class="border-b border-slate-200 pb-6 space-y-4">
          <div class="flex items-center gap-2 text-xs font-bold text-purple-700">
            <span class="bg-purple-100 px-3 py-1 rounded-full uppercase tracking-wider">${escapeHtml(article.category)}</span>
            <span class="text-slate-300">&bull;</span>
            <span class="text-slate-700 text-sm font-semibold">${escapeHtml(article.brand_name)}</span>
          </div>

          <h1 class="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
            ${escapeHtml(article.title)}
          </h1>

          <div class="flex items-center gap-3 text-xs text-slate-500">
            <span>Published on <strong>${escapeHtml(formattedDate)}</strong></span>
            <span>&bull;</span>
            <span>Independent Market Analysis</span>
          </div>

          ${
            article.cover_image_url
              ? `
            <div class="rounded-2xl overflow-hidden shadow-sm mt-4 max-h-96">
              <img src="${escapeHtml(article.cover_image_url)}" alt="${escapeHtml(article.title)}" class="w-full h-full object-cover" />
            </div>
          `
              : ''
          }

          <div class="bg-slate-50 border-l-4 border-purple-600 p-4 rounded-r-xl text-slate-700 text-base leading-relaxed mt-4 italic">
            ${escapeHtml(article.excerpt)}
          </div>
        </header>

        <!-- Ad Placement Zone: In-Article Sponsor Slot -->
        <div class="ad-unit-zone ad-in-article-slot my-6 p-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 text-center text-xs text-slate-400 font-mono" data-ad-zone="brand-research-detail-mid">
          Commercial Analysis Placement &bull; Ad Placement Zone
        </div>

        <section class="prose prose-slate max-w-none text-slate-800 space-y-4">
          ${bodyHtml}
        </section>

        ${(() => {
          const isEmpiricalSurvey = Boolean(
            article.valid_responses_count && article.valid_responses_count > 0 && !article.is_illustrative_demo
          );

          if (isEmpiricalSurvey) {
            return `
              <section class="sources-methodology-box bg-slate-50 border border-slate-200 rounded-2xl p-6 mt-8 space-y-4">
                <div class="flex items-center justify-between pb-3 border-b border-slate-200">
                  <h3 class="text-sm font-bold text-slate-900 uppercase tracking-wider">Empirical Survey Methodology &amp; Data Integrity Disclosure</h3>
                  <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">Verified Empirical Survey</span>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-700">
                  ${article.research_question ? `<div class="sm:col-span-2"><strong>Primary Research Question:</strong> ${escapeHtml(article.research_question)}</div>` : ''}
                  <div><strong>Fieldwork Dates:</strong> ${escapeHtml(article.fieldwork_dates || 'Verified platform research period')}</div>
                  <div><strong>Verified Sample Size (n):</strong> ${article.valid_responses_count?.toLocaleString()} valid, accepted responses</div>
                  <div><strong>Recruitment Method:</strong> ${escapeHtml(article.recruitment_method || 'Opt-in conversational survey panel with double-blind qualification')}</div>
                  <div><strong>Geographic Scope:</strong> ${escapeHtml(article.participant_geography || 'North America & Western Europe (multi-country panel)')}</div>
                  ${article.participant_demographics ? `<div class="sm:col-span-2"><strong>Participant Demographics:</strong> ${escapeHtml(article.participant_demographics)}</div>` : ''}
                  <div class="sm:col-span-2 bg-white p-3 rounded-xl border border-slate-200">
                    <strong>Sample Limitations &amp; Potential Bias:</strong> ${escapeHtml(article.sample_limitations || 'Convenience sample derived from opted-in panel respondents. Percentages reflect sample responses and are not generalized as representative of the entire population without demographic weighting.')}
                  </div>
                  <div><strong>Auditor / Reviewer:</strong> ${escapeHtml(article.reviewer_name || 'Voice Flow 360 Research Standards Desk')}</div>
                  <div><strong>Classification:</strong> ${article.study_type_classification === 'commissioned' ? 'Commissioned Enterprise Study' : 'Independent Research (Uncommissioned)'}</div>
                </div>
              </section>
            `;
          }

          return `
            <section class="sources-methodology-box bg-slate-50 border border-slate-200 rounded-2xl p-6 mt-8 space-y-4">
              <div class="flex items-center justify-between pb-3 border-b border-slate-200">
                <h3 class="text-sm font-bold text-slate-900 uppercase tracking-wider">Editorial Methodology, Sources &amp; Transparency Disclosure</h3>
                <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-200">Source-Based Editorial Analysis</span>
              </div>
              <div class="space-y-3 text-xs text-slate-700 leading-relaxed">
                <div>
                  <strong>Editorial Method:</strong> Synthesized by the Voice Flow 360 Industry Intelligence Desk through secondary research: evaluating public financial disclosures, technical benchmarks, corporate announcements, and third-party consumer sentiment telemetry.
                </div>
                <div>
                  <strong>Author &amp; Reviewer:</strong> Voice Flow 360 Industry Intelligence Desk &bull; Audited by Voice Flow 360 Research Standards Desk
                </div>
                <div>
                  <strong>Primary Linked Sources &amp; Public References:</strong>
                  <ul class="list-disc pl-5 mt-1 space-y-1">
                    <li><a href="https://www.google.com/finance?q=${encodeURIComponent(article.brand_name)}" target="_blank" rel="noopener noreferrer" class="text-purple-600 underline">SEC &amp; Financial Disclosures (${escapeHtml(article.brand_name)})</a></li>
                    <li><a href="https://www.statista.com/search/?q=${encodeURIComponent(article.brand_name)}" target="_blank" rel="noopener noreferrer" class="text-purple-600 underline">Industry Benchmark Telemetry</a></li>
                    <li><a href="https://www.trustpilot.com/search?query=${encodeURIComponent(article.brand_name)}" target="_blank" rel="noopener noreferrer" class="text-purple-600 underline">Public Customer Feedback Signals</a></li>
                  </ul>
                </div>
                <div class="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-950">
                  <strong>Editorial Limitations:</strong> This publication is an editorial desk synthesis based on secondary sources, not a direct respondent probability survey. Fieldwork dates, recruitment procedures, and panel sample sizes are excluded from editorial analyses because no primary panel was fielded for this report.
                </div>
              </div>
            </section>
          `;
        })()}

        <!-- Ad Placement Zone: Bottom Leaderboard Slot -->
        <div class="ad-unit-zone ad-bottom-slot my-6 p-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 text-center text-xs text-slate-400 font-mono" data-ad-zone="brand-research-detail-bottom">
          Partner Intelligence Placement &bull; Ad Placement Zone
        </div>

        <!-- Persistent Footer Disclaimer Required on Every Article -->
        <div class="persistent-footer-disclaimer bg-amber-50/80 border border-amber-200/80 rounded-2xl p-4 text-center mt-6">
          <p class="text-xs font-semibold text-amber-900 leading-normal">
            Independent analysis by Voice Flow 360. Not affiliated with, endorsed by, or sponsored by ${escapeHtml(article.brand_name)}.
          </p>
        </div>

        <div class="pt-6 border-t border-slate-200 text-center">
          <a href="/brand-research-studies" class="inline-flex items-center gap-2 text-sm font-bold text-purple-600 hover:text-purple-800 transition-colors">
            &larr; Back to All Brand Research Studies
          </a>
        </div>
      </article>
    </div>
  `;

  return {
    title,
    description,
    canonicalUrl,
    ogType: 'article',
    keywords: `${article.brand_name}, ${article.category}, brand research study, consumer sentiment, market analysis, Voice Flow 360`,
    structuredData,
    htmlContent,
  };
}

/**
 * 1. Brand Research Study Page SSR
 */
function renderBrandStudySeo(origin: string, article: BrandSEOArticle): PageSeoResult {
  const canonicalPath = getBrandStudyPath(article);
  const canonicalUrl = `${origin}${canonicalPath}`;
  const title = `${article.brandName}: ${article.metaTitle} | Voice Flow 360`;
  const description = article.metaDescription;

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonicalUrl,
    },
    headline: article.metaTitle,
    description: article.metaDescription,
    datePublished: article.publishDate,
    dateModified: article.lastUpdated,
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
      url: origin,
      logo: `${origin}/favicon.ico`,
    },
    about: {
      '@type': 'Organization',
      name: article.brandName,
    },
  };

  const htmlContent = `
    <div class="ssr-page-wrapper max-w-4xl mx-auto px-4 py-8 text-slate-800 font-sans">
      <nav aria-label="Breadcrumb" class="text-xs text-slate-500 mb-6 flex items-center gap-2">
        <a href="/" class="text-purple-600 hover:underline">Home</a> &gt;
        <a href="/brand-insights" class="text-purple-600 hover:underline">Brand Insights</a> &gt;
        <span class="text-slate-700 font-semibold">${escapeHtml(article.brandName)}</span>
      </nav>

      <article class="space-y-8">
        <header class="border-b border-slate-200 pb-6 space-y-3">
          <div class="inline-block px-3 py-1 bg-purple-100 text-purple-800 text-xs font-bold rounded-full uppercase tracking-wider">
            Editorial Analysis &bull; Voice Flow 360
          </div>
          <h1 class="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
            ${escapeHtml(article.metaTitle)}
          </h1>
          <p class="text-base sm:text-lg text-slate-600 leading-relaxed">
            ${escapeHtml(article.executiveSummary)}
          </p>
          <div class="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-2">
            <span><strong>Author:</strong> ${escapeHtml(article.author.name)} (${escapeHtml(article.author.role)})</span>
            <span>&bull;</span>
            <span><strong>Published:</strong> ${escapeHtml(article.publishDate)}</span>
            <span>&bull;</span>
            <span><strong>Analysis Type:</strong> Editorial Analysis</span>
          </div>
        </header>

        <section class="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-4 text-xs text-slate-700 leading-relaxed">
          <div class="flex items-center justify-between pb-3 border-b border-slate-200">
            <h3 class="text-sm font-bold text-slate-900 uppercase tracking-wider">Editorial Methodology, Sources &amp; Transparency Disclosure</h3>
            <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-200">Source-Based Editorial Analysis</span>
          </div>
          <div class="space-y-3">
            <div>
              <strong>Editorial Method:</strong> Synthesized by the Voice Flow 360 Industry Intelligence Desk through secondary research: evaluating public financial disclosures, technical benchmarks, corporate announcements, and third-party consumer sentiment telemetry.
            </div>
            <div>
              <strong>Author:</strong> ${escapeHtml(article.author.name)} (${escapeHtml(article.author.role)}) &bull; <strong>Reviewed &amp; Audited by:</strong> Voice Flow 360 Research Standards Desk
            </div>
            <div>
              <strong>Primary Linked Sources &amp; Public References:</strong>
              <ul class="list-disc pl-5 mt-1 space-y-1">
                <li><a href="https://www.google.com/finance?q=${encodeURIComponent(article.brandName)}" target="_blank" rel="noopener noreferrer" class="text-purple-600 underline">SEC &amp; Financial Filings (${escapeHtml(article.brandName)})</a></li>
                <li><a href="https://www.statista.com/search/?q=${encodeURIComponent(article.brandName)}" target="_blank" rel="noopener noreferrer" class="text-purple-600 underline">Industry Telemetry &amp; Market Share Data</a></li>
                <li><a href="https://www.trustpilot.com/search?query=${encodeURIComponent(article.brandName)}" target="_blank" rel="noopener noreferrer" class="text-purple-600 underline">Public Consumer Reviews &amp; Feedback Indexes</a></li>
              </ul>
            </div>
            <div class="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-950">
              <strong>Editorial Limitations &amp; Separation Notice:</strong> This publication is an editorial desk synthesis based on secondary sources, not a direct respondent probability survey. Fieldwork dates, recruitment procedures, and panel sample sizes are excluded from editorial analyses because no primary panel was fielded for this report. Empirical study classifications and panel methodologies are strictly reserved for genuine survey studies supported by actual respondent data.
            </div>
          </div>
        </section>

        <section class="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-4">
          <h2 class="text-xl font-bold text-slate-900">Key Verified Intelligence &amp; Performance KPIs</h2>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div class="bg-white p-4 rounded-xl border border-slate-200 text-center">
              <div class="text-2xl font-black text-purple-600">${article.keyMetrics.customerSatisfactionScore}%</div>
              <div class="text-xs text-slate-500 font-medium mt-1">Customer Satisfaction</div>
            </div>
            <div class="bg-white p-4 rounded-xl border border-slate-200 text-center">
              <div class="text-2xl font-black text-indigo-600">${article.keyMetrics.npsScore > 0 ? '+' : ''}${article.keyMetrics.npsScore}</div>
              <div class="text-xs text-slate-500 font-medium mt-1">Net Promoter Score</div>
            </div>
            <div class="bg-white p-4 rounded-xl border border-slate-200 text-center">
              <div class="text-2xl font-black text-emerald-600">${article.keyMetrics.positiveSentiment}%</div>
              <div class="text-xs text-slate-500 font-medium mt-1">Positive Sentiment</div>
            </div>
            <div class="bg-white p-4 rounded-xl border border-slate-200 text-center">
              <div class="text-2xl font-black text-slate-800">${escapeHtml(article.keyMetrics.globalMarketRank)}</div>
              <div class="text-xs text-slate-500 font-medium mt-1">Global Sector Rank</div>
            </div>
          </div>
        </section>

        <section class="space-y-4">
          <h2 class="text-2xl font-bold text-slate-900">Product Portfolio &amp; Experience Analysis</h2>
          <h3 class="text-lg font-semibold text-purple-900">Flagship Line: ${escapeHtml(article.productsServicesReview.flagshipProduct)}</h3>
          <p class="text-slate-700 leading-relaxed">${escapeHtml(article.productsServicesReview.summary)}</p>
          <div class="space-y-2">
            <h4 class="text-sm font-bold text-slate-800 uppercase tracking-wider">Key Strengths Highlighted in Public Consumer Reviews &amp; Market Analysis:</h4>
            <ul class="list-disc pl-5 space-y-1 text-slate-700 text-sm">
              ${article.productsServicesReview.keyStrengths.map((s) => `<li>${escapeHtml(s)}</li>`).join('')}
            </ul>
          </div>
        </section>

        <section class="space-y-4">
          <h2 class="text-2xl font-bold text-slate-900">Strategic SWOT Analysis</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2">
              <h3 class="font-bold text-emerald-900">Strengths</h3>
              <ul class="list-disc pl-5 space-y-1 text-xs sm:text-sm text-emerald-950">
                ${article.swotAnalysis.strengths.map((s) => `<li>${escapeHtml(s)}</li>`).join('')}
              </ul>
            </div>
            <div class="p-5 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2">
              <h3 class="font-bold text-amber-900">Weaknesses</h3>
              <ul class="list-disc pl-5 space-y-1 text-xs sm:text-sm text-amber-950">
                ${article.swotAnalysis.weaknesses.map((w) => `<li>${escapeHtml(w)}</li>`).join('')}
              </ul>
            </div>
            <div class="p-5 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-2">
              <h3 class="font-bold text-blue-900">Market Opportunities</h3>
              <ul class="list-disc pl-5 space-y-1 text-xs sm:text-sm text-blue-950">
                ${article.swotAnalysis.opportunities.map((o) => `<li>${escapeHtml(o)}</li>`).join('')}
              </ul>
            </div>
            <div class="p-5 rounded-2xl bg-rose-50/70 border border-rose-200 space-y-2">
              <h3 class="font-bold text-rose-900">Competitive Threats</h3>
              <ul class="list-disc pl-5 space-y-1 text-xs sm:text-sm text-rose-950">
                ${article.swotAnalysis.threats.map((t) => `<li>${escapeHtml(t)}</li>`).join('')}
              </ul>
            </div>
          </div>
        </section>

        <section class="space-y-4">
          <h2 class="text-2xl font-bold text-slate-900">Demographic &amp; Regional Sentiment Distribution</h2>
          <p class="text-slate-700 text-sm leading-relaxed">
            Secondary market research and industry reports indicate dominant market presence across <strong>${escapeHtml(article.geographicSegregation.dominantTerritory)}</strong>, with the most rapid adoption growth occurring in <strong>${escapeHtml(article.geographicSegregation.fastestGrowingRegion)}</strong>.
          </p>
          <ul class="list-disc pl-5 space-y-1 text-sm text-slate-700">
            ${article.geographicSegregation.regions.map((r) => `<li><strong>${escapeHtml(r.region)}:</strong> ${r.sharePercentage}% market share (Growth: ${escapeHtml(r.growthTrend)})</li>`).join('')}
          </ul>
        </section>

        <section class="space-y-4">
          <h2 class="text-2xl font-bold text-slate-900">Strategic Advisory &amp; Action Plan</h2>
          <div class="space-y-3">
            <h3 class="text-base font-bold text-slate-800">Immediate Roadmap Priorities</h3>
            <ul class="list-disc pl-5 space-y-1 text-sm text-slate-700">
              ${article.suggestedImprovements.immediatePriorities.map((p) => `<li>${escapeHtml(p)}</li>`).join('')}
            </ul>
            <h3 class="text-base font-bold text-slate-800 pt-2">Long-Term Growth Initiatives</h3>
            <ul class="list-disc pl-5 space-y-1 text-sm text-slate-700">
              ${article.suggestedImprovements.longTermStrategicMoves.map((m) => `<li>${escapeHtml(m)}</li>`).join('')}
            </ul>
          </div>
        </section>

        <section class="space-y-4 border-t border-slate-200 pt-6">
          <h2 class="text-2xl font-bold text-slate-900">Frequently Asked Questions</h2>
          <dl class="space-y-4">
            ${article.faqs.map((f) => `
              <div class="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <dt class="font-bold text-slate-900 text-sm mb-1">${escapeHtml(f.question)}</dt>
                <dd class="text-xs sm:text-sm text-slate-600 leading-relaxed">${escapeHtml(f.answer)}</dd>
              </div>
            `).join('')}
          </dl>
        </section>

        <footer class="bg-gradient-to-r from-purple-900 to-indigo-900 text-white rounded-3xl p-6 sm:p-8 text-center space-y-3">
          <h3 class="text-xl sm:text-2xl font-extrabold">Participate in ${escapeHtml(article.brandName)} Market Research</h3>
          <p class="text-xs sm:text-sm text-purple-200 max-w-xl mx-auto">
            Voice Flow 360 conducts ongoing consumer sentiment surveys with verified respondents. Share your authentic experiences, shape future product lines, and earn research honorariums.
          </p>
          <div class="pt-2">
            <a href="/start-earning" class="inline-block px-6 py-3 bg-white text-purple-950 font-extrabold text-sm rounded-xl shadow-md hover:bg-purple-50 transition-colors">
              Explore Active Surveys
            </a>
          </div>
        </footer>
      </article>
    </div>
  `;

  return {
    title,
    description,
    canonicalUrl,
    ogType: 'article',
    keywords: DEFAULT_KEYWORDS,
    structuredData,
    htmlContent,
  };
}

/**
 * 2. Brand Detail Page SSR (/brands/:id)
 */
function renderBrandDetailSeo(origin: string, brand: BrandMeta): PageSeoResult {
  const canonicalUrl = `${origin}/brands/${brand.id}`;
  const title = `${brand.name} Consumer Feedback & Market Research | Voice Flow 360`;
  const description = `Verified consumer feedback, product review sentiment, and community satisfaction ratings for ${brand.name} (${brand.sector}) on Voice Flow 360.`;

  const htmlContent = `
    <div class="ssr-page-wrapper max-w-4xl mx-auto px-4 py-8 text-slate-800 font-sans space-y-6">
      <nav aria-label="Breadcrumb" class="text-xs text-slate-500 flex items-center gap-2">
        <a href="/" class="text-purple-600 hover:underline">Home</a> &gt;
        <a href="/brands" class="text-purple-600 hover:underline">Brands</a> &gt;
        <span class="text-slate-700 font-semibold">${escapeHtml(brand.name)}</span>
      </nav>

      <header class="border-b border-slate-200 pb-6 space-y-2">
        <div class="inline-block px-3 py-0.5 bg-slate-100 text-slate-700 text-xs font-semibold rounded-full">
          Sector: ${escapeHtml(brand.sector)} &bull; Category: ${escapeHtml(brand.category)}
        </div>
        <h1 class="text-3xl font-extrabold text-slate-900">${escapeHtml(brand.name)} Market Intelligence</h1>
        <p class="text-slate-600 text-base leading-relaxed">${escapeHtml(brand.description)}</p>
      </header>

      <section class="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-4">
        <h2 class="text-lg font-bold text-slate-900">Key Products &amp; Offerings</h2>
        <p class="text-sm text-slate-700"><strong>Primary Focus:</strong> ${escapeHtml(brand.keyProduct)}</p>
        <p class="text-sm text-slate-600">Official Website: <a href="${escapeHtml(brand.website)}" target="_blank" rel="noopener noreferrer" class="text-purple-600 underline">${escapeHtml(brand.website)}</a></p>
      </section>

      <section class="space-y-4">
        <h2 class="text-xl font-bold text-slate-900">Consumer Feedback &amp; Survey Participation</h2>
        <p class="text-sm text-slate-700 leading-relaxed">
          Voice Flow 360 members frequently review and evaluate products from ${escapeHtml(brand.name)}. Active studies evaluate user experience, pricing perception, feature satisfaction, and overall brand recommendation.
        </p>
        <div class="pt-2">
          <a href="/start-earning" class="inline-block px-5 py-2.5 bg-purple-600 text-white font-bold text-xs rounded-xl shadow-sm hover:bg-purple-700">
            Check Active ${escapeHtml(brand.name)} Surveys
          </a>
        </div>
      </section>
    </div>
  `;

  return {
    title,
    description,
    canonicalUrl,
    ogType: 'website',
    keywords: DEFAULT_KEYWORDS,
    htmlContent,
  };
}

/**
 * 3. About Page SSR
 */
function renderAboutPageSeo(origin: string): PageSeoResult {
  const canonicalUrl = `${origin}/about`;
  const title = 'About Voice Flow 360 - Consumer Market Research & Brand Intelligence';
  const description = 'Learn how Voice Flow 360 connects everyday consumers with global brands for transparent consumer compensation and verified market research.';

  const htmlContent = `
    <div class="ssr-page-wrapper max-w-4xl mx-auto px-4 py-8 text-slate-800 font-sans space-y-8">
      <header class="border-b border-slate-200 pb-6 space-y-3">
        <div class="inline-block px-3 py-1 bg-purple-100 text-purple-800 text-xs font-bold rounded-full">
          About Our Organization
        </div>
        <h1 class="text-3xl sm:text-4xl font-extrabold text-slate-900">
          The Conversational Market Intelligence Ecosystem
        </h1>
        <p class="text-base sm:text-lg text-slate-600 leading-relaxed">
          Voice Flow 360 bridges the gap between everyday consumers and global enterprise decision-makers through dynamic conversational surveys and fair compensation.
        </p>
      </header>

      <section class="space-y-4">
        <h2 class="text-2xl font-bold text-slate-900">Our Core Mission</h2>
        <p class="text-slate-700 leading-relaxed">
          Traditional consumer surveys are static, tedious, and impersonal. Voice Flow 360 transforms market research into engaging, natural conversations. By pairing interactive conversational dialogue with transparent reward mechanics, we yield higher-fidelity sentiment data for enterprises while providing verified participants with fair research honorariums.
        </p>
      </section>

      <section class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="p-5 rounded-2xl bg-slate-50 border border-slate-200">
          <div class="text-2xl font-black text-purple-600 mb-1">Active Panel</div>
          <div class="font-bold text-slate-900 text-sm">Consumer Panelists</div>
          <div class="text-xs text-slate-500 mt-1">Opted-in survey participants contributing authentic opinions on consumer brands.</div>
        </div>
        <div class="p-5 rounded-2xl bg-slate-50 border border-slate-200">
          <div class="text-2xl font-black text-indigo-600 mb-1">100+ Brands</div>
          <div class="font-bold text-slate-900 text-sm">Cataloged Brands</div>
          <div class="text-xs text-slate-500 mt-1">Leading consumer brands featured across public research studies and sentiment benchmarks.</div>
        </div>
        <div class="p-5 rounded-2xl bg-slate-50 border border-slate-200">
          <div class="text-2xl font-black text-emerald-600 mb-1">Audited Data</div>
          <div class="font-bold text-slate-900 text-sm">Quality Screening</div>
          <div class="text-xs text-slate-500 mt-1">Our quality checks help identify suspicious, duplicate or inconsistent responses.</div>
        </div>
      </section>

      <section class="space-y-4">
        <h2 class="text-2xl font-bold text-slate-900">Participant Honorarium Standards</h2>
        <p class="text-slate-700 leading-relaxed">
          We believe participant time has real value. Unlike traditional platforms with opaque redemption systems, Voice Flow 360 publishes clear coin-to-currency ratios (100 coins = $1.00 USD) and predictable cashout thresholds.
        </p>
      </section>
    </div>
  `;

  return {
    title,
    description,
    canonicalUrl,
    ogType: 'website',
    keywords: DEFAULT_KEYWORDS,
    htmlContent,
  };
}

/**
 * 4. For Brands & Enterprise Research Page SSR
 */
function renderForBrandsPageSeo(origin: string): PageSeoResult {
  const canonicalUrl = `${origin}/for-brands`;
  const title = 'Market Research for Brands & Enterprises - Voice Flow 360';
  const description = 'Launch customized market research studies, conversational audio & text surveys, and consumer sentiment research with verified global respondents.';

  const htmlContent = `
    <div class="ssr-page-wrapper max-w-4xl mx-auto px-4 py-8 text-slate-800 font-sans space-y-8">
      <header class="border-b border-slate-200 pb-6 space-y-3">
        <div class="inline-block px-3 py-1 bg-indigo-100 text-indigo-800 text-xs font-bold rounded-full">
          Enterprise Research Solutions
        </div>
        <h1 class="text-3xl sm:text-4xl font-extrabold text-slate-900">
          High-Velocity Consumer Sentiment &amp; Market Intelligence
        </h1>
        <p class="text-base sm:text-lg text-slate-600 leading-relaxed">
          Accelerate your product roadmaps with authenticated feedback from diverse global consumer segments.
        </p>
      </header>

      <section class="space-y-4">
        <h2 class="text-2xl font-bold text-slate-900">Why Global Brands Partner With Voice Flow 360</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <h3 class="font-bold text-slate-900">Conversational Survey Engines</h3>
            <p class="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Interactive chat questionnaires offer an intuitive user experience compared to legacy multi-page survey forms.
            </p>
          </div>
          <div class="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <h3 class="font-bold text-slate-900">Automated Quality Screening</h3>
            <p class="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Our quality checks help identify suspicious, duplicate or inconsistent responses to uphold data integrity.
            </p>
          </div>
        </div>
      </section>
    </div>
  `;

  return {
    title,
    description,
    canonicalUrl,
    ogType: 'website',
    keywords: DEFAULT_KEYWORDS,
    htmlContent,
  };
}

/**
 * 5. How To Earn Guide SSR
 */
function renderHowToEarnPageSeo(origin: string): PageSeoResult {
  const canonicalUrl = `${origin}/how-to-earn`;
  const title = 'Panelist Compensation & Research Honorarium Guide | Voice Flow 360';
  const description = 'Understand how Voice Flow 360 compensates verified consumer panelists with research honorariums and credits for completed market studies, brand surveys, and focus questionnaires.';

  const htmlContent = `
    <div class="ssr-page-wrapper max-w-4xl mx-auto px-4 py-8 text-slate-800 font-sans space-y-8">
      <header class="border-b border-slate-200 pb-6 space-y-3">
        <h1 class="text-3xl sm:text-4xl font-extrabold text-slate-900">
          How Panelist Honorariums & Research Credits Work
        </h1>
        <p class="text-base text-slate-600">
          Voice Flow 360 connects verified consumer panelists with institutional, brand, and academic market research studies. We believe consumer time and insights deserve fair, transparent compensation.
        </p>
      </header>

      <section class="space-y-6">
        <div class="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
          <h2 class="text-lg font-bold text-slate-900">Step 1: Study Matching & Criteria Verification</h2>
          <p class="text-sm text-slate-600">Explore active consumer research studies matched to your demographic profile. Each study displays its estimated completion time, target topic, and research credit allocation.</p>
        </div>

        <div class="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
          <h2 class="text-lg font-bold text-slate-900">Step 2: Conversational Feedback & Open Discourse</h2>
          <p class="text-sm text-slate-600">Engage with our structured conversational interface. Provide authentic qualitative responses, Likert-scale evaluations, and brand perception scores at your natural pace.</p>
        </div>

        <div class="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
          <h2 class="text-lg font-bold text-slate-900">Step 3: Methodology Review & Data Auditing</h2>
          <p class="text-sm text-slate-600">To maintain empirical standards for enterprise clients, survey responses undergo automated quality auditing to screen out rushed inputs, bot scripts, and conflicting statements.</p>
        </div>

        <div class="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
          <h2 class="text-lg font-bold text-slate-900">Step 4: Honorarium Credit & Flexible Disbursement</h2>
          <p class="text-sm text-slate-600">Verified research credits accrue in your panelist account. On the 1st of each month, reviewed earnings move to your Redeemable Wallet. Disburse earnings via Direct Bank Transfer or Cryptocurrency once your balance reaches the standardized 2,000 credits ($20.00 USD) threshold with zero platform fees.</p>
        </div>
      </section>
    </div>
  `;

  return {
    title,
    description,
    canonicalUrl,
    ogType: 'website',
    keywords: DEFAULT_KEYWORDS,
    htmlContent,
  };
}

/**
 * 6. 360 Earning Overview SSR
 */
function render360EarningPageSeo(origin: string): PageSeoResult {
  const canonicalUrl = `${origin}/360-earning`;
  const title = 'How Brand Research Studies Work & Participant Rewards | Voice Flow 360';
  const description = 'Learn how everyday consumers participate in enterprise brand research studies and earn rewards. Understand our 70% community compensation model and fair-value research economics.';

  const htmlContent = `
    <div class="ssr-page-wrapper max-w-4xl mx-auto px-4 py-8 text-slate-800 font-sans space-y-6">
      <header class="border-b border-slate-200 pb-6 space-y-2">
        <h1 class="text-3xl font-extrabold text-slate-900">How Brand Research Studies Work on Voice Flow 360</h1>
        <p class="text-slate-600 text-base">Be a part of brand research studies and earn rewards through fair-value community compensation.</p>
      </header>
      <section class="space-y-4 text-sm text-slate-700 leading-relaxed">
        <p>Voice Flow 360 connects verified consumers with global enterprises conducting essential market research. By sharing your genuine brand experiences, product feedback, and consumer evaluations, you contribute directly to product roadmaps while earning transparent honorarium rewards.</p>
      </section>
    </div>
  `;

  return {
    title,
    description,
    canonicalUrl,
    ogType: 'website',
    keywords: DEFAULT_KEYWORDS,
    htmlContent,
  };
}

/**
 * 7. Earnings Disclaimer Page SSR
 */
function renderEarningsDisclaimerSeo(origin: string): PageSeoResult {
  const canonicalUrl = `${origin}/earnings-disclaimer`;
  const title = 'Earnings & Research Honorarium Disclaimer - Voice Flow 360';
  const description = 'Official Earnings Disclaimer for Voice Flow 360. Clear guidelines on consumer panel compensation, coin conversions, and realistic expectations.';

  const htmlContent = `
    <div class="ssr-page-wrapper max-w-4xl mx-auto px-4 py-8 text-slate-800 font-sans space-y-6">
      <header class="border-b border-slate-200 pb-6 space-y-2">
        <h1 class="text-3xl font-extrabold text-slate-900">Earnings &amp; Research Honorarium Disclaimer</h1>
        <p class="text-slate-600 text-sm">Transparent guidance on panel participation, reward rates, and realistic expectations.</p>
      </header>
      <div class="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 text-sm leading-relaxed">
        <strong>Important Notice:</strong> Voice Flow 360 is a consumer market research panel, not an employer, full-time job, investment vehicle, or get-rich-quick opportunity. Any coins or rewards represent voluntary research honorariums provided in exchange for authentic feedback.
      </div>
      <section class="space-y-4 text-sm text-slate-700 leading-relaxed">
        <h2 class="text-lg font-bold text-slate-900">No Guarantee of Specific Income</h2>
        <p>We do not represent, promise, or guarantee that any participant will earn any specific monetary amount. Earnings depend upon demographic suitability, survey frequency, and response quality.</p>
      </section>
    </div>
  `;

  return {
    title,
    description,
    canonicalUrl,
    ogType: 'website',
    keywords: DEFAULT_KEYWORDS,
    htmlContent,
  };
}

/**
 * 8. FAQ Page SSR
 */
function renderFaqPageSeo(origin: string): PageSeoResult {
  const canonicalUrl = `${origin}/faq`;
  const title = 'Frequently Asked Questions & Help Center - Voice Flow 360';
  const description = 'Find instant answers regarding survey payouts, coin conversions, account verification, and quality audit policies on Voice Flow 360.';

  const faqs = [
    {
      q: 'How does Voice Flow 360 work?',
      a: 'Voice Flow 360 connects consumer participants with global brands conducting market research. You answer conversational surveys regarding products and services you use, and in return, you earn platform coins that can be converted to cash or crypto.',
    },
    {
      q: 'What is the coin conversion rate?',
      a: 'The standard conversion rate is 100 coins = $1.00 USD. The minimum cashout threshold is 2,000 coins ($20.00 USD).',
    },
    {
      q: 'How are rewards paid out?',
      a: 'Verified panelists can request disbursements directly to Bank Transfer or major Cryptocurrencies.',
    },
    {
      q: 'Are surveys available in all countries?',
      a: 'Yes, Voice Flow 360 accepts global participants. Survey availability depends on demographic requests from our enterprise brand partners.',
    },
  ];

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.a,
      },
    })),
  };

  const htmlContent = `
    <div class="ssr-page-wrapper max-w-4xl mx-auto px-4 py-8 text-slate-800 font-sans space-y-6">
      <header class="border-b border-slate-200 pb-6 space-y-2">
        <h1 class="text-3xl font-extrabold text-slate-900">Frequently Asked Questions</h1>
        <p class="text-slate-600 text-sm">Comprehensive answers to common questions about panel membership and payouts.</p>
      </header>
      <dl class="space-y-4">
        ${faqs.map((f) => `
          <div class="p-5 rounded-2xl bg-slate-50 border border-slate-200">
            <dt class="font-bold text-slate-900 text-base mb-1">${escapeHtml(f.q)}</dt>
            <dd class="text-sm text-slate-600 leading-relaxed">${escapeHtml(f.a)}</dd>
          </div>
        `).join('')}
      </dl>
    </div>
  `;

  return {
    title,
    description,
    canonicalUrl,
    ogType: 'website',
    keywords: DEFAULT_KEYWORDS,
    structuredData,
    htmlContent,
  };
}

/**
 * 9. Privacy Policy Page SSR
 */
function renderPrivacyPageSeo(origin: string): PageSeoResult {
  const canonicalUrl = `${origin}/privacy`;
  const title = 'Privacy Policy & Google AdSense Disclosures - Voice Flow 360';
  const description = 'Our commitment to protecting your personal data, survey anonymity, and cookie preferences in compliance with GDPR, CCPA, and Google AdSense partner policies.';

  const htmlContent = `
    <div class="ssr-page-wrapper max-w-4xl mx-auto px-4 py-8 text-slate-800 font-sans space-y-6">
      <header class="border-b border-slate-200 pb-6 space-y-2">
        <h1 class="text-3xl font-extrabold text-slate-900">Privacy Policy &amp; Data Protection</h1>
        <p class="text-slate-600 text-sm">Transparent policies governing data collection, survey response privacy, and advertising cookies in compliance with global standards.</p>
      </header>
      <section class="space-y-6 text-sm text-slate-700 leading-relaxed">
        <div>
          <h2 class="text-lg font-bold text-slate-900 mb-1.5">1. Information We Collect</h2>
          <p>When you use Voice Flow 360, we collect personal information such as your name, email address, demographic preferences (for survey targeting), and payment or wallet details to facilitate coin reward redemptions. We also collect usage data, device telemetry, and browser information to maintain system security, detect bot fraud, and optimize survey matching.</p>
        </div>

        <div>
          <h2 class="text-lg font-bold text-slate-900 mb-1.5">2. How We Use Your Information</h2>
          <p>We use your information to provide, maintain, and improve our services, process payout transactions, prevent fraud, send system updates, and deliver authentic market research to brand partners in an aggregated, anonymized format.</p>
        </div>

        <div>
          <h2 class="text-lg font-bold text-slate-900 mb-1.5">3. Data Sharing and Disclosure</h2>
          <p>We do not sell your personal data. We only share information with trusted third-party service providers (such as cloud hosting infrastructure and payout processors) strictly as required to operate our services.</p>
        </div>

        <div class="p-5 rounded-2xl bg-purple-50/60 border border-purple-100 space-y-3">
          <h2 class="text-lg font-bold text-slate-900">4. Google AdSense &amp; Third-Party Advertising Policy</h2>
          <p>Voice Flow 360 intends to use Google AdSense to display advertisements once the website is approved and advertising is enabled. Advertisements will appear only on eligible public articles and research content pages.</p>
          <p>Advertisements will not be displayed within customer dashboards, survey sessions, wallets, withdrawal pages or administrative areas. Participant rewards are earned for eligible, accepted survey responses and are not awarded for viewing, clicking or otherwise interacting with advertisements.</p>
          <p>The following disclosures explain how advertising cookies and related technologies may be used when advertising is enabled:</p>
          <ul class="list-disc pl-6 space-y-2 text-slate-600">
            <li><strong>Third-Party Vendor Cookies:</strong> Third-party vendors, including Google, use cookies and similar identifiers to serve ads based on a user's prior visits to Voice Flow 360 or other websites on the Internet.</li>
            <li><strong>Personalized Advertising:</strong> Google's use of advertising cookies enables it and its partners to serve ads to our users based on their visits to our site and/or other sites across the World Wide Web.</li>
            <li><strong>Opting Out of Personalized Advertising:</strong> Users may opt out of personalized advertising at any time by visiting <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer" class="font-semibold text-purple-600 underline">Google Ads Settings</a>.</li>
            <li><strong>Third-Party Opt-Out Portals:</strong> You can also opt out of participating third-party ad networks and vendors' use of cookies for personalized advertising by visiting the <a href="https://www.aboutads.info/choices" target="_blank" rel="noopener noreferrer" class="font-semibold text-purple-600 underline">Digital Advertising Alliance (www.aboutads.info)</a> or the <a href="https://optout.networkadvertising.org" target="_blank" rel="noopener noreferrer" class="font-semibold text-purple-600 underline">Network Advertising Initiative (NAI) Opt-Out Tool</a>.</li>
            <li><strong>How Google Uses Information:</strong> For more information on how Google collects and uses information when you visit sites that use Google AdSense, please visit <a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noopener noreferrer" class="font-semibold text-purple-600 underline">How Google uses information from sites or apps that use our services</a>.</li>
          </ul>
        </div>

        <div>
          <h2 class="text-lg font-bold text-slate-900 mb-1.5">5. Cookies and Tracking Technologies</h2>
          <p>We use cookies, web beacons, and local storage to store session preferences, secure account sessions, analyze site performance, and serve relevant advertisements. You can configure your browser to decline all cookies or to alert you when a cookie is sent.</p>
        </div>

        <div>
          <h2 class="text-lg font-bold text-slate-900 mb-1.5">6. European Economic Area (EEA) &amp; UK User Rights (GDPR)</h2>
          <p>In accordance with the European Union General Data Protection Regulation (GDPR) and Google's EU User Consent Policy, users located in the EEA and the UK are presented with choices regarding cookie usage and personalized ads. You have the right to access, rectify, port, or erase your data, and withdraw consent at any time.</p>
        </div>

        <div>
          <h2 class="text-lg font-bold text-slate-900 mb-1.5">7. California Privacy Rights (CCPA / CPRA)</h2>
          <p>Under the California Consumer Privacy Act (CCPA) and California Privacy Rights Act (CPRA), California residents have the right to know what personal information is collected, request deletion of their personal information, and opt out of the sale or sharing of their personal information for cross-context behavioral advertising. Voice Flow 360 does not sell personal information for monetary consideration.</p>
        </div>

        <div>
          <h2 class="text-lg font-bold text-slate-900 mb-1.5">8. Children's Online Privacy Protection (COPPA)</h2>
          <p>Voice Flow 360 is intended strictly for users who are at least 18 years of age (or the legal age of majority in their jurisdiction). We do not knowingly collect personal information from children under 13.</p>
        </div>

        <div>
          <h2 class="text-lg font-bold text-slate-900 mb-1.5">9. Contact Information &amp; Data Protection Officer</h2>
          <p>If you have questions regarding this Privacy Policy or wish to exercise your privacy rights, contact our Data Protection Officer at <a href="mailto:privacy@voiceflow360.com" class="font-semibold text-purple-600">privacy@voiceflow360.com</a> or <a href="mailto:support@voiceflow360.com" class="font-semibold text-purple-600">support@voiceflow360.com</a>.</p>
        </div>
      </section>
    </div>
  `;

  return {
    title,
    description,
    canonicalUrl,
    ogType: 'website',
    keywords: DEFAULT_KEYWORDS,
    htmlContent,
  };
}

/**
 * 10. Terms of Service SSR
 */
function renderTermsPageSeo(origin: string): PageSeoResult {
  const canonicalUrl = `${origin}/terms`;
  const title = 'Terms of Service & Earning Regulations - Voice Flow 360';
  const description = 'Official terms and conditions governing account eligibility, reward redemption, and anti-fraud safeguards.';

  const htmlContent = `
    <div class="ssr-page-wrapper max-w-4xl mx-auto px-4 py-8 text-slate-800 font-sans space-y-6">
      <header class="border-b border-slate-200 pb-6 space-y-2">
        <h1 class="text-3xl font-extrabold text-slate-900">Terms of Service</h1>
        <p class="text-slate-600 text-sm">Legal conditions governing panel usage, research participation, and account conduct.</p>
      </header>
      <section class="space-y-6 text-sm text-slate-700 leading-relaxed">
        <div>
          <h2 class="text-lg font-bold text-slate-900 mb-1.5">1. Acceptance of Terms</h2>
          <p>By accessing and using Voice Flow 360, you accept and agree to be bound by these Terms of Service. If you do not agree, you must not use our platform.</p>
        </div>

        <div>
          <h2 class="text-lg font-bold text-slate-900 mb-1.5">2. User Eligibility</h2>
          <p>You must be at least 18 years old or the age of majority in your jurisdiction to participate in surveys, contribute feedback, and redeem platform rewards.</p>
        </div>

        <div>
          <h2 class="text-lg font-bold text-slate-900 mb-1.5">3. Earning and Redeeming Rewards</h2>
          <p>Coins earned through completed, accepted surveys undergo monthly quality reviews before transferring to your Redeemable Wallet on the 1st of each calendar month. Redemptions require reaching our standardized minimum threshold of 2,000 Coins ($20.00 USD) and are disbursed via our authorized payment rails: Direct Bank Transfer (ACH, SEPA, Wire) and Cryptocurrency (USDT, BTC). All redemptions are subject to the published Rewards &amp; Withdrawals Policy. We reserve the right to audit, adjust, or invalidate coins earned through fraudulent activity, automated scripts, contradictory answers, or violation of these terms.</p>
        </div>

        <div>
          <h2 class="text-lg font-bold text-slate-900 mb-1.5">4. Prohibited Conduct &amp; Anti-Fraud Safeguards</h2>
          <p>You agree not to use automated scripts, multiple accounts from the same household or IP address, or false demographic information to artificially inflate your rewards. Violation will result in immediate account suspension and forfeiture of all coins.</p>
        </div>

        <div>
          <h2 class="text-lg font-bold text-slate-900 mb-1.5">5. Modifications to Service &amp; Fixed Conversion Ratio Guarantee</h2>
          <p>We reserve the right to modify platform operational features, available survey campaigns, and technical infrastructure. However, in accordance with our published Rewards &amp; Withdrawals Policy, all already-earned and credited coins maintain our published fixed conversion ratio of <strong>100 Coins = $1.00 USD ($0.01 per coin)</strong>. Any prospective modifications to minimum payout thresholds or disbursement rails will be announced with at least 30 days&apos; advance notice to active participants, ensuring no retroactive devaluation of accrued rewards.</p>
        </div>

        <div>
          <h2 class="text-lg font-bold text-slate-900 mb-1.5">6. Intellectual Property &amp; Research Output</h2>
          <p>All brand research reports, consumer sentiment analyses, and site design are the proprietary intellectual property of Voice Flow 360 and its partners. Anonymized survey responses are compiled into published industry reports.</p>
        </div>

        <div>
          <h2 class="text-lg font-bold text-slate-900 mb-1.5">7. Contact for Legal Inquiries</h2>
          <p>For questions regarding these terms, please contact <a href="mailto:legal@voiceflow360.com" class="font-semibold text-purple-600">legal@voiceflow360.com</a> or <a href="mailto:support@voiceflow360.com" class="font-semibold text-purple-600">support@voiceflow360.com</a>.</p>
        </div>
      </section>
    </div>
  `;

  return {
    title,
    description,
    canonicalUrl,
    ogType: 'website',
    keywords: DEFAULT_KEYWORDS,
    htmlContent,
  };
}

/**
 * 11. Contact Page SSR
 */
function renderContactPageSeo(origin: string): PageSeoResult {
  const canonicalUrl = `${origin}/contact`;
  const title = 'Contact Us - Member Support & Brand Partnerships - Voice Flow 360';
  const description = 'Reach our dedicated member support team, report issues, or discuss enterprise survey partnerships.';

  const htmlContent = `
    <div class="ssr-page-wrapper max-w-4xl mx-auto px-4 py-8 text-slate-800 font-sans space-y-6">
      <header class="border-b border-slate-200 pb-6 space-y-2">
        <h1 class="text-3xl font-extrabold text-slate-900">Contact Voice Flow 360</h1>
        <p class="text-slate-600 text-sm">We are here to assist participants, researchers, and prospective enterprise partners.</p>
      </header>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6">
        <div class="p-5 rounded-2xl bg-purple-50/60 border border-purple-100">
          <h3 class="font-bold text-slate-900 text-sm mb-1">General Inquiries</h3>
          <p class="text-xs text-slate-500 mb-2">Platform questions &amp; general assistance</p>
          <a href="mailto:contact@voiceflow360.com" class="text-xs font-bold text-purple-700 hover:text-purple-900 underline">contact@voiceflow360.com</a>
        </div>
        <div class="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-100">
          <h3 class="font-bold text-slate-900 text-sm mb-1">Support &amp; Rewards</h3>
          <p class="text-xs text-slate-500 mb-2">Payouts, coins &amp; account queries</p>
          <a href="mailto:support@voiceflow360.com" class="text-xs font-bold text-emerald-700 hover:text-emerald-900 underline">support@voiceflow360.com</a>
        </div>
        <div class="p-5 rounded-2xl bg-blue-50/60 border border-blue-100">
          <h3 class="font-bold text-slate-900 text-sm mb-1">Brand Partnerships</h3>
          <p class="text-xs text-slate-500 mb-2">Enterprise studies &amp; research commissioning</p>
          <a href="mailto:partners@voiceflow360.com" class="text-xs font-bold text-blue-700 hover:text-blue-900 underline">partners@voiceflow360.com</a>
        </div>
      </div>
      <section class="space-y-3 text-sm text-slate-700 pt-2 border-t border-slate-200">
        <h2 class="text-base font-bold text-slate-900">Operational Inquiries &amp; Response Times</h2>
        <p>Our global support team typically responds to inquiries within 24 to 48 business hours. For immediate account assistance or withdrawal status, please log in to your account and review your Earnings Statement.</p>
      </section>
    </div>
  `;

  return {
    title,
    description,
    canonicalUrl,
    ogType: 'website',
    keywords: DEFAULT_KEYWORDS,
    htmlContent,
  };
}

/**
 * 11b. Rewards & Withdrawals Policy SSR (/rewards-and-withdrawals)
 */
function renderRewardsAndWithdrawalsSeo(origin: string): PageSeoResult {
  const canonicalUrl = `${origin}/rewards-and-withdrawals`;
  const title = 'Rewards & Withdrawals Policy - Transparent Consumer Compensation | Voice Flow 360';
  const description = 'Comprehensive guide to Voice Flow 360 participant compensation: coin-to-currency conversion rates, acceptance criteria, withdrawal thresholds, payment methods, and dispute procedures.';

  const htmlContent = `
    <div class="ssr-page-wrapper max-w-4xl mx-auto px-4 py-8 text-slate-800 font-sans space-y-8">
      <header class="border-b border-slate-200 pb-6 space-y-2">
        <div class="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full">
          Compensation Standards
        </div>
        <h1 class="text-3xl font-extrabold text-slate-900">Rewards &amp; Withdrawals Policy</h1>
        <p class="text-slate-600 text-sm">Transparent rules governing coin-to-USD conversion rates, response acceptance criteria, monthly audit cycles, and payout processing.</p>
      </header>

      <section class="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div class="p-4 rounded-xl bg-slate-50 border border-slate-200">
          <strong class="text-slate-900 block text-sm mb-1">Fixed Conversion Rate</strong>
          <p class="text-slate-600"><strong>100 Coins = $1.00 USD</strong> fixed ratio ($0.01 USD per coin). No algorithmic dilution or hidden conversion haircuts.</p>
        </div>
        <div class="p-4 rounded-xl bg-slate-50 border border-slate-200">
          <strong class="text-slate-900 block text-sm mb-1">Withdrawal Threshold</strong>
          <p class="text-slate-600"><strong>2,000 Coins ($20.00 USD)</strong> minimum cashout across all disbursement rails.</p>
        </div>
        <div class="p-4 rounded-xl bg-slate-50 border border-slate-200">
          <strong class="text-slate-900 block text-sm mb-1">Zero Platform Fees</strong>
          <p class="text-slate-600"><strong>$0.00 platform fee</strong> on Bank Transfers (ACH / SEPA / Wire); standard miner fee on Cryptocurrency (USDT / BTC).</p>
        </div>
      </section>

      <section class="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50 p-6 rounded-2xl border border-slate-200">
        <h2 class="text-base font-bold text-slate-900">Supported Disbursement Rails &amp; Conditions</h2>
        <ul class="list-disc pl-5 space-y-2">
          <li><strong>Bank Transfer (ACH / SEPA / Wire):</strong> Minimum 2,000 Coins ($20.00 USD), $0.00 platform fee, processed in 2–5 business days following monthly review.</li>
          <li><strong>Cryptocurrency (USDT / BTC):</strong> Minimum 2,000 Coins ($20.00 USD), network gas/miner fee only, processed in 24–48 hours following monthly review.</li>
          <li><strong>Monthly Quality Audit Cycle:</strong> Survey earnings enter Pending Review upon completion. On the 1st of every month, audited and approved coins automatically transition to your Redeemable Wallet for disbursement.</li>
          <li><strong>Account Activity Condition:</strong> Earned coins do not expire as long as your account participates in at least one survey or activity within any 12-month period.</li>
        </ul>
      </section>

      <section class="space-y-4 text-sm text-slate-700 leading-relaxed">
        <h2 class="text-lg font-bold text-slate-900">No Advertising Arbitrage Guarantee</h2>
        <p>Under no circumstances are cash-convertible coins awarded for viewing, clicking, or interacting with Google advertisements. Watching an ad is never required to complete a survey, receive an earned reward, or disburse an eligible balance.</p>
      </section>
    </div>
  `;

  return {
    title,
    description,
    canonicalUrl,
    ogType: 'website',
    keywords: DEFAULT_KEYWORDS,
    htmlContent,
  };
}

/**
 * 11c. Research Methodology SSR (/research-methodology)
 */
function renderResearchMethodologySeo(origin: string): PageSeoResult {
  const canonicalUrl = `${origin}/research-methodology`;
  const title = 'Research Methodology & Educational Library | Voice Flow 360';
  const description = 'Educational resources covering conversational survey architecture, response quality auditing, sample size interpretations, ethical participant compensation, and consumer feedback product synthesis.';

  const htmlContent = `
    <div class="ssr-page-wrapper max-w-4xl mx-auto px-4 py-8 text-slate-800 font-sans space-y-8">
      <header class="border-b border-slate-200 pb-6 space-y-2">
        <div class="inline-block px-3 py-1 bg-indigo-100 text-indigo-800 text-xs font-bold rounded-full">
          Methodological Standards
        </div>
        <h1 class="text-3xl font-extrabold text-slate-900">Research Methodology &amp; Educational Resources</h1>
        <p class="text-slate-600 text-sm">Empirical guides on survey design, psychometric construct validity, fraud prevention, and statistical interpretation.</p>
      </header>

      <section class="space-y-4">
        <div class="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
          <h2 class="text-base font-bold text-slate-900">Published Methodology Guides</h2>
          <ul class="list-disc pl-5 space-y-1.5 text-xs text-slate-600">
            <li><strong>How Conversational Surveys Work:</strong> Architecture, sequential dialogue, and satisficing reduction.</li>
            <li><strong>How Response Quality Is Assessed:</strong> Multi-factor velocity checks, semantic entropy, and human spot-checks.</li>
            <li><strong>How to Interpret Survey Sample Sizes:</strong> Margins of error, convenience vs. quota samples, and subgroup limitations.</li>
            <li><strong>How Participant Compensation Works:</strong> Ethical honorariums, coin-to-USD conversion, and separation from ads.</li>
            <li><strong>How Consumer Feedback Informs Product Decisions:</strong> Translating conversational sentiment into engineering roadmaps.</li>
          </ul>
        </div>
      </section>
    </div>
  `;

  return {
    title,
    description,
    canonicalUrl,
    ogType: 'website',
    keywords: DEFAULT_KEYWORDS,
    htmlContent,
  };
}

/**
 * 12. Sitemap Directory SSR
 */
function renderSitemapDirectorySeo(origin: string): PageSeoResult {
  const canonicalUrl = `${origin}/sitemap-directory`;
  const title = 'HTML Sitemap & Platform Directory - Voice Flow 360';
  const description = 'Complete navigation hierarchy and index of all 147+ platform pages, survey drops, and brand studies on Voice Flow 360.';
  const publishedBrandStudies = getPublishedBrandArticles();

  const htmlContent = `
    <div class="ssr-page-wrapper max-w-4xl mx-auto px-4 py-8 text-slate-800 font-sans space-y-8">
      <header class="border-b border-slate-200 pb-6 space-y-2">
        <h1 class="text-3xl font-extrabold text-slate-900">HTML Platform Directory &amp; Sitemap</h1>
        <p class="text-slate-600 text-sm">Comprehensive index of research reports, brand intelligence profiles, and platform views.</p>
      </header>

      <section class="space-y-4">
        <h2 class="text-xl font-bold text-slate-900">Core Navigation Pages</h2>
        <ul class="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
          <li><a href="/" class="text-purple-600 hover:underline">Home</a></li>
          <li><a href="/about" class="text-purple-600 hover:underline">About Voice Flow 360</a></li>
          <li><a href="/for-brands" class="text-purple-600 hover:underline">For Brands</a></li>
          <li><a href="/how-to-earn" class="text-purple-600 hover:underline">How to Earn</a></li>
          <li><a href="/earnings-disclaimer" class="text-purple-600 hover:underline">Earnings Disclaimer</a></li>
          <li><a href="/brands" class="text-purple-600 hover:underline">100+ Brands Directory</a></li>
          <li><a href="/brand-insights" class="text-purple-600 hover:underline">Brand Insights</a></li>
          <li><a href="/faq" class="text-purple-600 hover:underline">FAQ &amp; Help</a></li>
          <li><a href="/privacy" class="text-purple-600 hover:underline">Privacy Policy</a></li>
          <li><a href="/terms" class="text-purple-600 hover:underline">Terms of Service</a></li>
          <li><a href="/contact" class="text-purple-600 hover:underline">Contact Us</a></li>
        </ul>
      </section>

      <section class="space-y-4">
        <h2 class="text-xl font-bold text-slate-900">Verified Brand Intelligence Studies</h2>
        <ul class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm">
          ${publishedBrandStudies.length > 0 ? publishedBrandStudies.map((art) => `
            <li>
              <a href="${getBrandStudyPath(art)}" class="text-purple-600 hover:underline">
                ${escapeHtml(art.brandName)}: ${escapeHtml(art.metaTitle)}
              </a>
            </li>
          `).join('') : `
            <li class="text-slate-500 italic">New verified studies are published automatically as real survey responses come in.</li>
          `}
        </ul>
      </section>
    </div>
  `;

  return {
    title,
    description,
    canonicalUrl,
    ogType: 'website',
    keywords: DEFAULT_KEYWORDS,
    htmlContent,
  };
}

/**
 * 13. Brand Directory SSR (/brands)
 */
function renderBrandDirectorySeo(origin: string): PageSeoResult {
  const canonicalUrl = `${origin}/brands`;
  const title = '100+ Partner Brands Directory - Market Research Insights | Voice Flow 360';
  const description = 'Search through 100+ global brands partnering with Voice Flow 360 for consumer feedback and survey rewards.';

  const htmlContent = `
    <div class="ssr-page-wrapper max-w-5xl mx-auto px-4 py-8 text-slate-800 font-sans space-y-8">
      <header class="border-b border-slate-200 pb-6 space-y-2">
        <h1 class="text-3xl font-extrabold text-slate-900">100+ Verified Consumer Brands</h1>
        <p class="text-slate-600 text-sm">Explore market research profiles, verified surveys, and consumer satisfaction scores.</p>
      </header>
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        ${RAW_100_BRANDS.slice(0, 30).map((b) => `
          <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div class="font-bold text-slate-900 text-base">
              <a href="/brands/${b.id}" class="hover:text-purple-600">${escapeHtml(b.name)}</a>
            </div>
            <div class="text-xs text-purple-600 font-semibold">${escapeHtml(b.sector)}</div>
            <p class="text-xs text-slate-500 line-clamp-2">${escapeHtml(b.description)}</p>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  return {
    title,
    description,
    canonicalUrl,
    ogType: 'website',
    keywords: DEFAULT_KEYWORDS,
    htmlContent,
  };
}

/**
 * 14. Brand Insights SSR (/brand-insights)
 */
function renderBrandInsightsIndexSeo(origin: string): PageSeoResult {
  const canonicalUrl = `${origin}/brand-insights`;
  const title = 'Brand Insights & Real-Time Sentiment Analytics | Voice Flow 360';
  const description = 'Explore aggregate consumer sentiment metrics, survey satisfaction scores, and feedback benchmarks across industries.';
  const publishedBrandStudies = getPublishedBrandArticles().slice(0, 10);

  const htmlContent = `
    <div class="ssr-page-wrapper max-w-5xl mx-auto px-4 py-8 text-slate-800 font-sans space-y-8">
      <header class="border-b border-slate-200 pb-6 space-y-2">
        <h1 class="text-3xl font-extrabold text-slate-900">Brand Insights &amp; Market Intelligence</h1>
        <p class="text-slate-600 text-sm">Empirical consumer feedback benchmarks across gaming, technology, streaming, and retail.</p>
      </header>
      <div class="space-y-4">
        <h2 class="text-xl font-bold text-slate-900">Featured Research Reports</h2>
        ${publishedBrandStudies.length > 0 ? `
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          ${publishedBrandStudies.map((art) => `
            <div class="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <h3 class="font-bold text-slate-900 text-base">
                <a href="${getBrandStudyPath(art)}" class="hover:text-purple-600">${escapeHtml(art.brandName)}: ${escapeHtml(art.metaTitle)}</a>
              </h3>
              <p class="text-xs text-slate-600 line-clamp-3">${escapeHtml(art.executiveSummary)}</p>
              <div class="text-xs text-purple-700 font-semibold pt-1">
                Satisfaction: ${art.keyMetrics.customerSatisfactionScore}% &bull; Sample: ${art.keyMetrics.verifiedResponsesAnalyzed.toLocaleString()}
              </div>
            </div>
          `).join('')}
        </div>
        ` : `
        <p class="text-sm text-slate-500 italic">New verified studies are published automatically as real survey responses accumulate for each brand. Check back soon.</p>
        `}
      </div>
    </div>
  `;

  return {
    title,
    description,
    canonicalUrl,
    ogType: 'website',
    keywords: DEFAULT_KEYWORDS,
    htmlContent,
  };
}

/**
 * 15. News & Updates SSR (/news)
 */
function renderNewsPageSeo(origin: string): PageSeoResult {
  const canonicalUrl = `${origin}/news`;
  const title = 'News, Releases & Monthly Payout Reports | Voice Flow 360';
  const description = 'Official bulletins, feature updates, new brand partnerships, and monthly payout transparency statistics.';

  const htmlContent = `
    <div class="ssr-page-wrapper max-w-4xl mx-auto px-4 py-8 text-slate-800 font-sans space-y-6">
      <header class="border-b border-slate-200 pb-6 space-y-2">
        <h1 class="text-3xl font-extrabold text-slate-900">Platform News &amp; Bulletins</h1>
        <p class="text-slate-600 text-sm">Stay updated on new study releases, payout records, and brand drops.</p>
      </header>
    </div>
  `;

  return {
    title,
    description,
    canonicalUrl,
    ogType: 'website',
    keywords: DEFAULT_KEYWORDS,
    htmlContent,
  };
}

/**
 * 16. Referrals SSR (/referrals)
 */
function renderReferralsPageSeo(origin: string): PageSeoResult {
  const canonicalUrl = `${origin}/referrals`;
  const title = 'Referral Program - Earn Lifetime Friend Bonuses | Voice Flow 360';
  const description = 'Invite friends to Voice Flow 360 and earn 300 bonus coins plus 10% lifetime referral matching rewards.';

  const htmlContent = `
    <div class="ssr-page-wrapper max-w-4xl mx-auto px-4 py-8 text-slate-800 font-sans space-y-6">
      <header class="border-b border-slate-200 pb-6 space-y-2">
        <h1 class="text-3xl font-extrabold text-slate-900">Voice Flow 360 Referral Program</h1>
        <p class="text-slate-600 text-sm">Share your referral link with colleagues and fellow consumer insight contributors.</p>
      </header>
    </div>
  `;

  return {
    title,
    description,
    canonicalUrl,
    ogType: 'website',
    keywords: DEFAULT_KEYWORDS,
    htmlContent,
  };
}

/**
 * 17. Surveys Catalog SSR (/surveys)
 */
function renderSurveysCatalogSeo(origin: string): PageSeoResult {
  const canonicalUrl = `${origin}/surveys`;
  const title = 'Survey Catalog & Live Brand Drops | Voice Flow 360';
  const description = 'Browse available conversational surveys, sponsor brands, and high-coin feedback opportunities.';

  const htmlContent = `
    <div class="ssr-page-wrapper max-w-4xl mx-auto px-4 py-8 text-slate-800 font-sans space-y-6">
      <header class="border-b border-slate-200 pb-6 space-y-2">
        <h1 class="text-3xl font-extrabold text-slate-900">Active Market Research Surveys</h1>
        <p class="text-slate-600 text-sm">Select an active consumer research drop to begin your conversational feedback session.</p>
      </header>
    </div>
  `;

  return {
    title,
    description,
    canonicalUrl,
    ogType: 'website',
    keywords: DEFAULT_KEYWORDS,
    htmlContent,
  };
}

/**
 * 18. Start Earning SSR (/start-earning)
 */
function renderStartEarningSeo(origin: string): PageSeoResult {
  const canonicalUrl = `${origin}/start-earning`;
  const title = 'Brand Research Studies & Participant Rewards | Voice Flow 360';
  const description = 'Be a part of brand research studies and earn rewards. Explore live conversational studies, share consumer feedback, and build your redeemable balance.';

  const htmlContent = `
    <div class="ssr-page-wrapper max-w-4xl mx-auto px-4 py-8 text-slate-800 font-sans space-y-6">
      <header class="border-b border-slate-200 pb-6 space-y-2">
        <h1 class="text-3xl font-extrabold text-slate-900">Brand Research Study Hub</h1>
        <p class="text-slate-600 text-sm">Be a part of brand research studies and earn rewards. Access your personalized study queue, daily trivia bonuses, and rewards wallet.</p>
      </header>
    </div>
  `;

  return {
    title,
    description,
    canonicalUrl,
    ogType: 'website',
    keywords: DEFAULT_KEYWORDS,
    htmlContent,
  };
}

/**
 * 18b. Public Product Reviews SSR (/product-reviews)
 */
function renderPublicProductReviewsSeo(origin: string): PageSeoResult {
  const canonicalUrl = `${origin}/product-reviews`;
  const title = 'Public Product Reviews - 100+ Newly Launched Devices | Voice Flow 360';
  const description = 'Browse verified consumer reviews, pricing in USD, top features, purchase intent, and owner satisfaction across 100+ newly launched tech products and gadgets.';

  const htmlContent = `
    <div class="ssr-page-wrapper max-w-5xl mx-auto px-4 py-8 text-slate-800 font-sans space-y-8">
      <header class="border-b border-slate-200 pb-6 space-y-3">
        <div class="inline-block px-3 py-1 bg-purple-100 text-purple-900 text-xs font-bold rounded-full">
          Verified Consumer Feedback &bull; 100+ Newly Launched Products
        </div>
        <h1 class="text-3xl sm:text-4xl font-black text-slate-900">
          Public Product Reviews &amp; Pricing Directory
        </h1>
        <p class="text-slate-600 text-base leading-relaxed">
          Explore transparent retail pricing in USD, standout hardware features, satisfaction percentages, and purchase intent analytics across 105+ recently launched devices.
        </p>
      </header>

      <section class="space-y-6">
        <h2 class="text-xl font-bold text-slate-900">100+ Newly Launched Products Catalog</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          ${LAUNCHED_PRODUCTS.slice(0, 36).map((p) => `
            <div class="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
              <div class="flex items-center justify-between text-xs">
                <span class="font-extrabold text-purple-700">${escapeHtml(p.brand)}</span>
                <span class="font-black text-slate-900">$${p.priceUSD.toLocaleString()} USD</span>
              </div>
              <h3 class="font-bold text-slate-900 text-sm leading-snug">${escapeHtml(p.name)}</h3>
              <p class="text-xs text-slate-500 line-clamp-2">${escapeHtml(p.summary)}</p>
              <div class="flex flex-wrap gap-1 pt-1">
                ${p.topFeatures.slice(0, 2).map((f) => `
                  <span class="text-[10px] px-2 py-0.5 rounded bg-purple-50 text-purple-800 font-medium">
                    ${escapeHtml(f)}
                  </span>
                `).join('')}
              </div>
              <div class="text-[11px] text-emerald-700 font-bold pt-1">
                &bull; ${p.satisfactionRate}% Satisfied &bull; ${p.intentToPurchaseRate}% Purchase Intent
              </div>
            </div>
          `).join('')}
        </div>
      </section>
    </div>
  `;

  return {
    title,
    description,
    canonicalUrl,
    ogType: 'website',
    keywords: 'public product reviews, new tech launches, product pricing USD, consumer satisfaction, purchase intent, user reviews, voice flow 360',
    htmlContent,
  };
}

/**
 * 19. Brand Case Studies & Homepage SSR (/brand-case-studies and /)
 */
function renderHomepageSeo(origin: string): PageSeoResult {
  const canonicalUrl = `${origin}/brand-case-studies`;
  const title = 'Brand Case Studies & Market Intelligence | Voice Flow 360';
  const description = 'Comprehensive consumer sentiment analyses, benchmark evaluations, and empirical case studies across leading global brands. Participate in studies and earn rewards.';
  const homepageFeaturedStudies = getPublishedBrandArticles().slice(0, 6);

  const htmlContent = `
    <div class="ssr-page-wrapper max-w-5xl mx-auto px-4 py-10 text-slate-800 font-sans space-y-12">
      <header class="text-center space-y-4 max-w-3xl mx-auto">
        <div class="inline-block px-3.5 py-1 bg-purple-100 text-purple-900 text-xs font-bold rounded-full">
          Consumer Market Research &amp; Brand Insights
        </div>
        <h1 class="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
          Share your opinions. Help businesses understand consumers.
        </h1>
        <p class="text-lg text-slate-600 leading-relaxed">
          Participate in available research studies and receive the reward shown for eligible, accepted responses. Study availability and rewards vary.
        </p>
        <div class="pt-2 flex flex-wrap justify-center gap-3">
          <a href="/start-earning" class="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-sm rounded-xl shadow-md transition-colors">
            Join a Brand Research Study
          </a>
          <a href="/for-brands" class="px-6 py-3 bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm rounded-xl border border-slate-300 transition-colors">
            For Enterprise Brands
          </a>
        </div>
      </header>

      <section class="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div class="p-6 rounded-3xl bg-slate-50 border border-slate-200 space-y-2">
          <h2 class="text-lg font-bold text-slate-900">Conversational Surveys</h2>
          <p class="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Forget clunky 50-page survey grids. Engage in natural, intuitive chat dialogues tailored to your real consumer experiences.
          </p>
        </div>
        <div class="p-6 rounded-3xl bg-slate-50 border border-slate-200 space-y-2">
          <h2 class="text-lg font-bold text-slate-900">Transparent Honorariums</h2>
          <p class="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Eligible, accepted survey responses receive the stated study reward. Cash out via transparent payout rails with defined thresholds.
          </p>
        </div>
        <div class="p-6 rounded-3xl bg-slate-50 border border-slate-200 space-y-2">
          <h2 class="text-lg font-bold text-slate-900">Published Research Studies</h2>
          <p class="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Browse our growing library of consumer intelligence reports, built entirely from verified Voice Flow 360 survey responses.
          </p>
        </div>
      </section>

      <section class="space-y-6">
        <div class="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <h2 class="text-2xl font-black text-slate-900">Featured Brand Research Studies</h2>
            <p class="text-xs sm:text-sm text-slate-500">In-depth empirical consumer studies based on verified panelist submissions.</p>
          </div>
          <a href="/brand-insights" class="text-xs font-bold text-purple-600 hover:underline">
            View Published Studies &rarr;
          </a>
        </div>

        ${homepageFeaturedStudies.length > 0 ? `
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          ${homepageFeaturedStudies.map((art) => `
            <div class="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
              <span class="text-[10px] font-bold uppercase tracking-wider text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md">
                ${escapeHtml(art.brandName)}
              </span>
              <h3 class="font-bold text-slate-900 text-sm leading-snug">
                <a href="${getBrandStudyPath(art)}" class="hover:text-purple-600">
                  ${escapeHtml(art.metaTitle)}
                </a>
              </h3>
              <p class="text-xs text-slate-500 line-clamp-2">${escapeHtml(art.executiveSummary)}</p>
              <div class="pt-2 flex items-center justify-between text-[11px] text-slate-400">
                <span>CSAT: <strong class="text-slate-700">${art.keyMetrics.customerSatisfactionScore}%</strong></span>
                <span>NPS: <strong class="text-slate-700">${art.keyMetrics.npsScore > 0 ? '+' : ''}${art.keyMetrics.npsScore}</strong></span>
              </div>
            </div>
          `).join('')}
        </div>
        ` : `
        <p class="text-sm text-slate-500 italic">New verified brand studies are published automatically as real survey responses accumulate. Check back soon.</p>
        `}
      </section>
    </div>
  `;

  return {
    title,
    description,
    canonicalUrl,
    ogType: 'website',
    keywords: DEFAULT_KEYWORDS,
    htmlContent,
  };
}

/**
 * Injects dynamic page-specific SEO meta tags, canonical link, and pre-rendered HTML
 * into an HTML template string (from index.html).
 */
export function injectSeoAndContent(htmlTemplate: string, requestPath: string): string {
  const seo = getPageSeoAndContent(requestPath);

  let result = htmlTemplate;

  // 1. Update or replace <title>
  const titleTag = `<title>${escapeHtml(seo.title)}</title>`;
  if (/<title[^>]*>.*?<\/title>/is.test(result)) {
    result = result.replace(/<title[^>]*>.*?<\/title>/is, titleTag);
  } else {
    result = result.replace('</head>', `  ${titleTag}\n</head>`);
  }

  // 2. Update or replace <link rel="canonical">
  const canonicalTag = `<link rel="canonical" href="${seo.canonicalUrl}" />`;
  if (/<link[^>]*rel=["']canonical["'][^>]*>/i.test(result)) {
    result = result.replace(/<link[^>]*rel=["']canonical["'][^>]*>/i, canonicalTag);
  } else {
    result = result.replace('</head>', `  ${canonicalTag}\n</head>`);
  }

  // 3. Update or replace <meta name="description">
  const descTag = `<meta name="description" content="${escapeHtml(seo.description)}" />`;
  if (/<meta[^>]*name=["']description["'][^>]*>/i.test(result)) {
    result = result.replace(/<meta[^>]*name=["']description["'][^>]*>/i, descTag);
  } else {
    result = result.replace('</head>', `  ${descTag}\n</head>`);
  }

  // 4. Update or replace <meta name="keywords">
  const keywordsTag = `<meta name="keywords" content="${escapeHtml(seo.keywords)}" />`;
  if (/<meta[^>]*name=["']keywords["'][^>]*>/i.test(result)) {
    result = result.replace(/<meta[^>]*name=["']keywords["'][^>]*>/i, keywordsTag);
  }

  // 5. Update Open Graph Tags (og:title, og:description, og:url, og:type)
  const ogTitleTag = `<meta property="og:title" content="${escapeHtml(seo.title)}" />`;
  if (/<meta[^>]*property=["']og:title["'][^>]*>/i.test(result)) {
    result = result.replace(/<meta[^>]*property=["']og:title["'][^>]*>/i, ogTitleTag);
  } else {
    result = result.replace('</head>', `  ${ogTitleTag}\n</head>`);
  }

  const ogDescTag = `<meta property="og:description" content="${escapeHtml(seo.description)}" />`;
  if (/<meta[^>]*property=["']og:description["'][^>]*>/i.test(result)) {
    result = result.replace(/<meta[^>]*property=["']og:description["'][^>]*>/i, ogDescTag);
  } else {
    result = result.replace('</head>', `  ${ogDescTag}\n</head>`);
  }

  const ogUrlTag = `<meta property="og:url" content="${seo.canonicalUrl}" />`;
  if (/<meta[^>]*property=["']og:url["'][^>]*>/i.test(result)) {
    result = result.replace(/<meta[^>]*property=["']og:url["'][^>]*>/i, ogUrlTag);
  } else {
    result = result.replace('</head>', `  ${ogUrlTag}\n</head>`);
  }

  const ogTypeTag = `<meta property="og:type" content="${seo.ogType}" />`;
  if (/<meta[^>]*property=["']og:type["'][^>]*>/i.test(result)) {
    result = result.replace(/<meta[^>]*property=["']og:type["'][^>]*>/i, ogTypeTag);
  }

  // 6. Update Twitter Card Tags
  const twitterTitleTag = `<meta name="twitter:title" content="${escapeHtml(seo.title)}" />`;
  if (/<meta[^>]*name=["']twitter:title["'][^>]*>/i.test(result)) {
    result = result.replace(/<meta[^>]*name=["']twitter:title["'][^>]*>/i, twitterTitleTag);
  } else {
    result = result.replace('</head>', `  ${twitterTitleTag}\n</head>`);
  }

  const twitterDescTag = `<meta name="twitter:description" content="${escapeHtml(seo.description)}" />`;
  if (/<meta[^>]*name=["']twitter:description["'][^>]*>/i.test(result)) {
    result = result.replace(/<meta[^>]*name=["']twitter:description["'][^>]*>/i, twitterDescTag);
  } else {
    result = result.replace('</head>', `  ${twitterDescTag}\n</head>`);
  }

  // 7. Inject Structured Data (JSON-LD) if available
  if (seo.structuredData) {
    const jsonLdScript = `\n    <script type="application/ld+json">\n${JSON.stringify(seo.structuredData, null, 2)}\n    </script>\n`;
    result = result.replace('</head>', `${jsonLdScript}</head>`);
  }

  // 8. Inject Semantic Pre-Rendered HTML into <div id="root">
  if (seo.htmlContent) {
    result = result.replace(
      /<div id=["']root["']><\/div>/i,
      `<div id="root">${seo.htmlContent}</div>`
    );
  }

  return result;
}
