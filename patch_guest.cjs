const fs = require('fs');
let code = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

const targetStr = `  const register = (name: string, email: string, password: string, country: string) => {`;
const newStr = `  const startGuestSession = () => {
    const guestUser: User = {
      id: \`guest_\${Date.now()}\`,
      name: 'Guest User',
      email: \`guest_\${Date.now()}@example.com\`,
      country: 'Global',
      role: 'user',
      coinBalance: 0,
      totalEarned: 0,
      redeemedCoins: 0,
      status: 'active',
      createdAt: new Date().toISOString(),
      bio: 'Guest Session',
      isGuest: true,
    };
    setUsers((prev) => [...prev, guestUser]);
    setCurrentUserId(guestUser.id);
    setCurrentView('dashboard');
  };

  const register = (name: string, email: string, password: string, country: string) => {`;

if (!code.includes('const startGuestSession =')) {
  code = code.replace(targetStr, newStr);
  
  // Let's also update the context provider value
  code = code.replace(/register,\s*logout,/g, "register,\n        startGuestSession,\n        logout,");
  
  fs.writeFileSync('src/context/AppContext.tsx', code);
}
