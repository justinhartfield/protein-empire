#!/usr/bin/env node
/**
 * Build script for HighProtein.Recipes - The Indexer Site
 * 
 * This site aggregates preview content from all 12 protein sites
 * and links visitors to the full recipes on individual sites.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import ejs from 'ejs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

// Import site configuration
import { getSite, empireSites } from '../packages/config/sites.js';

const DOMAIN = 'highprotein.recipes';

/**
 * SEO Content for category and ingredient pages
 * Approximately 800 words each for search engine optimization
 */
const SEO_CONTENT = {
  // Category pages
  'category-breakfast': {
    title: 'The Ultimate Guide to High-Protein Breakfast',
    sections: [
      {
        heading: 'Why Protein at Breakfast Matters',
        content: `Starting your day with adequate protein is one of the most impactful nutritional decisions you can make. Research consistently shows that a high-protein breakfast helps regulate appetite hormones like ghrelin and peptide YY, keeping you fuller for longer and reducing the urge to snack mid-morning. For those focused on body composition, morning protein consumption supports muscle protein synthesis during the critical post-sleep window when your body is primed for nutrient uptake.

The typical American breakfast—cereal, toast, or pastries—delivers mostly carbohydrates with minimal protein, often leaving you hungry within hours. By contrast, a breakfast containing 25-40 grams of protein stabilizes blood sugar levels, prevents energy crashes, and provides sustained mental clarity throughout your morning. Whether you're an athlete looking to optimize recovery, someone managing their weight, or simply wanting more energy, prioritizing protein at breakfast creates a foundation for better choices all day long.`
      },
      {
        heading: 'High-Protein Breakfast Options Beyond Eggs',
        content: `While eggs are a breakfast staple, the world of high-protein morning meals extends far beyond the traditional scramble. Protein pancakes and waffles have revolutionized breakfast, delivering 20-40 grams of protein per serving while satisfying your craving for something sweet and indulgent. Made with protein powder, cottage cheese, or Greek yogurt, these breakfast favorites prove that hitting your macros doesn't mean sacrificing taste.

Overnight oats and proats (protein oats) offer a convenient make-ahead option perfect for busy mornings. By combining oats with protein powder, Greek yogurt, or egg whites, you create a balanced meal that's ready when you wake up. Protein muffins provide grab-and-go convenience without the sugar crash of traditional bakery items. For those who prefer savory mornings, high-protein breakfast burritos, egg white wraps, and cottage cheese bowls deliver substantial protein while keeping calories in check.`
      },
      {
        heading: 'Building Your Perfect Protein Breakfast',
        content: `Creating an optimal high-protein breakfast comes down to combining quality protein sources with complementary ingredients. Start with a protein base: eggs, egg whites, Greek yogurt, cottage cheese, or protein powder. Add complex carbohydrates like oats, whole grain bread, or fruit for sustained energy. Include healthy fats from sources like nuts, seeds, or avocado to enhance satiety and nutrient absorption.

Meal prep is your secret weapon for consistent high-protein breakfasts. Batch-cook protein muffins or egg bites on Sunday, prepare overnight oats in mason jars, or freeze breakfast burritos for quick reheating. When time is truly limited, a protein shake blended with fruit and nut butter takes under two minutes and delivers 30+ grams of protein. The key is having options ready so that a protein-rich breakfast becomes your default, not an afterthought.`
      }
    ]
  },
  'category-desserts': {
    title: 'Macro-Friendly Desserts That Satisfy',
    sections: [
      {
        heading: 'Rethinking Dessert for Your Fitness Goals',
        content: `The belief that desserts and fitness goals can't coexist is outdated. Modern macro-conscious baking has created an entirely new category of treats that deliver genuine satisfaction while supporting your nutritional objectives. High-protein desserts aren't about deprivation or settling for cardboard-tasting alternatives—they're about using smarter ingredients to create genuinely delicious treats that happen to fit your macros.

Traditional desserts rely heavily on sugar, refined flour, and butter, delivering empty calories with minimal nutritional benefit. By substituting protein powder, Greek yogurt, cottage cheese, and alternative flours, you can create cookies, brownies, cheesecakes, and puddings that provide 15-30 grams of protein per serving. These swaps don't just add protein—they often reduce sugar and increase fiber, making your desserts more satiating and less likely to trigger overconsumption.`
      },
      {
        heading: 'Popular High-Protein Dessert Categories',
        content: `Protein cookies have become a staple for macro-conscious eaters, offering the nostalgic comfort of fresh-baked cookies with a fraction of the sugar and a significant protein boost. From classic chocolate chip to peanut butter and snickerdoodle, virtually every cookie variety can be reimagined with protein-forward ingredients. Protein brownies deliver fudgy, chocolatey satisfaction—often with black beans, avocado, or Greek yogurt creating that dense, moist texture traditionally achieved with excessive butter.

Protein cheesecakes and mousse-style desserts showcase how cottage cheese and Greek yogurt can transform into creamy, indulgent treats. No-bake options are particularly popular, requiring minimal effort while delivering maximum flavor. Protein puddings and chia puddings offer portion-controlled sweetness perfect for satisfying late-night cravings without derailing your progress. Donuts, often considered off-limits, get a healthy makeover through baking instead of frying and incorporating protein-rich batters.`
      },
      {
        heading: 'Tips for Successful Protein Baking',
        content: `Baking with protein powder requires understanding how it behaves differently from traditional flour. Protein powder absorbs more liquid, so recipes typically need additional moisture from ingredients like Greek yogurt, applesauce, or mashed banana. Overbaking is the enemy of protein desserts—they continue cooking after removal from the oven, so pull them slightly earlier than you think necessary for optimal texture.

Flavor variety keeps protein desserts exciting. Experiment with different protein powder flavors—vanilla works as a neutral base, while chocolate, peanut butter, and specialty flavors like birthday cake or cinnamon roll add instant variety. Don't forget mix-ins: sugar-free chocolate chips, chopped nuts, dried fruit, and flavor extracts can transform a basic recipe into something special. Most importantly, measure accurately. Protein baking is more sensitive to ratios than traditional baking, so invest in a kitchen scale for consistent results.`
      }
    ]
  },
  'category-snacks': {
    title: 'High-Protein Snacks for Sustained Energy',
    sections: [
      {
        heading: 'The Role of Protein Snacks in Your Diet',
        content: `Strategic snacking is an underrated tool for meeting your protein goals and maintaining stable energy throughout the day. Rather than reaching for chips, crackers, or candy that spike blood sugar and leave you hungrier than before, high-protein snacks provide sustained fuel that keeps you satisfied between meals. For those eating in a caloric deficit, protein-rich snacks help preserve muscle mass while supporting fat loss. For athletes and active individuals, they provide convenient opportunities to hit elevated protein targets.

The ideal protein snack delivers 10-20 grams of protein without excessive calories or added sugars. This combination ensures you're getting meaningful nutritional value without consuming a meal's worth of calories. Portable options are particularly valuable—life doesn't always allow for sit-down meals, and having protein-rich snacks available prevents poor choices when hunger strikes unexpectedly.`
      },
      {
        heading: 'Homemade vs. Store-Bought Protein Snacks',
        content: `While the market for protein snacks has exploded, store-bought options often come with drawbacks: high prices, artificial ingredients, and sugar alcohols that cause digestive issues for many people. Making your own protein snacks at home offers complete control over ingredients, significant cost savings, and the ability to customize flavors to your preferences. A batch of homemade protein balls costs a fraction of packaged alternatives and can be made in under 15 minutes.

Protein bars represent perhaps the best case for homemade preparation. Commercial bars often contain 20+ ingredients, including preservatives, fillers, and sweeteners you'd rather avoid. Homemade versions typically require just 5-8 whole-food ingredients and taste fresher and more satisfying. Protein bites and energy balls are even simpler—most recipes are no-bake, requiring only mixing and refrigeration. These snacks keep well in the fridge for a week or can be frozen for longer storage.`
      },
      {
        heading: 'Smart Snacking Strategies',
        content: `Timing your protein snacks strategically maximizes their benefit. Pre-workout snacks consumed 30-60 minutes before training provide amino acids for muscle protection during exercise. Post-workout snacks help initiate recovery, especially if a full meal isn't immediately possible. Mid-afternoon snacks combat the energy slump that leads many people to sugary pick-me-ups or excessive caffeine.

Portion control matters even with healthy snacks—they're meant to bridge meals, not replace them. Pre-portioning snacks into individual servings prevents mindless overeating and ensures you know exactly what you're consuming. Keep protein snacks visible and accessible: a container on your desk, stashed in your gym bag, or ready in the car. When the healthy option is the convenient option, good choices become automatic.`
      }
    ]
  },
  'category-savory': {
    title: 'Savory High-Protein Recipes',
    sections: [
      {
        heading: 'Beyond Sweet: The Savory Protein Revolution',
        content: `While protein powder often conjures images of sweet shakes and desserts, the savory application of high-protein cooking has expanded dramatically. For those who don't have a sweet tooth or simply want more variety, savory protein recipes offer equally satisfying options for meeting your macros. From protein-enriched pizza crusts to high-protein bread and savory baked goods, this category proves that prioritizing protein doesn't mean living on sweet flavors alone.

Savory high-protein recipes often rely on different protein sources than their sweet counterparts. Instead of whey or casein powder, savory dishes frequently feature cottage cheese, Greek yogurt, eggs, and cheese as their protein foundation. Chickpea flour, almond flour, and other alternative flours add protein while creating textures similar to traditional baked goods. The result is comfort food reimagined—satisfying your cravings while supporting your fitness goals.`
      },
      {
        heading: 'High-Protein Pizza and Flatbreads',
        content: `Pizza doesn't have to be a cheat meal when you build it on a high-protein crust. Protein pizza crusts made with cottage cheese, eggs, and cheese deliver 20-30 grams of protein before you even add toppings. Greek yogurt dough creates surprisingly authentic flatbreads with a fraction of the carbs and significantly more protein than traditional versions. These crusts crisp up beautifully and hold toppings just like conventional pizza.

The beauty of protein pizza is its versatility. Load it with vegetables and lean proteins for an even more macro-friendly meal, or keep it simple with classic toppings—the crust itself has already done the heavy lifting nutritionally. Many recipes freeze well, allowing you to prep crusts in advance for quick weeknight dinners that feel indulgent but align with your goals.`
      },
      {
        heading: 'Protein Bread and Beyond',
        content: `High-protein bread solves one of the biggest challenges for macro-conscious eaters: enjoying sandwiches, toast, and bread-based meals without the blood sugar spike and minimal nutrition of standard bread. Protein bread recipes incorporate eggs, protein powder, Greek yogurt, or cottage cheese to deliver 8-15 grams of protein per slice—compared to just 3-4 grams in typical bread.

Bagels, rolls, and wraps get the same treatment, making it possible to enjoy your favorite bread formats with dramatically improved nutrition. Many protein bread recipes require no yeast and minimal rising time, making them faster to prepare than traditional bread baking. The texture may differ slightly from wheat bread, but many people come to prefer the denser, more satisfying quality of protein-enriched versions. Toast with nut butter becomes a legitimate high-protein meal when the bread itself contributes meaningful protein.`
      }
    ]
  },
  // Ingredient pages
  'ingredient-protein-powder': {
    title: 'Cooking and Baking with Protein Powder',
    sections: [
      {
        heading: 'Choosing the Right Protein Powder for Recipes',
        content: `Not all protein powders perform equally in cooking and baking. Whey protein concentrate is the most versatile option, providing good texture and flavor in most applications. Whey isolate works well but can dry out baked goods more quickly due to its lower fat content. Casein protein creates denser, chewier textures ideal for protein bars and no-bake treats. Plant-based options like pea, rice, or blends require recipe adjustments due to their different absorption properties and flavors.

Flavor selection significantly impacts your results. Vanilla protein serves as a neutral base that works in virtually any recipe, from pancakes to cookies to savory applications. Chocolate protein adds instant cocoa flavor without extra ingredients. Unflavored protein offers the most versatility but requires you to build flavor through other ingredients. Specialty flavors like peanut butter, cinnamon roll, or fruity varieties can create unique recipes but may limit flexibility.`
      },
      {
        heading: 'Protein Powder Baking Science',
        content: `Understanding how protein powder behaves in recipes prevents common failures. Protein powder absorbs significantly more liquid than flour—typically 2-3 times more—so recipes need additional moisture. This is why successful protein recipes often include Greek yogurt, mashed banana, applesauce, or extra eggs. Without adequate moisture, your baked goods will be dry, crumbly, and unpleasant.

Heat affects protein powder differently than flour. Overheating causes protein to become tough and rubbery—this is why protein baked goods should be removed from the oven slightly underdone. They'll continue cooking from residual heat and firm up as they cool. Using lower oven temperatures (325-350°F instead of 375°F) and shorter baking times yields better results. Letting baked goods rest before cutting or eating allows proteins to set properly.`
      },
      {
        heading: 'Beyond Baking: Creative Protein Powder Uses',
        content: `Protein powder's utility extends far beyond traditional shakes and baked goods. Protein oatmeal (proats) transforms breakfast by stirring protein powder into cooked oats—add it after removing from heat to prevent clumping. Protein coffee, made by blending protein powder into your morning brew, combines caffeine and protein in one efficient drink. Greek yogurt bowls get an extra boost from a scoop of matching-flavored protein.

Savory applications are often overlooked. Unflavored protein powder can be added to soups, sauces, and even mashed vegetables to increase protein content without affecting taste. Protein powder works in homemade pasta dough, adding nutrition to a traditionally carb-heavy food. The key to savory use is choosing unflavored varieties and adding powder to recipes where it can be fully incorporated rather than detected as a distinct ingredient.`
      }
    ]
  },
  'ingredient-greek-yogurt': {
    title: 'Greek Yogurt: The Ultimate Protein Ingredient',
    sections: [
      {
        heading: 'Why Greek Yogurt Dominates Protein Cooking',
        content: `Greek yogurt has earned its status as a kitchen staple for health-conscious cooks. With 15-20 grams of protein per cup (compared to 8-9 grams in regular yogurt), it delivers substantial protein in a versatile, affordable format. The straining process that creates Greek yogurt's thick texture also concentrates its protein while reducing lactose, making it easier to digest for many people. Its tangy flavor and creamy consistency make it invaluable in both sweet and savory applications.

Beyond protein content, Greek yogurt brings functional benefits to recipes. It adds moisture to baked goods, creates tender crumbs in muffins and cakes, and can replace some or all of the oil or butter in many recipes—reducing calories while maintaining texture. The acidity activates baking soda, contributing to lift in baked goods. In no-bake applications, it provides creaminess comparable to much higher-calorie ingredients like cream cheese or heavy cream.`
      },
      {
        heading: 'Greek Yogurt in Sweet Recipes',
        content: `Protein pancakes and waffles achieve their signature fluffy-yet-substantial texture largely thanks to Greek yogurt. It adds body without heaviness, keeps the inside moist while the outside crisps, and contributes protein alongside eggs and protein powder. The slight tanginess balances sweetness, preventing that cloying quality some protein baked goods can have.

Smoothie bowls and parfaits showcase Greek yogurt as the star ingredient rather than a supporting player. Frozen and blended, it creates ice cream-like consistency without the sugar and fat of actual ice cream. Layered with granola and fruit, it becomes a satisfying meal or snack. Protein cheesecakes and mousse desserts rely on Greek yogurt for their creamy texture, often combined with cottage cheese for even higher protein content. Even simple preparations—yogurt with honey and nuts, or mixed with protein powder and frozen into bark—make satisfying treats.`
      },
      {
        heading: 'Savory Greek Yogurt Applications',
        content: `Greek yogurt's savory potential often goes unexplored. As a sour cream substitute, it brings more protein and fewer calories to tacos, baked potatoes, and dips. Mixed with herbs and spices, it becomes high-protein sauces, dressings, and marinades. The acidity helps tenderize meat, making Greek yogurt an excellent base for marinades that do double duty.

Two-ingredient dough—Greek yogurt combined with self-rising flour—has revolutionized easy bread-making. This simple combination produces bagels, flatbreads, pizza dough, and rolls with significantly more protein than standard versions. The dough comes together in minutes, requires no yeast or rising time, and produces surprisingly authentic results. For those avoiding traditional flour, Greek yogurt combines equally well with almond flour or protein powder for low-carb alternatives.`
      }
    ]
  },
  'ingredient-cottage-cheese': {
    title: 'Cottage Cheese: The Underrated Protein Powerhouse',
    sections: [
      {
        heading: 'Cottage Cheese Renaissance in Modern Cooking',
        content: `Cottage cheese is experiencing a well-deserved revival among fitness-focused cooks. With 24-28 grams of protein per cup and a mild flavor that blends seamlessly into recipes, it's one of the most efficient protein sources available. Once relegated to diet plates of the 1980s, cottage cheese has been rediscovered as a versatile ingredient that can be transformed into everything from ice cream to alfredo sauce. Its high casein content provides slow-digesting protein, making it particularly valuable for overnight recipes and evening snacks.

The key to loving cottage cheese in recipes is understanding how to use it. Blended smooth, it becomes virtually undetectable while adding creaminess and protein to smoothies, dips, and baked goods. The curds can be embraced for texture in dishes like scrambled eggs, grain bowls, and toast toppings. Small curd varieties blend more smoothly; large curd works better when you want distinct texture. Low-fat versions work well in most recipes, though full-fat provides richer flavor in certain applications.`
      },
      {
        heading: 'Cottage Cheese in Breakfast and Desserts',
        content: `Cottage cheese pancakes represent perhaps the most popular application, producing fluffy, protein-rich cakes with minimal ingredients. Blended with eggs and oats (or just eggs for lower carb), cottage cheese creates a batter that yields surprisingly normal-tasting pancakes with 25+ grams of protein per serving. The same base works for waffles, crepes, and even protein muffins.

Blended cottage cheese transforms into "nice cream"—frozen desserts with ice cream's texture and fraction of the calories. Combined with frozen fruit and sweetener, it churns into soft-serve consistency straight from the food processor. Cottage cheese cheesecake, whether baked or no-bake, delivers the classic creamy tang with dramatically improved nutrition. For simple snacking, cottage cheese bowls topped with fruit, nuts, honey, or even savory additions like everything bagel seasoning provide satisfying, protein-packed options.`
      },
      {
        heading: 'Savory Cottage Cheese Creations',
        content: `Cottage cheese alfredo sauce has converted countless skeptics. Blended until smooth with garlic, parmesan, and pasta water, it creates a creamy sauce with 15+ grams of protein per serving instead of the butter-and-cream original's minimal protein content. The technique works for any creamy sauce—blend cottage cheese as your base, then season appropriately for the dish.

Scrambled eggs gain extra protein and creamier texture from cottage cheese stirred in during cooking. Dips and spreads benefit from cottage cheese's protein boost while maintaining crowd-pleasing creaminess. Lasagna and stuffed shells traditionally use ricotta, but cottage cheese—blended or with curds intact—provides more protein with similar flavor and texture. Even pizza gets the cottage cheese treatment, with blended cottage cheese creating high-protein "cheese" sauces for topping.`
      }
    ]
  },
  'ingredient-oats': {
    title: 'Oats in High-Protein Cooking',
    sections: [
      {
        heading: 'Oats as a Protein-Boosting Foundation',
        content: `Oats might not be the first ingredient that comes to mind for high-protein cooking, but they serve as an ideal foundation for protein-rich recipes. With 5-6 grams of protein per half-cup serving, oats provide more protein than most grains. More importantly, they combine beautifully with high-protein additions like protein powder, Greek yogurt, and eggs, creating satisfying meals and baked goods that deliver substantial protein without tasting like "health food."

Beyond their protein contribution, oats bring fiber, complex carbohydrates, and beta-glucans that support heart health and stable energy levels. They add body and texture to smoothies, create chewy structure in baked goods, and serve as the base for countless make-ahead breakfast options. Ground into flour, oats replace some or all wheat flour in recipes, adding nutrition and creating tender crumbs in protein muffins, pancakes, and cookies.`
      },
      {
        heading: 'Protein Oatmeal Variations',
        content: `Proats—protein-enhanced oatmeal—has become a staple breakfast for fitness enthusiasts. The basic formula is simple: cook oats as usual, then stir in protein powder after removing from heat (adding protein powder to boiling liquid creates clumps and affects texture). The result is a creamy, satisfying bowl with 30+ grams of protein that keeps you full for hours.

Overnight protein oats eliminate morning cooking entirely. Combine oats with protein powder, Greek yogurt or milk, and desired mix-ins in a jar, refrigerate overnight, and wake up to ready-to-eat breakfast. The oats soften without cooking, creating a pudding-like texture. Baked oatmeal takes a different approach, combining oats with eggs, protein powder, and milk, then baking into sliceable squares that can be prepped on Sunday and reheated throughout the week.`
      },
      {
        heading: 'Oats in Protein Baking and Snacks',
        content: `Oat flour—simply oats blended in a food processor—creates a whole-grain flour that works beautifully in protein baking. It produces tender pancakes, soft cookies, and moist muffins while adding fiber and nutrition. Combined with protein powder, oat flour creates baked goods that are satisfying rather than dense or dry. The mild, slightly sweet flavor complements virtually any recipe.

No-bake protein balls rely heavily on oats for their satisfying chew. Combined with protein powder, nut butter, and honey or maple syrup, oats create portable snacks that hold together without baking. Protein granola made with oats provides crunchy topping for yogurt bowls or satisfying snacking straight from the container. Homemade protein bars use oats as their base, bound together with protein powder and sticky ingredients into portable, customizable snacks far superior to most commercial options.`
      }
    ]
  },
  'ingredient-banana': {
    title: 'Bananas in High-Protein Recipes',
    sections: [
      {
        heading: 'The Perfect Protein Baking Companion',
        content: `Bananas have earned their place as an essential ingredient in protein cooking, not for their protein content (which is minimal), but for what they bring to protein-rich recipes. Their natural sweetness reduces the need for added sugars. Their moisture keeps protein baked goods from becoming dry. Their binding properties help hold ingredients together without excessive eggs or oil. And their familiar, crowd-pleasing flavor makes protein recipes taste more like comfort food than health food.

Ripeness matters significantly in protein baking. Spotted, very ripe bananas mash easily, provide maximum sweetness, and deliver the most intense banana flavor. They're ideal for banana bread, muffins, and pancakes where you want banana to be a prominent flavor. Less ripe bananas work better when you want banana's functional benefits without strong flavor—they add moisture and binding without overwhelming other ingredients.`
      },
      {
        heading: 'Classic Banana Protein Recipes',
        content: `Two-ingredient protein pancakes—just banana and eggs—started a revolution in easy high-protein breakfasts. While the basic version is quite eggy, adding protein powder, oats, or Greek yogurt creates more pancake-like results while boosting nutrition further. These pancakes freeze well, making them ideal for meal prep. Banana protein bread takes the beloved classic and adds protein powder and Greek yogurt, transforming it from an occasional treat to a macro-friendly breakfast option.

Banana nice cream demonstrates the fruit's ability to mimic ice cream's texture. Frozen banana slices blended until smooth create a creamy, soft-serve consistency. Add protein powder, Greek yogurt, or cottage cheese for a protein boost. The possibilities are endless: chocolate peanut butter, strawberry, cookies and cream, or any combination you crave. It's one of the few desserts that's actually improved by adding protein.`
      },
      {
        heading: 'Beyond Breakfast: Banana Versatility',
        content: `Protein smoothies reach their potential with frozen banana as a base. It creates thickness, natural sweetness, and a mild flavor that complements virtually any combination. Banana pairs especially well with chocolate protein powder and peanut butter, creating a shake that tastes indulgent while delivering 40+ grams of protein. For those watching carbs, half a banana provides enough sweetness and texture without excessive sugar.

Banana's binding power makes it valuable in no-bake protein balls and bars. Mashed banana combined with protein powder, oats, and nut butter creates snacks that hold together without cooking. In baked goods, banana can replace some of the egg, oil, or sugar while adding moisture and tenderness. Even frozen banana "coins" dipped in chocolate or yogurt and stored in the freezer make simple, satisfying protein-adjacent treats that satisfy sweet cravings.`
      }
    ]
  },
  'ingredient-peanut-butter': {
    title: 'Peanut Butter in High-Protein Cooking',
    sections: [
      {
        heading: 'Peanut Butter: Protein and Flavor Combined',
        content: `Peanut butter brings a rare combination to protein cooking: substantial protein content (7-8 grams per two tablespoons) plus a flavor that people genuinely love. Unlike many high-protein ingredients that require creativity to make palatable, peanut butter is already a favorite that enhances recipes simply by being included. Its richness, saltiness, and familiar taste make protein recipes feel indulgent rather than restrictive.

Choosing the right peanut butter matters. Natural peanut butter (just peanuts and salt) provides cleaner nutrition without added sugars or hydrogenated oils. It behaves differently in recipes—natural peanut butter is drippy and needs stirring, while conventional varieties are thick and uniform. Both work in most applications, but natural peanut butter's fluid consistency actually blends more smoothly into batters and sauces. Powdered peanut butter offers an alternative with significantly fewer calories and fat while maintaining peanut flavor, though it lacks the richness of whole peanut butter.`
      },
      {
        heading: 'Peanut Butter in Protein Desserts',
        content: `Peanut butter protein cookies rank among the most popular macro-friendly treats, combining the beloved flavor with substantial protein from powder and eggs. The result tastes remarkably like conventional peanut butter cookies while delivering 15-20 grams of protein per cookie. No-bake versions require even less effort—peanut butter, protein powder, and oats or coconut combine into balls that satisfy cravings without heating up the kitchen.

Peanut butter and chocolate create one of the most crave-worthy flavor combinations in existence, and protein versions are no exception. Protein Reese's cups, peanut butter chocolate protein bark, and chocolate peanut butter protein bars tap into this beloved pairing while providing meaningful nutrition. Peanut butter protein fudge, made with protein powder and coconut oil, creates rich, satisfying treats that melt in your mouth while fitting your macros.`
      },
      {
        heading: 'Peanut Butter Beyond Desserts',
        content: `Peanut butter transforms protein smoothies from functional to delicious. Combined with chocolate protein powder, banana, and milk, it creates a shake that tastes like a milkshake while delivering complete nutrition. The healthy fats in peanut butter also improve satiety, keeping you satisfied longer than a fat-free protein shake would.

Savory applications showcase peanut butter's versatility. Peanut sauces for noodles and stir-fries provide protein alongside bright, complex flavor. Thai-inspired peanut dressings make salads more satisfying. Peanut butter added to overnight oats creates a rich, filling breakfast. Even simple combinations—peanut butter on protein bread, or apple slices with peanut butter and protein powder—demonstrate how this ingredient elevates simple snacks into substantial protein servings.`
      }
    ]
  },
  'ingredient-chia': {
    title: 'Chia Seeds in High-Protein Recipes',
    sections: [
      {
        heading: 'Tiny Seeds, Big Protein Impact',
        content: `Chia seeds pack impressive nutrition into their tiny size: 5 grams of protein per two tablespoons, plus 10 grams of fiber and a significant dose of omega-3 fatty acids. But their real superpower in protein cooking is their unique gelling ability. When combined with liquid, chia seeds absorb up to 12 times their weight, creating a gel-like consistency that serves as the base for puddings, egg replacements, and thickeners in countless recipes.

This gelling property makes chia seeds invaluable for no-cook protein preparations. Unlike protein powders that need blending or oats that need soaking, chia seeds simply need time in contact with liquid to transform. The result is a thick, pudding-like consistency that serves as a vehicle for additional protein from sources like protein powder, Greek yogurt, and nut butters.`
      },
      {
        heading: 'Chia Pudding: The Ultimate Protein Prep',
        content: `Chia pudding exemplifies meal prep efficiency. Combine chia seeds with milk (dairy or plant-based), protein powder, and sweetener in a jar; refrigerate overnight; wake up to ready-to-eat breakfast or snack. The basic formula—three tablespoons chia seeds to one cup liquid plus one scoop protein powder—can be customized infinitely. Add cocoa powder for chocolate, frozen berries for fruit flavor, or peanut butter for richness.

The texture of chia pudding divides opinions—some love the tapioca-like bite of the seeds, while others find it off-putting. Blending the pudding after it sets creates a smoother consistency closer to traditional pudding. Adding toppings like granola, fresh fruit, or coconut flakes provides textural contrast. For maximum protein, top chia pudding with Greek yogurt, creating a parfait that delivers 35+ grams of protein with minimal effort.`
      },
      {
        heading: 'Creative Chia Applications',
        content: `Beyond pudding, chia seeds enhance protein recipes in multiple ways. Added to smoothies, they create thickness without the iciness of frozen fruit, plus their gel absorbs and holds protein powder more effectively than liquid alone. In overnight oats, chia seeds contribute protein while creating a creamier consistency. Stirred into Greek yogurt, they add protein and omega-3s while providing satisfying texture.

Chia eggs—one tablespoon chia seeds mixed with three tablespoons water, allowed to gel for five minutes—replace eggs in many vegan protein baking applications. While they won't create the same lift as eggs, they provide binding and moisture. Chia jam, made by cooking fruit with chia seeds until thickened, creates a high-fiber topping for protein pancakes, yogurt bowls, and toast without the excessive sugar of conventional jam.`
      }
    ]
  }
};

