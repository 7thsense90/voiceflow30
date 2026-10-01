const fs = require('fs');
let code = fs.readFileSync('src/components/Navbar.tsx', 'utf8');

// The remaining code looks like:
// <button
//   onClick={() => {
//     setCurrentView('brand-directory');
//     setIsProfileOpen(false);
//   }}
//   className="md:hidden w-full px-3.5 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2"
// >
//   <Sparkles className="w-3.5 h-3.5 text-amber-500" />
// </button>

code = code.replace(/<button\s*onClick=\{\(\) => \{\s*setCurrentView\('brand-directory'\);\s*setIsProfileOpen\(false\);\s*\}\}\s*className="md:hidden[^>]+>\s*<Sparkles[^>]+\/>\s*<\/button>/g, '');

fs.writeFileSync('src/components/Navbar.tsx', code);
