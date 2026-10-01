const fs = require('fs');
let code = fs.readFileSync('src/components/AuthModal.tsx', 'utf8');

// Replace register call
code = code.replace(/const res = register\(name, email, password, country\);/g, "const res = register(name, email, password, 'United States');");

// Remove country block
const countryRegex = /<div>\s*<label className="block text-xs font-semibold text-slate-700 mb-1">Country<\/label>[\s\S]*?<\/select>\s*<\/div>\s*<\/div>/;
code = code.replace(countryRegex, '');

// Also remove `country` state if it's there
code = code.replace(/const \[country, setCountry\] = useState\('United States'\);/g, '');

// And remove `Globe` from imports if unused, though it might be used somewhere else. Let's just leave it or remove it safely.
code = code.replace(/, Globe/g, '');

fs.writeFileSync('src/components/AuthModal.tsx', code);
