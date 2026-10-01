export interface DemographicSegment {
  label: string;
  percentage: number;
  description?: string;
}

export interface GeographicRegion {
  region: string;
  sharePercentage: number;
  keyMarkets: string;
  growthTrend: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface BrandSEOArticle {
  brandId: string;
  brandName: string;
  slug: string;
  metaTitle: string;
  metaDescription: string;
  targetKeywords: string[];
  readingTimeMinutes: number;
  wordCount: number;
  publishDate: string;
  lastUpdated: string;
  author: {
    name: string;
    role: string;
    organization: string;
  };
  executiveSummary: string;
  keyMetrics: {
    customerSatisfactionScore: number; // e.g. 92 (%)
    npsScore: number; // e.g. +71
    sentimentScore: number; // e.g. 94 (%)
    positiveSentiment: number; // e.g. 88 (%)
    neutralSentiment: number; // e.g. 8 (%)
    negativeSentiment: number; // e.g. 4 (%)
    verifiedResponsesAnalyzed: number;
    globalMarketRank: string;
  };
  demographicBreakdown: {
    ageGroups: DemographicSegment[];
    genderSplit: DemographicSegment[];
    incomeTiers: DemographicSegment[];
    primaryPersonas: string[];
  };
  geographicSegregation: {
    regions: GeographicRegion[];
    dominantTerritory: string;
    fastestGrowingRegion: string;
  };
  brandPerception: {
    whatPeopleSay: string[];
    whatPeopleFeel: string[];
    whatPeopleThink: string[];
    emotionalConnectionRating: number; // out of 100
    brandTrustScore: number; // out of 100
  };
  productsServicesReview: {
    flagshipProduct: string;
    summary: string;
    keyStrengths: string[];
    userExperienceScore: number; // out of 10
  };
  swotAnalysis: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
  suggestedImprovements: {
    immediatePriorities: string[];
    longTermStrategicMoves: string[];
  };
  creativeOutlook: {
    aiIntegration: string;
    ecosystemEvolution: string;
    nextGenConsumerTrends: string;
  };
  faqs: FaqItem[];
  fullArticleMarkdown: string;
}
