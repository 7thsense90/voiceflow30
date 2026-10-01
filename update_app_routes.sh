#!/bin/bash
sed -i 's|import { AdminDashboard } from '\''./components/AdminDashboard'\'';|import { AdminDashboard } from '\''./components/AdminDashboard'\'';\nimport { BrandDirectory } from '\''./components/BrandDirectory'\'';\nimport { BrandDetail } from '\''./components/BrandDetail'\'';|g' src/App.tsx
sed -i 's|{currentView === '\''admin'\'' && <AdminDashboard />}|{currentView === '\''admin'\'' && <AdminDashboard />}\n            {currentView === '\''brand-directory'\'' \&\& <BrandDirectory />}\n            {currentView === '\''brand-detail'\'' \&\& <BrandDetail />}|g' src/App.tsx
