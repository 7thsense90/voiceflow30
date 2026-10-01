#!/bin/bash
sed -i 's/<nav className="flex items-center gap-1">/<nav className="hidden md:flex items-center gap-1">/g' src/components/Navbar.tsx
