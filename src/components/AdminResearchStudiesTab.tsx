import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { ResearchArticle, ResearchArticleStatus } from '../types';
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  ExternalLink,
  Eye,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  Building2,
  Calendar,
  Sparkles,
  Link as LinkIcon,
  Heading2,
  Heading3,
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Upload,
  Image as ImageIcon,
  X,
  Layers,
  BarChart2,
  ShieldCheck,
} from 'lucide-react';

const CATEGORIES = [
  'Gaming',
  'Tech & Hardware',
  'SaaS & Media',
  'Retail & E-commerce',
  'Finance & Banking',
  'Automotive & Mobility',
  'Food & Beverage',
  'Healthcare & Fitness',
  'Entertainment',
  'General',
];

export const AdminResearchStudiesTab: React.FC = () => {
  const {
    researchArticles,
    brands,
    saveResearchArticle,
    deleteResearchArticle,
    navigateToResearchArticle,
    showToast,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'under_review' | 'draft' | 'rejected'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Modal State
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [brandName, setBrandName] = useState('');
  const [category, setCategory] = useState('Gaming');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [body, setBody] = useState('');
  const [sourcesNote, setSourcesNote] = useState('');
  const [status, setStatus] = useState<ResearchArticleStatus>('draft');
  const [publishedAt, setPublishedAt] = useState('');
  const [editorTab, setEditorTab] = useState<'write' | 'preview'>('write');
  const [formError, setFormError] = useState<string | null>(null);

  // Research Audit & Transparency Fields
  const [researchQuestion, setResearchQuestion] = useState('');
  const [fieldworkDates, setFieldworkDates] = useState('');
  const [validResponsesCount, setValidResponsesCount] = useState<number | ''>('');
  const [recruitmentMethod, setRecruitmentMethod] = useState('');
  const [participantGeography, setParticipantGeography] = useState('');
  const [participantDemographics, setParticipantDemographics] = useState('');
  const [sampleLimitations, setSampleLimitations] = useState('');
  const [reviewerName, setReviewerName] = useState('Voice Flow 360 Editorial Desk');
  const [reviewNotes, setReviewNotes] = useState('');
  const [studyTypeClassification, setStudyTypeClassification] = useState<'independent' | 'commissioned'>('independent');
  const [isIllustrativeDemo, setIsIllustrativeDemo] = useState(false);

  // Utility to generate slug from title
  const generateSlug = (val: string) => {
    return val
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    if (!slugManuallyEdited) {
      setSlug(generateSlug(newTitle));
    }
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSlug(generateSlug(e.target.value));
    setSlugManuallyEdited(true);
  };

  const handleOpenCreate = () => {
    setEditingArticleId(null);
    setTitle('');
    setSlug('');
    setSlugManuallyEdited(false);
    setBrandName(brands[0]?.name || 'Sony PlayStation');
    setCategory('Gaming');
    setCoverImageUrl(
      'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80'
    );
    setExcerpt('');
    setBody('');
    setSourcesNote('');
    setStatus('draft');
    setPublishedAt('');
    setResearchQuestion('');
    setFieldworkDates('');
    setValidResponsesCount('');
    setRecruitmentMethod('');
    setParticipantGeography('');
    setParticipantDemographics('');
    setSampleLimitations('');
    setReviewerName('Voice Flow 360 Editorial Desk');
    setReviewNotes('');
    setStudyTypeClassification('independent');
    setIsIllustrativeDemo(false);
    setEditorTab('write');
    setFormError(null);
    setIsEditorOpen(true);
  };

  const handleOpenEdit = (article: ResearchArticle) => {
    setEditingArticleId(article.id);
    setTitle(article.title);
    setSlug(article.slug);
    setSlugManuallyEdited(true);
    setBrandName(article.brand_name);
    setCategory(article.category);
    setCoverImageUrl(article.cover_image_url);
    setExcerpt(article.excerpt);
    setBody(article.body);
    setSourcesNote(article.sources_note);
    setStatus(article.status);
    setPublishedAt(
      article.published_at ? new Date(article.published_at).toISOString().slice(0, 16) : ''
    );
    setResearchQuestion(article.research_question || '');
    setFieldworkDates(article.fieldwork_dates || '');
    setValidResponsesCount(article.valid_responses_count ?? '');
    setRecruitmentMethod(article.recruitment_method || '');
    setParticipantGeography(article.participant_geography || '');
    setParticipantDemographics(article.participant_demographics || '');
    setSampleLimitations(article.sample_limitations || '');
    setReviewerName(article.reviewer_name || 'Voice Flow 360 Editorial Desk');
    setReviewNotes(article.review_notes || '');
    setStudyTypeClassification(article.study_type_classification || 'independent');
    setIsIllustrativeDemo(article.is_illustrative_demo || false);
    setEditorTab('write');
    setFormError(null);
    setIsEditorOpen(true);
  };

  const handleStatusTransition = (article: ResearchArticle, newStatus: ResearchArticleStatus) => {
    const isPublishing = newStatus === 'published';
    const now = new Date().toISOString();
    const res = saveResearchArticle({
      ...article,
      status: newStatus,
      published_at: isPublishing ? (article.published_at || now) : article.published_at,
      reviewed_at: isPublishing ? now : article.reviewed_at,
      reviewer_name: isPublishing ? (article.reviewer_name || 'Voice Flow 360 Editorial Desk') : article.reviewer_name,
    });
    if (res.success) {
      showToast(`Study status updated to ${newStatus.replace('_', ' ').toUpperCase()}`, 'success');
    }
  };

  // Check if body has numeric claim (% or NPS)
  const hasNumericClaim = useMemo(() => {
    return /%|\bNPS\b/i.test(body);
  }, [body]);

  const sourcesMissingWhenRequired = status === 'published' && hasNumericClaim && !sourcesNote.trim();

  // Duplicate checks in UI
  const isDuplicateSlug = useMemo(() => {
    const clean = slug.trim().toLowerCase();
    if (!clean) return false;
    return researchArticles.some(
      (a) => a.id !== editingArticleId && a.slug.toLowerCase().trim() === clean
    );
  }, [slug, editingArticleId, researchArticles]);

  const isDuplicateTitle = useMemo(() => {
    const clean = title.trim().toLowerCase();
    if (!clean) return false;
    return researchArticles.some(
      (a) => a.id !== editingArticleId && a.title.toLowerCase().trim() === clean
    );
  }, [title, editingArticleId, researchArticles]);

  // Markdown Toolbar helper
  const insertMarkdown = (prefix: string, suffix: string = '') => {
    const textarea = document.getElementById('article-body-textarea') as HTMLTextAreaElement | null;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = body.substring(start, end) || 'Sample text';
    const replacement = `${prefix}${selectedText}${suffix}`;
    const newBody = body.substring(0, start) + replacement + body.substring(end);
    setBody(newBody);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + selectedText.length);
    }, 50);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setCoverImageUrl(reader.result);
          showToast('Image attached as cover photo preview', 'success');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!title.trim()) {
      setFormError('Please provide an article title.');
      return;
    }
    if (!brandName.trim()) {
      setFormError('Please select or specify a brand name.');
      return;
    }
    if (!slug.trim()) {
      setFormError('A valid URL slug is required.');
      return;
    }
    if (isDuplicateSlug) {
      setFormError(`An article with the slug "/${slug}" already exists. Slugs must be unique.`);
      return;
    }
    if (isDuplicateTitle) {
      setFormError(`An article titled "${title}" already exists.`);
      return;
    }
    if (!excerpt.trim()) {
      setFormError('Please provide a short excerpt for card previews.');
      return;
    }
    if (!body.trim()) {
      setFormError('Article body content cannot be empty.');
      return;
    }
    if (sourcesMissingWhenRequired) {
      setFormError(
        'Validation Guardrail: The article body contains percentage statistics (%) or NPS metrics. You must provide the Sources & Methodology citation before publishing.'
      );
      return;
    }

    let resolvedPublishedAt: string | null = null;
    if (status === 'published') {
      resolvedPublishedAt = publishedAt ? new Date(publishedAt).toISOString() : new Date().toISOString();
    }

    const res = saveResearchArticle({
      id: editingArticleId || undefined,
      title: title.trim(),
      slug: slug.trim(),
      brand_name: brandName.trim(),
      category: category.trim(),
      cover_image_url:
        coverImageUrl.trim() ||
        'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80',
      excerpt: excerpt.trim(),
      body: body.trim(),
      sources_note: sourcesNote.trim(),
      status,
      published_at: resolvedPublishedAt,
      research_question: researchQuestion.trim() || undefined,
      fieldwork_dates: fieldworkDates.trim() || undefined,
      valid_responses_count: typeof validResponsesCount === 'number' ? validResponsesCount : undefined,
      recruitment_method: recruitmentMethod.trim() || undefined,
      participant_geography: participantGeography.trim() || undefined,
      participant_demographics: participantDemographics.trim() || undefined,
      sample_limitations: sampleLimitations.trim() || undefined,
      reviewer_name: reviewerName.trim() || undefined,
      reviewed_at: status === 'published' ? new Date().toISOString() : undefined,
      review_notes: reviewNotes.trim() || undefined,
      study_type_classification: studyTypeClassification,
      is_illustrative_demo: isIllustrativeDemo,
    });

    if (res.success) {
      setIsEditorOpen(false);
    } else {
      setFormError(res.error || 'Failed to save article.');
    }
  };

  const handleDeleteConfirm = () => {
    if (deleteConfirmId) {
      deleteResearchArticle(deleteConfirmId);
      setDeleteConfirmId(null);
    }
  };

  // Filtered list
  const filteredArticles = useMemo(() => {
    return researchArticles.filter((article) => {
      const matchesSearch =
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.brand_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.category.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === 'all' ? true : article.status === statusFilter;

      const matchesCategory =
        categoryFilter === 'all' ? true : article.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [researchArticles, searchQuery, statusFilter, categoryFilter]);

  const stats = useMemo(() => {
    const total = researchArticles.length;
    const published = researchArticles.filter((a) => a.status === 'published').length;
    const underReview = researchArticles.filter((a) => a.status === 'under_review').length;
    const drafts = researchArticles.filter((a) => a.status === 'draft').length;
    const rejected = researchArticles.filter((a) => a.status === 'rejected').length;
    const uniqueBrands = new Set(researchArticles.map((a) => a.brand_name)).size;
    return { total, published, underReview, drafts, rejected, uniqueBrands };
  }, [researchArticles]);

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600 shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-100 text-purple-700">
                Editorial CMS
              </span>
              <span className="text-xs text-slate-500 font-medium">Draft &rarr; Review &rarr; Published Workflow</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1 tracking-tight">
              Brand Research Studies Content Manager
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5 max-w-2xl">
              Strict peer review controls: Drafts remain private until verified by an authorized reviewer.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            id="btn-create-research-study"
            onClick={handleOpenCreate}
            className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Study</span>
          </button>
        </div>
      </div>

      {/* Metric Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5 sm:gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Studies</span>
            <Layers className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-1">{stats.total}</p>
          <span className="text-[11px] text-slate-500 font-medium">All database records</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Published Live</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-emerald-600 mt-1">{stats.published}</p>
          <span className="text-[11px] text-emerald-600/80 font-medium">Publicly crawlable</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Under Review</span>
            <Clock className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-2xl font-black text-indigo-600 mt-1">{stats.underReview}</p>
          <span className="text-[11px] text-indigo-600/80 font-medium">Awaiting audit</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Draft Articles</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-amber-600 mt-1">{stats.drafts}</p>
          <span className="text-[11px] text-amber-600/80 font-medium">Private authoring</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Revision Needed</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-2xl font-black text-rose-600 mt-1">{stats.rejected}</p>
          <span className="text-[11px] text-rose-600/80 font-medium">Requires edits</span>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by title, brand, category, or slug..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
          {/* Status Filter */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold text-slate-600 flex-wrap gap-1">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                statusFilter === 'all' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'hover:text-slate-900'
              }`}
            >
              All ({researchArticles.length})
            </button>
            <button
              onClick={() => setStatusFilter('published')}
              className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                statusFilter === 'published'
                  ? 'bg-white text-emerald-700 shadow-2xs font-bold'
                  : 'hover:text-slate-900'
              }`}
            >
              Published ({stats.published})
            </button>
            <button
              onClick={() => setStatusFilter('under_review')}
              className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                statusFilter === 'under_review'
                  ? 'bg-white text-indigo-700 shadow-2xs font-bold'
                  : 'hover:text-slate-900'
              }`}
            >
              Review ({stats.underReview})
            </button>
            <button
              onClick={() => setStatusFilter('draft')}
              className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                statusFilter === 'draft'
                  ? 'bg-white text-amber-700 shadow-2xs font-bold'
                  : 'hover:text-slate-900'
              }`}
            >
              Drafts ({stats.drafts})
            </button>
            <button
              onClick={() => setStatusFilter('rejected')}
              className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                statusFilter === 'rejected'
                  ? 'bg-white text-rose-700 shadow-2xs font-bold'
                  : 'hover:text-slate-900'
              }`}
            >
              Revision ({stats.rejected})
            </button>
          </div>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-purple-500 cursor-pointer"
          >
            <option value="all">All Sectors</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Articles Table/List */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
        {filteredArticles.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No Research Studies Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              {searchQuery || statusFilter !== 'all' || categoryFilter !== 'all'
                ? 'Try adjusting your search query or filters to find published articles.'
                : 'Click "Create New Study" above to author your first verified brand research paper.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredArticles.map((article) => (
              <div
                key={article.id}
                className="p-5 sm:p-6 hover:bg-slate-50/70 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-5"
              >
                <div className="flex items-start gap-4">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 shadow-2xs">
                    <img
                      src={article.cover_image_url}
                      alt={article.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>

                  <div className="space-y-1.5 max-w-2xl">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        {article.brand_name}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-md text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-200/60">
                        {article.category}
                      </span>
                      {article.status === 'published' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Published
                        </span>
                      )}
                      {article.status === 'under_review' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                          <Clock className="w-3 h-3 text-indigo-600" />
                          Under Review
                        </span>
                      )}
                      {article.status === 'draft' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          <Clock className="w-3 h-3 text-amber-600" />
                          Draft
                        </span>
                      )}
                      {article.status === 'rejected' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          <AlertTriangle className="w-3 h-3 text-rose-600" />
                          Revision Needed
                        </span>
                      )}
                      {article.is_illustrative_demo && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                          Illustrative Demo
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-extrabold text-slate-900 tracking-tight leading-snug">
                      {article.title}
                    </h3>

                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {article.excerpt}
                    </p>

                    <div className="flex items-center gap-4 text-[11px] text-slate-400 font-medium pt-0.5 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {article.published_at
                          ? new Date(article.published_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })
                          : 'Not published'}
                      </span>
                      {article.valid_responses_count && (
                        <span>Sample: n={article.valid_responses_count.toLocaleString()}</span>
                      )}
                      <span className="font-mono text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        /brand-research-studies/{article.slug}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Workflow Transitions & Actions */}
                <div className="flex items-center gap-2 self-end lg:self-center shrink-0 flex-wrap">
                  {/* Workflow buttons */}
                  {article.status === 'draft' && (
                    <button
                      onClick={() => handleStatusTransition(article, 'under_review')}
                      className="px-3 py-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl transition-all cursor-pointer"
                      title="Submit draft for editorial peer review"
                    >
                      Submit for Review
                    </button>
                  )}
                  {article.status === 'under_review' && (
                    <>
                      <button
                        onClick={() => handleStatusTransition(article, 'published')}
                        className="px-3 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-all cursor-pointer flex items-center gap-1"
                        title="Approve and make public"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Approve &amp; Publish</span>
                      </button>
                      <button
                        onClick={() => handleStatusTransition(article, 'rejected')}
                        className="px-2.5 py-1.5 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-all cursor-pointer"
                        title="Request revision"
                      >
                        Reject
                      </button>
                    </>
                  )}
                  {article.status === 'published' && (
                    <button
                      onClick={() => handleStatusTransition(article, 'draft')}
                      className="px-2.5 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl transition-all cursor-pointer"
                      title="Unpublish back to private draft"
                    >
                      Unpublish
                    </button>
                  )}
                  {article.status === 'rejected' && (
                    <button
                      onClick={() => handleStatusTransition(article, 'draft')}
                      className="px-2.5 py-1.5 text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl transition-all cursor-pointer"
                      title="Reopen for authoring"
                    >
                      Reopen Draft
                    </button>
                  )}

                  {article.status === 'published' && (
                    <button
                      id={`btn-view-live-study-${article.slug}`}
                      onClick={() => navigateToResearchArticle(article.slug)}
                      className="p-2 text-slate-600 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all border border-slate-200 cursor-pointer"
                      title="View public live page"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  )}

                  <button
                    id={`btn-edit-study-${article.slug}`}
                    onClick={() => handleOpenEdit(article)}
                    className="px-3 py-1.5 text-xs font-bold text-slate-700 hover:text-purple-700 hover:bg-purple-50 rounded-xl transition-all border border-slate-200 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Edit className="w-3.5 h-3.5 text-purple-600" />
                    <span>Edit</span>
                  </button>

                  <button
                    id={`btn-delete-study-${article.slug}`}
                    onClick={() => setDeleteConfirmId(article.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all border border-slate-200 cursor-pointer"
                    title="Delete study"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Editor Modal / Drawer */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight">
                    {editingArticleId ? 'Edit Brand Research Study' : 'Author New Brand Research Study'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Strict adherence to editorial standards and sources verification.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsEditorOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSave} className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1 text-xs">
              {formError && (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-rose-800">
                  <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-xs">Validation Guardrail Alert</h4>
                    <p className="text-xs mt-0.5 leading-relaxed">{formError}</p>
                  </div>
                </div>
              )}

              {/* Title & Brand Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Study Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. PlayStation 5 Ecosystem & Subscription Sentiment Study 2026"
                    value={title}
                    onChange={handleTitleChange}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-purple-500 focus:bg-white"
                  />
                  {isDuplicateTitle && (
                    <span className="text-[11px] text-rose-500 font-semibold mt-1 block">
                      Warning: An article with this exact title already exists.
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Brand Studied <span className="text-rose-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sony PlayStation"
                      value={brandName}
                      onChange={(e) => setBrandName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-purple-500 focus:bg-white"
                    />
                    <select
                      onChange={(e) => {
                        if (e.target.value) setBrandName(e.target.value);
                      }}
                      className="px-3 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 cursor-pointer"
                    >
                      <option value="">Quick Pick</option>
                      {brands.slice(0, 30).map((b) => (
                        <option key={b.id} value={b.name}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Slug & Category Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-800">
                      URL Slug <span className="text-rose-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setSlug(generateSlug(title));
                        setSlugManuallyEdited(false);
                      }}
                      className="text-[11px] text-purple-600 hover:text-purple-800 font-bold cursor-pointer"
                    >
                      Regenerate from Title
                    </button>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-[11px]">
                      /brand-research-studies/
                    </span>
                    <input
                      type="text"
                      required
                      placeholder="playstation-5-sentiment-study-2026"
                      value={slug}
                      onChange={handleSlugChange}
                      className="w-full pl-44 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-purple-500 focus:bg-white"
                    />
                  </div>
                  {isDuplicateSlug && (
                    <span className="text-[11px] text-rose-500 font-semibold mt-1 block">
                      Conflict: Slug is already taken. Please choose a unique URL slug.
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Industry Sector / Category <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-purple-500 focus:bg-white cursor-pointer"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Cover Image */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Cover Photo Image URL <span className="text-rose-500">*</span>
                </label>
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <ImageIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/..."
                      value={coverImageUrl}
                      onChange={(e) => setCoverImageUrl(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-purple-500 focus:bg-white"
                    />
                  </div>
                  <label className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition-all flex items-center gap-1.5 cursor-pointer shrink-0">
                    <Upload className="w-4 h-4 text-slate-500" />
                    <span>Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                {coverImageUrl && (
                  <div className="mt-2 w-full h-28 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 relative">
                    <img
                      src={coverImageUrl}
                      alt="Cover Preview"
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/70 text-white rounded text-[10px] font-bold">
                      Live Preview
                    </span>
                  </div>
                )}
              </div>

              {/* Excerpt / Summary */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Executive Excerpt / Card Summary <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="A concise 1–3 sentence teaser evaluating key benchmarks, panel sample size, and insights."
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-purple-500 focus:bg-white"
                />
              </div>

              {/* Body Content Editor with Markdown Toolbar and Live Preview */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-800">
                    Article Body Content (Markdown Supported) <span className="text-rose-500">*</span>
                  </label>
                  <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-xs">
                    <button
                      type="button"
                      onClick={() => setEditorTab('write')}
                      className={`px-3 py-1 rounded-md font-bold transition-all cursor-pointer ${
                        editorTab === 'write' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                      }`}
                    >
                      Write
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditorTab('preview')}
                      className={`px-3 py-1 rounded-md font-bold transition-all cursor-pointer ${
                        editorTab === 'preview' ? 'bg-white text-purple-700 shadow-2xs' : 'text-slate-600'
                      }`}
                    >
                      Render Preview
                    </button>
                  </div>
                </div>

                {/* Markdown Quick Toolbar */}
                {editorTab === 'write' && (
                  <div className="flex items-center gap-1 p-2 bg-slate-100 border border-slate-200 rounded-t-xl overflow-x-auto">
                    <button
                      type="button"
                      onClick={() => insertMarkdown('## ', '\n')}
                      className="p-1.5 hover:bg-white rounded text-slate-700 font-bold text-xs flex items-center gap-1 cursor-pointer"
                      title="Heading 2"
                    >
                      <Heading2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertMarkdown('### ', '\n')}
                      className="p-1.5 hover:bg-white rounded text-slate-700 font-bold text-xs flex items-center gap-1 cursor-pointer"
                      title="Heading 3"
                    >
                      <Heading3 className="w-3.5 h-3.5" />
                    </button>
                    <div className="w-px h-4 bg-slate-300 mx-1" />
                    <button
                      type="button"
                      onClick={() => insertMarkdown('**', '**')}
                      className="p-1.5 hover:bg-white rounded text-slate-700 font-bold text-xs flex items-center gap-1 cursor-pointer"
                      title="Bold"
                    >
                      <Bold className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertMarkdown('*', '*')}
                      className="p-1.5 hover:bg-white rounded text-slate-700 font-bold text-xs flex items-center gap-1 cursor-pointer"
                      title="Italic"
                    >
                      <Italic className="w-3.5 h-3.5" />
                    </button>
                    <div className="w-px h-4 bg-slate-300 mx-1" />
                    <button
                      type="button"
                      onClick={() => insertMarkdown('- ', '\n')}
                      className="p-1.5 hover:bg-white rounded text-slate-700 font-bold text-xs flex items-center gap-1 cursor-pointer"
                      title="Bullet List"
                    >
                      <List className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertMarkdown('1. ', '\n')}
                      className="p-1.5 hover:bg-white rounded text-slate-700 font-bold text-xs flex items-center gap-1 cursor-pointer"
                      title="Numbered List"
                    >
                      <ListOrdered className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertMarkdown('> ', '\n')}
                      className="p-1.5 hover:bg-white rounded text-slate-700 font-bold text-xs flex items-center gap-1 cursor-pointer"
                      title="Blockquote"
                    >
                      <Quote className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertMarkdown('[', '](https://example.com)')}
                      className="p-1.5 hover:bg-white rounded text-slate-700 font-bold text-xs flex items-center gap-1 cursor-pointer"
                      title="Link"
                    >
                      <LinkIcon className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {editorTab === 'write' ? (
                  <textarea
                    id="article-body-textarea"
                    rows={12}
                    required
                    placeholder="## Executive Summary&#10;&#10;Write comprehensive article text here. Use markdown for headings, bold benchmarks (e.g. 78% retention), and bullet points."
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    className="w-full p-4 bg-slate-50 border border-slate-200 border-t-0 rounded-b-xl text-xs font-mono font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-purple-500 focus:bg-white"
                  />
                ) : (
                  <div className="w-full min-h-[250px] p-6 bg-slate-50 border border-slate-200 rounded-xl prose prose-sm max-w-none text-slate-800">
                    <div className="whitespace-pre-wrap font-sans text-xs leading-relaxed">
                      {body || <span className="text-slate-400 italic">No content typed yet.</span>}
                    </div>
                  </div>
                )}
              </div>

              {/* Sources & Methodology Field (With Validation Callout) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <span>Data Sources &amp; Research Methodology</span>
                    {hasNumericClaim && (
                      <span className="text-rose-500 font-extrabold">* (Required due to % or NPS in body)</span>
                    )}
                  </label>
                  {hasNumericClaim && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                      <BarChart2 className="w-3 h-3 text-amber-600" />
                      Numeric claim detected (% or NPS)
                    </span>
                  )}
                </div>

                <textarea
                  rows={3}
                  placeholder="Specify sample size (n=...), dates of inquiry, demographic normalization, double-blind questionnaires, etc."
                  value={sourcesNote}
                  onChange={(e) => setSourcesNote(e.target.value)}
                  className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-purple-500 focus:bg-white ${
                    sourcesMissingWhenRequired
                      ? 'border-amber-400 bg-amber-50/50 ring-1 ring-amber-400'
                      : 'border-slate-200'
                  }`}
                />

                {sourcesMissingWhenRequired && (
                  <p className="text-[11px] text-amber-700 font-semibold flex items-center gap-1 mt-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>
                      Guardrail: Article contains percentage statistics or NPS metrics. Please cite your data source and methodology notes before publishing.
                    </span>
                  </p>
                )}
              </div>

              {/* Research Methodology & Audit Metadata */}
              <div className="p-4 bg-purple-50/50 rounded-2xl border border-purple-100 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-purple-900 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-purple-600" />
                    <span>Empirical Research Methodology &amp; Audit Metadata</span>
                  </h4>
                  <span className="text-[10px] text-purple-700 font-semibold">Phase 5 &amp; 6 Standards</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Primary Research Question
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. What factors drive storefront loyalty and subscription retention among active console owners?"
                      value={researchQuestion}
                      onChange={(e) => setResearchQuestion(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Fieldwork Dates / Inquiry Window
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. February 1 – February 18, 2026"
                      value={fieldworkDates}
                      onChange={(e) => setFieldworkDates(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Valid Responses Sample Size (n)
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 1420"
                      value={validResponsesCount}
                      onChange={(e) => setValidResponsesCount(e.target.value ? Number(e.target.value) : '')}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Recruitment Method
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Opt-in verified consumer research panel with double-blind screening"
                      value={recruitmentMethod}
                      onChange={(e) => setRecruitmentMethod(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Participant Geography
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. United States (58%), United Kingdom (22%), Germany (12%)"
                      value={participantGeography}
                      onChange={(e) => setParticipantGeography(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Participant Characteristics &amp; Demographics
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Adult consumers aged 18–49 with confirmed daily or weekly product engagement."
                      value={participantDemographics}
                      onChange={(e) => setParticipantDemographics(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Sample Limitations &amp; Potential Bias (Mandatory Disclosure)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Convenience sample derived from opted-in panel respondents; percentages reflect sample responses and cannot be generalized as representative of general population without weighting."
                      value={sampleLimitations}
                      onChange={(e) => setSampleLimitations(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Assigned Reviewer / Auditor
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Dr. Evelyn Martinez, Lead Consumer Research Methodologist"
                      value={reviewerName}
                      onChange={(e) => setReviewerName(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Research Classification
                    </label>
                    <select
                      value={studyTypeClassification}
                      onChange={(e) => setStudyTypeClassification(e.target.value as 'independent' | 'commissioned')}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="independent">Independent Research (Not Commissioned by Brand)</option>
                      <option value="commissioned">Commissioned Enterprise Study</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2 flex items-center gap-3 pt-1">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800">
                      <input
                        type="checkbox"
                        checked={isIllustrativeDemo}
                        onChange={(e) => setIsIllustrativeDemo(e.target.checked)}
                        className="w-4 h-4 text-purple-600 rounded border-slate-300 focus:ring-purple-500"
                      />
                      <span>Mark as Illustrative Demonstration (Excludes from empirical claims)</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Status & Published Date Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Publication Status (Draft &rarr; Review &rarr; Published)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setStatus('draft')}
                      className={`py-2 px-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        status === 'draft'
                          ? 'bg-amber-50 border-amber-300 text-amber-800 shadow-2xs'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      <span>Draft (Private)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatus('under_review')}
                      className={`py-2 px-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        status === 'under_review'
                          ? 'bg-indigo-50 border-indigo-300 text-indigo-800 shadow-2xs'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Under Review</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatus('published')}
                      className={`py-2 px-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        status === 'published'
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-800 shadow-2xs'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Published (Live)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatus('rejected')}
                      className={`py-2 px-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        status === 'rejected'
                          ? 'bg-rose-50 border-rose-300 text-rose-800 shadow-2xs'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                      <span>Revision Needed</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Published Timestamp
                  </label>
                  <input
                    type="datetime-local"
                    value={publishedAt}
                    onChange={(e) => setPublishedAt(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-purple-500 focus:bg-white"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Auto-generated upon publishing if left empty.
                  </span>
                </div>
              </div>

              {/* Modal Footer Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="btn-save-research-study-submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{editingArticleId ? 'Save Changes' : 'Publish Study'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-extrabold text-slate-900">Delete Research Study?</h4>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to delete this study? This action will permanently remove it from the live site and database.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-xl transition-all shadow-md cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
