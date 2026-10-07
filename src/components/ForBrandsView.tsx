import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { SEOHead } from './SEOHead';
import {
  Building2,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  BarChart3,
  Users,
  Globe2,
  Clock,
  ShieldCheck,
  FileText,
  DollarSign,
  HelpCircle,
  Layers,
  Send,
  ExternalLink,
  ChevronDown,
  Info,
  Eye,
} from 'lucide-react';
import { MarketResearchMethodology } from '../types';
import { validateRealEmail } from '../utils/emailValidation';

interface MethodologyInfo {
  id: MarketResearchMethodology;
  name: string;
  badge: string;
  description: string;
  bestFor: string;
  turnaround: string;
}

const METHODOLOGIES: MethodologyInfo[] = [
  {
    id: 'conversational_voice_text',
    name: 'Conversational Voice & Text Survey',
    badge: 'Flagship Voice',
    description: 'Dynamic chat survey collecting natural spoken voice recordings and typed responses with semantic AI sentiment analysis.',
    bestFor: 'Nuanced emotional reactions, product sentiment, genuine tone-of-voice feedback',
    turnaround: '48 Hours',
  },
  {
    id: 'concept_feature_validation',
    name: 'Concept & Feature Validation',
    badge: 'Pre-Launch',
    description: 'Present product mockups, value propositions, and upcoming features to target audiences before committing engineering resources.',
    bestFor: 'Roadmap prioritization, feature demand testing, MVP viability checks',
    turnaround: '48 - 72 Hours',
  },
  {
    id: 'pricing_sensitivity',
    name: 'Price Sensitivity Analysis (Van Westendorp)',
    badge: 'Economics',
    description: 'Scientific 4-point price testing assessing point of marginal cheapness, optimal price point, and point of marginal expensiveness.',
    bestFor: 'SaaS pricing, retail MSRP optimization, subscription tier calibration',
    turnaround: '3 - 5 Days',
  },
  {
    id: 'brand_perception_awareness',
    name: 'Brand Perception & Awareness Study',
    badge: 'Brand Health',
    description: 'Measure unaided & aided recall, brand affinity, Net Promoter Score (NPS), and qualitative associations against competitors.',
    bestFor: 'Brand positioning, rebranding evaluation, campaign ROI tracking',
    turnaround: '3 - 5 Days',
  },
  {
    id: 'usability_product_feedback',
    name: 'Product Usability & Customer Experience',
    badge: 'UX Testing',
    description: 'Gather feedback on digital customer journeys, onboarding flows, packaging design, and unboxing satisfaction.',
    bestFor: 'App/web UX, consumer goods unboxing, purchase friction identification',
    turnaround: '48 - 72 Hours',
  },
  {
    id: 'competitor_benchmark',
    name: 'Competitor Benchmark & Share of Voice',
    badge: 'Market Intel',
    description: 'Head-to-head consumer sentiment comparison pitting your brand against top 3 industry incumbents across key purchase drivers.',
    bestFor: 'Dethroning competitors, positioning battlecards, gap analysis',
    turnaround: '3 - 5 Days',
  },
  {
    id: 'custom_study',
    name: 'Custom Tailored Enterprise Study',
    badge: 'Bespoke',
    description: 'Custom question trees, conditional logic, multi-stage longitudinal panels, or specialized niche demographic screening.',
    bestFor: 'Complex enterprise research, institutional whitepapers, investor diligence',
    turnaround: '1 - 2 Weeks',
  },
];

const PRICING_TIERS = [
  {
    name: 'Starter Pulse',
    price: 'Standard Package',
    sampleSize: '250 Verified Respondents',
    turnaround: '48 Hours Delivery',
    tag: 'Quick Validation',
    popular: false,
    features: [
      'Up to 250 verified consumer responses',
      'Conversational chat survey deployment',
      'Aggregated NPS and CSAT sentiment metrics',
      'Age and gender demographic breakdowns',
      'Raw CSV & JSON dataset export',
    ],
  },
  {
    name: 'Growth Deep-Dive',
    price: 'Growth Package',
    sampleSize: '750 Verified Respondents',
    turnaround: '48 - 72 Hours Delivery',
    tag: 'Most Popular',
    popular: true,
    features: [
      'Up to 750 multi-country respondents',
      'Audio voice transcripts + text insights',
      'Targeted demographic and geographic screening',
      'AI sentiment cluster & theme analysis',
      'Interactive cross-tabulation dashboard',
      'Executive Summary Presentation Deck (PDF)',
    ],
  },
  {
    name: 'Enterprise Scale',
    price: 'Enterprise Bespoke',
    sampleSize: '1,500 - 5,000+ Respondents',
    turnaround: '3 - 5 Days Delivery',
    tag: 'Enterprise & Agencies',
    popular: false,
    features: [
      '1,500+ targeted panel participants',
      'Van Westendorp price modeling or custom logic',
      'Competitor benchmark cross-comparison',
      'Dedicated Market Research Project Manager',
      'Custom quota balancing by region/age/income',
      'Brand Insights live report publication option',
    ],
  },
];

