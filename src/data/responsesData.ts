import { UserResponse } from '../types';
import { RAW_100_BRANDS, BrandMeta } from './brandsData';
import { getQuestionsForBrand } from './brandSurveyQuestions';
import { BRAND_UNIQUE_INSIGHTS_MAP } from './brandUniqueInsights';
import { getBrandBenchmarkMetric, getReviewStarRating } from './brandBenchmarks';

const SAMPLE_USERS = [
  { name: 'Alex Rivera', email: 'alex.rivera@example.com' },
  { name: 'Sophia Chen', email: 'sophia.chen@example.com' },
  { name: 'Marcus Vance', email: 'marcus.v@example.com' },
  { name: 'Elena Rostova', email: 'elena.rostova@example.com' },
  { name: 'Liam O\'Connor', email: 'liam.oc@example.com' },
  { name: 'Zoe Martinez', email: 'zoe.m@example.com' },
  { name: 'David Kim', email: 'david.kim@example.com' },
  { name: 'Amara Okafor', email: 'amara.okafor@example.com' },
  { name: 'Lucas Dubois', email: 'lucas.d@example.com' },
  { name: 'Chloe Tanaka', email: 'chloe.tanaka@example.com' },
  { name: 'Jordan Patel', email: 'jordan.patel@example.com' },
  { name: 'Isabella Rossi', email: 'isabella.rossi@example.com' },
  { name: 'Noah Hansen', email: 'noah.hansen@example.com' },
  { name: 'Maya Lin', email: 'maya.lin@example.com' },
  { name: 'Gabriel Santos', email: 'gabriel.s@example.com' },
  { name: 'Hannah Wright', email: 'hannah.w@example.com' },
  { name: 'Ethan Taylor', email: 'ethan.t@example.com' },
  { name: 'Olivia Schmidt', email: 'olivia.schmidt@example.com' },
  { name: 'Ryan Takahashi', email: 'ryan.takahashi@example.com' },
  { name: 'Emma Watson-Lee', email: 'emma.wl@example.com' },
];

const BRAND_SPECIFIC_FEEDBACK: Record<string, string[]> = {
  br_playstation: [
    'DualSense adaptive triggers in Spider-Man 2 and Astro Bot make gaming uniquely immersive!',
    'The PS5 UI is clean, but bringing back dynamic custom dashboard themes and folders would be amazing.',
    'Load times with the ultra-high speed SSD are practically instant. Very happy with the console.',
    'PlayStation Plus Extra catalog gives great value, though a dedicated portable cloud handheld would be great.',
  ],
  br_nintendo: [
    'Zelda Tears of the Kingdom and Mario Wonder are timeless masterpieces for the whole family.',
    'I love playing in handheld mode on flights and docking seamlessly to my 4K TV when home.',
    'More retro GameCube and N64 titles added to the Switch Online expansion pack please!',
    'The joy-con ergonomics could be slightly wider for adult hands, but overall unmatched entertainment.',
  ],
  br_steam: [
    'Steam Deck OLED combined with cloud saves and Proton compatibility is the peak of PC gaming.',
    'Steam Workshop mods and the community market make managing PC games so frictionless.',
    'Summer and Winter sales always have the best discounts. Seamless refund system gives total peace of mind.',
    'Steam Family sharing updates have been a gamechanger for our household gaming library.',
  ],
  br_xbox: [
    'Xbox Game Pass cloud gaming on my Samsung smart TV without needing a console is fantastic.',
    'Day-one inclusion of major RPGs and multiplayer hits saves so much money every year.',
    'Quick Resume jumping between 4 games instantly is an underrated feature I can no longer live without.',
    'Adding more Japanese RPGs and day-one indie gems keeps the subscription permanently active.',
  ],
  br_epicgames: [
    'Fortnite live concerts and UEFN community creations provide endless entertainment with friends.',
    'Weekly free PC games on the Epic Store helped me discover so many indie gems I wouldn\'t have bought.',
    'Unreal Engine 5 graphical fidelity in Fortnite Chapter 5 is stunningly realistic.',
    'Hoping the Epic Games launcher adds user reviews and community forum threads soon.',
  ],
  br_riotgames: [
    'Valorant tactical gunplay and Premier tournament mode are the best competitive shooter experiences.',
    'Vanguard anti-cheat does a great job keeping ranked matches fair compared to other FPS titles.',
    'Arcane and the League of Legends world lore are top-tier entertainment.',
    'Would love to see an in-game replay system added to Valorant to analyze match mistakes.',
  ],
  br_apple: [
    'The iPhone 16 Pro camera button and 5x optical zoom take incredible portrait photos.',
    'MacBook M-series battery life lasts two full days of coding without even plugging in.',
    'Apple Watch sleep tracking and heart rate sensors gave me actionable health insights.',
    'Universal clipboard and AirDrop between Mac, iPad, and iPhone save hours of workflow every week.',
  ],
  br_samsung: [
    'Galaxy S25 Ultra 200MP zoom and anti-reflective display make outdoor screen visibility flawless.',
    'Circle to Search and Galaxy AI photo object eraser have become essential daily tools.',
    'Samsung DeX turns my phone into a desktop workstation whenever I travel.',
    'One UI 7 animations are super smooth. Battery life easily lasts a day and a half.',
  ],
  br_google_pixel: [
    'Best Take and Magic Audio Eraser on Pixel 9 Pro produce the cleanest family videos.',
    'Call Screen automated assistant completely eliminated spam phone calls for me.',
    'Clean stock Android Material You theming and guaranteed 7 years of OS updates are unmatched.',
    'Gemini Live assistant is super conversational and helps brainstorm ideas on the go.',
  ],
};