/**
 * Load recipes from all empire sites
 */
function loadAllRecipes() {
  const allRecipes = [];
  
  for (const empireSite of empireSites) {
    const dataDir = path.join(ROOT_DIR, 'data', 'recipes', empireSite.domain.replace(/\./g, '-'));
    const recipesFile = path.join(dataDir, 'recipes.json');
    
    if (fs.existsSync(recipesFile)) {
      try {
        const data = JSON.parse(fs.readFileSync(recipesFile, 'utf-8'));
        const recipes = Array.isArray(data) ? data : (data.recipes || []);
        
        // Add source site info to each recipe
        recipes.forEach(recipe => {
          allRecipes.push({
            ...recipe,
            sourceSite: empireSite.domain,
            sourceName: empireSite.name,
            sourceCategory: empireSite.category,
            foodType: empireSite.foodType,
            fullRecipeUrl: `https://${empireSite.domain}/${recipe.slug}.html`
          });
        });
        
        console.log(`   Loaded ${recipes.length} recipes from ${empireSite.domain}`);
      } catch (error) {
        console.log(`   Warning: Could not load recipes from ${empireSite.domain}: ${error.message}`);
      }
    } else {
      console.log(`   No data found for ${empireSite.domain}`);
    }
  }
  
  // Also load highprotein.recipes exclusive breakfast recipes
  const hprRecipesFile = path.join(ROOT_DIR, 'apps', 'highprotein.recipes', 'data', 'recipes.json');
  if (fs.existsSync(hprRecipesFile)) {
    try {
      const data = JSON.parse(fs.readFileSync(hprRecipesFile, 'utf-8'));
      const recipes = Array.isArray(data) ? data : (data.recipes || []);

      recipes.forEach(recipe => {
        allRecipes.push({
          ...recipe,
          protein: recipe.protein || recipe.nutrition?.protein || 0,
          calories: recipe.calories || recipe.nutrition?.calories || 0,
          carbs: recipe.carbs || recipe.nutrition?.carbs || 0,
          fat: recipe.fat || recipe.nutrition?.fat || 0,
          sourceSite: 'highprotein.recipes',
          sourceName: 'HighProtein.Recipes',
          sourceCategory: 'breakfast',
          foodType: 'breakfast',
          fullRecipeUrl: `/breakfast/recipes/${recipe.slug}/`
        });
      });

      console.log(`   Loaded ${recipes.length} exclusive breakfast recipes from highprotein.recipes`);
    } catch (error) {
      console.log(`   Warning: Could not load highprotein.recipes exclusive recipes: ${error.message}`);
    }
  }

  return allRecipes;
}

/**
 * Categorize recipes by various criteria
 */
function categorizeRecipes(recipes, site) {
  const categories = {
    // By meal type
    breakfast: recipes.filter(r => r.sourceCategory === 'breakfast'),
    desserts: recipes.filter(r => r.sourceCategory === 'desserts'),
    snacks: recipes.filter(r => r.sourceCategory === 'snacks'),
    savory: recipes.filter(r => r.sourceCategory === 'savory'),
    
    // By food type (for site-specific pages)
    byFoodType: {},
    
    // By ingredient
    byIngredient: {},
    
    // By flavor
    byFlavor: {},
    
    // By diet
    byDiet: {},
    
    // Special filters
    noBake: recipes.filter(r => 
      r.tags?.some(t => t.toLowerCase().includes('no-bake') || t.toLowerCase().includes('no bake')) ||
      r.category?.toLowerCase().includes('no-bake') ||
      r.cookTime === '0' || r.cookTime === 0
    ),
    quick: recipes.filter(r => parseInt(r.totalTime) <= 20),
    highProtein: recipes.filter(r => r.protein >= 30)
  };
  
  // Group by food type
  empireSites.forEach(es => {
    categories.byFoodType[es.foodType] = recipes.filter(r => r.foodType === es.foodType);
  });
  
  // Group by hero ingredients
  site.heroIngredients.forEach(ing => {
    const matchingRecipes = recipes.filter(r => {
      const searchTerms = ing.name.toLowerCase().split(' ');
      const recipeText = [
        r.title,
        r.description,
        ...(r.ingredients || []),
        ...(r.tags || [])
      ].join(' ').toLowerCase();
      
      return searchTerms.some(term => recipeText.includes(term));
    });
    categories.byIngredient[ing.slug] = matchingRecipes;
  });
  
  // Group by flavor
  site.flavorTags.forEach(flavor => {
    const matchingRecipes = recipes.filter(r => {
      const searchTerms = flavor.name.toLowerCase().split(' ');
      const recipeText = [r.title, r.description, ...(r.tags || [])].join(' ').toLowerCase();
      return searchTerms.some(term => recipeText.includes(term));
    });
    categories.byFlavor[flavor.slug] = matchingRecipes;
  });
  
  // Group by diet
  site.dietTags.forEach(diet => {
    const matchingRecipes = recipes.filter(r => {
      const searchTerm = diet.name.toLowerCase();
      const recipeText = [r.title, r.category, ...(r.tags || [])].join(' ').toLowerCase();
      return recipeText.includes(searchTerm);
    });
    categories.byDiet[diet.slug] = matchingRecipes;
  });
  
  return categories;
}

/**
 * Build the indexer site
 */
