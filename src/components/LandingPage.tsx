import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { SEOHead } from './SEOHead';
import { NewsletterSignup } from './NewsletterSignup';
import {
  MessageSquare,
  Coins,
  ShieldCheck,
  Zap,
  ArrowRight,
  CheckCircle2,
  Gift,
  Award,
  Sparkles,
  TrendingUp,
  Globe2,
  Users,
  ChevronRight,
  Smile,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { setCurrentView, startGuestSession, campaigns } = useApp();

  // Mini-chat interactive preview demo
  const [miniStep, setMiniStep] = useState(0);
  const [miniAnswer, setMiniAnswer] = useState<string | null>(null);
  const [miniCoins, setMiniCoins] = useState(0);

  const miniQuestions = [
    {
      q: 'Hey there! How often do you listen to music or podcasts while commuting or working?',
      options: ['Every single day', '2-3 times a week', 'Rarely / Never'],
    },
    {
      q: 'Which feature matters most in your favorite audio streaming app?',
      options: ['Smart AI Playlists', 'Lossless Audio Quality', 'Offline Downloads', 'Social Lyrics Sharing'],
    },
  ];

  const handleMiniChoice = (option: string) => {
    setMiniAnswer(option);
    setTimeout(() => {
      if (miniStep === 0) {
        setMiniStep(1);
        setMiniAnswer(null);
        setMiniCoins((prev) => prev + 25);
      } else {
        setMiniStep(2);
        setMiniCoins((prev) => prev + 25);
      }
    }, 600);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-amber-200">
      <SEOHead
        title="Voice Flow 360 - Consumer Market Research Panel"
        description="Join Voice Flow 360 to participate in conversational market research surveys, share brand insights, and receive verified rewards and gift cards."
        keywords={[
          'voice flow 360',
          'consumer market research panel',
          'brand feedback studies',
          'conversational survey rewards',
          'opinion research panel',
          'verified consumer incentives',
        ]}
        canonicalPath="/"
      />
      {/* Hero Section */}
      <section className="relative pt-12 pb-20 sm:pt-16 sm:pb-28 overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-amber-200/40 via-yellow-100/30 to-emerald-100/30 rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 text-center lg:text-left space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100/80 border border-amber-300/60 text-amber-900 text-xs font-bold tracking-wide">
                <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                <span>The Modern Conversational Market Research Panel</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
                Share Your Voice.{' '}
                <span className="bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-700 bg-clip-text text-transparent">
                  Influence Brands.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Experience next-generation consumer intelligence. Participate in natural, engaging chat conversations with brands, evaluate products you love, and receive verified research honorariums and redeemable rewards.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
                <button
                  id="hero-start-earning-btn"
                  onClick={() => setCurrentView('surveys')}
                  className="w-full sm:w-auto px-7 py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-sm shadow-lg shadow-slate-900/15 hover:shadow-xl transition-all flex items-center justify-center gap-2 group cursor-pointer"
                >
                  <span>Explore Research Studies (+50 Bonus)</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>

                <button
                  id="hero-login-btn"
                  onClick={() => setCurrentView('login')}
                  className="w-full sm:w-auto px-6 py-3.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 rounded-xl font-semibold text-sm transition-all shadow-xs cursor-pointer"
                >
                  Sign In to Account
                </button>
              </div>

              {/* Key Trust Highlights */}
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-500 font-medium">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Instant Honorarium Credits</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>PayPal &amp; Bank Redemptions</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>100% Free &amp; Secure</span>
                </div>
              </div>
            </div>

            {/* Right Live Mini-Chat Simulator */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xl overflow-hidden max-w-md mx-auto">
                {/* Chat Header */}
                <div className="bg-slate-900 text-white px-4 py-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="relative">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-200 text-slate-900 font-bold flex items-center justify-center text-xs">
                        Aria
                      </div>
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-slate-900" />
                    </div>
                    <div>
                      <div className="font-bold text-xs">Aria • Chat &amp; Earn AI</div>
                      <div className="text-[10px] text-slate-300">Live Interactive Teaser</div>
                    </div>
                  </div>

                  <div className="bg-amber-400/20 border border-amber-400/40 text-amber-300 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                    <Coins className="w-3.5 h-3.5" />
                    <span>+{miniCoins} Coins</span>
                  </div>
                </div>

                {/* Chat Feed */}
                <div className="p-4 space-y-3.5 bg-slate-50/50 min-h-[290px] flex flex-col justify-end">
                  {miniStep < 2 ? (
                    <>
                      {/* Bot bubble */}
                      <div className="flex items-start gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-900 font-bold flex items-center justify-center text-[10px] shrink-0">
                          AI
                        </div>
                        <div className="bg-white border border-slate-200 text-slate-800 rounded-2xl rounded-tl-xs p-3 text-xs leading-relaxed shadow-xs max-w-[85%]">
                          {miniQuestions[miniStep].q}
                        </div>
                      </div>

                      {/* Interactive Options */}
                      <div className="pl-9 space-y-2 pt-1">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Tap your answer to earn coins:
                        </div>
                        <div className="grid grid-cols-1 gap-1.5">
                          {miniQuestions[miniStep].options.map((opt) => (
                            <button
                              key={opt}
                              onClick={() => handleMiniChoice(opt)}
                              disabled={miniAnswer !== null}
                              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                                miniAnswer === opt
                                  ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                                  : 'bg-white hover:bg-amber-50 border-slate-200 text-slate-700 hover:border-amber-300'
                              }`}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-6 space-y-3 animate-in fade-in">
                      <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-800 mx-auto flex items-center justify-center">
                        <Award className="w-6 h-6 text-amber-600" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">You received +50 Panel Coins!</h4>
                        <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                          Thank you for providing quick feedback. Ready to participate in verified brand research studies?
                        </p>
                      </div>
                      <button
                        onClick={() => setCurrentView('register')}
                        className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-colors"
                      >
                        Create Account &amp; Claim All Coins
                      </button>
                    </div>
                  )}
                </div>

                <div className="bg-slate-100/70 border-t border-slate-200 px-4 py-2 text-center text-[11px] text-slate-500">
                  ⚡ 50+ real feedback activities available right now
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works 3-step section */}
      <section className="py-16 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wider bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
              Three Simple Steps
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-3 tracking-tight">
              How Chat &amp; Earn Works
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Transforming traditional market research into rewarding 2-minute messaging chats.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="relative p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-black text-lg mb-4">
                01
              </div>
              <h3 className="text-base font-bold text-slate-900">Choose a Topic</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Browse our marketplace of brand feedback, smartphone reviews, food delivery ratings, social media habits, and trivia quizzes.
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-black text-lg mb-4">
                02
              </div>
              <h3 className="text-base font-bold text-slate-900">Chat Naturally</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Engage in a friendly messenger chat with dynamic questions. Share your authentic voice via multiple choice, star ratings, or short text.
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-black text-lg mb-4">
                03
              </div>
              <h3 className="text-base font-bold text-slate-900">Receive Research Honorariums</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Points accumulate in your verified account as you complete studies. Redeem for PayPal transfers, direct bank deposits, or major retail gift cards.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Campaigns Preview */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                Active Campaigns
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-3 tracking-tight">
                Featured Feedback Opportunities
              </h2>
            </div>
            <button
              onClick={() => setCurrentView('register')}
              className="text-xs font-bold text-indigo-700 hover:text-indigo-900 flex items-center gap-1 group cursor-pointer"
            >
              <span>Explore All {campaigns.length} Opportunities</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.slice(0, 3).map((camp) => (
              <div
                key={camp.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between hover:shadow-lg hover:border-slate-300 transition-all group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {camp.category.replace('_', ' ')}
                    </span>
                    <div className="flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                      <Coins className="w-3.5 h-3.5" />
                      <span>+{camp.rewardCoins} Coins</span>
                    </div>
                  </div>

                  <h3 className="font-bold text-slate-900 text-base group-hover:text-amber-800 transition-colors">
                    {camp.title}
                  </h3>
                  <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                    {camp.description}
                  </p>
                </div>

                <div className="pt-6 border-t border-slate-100 mt-6 flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-medium">
                    ⏱ ~{camp.estimatedMinutes} mins • {camp.questions.length} questions
                  </span>
                  <button
                    onClick={() => setCurrentView('register')}
                    className="px-3.5 py-1.5 bg-slate-900 group-hover:bg-amber-600 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
                  >
                    <span>Join Study</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Stats Counter */}
      <section className="py-14 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl sm:text-4xl font-extrabold text-amber-400">1.2M+</div>
              <div className="text-xs text-slate-400 mt-1 font-medium">Research Honorariums Awarded</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-extrabold text-white">15,400+</div>
              <div className="text-xs text-slate-400 mt-1 font-medium">Chats Completed</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-extrabold text-amber-400">99.8%</div>
              <div className="text-xs text-slate-400 mt-1 font-medium">Payout Approval Rate</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-extrabold text-white">&lt; 24h</div>
              <div className="text-xs text-slate-400 mt-1 font-medium">Avg. Redemption Time</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-16 bg-gradient-to-b from-slate-900 to-slate-950 text-white text-center">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl font-extrabold tracking-tight">
            Be a Part of Brand Research Studies &amp; Earn Rewards
          </h2>
          <p className="text-slate-400 text-sm mt-3 leading-relaxed">
            Share your honest feedback in consumer research studies and receive honorarium rewards. Create your panelist account in under 30 seconds with a 50 coin welcome credit.
          </p>
          <button
            onClick={() => setCurrentView('register')}
            className="mt-8 px-8 py-3.5 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-500 hover:to-yellow-500 text-slate-950 font-bold text-sm rounded-xl shadow-lg transition-all transform hover:scale-105 cursor-pointer"
          >
            Join Panel &amp; Share Feedback
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-slate-950 border-t border-slate-800 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 mb-10 text-left">
          <NewsletterSignup />
        </div>
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-900">
          <p>© 2026 Voice Flow 360 Inc. Market Research &amp; Consumer Insights Platform. All rights reserved.</p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-slate-400">
            <button
              id="landing-footer-faq-btn"
              onClick={() => setCurrentView('faq')}
              className="hover:text-amber-400 font-semibold transition-colors cursor-pointer text-amber-300"
            >
              FAQ
            </button>
            <button
              id="landing-footer-how-to-earn-btn"
              onClick={() => setCurrentView('how-to-earn')}
              className="hover:text-amber-400 transition-colors cursor-pointer"
            >
              How it Works
            </button>
            <button
              id="landing-footer-privacy-btn"
              onClick={() => setCurrentView('privacy')}
              className="hover:text-amber-400 transition-colors cursor-pointer"
            >
              Privacy Policy
            </button>
            <button
              id="landing-footer-terms-btn"
              onClick={() => setCurrentView('terms')}
              className="hover:text-amber-400 transition-colors cursor-pointer"
            >
              Terms of Service
            </button>
            <button
              id="landing-footer-disclaimer-btn"
              onClick={() => setCurrentView('earnings-disclaimer')}
              className="hover:text-amber-400 transition-colors cursor-pointer text-amber-400/90"
            >
              Earnings Disclaimer
            </button>
            <button
              id="landing-footer-support-btn"
              onClick={() => setCurrentView('contact')}
              className="hover:text-amber-400 transition-colors cursor-pointer"
            >
              Support
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