const SECTOR_FEEDBACK_POOLS: Record<string, string[]> = {
  gaming: [
    'Flawless framerate stability and very responsive control inputs. High replay value!',
    'Excited for upcoming content updates and seasonal tournament events.',
    'The matchmaking is fast, but adding more ranked progression tiers would keep players even more engaged.',
    'Audio design and soundtrack immersion are top notch. Worth every penny!',
  ],
  food: [
    'Food was hot, freshly prepared, and packed carefully. Consistent taste every single visit.',
    'Mobile app ordering and curbside pickup make getting lunch on busy workdays so effortless.',
    'The rewards program offers generous free item redemptions. Would love to see more seasonal beverage flavors!',
    'Great value for money and friendly customer service across all locations.',
  ],
  fashion: [
    'The fabric quality is soft, breathable, and holds up nicely without shrinking after washes.',
    'True to size fit with stylish modern cuts. Perfect for both workouts and casual daily wear.',
    'App checkout was fast and standard shipping arrived two days ahead of schedule.',
    'Sustainable packaging and recycled material choices make me proud to support the brand.',
  ],
  auto: [
    'Instant electric acceleration and a quiet, whisper-smooth cabin ride make daily commutes relaxing.',
    'Fast charging network access and accurate navigation route planning eliminate range anxiety.',
    'Premium interior materials and intuitive touchscreen controls provide a futuristic feel.',
    'Over-the-air software updates continue to make the car feel brand new with every release.',
  ],
  travel: [
    'Seamless check-in, pristine accommodations, and top-notch customer hospitality throughout the stay.',
    'Loyalty rewards tier perks provided free breakfast and room upgrades without hassle.',
    'Mobile key in the app made bypassing the front desk late at night super convenient.',
    'Clear cancellation policies and fast responsive support give great peace of mind when booking.',
  ],
  retail: [
    'Same-day delivery was reliable and everything arrived intact. Great inventory variety.',
    'Competitive prices and easy 1-click returns make this my primary shopping destination.',
    'The membership perks pay for themselves within just a couple of orders every month.',
    'Search filters and genuine customer reviews make it easy to find exactly what I need.',
  ],
  default: [
    'Very intuitive interface, rock-solid reliability, and noticeable time savings in daily workflow.',
    'Customer support is responsive and new feature rollouts consistently address user feedback.',
    'The cross-platform synchronization between mobile and desktop works seamlessly.',
    'Great overall value for money. Highly recommend to peers and teammates looking for a dependable solution.',
  ],
};

