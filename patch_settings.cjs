const fs = require('fs');
let code = fs.readFileSync('src/data/initialData.ts', 'utf8');
code = code.replace(/minWithdrawalCoins: 500,/g, "minWithdrawalCoins: 50000,");
fs.writeFileSync('src/data/initialData.ts', code);

let rewardsCode = fs.readFileSync('src/components/RewardsView.tsx', 'utf8');
rewardsCode = rewardsCode.replace(/Math\.max\(settings\.minWithdrawalCoins, 500\)/g, "settings.minWithdrawalCoins");
fs.writeFileSync('src/components/RewardsView.tsx', rewardsCode);
