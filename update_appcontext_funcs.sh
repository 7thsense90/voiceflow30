#!/bin/bash
sed -i '/const updateCampaign = /i \
  const addBrand = (brand: Omit<Brand, "id" | "createdAt">) => {\
    const newBrand: Brand = {\
      ...brand,\
      id: "br_" + Math.random().toString(36).substring(2, 9),\
      createdAt: new Date().toISOString(),\
    };\
    setBrands((prev) => [newBrand, ...prev]);\
    showToast("Brand added successfully", "success");\
  };\
  const updateBrand = (id: string, updates: Partial<Brand>) => {\
    setBrands((prev) => prev.map((b) => (b.id === id ? { ...b, ...updates } : b)));\
    showToast("Brand updated", "success");\
  };\
  const deleteBrand = (id: string) => {\
    setBrands((prev) => prev.filter((b) => b.id !== id));\
    showToast("Brand deleted", "success");\
  };\
  const toggleResponseVisibility = (id: string) => {\
    setResponses((prev) => prev.map((r) => r.id === id ? { ...r, isHidden: !r.isHidden } : r));\
    showToast("Response visibility toggled", "success");\
  };\
' src/context/AppContext.tsx
