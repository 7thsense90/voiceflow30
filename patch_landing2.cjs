const fs = require('fs');
let code = fs.readFileSync('src/components/LandingPage.tsx', 'utf8');

code = code.replace(/onClick=\{\(\) => startGuestSession\(\)\}/g, "onClick={() => { startGuestSession(); setCurrentView('dashboard'); }}");

fs.writeFileSync('src/components/LandingPage.tsx', code);
