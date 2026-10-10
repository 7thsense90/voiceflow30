import { BrandSEOArticle } from './types';
import { playstationArticle } from './playstationArticle';
import { nintendoArticle } from './nintendoArticle';
import { steamArticle } from './steamArticle';
import { xboxArticle } from './xboxArticle';
import { epicGamesArticle } from './epicGamesArticle';
import { riotGamesArticle } from './riotGamesArticle';
import { robloxArticle } from './robloxArticle';
import { blizzardArticle } from './blizzardArticle';
import { eaSportsArticle } from './eaSportsArticle';
import { rockstarArticle } from './rockstarArticle';

// --- 20 Extended Brand Articles ---
import {
  ubisoftArticle,
  cdprojektArticle,
  capcomArticle,
  squareEnixArticle,
} from './gamingExtendedArticles';
import {
  appleArticle,
  samsungArticle,
  googlePixelArticle,
  microsoftSurfaceArticle,
} from './hardwareMobileArticles';
import {
  boseArticle,
  sonyElectronicsArticle,
  djiArticle,
  logitechArticle,
  razerArticle,
} from './peripheralsAudioArticles';
import {
  openAiArticle,
  notionArticle,
  figmaArticle,
  discordArticle,
} from './saasAiArticles';
import {
  dellArticle,
  asusRogArticle,
  unityArticle,
} from './techFinalArticles';

import {
  generateBrandSEOArticle,
  getPublishedBrandArticles,
  findBrandBySlugOrId,
  slugifyBrandName,
} from './dynamicGenerator';

export * from './types';
export { generateBrandSEOArticle, getPublishedBrandArticles, findBrandBySlugOrId, slugifyBrandName };
export {
  playstationArticle,
  nintendoArticle,
  steamArticle,
  xboxArticle,
  epicGamesArticle,
  riotGamesArticle,
  robloxArticle,
  blizzardArticle,
  eaSportsArticle,
  rockstarArticle,
  // 20 Extended Brands
  ubisoftArticle,
  cdprojektArticle,
  capcomArticle,
  squareEnixArticle,
  appleArticle,
  samsungArticle,
  googlePixelArticle,
  microsoftSurfaceArticle,
  boseArticle,
  sonyElectronicsArticle,
  djiArticle,
  logitechArticle,
  razerArticle,
  openAiArticle,
  notionArticle,
  figmaArticle,
  discordArticle,
  dellArticle,
  asusRogArticle,
  unityArticle,
};

export const FEATURED_BRAND_ARTICLES: BrandSEOArticle[] = [
  playstationArticle,
  nintendoArticle,
  steamArticle,
  xboxArticle,
  epicGamesArticle,
  riotGamesArticle,
  robloxArticle,
  blizzardArticle,
  eaSportsArticle,
  rockstarArticle,
  // 20 Extended Brands
  ubisoftArticle,
  cdprojektArticle,
  capcomArticle,
  squareEnixArticle,
  appleArticle,
  samsungArticle,
  googlePixelArticle,
  microsoftSurfaceArticle,
  boseArticle,
  sonyElectronicsArticle,
  djiArticle,
  logitechArticle,
  razerArticle,
  openAiArticle,
  notionArticle,
  figmaArticle,
  discordArticle,
  dellArticle,
  asusRogArticle,
  unityArticle,
];

export const BRAND_ARTICLES_MAP: Record<string, BrandSEOArticle> = {
  [playstationArticle.brandId]: playstationArticle,
  [nintendoArticle.brandId]: nintendoArticle,
  [steamArticle.brandId]: steamArticle,
  [xboxArticle.brandId]: xboxArticle,
  [epicGamesArticle.brandId]: epicGamesArticle,
  [riotGamesArticle.brandId]: riotGamesArticle,
  [robloxArticle.brandId]: robloxArticle,
  [blizzardArticle.brandId]: blizzardArticle,
  [eaSportsArticle.brandId]: eaSportsArticle,
  [rockstarArticle.brandId]: rockstarArticle,
  // 20 Extended Brands
  [ubisoftArticle.brandId]: ubisoftArticle,
  [cdprojektArticle.brandId]: cdprojektArticle,
  [capcomArticle.brandId]: capcomArticle,
  [squareEnixArticle.brandId]: squareEnixArticle,
  [appleArticle.brandId]: appleArticle,
  [samsungArticle.brandId]: samsungArticle,
  [googlePixelArticle.brandId]: googlePixelArticle,
  [microsoftSurfaceArticle.brandId]: microsoftSurfaceArticle,
  [boseArticle.brandId]: boseArticle,
  [sonyElectronicsArticle.brandId]: sonyElectronicsArticle,
  [djiArticle.brandId]: djiArticle,
  [logitechArticle.brandId]: logitechArticle,
  [razerArticle.brandId]: razerArticle,
  [openAiArticle.brandId]: openAiArticle,
  [notionArticle.brandId]: notionArticle,
  [figmaArticle.brandId]: figmaArticle,
  [discordArticle.brandId]: discordArticle,
  [dellArticle.brandId]: dellArticle,
  [asusRogArticle.brandId]: asusRogArticle,
  [unityArticle.brandId]: unityArticle,
};

