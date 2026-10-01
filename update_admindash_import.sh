#!/bin/bash
sed -i 's/import { AdminSettingsTab } from '\''.\/AdminSettingsTab'\'';/import { AdminSettingsTab } from '\''.\/AdminSettingsTab'\'';\nimport { AdminBrandsTab } from '\''.\/AdminBrandsTab'\'';/g' src/components/AdminDashboard.tsx
sed -i 's/{activeTab === '\''withdrawals'\'' && <AdminWithdrawalsTab \/>}/{activeTab === '\''withdrawals'\'' && <AdminWithdrawalsTab \/>}\n        {activeTab === '\''brands'\'' && <AdminBrandsTab \/>}/g' src/components/AdminDashboard.tsx
