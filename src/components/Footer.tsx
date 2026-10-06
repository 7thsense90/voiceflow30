import React from 'react';
import { Link } from './Link';
import { NewsletterSignup } from './NewsletterSignup';
import { MessageSquare, Shield, Globe2, Sparkles, CheckCircle, ExternalLink, Zap } from 'lucide-react';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer id="main-app-footer" className="bg-slate-900 border-t border-slate-800 text-slate-400 mt-16 text-sm">
      {/* Top Section: Newsletter Signup */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-10">
        <NewsletterSignup />
      </div>

      {/* Main Multi-Column Links Section */}
      <div className="border-t border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10">
            {/* Column 1: Brand & Mission */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white font-black shadow-md shadow-purple-900/30">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <span className="font-extrabold text-white text-lg tracking-tight">Voice Flow 360</span>
                  <span className="text-[11px] text-purple-400 font-semibold tracking-wide uppercase">
                    Conversational Feedback &amp; Rewards
                  </span>
                </div>
              </div>

              <p className="text-xs leading-relaxed text-slate-400 max-w-sm">
                Empowering consumers globally with instant coin rewards for real opinions, while providing leading enterprise brands with authentic market intelligence through interactive chat surveys.
              </p>

              {/* Trust Badges */}
              <div className="pt-2 flex flex-wrap items-center gap-3 text-[11px]">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800/80 border border-slate-700/60 text-slate-300 font-medium">
                  <Shield className="w-3.5 h-3.5 text-emerald-400" />
                  <span>256-Bit Encrypted</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800/80 border border-slate-700/60 text-slate-300 font-medium">
                  <Globe2 className="w-3.5 h-3.5 text-sky-400" />
                  <span>Global Payouts</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800/80 border border-slate-700/60 text-slate-300 font-medium">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>Real-Time Cloud Sync</span>
                </span>
              </div>
            </div>

            {/* Column 2: Research Studies & Rewards */}
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3.5 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>Research &amp; Rewards</span>
              </h4>
              <ul className="space-y-2.5 text-xs">
                <li>
                  <Link
                    id="footer-nav-brand-case-studies-landing-btn"
                    to="/brand-case-studies"
                    className="hover:text-purple-300 transition-colors font-bold text-white flex items-center gap-1.5"
                  >
                    <span>Brand Case Studies</span>
                    <span className="px-1.5 py-0.5 text-[9px] font-extrabold bg-purple-500/30 text-purple-200 rounded-md">Default</span>
                  </Link>
                </li>
                <li>
                  <Link
                    id="footer-nav-start-earning-btn"
                    to="/start-earning"
                    className="hover:text-purple-300 transition-colors font-bold text-purple-400"
                  >
                    Research Studies
                  </Link>
                </li>
                <li>
                  <Link
                    id="footer-nav-how-to-earn-btn"
                    to="/how-to-earn"
                    className="hover:text-purple-300 transition-colors"
                  >
                    How Research Studies Work
                  </Link>
                </li>
                <li>
                  <Link
                    id="footer-nav-brand-directory-btn"
                    to="/brand-directory"
                    className="hover:text-purple-300 transition-colors"
                  >
                    Brand Directory
                  </Link>
                </li>
                <li>
                  <Link
                    id="footer-nav-product-reviews-btn"
                    to="/product-reviews"
                    className="hover:text-purple-300 transition-colors font-semibold text-amber-300 flex items-center gap-1.5"
                  >
                    <span>Public Product Reviews</span>
                    <span className="px-1.5 py-0.5 text-[9px] font-extrabold bg-amber-400/20 text-amber-300 rounded">100+</span>
                  </Link>
                </li>
                <li>
                  <Link
                    id="footer-nav-referrals-btn"
                    to="/referrals"
                    className="hover:text-purple-300 transition-colors font-medium text-amber-300/90"
                  >
                    Referral Program (+300 Coins)
                  </Link>
                </li>
                <li>
                  <Link
                    id="footer-nav-rewards-policy-btn"
                    to="/rewards-and-withdrawals"
                    className="hover:text-purple-300 transition-colors font-bold text-emerald-400"
                  >
                    Rewards &amp; Withdrawals
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Enterprise Brands */}
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3.5">
                For Brands
              </h4>
              <ul className="space-y-2.5 text-xs">
                <li>
                  <Link
                    id="footer-nav-brand-research-studies-btn"
                    to="/brand-research-studies"
                    className="hover:text-purple-300 transition-colors font-bold text-purple-400"
                  >
                    Brand Research Studies
                  </Link>
                </li>
                <li>
                  <Link
                    id="footer-nav-research-methodology-btn"
                    to="/research-methodology"
                    className="hover:text-purple-300 transition-colors font-semibold text-indigo-300"
                  >
                    Research Methodology
                  </Link>
                </li>
                <li>
                  <Link
                    id="footer-nav-for-brands-btn"
                    to="/for-brands"
                    className="hover:text-purple-300 transition-colors font-semibold text-slate-300"
                  >
                    For Brands (Market Research)
                  </Link>
                </li>
                <li>
                  <Link
                    id="footer-nav-brand-insights-btn"
                    to="/brand-insights"
                    className="hover:text-purple-300 transition-colors font-medium text-slate-300"
                  >
                    Brand Insights &amp; Studies
                  </Link>
                </li>
                <li>
                  <Link
                    id="footer-nav-brand-inquiry-btn"
                    to="/for-brands"
                    className="hover:text-purple-300 transition-colors"
                  >
                    Request Custom Research
                  </Link>
                </li>
                <li>
                  <Link
                    id="footer-nav-brand-case-studies-btn"
                    to="/brand-case-studies"
                    className="hover:text-purple-300 transition-colors"
                  >
                    Enterprise Case Studies
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 4: Company & Legal */}
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3.5">
                Company &amp; Legal
              </h4>
              <ul className="space-y-2.5 text-xs">
                <li>
                  <Link
                    id="footer-nav-about-btn"
                    to="/about"
                    className="hover:text-purple-300 transition-colors"
                  >
                    About Voice Flow 360
                  </Link>
                </li>
                <li>
                  <Link
                    id="footer-nav-news-btn"
                    to="/news"
                    className="hover:text-purple-300 transition-colors font-semibold text-slate-300"
                  >
                    News &amp; Updates
                  </Link>
                </li>
                <li>
                  <Link
                    id="footer-nav-faq-btn"
                    to="/faq"
                    className="hover:text-purple-300 transition-colors font-bold text-purple-400"
                  >
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link
                    id="footer-nav-contact-btn"
                    to="/contact"
                    className="hover:text-purple-300 transition-colors"
                  >
                    Contact Support
                  </Link>
                </li>
                <li>
                  <Link
                    id="footer-nav-privacy-btn"
                    to="/privacy"
                    className="hover:text-purple-300 transition-colors"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    id="footer-nav-terms-btn"
                    to="/terms"
                    className="hover:text-purple-300 transition-colors"
                  >
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link
                    id="footer-nav-earnings-disclaimer-btn"
                    to="/earnings-disclaimer"
                    className="hover:text-purple-300 transition-colors"
                  >
                    Earnings Disclaimer
                  </Link>
                </li>
                <li>
                  <Link
                    id="footer-nav-sitemap-btn"
                    to="/sitemap-directory"
                    className="hover:text-purple-300 transition-colors font-medium text-slate-400"
                  >
                    Site Directory
                  </Link>
                </li>
                <li>
                  <a
                    id="footer-nav-xml-sitemap-btn"
                    href="https://voiceflow360.com/sitemap.xml"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-purple-300 transition-colors font-semibold text-purple-400 inline-flex items-center gap-1"
                  >
                    <span>XML Sitemap</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar: Copyright & Operational Status */}
      <div className="border-t border-slate-800 bg-slate-950/80 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-center sm:text-left">
            <span>© {currentYear} Voice Flow 360 Inc. All rights reserved.</span>
            <span className="hidden md:inline">•</span>
            <span className="hidden md:inline">Fair compensation for consumer opinions.</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span className="inline-flex items-center gap-1.5 text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Survey Engine Operational</span>
            </span>
            <Link to="/privacy" className="hover:text-slate-300 transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-slate-300 transition-colors">Terms</Link>
            <Link to="/rewards-and-withdrawals" className="hover:text-slate-300 transition-colors">Rewards Policy</Link>
            <Link to="/research-methodology" className="hover:text-slate-300 transition-colors">Methodology</Link>
            <Link to="/contact" className="hover:text-slate-300 transition-colors">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
