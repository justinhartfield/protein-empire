#!/bin/bash
set -e

API_KEY="7EeSWl-Gj0s-1Zo7o2qwHXkaZijlYx_GnQzqYuuRTCTo2b39VbM5n_tmOPR7mSoco2aR4UHWxplgJgWU9PLQgw"
OUTPUT_DIR="/Users/customer/clawd/Projects/protein-empire/data/images/cottagecheeserecipes-co"
PREFIX="Professional overhead food photography of"
SUFFIX="on a white marble surface, bright natural soft lighting, clean modern food blog style, high resolution"

SUCCESS=0
FAIL=0

generate_image() {
  local filename="$1"
  local description="$2"
  local full_prompt="$PREFIX $description, $SUFFIX"
  local output_path="$OUTPUT_DIR/$filename"
  
  echo "=== Generating: $filename ==="
  
  # Call Ideogram API
  local response
  response=$(curl -s --max-time 120 "https://api.ideogram.ai/v1/ideogram-v3/generate" \
    -H "Api-Key: $API_KEY" \
    -H "Content-Type: application/json" \
    -d "{\"prompt\": \"$full_prompt\", \"rendering_speed\": \"TURBO\"}")
  
  # Extract URL from response
  local url
  url=$(echo "$response" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['data'][0]['url'])" 2>/dev/null)
  
  if [ -z "$url" ]; then
    echo "ERROR: Failed to get URL for $filename"
    echo "Response: $response"
    FAIL=$((FAIL + 1))
    return 1
  fi
  
  echo "Got URL: $url"
  
  # Download image
  curl -s --max-time 60 -o "$output_path" "$url"
  
  if [ -f "$output_path" ] && [ -s "$output_path" ]; then
    local size=$(wc -c < "$output_path" | tr -d ' ')
    echo "SUCCESS: $filename ($size bytes)"
    SUCCESS=$((SUCCESS + 1))
  else
    echo "ERROR: Download failed for $filename"
    FAIL=$((FAIL + 1))
  fi
  
  echo ""
}

# Gluten-Free
generate_image "cottage-cheese-almond-flour-pancakes.png" "fluffy golden almond flour cottage cheese pancakes stacked on a plate, topped with fresh berries and a drizzle of honey, grain-free breakfast"
generate_image "cottage-cheese-sweet-potato-bites.png" "golden baked sweet potato cottage cheese bites arranged on a baking sheet, crispy edges with creamy center, garnished with fresh herbs"
generate_image "cottage-cheese-greek-stuffed-peppers.png" "colorful bell peppers stuffed with cottage cheese rice and herbs mixture, baked golden on top, in a white baking dish"
generate_image "cottage-cheese-coconut-flour-muffins.png" "golden coconut flour cottage cheese muffins on a wire cooling rack, tall domed tops, one split open showing moist fluffy interior"

# Vegan
generate_image "vegan-cottage-cheese-smoothie-bowl.png" "vibrant purple smoothie bowl made with plant-based cottage cheese, topped with granola, sliced banana, coconut flakes, and fresh berries"
generate_image "vegan-cottage-cheese-overnight-oats.png" "layered overnight oats in a glass jar with plant-based cottage cheese, chia seeds, fresh berries, and a drizzle of maple syrup"
generate_image "vegan-cottage-cheese-stuffed-dates.png" "medjool dates stuffed with plant-based cottage cheese and topped with crushed pistachios, arranged on a small white plate"
generate_image "vegan-cottage-cheese-dip.png" "creamy herb dip made with plant-based cottage cheese in a white bowl, surrounded by colorful cut vegetables and crackers for dipping"

# Kids
generate_image "cottage-cheese-mac-and-cheese-bites.png" "golden baked mac and cheese bites with cottage cheese, crispy outside and gooey inside, arranged on parchment paper with one bitten in half"
generate_image "cottage-cheese-animal-pancakes.png" "fun animal-shaped cottage cheese pancakes on a colorful plate, decorated with fruit pieces to make faces, kid-friendly breakfast"
generate_image "cottage-cheese-banana-ice-cream.png" "creamy banana cottage cheese ice cream scooped into a bowl, topped with chocolate chips and sprinkles, frozen dessert for kids"
generate_image "cottage-cheese-pizza-pinwheels.png" "sliced cottage cheese pizza pinwheels arranged on a plate showing the spiral filling of cheese and pepperoni, golden baked rolls"

# Seasonal
generate_image "cottage-cheese-gingerbread-pancakes.png" "dark golden gingerbread spiced cottage cheese pancakes stacked with whipped cream between layers, dusted with powdered sugar, festive holiday breakfast"
generate_image "cottage-cheese-apple-cinnamon-bake.png" "golden bubbling apple cinnamon cottage cheese bake in a baking dish, with caramelized apple slices and cinnamon crumb topping, autumn comfort food"
generate_image "cottage-cheese-summer-berry-parfait.png" "layered summer berry cottage cheese parfait in a tall glass, alternating layers of whipped cottage cheese and mixed fresh berries, topped with mint"
generate_image "cottage-cheese-peppermint-bark-protein-balls.png" "white and dark chocolate drizzled cottage cheese protein balls with crushed candy cane pieces on top, arranged on parchment paper, festive holiday treats"

echo "================================"
echo "RESULTS: $SUCCESS succeeded, $FAIL failed out of 16 total"
echo "================================"
