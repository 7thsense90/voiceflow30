import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import {
  getSmtpConfig,
  getSmtpConfigAsync,
  verifySmtpConnection,
  sendTestEmail,
  sendBatchCampaign,
  sendWelcomeSubscriberEmail,
  sendSingleCustomerEmail,
} from "./server/emailService";
import { injectSeoAndContent, getPageSeoAndContent } from "./server/seoRenderer";

dotenv.config();

let aiClient: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// Helper to fetch and extract metadata and readable text from a brand website
async function fetchBrandWebsiteData(rawUrl: string): Promise<{
  success: boolean;
  url: string;
  title?: string;
  metaDescription?: string;
  headings?: string[];
  snippet?: string;
}> {
  let targetUrl = rawUrl.trim();
  if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
    targetUrl = 'https://' + targetUrl;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6500);

    const res = await fetch(targetUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) {
      return { success: false, url: targetUrl };
    }

    const html = await res.text();

    // 1. Extract <title>
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].replace(/\s+/g, ' ').trim() : undefined;

    // 2. Extract meta description
    const descMatch =
      html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i) ||
      html.match(/<meta[^>]*content=["']([^"']*)["'][^>]*name=["']description["']/i) ||
      html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']*)["']/i);
    const metaDescription = descMatch ? descMatch[1].replace(/\s+/g, ' ').trim() : undefined;

    // 3. Extract major headings
    const headings: string[] = [];
    const headingRegex = /<h[1-3][^>]*>([^<]+)<\/h[1-3]>/gi;
    let match: RegExpExecArray | null;
    while ((match = headingRegex.exec(html)) !== null && headings.length < 8) {
      const hText = match[1].replace(/\s+/g, ' ').trim();
      if (hText.length > 3 && hText.length < 120 && !headings.includes(hText)) {
        headings.push(hText);
      }
    }

    // 4. Extract readable body text snippet (cleans scripts, styles, svgs)
    const cleaned = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
      .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    const snippet = cleaned.slice(0, 3000);

    return {
      success: true,
      url: targetUrl,
      title,
      metaDescription,
      headings,
      snippet,
    };
  } catch (err: any) {
    console.warn(`[Brand Scraper Notice] Could not fetch ${targetUrl}:`, err?.message || err);
    return { success: false, url: targetUrl };
  }
}

