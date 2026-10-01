import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  BrandInquiry,
  InquiryStatus,
  MarketResearchMethodology,
  Question,
  QuestionType,
  Campaign,
} from '../types';
import {
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Building2,
  Mail,
  Phone,
  Globe,
  DollarSign,
  PlusCircle,
  Eye,
  X,
  ExternalLink,
  Calendar,
  Layers,
  Sparkles,
  AlertCircle,
  ArrowRight,
  Send,
  FileCheck,
} from 'lucide-react';

export const AdminBrandInquiriesTab: React.FC = () => {
  const {
    brandInquiries,
    updateBrandInquiryStatus,
    createCampaign,
    campaigns,
    brands,
    addBrand,
    showToast,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<InquiryStatus | 'all'>('all');
  const [selectedInquiry, setSelectedInquiry] = useState<BrandInquiry | null>(null);

  // Campaign Creation Modal State (when promoting an inquiry to a live survey campaign)
  const [campaignModalInquiry, setCampaignModalInquiry] = useState<BrandInquiry | null>(null);
  const [campaignTitle, setCampaignTitle] = useState('');
  const [campaignDesc, setCampaignDesc] = useState('');
  const [campaignRewardCoins, setCampaignRewardCoins] = useState(100);
  const [campaignEstMinutes, setCampaignEstMinutes] = useState(3);
  const [campaignQuestions, setCampaignQuestions] = useState<Question[]>([]);

  // Filtered inquiries
  const filteredInquiries = useMemo(() => {
    return brandInquiries.filter((inq) => {
      const matchesStatus = statusFilter === 'all' || inq.status === statusFilter;
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        !searchTerm ||
        inq.brandName.toLowerCase().includes(term) ||
        inq.productOrServiceName.toLowerCase().includes(term) ||
        inq.contactInfo.contactName.toLowerCase().includes(term) ||
        inq.contactInfo.workEmail.toLowerCase().includes(term) ||
        inq.geographicRegion.toLowerCase().includes(term);

      return matchesStatus && matchesSearch;
    });
  }, [brandInquiries, statusFilter, searchTerm]);

  // Status counts
  const statusCounts = useMemo(() => {
    return {
      all: brandInquiries.length,
      pending: brandInquiries.filter((i) => i.status === 'pending').length,
      in_review: brandInquiries.filter((i) => i.status === 'in_review').length,
      campaign_created: brandInquiries.filter((i) => i.status === 'campaign_created').length,
      contacted: brandInquiries.filter((i) => i.status === 'contacted').length,
      closed: brandInquiries.filter((i) => i.status === 'closed').length,
    };
  }, [brandInquiries]);

  // Open Campaign Creator with intelligent prefilled questions based on the brand's methodology
  const handleOpenCampaignModal = (inquiry: BrandInquiry) => {
    setCampaignModalInquiry(inquiry);
    setCampaignTitle(`${inquiry.brandName}: ${inquiry.productOrServiceName} Sentiment Study`);
    setCampaignDesc(
      `Consumer market research study for ${inquiry.brandName} (${inquiry.productOrServiceName}). Target audience: ${inquiry.geographicRegion}. Complete this survey to earn coins.`
    );
    setCampaignRewardCoins(100);
    setCampaignEstMinutes(3);

    // Generate intelligent customized questions matching methodology
    const pName = inquiry.productOrServiceName;
    const bName = inquiry.brandName;

    const baseQuestions: Question[] = [
      {
        id: `q_mr_${Date.now()}_1`,
        text: `How familiar are you with ${bName} or products like ${pName}?`,
        type: 'multiple_choice' as QuestionType,
        order: 1,
        options: [
          'I use them frequently',
          'I have tried them occasionally',
          'I have heard of them, but never used',
          'This is the first time I am hearing of them',
        ],
        required: true,
      },
      {
        id: `q_mr_${Date.now()}_2`,
        text: `On a scale from 1 to 10, how likely are you to consider purchasing or trying ${pName}?`,
        type: 'scale' as QuestionType,
        order: 2,
        scaleMin: 1,
        scaleMax: 10,
        scaleMinLabel: 'Very Unlikely',
        scaleMaxLabel: 'Extremely Likely',
        required: true,
      },
      {
        id: `q_mr_${Date.now()}_3`,
        text: `What is the single most important feature or quality you look for in a product like ${pName}?`,
        type: 'text' as QuestionType,
        order: 3,
        placeholder: 'Describe your expectations, dealbreakers, or quality standards...',
        required: true,
      },
      {
        id: `q_mr_${Date.now()}_4`,
        text: `If ${pName} was priced at fair market rates, what would make you choose ${bName} over a competing brand?`,
        type: 'multiple_choice' as QuestionType,
        order: 4,
        options: [
          'Superior build quality & materials',
          'Competitive price / best value',
          'Brand reputation & ethical sourcing',
          'Unique features not found elsewhere',
          'Customer recommendations & positive reviews',
        ],
        required: true,
      },
      {
        id: `q_mr_${Date.now()}_5`,
        text: `Please share any suggestions, hesitations, or voice notes for the ${bName} team regarding ${pName}:`,
        type: 'text' as QuestionType,
        order: 5,
        placeholder: 'Optional honest feedback, suggestions, or advice...',
        required: false,
      },
    ];

    setCampaignQuestions(baseQuestions);
  };

  const handleLaunchCampaign = async () => {
    if (!campaignModalInquiry) return;

    if (!campaignTitle.trim()) {
      showToast('Please enter a campaign title', 'error');
      return;
    }

    // Check if brand exists in brands list, otherwise create a brand record
    let targetBrand = brands.find(
      (b) => b.name.toLowerCase() === campaignModalInquiry.brandName.toLowerCase()
    );

    if (!targetBrand) {
      targetBrand = addBrand({
        name: campaignModalInquiry.brandName,
        category: campaignModalInquiry.productCategory || 'Market Research',
        sector: campaignModalInquiry.productCategory || 'Consumer Products',
        description: `Partner brand conducting market research on ${campaignModalInquiry.productOrServiceName}`,
        logo: campaignModalInquiry.brandLogo || 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=128&auto=format&fit=crop&q=80',
        keyProduct: campaignModalInquiry.productOrServiceName,
        website: campaignModalInquiry.contactInfo.companyWebsite || '',
      });
    }

    // Create the Campaign object
    const createdCampaign = createCampaign({
      title: campaignTitle.trim(),
      description: campaignDesc.trim(),
      category: 'market_research',
      targetAudience: `${campaignModalInquiry.geographicRegion} (Age: ${campaignModalInquiry.targetDemographics.ageGroups.join(', ')})`,
      estimatedMinutes: campaignEstMinutes,
      rewardCoins: campaignRewardCoins,
      status: 'active',
      questions: campaignQuestions,
      icon: 'BarChart3',
      brandId: targetBrand.id,
    });

    // Update inquiry status to campaign_created
    await updateBrandInquiryStatus(
      campaignModalInquiry.id,
      'campaign_created',
      `Survey Campaign #${createdCampaign.id} created and deployed to catalog.`,
      createdCampaign.id
    );

    showToast(
      `Survey campaign "${createdCampaign.title}" created successfully and linked to ${campaignModalInquiry.brandName}!`,
      'success'
    );
    setCampaignModalInquiry(null);
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-slate-900">
              Brand Market Research Inquiries
            </h2>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800">
              {brandInquiries.length} Inquiries
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Review incoming research briefs from enterprise and DTC brands. Convert submissions into live survey campaigns for panel respondents.
          </p>
        </div>

        {/* Search Bar */}
        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search brand, product, email..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Status Filter Pills */}
      <div className="flex flex-wrap items-center gap-2">
        {[
          { id: 'all', label: 'All Inquiries', count: statusCounts.all },
          { id: 'pending', label: 'Pending Review', count: statusCounts.pending, color: 'text-amber-700 bg-amber-50' },
          { id: 'in_review', label: 'In Review', count: statusCounts.in_review, color: 'text-blue-700 bg-blue-50' },
          { id: 'campaign_created', label: 'Campaign Launched', count: statusCounts.campaign_created, color: 'text-emerald-700 bg-emerald-50' },
          { id: 'contacted', label: 'Contacted', count: statusCounts.contacted, color: 'text-indigo-700 bg-indigo-50' },
          { id: 'closed', label: 'Closed', count: statusCounts.closed, color: 'text-slate-600 bg-slate-100' },
        ].map((pill) => (
          <button
            key={pill.id}
            onClick={() => setStatusFilter(pill.id as any)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              statusFilter === pill.id
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <span>{pill.label}</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                statusFilter === pill.id ? 'bg-purple-800 text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {pill.count}
            </span>
          </button>
        ))}
      </div>

      {/* Inquiries Cards Grid */}
      {filteredInquiries.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
          <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900">No brand inquiries found</h3>
          <p className="text-xs text-slate-500 mt-1">
            {searchTerm || statusFilter !== 'all'
              ? 'Try resetting your search or filter settings.'
              : 'New submissions from the "For Brands" portal will appear here automatically.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredInquiries.map((inq) => {
            const linkedCampaign = inq.campaignCreatedId
              ? campaigns.find((c) => c.id === inq.campaignCreatedId)
              : null;

            return (
              <div
                key={inq.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5"
              >
                {/* Left: Brand & Product summary */}
                <div className="flex items-start gap-4 flex-1">
                  {inq.brandLogo ? (
                    <img
                      src={inq.brandLogo}
                      alt={inq.brandName}
                      className="w-14 h-14 rounded-xl object-cover border border-slate-200 p-0.5 bg-slate-50 shrink-0"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=128&auto=format&fit=crop&q=80';
                      }}
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-purple-50 border border-purple-200 text-purple-700 flex items-center justify-center shrink-0">
                      <Building2 className="w-7 h-7" />
                    </div>
                  )}

                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-black text-slate-900 truncate">
                        {inq.brandName}
                      </h3>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {inq.productCategory || 'CPG / Tech'}
                      </span>
                      {inq.status === 'pending' && (
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Pending Review
                        </span>
                      )}
                      {inq.status === 'in_review' && (
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 flex items-center gap-1">
                          <Eye className="w-3 h-3" /> In Review
                        </span>
                      )}
                      {inq.status === 'campaign_created' && (
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Survey Launched
                        </span>
                      )}
                      {inq.status === 'contacted' && (
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                          Contacted
                        </span>
                      )}
                    </div>

                    <div className="text-sm font-semibold text-purple-900">
                      Product: {inq.productOrServiceName}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5 text-slate-400" />
                        <strong>Method:</strong> {inq.methodology.replace(/_/g, ' ')}
                      </span>
                      <span className="flex items-center gap-1">
                        <Globe className="w-3.5 h-3.5 text-slate-400" />
                        <strong>Region:</strong> {inq.geographicRegion}
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                        <strong>Est:</strong> ${inq.estimatedPriceUsd?.toLocaleString() || '499'} ({inq.sampleSize} respondents)
                      </span>
                    </div>

                    {/* Linked Campaign Badge if created */}
                    {linkedCampaign && (
                      <div className="inline-flex items-center gap-1.5 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg mt-1 font-medium">
                        <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
                        Active Survey: <strong>{linkedCampaign.title}</strong> ({linkedCampaign.completedCount} completed)
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Contact & Quick Actions */}
                <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-3 shrink-0 w-full lg:w-auto border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-100">
                  <div className="text-xs text-slate-500 text-left lg:text-right space-y-0.5">
                    <div className="font-semibold text-slate-700">
                      {inq.contactInfo.contactName}
                    </div>
                    <a
                      href={`mailto:${inq.contactInfo.workEmail}?subject=Regarding Your Voice Flow 360 Market Research Brief for ${encodeURIComponent(inq.brandName)}`}
                      className="text-purple-600 hover:text-purple-800 hover:underline flex items-center gap-1"
                    >
                      <Mail className="w-3 h-3" />
                      {inq.contactInfo.workEmail}
                    </a>
                    {inq.contactInfo.phone && (
                      <div className="flex items-center gap-1 text-slate-500">
                        <Phone className="w-3 h-3" />
                        {inq.contactInfo.phone}
                      </div>
                    )}
                    <div className="text-[11px] text-slate-400 pt-1">
                      Submitted: {new Date(inq.submittedAt).toLocaleDateString()}
                    </div>
                  </div>

                  {/* Actions buttons */}
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => setSelectedInquiry(inq)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Full Brief
                    </button>

                    {inq.status !== 'campaign_created' ? (
                      <button
                        onClick={() => handleOpenCampaignModal(inq)}
                        className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white transition-all shadow-sm flex items-center gap-1.5"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        Create Survey Campaign
                      </button>
                    ) : (
                      <button
                        onClick={() => handleOpenCampaignModal(inq)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-colors flex items-center gap-1"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        Add Another Survey
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Inquiry Detail Drawer / Modal */}
      {selectedInquiry && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full border border-slate-200 shadow-2xl max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-200">
              <div className="flex items-center gap-3">
                {selectedInquiry.brandLogo && (
                  <img
                    src={selectedInquiry.brandLogo}
                    alt={selectedInquiry.brandName}
                    className="w-12 h-12 rounded-xl object-contain border border-slate-200 p-1 bg-slate-50"
                  />
                )}
                <div>
                  <h3 className="text-xl font-black text-slate-900">
                    {selectedInquiry.brandName}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Inquiry Ref: <span className="font-mono">{selectedInquiry.id}</span>
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedInquiry(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-400 uppercase font-bold block text-[10px]">Product / Service</span>
                <span className="text-slate-900 font-bold text-sm block mt-0.5">
                  {selectedInquiry.productOrServiceName}
                </span>
                <span className="text-purple-700 font-medium">{selectedInquiry.productCategory}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-400 uppercase font-bold block text-[10px]">Methodology</span>
                <span className="text-slate-900 font-bold text-sm block mt-0.5">
                  {selectedInquiry.methodology.replace(/_/g, ' ')}
                </span>
                <span className="text-slate-600">Sample: {selectedInquiry.sampleSize} verified respondents</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-400 uppercase font-bold block text-[10px]">Target Geography</span>
                <span className="text-slate-900 font-bold text-sm block mt-0.5">
                  {selectedInquiry.geographicRegion}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-400 uppercase font-bold block text-[10px]">Demographics</span>
                <span className="text-slate-900 font-bold text-sm block mt-0.5">
                  Age: {selectedInquiry.targetDemographics.ageGroups.join(', ')}
                </span>
                <span className="text-slate-600">Gender: {selectedInquiry.targetDemographics.gender}</span>
              </div>
            </div>

            {selectedInquiry.targetDemographics.additionalNotes && (
              <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 text-xs text-purple-950">
                <span className="font-bold block mb-1">Additional Screener Criteria:</span>
                {selectedInquiry.targetDemographics.additionalNotes}
              </div>
            )}

            {/* Message */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Research Goals & Objectives:</span>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
                {selectedInquiry.message || 'No additional custom message provided.'}
              </div>
            </div>

            {/* Contact Details */}
            <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-xs space-y-1.5">
              <span className="font-bold text-slate-900 block text-sm">Contact Information</span>
              <div className="grid grid-cols-2 gap-2 text-slate-700">
                <div>Name: <strong>{selectedInquiry.contactInfo.contactName}</strong></div>
                <div>Email: <strong>{selectedInquiry.contactInfo.workEmail}</strong></div>
                <div>Phone: <strong>{selectedInquiry.contactInfo.phone || 'N/A'}</strong></div>
                <div>Timeline: <strong>{selectedInquiry.contactInfo.timeline || 'Standard'}</strong></div>
                {selectedInquiry.contactInfo.companyWebsite && (
                  <div className="col-span-2">
                    Website: <a href={selectedInquiry.contactInfo.companyWebsite} target="_blank" rel="noreferrer" className="text-purple-600 hover:underline">{selectedInquiry.contactInfo.companyWebsite}</a>
                  </div>
                )}
              </div>
            </div>

            {/* Status Modification */}
            <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700">Update Status:</span>
                <select
                  value={selectedInquiry.status}
                  onChange={(e) => {
                    const newStatus = e.target.value as InquiryStatus;
                    updateBrandInquiryStatus(selectedInquiry.id, newStatus);
                    setSelectedInquiry({ ...selectedInquiry, status: newStatus });
                  }}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 bg-white"
                >
                  <option value="pending">Pending</option>
                  <option value="in_review">In Review</option>
                  <option value="contacted">Contacted</option>
                  <option value="campaign_created">Campaign Created</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={`mailto:${selectedInquiry.contactInfo.workEmail}?subject=Voice Flow 360 Research Study Setup - ${encodeURIComponent(selectedInquiry.brandName)}`}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors flex items-center gap-1.5"
                >
                  <Mail className="w-3.5 h-3.5" />
                  Email Brand
                </a>
                <button
                  onClick={() => {
                    const inq = selectedInquiry;
                    setSelectedInquiry(null);
                    handleOpenCampaignModal(inq);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white transition-all shadow flex items-center gap-1.5"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  Create Campaign
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Campaign Creation Modal from Brand Inquiry */}
      {campaignModalInquiry && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-3xl w-full border border-slate-200 shadow-2xl max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-200">
              <div>
                <span className="text-xs font-bold text-purple-700 uppercase tracking-wider">
                  Admin Survey Campaign Builder
                </span>
                <h3 className="text-2xl font-black text-slate-900">
                  Deploy Campaign for {campaignModalInquiry.brandName}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  We prefilled this survey campaign with questions tailored to{' '}
                  <strong>{campaignModalInquiry.productOrServiceName}</strong> and{' '}
                  <strong>{campaignModalInquiry.methodology.replace(/_/g, ' ')}</strong>.
                </p>
              </div>

              <button
                onClick={() => setCampaignModalInquiry(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Campaign Parameters */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Campaign Title
                </label>
                <input
                  type="text"
                  value={campaignTitle}
                  onChange={(e) => setCampaignTitle(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-slate-300 text-sm font-semibold outline-none focus:border-purple-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Survey Description for Respondents
                </label>
                <textarea
                  rows={2}
                  value={campaignDesc}
                  onChange={(e) => setCampaignDesc(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-slate-300 text-xs outline-none focus:border-purple-600"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Reward Coins
                  </label>
                  <input
                    type="number"
                    value={campaignRewardCoins}
                    onChange={(e) => setCampaignRewardCoins(Number(e.target.value))}
                    className="w-full px-4 py-2 rounded-xl border border-slate-300 text-sm font-bold"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Equivalent to ${(campaignRewardCoins * 0.01).toFixed(2)} USD
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Est. Minutes
                  </label>
                  <input
                    type="number"
                    value={campaignEstMinutes}
                    onChange={(e) => setCampaignEstMinutes(Number(e.target.value))}
                    className="w-full px-4 py-2 rounded-xl border border-slate-300 text-sm font-bold"
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Target Quota
                  </label>
                  <div className="px-4 py-2 rounded-xl bg-slate-100 text-slate-800 text-sm font-bold">
                    {campaignModalInquiry.sampleSize} Respondents
                  </div>
                </div>
              </div>
            </div>

            {/* Prepopulated Questions */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-900">
                  Survey Questions ({campaignQuestions.length})
                </h4>
                <span className="text-xs text-slate-500">
                  Generated for {campaignModalInquiry.methodology.replace(/_/g, ' ')}
                </span>
              </div>

              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {campaignQuestions.map((q, idx) => (
                  <div
                    key={q.id}
                    className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-purple-800">
                        Q{idx + 1} • {q.type.replace('_', ' ').toUpperCase()}
                      </span>
                      {q.required && (
                        <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded">
                          Required
                        </span>
                      )}
                    </div>
                    <div className="font-semibold text-slate-900">{q.text}</div>
                    {q.options && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {q.options.map((opt, oIdx) => (
                          <span
                            key={oIdx}
                            className="bg-white border border-slate-200 px-2 py-0.5 rounded text-[11px] text-slate-700"
                          >
                            {opt}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Launch Actions */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setCampaignModalInquiry(null)}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleLaunchCampaign}
                className="px-6 py-2.5 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white transition-all shadow-md shadow-purple-600/30 flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Launch Live Survey Campaign
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
