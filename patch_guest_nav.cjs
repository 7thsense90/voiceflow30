const fs = require('fs');
let code = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

code = code.replace(/    setCurrentUserId\(guestUser\.id\);\n    setCurrentView\('dashboard'\);\n  \};\n\n  const register =/g, "    setCurrentUserId(guestUser.id);\n  };\n\n  const register =");

fs.writeFileSync('src/context/AppContext.tsx', code);
