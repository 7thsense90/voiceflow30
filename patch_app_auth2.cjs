const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const targetStr = `    // Protected views
    if (!currentUser) {
      return <LandingPage />;
    }
    if (currentView === 'chat' && activeChatCampaign) return <ChatView campaign={activeChatCampaign} />;
    if (currentView === 'dashboard') return <CustomerDashboard />;
    if (currentView === 'rewards') return <RewardsView />;
    if (currentView === 'profile') return <ProfileView />;
    if (currentView === 'admin' && currentUser.role === 'admin') return <AdminDashboard />;`;

const newStr = `    if (currentView === 'rewards') return <RewardsView />;
    if (currentView === 'profile') return <ProfileView />;

    // Protected views
    if (!currentUser) {
      return <LandingPage />;
    }
    
    if (currentView === 'admin' && currentUser.role === 'admin') return <AdminDashboard />;`;

code = code.replace(targetStr, newStr);

fs.writeFileSync('src/App.tsx', code);
