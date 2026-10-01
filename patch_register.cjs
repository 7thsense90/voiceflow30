const fs = require('fs');
let code = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

const targetStr = `    const newUser: User = {
      id: \`usr_\${Date.now()}\`,
      name: name.trim(),
      email: cleanEmail,
      country: country || 'United States',
      role: 'user',
      coinBalance: 50, // Welcome registration gift!
      totalEarned: 50,
      redeemedCoins: 0,
      status: 'active',
      createdAt: new Date().toISOString(),
      bio: 'New Chat & Earn member',
    };`;

const newStr = `    let existingGuest = currentUser && currentUser.isGuest ? currentUser : null;
    
    const newUser: User = {
      id: existingGuest ? existingGuest.id : \`usr_\${Date.now()}\`,
      name: name.trim(),
      email: cleanEmail,
      country: country || 'United States',
      role: 'user',
      coinBalance: (existingGuest ? existingGuest.coinBalance : 0) + 50, // Guest earnings + Welcome registration gift!
      totalEarned: (existingGuest ? existingGuest.totalEarned : 0) + 50,
      redeemedCoins: (existingGuest ? existingGuest.redeemedCoins : 0),
      status: 'active',
      createdAt: existingGuest ? existingGuest.createdAt : new Date().toISOString(),
      bio: 'New Chat & Earn member',
    };`;

code = code.replace(targetStr, newStr);

// We also need to update the users array logic
const usersTargetStr = `    setUsers((prev) => [...prev, newUser]);
    setCurrentUserId(newUser.id);
    setCurrentView('dashboard');
    showToast('Account created successfully! Enjoy your 50 coin welcome bonus.', 'success');
    return { success: true };`;

const usersNewStr = `    setUsers((prev) => {
      if (existingGuest) {
        return prev.map(u => u.id === existingGuest.id ? newUser : u);
      }
      return [...prev, newUser];
    });
    setCurrentUserId(newUser.id);
    setCurrentView('dashboard');
    showToast('Account created successfully! Enjoy your 50 coin welcome bonus.', 'success');
    return { success: true };`;

code = code.replace(usersTargetStr, usersNewStr);

// And we need to get `currentUser` from somewhere if it's not in the scope of `register`. 
// Oh wait, `register` is a function inside `AppProvider`, which HAS `currentUser`!
// Let's verify `currentUser` is in scope.

fs.writeFileSync('src/context/AppContext.tsx', code);
