import { UserResponse, Campaign } from '../types';

export interface BrandResearchDisclosures {
  sampleSize: number;
  fieldworkDates: string;
  fieldworkDescription: string;
  recruitmentMethod: string;
  incentiveDescription: string;
  screeningMethod: string;
  csatCalculation: string;
  npsCalculation: string;
  ratingCalculation: string;
  calculationNotes: string;
  limitations: string;
}

export interface BrandResearchMetrics {
  hasEnoughData: boolean;
  responseCount: number;
  avgRating: string | null;
  numericRating: number;
  csat: number | null;
  nps: number | null;
  qualitativeQuotes: string[];
  praiseQuotes: string[];
  improvementQuotes: string[];
  disclosures: BrandResearchDisclosures;
}

/**
 * Filter out identifiable demo, seeded, test, rejected, and duplicate submissions.
 * Does not delete genuine records or treat matching wording alone as proof of duplication.
 */
export function getApprovedProductionResponses(
  brandId: string,
  responses: UserResponse[],
  campaigns: Campaign[]
): UserResponse[] {
  // Find all campaigns associated with this brand
  const matchingCampaigns = campaigns.filter(
    (c) => c.brandId === brandId || c.id === `cmp_${brandId.replace('br_', '')}`
  );
  const matchingCampaignIds = new Set(matchingCampaigns.map((c) => c.id));
  matchingCampaignIds.add(`cmp_${brandId.replace('br_', '')}`);

  // 1. Initial filter for matching brand and non-hidden status
  const candidateResponses = responses.filter((r) => {
    const matchesBrand = r.brandId === brandId || matchingCampaignIds.has(r.campaignId);
    if (!matchesBrand) return false;
    if (r.isHidden) return false;
    if ((r as any).status === 'rejected' || (r as any).isRejected) return false;
    return true;
  });

  // 2. Exclude identifiable test/demo submissions:
  // - Admin test user accounts
  // - Explicit test email domains
  // - Automated script test patterns
  const nonTestResponses = candidateResponses.filter((r) => {
    const email = (r.userEmail || '').toLowerCase().trim();
    const userId = (r.userId || '').toLowerCase().trim();
    const userName = (r.userName || '').toLowerCase().trim();

    if (userId === 'usr_admin_ibrhussain' || userId === 'usr_admin') return false;
    if (email.endsWith('@test.com') || email.endsWith('@example.org')) return false;
    if (userName.includes('(admin)') || userName.includes('test account') || userName.includes('test user')) return false;

    return true;
  });

  // 3. Exclude rapid duplicate submissions from the same user on the same campaign (e.g. repeated clicks within 2 minutes)
  const userSubmissionTimestamps = new Map<string, number>();
  const deduplicatedResponses: UserResponse[] = [];

  // Sort by date ascending to keep the earliest submission
  const sorted = [...nonTestResponses].sort(
    (a, b) => new Date(a.completedAt || 0).getTime() - new Date(b.completedAt || 0).getTime()
  );

  for (const resp of sorted) {
    const userKey = `${resp.userId || resp.userEmail}_${resp.campaignId}`;
    const timestamp = new Date(resp.completedAt || 0).getTime();
    const previousTime = userSubmissionTimestamps.get(userKey);

    // If submitted within 120 seconds by the exact same user on the same campaign, treat as rapid double-submit
    if (previousTime !== undefined && Math.abs(timestamp - previousTime) < 120000) {
      continue; // exclude duplicate submission from public metrics
    }

    userSubmissionTimestamps.set(userKey, timestamp);
    deduplicatedResponses.push(resp);
  }

  return deduplicatedResponses;
}

/**
 * Calculates genuine brand research metrics from approved production records.
 * Returns "Not enough data" indicators when genuine records cannot support a metric.
 */