async function buildIndexerSite() {
  console.log('\n🏗️  Building HighProtein.Recipes Indexer Site\n');
  
  const site = getSite(DOMAIN);
  if (!site) {
    console.error('Site configuration not found for:', DOMAIN);
    process.exit(1);
  }
  
  const outputDir = path.join(ROOT_DIR, 'apps', 'highprotein.recipes', 'dist');
  
  // Ensure output directory exists
  fs.mkdirSync(outputDir, { recursive: true });
  fs.mkdirSync(path.join(outputDir, 'images'), { recursive: true });
  fs.mkdirSync(path.join(outputDir, 'recipe_images'), { recursive: true });
  
  // Load all recipes
  console.log('📚 Loading recipes from all empire sites...');
  const allRecipes = loadAllRecipes();
  console.log(`   Total recipes loaded: ${allRecipes.length}\n`);
  
  // Categorize recipes
  console.log('📊 Categorizing recipes...');
  const categories = categorizeRecipes(allRecipes, site);
  
  // EJS partials
  const partials = {
    head: fs.readFileSync(path.join(ROOT_DIR, 'packages/ui/templates/partials/head.ejs'), 'utf-8'),
    nav: generateIndexerNav(),
    footer: generateIndexerFooter(),
    'recipe-card': generateIndexerRecipeCard()
  };
  
  // Generate pages
  console.log('\n📄 Generating pages...');
  
  // 1. Homepage
  generateHomepage(site, allRecipes, categories, partials, outputDir);
  
  // 2. Category pages (Breakfast, Desserts, Snacks, Savory)
  generateCategoryPages(site, categories, partials, outputDir);

  // 2b. All recipes page
  generateAllRecipesPage(site, allRecipes, partials, outputDir);

  // 3. Food type pages (cookies, brownies, etc.)
  generateFoodTypePages(site, categories, partials, outputDir);
  
  // 4. Ingredient collection pages
  generateIngredientPages(site, categories, partials, outputDir);
  
  // 5. Flavor pages
  generateFlavorPages(site, categories, partials, outputDir);
  
  // 6. Diet pages
  generateDietPages(site, categories, partials, outputDir);
  
  // 7. Special filter pages (no-bake, quick, high-protein)
  generateSpecialFilterPages(site, categories, partials, outputDir);
  
  // 8. Recipe preview pages (with link to full recipe)
  generateRecipePreviewPages(site, allRecipes, partials, outputDir);
  
  // 9. Static pages
  generateStaticPages(site, partials, outputDir);
  
  // 10. Tools pages
  console.log('\n🔧 Generating tool pages...');
  console.log('   - P:E Ratio Calculator');
  generatePERatioCalculator(site, partials, outputDir);
  console.log('   - Breakfast Macro Builder');
  // Include breakfast, desserts, and snacks (excluding savory like bread/pizza)
  const breakfastBuilderRecipes = [
    ...categories.breakfast,
    ...categories.desserts,
    ...categories.snacks
  ];
  console.log(`     (${breakfastBuilderRecipes.length} recipes: breakfast + desserts + snacks)`);
  generateBreakfastBuilder(site, breakfastBuilderRecipes, partials, outputDir);
  console.log('   - Cost-per-Protein Calculator');
  generateCostCalculator(site, partials, outputDir);
  console.log('   - Tools Landing Page');
  generateToolsLandingPage(site, partials, outputDir);

  // 11. Breakfast pillar page and programmatic pages
  console.log('\n🥞 Generating breakfast pages...');
  console.log('   - Breakfast Pillar Page');
  generateBreakfastPillarPage(site, categories.breakfast, partials, outputDir);
  console.log('   - Programmatic Landing Pages');
  generateProgrammaticPages(site, categories.breakfast, partials, outputDir);

  // 12. Sitemap and robots.txt
  generateSitemap(site, allRecipes, categories, outputDir);
  generateRobotsTxt(site, outputDir);

  // Copy assets
  copyAssets(outputDir);

  console.log('\n✅ Build complete!');
  console.log(`   Output: ${outputDir}`);
  console.log(`   Pages generated: ${fs.readdirSync(outputDir).filter(f => f.endsWith('.html')).length}`);
}

/**
 * Generate custom nav for indexer site
 */
function generateIndexerNav() {
  return `
<nav class="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-700">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
            <!-- Logo -->
            <a href="/" class="flex items-center gap-2">
                <img src="<%= site.logo %>" alt="<%= site.name %>" class="h-10 w-10 rounded-full">
                <span class="font-anton text-xl text-slate-900 dark:text-white tracking-tight uppercase">HighProtein<span class="text-brand-500">.Recipes</span></span>
            </a>

            <!-- Desktop Navigation -->
            <div class="hidden md:flex items-center gap-6">
                <div class="relative group">
                    <button class="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-medium transition-colors flex items-center gap-1">
                        Categories
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                    </button>
                    <div class="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-100 dark:border-slate-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                        <a href="/breakfast/" class="block px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white">Breakfast</a>
                        <a href="/category-desserts.html" class="block px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white">Desserts</a>
                        <a href="/category-snacks.html" class="block px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white">Snacks</a>
                        <a href="/category-savory.html" class="block px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white">Savory</a>
                    </div>
                </div>
                <a href="/breakfast/" class="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-medium transition-colors">Breakfast</a>
                <a href="/tools/" class="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-medium transition-colors">Tools</a>
                <a href="/high-protein.html" class="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-medium transition-colors">30g+ Protein</a>

                <!-- Dark Mode Toggle -->
                <button
                    x-data="{ dark: document.documentElement.classList.contains('dark') }"
                    @click="dark = !dark; document.documentElement.classList.toggle('dark'); localStorage.setItem('theme', dark ? 'dark' : 'light')"
                    class="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    aria-label="Toggle dark mode"
                >
                    <svg x-show="!dark" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"/>
                    </svg>
                    <svg x-show="dark" x-cloak class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clip-rule="evenodd"/>
                    </svg>
                </button>

                <a href="https://highprotein.recipes/pack-starter" class="bg-brand-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-brand-600 transition-colors">
                    FREE MEAL PLAN
                </a>
            </div>

            <!-- Mobile Menu Button -->
            <div class="flex items-center gap-2 md:hidden">
                <!-- Mobile Dark Mode Toggle -->
                <button
                    x-data="{ dark: document.documentElement.classList.contains('dark') }"
                    @click="dark = !dark; document.documentElement.classList.toggle('dark'); localStorage.setItem('theme', dark ? 'dark' : 'light')"
                    class="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    aria-label="Toggle dark mode"
                >
                    <svg x-show="!dark" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"/>
                    </svg>
                    <svg x-show="dark" x-cloak class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clip-rule="evenodd"/>
                    </svg>
                </button>

                <button
                    x-data="{ open: false }"
                    @click="open = !open; $dispatch('toggle-mobile-menu', { open })"
                    class="p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                    aria-label="Toggle menu"
                >
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                    </svg>
                </button>
            </div>
        </div>
    </div>

    <!-- Mobile Menu -->
    <div
        x-data="{ open: false }"
        @toggle-mobile-menu.window="open = $event.detail.open"
        x-show="open"
        x-cloak
        class="md:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700"
    >
        <div class="px-4 py-4 space-y-3">
            <a href="/breakfast/" class="block text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-medium">Breakfast Hub</a>
            <a href="/tools/" class="block text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-medium">Protein Tools</a>
            <div class="border-t border-slate-200 dark:border-slate-700 my-2"></div>
            <a href="/breakfast/" class="block text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-medium">All Breakfast</a>
            <a href="/category-desserts.html" class="block text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-medium">Desserts</a>
            <a href="/category-snacks.html" class="block text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-medium">Snacks</a>
            <a href="/category-savory.html" class="block text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-medium">Savory</a>
            <a href="/high-protein.html" class="block text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-medium">30g+ Protein</a>
            <a href="https://highprotein.recipes/pack-starter" class="block bg-brand-500 text-white px-4 py-2 rounded-lg font-semibold text-center">
                FREE MEAL PLAN
            </a>
        </div>
    </div>
</nav>

<!-- Spacer for fixed nav -->
<div class="h-16"></div>
`;
}

/**
 * Generate custom footer for indexer site
 */
function generateIndexerFooter() {
  return `
<footer class="bg-slate-900 dark:bg-slate-950 text-white py-12 mt-16">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
            <!-- Brand -->
            <div class="col-span-1">
                <div class="flex items-center gap-2 mb-4">
                    <img src="<%= site.logo %>" alt="<%= site.name %>" class="h-10 w-10 rounded-full">
                    <span class="font-anton text-xl tracking-tight uppercase">HighProtein<span class="text-brand-500">.Recipes</span></span>
                </div>
                <p class="text-slate-400 text-sm">
                    Your gateway to 300+ macro-verified high-protein recipes across 13 specialized sites.
                </p>
            </div>

            <!-- Categories -->
            <div>
                <h4 class="font-semibold mb-4">Categories</h4>
                <ul class="space-y-2 text-slate-400 text-sm">
                    <li><a href="/breakfast/" class="hover:text-white transition-colors">Breakfast</a></li>
                    <li><a href="/category-desserts.html" class="hover:text-white transition-colors">Desserts</a></li>
                    <li><a href="/category-snacks.html" class="hover:text-white transition-colors">Snacks</a></li>
                    <li><a href="/category-savory.html" class="hover:text-white transition-colors">Savory</a></li>
                </ul>
            </div>

            <!-- Popular Ingredients -->
            <div>
                <h4 class="font-semibold mb-4">By Ingredient</h4>
                <ul class="space-y-2 text-slate-400 text-sm">
                    <li><a href="/ingredient-protein-powder.html" class="hover:text-white transition-colors">Protein Powder</a></li>
                    <li><a href="/ingredient-greek-yogurt.html" class="hover:text-white transition-colors">Greek Yogurt</a></li>
                    <li><a href="/ingredient-cottage-cheese.html" class="hover:text-white transition-colors">Cottage Cheese</a></li>
                    <li><a href="/ingredient-oats.html" class="hover:text-white transition-colors">Oats</a></li>
                </ul>
            </div>

            <!-- Legal -->
            <div>
                <h4 class="font-semibold mb-4">Legal</h4>
                <ul class="space-y-2 text-slate-400 text-sm">
                    <li><a href="/privacy.html" class="hover:text-white transition-colors">Privacy Policy</a></li>
                    <li><a href="/terms.html" class="hover:text-white transition-colors">Terms of Use</a></li>
                </ul>
            </div>
        </div>

        <!-- Empire Links -->
        <div class="mt-12 pt-8 border-t border-slate-800">
            <p class="text-slate-500 text-sm text-center mb-4">The Protein Empire</p>
            <div class="flex flex-wrap justify-center gap-4 text-slate-400 text-sm">
                <a href="https://proteinmuffins.com" class="hover:text-white transition-colors">Muffins</a>
                <a href="https://proteincookies.co" class="hover:text-white transition-colors">Cookies</a>
                <a href="https://proteinpancakes.co" class="hover:text-white transition-colors">Pancakes</a>
                <a href="https://proteinbrownies.co" class="hover:text-white transition-colors">Brownies</a>
                <a href="https://protein-bread.com" class="hover:text-white transition-colors">Bread</a>
                <a href="https://proteinbars.co" class="hover:text-white transition-colors">Bars</a>
                <a href="https://proteinbites.co" class="hover:text-white transition-colors">Bites</a>
                <a href="https://proteindonuts.co" class="hover:text-white transition-colors">Donuts</a>
                <a href="https://proteinoatmeal.co" class="hover:text-white transition-colors">Oatmeal</a>
                <a href="https://proteincheesecake.co" class="hover:text-white transition-colors">Cheesecake</a>
                <a href="https://proteinpizzas.co" class="hover:text-white transition-colors">Pizza</a>
                <a href="https://proteinpudding.co" class="hover:text-white transition-colors">Pudding</a>
                <a href="https://cottagecheeserecipes.co" class="hover:text-white transition-colors">Cottage Cheese</a>
            </div>
        </div>

        <!-- Copyright -->
        <div class="mt-8 text-center text-slate-500 text-sm">
            <p>&copy; <%= new Date().getFullYear() %> <a href="https://HighProtein.Recipes" class="hover:text-amber-400 transition-colors">High Protein Recipes</a>. All rights reserved.</p>
        </div>
    </div>
</footer>
`;
}

/**
 * Generate recipe card for indexer (with external link)
 */
function generateIndexerRecipeCard() {
  return `
<div class="group block bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-slate-100 dark:border-slate-700">
    <!-- Image Container -->
    <a href="<%= recipe.sourceSite === 'highprotein.recipes' ? '/breakfast/recipes/' + recipe.slug + '/' : '/' + recipe.slug + '-preview.html' %>" class="block relative aspect-square overflow-hidden">
        <img
            src="<%= recipe.image_url || (recipe.sourceSite === 'highprotein.recipes' ? '/images/breakfast/' + recipe.slug + '.png' : 'https://' + recipe.sourceSite + '/recipe_images/' + recipe.slug + '.jpg') %>" 
            alt="<%= recipe.title %>"
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
            onerror="this.src='/images/placeholder.png'"
        >
        <!-- Protein Badge -->
        <div class="absolute top-3 left-3 bg-accent-500 text-white text-sm font-bold px-2 py-1 rounded-lg">
            <%= recipe.protein %>g
        </div>
        <!-- Source Badge -->
        <div class="absolute top-3 right-3 bg-slate-900/80 text-white text-xs font-medium px-2 py-1 rounded-lg">
            <%= recipe.sourceName %>
        </div>
    </a>
    
    <!-- Content -->
    <div class="p-4">
        <a href="<%= recipe.sourceSite === 'highprotein.recipes' ? '/breakfast/recipes/' + recipe.slug + '/' : '/' + recipe.slug + '-preview.html' %>">
            <h3 class="font-semibold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors line-clamp-2">
                <%= recipe.title %>
            </h3>
        </a>
        <div class="mt-2 flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
            <span><%= recipe.calories %> cal</span>
            <span>•</span>
            <span><%= recipe.totalTime %>m</span>
            <span>•</span>
            <span><%= recipe.difficulty %></span>
        </div>
        <a href="<%= recipe.fullRecipeUrl %>" target="_blank" rel="noopener" class="mt-3 inline-flex items-center gap-1 text-brand-500 hover:text-brand-600 font-medium text-sm">
            Full Recipe
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
        </a>
    </div>
</div>
`;
}

/**
 * Generate homepage
 */
