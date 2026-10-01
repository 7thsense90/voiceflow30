import { UserResponse, User } from '../../types';
import { getLiveResponses, getLiveUsers } from './liveDataStore';

/**
 * Below this many real, non-hidden completed responses for a brand, we do not
 * publish brand-specific CSAT/NPS/geography numbers. Small samples swing
 * wildly with each new answer and would just be a smaller-scale version of
 * the fabricated-stats problem this replaces. Raise this over time as real
 * response volume grows.
 */
export const MIN_RESPONSES_FOR_STATS = 30;

/** Minimum real responses from a single country before it gets its own
 * slice in the geographic breakdown; everything else is folded into "Other". */
const MIN_COUNTRY_RESPONSES = 3;

export interface RealQuote {
  text: string;
}

export interface RealGeographicSlice {
  region: string;
  count: number;
  sharePercentage: number;
}

export interface RealBrandStats {
  brandId: string;
  sampleSize: number;
  hasEnoughData: boolean; // sampleSize >= MIN_RESPONSES_FOR_STATS
  avgStarRating: number | null; // out of 5, one decimal
  csatScore: number | null; // % of star-rating answers that were 4-5 stars
  npsScore: number | null; // -100..+100, from 1-10 scale answers
  npsSampleSize: number; // how many scale answers fed the NPS calc
  yesRate: number | null; // % of yes/no answers that were "Yes"
  realQuotes: RealQuote[]; // real free-text answers, most recent first
  geography: RealGeographicSlice[]; // real country distribution, real users only
}

function parseStarRating(answer: unknown): number | null {
  if (typeof answer !== 'string') return null;
  const match = answer.match(/^(\d)\s*Stars?$/i);
  if (!match) return null;
  const n = parseInt(match[1], 10);
  return n >= 1 && n <= 5 ? n : null;
}

function isScaleAnswer(answer: unknown): answer is number {
  return typeof answer === 'number' && answer >= 0 && answer <= 10;
}

function isYesNoAnswer(answer: unknown): answer is 'Yes' | 'No' {
  return answer === 'Yes' || answer === 'No';
}

function isLikelyFreeText(answer: unknown): answer is string {
  if (typeof answer !== 'string') return false;
  if (parseStarRating(answer) !== null) return false;
  if (answer === 'Yes' || answer === 'No') return false;
  // Real free-text responses worth quoting are reasonably substantive.
  return answer.trim().length >= 15;
}

/**
 * Computes real, honest statistics for a brand from actual completed survey
 * responses. Returns null only if there is no live data connection yet
 * (e.g. still loading). Otherwise always returns a stats object; check
 * `hasEnoughData` before showing brand-specific percentages.
 */
export function getRealBrandStats(brandId: string): RealBrandStats {
  const allResponses: UserResponse[] = getLiveResponses();
  const allUsers: User[] = getLiveUsers();

  const usersById = new Map<string, User>();
  for (const u of allUsers) usersById.set(u.id, u);

  const brandResponses = allResponses.filter(
    (r) => r.brandId === brandId && !r.isHidden
  );

  const sampleSize = brandResponses.length;
  const hasEnoughData = sampleSize >= MIN_RESPONSES_FOR_STATS;

  // --- Star ratings -> avg rating + CSAT (% giving 4-5 stars, top-box) ---
  const starValues: number[] = [];
  // --- Scale (1-10) answers -> NPS ---
  const scaleValues: number[] = [];
  // --- Yes/No answers ---
  let yesCount = 0;
  let yesNoTotal = 0;
  // --- Free text answers worth quoting ---
  const quotes: { text: string; completedAt: string }[] = [];
  // --- Real geography from real users who actually responded ---
  const countryCounts = new Map<string, number>();

  for (const response of brandResponses) {
    const user = usersById.get(response.userId);
    if (user?.country && user.country.trim()) {
      const c = user.country.trim();
      countryCounts.set(c, (countryCounts.get(c) || 0) + 1);
    }

    for (const a of response.answers) {
      const star = parseStarRating(a.answer);
      if (star !== null) {
        starValues.push(star);
        continue;
      }
      if (isScaleAnswer(a.answer)) {
        scaleValues.push(a.answer);
        continue;
      }
      if (isYesNoAnswer(a.answer)) {
        yesNoTotal += 1;
        if (a.answer === 'Yes') yesCount += 1;
        continue;
      }
      if (isLikelyFreeText(a.answer)) {
        quotes.push({ text: a.answer.trim(), completedAt: response.completedAt });
      }
    }
  }

  const avgStarRating =
    starValues.length > 0
      ? Math.round((starValues.reduce((s, v) => s + v, 0) / starValues.length) * 10) / 10
      : null;

  const csatScore =
    starValues.length > 0
      ? Math.round((starValues.filter((v) => v >= 4).length / starValues.length) * 100)
      : null;

  let npsScore: number | null = null;
  if (scaleValues.length > 0) {
    const promoters = scaleValues.filter((v) => v >= 9).length;
    const detractors = scaleValues.filter((v) => v <= 6).length;
    npsScore = Math.round(((promoters - detractors) / scaleValues.length) * 100);
  }

  const yesRate = yesNoTotal > 0 ? Math.round((yesCount / yesNoTotal) * 100) : null;

  const realQuotes: RealQuote[] = quotes
    .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
    .slice(0, 6)
    .map((q) => ({ text: q.text }));

  // Build geography, folding low-count countries into "Other"
  const geoEntries = Array.from(countryCounts.entries());
  const totalWithCountry = geoEntries.reduce((s, [, c]) => s + c, 0);
  let otherCount = 0;
  const geography: RealGeographicSlice[] = [];
  for (const [country, count] of geoEntries.sort((a, b) => b[1] - a[1])) {
    if (count >= MIN_COUNTRY_RESPONSES) {
      geography.push({
        region: country,
        count,
        sharePercentage: totalWithCountry > 0 ? Math.round((count / totalWithCountry) * 100) : 0,
      });
    } else {
      otherCount += count;
    }
  }
  if (otherCount > 0 && totalWithCountry > 0) {
    geography.push({
      region: 'Other',
      count: otherCount,
      sharePercentage: Math.round((otherCount / totalWithCountry) * 100),
    });
  }

  return {
    brandId,
    sampleSize,
    hasEnoughData,
    avgStarRating,
    csatScore,
    npsScore,
    npsSampleSize: scaleValues.length,
    yesRate,
    realQuotes,
    geography,
  };
}
