#!/bin/bash
sed -i '/currentView: string;/a \
  selectedBrandId: string | null;\
  setSelectedBrandId: (id: string | null) => void;\
  brands: Brand[];\
  addBrand: (brand: Omit<Brand, "id" | "createdAt">) => void;\
  updateBrand: (id: string, updates: Partial<Brand>) => void;\
  deleteBrand: (id: string) => void;\
  toggleResponseVisibility: (id: string) => void;' src/context/AppContext.tsx
