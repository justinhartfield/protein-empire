#!/bin/bash
# Generate images for all 30 cottage cheese recipes using Ideogram API
set -e

API_KEY="7EeSWl-Gj0s-1Zo7o2qwHXkaZijlYx_GnQzqYuuRTCTo2b39VbM5n_tmOPR7mSoco2aR4UHWxplgJgWU9PLQgw"
IMG_DIR="/Users/customer/clawd/Projects/protein-empire/data/images/cottagecheeserecipes-co"
mkdir -p "$IMG_DIR"

generate_image() {
  local slug="$1"
  local desc="$2"
  local outfile="$IMG_DIR/${slug}.png"
  
  if [ -f "$outfile" ] && [ -s "$outfile" ]; then
    echo "SKIP: $slug (already exists)"
    return 0
  fi
  
  echo "GENERATING: $slug"
  local prompt="Professional overhead food photography of ${desc}, on a white marble surface, bright natural soft lighting, clean modern food blog style, high resolution"
  
  local response
  response=$(curl -s --max-time 120 "https://api.ideogram.ai/v1/ideogram-v3/generate" \
    -H "Api-Key: ${API_KEY}" \
    -H "Content-Type: application/json" \
    -d "{\"prompt\": \"${prompt}\", \"rendering_speed\": \"TURBO\"}" 2>&1)
  
  local url
  url=$(echo "$response" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['data'][0]['url'])" 2>/dev/null)
  
  if [ -z "$url" ]; then
    echo "ERROR: Failed to get URL for $slug"
    echo "Response: $(echo "$response" | head -c 200)"
    return 1
  fi
  
  curl -s --max-time 60 -o "$outfile" "$url"
  
  if [ -f "$outfile" ] && [ -s "$outfile" ]; then
    local size=$(wc -c < "$outfile" | tr -d ' ')
    echo "OK: $slug (${size} bytes)"
  else
    echo "ERROR: Download failed for $slug"
    rm -f "$outfile"
    return 1
  fi
}

# Pancakes & Waffles
generate_image "classic-cottage-cheese-pancakes" "fluffy golden-brown cottage cheese pancakes stacked three high, topped with fresh blueberries and a drizzle of maple syrup, with a pat of butter melting on top"
generate_image "banana-cottage-cheese-pancakes" "golden banana cottage cheese pancakes stacked on a plate, topped with sliced bananas, chopped walnuts, and honey drizzle, fluffy and golden"
generate_image "flourless-cottage-cheese-pancakes" "thin golden flourless cottage cheese pancakes on a white plate, topped with fresh strawberries and powdered sugar dusting, minimal and clean"
generate_image "keto-cottage-cheese-pancakes" "thick fluffy keto cottage cheese pancakes made with almond flour, topped with whipped cream and fresh raspberries, low-carb breakfast"
generate_image "cottage-cheese-waffles" "golden crispy cottage cheese waffles on a plate with a waffle pattern, topped with fresh mixed berries and maple syrup, perfectly golden grid pattern"
generate_image "pumpkin-cottage-cheese-pancakes" "orange-tinted pumpkin cottage cheese pancakes stacked three high, topped with pecans and a cinnamon maple syrup drizzle, autumn breakfast vibes"
generate_image "oatmeal-cottage-cheese-pancakes" "hearty golden oatmeal cottage cheese pancakes on a white plate, topped with a spoonful of Greek yogurt and honey drizzle, wholesome breakfast"
generate_image "blueberry-cottage-cheese-protein-pancakes" "fluffy golden protein pancakes studded with fresh blueberries throughout, stacked on a plate with extra blueberries and maple syrup on top"

