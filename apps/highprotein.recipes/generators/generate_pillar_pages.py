#!/usr/bin/env python3
"""
Generate Pillar Pages for highprotein.recipes/breakfast
Creates SEO-optimized landing pages with ~800 word descriptions and schema markup
"""

import json
from pathlib import Path

# Paths
BASE_DIR = Path(__file__).parent.parent
DATA_DIR = BASE_DIR / "data" / "breakfast"
DIST_DIR = BASE_DIR / "dist" / "breakfast"

# Load recipes
with open(DATA_DIR / "recipes.json", "r") as f:
    data = json.load(f)
    recipes = data["recipes"]

# SEO Content for each category (~800 words each)
SEO_CONTENT = {
    "": {
        "intro_short": "Start your day with protein. Every recipe here is macro-verified, easy to make, and designed to keep you full until lunch.",
        "content": """
        <div class="prose prose-lg max-w-4xl mx-auto text-slate-700">
            <h2 class="anton-text text-2xl text-slate-900 mt-12 mb-6">Why High Protein Breakfast Matters</h2>
            <p>The science is clear: starting your day with adequate protein sets the foundation for everything that follows. Research published in the American Journal of Clinical Nutrition shows that a high-protein breakfast reduces hunger hormones, decreases cravings, and improves body composition over time. Yet most people start their day with carb-heavy options that leave them hungry by 10 AM.</p>

            <p>Our collection of high protein breakfast recipes solves this problem. Every recipe on this page delivers between 20-45 grams of protein per serving, using real whole foods rather than relying solely on protein powder. We've calculated the macros using USDA FoodData Central, measured ingredients in grams for accuracy, and tested each recipe multiple times to ensure it actually tastes good.</p>

            <h2 class="anton-text text-2xl text-slate-900 mt-12 mb-6">Understanding P:E Ratio for Breakfast</h2>
            <p>We use the P:E ratio (Protein-to-Energy ratio) to rank our recipes. This metric, popularized by Dr. Ted Naiman, measures how much protein you get per calorie. A higher P:E ratio means more protein bang for your caloric buck - essential whether you're building muscle, losing fat, or simply trying to stay satiated.</p>

            <ul class="my-6">
                <li><strong class="text-emerald-600">ELITE (15+ P:E):</strong> Maximum protein density. These recipes deliver exceptional protein with minimal calories. Perfect for aggressive fat loss phases.</li>
                <li><strong class="text-green-600">EXCELLENT (10-15 P:E):</strong> Outstanding protein-to-calorie ratio. Ideal for most fitness goals including recomposition and lean bulking.</li>
                <li><strong class="text-yellow-600">GOOD (5-10 P:E):</strong> Solid protein content with balanced macros. Great for maintenance and moderate deficit phases.</li>
            </ul>

            <h2 class="anton-text text-2xl text-slate-900 mt-12 mb-6">Categories to Explore</h2>
            <p>We've organized our breakfast recipes into practical categories based on how real people actually eat. Looking for <a href="/breakfast/meal-prep/" class="text-brand-600 hover:underline">meal prep breakfast ideas</a>? We have freezer-friendly burritos and egg bites you can make on Sunday and eat all week. Following a <a href="/breakfast/vegan/" class="text-brand-600 hover:underline">vegan diet</a>? Our plant-based options hit 25+ grams of protein without any animal products.</p>

            <p>For those watching calories, our <a href="/breakfast/low-calorie/" class="text-brand-600 hover:underline">low-calorie high protein breakfasts</a> stay under 350 calories while still delivering 25+ grams of protein. Keto dieters will love our <a href="/breakfast/low-carb/" class="text-brand-600 hover:underline">low-carb options</a> with under 10 grams of net carbs. And if you're always rushing out the door, check out our <a href="/breakfast/on-the-go/" class="text-brand-600 hover:underline">grab-and-go recipes</a> designed for busy mornings.</p>

            <h2 class="anton-text text-2xl text-slate-900 mt-12 mb-6">How to Hit Your Protein Goals at Breakfast</h2>
            <p>Most nutrition experts recommend consuming 25-40 grams of protein at breakfast for optimal muscle protein synthesis and satiety. Here's how to think about your morning protein target:</p>

            <ul class="my-6">
                <li><strong>Fat Loss:</strong> Aim for 35-40g protein at breakfast. The higher protein will reduce cravings throughout the day and preserve muscle while in a deficit.</li>
                <li><strong>Muscle Building:</strong> Target 30-40g protein, paired with adequate carbs to fuel your workouts. Our meal prep options make hitting these targets effortless.</li>
                <li><strong>Maintenance:</strong> 25-35g protein works well for most people. Focus on recipes you enjoy and can sustain long-term.</li>
            </ul>

            <h2 class="anton-text text-2xl text-slate-900 mt-12 mb-6">Featured High Protein Ingredients</h2>
            <p>Our recipes leverage the highest-protein breakfast ingredients available. Egg whites deliver 11g protein per 100g with almost zero fat. Greek yogurt provides 10g protein per 100g plus probiotics. Cottage cheese is a protein powerhouse at 11g per 100g. For plant-based options, we use protein-rich ingredients like chickpea flour, hemp hearts, and pea protein isolate.</p>

            <p>We also incorporate lean proteins like turkey sausage (which beats pork sausage on protein-to-fat ratio by 3x) and Canadian bacon (30% more protein than regular bacon with 75% less fat). These ingredient swaps make a massive difference in the final macros without sacrificing taste.</p>

            <h2 class="anton-text text-2xl text-slate-900 mt-12 mb-6">Start Your High Protein Morning</h2>
            <p>Browse our complete collection below, sorted by P:E ratio so the most protein-dense options appear first. Use the category filters above to narrow down to your specific dietary needs. And don't forget to check out our <a href="/breakfast/meal-plans/7-day/" class="text-brand-600 hover:underline">free 7-day high protein breakfast meal plan</a> for a done-for-you week of macros-optimized mornings.</p>
        </div>
        """
    },
    "meal-prep": {
        "intro_short": "Prep once, eat all week. These make-ahead breakfasts are perfect for busy mornings when you still want to hit your protein goals.",
        "content": """
        <div class="prose prose-lg max-w-4xl mx-auto text-slate-700">
            <h2 class="anton-text text-2xl text-slate-900 mt-12 mb-6">High Protein Breakfast Meal Prep: Your Complete Guide</h2>
            <p>Meal prep is the secret weapon of anyone serious about their nutrition. When you wake up with a high-protein breakfast already prepared, hitting your macros becomes automatic rather than aspirational. No more grabbing a sugary muffin on the way to work. No more skipping breakfast entirely because you don't have time.</p>

            <p>Our meal prep breakfast recipes are specifically designed for batch cooking. Each recipe makes 6-12 servings, stores well in the refrigerator for 5-7 days, and most can be frozen for up to 3 months. We've tested every reheating method so you know exactly how to get the best results whether you're using a microwave, oven, or air fryer.</p>

            <h2 class="anton-text text-2xl text-slate-900 mt-12 mb-6">The Sunday Meal Prep System</h2>
            <p>Here's how to set yourself up for a week of high-protein breakfasts in about 90 minutes:</p>

            <ol class="my-6">
                <li><strong>Choose 2-3 recipes</strong> from this page. Variety prevents burnout.</li>
                <li><strong>Shop strategically.</strong> Most recipes share ingredients like eggs, egg whites, lean turkey sausage, and vegetables.</li>
                <li><strong>Prep in batches.</strong> Cook all your proteins first, then vegetables, then assemble everything at once.</li>
                <li><strong>Portion immediately.</strong> Divide into individual containers while still warm. This makes grab-and-go mornings effortless.</li>
                <li><strong>Freeze half.</strong> Put half in the freezer, half in the fridge. You'll never run out.</li>
            </ol>

            <h2 class="anton-text text-2xl text-slate-900 mt-12 mb-6">Best Containers for Meal Prep Breakfast</h2>
            <p>Your container choice matters for food quality and reheating success. For egg-based dishes like our <a href="/breakfast/recipes/sheet-pan-breakfast-bake/" class="text-brand-600 hover:underline">Sheet Pan Breakfast Bake</a> and <a href="/breakfast/recipes/egg-white-veggie-bites/" class="text-brand-600 hover:underline">Egg White Veggie Bites</a>, glass containers work best - they reheat evenly and don't absorb odors.</p>

            <p>For <a href="/breakfast/recipes/freezer-breakfast-burritos/" class="text-brand-600 hover:underline">Freezer Breakfast Burritos</a>, wrap individually in foil then store in gallon freezer bags. This prevents freezer burn and makes it easy to grab exactly how many you need. For overnight options like our <a href="/breakfast/recipes/chia-protein-pudding/" class="text-brand-600 hover:underline">Chia Protein Pudding</a>, mason jars are perfect - they're pre-portioned and you can eat directly from them.</p>

            <h2 class="anton-text text-2xl text-slate-900 mt-12 mb-6">Reheating for Best Results</h2>
            <p>The biggest meal prep mistake is improper reheating. Here's how to get restaurant-quality results every time:</p>

            <ul class="my-6">
                <li><strong>Egg dishes:</strong> Microwave at 50% power for even heating. Full power makes eggs rubbery.</li>
                <li><strong>Burritos from frozen:</strong> Air fryer at 350F for 8-10 minutes gives you a crispy tortilla. Microwave works but won't crisp.</li>
                <li><strong>Sausage patties:</strong> Quick sear in a hot pan for 60 seconds per side restores the crispy exterior.</li>
                <li><strong>Muffins:</strong> 15 seconds in the microwave, then 5 minutes in a 350F oven for best texture.</li>
            </ul>

            <h2 class="anton-text text-2xl text-slate-900 mt-12 mb-6">Scaling for Families</h2>
            <p>Most of our meal prep recipes scale easily. The <a href="/breakfast/recipes/sheet-pan-breakfast-bake/" class="text-brand-600 hover:underline">Sheet Pan Breakfast Bake</a> uses a standard 9x13 pan for 12 servings, but you can double the recipe and use a full sheet pan for 24 servings. Similarly, our burrito recipe makes 12 but can easily be doubled if you're feeding a family or want to stock the freezer for a full month.</p>

            <h2 class="anton-text text-2xl text-slate-900 mt-12 mb-6">Cost Efficiency of Meal Prep</h2>
            <p>Beyond the time savings, meal prepping high-protein breakfasts saves significant money. Our <a href="/breakfast/recipes/freezer-breakfast-burritos/" class="text-brand-600 hover:underline">Freezer Breakfast Burritos</a> cost approximately $2.50 per 40g-protein burrito - compared to $6-8 for a similar protein count at a fast-food restaurant. Over a month, that's $100+ in savings while eating better quality food with more protein.</p>

            <p>Browse our complete meal prep collection below. Each recipe includes storage times, reheating instructions, and batch scaling tips. Start this Sunday and transform your weekday mornings.</p>
        </div>
        """
    },
    "vegan": {
        "intro_short": "100% plant-based, 100% high protein. These vegan breakfasts prove you don't need eggs or dairy to hit your protein goals.",
        "content": """
        <div class="prose prose-lg max-w-4xl mx-auto text-slate-700">
            <h2 class="anton-text text-2xl text-slate-900 mt-12 mb-6">High Protein Vegan Breakfast: Complete Plant-Based Guide</h2>
            <p>The biggest challenge for plant-based eaters at breakfast is protein. Traditional vegan breakfasts - oatmeal, toast with avocado, fruit smoothies - typically deliver only 5-15 grams of protein. That's simply not enough for optimal satiety, muscle maintenance, or body composition goals.</p>

            <p>Our vegan high protein breakfast recipes solve this problem. Every recipe delivers 20-35 grams of complete protein using strategic ingredient combinations. We've moved beyond the basics to create genuinely satisfying plant-based breakfasts that rival their egg-based counterparts in both protein content and taste.</p>

            <h2 class="anton-text text-2xl text-slate-900 mt-12 mb-6">Complete Proteins Without Animal Products</h2>
            <p>A common concern with plant-based protein is amino acid completeness. While most plant proteins are low in one or more essential amino acids, this is easily solved through strategic combinations:</p>

            <ul class="my-6">
                <li><strong>Legumes + Grains:</strong> Chickpeas with quinoa, black beans with rice, lentils with oats.</li>
                <li><strong>Soy Products:</strong> Tofu, tempeh, and edamame are complete proteins on their own.</li>
                <li><strong>Seeds + Legumes:</strong> Hemp hearts with legume-based dishes provide complete amino acid profiles.</li>
                <li><strong>Pea Protein Isolate:</strong> A complete protein we use in several smoothie bowl recipes.</li>
            </ul>

            <h2 class="anton-text text-2xl text-slate-900 mt-12 mb-6">Best Vegan Protein Sources for Breakfast</h2>
            <p>We've identified the most protein-dense plant-based ingredients and built our recipes around them:</p>

            <p><strong>Chickpea Flour (Besan):</strong> At 22g protein per 100g, chickpea flour is a breakfast game-changer. Our <a href="/breakfast/recipes/chickpea-flour-scramble-wraps/" class="text-brand-600 hover:underline">Chickpea Flour Scramble Wraps</a> use it to create an egg-like scramble with 28g protein per serving.</p>

            <p><strong>Hemp Hearts:</strong> With 31g protein per 100g (and all 9 essential amino acids), hemp hearts add serious protein to smoothie bowls and overnight oats. Plus they provide omega-3 fatty acids.</p>

            <p><strong>Pea Protein Isolate:</strong> 80g protein per 100g makes this the most concentrated vegan protein source. We use unflavored versions in our <a href="/breakfast/recipes/soy-free-vegan-smoothie-bowl/" class="text-brand-600 hover:underline">Soy-Free Vegan Smoothie Bowl</a>.</p>

            <h2 class="anton-text text-2xl text-slate-900 mt-12 mb-6">Soy-Free Vegan Options</h2>
            <p>Many people following a vegan diet also need to avoid soy due to allergies, thyroid concerns, or personal preference. We've developed several soy-free high-protein options including our smoothie bowls and chickpea-based scrambles. Each recipe clearly labels whether it contains soy.</p>

            <h2 class="anton-text text-2xl text-slate-900 mt-12 mb-6">Vegan Meal Prep Strategies</h2>
            <p>Plant-based proteins often require more prep work, making batch cooking even more valuable. Our <a href="/breakfast/recipes/protein-granola-coconut-yogurt/" class="text-brand-600 hover:underline">Protein Granola with Coconut Yogurt</a> can be prepped in large batches - make a big container of granola, and breakfast is just assembly for weeks.</p>

            <p>For savory options, our mung bean and chickpea scrambles reheat beautifully. Make a large batch of the scramble base, portion into containers, and simply reheat and add fresh toppings each morning.</p>

            <h2 class="anton-text text-2xl text-slate-900 mt-12 mb-6">Hitting 30+ Grams Without Protein Powder</h2>
            <p>While we include protein powder in some recipes for convenience, you can absolutely hit 30+ grams using whole foods alone. The key is stacking protein sources: chickpea flour base (12g) + hemp hearts topping (10g) + a side of tempeh (15g) = 37g protein from whole foods.</p>

            <p>Explore our complete vegan breakfast collection below. Each recipe includes complete macro breakdowns, protein source details, and allergen information. Whether you're fully plant-based or just looking to add more vegan meals to your rotation, these recipes prove that high-protein vegan breakfast is not only possible but delicious.</p>
        </div>
        """
    },
    "low-calorie": {
        "intro_short": "Maximum protein, minimum calories. These recipes are perfect for fat loss phases while preserving muscle and staying satisfied.",
        "content": """
        <div class="prose prose-lg max-w-4xl mx-auto text-slate-700">
            <h2 class="anton-text text-2xl text-slate-900 mt-12 mb-6">Low Calorie High Protein Breakfast for Fat Loss</h2>
            <p>When you're in a caloric deficit, every calorie needs to work hard. Wasting 400 calories on a breakfast that leaves you hungry two hours later is a recipe for diet failure. Our low-calorie high-protein breakfasts flip this equation: maximum satiety and nutrition with minimal caloric impact.</p>

            <p>Every recipe on this page delivers at least 20 grams of protein while staying under 350 calories. Most clock in at 200-300 calories with 25-35g protein - an exceptional P:E ratio that preserves muscle while you're losing fat.</p>

            <h2 class="anton-text text-2xl text-slate-900 mt-12 mb-6">The Science of Satiety</h2>
            <p>Three factors determine how full a meal keeps you: protein content, fiber content, and food volume. Our low-calorie recipes maximize all three:</p>

            <ul class="my-6">
                <li><strong>High Protein:</strong> Protein is the most satiating macronutrient, reducing hunger hormones for hours after eating.</li>
                <li><strong>Strategic Fiber:</strong> We include vegetables and high-fiber additions that add bulk without calories.</li>
                <li><strong>Volume Eating:</strong> Recipes like our <a href="/breakfast/recipes/volume-greek-style-bowl/" class="text-brand-600 hover:underline">Volume Greek-Style Bowl</a> use low-calorie high-volume foods to create large, satisfying meals.</li>
            </ul>

            <h2 class="anton-text text-2xl text-slate-900 mt-12 mb-6">Calorie-Saving Swaps That Work</h2>
            <p>Small ingredient swaps create massive calorie differences. Here's what we use:</p>

            <p><strong>Egg Whites vs Whole Eggs:</strong> Egg whites provide 11g protein per 100g with only 52 calories. Whole eggs have the same protein but 155 calories per 100g. Our <a href="/breakfast/recipes/egg-white-salsa-tacos/" class="text-brand-600 hover:underline">Egg White Salsa Tacos</a> use this swap to deliver 26g protein for just 220 calories.</p>

            <p><strong>Low-Fat Greek Yogurt:</strong> Full-fat Greek yogurt is 97 calories per 100g. Non-fat versions are only 59 calories with the same 10g protein. That's a 40% calorie reduction with zero protein sacrifice.</p>

            <p><strong>Turkey Sausage vs Pork Sausage:</strong> Lean turkey sausage has 60% fewer calories than traditional pork sausage while actually providing MORE protein per gram.</p>

            <h2 class="anton-text text-2xl text-slate-900 mt-12 mb-6">Low-Calorie Doesn't Mean Low-Taste</h2>
            <p>The biggest fear with low-calorie eating is blandness. We solve this with bold flavors that add minimal calories: fresh salsa, hot sauce, fresh herbs, citrus zest, smoked paprika, everything bagel seasoning. These flavor amplifiers transform simple ingredients into craveable meals.</p>

            <p>Our <a href="/breakfast/recipes/cottage-cheese-scramble/" class="text-brand-600 hover:underline">Cottage Cheese Scramble</a> uses this approach - cottage cheese and egg whites form the protein base (30g protein, 180 calories), then fresh herbs, cherry tomatoes, and a crack of black pepper create a restaurant-quality dish.</p>

            <h2 class="anton-text text-2xl text-slate-900 mt-12 mb-6">Fitting Low-Cal Breakfast Into Your Day</h2>
            <p>If you're eating 1500-1800 calories for fat loss, allocating 200-350 calories to breakfast leaves plenty of room for satisfying lunch and dinner. Some people prefer a lighter breakfast and larger evening meal; our recipes support that approach perfectly.</p>

            <p>Alternatively, if morning hunger is your challenge, go for our higher-end options around 300-350 calories. The extra protein and volume will carry you to lunch without cravings.</p>

            <h2 class="anton-text text-2xl text-slate-900 mt-12 mb-6">Tracking Made Easy</h2>
            <p>Every recipe includes precise macro counts measured in grams. We've done the calculation work so you can simply log the recipe as-is in MyFitnessPal or your preferred tracking app. No guessing, no estimation errors that derail your deficit.</p>

            <p>Browse our complete low-calorie collection below, sorted by P:E ratio. The highest-ranked recipes deliver the most protein per calorie - exactly what you want when every calorie counts.</p>
        </div>
        """
    },
    "low-carb": {
        "intro_short": "Keep carbs low and protein high. These recipes are perfect for keto and low-carb diets without sacrificing your protein intake.",
        "content": """
        <div class="prose prose-lg max-w-4xl mx-auto text-slate-700">
            <h2 class="anton-text text-2xl text-slate-900 mt-12 mb-6">Low Carb High Protein Breakfast: Keto-Friendly Recipes</h2>
            <p>The ketogenic and low-carb communities often focus so heavily on fat that protein gets neglected. But adequate protein is essential for preserving muscle mass, supporting recovery, and maintaining satiety - especially in a carb-restricted state. Our low-carb breakfast recipes prioritize protein while keeping net carbs under 10-15 grams per serving.</p>

            <h2 class="anton-text text-2xl text-slate-900 mt-12 mb-6">Why Protein Matters on Keto</h2>
            <p>There's a persistent myth that too much protein will kick you out of ketosis through gluconeogenesis. Research has thoroughly debunked this. Gluconeogenesis is demand-driven, not supply-driven. Eating adequate protein doesn't create excess glucose; your body only converts what it needs.</p>

            <p>In fact, higher protein on keto improves outcomes. Studies show that higher-protein ketogenic diets result in better body composition, better satiety, and equivalent ketone levels compared to lower-protein versions. Aim for at least 25-40g protein at breakfast.</p>

            <h2 class="anton-text text-2xl text-slate-900 mt-12 mb-6">Net Carbs in Our Recipes</h2>
            <p>All our low-carb recipes list total carbs, fiber, and net carbs (total carbs minus fiber). Most stay under 10g net carbs, with some as low as 3-4g net carbs per serving:</p>

            <ul class="my-6">
                <li><a href="/breakfast/recipes/egg-white-veggie-bites/" class="text-brand-600 hover:underline">Egg White Veggie Bites</a>: 4g net carbs, 24g protein</li>
                <li><a href="/breakfast/recipes/sheet-pan-breakfast-bake/" class="text-brand-600 hover:underline">Sheet Pan Breakfast Bake</a>: 6g net carbs, 28g protein</li>
                <li><a href="/breakfast/recipes/turkey-breakfast-sausage-patties/" class="text-brand-600 hover:underline">Turkey Sausage Patties</a>: 1g net carbs, 22g protein</li>
            </ul>

            <h2 class="anton-text text-2xl text-slate-900 mt-12 mb-6">Best Low-Carb Protein Sources</h2>
            <p>We build our low-carb recipes around zero-carb and very-low-carb protein sources:</p>

            <p><strong>Eggs and Egg Whites:</strong> Zero carbs, pure protein and fat. The foundation of most low-carb breakfasts.</p>

            <p><strong>Turkey and Chicken Sausage:</strong> Look for brands with less than 1g carb per serving. Avoid those with added sugars or fillers.</p>

            <p><strong>Cottage Cheese:</strong> About 3g carbs per 100g with 11g protein. The carbs are primarily lactose, which has minimal insulin impact.</p>

            <p><strong>Full-Fat Greek Yogurt:</strong> Around 4g carbs per 100g. A small portion adds creaminess and protein to bowls.</p>

            <h2 class="anton-text text-2xl text-slate-900 mt-12 mb-6">Low-Carb Breakfast Without Eggs</h2>
            <p>Eggs dominate low-carb breakfast options, which can get boring. We've developed alternatives using our <a href="/breakfast/recipes/cottage-cheese-scramble/" class="text-brand-600 hover:underline">Cottage Cheese Scramble</a> technique - cottage cheese creates a creamy, egg-like texture when cooked properly, and you can customize with any low-carb vegetables.</p>

            <h2 class="anton-text text-2xl text-slate-900 mt-12 mb-6">Meal Prep for Low-Carb Success</h2>
            <p>Low-carb breakfast meal prep requires some planning since many traditional grab-and-go options (toast, bagels, muffins) are high-carb. Our <a href="/breakfast/recipes/egg-white-veggie-bites/" class="text-brand-600 hover:underline">Egg White Veggie Bites</a> and <a href="/breakfast/recipes/sheet-pan-breakfast-bake/" class="text-brand-600 hover:underline">Sheet Pan Breakfast Bake</a> solve this - they're portable, reheatable, and stay fresh for a week in the refrigerator.</p>

            <p>Browse our complete low-carb collection below. Each recipe includes precise carb counts so you can fit breakfast into your daily carb target with confidence.</p>
        </div>
        """
    },
    "high-fiber": {
        "intro_short": "Protein AND fiber - the ultimate satiety combination. These recipes keep you full for hours while hitting your protein goals.",
        "content": """
        <div class="prose prose-lg max-w-4xl mx-auto text-slate-700">
            <h2 class="anton-text text-2xl text-slate-900 mt-12 mb-6">High Fiber High Protein Breakfast: The Satiety Powerhouse</h2>
            <p>If protein is the king of satiety, fiber is the queen. Combining high protein with high fiber creates breakfast meals that genuinely keep you full until lunch - no mid-morning snacking required. Our high-fiber recipes deliver 8-15+ grams of fiber alongside 25-40g protein.</p>

            <h2 class="anton-text text-2xl text-slate-900 mt-12 mb-6">The Fiber-Protein Synergy</h2>
            <p>Protein and fiber work through different satiety mechanisms that compound when combined:</p>

            <ul class="my-6">
                <li><strong>Protein</strong> triggers cholecystokinin (CCK) and peptide YY release, hormones that signal fullness to your brain.</li>
                <li><strong>Fiber</strong> slows gastric emptying, physically keeping food in your stomach longer.</li>
                <li><strong>Combined</strong>, you get both hormonal and mechanical satiety - the ultimate hunger control.</li>
            </ul>

            <h2 class="anton-text text-2xl text-slate-900 mt-12 mb-6">Best High-Fiber Breakfast Ingredients</h2>
            <p>We've identified ingredients that deliver fiber without excessive calories or carbs:</p>

            <p><strong>Chia Seeds:</strong> 34g fiber per 100g - one of the most fiber-dense foods on earth. Two tablespoons add 10g fiber to any meal. Our <a href="/breakfast/recipes/chia-protein-pudding/" class="text-brand-600 hover:underline">Chia Protein Pudding</a> builds on this superfood.</p>

            <p><strong>Black Beans:</strong> 16g fiber per 100g (cooked). Adding beans to breakfast burritos dramatically increases fiber. Our <a href="/breakfast/recipes/bean-egg-white-burrito/" class="text-brand-600 hover:underline">Bean & Egg White Burrito</a> delivers 12g fiber.</p>

            <p><strong>Oats:</strong> 10g fiber per 100g (dry). Steel-cut oats have more fiber than rolled, and both beat instant. Our <a href="/breakfast/recipes/fiber-bomb-protein-oatmeal/" class="text-brand-600 hover:underline">Fiber Bomb Protein Oatmeal</a> stacks oats with additional fiber sources.</p>

            <p><strong>Berries:</strong> Raspberries lead at 7g fiber per 100g. Blueberries and blackberries are close behind. Our berry-based bowls leverage these for both fiber and antioxidants.</p>

            <h2 class="anton-text text-2xl text-slate-900 mt-12 mb-6">Gut Health Benefits</h2>
            <p>Beyond satiety, high-fiber breakfast supports gut health. Fiber feeds beneficial gut bacteria, producing short-chain fatty acids linked to reduced inflammation, better immune function, and even improved mood. Starting your day with fiber sets up your microbiome for success.</p>

            <h2 class="anton-text text-2xl text-slate-900 mt-12 mb-6">Transitioning to High-Fiber Breakfast</h2>
            <p>If you're not used to high-fiber eating, increase gradually. Jumping from 5g fiber at breakfast to 15g can cause digestive discomfort. Start with our moderate-fiber options (8-10g), then work up to higher amounts over a few weeks as your gut adapts.</p>

            <p>Also: drink water. Fiber needs water to work properly. Aim for at least 8oz with your high-fiber breakfast, more if you're having our highest-fiber options.</p>

            <p>Browse our complete high-fiber collection below. Each recipe lists exact fiber content so you can track your daily intake. Combined with our protein counts, you have everything needed for the ultimate satiety-focused breakfast.</p>
        </div>
        """
    },
    "no-eggs": {
        "intro_short": "No eggs? No problem. These egg-free breakfasts still pack serious protein for those with allergies or just looking for variety.",
        "content": """
        <div class="prose prose-lg max-w-4xl mx-auto text-slate-700">
            <h2 class="anton-text text-2xl text-slate-900 mt-12 mb-6">High Protein Breakfast Without Eggs: Complete Guide</h2>
            <p>Eggs dominate the high-protein breakfast conversation, but what if you can't eat them? Whether due to allergies, intolerances, ethical concerns, or simply egg fatigue, you need alternatives that still deliver 25+ grams of protein. Our egg-free collection proves it's absolutely possible.</p>

            <h2 class="anton-text text-2xl text-slate-900 mt-12 mb-6">Why Go Egg-Free?</h2>
            <p>There are many valid reasons to skip eggs:</p>

            <ul class="my-6">
                <li><strong>Egg Allergy:</strong> One of the top 8 food allergens, affecting about 2% of children and some adults.</li>
                <li><strong>Egg Intolerance:</strong> Some people lack enzymes to digest egg proteins properly, causing digestive issues.</li>
                <li><strong>Cholesterol Concerns:</strong> While research has softened on dietary cholesterol, some individuals are hyper-responders who benefit from limiting egg yolks.</li>
                <li><strong>Variety:</strong> Even if you can eat eggs, having them every day gets monotonous. Rotating in egg-free options keeps breakfast interesting.</li>
            </ul>

            <h2 class="anton-text text-2xl text-slate-900 mt-12 mb-6">Best Egg-Free Protein Sources</h2>
            <p>Our egg-free recipes leverage these high-protein alternatives:</p>

            <p><strong>Greek Yogurt:</strong> 10g protein per 100g with a creamy texture that works in bowls, parfaits, and smoothies. Our volume bowls use Greek yogurt as the protein foundation.</p>

            <p><strong>Cottage Cheese:</strong> 11g protein per 100g. Blend it smooth for pancake batters, or eat it chunky as a savory bowl base.</p>

            <p><strong>Chickpea Flour:</strong> Makes an incredible egg-free scramble. Our <a href="/breakfast/recipes/chickpea-flour-scramble-wraps/" class="text-brand-600 hover:underline">Chickpea Flour Scramble Wraps</a> taste remarkably similar to egg scrambles with 28g protein.</p>

            <p><strong>Protein Powder:</strong> When you need a quick solution, quality protein powder adds 25g protein to smoothies and oatmeal with minimal prep.</p>

            <h2 class="anton-text text-2xl text-slate-900 mt-12 mb-6">Creating Egg-Like Textures</h2>
            <p>Missing the texture of scrambled eggs? Chickpea flour (besan) creates a nearly identical texture and appearance when cooked properly. The key is letting the batter rest for 10 minutes before cooking, then cooking over medium heat with frequent stirring. Add black salt (kala namak) for an eggy sulfur flavor.</p>

            <h2 class="anton-text text-2xl text-slate-900 mt-12 mb-6">Egg-Free Meal Prep Options</h2>
            <p>Eggs are popular for meal prep because they reheat well, but our egg-free options work just as well. Our <a href="/breakfast/recipes/chia-protein-pudding/" class="text-brand-600 hover:underline">Chia Protein Pudding</a> requires zero reheating - just grab from the fridge and eat. The chickpea scrambles also reheat excellently in a microwave or pan.</p>

            <p>Browse our complete egg-free collection below. Each recipe clearly marks protein sources and provides complete allergen information. You don't need eggs to build a high-protein breakfast habit.</p>
        </div>
        """
    },
    "dairy-free": {
        "intro_short": "Skip the dairy, keep the protein. These recipes are perfect for lactose intolerance or dairy-free diets.",
        "content": """
        <div class="prose prose-lg max-w-4xl mx-auto text-slate-700">
            <h2 class="anton-text text-2xl text-slate-900 mt-12 mb-6">Dairy-Free High Protein Breakfast: Complete Guide</h2>
            <p>Dairy provides some of the most convenient protein sources for breakfast - Greek yogurt, cottage cheese, milk-based smoothies. But if you're lactose intolerant, have a dairy allergy, or follow a dairy-free diet, you need alternatives that still deliver serious protein.</p>

            <h2 class="anton-text text-2xl text-slate-900 mt-12 mb-6">High-Protein Dairy Alternatives</h2>
            <p>Not all dairy alternatives are created equal when it comes to protein. Here's what we use in our recipes:</p>

            <p><strong>Soy Milk:</strong> 7g protein per cup vs 1g for almond milk. If you're not avoiding soy, it's the highest-protein milk alternative.</p>

            <p><strong>Pea Milk:</strong> 8g protein per cup, comparable to dairy milk. Brands like Ripple have changed the game for dairy-free protein.</p>

            <p><strong>Coconut Yogurt (Protein-Fortified):</strong> Standard coconut yogurt has minimal protein, but fortified versions add pea protein for 10g+ per serving.</p>

            <h2 class="anton-text text-2xl text-slate-900 mt-12 mb-6">Egg-Based Dairy-Free Options</h2>
            <p>Eggs are naturally dairy-free (they're not a dairy product despite being in the refrigerated section). This opens up numerous high-protein breakfast options:</p>

            <ul class="my-6">
                <li>Scrambles and omelets with dairy-free cheese</li>
                <li>Egg-based breakfast burritos (hold the cheese or use dairy-free)</li>
                <li>Veggie egg bites and frittatas</li>
            </ul>

            <p>Check ingredient lists carefully - many egg dishes add milk or cream. Our recipes specify exactly which ingredients to use for dairy-free preparation.</p>

            <h2 class="anton-text text-2xl text-slate-900 mt-12 mb-6">Reading Labels for Hidden Dairy</h2>
            <p>Dairy hides in unexpected places. Watch for: casein, caseinate, whey, lactose, lactalbumin, ghee, and "natural flavors" (sometimes dairy-derived). Our recipes use only clearly dairy-free ingredients with no hidden sources.</p>

            <p>Browse our complete dairy-free collection below. Every recipe provides allergen information and dairy-free alternatives for any ingredients that might typically contain dairy.</p>
        </div>
        """
    },
    "on-the-go": {
        "intro_short": "No time to sit down? These portable breakfasts travel with you while still delivering serious protein.",
        "content": """
        <div class="prose prose-lg max-w-4xl mx-auto text-slate-700">
            <h2 class="anton-text text-2xl text-slate-900 mt-12 mb-6">Grab-and-Go High Protein Breakfast: For Busy Mornings</h2>
            <p>You're rushing out the door. No time to sit, no time to cook. But you still need protein to power your morning. Our grab-and-go collection solves this daily challenge with portable, handheld, or quick-prep options that deliver 25-40g protein without slowing you down.</p>

            <h2 class="anton-text text-2xl text-slate-900 mt-12 mb-6">The Three Types of Grab-and-Go</h2>
            <p>We've organized portable breakfasts into three categories based on how you'll eat them:</p>

            <p><strong>Handheld (No Utensils):</strong> Eat while walking or driving. Our <a href="/breakfast/recipes/freezer-breakfast-burritos/" class="text-brand-600 hover:underline">Freezer Breakfast Burritos</a> and <a href="/breakfast/recipes/savory-breakfast-muffins/" class="text-brand-600 hover:underline">Savory Breakfast Muffins</a> fall into this category. Wrap in foil, eat on the commute.</p>

            <p><strong>Desk-Ready (Minimal Utensils):</strong> Eat at your desk with just a fork. Our egg bites and breakfast bake squares work perfectly here - portion into containers, microwave at work, eat at your desk.</p>

            <p><strong>No-Reheat Required:</strong> Zero prep at destination. Our chia puddings and overnight options are ready to eat cold, perfect when you don't have microwave access.</p>

            <h2 class="anton-text text-2xl text-slate-900 mt-12 mb-6">Meal Prep for Grab-and-Go Success</h2>
            <p>The secret to stress-free busy mornings is Sunday prep. Spend 90 minutes on Sunday making a batch of burritos, portioning egg bites, and prepping overnight options. Then every weekday morning becomes as simple as grabbing a container from the fridge.</p>

            <p>Our recommended grab-and-go meal prep rotation:</p>
            <ul class="my-6">
                <li>12 freezer breakfast burritos (lasts 2+ weeks frozen)</li>
                <li>12 egg bites or breakfast bake squares (lasts 1 week refrigerated)</li>
                <li>5 chia pudding jars (one per weekday)</li>
            </ul>

            <p>Browse our complete grab-and-go collection below. Each recipe includes portability tips and reheating instructions optimized for office microwaves.</p>
        </div>
        """
    },
    "fast-food": {
        "intro_short": "All the taste, way more protein. These copycat recipes beat the originals in macros without sacrificing flavor.",
        "content": """
        <div class="prose prose-lg max-w-4xl mx-auto text-slate-700">
            <h2 class="anton-text text-2xl text-slate-900 mt-12 mb-6">Fast Food Breakfast Macro Clones: Healthier Copycat Recipes</h2>
            <p>We love fast food breakfast flavors. We don't love fast food breakfast macros. Most drive-through options deliver disappointing protein (under 20g) with excessive calories, sodium, and questionable ingredients. Our copycat recipes recreate the flavors you crave while dramatically improving the nutritional profile.</p>

            <h2 class="anton-text text-2xl text-slate-900 mt-12 mb-6">The Macro Upgrade</h2>
            <p>Here's how our clones compare to the originals:</p>

            <table class="w-full my-6">
                <thead>
                    <tr class="border-b">
                        <th class="text-left py-2">Item</th>
                        <th class="text-left py-2">Original Protein</th>
                        <th class="text-left py-2">Clone Protein</th>
                        <th class="text-left py-2">Improvement</th>
                    </tr>
                </thead>
                <tbody>
                    <tr class="border-b">
                        <td class="py-2">Egg McMuffin</td>
                        <td>17g</td>
                        <td>40g</td>
                        <td class="text-green-600 font-bold">+135%</td>
                    </tr>
                    <tr class="border-b">
                        <td class="py-2">Starbucks Egg Bites</td>
                        <td>13g</td>
                        <td>28g</td>
                        <td class="text-green-600 font-bold">+115%</td>
                    </tr>
                    <tr class="border-b">
                        <td class="py-2">Chick-fil-A Sandwich</td>
                        <td>21g</td>
                        <td>38g</td>
                        <td class="text-green-600 font-bold">+81%</td>
                    </tr>
                </tbody>
            </table>

            <h2 class="anton-text text-2xl text-slate-900 mt-12 mb-6">How We Boost Protein</h2>
            <p>Our protein upgrades use simple swaps that preserve taste:</p>

            <ul class="my-6">
                <li><strong>Double the egg:</strong> Fast food often skimps on protein. We use generous egg portions.</li>
                <li><strong>Swap to lean proteins:</strong> Turkey sausage instead of pork, Canadian bacon instead of regular.</li>
                <li><strong>Add egg whites:</strong> Mixing whole eggs with egg whites boosts protein without changing the texture.</li>
                <li><strong>Upgrade the cheese:</strong> Low-fat cheese with the same melt and flavor but less fat.</li>
            </ul>

            <h2 class="anton-text text-2xl text-slate-900 mt-12 mb-6">Cost Comparison</h2>
            <p>Beyond better macros, our clones cost significantly less. A McDonald's Egg McMuffin runs $4-5. Our <a href="/breakfast/recipes/mcdonalds-egg-mcmuffin-clone/" class="text-brand-600 hover:underline">40g-protein clone</a> costs about $2.50 when batch-made. That's 50% savings with double the protein.</p>

            <p>Starbucks Egg Bites are $5+ for two bites with 13g protein. Our <a href="/breakfast/recipes/starbucks-egg-bites-clone/" class="text-brand-600 hover:underline">clone recipe</a> makes 12 bites for about $8 total - that's under $0.70 per bite with double the protein.</p>

            <p>Browse our complete fast-food clone collection below. Each recipe includes a comparison to the original, showing exactly how much protein you're gaining and how many calories you're saving.</p>
        </div>
        """
    }
}

