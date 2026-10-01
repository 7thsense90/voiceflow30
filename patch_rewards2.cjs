const fs = require('fs');
let code = fs.readFileSync('src/components/RewardsView.tsx', 'utf8');

code = code.replace(/if \(!currentUser\) return null;/, "");

code = code.replace(/currentUser\.id/g, "currentUser?.id");
code = code.replace(/currentUser\.coinBalance/g, "(currentUser ? currentUser.coinBalance : 0)");
code = code.replace(/currentUser\.isGuest/g, "(currentUser ? currentUser.isGuest : true)");

// Fix some logical errors introduced by blind replace
code = code.replace(/Math\.min\(\(currentUser \? currentUser\.coinBalance : 0\),/g, "Math.min((currentUser ? currentUser.coinBalance : 0),");

fs.writeFileSync('src/components/RewardsView.tsx', code);
