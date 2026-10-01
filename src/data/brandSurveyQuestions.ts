import { Question } from '../types';

export interface UniqueBrandSurvey {
  questions: Omit<Question, 'id' | 'order'>[];
}

export const BRAND_UNIQUE_SURVEYS: Record<string, Omit<Question, 'id' | 'order'>[]> = {
  // 1. Sony PlayStation
  br_playstation: [
    {
      text: 'How would you rate your overall gaming experience with PlayStation 5 graphics, load speeds, and DualSense haptics?',
      type: 'rating',
      required: true,
    },
    {
      text: 'Which aspect of PlayStation delivers the most value to your gaming setup?',
      type: 'single_choice',
      options: [
        'Exclusive blockbuster titles (God of War, Spider-Man, The Last of Us)',
        'DualSense wireless controller adaptive triggers and precise haptics',
        'PlayStation Plus Game Catalog (Extra & Premium tiers)',
        'PSVR2 next-gen virtual reality immersion',
        '4K 120Hz & ray-tracing console graphical performance',
      ],
      required: true,
    },
    {
      text: 'How likely are you to recommend PlayStation 5 to a fellow gamer (1-10)?',
      type: 'scale',
      scaleMin: 1,
      scaleMax: 10,
      scaleMinLabel: 'Unlikely',
      scaleMaxLabel: 'Definitely recommend (10)',
      required: true,
    },
    {
      text: 'Do you plan to purchase the PS5 Pro or renew your PlayStation Plus subscription this year?',
      type: 'yes_no',
      required: true,
    },
    {
      text: 'What feature or improvement would you like Sony PlayStation to prioritize next (e.g., UI customization, backward compatibility, handheld remote play)?',
      type: 'text',
      placeholder: 'Share your feedback for the PlayStation team...',
      required: true,
    },
  ],

  // 2. Nintendo
  br_nintendo: [
    {
      text: 'How would you rate the gameplay enjoyment and family appeal of Nintendo Switch titles (Mario, Zelda, Pokemon)?',
      type: 'rating',
      required: true,
    },
    {
      text: 'What is the main reason you choose Nintendo over other gaming platforms?',
      type: 'single_choice',
      options: [
        'Unmatched co-op and family party games (Mario Kart, Smash Bros, Party)',
        'Seamless handheld and TV docked hybrid convenience',
        'Award-winning single player adventures (Zelda: Tears of the Kingdom)',
        'Nintendo Switch Online classic retro libraries (NES, SNES, N64, GBA)',
        'Wholesome and accessible game design for players of all ages',
      ],
      required: true,
    },
    {
      text: 'How likely are you to recommend a Nintendo Switch system to a friend or family member (1-10)?',
      type: 'scale',
      scaleMin: 1,
      scaleMax: 10,
      scaleMinLabel: 'Not likely',
      scaleMaxLabel: 'Highly likely (10)',
      required: true,
    },
    {
      text: 'Do you plan to upgrade to Nintendo\'s next-generation successor console upon release?',
      type: 'yes_no',
      required: true,
    },
    {
      text: 'What classic franchise revival or hardware feature would you love Nintendo to introduce next?',
      type: 'text',
      placeholder: 'Share your ideas with Nintendo...',
      required: true,
    },
  ],

  // 3. Valve Steam
  br_steam: [
    {
      text: 'How would you rate your experience using Steam for purchasing PC games, community workshops, and Steam Deck play?',
      type: 'rating',
      required: true,
    },
    {
      text: 'Which Steam feature do you find most valuable for your PC gaming library?',
      type: 'single_choice',
      options: [
        'Seasonal Steam Sales and regional game pricing discounts',
        'Steam Deck OLED seamless Proton compatibility and cloud saves',
        'Steam Workshop community mods and custom content',
        'Consumer-friendly 2-hour refund policy and transparent user reviews',
        'Steam Remote Play Together and Family Library Sharing',
      ],
      required: true,
    },
    {
      text: 'How likely are you to recommend Steam as the essential platform for PC gaming (1-10)?',
      type: 'scale',
      scaleMin: 1,
      scaleMax: 10,
      scaleMinLabel: 'Low',
      scaleMaxLabel: 'Essential platform (10)',
      required: true,
    },
    {
      text: 'Do you plan to purchase games in the upcoming Steam seasonal sale or buy a Steam Deck?',
      type: 'yes_no',
      required: true,
    },
    {
      text: 'What store or SteamOS feature would you like Valve to enhance next?',
      type: 'text',
      placeholder: 'Share your feedback for Valve and Steam...',
      required: true,
    },
  ],

  // 4. Xbox Game Pass
  br_xbox: [
    {
      text: 'How satisfied are you with Xbox Game Pass Ultimate game variety, day-one launches, and Cloud Gaming streaming?',
      type: 'rating',
      required: true,
    },
    {
      text: 'What is your primary motivation for subscribing to Xbox Game Pass?',
      type: 'single_choice',
      options: [
        'Day-one access to new major releases without paying $70 per game',
        'Cloud gaming capability on phones, tablets, smart TVs, and browser',
        'Seamless cross-progression between Xbox Series X/S and Windows PC',
        'EA Play membership inclusion and monthly subscriber perks',
        'Discovering unexpected indie masterpieces and co-op multiplayer titles',
      ],
      required: true,
    },
    {
      text: 'How likely are you to recommend Xbox Game Pass to a fellow gamer (1-10)?',
      type: 'scale',
      scaleMin: 1,
      scaleMax: 10,
      scaleMinLabel: 'Not likely',
      scaleMaxLabel: 'Must-have subscription (10)',
      required: true,
    },
    {
      text: 'Do you plan to keep your Xbox Game Pass Ultimate subscription active over the next year?',
      type: 'yes_no',
      required: true,
    },
    {
      text: 'What game studio releases or subscription tier changes would improve Xbox Game Pass for you?',
      type: 'text',
      placeholder: 'Share your feedback with Xbox...',
      required: true,
    },
  ],

  // 5. Epic Games
  br_epicgames: [
    {
      text: 'How would you rate Fortnite\'s seasonal updates, Unreal Engine 5 tech, and the Epic Games Store weekly free games?',
      type: 'rating',
      required: true,
    },
    {
      text: 'What is your favorite offering within the Epic Games ecosystem?',
      type: 'single_choice',
      options: [
        'Fortnite Battle Royale live events, LEGO Fortnite, and Festival rhythm mode',
        'Unreal Engine 5 Nanite and Lumen real-time graphics technology',
        'Epic Games Store weekly free games and 100% developer revenue initiatives',
        'Unreal Editor for Fortnite (UEFN) creator economy monetization',
        'Cross-platform account progression and friends party overlay',
      ],
      required: true,
    },
    {
      text: 'How likely are you to recommend the Epic Games Store or Fortnite to a gaming friend (1-10)?',
      type: 'scale',
      scaleMin: 1,
      scaleMax: 10,
      scaleMinLabel: 'Unlikely',
      scaleMaxLabel: 'Strongly recommend (10)',
      required: true,
    },
    {
      text: 'Do you plan to make in-game purchases (V-Bucks/Skins) or buy PC games on the Epic Store this year?',
      type: 'yes_no',
      required: true,
    },
    {
      text: 'What launcher features (e.g. faster startup, user reviews, shopping cart updates) should Epic Games add?',
      type: 'text',
      placeholder: 'Your direct feedback for Epic Games...',
      required: true,
    },
  ],

  // 6. Riot Games
  br_riotgames: [
    {
      text: 'How do you rate Riot Games\' tactical balance, anti-cheat performance (Vanguard), and competitive integrity (Valorant & LoL)?',
      type: 'rating',
      required: true,
    },
    {
      text: 'What keeps you most invested in Riot Games titles?',
      type: 'single_choice',
      options: [
        'Precise gunplay and agent abilities in Valorant',
        'Deep strategic champion meta and counter-play in League of Legends / TFT',
        'Exciting global esports tournaments (VCT Champions, Worlds, MSI)',
        'Animated storytelling, lore, and music videos (Arcane)',
        'High-quality weapon skins and evolving VFX finishers',
      ],
      required: true,
    },
    {
      text: 'How likely are you to recommend Valorant or League of Legends to an esports enthusiast (1-10)?',
      type: 'scale',
      scaleMin: 1,
      scaleMax: 10,
      scaleMinLabel: 'Not likely',
      scaleMaxLabel: 'Top esports pick (10)',
      required: true,
    },
    {
      text: 'Do you plan to participate in ranked Premier tournaments or buy battle passes in the upcoming Act?',
      type: 'yes_no',
      required: true,
    },
    {
      text: 'What is the top balance, matchmaking, or behavior issue Riot should address in its competitive titles?',
      type: 'text',
      placeholder: 'Share your feedback with Riot Games...',
      required: true,
    },
  ],

  // 7. Roblox Studio
  br_roblox: [
    {
      text: 'How would you rate the variety of user-generated 3D experiences, avatar accessories, and social hangout spaces on Roblox?',
      type: 'rating',
      required: true,
    },
    {
      text: 'What is the best part of the Roblox platform for you or your family?',
      type: 'single_choice',
      options: [
        'Infinite variety of multiplayer roleplay and obstacle games with friends',
        'Roblox Studio Lua tools allowing anyone to build and monetize games',
        'Avatar marketplace UGC clothing, hair, and 3D accessories',
        'Live virtual events, anime crossovers, and brand concerts',
        'Cross-platform play on phones, tablets, PC, PlayStation, and Meta Quest',
      ],
      required: true,
    },
    {
      text: 'How likely are you to recommend Roblox to players and budding creators (1-10)?',
      type: 'scale',
      scaleMin: 1,
      scaleMax: 10,
      scaleMinLabel: 'Low',
      scaleMaxLabel: 'Highly recommend (10)',
      required: true,
    },
    {
      text: 'Do you plan to purchase Robux or develop custom games in Roblox Studio over the coming year?',
      type: 'yes_no',
      required: true,
    },
    {
      text: 'What safety controls, engine graphics upgrades, or creator tools would you like Roblox to introduce?',
      type: 'text',
      placeholder: 'Share your Roblox feature requests...',
      required: true,
    },
  ],

  // 8. Blizzard Entertainment
  br_blizzard: [
    {
      text: 'How would you rate your recent experience with Blizzard titles including World of Warcraft: The War Within, Diablo IV, and Overwatch 2?',
      type: 'rating',
      required: true,
    },
    {
      text: 'What is the primary factor that draws you into Blizzard worlds?',
      type: 'single_choice',
      options: [
        'Rich lore, cinematic storytelling, and world-building',
        'Mythic raiding, dungeons, and seasonal progression systems',
        'Fast-paced team hero shooter action in Overwatch 2',
        'Satisfying ARPG loot grind and dark gothic art style in Diablo IV',
        'Longstanding guild friendships and community camaraderie',
      ],
      required: true,
    },
    {
      text: 'How likely are you to recommend current Blizzard titles to fellow gaming enthusiasts (1-10)?',
      type: 'scale',
      scaleMin: 1,
      scaleMax: 10,
      scaleMinLabel: 'Unlikely',
      scaleMaxLabel: 'Strongly recommend (10)',
      required: true,
    },
    {
      text: 'Do you intend to purchase upcoming expansion packs or battle passes across Blizzard titles this year?',
      type: 'yes_no',
      required: true,
    },
    {
      text: 'What gameplay balance or monetization adjustments would you recommend to Blizzard’s game directors?',
      type: 'text',
      placeholder: 'Provide your feedback to Blizzard Entertainment...',
      required: true,
    },
  ],

  // 9. EA Sports
  br_ea_sports: [
    {
      text: 'How satisfied are you with the realism, HyperMotion gameplay physics, and broadcast authenticity in EA Sports FC / Madden / F1?',
      type: 'rating',
      required: true,
    },
    {
      text: 'Which game mode do you spend the majority of your playing time in?',
      type: 'single_choice',
      options: [
        'Ultimate Team squad building, Evolutions, and Champions weekend league',
        'Career Mode (Manager and Player storylines)',
        'Clubs online 11v11 drop-in matches with friends',
        'Online Seasons and competitive ranked divisions',
        'Casual kick-off and local couch multiplayer tournaments',
      ],
      required: true,
    },
    {
      text: 'How likely are you to recommend EA Sports titles to sports fans and competitive gamers (1-10)?',
      type: 'scale',
      scaleMin: 1,
      scaleMax: 10,
      scaleMinLabel: 'Low',
      scaleMaxLabel: 'Essential sports gaming (10)',
      required: true,
    },
    {
      text: 'Do you plan to purchase the next annual edition of your favorite EA Sports franchise?',
      type: 'yes_no',
      required: true,
    },
    {
      text: 'What gameplay mechanics or matchmaking improvements would you love to see implemented in the next release?',
      type: 'text',
      placeholder: 'Share your sports gaming ideas with EA...',
      required: true,
    },
  ],

  // 10. Rockstar Games
  br_rockstar: [
    {
      text: 'How would you rate the immersion, narrative depth, and living open-world detail in Rockstar titles (GTA V, GTA Online, Red Dead Redemption 2)?',
      type: 'rating',
      required: true,
    },
    {
      text: 'What excites you most about Rockstar Games’ upcoming releases (like GTA VI)?',
      type: 'single_choice',
      options: [
        'Next-generation open-world realism and physics simulation in Vice City (GTA VI)',
        'Cinematic story missions and unforgettable character acting',
        'GTA Online live heists, business empires, and car meets with friends',
        'Meticulous attention to ambient world details and NPC AI behavior',
        'Atmospheric soundtracks and immersive radio station curation',
      ],
      required: true,
    },
    {
      text: 'How likely are you to recommend Rockstar Games titles as the benchmark of interactive open-world entertainment (1-10)?',
      type: 'scale',
      scaleMin: 1,
      scaleMax: 10,
      scaleMinLabel: 'Not likely',
      scaleMaxLabel: 'Masterpiece benchmark (10)',
      required: true,
    },
    {
      text: 'Are you planning to purchase Grand Theft Auto VI on day-one of launch?',
      type: 'yes_no',
      required: true,
    },
    {
      text: 'What specific features or multiplayer innovations are you hoping Rockstar includes in the next GTA generation?',
      type: 'text',
      placeholder: 'Share your expectations and feedback for Rockstar Games...',
      required: true,
    },
  ],

  // 11. Ubisoft Connect
  br_ubisoft: [
    {
      text: 'How would you rate your adventure across Ubisoft franchises like Assassin\'s Creed, Rainbow Six Siege, and Far Cry?',
      type: 'rating',
      required: true,
    },
    {
      text: 'What is the strongest aspect of Ubisoft\'s game design?',
      type: 'single_choice',
      options: [
        'Rich historical world recreation and parkour navigation (Assassin\'s Creed)',
        'Intense tactical destructible room CQB in Rainbow Six Siege',
        'Vast exotic open-world exploration and outpost liberation',
        'Ubisoft+ multi-access subscription library on PC and console',
        'Cross-platform cloud saves and Ubisoft Connect rewards',
      ],
      required: true,
    },
    {
      text: 'How likely are you to recommend Assassin\'s Creed Shadows or Rainbow Six Siege to an action fan (1-10)?',
      type: 'scale',
      scaleMin: 1,
      scaleMax: 10,
      scaleMinLabel: 'Unlikely',
      scaleMaxLabel: 'Definitely recommend (10)',
      required: true,
    },
    {
      text: 'Do you plan to subscribe to Ubisoft+ or buy upcoming Ubisoft releases this year?',
      type: 'yes_no',
      required: true,
    },
    {
      text: 'What gameplay adjustments or performance optimizations would make Ubisoft games better for you?',
      type: 'text',
      placeholder: 'Share your thoughts for the Ubisoft development teams...',
      required: true,
    },
  ],

  // 12. CD PROJEKT RED
  br_cdprojekt: [
    {
      text: 'How would you rate the narrative storytelling, world density, and character writing in Cyberpunk 2077: Phantom Liberty and The Witcher 3?',
      type: 'rating',
      required: true,
    },
    {
      text: 'What makes CD PROJEKT RED stand out among modern RPG studios?',
      type: 'single_choice',
      options: [
        'Morally gray, mature decision-making with meaningful consequences',
        'Breathtaking Night City futuristic atmosphere and Ray Tracing Overdrive visuals',
        'Rich dark fantasy monster hunting and folklore in The Witcher series',
        'Deep build customization, cyberware combos, and character skill trees',
        'Dedication to post-launch patches and high-caliber expansion storytelling',
      ],
      required: true,
    },
    {
      text: 'How likely are you to recommend Cyberpunk 2077 or The Witcher series to an RPG fan (1-10)?',
      type: 'scale',
      scaleMin: 1,
      scaleMax: 10,
      scaleMinLabel: 'Low',
      scaleMaxLabel: 'Masterpiece RPG (10)',
      required: true,
    },
    {
      text: 'Are you planning to play the next Witcher saga game (Project Polaris) or Cyberpunk sequel upon release?',
      type: 'yes_no',
      required: true,
    },
    {
      text: 'What gameplay systems or lore elements would you like to see explored in CD PROJEKT RED’s next saga?',
      type: 'text',
      placeholder: 'Send your suggestions to CD PROJEKT RED...',
      required: true,
    },
  ],

  // 13. Capcom
  br_capcom: [
    {
      text: 'How would you rate your combat and survival horror experience across Monster Hunter Wilds, Street Fighter 6, and Resident Evil 4?',
      type: 'rating',
      required: true,
    },
    {
      text: 'Which Capcom franchise or feature do you appreciate the most?',
      type: 'single_choice',
      options: [
        'Deep monster ecology and weapon mastery in Monster Hunter Wilds',
        'Precision fighting mechanics and Battle Hub community in Street Fighter 6',
        'Heart-pounding atmospheric survival horror in the Resident Evil series',
        'Stylish hack-and-slash combo action in Devil May Cry and Dragon\'s Dogma 2',
        'Rock-solid RE Engine performance and fluid animation responsiveness',
      ],
      required: true,
    },
    {
      text: 'How likely are you to recommend Capcom titles to action and fighting game enthusiasts (1-10)?',
      type: 'scale',
      scaleMin: 1,
      scaleMax: 10,
      scaleMinLabel: 'Not likely',
      scaleMaxLabel: 'Top tier recommendation (10)',
      required: true,
    },
    {
      text: 'Do you plan to purchase Monster Hunter Wilds or the next Resident Evil title at launch?',
      type: 'yes_no',
      required: true,
    },
    {
      text: 'Which classic Capcom franchise (e.g. Mega Man, Dino Crisis, Okami, Darkstalkers) would you like revived?',
      type: 'text',
      placeholder: 'Share your feedback for Capcom developers...',
      required: true,
    },
  ],

  // 14. Square Enix
  br_square_enix: [
    {
      text: 'How would you rate the emotional storytelling, musical score, and battle design in Final Fantasy VII Rebirth & XVI?',
      type: 'rating',
      required: true,
    },
    {
      text: 'What is the most memorable aspect of Square Enix RPGs for you?',
      type: 'single_choice',
      options: [
        'Epic orchestral soundtracks and cinematic boss encounters',
        'Dynamic hybrid action-command combat system in FFVII Rebirth',
        'Rich character relationships, party banter, and emotional story arcs',
        'Expansive world exploration, minigames (Queen\'s Blood, Chocobo racing)',
        'Iconic fantasy series history (Dragon Quest, Kingdom Hearts, Nier)',
      ],
      required: true,
    },
    {
      text: 'How likely are you to recommend Final Fantasy VII Rebirth to an RPG fan (1-10)?',
      type: 'scale',
      scaleMin: 1,
      scaleMax: 10,
      scaleMinLabel: 'Unlikely',
      scaleMaxLabel: 'Must-play RPG (10)',
      required: true,
    },
    {
      text: 'Are you planning to purchase the final part of the Final Fantasy VII Remake trilogy and Kingdom Hearts 4?',
      type: 'yes_no',
      required: true,
    },
    {
      text: 'What feedback or ideas do you have for Square Enix concerning PC ports, localization, or combat pacing?',
      type: 'text',
      placeholder: 'Share your thoughts with Square Enix...',
      required: true,
    },
  ],

  // 15. Unity Technologies
  br_unity: [
    {
      text: 'How would you rate Unity 6 engine performance, cross-platform build pipelines, and developer tooling?',
      type: 'rating',
      required: true,
    },
    {
      text: 'Which Unity feature is most critical to your development workflow?',
      type: 'single_choice',
      options: [
        'Universal Render Pipeline (URP) cross-platform graphics scaling',
        'Vast Unity Asset Store ecosystem and plug-and-play packages',
        'C# scripting flexibility and intuitive Editor inspector workflow',
        'Mobile optimization and lightweight AR/VR XR Interaction Toolkit',
        'Unity Gaming Services (multiplayer matchmaking, analytics, Ads)',
      ],
      required: true,
    },
    {
      text: 'How likely are you to recommend Unity as the preferred engine for indie and mobile game development (1-10)?',
      type: 'scale',
      scaleMin: 1,
      scaleMax: 10,
      scaleMinLabel: 'Low',
      scaleMaxLabel: 'Highly recommended (10)',
      required: true,
    },
    {
      text: 'Do you plan to release a game or interactive application built with Unity over the next 12 months?',
      type: 'yes_no',
      required: true,
    },
    {
      text: 'What documentation, compiler speed, or runtime stability improvements would you like Unity to prioritize?',
      type: 'text',
      placeholder: 'Your direct feedback for the Unity engineering team...',
      required: true,
    },
  ],

  // --- Tech & Mobile Hardware ---
  // 16. Apple
  br_apple: [
    {
      text: 'How satisfied are you with your Apple devices (iPhone 16 Pro, Mac with M-series silicon, Apple Watch) and Apple Intelligence?',
      type: 'rating',
      required: true,
    },
    {
      text: 'What is the primary factor that keeps you in the Apple ecosystem?',
      type: 'single_choice',
      options: [
        'Seamless multi-device continuity (AirDrop, Universal Clipboard, Handoff)',
        'Apple Silicon M-series battery life and silent computing power',
        'Pro Camera RAW photography and ProRes video recording quality',
        'Apple Watch health monitoring (ECG, Heart Rate, Activity Rings)',
        'Strict privacy protections and long-term iOS software update support',
      ],
      required: true,
    },
    {
      text: 'How likely are you to recommend Apple products to friends, family, or colleagues (1-10)?',
      type: 'scale',
      scaleMin: 1,
      scaleMax: 10,
      scaleMinLabel: 'Not likely',
      scaleMaxLabel: 'Unreservedly recommend (10)',
      required: true,
    },
    {
      text: 'Do you plan to upgrade to a new iPhone, Mac, or Apple Watch within the next 12 months?',
      type: 'yes_no',
      required: true,
    },
    {
      text: 'What software feature or hardware refinement would you love Apple to introduce in upcoming iOS/macOS updates?',
      type: 'text',
      placeholder: 'Share your feedback for Apple...',
      required: true,
    },
  ],

  // 17. Samsung
  br_samsung: [
    {
      text: 'How would you rate your experience with Samsung Galaxy smartphones (S25 Ultra / Z Fold6), Dynamic AMOLED displays, and Galaxy AI?',
      type: 'rating',
      required: true,
    },
    {
      text: 'Which Samsung innovation do you find most compelling in daily use?',
      type: 'single_choice',
      options: [
        'Galaxy AI photo editing, Circle to Search, and Live Call Translation',
        'Industry-leading 200MP camera zoom and night photography sensors',
        'Foldable multitasking productivity on the Galaxy Z Fold and Flip series',
        'Vibrant 120Hz Dynamic AMOLED display with anti-reflective glass',
        'One UI customization, Samsung DeX desktop mode, and S-Pen precision',
      ],
      required: true,
    },
    {
      text: 'How likely are you to recommend Samsung Galaxy devices to someone shopping for a new phone or tablet (1-10)?',
      type: 'scale',
      scaleMin: 1,
      scaleMax: 10,
      scaleMinLabel: 'Low',
      scaleMaxLabel: 'Top Android choice (10)',
      required: true,
    },
    {
      text: 'Do you plan to upgrade to a Galaxy flagship phone or SmartThings appliance this year?',
      type: 'yes_no',
      required: true,
    },
    {
      text: 'What improvements would you like Samsung to make in One UI, battery longevity, or Galaxy AI features?',
      type: 'text',
      placeholder: 'Share your feedback for Samsung Electronics...',
      required: true,
    },
  ],

  // 18. Google Pixel
  br_google_pixel: [
    {
      text: 'How satisfied are you with Google Pixel camera computational photography, Gemini AI integration, and clean Android software?',
      type: 'rating',
      required: true,
    },
    {
      text: 'What is your favorite exclusive feature on Google Pixel phones?',
      type: 'single_choice',
      options: [
        'Magic Editor, Best Take, and Zoom Enhance camera AI features',
        'Gemini Live assistant and on-device multimodal intelligence',
        'Call Screen automated spam blocking and Clear Calling audio',
        'Stock Android aesthetic, Material You theming, and Pixel Feature Drops',
        'Industry-leading 7 years of promised OS and security updates',
      ],
      required: true,
    },
    {
      text: 'How likely are you to recommend Google Pixel 9 Pro to someone switching phones (1-10)?',
      type: 'scale',
      scaleMin: 1,
      scaleMax: 10,
      scaleMinLabel: 'Not likely',
      scaleMaxLabel: 'Best Android experience (10)',
      required: true,
    },
    {
      text: 'Do you plan to purchase a Pixel phone, Pixel Watch, or Pixel Tablet in the coming year?',
      type: 'yes_no',
      required: true,
    },
    {
      text: 'What hardware or battery/charging improvements would you like Google to focus on for the next Pixel generation?',
      type: 'text',
      placeholder: 'Share your feedback with the Google Pixel team...',
      required: true,
    },
  ],

  // 19. Microsoft Surface
  br_microsoft_surface: [
    {
      text: 'How would you rate the 2-in-1 versatility, touchscreen stylus writing, and Snapdragon X Elite Copilot+ battery life on Microsoft Surface?',
      type: 'rating',
      required: true,
    },
    {
      text: 'What makes Microsoft Surface your preferred productivity device?',
      type: 'single_choice',
      options: [
        'All-day ARM battery efficiency with whisper-quiet, fanless operation',
        'Premium PixelSense 120Hz touchscreen and built-in kickstand ergonomics',
        'Surface Slim Pen 2 haptic feedback mimicking real pen on paper',
        'Windows 11 Copilot+ AI features and Recall search capabilities',
        'Detachable Signature Keyboard with magnetic charging pen silo',
      ],
      required: true,
    },
    {
      text: 'How likely are you to recommend Microsoft Surface Pro to a professional, student, or creator (1-10)?',
      type: 'scale',
      scaleMin: 1,
      scaleMax: 10,
      scaleMinLabel: 'Unlikely',
      scaleMaxLabel: 'Highly recommended (10)',
      required: true,
    },
    {
      text: 'Are you planning to upgrade to a Surface Copilot+ PC within the next 12 months?',
      type: 'yes_no',
      required: true,
    },
    {
      text: 'What hardware port additions, keyboard improvements, or software tweaks would you like on Surface devices?',
      type: 'text',
      placeholder: 'Share your feedback with the Microsoft Surface team...',
      required: true,
    },
  ],

  // 20. Dell Technologies
  br_dell: [
    {
      text: 'How would you rate the build quality, display accuracy, and performance of Dell XPS ultrabooks and Alienware gaming laptops?',
      type: 'rating',
      required: true,
    },
    {
      text: 'What is the primary reason you rely on Dell laptops or monitors?',
      type: 'single_choice',
      options: [
        'InfinityEdge 4K OLED borderless display clarity and color calibration',
        'CNC machined aluminum and carbon fiber chassis durability',
        'Reliable enterprise support and Dell ProSupport on-site warranty',
        'Alienware thermal cooling architecture and high wattage GPU performance',
        'Thunderbolt USB-C docking ecosystem for multi-monitor desktop setups',
      ],
      required: true,
    },
    {
      text: 'How likely are you to recommend Dell XPS or Alienware laptops to a colleague or friend (1-10)?',
      type: 'scale',
      scaleMin: 1,
      scaleMax: 10,
      scaleMinLabel: 'Not likely',
      scaleMaxLabel: 'Benchmark laptop (10)',
      required: true,
    },
    {
      text: 'Do you plan on purchasing a Dell XPS or Dell UltraSharp monitor in the next 12 months?',
      type: 'yes_no',
      required: true,
    },
    {
      text: 'What design changes (e.g. keyboard row, port selection, trackpad haptics) would you suggest for the XPS lineup?',
      type: 'text',
      placeholder: 'Send your suggestions to Dell Technologies...',
      required: true,
    },
  ],

  // 21. ASUS ROG
  br_asus_rog: [
    {
      text: 'How satisfied are you with ASUS ROG gaming laptops (Zephyrus), OLED monitors, and the ROG Ally X handheld gaming console?',
      type: 'rating',
      required: true,
    },
    {
      text: 'What is the standout strength of ASUS Republic of Gamers hardware?',
      type: 'single_choice',
      options: [
        'ROG Ally X 80Wh battery capacity, ergonomics, and Windows handheld freedom',
        'Zephyrus G14/G16 sleek unibody aluminum chassis and OLED Nebula displays',
        'Cutting-edge ROG thermal vapor chamber cooling and liquid metal application',
        'Armoury Crate performance tuning and customizable AniMe Matrix lids',
        'Fast 360Hz/540Hz esports monitors with extreme response times',
      ],
      required: true,
    },
    {
      text: 'How likely are you to recommend ASUS ROG gaming gear to a fellow PC gamer (1-10)?',
      type: 'scale',
      scaleMin: 1,
      scaleMax: 10,
      scaleMinLabel: 'Low',
      scaleMaxLabel: 'Top gaming brand (10)',
      required: true,
    },
    {
      text: 'Are you planning to purchase the ROG Ally X or a ROG Zephyrus laptop this year?',
      type: 'yes_no',
      required: true,
    },
    {
      text: 'What software optimizations or physical design tweaks would you like ASUS ROG to make in Armoury Crate / Ally?',
      type: 'text',
      placeholder: 'Your feedback for ASUS ROG engineers...',
      required: true,
    },
  ],

  // 22. Lenovo ThinkPad
  br_lenovo: [
    {
      text: 'How would you rate the keyboard ergonomics, MIL-STD durability, and reliability of Lenovo ThinkPad X1 and Legion laptops?',
      type: 'rating',
      required: true,
    },
    {
      text: 'Why do you choose Lenovo ThinkPad for your daily workplace or coding tasks?',
      type: 'single_choice',
      options: [
        'Legendary tactile keyboard with deep key travel and iconic red TrackPoint',
        'Carbon fiber and magnesium lightweight chassis meeting military drop tests',
        'Rapid RapidCharge battery and extensive legacy port selection (HDMI, USB-A/C)',
        'Built-in privacy shutter, discrete TPM security, and fingerprint readers',
        'Linux compatibility and straightforward user-upgradable components',
      ],
      required: true,
    },
    {
      text: 'How likely are you to recommend ThinkPad laptops to business professionals, developers, and students (1-10)?',
      type: 'scale',
      scaleMin: 1,
      scaleMax: 10,
      scaleMinLabel: 'Unlikely',
      scaleMaxLabel: 'Gold standard work laptop (10)',
      required: true,
    },
    {
      text: 'Does your company or personal setup plan to upgrade ThinkPad / Legion laptops over the next year?',
      type: 'yes_no',
      required: true,
    },
    {
      text: 'What screen ratio, touchpad size, or webcam quality upgrades would you like on the next ThinkPad X1 Carbon?',
      type: 'text',
      placeholder: 'Share your feedback for the Lenovo ThinkPad design team...',
      required: true,
    },
  ],

  // 23. HP Omen & Spectre
  br_hp: [
    {
      text: 'How satisfied are you with HP Spectre x360 convertible ergonomics and HP Omen gaming cooling/refresh rates?',
      type: 'rating',
      required: true,
    },
    {
      text: 'What is your favorite feature on HP premium laptops?',
      type: 'single_choice',
      options: [
        'Spectre x360 2-in-1 gem-cut design with 9MP AI auto-framing webcam',
        'Omen Tempest cooling architecture and Omen Gaming Hub overclocking',
        'Poly Studio sound tuning and crisp OLED touchscreens',
        'Sustainable materials with recycled aluminum and ocean-bound plastics',
        'Quiet fan profiles and long battery endurance for office productivity',
      ],
      required: true,
    },
    {
      text: 'How likely are you to recommend HP Spectre or Omen laptops to a colleague or creator (1-10)?',
      type: 'scale',
      scaleMin: 1,
      scaleMax: 10,
      scaleMinLabel: 'Low',
      scaleMaxLabel: 'Highly recommended (10)',
      required: true,
    },
    {
      text: 'Do you plan to purchase an HP Spectre 2-in-1 or Omen gaming rig in the coming year?',
      type: 'yes_no',
      required: true,
    },
    {
      text: 'What improvements would you suggest for HP software utilities (e.g. reducing pre-installed apps, lighter tray icons)?',
      type: 'text',
      placeholder: 'Share your thoughts with HP...',
      required: true,
    },
  ],

  // 24. Sony Audio & Cameras
  br_sony_electronics: [
    {
      text: 'How would you rate Sony WH-1000XM5 active noise cancellation and Sony Alpha 7 IV mirrorless autofocus performance?',
      type: 'rating',
      required: true,
    },
    {
      text: 'What is the number one reason you invest in Sony audio or imaging gear?',
      type: 'single_choice',
      options: [
        'Industry-leading active noise cancelling and LDAC high-res wireless audio',
        'Real-time Eye Autofocus AI tracking on humans, animals, and birds in 4K video',
        'Vast selection of full-frame native E-mount lenses across all price points',
        'Comfortable lightweight headband fit and 30-hour battery life with quick charge',
        'Sony Headphones Connect app granular equalizer and Speak-to-Chat automation',
      ],
      required: true,
    },
    {
      text: 'How likely are you to recommend Sony ANC headphones or Alpha mirrorless cameras (1-10)?',
      type: 'scale',
      scaleMin: 1,
      scaleMax: 10,
      scaleMinLabel: 'Unlikely',
      scaleMaxLabel: 'Benchmark audio/photo gear (10)',
      required: true,
    },
    {
      text: 'Are you considering purchasing the next Sony 1000X headphones or an Alpha camera lens this year?',
      type: 'yes_no',
      required: true,
    },
    {
      text: 'What physical design or touch-sensor tweaks would you suggest for the next generation of Sony headphones?',
      type: 'text',
      placeholder: 'Share your feedback with Sony electronics engineers...',
      required: true,
    },
  ],

  // 25. LG Electronics
  br_lg_oled: [
    {
      text: 'How would you rate the black levels, brightness, and gaming responsiveness (G-Sync 144Hz) of LG OLED evo TVs and UltraGear monitors?',
      type: 'rating',
      required: true,
    },
    {
      text: 'What makes LG OLED your preferred home entertainment or gaming display?',
      type: 'single_choice',
      options: [
        'Self-lit pixels delivering true infinite contrast and perfect black levels',
        'Alpha 11 AI Processor 4K picture enhancement and Dolby Vision HDR',
        '0.03ms instant pixel response times with 4 full-bandwidth HDMI 2.1 ports',
        'webOS smart TV interface with AirPlay, Chromecast, and Magic Remote cursor',
        'Flush wall-mount Gallery design elevating living room aesthetics',
      ],
      required: true,
    },
    {
      text: 'How likely are you to recommend LG OLED TVs or UltraGear monitors to movie/gaming enthusiasts (1-10)?',
      type: 'scale',
      scaleMin: 1,
      scaleMax: 10,
      scaleMinLabel: 'Not likely',
      scaleMaxLabel: 'Best TV on the market (10)',
      required: true,
    },
    {
      text: 'Do you plan to purchase an LG OLED TV or UltraGear curved monitor in the next 12 months?',
      type: 'yes_no',
      required: true,
    },
    {
      text: 'What smart TV app enhancements or remote control adjustments would you like to see in webOS?',
      type: 'text',
      placeholder: 'Your direct feedback for LG Electronics...',
      required: true,
    },
  ],

  // 26. Bose
  br_bose: [
    {
      text: 'How satisfied are you with Bose QuietComfort Ultra noise cancelling depth, acoustic warmth, and Immersive Audio spatial sound?',
      type: 'rating',
      required: true,
    },
    {
      text: 'What is the signature quality that makes you choose Bose?',
      type: 'single_choice',
      options: [
        'World-class noise cancellation that eliminates airplane and commute roar',
        'CustomTune technology automatically calibrating sound to your ear canal shape',
        'All-day plush memory foam comfort with zero clamping fatigue',
        'Bose Immersive Audio creating a spacious, head-tracked soundstage',
        'Crystal clear voice pickup during phone and video conference calls',
      ],
      required: true,
    },
    {
      text: 'How likely are you to recommend Bose QuietComfort Ultra headphones or earbuds to a frequent traveler (1-10)?',
      type: 'scale',
      scaleMin: 1,
      scaleMax: 10,
      scaleMinLabel: 'Low',
      scaleMaxLabel: 'Gold standard for travel (10)',
      required: true,
    },
    {
      text: 'Do you plan to purchase or upgrade to a Bose QuietComfort or Smart Soundbar product this year?',
      type: 'yes_no',
      required: true,
    },
    {
      text: 'What features (e.g. multipoint switching speed, wireless charging case inclusion) should Bose improve next?',
      type: 'text',
      placeholder: 'Share your feedback with Bose acoustic engineers...',
      required: true,
    },
  ],

  // 27. GoPro
  br_gopro: [
    {
      text: 'How would you rate GoPro HERO13 Black 5.3K video clarity, HyperSmooth stabilization, and waterproof ruggedness?',
      type: 'rating',
      required: true,
    },
    {
      text: 'What is the primary way you use your GoPro camera?',
      type: 'single_choice',
      options: [
        'Extreme sports and adventure recording (skiing, biking, surfing, skydiving)',
        'Travel vlogging and POV family holiday video capture',
        'Underwater diving and snorkeling without extra waterproof housings',
        'High-framerate 4K 120fps / 2.7K 240fps slow-motion action shots',
        'GoPro Quik cloud auto-highlight reel editing and unlimited backup',
      ],
      required: true,
    },
    {
      text: 'How likely are you to recommend GoPro HERO cameras to outdoor creators and travelers (1-10)?',
      type: 'scale',
      scaleMin: 1,
      scaleMax: 10,
      scaleMinLabel: 'Unlikely',
      scaleMaxLabel: 'Essential action camera (10)',
      required: true,
    },
    {
      text: 'Do you plan to upgrade to the next GoPro HERO camera or subscribe to GoPro Premium this year?',
      type: 'yes_no',
      required: true,
    },
    {
      text: 'What improvements (e.g. low-light night video, battery thermal life in hot climates, magnetic mounts) would you like GoPro to deliver?',
      type: 'text',
      placeholder: 'Send your suggestions to GoPro...',
      required: true,
    },
  ],

  // 28. DJI Drones & Gimbals
  br_dji: [
    {
      text: 'How satisfied are you with DJI drone flight stability (Mini 4 Pro), obstacle avoidance sensors, and Osmo Pocket 3 video quality?',
      type: 'rating',
      required: true,
    },
    {
      text: 'What is the most impressive aspect of DJI\'s camera and gimbal systems?',
      type: 'single_choice',
      options: [
        'Sub-249g ultralight drone regulations exemption paired with 4K HDR vertical video',
        'Omnidirectional obstacle sensing and automated ActiveTrack subject following',
        'Osmo Pocket 3 1-inch CMOS sensor with mechanical 3-axis gimbal smoothness',
        'Long 30-45 minute real-world flight battery endurance and O4 HD video transmission',
        'Intuitive DJI Fly app automated QuickShots and MasterShots cinematic flight paths',
      ],
      required: true,
    },
    {
      text: 'How likely are you to recommend DJI drones and Osmo gimbals to filmmakers and creators (1-10)?',
      type: 'scale',
      scaleMin: 1,
      scaleMax: 10,
      scaleMinLabel: 'Not likely',
      scaleMaxLabel: 'Industry leader (10)',
      required: true,
    },
    {
      text: 'Do you plan to purchase a DJI drone, Osmo action camera, or Mic 2 system over the next 12 months?',
      type: 'yes_no',
      required: true,
    },
    {
      text: 'What drone regulations assistance, battery charging hubs, or software features should DJI introduce next?',
      type: 'text',
      placeholder: 'Share your thoughts for DJI product managers...',
      required: true,
    },
  ],

  // 29. Logitech
  br_logitech: [
    {
      text: 'How would you rate Logitech MX Master 3S ergonomic productivity, MagSpeed scrolling, and PRO X Superlight 2 gaming precision?',
      type: 'rating',
      required: true,
    },
    {
      text: 'What makes Logitech your go-to brand for desktop and workspace peripherals?',
      type: 'single_choice',
      options: [
        'Quiet Click tactile switches and hyper-fast electromagnetic MagSpeed wheel',
        'Logi Options+ Smart Actions and multi-computer Flow cursor switching',
        'Featherweight 60g PRO X Superlight 2 HERO 2 sensor tournament accuracy',
        'MX Keys mechanical low-profile keyboard typing comfort and backlight sensor',
        'Seamless multi-device Bluetooth and Logi Bolt secure wireless connectivity',
      ],
      required: true,
    },
    {
      text: 'How likely are you to recommend the Logitech MX or PRO series to a coworker or esports gamer (1-10)?',
      type: 'scale',
      scaleMin: 1,
      scaleMax: 10,
      scaleMinLabel: 'Low',
      scaleMaxLabel: 'Absolute best peripherals (10)',
      required: true,
    },
    {
      text: 'Do you plan to purchase a new Logitech mouse, keyboard, or webcam in the coming year?',
      type: 'yes_no',
      required: true,
    },
    {
      text: 'What software improvements would you like to see in G HUB or Logi Options+ (e.g., lighter RAM usage, cloud backup)?',
      type: 'text',
      placeholder: 'Share your feedback with Logitech...',
      required: true,
    },
  ],

  // 30. Razer
  br_razer: [
    {
      text: 'How would you rate Razer Blade laptop CNC craftsmanship, Chroma RGB lighting synchronization, and optical mouse switches?',
      type: 'rating',
      required: true,
    },
    {
      text: 'What is the primary factor that draws you to Razer gaming lifestyle gear?',
      type: 'single_choice',
      options: [
        'Razer Blade anodized black aluminum unibody design and dual-mode OLED screens',
        'Razer Chroma RGB lighting ecosystem syncing across peripherals and smart home',
        'Gen-3 Optical mouse switches preventing debounce double-click issues',
        'BlackShark V2 Pro esports headset clarity and HyperClear microphone',
        'Razer Synapse customizable macro profiles and Hypershift dual-layer keys',
      ],
      required: true,
    },
    {
      text: 'How likely are you to recommend Razer gaming hardware to a PC gamer (1-10)?',
      type: 'scale',
      scaleMin: 1,
      scaleMax: 10,
      scaleMinLabel: 'Unlikely',
      scaleMaxLabel: 'Top gaming aesthetic & performance (10)',
      required: true,
    },
    {
      text: 'Do you plan to purchase a Razer Blade laptop, keyboard, or headset in the next 12 months?',
      type: 'yes_no',
      required: true,
    },
    {
      text: 'What features or updates would you suggest for the new Razer Synapse software platform?',
      type: 'text',
      placeholder: 'Send your suggestions to Razer...',
      required: true,
    },
  ],
};

