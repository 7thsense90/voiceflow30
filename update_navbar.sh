#!/bin/bash
sed -i '/<nav className="hidden md:flex items-center gap-1">/i \
            {/* Always visible links */}\
            <nav className="hidden md:flex items-center gap-1">\
              <button\
                onClick={() => setCurrentView('\''brand-directory'\'')}\
                className={`px-3 py-2 rounded-xl text-sm font-bold transition-all ${ currentView.startsWith('\''brand'\'') ? '\''bg-slate-100 text-amber-700'\'' : '\''text-slate-600 hover:bg-slate-100 hover:text-slate-900'\''}`}\
              >\
                Brand Insights\
              </button>\
            </nav>' src/components/Navbar.tsx