function generateHomepage(site, allRecipes, categories, partials, outputDir) {
  console.log('   - Homepage');
  
  const template = `
<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
<head>
<%- include('head', { 
  site, 
  pageTitle: site.title,
  pageDescription: site.description,
  canonicalPath: '/',
  ogType: 'website',
  ogImage: site.socialImage,
  preloadImage: null,
  includeIngredients: false
}) %>
</head>
<body class="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans">
<%- include('nav', { site }) %>

<!-- Hero Section -->
<section class="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-20 lg:py-32">
    <div class="absolute inset-0 bg-[url('/images/pattern.svg')] opacity-5"></div>
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div class="text-center max-w-4xl mx-auto">
            <h1 class="font-anton text-5xl lg:text-7xl uppercase tracking-wider mb-6">
                <span class="text-brand-500">300+</span> High-Protein Recipes
            </h1>
            <p class="text-xl lg:text-2xl text-slate-300 mb-8">
                <%= site.tagline %>. From cookies to pizza, pancakes to pudding - find your perfect macro-friendly treat.
            </p>
            <div class="flex flex-wrap justify-center gap-4">
                <a href="#recipes" class="bg-brand-500 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-brand-600 transition-colors">
                    Browse Recipes
                </a>
                <a href="#sites" class="bg-white/10 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/20 transition-colors border border-white/20">
                    Explore All Sites
                </a>
            </div>
        </div>
    </div>
</section>

<!-- Quick Stats -->
<section class="py-8 bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
                <div class="font-anton text-4xl text-brand-500"><%= allRecipes.length %>+</div>
                <div class="text-slate-600 dark:text-slate-400">Recipes</div>
            </div>
            <div>
                <div class="font-anton text-4xl text-brand-500">12</div>
                <div class="text-slate-600 dark:text-slate-400">Specialized Sites</div>
            </div>
            <div>
                <div class="font-anton text-4xl text-brand-500"><%= categories.highProtein.length %></div>
                <div class="text-slate-600 dark:text-slate-400">30g+ Protein</div>
            </div>
            <div>
                <div class="font-anton text-4xl text-brand-500"><%= categories.noBake.length %></div>
                <div class="text-slate-600 dark:text-slate-400">No-Bake Options</div>
            </div>
        </div>
    </div>
</section>

<!-- Featured Recipes -->
<section id="recipes" class="py-16">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
            <h2 class="font-anton text-4xl uppercase tracking-wider mb-4">Featured Recipes</h2>
            <p class="text-slate-600 dark:text-slate-400 text-lg">Hand-picked favorites from across the Protein Empire</p>
        </div>
        
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <% allRecipes.slice(0, 8).forEach(recipe => { %>
                <%- include('recipe-card', { recipe }) %>
            <% }); %>
        </div>
        
        <div class="text-center mt-12">
            <a href="/all-recipes.html" class="inline-flex items-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-xl font-semibold hover:bg-slate-800 transition-colors">
                View All <%= allRecipes.length %> Recipes
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
            </a>
        </div>
    </div>
</section>

<!-- Browse by Category -->
<section class="py-16 bg-white dark:bg-slate-800">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
            <h2 class="font-anton text-4xl uppercase tracking-wider mb-4">Browse by Category</h2>
            <p class="text-slate-600 dark:text-slate-400 text-lg">Find recipes organized the way you think about food</p>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <a href="/breakfast/" class="group relative overflow-hidden rounded-2xl aspect-[4/3] bg-gradient-to-br from-amber-500 to-orange-600">
                <img src="/images/icons/pancakes.png" alt="" class="absolute top-4 right-4 w-16 h-16 opacity-80 group-hover:scale-110 transition-transform" />
                <div class="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors"></div>
                <div class="absolute inset-0 flex flex-col justify-end p-6 text-white">
                    <h3 class="font-anton text-2xl uppercase tracking-wider">Breakfast</h3>
                    <p class="text-white/80"><%= categories.breakfast.length %> recipes</p>
                </div>
            </a>
            <a href="/category-desserts.html" class="group relative overflow-hidden rounded-2xl aspect-[4/3] bg-gradient-to-br from-pink-500 to-rose-600">
                <img src="/images/icons/brownies.png" alt="" class="absolute top-4 right-4 w-16 h-16 opacity-80 group-hover:scale-110 transition-transform" />
                <div class="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors"></div>
                <div class="absolute inset-0 flex flex-col justify-end p-6 text-white">
                    <h3 class="font-anton text-2xl uppercase tracking-wider">Desserts</h3>
                    <p class="text-white/80"><%= categories.desserts.length %> recipes</p>
                </div>
            </a>
            <a href="/category-snacks.html" class="group relative overflow-hidden rounded-2xl aspect-[4/3] bg-gradient-to-br from-emerald-500 to-teal-600">
                <img src="/images/icons/protein-bites.png" alt="" class="absolute top-4 right-4 w-16 h-16 opacity-80 group-hover:scale-110 transition-transform" />
                <div class="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors"></div>
                <div class="absolute inset-0 flex flex-col justify-end p-6 text-white">
                    <h3 class="font-anton text-2xl uppercase tracking-wider">Snacks</h3>
                    <p class="text-white/80"><%= categories.snacks.length %> recipes</p>
                </div>
            </a>
            <a href="/category-savory.html" class="group relative overflow-hidden rounded-2xl aspect-[4/3] bg-gradient-to-br from-slate-600 to-slate-800">
                <img src="/images/icons/pizza.png" alt="" class="absolute top-4 right-4 w-16 h-16 opacity-80 group-hover:scale-110 transition-transform" />
                <div class="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors"></div>
                <div class="absolute inset-0 flex flex-col justify-end p-6 text-white">
                    <h3 class="font-anton text-2xl uppercase tracking-wider">Savory</h3>
                    <p class="text-white/80"><%= categories.savory.length %> recipes</p>
                </div>
            </a>
        </div>
    </div>
</section>

<!-- The Protein Empire Sites -->
<section id="sites" class="py-16">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
            <h2 class="font-anton text-4xl uppercase tracking-wider mb-4">The Protein Empire</h2>
            <p class="text-slate-600 dark:text-slate-400 text-lg">13 specialized sites, each dedicated to perfecting one type of high-protein treat</p>
        </div>
        
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <% empireSites.forEach(es => { %>
            <a href="https://<%= es.domain %>" target="_blank" rel="noopener" class="group bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-100 dark:border-slate-700 hover:border-brand-500 hover:shadow-lg transition-all text-center">
                <div class="w-16 h-16 mx-auto mb-4 rounded-full overflow-hidden">
                    <img src="/images/empire/<%= es.name.toLowerCase() %>.png" alt="<%= es.name %>" class="w-full h-full object-cover">
                </div>
                <h3 class="font-semibold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors"><%= es.name %></h3>
                <p class="text-sm text-slate-500 dark:text-slate-400 mt-1"><%= es.domain %></p>
            </a>
            <% }); %>
        </div>
    </div>
</section>

<!-- Hero Ingredients -->
<section class="py-16 bg-white dark:bg-slate-800">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
            <h2 class="font-anton text-4xl uppercase tracking-wider mb-4">Popular Ingredients</h2>
            <p class="text-slate-600 dark:text-slate-400 text-lg">Browse recipes by your favorite protein sources</p>
        </div>
        
        <div class="flex flex-wrap justify-center gap-4">
            <% site.heroIngredients.forEach(ing => { %>
            <a href="/ingredient-<%= ing.slug %>.html" class="inline-flex items-center gap-2 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white hover:bg-brand-500 hover:text-white px-5 py-3 rounded-full font-medium transition-colors">
                <img src="/images/icons/<%= ing.icon %>" alt="" class="w-6 h-6" />
                <%= ing.name %>
                <span class="text-sm opacity-70">(<%= categories.byIngredient[ing.slug]?.length || 0 %>)</span>
            </a>
            <% }); %>
        </div>
    </div>
</section>

<!-- Protein Tools -->
<section class="py-16">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
            <h2 class="font-anton text-4xl uppercase tracking-wider mb-4">Protein Calculator Tools</h2>
            <p class="text-slate-600 dark:text-slate-400 text-lg">Free tools to optimize your high-protein diet</p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <a href="/tools/pe-ratio-calculator.html" class="group bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-700 hover:border-brand-500 hover:shadow-lg transition-all">
                <div class="h-40 overflow-hidden">
                    <img src="/images/breakfast/tool-pe-ratio.png" alt="P:E Ratio Calculator" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
                </div>
                <div class="p-6">
                    <h3 class="font-semibold text-lg mb-2 group-hover:text-brand-600 dark:group-hover:text-brand-400">P:E Ratio Calculator</h3>
                    <p class="text-slate-600 dark:text-slate-400 text-sm">Calculate protein-to-energy ratio for any food</p>
                </div>
            </a>
            <a href="/tools/breakfast-builder.html" class="group bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-700 hover:border-brand-500 hover:shadow-lg transition-all">
                <div class="h-40 overflow-hidden">
                    <img src="/images/breakfast/tool-macro-builder.png" alt="Breakfast Macro Builder" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
                </div>
                <div class="p-6">
                    <h3 class="font-semibold text-lg mb-2 group-hover:text-brand-600 dark:group-hover:text-brand-400">Breakfast Macro Builder</h3>
                    <p class="text-slate-600 dark:text-slate-400 text-sm">Filter breakfast recipes by your macro targets</p>
                </div>
            </a>
            <a href="/tools/protein-cost-calculator.html" class="group bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-700 hover:border-brand-500 hover:shadow-lg transition-all">
                <div class="h-40 overflow-hidden">
                    <img src="/images/breakfast/tool-cost-calc.png" alt="Protein Cost Calculator" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
                </div>
                <div class="p-6">
                    <h3 class="font-semibold text-lg mb-2 group-hover:text-brand-600 dark:group-hover:text-brand-400">Protein Cost Calculator</h3>
                    <p class="text-slate-600 dark:text-slate-400 text-sm">Compare protein sources by price efficiency</p>
                </div>
            </a>
        </div>
        <div class="text-center mt-8">
            <a href="/tools/" class="text-brand-500 hover:text-brand-600 font-medium">View All Tools &rarr;</a>
        </div>
    </div>
</section>

<!-- Breakfast Hub CTA -->
<section class="py-12 mx-4 lg:mx-8">
    <div class="max-w-5xl mx-auto bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-8 lg:p-12 text-white relative overflow-hidden">
        <img src="/images/breakfast/hero-bg.png" alt="" class="absolute right-0 top-0 h-full w-auto opacity-20 object-cover object-left" />
        <div class="lg:flex lg:items-center lg:justify-between relative z-10">
            <div class="mb-6 lg:mb-0 flex items-center gap-6">
                <img src="/images/icons/pancakes.png" alt="" class="w-20 h-20 hidden lg:block" />
                <div>
                    <h2 class="font-anton text-3xl lg:text-4xl uppercase mb-2">High Protein Breakfast Hub</h2>
                    <p class="text-white/80 text-lg"><%= categories.breakfast.length %> macro-verified breakfast recipes with interactive filters</p>
                </div>
            </div>
            <a href="/breakfast/" class="inline-flex items-center gap-2 bg-white text-slate-900 px-8 py-4 rounded-xl font-semibold hover:bg-slate-100 transition-colors">
                Explore Breakfast
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
            </a>
        </div>
    </div>
</section>

<!-- Special Filters -->
<section class="py-16">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <a href="/no-bake.html" class="group bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl p-8 text-white">
                <img src="/images/icons/mixing-bowl.png" alt="" class="w-14 h-14 mb-4" />
                <h3 class="font-anton text-2xl uppercase tracking-wider mb-2">No-Bake Recipes</h3>
                <p class="text-white/80 mb-4"><%= categories.noBake.length %> recipes ready in minutes with zero oven time</p>
                <span class="inline-flex items-center gap-2 font-semibold group-hover:gap-3 transition-all">
                    Browse No-Bake
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                </span>
            </a>
            <a href="/quick.html" class="group bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl p-8 text-white">
                <img src="/images/icons/lightning.png" alt="" class="w-14 h-14 mb-4" />
                <h3 class="font-anton text-2xl uppercase tracking-wider mb-2">Quick & Easy</h3>
                <p class="text-white/80 mb-4"><%= categories.quick.length %> recipes ready in 20 minutes or less</p>
                <span class="inline-flex items-center gap-2 font-semibold group-hover:gap-3 transition-all">
                    Browse Quick Recipes
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                </span>
            </a>
            <a href="/high-protein.html" class="group bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl p-8 text-white">
                <img src="/images/icons/flexed-arm.png" alt="" class="w-14 h-14 mb-4" />
                <h3 class="font-anton text-2xl uppercase tracking-wider mb-2">30g+ Protein</h3>
                <p class="text-white/80 mb-4"><%= categories.highProtein.length %> recipes with serious protein content</p>
                <span class="inline-flex items-center gap-2 font-semibold group-hover:gap-3 transition-all">
                    Browse High Protein
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                </span>
            </a>
        </div>
    </div>
</section>

<%- include('footer', { site }) %>
</body>
</html>
`;

  const html = ejs.render(template, {
    site,
    allRecipes,
    categories,
    empireSites,
    include: (name, data) => ejs.render(partials[name], data)
  });
  
  fs.writeFileSync(path.join(outputDir, 'index.html'), html);
}

/**
 * Generate category pages
 */
function generateCategoryPages(site, categories, partials, outputDir) {
  const categoryConfigs = [
    { slug: 'breakfast', name: 'Breakfast', description: 'Start your day with protein-packed pancakes, muffins, and oatmeal', recipes: categories.breakfast },
    { slug: 'desserts', name: 'Desserts', description: 'Indulgent cookies, brownies, cheesecakes, and more - all macro-friendly', recipes: categories.desserts },
    { slug: 'snacks', name: 'Snacks', description: 'Quick protein bites and bars for on-the-go nutrition', recipes: categories.snacks },
    { slug: 'savory', name: 'Savory', description: 'High-protein pizza crusts, bread, and savory treats', recipes: categories.savory }
  ];
  
  categoryConfigs.forEach(cat => {
    console.log(`   - Category: ${cat.name}`);
    generateListingPage(site, cat.recipes, {
      title: `${cat.name} Recipes`,
      description: cat.description,
      slug: `category-${cat.slug}`,
      breadcrumb: [{ name: 'Home', url: '/' }, { name: cat.name, url: null }]
    }, partials, outputDir);
  });
}

/**
 * Generate all recipes page
 */
function generateAllRecipesPage(site, allRecipes, partials, outputDir) {
  console.log(`   - All Recipes (${allRecipes.length} recipes)`);
  generateListingPage(site, allRecipes, {
    title: `All ${allRecipes.length} High-Protein Recipes`,
    description: `Browse all ${allRecipes.length} macro-verified high-protein recipes from across the Protein Empire`,
    slug: 'all-recipes',
    breadcrumb: [{ name: 'Home', url: '/' }, { name: 'All Recipes', url: null }]
  }, partials, outputDir);
}

/**
 * Generate food type pages
 */
function generateFoodTypePages(site, categories, partials, outputDir) {
  Object.entries(categories.byFoodType).forEach(([foodType, recipes]) => {
    if (recipes.length > 0) {
      console.log(`   - Food Type: ${foodType}`);
      const title = foodType.charAt(0).toUpperCase() + foodType.slice(1);
      generateListingPage(site, recipes, {
        title: `Protein ${title} Recipes`,
        description: `All ${recipes.length} macro-verified protein ${foodType} recipes`,
        slug: `type-${foodType}`,
        breadcrumb: [{ name: 'Home', url: '/' }, { name: title, url: null }]
      }, partials, outputDir);
    }
  });
}

/**
 * Generate ingredient collection pages
 */
function generateIngredientPages(site, categories, partials, outputDir) {
  site.heroIngredients.forEach(ing => {
    const recipes = categories.byIngredient[ing.slug] || [];
    console.log(`   - Ingredient: ${ing.name} (${recipes.length} recipes)`);
    generateListingPage(site, recipes, {
      title: `${ing.name} Recipes`,
      description: `${recipes.length} high-protein recipes featuring ${ing.name.toLowerCase()}`,
      slug: `ingredient-${ing.slug}`,
      breadcrumb: [{ name: 'Home', url: '/' }, { name: 'Ingredients', url: null }, { name: ing.name, url: null }]
    }, partials, outputDir);
  });
}

/**
 * Generate flavor pages
 */
function generateFlavorPages(site, categories, partials, outputDir) {
  site.flavorTags.forEach(flavor => {
    const recipes = categories.byFlavor[flavor.slug] || [];
    console.log(`   - Flavor: ${flavor.name} (${recipes.length} recipes)`);
    generateListingPage(site, recipes, {
      title: `${flavor.name} Recipes`,
      description: `${recipes.length} delicious ${flavor.name.toLowerCase()}-flavored high-protein recipes`,
      slug: `flavor-${flavor.slug}`,
      breadcrumb: [{ name: 'Home', url: '/' }, { name: 'Flavors', url: null }, { name: flavor.name, url: null }]
    }, partials, outputDir);
  });
}

/**
 * Generate diet pages
 */
function generateDietPages(site, categories, partials, outputDir) {
  site.dietTags.forEach(diet => {
    const recipes = categories.byDiet[diet.slug] || [];
    console.log(`   - Diet: ${diet.name} (${recipes.length} recipes)`);
    generateListingPage(site, recipes, {
      title: `${diet.name} Recipes`,
      description: `${recipes.length} ${diet.name.toLowerCase()} high-protein recipes`,
      slug: `diet-${diet.slug}`,
      breadcrumb: [{ name: 'Home', url: '/' }, { name: 'Diets', url: null }, { name: diet.name, url: null }]
    }, partials, outputDir);
  });
}

/**
 * Generate special filter pages
 */
function generateSpecialFilterPages(site, categories, partials, outputDir) {
  const filters = [
    { slug: 'no-bake', name: 'No-Bake', description: 'Zero oven time required - just mix, chill, and enjoy', recipes: categories.noBake },
    { slug: 'quick', name: 'Quick & Easy', description: 'Ready in 20 minutes or less', recipes: categories.quick },
    { slug: 'high-protein', name: 'High Protein (30g+)', description: 'Recipes with 30 grams of protein or more per serving', recipes: categories.highProtein }
  ];
  
  filters.forEach(filter => {
    console.log(`   - Filter: ${filter.name} (${filter.recipes.length} recipes)`);
    generateListingPage(site, filter.recipes, {
      title: `${filter.name} Recipes`,
      description: filter.description,
      slug: filter.slug,
      breadcrumb: [{ name: 'Home', url: '/' }, { name: filter.name, url: null }]
    }, partials, outputDir);
  });
}

/**
 * Generate a listing page
 */
