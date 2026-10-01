import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { SurveyCooldownTimer } from './SurveyCooldownTimer';
import {
  Clock,
  ShieldCheck,
  Sparkles,
  X,
  Copy,
  Check,
  Share2,
  MessageCircle,
  Twitter,
  Facebook,
  Linkedin,
  Send,
  RotateCcw,
  CheckCircle2,
  Users,
  ExternalLink,
  Award,
} from 'lucide-react';

export const SurveyCooldownModal: React.FC = () => {
  const {
    currentUser,
    isSurveyCooldownModalOpen,
    setIsSurveyCooldownModalOpen,
    surveyCooldownUntil,
    clearSurveyCooldown,
    setCurrentView,
    recordReferralShare,
    showToast,
  } = useApp();

  const [copiedLink, setCopiedLink] = useState(false);

  if (!isSurveyCooldownModalOpen || !surveyCooldownUntil) {
    return null;
  }

  const unlockDate = new Date(surveyCooldownUntil);
  const formattedUnlockTime = unlockDate.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
  const formattedUnlockDate = unlockDate.toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
  });

  const userCode =
    currentUser?.referralCode ||
    (currentUser
      ? `VF-${currentUser.name.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 4)}${currentUser.id.slice(-4).toUpperCase()}`
      : 'VF-360BONUS');

  const baseUrl =
    typeof window !== 'undefined' ? window.location.origin : 'https://voiceflow360.com';
  const referralLink = `${baseUrl}/?ref=${userCode}`;
  const shareMessage = `Hey! Join Voice Flow 360 with my invite link to participate in studies and earn rewards: ${referralLink}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopiedLink(true);
    recordReferralShare();
    showToast('Referral link copied to clipboard!', 'success');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleWhatsAppShare = () => {
    recordReferralShare();
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareMessage)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleSocialShare = (platform: 'twitter' | 'facebook' | 'telegram' | 'linkedin') => {
    recordReferralShare();
    let shareUrl = '';
    if (platform === 'twitter') {
      shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent('Join Voice Flow 360 to participate in studies and earn rewards! Use my invite link:')}&url=${encodeURIComponent(referralLink)}`;
    } else if (platform === 'facebook') {
      shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`;
    } else if (platform === 'telegram') {
      shareUrl = `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(shareMessage)}`;
    } else if (platform === 'linkedin') {
      shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralLink)}`;
    }
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        recordReferralShare();
        await navigator.share({
          title: 'Voice Flow 360 — Participate in Studies and Earn Rewards',
          text: 'Join me on Voice Flow 360 to participate in studies and earn rewards!',
          url: referralLink,
        });
      } catch {
        // user cancelled or share aborted
      }
    } else {
      handleCopyLink();
    }
  };

  const isAdmin = currentUser?.role === 'admin';

  return (
    <div
      id="survey-cooldown-modal-overlay"
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in overflow-y-auto"
      onClick={() => setIsSurveyCooldownModalOpen(false)}
    >
      <div
        id="survey-cooldown-modal"
        className="bg-white rounded-3xl border border-slate-200/90 shadow-2xl max-w-lg w-full p-5 sm:p-6 space-y-4 relative overflow-hidden my-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ambient background accents */}
        <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-amber-200/30 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 rounded-full bg-emerald-200/30 blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          id="close-cooldown-modal-btn"
          onClick={() => setIsSurveyCooldownModalOpen(false)}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer z-10"
          title="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Badges & Title */}
        <div className="flex flex-col items-center text-center space-y-2 pt-1">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 text-slate-950 flex items-center justify-center shadow-md shadow-amber-500/20">
            <Clock className="w-6 h-6 stroke-[2.5]" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-black tracking-wide">
            <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
            <span>Daily Limit Reached (5/5 Completed)</span>
          </div>

          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            Daily Survey & Quiz Limit Reached
          </h2>

          <p className="text-xs text-slate-600 max-w-md leading-relaxed">
            In one day, only <strong>5 earnings</strong> can be done via surveys or quizzes. Your 5 slots for today are filled! New survey & quiz earnings unlock at the next daily reset.
          </p>
        </div>

        {/* Countdown Box */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 text-center space-y-1.5">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center justify-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Next daily survey & quiz earnings unlock in:</span>
          </div>

          <SurveyCooldownTimer
            targetDate={surveyCooldownUntil}
            size="sm"
            onExpire={() => setIsSurveyCooldownModalOpen(false)}
          />

          <div className="text-[11px] text-slate-500 font-medium">
            Reset scheduled for <strong>{formattedUnlockTime}</strong> ({formattedUnlockDate})
          </div>
        </div>

        {/* Earn More By Inviting People */}
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-amber-600 shrink-0" />
              <h3 className="text-sm font-black text-slate-900">
                Want to keep earning? Invite other people!
              </h3>
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 shrink-0">
              Unlimited
            </span>
          </div>

          {/* Explicit payment condition as requested */}
          <div className="bg-amber-50/90 border border-amber-200 rounded-xl p-3 flex items-start gap-2.5">
            <Award className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-950 leading-relaxed">
              <strong>Reward Condition:</strong> Customer will be credited <strong>300 Reward Coins</strong> only when someone joins from the invitations. Participate in studies and earn rewards!
            </div>
          </div>

          {/* The 3 Sharing Options */}
          <div className="space-y-2.5">
            {/* Option 1: Copy Link */}
            <div className="bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-2xl p-3 transition-colors">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold">1</span>
                  Copy Your Referral Link
                </span>
                <span className="font-mono text-slate-500">Code: {userCode}</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={referralLink}
                  aria-label="Your referral invite link"
                  className="flex-1 bg-white border border-slate-300 text-slate-800 text-xs rounded-xl px-3 py-2 font-mono truncate focus:outline-hidden"
                />
                <button
                  id="modal-copy-link-btn"
                  onClick={handleCopyLink}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer shadow-xs ${
                    copiedLink
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-900 hover:bg-slate-800 text-white'
                  }`}
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Link</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Option 2: Share via WhatsApp */}
            <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-3">
              <div className="flex items-center justify-between text-[11px] font-bold text-emerald-950 mb-2">
                <span className="flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold">2</span>
                  Share Link via WhatsApp
                </span>
                <span className="text-emerald-700 font-medium text-[10px]">Instant Message</span>
              </div>
              <button
                id="modal-whatsapp-share-btn"
                onClick={handleWhatsAppShare}
                className="w-full py-2.5 px-4 bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-black rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01]"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Share Link via WhatsApp</span>
              </button>
            </div>

            {/* Option 3: Share on Social Profiles */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 mb-2">
                <span className="flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold">3</span>
                  Share Link on Social Profiles
                </span>
                <span className="text-slate-500 font-medium text-[10px]">Post &amp; Earn</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  id="modal-share-twitter-btn"
                  onClick={() => handleSocialShare('twitter')}
                  className="px-3 py-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                  title="Share on X (Twitter)"
                >
                  <Twitter className="w-3.5 h-3.5 text-[#1DA1F2]" />
                  <span>X (Twitter)</span>
                </button>

                <button
                  id="modal-share-facebook-btn"
                  onClick={() => handleSocialShare('facebook')}
                  className="px-3 py-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                  title="Share on Facebook"
                >
                  <Facebook className="w-3.5 h-3.5 text-[#1877F2]" />
                  <span>Facebook</span>
                </button>

                <button
                  id="modal-share-telegram-btn"
                  onClick={() => handleSocialShare('telegram')}
                  className="px-3 py-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                  title="Share on Telegram"
                >
                  <Send className="w-3.5 h-3.5 text-[#229ED9]" />
                  <span>Telegram</span>
                </button>

                <button
                  id="modal-share-linkedin-btn"
                  onClick={() => handleSocialShare('linkedin')}
                  className="px-3 py-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                  title="Share on LinkedIn"
                >
                  <Linkedin className="w-3.5 h-3.5 text-[#0A66C2]" />
                  <span>LinkedIn</span>
                </button>
              </div>

              {typeof navigator !== 'undefined' && 'share' in navigator && (
                <button
                  id="modal-native-share-btn"
                  onClick={handleNativeShare}
                  className="w-full mt-2 py-1.5 px-3 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Share2 className="w-3 h-3 text-slate-500" />
                  <span>More Device Sharing Options...</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Modal Action Buttons / Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 pt-2 border-t border-slate-100">
          {isAdmin ? (
            <button
              id="admin-reset-cooldown-btn"
              onClick={() => {
                clearSurveyCooldown();
                setIsSurveyCooldownModalOpen(false);
              }}
              className="w-full sm:w-auto px-3.5 py-2 text-xs font-bold text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              title="Reset daily limit for testing (Admin only)"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Admin: Reset Daily Limit</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
              <span>Anti-Fraud &amp; Quality Safeguard</span>
            </div>
          )}

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              id="view-referral-page-btn"
              onClick={() => {
                setIsSurveyCooldownModalOpen(false);
                setCurrentView('referrals');
              }}
              className="flex-1 sm:flex-none px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black rounded-xl transition-all cursor-pointer shadow-xs flex items-center justify-center gap-1"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Referrals Hub</span>
            </button>

            <button
              id="close-cooldown-dialog-btn"
              onClick={() => setIsSurveyCooldownModalOpen(false)}
              className="flex-1 sm:flex-none px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

