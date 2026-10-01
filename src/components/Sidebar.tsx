import React from 'react';
import { useApp } from '../context/AppContext';
import { getPathForView } from '../utils/routes';
import {
  LayoutDashboard,
  FileQuestion,
  HelpCircle,
  Zap,
  Gift,
  Building2,
  BarChart3,
  User as UserIcon,
  Shield,
  Sparkles,
  Coins,
  Wallet,
  ChevronRight,
  LogOut,
  X,
  Compass,
  Info,
  BookOpen,
  Megaphone,
} from 'lucide-react';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen = false, onClose }) => {
  const {
    currentUser,
    currentView,
    setCurrentView,
    campaigns,
    responses,
    settings,
    logout,
  } = useApp();

  // Strictly enforce that unauthenticated customers never see the member sidebar
  if (!currentUser) {
    return null;
  }

  const userResponses = currentUser
    ? responses.filter((r) => r.userId === currentUser.id)
    : [];

  const availableCampaignsCount = campaigns.filter(
    (c) => c.status === 'active' && !userResponses.some((r) => r.campaignId === c.id)
  ).length;

  const quizzesCount = campaigns.filter(
    (c) => c.status === 'active' && c.category === 'quizzes' && !userResponses.some((r) => r.campaignId === c.id)
  ).length;

  // Main Portal Pages
  const portalPages = [
    {
      id: 'brand-case-studies',
      label: 'Brand Case Studies',
      icon: BookOpen,
      badge: 'Case Studies',
      highlight: false,
    },
    {
      id: 'dashboard',
      label: 'Research Studies',
      icon: LayoutDashboard,
      badge: 'Studies',
      highlight: true,
    },
    {
      id: 'for-brands',
      label: 'For Brands',
      icon: Building2,
      badge: null,
      highlight: false,
    },
    {
      id: 'earnings',
      label: 'Participation and Rewards',
      icon: Wallet,
      badge: currentUser ? `${currentUser.coinBalance.toLocaleString()} pts` : 'New',
      highlight: false,
    },
    {
      id: 'referrals',
      label: 'Referral Program',
      icon: Gift,
      badge: '+300',
      highlight: false,
    },
    {
      id: 'how-to-earn',
      label: 'How Studies Work',
      icon: BookOpen,
      badge: 'Guide',
      highlight: false,
    },
    {
      id: 'brand-insights',
      label: 'Brand Insights',
      icon: BarChart3,
      badge: null,
      highlight: false,
    },
    {
      id: 'news-updates',
      label: 'News & Updates',
      icon: Megaphone,
      badge: 'New',
      highlight: false,
    },
    {
      id: 'about-voiceflow',
      label: 'About Voice Flow 360',
      icon: Info,
      badge: null,
      highlight: false,
    },
    {
      id: 'faq',
      label: 'Help & FAQ',
      icon: HelpCircle,
      badge: null,
      highlight: false,
    },
  ];

  const earnActivities = [
    {
      id: 'surveys',
      label: 'Research Studies',
      icon: FileQuestion,
      badge: availableCampaignsCount > 0 ? `${availableCampaignsCount}` : null,
    },
    {
      id: 'quizzes',
      label: 'Trivia Quizzes',
      icon: HelpCircle,
      badge: quizzesCount > 0 ? `${quizzesCount}` : null,
    },
    {
      id: 'activities',
      label: 'Daily Drops',
      icon: Zap,
      badge: 'Daily',
    },
    {
      id: 'brand-directory',
      label: 'Brand Directory',
      icon: Building2,
      badge: null,
    },
    {
      id: 'rewards',
      label: 'Rewards & Redemption',
      icon: Coins,
      badge: null,
    },
  ];

  const handleNavClick = (viewId: string) => {
    setCurrentView(viewId);
    if (onClose) onClose();
  };

  const isCurrentActive = (id: string) => {
    if (id === 'brand-case-studies' && (currentView === 'brand-case-studies' || currentView === 'landing' || currentView === 'case-studies')) return true;
    if (id === 'for-brands' && currentView === 'for-brands') return true;
    if (id === 'dashboard' && (currentView === 'dashboard' || currentView === 'start-earning')) return true;
    if (id === 'how-to-earn' && currentView === 'how-to-earn') return true;
    if (id === 'brand-insights' && currentView === 'brand-insights') return true;
    if (id === 'news-updates' && (currentView === 'news-updates' || currentView === 'news')) return true;
    if (id === 'about-voiceflow' && (currentView === 'about-voiceflow' || currentView === 'about')) return true;
    if (id === 'surveys' && (currentView === 'surveys' || currentView === 'chat')) return true;
    if (id === 'quizzes' && currentView === 'quizzes') return true;
    if (id === 'activities' && currentView === 'activities') return true;
    if (
      (id === 'referrals' || id === 'referral-earning' || id === 'referrel-eraning') &&
      (currentView === 'referrals' || currentView === 'referral-program' || currentView === 'referral-earning' || currentView === 'referrel-eraning' || currentView === 'invite')
    )
      return true;
    if (id === 'brand-directory' && (currentView === 'brand-directory' || currentView === 'brand-detail')) return true;
    if ((id === 'earnings' || id === 'rewards') && (currentView === 'earnings' || currentView === 'my-earnings' || currentView === 'rewards')) return true;
    if (id === 'profile' && currentView === 'profile') return true;
    return false;
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-72 max-w-[85vw] bg-[#f4f5fa] border-r border-slate-200/80 flex flex-col justify-between p-4 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        } lg:static lg:z-auto lg:h-[calc(100vh-4rem)] lg:sticky lg:top-16`}
      >
        <div className="flex flex-col flex-1 overflow-y-auto pr-1">
          {/* Brand Header */}
          <div className="flex items-center justify-between px-2 pt-2 pb-4 border-b border-slate-200/70">
            <a
              href="/start-earning"
              onClick={(e) => {
                e.preventDefault();
                handleNavClick('dashboard');
              }}
              className="flex items-center gap-3 text-left group cursor-pointer"
            >
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-purple-400 flex items-center justify-center text-white shadow-md shadow-purple-500/20 group-hover:scale-105 transition-transform">
                <Sparkles className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-1.5">
                  <span>Voice Flow 360</span>
                </h2>
                <p className="text-[11px] font-medium text-purple-700">
                  Brand Case Studies
                </p>
              </div>
            </a>

            {/* Mobile close button */}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl lg:hidden cursor-pointer"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Section: 5 Core Portal Pages */}
          <div className="mt-4 space-y-1">
            <div className="px-3 py-1 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
              Portal Pages
            </div>

            {portalPages.map((item) => {
              const active = isCurrentActive(item.id);
              const Icon = item.icon;
              const href = getPathForView(item.id);

              return (
                <a
                  key={item.id}
                  id={item.id === 'referrals' ? 'side-nav-referrel-eraning' : `side-nav-${item.id}`}
                  data-testid={item.id === 'referrals' ? 'tab-referrel-eraning' : undefined}
                  href={href}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick(item.id);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-2xl text-xs font-bold transition-all duration-150 text-left group cursor-pointer ${
                    active
                      ? 'bg-purple-600 text-white shadow-sm shadow-purple-500/30'
                      : item.highlight
                      ? 'bg-purple-50 text-purple-900 hover:bg-purple-100 border border-purple-200/60'
                      : 'text-slate-700 hover:bg-white/80 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center transition-colors ${
                        active
                          ? 'bg-white/20 text-white'
                          : item.highlight
                          ? 'bg-purple-200 text-purple-800'
                          : 'text-slate-500 group-hover:text-purple-600 group-hover:bg-purple-50'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 stroke-[2.2]" />
                    </div>
                    <span className="tracking-tight">{item.label}</span>
                    {item.id === 'referrals' && <span className="sr-only">Referral Earning</span>}
                  </div>

                  {item.badge && (
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                        active
                          ? 'bg-white/20 text-white'
                          : item.highlight
                          ? 'bg-purple-600 text-white'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </a>
              );
            })}
          </div>

          {/* Section: Earning Activities & Directory */}
          <div className="mt-4 space-y-1 pt-3 border-t border-slate-200/60">
            <div className="px-3 py-1 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
              Earn &amp; Rewards
            </div>

            {earnActivities.map((item) => {
              const active = isCurrentActive(item.id);
              const Icon = item.icon;
              const href = getPathForView(item.id);

              return (
                <a
                  key={item.id}
                  id={`side-nav-${item.id}`}
                  href={href}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick(item.id);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 text-left group cursor-pointer ${
                    active
                      ? 'bg-white text-slate-900 shadow-2xs border border-slate-200 font-bold'
                      : 'text-slate-600 hover:bg-white/60 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                        active
                          ? 'bg-purple-100 text-purple-700'
                          : 'text-slate-400 group-hover:text-purple-600'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <span className="tracking-tight">{item.label}</span>
                  </div>

                  {item.badge && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-700">
                      {item.badge}
                    </span>
                  )}
                </a>
              );
            })}

            {/* Admin Command Center Link if user is Admin */}
            {currentUser?.role === 'admin' && (
              <div className="pt-2 border-t border-slate-200/60 mt-2">
                <button
                  id="side-nav-admin"
                  onClick={() => handleNavClick('admin')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                    currentView === 'admin'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-indigo-700 bg-indigo-50/80 hover:bg-indigo-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Shield className="w-4 h-4" />
                    <span>Admin Command Center</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 opacity-70" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Section */}
        <div className="pt-3 border-t border-slate-200/70 space-y-2.5">
          {/* User Profile Pill & Quick Actions */}
          {currentUser ? (
            <div className="flex items-center justify-between bg-white rounded-2xl p-2.5 border border-slate-200/80 shadow-2xs">
              <button
                onClick={() => handleNavClick('profile')}
                className="flex items-center gap-2 min-w-0 text-left flex-1 cursor-pointer"
              >
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                  {currentUser.name.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-900 truncate">
                    {currentUser.name}
                  </p>
                  <p className="text-[10px] font-semibold text-amber-600 flex items-center gap-1">
                    <Coins className="w-3 h-3 text-amber-500" />
                    <span>{currentUser.coinBalance.toLocaleString()} coins</span>
                  </p>
                </div>
              </button>

              <button
                onClick={logout}
                title="Sign Out"
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => handleNavClick('login')}
              className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
            >
              Sign In / Register
            </button>
          )}
        </div>
      </aside>
    </>
  );
};

