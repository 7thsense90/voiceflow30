#!/bin/bash
sed -i '/const \[campaigns/a \
  const [brands, setBrands] = useState<Brand[]>(() => loadStorage('\''chat_earn_brands'\'', INITIAL_BRANDS));\
  const [selectedBrandId, setSelectedBrandId] = useState<string | null>(null);' src/context/AppContext.tsx
