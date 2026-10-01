sed -i '/<button/,/Brand Insights/ {
  /Brand Insights/,/<\/button>/d
}' src/components/Navbar.tsx
