#!/bin/bash
sed -i '/activeChatCampaign,/a \
        brands,\
        selectedBrandId,\
        setSelectedBrandId,\
        addBrand,\
        updateBrand,\
        deleteBrand,\
        toggleResponseVisibility,' src/context/AppContext.tsx