// Intelligent sector-specific question generator fallback supporting up to 20 questions
function generateFallbackBrandSurvey(
  brandName: string,
  brandUrl: string,
  count: number = 5,
  websiteInfo?: { title?: string; metaDescription?: string; headings?: string[] }
) {
  const cleanName = brandName.trim();
  const lowerName = cleanName.toLowerCase();

  let categoryHint = 'general';
  if (
    lowerName.includes('tech') ||
    lowerName.includes('apple') ||
    lowerName.includes('sony') ||
    lowerName.includes('samsung') ||
    lowerName.includes('google') ||
    lowerName.includes('microsoft') ||
    lowerName.includes('nvidia') ||
    lowerName.includes('intel')
  ) {
    categoryHint = 'tech';
  } else if (
    lowerName.includes('stream') ||
    lowerName.includes('spotify') ||
    lowerName.includes('netflix') ||
    lowerName.includes('disney') ||
    lowerName.includes('music') ||
    lowerName.includes('video') ||
    lowerName.includes('youtube')
  ) {
    categoryHint = 'media';
  } else if (
    lowerName.includes('shop') ||
    lowerName.includes('amazon') ||
    lowerName.includes('nike') ||
    lowerName.includes('patagonia') ||
    lowerName.includes('zara') ||
    lowerName.includes('retail') ||
    lowerName.includes('adidas')
  ) {
    categoryHint = 'ecommerce';
  } else if (
    lowerName.includes('auto') ||
    lowerName.includes('tesla') ||
    lowerName.includes('bmw') ||
    lowerName.includes('car') ||
    lowerName.includes('ford') ||
    lowerName.includes('toyota') ||
    lowerName.includes('porsche')
  ) {
    categoryHint = 'automotive';
  } else if (
    lowerName.includes('cloud') ||
    lowerName.includes('ai') ||
    lowerName.includes('openai') ||
    lowerName.includes('saas') ||
    lowerName.includes('salesforce') ||
    lowerName.includes('slack') ||
    lowerName.includes('notion')
  ) {
    categoryHint = 'saas';
  }

  // Pool of 22 rich, diverse brand survey questions
  const pool = [
    {
      text: `How would you rate your overall satisfaction with ${cleanName}'s core products and services?`,
      type: 'rating',
      required: true,
    },
    {
      text: `Which core attribute of ${cleanName} matters most when choosing them over competitors?`,
      type: 'single_choice',
      options: [
        'Product & Build Reliability',
        'Customer Service & Aftercare Support',
        'Competitive Value & Pricing',
        'Intuitive User Experience & Ecosystem Integration',
      ],
      required: true,
    },
    {
      text: `On a scale of 1 to 10, how likely are you to recommend ${cleanName} to a friend, colleague, or family member?`,
      type: 'scale',
      scaleMin: 1,
      scaleMax: 10,
      scaleMinLabel: 'Not likely (1)',
      scaleMaxLabel: 'Extremely likely (10)',
      required: true,
    },
    {
      text: `Have you purchased or actively engaged with ${cleanName} within the past 6 months?`,
      type: 'yes_no',
      options: ['Yes', 'No'],
      required: true,
    },
    {
      text: `How easy was it to navigate and find what you needed on ${cleanName}'s official website or application?`,
      type: 'single_choice',
      options: [
        'Effortless and highly intuitive',
        'Relatively easy with minor friction',
        'Somewhat confusing to locate specific items',
        'Difficult / required multiple searches',
      ],
      required: true,
    },
    {
      text: `What single feature, product line, or service enhancement would you most like ${cleanName} to launch next?`,
      type: 'text',
      placeholder: `Your authentic suggestions for ${cleanName}...`,
      required: true,
    },
    {
      text: `How does ${cleanName}'s pricing compare to the perceived quality and value received?`,
      type: 'single_choice',
      options: [
        'Exceptional value for the price',
        'Fair and reasonable pricing',
        'Slightly overpriced for what is offered',
        'Significantly overpriced compared to market alternatives',
      ],
      required: true,
    },
    {
      text: `How would you evaluate the speed and quality of ${cleanName}'s customer support?`,
      type: 'rating',
      required: false,
    },
    {
      text: `How often do you interact with or purchase from ${cleanName}?`,
      type: 'single_choice',
      options: ['Daily or multiple times a week', 'A few times a month', 'A few times a year', 'First-time user or explorer'],
      required: true,
    },
    {
      text: `Does ${cleanName} demonstrate a commitment to sustainability, security, and ethical standards?`,
      type: 'single_choice',
      options: [
        'Strongly agree — industry leader',
        'Somewhat agree — meets expectations',
        'Neutral / not aware of initiatives',
        'Needs significantly more transparency',
      ],
      required: false,
    },
    {
      text: `What was the primary channel where you first discovered or engaged with ${cleanName}?`,
      type: 'single_choice',
      options: [
        'Social Media & Influencer Channels',
        'Personal Word of Mouth Recommendation',
        'Google / Search Engine Result',
        'Official Advertisement or Sponsorship',
      ],
      required: false,
    },
    {
      text: `On a scale of 1 to 5, how well does ${cleanName}'s branding and marketing reflect the real product experience?`,
      type: 'rating',
      required: false,
    },
    {
      text: `Would you consider switching from ${cleanName} if a cheaper alternative became available?`,
      type: 'yes_no',
      options: ['Yes', 'No'],
      required: true,
    },
    {
      text: `Which device or platform do you primarily use to access ${cleanName}'s products or services?`,
      type: 'single_choice',
      options: ['Mobile Smartphone (iOS / Android)', 'Desktop or Laptop Web Browser', 'Dedicated Hardware / Appliance', 'Tablet or Hybrid Device'],
      required: false,
    },
    {
      text: `How would you describe ${cleanName}'s innovation rate over the past year?`,
      type: 'single_choice',
      options: [
        'Rapidly innovating with exciting launches',
        'Consistent and steady iterations',
        'Slow or falling behind key competitors',
        'Uncertain / Have not followed closely',
      ],
      required: false,
    },
    {
      text: `Has any recent update or announcement from ${cleanName} exceeded your expectations?`,
      type: 'text',
      placeholder: `Describe any memorable positive or negative highlights...`,
      required: false,
    },
    {
      text: `How clear and transparent is ${cleanName}'s terms, return policy, and warranty coverage?`,
      type: 'single_choice',
      options: ['Very clear and trustworthy', 'Acceptable with standard terms', 'Somewhat vague or complicated', 'Difficult to understand or unfair'],
      required: false,
    },
    {
      text: `How likely are you to continue using or repurchasing from ${cleanName} over the next 12 months?`,
      type: 'scale',
      scaleMin: 1,
      scaleMax: 10,
      scaleMinLabel: 'Very Unlikely',
      scaleMaxLabel: 'Definitely',
      required: true,
    },
    {
      text: `Does ${cleanName}'s design aesthetic and brand identity resonate with you personally?`,
      type: 'rating',
      required: false,
    },
    {
      text: `If you could give one piece of direct advice to the CEO or product team at ${cleanName}, what would it be?`,
      type: 'text',
      placeholder: `Your frank message for ${cleanName}'s executive team...`,
      required: true,
    },
  ];

  const targetCount = Math.max(1, Math.min(count, pool.length));
  const selectedPool = pool.slice(0, targetCount);

  const formattedQuestions = selectedPool.map((q, index) => ({
    id: `q_smart_${Date.now()}_${index + 1}`,
    text: q.text,
    type: q.type,
    options: (q as any).options,
    scaleMin: (q as any).scaleMin,
    scaleMax: (q as any).scaleMax,
    scaleMinLabel: (q as any).scaleMinLabel,
    scaleMaxLabel: (q as any).scaleMaxLabel,
    placeholder: (q as any).placeholder,
    required: q.required,
    order: index + 1,
  }));

  let customDescription =
    websiteInfo?.metaDescription ||
    `Provide authentic feedback on ${cleanName}'s verified products, online experience, and services to earn platform coin rewards.`;

  return {
    description: customDescription,
    questions: formattedQuestions,
    source: 'smart_generator',
    websiteInfo: {
      url: brandUrl,
      title: websiteInfo?.title || `${cleanName} Official Website`,
      fetched: !!websiteInfo?.title,
    },
  };
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Enable proxy trust to accurately capture real client IP from Cloud Run / reverse proxies
  app.set('trust proxy', true);

  app.use(cors());
  app.use(express.json());

  // Capture user device IP endpoint
  app.get("/api/client-ip", (req, res) => {
    // Check multiple headers common in reverse proxies, Cloudflare, Cloud Run, and nginx
    const forwarded = req.headers['x-forwarded-for'];
    const forwardedIp = Array.isArray(forwarded)
      ? forwarded[0]
      : typeof forwarded === 'string'
      ? forwarded.split(',')[0].trim()
      : null;

    const realIp = (req.headers['x-real-ip'] as string) || null;
    const cfConnectingIp = (req.headers['cf-connecting-ip'] as string) || null;
    const trueClientIp = (req.headers['true-client-ip'] as string) || null;
    const fastlyClientIp = (req.headers['fastly-client-ip'] as string) || null;
    const xClientIp = (req.headers['x-client-ip'] as string) || null;
    const expressIp = req.ip || null;
    const remoteIp = req.socket?.remoteAddress || null;

    const candidate =
      forwardedIp ||
      cfConnectingIp ||
      realIp ||
      trueClientIp ||
      xClientIp ||
      fastlyClientIp ||
      expressIp ||
      remoteIp ||
      '127.0.0.1';

    // Normalize IPv6 localhost & mapped addresses
    let cleanIp = candidate;
    if (cleanIp.startsWith('::ffff:')) {
      cleanIp = cleanIp.replace('::ffff:', '');
    }
    if (cleanIp === '::1' || cleanIp === '0.0.0.0') {
      cleanIp = '127.0.0.1';
    }

    res.json({
      ip: cleanIp,
      forwarded: forwardedIp,
      remote: remoteIp,
      timestamp: new Date().toISOString(),
    });
  });

  // Source Code Download Endpoint (Full Repository Zip for GitHub / Vercel / External Hosting)
  app.get(["/api/download-source", "/download-source.zip", "/voiceflow360-source.zip"], (_req, res) => {
    const candidatePaths = [
      path.join(process.cwd(), 'voiceflow360-source.zip'),
      path.join(process.cwd(), 'public', 'voiceflow360-source.zip'),
      path.join(process.cwd(), 'dist', 'voiceflow360-source.zip'),
    ];

    for (const zipPath of candidatePaths) {
      if (fs.existsSync(zipPath)) {
        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', 'attachment; filename="voiceflow360-source.zip"');
        return res.sendFile(zipPath);
      }
    }

    return res.status(404).json({ error: 'Source archive not found. Please run packaging.' });
  });

  // Google AdSense Authorized Digital Sellers (ads.txt)
  const adsTxtContent = "google.com, pub-2513423020167554, DIRECT, f08c47fec0942fa0\ngoogle.com, pub-9382580390401269, DIRECT, f08c47fec0942fa0\n";
  app.all(["/ads.txt", "/ads.txt/", "/app-ads.txt"], (_req, res) => {
    res.header("Content-Type", "text/plain; charset=utf-8");
    res.header("Cache-Control", "public, max-age=86400");
    res.header("Access-Control-Allow-Origin", "*");
    res.send(adsTxtContent);
  });

  // Dynamic SEO Robots.txt
  app.get("/robots.txt", (req, res) => {
    const robotsContent = `# Robots.txt for Voice Flow 360
User-agent: Mediapartners-Google
Allow: /

User-agent: Google-adstxt
Allow: /

User-agent: *
Allow: /ads.txt
Allow: /
Allow: /about
Allow: /360-earning
Allow: /how-to-earn
Allow: /for-brands
Allow: /start-earning
Allow: /surveys
Allow: /quizzes
Allow: /my-earnings
Allow: /brands
Allow: /brands/*
Allow: /brand-insights
Allow: /brand-insights/*
Allow: /brand-research-studies
Allow: /brand-research-studies/*
Allow: /research-methodology
Allow: /research-methodology/*
Allow: /rewards-and-withdrawals
Allow: /product-reviews
Allow: /public-product-reviews
Allow: /news
Allow: /referrals
Allow: /faq
Allow: /privacy
Allow: /terms
Allow: /contact
Allow: /sitemap-directory
Allow: /sitemap.xml
Allow: /sitemap

Disallow: /admin
Disallow: /api/

Sitemap: https://voiceflow360.com/sitemap.xml
`;
    res.header('Content-Type', 'text/plain; charset=utf-8');
    res.header('Cache-Control', 'public, max-age=86400');
    res.send(robotsContent);
  });

  // Comprehensive XML Sitemap for Google Search Console and Search Engines
  // Intercepts /sitemap.xml, /sitemap, /sitemap/, /sitemaps.xml, /sitemap_index.xml, and /sitemap.xml/
  // Ensuring Google Search Console NEVER encounters an HTML SPA page or non-production domain
  const sitemapPaths = [
    "/sitemap.xml",
    "/sitemap",
    "/sitemap/",
    "/sitemaps.xml",
    "/sitemap_index.xml",
    "/sitemap.xml/",
  ];

  app.all(sitemapPaths, (req, res) => {
    // Canonical production domain for Google Search Console verification & indexing
    const baseUrl = 'https://voiceflow360.com';

    const staticRoutes = [
      { path: '/', priority: '1.0', changefreq: 'daily' },
      { path: '/about', priority: '0.9', changefreq: 'weekly' },
      { path: '/start-earning', priority: '0.95', changefreq: 'hourly' },
      { path: '/360-earning', priority: '0.9', changefreq: 'daily' },
      { path: '/how-to-earn', priority: '0.85', changefreq: 'weekly' },
      { path: '/for-brands', priority: '0.9', changefreq: 'weekly' },
      { path: '/surveys', priority: '0.9', changefreq: 'hourly' },
      { path: '/quizzes', priority: '0.85', changefreq: 'daily' },
      { path: '/my-earnings', priority: '0.8', changefreq: 'daily' },
      { path: '/brands', priority: '0.85', changefreq: 'daily' },
      { path: '/brand-insights', priority: '0.85', changefreq: 'daily' },
      { path: '/news', priority: '0.75', changefreq: 'weekly' },
      { path: '/referrals', priority: '0.7', changefreq: 'weekly' },
      { path: '/faq', priority: '0.8', changefreq: 'weekly' },
      { path: '/privacy', priority: '0.5', changefreq: 'monthly' },
      { path: '/terms', priority: '0.5', changefreq: 'monthly' },
      { path: '/contact', priority: '0.6', changefreq: 'monthly' },
      { path: '/rewards-and-withdrawals', priority: '0.8', changefreq: 'weekly' },
      { path: '/research-methodology', priority: '0.8', changefreq: 'weekly' },
      { path: '/brand-research-studies', priority: '0.85', changefreq: 'daily' },
      { path: '/product-reviews', priority: '0.85', changefreq: 'daily' },
      { path: '/sitemap-directory', priority: '0.7', changefreq: 'weekly' },
    ];

    // All 30 Dedicated In-Depth SEO Brand Research Study Pages
    const brandStudyPaths = [
      "/brand-insights/sony-playstation-user-research-study",
      "/brand-insights/nintendo-user-research-study",
      "/brand-insights/valve-steam-user-research-study",
      "/brand-insights/microsoft-xbox-user-research-study",
      "/brand-insights/epic-games-user-research-study",
      "/brand-insights/riot-games-user-research-study",
      "/brand-insights/roblox-corporation-user-research-study",
      "/brand-insights/blizzard-entertainment-user-research-study",
      "/brand-insights/ea-sports-user-research-study",
      "/brand-insights/rockstar-games-user-research-study",
      "/brand-insights/ubisoft-connect-user-research-study",
      "/brand-insights/cd-projekt-red-user-research-study",
      "/brand-insights/capcom-user-research-study",
      "/brand-insights/square-enix-user-research-study",
      "/brand-insights/apple-user-research-study",
      "/brand-insights/samsung-electronics-user-research-study",
      "/brand-insights/google-pixel-user-research-study",
      "/brand-insights/microsoft-surface-user-research-study",
      "/brand-insights/bose-user-research-study",
      "/brand-insights/sony-audio-cameras-user-research-study",
      "/brand-insights/dji-drones-gimbals-user-research-study",
      "/brand-insights/logitech-g-mx-user-research-study",
      "/brand-insights/razer-user-research-study",
      "/brand-insights/openai-chatgpt-user-research-study",
      "/brand-insights/notion-user-research-study",
      "/brand-insights/figma-user-research-study",
      "/brand-insights/discord-user-research-study",
      "/brand-insights/dell-technologies-user-research-study",
      "/brand-insights/asus-rog-user-research-study",
      "/brand-insights/unity-technologies-user-research-study",
    ];

    // All 100 Partner Consumer Brands
    const all100BrandIds = [
      "br_playstation", "br_nintendo", "br_steam", "br_xbox", "br_epicgames",
      "br_riotgames", "br_roblox", "br_blizzard", "br_ea_sports", "br_rockstar",
      "br_ubisoft", "br_cdprojekt", "br_capcom", "br_square_enix", "br_unity",
      "br_apple", "br_samsung", "br_google_pixel", "br_microsoft_surface", "br_dell",
      "br_asus_rog", "br_lenovo", "br_hp", "br_sony_electronics", "br_lg_oled",
      "br_bose", "br_gopro", "br_dji", "br_logitech", "br_razer",
      "br_openai", "br_notion", "br_figma", "br_canva", "br_discord",
      "br_slack", "br_zoom", "br_github", "br_duolingo", "br_grammarly",
      "br_adobe", "br_dropbox", "br_spotify", "br_netflix", "br_youtube_premium",
      "br_starbucks", "br_mcdonalds", "br_chipotle", "br_dominos", "br_subway",
      "br_cocacola", "br_pepsi", "br_redbull", "br_nespresso", "br_oatly",
      "br_dunkin", "br_shakeshack", "br_tacobell", "br_beyondmeat", "br_benandjerrys",
      "br_nike", "br_adidas", "br_lululemon", "br_zara", "br_hm",
      "br_uniqlo", "br_gymshark", "br_patagonia", "br_levis", "br_underarmour",
      "br_tesla", "br_porsche", "br_bmw", "br_mercedes", "br_toyota",
      "br_hyundai_ev", "br_ford", "br_rivian", "br_lucid", "br_volvo",
      "br_airbnb", "br_uber", "br_lyft", "br_booking", "br_delta",
      "br_marriott", "br_expedia", "br_hilton", "br_emirates", "br_doordash",
      "br_amazon", "br_shopify", "br_target", "br_walmart", "br_ebay",
      "br_etsy", "br_bestbuy", "br_sephora", "br_ikea", "br_costco",
    ];

    const today = new Date().toISOString().split('T')[0];

    const urlsXml = [
      ...staticRoutes.map(r => `  <url>
    <loc>${baseUrl}${r.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
  </url>`),
      ...brandStudyPaths.map(studyPath => `  <url>
    <loc>${baseUrl}${studyPath}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.85</priority>
  </url>`),
      ...all100BrandIds.map(bId => `  <url>
    <loc>${baseUrl}/brands/${bId}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.75</priority>
  </url>`)
    ].join('\n');

    const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlsXml}
</urlset>`;

    res.header('Content-Type', 'application/xml; charset=utf-8');
    res.header('X-Content-Type-Options', 'nosniff');
    res.header('X-Robots-Tag', 'noindex, follow');
    res.header('Cache-Control', 'public, max-age=3600, s-maxage=3600');
    res.send(sitemapXml);
  });

  app.post("/api/generate-questions", async (req, res) => {
    const { brandName, brandUrl, numberOfQuestions = 5 } = req.body;

    if (!brandName || !brandName.trim()) {
      return res.status(400).json({ error: "Brand Name is required" });
    }

    const cleanName = brandName.trim();
    const cleanUrl = brandUrl ? brandUrl.trim() : `https://www.${cleanName.toLowerCase().replace(/\s+/g, '')}.com`;
    // Allow up to 20 questions as requested by user
    const qCount = Math.max(1, Math.min(Number(numberOfQuestions) || 5, 20));

    // 1. Fetch live brand website data
    const webData = await fetchBrandWebsiteData(cleanUrl);

    const ai = getAIClient();

    // If Gemini client is available, attempt single consolidated AI generation with live website grounding
    if (ai) {
      try {
        let websiteContext = "";
        if (webData.success) {
          websiteContext = `
LIVE WEBSITE DATA FETCHED FROM ${webData.url}:
- Page Title: ${webData.title || 'N/A'}
- Meta Description: ${webData.metaDescription || 'N/A'}
- Key Headings / Sections: ${webData.headings?.join(', ') || 'N/A'}
- Extracted Page Content & Product Highlights: ${webData.snippet?.slice(0, 2000) || 'N/A'}
`;
        } else {
          websiteContext = `Target Website: ${cleanUrl} (crawl protected or domain root, analyze based on brand identity, market reputation, and core offerings).`;
        }

        const prompt = `You are an expert consumer research and product intelligence survey director.
Brand Name: "${cleanName}"
Target Website: "${cleanUrl}"
${websiteContext}

Instructions:
1. Write a 1-2 sentence description for a consumer survey campaign for "${cleanName}", reflecting their specific product lines, website experience, or service value proposition.
2. Generate exactly ${qCount} diverse, deeply personalized survey questions tailored to "${cleanName}" and the information discovered from their website.
- Ranging up to ${qCount} questions.
- Question types must be one of: 'rating', 'single_choice', 'scale', 'yes_no', 'text'.
- For 'single_choice', supply 3 to 4 realistic, brand-specific option choices.
- For 'scale', provide scaleMin (1), scaleMax (10), scaleMinLabel, scaleMaxLabel.
- Provide a balanced mix: satisfaction ratings, product feature evaluations, checkout/website usability, NPS recommendation scale, and qualitative open-ended suggestions.
Return strictly valid JSON according to schema.`;

        const responseSchema = {
          type: Type.OBJECT,
          properties: {
            description: {
              type: Type.STRING,
              description: "Short 1-2 sentence description of the survey campaign",
            },
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  text: {
                    type: Type.STRING,
                    description: "The question prompt text",
                  },
                  type: {
                    type: Type.STRING,
                    description: "Question type: 'rating', 'single_choice', 'scale', 'yes_no', 'text'",
                  },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "Options for single_choice or yes_no",
                  },
                },
                required: ["text", "type"],
              },
            },
          },
          required: ["description", "questions"],
        };

        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema,
          },
        });

        if (response.text) {
          const parsed = JSON.parse(response.text.trim());
          if (parsed && Array.isArray(parsed.questions) && parsed.questions.length > 0) {
            const formattedQuestions = parsed.questions.slice(0, qCount).map((q: any, index: number) => ({
              id: `q_ai_${Date.now()}_${index + 1}`,
              text: q.text,
              type: q.type || 'text',
              options: q.options || (q.type === 'yes_no' ? ['Yes', 'No'] : undefined),
              required: true,
              order: index + 1,
            }));

            return res.json({
              description: parsed.description || `Customer experience feedback campaign for ${cleanName}.`,
              questions: formattedQuestions,
              source: 'gemini_ai',
              websiteInfo: {
                url: webData.url,
                title: webData.title || `${cleanName} Official Website`,
                metaDescription: webData.metaDescription,
                fetched: webData.success,
                headings: webData.headings,
              },
            });
          }
        }
      } catch (geminiError: any) {
        console.warn(
          `[Gemini Notice] Gemini generation fallback triggered (${geminiError?.status || geminiError?.message || 'Quota/Network'}). Serving smart survey generator.`
        );
      }
    }

    // Fallback: Generate intelligent brand survey seamlessly incorporating fetched website data
    const fallbackResult = generateFallbackBrandSurvey(cleanName, cleanUrl, qCount, webData);
    return res.json(fallbackResult);
  });

  // ==========================================
  // cPanel SMTP Email & Newsletter Dispatch Routes
  // ==========================================

  // 1. Get current SMTP configuration and connection status
  app.get("/api/email/smtp-status", async (_req, res) => {
    try {
      const config = await getSmtpConfigAsync();
      res.json(config);
    } catch (err: any) {
      res.status(500).json({ error: err?.message || "Failed to read SMTP status" });
    }
  });

  // 2. Perform live verification of cPanel SMTP connection
  app.post("/api/email/verify-smtp", async (_req, res) => {
    try {
      const verification = await verifySmtpConnection();
      res.json(verification);
    } catch (err: any) {
      res.status(500).json({ ok: false, message: err?.message || "Verification failed" });
    }
  });

  // 3. Send a test or live preview email to verify end-to-end delivery from cPanel
  app.post("/api/email/test-smtp", async (req, res) => {
    try {
      const { targetEmail, customOptions } = req.body;
      if (!targetEmail || typeof targetEmail !== "string") {
        return res.status(400).json({ success: false, error: "Please provide a valid targetEmail address." });
      }

      const result = await sendTestEmail(targetEmail.trim(), customOptions);
      if (result.success) {
        return res.json({
          success: true,
          message: `Email successfully sent to ${targetEmail} via cPanel SMTP!`,
          messageId: result.messageId,
        });
      } else {
        return res.status(500).json({
          success: false,
          error: result.error || "Failed to send email.",
        });
      }
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err?.message || "Unexpected error sending email" });
    }
  });

  // 4. Batch dispatch campaign or newsletter alert to subscribers
  app.post("/api/email/send-campaign", async (req, res) => {
    try {
      const {
        recipients,
        subject,
        htmlContent,
        textContent,
        campaignTitle,
        actionUrl,
        actionText,
        badge,
        subheadline,
        bonusCoins,
        featuredSurveys,
      } = req.body;

      if (!Array.isArray(recipients) || recipients.length === 0) {
        return res.status(400).json({ success: false, error: "Recipients list is required and must not be empty." });
      }
      if (!subject || typeof subject !== "string") {
        return res.status(400).json({ success: false, error: "Subject is required." });
      }
      if (!htmlContent || typeof htmlContent !== "string") {
        return res.status(400).json({ success: false, error: "htmlContent is required." });
      }

      const result = await sendBatchCampaign({
        recipients,
        subject,
        htmlContent,
        textContent,
        campaignTitle,
        actionUrl,
        actionText,
        badge,
        subheadline,
        bonusCoins,
        featuredSurveys,
      });

      return res.json(result);
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err?.message || "Campaign dispatch encountered an error" });
    }
  });

  // 5. Send automated welcome email to new subscriber
  app.post("/api/email/send-welcome", async (req, res) => {
    try {
      const { email, preferences } = req.body;
      if (!email || typeof email !== "string") {
        return res.status(400).json({ success: false, error: "Valid email is required." });
      }

      const result = await sendWelcomeSubscriberEmail(email.trim(), preferences);
      return res.json(result);
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err?.message || "Failed to send welcome email" });
    }
  });

  // 6. Send direct email to a single customer
  app.post("/api/email/send-single", async (req, res) => {
    try {
      const {
        toEmail,
        recipientName,
        subject,
        messageContent,
        actionUrl,
        actionText,
        headline,
        badge,
        bonusCoins,
        featuredSurveys,
      } = req.body;

      if (!toEmail || typeof toEmail !== "string" || !toEmail.includes("@")) {
        return res.status(400).json({ success: false, error: "Valid recipient email (toEmail) is required." });
      }
      if (!subject || typeof subject !== "string") {
        return res.status(400).json({ success: false, error: "Subject is required." });
      }
      if (!messageContent || typeof messageContent !== "string") {
        return res.status(400).json({ success: false, error: "messageContent is required." });
      }

      const result = await sendSingleCustomerEmail({
        toEmail: toEmail.trim(),
        recipientName,
        subject: subject.trim(),
        messageContent,
        actionUrl,
        actionText,
        headline,
        badge,
        bonusCoins,
        featuredSurveys,
      });

      if (result.success) {
        return res.json({
          success: true,
          message: `Direct email sent successfully to ${toEmail}!`,
          messageId: result.messageId,
        });
      } else {
        return res.status(500).json({
          success: false,
          error: result.error || "Failed to send email to recipient.",
        });
      }
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err?.message || "Failed to send single customer email." });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "custom",
    });
    app.use(vite.middlewares);

    app.get('*all', async (req, res, next) => {
      const url = req.originalUrl;
      // Skip API routes or static files with extensions other than html
      if (url.startsWith('/api/') || (req.path.includes('.') && !req.path.endsWith('.html'))) {
        return next();
      }
      try {
        const templatePath = path.resolve(process.cwd(), 'index.html');
        let template = await fs.promises.readFile(templatePath, 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        const seo = getPageSeoAndContent(req.path);
        const rendered = injectSeoAndContent(template, req.path);
        res.status(seo.is404 ? 404 : 200).set({ 'Content-Type': 'text/html; charset=utf-8' }).send(rendered);
      } catch (e: any) {
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath, { index: false }));
    app.get('*all', async (req, res, next) => {
      const url = req.originalUrl;
      if (url.startsWith('/api/') || (req.path.includes('.') && !req.path.endsWith('.html'))) {
        return next();
      }
      try {
        const cleanPath = req.path.replace(/^\/+/, '').replace(/\/+$/, '');
        const directFile = path.join(distPath, cleanPath, 'index.html');
        const altFile = path.join(distPath, `${cleanPath}.html`);

        if (cleanPath && fs.existsSync(directFile)) {
          return res.sendFile(directFile);
        }
        if (cleanPath && fs.existsSync(altFile)) {
          return res.sendFile(altFile);
        }

        const templatePath = path.join(distPath, 'index.html');
        const template = await fs.promises.readFile(templatePath, 'utf-8');
        const seo = getPageSeoAndContent(req.path);
        const rendered = injectSeoAndContent(template, req.path);
        res.status(seo.is404 ? 404 : 200).set({ 'Content-Type': 'text/html; charset=utf-8' }).send(rendered);
      } catch (err) {
        next(err);
      }
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
