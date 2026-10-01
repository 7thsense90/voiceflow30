const fs = require('fs');
let code = fs.readFileSync('src/components/RewardsView.tsx', 'utf8');

code = code.replace(/currentUser\.totalEarned/g, "(currentUser ? currentUser.totalEarned : 0)");
code = code.replace(/currentUser\.redeemedCoins/g, "(currentUser ? currentUser.redeemedCoins : 0)");

fs.writeFileSync('src/components/RewardsView.tsx', code);
