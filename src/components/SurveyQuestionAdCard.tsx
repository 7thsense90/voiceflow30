import React, { useEffect, useState } from 'react';
import { ExternalLink, Sparkles, ShieldCheck, Gift, ArrowUpRight, Flame, CheckCircle2, Clock, Check } from 'lucide-react';
import { triggerSurveyQuestionAd } from '../utils/vignetteAd';

interface SurveyQuestionAdCardProps {
  questionNumber: number;
  totalQuestions: number;
  adIndex?: number;
}

// Curated market research sponsor promotions displayed with policy-compliant labeling
const ROTATING_SPONSORS = [
  {
    title: 'Voice Your Opinion with Verified Brand Studies',
    desc: 'Participate in verified consumer insight studies, evaluate new product prototypes, and receive gift voucher incentives.',
    cta: 'Explore Research Panel',
    badge: 'Research Partner',
    tag: 'Consumer Insights',
    rating: '4.9 ★',
    payout: 'Honorarium Rewards',
    url: 'https://voiceflow360.com/for-brands',
  },
  {
    title: 'Enterprise Product Feedback & Brand Advisory',
    desc: 'Help leading automotive, tech, and retail brands refine digital consumer experiences through conversational interviews.',
    cta: 'View Case Studies',
    badge: 'Enterprise Insights',
    tag: 'Market Research',
    rating: '4.8 ★',
    payout: 'Verified Studies',
    url: 'https://voiceflow360.com/brand-insights',
  },
  {
    title: 'Consumer Technology & Media Preference Panel',
    desc: 'Share thoughts on streaming audio, smart home devices, and mobile apps to guide product development roadmaps.',
    cta: 'Learn More',
    badge: 'Tech Insights',
    tag: 'Product Discovery',
    rating: '4.9 ★',
    payout: 'Gift Cards & Vouchers',
    url: 'https://voiceflow360.com/brands',
  },
];

export const SurveyQuestionAdCard: React.FC<SurveyQuestionAdCardProps> = ({
  questionNumber,
  totalQuestions,
  adIndex = 0,
}) => {
  const [adLoaded, setAdLoaded] = useState(false);
  const sponsor = ROTATING_SPONSORS[adIndex % ROTATING_SPONSORS.length];

  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && (window as unknown as { adsbygoogle?: unknown[] }).adsbygoogle) {
        ((window as unknown as { adsbygoogle: unknown[] }).adsbygoogle).push({});
        setAdLoaded(true);
      }
    } catch (err) {
      console.debug('In-survey AdSense note:', err);
    }
  }, [questionNumber]);

  return (
    <div
      id={`survey-ad-break-q${questionNumber}`}
      className="my-3 w-full bg-gradient-to-br from-purple-50/70 via-slate-50 to-slate-100/70 rounded-2xl border border-slate-200 p-3.5 sm:p-4 shadow-2xs animate-in fade-in duration-200 overflow-hidden"
    >
      {/* Policy Compliant Header: Strictly labeled as Advertisement */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 mb-2 border-b border-slate-200/80 text-[10px] uppercase font-bold tracking-wider text-slate-500">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span>Advertisement • Q{questionNumber} Research Checkpoint</span>
        </div>

        <div className="flex items-center gap-1 text-[9px] text-slate-400 font-semibold lowercase">
          <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />
          <span>Sponsored Links</span>
        </div>
      </div>

      {/* Main Sponsored Display Creative */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-3 sm:p-3.5 shadow-2xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="space-y-1 max-w-lg min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-purple-100 text-purple-900 shrink-0">
                {sponsor.badge}
              </span>
              <span className="text-[10px] font-bold text-slate-500 truncate">
                {sponsor.tag} • {sponsor.rating}
              </span>
            </div>
            <h4 className="text-xs sm:text-sm font-black text-slate-900 leading-snug break-words">
              {sponsor.title}
            </h4>
            <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed break-words">
              {sponsor.desc}
            </p>
          </div>

          <div className="flex flex-col sm:items-end gap-1 shrink-0 w-full sm:w-auto">
            <a
              href={sponsor.url}
              className="w-full sm:w-auto px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
            >
              <span>{sponsor.cta}</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
            <span className="text-[10px] text-slate-400 font-medium text-center sm:text-right">
              {sponsor.payout}
            </span>
          </div>
        </div>

        {/* Google AdSense live responsive unit */}
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-center overflow-hidden min-h-[50px]">
          <ins
            className="adsbygoogle block w-full text-center"
            style={{ display: 'block' }}
            data-ad-client="ca-pub-2513423020167554"
            data-ad-slot="1234567890"
            data-ad-format="horizontal"
            data-full-width-responsive="true"
          />
        </div>
      </div>

      {/* Progress Footer note without forced countdowns */}
      <div className="mt-2.5 flex flex-wrap items-center justify-between gap-1 text-[10px] sm:text-[11px] px-0.5 text-slate-500">
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>Question {questionNumber} of {totalQuestions} recorded</span>
        </div>
        <span className="text-[10px] text-purple-700 font-bold">
          {questionNumber < totalQuestions ? `Next: Question ${questionNumber + 1}` : 'Final Submission'}
        </span>
      </div>
    </div>
  );
};

export default SurveyQuestionAdCard;
