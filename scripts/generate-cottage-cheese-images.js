#!/usr/bin/env node

/**
 * Generate Ideogram images for all cottage cheese recipes
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const IMAGE_DIR = path.join(ROOT, 'data', 'images', 'cottagecheeserecipes-co');
const RECIPES_PATH = path.join(ROOT, 'data', 'recipes', 'cottagecheeserecipes-co', 'recipes.json');

const API_KEY = '7EeSWl-Gj0s-1Zo7o2qwHXkaZijlYx_GnQzqYuuRTCTo2b39VbM5n_tmOPR7mSoco2aR4UHWxplgJgWU9PLQgw';
const API_URL = 'https://api.ideogram.ai/v1/ideogram-v3/generate';

// Detailed prompts for each recipe
const imagePrompts = {
  'classic-cottage-cheese-pancakes': 'Professional overhead food photography of fluffy golden-brown cottage cheese pancakes stacked three high, topped with fresh blueberries and a drizzle of maple syrup, pat of butter melting on top, on a white marble surface, bright natural soft lighting, clean modern food blog style, ultra-high resolution',
  'banana-cottage-cheese-pancakes': 'Professional overhead food photography of golden banana cottage cheese pancakes stacked with sliced banana on top, drizzled with honey, scattered walnuts, on a white marble surface, bright natural soft lighting, clean modern food blog style, ultra-high resolution',
  'flourless-cottage-cheese-pancakes': 'Professional overhead food photography of thin, delicate flourless cottage cheese pancakes on a white plate, topped with fresh raspberries and a dusting of powdered sugar, lemon wedge on side, on a white marble surface, bright natural soft lighting, clean modern food blog style, ultra-high resolution',
  'keto-cottage-cheese-pancakes': 'Professional overhead food photography of thick fluffy keto cottage cheese pancakes stacked with butter melting on top, fresh strawberries on the side, sugar-free syrup drizzle, on a white marble surface, bright natural soft lighting, clean modern food blog style, ultra-high resolution',
  'cottage-cheese-waffles': 'Professional overhead food photography of crispy golden cottage cheese waffles with deep pockets, topped with fresh strawberries and whipped cream, maple syrup drizzling down the sides, on a white marble surface, bright natural soft lighting, clean modern food blog style, ultra-high resolution',
  'pumpkin-cottage-cheese-pancakes': 'Professional overhead food photography of golden-orange pumpkin cottage cheese pancakes stacked three high, topped with pecans and maple syrup, cinnamon sticks and small pumpkins as props, warm autumn setting, on a white marble surface, bright natural soft lighting, clean modern food blog style, ultra-high resolution',
  'oatmeal-cottage-cheese-pancakes': 'Professional overhead food photography of rustic oatmeal cottage cheese pancakes stacked with visible oat texture, topped with sliced banana and a drizzle of honey, cinnamon sprinkle, on a white marble surface, bright natural soft lighting, clean modern food blog style, ultra-high resolution',
  'blueberry-cottage-cheese-protein-pancakes': 'Professional overhead food photography of fluffy blueberry cottage cheese protein pancakes with visible blueberries baked in, stacked three high, topped with fresh blueberries and maple syrup, purple-blue tones, on a white marble surface, bright natural soft lighting, clean modern food blog style, ultra-high resolution',
  'cottage-cheese-scrambled-eggs': 'Professional overhead food photography of creamy cottage cheese scrambled eggs with large fluffy curds on a white plate, garnished with fresh chives and cracked black pepper, toast soldiers on the side, on a white marble surface, bright natural soft lighting, clean modern food blog style, ultra-high resolution',
  'cottage-cheese-egg-muffins': 'Professional overhead food photography of colorful cottage cheese egg muffins in a muffin tin, showing golden tops with visible bell pepper and spinach pieces, melted cheese on top, on a white marble surface, bright natural soft lighting, clean modern food blog style, ultra-high resolution',
  'cottage-cheese-breakfast-bowl': 'Professional overhead food photography of a cottage cheese breakfast bowl with fresh berries arranged beautifully on top, granola clusters, chia seeds, a drizzle of honey, almond butter swirl, in a white ceramic bowl, on a white marble surface, bright natural soft lighting, clean modern food blog style, ultra-high resolution',
  'cottage-cheese-french-toast': 'Professional overhead food photography of thick golden-brown cottage cheese french toast slices on a white plate, dusted with powdered sugar, fresh berries on top, maple syrup being drizzled, on a white marble surface, bright natural soft lighting, clean modern food blog style, ultra-high resolution',
  'cottage-cheese-smoothie-bowl': 'Professional overhead food photography of a thick purple-pink cottage cheese smoothie bowl topped with arranged fresh fruit, granola, coconut flakes, and chia seeds in a white ceramic bowl, vibrant colors, on a white marble surface, bright natural soft lighting, clean modern food blog style, ultra-high resolution',
  'cottage-cheese-flatbread': 'Professional overhead food photography of golden-brown cottage cheese flatbreads with charred spots stacked on a cutting board, one torn open showing soft interior, herbs and olive oil nearby, on a white marble surface, bright natural soft lighting, clean modern food blog style, ultra-high resolution',
  'cottage-cheese-bread': 'Professional overhead food photography of a beautiful golden cottage cheese bread loaf sliced on a wooden cutting board, showing soft tender crumb interior, one slice with butter spread, on a white marble surface, bright natural soft lighting, clean modern food blog style, ultra-high resolution',
  'cottage-cheese-cinnamon-roll-bread': 'Professional overhead food photography of cottage cheese cinnamon roll bread sliced showing beautiful cinnamon swirl pattern inside, white cream cheese glaze drizzled on top, on a white marble surface, bright natural soft lighting, clean modern food blog style, ultra-high resolution',
  'cottage-cheese-garlic-knots': 'Professional overhead food photography of golden cottage cheese garlic knots glistening with garlic butter and parsley, arranged on a white plate, parmesan cheese sprinkled on top, on a white marble surface, bright natural soft lighting, clean modern food blog style, ultra-high resolution',
  'cottage-cheese-protein-brownies': 'Professional overhead food photography of fudgy cottage cheese protein brownies cut into squares on parchment paper, showing dense moist interior, chocolate chips visible, dark chocolate drizzle on top, on a white marble surface, bright natural soft lighting, clean modern food blog style, ultra-high resolution',
  'cottage-cheese-chocolate-chip-cookies': 'Professional overhead food photography of soft and chewy cottage cheese chocolate chip cookies on a cooling rack, melted chocolate chips visible, golden brown edges, one cookie broken in half showing gooey interior, on a white marble surface, bright natural soft lighting, clean modern food blog style, ultra-high resolution',
  'cottage-cheese-blondies': 'Professional overhead food photography of golden cottage cheese blondies cut into squares, showing white chocolate chips and pecans, dense chewy texture visible, on parchment paper, on a white marble surface, bright natural soft lighting, clean modern food blog style, ultra-high resolution',
  'no-bake-cottage-cheese-cookies': 'Professional overhead food photography of no-bake cottage cheese cookies arranged on a white plate, chocolate and oat texture visible, some drizzled with chocolate, on a white marble surface, bright natural soft lighting, clean modern food blog style, ultra-high resolution',
  'cottage-cheese-protein-cheesecake': 'Professional overhead food photography of a whole cottage cheese protein cheesecake on a cake stand, smooth creamy top, fresh berries arranged on top, one slice cut and pulled away showing creamy interior and oat crust, on a white marble surface, bright natural soft lighting, clean modern food blog style, ultra-high resolution',
  'no-bake-cottage-cheese-cheesecake': 'Professional overhead food photography of a no-bake cottage cheese cheesecake with a graham cracker crust, light and fluffy filling, fresh strawberry sauce drizzled on top, one slice removed showing layers, on a white marble surface, bright natural soft lighting, clean modern food blog style, ultra-high resolution',
  'cottage-cheese-protein-pudding': 'Professional overhead food photography of thick creamy chocolate cottage cheese protein pudding in a glass jar, topped with chocolate shavings and fresh berries, spoon beside it, rich dark color, on a white marble surface, bright natural soft lighting, clean modern food blog style, ultra-high resolution',
  'cottage-cheese-banana-pudding': 'Professional overhead food photography of cottage cheese banana pudding layered in a glass trifle dish showing visible layers of cream, banana slices, and vanilla wafers, topped with whipped cream and wafer crumbs, on a white marble surface, bright natural soft lighting, clean modern food blog style, ultra-high resolution',
  'cottage-cheese-pizza-crust': 'Professional overhead food photography of a homemade cottage cheese pizza with crispy golden crust, topped with melted mozzarella, fresh tomato sauce, basil leaves, sliced on a wooden pizza board, on a white marble surface, bright natural soft lighting, clean modern food blog style, ultra-high resolution',
  'cottage-cheese-pizza-bowl': 'Professional overhead food photography of a bubbly golden cottage cheese pizza bowl in a white ceramic ramekin, melted mozzarella and pepperoni on top, fresh basil garnish, breadsticks for dipping on the side, on a white marble surface, bright natural soft lighting, clean modern food blog style, ultra-high resolution',
  'cottage-cheese-protein-pizza': 'Professional overhead food photography of a loaded cottage cheese protein pizza with grilled chicken, spinach, melted mozzarella, white sauce base, sliced on a cutting board, fresh basil on top, on a white marble surface, bright natural soft lighting, clean modern food blog style, ultra-high resolution',
  'cottage-cheese-protein-balls': 'Professional overhead food photography of cottage cheese protein balls rolled in coconut and arranged on a white plate, some cut in half showing interior with chocolate chips, scattered coconut flakes, on a white marble surface, bright natural soft lighting, clean modern food blog style, ultra-high resolution',
  'cottage-cheese-muffins': 'Professional overhead food photography of golden cottage cheese blueberry muffins in a muffin tin, tall domed tops with visible blueberries, one muffin broken open showing moist fluffy interior, on a white marble surface, bright natural soft lighting, clean modern food blog style, ultra-high resolution'
};

async function generateImage(slug, prompt) {
  const outputPath = path.join(IMAGE_DIR, `${slug}.png`);
  
  // Skip if already exists
  if (fs.existsSync(outputPath)) {
    console.log(`⏭️  Skipping ${slug} — already exists`);
    return true;
  }

  console.log(`🎨 Generating image for: ${slug}`);
  
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Api-Key': API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: prompt,
        rendering_speed: 'DEFAULT',
        aspect_ratio: '1x1'
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error(`❌ API error for ${slug}: ${response.status} — ${errText}`);
      return false;
    }

    const data = await response.json();
    
    if (!data.data || data.data.length === 0) {
      console.error(`❌ No images returned for ${slug}`);
      return false;
    }

    const imageUrl = data.data[0].url;
    console.log(`📥 Downloading image for ${slug}...`);
    
    const imgResponse = await fetch(imageUrl);
    if (!imgResponse.ok) {
      console.error(`❌ Failed to download image for ${slug}`);
      return false;
    }

    const buffer = Buffer.from(await imgResponse.arrayBuffer());
    fs.writeFileSync(outputPath, buffer);
    console.log(`✅ Saved ${slug}.png (${(buffer.length / 1024).toFixed(0)}KB)`);
    return true;
  } catch (err) {
    console.error(`❌ Error generating ${slug}: ${err.message}`);
    return false;
  }
}

async function main() {
  // Ensure output directory exists
  fs.mkdirSync(IMAGE_DIR, { recursive: true });
  
  const slugs = Object.keys(imagePrompts);
  console.log(`\n🖼️  Generating ${slugs.length} images for cottagecheeserecipes.co\n`);
  
  let success = 0;
  let failed = 0;
  
  for (const slug of slugs) {
    const result = await generateImage(slug, imagePrompts[slug]);
    if (result) success++;
    else failed++;
    
    // Small delay between requests to be nice to the API
    if (slug !== slugs[slugs.length - 1]) {
      await new Promise(r => setTimeout(r, 2000));
    }
  }
  
  console.log(`\n📊 Done! ${success} succeeded, ${failed} failed out of ${slugs.length} total.\n`);
}

main().catch(console.error);
