#!/bin/bash
sed -i "s/brandName: 'QuickEats Global Research'/brandId: 'br_quickeats'/g" src/data/initialData.ts
sed -i "s/brandName: 'Apex Device Insights'/brandId: 'br_apex'/g" src/data/initialData.ts
sed -i "s/brandName: 'Digital Ethics Institute'/brandId: 'br_digitalethics'/g" src/data/initialData.ts
sed -i "s/brandName: 'TechPioneer Media'/brandId: 'br_techpioneer'/g" src/data/initialData.ts
sed -i "s/brandName: 'GreenEarth Market Study'/brandId: 'br_greenearth'/g" src/data/initialData.ts
sed -i "s/brandName: 'Roast & Blend Insights'/brandId: 'br_roastblend'/g" src/data/initialData.ts
