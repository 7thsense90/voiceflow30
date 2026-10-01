const fs = require('fs');
let code = fs.readFileSync('src/components/AuthModal.tsx', 'utf8');
code = code.replace(', Zap }', ' }');
fs.writeFileSync('src/components/AuthModal.tsx', code);
