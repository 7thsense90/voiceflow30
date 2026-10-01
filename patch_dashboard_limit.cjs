const fs = require('fs');
let code = fs.readFileSync('src/components/CustomerDashboard.tsx', 'utf8');

// We need to add an effect for the public countdown timer (4 hours)
const importsRegex = /import React, \{ useState \} from 'react';/;
code = code.replace(importsRegex, "import React, { useState, useEffect } from 'react';");

const targetStart = `  const [searchQuery, setSearchQuery] = useState('');`;
const newLogic = `  const [searchQuery, setSearchQuery] = useState('');

  // 4-hour public countdown timer
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    // Calculate a consistent 4-hour countdown based on current time
    const updateTimer = () => {
      const now = new Date();
      const nextFourHour = new Date(now);
      const hours = now.getHours();
      const nextBlock = Math.ceil((hours + 1) / 4) * 4;
      nextFourHour.setHours(nextBlock, 0, 0, 0);
      
      let diff = nextFourHour.getTime() - now.getTime();
      if (diff <= 0) {
        diff = 4 * 60 * 60 * 1000; // Reset to 4 hours if hit
      }
      setTimeLeft(diff);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return \`\${h.toString().padStart(2, '0')}:\${m.toString().padStart(2, '0')}:\${s.toString().padStart(2, '0')}\`;
  };

  // Calculate daily earned coins for the current user
  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  
  const dailyEarned = currentUser ? responses
    .filter(r => r.userId === currentUser.id && new Date(r.completedAt) > oneDayAgo)
    .reduce((sum, r) => sum + r.coinsAwarded, 0) : 0;
    
  const hasReachedDailyLimit = dailyEarned >= 1000;
`;

code = code.replace(targetStart, newLogic);

// Add the 4-hour public timer banner at the top of the dashboard content
const bannerTarget = `  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">`;

const bannerNew = `  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Public 4-hour Countdown Timer */}
      <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-900 rounded-2xl p-6 shadow-xl text-center relative overflow-hidden border border-indigo-500/30">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
        <div className="relative z-10 flex flex-col items-center justify-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/20 text-indigo-200 rounded-full text-xs font-bold uppercase tracking-wider">
            <Clock className="w-3.5 h-3.5" />
            <span>Next Drop</span>
          </div>
          <h3 className="text-xl md:text-2xl font-extrabold text-white">
            New surveys and earning opportunities will be available in:
          </h3>
          <div className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-500 tracking-tight tabular-nums">
            {formatTime(timeLeft)}
          </div>
        </div>
      </div>`;

code = code.replace(bannerTarget, bannerNew);

// Add the daily limit block replacing the campaign list if limit reached
const campaignListTarget = `      {/* Campaign List */}
      <div className="space-y-4">`;

const campaignListNew = `      {/* Campaign List */}
      <div className="space-y-4">
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
        ) : (`;

code = code.replace(campaignListTarget, campaignListNew);

// Close the if statement
const campaignListEndTarget = `            />
          ))}
      </div>`;

const campaignListEndNew = `            />
          ))}
      </div>
      )}`;

code = code.replace(campaignListEndTarget, campaignListEndNew);

fs.writeFileSync('src/components/CustomerDashboard.tsx', code);
