#!/usr/bin/env python3
"""
Replace emoji spans with image tags across all Protein Empire sites.
This script replaces emoji icons with high-quality generated images.
"""

import os
import re
import glob

# Mapping of emojis to their replacement image files
EMOJI_TO_IMAGE = {
    # Pack icons
    '🥣': 'mixing-bowl.png',      # No-Bake Starter / Oatmeal
    '🍫': 'chocolate-bar.png',    # Candy Bar Copycats / Brownies / Bars
    '🌱': 'plant-seedling.png',   # Vegan Collection
    '🥜': 'nut-free.png',         # Nut-Free Pack
    '💪': 'flexed-arm.png',       # High-Protein Pack
    '🗓️': 'calendar.png',         # Meal Prep Bars
    '📅': 'calendar.png',         # Meal Prep Bars (alternative)
    '🥬': 'leafy-greens.png',     # Gluten-Free & Dairy-Free
    
    # Also Includes section icons
    '🛒': 'shopping-cart.png',    # Shopping List
    '📊': 'nutrition-chart.png',  # Nutrition Facts
    '💡': 'lightbulb.png',        # Pro Tips
    
    # Site-specific product icons
    '🍪': 'cookies.png',          # Cookies
    '🥞': 'pancakes.png',         # Pancakes
    '🍩': 'donuts.png',           # Donuts
    '🍰': 'cheesecake.png',       # Cheesecake
    '🍕': 'pizza.png',            # Pizza
    '🍮': 'pudding.png',          # Pudding
    '🍞': 'bread.png',            # Bread
    '🥯': 'bagel.png',            # Bagel
    '🔵': 'protein-bites.png',    # Protein Bites
    
    # Additional pack icons
    '🍌': 'banana.png',           # Banana Bread Pack
    '🌿': 'herb.png',             # Savory/Herb packs
    '✨': 'sparkle.png',          # Special/Premium packs
    '🥪': 'sandwich.png',         # Sandwich Bread Pack
    '🍓': 'berry.png',            # Berry packs
    '🎄': 'christmas-tree.png',   # Seasonal/Holiday packs
    '🥗': 'salad.png',            # Healthy/Salad related
    '🧁': 'muffin.png',           # Muffin
    
    # Success page icons
    '⏳': 'calendar.png',         # Loading/waiting
    '✅': 'sparkle.png',          # Success/checkmark
    '🔒': 'sparkle.png',          # Secure/lock
    '🟤': 'protein-bites.png',    # Brown circle (bites)
    '🟫': 'brownies.png',         # Brown square (brownies)
    
    # Additional emojis found
    '👶': 'baby.png',             # Baby/kids
    '📚': 'book.png',             # Books/recipes
    '🌾': 'wheat.png',            # Wheat/grains
    '⚡': 'lightning.png',        # Lightning/energy
    '⚡️': 'lightning.png',        # Lightning with variant
    '🎉': 'party.png',            # Party/celebration
    '🎨': 'palette.png',          # Art/creative
    '🍳': 'frying-pan.png',       # Cooking/frying pan
    '⏱️': 'timer.png',            # Timer/stopwatch
    '👱‍♀️': 'blondie.png',         # Blonde woman/blondie
    '❤️': 'heart.png',            # Heart/love
    '🏃‍♀️': 'runner.png',          # Runner woman
    '🏃': 'runner.png',           # Runner
    '☕️': 'coffee.png',           # Coffee
    '🍦': 'ice-cream.png',        # Ice cream
    '🍂': 'autumn-leaf.png',      # Autumn leaf
    '❄️': 'snowflake.png',        # Snowflake
    '🧃': 'ice-cube.png',         # Juice box
    '🧴': 'ice-cube.png',         # Lotion bottle
    '🧊': 'ice-cube.png',         # Ice cube
    '🧇': 'waffle.png',           # Waffle
    '🥦': 'broccoli.png',         # Broccoli
    '🥑': 'avocado.png',          # Avocado
    '🔥': 'fire.png',             # Fire/hot
    '💨': 'wind.png',             # Wind/quick
    '🎒': 'backpack.png',         # Backpack/on-the-go
    '🇫🇷': 'france.png',           # French flag
    '☁️': 'cloud.png',            # Cloud/mousse
    '🤫': 'secret.png',           # Shushing/secret
    '🧑': 'baby.png',             # Person/generic
    '🗓️': 'calendar.png',        # Calendar with variant
}

# Pattern to match emoji spans with various text sizes
# Matches: <span class="text-Xxl mb-X block">EMOJI</span>
EMOJI_SPAN_PATTERN = re.compile(
    r'<span class="text-(\d+)xl(\s+mb-\d+)?\s+block">([^<]+)</span>',
    re.UNICODE
)

# Pattern for inline emojis in navigation/footer
INLINE_EMOJI_PATTERN = re.compile(
    r'<span>([\U0001F300-\U0001F9FF\U00002600-\U000027BF\U0001FA00-\U0001FAFF]+)</span>',
    re.UNICODE
)

def get_image_size(text_size):
    """Convert Tailwind text size to pixel dimensions."""
    size_map = {
        '2': 32,
        '3': 48,
        '4': 64,
        '5': 80,
        '6': 96,
        '9': 144,
    }
    return size_map.get(text_size, 64)

def replace_emoji_span(match):
    """Replace emoji span with image tag."""
    text_size = match.group(1)
    margin = match.group(2) or ''
    emoji = match.group(3).strip()
    
    # Get the image file for this emoji
    image_file = EMOJI_TO_IMAGE.get(emoji)
    if not image_file:
        # Try to find a partial match for compound emojis
        for key, value in EMOJI_TO_IMAGE.items():
            if key in emoji or emoji in key:
                image_file = value
                break
    
    if not image_file:
        # Keep original if no mapping found
        return match.group(0)
    
    size = get_image_size(text_size)
    margin_class = margin.strip() if margin else 'mb-4'
    
    # Return image tag with appropriate styling
    return f'<img src="/images/icons/{image_file}" alt="" class="w-{size//4} h-{size//4} {margin_class} block mx-auto object-contain" style="width: {size}px; height: {size}px;">'

def replace_inline_emoji(match):
    """Replace inline emoji with smaller image."""
    emoji = match.group(1)
    image_file = EMOJI_TO_IMAGE.get(emoji)
    if not image_file:
        return match.group(0)
    return f'<img src="/images/icons/{image_file}" alt="" class="w-6 h-6 inline-block" style="width: 24px; height: 24px;">'

def process_file(filepath):
    """Process a single HTML file and replace emojis."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # Replace emoji spans
        content = EMOJI_SPAN_PATTERN.sub(replace_emoji_span, content)
        
        # Replace inline emojis in navigation/footer
        content = INLINE_EMOJI_PATTERN.sub(replace_inline_emoji, content)
        
        # Only write if changes were made
        if content != original_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            return True
        return False
    except Exception as e:
        print(f"Error processing {filepath}: {e}")
        return False

def main():
    """Main function to process all HTML files."""
    base_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    apps_path = os.path.join(base_path, 'apps')
    
    # Find all HTML files in dist folders
    html_files = glob.glob(os.path.join(apps_path, '*/dist/*.html'))
    
    modified_count = 0
    total_count = len(html_files)
    
    print(f"Processing {total_count} HTML files...")
    
    for filepath in html_files:
        if process_file(filepath):
            modified_count += 1
            print(f"✓ Modified: {os.path.relpath(filepath, base_path)}")
    
    print(f"\nComplete! Modified {modified_count} of {total_count} files.")

if __name__ == '__main__':
    main()
