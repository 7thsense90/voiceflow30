const fs = require('fs');
let code = fs.readFileSync('src/components/CustomerDashboard.tsx', 'utf8');

code = code.replace(/currentUser \? currentUser\.totalEarned : 0\.toLocaleString\(\)/g, "(currentUser ? currentUser.totalEarned : 0).toLocaleString()");
code = code.replace(/currentUser \? currentUser\.coinBalance : 0\.toLocaleString\(\)/g, "(currentUser ? currentUser.coinBalance : 0).toLocaleString()");

fs.writeFileSync('src/components/CustomerDashboard.tsx', code);
