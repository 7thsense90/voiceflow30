import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { SEOHead } from './SEOHead';
import {
  Gift,
  Copy,
  Check,
  Users,
  Coins,
  DollarSign,
  ShieldCheck,
  Send,
  MessageCircle,
  Twitter,
  Mail,
  QrCode,
  Info,
  ChevronDown,
  ChevronUp,
  Award,
  CheckCircle2,
  ArrowRight,
  UserPlus,
  Lock,
  Sparkles,
  Share2,
  Download,
  Megaphone,
} from 'lucide-react';
import { AuthModal } from './AuthModal';
import { DirectInviteTool } from './DirectInviteTool';
import { ReferralMarketingKit } from './ReferralMarketingKit';

export const ReferralProgram: React.FC = () => {
  const { currentUser, referrals, showToast, settings, setCurrentView, recordReferralShare } = useApp();
  
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [showQrCode, setShowQrCode] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Check if current user is an authenticated registered member
  const isAuthenticated = !!currentUser && !currentUser.isGuest;

  // Derive user's referral code from their registered account
  const userCode = currentUser?.referralCode || (currentUser ? `VF-${currentUser.name.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 4)}${currentUser.id.slice(-4).toUpperCase()}` : '');
  const baseUrl = 'https://voiceflow360.com';
  const referralLink = userCode ? `${baseUrl}/?ref=${userCode}` : `${baseUrl}/`;

  // Filter referrals specifically for this user
  const userReferrals = currentUser
    ? referrals.filter((r) => r.referrerId === currentUser.id)
    : [];

  const totalFriendsReferred = userReferrals.length > 0 ? userReferrals.length : (currentUser?.referralsCount || 0);
  const rewardPerRef = settings.referralRewardCoins || 300;
  const totalCoinsEarned = userReferrals.length > 0
    ? userReferrals.reduce((sum, r) => sum + r.coinsAwarded, 0)
    : (currentUser?.referralCoinsEarned || totalFriendsReferred * rewardPerRef);
  const totalUsdValue = totalCoinsEarned * (settings.coinToUsdRate || 0.01);

  const handleCopyLink = () => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }
    navigator.clipboard.writeText(referralLink);
    setCopiedLink(true);
    recordReferralShare();
    showToast('Referral link copied to clipboard!', 'success');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopyCode = () => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }
    navigator.clipboard.writeText(userCode);
    setCopiedCode(true);
    recordReferralShare();
    showToast(`Referral code ${userCode} copied!`, 'success');
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const shareText = encodeURIComponent(
    `Join me on Voice Flow 360! Use my referral code ${userCode} or click my link to get a signup bonus and earn cash for quick surveys & quizzes:`
  );
  const shareUrl = encodeURIComponent(referralLink);

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 pb-12">
      <SEOHead
        title="Referral Program - Invite Friends & Earn 300 Coins"
        description="Earn 300 bonus coins ($3.00) plus 10% lifetime dividend on all survey earnings from friends you invite. Generate your unique referral link now."
        keywords={[
          'survey referral program',
          'invite friends earn cash',
          'affiliate survey rewards',
          'earn coins sharing link',
          'passive survey income',
        ]}
        canonicalPath="/referrals"
      />
      {/* Auth Modal Popup if unauthenticated user clicks to generate code */}
      {showAuthModal && (
        <AuthModal
          initialMode="register"
          onClose={() => setShowAuthModal(false)}
        />
      )}

      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-900 via-indigo-900 to-slate-900 text-white p-6 sm:p-10 shadow-2xl border border-purple-800/40">
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-12 -bottom-12 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-400/20 border border-amber-300/30 text-amber-300 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
              <Gift className="w-4 h-4 text-amber-400 animate-pulse" />
              <span>Referrel eraning • Referral Earning Hub</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
              Referrel eraning — Invite Friends &amp; Earn{' '}
              <span className="text-amber-400 underline decoration-amber-400/50 decoration-wavy underline-offset-8">
                300 Coins ($3.00)
              </span>
            </h1>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl">
              All referral data, invite codes, and friend tracking in one place. Customer will be paid <strong className="text-white font-semibold">300 coins ($3.00 USD)</strong> only when someone joins from the invitations.
            </p>

            {/* Quick Highlights */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-3 text-center">
                <div className="text-amber-300 font-extrabold text-xl sm:text-2xl">300</div>
                <div className="text-[11px] text-slate-300 font-medium">Coins / Friend</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-3 text-center">
                <div className="text-emerald-300 font-extrabold text-xl sm:text-2xl">Instant</div>
                <div className="text-[11px] text-slate-300 font-medium">Signup Credit</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-3 text-center">
                <div className="text-cyan-300 font-extrabold text-xl sm:text-2xl">Unlimited</div>
                <div className="text-[11px] text-slate-300 font-medium">Referrals Allowed</div>
              </div>
            </div>
          </div>

          {/* User Code & Share Box */}
          <div className="lg:col-span-5 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-xl space-y-4">
            {isAuthenticated ? (
              <>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                      Your Unique Referral Code
                    </span>
                    <span className="text-[10px] font-bold text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-400/30">
                      Active &amp; Ready
                    </span>
                  </div>
                  <div className="flex items-center justify-between bg-slate-950/70 border border-white/20 rounded-2xl px-4 py-3">
                    <span className="font-mono text-xl sm:text-2xl font-black text-amber-300 tracking-wider">
                      {userCode}
                    </span>
                    <button
                      id="copy-ref-code-btn"
                      onClick={handleCopyCode}
                      className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md active:scale-95 cursor-pointer"
                    >
                      {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedCode ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>

                <div>
                  <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1">
                    Your Shareable Invite Link
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      id="ref-link-input-display"
                      readOnly
                      value={referralLink}
                      className="w-full bg-slate-950/70 border border-white/20 rounded-2xl px-3.5 py-2.5 text-xs text-slate-200 font-mono focus:outline-none truncate"
                    />
                    <button
                      id="copy-ref-link-btn"
                      onClick={handleCopyLink}
                      className="px-4 py-2.5 bg-white text-purple-950 hover:bg-slate-100 rounded-2xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 shadow-md active:scale-95 cursor-pointer"
                    >
                      {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      <span>{copiedLink ? 'Copied!' : 'Copy'}</span>
                    </button>
                  </div>
                </div>

                {/* Social Sharing */}
                <div>
                  <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider block mb-2">
                    1-Click Social Sharing
                  </span>
                  <div className="flex items-center gap-2 flex-wrap">
                    <a
                      id="share-whatsapp-btn"
                      href={`https://api.whatsapp.com/send?text=${shareText}%20${shareUrl}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2.5 bg-[#25D366]/20 hover:bg-[#25D366]/40 text-[#25D366] border border-[#25D366]/30 rounded-xl transition-all"
                      title="Share on WhatsApp"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </a>
                    <a
                      id="share-telegram-btn"
                      href={`https://t.me/share/url?url=${shareUrl}&text=${shareText}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2.5 bg-[#0088cc]/20 hover:bg-[#0088cc]/40 text-[#0088cc] border border-[#0088cc]/30 rounded-xl transition-all"
                      title="Share on Telegram"
                    >
                      <Send className="w-4 h-4" />
                    </a>
                    <a
                      id="share-twitter-btn"
                      href={`https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2.5 bg-slate-800 hover:bg-slate-700 text-white border border-white/20 rounded-xl transition-all"
                      title="Share on X / Twitter"
                    >
                      <Twitter className="w-4 h-4" />
                    </a>
                    <a
                      id="share-email-btn"
                      href={`mailto:?subject=Earn%20Cash%20Rewards%20on%20Voice%20Flow%20360&body=${shareText}%20${shareUrl}`}
                      className="p-2.5 bg-amber-500/20 hover:bg-amber-500/40 text-amber-300 border border-amber-500/30 rounded-xl transition-all"
                      title="Share via Email"
                    >
                      <Mail className="w-4 h-4" />
                    </a>
                    <button
                      id="jump-to-marketing-kit-btn"
                      onClick={() => {
                        const el = document.getElementById('download-selected-banner-top-btn');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="p-2.5 bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 border border-amber-400/30 rounded-xl transition-all flex items-center gap-1.5 text-xs font-bold cursor-pointer"
                      title="Prebuilt Ad Banners & Copy"
                    >
                      <Megaphone className="w-4 h-4 text-amber-400" />
                      <span className="hidden sm:inline">Ad Banners &amp; Copy</span>
                    </button>
                    <button
                      id="toggle-qr-code-btn"
                      onClick={() => setShowQrCode(!showQrCode)}
                      className="p-2.5 bg-purple-500/20 hover:bg-purple-500/40 text-purple-300 border border-purple-500/30 rounded-xl transition-all ml-auto flex items-center gap-1 text-xs font-semibold cursor-pointer"
                    >
                      <QrCode className="w-4 h-4" />
                      <span>{showQrCode ? 'Hide QR' : 'Show QR'}</span>
                    </button>
                  </div>

                  {showQrCode && (
                    <div className="mt-3 p-4 bg-white rounded-2xl text-slate-900 text-center animate-fadeIn shadow-lg">
                      <p className="text-xs font-bold text-slate-800 mb-2">Scan to join with code {userCode}</p>
                      <div className="w-36 h-36 mx-auto bg-slate-100 border border-slate-300 rounded-xl flex items-center justify-center p-2">
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(referralLink)}`}
                          alt={`QR code for ${userCode}`}
                          className="w-full h-full object-contain rounded-lg"
                        />
                      </div>
                      <p className="text-[10px] text-slate-500 mt-2">Point phone camera to open invite link</p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* Unauthenticated / First Sign Up Prompt */
              <div className="space-y-4 text-center py-4">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-400/20 border border-amber-300/30 text-amber-300 flex items-center justify-center">
                  <Lock className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Sign Up to Generate Your Code</h3>
                  <p className="text-xs text-slate-300 mt-1 max-w-sm mx-auto">
                    Customers must complete free registration first in order to generate a unique personal referral code and invite friends.
                  </p>
                </div>
                <div className="pt-2 flex flex-col gap-2">
                  <button
                    id="signup-to-unlock-ref-btn"
                    onClick={() => setShowAuthModal(true)}
                    className="w-full py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Sign Up Free to Get Your Code</span>
                  </button>
                  <button
                    id="login-to-unlock-ref-btn"
                    onClick={() => setCurrentView('login')}
                    className="w-full py-2.5 bg-white/10 hover:bg-white/20 text-slate-200 font-bold text-xs rounded-2xl border border-white/20 transition-all cursor-pointer"
                  >
                    Already have an account? Sign In
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Referral Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Friends Joined</span>
            <div className="text-2xl font-black text-slate-900 mt-0.5">{totalFriendsReferred}</div>
            <span className="text-[11px] text-purple-700 font-semibold">Active Referrals</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
            <Coins className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Referral Coins</span>
            <div className="text-2xl font-black text-amber-700 mt-0.5">+{totalCoinsEarned}</div>
            <span className="text-[11px] text-slate-500 font-medium">{rewardPerRef} coins / verified signup</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">USD Value</span>
            <div className="text-2xl font-black text-emerald-700 mt-0.5">${totalUsdValue.toFixed(2)}</div>
            <span className="text-[11px] text-emerald-600 font-medium">Ready for cashout</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Referral Status</span>
            <div className="text-base font-extrabold text-blue-900 mt-0.5">
              {totalFriendsReferred >= 5 ? 'Gold Ambassador' : totalFriendsReferred >= 2 ? 'Silver Referrer' : 'Active Referrer'}
            </div>
            <span className="text-[11px] text-slate-500">Tier benefits active</span>
          </div>
        </div>
      </div>

      {/* Direct Invitation Tool (Email or Mobile Phone Number) */}
      {isAuthenticated && (
        <DirectInviteTool
          variant="full"
          title="Direct Friend Invitation (Email or Phone Number)"
          subtitle="Send your unique invite code directly to friends via email or SMS text message. Earn unlimited referral bonuses every day!"
        />
      )}

      {/* Social Media Marketing Kit: Downloadable JPG Banners & Prebuilt Ad Copy */}
      <ReferralMarketingKit
        userCode={userCode}
        referralLink={referralLink}
        isAuthenticated={isAuthenticated}
        onAuthRequired={() => setShowAuthModal(true)}
        showToast={showToast}
      />

      {/* Two Column Section: How It Works Guide & Terms */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Clear Step-by-Step Program Guide (Replacing Simulator) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-100 text-purple-700">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">How the Referral Program Works</h2>
                <p className="text-xs text-slate-500">Simple 3-step process to generate your code &amp; earn 300 coins</p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold">
              300 Coins / Invite
            </span>
          </div>

          {/* 3 Step Process Cards */}
          <div className="space-y-3.5">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3.5 hover:border-purple-300 transition-colors">
              <div className="w-9 h-9 rounded-xl bg-purple-600 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-sm">
                1
              </div>
              <div className="space-y-1">
                <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                  <span>Sign Up Free to Create Your Unique Code</span>
                  {isAuthenticated && (
                    <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md font-semibold">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Done
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Register your account with your email. Your unique referral code (e.g. <span className="font-mono font-bold text-purple-700">{userCode || 'VF-YOURCODE'}</span>) is generated automatically and bound permanently to your profile.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3.5 hover:border-indigo-300 transition-colors">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-sm">
                2
              </div>
              <div className="space-y-1">
                <div className="text-xs font-bold text-slate-900">Share Your Invite Link with Friends</div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Send your personal invite link or referral code via WhatsApp, Telegram, X (Twitter), email, or QR code. There is no limit to the number of friends you can invite.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3.5 hover:border-amber-300 transition-colors">
              <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 font-black text-sm flex items-center justify-center shrink-0 shadow-sm">
                3
              </div>
              <div className="space-y-1">
                <div className="text-xs font-bold text-slate-900">Instant 300 Coins Credit on Friend Signup</div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  As soon as your friend registers successfully using your code or link, you automatically receive <strong className="text-slate-900 font-semibold">300 Coins ($3.00 USD)</strong> in your account balance. Your friend also receives bonus welcome coins!
                </p>
              </div>
            </div>
          </div>

          {/* Quick Action Footer */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 bg-purple-50/60 p-4 rounded-2xl border border-purple-100">
            <div className="flex items-center gap-2 text-xs text-purple-950">
              <ShieldCheck className="w-4 h-4 text-purple-700 shrink-0" />
              <span>Referral earnings can be withdrawn to PayPal, crypto, or gift cards.</span>
            </div>
            {isAuthenticated ? (
              <button
                onClick={handleCopyLink}
                className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedLink ? 'Link Copied!' : 'Copy Referral Link'}</span>
              </button>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Sign Up to Get Code</span>
              </button>
            )}
          </div>
        </div>

        {/* Right: Terms & Conditions Card */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-blue-100 text-blue-700">
                <Info className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-slate-900">Terms &amp; Conditions Applicable</h2>
            </div>
            
            <p className="text-xs text-slate-600 leading-relaxed">
              Our referral program is designed to reward honest members who help grow the Voice Flow 360 consumer insights community.
            </p>

            <ul className="space-y-2.5 text-xs text-slate-700 pt-1">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Prior Registration Required:</strong> Users must register and log in first to generate a verified unique referral code before inviting friends.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>300 Coins per Referral:</strong> Awarded immediately upon successful registration of each new member with a verified unique email.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>New Accounts Only:</strong> The referred user must be an authentic new member who has not registered previously on the platform.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Anti-Fraud &amp; Fair Play:</strong> Self-referrals, disposable emails, and duplicate IP abuse are filtered automatically.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Redemption &amp; Payout:</strong> Referral coins are fully redeemable for PayPal, crypto, bank transfer, or gift cards subject to standard platform rules.
                </span>
              </li>
            </ul>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              id="view-full-terms-toggle-btn"
              onClick={() => setShowTerms(!showTerms)}
              className="text-xs font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1 cursor-pointer"
            >
              <span>{showTerms ? 'Hide Detailed Legal Terms' : 'View Full Referral Terms'}</span>
              {showTerms ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={() => setCurrentView('rewards')}
              className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
            >
              <span>Redeem Coins</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {showTerms && (
            <div className="mt-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600 space-y-2 animate-fadeIn max-h-48 overflow-y-auto">
              <p><strong>1. Eligibility:</strong> You must be an active registered member of Voice Flow 360 in good standing to participate in the Referral Program.</p>
              <p><strong>2. Qualification:</strong> A &apos;Qualified Referral&apos; is defined as a unique natural person who completes registration using a valid referral code/link. Duplicate IP addresses or identical device fingerprints may be flagged for review.</p>
              <p><strong>3. Reward Allocation:</strong> The 300 coins reward will be credited directly to your ledger balance upon successful new account registration.</p>
              <p><strong>4. Platform Rights:</strong> Voice Flow 360 reserves the right to modify, suspend, or terminate the referral program or revoke fraudulent balances at its sole discretion in cases of system abuse or spamming.</p>
            </div>
          )}
        </div>
      </div>

      {/* Referral History Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">Your Referral Activity &amp; Friends</h2>
            <p className="text-xs text-slate-500">History of friends who registered with your unique code and earned rewards.</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-bold border border-purple-200/60">
              {userReferrals.length} Total Referred
            </span>
          </div>
        </div>

        {userReferrals.length === 0 ? (
          <div className="text-center py-12 px-4 space-y-3">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center">
              <Users className="w-7 h-7" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">No Referrals Recorded Yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {isAuthenticated
                ? 'Share your unique invite link above with friends, colleagues, and family to earn 300 coins for every friend who joins!'
                : 'Sign up for a free account to unlock your unique referral code and start inviting friends.'}
            </p>
            {isAuthenticated ? (
              <button
                onClick={handleCopyLink}
                className="mt-2 px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-sm active:scale-95"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy My Unique Invite Link</span>
              </button>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="mt-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-sm active:scale-95"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Sign Up Free to Get Code</span>
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3">Friend Name</th>
                  <th className="px-5 py-3">Email Address</th>
                  <th className="px-5 py-3">Joined Date</th>
                  <th className="px-5 py-3">Reward Earned</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {userReferrals.map((r) => {
                  // Mask email slightly for privacy
                  const parts = r.referredUserEmail.split('@');
                  const maskedEmail = parts.length === 2
                    ? `${parts[0].slice(0, 2)}***@${parts[1]}`
                    : r.referredUserEmail;

                  return (
                    <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-3.5 font-bold text-slate-900 flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 text-white font-bold flex items-center justify-center text-[10px]">
                          {r.referredUserName.charAt(0).toUpperCase()}
                        </div>
                        <span>{r.referredUserName}</span>
                      </td>
                      <td className="px-5 py-3.5 font-mono text-slate-500">{maskedEmail}</td>
                      <td className="px-5 py-3.5 text-slate-500">
                        {new Date(r.joinedAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="px-5 py-3.5 font-extrabold text-amber-700">
                        +{r.coinsAwarded} Coins
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Verified &amp; Credited</span>
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