function generateListingPage(site, recipes, config, partials, outputDir) {
  // Extract unique food types for filtering
  const foodTypes = [...new Set(recipes.map(r => r.foodType).filter(Boolean))].sort();
  const hasFilters = foodTypes.length > 1;

  const template = `
<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
<head>
<%- include('head', {
  site,
  pageTitle: config.title + ' | ' + site.name,
  pageDescription: config.description,
  canonicalPath: '/' + config.slug + '.html',
  ogType: 'website',
  ogImage: site.socialImage,
  preloadImage: null,
  includeIngredients: false
}) %>
</head>
<body class="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans">
<%- include('nav', { site }) %>

<main class="flex-grow py-12">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" x-data="{ activeFilter: 'all' }">
        <!-- Breadcrumb -->
        <nav class="mb-8 text-sm">
            <ol class="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <% config.breadcrumb.forEach((crumb, i) => { %>
                    <% if (crumb.url) { %>
                        <li><a href="<%= crumb.url %>" class="hover:text-slate-900 dark:hover:text-white"><%= crumb.name %></a></li>
                        <li>/</li>
                    <% } else { %>
                        <li class="text-slate-900 dark:text-white font-medium"><%= crumb.name %></li>
                    <% } %>
                <% }); %>
            </ol>
        </nav>

        <!-- Header -->
        <div class="mb-8">
            <h1 class="font-anton text-4xl uppercase tracking-wider mb-4"><%= config.title %></h1>
            <p class="text-slate-600 dark:text-slate-400 text-lg"><%= config.description %></p>
            <p class="text-slate-500 dark:text-slate-500 mt-2"><%= recipes.length %> recipes found</p>
        </div>

        <% if (hasFilters && recipes.length > 0) { %>
        <!-- Filter Buttons -->
        <div class="mb-8 flex flex-wrap gap-2">
            <button
                @click="activeFilter = 'all'"
                :class="activeFilter === 'all' ? 'bg-brand-500 text-white' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'"
                class="px-4 py-2 rounded-full text-sm font-medium transition-colors border border-slate-200 dark:border-slate-700">
                All (<%= recipes.length %>)
            </button>
            <% foodTypes.forEach(type => {
                const count = recipes.filter(r => r.foodType === type).length;
                const displayName = type.charAt(0).toUpperCase() + type.slice(1);
            %>
            <button
                @click="activeFilter = '<%= type %>'"
                :class="activeFilter === '<%= type %>' ? 'bg-brand-500 text-white' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'"
                class="px-4 py-2 rounded-full text-sm font-medium transition-colors border border-slate-200 dark:border-slate-700">
                <%= displayName %> (<%= count %>)
            </button>
            <% }); %>
        </div>
        <% } %>

        <% if (recipes.length > 0) { %>
        <!-- Recipe Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <% recipes.forEach(recipe => { %>
            <div x-show="activeFilter === 'all' || activeFilter === '<%= recipe.foodType %>'" x-transition>
                <%- include('recipe-card', { recipe }) %>
            </div>
            <% }); %>
        </div>
        <% } else { %>
        <div class="text-center py-16">
            <p class="text-slate-500 dark:text-slate-400 text-lg">No recipes found in this category yet.</p>
            <a href="/" class="inline-block mt-4 text-brand-500 hover:text-brand-600 font-medium">← Back to Home</a>
        </div>
        <% } %>

        <% if (seoContent) { %>
        <!-- SEO Content Section -->
        <section class="mt-16 pt-12 border-t border-slate-200 dark:border-slate-700">
            <h2 class="font-anton text-3xl uppercase tracking-wider mb-8"><%= seoContent.title %></h2>
            <div class="prose prose-slate dark:prose-invert max-w-none">
                <% seoContent.sections.forEach(section => { %>
                <div class="mb-8">
                    <h3 class="text-xl font-semibold mb-4 text-slate-800 dark:text-slate-200"><%= section.heading %></h3>
                    <% section.content.split('\\n\\n').forEach(paragraph => { %>
                    <p class="text-slate-600 dark:text-slate-400 mb-4 leading-relaxed"><%= paragraph %></p>
                    <% }); %>
                </div>
                <% }); %>
            </div>
        </section>
        <% } %>
    </div>
</main>

<%- include('footer', { site }) %>
</body>
</html>
`;

  // Look up SEO content for this page
  const seoContent = SEO_CONTENT[config.slug] || null;

  const html = ejs.render(template, {
    site,
    recipes,
    config,
    foodTypes,
    hasFilters,
    seoContent,
    include: (name, data) => ejs.render(partials[name], data)
  });

  fs.writeFileSync(path.join(outputDir, `${config.slug}.html`), html);
}

/**
 * Generate recipe preview pages
 */
function generateRecipePreviewPages(site, allRecipes, partials, outputDir) {
  console.log(`   - Recipe preview pages (${allRecipes.length} recipes)`);
  
  allRecipes.forEach(recipe => {
    const template = `
<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
<head>
<%- include('head', {
  site,
  pageTitle: recipe.title + ' | ' + site.name,
  pageDescription: recipe.description,
  canonicalPath: recipe.sourceSite === 'highprotein.recipes' ? '/breakfast/recipes/' + recipe.slug + '/' : '/' + recipe.slug + '-preview.html',
  ogType: 'article',
  ogImage: recipe.image_url || (recipe.sourceSite === 'highprotein.recipes' ? '/images/breakfast/' + recipe.slug + '.png' : 'https://' + recipe.sourceSite + '/recipe_images/' + recipe.slug + '.jpg'),
  preloadImage: recipe.image_url || (recipe.sourceSite === 'highprotein.recipes' ? '/images/breakfast/' + recipe.slug + '.png' : 'https://' + recipe.sourceSite + '/recipe_images/' + recipe.slug + '.jpg'),
  includeIngredients: false
}) %>
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Recipe",
  "name": "<%= recipe.title %>",
  "description": "<%= recipe.description %>",
  "image": "<%= recipe.image_url || (recipe.sourceSite === 'highprotein.recipes' ? 'https://highprotein.recipes/images/breakfast/' + recipe.slug + '.png' : 'https://' + recipe.sourceSite + '/recipe_images/' + recipe.slug + '.jpg') %>",
  "author": {
    "@type": "Organization",
    "name": "<%= recipe.sourceName %>"
  },
  "prepTime": "PT<%= recipe.prepTime %>M",
  "cookTime": "PT<%= recipe.cookTime %>M",
  "totalTime": "PT<%= recipe.totalTime %>M",
  "recipeYield": "<%= recipe.yield %>",
  "nutrition": {
    "@type": "NutritionInformation",
    "calories": "<%= recipe.calories %> calories",
    "proteinContent": "<%= recipe.protein %>g"
  },
  "recipeCategory": "<%= recipe.category || recipe.foodType %>",
  "keywords": "<%= (recipe.tags || []).join(', ') %>"
}
</script>
</head>
<body class="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans">
<%- include('nav', { site }) %>

<main class="flex-grow py-12">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Breadcrumb -->
        <nav class="mb-8 text-sm">
            <ol class="flex items-center gap-2 text-slate-500">
                <li><a href="/" class="hover:text-slate-900">Home</a></li>
                <li>/</li>
                <li><a href="/type-<%= recipe.foodType %>.html" class="hover:text-slate-900"><%= recipe.foodType.charAt(0).toUpperCase() + recipe.foodType.slice(1) %></a></li>
                <li>/</li>
                <li class="text-slate-900 font-medium"><%= recipe.title %></li>
            </ol>
        </nav>
        
        <!-- Recipe Header -->
        <div class="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm border border-slate-100 mb-8">
            <div class="aspect-video relative">
                <img
                    src="<%= recipe.image_url || (recipe.sourceSite === 'highprotein.recipes' ? '/images/breakfast/' + recipe.slug + '.png' : 'https://' + recipe.sourceSite + '/recipe_images/' + recipe.slug + '.jpg') %>"
                    alt="<%= recipe.title %>"
                    class="w-full h-full object-cover"
                    onerror="this.src='/images/placeholder.png'"
                >
                <div class="absolute top-4 left-4 bg-accent-500 text-white text-lg font-bold px-3 py-1 rounded-lg">
                    <%= recipe.protein %>g protein
                </div>
                <div class="absolute top-4 right-4 bg-slate-900/80 text-white text-sm font-medium px-3 py-1 rounded-lg">
                    From <%= recipe.sourceName %>
                </div>
            </div>
            
            <div class="p-8">
                <h1 class="font-anton text-3xl lg:text-4xl uppercase tracking-wider mb-4"><%= recipe.title %></h1>
                <p class="text-slate-600 text-lg mb-6"><%= recipe.description %></p>
                
                <!-- Quick Stats -->
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div class="bg-slate-50 rounded-xl p-4 text-center">
                        <div class="text-2xl font-bold text-slate-900"><%= recipe.calories %></div>
                        <div class="text-sm text-slate-500">Calories</div>
                    </div>
                    <div class="bg-emerald-50 rounded-xl p-4 text-center">
                        <div class="text-2xl font-bold text-emerald-600"><%= recipe.protein %>g</div>
                        <div class="text-sm text-slate-500">Protein</div>
                    </div>
                    <div class="bg-slate-50 rounded-xl p-4 text-center">
                        <div class="text-2xl font-bold text-slate-900"><%= recipe.carbs %>g</div>
                        <div class="text-sm text-slate-500">Carbs</div>
                    </div>
                    <div class="bg-slate-50 rounded-xl p-4 text-center">
                        <div class="text-2xl font-bold text-slate-900"><%= recipe.fat %>g</div>
                        <div class="text-sm text-slate-500">Fat</div>
                    </div>
                </div>
                
                <!-- Time & Difficulty -->
                <div class="flex flex-wrap gap-4 mb-8 text-slate-600">
                    <span class="flex items-center gap-2">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        Prep: <%= recipe.prepTime %> min
                    </span>
                    <span class="flex items-center gap-2">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"></path></svg>
                        Cook: <%= recipe.cookTime %> min
                    </span>
                    <span class="flex items-center gap-2">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                        <%= recipe.difficulty %>
                    </span>
                    <span class="flex items-center gap-2">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                        Yields: <%= recipe.yield %>
                    </span>
                </div>
                
                <!-- CTA -->
                <div class="bg-gradient-to-r from-brand-500 to-accent-500 rounded-xl p-6 text-white text-center">
                    <h3 class="font-anton text-2xl uppercase tracking-wider mb-2">Get the Full Recipe</h3>
                    <p class="text-white/80 mb-4">Complete ingredients list, step-by-step instructions, and tips</p>
                    <a href="<%= recipe.fullRecipeUrl %>" target="_blank" rel="noopener" class="inline-flex items-center gap-2 bg-white text-slate-900 px-8 py-3 rounded-lg font-semibold hover:bg-slate-100 transition-colors">
                        View on <%= recipe.sourceName %>
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                    </a>
                </div>
            </div>
        </div>
        
        <!-- Tags -->
        <% if (recipe.tags && recipe.tags.length > 0) { %>
        <div class="mb-8">
            <h3 class="font-semibold text-slate-900 mb-3">Tags</h3>
            <div class="flex flex-wrap gap-2">
                <% recipe.tags.forEach(tag => { %>
                <span class="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-sm"><%= tag %></span>
                <% }); %>
            </div>
        </div>
        <% } %>
        
        <!-- Related -->
        <div class="text-center">
            <a href="/type-<%= recipe.foodType %>.html" class="text-brand-500 hover:text-brand-600 font-medium">
                ← More <%= recipe.foodType.charAt(0).toUpperCase() + recipe.foodType.slice(1) %> Recipes
            </a>
        </div>
    </div>
</main>

<%- include('footer', { site }) %>
</body>
</html>
`;

    const html = ejs.render(template, {
      site,
      recipe,
      include: (name, data) => ejs.render(partials[name], data)
    });

    // Breakfast recipes from highprotein.recipes already have full pages at /breakfast/recipes/{slug}/
    // Only generate preview pages for other sites
    if (recipe.sourceSite !== 'highprotein.recipes') {
      fs.writeFileSync(path.join(outputDir, `${recipe.slug}-preview.html`), html);
    }
  });
}

/**
 * Generate static pages (privacy, terms, all recipes)
 */
function generateStaticPages(site, partials, outputDir) {
  console.log('   - Static pages (privacy, terms)');
  
  // Privacy page
  const privacyTemplate = `
<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
<head>
<%- include('head', { 
  site, 
  pageTitle: 'Privacy Policy | ' + site.name,
  pageDescription: 'Privacy policy for ' + site.name,
  canonicalPath: '/privacy.html',
  ogType: 'website',
  ogImage: site.socialImage,
  preloadImage: null,
  includeIngredients: false
}) %>
</head>
<body class="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans">
<%- include('nav', { site }) %>
<main class="flex-grow py-16">
    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 class="font-anton text-4xl uppercase mb-8 tracking-wider">PRIVACY POLICY</h1>
        <div class="prose prose-slate max-w-none">
            <p>Last updated: January 1, 2026</p>
            
            <h2>Information We Collect</h2>
            <p>We collect information you provide when you sign up for our newsletter or download a recipe pack. This may include your email address.</p>
            
            <h2>How We Use Your Information</h2>
            <p>We use the information we collect to send you recipe updates, newsletters, and promotional materials. You can opt out at any time.</p>
            
            <h2>Cookies</h2>
            <p>We use cookies and similar technologies to analyze traffic and improve your experience on our site.</p>
            
            <h2>Third-Party Services</h2>
            <p>We may use third-party services such as Google Analytics to help us understand how visitors use our site.</p>
            
            <h2>Contact Us</h2>
            <p>If you have any questions about this Privacy Policy, please contact us.</p>
        </div>
    </div>
</main>
<%- include('footer', { site }) %>
</body>
</html>
`;
  
  fs.writeFileSync(path.join(outputDir, 'privacy.html'), ejs.render(privacyTemplate, {
    site,
    include: (name, data) => ejs.render(partials[name], data)
  }));
  
  // Terms page
  const termsTemplate = `
<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
<head>
<%- include('head', { 
  site, 
  pageTitle: 'Terms of Use | ' + site.name,
  pageDescription: 'Terms of use for ' + site.name,
  canonicalPath: '/terms.html',
  ogType: 'website',
  ogImage: site.socialImage,
  preloadImage: null,
  includeIngredients: false
}) %>
</head>
<body class="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans">
<%- include('nav', { site }) %>
<main class="flex-grow py-16">
    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 class="font-anton text-4xl uppercase mb-8 tracking-wider">TERMS OF USE</h1>
        <div class="prose prose-slate max-w-none">
            <p>Last updated: January 1, 2026</p>
            
            <h2>Acceptance of Terms</h2>
            <p>By accessing and using HighProtein.Recipes, you accept and agree to be bound by these Terms of Use.</p>
            
            <h2>Use of Content</h2>
            <p>All recipes and content on this site are for personal, non-commercial use only. You may not reproduce, distribute, or sell our content without permission.</p>
            
            <h2>Nutritional Information</h2>
            <p>Nutritional information is provided as a guide only. We verify our data using USDA FoodData Central, but actual values may vary based on ingredients used.</p>
            
            <h2>External Links</h2>
            <p>This site contains links to external recipe sites within the Protein Empire network. We are not responsible for the content or practices of these external sites.</p>
            
            <h2>Disclaimer</h2>
            <p>The recipes and information on this site are provided "as is" without warranty of any kind. Always consult a healthcare professional before making dietary changes.</p>
            
            <h2>Changes to Terms</h2>
            <p>We reserve the right to modify these terms at any time. Continued use of the site constitutes acceptance of any changes.</p>
        </div>
    </div>
</main>
<%- include('footer', { site }) %>
</body>
</html>
`;
  
  fs.writeFileSync(path.join(outputDir, 'terms.html'), ejs.render(termsTemplate, {
    site,
    include: (name, data) => ejs.render(partials[name], data)
  }));
}

/**
 * Generate sitemap
 */
function generateSitemap(site, allRecipes, categories, outputDir) {
  console.log('   - Sitemap');
  
  const today = new Date().toISOString().split('T')[0];
  
  let urls = [
    { loc: '/', priority: '1.0', changefreq: 'daily' },
    { loc: '/privacy.html', priority: '0.3', changefreq: 'yearly' },
    { loc: '/terms.html', priority: '0.3', changefreq: 'yearly' },
    { loc: '/breakfast/', priority: '0.8', changefreq: 'weekly' },
    { loc: '/category-desserts.html', priority: '0.8', changefreq: 'weekly' },
    { loc: '/category-snacks.html', priority: '0.8', changefreq: 'weekly' },
    { loc: '/category-savory.html', priority: '0.8', changefreq: 'weekly' },
    { loc: '/no-bake.html', priority: '0.8', changefreq: 'weekly' },
    { loc: '/quick.html', priority: '0.8', changefreq: 'weekly' },
    { loc: '/high-protein.html', priority: '0.8', changefreq: 'weekly' },
    // Tools
    { loc: '/tools/', priority: '0.9', changefreq: 'monthly' },
    { loc: '/tools/pe-ratio-calculator.html', priority: '0.8', changefreq: 'monthly' },
    { loc: '/tools/breakfast-builder.html', priority: '0.8', changefreq: 'weekly' },
    { loc: '/tools/protein-cost-calculator.html', priority: '0.8', changefreq: 'monthly' },
    // Breakfast hub
    { loc: '/breakfast/', priority: '0.9', changefreq: 'weekly' },
  ];

  // Add programmatic breakfast pages
  PROGRAMMATIC_INTENTS.forEach(intent => {
    urls.push({ loc: `/breakfast/${intent.slug}.html`, priority: '0.7', changefreq: 'weekly' });
  });
  
  // Add ingredient pages
  site.heroIngredients.forEach(ing => {
    urls.push({ loc: `/ingredient-${ing.slug}.html`, priority: '0.7', changefreq: 'weekly' });
  });
  
  // Add flavor pages
  site.flavorTags.forEach(flavor => {
    urls.push({ loc: `/flavor-${flavor.slug}.html`, priority: '0.6', changefreq: 'weekly' });
  });
  
  // Add diet pages
  site.dietTags.forEach(diet => {
    urls.push({ loc: `/diet-${diet.slug}.html`, priority: '0.6', changefreq: 'weekly' });
  });
  
  // Add food type pages
  Object.keys(categories.byFoodType).forEach(foodType => {
    urls.push({ loc: `/type-${foodType}.html`, priority: '0.7', changefreq: 'weekly' });
  });
  
  // Add recipe pages
  allRecipes.forEach(recipe => {
    if (recipe.sourceSite === 'highprotein.recipes') {
      urls.push({ loc: `/breakfast/recipes/${recipe.slug}/`, priority: '0.6', changefreq: 'weekly' });
    } else {
      urls.push({ loc: `/${recipe.slug}-preview.html`, priority: '0.5', changefreq: 'monthly' });
    }
  });
  
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>
    <loc>https://${site.domain}${u.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>`;
  
  fs.writeFileSync(path.join(outputDir, 'sitemap.xml'), sitemap);
}

