import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { Toast } from './components/Toast';
import { AuthModal } from './components/AuthModal';
import { LandingPage } from './components/LandingPage';
import { CustomerDashboard } from './components/CustomerDashboard';
import { SurveysView } from './components/SurveysView';
import { ChatView } from './components/ChatView';
import { RewardsView } from './components/RewardsView';
import { CustomerEarningsView } from './components/CustomerEarningsView';
import { ProfileView } from './components/ProfileView';
import { AdminDashboard } from './components/AdminDashboard';
import { BrandDirectory } from './components/BrandDirectory';
import { BrandDetail } from './components/BrandDetail';
import { NewsUpdates } from './components/NewsUpdates';
import { BrandInsights } from './components/BrandInsights';
import { BrandSEOArticleView } from './components/BrandSEOArticleView';
import { getBrandArticle, findBrandArticleBySlugOrPath, findBrandBySlugOrId } from './data/brandArticles';
import { BrandResearchStudiesIndex } from './components/BrandResearchStudiesIndex';
import { BrandResearchStudyDetail } from './components/BrandResearchStudyDetail';
import { AboutVoiceFlow360 } from './components/AboutVoiceFlow360';
import { HowToEarn } from './components/HowToEarn';
import { ForBrandsView } from './components/ForBrandsView';
import { PrivacyPolicy, TermsOfService, ContactUs } from './components/LegalPages';
import { EarningsDisclaimer } from './components/EarningsDisclaimer';
import { ReferralProgram } from './components/ReferralProgram';
import { FAQ } from './components/FAQ';
import { SitemapDirectory } from './components/SitemapDirectory';
import { PublicProductReviews } from './components/PublicProductReviews';
import { RewardsAndWithdrawals } from './components/RewardsAndWithdrawals';
import { ResearchMethodologyView } from './components/ResearchMethodologyView';
import { SurveyCooldownModal } from './components/SurveyCooldownModal';
import { CookieConsentBanner } from './components/CookieConsentBanner';
import { BrandCaseStudiesView } from './components/BrandCaseStudiesView';
import { NotFoundView } from './components/NotFoundView';
import { Footer } from './components/Footer';
import { Link } from './components/Link';
import { checkAdPlacementAllowed, cleanupAdArtifacts } from './utils/adPolicy';

