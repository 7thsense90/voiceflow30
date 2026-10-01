import { Campaign, Question } from '../types';
import { RAW_100_BRANDS, BrandMeta } from './brandsData';
import { getQuestionsForBrand } from './brandSurveyQuestions';

export function buildCampaignForBrand(brand: BrandMeta, index: number): Campaign {
  const brandClean = brand.name.replace(/\s*\(.*?\)\s*/g, '');
  const rawQuestions = getQuestionsForBrand(brand.id, brand.name, brand.sector, brand.keyProduct);

  const questions: Question[] = rawQuestions.map((q, idx) => ({
    ...q,
    id: `q_${brand.id}_${idx + 1}`,
    order: idx + 1,
  }));

  return {
    id: `cmp_${brand.id.replace('br_', '')}`,
    title: `${brandClean}: ${brand.sector} Feedback & ${brand.keyProduct} Survey`,
    description: `Share your direct feedback on ${brandClean} (${brand.sector}). Evaluate your satisfaction with ${brand.keyProduct}, review core features, and earn 100 reward coins.`,
    category: brand.category,
    targetAudience: `Consumers, gamers, and professionals who use ${brandClean} or shop in the ${brand.sector} category.`,
    estimatedMinutes: 3,
    rewardCoins: 100, // 100 coins per survey
    status: 'active',
    createdAt: new Date(Date.now() - (index * 86400000 * 2)).toISOString(),
    completedCount: 20, // 20 responses per survey
    icon: brand.icon,
    brandId: brand.id,
    questions,
  };
}

export const INITIAL_CAMPAIGNS_100: Campaign[] = RAW_100_BRANDS.map((b, idx) =>
  buildCampaignForBrand(b, idx)
);
