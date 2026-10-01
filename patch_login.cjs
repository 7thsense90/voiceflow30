const fs = require('fs');
let code = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

const loginTarget = `  const login = (email: string, password?: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const found = users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (!found) {
      return { success: false, error: 'No account found with this email address.' };
    }
    if (found.status === 'suspended') {
      return { success: false, error: 'Your account has been suspended. Please contact admin support.' };
    }`;

const loginNew = `  const login = (email: string, password?: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const found = users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (!found) {
      return { success: false, error: 'No account found with this email address.' };
    }
    if (found.status === 'suspended') {
      return { success: false, error: 'Your account has been suspended. Please contact admin support.' };
    }
    if (cleanEmail === 'ibrhussain6@gmail.com' && password !== 'Icon@7271202') {
      return { success: false, error: 'Invalid password for admin account.' };
    }`;

code = code.replace(loginTarget, loginNew);

fs.writeFileSync('src/context/AppContext.tsx', code);
