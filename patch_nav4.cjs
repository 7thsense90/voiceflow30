const fs = require('fs');
let code = fs.readFileSync('src/components/Navbar.tsx', 'utf8');

const target = `<Shield className="w-3.5 h-3.5 text-indigo-600" />
                          
                            Admin Command Center
                          </button>
                        </>`;
                        
const replacement = `<Shield className="w-3.5 h-3.5 text-indigo-600" />
                            Admin Command Center
                          </button>
                          <button
                            onClick={() => {
                              setCurrentView('dashboard');
                              setIsProfileOpen(false);
                            }}
                            className="w-full px-3.5 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                          >
                            <LayoutDashboard className="w-3.5 h-3.5 text-slate-500" />
                            Customer View
                          </button>
                        </>`;
code = code.replace(target, replacement);
fs.writeFileSync('src/components/Navbar.tsx', code);