/**
 * Dedicated Canonical SEO Paths for Brand User Research Studies
 * Each follows the high-converting keyword pattern: /brand-insights/[brand-name]-user-research-study
 */
export const BRAND_STUDY_PATHS: Record<string, string> = {
  br_playstation: '/brand-insights/sony-playstation-user-research-study',
  br_nintendo: '/brand-insights/nintendo-user-research-study',
  br_steam: '/brand-insights/valve-steam-user-research-study',
  br_xbox: '/brand-insights/microsoft-xbox-user-research-study',
  br_epicgames: '/brand-insights/epic-games-user-research-study',
  br_riotgames: '/brand-insights/riot-games-user-research-study',
  br_roblox: '/brand-insights/roblox-corporation-user-research-study',
  br_blizzard: '/brand-insights/blizzard-entertainment-user-research-study',
  br_easports: '/brand-insights/ea-sports-user-research-study',
  br_rockstargames: '/brand-insights/rockstar-games-user-research-study',
  // 20 Extended Brands
  br_ubisoft: '/brand-insights/ubisoft-connect-user-research-study',
  br_cdprojekt: '/brand-insights/cd-projekt-red-user-research-study',
  br_capcom: '/brand-insights/capcom-user-research-study',
  br_square_enix: '/brand-insights/square-enix-user-research-study',
  br_apple: '/brand-insights/apple-user-research-study',
  br_samsung: '/brand-insights/samsung-electronics-user-research-study',
  br_google_pixel: '/brand-insights/google-pixel-user-research-study',
  br_microsoft_surface: '/brand-insights/microsoft-surface-user-research-study',
  br_bose: '/brand-insights/bose-user-research-study',
  br_sony_electronics: '/brand-insights/sony-audio-cameras-user-research-study',
  br_dji: '/brand-insights/dji-drones-gimbals-user-research-study',
  br_logitech: '/brand-insights/logitech-g-mx-user-research-study',
  br_razer: '/brand-insights/razer-user-research-study',
  br_openai: '/brand-insights/openai-chatgpt-user-research-study',
  br_notion: '/brand-insights/notion-user-research-study',
  br_figma: '/brand-insights/figma-user-research-study',
  br_discord: '/brand-insights/discord-user-research-study',
  br_dell: '/brand-insights/dell-technologies-user-research-study',
  br_asus_rog: '/brand-insights/asus-rog-user-research-study',
  br_unity: '/brand-insights/unity-technologies-user-research-study',
};

/**
 * Common slug aliases for flexible routing and maximum Google crawl compatibility
 */
