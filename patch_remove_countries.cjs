const fs = require('fs');
let code = fs.readFileSync('src/components/AuthModal.tsx', 'utf8');

const countriesRegex = /const COUNTRIES = \[\s*'United States',\s*'United Kingdom',\s*'Canada',\s*'Australia',\s*'Germany',\s*'France',\s*'Japan',\s*'India',\s*'Brazil',\s*'Singapore',\s*'Other',\s*\];/;
code = code.replace(countriesRegex, '');

fs.writeFileSync('src/components/AuthModal.tsx', code);
