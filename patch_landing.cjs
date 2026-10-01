const fs = require('fs');
let code = fs.readFileSync('src/components/LandingPage.tsx', 'utf8');

// Replace all setCurrentView('register') connected to "Start Earning" with startGuestSession()
// Actually let's just make sure we import startGuestSession from useApp
code = code.replace(/const \{ setCurrentView, campaigns \} = useApp\(\);/, "const { setCurrentView, startGuestSession, campaigns } = useApp();");

// Replace the hero start button
code = code.replace(
  /onClick=\{\(\) => setCurrentView\('register'\)\}([\s\S]*?)<span>Start Earning Now \(\+50 Bonus\)<\/span>/g,
  "onClick={() => startGuestSession()}$1<span>Start Earning Now (+50 Bonus)</span>"
);

// Any other "Start Earning" buttons
code = code.replace(
  /onClick=\{\(\) => setCurrentView\('register'\)\}([\s\S]*?)Start Earning/g,
  "onClick={() => startGuestSession()}$1Start Earning"
);

// We still want the top-right "Create Account" or "Get Started" if any to maybe just register
// But "Start Earning" should definitely trigger startGuestSession

fs.writeFileSync('src/components/LandingPage.tsx', code);