export const BRAND_STUDY_ALIASES: Record<string, string> = {
  'playstation-user-research-study': 'br_playstation',
  'sony-playstation-user-research-study': 'br_playstation',
  'sony-playstation': 'br_playstation',
  'nintendo-user-research-study': 'br_nintendo',
  'nintendo': 'br_nintendo',
  'valve-steam-user-research-study': 'br_steam',
  'steam-user-research-study': 'br_steam',
  'steam': 'br_steam',
  'microsoft-xbox-user-research-study': 'br_xbox',
  'xbox-user-research-study': 'br_xbox',
  'xbox': 'br_xbox',
  'epic-games-user-research-study': 'br_epicgames',
  'epicgames-user-research-study': 'br_epicgames',
  'epic-games': 'br_epicgames',
  'riot-games-user-research-study': 'br_riotgames',
  'riotgames-user-research-study': 'br_riotgames',
  'riot-games': 'br_riotgames',
  'roblox-corporation-user-research-study': 'br_roblox',
  'roblox-user-research-study': 'br_roblox',
  'roblox': 'br_roblox',
  'blizzard-entertainment-user-research-study': 'br_blizzard',
  'blizzard-user-research-study': 'br_blizzard',
  'blizzard': 'br_blizzard',
  'ea-sports-user-research-study': 'br_easports',
  'easports-user-research-study': 'br_easports',
  'ea-sports': 'br_easports',
  'rockstar-games-user-research-study': 'br_rockstargames',
  'rockstargames-user-research-study': 'br_rockstargames',
  'rockstar-games': 'br_rockstargames',
  // 20 Extended Brands Aliases
  'ubisoft-user-research-study': 'br_ubisoft',
  'ubisoft-connect-user-research-study': 'br_ubisoft',
  'ubisoft': 'br_ubisoft',
  'cd-projekt-red-user-research-study': 'br_cdprojekt',
  'cdprojekt-user-research-study': 'br_cdprojekt',
  'cd-projekt-red': 'br_cdprojekt',
  'cd-projekt': 'br_cdprojekt',
  'capcom-user-research-study': 'br_capcom',
  'capcom': 'br_capcom',
  'square-enix-user-research-study': 'br_square_enix',
  'squareenix-user-research-study': 'br_square_enix',
  'square-enix': 'br_square_enix',
  'apple-watch-series-12': 'br_apple',
  'apple-watch-series-12-analysis': 'br_apple',
  'apple-watch-series-12-consumer-research-study': 'br_apple',
  'apple-watch-series-12-user-research-study': 'br_apple',
  'apple-watch-series-10': 'br_apple',
  'apple-watch': 'br_apple',
  'apple-iphone-intelligence-macbook-consumer-research-study': 'br_apple',
  'apple-user-research-study': 'br_apple',
  'apple': 'br_apple',
  'samsung-user-research-study': 'br_samsung',
  'samsung-electronics-user-research-study': 'br_samsung',
  'samsung': 'br_samsung',
  'google-pixel-user-research-study': 'br_google_pixel',
  'pixel-user-research-study': 'br_google_pixel',
  'google-pixel': 'br_google_pixel',
  'microsoft-surface-user-research-study': 'br_microsoft_surface',
  'surface-user-research-study': 'br_microsoft_surface',
  'microsoft-surface': 'br_microsoft_surface',
  'bose-user-research-study': 'br_bose',
  'bose': 'br_bose',
  'sony-wh1000xm6': 'br_sony_electronics',
  'sony-wh-1000xm6': 'br_sony_electronics',
  'sony-xm6': 'br_sony_electronics',
  'sony-wh-1000xm6-user-research-study': 'br_sony_electronics',
  'sony-wh1000xm6-user-research-study': 'br_sony_electronics',
  'sony-wh-1000xm6-consumer-research-study': 'br_sony_electronics',
  'sony-xm6-user-research-study': 'br_sony_electronics',
  'sony-wh1000xm-alpha-cameras-consumer-research-study': 'br_sony_electronics',
  'sony-wh1000xm5': 'br_sony_electronics',
  'sony-wh-1000xm5': 'br_sony_electronics',
  'sony-1000x': 'br_sony_electronics',
  'sony-audio-cameras-user-research-study': 'br_sony_electronics',
  'sony-electronics-user-research-study': 'br_sony_electronics',
  'sony-electronics': 'br_sony_electronics',
  'dji-user-research-study': 'br_dji',
  'dji-drones-gimbals-user-research-study': 'br_dji',
  'dji': 'br_dji',
  'logitech-user-research-study': 'br_logitech',
  'logitech-g-mx-user-research-study': 'br_logitech',
  'logitech': 'br_logitech',
  'razer-user-research-study': 'br_razer',
  'razer': 'br_razer',
  'openai-user-research-study': 'br_openai',
  'openai-chatgpt-user-research-study': 'br_openai',
  'chatgpt-user-research-study': 'br_openai',
  'openai': 'br_openai',
  'notion-user-research-study': 'br_notion',
  'notion': 'br_notion',
  'figma-user-research-study': 'br_figma',
  'figma': 'br_figma',
  'discord-user-research-study': 'br_discord',
  'discord': 'br_discord',
  'dell-user-research-study': 'br_dell',
  'dell-technologies-user-research-study': 'br_dell',
  'dell': 'br_dell',
  'asus-rog-user-research-study': 'br_asus_rog',
  'rog-user-research-study': 'br_asus_rog',
  'asus-rog': 'br_asus_rog',
  'unity-user-research-study': 'br_unity',
  'unity-technologies-user-research-study': 'br_unity',
  'unity': 'br_unity',
};

