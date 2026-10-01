const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Add imports
const imports = `import { PrivacyPolicy, TermsOfService, AboutUs, ContactUs } from './components/LegalPages';\n`;
code = code.replace(/import \{ BrandDetail \} from '.\/components\/BrandDetail';/, "import { BrandDetail } from './components/BrandDetail';\n" + imports);

// Add to renderContent
const renderCases = `    // Legal pages
    if (currentView === 'privacy') return <PrivacyPolicy />;
    if (currentView === 'terms') return <TermsOfService />;
    if (currentView === 'about') return <AboutUs />;
    if (currentView === 'contact') return <ContactUs />;

    // Protected views`;
code = code.replace(/\/\/ Protected views/, renderCases);

// Modify footer to include links
const footerContent = `<footer className="bg-white border-t border-slate-200/80 py-8 mt-12 text-sm text-slate-500">
          <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-col items-center md:items-start gap-2">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900">Chat &amp; Earn</span>
                <span className="hidden sm:inline">•</span>
                <span className="hidden sm:inline">Conversational Feedback &amp; Rewards Platform</span>
              </div>
              <p className="text-xs text-slate-400">© {new Date().getFullYear()} Chat & Earn. All rights reserved.</p>
            </div>
            
            <div className="flex flex-wrap justify-center items-center gap-4 text-slate-500 font-medium">
              <button onClick={() => setCurrentView('about')} className="hover:text-indigo-600 transition-colors">About Us</button>
              <button onClick={() => setCurrentView('contact')} className="hover:text-indigo-600 transition-colors">Contact</button>
              <button onClick={() => setCurrentView('privacy')} className="hover:text-indigo-600 transition-colors">Privacy Policy</button>
              <button onClick={() => setCurrentView('terms')} className="hover:text-indigo-600 transition-colors">Terms of Service</button>
            </div>
          </div>
        </footer>`;

code = code.replace(/<footer[\s\S]*?<\/footer>/, footerContent);

fs.writeFileSync('src/App.tsx', code);