// Generates dynamic, custom, contextual survey questions for any brand
export function getQuestionsForBrand(brandId: string, brandName: string, sector: string, keyProduct: string): Omit<Question, 'id' | 'order'>[] {
  if (BRAND_UNIQUE_SURVEYS[brandId]) {
    return BRAND_UNIQUE_SURVEYS[brandId];
  }

  const cleanName = brandName.replace(/\s*\(.*?\)\s*/g, '');

  // Tailor questions according to sector archetype
  const lowerSec = sector.toLowerCase();

  if (lowerSec.includes('food') || lowerSec.includes('coffee') || lowerSec.includes('restaurant') || lowerSec.includes('dining') || lowerSec.includes('beverage') || lowerSec.includes('ice cream')) {
    return [
      {
        text: `How would you rate the taste, freshness, and presentation of ${cleanName}'s menu items, specifically ${keyProduct}?`,
        type: 'rating',
        required: true,
      },
      {
        text: `What is your primary reason for ordering from ${cleanName} over competing eateries?`,
        type: 'single_choice',
        options: [
          `Signature flavor and consistent taste of ${keyProduct}`,
          'Fast speed of preparation and mobile pickup order convenience',
          'Generous loyalty rewards program and personalized app discounts',
          'Fresh, sustainably sourced high-quality ingredients',
          'Great value for money and friendly customer service',
        ],
        required: true,
      },
      {
        text: `How likely are you to recommend ${cleanName} to a friend or coworker looking for a meal or drink (1-10)?`,
        type: 'scale',
        scaleMin: 1,
        scaleMax: 10,
        scaleMinLabel: 'Not likely',
        scaleMaxLabel: 'Highly recommended (10)',
        required: true,
      },
      {
        text: `Do you plan on visiting or ordering from ${cleanName} in the next 30 days?`,
        type: 'yes_no',
        required: true,
      },
      {
        text: `What new seasonal menu item, dietary option (e.g. vegan, low-calorie), or app improvement would you love ${cleanName} to offer next?`,
        type: 'text',
        placeholder: 'Share your dining feedback and menu ideas...',
        required: true,
      },
    ];
  }

  if (lowerSec.includes('fashion') || lowerSec.includes('apparel') || lowerSec.includes('footwear') || lowerSec.includes('denim') || lowerSec.includes('sportswear') || lowerSec.includes('activewear')) {
    return [
      {
        text: `How would you rate the comfort, fabric durability, and fit of ${cleanName}'s apparel, especially ${keyProduct}?`,
        type: 'rating',
        required: true,
      },
      {
        text: `What is the most important factor when purchasing apparel or sneakers from ${cleanName}?`,
        type: 'single_choice',
        options: [
          'High performance athletic engineering and sweat-wicking materials',
          'Trendy silhouette, street-style aesthetic, and brand heritage',
          'Superior durability and shape retention after multiple washes',
          'True-to-size fit consistency across all collections',
          'Sustainable sourcing, recycled fabrics, and ethical manufacturing',
        ],
        required: true,
      },
      {
        text: `How likely are you to recommend ${cleanName} fashion & sportswear to a friend (1-10)?`,
        type: 'scale',
        scaleMin: 1,
        scaleMax: 10,
        scaleMinLabel: 'Low',
        scaleMaxLabel: 'Strongly recommend (10)',
        required: true,
      },
      {
        text: `Do you plan to shop for new seasonal clothes or shoes from ${cleanName} within the next 6 months?`,
        type: 'yes_no',
        required: true,
      },
      {
        text: `What style collections, sizing options, or store/online shopping improvements would you love ${cleanName} to introduce?`,
        type: 'text',
        placeholder: 'Share your fashion feedback and suggestions...',
        required: true,
      },
    ];
  }

  if (lowerSec.includes('ev') || lowerSec.includes('car') || lowerSec.includes('automotive') || lowerSec.includes('mobility') || lowerSec.includes('vehicle')) {
    return [
      {
        text: `How would you rate the driving dynamics, cabin comfort, and technology integration of ${cleanName} (${keyProduct})?`,
        type: 'rating',
        required: true,
      },
      {
        text: `What is the standout feature that makes ${cleanName} attractive in the automotive and EV market?`,
        type: 'single_choice',
        options: [
          'Instant electric acceleration, smooth handling, and quiet cabin ride',
          'Advanced driver assistance, autopilot tech, and touchscreen cockpit UI',
          'Real-world battery efficiency, fast charging speed, and range reliability',
          'Industry-benchmark safety crash test ratings and robust chassis engineering',
          'Iconic luxury exterior styling and premium interior seating materials',
        ],
        required: true,
      },
      {
        text: `How likely are you to recommend a ${cleanName} vehicle to someone looking to purchase or lease an automobile (1-10)?`,
        type: 'scale',
        scaleMin: 1,
        scaleMax: 10,
        scaleMinLabel: 'Unlikely',
        scaleMaxLabel: 'Definitely recommend (10)',
        required: true,
      },
      {
        text: `Would you consider purchasing, leasing, or taking a test drive in a ${cleanName} model over the next 12 to 24 months?`,
        type: 'yes_no',
        required: true,
      },
      {
        text: `What charging, over-the-air software, or interior convenience features would you like ${cleanName} to add next?`,
        type: 'text',
        placeholder: 'Share your automotive feedback with the engineering team...',
        required: true,
      },
    ];
  }

  if (lowerSec.includes('travel') || lowerSec.includes('hotel') || lowerSec.includes('airline') || lowerSec.includes('flight') || lowerSec.includes('booking') || lowerSec.includes('rideshare')) {
    return [
      {
        text: `How would you rate your booking ease, customer service, and overall travel experience with ${cleanName} (${keyProduct})?`,
        type: 'rating',
        required: true,
      },
      {
        text: `What is the main benefit you enjoy when traveling or booking with ${cleanName}?`,
        type: 'single_choice',
        options: [
          'Loyalty points rewards, tier perks, and complimentary upgrades',
          'Reliable on-time schedule, transparent pricing, and instant booking confirmation',
          'Clean, modern accommodations or onboard cabin luxury amenities',
          'Flexible change policies and hassle-free cancellation options',
          'Responsive 24/7 in-app customer support and live tracking',
        ],
        required: true,
      },
      {
        text: `How likely are you to recommend ${cleanName} for travel and hospitality bookings (1-10)?`,
        type: 'scale',
        scaleMin: 1,
        scaleMax: 10,
        scaleMinLabel: 'Low',
        scaleMaxLabel: 'Top travel choice (10)',
        required: true,
      },
      {
        text: `Do you plan on using ${cleanName} for your upcoming trips, flights, or local rides over the next 12 months?`,
        type: 'yes_no',
        required: true,
      },
      {
        text: `What loyalty perk, mobile app feature, or customer service improvement would make your experience with ${cleanName} even smoother?`,
        type: 'text',
        placeholder: 'Share your travel feedback and recommendations...',
        required: true,
      },
    ];
  }

  if (lowerSec.includes('retail') || lowerSec.includes('e-commerce') || lowerSec.includes('store') || lowerSec.includes('marketplace') || lowerSec.includes('warehouse')) {
    return [
      {
        text: `How would you rate the checkout speed, product selection, and delivery/pickup reliability of ${cleanName} (${keyProduct})?`,
        type: 'rating',
        required: true,
      },
      {
        text: `What makes ${cleanName} your preferred shopping destination?`,
        type: 'single_choice',
        options: [
          'Fast and reliable same-day delivery or seamless curbside pickup',
          'Competitive everyday low pricing and exclusive member savings perks',
          'Extensive curated product selection and trusted authentic inventory',
          'Smooth frictionless 1-click checkout and secure payment options',
          'Generous return policy and helpful customer support team',
        ],
        required: true,
      },
      {
        text: `How likely are you to recommend shopping at ${cleanName} to friends and family (1-10)?`,
        type: 'scale',
        scaleMin: 1,
        scaleMax: 10,
        scaleMinLabel: 'Not likely',
        scaleMaxLabel: 'Essential retailer (10)',
        required: true,
      },
      {
        text: `Do you plan on renewing your membership or shopping with ${cleanName} in the next 3 months?`,
        type: 'yes_no',
        required: true,
      },
      {
        text: `What product categories, delivery options, or app features would you like ${cleanName} to introduce or expand?`,
        type: 'text',
        placeholder: 'Share your retail feedback and suggestions...',
        required: true,
      },
    ];
  }

  // Default rich SaaS / AI / Software template
  return [
    {
      text: `How would you rate the efficiency, reliability, and interface intuitiveness of ${cleanName} and its ${keyProduct}?`,
      type: 'rating',
      required: true,
    },
    {
      text: `What is the most impactful capability ${cleanName} delivers for your workflow or daily routine?`,
      type: 'single_choice',
      options: [
        'Time-saving AI automation and smart suggestions that boost productivity',
        'Intuitive, distraction-free user interface and rapid responsiveness',
        'Cross-platform synchronization across desktop, mobile, and web browsers',
        'Robust team collaboration features and real-time multiplayer sharing',
        'Extensive third-party integrations and developer API flexibility',
      ],
      required: true,
    },
    {
      text: `How likely are you to recommend ${cleanName} to a colleague, teammate, or friend (1-10)?`,
      type: 'scale',
      scaleMin: 1,
      scaleMax: 10,
      scaleMinLabel: 'Unlikely',
      scaleMaxLabel: 'Must-have software (10)',
      required: true,
    },
    {
      text: `Do you plan to continue using or upgrading your subscription with ${cleanName} over the next 12 months?`,
      type: 'yes_no',
      required: true,
    },
    {
      text: `What specific feature, workflow integration, or UI refinement would you love ${cleanName} to release next?`,
      type: 'text',
      placeholder: 'Share your product feedback and wishlist...',
      required: true,
    },
  ];
}