/**
 * Returns the canonical dedicated URL for a brand's user research study.
 * Adjusted dynamically per brand to: /brand-insights/[brand-slug]-user-research-study
 */
export function getBrandStudyPath(brandIdOrArticle: string | BrandSEOArticle): string {
  const brandId = typeof brandIdOrArticle === 'string' ? brandIdOrArticle : brandIdOrArticle.brandId;
  if (BRAND_STUDY_PATHS[brandId]) {
    return BRAND_STUDY_PATHS[brandId];
  }
  const article = BRAND_ARTICLES_MAP[brandId];
  if (article) {
    const slugName = slugifyBrandName(article.brandName);
    return `/brand-insights/${slugName}-user-research-study`;
  }
  // Lookup any brand in the 100 brands directory
  const brandMeta = findBrandBySlugOrId(brandId);
  if (brandMeta) {
    const slugName = slugifyBrandName(brandMeta.name);
    return `/brand-insights/${slugName}-user-research-study`;
  }
  const cleanId = brandId.replace(/^br_/, '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
  return `/brand-insights/${cleanId}-user-research-study`;
}

/**
 * Resolves a BrandSEOArticle from a URL path, slug, or brand ID.
 */
export function findBrandArticleBySlugOrPath(param: string): BrandSEOArticle | undefined {
  if (!param) return undefined;
  const raw = param.trim().toLowerCase().replace(/^\/+/, '').replace(/\/+$/, '');
  const slug = raw.split('/').pop() || raw;

  // 1. Direct match on FEATURED_BRAND_ARTICLES by slug or brandId
  const directFeatured = FEATURED_BRAND_ARTICLES.find(
    (a) =>
      a.slug.toLowerCase() === slug ||
      a.brandId.toLowerCase() === slug ||
      a.brandId.toLowerCase().replace(/^br_/, '') === slug
  );
  if (directFeatured) return directFeatured;

  // 2. Alias lookup
  const aliasedBrandId = BRAND_STUDY_ALIASES[slug];
  if (aliasedBrandId) {
    if (BRAND_ARTICLES_MAP[aliasedBrandId]) {
      return BRAND_ARTICLES_MAP[aliasedBrandId];
    }
    const brandMeta = findBrandBySlugOrId(aliasedBrandId);
    if (brandMeta) {
      return BRAND_ARTICLES_MAP[brandMeta.id] || generateBrandSEOArticle(brandMeta);
    }
  }

  // 3. Exact legacy study path match
  for (const [bId, path] of Object.entries(BRAND_STUDY_PATHS)) {
    if (path.toLowerCase().endsWith(slug) || path.toLowerCase() === `/${raw}`) {
      if (BRAND_ARTICLES_MAP[bId]) {
        return BRAND_ARTICLES_MAP[bId];
      }
      const brandMeta = findBrandBySlugOrId(bId);
      if (brandMeta) {
        return BRAND_ARTICLES_MAP[brandMeta.id] || generateBrandSEOArticle(brandMeta);
      }
    }
  }

  // 4. Direct brandId map lookup
  if (BRAND_ARTICLES_MAP[slug]) return BRAND_ARTICLES_MAP[slug];
  if (BRAND_ARTICLES_MAP[`br_${slug}`]) return BRAND_ARTICLES_MAP[`br_${slug}`];

  // 5. Match by brand directory meta
  const brandMeta = findBrandBySlugOrId(slug);
  if (brandMeta) {
    if (BRAND_ARTICLES_MAP[brandMeta.id]) {
      return BRAND_ARTICLES_MAP[brandMeta.id];
    }
    return generateBrandSEOArticle(brandMeta);
  }

  return undefined;
}

export function getBrandArticle(brandId: string): BrandSEOArticle | undefined {
  if (!brandId) return undefined;
  if (BRAND_ARTICLES_MAP[brandId]) return BRAND_ARTICLES_MAP[brandId];
  if (BRAND_ARTICLES_MAP[`br_${brandId}`]) return BRAND_ARTICLES_MAP[`br_${brandId}`];

  const brandMeta = findBrandBySlugOrId(brandId);
  if (brandMeta) {
    if (BRAND_ARTICLES_MAP[brandMeta.id]) {
      return BRAND_ARTICLES_MAP[brandMeta.id];
    }
    const generated = generateBrandSEOArticle(brandMeta);
    if (generated) return generated;
  }
  return findBrandArticleBySlugOrPath(brandId);
}

export function hasBrandArticle(brandId: string): boolean {
  return Boolean(getBrandArticle(brandId));
}