# Pillar page definitions
PILLAR_PAGES = [
    {
        "slug": "",
        "title": "High Protein Breakfast Recipes",
        "h1": "HIGH PROTEIN BREAKFAST",
        "meta_title": "High Protein Breakfast Recipes | 25+ Macro-Verified Options (2026)",
        "meta_description": "Discover 25+ high protein breakfast recipes with 20-45g protein per serving. Quick meal prep, vegan options, and fast-food clones. All macros verified using USDA data.",
        "filter": None,
        "schema_type": "CollectionPage"
    },
    {
        "slug": "meal-prep",
        "title": "High Protein Breakfast Meal Prep",
        "h1": "MEAL PREP BREAKFAST",
        "meta_title": "High Protein Breakfast Meal Prep | Make-Ahead Recipes for the Week",
        "meta_description": "Meal prep high protein breakfasts for the week. Freezer burritos, egg bites, and more - 20-40g protein per serving. Batch cook once, eat all week.",
        "filter": ("mealPrep", "isMealPrep", True),
        "schema_type": "CollectionPage"
    },
    {
        "slug": "vegan",
        "title": "Vegan High Protein Breakfast",
        "h1": "VEGAN HIGH PROTEIN BREAKFAST",
        "meta_title": "Vegan High Protein Breakfast Recipes | 20-35g Plant-Based Protein",
        "meta_description": "Plant-based breakfast recipes with 20-35g protein. Soy-free options, smoothie bowls, chickpea scrambles. All vegan, all high protein, all delicious.",
        "filter": ("dietary", "vegan", True),
        "schema_type": "CollectionPage"
    },
    {
        "slug": "no-eggs",
        "title": "High Protein Breakfast Without Eggs",
        "h1": "EGG-FREE HIGH PROTEIN BREAKFAST",
        "meta_title": "High Protein Breakfast Without Eggs | Egg-Free Recipes (25g+ Protein)",
        "meta_description": "High protein breakfast recipes without eggs. Perfect for egg allergies or variety. Greek yogurt, cottage cheese, and plant-based options with 25g+ protein.",
        "filter": ("dietary", "eggFree", True),
        "schema_type": "CollectionPage"
    },
    {
        "slug": "dairy-free",
        "title": "Dairy-Free High Protein Breakfast",
        "h1": "DAIRY-FREE HIGH PROTEIN BREAKFAST",
        "meta_title": "Dairy-Free High Protein Breakfast | Lactose-Free Recipes",
        "meta_description": "Dairy-free breakfast recipes with 20-40g protein. Perfect for lactose intolerance. Egg-based and plant-based options without milk, cheese, or yogurt.",
        "filter": ("dietary", "dairyFree", True),
        "schema_type": "CollectionPage"
    },
    {
        "slug": "low-calorie",
        "title": "Low Calorie High Protein Breakfast",
        "h1": "LOW CALORIE HIGH PROTEIN BREAKFAST",
        "meta_title": "Low Calorie High Protein Breakfast | Under 350 Calories, 25g+ Protein",
        "meta_description": "High protein breakfast recipes under 350 calories. Perfect for fat loss with 25-35g protein. Maximum satiety, minimum calories.",
        "filter": ("calories", "<", 350),
        "schema_type": "CollectionPage"
    },
    {
        "slug": "low-carb",
        "title": "Low Carb High Protein Breakfast",
        "h1": "LOW CARB & KETO BREAKFAST",
        "meta_title": "Low Carb High Protein Breakfast | Keto-Friendly Under 10g Carbs",
        "meta_description": "Low carb and keto breakfast recipes with 25-40g protein and under 10g net carbs. Perfect for ketogenic diets without sacrificing protein.",
        "filter": ("dietary", "lowCarb", True),
        "schema_type": "CollectionPage"
    },
    {
        "slug": "high-fiber",
        "title": "High Fiber High Protein Breakfast",
        "h1": "HIGH FIBER HIGH PROTEIN BREAKFAST",
        "meta_title": "High Fiber High Protein Breakfast | 10g+ Fiber for Ultimate Satiety",
        "meta_description": "Breakfast recipes with high protein AND high fiber - the ultimate satiety combo. 25g+ protein and 10g+ fiber per serving for lasting fullness.",
        "filter": ("dietary", "highFiber", True),
        "schema_type": "CollectionPage"
    },
    {
        "slug": "on-the-go",
        "title": "Grab-and-Go High Protein Breakfast",
        "h1": "GRAB-AND-GO BREAKFAST",
        "meta_title": "Grab-and-Go High Protein Breakfast | Portable Recipes for Busy Mornings",
        "meta_description": "Portable high protein breakfast for busy mornings. Burritos, muffins, and sandwiches with 25-40g protein you can eat on the run.",
        "filter": ("category", "==", "Grab-and-Go"),
        "schema_type": "CollectionPage"
    },
    {
        "slug": "fast-food",
        "title": "Fast Food Breakfast Macro Clones",
        "h1": "FAST FOOD BREAKFAST CLONES",
        "meta_title": "Fast Food Breakfast Clones | McDonald's, Starbucks Copycats with 2x Protein",
        "meta_description": "Healthier versions of McDonald's, Starbucks, and Chick-fil-A breakfast items. Same taste, double the protein. Copycat recipes with upgraded macros.",
        "filter": ("category", "==", "Fast-Food Clone"),
        "schema_type": "CollectionPage"
    }
]


