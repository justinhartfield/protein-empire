/**
 * Browser Bundle for the Protein Empire Ingredients System
 * 
 * This file is designed to be included directly in HTML pages via a <script> tag.
 * It exposes INGREDIENTS, SUBSTITUTION_GROUPS, and recipeSubstitution on the window object.
 */

const INGREDIENTS={"oat-flour":{"name":"Oat Flour (Blended)","category":"dry","role":"structure","macrosPer100g":{"calories":404,"protein":14,"carbs":66,"fat":9,"fiber":7},"hydrationFactor":1,"substitutes":["king-arthur-gf-mix","almond-flour","coconut-flour","whole-wheat-flour"],"notes":"Made by blending rolled oats. GF if certified GF oats used."},"king-arthur-gf-mix":{"name":"King Arthur GF Measure-for-Measure","category":"dry","role":"structure","macrosPer100g":{"calories":355,"protein":3,"carbs":80,"fat":1,"fiber":3},"hydrationFactor":1.15,"substitutes":["oat-flour","almond-flour","bobs-gf-1to1"],"notes":"GF blend with xanthan gum. Needs 15% more liquid.","swapNote":"+15% liquid · GF"},"bobs-gf-1to1":{"name":"Bob's Red Mill GF 1-to-1","category":"dry","role":"structure","macrosPer100g":{"calories":350,"protein":4,"carbs":78,"fat":1,"fiber":4},"hydrationFactor":1.12,"substitutes":["oat-flour","king-arthur-gf-mix"],"notes":"GF blend. Needs ~12% more liquid.","swapNote":"+12% liquid · GF"},"almond-flour":{"name":"Almond Flour (Blanched)","category":"dry","role":"structure","macrosPer100g":{"calories":579,"protein":21,"carbs":22,"fat":50,"fiber":10},"hydrationFactor":0.8,"substitutes":["oat-flour","coconut-flour"],"notes":"High fat, needs less liquid. Denser texture.","swapNote":"-20% liquid · +fat · GF"},"coconut-flour":{"name":"Coconut Flour","category":"dry","role":"structure","macrosPer100g":{"calories":443,"protein":19,"carbs":60,"fat":12,"fiber":39},"hydrationFactor":1.6,"amountRatio":0.25,"substitutes":["oat-flour","almond-flour"],"notes":"EXTREMELY absorbent. Use 1/4 amount + add 60% more liquid.","swapNote":"⚠️ Use 1/4 amount · +60% liquid · GF","isSpecialSwap":true},"whole-wheat-flour":{"name":"Whole Wheat Flour","category":"dry","role":"structure","macrosPer100g":{"calories":340,"protein":13,"carbs":72,"fat":2,"fiber":11},"hydrationFactor":1.05,"substitutes":["oat-flour"],"notes":"Traditional flour option.","swapNote":"+5% liquid"},"kodiak-pancake-mix":{"name":"Kodiak Protein Pancake Mix","category":"dry","role":"structure","macrosPer100g":{"calories":433,"protein":33,"carbs":73,"fat":3,"fiber":7},"hydrationFactor":1,"substitutes":["birch-benders-mix","oat-flour"],"notes":"Pre-mixed pancake mix with protein. Great for pancakes and waffles.","swapNote":"33g protein/100g"},"birch-benders-mix":{"name":"Birch Benders Protein Pancake Mix","category":"dry","role":"structure","macrosPer100g":{"calories":400,"protein":30,"carbs":67,"fat":4,"fiber":10},"hydrationFactor":1,"substitutes":["kodiak-pancake-mix","oat-flour"],"notes":"Alternative protein pancake mix.","swapNote":"30g protein/100g"},"whey-vanilla":{"name":"Vanilla Whey Protein","category":"dry","role":"protein","macrosPer100g":{"calories":400,"protein":80,"carbs":7,"fat":5,"fiber":0},"hydrationFactor":1,"substitutes":["whey-chocolate","casein-vanilla","pea-protein","egg-white-powder"],"notes":"Fast-absorbing whey isolate/concentrate."},"whey-chocolate":{"name":"Chocolate Whey Protein","category":"dry","role":"protein","macrosPer100g":{"calories":405,"protein":78,"carbs":9,"fat":5,"fiber":1},"hydrationFactor":1,"substitutes":["whey-vanilla","casein-vanilla","pea-protein"],"notes":"Chocolate flavored whey."},"casein-vanilla":{"name":"Vanilla Casein Protein","category":"dry","role":"protein","macrosPer100g":{"calories":370,"protein":80,"carbs":4,"fat":2,"fiber":0},"hydrationFactor":1.1,"substitutes":["whey-vanilla","pea-protein"],"notes":"Slow-digesting. Thicker batter, needs more liquid.","swapNote":"+10% liquid"},"pea-protein":{"name":"Pea Protein Isolate","category":"dry","role":"protein","macrosPer100g":{"calories":375,"protein":80,"carbs":6,"fat":2,"fiber":1},"hydrationFactor":1.15,"substitutes":["whey-vanilla","casein-vanilla","hemp-protein"],"notes":"Plant-based. Absorbs significant liquid.","swapNote":"+15% liquid · Vegan"},"hemp-protein":{"name":"Hemp Protein Powder","category":"dry","role":"protein","macrosPer100g":{"calories":338,"protein":50,"carbs":20,"fat":10,"fiber":18},"hydrationFactor":1.1,"substitutes":["pea-protein"],"notes":"Lower protein concentration, earthy flavor.","swapNote":"+10% liquid · -30 protein · Vegan"},"egg-white-powder":{"name":"Egg White Protein Powder","category":"dry","role":"protein","macrosPer100g":{"calories":382,"protein":82,"carbs":4,"fat":0,"fiber":0},"hydrationFactor":1.2,"substitutes":["whey-vanilla"],"notes":"Very absorbent, fluffy texture.","swapNote":"+20% liquid"},"greek-yogurt-nonfat":{"name":"Non-Fat Greek Yogurt","category":"wet","role":"moisture","macrosPer100g":{"calories":59,"protein":10,"carbs":4,"fat":0.7,"fiber":0},"hydrationFactor":1,"substitutes":["greek-yogurt-2pct","cottage-cheese-blended","skyr","sour-cream-light","coconut-almond-yogurt","yogurt-none"],"notes":"High protein, tangy flavor, keeps baked goods moist."},"greek-yogurt-2pct":{"name":"2% Greek Yogurt","category":"wet","role":"moisture","macrosPer100g":{"calories":73,"protein":10,"carbs":4,"fat":2,"fiber":0},"hydrationFactor":1,"substitutes":["greek-yogurt-nonfat","cottage-cheese-blended"],"notes":"Slightly richer than nonfat.","swapNote":"+1g fat"},"cottage-cheese-blended":{"name":"Cottage Cheese (Blended)","category":"wet","role":"moisture","macrosPer100g":{"calories":98,"protein":11,"carbs":3,"fat":4,"fiber":0},"hydrationFactor":0.95,"substitutes":["greek-yogurt-nonfat","ricotta-part-skim"],"notes":"Higher protein and sodium. Blend until smooth.","swapNote":"+protein · +sodium · -5% liquid"},"ricotta-part-skim":{"name":"Part-Skim Ricotta","category":"wet","role":"moisture","macrosPer100g":{"calories":138,"protein":11,"carbs":5,"fat":8,"fiber":0},"hydrationFactor":0.9,"substitutes":["cottage-cheese-blended"],"notes":"Creamy texture, needs less liquid.","swapNote":"+fat · -10% liquid"},"skyr":{"name":"Skyr (Icelandic Yogurt)","category":"wet","role":"moisture","macrosPer100g":{"calories":63,"protein":11,"carbs":4,"fat":0.2,"fiber":0},"hydrationFactor":1,"substitutes":["greek-yogurt-nonfat"],"notes":"Similar to Greek yogurt, slightly thicker.","swapNote":"+1g protein"},"sour-cream-light":{"name":"Light Sour Cream","category":"wet","role":"moisture","macrosPer100g":{"calories":136,"protein":3,"carbs":5,"fat":12,"fiber":0},"hydrationFactor":0.95,"substitutes":["greek-yogurt-nonfat"],"notes":"Richer, less protein.","swapNote":"+fat · -protein"},"coconut-almond-yogurt":{"name":"Coconut/Almond Yogurt (Vegan)","category":"wet","role":"moisture","macrosPer100g":{"calories":80,"protein":1,"carbs":6,"fat":5,"fiber":0},"hydrationFactor":1,"substitutes":["greek-yogurt-nonfat","yogurt-none"],"notes":"Dairy-free alternative. Use unsweetened varieties.","swapNote":"-9g protein · Vegan"},"yogurt-none":{"name":"None (Omit Yogurt)","category":"wet","role":"moisture","macrosPer100g":{"calories":0,"protein":0,"carbs":0,"fat":0,"fiber":0},"hydrationFactor":0,"amountRatio":0,"substitutes":["coconut-almond-yogurt","greek-yogurt-nonfat"],"notes":"Omit yogurt entirely. MUST add compensation moisture.","swapNote":"⚠️ Add 100g silken tofu OR 75g extra banana/applesauce","isSpecialSwap":true},"egg-whites-liquid":{"name":"Liquid Egg Whites","category":"wet","role":"binder","macrosPer100g":{"calories":52,"protein":11,"carbs":0.7,"fat":0.2,"fiber":0},"hydrationFactor":1,"substitutes":["whole-eggs","flax-egg","chia-egg","aquafaba"],"notes":"Pure protein, no fat. 3 tbsp = 1 egg white."},"whole-eggs":{"name":"Whole Eggs","category":"wet","role":"binder","macrosPer100g":{"calories":155,"protein":13,"carbs":1,"fat":11,"fiber":0},"hydrationFactor":0.9,"substitutes":["egg-whites-liquid"],"notes":"Adds richness and fat. 1 large egg = ~50g.","swapNote":"+10g fat · +90 cal · -10% liquid"},"flax-egg":{"name":"Flax Egg","category":"wet","role":"binder","macrosPer100g":{"calories":55,"protein":2,"carbs":3,"fat":4,"fiber":3},"hydrationFactor":1.1,"substitutes":["chia-egg","egg-whites-liquid"],"notes":"1 tbsp ground flax + 3 tbsp water = 1 egg. Let sit 5 min.","swapNote":"+10% liquid · Vegan"},"chia-egg":{"name":"Chia Egg","category":"wet","role":"binder","macrosPer100g":{"calories":49,"protein":2,"carbs":4,"fat":3,"fiber":4},"hydrationFactor":1.1,"substitutes":["flax-egg"],"notes":"1 tbsp chia seeds + 3 tbsp water = 1 egg. Let sit 5 min.","swapNote":"+10% liquid · Vegan"},"aquafaba":{"name":"Aquafaba (Chickpea Water)","category":"wet","role":"binder","macrosPer100g":{"calories":10,"protein":0.5,"carbs":2,"fat":0,"fiber":0},"hydrationFactor":1.15,"substitutes":["flax-egg","egg-whites-liquid"],"notes":"3 tbsp = 1 egg white. Low protein.","swapNote":"+15% liquid · -protein · Vegan"},"banana-mashed":{"name":"Overripe Bananas (Mashed)","category":"wet","role":"sweetener","macrosPer100g":{"calories":89,"protein":1.1,"carbs":23,"fat":0.3,"fiber":2.6},"hydrationFactor":1,"substitutes":["pumpkin-puree","applesauce-unsweetened","sweet-potato-mashed"],"notes":"Natural sweetener. Use very ripe bananas."},"pumpkin-puree":{"name":"Pumpkin Puree (Canned)","category":"wet","role":"moisture","macrosPer100g":{"calories":34,"protein":1,"carbs":8,"fat":0.1,"fiber":3},"hydrationFactor":1.1,"substitutes":["banana-mashed","applesauce-unsweetened","butternut-squash-mashed"],"notes":"Less sweet, lower calorie. Add extra sweetener if needed.","swapNote":"+10% liquid · -55 cal"},"applesauce-unsweetened":{"name":"Unsweetened Applesauce","category":"wet","role":"moisture","macrosPer100g":{"calories":42,"protein":0.2,"carbs":11,"fat":0.1,"fiber":1},"hydrationFactor":1.05,"substitutes":["banana-mashed","pumpkin-puree"],"notes":"Neutral flavor, slightly more liquid.","swapNote":"+5% liquid · -47 cal"},"sweet-potato-mashed":{"name":"Mashed Sweet Potato","category":"wet","role":"moisture","macrosPer100g":{"calories":86,"protein":1.6,"carbs":20,"fat":0.1,"fiber":3},"hydrationFactor":1.05,"substitutes":["banana-mashed","pumpkin-puree"],"notes":"Natural sweetness and fiber.","swapNote":"+5% liquid"},"butternut-squash-mashed":{"name":"Butternut Squash Puree","category":"wet","role":"moisture","macrosPer100g":{"calories":45,"protein":1,"carbs":12,"fat":0.1,"fiber":2},"hydrationFactor":1.08,"substitutes":["pumpkin-puree"],"notes":"Similar to pumpkin, slightly sweeter.","swapNote":"+8% liquid"},"zucchini-grated":{"name":"Zucchini (Grated, Squeezed)","category":"wet","role":"moisture","macrosPer100g":{"calories":17,"protein":1.2,"carbs":3,"fat":0.3,"fiber":1},"hydrationFactor":1.2,"substitutes":["carrot-grated","applesauce-unsweetened"],"notes":"MUST squeeze out excess moisture before using.","swapNote":"+20% liquid · very low cal"},"carrot-grated":{"name":"Carrots (Grated)","category":"wet","role":"moisture","macrosPer100g":{"calories":41,"protein":0.9,"carbs":10,"fat":0.2,"fiber":2.8},"hydrationFactor":0.95,"substitutes":["zucchini-grated"],"notes":"Natural sweetness, holds moisture well.","swapNote":"-5% liquid"},"peanut-butter":{"name":"Natural Peanut Butter","category":"wet","role":"binder","macrosPer100g":{"calories":588,"protein":25,"carbs":20,"fat":50,"fiber":6},"hydrationFactor":0.8,"substitutes":["almond-butter","sunflower-seed-butter","cashew-butter"],"notes":"Acts as a binder in no-bake recipes. Use natural, drippy style."},"almond-butter":{"name":"Almond Butter","category":"wet","role":"binder","macrosPer100g":{"calories":614,"protein":21,"carbs":19,"fat":56,"fiber":10},"hydrationFactor":0.8,"substitutes":["peanut-butter","cashew-butter"],"notes":"Slightly sweeter than peanut butter.","swapNote":"-4g protein"},"sunflower-seed-butter":{"name":"Sunflower Seed Butter","category":"wet","role":"binder","macrosPer100g":{"calories":617,"protein":17,"carbs":24,"fat":55,"fiber":4},"hydrationFactor":0.8,"substitutes":["peanut-butter"],"notes":"Nut-free alternative. May turn green when baked (harmless).","swapNote":"Nut-free · -8g protein"},"cashew-butter":{"name":"Cashew Butter","category":"wet","role":"binder","macrosPer100g":{"calories":587,"protein":18,"carbs":28,"fat":49,"fiber":2},"hydrationFactor":0.85,"substitutes":["peanut-butter","almond-butter"],"notes":"Creamiest nut butter. Slightly sweeter.","swapNote":"-7g protein"},"medjool-dates":{"name":"Medjool Dates (Pitted)","category":"wet","role":"sweetener","macrosPer100g":{"calories":277,"protein":1.8,"carbs":75,"fat":0.2,"fiber":7},"hydrationFactor":0.9,"substitutes":["honey","maple-syrup"],"notes":"Natural sweetener and binder for no-bake recipes. Soak if dry.","swapNote":"Whole food sweetener"},"rolled-oats":{"name":"Rolled Oats","category":"dry","role":"structure","macrosPer100g":{"calories":379,"protein":13,"carbs":67,"fat":7,"fiber":10},"hydrationFactor":1,"substitutes":["quick-oats"],"notes":"Base for many bar and bite recipes. GF if certified."},"quick-oats":{"name":"Quick Oats","category":"dry","role":"structure","macrosPer100g":{"calories":379,"protein":13,"carbs":67,"fat":7,"fiber":10},"hydrationFactor":1.05,"substitutes":["rolled-oats"],"notes":"Finer texture than rolled oats. Better for smoother bars.","swapNote":"+5% liquid"},"baking-powder":{"name":"Baking Powder","category":"dry","role":"leavening","macrosPer100g":{"calories":53,"protein":0,"carbs":28,"fat":0,"fiber":0},"hydrationFactor":1,"substitutes":[],"notes":"Double-acting. Check freshness.","isFixed":true},"baking-soda":{"name":"Baking Soda","category":"dry","role":"leavening","macrosPer100g":{"calories":0,"protein":0,"carbs":0,"fat":0,"fiber":0},"hydrationFactor":1,"substitutes":[],"notes":"Requires acid to activate.","isFixed":true},"chocolate-chips":{"name":"Chocolate Chips","category":"dry","role":"add-in","macrosPer100g":{"calories":500,"protein":5,"carbs":60,"fat":29,"fiber":5},"hydrationFactor":1,"substitutes":[],"notes":"Optional add-in.","isFixed":true},"blueberries-fresh":{"name":"Fresh Blueberries","category":"wet","role":"add-in","macrosPer100g":{"calories":57,"protein":0.7,"carbs":14,"fat":0.3,"fiber":2.4},"hydrationFactor":1,"substitutes":[],"notes":"Fresh or frozen (thawed).","isFixed":true},"walnuts-chopped":{"name":"Walnuts (Chopped)","category":"dry","role":"add-in","macrosPer100g":{"calories":654,"protein":15,"carbs":14,"fat":65,"fiber":7},"hydrationFactor":1,"substitutes":[],"notes":"Optional add-in.","isFixed":true},"cocoa-powder":{"name":"Cocoa Powder (Unsweetened)","category":"dry","role":"flavor","macrosPer100g":{"calories":228,"protein":20,"carbs":58,"fat":14,"fiber":33},"hydrationFactor":1.15,"substitutes":[],"notes":"Absorbs liquid. Add extra moisture when using.","isFixed":true,"swapNote":"+15% liquid"},"lemon-zest":{"name":"Fresh Lemon Zest","category":"dry","role":"flavor","macrosPer100g":{"calories":47,"protein":1.5,"carbs":16,"fat":0.3,"fiber":10.6},"hydrationFactor":1,"substitutes":[],"notes":"Use microplane for best results. About 1 lemon = 1 tbsp zest.","isFixed":true},"apple-diced":{"name":"Fresh Apple (Diced)","category":"wet","role":"add-in","macrosPer100g":{"calories":52,"protein":0.3,"carbs":14,"fat":0.2,"fiber":2.4},"hydrationFactor":1,"substitutes":[],"notes":"Peeled and diced. Granny Smith or Honeycrisp work well.","isFixed":true},"cinnamon":{"name":"Ground Cinnamon","category":"dry","role":"flavor","macrosPer100g":{"calories":247,"protein":4,"carbs":81,"fat":1.2,"fiber":53},"hydrationFactor":1,"substitutes":[],"notes":"Warm spice that pairs well with apple, banana, and pumpkin.","isFixed":true},"vanilla-extract":{"name":"Pure Vanilla Extract","category":"wet","role":"flavor","macrosPer100g":{"calories":288,"protein":0.1,"carbs":13,"fat":0.1,"fiber":0},"hydrationFactor":1,"substitutes":[],"notes":"Use pure extract, not imitation. 1 tsp per batch.","isFixed":true},"pumpkin-pie-spice":{"name":"Pumpkin Pie Spice","category":"dry","role":"flavor","macrosPer100g":{"calories":342,"protein":6,"carbs":70,"fat":8,"fiber":15},"hydrationFactor":1,"substitutes":[],"notes":"Blend of cinnamon, nutmeg, ginger, allspice, and cloves.","isFixed":true},"honey":{"name":"Honey","category":"wet","role":"sweetener","macrosPer100g":{"calories":304,"protein":0.3,"carbs":82,"fat":0,"fiber":0},"hydrationFactor":0.9,"substitutes":["maple-syrup","agave-nectar"],"notes":"Natural sweetener. Not vegan.","swapNote":"-10% liquid"},"maple-syrup":{"name":"Pure Maple Syrup","category":"wet","role":"sweetener","macrosPer100g":{"calories":260,"protein":0,"carbs":67,"fat":0,"fiber":0},"hydrationFactor":0.95,"substitutes":["honey","agave-nectar"],"notes":"Natural sweetener. Vegan.","swapNote":"-5% liquid · Vegan"},"agave-nectar":{"name":"Agave Nectar","category":"wet","role":"sweetener","macrosPer100g":{"calories":310,"protein":0,"carbs":76,"fat":0,"fiber":0},"hydrationFactor":0.9,"substitutes":["honey","maple-syrup"],"notes":"Very sweet. Use less than honey/maple.","swapNote":"-10% liquid · Vegan"},"turkey-sausage":{"name":"Lean Turkey Sausage","category":"wet","role":"protein","macrosPer100g":{"calories":170,"protein":19,"carbs":1,"fat":10,"fiber":0},"hydrationFactor":1,"substitutes":["chicken-sausage","tempeh-crumbles","tofu-firm"],"notes":"Lean breakfast protein. Lower fat than pork sausage."},"chicken-sausage":{"name":"Chicken Breakfast Sausage","category":"wet","role":"protein","macrosPer100g":{"calories":140,"protein":18,"carbs":2,"fat":7,"fiber":0},"hydrationFactor":1,"substitutes":["turkey-sausage","tempeh-crumbles"],"notes":"Lower fat option. Apple chicken sausage works great.","swapNote":"-30 cal · Lower fat"},"tempeh-crumbles":{"name":"Tempeh (Crumbled)","category":"wet","role":"protein","macrosPer100g":{"calories":193,"protein":19,"carbs":9,"fat":11,"fiber":0},"hydrationFactor":1,"substitutes":["turkey-sausage","tofu-firm"],"notes":"Vegan protein. Season well with breakfast spices.","swapNote":"Vegan · +fiber"},"tofu-firm":{"name":"Firm Tofu (Pressed)","category":"wet","role":"protein","macrosPer100g":{"calories":144,"protein":17,"carbs":3,"fat":8,"fiber":2},"hydrationFactor":1,"substitutes":["tempeh-crumbles","egg-whites-liquid"],"notes":"Vegan. Press well and crumble for scrambles.","swapNote":"Vegan · Low cal"},"flour-tortilla":{"name":"Large Flour Tortilla (10\")","category":"dry","role":"structure","macrosPer100g":{"calories":312,"protein":8,"carbs":52,"fat":8,"fiber":2},"hydrationFactor":1,"substitutes":["whole-wheat-tortilla","low-carb-tortilla","corn-tortilla"],"notes":"Standard burrito wrap. ~60g per tortilla."},"whole-wheat-tortilla":{"name":"Whole Wheat Tortilla (10\")","category":"dry","role":"structure","macrosPer100g":{"calories":295,"protein":9,"carbs":48,"fat":7,"fiber":5},"hydrationFactor":1,"substitutes":["flour-tortilla","low-carb-tortilla"],"notes":"Higher fiber option.","swapNote":"+fiber · Whole grain"},"low-carb-tortilla":{"name":"Low-Carb Tortilla (Mission Carb Balance)","category":"dry","role":"structure","macrosPer100g":{"calories":180,"protein":12,"carbs":26,"fat":6,"fiber":18},"hydrationFactor":1,"substitutes":["flour-tortilla","whole-wheat-tortilla"],"notes":"High fiber, lower net carbs. Great for keto.","swapNote":"-40% cal · +protein · Keto"},"corn-tortilla":{"name":"Corn Tortilla (6\")","category":"dry","role":"structure","macrosPer100g":{"calories":218,"protein":6,"carbs":45,"fat":3,"fiber":5},"hydrationFactor":1,"substitutes":["flour-tortilla"],"notes":"Gluten-free. Smaller size, use 2 per serving.","swapNote":"GF · Smaller"},"cheddar-cheese":{"name":"Cheddar Cheese (Shredded)","category":"dry","role":"protein","macrosPer100g":{"calories":403,"protein":25,"carbs":1,"fat":33,"fiber":0},"hydrationFactor":1,"substitutes":["reduced-fat-cheddar","mozzarella","dairy-free-cheese"],"notes":"Sharp or mild. High protein but also high fat."},"reduced-fat-cheddar":{"name":"Reduced-Fat Cheddar","category":"dry","role":"protein","macrosPer100g":{"calories":282,"protein":27,"carbs":2,"fat":18,"fiber":0},"hydrationFactor":1,"substitutes":["cheddar-cheese","mozzarella"],"notes":"30% less fat than regular cheddar.","swapNote":"-30% fat"},"mozzarella":{"name":"Part-Skim Mozzarella","category":"dry","role":"protein","macrosPer100g":{"calories":280,"protein":22,"carbs":3,"fat":20,"fiber":0},"hydrationFactor":1,"substitutes":["cheddar-cheese","dairy-free-cheese"],"notes":"Milder flavor, great melting cheese."},"dairy-free-cheese":{"name":"Dairy-Free Cheese (Violife/Daiya)","category":"dry","role":"add-in","macrosPer100g":{"calories":310,"protein":1,"carbs":7,"fat":30,"fiber":0},"hydrationFactor":1,"substitutes":["cheddar-cheese","cheese-none"],"notes":"Vegan. Lower protein than dairy cheese.","swapNote":"Vegan · -24g protein"},"cheese-none":{"name":"No Cheese","category":"dry","role":"add-in","macrosPer100g":{"calories":0,"protein":0,"carbs":0,"fat":0,"fiber":0},"amountRatio":0,"hydrationFactor":1,"substitutes":["cheddar-cheese","dairy-free-cheese"],"notes":"Omit cheese entirely. Dairy-free option.","swapNote":"DF · -protein · -fat","isSpecialSwap":true},"chia-seeds":{"name":"Chia Seeds","category":"dry","role":"add-in","macrosPer100g":{"calories":486,"protein":17,"carbs":42,"fat":31,"fiber":34},"hydrationFactor":1.3,"substitutes":["flax-seeds","hemp-hearts"],"notes":"High fiber superfood. Absorbs liquid, great for puddings.","swapNote":"+30% liquid · High fiber"},"flax-seeds":{"name":"Ground Flaxseed","category":"dry","role":"add-in","macrosPer100g":{"calories":534,"protein":18,"carbs":29,"fat":42,"fiber":27},"hydrationFactor":1.2,"substitutes":["chia-seeds","hemp-hearts"],"notes":"Omega-3 rich. Use ground for absorption.","swapNote":"+20% liquid · Omega-3"},"hemp-hearts":{"name":"Hemp Hearts (Hulled)","category":"dry","role":"add-in","macrosPer100g":{"calories":553,"protein":31,"carbs":9,"fat":49,"fiber":4},"hydrationFactor":1,"substitutes":["chia-seeds","flax-seeds"],"notes":"Complete protein. Nutty flavor.","swapNote":"+protein · Complete amino"},"chickpea-flour":{"name":"Chickpea Flour (Besan)","category":"dry","role":"structure","macrosPer100g":{"calories":387,"protein":22,"carbs":58,"fat":7,"fiber":10},"hydrationFactor":1.1,"substitutes":["oat-flour","almond-flour"],"notes":"High protein flour. Great for savory dishes.","swapNote":"+protein · GF · Savory"},"mung-beans":{"name":"Mung Beans (Cooked)","category":"wet","role":"protein","macrosPer100g":{"calories":105,"protein":7,"carbs":19,"fat":0.4,"fiber":8},"hydrationFactor":1,"substitutes":["lentils-cooked","black-beans"],"notes":"High protein legume. Use for egg-free scrambles.","swapNote":"Vegan · High fiber"},"lentils-cooked":{"name":"Lentils (Cooked)","category":"wet","role":"protein","macrosPer100g":{"calories":116,"protein":9,"carbs":20,"fat":0.4,"fiber":8},"hydrationFactor":1,"substitutes":["mung-beans","black-beans"],"notes":"Versatile legume. Red lentils cook fastest.","swapNote":"Vegan · +protein"},"black-beans":{"name":"Black Beans (Cooked)","category":"wet","role":"protein","macrosPer100g":{"calories":132,"protein":9,"carbs":24,"fat":0.5,"fiber":8},"hydrationFactor":1,"substitutes":["mung-beans","lentils-cooked"],"notes":"Great for breakfast burritos and bowls.","swapNote":"Vegan · +fiber"},"almond-milk-unsweetened":{"name":"Unsweetened Almond Milk","category":"wet","role":"moisture","macrosPer100g":{"calories":15,"protein":0.5,"carbs":0.3,"fat":1.2,"fiber":0},"hydrationFactor":1,"substitutes":["oat-milk","dairy-milk","soy-milk"],"notes":"Low calorie milk alternative. Vegan.","swapNote":"Vegan · Low cal"},"oat-milk":{"name":"Oat Milk","category":"wet","role":"moisture","macrosPer100g":{"calories":43,"protein":1,"carbs":7,"fat":1.5,"fiber":0.8},"hydrationFactor":1,"substitutes":["almond-milk-unsweetened","dairy-milk"],"notes":"Creamy texture. Good for frothing.","swapNote":"Vegan · Creamy"},"dairy-milk":{"name":"Skim Milk","category":"wet","role":"moisture","macrosPer100g":{"calories":34,"protein":3.4,"carbs":5,"fat":0.1,"fiber":0},"hydrationFactor":1,"substitutes":["almond-milk-unsweetened","oat-milk","soy-milk"],"notes":"Traditional option. Higher protein."},"soy-milk":{"name":"Soy Milk (Unsweetened)","category":"wet","role":"moisture","macrosPer100g":{"calories":33,"protein":3.3,"carbs":1.2,"fat":1.8,"fiber":0.4},"hydrationFactor":1,"substitutes":["almond-milk-unsweetened","dairy-milk"],"notes":"Highest protein non-dairy milk.","swapNote":"Vegan · High protein"}};

