const fs = require('fs');
let code = fs.readFileSync('src/components/CustomerDashboard.tsx', 'utf8');

code = code.replace(
  /\(currentUser \? currentUser\.coinBalance : 0 \* settings\.coinToUsdRate\)/g,
  "((currentUser ? currentUser.coinBalance : 0) * settings.coinToUsdRate)"
);

fs.writeFileSync('src/components/CustomerDashboard.tsx', code);
