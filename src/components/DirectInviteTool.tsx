import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Gift,
  Copy,
  Check,
  Mail,
  Phone,
  Send,
  MessageCircle,
  Twitter,
  Sparkles,
  UserPlus,
  Share2,
  Clock,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Smartphone,
  ExternalLink,
} from 'lucide-react';

interface DirectInviteToolProps {
  variant?: 'compact' | 'full' | 'modal';
  title?: string;
  subtitle?: string;
  onInviteSent?: () => void;
}

export const DirectInviteTool: React.FC<DirectInviteToolProps> = ({
  variant = 'full',
  title,
  subtitle,
  onInviteSent,
}) => {
  const {
    currentUser,
    settings,
    showToast,
    recordReferralShare,
    directInvitations,
    sendDirectInvite,
    simulateReferralSignup,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'email' | 'phone'>('email');
  const [emailInput, setEmailInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [friendNameInput, setFriendNameInput] = useState('');
  const [customNote, setCustomNote] = useState('');
  const [showCustomizeMessage, setShowCustomizeMessage] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSentRecipient, setLastSentRecipient] = useState<string | null>(null);

  const userCode =
    currentUser?.referralCode ||
    (currentUser
      ? `VF-${currentUser.name.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 4)}${currentUser.id.slice(-4).toUpperCase()}`
      : 'VF-360BONUS');

  const baseUrl = 'https://voiceflow360.com';
  const referralLink = `${baseUrl}/?ref=${userCode}`;
  const rewardCoins = settings.referralRewardCoins || 300;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(userCode);
    setCopiedCode(true);
    recordReferralShare();
    showToast(`Referral code ${userCode} copied to clipboard!`, 'success');
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopiedLink(true);
    recordReferralShare();
    showToast('Referral invite link copied to clipboard!', 'success');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const defaultInviteMessage = `Hey! Join me on Voice Flow 360 to earn real cash taking quick surveys and fun trivia quizzes. Use my invite code ${userCode} or link to get a starter coin bonus: ${referralLink}`;

  const messageToSend = customNote.trim()
    ? `${customNote.trim()}\n\nJoin with my code ${userCode}: ${referralLink}`
    : defaultInviteMessage;

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const recipient = activeTab === 'email' ? emailInput.trim() : phoneInput.trim();
    if (!recipient) {
      showToast(
        `Please enter a friend's ${activeTab === 'email' ? 'email address' : 'phone number'}.`,
        'error'
      );
      setIsSubmitting(false);
      return;
    }

    if (activeTab === 'email' && !recipient.includes('@')) {
      showToast('Please enter a valid email address with @.', 'error');
      setIsSubmitting(false);
      return;
    }

    const result = sendDirectInvite(
      recipient,
      activeTab,
      friendNameInput.trim() || undefined,
      customNote.trim() || undefined
    );

    setIsSubmitting(false);

    if (result.success) {
      setLastSentRecipient(recipient);
      if (activeTab === 'email') {
        setEmailInput('');
      } else {
        setPhoneInput('');
      }
      setFriendNameInput('');
      setCustomNote('');
      recordReferralShare();
      if (onInviteSent) {
        onInviteSent();
      }
    } else if (result.error) {
      showToast(result.error, 'error');
    }
  };

  const handleOpenEmailClient = () => {
    const recipient = emailInput.trim();
    const subject = encodeURIComponent(`You're invited to earn cash on Voice Flow 360 (+Bonus Coins)`);
    const body = encodeURIComponent(messageToSend);
    window.location.href = `mailto:${recipient ? encodeURIComponent(recipient) : ''}?subject=${subject}&body=${body}`;
    recordReferralShare();
  };

  const handleOpenSmsClient = () => {
    const recipient = phoneInput.trim().replace(/[^0-9+]/g, '');
    const body = encodeURIComponent(messageToSend);
    window.location.href = recipient ? `sms:${recipient}?body=${body}` : `sms:?body=${body}`;
    recordReferralShare();
  };

  const handleOpenWhatsApp = () => {
    const cleanPhone = phoneInput.trim().replace(/[^0-9]/g, '');
    const text = encodeURIComponent(messageToSend);
    const url = cleanPhone
      ? `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${text}`
      : `https://api.whatsapp.com/send?text=${text}`;
    window.open(url, '_blank');
    recordReferralShare();
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: 'Join Voice Flow 360',
          text: messageToSend,
          url: referralLink,
        });
        recordReferralShare();
        showToast('Shared successfully!', 'success');
      } catch {
        // User cancelled share
      }
    } else {
      handleCopyLink();
    }
  };

  const userSentInvites = directInvitations.filter(
    (inv) => currentUser && inv.userId === currentUser.id
  );

  return (
    <div
      id="direct-invite-tool-container"
      className={`bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden ${
        variant === 'modal' ? 'p-4 sm:p-5 space-y-4' : 'p-6 sm:p-7 space-y-6'
      }`}
    >
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950 flex items-center justify-center shrink-0 shadow-md shadow-amber-500/20">
            <Gift className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                {title || 'Invite Friends & Earn Unlimited Coins'}
              </h3>
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300/60">
                <Sparkles className="w-3 h-3 text-amber-600" />
                No Daily Cap
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              {subtitle ||
                `Earn +${rewardCoins} Coins ($3.00 USD) for every friend who signs up. Referral earnings have no daily limits!`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold shrink-0">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>+{rewardCoins} Coins / Friend</span>
        </div>
      </div>

      {/* Share Invite Code & Link Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Referral Code Box */}
        <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-3.5 space-y-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
            Your Personal Invite Code
          </span>
          <div className="flex items-center justify-between gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2">
            <span className="font-mono text-base sm:text-lg font-black text-slate-900 tracking-wider">
              {userCode}
            </span>
            <button
              id="direct-copy-code-btn"
              type="button"
              onClick={handleCopyCode}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg transition-all flex items-center gap-1 cursor-pointer shadow-xs active:scale-95"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCode ? 'Copied' : 'Copy Code'}</span>
            </button>
          </div>
        </div>

        {/* Referral Link Box */}
        <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-3.5 space-y-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
            Your Shareable Link
          </span>
          <div className="flex items-center justify-between gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2">
            <span className="font-mono text-xs text-slate-600 truncate flex-1">
              {referralLink}
            </span>
            <button
              id="direct-copy-link-btn"
              type="button"
              onClick={handleCopyLink}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg transition-all flex items-center gap-1 cursor-pointer shadow-xs active:scale-95 shrink-0"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Direct Input Form (Email or Phone Number) */}
      <div className="bg-gradient-to-br from-indigo-50/50 via-slate-50 to-amber-50/40 border border-indigo-100 rounded-2xl p-4 sm:p-5 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <h4 className="text-xs sm:text-sm font-black text-slate-900 flex items-center gap-1.5">
              <Send className="w-4 h-4 text-indigo-600" />
              <span>Send Direct Invitation to a Friend</span>
            </h4>
            <p className="text-[11px] text-slate-500">
              Input your friend&apos;s email or phone number to deliver your invite directly.
            </p>
          </div>

          {/* Toggle between Email & Phone */}
          <div className="inline-flex p-1 bg-slate-200/80 rounded-xl">
            <button
              id="invite-tab-email"
              type="button"
              onClick={() => setActiveTab('email')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'email'
                  ? 'bg-white text-indigo-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Email</span>
            </button>
            <button
              id="invite-tab-phone"
              type="button"
              onClick={() => setActiveTab('phone')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'phone'
                  ? 'bg-white text-indigo-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Phone / SMS</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSendInvite} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
            {/* Friend's Name (Optional) */}
            <div className="sm:col-span-4">
              <label className="text-[11px] font-bold text-slate-600 block mb-1">
                Friend&apos;s Name <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <input
                id="friend-name-input"
                type="text"
                value={friendNameInput}
                onChange={(e) => setFriendNameInput(e.target.value)}
                placeholder="e.g. Sarah Connor"
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* Friend's Email or Phone Number */}
            <div className="sm:col-span-8">
              <label className="text-[11px] font-bold text-slate-600 block mb-1">
                {activeTab === 'email' ? "Friend's Email Address" : "Friend's Mobile Phone Number"}{' '}
                <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  {activeTab === 'email' ? (
                    <Mail className="w-4 h-4" />
                  ) : (
                    <Smartphone className="w-4 h-4" />
                  )}
                </div>
                {activeTab === 'email' ? (
                  <input
                    id="friend-email-input"
                    type="email"
                    required
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="friend@example.com"
                    className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                ) : (
                  <input
                    id="friend-phone-input"
                    type="tel"
                    required
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    placeholder="+1 (555) 000-1234"
                    className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Optional Message Customization Toggle */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowCustomizeMessage(!showCustomizeMessage)}
              className="text-[11px] font-bold text-indigo-700 hover:text-indigo-900 flex items-center gap-1 cursor-pointer"
            >
              {showCustomizeMessage ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              <span>{showCustomizeMessage ? 'Hide personalized message' : 'Customize invitation note'}</span>
            </button>

            {showCustomizeMessage && (
              <div className="mt-2 space-y-1.5 animate-in fade-in">
                <textarea
                  id="custom-invite-note-textarea"
                  rows={2}
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                  placeholder="Add a personal greeting (e.g. 'Hey, I've been earning cash on Voice Flow 360 every week!')..."
                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            )}
          </div>

          {/* Action Buttons Row */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
            <div className="flex items-center gap-2">
              <button
                id="send-direct-invite-submit-btn"
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>
                  {activeTab === 'email' ? 'Send Direct Email Invite' : 'Send Direct SMS Invite'}
                </span>
              </button>

              {activeTab === 'email' ? (
                <button
                  type="button"
                  onClick={handleOpenEmailClient}
                  className="px-3.5 py-2.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                  title="Open draft in your email application"
                >
                  <Mail className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="hidden sm:inline">Open in Mail App</span>
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handleOpenSmsClient}
                    className="px-3 py-2.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold text-xs rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
                    title="Open SMS on phone"
                  >
                    <Smartphone className="w-3.5 h-3.5 text-purple-600" />
                    <span>Open Messages</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleOpenWhatsApp}
                    className="px-3 py-2.5 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#128C7E] border border-[#25D366]/30 font-bold text-xs rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
                    title="Send via WhatsApp"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </button>
                </>
              )}
            </div>

            {/* Quick 1-Click Social Sharing */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1 hidden sm:inline">
                Share:
              </span>
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(messageToSend)}`}
                target="_blank"
                rel="noreferrer"
                className="p-2 bg-white hover:bg-[#25D366]/10 text-slate-700 hover:text-[#128C7E] border border-slate-200 hover:border-[#25D366]/40 rounded-xl transition-all"
                title="Share on WhatsApp"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
              <a
                href={`https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(defaultInviteMessage)}`}
                target="_blank"
                rel="noreferrer"
                className="p-2 bg-white hover:bg-[#0088cc]/10 text-slate-700 hover:text-[#0088cc] border border-slate-200 hover:border-[#0088cc]/40 rounded-xl transition-all"
                title="Share on Telegram"
              >
                <Send className="w-4 h-4" />
              </a>
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(defaultInviteMessage)}`}
                target="_blank"
                rel="noreferrer"
                className="p-2 bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200 rounded-xl transition-all"
                title="Share on X / Twitter"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <button
                type="button"
                onClick={handleNativeShare}
                className="p-2 bg-white hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 border border-slate-200 hover:border-indigo-200 rounded-xl transition-all cursor-pointer"
                title="Share via device menu"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </form>

        {/* Confirmation Banner if invite was just sent */}
        {lastSentRecipient && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center justify-between gap-3 text-xs text-emerald-900 animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Invite recorded for <strong>{lastSentRecipient}</strong>. You will automatically receive +{rewardCoins} coins when they create their account!
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                simulateReferralSignup(
                  friendNameInput || 'Invited Friend',
                  lastSentRecipient.includes('@') ? lastSentRecipient : `${lastSentRecipient.replace(/[^0-9]/g, '')}@mobile.user`
                );
                setLastSentRecipient(null);
              }}
              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded-lg shrink-0 transition-colors cursor-pointer"
              title="Test crediting coins right now"
            >
              Simulate Friend Join (+{rewardCoins})
            </button>
          </div>
        )}
      </div>

      {/* History of Sent Invites (if any exist) */}
      {userSentInvites.length > 0 && (
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
            <span>Recently Sent Invitations ({userSentInvites.length})</span>
            <span className="text-[10px] text-emerald-600 font-bold lowercase">
              +{rewardCoins} coins pending each
            </span>
          </div>

          <div className="divide-y divide-slate-100 border border-slate-200/80 rounded-2xl bg-white overflow-hidden max-h-48 overflow-y-auto">
            {userSentInvites.slice(0, 5).map((inv) => (
              <div key={inv.id} className="p-3 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
                    {inv.type === 'email' ? <Mail className="w-3.5 h-3.5" /> : <Phone className="w-3.5 h-3.5" />}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 truncate">
                      {inv.friendName ? `${inv.friendName} (${inv.recipient})` : inv.recipient}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      Sent {new Date(inv.sentAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                    <Clock className="w-3 h-3 text-amber-600" />
                    <span>Invitation Sent</span>
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      simulateReferralSignup(
                        inv.friendName || 'Invited Friend',
                        inv.type === 'email' ? inv.recipient : `${inv.recipient.replace(/[^0-9]/g, '')}@mobile.user`
                      )
                    }
                    className="px-2 py-1 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 font-bold text-[10px] rounded-md transition-colors cursor-pointer"
                    title="Simulate this friend completing signup for instant testing"
                  >
                    Test Join
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