const SAMPLE_SIZE_OPTIONS = [
  { size: 100, label: '100 Respondents (Fast Pilot)' },
  { size: 250, label: '250 Respondents (Starter)' },
  { size: 500, label: '500 Respondents (Recommended)' },
  { size: 750, label: '750 Respondents (Deep-Dive)' },
  { size: 1000, label: '1,000 Respondents (High Statistical Power)' },
  { size: 2500, label: '2,500+ Respondents (Enterprise Scale)' },
];

const GEOGRAPHIC_REGIONS = [
  'Global / Worldwide (Cross-Border)',
  'North America (United States & Canada)',
  'Europe (United Kingdom & EU Countries)',
  'Asia-Pacific (Japan, Australia, Singapore, India)',
  'Latin America (Brazil, Mexico, Argentina)',
  'Middle East & North Africa (UAE, Saudi Arabia)',
  'United States (Nationwide Representative)',
  'United Kingdom (National Sample)',
  'Specific Custom Region (Detail in Notes)',
];

const PRODUCT_CATEGORIES = [
  'Fashion & Apparel',
  'Consumer Tech & Gadgets',
  'Food & Beverage (CPG)',
  'Beauty, Skincare & Personal Care',
  'Software, SaaS & Mobile Apps',
  'Health, Wellness & Fitness',
  'Financial Services & Fintech',
  'Home, Furniture & Living',
  'Automotive & EV Mobility',
  'Gaming & Entertainment',
  'Travel, Hospitality & Tourism',
  'Other / Emerging Sector',
];

const AGE_GROUP_OPTIONS = ['18-24', '25-34', '35-44', '45-54', '55+'];

