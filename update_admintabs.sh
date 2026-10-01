#!/bin/bash
sed -i 's/  | '\''settings'\'';/  | '\''settings'\''\n  | '\''brands'\'';/g' src/components/AdminDashboard.tsx
