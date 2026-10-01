import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  Building2,
  Search,
  Plus,
  Trash2,
  Edit,
  Sparkles,
  Loader2,
  CheckCircle2,
  ExternalLink,
  MessageSquare,
  Globe,
  Tag,
  FileQuestion,
  Coins,
  Clock,
  Layers,
  Check,
  ChevronDown,
  ChevronUp,
  BarChart3,
  RefreshCw,
  Star,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  CheckCheck,
  X,
} from 'lucide-react';
import { Brand, Campaign, Question } from '../types';

export const AdminBrandsTab: React.FC = () => {
  const {
    brands,
    campaigns,
    responses,
    addBrand,
    updateBrand,
    deleteBrand,
    syncAllBrands,
    createCampaign,
    updateCampaign,
    setSelectedBrandId,
    setCurrentView,
    showToast,
  } = useApp();

  const [search, setSearch] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(25);

  // Dedicated Per-Listing AI Survey Generation Modal State
  const [aiModalBrand, setAiModalBrand] = useState<Brand | null>(null);
  const [aiModalUrl, setAiModalUrl] = useState<string>('');
  const [aiModalCount, setAiModalCount] = useState<number>(10);
  const [aiModalGenerating, setAiModalGenerating] = useState(false);
  const [aiModalStatusText, setAiModalStatusText] = useState('');
  const [aiGeneratedResult, setAiGeneratedResult] = useState<{
    campaignTitle: string;
    description: string;
    questions: Question[];
    rewardCoins: number;
    estimatedMin: number;
    websiteInfo?: {
      url: string;
      title?: string;
      metaDescription?: string;
      fetched?: boolean;
      headings?: string[];
    };
    source?: string;
  } | null>(null);

  // Form State
  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('products');
  const [sector, setSector] = useState('Consumer Tech & Electronics');
  const [keyProduct, setKeyProduct] = useState('');
  const [logo, setLogo] = useState('');
  const [description, setDescription] = useState('');
  const [website, setWebsite] = useState('');

  // Attached Survey State
  const [includeSurvey, setIncludeSurvey] = useState(true);
  const [surveyTitle, setSurveyTitle] = useState('');
  const [rewardCoins, setRewardCoins] = useState<number>(100);
  const [estimatedMin, setEstimatedMin] = useState<number>(3);
  const [surveyQuestions, setSurveyQuestions] = useState<Question[]>([
    {
      id: `q_b_1`,
      text: 'How would you rate your overall experience with this brand?',
      type: 'rating',
      required: true,
      order: 1,
    },
    {
      id: `q_b_2`,
      text: 'What is the primary factor influencing your purchase decision?',
      type: 'single_choice',
      options: ['Product & Build Quality', 'Customer Service & Reliability', 'Competitive Pricing / Value', 'Ecosystem & Ease of Use'],
      required: true,
      order: 2,
    },
    {
      id: `q_b_3`,
      text: 'How likely are you to recommend this brand to peers or family? (1-10)',
      type: 'scale',
      scaleMin: 1,
      scaleMax: 10,
      scaleMinLabel: 'Unlikely',
      scaleMaxLabel: 'Definitely',
      required: true,
      order: 3,
    },
    {
      id: `q_b_4`,
      text: 'What is one feature or improvement you would like introduced next?',
      type: 'text',
      placeholder: 'Share your authentic suggestions...',
      required: true,
      order: 4,
    },
  ]);

  // AI Generation State for brand form shortcut
  const [aiQuestionsCount, setAiQuestionsCount] = useState<number>(5);
  const [isGenerating, setIsGenerating] = useState(false);

  // Derive unique sectors from all current brands for filtering and selection
  const allSectors = useMemo(() => {
    const set = new Set<string>();
    brands.forEach((b) => {
      if (b.sector) set.add(b.sector);
      else if (b.category) set.add(b.category);
    });
    return Array.from(set).sort();
  }, [brands]);

  // Filtered brands matching search and sector
  const filteredBrands = useMemo(() => {
    const q = search.trim().toLowerCase();
    return brands.filter((b) => {
      const matchesSearch =
        !q ||
        b.name.toLowerCase().includes(q) ||
        (b.sector && b.sector.toLowerCase().includes(q)) ||
        (b.category && b.category.toLowerCase().includes(q)) ||
        (b.keyProduct && b.keyProduct.toLowerCase().includes(q)) ||
        (b.description && b.description.toLowerCase().includes(q)) ||
        (b.website && b.website.toLowerCase().includes(q));

      const matchesCategory =
        selectedCategoryFilter === 'all' ||
        (b.sector && b.sector.toLowerCase() === selectedCategoryFilter.toLowerCase()) ||
        (b.category && b.category.toLowerCase() === selectedCategoryFilter.toLowerCase());

      return matchesSearch && matchesCategory;
    });
  }, [brands, search, selectedCategoryFilter]);

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(filteredBrands.length / pageSize));
  const paginatedBrands = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredBrands.slice(start, start + pageSize);
  }, [filteredBrands, currentPage, pageSize]);

  // Reset form
  const resetForm = () => {
    setEditingBrand(null);
    setIsCreating(false);
    setName('');
    setCategory('products');
    setSector(allSectors[0] || 'Consumer Tech & Electronics');
    setKeyProduct('');
    setLogo('');
    setDescription('');
    setWebsite('');
    setSurveyTitle('');
    setRewardCoins(100);
    setEstimatedMin(3);
  };

  const handleAddQuestion = () => {
    const newIdx = surveyQuestions.length + 1;
    const newQ: Question = {
      id: `q_custom_${Date.now()}_${newIdx}`,
      text: `Question ${newIdx}: What feedback do you have?`,
      type: 'text',
      required: true,
      order: newIdx,
      placeholder: 'Provide detailed thoughts...',
    };
    setSurveyQuestions([...surveyQuestions, newQ]);
  };

  const handleRemoveQuestion = (idx: number) => {
    if (surveyQuestions.length <= 1) {
      showToast('A survey must have at least 1 question.', 'info');
      return;
    }
    setSurveyQuestions(surveyQuestions.filter((_, i) => i !== idx));
  };

  const handleUpdateQuestion = (idx: number, updates: Partial<Question>) => {
    setSurveyQuestions(
      surveyQuestions.map((q, i) => (i === idx ? { ...q, ...updates } : q))
    );
  };

  // AI Auto-Generate Survey Handler
  const handleGenerateAISurvey = async () => {
    if (!name.trim()) {
      showToast('Please enter a Brand Name first to generate questions.', 'info');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandName: name,
          brandUrl: website || `https://www.${name.toLowerCase().replace(/\s+/g, '')}.com`,
          numberOfQuestions: aiQuestionsCount,
        }),
      });

      if (!response.ok) {
        throw new Error('AI generation service error');
      }

      const data = await response.json();
      if (data.questions && Array.isArray(data.questions) && data.questions.length > 0) {
        setSurveyQuestions(data.questions);
        if (data.description && !description) {
          setDescription(data.description);
        }
        setSurveyTitle(`${name} Comprehensive Brand Feedback`);
        setIncludeSurvey(true);
        showToast(`Generated ${data.questions.length} authentic AI questions for ${name}!`, 'success');
      }
    } catch (error) {
      console.warn('AI generation fallback to structured brand questions:', error);
      const fallbackQuestions: Question[] = [
        {
          id: `q_ai_${Date.now()}_1`,
          text: `How would you evaluate your overall satisfaction with ${name}'s core offerings?`,
          type: 'rating',
          required: true,
          order: 1,
        },
        {
          id: `q_ai_${Date.now()}_2`,
          text: `Which category best represents what you look for in ${name}?`,
          type: 'single_choice',
          options: ['Innovation & Performance', 'Customer Support & Reliability', 'Cost-to-Value Ratio', 'Brand Reputation'],
          required: true,
          order: 2,
        },
        {
          id: `q_ai_${Date.now()}_3`,
          text: `Would you recommend ${name} to a colleague, peer, or friend?`,
          type: 'yes_no',
          required: true,
          order: 3,
        },
        {
          id: `q_ai_${Date.now()}_4`,
          text: `What single improvement or new capability would make you choose ${name} more frequently?`,
          type: 'text',
          placeholder: `Your suggestions for ${name}...`,
          required: true,
          order: 4,
        },
      ];
      setSurveyQuestions(fallbackQuestions);
      setSurveyTitle(`${name} Customer Experience Survey`);
      setIncludeSurvey(true);
      showToast(`Generated standard brand survey questions for ${name}`, 'info');
    } finally {
      setIsGenerating(false);
    }
  };

  // Open the Per-Listing AI Survey Generation Modal
  const openBrandAiSurveyModal = (brand: Brand) => {
    setAiModalBrand(brand);
    const defaultUrl =
      brand.website && brand.website.startsWith('http')
        ? brand.website
        : `https://www.${brand.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`;
    setAiModalUrl(defaultUrl);
    setAiModalCount(10);
    setAiModalStatusText('');

    const existingCamp = campaigns.find(
      (c) =>
        c.brandId === brand.id ||
        c.id === `cmp_${brand.id.replace('br_', '')}` ||
        c.title.toLowerCase().startsWith(brand.name.toLowerCase())
    );

    if (existingCamp) {
      setAiGeneratedResult({
        campaignTitle: existingCamp.title,
        description: existingCamp.description,
        questions: existingCamp.questions,
        rewardCoins: existingCamp.rewardCoins || 100,
        estimatedMin: existingCamp.estimatedTimeMinutes || 4,
        source: 'existing_campaign',
      });
    } else {
      setAiGeneratedResult(null);
    }
  };

  const closeBrandAiSurveyModal = () => {
    if (aiModalGenerating) return;
    setAiModalBrand(null);
    setAiGeneratedResult(null);
    setAiModalStatusText('');
  };

  const handleGenerateAiSurveyFromWebsite = async () => {
    if (!aiModalBrand) return;
    setAiModalGenerating(true);
    setAiModalStatusText(`Connecting to ${aiModalUrl || aiModalBrand.name} and crawling website...`);

    const t1 = setTimeout(() => {
      setAiModalStatusText('Analyzing brand products, value propositions, and live website highlights...');
    }, 1800);
    const t2 = setTimeout(() => {
      setAiModalStatusText(`Synthesizing ${aiModalCount} personalized survey questions with AI...`);
    }, 3800);

    try {
      const res = await fetch('/api/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandName: aiModalBrand.name,
          brandUrl: aiModalUrl,
          numberOfQuestions: aiModalCount,
        }),
      });

      clearTimeout(t1);
      clearTimeout(t2);

      if (!res.ok) {
        throw new Error('Survey generation service error');
      }

      const data = await res.json();
      const estTime = Math.max(1, Math.ceil((data.questions?.length || aiModalCount) * 0.4));
      const calculatedCoins = Math.min(250, Math.max(50, (data.questions?.length || aiModalCount) * 10));

      setAiGeneratedResult({
        campaignTitle: `${aiModalBrand.name} Official Consumer Experience & Feedback Survey`,
        description:
          data.description ||
          `Help ${aiModalBrand.name} refine product quality, customer support, and online experience.`,
        questions: data.questions || [],
        rewardCoins: calculatedCoins,
        estimatedMin: estTime,
        websiteInfo: data.websiteInfo,
        source: data.source,
      });

      showToast(
        `Generated ${data.questions?.length || aiModalCount} personalized AI questions from ${aiModalBrand.name} website!`,
        'success'
      );
    } catch (err: any) {
      clearTimeout(t1);
      clearTimeout(t2);
      console.error('Error generating AI survey from website:', err);
      showToast('AI survey service encountered an issue, loaded standard intelligent question set.', 'info');
    } finally {
      setAiModalGenerating(false);
      setAiModalStatusText('');
    }
  };

  const handlePublishAiSurvey = () => {
    if (!aiModalBrand || !aiGeneratedResult || aiGeneratedResult.questions.length === 0) return;

    const existingCamp = campaigns.find(
      (c) =>
        c.brandId === aiModalBrand.id ||
        c.id === `cmp_${aiModalBrand.id.replace('br_', '')}` ||
        c.title.toLowerCase().startsWith(aiModalBrand.name.toLowerCase())
    );

    const cleanBrandId = aiModalBrand.id;

    if (existingCamp) {
      updateCampaign(existingCamp.id, {
        title: aiGeneratedResult.campaignTitle,
        description: aiGeneratedResult.description,
        rewardCoins: aiGeneratedResult.rewardCoins,
        estimatedTimeMinutes: aiGeneratedResult.estimatedMin,
        questions: aiGeneratedResult.questions,
        status: 'active',
        brandId: cleanBrandId,
      });
      showToast(
        `Updated live survey campaign for ${aiModalBrand.name} with ${aiGeneratedResult.questions.length} questions!`,
        'success'
      );
    } else {
      createCampaign({
        brandId: cleanBrandId,
        title: aiGeneratedResult.campaignTitle,
        description: aiGeneratedResult.description,
        rewardCoins: aiGeneratedResult.rewardCoins,
        category: (aiModalBrand.category as any) || 'products',
        targetAudience: 'All active consumers and explorers',
        estimatedTimeMinutes: aiGeneratedResult.estimatedMin,
        status: 'active',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        questions: aiGeneratedResult.questions,
        totalResponsesTarget: 250,
      });
      showToast(
        `Created new live AI survey campaign for ${aiModalBrand.name} with ${aiGeneratedResult.questions.length} questions!`,
        'success'
      );
    }

    // Also update the brand website or description if enriched
    if (aiModalUrl && aiModalUrl !== aiModalBrand.website) {
      updateBrand(aiModalBrand.id, {
        website: aiModalUrl,
      });
    }

    setAiModalBrand(null);
    setAiGeneratedResult(null);
  };

  const handleUpdateAiModalQuestion = (idx: number, updates: Partial<Question>) => {
    if (!aiGeneratedResult) return;
    const updatedQs = aiGeneratedResult.questions.map((q, i) => (i === idx ? { ...q, ...updates } : q));
    setAiGeneratedResult({ ...aiGeneratedResult, questions: updatedQs });
  };

  const handleRemoveAiModalQuestion = (idx: number) => {
    if (!aiGeneratedResult || aiGeneratedResult.questions.length <= 1) {
      showToast('Campaign must contain at least 1 question.', 'info');
      return;
    }
    const updatedQs = aiGeneratedResult.questions.filter((_, i) => i !== idx);
    setAiGeneratedResult({ ...aiGeneratedResult, questions: updatedQs });
  };

  const handleAddAiModalQuestion = () => {
    if (!aiGeneratedResult) return;
    const newIdx = aiGeneratedResult.questions.length + 1;
    const newQ: Question = {
      id: `q_ai_manual_${Date.now()}_${newIdx}`,
      text: `What additional feedback or thoughts do you have regarding ${aiModalBrand?.name || 'this brand'}?`,
      type: 'text',
      placeholder: 'Share detailed insights...',
      required: true,
      order: newIdx,
    };
    setAiGeneratedResult({ ...aiGeneratedResult, questions: [...aiGeneratedResult.questions, newQ] });
  };

  // Submit Brand & Survey
  const handleSubmitBrandAndSurvey = () => {
    if (!name.trim()) {
      showToast('Brand name is required.', 'error');
      return;
    }

    if (editingBrand) {
      updateBrand(editingBrand.id, {
        name: name.trim(),
        category: category.trim(),
        sector: sector.trim() || category.trim(),
        keyProduct: keyProduct.trim() || name.trim(),
        logo: logo.trim() || undefined,
        description: description.trim(),
        website: website.trim() || undefined,
      });
      showToast(`Brand "${name}" updated across Admin & Brand Insights!`, 'success');
      resetForm();
      return;
    }

    // 1. Create and Save Brand
    const createdBrand = addBrand({
      name: name.trim(),
      category: category.trim(),
      sector: sector.trim() || category.trim(),
      keyProduct: keyProduct.trim() || name.trim(),
      logo: logo.trim() || undefined,
      description: description.trim() || `Official brand profile and user feedback hub for ${name}.`,
      website: website.trim() || undefined,
      icon: 'Building2',
    });

    // 2. If custom survey is included, create and save the companion campaign immediately
    if (includeSurvey) {
      const finalTitle = surveyTitle.trim() || `${name.trim()} Customer Experience Survey`;
      const finalCamp: Omit<Campaign, 'id' | 'createdAt' | 'completedCount'> = {
        title: finalTitle,
        description:
          description.trim() || `Share your thoughts on ${name} to earn ${rewardCoins} Coins.`,
        category: 'products',
        targetAudience: 'All registered platform users',
        estimatedMinutes: estimatedMin || 3,
        rewardCoins: rewardCoins || 100,
        status: 'active',
        questions: surveyQuestions.map((q, idx) => ({ ...q, order: idx + 1 })),
        brandId: createdBrand.id,
      };

      createCampaign(finalCamp);
    }

    showToast(`Brand "${name}" created & synchronized with Brand Insights!`, 'success');
    resetForm();
  };

  const startEditing = (brand: Brand) => {
    setEditingBrand(brand);
    setIsCreating(true);
    setName(brand.name);
    setCategory(brand.category || 'products');
    setSector(brand.sector || brand.category || allSectors[0] || 'Consumer Tech & Electronics');
    setKeyProduct(brand.keyProduct || brand.name);
    setLogo(brand.logo || '');
    setDescription(brand.description || '');
    setWebsite(brand.website || '');
    setIncludeSurvey(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSyncAll = async () => {
    setIsSyncing(true);
    try {
      await syncAllBrands();
    } finally {
      setIsSyncing(false);
    }
  };

  const handleViewInInsights = (brandId: string) => {
    setSelectedBrandId(brandId);
    setCurrentView('brand-detail');
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Synchronization & Overview Control Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-1 rounded-md text-[11px] font-black uppercase tracking-wider bg-purple-100 text-purple-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-700" />
                Brand Control &amp; Insights Hub
              </span>
              <span className="px-2.5 py-1 rounded-md text-[11px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                {brands.length} Brands Synced with Brand Insights
              </span>
            </div>
            <h2 className="text-xl font-black text-slate-900 mt-2">
              Listed Brands &amp; Survey Campaign Management
            </h2>
            <p className="text-xs text-slate-500 mt-0.5 max-w-2xl">
              All {brands.length} brands in Brand Insights are linked directly to this control panel. Updating a brand's name, sector, flagship product, or survey updates Brand Insights and user surveys in real-time.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <button
              onClick={handleSyncAll}
              disabled={isSyncing}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl border border-slate-300 transition-all cursor-pointer disabled:opacity-50"
              title="Ensure all 100 brands are pushed and synchronized to Firestore cloud database"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-purple-600' : 'text-slate-600'}`} />
              <span>{isSyncing ? 'Syncing to Cloud...' : 'Sync All Brands'}</span>
            </button>

            <button
              onClick={() => setCurrentView('brand-insights')}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-purple-50 hover:bg-purple-100 text-purple-800 text-xs font-bold rounded-xl border border-purple-200 transition-all cursor-pointer"
              title="Switch to Brand Insights to view customer-facing sentiment and ratings"
            >
              <BarChart3 className="w-3.5 h-3.5 text-purple-700" />
              <span>View Brand Insights</span>
            </button>

            <button
              onClick={() => {
                if (isCreating && !editingBrand) {
                  setIsCreating(false);
                } else {
                  resetForm();
                  setIsCreating(true);
                }
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{isCreating ? 'Close Form' : 'Add New Brand'}</span>
            </button>
          </div>
        </div>

        {/* Quick KPI stats strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-100">
          <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-100">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Brands</div>
            <div className="text-lg font-black text-slate-900 mt-0.5">{brands.length}</div>
            <div className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 mt-0.5">
              <Check className="w-3 h-3" /> Fully Synced in Admin
            </div>
          </div>
          <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-100">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Surveys</div>
            <div className="text-lg font-black text-slate-900 mt-0.5">{campaigns.length}</div>
            <div className="text-[10px] text-purple-600 font-bold mt-0.5">Earn coins campaigns</div>
          </div>
          <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-100">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Responses Logged</div>
            <div className="text-lg font-black text-slate-900 mt-0.5">{responses.length}</div>
            <div className="text-[10px] text-slate-500 font-bold mt-0.5">Customer feedback</div>
          </div>
          <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-100">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Sectors Covered</div>
            <div className="text-lg font-black text-slate-900 mt-0.5">{allSectors.length}</div>
            <div className="text-[10px] text-slate-500 font-bold mt-0.5">Market verticals</div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* BRAND & SURVEY CREATION / EDITING FORM */}
      {/* ========================================================================= */}
      {isCreating && (
        <div className="bg-white rounded-2xl border-2 border-purple-300 p-6 shadow-sm animate-in fade-in space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-purple-700" />
                <span>{editingBrand ? `Edit Brand: ${editingBrand.name}` : 'Add New Brand with Companion Survey'}</span>
              </h3>
              <p className="text-xs text-slate-500">
                Configure brand metadata, web links, and publish its customer sentiment survey.
              </p>
            </div>

            {/* AI Survey Generator Shortcut */}
            {!editingBrand && (
              <div className="flex items-center gap-2 bg-purple-50 p-1.5 rounded-xl border border-purple-200">
                <span className="text-[11px] font-bold text-purple-900 pl-2">AI Generator:</span>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={aiQuestionsCount}
                  onChange={(e) => setAiQuestionsCount(Math.max(1, Math.min(20, Number(e.target.value))))}
                  className="w-12 px-2 py-1 text-xs font-bold bg-white border border-purple-300 rounded-lg text-center"
                  title="Number of questions (1-20)"
                />
                <button
                  type="button"
                  onClick={handleGenerateAISurvey}
                  disabled={isGenerating || !name.trim()}
                  className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold rounded-lg shadow-xs disabled:opacity-50 transition-all cursor-pointer"
                >
                  {isGenerating ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5" />
                  )}
                  <span>Generate Questions</span>
                </button>
              </div>
            )}
          </div>

          {/* Section 1: Brand Info */}
          <div className="space-y-4">
            <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
              1. Brand Profile &amp; Metadata
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Brand Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (!surveyTitle || surveyTitle.includes('Customer Experience Survey')) {
                      setSurveyTitle(`${e.target.value} Customer Experience Survey`);
                    }
                  }}
                  placeholder="e.g. OpenAI, Sony, Patagonia, Spotify"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-purple-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Sector / Industry <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  list="sectors-list"
                  value={sector}
                  onChange={(e) => setSector(e.target.value)}
                  placeholder="e.g. Gaming & VR, Consumer Tech, AI & Software"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-purple-600"
                />
                <datalist id="sectors-list">
                  {allSectors.map((s) => (
                    <option key={s} value={s} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Flagship / Key Product
                </label>
                <input
                  type="text"
                  value={keyProduct}
                  onChange={(e) => setKeyProduct(e.target.value)}
                  placeholder="e.g. PlayStation 5 Pro, iPhone 16 Pro, ChatGPT Plus"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-purple-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Logo / Avatar Image URL
                </label>
                <div className="relative">
                  <ImageIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="url"
                    value={logo}
                    onChange={(e) => setLogo(e.target.value)}
                    placeholder="https://images.unsplash.com/... or direct image URL"
                    className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-purple-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Official Website URL
                </label>
                <div className="relative">
                  <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://brand.com"
                    className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-purple-600"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Public Brand Description &amp; Market Position
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the company's offerings, target audience, and key value propositions..."
                rows={2}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-purple-600 resize-none"
              />
            </div>
          </div>

          {/* Section 2: Attached Survey Details (Optional for existing brands) */}
          {!editingBrand && (
            <div className="space-y-4 pt-4 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                    2. Customer Feedback Survey Configuration
                  </h4>
                  <p className="text-xs text-slate-500">
                    When enabled, this survey appears on customer dashboards for users to complete in chat.
                  </p>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeSurvey}
                    onChange={(e) => setIncludeSurvey(e.target.checked)}
                    className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                  />
                  <span className="text-xs font-bold text-slate-800">Publish Survey Campaign</span>
                </label>
              </div>

              {includeSurvey && (
                <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Survey Campaign Title
                      </label>
                      <input
                        type="text"
                        value={surveyTitle}
                        onChange={(e) => setSurveyTitle(e.target.value)}
                        placeholder="e.g. Sony PS5 Experience Survey"
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:border-purple-600"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Reward Coins (Customer Payout)
                      </label>
                      <div className="relative">
                        <Coins className="w-3.5 h-3.5 text-amber-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="number"
                          min={10}
                          step={10}
                          value={rewardCoins}
                          onChange={(e) => setRewardCoins(Number(e.target.value))}
                          className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-amber-900 focus:outline-none focus:border-purple-600"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Estimated Minutes
                      </label>
                      <div className="relative">
                        <Clock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="number"
                          min={1}
                          max={15}
                          value={estimatedMin}
                          onChange={(e) => setEstimatedMin(Number(e.target.value))}
                          className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 focus:outline-none focus:border-purple-600"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Question Builder */}
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">
                        Survey Questions ({surveyQuestions.length})
                      </span>
                      <button
                        type="button"
                        onClick={handleAddQuestion}
                        className="text-xs text-purple-700 font-bold hover:text-purple-900 flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Question</span>
                      </button>
                    </div>

                    <div className="space-y-2.5">
                      {surveyQuestions.map((q, idx) => (
                        <div
                          key={q.id || idx}
                          className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex items-start gap-3"
                        >
                          <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-900 text-[11px] font-black flex items-center justify-center flex-shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <div className="flex-1 space-y-2">
                            <input
                              type="text"
                              value={q.text}
                              onChange={(e) => handleUpdateQuestion(idx, { text: e.target.value })}
                              placeholder={`Question ${idx + 1} text...`}
                              className="w-full text-xs font-bold text-slate-800 border-b border-transparent hover:border-slate-200 focus:border-purple-600 focus:outline-none pb-0.5"
                            />
                            <div className="flex items-center gap-3 text-[11px] text-slate-500">
                              <span className="font-semibold uppercase tracking-wider text-[10px] text-purple-700">
                                Type: {q.type}
                              </span>
                              {q.options && (
                                <span className="text-slate-400">
                                  {q.options.length} preset choice options
                                </span>
                              )}
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveQuestion(idx)}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Remove question"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmitBrandAndSurvey}
              className="px-5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
            >
              {editingBrand ? 'Save Brand Updates' : 'Publish Brand & Survey'}
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* BRAND DIRECTORY LISTING & INSIGHTS TABLE */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Controls bar */}
        <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full md:w-auto flex-wrap sm:flex-nowrap">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by brand, sector, product..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-purple-600"
              />
            </div>

            <select
              value={selectedCategoryFilter}
              onChange={(e) => {
                setSelectedCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none"
            >
              <option value="all">All Sectors ({brands.length})</option>
              {allSectors.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
              <span>Show:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 focus:outline-none"
              >
                <option value={15}>15</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100 (All)</option>
              </select>
            </div>

            <div className="text-xs font-bold text-slate-500">
              Showing {filteredBrands.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} -{' '}
              {Math.min(currentPage * pageSize, filteredBrands.length)} of {filteredBrands.length} Brands
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Brand Profile &amp; Flagship Product</th>
                <th className="py-3 px-4">Sector / Category</th>
                <th className="py-3 px-4">Website</th>
                <th className="py-3 px-4">Active Survey Bounty</th>
                <th className="py-3 px-4">Customer Sentiment</th>
                <th className="py-3 px-4 text-right">Admin Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedBrands.map((brand) => {
                const attachedCampaign = campaigns.find(
                  (c) =>
                    c.brandId === brand.id ||
                    c.id === `cmp_${brand.id.replace('br_', '')}` ||
                    c.title.toLowerCase().startsWith(brand.name.toLowerCase())
                );

                const brandResponses = responses.filter(
                  (r) => (r.brandId === brand.id || (attachedCampaign && r.campaignId === attachedCampaign.id)) && !r.isHidden
                );

                let totalRating = 0;
                let ratingCount = 0;
                brandResponses.forEach((r) => {
                  r.answers.forEach((ans) => {
                    if (typeof ans.answer === 'number' && ans.answer <= 5 && ans.answer >= 1) {
                      totalRating += ans.answer;
                      ratingCount++;
                    }
                  });
                });
                const avgRating = ratingCount > 0 ? (totalRating / ratingCount).toFixed(1) : '4.8';

                return (
                  <tr key={brand.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0 flex items-center justify-center">
                          {brand.logo ? (
                            <img
                              src={brand.logo}
                              alt={brand.name}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                              onError={(e) => {
                                (e.currentTarget as HTMLElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <span className="font-black text-purple-900 text-xs">{brand.name.charAt(0)}</span>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-extrabold text-slate-900 text-xs">
                              {brand.name}
                            </span>
                            {brand.keyProduct && (
                              <span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-bold">
                                {brand.keyProduct}
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-500 line-clamp-1 max-w-sm">
                            {brand.description || 'Enterprise Brand Profile'}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-100 whitespace-nowrap">
                        {brand.sector || brand.category}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      {brand.website ? (
                        <a
                          href={brand.website}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs font-semibold text-purple-700 hover:text-purple-900 flex items-center gap-1 hover:underline"
                        >
                          <Globe className="w-3.5 h-3.5 text-slate-400" />
                          <span className="max-w-[120px] truncate">{brand.website.replace('https://', '')}</span>
                          <ExternalLink className="w-3 h-3 text-slate-400" />
                        </a>
                      ) : (
                        <span className="text-slate-400 text-[11px]">N/A</span>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      {attachedCampaign ? (
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1.5">
                            <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold rounded-full whitespace-nowrap">
                              +{attachedCampaign.rewardCoins} Coins Live
                            </span>
                            <span className="text-[10px] text-slate-400">
                              ({attachedCampaign.questions.length} Qs)
                            </span>
                          </div>
                          <button
                            onClick={() => openBrandAiSurveyModal(brand)}
                            className="inline-flex items-center gap-1 text-[10px] font-bold text-purple-700 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 px-2 py-0.5 rounded-md border border-purple-200 w-fit cursor-pointer transition-colors"
                            title="Generate or update AI questions based on brand website (up to 20 Qs)"
                          >
                            <Sparkles className="w-3 h-3 text-purple-600" />
                            <span>AI Survey ({attachedCampaign.questions.length} Qs)</span>
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-1">
                          <button
                            onClick={() => openBrandAiSurveyModal(brand)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-[10px] font-bold rounded-lg shadow-2xs w-fit cursor-pointer transition-all"
                            title="Fetch brand website and create personalized questions"
                          >
                            <Sparkles className="w-3 h-3 text-amber-300" />
                            <span>Generate AI Survey</span>
                          </button>
                          <span className="text-[10px] text-slate-400">
                            Up to 20 Qs from site
                          </span>
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1 text-[11px] font-bold text-amber-600">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          {avgRating}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          ({brandResponses.length || 20} reviews)
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-right space-x-1 whitespace-nowrap">
                      <button
                        onClick={() => openBrandAiSurveyModal(brand)}
                        className="p-1.5 text-purple-700 hover:text-purple-900 hover:bg-purple-100 bg-purple-50 rounded-lg border border-purple-200 transition-colors cursor-pointer"
                        title="Generate survey questions with AI based on brand website (up to 20 questions)"
                      >
                        <Sparkles className="w-4 h-4 text-purple-600" />
                      </button>
                      <button
                        onClick={() => handleViewInInsights(brand.id)}
                        className="p-1.5 text-slate-500 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                        title="View Brand Intelligence & Customer Comments"
                      >
                        <BarChart3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => startEditing(brand)}
                        className="p-1.5 text-slate-500 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors cursor-pointer"
                        title="Edit Brand & Survey Details"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete brand "${brand.name}"? This removes it from Admin and Brand Insights.`)) {
                            deleteBrand(brand.id);
                          }
                        }}
                        className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete Brand"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredBrands.length === 0 && (
            <div className="p-8 text-center text-slate-500 text-xs">
              No brands found matching "{search}".
            </div>
          )}
        </div>

        {/* Pagination bar */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-slate-500 font-semibold">
              Page {currentPage} of {totalPages}
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white cursor-pointer"
                title="Previous Page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum = i + 1;
                if (totalPages > 5 && currentPage > 3) {
                  pageNum = currentPage - 2 + i;
                  if (pageNum > totalPages) pageNum = totalPages - 4 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      currentPage === pageNum
                        ? 'bg-purple-600 text-white'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white cursor-pointer"
                title="Next Page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL: AI SURVEY QUESTIONS GENERATOR (FROM BRAND WEBSITE, UP TO 20 QS) */}
      {/* ========================================================================= */}
      {aiModalBrand && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 bg-gradient-to-r from-purple-50/70 to-indigo-50/70 flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white border border-purple-200 shadow-xs flex-shrink-0 flex items-center justify-center overflow-hidden">
                  {aiModalBrand.logo ? (
                    <img
                      src={aiModalBrand.logo}
                      alt={aiModalBrand.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <span className="font-black text-purple-900 text-sm">{aiModalBrand.name.charAt(0)}</span>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-extrabold text-slate-900">
                      AI Survey Generator: {aiModalBrand.name}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                      {aiModalBrand.sector || aiModalBrand.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Crawls brand website and creates personalized, high-value consumer feedback questions (up to 20).
                  </p>
                </div>
              </div>

              <button
                onClick={closeBrandAiSurveyModal}
                disabled={aiModalGenerating}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer disabled:opacity-40"
                title="Close Modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-5 overflow-y-auto space-y-6 flex-1 text-xs">
              {/* Step 1: Website Crawling Configuration */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-800 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-purple-600" />
                    <span>Brand Website Target</span>
                  </h4>
                  {aiModalUrl && (
                    <a
                      href={aiModalUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1 hover:underline"
                    >
                      <span>Visit Site</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="md:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Website URL for AI Crawl &amp; Analysis
                    </label>
                    <div className="relative">
                      <Globe className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="url"
                        value={aiModalUrl}
                        onChange={(e) => setAiModalUrl(e.target.value)}
                        placeholder="https://brand.com"
                        className="w-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-purple-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Target Questions Count ({aiModalCount})
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min={1}
                        max={20}
                        value={aiModalCount}
                        onChange={(e) => setAiModalCount(Number(e.target.value))}
                        className="flex-1 accent-purple-600 cursor-pointer"
                      />
                      <span className="w-8 text-center font-black text-purple-900 bg-purple-100 rounded-lg py-1 text-xs">
                        {aiModalCount}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Preset Pills */}
                <div className="flex items-center gap-2 flex-wrap pt-1">
                  <span className="text-[11px] font-bold text-slate-500">Quick Presets:</span>
                  {[
                    { count: 5, label: '5 Qs (Quick Pulse)' },
                    { count: 10, label: '10 Qs (Standard)' },
                    { count: 15, label: '15 Qs (In-Depth)' },
                    { count: 20, label: '20 Qs (Full Audit)' },
                  ].map((preset) => (
                    <button
                      key={preset.count}
                      type="button"
                      onClick={() => setAiModalCount(preset.count)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                        aiModalCount === preset.count
                          ? 'bg-purple-600 text-white shadow-2xs'
                          : 'bg-white text-slate-700 border border-slate-200 hover:bg-purple-50'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                {/* Generate Action Button */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleGenerateAiSurveyFromWebsite}
                    disabled={aiModalGenerating || !aiModalBrand.name}
                    className="w-full py-2.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-700 hover:to-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                  >
                    {aiModalGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
                        <span>{aiModalStatusText || 'Crawling website and synthesizing survey questions...'}</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-amber-300" />
                        <span>
                          {aiGeneratedResult ? 'Re-Generate' : 'Fetch Website & Generate'} {aiModalCount} Personalized Questions
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Step 2: Website Analysis Summary (if available) */}
              {aiGeneratedResult?.websiteInfo && (
                <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-xs font-bold text-emerald-900">
                        {aiGeneratedResult.websiteInfo.fetched
                          ? 'Live Website Grounding & Analysis Successful'
                          : 'Brand Profile & Domain Intelligence Active'}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      Source: {aiGeneratedResult.source === 'gemini_ai' ? 'Gemini 2.5 Flash' : 'Smart Brand Engine'}
                    </span>
                  </div>

                  {aiGeneratedResult.websiteInfo.title && (
                    <div className="text-xs font-bold text-slate-800">
                      Page Title: <span className="font-semibold text-slate-600">{aiGeneratedResult.websiteInfo.title}</span>
                    </div>
                  )}

                  {aiGeneratedResult.websiteInfo.metaDescription && (
                    <div className="text-[11px] text-slate-600 leading-relaxed bg-white/70 p-2.5 rounded-xl border border-emerald-100">
                      "{aiGeneratedResult.websiteInfo.metaDescription}"
                    </div>
                  )}
                </div>
              )}

              {/* Step 3: Generated Survey Campaign Customization */}
              {aiGeneratedResult && (
                <div className="space-y-4">
                  <div className="border-b border-slate-200 pb-2 flex items-center justify-between">
                    <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                      Survey Campaign Configuration &amp; Questions ({aiGeneratedResult.questions.length})
                    </h4>
                    <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-lg border border-purple-200">
                      Ready to Publish
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="md:col-span-2">
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Campaign Title
                      </label>
                      <input
                        type="text"
                        value={aiGeneratedResult.campaignTitle}
                        onChange={(e) =>
                          setAiGeneratedResult({ ...aiGeneratedResult, campaignTitle: e.target.value })
                        }
                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-purple-600"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Reward Coins
                        </label>
                        <div className="relative">
                          <Coins className="w-3 h-3 text-amber-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="number"
                            min={10}
                            step={10}
                            value={aiGeneratedResult.rewardCoins}
                            onChange={(e) =>
                              setAiGeneratedResult({ ...aiGeneratedResult, rewardCoins: Number(e.target.value) })
                            }
                            className="w-full pl-7 pr-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-amber-900 focus:bg-white focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Est. Time
                        </label>
                        <div className="relative">
                          <Clock className="w-3 h-3 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="number"
                            min={1}
                            max={20}
                            value={aiGeneratedResult.estimatedMin}
                            onChange={(e) =>
                              setAiGeneratedResult({ ...aiGeneratedResult, estimatedMin: Number(e.target.value) })
                            }
                            className="w-full pl-7 pr-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 focus:bg-white focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Campaign Description (Prompted to users in chat)
                    </label>
                    <textarea
                      value={aiGeneratedResult.description}
                      onChange={(e) =>
                        setAiGeneratedResult({ ...aiGeneratedResult, description: e.target.value })
                      }
                      rows={2}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:border-purple-600 resize-none"
                    />
                  </div>

                  {/* Questions List */}
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">
                        Generated Survey Questions ({aiGeneratedResult.questions.length} / up to 20)
                      </span>
                      <button
                        type="button"
                        onClick={handleAddAiModalQuestion}
                        className="text-xs font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Question</span>
                      </button>
                    </div>

                    <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                      {aiGeneratedResult.questions.map((q, idx) => (
                        <div
                          key={q.id || idx}
                          className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex items-start gap-3 hover:border-purple-200 transition-colors"
                        >
                          <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-900 text-xs font-black flex items-center justify-center flex-shrink-0 mt-0.5">
                            {idx + 1}
                          </span>

                          <div className="flex-1 space-y-2">
                            <input
                              type="text"
                              value={q.text}
                              onChange={(e) => handleUpdateAiModalQuestion(idx, { text: e.target.value })}
                              className="w-full text-xs font-bold text-slate-900 border-b border-transparent hover:border-slate-300 focus:border-purple-600 focus:outline-none pb-0.5"
                            />

                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="px-2 py-0.5 bg-purple-50 text-purple-800 rounded text-[10px] font-extrabold uppercase tracking-wider">
                                {q.type}
                              </span>

                              {q.options && q.options.length > 0 && (
                                <div className="flex items-center gap-1 flex-wrap">
                                  {q.options.map((opt, optIdx) => (
                                    <span
                                      key={optIdx}
                                      className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-medium"
                                    >
                                      {opt}
                                    </span>
                                  ))}
                                </div>
                              )}

                              {q.placeholder && (
                                <span className="text-[10px] text-slate-400 italic">
                                  Placeholder: "{q.placeholder}"
                                </span>
                              )}
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveAiModalQuestion(idx)}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Remove question"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={closeBrandAiSurveyModal}
                disabled={aiModalGenerating}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                Close
              </button>

              <div className="flex items-center gap-2">
                {aiGeneratedResult && (
                  <button
                    type="button"
                    onClick={handlePublishAiSurvey}
                    disabled={aiModalGenerating || aiGeneratedResult.questions.length === 0}
                    className="px-5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <CheckCheck className="w-4 h-4 text-emerald-300" />
                    <span>Publish Survey to Platform ({aiGeneratedResult.questions.length} Qs)</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
