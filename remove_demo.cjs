const fs = require('fs');
let code = fs.readFileSync('src/components/Navbar.tsx', 'utf8');

const demoBlock = `<div className="relative" ref={demoRef}>
              {isDemoMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-xl bg-white border border-slate-200 shadow-xl py-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-1.5 border-b border-slate-100 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Switch Test Account
                  </div>
                  {users.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => {
                        switchUser(u.id);
                        setIsDemoMenuOpen(false);
                      }}
                      className={\`w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-slate-50 transition-colors \${
                        currentUser?.id === u.id ? 'bg-amber-50/70 font-semibold text-amber-900' : 'text-slate-700'
                      }\`}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={\`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold \${
                            u.role === 'admin'
                              ? 'bg-indigo-100 text-indigo-700'
                              : 'bg-amber-100 text-amber-800'
                          }\`}
                        >
                          {u.name.charAt(0)}
                        </div>
                        <div>
                          <div className="truncate max-w-[120px]">{u.name}</div>
                          <div className="text-[10px] text-slate-400 capitalize">{u.role}</div>
                        </div>
                      </div>
                      <span className="text-[11px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                        🪙 {u.coinBalance}
                      </span>
                    </button>
                  ))}
                  <div className="border-t border-slate-100 mt-1 pt-1 px-3">
                    <button
                      onClick={() => {
                        resetAllDataToDefault();
                        setIsDemoMenuOpen(false);
                      }}
                      className="w-full text-left py-1 text-[11px] text-slate-500 hover:text-red-600 flex items-center gap-1.5"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Reset Demo Database
                    </button>
                  </div>
                </div>
              )}
            </div>`;

code = code.replace(demoBlock, '');
// Also remove demoRef and isDemoMenuOpen references
code = code.replace(/const \[isDemoMenuOpen, setIsDemoMenuOpen\] = useState\(false\);/, '');
code = code.replace(/const demoRef = useRef<HTMLDivElement>\(null\);/, '');
code = code.replace(/if \(demoRef.current && !demoRef.current.contains\(event.target as Node\)\) \{\s*setIsDemoMenuOpen\(false\);\s*\}/, '');

fs.writeFileSync('src/components/Navbar.tsx', code);