/**
 * Generate robots.txt
 */
function generateRobotsTxt(site, outputDir) {
  console.log('   - robots.txt');
  
  const robots = `User-agent: *
Allow: /
Sitemap: https://${site.domain}/sitemap.xml
`;
  
  fs.writeFileSync(path.join(outputDir, 'robots.txt'), robots);
}

/**
 * Copy assets
 */
function copyAssets(outputDir) {
  console.log('\n📁 Copying assets...');
  
  const ROOT_DIR_ASSETS = path.resolve(__dirname, '..');
  const targetImagesDir = path.join(outputDir, 'recipe_images');
  
  // Copy recipe images from proteincookies.co
  const sourceImagesDir = path.join(ROOT_DIR_ASSETS, 'apps/proteincookies.co/dist/recipe_images');
  if (fs.existsSync(sourceImagesDir)) {
    fs.readdirSync(sourceImagesDir).forEach(file => {
      fs.copyFileSync(
        path.join(sourceImagesDir, file),
        path.join(targetImagesDir, file)
      );
    });
    console.log('   Copied proteincookies.co recipe images');
  }
  
  // Copy recipe images from all data/images subdirectories
  const dataImagesDir = path.join(ROOT_DIR_ASSETS, 'data/images');
  if (fs.existsSync(dataImagesDir)) {
    const subdirs = fs.readdirSync(dataImagesDir);
    subdirs.forEach(subdir => {
      const subdirPath = path.join(dataImagesDir, subdir);
      if (fs.statSync(subdirPath).isDirectory()) {
        fs.readdirSync(subdirPath).forEach(file => {
          if (file.endsWith('.png') || file.endsWith('.jpg') || file.endsWith('.webp')) {
            const targetPath = path.join(targetImagesDir, file);
            // Only copy if file doesn't already exist (avoid overwriting)
            if (!fs.existsSync(targetPath)) {
              fs.copyFileSync(
                path.join(subdirPath, file),
                targetPath
              );
            }
          }
        });
        console.log(`   Copied ${subdir} recipe images`);
      }
    });
  }
  
  // Copy logo and other images
  const sourceLogoDir = path.join(ROOT_DIR_ASSETS, 'apps/proteincookies.co/dist/images');
  const targetLogoDir = path.join(outputDir, 'images');

  if (fs.existsSync(sourceLogoDir)) {
    fs.readdirSync(sourceLogoDir).forEach(file => {
      const sourcePath = path.join(sourceLogoDir, file);
      // Skip directories, only copy files
      if (fs.statSync(sourcePath).isFile()) {
        fs.copyFileSync(sourcePath, path.join(targetLogoDir, file));
      }
    });
    console.log('   Copied logo and images');
  }
  
  // Create placeholder image
  const placeholderSvg = `<svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="#f1f5f9"/>
    <text x="50%" y="50%" font-family="Arial" font-size="24" fill="#94a3b8" text-anchor="middle" dy=".3em">Recipe Image</text>
  </svg>`;
  fs.writeFileSync(path.join(outputDir, 'images/placeholder.png'), placeholderSvg);
}

/**
 * Programmatic page intents for breakfast landing pages
 */
const PROGRAMMATIC_INTENTS = [
  // Macro-based
  { slug: '40g-protein-under-400-calories', title: '40g Protein Breakfast Under 400 Calories', minProtein: 40, maxCalories: 400, tags: [] },
  { slug: '30g-protein-under-300-calories', title: '30g Protein Breakfast Under 300 Calories', minProtein: 30, maxCalories: 300, tags: [] },
  { slug: '50g-protein-breakfast', title: '50g+ Protein Breakfast Recipes', minProtein: 50, maxCalories: 999, tags: [] },

  // Diet + macro
  { slug: 'vegan-30g-protein-breakfast', title: 'Vegan High Protein Breakfast (30g+)', minProtein: 30, maxCalories: 999, tags: ['vegan'] },
  { slug: 'gluten-free-40g-protein-breakfast', title: 'Gluten-Free 40g Protein Breakfast', minProtein: 40, maxCalories: 999, tags: ['gluten-free'] },
  { slug: 'dairy-free-high-protein-breakfast', title: 'Dairy-Free High Protein Breakfast', minProtein: 25, maxCalories: 999, tags: ['dairy-free'] },
  { slug: 'keto-breakfast-30g-protein', title: 'Keto Breakfast with 30g+ Protein', minProtein: 30, maxCalories: 999, tags: ['keto', 'low-carb'] },

  // Time + macro
  { slug: 'quick-high-protein-breakfast-under-15-minutes', title: 'Quick High Protein Breakfast (Under 15 Minutes)', minProtein: 25, maxCalories: 999, tags: [], maxTime: 15 },
  { slug: 'meal-prep-high-protein-breakfast', title: 'Meal Prep High Protein Breakfast Recipes', minProtein: 25, maxCalories: 999, tags: ['meal-prep'] },

  // Specific combos
  { slug: 'no-eggs-high-protein-breakfast', title: 'High Protein Breakfast Without Eggs', minProtein: 25, maxCalories: 999, tags: ['egg-free', 'no-eggs'] },
  { slug: 'low-calorie-high-protein-breakfast', title: 'Low Calorie High Protein Breakfast (Under 350 cal)', minProtein: 25, maxCalories: 350, tags: [] },
];

/**
 * Generate P:E Ratio Calculator page
 */
function generatePERatioCalculator(site, partials, outputDir) {
  const template = `
<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
<head>
<%- include('head', {
  site,
  pageTitle: 'P:E Ratio Calculator - Protein to Energy Ratio Tool | ' + site.name,
  pageDescription: 'Calculate protein-to-energy ratio for any food. Find out if your meals are ELITE, EXCELLENT, or GOOD for protein density. Free P:E ratio calculator.',
  canonicalPath: '/tools/pe-ratio-calculator.html',
  ogType: 'website',
  ogImage: site.socialImage,
  preloadImage: null,
  includeIngredients: false
}) %>
</head>
<body class="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans">
<%- include('nav', { site }) %>

<main class="flex-grow py-12">
  <div class="max-w-4xl mx-auto px-4">

    <!-- Breadcrumb -->
    <nav class="mb-8 text-sm">
      <ol class="flex items-center gap-2 text-slate-500 dark:text-slate-400">
        <li><a href="/" class="hover:text-slate-900 dark:hover:text-white">Home</a></li>
        <li>/</li>
        <li><a href="/tools/" class="hover:text-slate-900 dark:hover:text-white">Tools</a></li>
        <li>/</li>
        <li class="text-slate-900 dark:text-white font-medium">P:E Ratio Calculator</li>
      </ol>
    </nav>

    <!-- Hero -->
    <div class="text-center mb-12">
      <h1 class="font-anton text-4xl lg:text-5xl uppercase mb-4">P:E RATIO CALCULATOR</h1>
      <p class="text-xl text-slate-600 dark:text-slate-400">Calculate protein-to-energy ratio for any food</p>
    </div>

    <!-- Calculator -->
    <div class="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg mb-12"
         x-data="peCalculator()">

      <div class="grid md:grid-cols-2 gap-8">
        <!-- Inputs -->
        <div class="space-y-6">
          <div>
            <label class="block text-sm font-semibold mb-2">Protein (grams)</label>
            <input type="number" x-model.number="protein" min="0" step="0.1"
                   class="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600
                          bg-white dark:bg-slate-700 text-2xl font-bold text-center
                          focus:ring-2 focus:ring-brand-500 focus:border-transparent">
          </div>
          <div>
            <label class="block text-sm font-semibold mb-2">Calories</label>
            <input type="number" x-model.number="calories" min="1" step="1"
                   class="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600
                          bg-white dark:bg-slate-700 text-2xl font-bold text-center
                          focus:ring-2 focus:ring-brand-500 focus:border-transparent">
          </div>
        </div>

        <!-- Result -->
        <div class="flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 rounded-xl p-6">
          <div class="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-2">P:E RATIO</div>
          <div class="text-5xl font-bold mb-2" :class="tierColor" x-text="peRatio.toFixed(2)"></div>
          <div class="text-lg font-bold px-4 py-1 rounded-full" :class="tierBadgeClass" x-text="tierLabel"></div>
          <div class="text-sm text-slate-500 dark:text-slate-400 mt-4 text-center" x-text="tierDescription"></div>
        </div>
      </div>

      <!-- Explanation -->
      <div class="mt-8 pt-8 border-t border-slate-200 dark:border-slate-700">
        <h3 class="font-bold mb-2">What is P:E Ratio?</h3>
        <p class="text-slate-600 dark:text-slate-400">
          P:E ratio measures grams of protein per 100 calories. A food with 30g protein and 200 calories
          has a P:E of 15 (extremely high). Higher P:E means more protein per calorie - ideal for
          muscle building while managing calories.
        </p>
      </div>
    </div>

    <!-- P:E Tier Guide -->
    <div class="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg mb-12">
      <h2 class="font-anton text-2xl uppercase mb-6">P:E RATIO TIERS</h2>
      <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border-2 border-emerald-500">
          <div class="text-emerald-600 dark:text-emerald-400 font-bold text-lg">ELITE</div>
          <div class="text-2xl font-bold">&ge;2.5</div>
          <div class="text-sm text-slate-600 dark:text-slate-400">Chicken breast, egg whites, Greek yogurt</div>
        </div>
        <div class="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border-2 border-green-500">
          <div class="text-green-600 dark:text-green-400 font-bold text-lg">EXCELLENT</div>
          <div class="text-2xl font-bold">2.0-2.49</div>
          <div class="text-sm text-slate-600 dark:text-slate-400">Cottage cheese, tuna, protein bars</div>
        </div>
        <div class="p-4 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-500">
          <div class="text-yellow-600 dark:text-yellow-400 font-bold text-lg">GOOD</div>
          <div class="text-2xl font-bold">1.5-1.99</div>
          <div class="text-sm text-slate-600 dark:text-slate-400">Whole eggs, salmon, lean beef</div>
        </div>
        <div class="p-4 rounded-xl bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-500">
          <div class="text-orange-600 dark:text-orange-400 font-bold text-lg">MODERATE</div>
          <div class="text-2xl font-bold">&lt;1.5</div>
          <div class="text-sm text-slate-600 dark:text-slate-400">Nuts, cheese, regular bread</div>
        </div>
      </div>
    </div>

    <!-- Common Foods Reference -->
    <div class="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg">
      <h2 class="font-anton text-2xl uppercase mb-6">COMMON FOODS P:E REFERENCE</h2>
      <div class="overflow-x-auto">
        <table class="w-full text-left">
          <thead>
            <tr class="border-b border-slate-200 dark:border-slate-700">
              <th class="py-3 font-semibold">Food</th>
              <th class="py-3 font-semibold text-right">Protein</th>
              <th class="py-3 font-semibold text-right">Calories</th>
              <th class="py-3 font-semibold text-right">P:E Ratio</th>
              <th class="py-3 font-semibold text-center">Tier</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-700">
            <tr><td class="py-3">Chicken Breast (100g)</td><td class="text-right">31g</td><td class="text-right">165</td><td class="text-right font-bold">18.8</td><td class="text-center"><span class="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 text-sm font-bold">ELITE</span></td></tr>
            <tr><td class="py-3">Egg Whites (100g)</td><td class="text-right">11g</td><td class="text-right">52</td><td class="text-right font-bold">21.2</td><td class="text-center"><span class="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 text-sm font-bold">ELITE</span></td></tr>
            <tr><td class="py-3">Greek Yogurt 0% (100g)</td><td class="text-right">10g</td><td class="text-right">59</td><td class="text-right font-bold">16.9</td><td class="text-center"><span class="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 text-sm font-bold">ELITE</span></td></tr>
            <tr><td class="py-3">Cottage Cheese 1% (100g)</td><td class="text-right">11g</td><td class="text-right">72</td><td class="text-right font-bold">15.3</td><td class="text-center"><span class="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 text-sm font-bold">ELITE</span></td></tr>
            <tr><td class="py-3">Whole Egg (50g)</td><td class="text-right">6g</td><td class="text-right">72</td><td class="text-right font-bold">8.3</td><td class="text-center"><span class="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 text-sm font-bold">ELITE</span></td></tr>
            <tr><td class="py-3">Salmon (100g)</td><td class="text-right">20g</td><td class="text-right">208</td><td class="text-right font-bold">9.6</td><td class="text-center"><span class="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 text-sm font-bold">ELITE</span></td></tr>
            <tr><td class="py-3">Almonds (28g)</td><td class="text-right">6g</td><td class="text-right">164</td><td class="text-right font-bold">3.7</td><td class="text-center"><span class="px-2 py-0.5 rounded bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-sm font-bold">EXCELLENT</span></td></tr>
            <tr><td class="py-3">Cheddar Cheese (28g)</td><td class="text-right">7g</td><td class="text-right">113</td><td class="text-right font-bold">6.2</td><td class="text-center"><span class="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 text-sm font-bold">ELITE</span></td></tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- CTA to Breakfast Builder -->
    <div class="mt-12 text-center">
      <p class="text-slate-600 dark:text-slate-400 mb-4">Looking for high P:E breakfast recipes?</p>
      <a href="/tools/breakfast-builder.html" class="inline-flex items-center gap-2 bg-brand-500 text-white px-8 py-4 rounded-xl font-semibold hover:bg-brand-600 transition-colors">
        Try Breakfast Macro Builder
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
      </a>
    </div>

  </div>
</main>

<%- include('footer', { site }) %>

<script>
document.addEventListener('alpine:init', () => {
  Alpine.data('peCalculator', () => ({
    protein: 30,
    calories: 200,

    get peRatio() {
      if (this.calories <= 0) return 0;
      return (this.protein / this.calories) * 100;
    },

    get tierLabel() {
      if (this.peRatio >= 2.5) return 'ELITE';
      if (this.peRatio >= 2.0) return 'EXCELLENT';
      if (this.peRatio >= 1.5) return 'GOOD';
      return 'MODERATE';
    },

    get tierColor() {
      if (this.peRatio >= 2.5) return 'text-emerald-600 dark:text-emerald-400';
      if (this.peRatio >= 2.0) return 'text-green-600 dark:text-green-400';
      if (this.peRatio >= 1.5) return 'text-yellow-600 dark:text-yellow-400';
      return 'text-orange-600 dark:text-orange-400';
    },

    get tierBadgeClass() {
      if (this.peRatio >= 2.5) return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300';
      if (this.peRatio >= 2.0) return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
      if (this.peRatio >= 1.5) return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300';
      return 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300';
    },

    get tierDescription() {
      if (this.peRatio >= 2.5) return 'Extremely protein-dense. Ideal for high-protein diets.';
      if (this.peRatio >= 2.0) return 'Very protein-dense. Great for muscle building.';
      if (this.peRatio >= 1.5) return 'Good protein density. Solid choice for balanced meals.';
      return 'Lower protein density. Consider pairing with higher P:E foods.';
    }
  }));
});
</script>

</body>
</html>
`;

  fs.mkdirSync(path.join(outputDir, 'tools'), { recursive: true });
  const html = ejs.render(template, { site, include: (name, data) => ejs.render(partials[name], data) });
  fs.writeFileSync(path.join(outputDir, 'tools', 'pe-ratio-calculator.html'), html);
}

/**
 * Generate Breakfast Macro Builder page
 */
