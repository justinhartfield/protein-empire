#!/usr/bin/env node

/**
 * Generate Ideogram images for all protein brownie recipes
 * Deletes existing images and regenerates everything fresh.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const IMAGE_DIR = path.join(ROOT, 'data', 'images', 'proteinbrownies-co');

const API_KEY = '7EeSWl-Gj0s-1Zo7o2qwHXkaZijlYx_GnQzqYuuRTCTo2b39VbM5n_tmOPR7mSoco2aR4UHWxplgJgWU9PLQgw';
const API_URL = 'https://api.ideogram.ai/v1/ideogram-v3/generate';

const STYLE_SUFFIX = 'Professional overhead food photography, cut into squares on parchment paper on a white marble surface, bright natural soft lighting, clean modern food blog style, ultra-high resolution';

// Unique, specific prompts for each brownie recipe
const imagePrompts = {
  'classic-protein-brownies-recipe': `Classic homemade chocolate protein brownies with a rich cocoa color, crinkly shiny top, cut into perfect squares showing dense moist interior, scattered chocolate chips on top. ${STYLE_SUFFIX}`,

  'high-protein-brownies': `Thick dense high-protein brownies with a slightly grainy protein-rich texture visible on the cut edges, extra thick slices, a scoop of whey protein powder beside them for context. ${STYLE_SUFFIX}`,

  'protein-powder-brownies': `Lighter-colored brownies made with vanilla protein powder giving them a slightly tan-brown hue instead of deep dark chocolate, showing a cakey crumb texture on the cut sides. ${STYLE_SUFFIX}`,

  'cottage-cheese-protein-brownies': `Chocolate protein brownies with a creamy white cottage cheese swirl marbled through the top, showing the contrast between dark brownie and white creamy swirl. ${STYLE_SUFFIX}`,

  'healthy-protein-brownies': `Clean and wholesome-looking protein brownies topped with a generous sprinkle of mixed nuts, pumpkin seeds, sunflower seeds, and hemp hearts, lighter brown color. ${STYLE_SUFFIX}`,

  'whey-protein-brownies-recipe': `Extra thick and fudgy whey protein brownies with a dense, rich chocolate color, glossy crackly top, cut to reveal an intensely moist and fudgy interior. ${STYLE_SUFFIX}`,

  'sweet-potato-protein-brownies': `Orange-tinted protein brownies made with sweet potato, showing a distinct warm orange-brown color with visible orange sweet potato swirl through the batter, topped with a light cinnamon dusting. ${STYLE_SUFFIX}`,

  'chocolate-protein-brownies': `Intensely dark double chocolate protein brownies, near-black in color from extra cocoa, topped with dark chocolate chunks and cocoa powder dusting, deeply chocolatey appearance. ${STYLE_SUFFIX}`,

  'black-bean-protein-brownies': `Very dark, almost black dense protein brownies made with black beans, showing an ultra-dense and moist interior when cut, subtle bean texture visible, topped with sea salt flakes. ${STYLE_SUFFIX}`,

  'banana-protein-brownies': `Golden-brown banana protein brownies with thin banana slices arranged on top that have caramelized during baking, showing a lighter golden-brown color from the banana. ${STYLE_SUFFIX}`,

  'vegan-protein-brownies': `Plant-based vegan protein brownies studded with visible walnut pieces and dark chocolate chunks on top, showing a wholesome rustic texture, no dairy visible. ${STYLE_SUFFIX}`,

  'fudgy-protein-brownies': `Ultra-fudgy gooey protein brownies with a shiny wet-looking crackle top, one square tilted to show the extremely gooey, undercooked-looking fudgy center that is almost molten. ${STYLE_SUFFIX}`,

  'pumpkin-protein-brownies': `Autumn-inspired orange pumpkin protein brownies with a warm orange-brown color, topped with green pumpkin seeds (pepitas), with a small decorative pumpkin and cinnamon sticks as props. ${STYLE_SUFFIX}`,

  'low-calorie-protein-brownies': `Thin, delicate, light portion-controlled protein brownie squares, noticeably thinner than regular brownies, arranged in a neat grid, calorie-conscious small portions. ${STYLE_SUFFIX}`,

  'protein-blondies': `Golden blonde-colored protein blondies (NOT chocolate), showing a warm buttery golden color with white chocolate chips studded throughout and on top, vanilla bean specks visible. ${STYLE_SUFFIX}`,

  'no-bake-protein-brownie-bars': `Layered no-bake protein brownie bars showing distinct layers — a dark chocolate base layer, a lighter protein middle layer, and a glossy chocolate ganache top layer, unbaked smooth texture. ${STYLE_SUFFIX}`,

  'single-serving-protein-brownie': `A single individual protein brownie baked in a small white ceramic ramekin, topped with a scoop of vanilla ice cream and chocolate sauce drizzle, spoon resting beside it. ${STYLE_SUFFIX}`,

  'keto-protein-brownies': `Rich keto protein brownies with visible almond flour texture, topped with coconut flakes and sliced almonds, showing a slightly lighter grain from almond flour, sugar-free chocolate drizzle. ${STYLE_SUFFIX}`,

  'greek-yogurt-protein-brownies': `Creamy protein brownies with a beautiful white Greek yogurt swirl marbled on top in an artistic pattern, creating a striking dark and white contrast, creamy and moist appearance. ${STYLE_SUFFIX}`,

  'avocado-protein-brownies': `Distinctly green-tinted protein brownies made with avocado, showing a unique deep green-brown color, cut to reveal the green-tinged interior, half an avocado placed beside them as prop. ${STYLE_SUFFIX}`,

  'zucchini-protein-brownies': `Moist protein brownies with visible tiny green zucchini shreds and specks throughout the chocolate batter, showing green flecks on the cut edges, grated zucchini as prop beside them. ${STYLE_SUFFIX}`,

  'peanut-butter-protein-brownies': `Dark chocolate protein brownies with a dramatic golden peanut butter swirl on top, chopped roasted peanuts scattered over, showing the contrast between dark chocolate and tan peanut butter. ${STYLE_SUFFIX}`,

  'mint-chocolate-protein-brownies': `Dark chocolate protein brownies topped with a bright green mint frosting layer and dark chocolate drizzle on top of the green, fresh mint leaves as garnish, holiday-inspired look. ${STYLE_SUFFIX}`,

  'raspberry-swirl-protein-brownies': `Dark chocolate protein brownies with vibrant red-pink raspberry puree swirled artistically on top, fresh whole raspberries placed on the corners, showing the striking red and dark contrast. ${STYLE_SUFFIX}`,

  'espresso-protein-brownies': `Deep dark coffee-colored espresso protein brownies with whole roasted coffee beans arranged as garnish on top, a light espresso glaze, mocha-dark color showing coffee infusion. ${STYLE_SUFFIX}`,

  'gluten-free-black-bean-protein-brownies': `Rustic-looking gluten-free black bean protein brownies with a crackly uneven top, dense dark color, cut into rough squares with an artisan homemade appearance, dusted with cocoa powder. ${STYLE_SUFFIX}`,

  'dairy-free-avocado-protein-brownies': `Green-tinted dairy-free avocado protein brownies with a dollop of white coconut cream on each square, coconut shavings sprinkled on top, showing the green color from avocado and creamy white coconut contrast. ${STYLE_SUFFIX}`
};

async function generateImage(slug, prompt) {
  const outputPath = path.join(IMAGE_DIR, `${slug}.png`);

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
  // Delete existing images directory and recreate fresh
  if (fs.existsSync(IMAGE_DIR)) {
    console.log(`🗑️  Deleting existing images in ${IMAGE_DIR}`);
    fs.rmSync(IMAGE_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(IMAGE_DIR, { recursive: true });
  
  const slugs = Object.keys(imagePrompts);
  console.log(`\n🖼️  Generating ${slugs.length} images for proteinbrownies.co\n`);
  
  let success = 0;
  let failed = 0;
  
  for (const slug of slugs) {
    const result = await generateImage(slug, imagePrompts[slug]);
    if (result) success++;
    else failed++;
    
    // 3-second delay between requests to avoid rate limiting
    if (slug !== slugs[slugs.length - 1]) {
      console.log('⏳ Waiting 3 seconds...');
      await new Promise(r => setTimeout(r, 3000));
    }
  }
  
  console.log(`\n📊 Done! ${success} succeeded, ${failed} failed out of ${slugs.length} total.\n`);
}

main().catch(console.error);
