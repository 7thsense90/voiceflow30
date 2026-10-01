#!/bin/bash
sed -i '/id="header-login-btn"/i \
                <button\
                  onClick={() => setCurrentView('\''brand-directory'\'')}\
                  className={`md:hidden px-3.5 py-1.5 text-sm font-medium transition-colors rounded-lg ${ currentView.startsWith('\''brand'\'') ? '\''text-amber-700 bg-slate-100'\'' : '\''text-slate-700 hover:text-slate-900'\''}`}\
                >\
                  Brands\
                </button>' src/components/Navbar.tsx
sed -i '/Admin Command Center/i \
                          <button\
                            onClick={() => {\
                              setCurrentView('\''brand-directory'\'');\
                              setIsProfileOpen(false);\
                            }}\
                            className="md:hidden w-full px-3.5 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2"\
                          >\
                            <Sparkles className="w-3.5 h-3.5 text-amber-500" />\
                            Brand Insights\
                          </button>' src/components/Navbar.tsx
