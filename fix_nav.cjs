const fs = require('fs');
let code = fs.readFileSync('src/components/Navbar.tsx', 'utf8');

// Replace the nested button inside the first admin button
code = code.replace(/<Shield className="w-4 h-4 text-indigo-600" \/>\s*<button[\s\S]*?Brand Insights\s*<\/button>\s*Admin Command Center/, '<Shield className="w-4 h-4 text-indigo-600" />\n                    Admin Command Center');

// Replace the nested button inside the second admin button
code = code.replace(/<Shield className="w-3\.5 h-3\.5 text-indigo-600" \/>\s*<button[\s\S]*?Brand Insights\s*<\/button>\s*Admin Command Center/, '<Shield className="w-3.5 h-3.5 text-indigo-600" />\n                            Admin Command Center');

fs.writeFileSync('src/components/Navbar.tsx', code);
