#!/bin/bash
sed -i '/const \[campaignDesc, setCampaignDesc/a \  const [campaignBrandId, setCampaignBrandId] = useState<string | undefined>(undefined);' src/components/AdminDashboard.tsx
sed -i 's/setCampaignStatusInput(camp.status);/setCampaignStatusInput(camp.status);\n    setCampaignBrandId(camp.brandId);/g' src/components/AdminDashboard.tsx
