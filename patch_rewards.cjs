const fs = require('fs');
let code = fs.readFileSync('src/components/RewardsView.tsx', 'utf8');

const bannerStr = `      {/* Page Heading */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">`;

const replaceBanner = `      {currentUser.isGuest && (
        <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center text-rose-600">
              <UserIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-rose-900">You are using a Guest Account</h3>
              <p className="text-sm text-rose-700">Please sign up to save your progress and unlock cashouts.</p>
            </div>
          </div>
          <button 
            onClick={() => setCurrentView('register')}
            className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg transition-colors text-sm"
          >
            Sign Up Now
          </button>
        </div>
      )}

      {/* Page Heading */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">`;

// Add UserIcon to imports
code = code.replace(/import \{[\s\S]*?\} from 'lucide-react';/, (match) => match.replace("X,", "X,\n  User as UserIcon,"));
code = code.replace(bannerStr, replaceBanner);

const buttonStr = `        <button
          id="open-cashout-modal-btn"
          onClick={() => {
            setCoinsToWithdraw(Math.min(currentUser.coinBalance, Math.max(settings.minWithdrawalCoins, 500)));
            setIsCashoutModalOpen(true);
          }}
          disabled={!canWithdraw}
          className="px-6 py-3 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-500 hover:to-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
        >
          <Gift className="w-4 h-4" />
          <span>Request Cashout ({canWithdraw ? \`$\${usdValue}\` : \`Min \${settings.minWithdrawalCoins} Coins\`})</span>
        </button>`;

const newButtonStr = `        <button
          id="open-cashout-modal-btn"
          onClick={() => {
            if (currentUser.isGuest) {
              setCurrentView('register');
              return;
            }
            setCoinsToWithdraw(Math.min(currentUser.coinBalance, Math.max(settings.minWithdrawalCoins, 500)));
            setIsCashoutModalOpen(true);
          }}
          disabled={!canWithdraw}
          className="px-6 py-3 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-500 hover:to-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
        >
          <Gift className="w-4 h-4" />
          <span>{currentUser.isGuest ? 'Sign Up to Cashout' : \`Request Cashout (\${canWithdraw ? '$' + usdValue : 'Min ' + settings.minWithdrawalCoins + ' Coins'})\`}</span>
        </button>`;

code = code.replace(buttonStr, newButtonStr);
fs.writeFileSync('src/components/RewardsView.tsx', code);
