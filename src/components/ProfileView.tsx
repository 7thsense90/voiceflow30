import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CampaignCategory, UserResponse } from '../types';
import { COUNTRIES } from '../data/countries';
import { SEOHead } from './SEOHead';
import { AuthModal } from './AuthModal';
import {
  User as UserIcon,
  Mail,
  Globe,
  Calendar,
  Coins,
  Sparkles,
  Lock,
  CheckCircle2,
  Eye,
  X,
  FileText,
  Gift,
  Copy,
  Check,
  ArrowRight,
} from 'lucide-react';

const ALL_CATEGORIES: { id: CampaignCategory; label: string }[] = [
  { id: 'services', label: 'Services' },
  { id: 'products', label: 'Products' },
  { id: 'social_media', label: 'Social Media' },
  { id: 'quizzes', label: 'Quizzes' },
  { id: 'market_research', label: 'Market Research' },
  { id: 'quick_questions', label: 'Quick Questions' },
  { id: 'brands', label: 'Brands' },
];

export const ProfileView: React.FC = () => {
  const { currentUser, responses, updateUserProfile, showToast, setCurrentView } = useApp();

  const [name, setName] = useState(currentUser?.name || '');
  const [country, setCountry] = useState(currentUser?.country || '');
  const [bio, setBio] = useState(currentUser?.bio || '');
  const [favorites, setFavorites] = useState<CampaignCategory[]>(
    currentUser?.favoriteCategories || ['products', 'services']
  );

  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);

  const [selectedResponseModal, setSelectedResponseModal] = useState<UserResponse | null>(null);

  if (!currentUser) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center py-12 px-4 min-h-[calc(100vh-12rem)]">
        <div className="w-full max-w-md">
          <AuthModal initialMode="login" />
        </div>
      </div>
    );
  }

  const userResponses = responses.filter((r) => r.userId === currentUser.id);

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile(currentUser.id, {
      name: name.trim(),
      country,
      bio: bio.trim(),
      favoriteCategories: favorites,
    });
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPass.length < 6) {
      showToast('New password must be at least 6 characters', 'error');
      return;
    }
    if (newPass !== confirmPass) {
      showToast('New passwords do not match', 'error');
      return;
    }
    setCurrentPass('');
    setNewPass('');
    setConfirmPass('');
    showToast('Password updated successfully', 'success');
  };

  const toggleFavorite = (cat: CampaignCategory) => {
    setFavorites((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <SEOHead
        title="My Account & Survey Activity"
        description="Manage your Voice Flow 360 profile, review completed survey responses, and track your wallet coin earnings."
        canonicalPath="/profile"
        noIndex={true}
      />
      {/* Top Banner */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          My Account &amp; Activity
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Manage your personal details, feedback interests, and inspect past survey submissions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Profile Card & Edit Forms */}
        <div className="lg:col-span-7 space-y-6">
          {/* Main Profile Info Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs">
            <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-300 text-slate-950 font-black text-2xl flex items-center justify-center shadow-md">
                {currentUser.name.charAt(0)}
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">{currentUser.name}</h2>
                <p className="text-xs text-slate-500">{currentUser.email}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200/80 px-2.5 py-0.5 rounded-full">
                    🪙 {currentUser.coinBalance.toLocaleString()} Available Coins
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Joined {new Date(currentUser.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                  </span>
                </div>
              </div>
            </div>

            {/* Profile Edit Form */}
            <form onSubmit={handleProfileSave} className="mt-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-700">Country of Residence</label>
                    <span className="text-[10px] text-slate-400">Optional / Leave empty</span>
                  </div>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-slate-900 cursor-pointer"
                  >
                    <option value="">Not Disclosed / Keep Empty</option>
                    {COUNTRIES.map((c) => (
                      <option key={c.code} value={c.name}>
                        {c.flag} {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Personal Bio</label>
                <textarea
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Share a short bio or feedback interests..."
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>

              {/* Favorite Categories Multi-select */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Preferred Feedback Topics (Used to match campaigns)
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {ALL_CATEGORIES.map((cat) => {
                    const isSelected = favorites.includes(cat.id);
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => toggleFavorite(cat.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-amber-500 text-white shadow-xs'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        {cat.label} {isSelected && '✓'}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Save Profile Changes
                </button>
              </div>
            </form>
          </div>

          {/* Security & Password Change */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Lock className="w-4 h-4 text-slate-500" />
              <span>Security &amp; Password</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Ensure your account is protected with a secure password.
            </p>

            <form onSubmit={handlePasswordChange} className="mt-4 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">New Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={confirmPass}
                    onChange={(e) => setConfirmPass(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Update Password
              </button>
            </form>
          </div>

          {/* Referral Program Info Card */}
          <div className="bg-gradient-to-br from-purple-900 to-indigo-900 rounded-2xl p-6 text-white shadow-md border border-purple-800/50 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  <Gift className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">Your Referral Program</h3>
                  <p className="text-[11px] text-purple-200">Earn 300 coins for every friend who registers</p>
                </div>
              </div>
              <span className="text-xs font-black text-amber-300 bg-white/10 px-2.5 py-1 rounded-full border border-white/10">
                +300 Coins / Ref
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="bg-white/10 rounded-xl p-3 border border-white/10 text-center">
                <span className="text-[10px] text-slate-300 font-semibold uppercase block">Friends Joined</span>
                <span className="text-lg font-black text-white">{currentUser.referralsCount || 0}</span>
              </div>
              <div className="bg-white/10 rounded-xl p-3 border border-white/10 text-center">
                <span className="text-[10px] text-slate-300 font-semibold uppercase block">Referral Coins</span>
                <span className="text-lg font-black text-amber-300">+{currentUser.referralCoinsEarned || (currentUser.referralsCount || 0) * 300}</span>
              </div>
            </div>

            <div className="flex items-center justify-between bg-slate-950/60 border border-white/20 rounded-xl p-3">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Your Invite Code</span>
                <span className="font-mono text-sm font-black text-amber-300">
                  {currentUser.referralCode || `VF-${currentUser.name.slice(0, 4).toUpperCase()}2026`}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  id="profile-copy-ref-code-btn"
                  onClick={() => {
                    const code = currentUser.referralCode || `VF-${currentUser.name.slice(0, 4).toUpperCase()}2026`;
                    navigator.clipboard.writeText(code);
                    setCopiedCode(true);
                    showToast(`Referral code ${code} copied!`, 'success');
                    setTimeout(() => setCopiedCode(false), 2000);
                  }}
                  className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? 'Copied' : 'Copy'}</span>
                </button>
                <button
                  onClick={() => setCurrentView('referrals')}
                  className="px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                >
                  <span>Hub</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Activity History */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Completed Feedback Activity</h3>
                <p className="text-xs text-slate-500">
                  {userResponses.length} conversation(s) submitted
                </p>
              </div>
            </div>

            {userResponses.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                No feedback activities completed yet. Start a chat on your dashboard!
              </div>
            ) : (
              <div className="divide-y divide-slate-100 mt-2 max-h-[500px] overflow-y-auto pr-1">
                {userResponses.map((resp) => (
                  <div key={resp.id} className="py-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-bold text-xs text-slate-900 leading-snug">
                          {resp.campaignTitle}
                        </h4>
                        <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
                          <span className="capitalize">{resp.category.replace('_', ' ')}</span>
                          <span>•</span>
                          <span>
                            {new Date(resp.completedAt).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                      </div>
                      <div className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full shrink-0">
                        +{resp.coinsAwarded} Coins
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1">
                      <span className="text-[11px] text-slate-500 font-medium">
                        {resp.answers.length} answers submitted
                      </span>
                      <button
                        onClick={() => setSelectedResponseModal(resp)}
                        className="text-indigo-600 hover:text-indigo-800 font-semibold text-xs flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Answers</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Submitted Answers Modal */}
      {selectedResponseModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  {selectedResponseModal.campaignTitle}
                </h3>
                <p className="text-xs text-slate-500">
                  Completed on {new Date(selectedResponseModal.completedAt).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedResponseModal(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4">
              {selectedResponseModal.answers.map((ans, idx) => (
                <div key={idx} className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="text-xs font-bold text-slate-700">
                    Q{idx + 1}: {ans.questionText}
                  </div>
                  <div className="text-xs font-semibold text-slate-900 mt-1.5 bg-white p-2.5 rounded-lg border border-slate-200">
                    {Array.isArray(ans.answer) ? ans.answer.join(', ') : String(ans.answer)}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-slate-100 text-right bg-slate-50">
              <button
                onClick={() => setSelectedResponseModal(null)}
                className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