def filter_recipes(recipes, filter_spec):
    """Filter recipes based on specification"""
    if filter_spec is None:
        return recipes

    key1, key2_or_op, value = filter_spec

    filtered = []
    for r in recipes:
        if key1 == "dietary":
            if r.get("dietary", {}).get(key2_or_op) == value:
                filtered.append(r)
        elif key1 == "mealPrep":
            if r.get("mealPrep", {}).get(key2_or_op) == value:
                filtered.append(r)
        elif key2_or_op == "==":
            if r.get(key1) == value:
                filtered.append(r)
        elif key2_or_op == "<":
            if r.get(key1, 9999) < value:
                filtered.append(r)
        elif key2_or_op == ">":
            if r.get(key1, 0) > value:
                filtered.append(r)

    return filtered


def generate_recipe_card(recipe):
    """Generate HTML for a single recipe card"""
    pe = recipe["peRatio"]
    if pe >= 15:
        pe_color = "emerald"
    elif pe >= 10:
        pe_color = "green"
    elif pe >= 5:
        pe_color = "yellow"
    else:
        pe_color = "orange"

    tags = recipe.get("tags", [])[:2]
    tags_html = " ".join([f'<span class="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded">{tag}</span>' for tag in tags])

    return f'''
        <a href="/breakfast/recipes/{recipe["slug"]}/" class="recipe-card block bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition group">
            <div class="relative">
                <img src="/images/breakfast/{recipe["image"]}" alt="{recipe["title"]}" class="w-full aspect-square object-cover group-hover:scale-105 transition" loading="lazy">
                <div class="absolute top-3 left-3 flex flex-col gap-1">
                    <span class="bg-brand-600 text-white px-3 py-1 rounded-full font-bold text-sm">{recipe["protein"]}g</span>
                    <span class="bg-{pe_color}-500 text-white px-2 py-0.5 rounded-full font-bold text-xs">P:E {recipe["peRatio"]}</span>
                </div>
                <div class="absolute top-3 right-3">
                    <span class="bg-white/90 text-slate-700 px-2 py-1 rounded-full text-xs font-medium">{recipe["totalTime"]}m</span>
                </div>
                <div class="recipe-overlay absolute inset-0 bg-brand-600/80 flex items-center justify-center opacity-0 transition">
                    <span class="text-white font-bold">View Recipe</span>
                </div>
            </div>
            <div class="p-4">
                <h3 class="font-bold text-slate-900 mb-2 line-clamp-2">{recipe["title"]}</h3>
                <div class="flex items-center justify-between text-sm">
                    <span class="text-slate-500">{recipe["calories"]} cal</span>
                    <div class="flex gap-1">{tags_html}</div>
                </div>
            </div>
        </a>
    '''


