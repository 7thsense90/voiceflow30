const fs = require('fs');
let code = fs.readFileSync('src/components/CustomerDashboard.tsx', 'utf8');

code = code.replace(
  /!currentUser \? hasUserCompletedCampaign\(currentUser\.id, c\.id\) : false/g,
  "!(currentUser ? hasUserCompletedCampaign(currentUser.id, c.id) : false)"
);

code = code.replace(
  /!hasUserCompletedCampaign\(currentUser\.id, c\.id\)/g,
  "!(currentUser ? hasUserCompletedCampaign(currentUser.id, c.id) : false)"
);

code = code.replace(
  /hasUserCompletedCampaign\(currentUser\.id, featuredCampaign\.id\)/g,
  "(currentUser ? hasUserCompletedCampaign(currentUser.id, featuredCampaign.id) : false)"
);

code = code.replace(
  /hasUserCompletedCampaign\(currentUser\.id, camp\.id\)/g,
  "(currentUser ? hasUserCompletedCampaign(currentUser.id, camp.id) : false)"
);

fs.writeFileSync('src/components/CustomerDashboard.tsx', code);
