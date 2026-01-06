#!/bin/bash
# Set DOUBLE_OPT_IN=true environment variable on all protein empire sites

export NETLIFY_AUTH_TOKEN=nfp_SLn1m4Y94QkRB4hR7jt8wat6AWKMS4no249a

# Site IDs (excluding proteincookies.co which already has it)
declare -A SITES=(
    ["f71f7a82-bb26-4c3f-8e6f-9e3cc50758f4"]="proteinpudding.co"
    ["9b7eaa58-13fe-420c-928d-90b392f6905a"]="proteinpizzas.co"
    ["3c06d754-ae27-4e60-a9f8-d25869e7a9ff"]="proteincheesecake.co"
    ["11f69ebb-628e-476d-963c-eedc787f2440"]="proteinoatmeal.co"
    ["62303e4e-deea-4ee0-b51f-a17060b74d8c"]="proteindonuts.co"
    ["ad5765db-fbf5-40ad-9765-70f1d81cd5ac"]="proteinbites.co"
    ["3b84302f-24a3-4b57-82da-010ca09f840c"]="proteinbars.co"
    ["2f523b1a-14f8-470e-ba53-b15b7988ce38"]="protein-bread.com"
    ["4b33b8de-c2fc-40b8-a6db-36c6ff60921d"]="proteinbrownies.co"
    ["fb2fe2c7-0687-408b-94a6-ece64be49993"]="proteinpancakes.co"
)

for site_id in "${!SITES[@]}"; do
    site_name="${SITES[$site_id]}"
    echo "Setting DOUBLE_OPT_IN=true on $site_name ($site_id)..."
    
    # Set the environment variable using Netlify API
    curl -s -X PATCH "https://api.netlify.com/api/v1/sites/${site_id}" \
        -H "Authorization: Bearer $NETLIFY_AUTH_TOKEN" \
        -H "Content-Type: application/json" \
        -d '{"build_settings": {"env": {"DOUBLE_OPT_IN": "true"}}}' > /dev/null
    
    if [ $? -eq 0 ]; then
        echo "  ✓ Done"
    else
        echo "  ✗ Failed"
    fi
done

echo ""
echo "All sites updated!"
