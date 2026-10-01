const fs = require('fs');
let code = fs.readFileSync('src/components/Navbar.tsx', 'utf8');

const targetStr = `                          <button
                            onClick={() => {
                              setCurrentView('brand-directory');
                              setIsProfileOpen(false);
                            }}
                            className="md:hidden w-full px-3.5 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2"`;

const newStr = `                          <button
                            onClick={() => {
                              setCurrentView('brand-insights');
                              setIsProfileOpen(false);
                            }}
                            className="w-full px-3.5 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2"`;

code = code.replace(targetStr, newStr);
fs.writeFileSync('src/components/Navbar.tsx', code);