export const ForBrandsView: React.FC = () => {
  const { addBrandInquiry, setCurrentView, showToast } = useApp();

  // Form State
  const [brandName, setBrandName] = useState('');
  const [brandLogo, setBrandLogo] = useState('');
  const [productOrServiceName, setProductOrServiceName] = useState('');
  const [productCategory, setProductCategory] = useState(PRODUCT_CATEGORIES[0]);
  const [methodology, setMethodology] = useState<MarketResearchMethodology>('conversational_voice_text');
  const [sampleSize, setSampleSize] = useState<number>(500);
  const [geographicRegion, setGeographicRegion] = useState(GEOGRAPHIC_REGIONS[1]);
  const [selectedAgeGroups, setSelectedAgeGroups] = useState<string[]>(['18-24', '25-34', '35-44']);
  const [gender, setGender] = useState<'all' | 'male' | 'female' | 'non_binary'>('all');
  const [demographicNotes, setDemographicNotes] = useState('');
  
  // Contact
  const [contactName, setContactName] = useState('');
  const [workEmail, setWorkEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [companyWebsite, setCompanyWebsite] = useState('');
  const [timeline, setTimeline] = useState('Standard (1-2 weeks)');
  const [message, setMessage] = useState('');

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [submittedInquiryId, setSubmittedInquiryId] = useState<string>('');
  const [emailError, setEmailError] = useState<string | null>(null);

  // Dynamic estimated research scope
  const currentSampleConfig = SAMPLE_SIZE_OPTIONS.find((s) => s.size === sampleSize) || SAMPLE_SIZE_OPTIONS[2];

  const toggleAgeGroup = (group: string) => {
    setSelectedAgeGroups((prev) =>
      prev.includes(group) ? prev.filter((g) => g !== group) : [...prev, group]
    );
  };

  const selectAllAges = () => {
    if (selectedAgeGroups.length === AGE_GROUP_OPTIONS.length) {
      setSelectedAgeGroups([]);
    } else {
      setSelectedAgeGroups([...AGE_GROUP_OPTIONS]);
    }
  };

  const handleEmailBlur = () => {
    if (!workEmail.trim()) {
      setEmailError('Work email is required');
      return;
    }
    const validation = validateRealEmail(workEmail.trim());
    if (!validation.isValid) {
      setEmailError(validation.error || 'Please enter a valid business email');
    } else {
      setEmailError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!brandName.trim()) {
      showToast('Please enter your Brand Name', 'error');
      return;
    }
    if (!productOrServiceName.trim()) {
      showToast('Please enter your Product or Service Name', 'error');
      return;
    }
    if (!contactName.trim()) {
      showToast('Please enter your Contact Name', 'error');
      return;
    }
    if (!workEmail.trim()) {
      showToast('Please enter your Work Email', 'error');
      return;
    }

    const emailCheck = validateRealEmail(workEmail.trim());
    if (!emailCheck.isValid) {
      setEmailError(emailCheck.error || 'Please enter a valid business email');
      showToast(emailCheck.error || 'Please enter a valid business email', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      const created = await addBrandInquiry({
        brandName: brandName.trim(),
        brandLogo: brandLogo.trim() || undefined,
        productOrServiceName: productOrServiceName.trim(),
        productCategory,
        methodology,
        sampleSize,
        geographicRegion,
        targetDemographics: {
          ageGroups: selectedAgeGroups.length > 0 ? selectedAgeGroups : ['All Ages'],
          gender,
          additionalNotes: demographicNotes.trim() || undefined,
        },
        contactInfo: {
          contactName: contactName.trim(),
          workEmail: workEmail.trim(),
          phone: phone.trim() || undefined,
          companyWebsite: companyWebsite.trim() || undefined,
          timeline,
        },
        message: message.trim() || undefined,
        estimatedPriceUsd: 0,
      });

      setSubmittedInquiryId(created.id);
      setIsSuccessModalOpen(true);
    } catch (err) {
      console.error('Submission error:', err);
      showToast('Failed to submit inquiry. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full bg-[#f8f9fc] text-slate-900 min-h-screen pb-20">
      <SEOHead
        title="Market Research for Brands - Conversational Studies & Consumer Intelligence | Voice Flow 360"
        description="Launch high-impact market research studies for your products or services. Reach targeted active consumer cohorts with conversational voice surveys, price sensitivity testing, and NPS intelligence."
        canonicalPath="/for-brands"
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-purple-950 via-slate-900 to-slate-950 text-white pt-16 pb-20 px-4 sm:px-6 lg:px-8 border-b border-purple-900/40">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(168,85,247,0.25),rgba(255,255,255,0))]" />
        
        <div className="relative max-w-6xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs sm:text-sm font-semibold tracking-wide uppercase">
            <Building2 className="w-4 h-4 text-purple-400" />
            Enterprise & Direct-to-Consumer Market Research
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white max-w-4xl mx-auto leading-[1.15]">
            Validate Products & Capture Real Consumer Sentiment <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-300 to-indigo-300">Before You Launch</span>
          </h1>

          <p className="text-base sm:text-lg lg:text-xl text-slate-300 max-w-3xl mx-auto font-normal leading-relaxed">
            Reach target consumer cohorts for qualitative audio feedback, Net Promoter Scores, and demographic cross-tabulation in 48 to 72 hours.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <a
              href="#inquiry-form"
              className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm sm:text-base shadow-lg shadow-purple-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Send className="w-4 h-4" />
              Submit Research Brief
            </a>
            <button
              onClick={() => setCurrentView('brand-insights')}
              className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-sm sm:text-base border border-white/20 backdrop-blur transition-all"
            >
              <BarChart3 className="w-4 h-4 text-purple-300" />
              View Sample Brand Studies
            </button>
          </div>

          {/* Metric Highlights */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-10 border-t border-slate-800/80">
            <div className="p-4 rounded-xl bg-white/[0.04] border border-white/10 text-center">
              <div className="text-2xl sm:text-3xl font-black text-purple-400">Targeted</div>
              <div className="text-xs text-slate-400 mt-1 font-medium">Consumer Cohorts</div>
            </div>
            <div className="p-4 rounded-xl bg-white/[0.04] border border-white/10 text-center">
              <div className="text-2xl sm:text-3xl font-black text-indigo-400">48-72h</div>
              <div className="text-xs text-slate-400 mt-1 font-medium">Average Report Turnaround</div>
            </div>
            <div className="p-4 rounded-xl bg-white/[0.04] border border-white/10 text-center">
              <div className="text-2xl sm:text-3xl font-black text-emerald-400">Multi-Market</div>
              <div className="text-xs text-slate-400 mt-1 font-medium">Regional Coverage</div>
            </div>
            <div className="p-4 rounded-xl bg-white/[0.04] border border-white/10 text-center">
              <div className="text-2xl sm:text-3xl font-black text-amber-400">Audited</div>
              <div className="text-xs text-slate-400 mt-1 font-medium">Multi-Factor Quality Checks</div>
            </div>
          </div>
        </div>
      </section>

      {/* Deliverables Section (What we deliver) */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="text-xs font-bold text-purple-700 uppercase tracking-widest mb-2">
            Measurable Value
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900">
            What You Receive With Every Research Study
          </h2>
          <p className="text-slate-600 mt-3 text-base">
            No robotic tick-box summaries. We deliver rich, actionable consumer intelligence synthesized from real conversational voice and typed responses.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">1. Voice Transcripts & Verbatims</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Listen to actual consumer audio snippets and read unedited typed answers. Understand the emotional nuance behind every purchase decision.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-4">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">2. Sentiment & NPS Intelligence</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Proprietary AI sentiment scoring that aggregates satisfaction scores, Net Promoter Score, and recurring customer keyword themes.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">3. Demographic Cross-Tabulation</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Segment consumer sentiment across age cohorts (Gen Z, Millennials, Boomers), gender identity, and international geographic regions.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-4">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">4. Executive PDF & Raw CSV Export</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              A boardroom-ready executive summary deck for stakeholders, plus complete raw data files formatted for SPSS, Excel, or internal BI tools.
            </p>
          </div>
        </div>

        {/* Live Case Studies Callout */}
        <div className="mt-10 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-purple-900 to-indigo-950 text-white flex flex-col md:flex-row items-center justify-between gap-6 border border-purple-800/60 shadow-xl">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-200 text-xs font-semibold">
              <Eye className="w-3.5 h-3.5" />
              Explore Live Case Studies
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white">
              Want to see what our research deliverables look like?
            </h3>
            <p className="text-sm text-purple-200 max-w-xl">
              Browse our published <strong>Brand Insights</strong> studies for global brands like Nike, Apple, Sony, Starbucks, and Tesla to see real customer sentiment metrics.
            </p>
          </div>
          <button
            onClick={() => setCurrentView('brand-insights')}
            className="shrink-0 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white hover:bg-slate-100 text-purple-950 font-bold text-sm shadow-md transition-all hover:scale-105"
          >
            Visit Brand Insights
            <ExternalLink className="w-4 h-4 text-purple-700" />
          </button>
        </div>
      </section>

      {/* Research Methodologies Guide */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="text-xs font-bold text-purple-700 uppercase tracking-widest mb-2">
            Methodology Selection Guide
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Choose the Right Framework for Your Goal
          </h2>
          <p className="text-slate-600 mt-2 text-sm sm:text-base">
            Select one of our specialized methodologies in the submission form below. Here is how they compare:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {METHODOLOGIES.map((m) => (
            <div
              key={m.id}
              onClick={() => {
                setMethodology(m.id);
                const el = document.getElementById('inquiry-form');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`p-5 rounded-xl border transition-all cursor-pointer ${
                methodology === m.id
                  ? 'bg-purple-50/60 border-purple-500 ring-2 ring-purple-400/40 shadow-sm'
                  : 'bg-white border-slate-200 hover:border-purple-300 hover:shadow'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800">
                  {m.badge}
                </span>
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  {m.turnaround}
                </span>
              </div>
              <h4 className="font-bold text-slate-900 text-base mb-1.5">{m.name}</h4>
              <p className="text-xs text-slate-600 mb-3 line-clamp-3">{m.description}</p>
              <div className="text-[11px] text-purple-900 bg-purple-50 p-2 rounded-lg border border-purple-100">
                <strong>Best For:</strong> {m.bestFor}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Models */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="text-xs font-bold text-purple-700 uppercase tracking-widest mb-2">
            Transparent Pricing
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Simple, All-Inclusive Research Pricing
          </h2>
          <p className="text-slate-600 mt-2 text-sm sm:text-base">
            No recurring retainers or hidden platform licenses. Pay per completed, verified study.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PRICING_TIERS.map((tier) => (
            <div
              key={tier.name}
              className={`relative rounded-2xl p-7 flex flex-col justify-between transition-all ${
                tier.popular
                  ? 'bg-white border-2 border-purple-600 shadow-xl ring-4 ring-purple-100'
                  : 'bg-white border border-slate-200 shadow-sm hover:shadow-md'
              }`}
            >
              {tier.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-purple-600 text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-md">
                  Most Popular
                </span>
              )}

              <div>
                <div className="text-xs font-bold text-purple-700 uppercase tracking-wider mb-1">
                  {tier.tag}
                </div>
                <h3 className="text-xl font-black text-slate-900">{tier.name}</h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-xl sm:text-2xl font-black text-slate-900">{tier.price}</span>
                </div>
                <div className="mt-2 text-xs font-semibold text-purple-900 bg-purple-50 py-1 px-2.5 rounded-md inline-block">
                  {tier.sampleSize} • {tier.turnaround}
                </div>

                <div className="mt-6 space-y-3 pt-6 border-t border-slate-100">
                  {tier.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 pt-4">
                <a
                  href="#inquiry-form"
                  className={`w-full py-3 rounded-xl font-bold text-sm text-center block transition-all ${
                    tier.popular
                      ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-600/30'
                      : 'bg-slate-100 hover:bg-purple-50 text-slate-800 hover:text-purple-700 border border-slate-200'
                  }`}
                >
                  Configure Study
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Main Submission Form Section */}
      <section id="inquiry-form" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 scroll-mt-6">
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden">
          {/* Form Header */}
          <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 p-6 sm:p-10 text-white">
            <div className="max-w-3xl">
              <span className="text-xs font-bold text-purple-300 uppercase tracking-widest inline-block mb-1">
                Step-by-Step Research Brief
              </span>
              <h2 className="text-2xl sm:text-3xl font-black">
                Submit Your Brand & Market Research Brief
              </h2>
              <p className="text-sm sm:text-base text-purple-200 mt-2">
                Provide your product details, desired methodology, and target demographic requirements. Our research team will review your parameters and deploy your campaign to our verified consumer panel.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 sm:p-10 space-y-10">
            {/* 1. Brand Identity */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-200">
                <div className="w-7 h-7 rounded-full bg-purple-100 text-purple-700 font-bold text-xs flex items-center justify-center">
                  1
                </div>
                <h3 className="text-lg font-bold text-slate-900">Brand Identity</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Brand Name <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    placeholder="e.g. Lululemon, Acme Wearables, Oatly"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-purple-600 focus:ring-2 focus:ring-purple-200 text-sm font-medium text-slate-900 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Brand Logo URL (Optional)
                  </label>
                  <div className="flex gap-3">
                    <input
                      type="url"
                      value={brandLogo}
                      onChange={(e) => setBrandLogo(e.target.value)}
                      placeholder="https://example.com/logo.png"
                      className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 focus:border-purple-600 focus:ring-2 focus:ring-purple-200 text-sm font-medium text-slate-900 outline-none transition-all"
                    />
                    {brandLogo ? (
                      <div className="w-10 h-10 rounded-lg border border-slate-200 p-1 bg-slate-50 shrink-0 flex items-center justify-center overflow-hidden">
                        <img
                          src={brandLogo}
                          alt="Preview"
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-lg border border-dashed border-slate-300 bg-slate-50 shrink-0 flex items-center justify-center text-slate-400">
                        <Building2 className="w-5 h-5" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Product / Service Details */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-200">
                <div className="w-7 h-7 rounded-full bg-purple-100 text-purple-700 font-bold text-xs flex items-center justify-center">
                  2
                </div>
                <h3 className="text-lg font-bold text-slate-900">Product / Service Under Study</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Product / Service Name <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={productOrServiceName}
                    onChange={(e) => setProductOrServiceName(e.target.value)}
                    placeholder="e.g. BreezeWeave Activewear Pro / Mobile Banking App"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-purple-600 focus:ring-2 focus:ring-purple-200 text-sm font-medium text-slate-900 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Industry / Product Category
                  </label>
                  <select
                    value={productCategory}
                    onChange={(e) => setProductCategory(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-purple-600 focus:ring-2 focus:ring-purple-200 text-sm font-medium text-slate-900 outline-none transition-all bg-white"
                  >
                    {PRODUCT_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* 3. Methodology & Sample Size */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-200">
                <div className="w-7 h-7 rounded-full bg-purple-100 text-purple-700 font-bold text-xs flex items-center justify-center">
                  3
                </div>
                <h3 className="text-lg font-bold text-slate-900">Research Scope & Sample Size</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Market Research Methodology <span className="text-rose-600">*</span>
                  </label>
                  <select
                    value={methodology}
                    onChange={(e) => setMethodology(e.target.value as MarketResearchMethodology)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-purple-600 focus:ring-2 focus:ring-purple-200 text-sm font-medium text-slate-900 outline-none transition-all bg-white"
                  >
                    {METHODOLOGIES.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.badge})
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-slate-500 mt-1.5">
                    {METHODOLOGIES.find((m) => m.id === methodology)?.description}
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Target Sample Size <span className="text-rose-600">*</span>
                  </label>
                  <select
                    value={sampleSize}
                    onChange={(e) => setSampleSize(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-purple-600 focus:ring-2 focus:ring-purple-200 text-sm font-medium text-slate-900 outline-none transition-all bg-white"
                  >
                    {SAMPLE_SIZE_OPTIONS.map((opt) => (
                      <option key={opt.size} value={opt.size}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-slate-500 mt-1.5">
                    Our quality checks help identify suspicious, duplicate or inconsistent responses to ensure valid completed sessions.
                  </p>
                </div>
              </div>
            </div>

            {/* 4. Geography & Demographics */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-200">
                <div className="w-7 h-7 rounded-full bg-purple-100 text-purple-700 font-bold text-xs flex items-center justify-center">
                  4
                </div>
                <h3 className="text-lg font-bold text-slate-900">Target Demographics & Geographic Scope</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Target Geographic Region / Market <span className="text-rose-600">*</span>
                  </label>
                  <select
                    value={geographicRegion}
                    onChange={(e) => setGeographicRegion(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-purple-600 focus:ring-2 focus:ring-purple-200 text-sm font-medium text-slate-900 outline-none transition-all bg-white"
                  >
                    {GEOGRAPHIC_REGIONS.map((reg) => (
                      <option key={reg} value={reg}>
                        {reg}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Gender Targeting
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { id: 'all', label: 'All' },
                      { id: 'female', label: 'Female' },
                      { id: 'male', label: 'Male' },
                      { id: 'non_binary', label: 'Non-Binary' },
                    ].map((g) => (
                      <button
                        type="button"
                        key={g.id}
                        onClick={() => setGender(g.id as any)}
                        className={`py-2 px-1 text-xs font-bold rounded-lg border transition-all ${
                          gender === g.id
                            ? 'bg-purple-600 text-white border-purple-600'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {g.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Age groups selection */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Target Age Groups (Select all that apply)
                  </label>
                  <button
                    type="button"
                    onClick={selectAllAges}
                    className="text-xs font-semibold text-purple-700 hover:text-purple-800"
                  >
                    {selectedAgeGroups.length === AGE_GROUP_OPTIONS.length ? 'Clear All' : 'Select All Ages'}
                  </button>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {AGE_GROUP_OPTIONS.map((age) => {
                    const isChecked = selectedAgeGroups.includes(age);
                    return (
                      <button
                        type="button"
                        key={age}
                        onClick={() => toggleAgeGroup(age)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                          isChecked
                            ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {age} Years Old
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Additional Behavioral or Screener Criteria (Optional)
                </label>
                <input
                  type="text"
                  value={demographicNotes}
                  onChange={(e) => setDemographicNotes(e.target.value)}
                  placeholder="e.g. Daily coffee drinkers, EV car owners, active gym members, iOS users"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-purple-600 focus:ring-2 focus:ring-purple-200 text-sm font-medium text-slate-900 outline-none transition-all"
                />
              </div>
            </div>

            {/* 5. Contact Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-200">
                <div className="w-7 h-7 rounded-full bg-purple-100 text-purple-700 font-bold text-xs flex items-center justify-center">
                  5
                </div>
                <h3 className="text-lg font-bold text-slate-900">Brand Contact Information</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Contact Name <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="Jane Doe"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-purple-600 focus:ring-2 focus:ring-purple-200 text-sm font-medium text-slate-900 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Work Email <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={workEmail}
                    onChange={(e) => {
                      setWorkEmail(e.target.value);
                      if (emailError) setEmailError(null);
                    }}
                    onBlur={handleEmailBlur}
                    placeholder="name@company.com"
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm font-medium text-slate-900 outline-none transition-all ${
                      emailError
                        ? 'border-rose-500 focus:ring-2 focus:ring-rose-200'
                        : 'border-slate-300 focus:border-purple-600 focus:ring-2 focus:ring-purple-200'
                    }`}
                  />
                  {emailError && (
                    <p className="text-xs text-rose-600 mt-1 font-medium">{emailError}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Phone / WhatsApp (Optional)
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-purple-600 focus:ring-2 focus:ring-purple-200 text-sm font-medium text-slate-900 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Timeline Urgency
                  </label>
                  <select
                    value={timeline}
                    onChange={(e) => setTimeline(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-purple-600 focus:ring-2 focus:ring-purple-200 text-sm font-medium text-slate-900 outline-none transition-all bg-white"
                  >
                    <option value="Urgent (< 48 Hours)">Urgent (&lt; 48 Hours)</option>
                    <option value="Standard (1-2 weeks)">Standard (1-2 weeks)</option>
                    <option value="Flexible (Planning Phase)">Flexible (Planning Phase)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Company Website (Optional)
                </label>
                <input
                  type="url"
                  value={companyWebsite}
                  onChange={(e) => setCompanyWebsite(e.target.value)}
                  placeholder="https://yourbrand.com"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-purple-600 focus:ring-2 focus:ring-purple-200 text-sm font-medium text-slate-900 outline-none transition-all"
                />
              </div>
            </div>

            {/* 6. Message / Research Goals */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-200">
                <div className="w-7 h-7 rounded-full bg-purple-100 text-purple-700 font-bold text-xs flex items-center justify-center">
                  6
                </div>
                <h3 className="text-lg font-bold text-slate-900">Research Goals & Specific Questions</h3>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  What questions or hypotheses do you want answered?
                </label>
                <textarea
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="e.g. We want to test consumer willingness to pay for a rechargeable case, understand why users are switching from competitor X, and test our 3 new flavor names..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-purple-600 focus:ring-2 focus:ring-purple-200 text-sm font-medium text-slate-900 outline-none transition-all"
                />
              </div>
            </div>

            {/* Study Scope & Submission Callout */}
            <div className="p-6 rounded-2xl bg-purple-50/80 border border-purple-200 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-1 text-center md:text-left">
                <div className="text-xs font-bold text-purple-700 uppercase tracking-wider">
                  Verified Research Scope
                </div>
                <div className="flex items-baseline gap-2 justify-center md:justify-start">
                  <span className="text-2xl font-black text-slate-900">{sampleSize.toLocaleString()} Verified Participants</span>
                </div>
                <p className="text-xs text-slate-600 max-w-lg">
                  Audited consumer responses, rigorous quality checks, audio feedback transcription, and comprehensive cross-tabulation analytics for your brand.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm shadow-lg shadow-purple-600/30 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                >
                  {isSubmitting ? (
                    'Submitting Brief...'
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Submit Research Brief
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </section>

      {/* Confirmation Modal */}
      {isSuccessModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-200 shadow-2xl space-y-6 text-center animate-in fade-in zoom-in duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-black text-slate-900">
                Research Brief Submitted!
              </h3>
              <p className="text-sm text-slate-600">
                Thank you, <strong>{contactName}</strong>. Your research brief for{' '}
                <strong>{brandName}</strong> ({productOrServiceName}) has been routed to our research operations team.
              </p>
              <div className="text-xs text-purple-700 font-mono bg-purple-50 py-1.5 px-3 rounded-lg inline-block">
                Reference ID: {submittedInquiryId}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-left text-xs text-slate-700 space-y-2">
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <Info className="w-4 h-4 text-purple-600" />
                What Happens Next?
              </div>
              <ul className="list-disc pl-4 space-y-1 text-slate-600">
                <li>Our research director reviews your screener questions within 4 hours.</li>
                <li>An administrator will structure the survey campaign and confirm launch.</li>
                <li>You will receive a confirmation email at <strong>{workEmail}</strong> with your live tracking dashboard link.</li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => {
                  setIsSuccessModalOpen(false);
                  setCurrentView('brand-insights');
                }}
                className="flex-1 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm shadow-md transition-all"
              >
                Explore Sample Studies
              </button>
              <button
                onClick={() => {
                  setIsSuccessModalOpen(false);
                  // Reset form
                  setBrandName('');
                  setProductOrServiceName('');
                  setMessage('');
                }}
                className="flex-1 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm transition-all"
              >
                Submit Another Brief
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