# Breakfast
generate_image "cottage-cheese-scrambled-eggs" "creamy fluffy scrambled eggs made with cottage cheese, served on a white plate with fresh chives sprinkled on top, soft curds visible"
generate_image "cottage-cheese-egg-muffins" "six golden cottage cheese egg muffins in a muffin tin, loaded with diced bell peppers, spinach, and cheese, perfectly puffed breakfast egg cups"
generate_image "cottage-cheese-breakfast-bowl" "colorful cottage cheese breakfast bowl topped with granola, sliced strawberries, blueberries, drizzle of honey, and chia seeds in a white bowl"
generate_image "cottage-cheese-french-toast" "golden crispy cottage cheese french toast slices on a white plate, dusted with powdered sugar, topped with fresh berries and maple syrup"
generate_image "cottage-cheese-smoothie-bowl" "thick creamy purple cottage cheese smoothie bowl topped with granola, sliced bananas, coconut flakes, and fresh berries, beautiful arrangement"

# Bread & Flatbread
generate_image "cottage-cheese-flatbread" "golden cottage cheese flatbread with beautiful charred spots, torn apart showing fluffy interior, herbs scattered around, on white marble"
generate_image "cottage-cheese-bread" "a golden loaf of cottage cheese bread sliced to show soft fluffy interior, on a wooden cutting board, fresh from the oven, rustic style"
generate_image "cottage-cheese-cinnamon-roll-bread" "swirled cinnamon roll bread made with cottage cheese, sliced to show the beautiful cinnamon swirl inside, topped with cream cheese glaze dripping down"
generate_image "cottage-cheese-garlic-knots" "golden baked cottage cheese garlic knots in a baking dish, brushed with garlic butter and sprinkled with fresh parsley and parmesan cheese"

# Desserts
generate_image "cottage-cheese-protein-brownies" "fudgy dark chocolate cottage cheese protein brownies cut into squares on parchment paper, rich and glossy top, chocolate chips scattered around"
generate_image "cottage-cheese-chocolate-chip-cookies" "golden brown cottage cheese chocolate chip cookies cooling on a wire rack, gooey melted chocolate chips visible, soft and chewy texture"
generate_image "cottage-cheese-blondies" "golden vanilla cottage cheese blondies cut into squares, with white chocolate chips and a chewy texture, on parchment paper"
generate_image "no-bake-cottage-cheese-cookies" "no-bake cottage cheese cookies with chocolate and oats, arranged on parchment paper, topped with coconut flakes, rustic homemade style"

# Cheesecake & Pudding
generate_image "cottage-cheese-protein-cheesecake" "creamy cottage cheese protein cheesecake with a golden graham cracker crust, topped with fresh strawberry sauce and whole strawberries, sliced to show creamy interior"
generate_image "no-bake-cottage-cheese-cheesecake" "no-bake cottage cheese cheesecake in a springform pan, topped with a glossy mixed berry compote, smooth creamy white filling visible"
generate_image "cottage-cheese-protein-pudding" "creamy chocolate cottage cheese protein pudding in a glass jar, topped with whipped cream and chocolate shavings, rich and decadent"
generate_image "cottage-cheese-banana-pudding" "layered cottage cheese banana pudding in a clear glass trifle dish, with layers of vanilla wafers, sliced bananas, and creamy pudding, topped with whipped cream"

# Pizza & Savory
generate_image "cottage-cheese-pizza-crust" "golden crispy cottage cheese pizza crust topped with fresh mozzarella, cherry tomatoes, and basil leaves, bubbly melted cheese, homemade pizza"
generate_image "cottage-cheese-pizza-bowl" "bubbly melted cheese cottage cheese pizza bowl with pepperoni and Italian seasoning in a white ramekin, bubbling hot from the oven"
generate_image "cottage-cheese-protein-pizza" "high-protein cottage cheese pizza with a crispy golden crust, topped with grilled chicken, spinach, red onions, and mozzarella cheese"

# Snacks
generate_image "cottage-cheese-protein-balls" "round cottage cheese protein balls coated in coconut and cocoa powder, arranged on parchment paper, some cut in half showing creamy center"
generate_image "cottage-cheese-muffins" "golden cottage cheese muffins cooling on a wire rack, tall domed tops, one broken open to show fluffy moist interior with visible cottage cheese texture"

echo ""
echo "=== IMAGE GENERATION COMPLETE ==="
echo "Total images: $(ls -1 "$IMG_DIR"/*.png 2>/dev/null | wc -l | tr -d ' ')"
