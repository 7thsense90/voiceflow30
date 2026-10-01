const fs = require('fs');
let code = fs.readFileSync('src/components/Navbar.tsx', 'utf8');

// Remove from dropdown
const dropdownItem = `                      <button
                            onClick={() => {
                              setCurrentView('brand-insights');
                              setIsProfileOpen(false);
                            }}
                            className="w-full px-3.5 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                            Brand Insights
                          </button>`;
code = code.replace(dropdownItem, "");

// Add to public links (where "Brands" is)
const publicLinksTarget = `              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentView('brand-directory')}
                  className={\`md:hidden px-3.5 py-1.5 text-sm font-medium transition-colors rounded-lg \${ currentView.startsWith('brand') ? 'text-amber-700 bg-slate-100' : 'text-slate-700 hover:text-slate-900'}\`}
                >
                  Brands
                </button>`;

const publicLinksNew = `              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentView('brand-directory')}
                  className={\`hidden sm:block px-3.5 py-1.5 text-sm font-medium transition-colors rounded-lg \${ currentView === 'brand-directory' ? 'text-amber-700 bg-slate-100' : 'text-slate-700 hover:text-slate-900'}\`}
                >
                  Brands
                </button>
                <button
                  onClick={() => setCurrentView('brand-insights')}
                  className={\`hidden sm:block px-3.5 py-1.5 text-sm font-medium transition-colors rounded-lg \${ currentView === 'brand-insights' ? 'text-amber-700 bg-slate-100' : 'text-slate-700 hover:text-slate-900'}\`}
                >
                  Brand Insights
                </button>
                <button
                  onClick={() => setCurrentView('brand-directory')}
                  className={\`sm:hidden px-3.5 py-1.5 text-sm font-medium transition-colors rounded-lg \${ currentView.startsWith('brand') ? 'text-amber-700 bg-slate-100' : 'text-slate-700 hover:text-slate-900'}\`}
                >
                  Brands
                </button>`;

code = code.replace(publicLinksTarget, publicLinksNew);

// Add to logged-in user links too, so they can see it when logged in
const loggedInNav = `            {/* Main Nav links for logged in user */}
            {currentUser && (
              <nav className="hidden md:flex items-center gap-1">
                {currentUser.role === 'user' ? (
                  <>`;

const loggedInNavNew = `            {/* Main Nav links for logged in user */}
            {currentUser && (
              <nav className="hidden md:flex items-center gap-1">
                <button
                  onClick={() => setCurrentView('brand-directory')}
                  className={\`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 \${
                    currentView === 'brand-directory' ? 'text-amber-700 bg-amber-50' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }\`}
                >
                  Brands
                </button>
                <button
                  onClick={() => setCurrentView('brand-insights')}
                  className={\`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 \${
                    currentView === 'brand-insights' ? 'text-amber-700 bg-amber-50' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }\`}
                >
                  Insights
                </button>
                {currentUser.role === 'user' ? (
                  <>`;
code = code.replace(loggedInNav, loggedInNavNew);

fs.writeFileSync('src/components/Navbar.tsx', code);
