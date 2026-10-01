#!/bin/bash
sed -i 's/{ id: '\''responses'\'', label: `Responses (${responses.length})`, icon: BarChart3 },/{ id: '\''responses'\'', label: `Responses (${responses.length})`, icon: BarChart3 },\n          { id: '\''brands'\'', label: `Brands`, icon: Sparkles },/g' src/components/AdminDashboard.tsx
