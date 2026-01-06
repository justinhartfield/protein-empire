#!/bin/bash
# Copy the netlify functions to each site directory

SITES=(
  "highprotein.recipes"
  "protein-bread.com"
  "proteinbars.co"
  "proteinbites.co"
  "proteinbrownies.co"
  "proteincheesecake.co"
  "proteincookies.co"
  "proteindonuts.co"
  "proteinoatmeal.co"
  "proteinpancakes.co"
  "proteinpizzas.co"
  "proteinpudding.co"
)

echo "Copying netlify functions to each site..."

for site in "${SITES[@]}"; do
  echo "Copying to $site..."
  mkdir -p "apps/$site/netlify/functions"
  cp -r netlify/functions/* "apps/$site/netlify/functions/"
done

echo "Done!"
