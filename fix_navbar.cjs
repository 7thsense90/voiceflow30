const fs = require('fs');
let code = fs.readFileSync('src/components/Navbar.tsx', 'utf8');

// The remaining broken demo menu is around line 155
// It starts with `{users.map((u) => (` up to the `)}` of `isDemoMenuOpen`

// Let's just find `<div className="flex items-center gap-3">` and the next ` {currentUser ? (`
// and replace everything in between.

const startIndex = code.indexOf('<div className="flex items-center gap-3">');
const endIndex = code.indexOf('{currentUser ? (', startIndex);

if (startIndex !== -1 && endIndex !== -1) {
  const replacement = '<div className="flex items-center gap-3">\n            ';
  code = code.substring(0, startIndex) + replacement + code.substring(endIndex);
}

fs.writeFileSync('src/components/Navbar.tsx', code);
