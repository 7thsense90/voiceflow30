const fs = require('fs');
let code = fs.readFileSync('src/context/AppContext.tsx', 'utf8');
code = code.replace(
  /const \[settings, setSettings\] = useState<PlatformSettings>\(\(\) => loadStorage\(STORAGE_KEYS\.SETTINGS, INITIAL_SETTINGS\)\);/,
  `const [settings, setSettings] = useState<PlatformSettings>(() => {
    const s = loadStorage(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
    if (s.minWithdrawalCoins < 50000) s.minWithdrawalCoins = 50000;
    return s;
  });`
);
fs.writeFileSync('src/context/AppContext.tsx', code);
