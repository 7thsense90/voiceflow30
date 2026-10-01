#!/bin/bash
sed -i 's/  PlatformSettings,/  PlatformSettings,\n  Brand,/g' src/context/AppContext.tsx
sed -i 's/  INITIAL_CAMPAIGNS,/  INITIAL_CAMPAIGNS,\n  INITIAL_BRANDS,/g' src/context/AppContext.tsx
