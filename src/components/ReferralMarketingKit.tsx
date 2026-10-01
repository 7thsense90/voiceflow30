import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Download,
  Copy,
  Check,
  Share2,
  Sparkles,
  MessageCircle,
  Send,
  Twitter,
  Facebook,
  Linkedin,
  Megaphone,
  Smartphone,
  Eye,
  CheckCircle2,
  Palette,
  Layers,
  Flame,
  ArrowRight,
} from 'lucide-react';

interface ReferralMarketingKitProps {
  userCode: string;
  referralLink: string;
  isAuthenticated: boolean;
  onAuthRequired: () => void;
  showToast: (message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
}

export type BannerTheme = 'indigo-gold' | 'emerald-wealth' | 'sunset-amber' | 'cyber-dark';
export type BannerRatio = 'square' | 'landscape' | 'story';

interface AdCopyTemplate {
  id: string;
  platform: 'facebook' | 'twitter' | 'instagram' | 'whatsapp' | 'linkedin';
  platformName: string;
  badge: string;
  title: string;
  copy: string;
}

export const ReferralMarketingKit: React.FC<ReferralMarketingKitProps> = ({
  userCode,
  referralLink,
  isAuthenticated,
  onAuthRequired,
  showToast,
}) => {
  const [selectedTheme, setSelectedTheme] = useState<BannerTheme>('indigo-gold');
  const [selectedRatio, setSelectedRatio] = useState<BannerRatio>('square');
  const [copiedCopyId, setCopiedCopyId] = useState<string | null>(null);
  const [isGeneratingJpg, setIsGeneratingJpg] = useState(false);
  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const effectiveCode = userCode || 'VF-360BONUS';
  const effectiveLink = referralLink || `https://voiceflow360.com/?ref=${effectiveCode}`;

  // Pre-refined Ad Copies tailored for each major channel
  const adCopies: AdCopyTemplate[] = [
    {
      id: 'facebook',
      platform: 'facebook',
      platformName: 'Facebook & Communities',
      badge: 'High Engagement',
      title: 'Community & Group Recommendation',
      copy: `🎁 Looking for an engaging activity you can do from your phone in 5 minutes? 

I've been using Voice Flow 360 to participate in studies and earn rewards. You get an instant welcome bonus just for signing up!

👉 Sign up free with my referral link:
${effectiveLink}

Or enter my VIP referral code during registration:
🔑 Code: ${effectiveCode}

✅ Quick 3–5 min surveys & quizzes
✅ Participate in studies and earn rewards
✅ 100% free to join`,
    },
    {
      id: 'twitter',
      platform: 'twitter',
      platformName: 'X (Twitter) & Threads',
      badge: 'Viral Hook',
      title: 'Short & Punchy Feed Post',
      copy: `Stop scrolling for free. Participate in studies and earn rewards ✨

Voice Flow 360 lets you participate in brand studies and earn rewards directly from your phone. Use my referral code ${effectiveCode} to get bonus starter coins:

🔗 ${effectiveLink}

#ConsumerInsights #MarketResearch #VoiceFlow360 #EarnRewards`,
    },
    {
      id: 'whatsapp',
      platform: 'whatsapp',
      platformName: 'WhatsApp & Telegram',
      badge: 'Personal Invite',
      title: 'Direct Message to Friends & Family',
      copy: `Hey! Thought of you—I've been using Voice Flow 360 to participate in studies and earn rewards in my spare time. 

If you use my invite link, you'll get a free starter bonus credited straight to your balance:
${effectiveLink}

(If it asks for an invite code, use: *${effectiveCode}*)

It's completely free and you can participate in studies and earn rewards! Let me know if you try it 🙌`,
    },
    {
      id: 'instagram',
      platform: 'instagram',
      platformName: 'Instagram & TikTok',
      badge: 'Bio / Story Caption',
      title: 'Story & Reel Bio Caption',
      copy: `Participate in studies and earn rewards ☕✨ 

Been doing quick brand studies on Voice Flow 360 whenever I have 5 minutes of downtime. Instant reward credits and super easy.

Tap the link in my bio or use my VIP code:
🏷️ ${effectiveCode}
Link: ${effectiveLink}

Claim your free starter coins today! ✨`,
    },
    {
      id: 'linkedin',
      platform: 'linkedin',
      platformName: 'LinkedIn & Professional',
      badge: 'Professional Side Hustle',
      title: 'Professional & Market Research Tone',
      copy: `For professionals interested in contributing to enterprise market research and product development:

Voice Flow 360 connects verified consumers with leading consumer brands for confidential studies: participate in studies and earn rewards.

Feel free to join the panel using my referral invitation for introductory credits:
${effectiveLink} (Referral Code: ${effectiveCode})

#MarketResearch #ConsumerInsights #ParticipateInStudies #EarnRewards`,
    },
  ];

  // Helper to draw canvas banner
  const drawBanner = useCallback(
    (
      canvas: HTMLCanvasElement,
      theme: BannerTheme,
      ratio: BannerRatio,
      code: string
    ) => {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Define dimensions
      let width = 1080;
      let height = 1080;
      if (ratio === 'landscape') {
        width = 1200;
        height = 630;
      } else if (ratio === 'story') {
        width = 1080;
        height = 1920;
      }

      canvas.width = width;
      canvas.height = height;

      // Color Schemes based on theme
      let bgGradStart = '#1e1b4b';
      let bgGradMid = '#0f172a';
      let bgGradEnd = '#020617';
      let accentColor = '#fbbf24'; // amber
      let accentLight = '#fef3c7';
      let glowColor = 'rgba(251, 191, 36, 0.15)';
      let secondaryColor = '#818cf8'; // indigo-400
      let tagBg = 'rgba(99, 102, 241, 0.2)';
      let tagBorder = 'rgba(165, 180, 252, 0.3)';

      if (theme === 'emerald-wealth') {
        bgGradStart = '#064e3b';
        bgGradMid = '#022c22';
        bgGradEnd = '#021812';
        accentColor = '#34d399'; // emerald-400
        accentLight = '#d1fae5';
        glowColor = 'rgba(52, 211, 153, 0.2)';
        secondaryColor = '#6ee7b7';
        tagBg = 'rgba(16, 185, 129, 0.2)';
        tagBorder = 'rgba(110, 231, 183, 0.3)';
      } else if (theme === 'sunset-amber') {
        bgGradStart = '#4c1d95'; // purple-900
        bgGradMid = '#78350f'; // amber-900
        bgGradEnd = '#0f172a';
        accentColor = '#f59e0b'; // amber-500
        accentLight = '#fffbeb';
        glowColor = 'rgba(245, 158, 11, 0.25)';
        secondaryColor = '#f43f5e'; // rose-500
        tagBg = 'rgba(245, 158, 11, 0.2)';
        tagBorder = 'rgba(252, 211, 77, 0.4)';
      } else if (theme === 'cyber-dark') {
        bgGradStart = '#090d16';
        bgGradMid = '#0f172a';
        bgGradEnd = '#020617';
        accentColor = '#38bdf8'; // sky-400
        accentLight = '#e0f2fe';
        glowColor = 'rgba(56, 189, 248, 0.2)';
        secondaryColor = '#c084fc'; // purple-400
        tagBg = 'rgba(56, 189, 248, 0.15)';
        tagBorder = 'rgba(56, 189, 248, 0.35)';
      }

      // 1. Background Gradient
      const bgGrad = ctx.createLinearGradient(0, 0, width, height);
      bgGrad.addColorStop(0, bgGradStart);
      bgGrad.addColorStop(0.5, bgGradMid);
      bgGrad.addColorStop(1, bgGradEnd);
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // 2. Decorative Atmospheric Glow Orbs
      const drawGlowOrb = (x: number, y: number, r: number, color: string) => {
        const radGrad = ctx.createRadialGradient(x, y, 0, x, y, r);
        radGrad.addColorStop(0, color);
        radGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = radGrad;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      };

      drawGlowOrb(width * 0.85, height * 0.15, width * 0.45, glowColor);
      drawGlowOrb(width * 0.15, height * 0.85, width * 0.4, glowColor);

      // 3. Subtle grid lines / geometric tech texture
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.lineWidth = 1;
      const step = 60;
      for (let x = 0; x < width; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Outer safety border
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 16;
      ctx.strokeRect(8, 8, width - 16, height - 16);

      // Positioning coordinates based on ratio
      const centerX = width / 2;
      let curY = ratio === 'story' ? height * 0.18 : ratio === 'landscape' ? 80 : 120;

      // 4. Header Brand Pill
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const pillText = '✦ VOICE FLOW 360  •  VERIFIED RESEARCH PANEL ✦';
      ctx.font = 'bold 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      const pillMetrics = ctx.measureText(pillText);
      const pillWidth = pillMetrics.width + 48;
      const pillHeight = 44;

      // Draw rounded Pill background
      ctx.fillStyle = tagBg;
      ctx.strokeStyle = tagBorder;
      ctx.lineWidth = 1.5;
      const pillX = centerX - pillWidth / 2;
      const pillY = curY - pillHeight / 2;
      ctx.beginPath();
      ctx.roundRect(pillX, pillY, pillWidth, pillHeight, 22);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = secondaryColor;
      ctx.fillText(pillText, centerX, curY);

      curY += ratio === 'landscape' ? 70 : ratio === 'story' ? 140 : 100;

      // 5. Main Headline
      ctx.fillStyle = '#ffffff';
      if (ratio === 'landscape') {
        ctx.font = '900 48px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.fillText('PARTICIPATE IN STUDIES & EARN REWARDS', centerX, curY);
      } else if (ratio === 'story') {
        ctx.font = '900 64px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.fillText('PARTICIPATE IN STUDIES', centerX, curY);
        curY += 78;
        ctx.fillStyle = accentColor;
        ctx.fillText('AND EARN REWARDS.', centerX, curY);
      } else {
        // Square 1:1
        ctx.font = '900 56px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.fillText('PARTICIPATE IN STUDIES', centerX, curY);
        curY += 72;
        ctx.fillStyle = accentColor;
        ctx.fillText('AND EARN REWARDS', centerX, curY);
      }

      curY += ratio === 'landscape' ? 50 : ratio === 'story' ? 90 : 65;

      // 6. Subheadline
      ctx.fillStyle = '#cbd5e1';
      ctx.font = '500 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillText('Quick 3-Minute Brand Surveys & Interactive Studies', centerX, curY);

      curY += ratio === 'landscape' ? 65 : ratio === 'story' ? 140 : 90;

      // 7. Value Badges Row (Instant Payouts, +150 Bonus, 300 Coin Referral)
      const perks = ['⚡ Instant Coin Credit', '🎁 Free Starter Bonus', '✨ Fast Redemptions'];
      const perkWidth = ratio === 'landscape' ? 240 : 280;
      const totalPerksWidth = perks.length * perkWidth + (perks.length - 1) * 20;
      let perkStartX = centerX - totalPerksWidth / 2 + perkWidth / 2;

      ctx.font = 'bold 18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      perks.forEach((perk) => {
        const pX = perkStartX - perkWidth / 2;
        const pY = curY - 22;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.07)';
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(pX, pY, perkWidth, 44, 12);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.fillText(perk, perkStartX, curY);
        perkStartX += perkWidth + 20;
      });

      curY += ratio === 'landscape' ? 75 : ratio === 'story' ? 180 : 120;

      // 8. THE REFERRAL CODE HERO CARD
      const cardWidth = ratio === 'landscape' ? 620 : 760;
      const cardHeight = ratio === 'landscape' ? 140 : ratio === 'story' ? 220 : 180;
      const cardX = centerX - cardWidth / 2;
      const cardY = curY - cardHeight / 2;

      // Card outer glow
      ctx.shadowColor = accentColor;
      ctx.shadowBlur = 35;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;

      // Card Background
      const cardGrad = ctx.createLinearGradient(cardX, cardY, cardX + cardWidth, cardY + cardHeight);
      cardGrad.addColorStop(0, 'rgba(15, 23, 42, 0.95)');
      cardGrad.addColorStop(1, 'rgba(30, 41, 59, 0.95)');
      ctx.fillStyle = cardGrad;
      ctx.strokeStyle = accentColor;
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.roundRect(cardX, cardY, cardWidth, cardHeight, 24);
      ctx.fill();
      ctx.stroke();

      // Reset shadow
      ctx.shadowBlur = 0;

      // Card Inner Labels
      const textCenterCardY = cardY + cardHeight / 2;
      ctx.fillStyle = accentLight;
      ctx.font = 'bold 17px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillText('REGISTER WITH MY EXCLUSIVE VIP CODE TO CLAIM BONUS COINS', centerX, textCenterCardY - (cardHeight * 0.22));

      // THE CODE ITSELF
      ctx.fillStyle = accentColor;
      ctx.font = `900 ${ratio === 'landscape' ? '54px' : '62px'} "Courier New", Courier, monospace`;
      ctx.fillText(code, centerX, textCenterCardY + (cardHeight * 0.14));

      curY += ratio === 'landscape' ? 100 : ratio === 'story' ? 220 : 140;

      // 9. Call to Action / Website URL
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 26px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillText('JOIN FREE TODAY AT:', centerX, curY);

      curY += 40;
      ctx.fillStyle = accentColor;
      ctx.font = '900 32px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillText('voiceflow360.com', centerX, curY);

      // 10. Footer Disclaimer Bar
      const bottomY = height - (ratio === 'story' ? 120 : 45);
      ctx.fillStyle = '#64748b';
      ctx.font = '500 15px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillText('Free to join • Cash rewards paid directly upon survey completion • No purchase required', centerX, bottomY);
    },
    []
  );

  // Update Preview canvas whenever theme/ratio/code changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    drawBanner(canvas, selectedTheme, selectedRatio, effectiveCode);
    try {
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      setPreviewDataUrl(dataUrl);
    } catch {
      // ignore
    }
  }, [selectedTheme, selectedRatio, effectiveCode, drawBanner]);

  // Handle High-Res JPG Download
  const handleDownloadJpg = () => {
    if (!isAuthenticated) {
      onAuthRequired();
      return;
    }

    setIsGeneratingJpg(true);
    try {
      const canvas = canvasRef.current;
      if (!canvas) {
        showToast('Unable to access graphics engine.', 'error');
        setIsGeneratingJpg(false);
        return;
      }

      // Force high-quality draw
      drawBanner(canvas, selectedTheme, selectedRatio, effectiveCode);

      // Export as JPG blob
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            showToast('Failed to render JPG.', 'error');
            setIsGeneratingJpg(false);
            return;
          }

          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `VoiceFlow360-AdBanner-${effectiveCode}-${selectedRatio}.jpg`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);

          setIsGeneratingJpg(false);
          showToast(`JPG Banner downloaded (${selectedRatio})! Ready to share on social media.`, 'success');
        },
        'image/jpeg',
        0.95
      );
    } catch {
      setIsGeneratingJpg(false);
      showToast('Error generating banner file.', 'error');
    }
  };

  // Handle Copying Ad Text
  const handleCopyAdText = (copyItem: AdCopyTemplate) => {
    if (!isAuthenticated) {
      onAuthRequired();
      return;
    }

    navigator.clipboard.writeText(copyItem.copy);
    setCopiedCopyId(copyItem.id);
    showToast(`Ad caption for ${copyItem.platformName} copied to clipboard!`, 'success');
    setTimeout(() => setCopiedCopyId(null), 2500);
  };

  // Direct Social Share
  const handleDirectShare = (
    platform: 'facebook' | 'twitter' | 'whatsapp' | 'telegram' | 'linkedin' | 'instagram',
    text: string
  ) => {
    const encodedUrl = encodeURIComponent(effectiveLink);
    const encodedText = encodeURIComponent(text);

    let shareUrl = '';
    if (platform === 'facebook') {
      shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`;
    } else if (platform === 'twitter') {
      shareUrl = `https://twitter.com/intent/tweet?text=${encodedText}`;
    } else if (platform === 'whatsapp') {
      shareUrl = `https://api.whatsapp.com/send?text=${encodedText}`;
    } else if (platform === 'telegram') {
      shareUrl = `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`;
    } else if (platform === 'linkedin') {
      shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
    } else if (platform === 'instagram') {
      navigator.clipboard.writeText(text);
      showToast('Caption copied! Open Instagram to paste it into your post or story.', 'info');
      shareUrl = 'https://www.instagram.com/';
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="bg-slate-900 text-white rounded-3xl border border-purple-800/40 shadow-2xl p-6 sm:p-8 space-y-8 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Section Header */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-black uppercase tracking-wider border border-amber-300/30 mb-2">
            <Megaphone className="w-3.5 h-3.5" />
            <span>Social Marketing &amp; Viral Reach Kit</span>
          </div>
          <h2 className="text-xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
            <span>Share Ad Copy &amp; Download JPG Banners</span>
            <Sparkles className="w-5 h-5 text-amber-400" />
          </h2>
          <p className="text-sm text-slate-300 mt-1 max-w-2xl">
            Promote your personal referral link across social media. Download custom prebuilt banners with your referral code{' '}
            <strong className="text-amber-400 font-mono font-bold">{effectiveCode}</strong> permanently stamped on the graphic.
          </p>
        </div>

        {/* Action button */}
        <div className="shrink-0">
          <button
            id="download-selected-banner-top-btn"
            onClick={handleDownloadJpg}
            disabled={isGeneratingJpg}
            className="w-full sm:w-auto px-5 py-3 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{isGeneratingJpg ? 'Rendering JPG...' : 'Download JPG Banner'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left Banner Designer & Downloader / Right Ad Copy Vault */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        {/* LEFT COLUMN: Visual Banner Generator (5 cols) */}
        <div className="lg:col-span-6 xl:col-span-5 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Palette className="w-4 h-4 text-purple-400" />
              <span>Select Banner Style &amp; Format</span>
            </h3>
            <span className="text-[11px] text-amber-400 font-semibold uppercase tracking-wider">
              {selectedRatio.toUpperCase()} • JPG Format
            </span>
          </div>

          {/* Theme Selector */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-2">1. Choose Color Theme:</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSelectedTheme('indigo-gold')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  selectedTheme === 'indigo-gold'
                    ? 'bg-purple-950/80 border-amber-400 text-white shadow-md ring-2 ring-amber-400/20'
                    : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-r from-indigo-500 to-amber-400 shrink-0" />
                  <span className="text-xs font-bold">Electric Indigo &amp; Gold</span>
                </div>
                <span className="text-[10px] text-slate-400 block mt-1">Flagship Rewards Look</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedTheme('emerald-wealth')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  selectedTheme === 'emerald-wealth'
                    ? 'bg-emerald-950/80 border-emerald-400 text-white shadow-md ring-2 ring-emerald-400/20'
                    : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-300 shrink-0" />
                  <span className="text-xs font-bold">Emerald Wealth</span>
                </div>
                <span className="text-[10px] text-slate-400 block mt-1">Side Hustle Cash Theme</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedTheme('sunset-amber')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  selectedTheme === 'sunset-amber'
                    ? 'bg-amber-950/80 border-amber-400 text-white shadow-md ring-2 ring-amber-400/20'
                    : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-r from-purple-600 to-amber-500 shrink-0" />
                  <span className="text-xs font-bold">Sunset Invite</span>
                </div>
                <span className="text-[10px] text-slate-400 block mt-1">300 Coin Bonus Focus</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedTheme('cyber-dark')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  selectedTheme === 'cyber-dark'
                    ? 'bg-slate-900 border-sky-400 text-white shadow-md ring-2 ring-sky-400/20'
                    : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-r from-sky-400 to-purple-400 shrink-0" />
                  <span className="text-xs font-bold">Cyber Dark</span>
                </div>
                <span className="text-[10px] text-slate-400 block mt-1">Tech &amp; Web3 Clean</span>
              </button>
            </div>
          </div>

          {/* Aspect Ratio Selector */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-2">2. Choose Image Dimensions:</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSelectedRatio('square')}
                className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                  selectedRatio === 'square'
                    ? 'bg-white/20 border-white text-white font-bold'
                    : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-white'
                }`}
              >
                <div className="text-xs font-bold">Square (1:1)</div>
                <span className="text-[10px] text-slate-400">Instagram / FB Feed</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedRatio('landscape')}
                className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                  selectedRatio === 'landscape'
                    ? 'bg-white/20 border-white text-white font-bold'
                    : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-white'
                }`}
              >
                <div className="text-xs font-bold">Banner (16:9)</div>
                <span className="text-[10px] text-slate-400">Twitter / LinkedIn</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedRatio('story')}
                className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                  selectedRatio === 'story'
                    ? 'bg-white/20 border-white text-white font-bold'
                    : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-white'
                }`}
              >
                <div className="text-xs font-bold">Story (9:16)</div>
                <span className="text-[10px] text-slate-400">Stories / TikTok</span>
              </button>
            </div>
          </div>

          {/* Hidden Canvas used for high-res generation */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Live Preview Display */}
          <div className="bg-slate-950/80 rounded-2xl border border-slate-800 p-4 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5 font-semibold">
                <Eye className="w-3.5 h-3.5 text-purple-400" />
                Live Banner Preview
              </span>
              <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-amber-300 font-mono">
                Code: {effectiveCode}
              </span>
            </div>

            <div className="w-full flex items-center justify-center bg-slate-900 rounded-xl overflow-hidden border border-slate-800/80 p-2 min-h-[260px] max-h-[380px]">
              {previewDataUrl ? (
                <img
                  src={previewDataUrl}
                  alt={`Preview of Voice Flow 360 Referral Banner with code ${effectiveCode}`}
                  className="max-h-[360px] w-auto max-w-full object-contain rounded-lg shadow-xl"
                />
              ) : (
                <div className="text-xs text-slate-500 py-12 flex flex-col items-center gap-2">
                  <div className="w-8 h-8 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
                  <span>Rendering graphic preview...</span>
                </div>
              )}
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                id="download-jpg-banner-primary-btn"
                onClick={handleDownloadJpg}
                disabled={isGeneratingJpg}
                className="flex-1 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl transition-all shadow flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>{isGeneratingJpg ? 'Generating JPG...' : 'Download JPG Banner'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(effectiveCode);
                  showToast(`Referral code ${effectiveCode} copied!`, 'success');
                }}
                className="px-4 py-3 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl border border-white/15 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                title="Copy referral code"
              >
                <Copy className="w-3.5 h-3.5 text-amber-400" />
                <span>Copy Code</span>
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Prebuilt Ad Copy Vault with 1-Click Sharing (7 cols) */}
        <div className="lg:col-span-6 xl:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-400" />
              <span>Prebuilt Refined Ad Copy Captions</span>
            </h3>
            <span className="text-xs text-slate-400">Ready to copy &amp; paste</span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Attach your downloaded JPG banner to these tested ad captions. Each copy already includes your referral link and code:
          </p>

          <div className="space-y-3.5 max-h-[640px] overflow-y-auto pr-1">
            {adCopies.map((item) => {
              const isCopied = copiedCopyId === item.id;

              return (
                <div
                  key={item.id}
                  className="bg-slate-800/80 rounded-2xl border border-slate-700/80 p-4 space-y-3 transition-all hover:border-slate-600"
                >
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 rounded-lg bg-white/10 text-white">
                        {item.platform === 'facebook' && <Facebook className="w-3.5 h-3.5 text-blue-400" />}
                        {item.platform === 'twitter' && <Twitter className="w-3.5 h-3.5 text-sky-400" />}
                        {item.platform === 'whatsapp' && <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />}
                        {item.platform === 'instagram' && <Smartphone className="w-3.5 h-3.5 text-pink-400" />}
                        {item.platform === 'linkedin' && <Linkedin className="w-3.5 h-3.5 text-blue-500" />}
                      </span>
                      <span className="text-xs font-bold text-white">{item.platformName}</span>
                      <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-bold border border-amber-300/30">
                        {item.badge}
                      </span>
                    </div>

                    {/* Social Share & Copy Buttons */}
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        id={`copy-ad-copy-${item.id}-btn`}
                        onClick={() => handleCopyAdText(item)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm ${
                          isCopied
                            ? 'bg-emerald-500 text-white'
                            : 'bg-white/10 hover:bg-white/20 text-slate-200 border border-white/15'
                        }`}
                      >
                        {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{isCopied ? 'Copied!' : 'Copy Caption'}</span>
                      </button>

                      {/* Direct launch button if applicable */}
                      {(item.platform === 'facebook' ||
                        item.platform === 'twitter' ||
                        item.platform === 'whatsapp' ||
                        item.platform === 'linkedin') && (
                        <button
                          type="button"
                          id={`share-now-${item.id}-btn`}
                          onClick={() => handleDirectShare(item.platform, item.copy)}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 border border-purple-500/40 transition-all flex items-center gap-1 cursor-pointer"
                          title={`Share directly to ${item.platformName}`}
                        >
                          <Share2 className="w-3 h-3" />
                          <span className="hidden sm:inline">Post</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Caption Content Box */}
                  <div className="bg-slate-950/70 rounded-xl p-3 border border-slate-800 font-sans text-xs text-slate-200 whitespace-pre-line leading-relaxed selection:bg-amber-400 selection:text-slate-950">
                    {item.copy}
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                    <span className="flex items-center gap-1">
                      <Flame className="w-3 h-3 text-amber-400" />
                      Pro Tip: Post with your downloaded JPG banner for 3.4x more clicks!
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyAdText(item)}
                      className="text-amber-400 hover:text-amber-300 font-semibold cursor-pointer underline underline-offset-2"
                    >
                      Copy text
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Viral Tips card */}
          <div className="bg-gradient-to-r from-purple-950/60 to-indigo-950/60 rounded-2xl p-4 border border-purple-800/40 flex items-start gap-3">
            <div className="p-2 rounded-xl bg-amber-400/20 text-amber-300 shrink-0 mt-0.5">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="space-y-1 text-xs">
              <h4 className="font-bold text-white">How to Maximize Your Referral Reach:</h4>
              <p className="text-slate-300 leading-relaxed">
                1. <strong>Download a banner</strong> in Square or Story format.<br />
                2. <strong>Copy the caption</strong> above and paste it directly on your Facebook feed, WhatsApp status, or Instagram stories.<br />
                3. You automatically earn <strong className="text-amber-300">300 Coins</strong> every time a new member registers using your code! Participate in studies and earn rewards.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
