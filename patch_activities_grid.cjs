const fs = require('fs');
let code = fs.readFileSync('src/components/CustomerDashboard.tsx', 'utf8');

const targetStr = `      {/* Activities Grid */}
      {filteredCampaigns.length === 0 ? (`;

const newStr = `      {/* Activities Grid */}
      {hasReachedDailyLimit ? (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-10 text-center shadow-sm">
          <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Daily Earning Limit Reached</h3>
          <p className="text-slate-600 max-w-md mx-auto">
            You have earned {dailyEarned} coins in the last 24 hours. To ensure high-quality responses and avoid bot traffic, please wait 12 hours before completing more surveys.
          </p>
        </div>
      ) : filteredCampaigns.length === 0 ? (`;

code = code.replace(targetStr, newStr);
fs.writeFileSync('src/components/CustomerDashboard.tsx', code);