const SUBSTITUTION_GROUPS={"flour":["oat-flour","king-arthur-gf-mix","bobs-gf-1to1","almond-flour","coconut-flour","whole-wheat-flour","chickpea-flour"],"protein":["whey-vanilla","whey-chocolate","casein-vanilla","pea-protein","hemp-protein","egg-white-powder"],"dairy":["greek-yogurt-nonfat","greek-yogurt-2pct","cottage-cheese-blended","ricotta-part-skim","skyr","sour-cream-light","coconut-almond-yogurt","yogurt-none"],"eggs":["egg-whites-liquid","whole-eggs","flax-egg","chia-egg","aquafaba"],"fruit":["banana-mashed","pumpkin-puree","applesauce-unsweetened","sweet-potato-mashed","butternut-squash-mashed"],"vegetables":["zucchini-grated","carrot-grated"],"nutButters":["peanut-butter","almond-butter","sunflower-seed-butter","cashew-butter"],"sweeteners":["honey","maple-syrup","agave-nectar","medjool-dates"],"breakfastMeats":["turkey-sausage","chicken-sausage","tempeh-crumbles","tofu-firm"],"tortillas":["flour-tortilla","whole-wheat-tortilla","low-carb-tortilla","corn-tortilla"],"cheese":["cheddar-cheese","reduced-fat-cheddar","mozzarella","dairy-free-cheese","cheese-none"],"seeds":["chia-seeds","flax-seeds","hemp-hearts"],"legumes":["mung-beans","lentils-cooked","black-beans"],"milk":["almond-milk-unsweetened","oat-milk","dairy-milk","soy-milk"]};