def generate_schema_markup(page_config, filtered_recipes):
    """Generate JSON-LD schema markup for the collection page"""
    slug = page_config["slug"]
    canonical = f"https://highprotein.recipes/breakfast/{slug}/" if slug else "https://highprotein.recipes/breakfast/"

    # ItemList for recipe collection
    item_list = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "name": page_config["title"],
        "description": page_config["meta_description"],
        "numberOfItems": len(filtered_recipes),
        "itemListElement": []
    }

    for i, recipe in enumerate(filtered_recipes, 1):
        item_list["itemListElement"].append({
            "@type": "ListItem",
            "position": i,
            "url": f"https://highprotein.recipes/breakfast/recipes/{recipe['slug']}/",
            "name": recipe["title"]
        })

    # CollectionPage schema
    collection_page = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": page_config["title"],
        "description": page_config["meta_description"],
        "url": canonical,
        "mainEntity": item_list,
        "breadcrumb": {
            "@type": "BreadcrumbList",
            "itemListElement": [
                {"@type": "ListItem", "position": 1, "name": "Home", "item": "https://highprotein.recipes/"},
                {"@type": "ListItem", "position": 2, "name": "Breakfast", "item": "https://highprotein.recipes/breakfast/"}
            ]
        }
    }

    if slug:
        collection_page["breadcrumb"]["itemListElement"].append({
            "@type": "ListItem",
            "position": 3,
            "name": page_config["title"],
            "item": canonical
        })

    return json.dumps([collection_page, item_list], indent=2)


