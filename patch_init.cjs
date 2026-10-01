const fs = require('fs');
let code = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

code = code.replace(
  /const \[currentUserId, setCurrentUserId\] = useState<string \| null>\(\(\) => \{\n    return loadStorage\(STORAGE_KEYS.CURRENT_USER_ID, 'usr_1'\); \/\/ default to John Doe for instant rich preview\n  \}\);/,
  "const [currentUserId, setCurrentUserId] = useState<string | null>(() => {\n    return loadStorage(STORAGE_KEYS.CURRENT_USER_ID, null);\n  });"
);

fs.writeFileSync('src/context/AppContext.tsx', code);
