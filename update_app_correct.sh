#!/bin/bash
cat << 'APP_EOF' > src/App.tsx
import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Toast } from './components/Toast';
import { AuthModal } from './components/AuthModal';
import { LandingPage } from './components/LandingPage';
import { CustomerDashboard } from './components/CustomerDashboard';
import { ChatView } from './components/ChatView';
import { RewardsView } from './components/RewardsView';
import { ProfileView } from './components/ProfileView';
import { AdminDashboard } from './components/AdminDashboard';
import { BrandDirectory } from './components/BrandDirectory';
import { BrandDetail } from './components/BrandDetail';

const MainAppContent: React.FC = () => {
  const { currentUser, currentView, activeChatCampaign } = useApp();
  
  const isChat = currentView === 'chat' && activeChatCampaign;

  const renderContent = () => {
    // Public views
    if (currentView === 'brand-directory') return <BrandDirectory />;
    if (currentView === 'brand-detail') return <BrandDetail />;

    // Protected views
    if (!currentUser) {
      return <LandingPage />;
    }

    if (currentView === 'chat' && activeChatCampaign) return <ChatView campaign={activeChatCampaign} />;
    if (currentView === 'dashboard') return <CustomerDashboard />;
    if (currentView === 'rewards') return <RewardsView />;
    if (currentView === 'profile') return <ProfileView />;
    if (currentView === 'admin' && currentUser.role === 'admin') return <AdminDashboard />;

    return <LandingPage />;
  };

  return (
    <div className={`bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-amber-400 selection:text-slate-950 ${isChat ? 'h-[100dvh] overflow-hidden' : 'min-h-[100dvh]'}`}>
      <Navbar />
      <Toast />
      <main className={`flex-1 ${isChat ? 'flex flex-col overflow-hidden' : ''}`}>
        {renderContent()}
      </main>

      {!isChat && (
        <footer className="bg-white border-t border-slate-200/80 py-6 mt-12 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900">Chat &amp; Earn</span>
              <span>•</span>
              <span>Conversational Feedback &amp; Rewards Platform</span>
            </div>
            <div className="flex items-center gap-4 text-slate-400">
              <span>100 Coins = $1.00 USD</span>
              <span>•</span>
              <span>Fast Cashout Review</span>
              <span>•</span>
              <span>SSL Secured</span>
            </div>
          </div>
        </footer>
      )}
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
APP_EOF