const MainAppContent: React.FC = () => {
  const { currentUser, currentView, activeChatCampaign, setCurrentView, selectedBrandId, selectedArticleSlug } = useApp();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Strict Policy Enforcement: Purge ad scripts, iframes, and auto-ads on excluded/unallowed client-side routes
  useEffect(() => {
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
    const allowCheck = checkAdPlacementAllowed(currentPath, currentView);
    if (!allowCheck.isAllowed) {
      cleanupAdArtifacts();
    }
  }, [currentView]);

  const isChat = currentView === 'chat' && activeChatCampaign;
  const isAuthView = currentView === 'login' || currentView === 'register';
  const isLanding = !currentUser && currentView === 'landing';

  // The member/earning views that strictly require an authenticated customer
  const earningViews = [
    'dashboard',
    'start-earning',
    'earnings',
    'my-earnings',
    'surveys',
    'quizzes',
    'activities',
    'referrals',
    'referral-program',
    'invite',
    'rewards',
    'profile',
  ];
  const isEarningSection = earningViews.includes(currentView);

  // The sidebar layout and customer workspace are strictly restricted to authenticated customers
  const showSidebar =
    Boolean(currentUser) &&
    currentUser?.role !== 'admin' &&
    !isChat &&
    !isAuthView &&
    !isLanding &&
    currentView !== 'admin' &&
    isEarningSection;

  const renderViewContent = () => {
    // Public & Auth views
    if (isAuthView) {
      return (
        <div className="flex-1 flex flex-col justify-center items-center p-4 min-h-[calc(100vh-4rem)] bg-[#f4f5fa]">
          <div className="w-full max-w-md">
            <AuthModal initialMode={currentView as 'login' | 'register'} />
          </div>
        </div>
      );
    }

    // Require authentication for customer workspace views - nothing should be visible to unauthenticated customers
    if (!currentUser && isEarningSection) {
      return (
        <div className="flex-1 flex flex-col justify-center items-center p-4 sm:p-6 min-h-[calc(100vh-10rem)] bg-[#f4f5fa]">
          <div className="w-full max-w-md">
            <AuthModal initialMode="login" />
          </div>
        </div>
      );
    }

    // Chat Conversation Mode
    if (isChat && activeChatCampaign) {
      return <ChatView campaign={activeChatCampaign} />;
    }

    // Core Portal Pages
    // 1. About Voice Flow 360
    if (currentView === 'about' || currentView === 'about-voiceflow') return <AboutVoiceFlow360 />;
    // 2. How to Earn?
    if (currentView === 'how-to-earn') return <HowToEarn />;
    // 3. Brand Case Studies & Dedicated SEO Brand Research Studies
    if (
      currentView === 'brand-case-studies' ||
      currentView === 'case-studies' ||
      currentView === 'landing'
    ) {
      return <BrandCaseStudiesView />;
    }

    if (currentView === 'brand-study') {
      let article = selectedBrandId ? getBrandArticle(selectedBrandId) : null;
      if (!article && selectedArticleSlug) {
        article = findBrandArticleBySlugOrPath(selectedArticleSlug) || null;
      }
      if (!article && typeof window !== 'undefined') {
        const slugFromUrl = window.location.pathname.split('/').pop() || '';
        if (slugFromUrl) {
          article = findBrandArticleBySlugOrPath(slugFromUrl) || null;
        }
      }
      if (article) {
        return (
          <BrandSEOArticleView
            article={article}
            onBack={() => setCurrentView('brand-case-studies')}
          />
        );
      }
      const knownBrand = selectedBrandId
        ? findBrandBySlugOrId(selectedBrandId)
        : (selectedArticleSlug ? findBrandBySlugOrId(selectedArticleSlug) : null);
      if (knownBrand) {
        return <BrandDetail />;
      }
      if (typeof window !== 'undefined') {
        const fromPath = findBrandBySlugOrId(window.location.pathname);
        if (fromPath) {
          return <BrandDetail />;
        }
      }
      return <BrandCaseStudiesView />;
    }
    if (currentView === 'brand-insights') return <BrandCaseStudiesView />;

    // Brand Research Studies Editorial CMS Section
    if (currentView === 'brand-research-studies') {
      return <BrandResearchStudiesIndex />;
    }
    if (currentView === 'brand-research-study-detail') {
      if (typeof window !== 'undefined') {
        const known = findBrandBySlugOrId(selectedArticleSlug || window.location.pathname);
        if (known) {
          return <BrandDetail />;
        }
      }
      return <BrandResearchStudyDetail />;
    }

    // 4. News and Updates
    if (currentView === 'news' || currentView === 'news-updates') return <NewsUpdates />;

    // 4b. Public Product Reviews (100+ Newly Launched Products)
    if (
      currentView === 'product-reviews' ||
      currentView === 'public-product-reviews' ||
      currentView === 'products'
    ) {
      return <PublicProductReviews />;
    }
    // 5. Start Earning / Dashboard:
    // If the authenticated user is an administrator, ALWAYS display the Admin Dashboard!
    if (currentView === 'dashboard' || currentView === 'start-earning') {
      if (currentUser?.role === 'admin') {
        return <AdminDashboard />;
      }
      return <CustomerDashboard />;
    }

    // Referral Program / Referrel eraning
    if (
      currentView === 'referrals' ||
      currentView === 'referral-earning' ||
      currentView === 'referrel-eraning' ||
      currentView === 'referral-program' ||
      currentView === 'invite'
    ) {
      return <ReferralProgram />;
    }

    // Legal / Informational
    if (currentView === 'faq') return <FAQ />;
    if (currentView === 'privacy') return <PrivacyPolicy />;
    if (currentView === 'terms') return <TermsOfService />;
    if (currentView === 'earnings-disclaimer' || currentView === 'disclaimer') return <EarningsDisclaimer />;
    if (currentView === 'contact') return <ContactUs />;
    if (
      currentView === 'rewards-and-withdrawals' ||
      currentView === 'rewards-withdrawals' ||
      currentView === 'payout-policy' ||
      currentView === 'rewards-policy' ||
      currentView === 'rewards'
    ) {
      return <RewardsAndWithdrawals />;
    }
    if (currentView === 'research-methodology' || currentView === 'methodology') {
      return <ResearchMethodologyView />;
    }
    if (currentView === 'sitemap-directory') return <SitemapDirectory />;

    // Brand directory & details
    if (currentView === 'brand-directory') return <BrandDirectory />;
    if (currentView === 'brand-detail') return <BrandDetail />;

    // For Brands & Enterprise Market Research Portal
    if (
      currentView === 'for-brands' ||
      currentView === 'brand-research' ||
      currentView === 'market-research' ||
      currentView === 'brand-inquiry'
    ) {
      return <ForBrandsView />;
    }

    // Protected or Guest customer app views
    if (currentView === 'surveys' || currentView === 'quizzes' || currentView === 'activities') {
      return <SurveysView />;
    }

    if (currentView === 'earnings' || currentView === 'my-earnings' || currentView === 'wallet') {
      return <CustomerEarningsView />;
    }
    if (currentView === 'profile') return <ProfileView />;

    // Admin view with strict role check and validation
    if (currentView === 'admin') {
      if (currentUser?.role === 'admin') {
        return <AdminDashboard />;
      }
      // If unauthorized non-admin attempts to view admin console, show CustomerDashboard
      return <CustomerDashboard />;
    }

    if (currentView === 'not-found') {
      return <NotFoundView />;
    }

    // Default view: if signed in with an admin user, display the Admin Dashboard!
    if (currentUser) {
      if (currentUser.role === 'admin') {
        return <AdminDashboard />;
      }
      return <CustomerDashboard />;
    }

    return <BrandCaseStudiesView />;
  };

  return (
    <div className={`bg-[#f4f5fa] text-slate-900 flex flex-col font-sans selection:bg-purple-200 selection:text-purple-950 overflow-x-hidden ${isChat ? 'h-[100dvh] overflow-hidden' : 'min-h-[100dvh]'}`}>
      <Navbar onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      <Toast />
      <SurveyCooldownModal />
      <CookieConsentBanner />

      {/* Main Container Layout - strictly restricted to authenticated customers */}
      {showSidebar && currentUser ? (
        <div
          id="authenticated-customer-layout"
          className="flex-1 flex w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8"
        >
          {/* Side Menu */}
          <Sidebar
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
          />

          {/* Main Content Area */}
          <main className="flex-1 min-w-0 py-4 sm:py-6">
            {renderViewContent()}
          </main>
        </div>
      ) : (
        <main className={`flex-1 ${isChat ? 'flex flex-col overflow-hidden' : ''}`}>
          {renderViewContent()}
        </main>
      )}

      {/* Footer */}
      {!isChat && <Footer />}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
