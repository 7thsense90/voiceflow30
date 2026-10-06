import { createPortal } from 'react-dom';
import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Link } from './Link';
import { AuthModal } from './AuthModal';
import {
  Coins,
  Bell,
  User as UserIcon,
  Shield,
  LogOut,
  LayoutDashboard,
  Gift,
  CheckCircle,
  Clock,
  Sparkles,
  ChevronDown,
  Menu,
  FileQuestion,
  Building2,
  BarChart3,
  HelpCircle,
  Database,
  BookOpen,
  Megaphone,
  Info,
  X,
  Star,
} from 'lucide-react';

interface NavbarProps {
  onToggleSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const {
    currentUser,
    notifications,
    settings,
    currentView,
    isDbConnected,
    setCurrentView,
    logout,
    markNotificationRead,
    markAllNotificationsRead,
  } = useApp();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isSidebarDrawerOpen, setIsSidebarDrawerOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const sidebarBtnRef = useRef<HTMLDivElement>(null);

  const earningViews = [
    'dashboard',
    'start-earning',
    'earnings',
    'my-earnings',
    'surveys',
    'quizzes',
    'activities',
    'rewards',
    'profile',
    'brand-directory',
    'brand-detail',
  ];
  const isEarningSection = earningViews.includes(currentView);
  const isResearchStudiesSection =
    currentView === 'brand-research-studies' || currentView === 'brand-research-study-detail';

