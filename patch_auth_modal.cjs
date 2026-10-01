const fs = require('fs');
let code = fs.readFileSync('src/components/AuthModal.tsx', 'utf8');

// Remove handleQuickFill
const quickFillTarget = `  const handleQuickFill = (userEmail: string, userPass = 'password123') => {
    setEmail(userEmail);
    setPassword(userPass);
    login(userEmail, userPass);
    if (onClose) onClose();
  };`;

code = code.replace(quickFillTarget, '');

// Remove Quick Demo buttons block
const demoBlockRegex = /\{\/\* Quick Demo 1-Click Fill Buttons \*\/\}.*?<\/div>\s*<\/div>/s;
code = code.replace(demoBlockRegex, '');

fs.writeFileSync('src/components/AuthModal.tsx', code);