function generateBreakfastBuilder(site, breakfastRecipes, partials, outputDir) {
  // Embed recipe data as JSON for Alpine.js filtering
  const recipesJson = JSON.stringify(breakfastRecipes.map(r => ({
    slug: r.slug,
    title: r.title,
    protein: r.protein || r.nutrition?.protein || 0,
    calories: r.calories || r.nutrition?.calories || 0,
    carbs: r.carbs || r.nutrition?.carbs || 0,
    sourceSite: r.sourceSite,
    fat: r.fat || r.nutrition?.fat || 0,
    prepTime: r.prepTime || 0,
    totalTime: r.totalTime || 0,
    tags: r.tags || [],
    image: r.image_url || (r.sourceSite === 'highprotein.recipes' ? '/images/breakfast/' + r.slug + '.png' : 'https://' + r.sourceSite + '/recipe_images/' + r.slug + '.jpg'),
    sourceSite: r.sourceSite,
    sourceName: r.sourceName,
    fullRecipeUrl: r.fullRecipeUrl
  })));

  const template = `
<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
<head>
<%- include('head', {
  site,
  pageTitle: 'Breakfast Macro Builder - Find High Protein Breakfast by Macros | ' + site.name,
  pageDescription: 'Build your perfect high-protein breakfast. Set protein target, calorie limit, and dietary restrictions. Find matching breakfast recipes instantly.',
  canonicalPath: '/tools/breakfast-builder.html',
  ogType: 'website',
  ogImage: site.socialImage,
  preloadImage: null,
  includeIngredients: false
}) %>
</head>
<body class="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans">
<%- include('nav', { site }) %>

<main class="flex-grow py-8">
  <div class="max-w-7xl mx-auto px-4" x-data="breakfastBuilder()">

    <!-- Breadcrumb -->
    <nav class="mb-8 text-sm">
      <ol class="flex items-center gap-2 text-slate-500 dark:text-slate-400">
        <li><a href="/" class="hover:text-slate-900 dark:hover:text-white">Home</a></li>
        <li>/</li>
        <li><a href="/tools/" class="hover:text-slate-900 dark:hover:text-white">Tools</a></li>
        <li>/</li>
        <li class="text-slate-900 dark:text-white font-medium">Breakfast Builder</li>
      </ol>
    </nav>

    <!-- Header -->
    <div class="text-center mb-8">
      <h1 class="font-anton text-4xl lg:text-5xl uppercase mb-4">BREAKFAST MACRO BUILDER</h1>
      <p class="text-xl text-slate-600 dark:text-slate-400">Find your perfect high-protein breakfast</p>
    </div>

    <div class="lg:flex lg:gap-8">

      <!-- Filter Panel (Sticky on desktop) -->
      <div class="lg:w-80 lg:flex-shrink-0 mb-8 lg:mb-0">
        <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg lg:sticky lg:top-24">
          <h2 class="font-bold text-lg mb-6">Set Your Targets</h2>

          <!-- Protein Target -->
          <div class="mb-6">
            <label class="flex justify-between mb-2">
              <span class="font-semibold">Min Protein</span>
              <span class="text-brand-600 dark:text-brand-400 font-bold" x-text="minProtein + 'g'"></span>
            </label>
            <input type="range" min="10" max="60" step="5" x-model.number="minProtein"
                   class="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-brand-500">
            <div class="flex justify-between text-xs text-slate-500 mt-1">
              <span>10g</span><span>60g</span>
            </div>
          </div>

          <!-- Calorie Cap -->
          <div class="mb-6">
            <label class="flex justify-between mb-2">
              <span class="font-semibold">Max Calories</span>
              <span class="text-brand-600 dark:text-brand-400 font-bold" x-text="maxCalories"></span>
            </label>
            <input type="range" min="200" max="800" step="50" x-model.number="maxCalories"
                   class="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-brand-500">
            <div class="flex justify-between text-xs text-slate-500 mt-1">
              <span>200</span><span>800</span>
            </div>
          </div>

          <!-- Max Prep Time -->
          <div class="mb-6">
            <label class="flex justify-between mb-2">
              <span class="font-semibold">Max Time</span>
              <span class="text-brand-600 dark:text-brand-400 font-bold" x-text="maxTime + ' min'"></span>
            </label>
            <input type="range" min="5" max="60" step="5" x-model.number="maxTime"
                   class="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-brand-500">
            <div class="flex justify-between text-xs text-slate-500 mt-1">
              <span>5 min</span><span>60 min</span>
            </div>
          </div>

          <!-- Dietary Filters -->
          <div class="mb-6">
            <div class="font-semibold mb-3">Dietary Preferences</div>
            <div class="space-y-2">
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" x-model="filters.vegan" class="rounded text-brand-500 focus:ring-brand-500">
                <span>Vegan</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" x-model="filters.vegetarian" class="rounded text-brand-500 focus:ring-brand-500">
                <span>Vegetarian</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" x-model="filters.glutenFree" class="rounded text-brand-500 focus:ring-brand-500">
                <span>Gluten-Free</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" x-model="filters.dairyFree" class="rounded text-brand-500 focus:ring-brand-500">
                <span>Dairy-Free</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" x-model="filters.keto" class="rounded text-brand-500 focus:ring-brand-500">
                <span>Keto</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" x-model="filters.noEggs" class="rounded text-brand-500 focus:ring-brand-500">
                <span>No Eggs</span>
              </label>
            </div>
          </div>

          <!-- Reset -->
          <button @click="resetFilters()"
                  class="w-full py-2 text-sm text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
            Reset Filters
          </button>

          <!-- Results Count -->
          <div class="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700 text-center">
            <div class="text-3xl font-bold text-brand-600 dark:text-brand-400" x-text="filteredRecipes.length"></div>
            <div class="text-sm text-slate-500 dark:text-slate-400">matching recipes</div>
          </div>
        </div>
      </div>

      <!-- Results Grid -->
      <div class="flex-grow">
        <div class="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          <template x-for="recipe in filteredRecipes" :key="recipe.slug">
            <a :href="recipe.sourceSite === 'highprotein.recipes' ? '/breakfast/recipes/' + recipe.slug + '/' : '/' + recipe.slug + '-preview.html'"
               class="group block bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm
                      hover:shadow-lg transition-all border border-slate-100 dark:border-slate-700">
              <div class="aspect-square bg-slate-100 dark:bg-slate-700 relative overflow-hidden">
                <img :src="recipe.image" :alt="recipe.title"
                     class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                     loading="lazy"
                     onerror="this.src='/images/placeholder.png'">
                <div class="absolute top-3 left-3 bg-accent-500 text-white text-sm font-bold px-2 py-1 rounded-lg"
                     x-text="recipe.protein + 'g'"></div>
                <div class="absolute top-3 right-3 bg-slate-900/80 text-white text-xs font-medium px-2 py-1 rounded-lg"
                     x-text="recipe.sourceName"></div>
              </div>
              <div class="p-4">
                <h3 class="font-semibold text-slate-900 dark:text-white group-hover:text-brand-600
                           dark:group-hover:text-brand-400 line-clamp-2 transition-colors" x-text="recipe.title"></h3>
                <div class="mt-2 flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                  <span x-text="recipe.calories + ' cal'"></span>
                  <span>&bull;</span>
                  <span x-text="recipe.totalTime + ' min'"></span>
                </div>
              </div>
            </a>
          </template>
        </div>

        <!-- No Results -->
        <div x-show="filteredRecipes.length === 0" class="text-center py-16">
          <div class="text-6xl mb-4">&#128533;</div>
          <h3 class="text-xl font-bold mb-2">No recipes match your criteria</h3>
          <p class="text-slate-600 dark:text-slate-400">Try adjusting your filters to see more options</p>
        </div>
      </div>

    </div>
  </div>
</main>

<%- include('footer', { site }) %>

<script>
const BREAKFAST_RECIPES = ${recipesJson};

document.addEventListener('alpine:init', () => {
  Alpine.data('breakfastBuilder', () => ({
    recipes: BREAKFAST_RECIPES,
    minProtein: 25,
    maxCalories: 500,
    maxTime: 30,
    filters: {
      vegan: false,
      vegetarian: false,
      glutenFree: false,
      dairyFree: false,
      keto: false,
      noEggs: false
    },

    get filteredRecipes() {
      return this.recipes.filter(r => {
        // Macro filters
        if (r.protein < this.minProtein) return false;
        if (r.calories > this.maxCalories) return false;
        if (r.totalTime > this.maxTime) return false;

        // Dietary filters
        const tags = r.tags.map(t => t.toLowerCase());
        if (this.filters.vegan && !tags.includes('vegan')) return false;
        if (this.filters.vegetarian && !tags.includes('vegetarian') && !tags.includes('vegan')) return false;
        if (this.filters.glutenFree && !tags.some(t => t.includes('gluten-free') || t.includes('gluten free'))) return false;
        if (this.filters.dairyFree && !tags.some(t => t.includes('dairy-free') || t.includes('dairy free'))) return false;
        if (this.filters.keto && !tags.some(t => t.includes('keto') || t.includes('low-carb') || t.includes('low carb'))) return false;
        if (this.filters.noEggs && !tags.some(t => t.includes('no-eggs') || t.includes('egg-free') || t.includes('no eggs'))) return false;

        return true;
      }).sort((a, b) => b.protein - a.protein);
    },

    resetFilters() {
      this.minProtein = 25;
      this.maxCalories = 500;
      this.maxTime = 30;
      this.filters = { vegan: false, vegetarian: false, glutenFree: false, dairyFree: false, keto: false, noEggs: false };
    }
  }));
});
</script>

</body>
</html>
`;

  const html = ejs.render(template, { site, recipesJson, include: (name, data) => ejs.render(partials[name], data) });
  fs.writeFileSync(path.join(outputDir, 'tools', 'breakfast-builder.html'), html);
}

/**
 * Generate Cost-per-Protein Calculator page
 */
function generateCostCalculator(site, partials, outputDir) {
  const template = `
<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
<head>
<%- include('head', {
  site,
  pageTitle: 'Cost Per Gram Protein Calculator - Find Cheapest Protein Sources | ' + site.name,
  pageDescription: 'Calculate and compare cost per gram of protein for any food. Find the most budget-friendly protein sources. Free protein cost calculator.',
  canonicalPath: '/tools/protein-cost-calculator.html',
  ogType: 'website',
  ogImage: site.socialImage,
  preloadImage: null,
  includeIngredients: false
}) %>
</head>
<body class="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans">
<%- include('nav', { site }) %>

<main class="flex-grow py-12">
  <div class="max-w-4xl mx-auto px-4" x-data="costCalculator()">

    <!-- Breadcrumb -->
    <nav class="mb-8 text-sm">
      <ol class="flex items-center gap-2 text-slate-500 dark:text-slate-400">
        <li><a href="/" class="hover:text-slate-900 dark:hover:text-white">Home</a></li>
        <li>/</li>
        <li><a href="/tools/" class="hover:text-slate-900 dark:hover:text-white">Tools</a></li>
        <li>/</li>
        <li class="text-slate-900 dark:text-white font-medium">Protein Cost Calculator</li>
      </ol>
    </nav>

    <!-- Header -->
    <div class="text-center mb-12">
      <h1 class="font-anton text-4xl lg:text-5xl uppercase mb-4">COST PER GRAM PROTEIN</h1>
      <p class="text-xl text-slate-600 dark:text-slate-400">Compare protein sources by price efficiency</p>
    </div>

    <!-- Input Section -->
    <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg mb-8">
      <h2 class="font-bold text-lg mb-6">Add Protein Sources</h2>

      <div class="space-y-4">
        <template x-for="(item, index) in items" :key="item.id">
          <div class="flex flex-wrap gap-3 items-end p-4 bg-slate-50 dark:bg-slate-900 rounded-xl">
            <div class="flex-grow min-w-[200px]">
              <label class="block text-xs text-slate-500 dark:text-slate-400 mb-1">Food Name</label>
              <input type="text" x-model="item.name" placeholder="e.g., Chicken Breast"
                     class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600
                            bg-white dark:bg-slate-700">
            </div>
            <div class="w-24">
              <label class="block text-xs text-slate-500 dark:text-slate-400 mb-1">Price ($)</label>
              <input type="number" x-model.number="item.price" step="0.01" min="0"
                     class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600
                            bg-white dark:bg-slate-700">
            </div>
            <div class="w-28">
              <label class="block text-xs text-slate-500 dark:text-slate-400 mb-1">Protein/Serving (g)</label>
              <input type="number" x-model.number="item.proteinPerServing" step="1" min="0"
                     class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600
                            bg-white dark:bg-slate-700">
            </div>
            <div class="w-20">
              <label class="block text-xs text-slate-500 dark:text-slate-400 mb-1">Servings</label>
              <input type="number" x-model.number="item.servings" step="1" min="1"
                     class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600
                            bg-white dark:bg-slate-700">
            </div>
            <button @click="removeItem(item.id)" x-show="items.length > 1"
                    class="p-2 text-slate-400 hover:text-red-500 transition-colors">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </template>
      </div>

      <button @click="addItem()"
              class="mt-4 px-4 py-2 bg-brand-500 text-white rounded-lg font-semibold hover:bg-brand-600 transition-colors">
        + Add Another Item
      </button>
    </div>

    <!-- Results Table -->
    <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg" x-show="sortedItems.length > 0">
      <h2 class="font-bold text-lg mb-6">Ranked by Cost Efficiency</h2>

      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-slate-200 dark:border-slate-700 text-left">
              <th class="py-3 font-semibold">#</th>
              <th class="py-3 font-semibold">Food</th>
              <th class="py-3 font-semibold text-right">$/g Protein</th>
              <th class="py-3 font-semibold text-right">Total Protein</th>
              <th class="py-3 font-semibold text-center">Rating</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-700">
            <template x-for="(item, index) in sortedItems" :key="item.id">
              <tr>
                <td class="py-4 font-bold" x-text="index + 1"></td>
                <td class="py-4" x-text="item.name || 'Item ' + (index + 1)"></td>
                <td class="py-4 text-right font-mono font-bold" x-text="'$' + costPerGram(item).toFixed(3)"></td>
                <td class="py-4 text-right" x-text="totalProtein(item) + 'g'"></td>
                <td class="py-4 text-center">
                  <span class="px-2 py-1 rounded text-sm font-bold"
                        :class="ratingClass(item)"
                        x-text="ratingLabel(item)"></span>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>

      <!-- Cost to Hit 100g -->
      <div class="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
        <h3 class="font-bold mb-4">Cost to Get 100g Protein</h3>
        <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <template x-for="item in sortedItems.slice(0, 6)" :key="item.id + '-100g'">
            <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-900">
              <div class="font-semibold truncate" x-text="item.name || 'Unknown'"></div>
              <div class="text-2xl font-bold text-brand-600 dark:text-brand-400" x-text="'$' + (costPerGram(item) * 100).toFixed(2)"></div>
            </div>
          </template>
        </div>
      </div>
    </div>

    <!-- Rating Guide -->
    <div class="mt-8 bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg">
      <h2 class="font-bold text-lg mb-4">Cost Efficiency Ratings</h2>
      <div class="grid sm:grid-cols-4 gap-4 text-center">
        <div><span class="px-3 py-1 rounded bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 font-bold">EXCELLENT</span><div class="text-sm mt-1">&lt;$0.03/g</div></div>
        <div><span class="px-3 py-1 rounded bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 font-bold">GOOD</span><div class="text-sm mt-1">$0.03-0.06/g</div></div>
        <div><span class="px-3 py-1 rounded bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 font-bold">AVERAGE</span><div class="text-sm mt-1">$0.06-0.10/g</div></div>
        <div><span class="px-3 py-1 rounded bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 font-bold">EXPENSIVE</span><div class="text-sm mt-1">&gt;$0.10/g</div></div>
      </div>
    </div>

  </div>
</main>

<%- include('footer', { site }) %>

<script>
document.addEventListener('alpine:init', () => {
  Alpine.data('costCalculator', () => ({
    items: [
      { id: 1, name: 'Chicken Breast (1 lb)', price: 4.99, proteinPerServing: 31, servings: 4 },
      { id: 2, name: 'Eggs (dozen)', price: 3.99, proteinPerServing: 6, servings: 12 },
      { id: 3, name: 'Whey Protein (2 lb)', price: 29.99, proteinPerServing: 25, servings: 30 }
    ],
    nextId: 4,

    addItem() {
      this.items.push({ id: this.nextId++, name: '', price: 0, proteinPerServing: 0, servings: 1 });
    },

    removeItem(id) {
      this.items = this.items.filter(i => i.id !== id);
    },

    totalProtein(item) {
      return item.proteinPerServing * item.servings;
    },

    costPerGram(item) {
      const total = this.totalProtein(item);
      if (total <= 0 || item.price <= 0) return Infinity;
      return item.price / total;
    },

    get sortedItems() {
      return [...this.items]
        .filter(i => i.proteinPerServing > 0 && i.price > 0)
        .sort((a, b) => this.costPerGram(a) - this.costPerGram(b));
    },

    ratingLabel(item) {
      const cpg = this.costPerGram(item);
      if (cpg < 0.03) return 'EXCELLENT';
      if (cpg < 0.06) return 'GOOD';
      if (cpg < 0.10) return 'AVERAGE';
      return 'EXPENSIVE';
    },

    ratingClass(item) {
      const cpg = this.costPerGram(item);
      if (cpg < 0.03) return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300';
      if (cpg < 0.06) return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
      if (cpg < 0.10) return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300';
      return 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300';
    }
  }));
});
</script>

</body>
</html>
`;

  const html = ejs.render(template, { site, include: (name, data) => ejs.render(partials[name], data) });
  fs.writeFileSync(path.join(outputDir, 'tools', 'protein-cost-calculator.html'), html);
}

/**
 * Generate Tools Landing Page
 */