  const userNotifications = currentUser
    ? notifications.filter((n) => n.userId === currentUser.id)
    : [];
  const unreadCount = userNotifications.filter((n) => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsSidebarDrawerOpen(false);
        setIsProfileOpen(false);
        setIsNotifOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const getViewTitle = () => {
    switch (currentView) {
      case 'dashboard':
      case 'start-earning':
        return 'Research Studies';
      case 'how-to-earn':
        return 'How Research Studies Work';
      case 'for-brands':
      case 'brand-research':
      case 'market-research':
      case 'brand-inquiry':
        return 'Market Research for Brands';
      case 'faq':
        return 'Frequently Asked Questions (FAQ)';
      case 'about':
      case 'about-voiceflow':
        return 'About Voice Flow 360';
      case 'brand-insights':
        return 'Brand Insights';
      case 'brand-research-studies':
        return 'Brand Research Studies';
      case 'brand-research-study-detail':
        return 'Brand Research Study';
      case 'news':
      case 'news-updates':
        return 'News & Updates';
      case 'product-reviews':
      case 'public-product-reviews':
      case 'products':
        return 'Public Product Reviews (100+)';
      case 'earnings':
      case 'my-earnings':
        return 'Participation and Rewards';
      case 'surveys':
        return 'Feedback Surveys';
      case 'quizzes':
        return 'Trivia & Quizzes';
      case 'activities':
        return 'Daily Activities';
      case 'rewards':
        return 'Rewards & Cashout';
      case 'brand-directory':
      case 'brand-detail':
        return 'Brand Directory';
      case 'profile':
        return 'Account & Profile';
      case 'admin':
        return 'Admin Command Center';
      default:
        return 'Voice Flow 360';
    }
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs transition-all supports-[padding-top:env(safe-area-inset-top)]:pt-[env(safe-area-inset-top)]">
      <div className="w-full max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-1 sm:gap-3 lg:gap-4 min-w-0">
          {/* Left: Hamburger CTA, Brand Logo & Independent Participate in Studies CTA */}
          <div className="flex items-center gap-1.5 sm:gap-3 lg:gap-4 min-w-0 flex-1 sm:flex-initial">
            {/* Hamburger CTA Button to expand and minimize sidebar */}
            <div className="shrink-0" ref={sidebarBtnRef}>
              <button
                id="sidebar-menu-toggle-btn"
                onClick={() => {
                  if (onToggleSidebar) {
                    onToggleSidebar();
                  }
                  setIsSidebarDrawerOpen(!isSidebarDrawerOpen);
                }}
                className={`w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl transition-all cursor-pointer border shadow-2xs group ${
                  isSidebarDrawerOpen
                    ? 'bg-purple-50 text-purple-700 border-purple-300 ring-2 ring-purple-400/30'
                    : 'text-slate-700 hover:text-purple-700 hover:bg-purple-50 border-slate-200/80 bg-white'
                }`}
                aria-label={isSidebarDrawerOpen ? 'Minimize navigation sidebar' : 'Expand navigation sidebar'}
                title={isSidebarDrawerOpen ? 'Minimize sidebar' : 'Expand sidebar'}
              >
                {isSidebarDrawerOpen ? (
                  <X className="w-4 h-4 sm:w-5 sm:h-5 text-purple-700 transition-transform duration-200" />
                ) : (
                  <Menu className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-200 group-hover:scale-105" />
                )}
              </button>
            </div>

            {/* Brand Logo for top header */}
            <Link
              id="brand-logo-btn"
              to={currentUser?.role === 'admin' ? '/admin' : '/brand-case-studies'}
              onClick={() => setIsSidebarDrawerOpen(false)}
              className="flex items-center gap-2 sm:gap-2.5 text-left cursor-pointer group shrink-0"
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-purple-400 flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform shrink-0">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="block">
                <span className="text-sm sm:text-base font-extrabold tracking-tight text-slate-900 block leading-tight whitespace-nowrap">
                  Voice Flow 360
                </span>
                <span className="text-[9px] sm:text-[10px] font-bold text-purple-700 hidden sm:block leading-none whitespace-nowrap">
                  Brand Case Studies
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links: Phase 9 Standard Navigation */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2 text-xs font-semibold text-slate-600">
            <Link
              id="desktop-nav-home"
              to="/brand-case-studies"
              className={`px-2.5 py-1.5 rounded-lg transition-colors hover:text-purple-700 hover:bg-purple-50/60 ${
                currentView === 'brand-case-studies' || currentView === 'landing' ? 'text-purple-700 font-bold bg-purple-50' : ''
              }`}
            >
              Home
            </Link>
            <Link
              id="desktop-nav-how-it-works"
              to="/how-to-earn"
              className={`px-2.5 py-1.5 rounded-lg transition-colors hover:text-purple-700 hover:bg-purple-50/60 ${
                currentView === 'how-to-earn' ? 'text-purple-700 font-bold bg-purple-50' : ''
              }`}
            >
              How It Works
            </Link>
            <Link
              id="desktop-nav-research-insights"
              to="/brand-research-studies"
              className={`px-2.5 py-1.5 rounded-lg transition-colors hover:text-purple-700 hover:bg-purple-50/60 ${
                currentView === 'brand-research-studies' || currentView === 'brand-research-study-detail' || currentView === 'brand-insights'
                  ? 'text-purple-700 font-bold bg-purple-50'
                  : ''
              }`}
            >
              Research &amp; Insights
            </Link>
            <Link
              id="desktop-nav-for-brands"
              to="/for-brands"
              className={`px-2.5 py-1.5 rounded-lg transition-colors hover:text-purple-700 hover:bg-purple-50/60 ${
                currentView === 'for-brands' ? 'text-purple-700 font-bold bg-purple-50' : ''
              }`}
            >
              For Brands
            </Link>
            <Link
              id="desktop-nav-rewards"
              to="/rewards"
              className={`px-2.5 py-1.5 rounded-lg transition-colors hover:text-purple-700 hover:bg-purple-50/60 ${
                currentView === 'rewards' || currentView === 'rewards-and-withdrawals' ? 'text-purple-700 font-bold bg-purple-50' : ''
              }`}
            >
              Rewards
            </Link>
            <Link
              id="desktop-nav-about"
              to="/about"
              className={`px-2.5 py-1.5 rounded-lg transition-colors hover:text-purple-700 hover:bg-purple-50/60 ${
                currentView === 'about' || currentView === 'about-voiceflow' ? 'text-purple-700 font-bold bg-purple-50' : ''
              }`}
            >
              About
            </Link>
            <Link
              id="desktop-nav-contact"
              to="/contact"
              className={`px-2.5 py-1.5 rounded-lg transition-colors hover:text-purple-700 hover:bg-purple-50/60 ${
                currentView === 'contact' ? 'text-purple-700 font-bold bg-purple-50' : ''
              }`}
            >
              Contact
            </Link>
          </nav>

          {/* Right Action Bar: Notifications, Profile */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 lg:gap-3 shrink-0">
            {currentUser ? (
              <>
                {/* Notifications Bell Dropdown */}
                <div className="relative shrink-0" ref={notifRef}>
                  <button
                    id="notifications-bell-btn"
                    onClick={() => setIsNotifOpen(!isNotifOpen)}
                    className="relative w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg sm:rounded-xl transition-colors cursor-pointer"
                    aria-label="Notifications"
                  >
                    <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 sm:top-1.5 sm:right-1.5 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-rose-500 text-white text-[9px] sm:text-[10px] font-bold flex items-center justify-center ring-1 sm:ring-2 ring-white">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {isNotifOpen && (
                    <>
                      {/* Mobile backdrop */}
                      <div
                        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 sm:hidden"
                        onClick={() => setIsNotifOpen(false)}
                      />
                      <div className="fixed inset-x-3 top-14 sm:top-16 sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2 w-auto sm:w-96 max-w-[calc(100vw-1.5rem)] rounded-2xl bg-white border border-slate-200 shadow-xl py-2 z-50">
                        <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 text-sm">Notifications</span>
                            {unreadCount > 0 && (
                              <span className="text-xs bg-purple-100 text-purple-800 font-semibold px-2 py-0.5 rounded-full">
                                {unreadCount} new
                              </span>
                            )}
                          </div>
                          {unreadCount > 0 && (
                            <button
                              onClick={markAllNotificationsRead}
                              className="text-xs text-purple-700 hover:text-purple-900 font-medium"
                            >
                              Mark all read
                            </button>
                          )}
                        </div>

                        <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                          {userNotifications.length === 0 ? (
                            <div className="py-8 text-center text-slate-400 text-xs font-medium">
                              No notifications yet
                            </div>
                          ) : (
                            userNotifications.map((n) => (
                              <div
                                key={n.id}
                                onClick={() => markNotificationRead(n.id)}
                                className={`p-3 text-left transition-colors cursor-pointer hover:bg-slate-50 ${
                                  !n.read ? 'bg-purple-50/50' : ''
                                }`}
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <span className="font-bold text-xs text-slate-900">{n.title}</span>
                                  <span className="text-[10px] text-slate-400 whitespace-nowrap">
                                    {new Date(n.timestamp).toLocaleDateString(undefined, {
                                      month: 'short',
                                      day: 'numeric',
                                    })}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{n.message}</p>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Profile Avatar / Menu */}
                <div className="relative shrink-0" ref={profileRef}>
                  <button
                    id="profile-avatar-btn"
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center gap-1 sm:gap-1.5 p-0.5 sm:p-1 sm:pl-2 rounded-full hover:bg-slate-100 transition-colors border border-slate-200 cursor-pointer shrink-0"
                  >
                    <span className="text-xs font-bold text-slate-700 hidden sm:inline-block max-w-[100px] truncate">
                      {currentUser.name}
                    </span>
                    <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-purple-700 text-white font-bold text-[11px] sm:text-xs flex items-center justify-center shadow-xs shrink-0">
                      {currentUser.name.charAt(0)}
                    </div>
                  </button>

                  {isProfileOpen && (
                    <>
                      {/* Mobile backdrop */}
                      <div
                        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 sm:hidden"
                        onClick={() => setIsProfileOpen(false)}
                      />
                      <div className="fixed inset-x-3 top-14 sm:top-16 sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2 w-auto sm:w-64 max-w-[calc(100vw-1.5rem)] rounded-2xl bg-white border border-slate-200 shadow-xl py-2 z-50">
                        <div className="px-4 py-2 border-b border-slate-100">
                          <p className="text-xs font-extrabold text-slate-900 truncate">{currentUser.name}</p>
                          <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
                          <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                            {currentUser.role} Account
                          </span>
                        </div>

                        {currentUser.role === 'admin' ? (
                          <button
                            onClick={() => {
                              setCurrentView('admin');
                              setIsProfileOpen(false);
                            }}
                            className="w-full px-4 py-2.5 text-left text-xs font-bold text-purple-700 bg-purple-50/70 hover:bg-purple-100/80 flex items-center gap-2.5"
                          >
                            <Shield className="w-4 h-4 text-purple-600" />
                            Admin Dashboard
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setCurrentView('dashboard');
                              setIsProfileOpen(false);
                            }}
                            className="w-full px-4 py-2.5 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5"
                          >
                            <LayoutDashboard className="w-4 h-4 text-slate-500" />
                            Dashboard
                          </button>
                        )}

                        <button
                          onClick={() => {
                            setCurrentView('surveys');
                            setIsProfileOpen(false);
                          }}
                          className="w-full px-4 py-2.5 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5"
                        >
                          <FileQuestion className="w-4 h-4 text-purple-600" />
                          Surveys &amp; Quizzes
                        </button>

                        <button
                          onClick={() => {
                            setCurrentView('earnings');
                            setIsProfileOpen(false);
                          }}
                          className="w-full px-4 py-2.5 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5"
                        >
                          <Coins className="w-4 h-4 text-amber-500" />
                          Participation and Rewards
                        </button>

                        <button
                          onClick={() => {
                            setCurrentView('profile');
                            setIsProfileOpen(false);
                          }}
                          className="w-full px-4 py-2.5 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5"
                        >
                          <UserIcon className="w-4 h-4 text-slate-500" />
                          Account Settings
                        </button>

                        {currentUser.role === 'admin' && (
                          <button
                            onClick={() => {
                              setCurrentView('admin');
                              setIsProfileOpen(false);
                            }}
                            className="w-full px-4 py-2.5 text-left text-xs font-semibold text-indigo-700 hover:bg-indigo-50 flex items-center gap-2.5"
                          >
                            <Shield className="w-4 h-4 text-indigo-600" />
                            Admin Command Center
                          </button>
                        )}

                        <div className="border-t border-slate-100 mt-1 pt-1">
                          <button
                            onClick={() => {
                              logout();
                              setIsProfileOpen(false);
                            }}
                            className="w-full px-4 py-2.5 text-left text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2.5"
                          >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                <button
                  id="header-login-btn"
                  onClick={() => setCurrentView('login')}
                  className="px-2 sm:px-3.5 py-1 sm:py-1.5 text-xs sm:text-sm font-semibold text-slate-700 hover:text-slate-900 rounded-lg sm:rounded-xl transition-colors cursor-pointer whitespace-nowrap"
                >
                  Log In
                </button>
                <button
                  id="header-signup-btn"
                  onClick={() => setCurrentView('register')}
                  className="px-2 sm:px-4 py-1 sm:py-1.5 text-xs sm:text-sm font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-lg sm:rounded-xl shadow-xs transition-all cursor-pointer whitespace-nowrap"
                >
                  <span className="hidden sm:inline">Create Account</span>
                  <span className="sm:hidden">Join</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sign-In / Sign-Up Prompt Modal */}
      {isAuthModalOpen && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
          <div className="relative w-full max-w-md my-8">
            <button
              id="close-auth-prompt-modal-btn"
              onClick={() => setIsAuthModalOpen(false)}
              className="absolute -top-3 -right-3 z-20 w-9 h-9 bg-white hover:bg-slate-100 rounded-full border border-slate-300 shadow-md flex items-center justify-center text-slate-600 hover:text-slate-900 transition-all cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-2.5 bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-800 text-white p-3.5 rounded-2xl shadow-sm text-center">
              <div className="flex items-center justify-center gap-2 font-bold text-sm">
                <Sparkles className="w-4 h-4 text-amber-300 fill-amber-300" />
                <span>Customer Access Required</span>
              </div>
              <p className="text-xs text-purple-100 mt-1">
                Please sign in or create a free account to view study details &amp; participate!
              </p>
            </div>

            <AuthModal
              initialMode={authModalMode}
              customTitle="Sign In or Sign Up"
              customSubtitle="Access study details, share your feedback &amp; earn coin rewards."
              onClose={() => setIsAuthModalOpen(false)}
              onSuccess={() => {
                setIsAuthModalOpen(false);
                setCurrentView('start-earning');
              }}
            />
          </div>
        </div>
      , document.body)}

      {/* Expandable / Minimizable Sidebar Drawer with all Navigation CTAs */}
      {isSidebarDrawerOpen && createPortal(
        <div id="sidebar-drawer-container" className="fixed inset-0 z-50 flex">
          {/* Backdrop overlay */}
          <div
            id="sidebar-drawer-backdrop"
            className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={() => setIsSidebarDrawerOpen(false)}
          />

          {/* Slide-out Sidebar Drawer */}
          <aside
            id="sidebar-drawer-panel"
            className="relative w-80 max-w-[85vw] h-full bg-[#f8f9fc] border-r border-slate-200 shadow-2xl z-50 flex flex-col justify-between animate-in slide-in-from-left duration-200"
          >
            {/* Drawer Header with Brand Logo & Minimize CTA */}
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-200 bg-white shrink-0">
              <Link
                to="/brand-case-studies"
                onClick={() => setIsSidebarDrawerOpen(false)}
                className="flex items-center gap-2.5 text-left group"
              >
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-purple-400 flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-sm font-extrabold tracking-tight text-slate-900 block leading-tight">
                    Voice Flow 360
                  </span>
                  <span className="text-[10px] font-bold text-purple-700 block leading-none">
                    Brand Case Studies
                  </span>
                </div>
              </Link>

              <button
                id="sidebar-drawer-minimize-btn"
                onClick={() => setIsSidebarDrawerOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                aria-label="Minimize sidebar"
                title="Minimize sidebar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Scrollable Navigation Items */}
            <div className="flex-1 overflow-y-auto px-3 py-3.5 space-y-4">
              {/* Category 1: Studies & Research */}
              <div>
                <div className="px-3 pb-1.5 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                  Case Studies &amp; Research
                </div>
                <div className="space-y-1">
                  <Link
                    id="side-nav-brand-case-studies"
                    to="/brand-case-studies"
                    onClick={() => setIsSidebarDrawerOpen(false)}
                    className={`w-full px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-colors flex items-center gap-3 ${
                      currentView === 'brand-case-studies' || currentView === 'landing' || currentView === 'case-studies'
                        ? 'text-purple-700 bg-purple-50 font-black shadow-xs'
                        : 'text-slate-700 hover:bg-white hover:text-slate-900'
                    }`}
                  >
                    <BookOpen className="w-4 h-4 text-purple-600 shrink-0" />
                    <span>Brand Case Studies</span>
                  </Link>

                  <Link
                    id="side-nav-how-to-earn"
                    to="/how-to-earn"
                    onClick={() => setIsSidebarDrawerOpen(false)}
                    className={`w-full px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-colors flex items-center gap-3 ${
                      currentView === 'how-to-earn'
                        ? 'text-purple-700 bg-purple-50 font-black shadow-xs'
                        : 'text-slate-700 hover:bg-white hover:text-slate-900'
                    }`}
                  >
                    <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>How Studies Work</span>
                  </Link>

                  <Link
                    id="side-nav-for-brands"
                    to="/for-brands"
                    onClick={() => setIsSidebarDrawerOpen(false)}
                    className={`w-full px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-colors flex items-center gap-3 ${
                      currentView === 'for-brands'
                        ? 'text-purple-700 bg-purple-50 font-black shadow-xs'
                        : 'text-slate-700 hover:bg-white hover:text-slate-900'
                    }`}
                  >
                    <Building2 className="w-4 h-4 text-purple-600 shrink-0" />
                    <span>For Brands (Market Research)</span>
                  </Link>

                  <Link
                    id="side-nav-brand-research-studies"
                    to="/brand-research-studies"
                    onClick={() => setIsSidebarDrawerOpen(false)}
                    className={`w-full px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-colors flex items-center gap-3 ${
                      currentView === 'brand-research-studies' || currentView === 'brand-research-study-detail'
                        ? 'text-purple-700 bg-purple-50 font-black shadow-xs'
                        : 'text-slate-700 hover:bg-white hover:text-slate-900'
                    }`}
                  >
                    <BookOpen className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>Research Studies Catalog</span>
                  </Link>

                  <Link
                    id="side-nav-brand-insights"
                    to="/brand-insights"
                    onClick={() => setIsSidebarDrawerOpen(false)}
                    className={`w-full px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-colors flex items-center gap-3 ${
                      currentView === 'brand-insights'
                        ? 'text-purple-700 bg-purple-50 font-black shadow-xs'
                        : 'text-slate-700 hover:bg-white hover:text-slate-900'
                    }`}
                  >
                    <BarChart3 className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Brand Insights &amp; Metrics</span>
                  </Link>

                  <Link
                    id="side-nav-product-reviews"
                    to="/product-reviews"
                    onClick={() => setIsSidebarDrawerOpen(false)}
                    className={`w-full px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-colors flex items-center gap-3 ${
                      currentView === 'product-reviews' || currentView === 'public-product-reviews'
                        ? 'text-purple-700 bg-purple-50 font-black shadow-xs'
                        : 'text-slate-700 hover:bg-white hover:text-slate-900'
                    }`}
                  >
                    <Star className="w-4 h-4 text-amber-500 shrink-0 fill-amber-400" />
                    <span>Public Product Reviews (100+)</span>
                  </Link>
                </div>
              </div>

              {/* Category 2: About & Help */}
              <div>
                <div className="px-3 pb-1.5 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                  Resources &amp; Company
                </div>
                <div className="space-y-1">
                  <Link
                    id="side-nav-about"
                    to="/about"
                    onClick={() => setIsSidebarDrawerOpen(false)}
                    className={`w-full px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-colors flex items-center gap-3 ${
                      currentView === 'about' || currentView === 'about-voiceflow'
                        ? 'text-purple-700 bg-purple-50 font-black shadow-xs'
                        : 'text-slate-700 hover:bg-white hover:text-slate-900'
                    }`}
                  >
                    <Info className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>About Voice Flow 360</span>
                  </Link>

                  <Link
                    id="side-nav-news"
                    to="/news"
                    onClick={() => setIsSidebarDrawerOpen(false)}
                    className={`w-full px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-colors flex items-center gap-3 ${
                      currentView === 'news' || currentView === 'news-updates'
                        ? 'text-purple-700 bg-purple-50 font-black shadow-xs'
                        : 'text-slate-700 hover:bg-white hover:text-slate-900'
                    }`}
                  >
                    <Megaphone className="w-4 h-4 text-sky-600 shrink-0" />
                    <span>News &amp; Updates</span>
                  </Link>

                  <Link
                    id="side-nav-faq"
                    to="/faq"
                    onClick={() => setIsSidebarDrawerOpen(false)}
                    className={`w-full px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-colors flex items-center gap-3 ${
                      currentView === 'faq'
                        ? 'text-purple-700 bg-purple-50 font-black shadow-xs'
                        : 'text-slate-700 hover:bg-white hover:text-slate-900'
                    }`}
                  >
                    <HelpCircle className="w-4 h-4 text-purple-600 shrink-0" />
                    <span>Help &amp; FAQ</span>
                  </Link>

                  <Link
                    id="side-nav-rewards-withdrawals"
                    to="/rewards"
                    onClick={() => setIsSidebarDrawerOpen(false)}
                    className={`w-full px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-colors flex items-center gap-3 ${
                      currentView === 'rewards' || currentView === 'rewards-and-withdrawals'
                        ? 'text-purple-700 bg-purple-50 font-black shadow-xs'
                        : 'text-slate-700 hover:bg-white hover:text-slate-900'
                    }`}
                  >
                    <Coins className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Rewards &amp; Withdrawals</span>
                  </Link>

                  <Link
                    id="side-nav-research-methodology"
                    to="/research-methodology"
                    onClick={() => setIsSidebarDrawerOpen(false)}
                    className={`w-full px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-colors flex items-center gap-3 ${
                      currentView === 'research-methodology'
                        ? 'text-purple-700 bg-purple-50 font-black shadow-xs'
                        : 'text-slate-700 hover:bg-white hover:text-slate-900'
                    }`}
                  >
                    <BookOpen className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>Research Methodology</span>
                  </Link>
                </div>
              </div>

              {/* Category 3: Member Hub (if logged in) */}
              {currentUser && (
                <div>
                  <div className="px-3 pb-1.5 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                    Member Account
                  </div>
                  <div className="space-y-1">
                    <Link
                      id="side-nav-my-earnings"
                      to="/my-earnings"
                      onClick={() => setIsSidebarDrawerOpen(false)}
                      className={`w-full px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-colors flex items-center justify-between ${
                        currentView === 'earnings' || currentView === 'my-earnings' || currentView === 'rewards'
                          ? 'text-amber-900 bg-amber-100 font-black shadow-xs'
                          : 'text-slate-700 hover:bg-white hover:text-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Coins className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>Participation and Rewards</span>
                      </div>
                      <span className="text-xs bg-amber-200/80 text-amber-950 font-black px-2 py-0.5 rounded-full">
                        {currentUser.coinBalance.toLocaleString()} pts
                      </span>
                    </Link>

                    <Link
                      id="side-nav-referrals"
                      to="/referrals"
                      onClick={() => setIsSidebarDrawerOpen(false)}
                      className="w-full px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-slate-700 hover:bg-white hover:text-slate-900 transition-colors flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <Gift className="w-4 h-4 text-purple-600 shrink-0" />
                        <span>Referral Program</span>
                      </div>
                      <span className="text-[10px] bg-purple-100 text-purple-800 font-extrabold px-2 py-0.5 rounded-full">
                        +300
                      </span>
                    </Link>

                    {currentUser.role === 'admin' && (
                      <Link
                        id="side-nav-admin"
                        to="/admin"
                        onClick={() => setIsSidebarDrawerOpen(false)}
                        className="w-full px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-slate-900 bg-purple-100/70 hover:bg-purple-100 transition-colors flex items-center gap-3"
                      >
                        <Shield className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>Admin Command Center</span>
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Drawer Footer Actions */}
            <div className="p-4 border-t border-slate-200 bg-white space-y-2 shrink-0">
              <Link
                to="/start-earning"
                onClick={() => setIsSidebarDrawerOpen(false)}
                className="w-full py-2.5 px-3 text-xs sm:text-sm font-extrabold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 rounded-xl flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Participate in Studies</span>
              </Link>

              {!currentUser ? (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setCurrentView('login');
                      setIsSidebarDrawerOpen(false);
                    }}
                    className="py-2 px-3 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer text-center"
                  >
                    Log In
                  </button>
                  <button
                    onClick={() => {
                      setCurrentView('register');
                      setIsSidebarDrawerOpen(false);
                    }}
                    className="py-2 px-3 text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors cursor-pointer text-center"
                  >
                    Sign Up
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    logout();
                    setIsSidebarDrawerOpen(false);
                  }}
                  className="w-full py-2 px-3 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              )}
            </div>
          </aside>
        </div>
      , document.body)}
    </header>
  );
};