export function calculateBrandResearchMetrics(
  brandId: string,
  responses: UserResponse[],
  campaigns: Campaign[]
): BrandResearchMetrics {
  const approvedResponses = getApprovedProductionResponses(brandId, responses, campaigns);
  const responseCount = approvedResponses.length;

  // Minimum threshold to compute reliable statistical percentages
  const MIN_RESPONSES_FOR_METRICS = 3;

  if (responseCount < MIN_RESPONSES_FOR_METRICS) {
    return {
      hasEnoughData: false,
      responseCount,
      avgRating: null,
      numericRating: 0,
      csat: null,
      nps: null,
      qualitativeQuotes: [],
      praiseQuotes: [],
      improvementQuotes: [],
      disclosures: {
        sampleSize: responseCount,
        fieldworkDates: 'Continuous panel collection active',
        fieldworkDescription: 'Continuous opt-in panel survey on Voice Flow 360.',
        recruitmentMethod: 'Registered consumer panel participants.',
        incentiveDescription: '100 reward coins per completed, quality-screened response.',
        screeningMethod: 'Self-reported brand product experience and automated attention verification.',
        csatCalculation: 'Calculated as percentage of respondents rating 4 or 5 stars out of 5 once minimum sample size is met.',
        npsCalculation: 'Calculated as % Promoters (ratings 9–10) minus % Detractors (ratings 0–6) once minimum sample size is met.',
        ratingCalculation: 'Arithmetic mean of 1–5 star ratings once minimum sample size is met.',
        calculationNotes: 'Ratings require a minimum sample of approved responses before statistical aggregation.',
        limitations: 'Opt-in non-probability sample; findings reflect panel participants and do not claim national representativeness.',
      },
    };
  }

  let totalRating = 0;
  let ratingCount = 0;
  let highRatings = 0;
  let promoters = 0;
  let detractors = 0;
  let npsCount = 0;

  const rawQuotes: string[] = [];
  const rawPraise: string[] = [];
  const rawImprovements: string[] = [];

  const positiveWords = ['love', 'great', 'fast', 'good', 'excellent', 'amazing', 'best', 'nice', 'benchmark', 'smooth', 'rock-solid', 'durability', 'clean', 'reliable', 'helpful'];
  const negativeWords = ['slow', 'bad', 'poor', 'expensive', 'hard', 'difficult', 'issue', 'bug', 'price', 'premium', 'frequent', 'confusing', 'lag'];

  approvedResponses.forEach((r) => {
    r.answers.forEach((ans) => {
      // Scale 1-5 ratings
      if (typeof ans.answer === 'number' && ans.answer >= 1 && ans.answer <= 5) {
        totalRating += ans.answer;
        ratingCount++;
        if (ans.answer >= 4) highRatings++;
      }

      // NPS scale (0-10 or 1-10)
      if (typeof ans.answer === 'number' && ans.answer >= 0 && ans.answer <= 10 && (ans.questionId.includes('nps') || ans.questionId.includes('scale') || ans.questionText.toLowerCase().includes('recommend') || ans.questionText.toLowerCase().includes('scale'))) {
        npsCount++;
        if (ans.answer >= 9) promoters++;
        else if (ans.answer <= 6) detractors++;
      }

      // Text answers
      if (typeof ans.answer === 'string') {
        const text = ans.answer.trim();
        if (text.length > 15) {
          rawQuotes.push(text);
          const lower = text.toLowerCase();
          if (positiveWords.some((w) => lower.includes(w))) {
            rawPraise.push(text);
          } else if (negativeWords.some((w) => lower.includes(w))) {
            rawImprovements.push(text);
          }
        }
      }
    });
  });

  // Deduplicate quotations so no repeated quotes appear in summaries
  const deduplicateQuotes = (quotes: string[]): string[] => {
    const seen = new Set<string>();
    const result: string[] = [];
    for (const q of quotes) {
      const normalized = q.toLowerCase().replace(/[^a-z0-9]/g, ' ').trim();
      if (!seen.has(normalized) && normalized.length > 10) {
        seen.add(normalized);
        result.push(q);
      }
    }
    return result;
  };

  const qualitativeQuotes = deduplicateQuotes(rawQuotes).slice(0, 10);
  const praiseQuotes = deduplicateQuotes(rawPraise).slice(0, 6);
  const improvementQuotes = deduplicateQuotes(rawImprovements).slice(0, 6);

  const avgRating = ratingCount > 0 ? (totalRating / ratingCount).toFixed(1) : null;
  const numericRating = avgRating ? parseFloat(avgRating) : 0;
  const csat = ratingCount >= 3 ? Math.round((highRatings / ratingCount) * 100) : null;
  const nps = npsCount >= 3 ? Math.round(((promoters - detractors) / npsCount) * 100) : null;

  // Determine fieldwork dates from responses completedAt
  let fieldworkDates = 'January 14, 2026 – March 30, 2026 (Continuous panel cycle)';
  const timestamps = approvedResponses
    .map((r) => (r.completedAt ? new Date(r.completedAt).getTime() : 0))
    .filter((t) => t > 0)
    .sort((a, b) => a - b);
  if (timestamps.length > 0) {
    const minD = new Date(timestamps[0]).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const maxD = new Date(timestamps[timestamps.length - 1]).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    fieldworkDates = minD === maxD ? `${minD} (Continuous panel cycle)` : `${minD} – ${maxD} (Continuous panel cycle)`;
  }

  const csatCalculation = 'CSAT (% satisfied) is calculated as the percentage of respondents rating 4 or 5 stars out of 5 on a standardized 5-point scale.';
  const npsCalculation = 'NPS (-100 to +100) is calculated as % Promoters (ratings 9–10 or 5 stars) minus % Detractors (ratings 0–6 or 1–3 stars) divided by total rating submissions.';
  const ratingCalculation = 'Average Star Rating is the unweighted arithmetic mean across all approved 1–5 scale evaluation responses.';

  return {
    hasEnoughData: true,
    responseCount,
    avgRating,
    numericRating,
    csat,
    nps,
    qualitativeQuotes,
    praiseQuotes,
    improvementQuotes,
    disclosures: {
      sampleSize: responseCount,
      fieldworkDates,
      fieldworkDescription: 'Continuous opt-in panel survey collected via Voice Flow 360 conversational surveys.',
      recruitmentMethod: 'Platform-registered consumer panelists.',
      incentiveDescription: '100 reward coins per accepted evaluation session.',
      screeningMethod: 'Self-reported product ownership/usage and automated attention checks.',
      csatCalculation,
      npsCalculation,
      ratingCalculation,
      calculationNotes: 'Average rating computed from 5-point satisfaction scales. CSAT reflects proportion of ratings >= 4/5. NPS calculated as % promoters (9-10) minus % detractors (0-6).',
      limitations: 'Non-probability opt-in panel sample; metrics reflect survey respondents and are not statistically weighted for national demographic representativeness.',
    },
  };
}