function getFeedbackForBrand(brand: BrandMeta, index: number): string {
  const uniqueInfo = BRAND_UNIQUE_INSIGHTS_MAP[brand.id];
  const prod = brand.keyProduct || `${brand.name} offerings`;

  if (uniqueInfo) {
    const feedbackList = [
      uniqueInfo.insightQuote,
      uniqueInfo.satisfactionDrivers[0],
      uniqueInfo.satisfactionDrivers[1],
      uniqueInfo.satisfactionDrivers[2],
      `The ${prod} delivers outstanding reliability and performance for everyday ${brand.sector} use.`,
      `Customer service and ongoing feature polish on ${brand.name} have made a noticeable positive impact.`,
      `Great overall ecosystem value; ${prod} consistently outperforms rival products in this tier.`,
      `Verified panelists applaud ${brand.name}'s responsive engineering and build quality.`
    ];
    return feedbackList[index % feedbackList.length];
  }

  if (BRAND_SPECIFIC_FEEDBACK[brand.id]) {
    const pool = BRAND_SPECIFIC_FEEDBACK[brand.id];
    return pool[index % pool.length];
  }

  const sec = brand.sector.toLowerCase();
  let poolKey = 'default';
  if (sec.includes('gaming') || sec.includes('game') || sec.includes('rpg') || sec.includes('esports')) poolKey = 'gaming';
  else if (sec.includes('coffee') || sec.includes('food') || sec.includes('dining') || sec.includes('beverage')) poolKey = 'food';
  else if (sec.includes('fashion') || sec.includes('apparel') || sec.includes('footwear') || sec.includes('denim')) poolKey = 'fashion';
  else if (sec.includes('ev') || sec.includes('car') || sec.includes('automotive') || sec.includes('truck')) poolKey = 'auto';
  else if (sec.includes('travel') || sec.includes('hotel') || sec.includes('flight') || sec.includes('airline') || sec.includes('rideshare')) poolKey = 'travel';
  else if (sec.includes('retail') || sec.includes('e-commerce') || sec.includes('store') || sec.includes('marketplace')) poolKey = 'retail';

  const pool = SECTOR_FEEDBACK_POOLS[poolKey] || SECTOR_FEEDBACK_POOLS.default;
  return pool[index % pool.length];
}

export function generateBrandResponses(brand: BrandMeta): UserResponse[] {
  const brandClean = brand.name.replace(/\s*\(.*?\)\s*/g, '');
  const campaignId = `cmp_${brand.id.replace('br_', '')}`;
  const campaignTitle = `${brandClean}: ${brand.sector} Feedback & ${brand.keyProduct} Survey`;
  const rawQuestions = getQuestionsForBrand(brand.id, brand.name, brand.sector, brand.keyProduct);

  // Use comprehensive benchmark metric to generate authentic ratings and NPS responses
  const benchmark = getBrandBenchmarkMetric(brand.id, brand.name);

  return SAMPLE_USERS.map((user, idx) => {
    const starRating = getReviewStarRating(brand.id, idx);
    let npsScale = starRating === 5 ? (idx % 3 === 0 ? 9 : 10) :
                   starRating === 4 ? (idx % 2 === 0 ? 8 : 9) :
                   starRating === 3 ? (idx % 2 === 0 ? 6 : 7) :
                   starRating === 2 ? 4 : 2;
    const willContinue = starRating >= 4 ? 'Yes' : (starRating === 3 && idx % 2 === 0 ? 'Yes' : 'No');

    const feedbackText = getFeedbackForBrand(brand, idx);

    // Realistic spread: idx 0 is today, idx 1 is yesterday, others distributed across past 30 days
    const dateOffsetDays = idx === 0 ? 0 : idx === 1 ? 1 : Math.min(30, Math.floor(idx * 1.6));
    // Offset hours so they look naturally distributed throughout the day
    const hourOffsetMs = ((idx * 7) % 18) * 3600000;
    const completedDate = new Date(Date.now() - (dateOffsetDays * 86400000) - hourOffsetMs).toISOString();

    const answers = rawQuestions.map((q, qIdx) => {
      const qId = `q_${brand.id}_${qIdx + 1}`;
      let answerVal: string | number = '';

      if (q.type === 'rating') {
        answerVal = starRating;
      } else if (q.type === 'single_choice' && q.options && q.options.length > 0) {
        answerVal = q.options[idx % q.options.length];
      } else if (q.type === 'scale') {
        answerVal = npsScale;
      } else if (q.type === 'yes_no') {
        answerVal = willContinue;
      } else {
        answerVal = feedbackText;
      }

      return {
        questionId: qId,
        questionText: q.text,
        answer: answerVal,
      };
    });

    return {
      id: `resp_${brand.id}_${idx + 1}`,
      userId: `usr_resp_${(idx % 15) + 1}`,
      userName: user.name,
      userEmail: user.email,
      campaignId,
      campaignTitle,
      category: brand.category,
      brandId: brand.id,
      coinsAwarded: 100, // 100 coins
      completedAt: completedDate,
      answers,
    };
  });
}

// Generate 2,000 authentic feedback responses across all 100 brands (100 * 20 = 2,000 responses)
export const INITIAL_RESPONSES_100: UserResponse[] = RAW_100_BRANDS.flatMap((b) =>
  generateBrandResponses(b)
);
