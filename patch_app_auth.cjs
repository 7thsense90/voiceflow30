const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const targetStr = `    if (currentView === 'login' || currentView === 'register') {
      return (
        <>
          <LandingPage />
          <AuthModal initialMode={currentView} />
        </>
      );
    }`;

const newStr = `    if (currentView === 'login' || currentView === 'register') {
      return (
        <div className="flex-1 flex flex-col justify-center items-center p-4 min-h-[calc(100vh-4rem)] bg-slate-50/50">
          <div className="w-full max-w-md">
            <AuthModal initialMode={currentView} />
          </div>
        </div>
      );
    }`;

code = code.replace(targetStr, newStr);

fs.writeFileSync('src/App.tsx', code);
