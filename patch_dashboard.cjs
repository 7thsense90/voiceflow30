const fs = require('fs');
let code = fs.readFileSync('src/components/CustomerDashboard.tsx', 'utf8');

code = code.replace(/if \(!currentUser\) return null;/, "");

code = code.replace(
  /const completedCount = responses\.filter\(\(r\) => r\.userId === currentUser\.id\)\.length;/,
  "const completedCount = currentUser ? responses.filter((r) => r.userId === currentUser.id).length : 0;"
);

code = code.replace(
  /hasUserCompletedCampaign\(currentUser\.id, c\.id\)/g,
  "currentUser ? hasUserCompletedCampaign(currentUser.id, c.id) : false"
);

code = code.replace(/currentUser\.name\.split\(' '\)\[0\]/g, "currentUser ? currentUser.name.split(' ')[0] : 'Guest'");
code = code.replace(/currentUser\.totalEarned/g, "currentUser ? currentUser.totalEarned : 0");
code = code.replace(/currentUser\.coinBalance/g, "currentUser ? currentUser.coinBalance : 0");
code = code.replace(/currentUser\.isGuest/g, "currentUser ? currentUser.isGuest : true");

fs.writeFileSync('src/components/CustomerDashboard.tsx', code);
