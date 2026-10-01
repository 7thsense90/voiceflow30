const fs = require('fs');
let code = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

const targetStr = `  const startChat = (campaign: Campaign) => {
    setActiveChatCampaign(campaign);
    setCurrentView('chat');
  };`;

const newStr = `  const startChat = (campaign: Campaign) => {
    if (!currentUser) {
      startGuestSession();
    }
    setActiveChatCampaign(campaign);
    setCurrentView('chat');
  };`;

code = code.replace(targetStr, newStr);
fs.writeFileSync('src/context/AppContext.tsx', code);