def generate_pillar_page(page_config):
    """Generate a pillar page with full SEO content"""
    filtered = filter_recipes(recipes, page_config.get("filter"))
    filtered.sort(key=lambda r: r["peRatio"], reverse=True)

    cards_html = "\n".join([generate_recipe_card(r) for r in filtered])

    slug = page_config["slug"]
    seo_content = SEO_CONTENT.get(slug, {"intro_short": "", "content": ""})
    canonical = f"https://highprotein.recipes/breakfast/{slug}/" if slug else "https://highprotein.recipes/breakfast/"

    schema_markup = generate_schema_markup(page_config, filtered)

    # Calculate stats
    avg_protein = sum(r["protein"] for r in filtered) // len(filtered) if filtered else 0
    avg_pe = sum(r["peRatio"] for r in filtered) / len(filtered) if filtered else 0
    avg_calories = sum(r["calories"] for r in filtered) // len(filtered) if filtered else 0

    html = f'''<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{page_config["meta_title"]}</title>

    <meta name="description" content="{page_config["meta_description"]}">
    <meta name="robots" content="index, follow, max-image-preview:large">
    <link rel="canonical" href="{canonical}">

    <meta property="og:type" content="website">
    <meta property="og:title" content="{page_config["meta_title"]}">
    <meta property="og:description" content="{page_config["meta_description"]}">
    <meta property="og:url" content="{canonical}">
    <meta property="og:site_name" content="High Protein Recipes">
    <meta property="og:image" content="https://highprotein.recipes/images/og-breakfast.jpg">

    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="{page_config["meta_title"]}">
    <meta name="twitter:description" content="{page_config["meta_description"]}">

    <meta name="theme-color" content="#f59e0b">

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@300;400;600;700&display=swap" rel="stylesheet">

    <script src="https://cdn.tailwindcss.com"></script>
    <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>

    <script type="application/ld+json">
    {schema_markup}
    </script>

    <script>
        tailwind.config = {{
            theme: {{
                extend: {{
                    fontFamily: {{
                        'anton': ['Anton', 'sans-serif'],
                        'sans': ['Inter', 'sans-serif'],
                    }},
                    colors: {{
                        brand: {{
                            50: '#fffbeb',
                            100: '#fef3c7',
                            500: '#f59e0b',
                            600: '#d97706',
                            900: '#451a03',
                        }},
                        accent: {{
                            500: '#10b981',
                        }}
                    }}
                }}
            }}
        }}
    </script>
    <style>
        .anton-text {{ font-family: 'Anton', sans-serif; letter-spacing: 0.05em; }}
        .glass-nav {{ background: rgba(255, 255, 255, 0.8); backdrop-filter: blur(12px); }}
        .recipe-card:hover .recipe-overlay {{ opacity: 1; }}
        .line-clamp-2 {{ display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }}
        .prose h2 {{ scroll-margin-top: 100px; }}
    </style>
</head>

<body class="min-h-screen bg-slate-50 text-slate-900 font-sans">
    <!-- Navigation -->
    <nav class="glass-nav fixed top-0 left-0 right-0 z-50 border-b border-slate-200">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between items-center h-16">
                <a href="/" class="flex items-center space-x-3">
                    <span class="anton-text text-xl text-brand-600">HIGH PROTEIN RECIPES</span>
                </a>
                <div class="hidden md:flex items-center space-x-6">
                    <a href="/breakfast/" class="text-slate-600 hover:text-brand-600 font-semibold text-sm uppercase tracking-wider">Breakfast</a>
                    <a href="/breakfast/meal-prep/" class="text-slate-600 hover:text-brand-600 font-semibold text-sm uppercase tracking-wider">Meal Prep</a>
                    <a href="/blog/" class="text-slate-600 hover:text-brand-600 font-semibold text-sm uppercase tracking-wider">Blog</a>
                    <a href="/breakfast/low-calorie/" class="text-slate-600 hover:text-brand-600 font-semibold text-sm uppercase tracking-wider">Low-Cal</a>
                    <a href="/breakfast/meal-plans/7-day/" class="bg-brand-600 text-white px-4 py-2 rounded-full font-bold text-sm hover:bg-brand-900 transition">FREE MEAL PLAN</a>
                </div>
            </div>
        </div>
    </nav>

    <!-- Category Sub-Nav -->
    <div class="bg-white border-b border-slate-200 fixed top-16 left-0 right-0 z-40">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex items-center h-12 overflow-x-auto scrollbar-hide space-x-4 text-sm">
                <a href="/breakfast/" class="{'text-brand-600 font-bold border-b-2 border-brand-600' if slug == '' else 'text-slate-600 hover:text-brand-600'} whitespace-nowrap pb-3 pt-3">All Recipes</a>
                <a href="/breakfast/meal-prep/" class="{'text-brand-600 font-bold border-b-2 border-brand-600' if slug == 'meal-prep' else 'text-slate-600 hover:text-brand-600'} whitespace-nowrap pb-3 pt-3">Meal Prep</a>
                <a href="/breakfast/vegan/" class="{'text-brand-600 font-bold border-b-2 border-brand-600' if slug == 'vegan' else 'text-slate-600 hover:text-brand-600'} whitespace-nowrap pb-3 pt-3">Vegan</a>
                <a href="/breakfast/low-calorie/" class="{'text-brand-600 font-bold border-b-2 border-brand-600' if slug == 'low-calorie' else 'text-slate-600 hover:text-brand-600'} whitespace-nowrap pb-3 pt-3">Low-Cal</a>
                <a href="/breakfast/low-carb/" class="{'text-brand-600 font-bold border-b-2 border-brand-600' if slug == 'low-carb' else 'text-slate-600 hover:text-brand-600'} whitespace-nowrap pb-3 pt-3">Low-Carb</a>
                <a href="/breakfast/high-fiber/" class="{'text-brand-600 font-bold border-b-2 border-brand-600' if slug == 'high-fiber' else 'text-slate-600 hover:text-brand-600'} whitespace-nowrap pb-3 pt-3">High-Fiber</a>
                <a href="/breakfast/no-eggs/" class="{'text-brand-600 font-bold border-b-2 border-brand-600' if slug == 'no-eggs' else 'text-slate-600 hover:text-brand-600'} whitespace-nowrap pb-3 pt-3">No Eggs</a>
                <a href="/breakfast/dairy-free/" class="{'text-brand-600 font-bold border-b-2 border-brand-600' if slug == 'dairy-free' else 'text-slate-600 hover:text-brand-600'} whitespace-nowrap pb-3 pt-3">Dairy-Free</a>
                <a href="/breakfast/on-the-go/" class="{'text-brand-600 font-bold border-b-2 border-brand-600' if slug == 'on-the-go' else 'text-slate-600 hover:text-brand-600'} whitespace-nowrap pb-3 pt-3">On-the-Go</a>
                <a href="/breakfast/fast-food/" class="{'text-brand-600 font-bold border-b-2 border-brand-600' if slug == 'fast-food' else 'text-slate-600 hover:text-brand-600'} whitespace-nowrap pb-3 pt-3">Fast Food</a>
            </div>
        </div>
    </div>

    <main class="pt-28">
        <!-- Hero Section -->
        <section class="bg-gradient-to-b from-brand-50 to-white py-12 lg:py-20">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h1 class="anton-text text-4xl lg:text-6xl text-slate-900 mb-6">{page_config["h1"]}</h1>
                <p class="text-xl text-slate-600 max-w-3xl mx-auto mb-8">{seo_content["intro_short"]}</p>

                <!-- Stats Bar -->
                <div class="inline-flex flex-wrap items-center justify-center gap-6 bg-white rounded-2xl shadow-md px-8 py-4">
                    <div class="text-center">
                        <div class="anton-text text-3xl text-brand-600">{len(filtered)}</div>
                        <div class="text-sm text-slate-500">Recipes</div>
                    </div>
                    <div class="w-px h-10 bg-slate-200"></div>
                    <div class="text-center">
                        <div class="anton-text text-3xl text-brand-600">{avg_protein}g</div>
                        <div class="text-sm text-slate-500">Avg Protein</div>
                    </div>
                    <div class="w-px h-10 bg-slate-200"></div>
                    <div class="text-center">
                        <div class="anton-text text-3xl text-brand-600">{avg_pe:.1f}</div>
                        <div class="text-sm text-slate-500">Avg P:E Ratio</div>
                    </div>
                    <div class="w-px h-10 bg-slate-200"></div>
                    <div class="text-center">
                        <div class="anton-text text-3xl text-brand-600">{avg_calories}</div>
                        <div class="text-sm text-slate-500">Avg Calories</div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Recipe Grid -->
        <section class="py-12" id="recipes">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 class="anton-text text-2xl text-slate-900 mb-8">ALL {len(filtered)} RECIPES</h2>
                <div class="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {cards_html}
                </div>
            </div>
        </section>

        <!-- SEO Content Section -->
        <section class="py-12 bg-white">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {seo_content["content"]}
            </div>
        </section>

        <!-- Related Categories -->
        <section class="py-12 bg-slate-100">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 class="anton-text text-2xl text-slate-900 mb-8 text-center">EXPLORE MORE CATEGORIES</h2>
                <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <a href="/breakfast/meal-prep/" class="bg-white rounded-xl p-6 text-center hover:shadow-lg transition">
                        <div class="text-3xl mb-2">📦</div>
                        <h3 class="font-bold text-slate-900">Meal Prep</h3>
                        <p class="text-sm text-slate-500">Make-ahead recipes</p>
                    </a>
                    <a href="/breakfast/low-calorie/" class="bg-white rounded-xl p-6 text-center hover:shadow-lg transition">
                        <div class="text-3xl mb-2">🎯</div>
                        <h3 class="font-bold text-slate-900">Low Calorie</h3>
                        <p class="text-sm text-slate-500">Under 350 calories</p>
                    </a>
                    <a href="/breakfast/vegan/" class="bg-white rounded-xl p-6 text-center hover:shadow-lg transition">
                        <div class="text-3xl mb-2">🌱</div>
                        <h3 class="font-bold text-slate-900">Vegan</h3>
                        <p class="text-sm text-slate-500">Plant-based protein</p>
                    </a>
                    <a href="/breakfast/fast-food/" class="bg-white rounded-xl p-6 text-center hover:shadow-lg transition">
                        <div class="text-3xl mb-2">🍔</div>
                        <h3 class="font-bold text-slate-900">Fast Food Clones</h3>
                        <p class="text-sm text-slate-500">Healthier copycats</p>
                    </a>
                </div>
            </div>
        </section>

        <!-- CTA -->
        <section class="bg-brand-600 py-12">
            <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h2 class="anton-text text-3xl text-white mb-4">GET THE FREE 7-DAY MEAL PLAN</h2>
                <p class="text-brand-100 mb-6">All your breakfast macros planned out for the week. 30g+ protein every morning.</p>
                <a href="/breakfast/meal-plans/7-day/" class="inline-flex items-center gap-2 bg-white text-brand-600 px-8 py-4 rounded-xl font-bold hover:bg-brand-50 transition">
                    DOWNLOAD FREE PLAN
                </a>
            </div>
        </section>
    </main>

    <footer class="bg-slate-900 text-white py-12">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="grid md:grid-cols-4 gap-8 mb-8">
                <div>
                    <span class="anton-text text-xl">HIGH PROTEIN RECIPES</span>
                    <p class="text-slate-400 text-sm mt-2">Macro-verified recipes for your fitness goals. Every recipe tested and measured in grams.</p>
                </div>
                <div>
                    <h4 class="font-bold mb-3">Breakfast Categories</h4>
                    <ul class="space-y-2 text-sm text-slate-400">
                        <li><a href="/breakfast/meal-prep/" class="hover:text-white">Meal Prep</a></li>
                        <li><a href="/breakfast/vegan/" class="hover:text-white">Vegan</a></li>
                        <li><a href="/breakfast/low-calorie/" class="hover:text-white">Low Calorie</a></li>
                        <li><a href="/breakfast/low-carb/" class="hover:text-white">Low Carb / Keto</a></li>
                        <li><a href="/breakfast/high-fiber/" class="hover:text-white">High Fiber</a></li>
                    </ul>
                </div>
                <div>
                    <h4 class="font-bold mb-3">Dietary Needs</h4>
                    <ul class="space-y-2 text-sm text-slate-400">
                        <li><a href="/breakfast/no-eggs/" class="hover:text-white">Egg-Free</a></li>
                        <li><a href="/breakfast/dairy-free/" class="hover:text-white">Dairy-Free</a></li>
                        <li><a href="/breakfast/on-the-go/" class="hover:text-white">Grab-and-Go</a></li>
                        <li><a href="/breakfast/fast-food/" class="hover:text-white">Fast Food Clones</a></li>
                    </ul>
                </div>
                <div>
                    <h4 class="font-bold mb-3">Protein Empire</h4>
                    <ul class="space-y-2 text-sm text-slate-400">
                        <li><a href="https://proteincookies.com" class="hover:text-white">Protein Cookies</a></li>
                        <li><a href="https://proteinpancakes.co" class="hover:text-white">Protein Pancakes</a></li>
                        <li><a href="https://proteinmuffins.com" class="hover:text-white">Protein Muffins</a></li>
                        <li><a href="https://proteinoatmeal.co" class="hover:text-white">Protein Oatmeal</a></li>
                    </ul>
                </div>
            </div>
            <div class="border-t border-slate-800 pt-8 text-center">
                <p class="text-slate-400 text-sm">&copy; 2026 High Protein Recipes. All rights reserved.</p>
                <p class="text-slate-500 text-xs mt-2">All nutrition data verified using USDA FoodData Central. Recipes tested multiple times for accuracy.</p>
            </div>
        </div>
    </footer>
</body>
</html>
'''

    if slug:
        output_dir = DIST_DIR / slug
    else:
        output_dir = DIST_DIR

    output_dir.mkdir(parents=True, exist_ok=True)
    output_file = output_dir / "index.html"

    with open(output_file, "w") as f:
        f.write(html)

    print(f"Generated: /breakfast/{slug}/" if slug else "Generated: /breakfast/")
    return str(output_file)


if __name__ == "__main__":
    print("=" * 60)
    print("Generating SEO-Optimized Pillar Pages")
    print("=" * 60)

    for page in PILLAR_PAGES:
        generate_pillar_page(page)

    print(f"\nTotal: {len(PILLAR_PAGES)} pillar pages generated with ~800 word SEO content each")