function generateToolsLandingPage(site, partials, outputDir) {
  const template = `
<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
<head>
<%- include('head', {
  site,
  pageTitle: 'Protein Calculator Tools | ' + site.name,
  pageDescription: 'Free protein calculator tools: P:E ratio calculator, breakfast macro builder, and cost-per-gram protein calculator. Optimize your high-protein diet.',
  canonicalPath: '/tools/',
  ogType: 'website',
  ogImage: site.socialImage,
  preloadImage: null,
  includeIngredients: false
}) %>
</head>
<body class="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans">
<%- include('nav', { site }) %>

<main class="flex-grow py-12">
  <div class="max-w-7xl mx-auto px-4">

    <!-- Breadcrumb -->
    <nav class="mb-8 text-sm">
      <ol class="flex items-center gap-2 text-slate-500 dark:text-slate-400">
        <li><a href="/" class="hover:text-slate-900 dark:hover:text-white">Home</a></li>
        <li>/</li>
        <li class="text-slate-900 dark:text-white font-medium">Tools</li>
      </ol>
    </nav>

    <!-- Header -->
    <div class="text-center mb-12">
      <h1 class="font-anton text-4xl lg:text-5xl uppercase mb-4">PROTEIN CALCULATOR TOOLS</h1>
      <p class="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
        Free tools to help you optimize your high-protein diet. Calculate ratios, find recipes, and compare costs.
      </p>
    </div>

    <!-- Tools Grid -->
    <div class="grid md:grid-cols-3 gap-8 mb-16">
      <!-- P:E Calculator -->
      <a href="/tools/pe-ratio-calculator.html" class="group bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all border border-slate-100 dark:border-slate-700 hover:border-brand-500">
        <div class="h-40 overflow-hidden">
          <img src="/images/breakfast/tool-pe-ratio.png" alt="P:E Ratio Calculator" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
        </div>
        <div class="p-8">
          <h3 class="font-anton text-2xl uppercase mb-3 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">P:E Ratio Calculator</h3>
          <p class="text-slate-600 dark:text-slate-400 mb-4">Calculate protein-to-energy ratio for any food. Find out if your meals are ELITE, EXCELLENT, or GOOD for protein density.</p>
          <span class="inline-flex items-center gap-2 text-brand-500 font-semibold group-hover:gap-3 transition-all">
            Calculate Now
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
          </span>
        </div>
      </a>

      <!-- Breakfast Builder -->
      <a href="/tools/breakfast-builder.html" class="group bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all border border-slate-100 dark:border-slate-700 hover:border-brand-500">
        <div class="h-40 overflow-hidden">
          <img src="/images/breakfast/tool-macro-builder.png" alt="Breakfast Macro Builder" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
        </div>
        <div class="p-8">
          <h3 class="font-anton text-2xl uppercase mb-3 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">Breakfast Macro Builder</h3>
          <p class="text-slate-600 dark:text-slate-400 mb-4">Set your protein target, calorie limit, and dietary restrictions. Find matching high-protein breakfast recipes instantly.</p>
          <span class="inline-flex items-center gap-2 text-brand-500 font-semibold group-hover:gap-3 transition-all">
            Build Breakfast
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
          </span>
        </div>
      </a>

      <!-- Cost Calculator -->
      <a href="/tools/protein-cost-calculator.html" class="group bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all border border-slate-100 dark:border-slate-700 hover:border-brand-500">
        <div class="h-40 overflow-hidden">
          <img src="/images/breakfast/tool-cost-calc.png" alt="Protein Cost Calculator" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
        </div>
        <div class="p-8">
          <h3 class="font-anton text-2xl uppercase mb-3 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">Cost-per-Protein Calculator</h3>
          <p class="text-slate-600 dark:text-slate-400 mb-4">Compare protein sources by price efficiency. Find the cheapest ways to hit your protein goals on any budget.</p>
          <span class="inline-flex items-center gap-2 text-brand-500 font-semibold group-hover:gap-3 transition-all">
            Compare Costs
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
          </span>
        </div>
      </a>
    </div>

    <!-- Browse Recipes CTA -->
    <div class="bg-gradient-to-br from-brand-500 to-accent-500 rounded-2xl p-8 lg:p-12 text-white text-center">
      <h2 class="font-anton text-3xl lg:text-4xl uppercase mb-4">EXPLORE HIGH-PROTEIN RECIPES</h2>
      <p class="text-white/80 text-lg mb-8 max-w-2xl mx-auto">
        Browse 300+ macro-verified recipes from our network of specialized protein recipe sites.
      </p>
      <div class="flex flex-wrap justify-center gap-4">
        <a href="/breakfast/" class="bg-white text-slate-900 px-6 py-3 rounded-xl font-semibold hover:bg-slate-100 transition-colors">
          Breakfast Recipes
        </a>
        <a href="/high-protein.html" class="bg-white/10 text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/20 transition-colors border border-white/20">
          30g+ Protein
        </a>
        <a href="/" class="bg-white/10 text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/20 transition-colors border border-white/20">
          All Recipes
        </a>
      </div>
    </div>

  </div>
</main>

<%- include('footer', { site }) %>

</body>
</html>
`;

  const html = ejs.render(template, { site, include: (name, data) => ejs.render(partials[name], data) });
  fs.writeFileSync(path.join(outputDir, 'tools', 'index.html'), html);
}

/**
 * Generate programmatic breakfast landing pages
 */
function generateProgrammaticPages(site, breakfastRecipes, partials, outputDir) {
  const programmaticDir = path.join(outputDir, 'breakfast');
  fs.mkdirSync(programmaticDir, { recursive: true });

  for (const intent of PROGRAMMATIC_INTENTS) {
    // Filter recipes
    const matches = breakfastRecipes.filter(r => {
      const protein = r.protein || r.nutrition?.protein || 0;
      const calories = r.calories || r.nutrition?.calories || 0;
      const totalTime = r.totalTime || 0;
      const tags = (r.tags || []).map(t => t.toLowerCase());

      if (protein < intent.minProtein) return false;
      if (calories > intent.maxCalories) return false;
      if (intent.maxTime && totalTime > intent.maxTime) return false;
      if (intent.tags.length > 0) {
        const hasTag = intent.tags.some(t => tags.some(rt => rt.includes(t.toLowerCase())));
        if (!hasTag) return false;
      }
      return true;
    });

    if (matches.length < 3) continue; // Skip if too few results

    const template = `
<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
<head>
<%- include('head', {
  site,
  pageTitle: intent.title + ' | ' + site.name,
  pageDescription: 'Discover ' + matches.length + ' ' + intent.title.toLowerCase() + ' recipes with precise macro data. Perfect for meal prep and hitting your protein goals.',
  canonicalPath: '/breakfast/' + intent.slug + '.html',
  ogType: 'website',
  ogImage: site.socialImage,
  preloadImage: null,
  includeIngredients: false
}) %>
</head>
<body class="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans">
<%- include('nav', { site }) %>

<main class="flex-grow py-12">
  <div class="max-w-7xl mx-auto px-4">

    <!-- Breadcrumb -->
    <nav class="mb-8 text-sm">
      <ol class="flex items-center gap-2 text-slate-500 dark:text-slate-400">
        <li><a href="/" class="hover:text-slate-900 dark:hover:text-white">Home</a></li>
        <li>/</li>
        <li><a href="/breakfast/" class="hover:text-slate-900 dark:hover:text-white">Breakfast</a></li>
        <li>/</li>
        <li class="text-slate-900 dark:text-white font-medium"><%= intent.title %></li>
      </ol>
    </nav>

    <!-- Header -->
    <div class="mb-12">
      <h1 class="font-anton text-4xl lg:text-5xl uppercase tracking-wider mb-4"><%= intent.title %></h1>
      <p class="text-slate-600 dark:text-slate-400 text-lg">
        <%= matches.length %> recipes with at least <%= intent.minProtein %>g protein<% if (intent.maxCalories < 999) { %> and under <%= intent.maxCalories %> calories<% } %><% if (intent.maxTime) { %>, ready in <%= intent.maxTime %> minutes or less<% } %>.
      </p>
    </div>

    <!-- Recipe Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
      <% matches.forEach(recipe => { %>
        <%- include('recipe-card', { recipe }) %>
      <% }); %>
    </div>

    <!-- CTA to Builder -->
    <div class="bg-gradient-to-r from-brand-500 to-accent-500 rounded-2xl p-8 text-white text-center">
      <h2 class="font-anton text-2xl uppercase mb-3">Want More Control?</h2>
      <p class="text-white/80 mb-4">Use our Breakfast Macro Builder to set exact protein, calorie, and dietary filters.</p>
      <a href="/tools/breakfast-builder.html" class="inline-flex items-center gap-2 bg-white text-slate-900 px-6 py-3 rounded-lg font-semibold hover:bg-slate-100 transition-colors">
        Open Breakfast Builder
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
      </a>
    </div>

  </div>
</main>

<%- include('footer', { site }) %>

</body>
</html>
`;

    const html = ejs.render(template, {
      site,
      intent,
      matches,
      include: (name, data) => ejs.render(partials[name], data)
    });

    fs.writeFileSync(path.join(programmaticDir, `${intent.slug}.html`), html);
  }
}

/**
 * Generate breakfast pillar page
 */
function generateBreakfastPillarPage(site, breakfastRecipes, partials, outputDir) {
  const programmaticDir = path.join(outputDir, 'breakfast');
  fs.mkdirSync(programmaticDir, { recursive: true });

  // Get counts for programmatic pages
  const intentCounts = PROGRAMMATIC_INTENTS.map(intent => {
    const matches = breakfastRecipes.filter(r => {
      const protein = r.protein || r.nutrition?.protein || 0;
      const calories = r.calories || r.nutrition?.calories || 0;
      const totalTime = r.totalTime || 0;
      const tags = (r.tags || []).map(t => t.toLowerCase());

      if (protein < intent.minProtein) return false;
      if (calories > intent.maxCalories) return false;
      if (intent.maxTime && totalTime > intent.maxTime) return false;
      if (intent.tags.length > 0) {
        const hasTag = intent.tags.some(t => tags.some(rt => rt.includes(t.toLowerCase())));
        if (!hasTag) return false;
      }
      return true;
    });
    return { ...intent, count: matches.length };
  }).filter(i => i.count >= 3);

  // Get top 25 recipes sorted by protein content (highest first)
  const topBreakfastRecipes = [...breakfastRecipes]
    .sort((a, b) => {
      const proteinA = a.protein || a.nutrition?.protein || 0;
      const proteinB = b.protein || b.nutrition?.protein || 0;
      return proteinB - proteinA;
    })
    .slice(0, 25);

  const template = `
<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
<head>
<%- include('head', {
  site,
  pageTitle: 'High Protein Breakfast Recipes - Complete Guide | ' + site.name,
  pageDescription: 'Browse ' + breakfastRecipes.length + ' high-protein breakfast recipes. Filter by macros, dietary restrictions, and prep time. Build your perfect morning meal.',
  canonicalPath: '/breakfast/',
  ogType: 'website',
  ogImage: site.socialImage,
  preloadImage: null,
  includeIngredients: false
}) %>
</head>
<body class="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans">
<%- include('nav', { site }) %>

<main class="flex-grow">
  <!-- Hero -->
  <section class="relative text-white py-16 lg:py-24 overflow-hidden">
    <div class="absolute inset-0">
      <img src="/images/breakfast/hero-bg.png" alt="" class="w-full h-full object-cover">
      <div class="absolute inset-0 bg-gradient-to-br from-amber-500/90 to-orange-600/90"></div>
    </div>
    <div class="relative max-w-7xl mx-auto px-4 text-center">
      <h1 class="font-anton text-5xl lg:text-6xl uppercase tracking-wider mb-6 drop-shadow-lg">HIGH PROTEIN BREAKFAST</h1>
      <p class="text-xl lg:text-2xl text-white/90 max-w-3xl mx-auto mb-8">
        <%= breakfastRecipes.length %> macro-verified breakfast recipes. Pancakes, oatmeal, muffins, and more - all optimized for protein.
      </p>
      <a href="/tools/breakfast-builder.html" class="inline-flex items-center gap-2 bg-white text-slate-900 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-slate-100 transition-colors shadow-lg">
        Build Your Perfect Breakfast
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
      </a>
    </div>
  </section>

  <!-- Quick Filters -->
  <section class="py-12 bg-white dark:bg-slate-800">
    <div class="max-w-7xl mx-auto px-4">
      <h2 class="font-anton text-3xl uppercase mb-8 text-center">BROWSE BY GOAL</h2>
      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <%
        const goalImages = {
          '30g-protein-under-300-calories': 'goal-30g-protein.png',
          'quick-high-protein-breakfast': 'goal-quick-15min.png',
          'low-calorie-high-protein-breakfast': 'goal-low-cal.png'
        };
        intentCounts.forEach(intent => {
          const goalImage = goalImages[intent.slug] || 'goal-30g-protein.png';
        %>
        <a href="/breakfast/<%= intent.slug %>.html" class="group bg-slate-50 dark:bg-slate-900 rounded-xl overflow-hidden hover:shadow-lg transition-all border border-slate-100 dark:border-slate-700 hover:border-brand-500">
          <div class="h-32 overflow-hidden">
            <img src="/images/breakfast/<%= goalImage %>" alt="<%= intent.title %>" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
          </div>
          <div class="p-4">
            <h3 class="font-semibold text-lg mb-1 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors"><%= intent.title %></h3>
            <p class="text-sm text-slate-500 dark:text-slate-400"><%= intent.count %> recipes</p>
          </div>
        </a>
        <% }); %>
      </div>
    </div>
  </section>

  <!-- Featured Breakfast Recipes -->
  <section class="py-16">
    <div class="max-w-7xl mx-auto px-4">
      <div class="flex justify-between items-center mb-8">
        <h2 class="font-anton text-3xl uppercase">TOP BREAKFAST RECIPES</h2>
        <a href="/tools/breakfast-builder.html" class="text-brand-500 hover:text-brand-600 font-medium">Filter Recipes &rarr;</a>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        <% topBreakfastRecipes.forEach(recipe => { %>
          <%- include('recipe-card', { recipe }) %>
        <% }); %>
      </div>
    </div>
  </section>

  <!-- Builder CTA -->
  <section class="py-12 mx-4 lg:mx-8">
    <div class="relative max-w-5xl mx-auto rounded-2xl overflow-hidden">
      <div class="absolute inset-0">
        <img src="/images/breakfast/builder-bg.png" alt="" class="w-full h-full object-cover">
        <div class="absolute inset-0 bg-gradient-to-r from-brand-500/90 to-accent-500/90"></div>
      </div>
      <div class="relative p-8 lg:p-12 text-white text-center">
        <h2 class="font-anton text-3xl lg:text-4xl uppercase mb-4 drop-shadow-lg">BUILD YOUR PERFECT BREAKFAST</h2>
        <p class="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
          Set your protein target, calorie limit, and dietary preferences. Find matching recipes instantly.
        </p>
        <a href="/tools/breakfast-builder.html" class="inline-flex items-center gap-2 bg-white text-slate-900 px-8 py-4 rounded-xl font-semibold hover:bg-slate-100 transition-colors shadow-lg">
          Open Breakfast Builder
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
        </a>
      </div>
    </div>
  </section>

  <!-- Tools -->
  <section class="py-16 bg-white dark:bg-slate-800">
    <div class="max-w-7xl mx-auto px-4">
      <h2 class="font-anton text-3xl uppercase mb-8 text-center">PROTEIN TOOLS</h2>
      <div class="grid md:grid-cols-3 gap-6">
        <a href="/tools/pe-ratio-calculator.html" class="group bg-slate-50 dark:bg-slate-900 rounded-xl overflow-hidden hover:shadow-lg transition-all border border-slate-100 dark:border-slate-700">
          <div class="h-40 overflow-hidden">
            <img src="/images/breakfast/tool-pe-ratio.png" alt="P:E Ratio Calculator" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
          </div>
          <div class="p-6">
            <h3 class="font-semibold text-lg mb-2 group-hover:text-brand-600 dark:group-hover:text-brand-400">P:E Ratio Calculator</h3>
            <p class="text-sm text-slate-500 dark:text-slate-400">Calculate protein-to-energy ratio for any food</p>
          </div>
        </a>
        <a href="/tools/breakfast-builder.html" class="group bg-slate-50 dark:bg-slate-900 rounded-xl overflow-hidden hover:shadow-lg transition-all border border-slate-100 dark:border-slate-700">
          <div class="h-40 overflow-hidden">
            <img src="/images/breakfast/tool-macro-builder.png" alt="Breakfast Macro Builder" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
          </div>
          <div class="p-6">
            <h3 class="font-semibold text-lg mb-2 group-hover:text-brand-600 dark:group-hover:text-brand-400">Breakfast Macro Builder</h3>
            <p class="text-sm text-slate-500 dark:text-slate-400">Filter recipes by your exact macro targets</p>
          </div>
        </a>
        <a href="/tools/protein-cost-calculator.html" class="group bg-slate-50 dark:bg-slate-900 rounded-xl overflow-hidden hover:shadow-lg transition-all border border-slate-100 dark:border-slate-700">
          <div class="h-40 overflow-hidden">
            <img src="/images/breakfast/tool-cost-calc.png" alt="Protein Cost Calculator" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
          </div>
          <div class="p-6">
            <h3 class="font-semibold text-lg mb-2 group-hover:text-brand-600 dark:group-hover:text-brand-400">Protein Cost Calculator</h3>
            <p class="text-sm text-slate-500 dark:text-slate-400">Compare cost per gram of protein</p>
          </div>
        </a>
      </div>
    </div>
  </section>

  <!-- SEO Content Section -->
  <section class="py-16">
    <div class="max-w-7xl mx-auto px-4">
      <h2 class="font-anton text-3xl uppercase tracking-wider mb-8"><%= seoContent.title %></h2>
      <div class="prose prose-slate dark:prose-invert max-w-none">
        <% seoContent.sections.forEach(section => { %>
        <div class="mb-8">
          <h3 class="text-xl font-semibold mb-4 text-slate-800 dark:text-slate-200"><%= section.heading %></h3>
          <% section.content.split('\\n\\n').forEach(paragraph => { %>
          <p class="text-slate-600 dark:text-slate-400 mb-4 leading-relaxed"><%= paragraph %></p>
          <% }); %>
        </div>
        <% }); %>
      </div>
    </div>
  </section>
</main>

<%- include('footer', { site }) %>

</body>
</html>
`;

  // Use the breakfast category SEO content
  const seoContent = SEO_CONTENT['category-breakfast'];

  const html = ejs.render(template, {
    site,
    breakfastRecipes,
    topBreakfastRecipes,
    intentCounts,
    seoContent,
    include: (name, data) => ejs.render(partials[name], data)
  });

  fs.writeFileSync(path.join(programmaticDir, 'index.html'), html);
}

// Run the build
buildIndexerSite().catch(console.error);
