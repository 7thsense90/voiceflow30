/**
 * Static Site Generation (SSG) & Route Pre-rendering Script
 * 
 * Runs after `vite build` to pre-render full semantic HTML, route-specific
 * <title>, <meta description>, <link rel="canonical">, Open Graph tags,
 * and Schema.org JSON-LD for every platform page, brand directory item,
 * and featured brand user research study.
 * 
 * Solves the critical AdSense / Search Console crawler issue where static
 * single-page app hosting serves an unrendered root shell with empty <body>
 * and identical homepage canonical URLs.
 */

import fs from 'fs';
import path from 'path';
import { injectSeoAndContent } from '../server/seoRenderer';
import { APP_ROUTES } from '../src/utils/routes';
import { RAW_100_BRANDS } from '../src/data/brandsData';
import { FEATURED_BRAND_ARTICLES, getBrandStudyPath } from '../src/data/brandArticles/index';

async function runPrerender() {
  const distDir = path.resolve(process.cwd(), 'dist');
  const indexHtmlPath = path.join(distDir, 'index.html');

  if (!fs.existsSync(indexHtmlPath)) {
    console.error('[SSG Prerender] Error: dist/index.html not found. Run `vite build` first.');
    process.exit(1);
  }

  const baseTemplate = await fs.promises.readFile(indexHtmlPath, 'utf-8');
  console.log('[SSG Prerender] Base index.html loaded. Collecting routes for static generation...');

  // 1. Gather all unique paths to pre-render
  const routeSet = new Set<string>();

  // Homepage and root variants
  routeSet.add('/');

  // All registered application routes
  for (const route of APP_ROUTES) {
    if (route.path) {
      routeSet.add(route.path);
    }
  }

  // Core static & SEO landing pages
  const corePaths = [
    '/about',
    '/about-voiceflow',
    '/about-us',
    '/for-brands',
    '/brand-research',
    '/market-research',
    '/how-to-earn',
    '/360-earning',
    '/360-earning-for-everyone',
    '/earnings-disclaimer',
    '/faq',
    '/privacy',
    '/terms',
    '/contact',
    '/sitemap-directory',
    '/brands',
    '/brand-insights',
    '/news',
    '/referrals',
    '/surveys',
    '/start-earning',
    '/dashboard',
    '/quizzes',
    '/my-earnings',
    '/profile',
  ];
  for (const p of corePaths) {
    routeSet.add(p);
  }

  // All 30+ Featured Brand Research Studies
  for (const article of FEATURED_BRAND_ARTICLES) {
    // 1. Canonical /brand-insights/:slug path
    routeSet.add(`/brand-insights/${article.slug}`);
    // 2. Alternate /brands/:slug/user-research-study path
    routeSet.add(`/brands/${article.slug}/user-research-study`);
    // 3. Alternate slug if ends with -user-research-study
    if (article.slug.endsWith('-user-research-study')) {
      const baseSlug = article.slug.replace('-user-research-study', '');
      routeSet.add(`/brand-insights/${baseSlug}`);
      routeSet.add(`/brands/${baseSlug}/user-research-study`);
    }
    // 4. Also add getBrandStudyPath
    routeSet.add(getBrandStudyPath(article));
  }

  // All 100+ Brands Directory detail pages
  for (const brand of RAW_100_BRANDS) {
    routeSet.add(`/brands/${brand.id}`);
    if (brand.id.startsWith('br_')) {
      routeSet.add(`/brands/${brand.id.replace('br_', '')}`);
    }
  }

  const allRoutes = Array.from(routeSet);
  console.log(`[SSG Prerender] Starting pre-render for ${allRoutes.length} unique routes...`);

  let renderedCount = 0;

  for (const routePath of allRoutes) {
    try {
      const renderedHtml = injectSeoAndContent(baseTemplate, routePath);

      if (routePath === '/') {
        // Overwrite dist/index.html so root request gets homepage SEO & content immediately
        await fs.promises.writeFile(indexHtmlPath, renderedHtml, 'utf-8');
        renderedCount++;
        continue;
      }

      // Format target file paths:
      // e.g. /about -> dist/about/index.html AND dist/about.html
      const cleanPath = routePath.replace(/^\/+/, '').replace(/\/+$/, '');
      const segments = cleanPath.split('/');

      // 1. Directory-based: dist/about/index.html
      const targetDir = path.join(distDir, ...segments);
      await fs.promises.mkdir(targetDir, { recursive: true });
      const targetFile = path.join(targetDir, 'index.html');
      await fs.promises.writeFile(targetFile, renderedHtml, 'utf-8');

      // 2. Extension-based: dist/about.html (for static hosts that resolve /about to /about.html)
      const targetHtmlFile = path.join(distDir, `${cleanPath}.html`);
      const parentDir = path.dirname(targetHtmlFile);
      if (!fs.existsSync(parentDir)) {
        await fs.promises.mkdir(parentDir, { recursive: true });
      }
      await fs.promises.writeFile(targetHtmlFile, renderedHtml, 'utf-8');

      renderedCount++;
    } catch (err) {
      console.error(`[SSG Prerender] Failed to pre-render route "${routePath}":`, err);
    }
  }

  console.log(`[SSG Prerender] Successfully generated static pre-rendered HTML for ${renderedCount} routes into dist/!`);
}

runPrerender().catch((err) => {
  console.error('[SSG Prerender] Fatal error:', err);
  process.exit(1);
});