function recipeSubstitution(config) {
  return {
    recipeId: config.recipeId || 'unknown',
    yield: config.yield || 12,
    servingSize: config.servingSize || 75,
    originalIngredients: config.ingredients || [],
    currentIngredients: [],
    expandedIngredient: null,
    unitSystem: 'metric',
    hydrationAdjustments: [],
    nutritionDeltas: [],
    batchNutritionDeltas: [],
    // Base nutrition values (per serving) from recipe
    baseNutrition: {
      calories: config.baseNutrition?.calories || 0,
      protein: config.baseNutrition?.protein || 0,
      fat: config.baseNutrition?.fat || 0,
      carbs: config.baseNutrition?.carbs || 0,
      fiber: config.baseNutrition?.fiber || 0,
      sugar: config.baseNutrition?.sugar || 0
    },
    // Current calculated nutrition (updated on swap)
    currentNutrition: {
      calories: 0,
      protein: 0,
      fat: 0,
      carbs: 0,
      fiber: 0,
      sugar: 0
    },

    init() {
      // Deep clone original ingredients
      this.currentIngredients = JSON.parse(JSON.stringify(this.originalIngredients));
      this.currentIngredients.forEach(ing => {
        ing.originalId = ing.id;
        ing.isSwapped = false;
        ing.originalAmount = ing.amount;
      });
      // Initialize current nutrition to base values
      this.currentNutrition = { ...this.baseNutrition };
      this.recalculate();
    },

    getIngredient(id) {
      return INGREDIENTS[id] || null;
    },

    getDisplayName(id) {
      // First check currentIngredients for the name (handles ingredients not in database)
      const currentIng = this.currentIngredients.find(i => i.id === id || i.originalId === id);
      if (currentIng) {
        return currentIng.name;
      }
      // Fall back to database lookup
      const ing = this.getIngredient(id);
      if (ing) {
        return ing.name;
      }
      // Last resort: format the ID as a readable name
      return id.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    },

    getSubstitutes(id) {
      const ing = this.getIngredient(id);
      if (!ing || ing.isFixed) return [];
      
      return (ing.substitutes || [])
        .map(subId => {
          const sub = this.getIngredient(subId);
          if (!sub) return null;
          return {
            id: subId,
            name: sub.name,
            swapNote: sub.swapNote || null,
            isSpecialSwap: sub.isSpecialSwap || false
          };
        })
        .filter(Boolean);
    },

    canSubstitute(id) {
      const ing = this.getIngredient(id);
      return ing && !ing.isFixed && (ing.substitutes || []).length > 0;
    },

    toggleIngredient(id) {
      if (this.expandedIngredient === id) {
        this.expandedIngredient = null;
      } else {
        const ing = this.currentIngredients.find(i => i.id === id || i.originalId === id);
        if (ing && this.canSubstitute(ing.originalId)) {
          this.expandedIngredient = id;
        }
      }
    },

    selectSubstitute(originalId, newId) {
      const index = this.currentIngredients.findIndex(i => i.originalId === originalId);
      if (index === -1) return;

      const current = this.currentIngredients[index];
      const originalIng = this.getIngredient(originalId);
      const newIng = this.getIngredient(newId);

      if (!originalIng || !newIng) return;

      // Calculate new amount based on ratio
      let newAmount = current.originalAmount;
      if (newIng.amountRatio) {
        newAmount = Math.round(current.originalAmount * newIng.amountRatio);
      }

      this.currentIngredients[index] = {
        ...current,
        id: newId,
        amount: newAmount,
        isSwapped: newId !== originalId,
        previousId: current.id
      };

      this.expandedIngredient = null;
      this.recalculate();
    },

    revertIngredient(originalId) {
      const index = this.currentIngredients.findIndex(i => i.originalId === originalId);
      if (index === -1) return;

      const current = this.currentIngredients[index];
      this.currentIngredients[index] = {
        ...current,
        id: current.originalId,
        amount: current.originalAmount,
        isSwapped: false
      };

      this.recalculate();
    },

    resetAll() {
      this.currentIngredients.forEach((ing, index) => {
        this.currentIngredients[index] = {
          ...ing,
          id: ing.originalId,
          amount: ing.originalAmount,
          isSwapped: false
        };
      });
      this.expandedIngredient = null;
      this.recalculate();
    },

    recalculate() {
      this.calculateHydration();
      this.calculateNutrition();
      this.updateCurrentNutrition();
    },

    // Update the current nutrition values based on deltas
    updateCurrentNutrition() {
      const servings = this.yield;
      let calDelta = 0, proteinDelta = 0, fatDelta = 0, carbsDelta = 0, fiberDelta = 0;

      this.currentIngredients.forEach(ing => {
        if (!ing.isSwapped) return;
        const originalIng = this.getIngredient(ing.originalId);
        const newIng = this.getIngredient(ing.id);
        if (!originalIng || !newIng) return;

        const originalAmount = ing.originalAmount;
        const newAmount = ing.amount;

        const calcDelta = (macro) => {
          const originalValue = (originalIng.macrosPer100g[macro] / 100) * originalAmount;
          const newValue = (newIng.macrosPer100g[macro] / 100) * newAmount;
          return newValue - originalValue;
        };

        calDelta += calcDelta('calories');
        proteinDelta += calcDelta('protein');
        fatDelta += calcDelta('fat');
        carbsDelta += calcDelta('carbs');
        fiberDelta += calcDelta('fiber');
      });

      // Update current nutrition (per serving)
      this.currentNutrition = {
        calories: Math.round(this.baseNutrition.calories + (calDelta / servings)),
        protein: Math.round(this.baseNutrition.protein + (proteinDelta / servings)),
        fat: Math.round(this.baseNutrition.fat + (fatDelta / servings)),
        carbs: Math.round(this.baseNutrition.carbs + (carbsDelta / servings)),
        fiber: Math.round(this.baseNutrition.fiber + (fiberDelta / servings)),
        sugar: this.baseNutrition.sugar // Sugar doesn't change much with our swaps
      };
    },

    // Getter functions for the nutrition label
    getNutritionCalories() {
      return this.currentNutrition.calories;
    },
    getNutritionProtein() {
      return this.currentNutrition.protein;
    },
    getNutritionFat() {
      return this.currentNutrition.fat;
    },
    getNutritionCarbs() {
      return this.currentNutrition.carbs;
    },
    getNutritionFiber() {
      return this.currentNutrition.fiber;
    },
    getNutritionSugar() {
      return this.currentNutrition.sugar;
    },
    // Daily Value percentage calculations
    getDVFat() {
      return Math.round((this.currentNutrition.fat / 78) * 100);
    },
    getDVCarbs() {
      return Math.round((this.currentNutrition.carbs / 275) * 100);
    },
    getDVFiber() {
      return Math.round((this.currentNutrition.fiber / 28) * 100);
    },
    getDVProtein() {
      return Math.round((this.currentNutrition.protein / 50) * 100);
    },

    // P:E Ratio calculations
    getPERatio() {
      const protein = this.currentNutrition.protein;
      const calories = this.currentNutrition.calories;
      // P:E = protein / (non-protein calories / 100)
      // Non-protein calories = total calories - (protein * 4)
      const nonProteinCals = calories - (protein * 4);
      if (nonProteinCals <= 0) return 99; // Very high protein
      return protein / (nonProteinCals / 100);
    },

    getPERating() {
      const pe = this.getPERatio();
      if (pe >= 15) return 'ELITE';
      if (pe >= 10) return 'EXCELLENT';
      if (pe >= 5) return 'GOOD';
      return 'MODERATE';
    },

    calculateHydration() {
      this.hydrationAdjustments = [];

      this.currentIngredients.forEach(ing => {
        if (!ing.isSwapped) return;

        const originalIng = this.getIngredient(ing.originalId);
        const newIng = this.getIngredient(ing.id);

        if (!originalIng || !newIng) return;
        if (originalIng.category !== 'dry') return;

        const hydrationDiff = newIng.hydrationFactor - originalIng.hydrationFactor;
        const effectiveAmount = newIng.amountRatio 
          ? ing.originalAmount * newIng.amountRatio 
          : ing.originalAmount;
        const adjustmentMl = Math.round(hydrationDiff * effectiveAmount);

        if (adjustmentMl !== 0) {
          this.hydrationAdjustments.push({
            ingredientName: newIng.name,
            originalName: originalIng.name,
            adjustmentMl,
            message: adjustmentMl > 0 ? `+${adjustmentMl}ml liquid` : `${adjustmentMl}ml liquid`
          });
        }
      });
    },

    getTotalHydrationAdjustment() {
      return this.hydrationAdjustments.reduce((sum, adj) => sum + adj.adjustmentMl, 0);
    },

    checkHasHydrationAdjustment() {
      return this.hydrationAdjustments.length > 0;
    },

    calculateNutrition() {
      this.nutritionDeltas = [];
      this.batchNutritionDeltas = [];

      let totalCalDelta = 0;
      let totalProteinDelta = 0;
      let totalFatDelta = 0;
      let totalCarbsDelta = 0;

      this.currentIngredients.forEach(ing => {
        if (!ing.isSwapped) return;

        const originalIng = this.getIngredient(ing.originalId);
        const newIng = this.getIngredient(ing.id);

        if (!originalIng || !newIng) return;

        const originalAmount = ing.originalAmount;
        const newAmount = ing.amount;

        const calcDelta = (macro) => {
          const originalValue = (originalIng.macrosPer100g[macro] / 100) * originalAmount;
          const newValue = (newIng.macrosPer100g[macro] / 100) * newAmount;
          return newValue - originalValue;
        };

        totalCalDelta += calcDelta('calories');
        totalProteinDelta += calcDelta('protein');
        totalFatDelta += calcDelta('fat');
        totalCarbsDelta += calcDelta('carbs');
      });

      const servings = this.yield;

      // Batch-level deltas
      if (Math.abs(totalCalDelta) >= 5) {
        this.batchNutritionDeltas.push({
          name: 'Calories',
          delta: Math.round(totalCalDelta),
          formatted: this.formatDelta(Math.round(totalCalDelta), '')
        });
      }
      if (Math.abs(totalProteinDelta) >= 1) {
        this.batchNutritionDeltas.push({
          name: 'Protein',
          delta: Math.round(totalProteinDelta),
          formatted: this.formatDelta(Math.round(totalProteinDelta), 'g')
        });
      }
      if (Math.abs(totalFatDelta) >= 1) {
        this.batchNutritionDeltas.push({
          name: 'Fat',
          delta: Math.round(totalFatDelta),
          formatted: this.formatDelta(Math.round(totalFatDelta), 'g')
        });
      }
      if (Math.abs(totalCarbsDelta) >= 1) {
        this.batchNutritionDeltas.push({
          name: 'Carbs',
          delta: Math.round(totalCarbsDelta),
          formatted: this.formatDelta(Math.round(totalCarbsDelta), 'g')
        });
      }

      // Per-serving deltas
      if (Math.abs(totalCalDelta / servings) >= 1) {
        this.nutritionDeltas.push({
          name: 'Calories',
          delta: Math.round(totalCalDelta / servings),
          formatted: this.formatDelta(Math.round(totalCalDelta / servings), '')
        });
      }
      if (Math.abs(totalProteinDelta / servings) >= 0.5) {
        this.nutritionDeltas.push({
          name: 'Protein',
          delta: Math.round(totalProteinDelta / servings),
          formatted: this.formatDelta(Math.round(totalProteinDelta / servings), 'g')
        });
      }
      if (Math.abs(totalFatDelta / servings) >= 0.5) {
        this.nutritionDeltas.push({
          name: 'Fat',
          delta: Math.round(totalFatDelta / servings),
          formatted: this.formatDelta(Math.round(totalFatDelta / servings), 'g')
        });
      }
      if (Math.abs(totalCarbsDelta / servings) >= 1) {
        this.nutritionDeltas.push({
          name: 'Carbs',
          delta: Math.round(totalCarbsDelta / servings),
          formatted: this.formatDelta(Math.round(totalCarbsDelta / servings), 'g')
        });
      }
    },

    formatDelta(value, unit) {
      if (value > 0) return `+${value}${unit}`;
      if (value < 0) return `${value}${unit}`;
      return `0${unit}`;
    },

    checkHasSubstitutions() {
      return this.currentIngredients.some(ing => ing.isSwapped);
    },

    getSubstitutionCount() {
      return this.currentIngredients.filter(ing => ing.isSwapped).length;
    },

    getFormattedAmount(ing) {
      // Handle "pinch" display
      if (ing.displayAmount === 'pinch') {
        return 'pinch';
      }
      // Handle fractional display amounts (like "1/2")
      if (typeof ing.displayAmount === 'string' && ing.displayAmount.includes('/')) {
        return ing.displayAmount;
      }
      // Handle special units (eggs, tsp, tbsp, ml)
      if (ing.unit && ing.unit !== 'g' && ing.unit !== '') {
        const displayAmt = ing.displayAmount !== undefined ? ing.displayAmount : ing.amount;
        // For ml, just show the number with ml
        if (ing.unit === 'ml') {
          return `${displayAmt}ml`;
        }
        return `${displayAmt} ${ing.unit}`;
      }
      // Default to grams
      if (this.unitSystem === 'metric') {
        return `${ing.amount}g`;
      }
      return ing.usUnit || `${ing.amount}g`;
    },

    isExpanded(id) {
      return this.expandedIngredient === id;
    },

    getIngredientClasses(ing) {
      let classes = 'ingredient-item flex flex-col py-3 transition-all duration-200';
      if (ing.isSwapped) {
        classes += ' bg-brand-50 rounded-xl px-3 -mx-3';
      }
      if (this.canSubstitute(ing.originalId)) {
        classes += ' cursor-pointer hover:bg-slate-50';
      }
      return classes;
    }
  };
}

// Export to window for browser usage
if(typeof window!=="undefined"){window.INGREDIENTS=INGREDIENTS;window.SUBSTITUTION_GROUPS=SUBSTITUTION_GROUPS;window.recipeSubstitution=recipeSubstitution}
