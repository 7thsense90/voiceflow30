const fs = require('fs');
let code = fs.readFileSync('src/components/Navbar.tsx', 'utf8');

const targetStr = `            {/* Always visible links */}
            <nav className="hidden md:flex items-center gap-1">
              <button
                onClick={() => setCurrentView('brand-directory')}
                className={\`px-3 py-2 rounded-xl text-sm font-bold transition-all \${ currentView.startsWith('brand') ? 'bg-slate-100 text-amber-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}\`}
              >
              </button>
            </nav>`;

const newStr = `            {/* Always visible links */}
            <nav className="hidden md:flex items-center gap-1">
              <button
                onClick={() => setCurrentView('dashboard')}
                className={\`px-3 py-2 rounded-xl text-sm font-bold transition-all \${ currentView === 'dashboard' ? 'bg-amber-100 text-amber-900' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}\`}
              >
                Earn
              </button>
            </nav>`;

code = code.replace(targetStr, newStr);

fs.writeFileSync('src/components/Navbar.tsx', code);
