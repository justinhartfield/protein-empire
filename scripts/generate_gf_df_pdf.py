#!/usr/bin/env python3
"""
Generate Gluten-Free & Dairy-Free Protein Recipe Pack PDF
A comprehensive lead magnet for the Protein Empire network
"""

import json
from fpdf import FPDF
from datetime import datetime

class RecipePDF(FPDF):
    def __init__(self):
        super().__init__()
        self.set_auto_page_break(auto=True, margin=20)
        
    def header(self):
        if self.page_no() > 1:
            self.set_font('Helvetica', 'I', 9)
            self.set_text_color(128, 128, 128)
            self.cell(0, 10, 'Gluten-Free & Dairy-Free Protein Recipe Pack', 0, 0, 'C')
            self.ln(15)
    
    def footer(self):
        self.set_y(-15)
        self.set_font('Helvetica', 'I', 8)
        self.set_text_color(128, 128, 128)
        self.cell(0, 10, f'Page {self.page_no()}', 0, 0, 'C')
    
    def chapter_title(self, title, subtitle=""):
        self.set_font('Helvetica', 'B', 24)
        self.set_text_color(245, 158, 11)  # Brand amber color
        self.cell(0, 15, title, 0, 1, 'C')
        if subtitle:
            self.set_font('Helvetica', '', 12)
            self.set_text_color(100, 100, 100)
            self.cell(0, 8, subtitle, 0, 1, 'C')
        self.ln(10)
    
    def section_title(self, title):
        self.set_font('Helvetica', 'B', 16)
        self.set_text_color(30, 41, 59)  # Slate-800
        self.cell(0, 12, title, 0, 1, 'L')
        self.ln(3)
    
    def recipe_title(self, title, diet_type):
        self.set_font('Helvetica', 'B', 14)
        self.set_text_color(30, 41, 59)
        self.cell(0, 10, title, 0, 1, 'L')
        
        # Diet badge
        if diet_type == "gluten_free":
            badge_text = "GLUTEN-FREE"
            badge_color = (34, 197, 94)  # Green
        else:
            badge_text = "DAIRY-FREE"
            badge_color = (59, 130, 246)  # Blue
        
        self.set_fill_color(*badge_color)
        self.set_text_color(255, 255, 255)
        self.set_font('Helvetica', 'B', 8)
        self.cell(30, 6, badge_text, 0, 1, 'C', True)
        self.ln(3)
    
    def recipe_description(self, text):
        self.set_font('Helvetica', '', 10)
        self.set_text_color(71, 85, 105)  # Slate-600
        self.multi_cell(0, 5, text)
        self.ln(5)
    
    def nutrition_box(self, recipe):
        self.set_fill_color(248, 250, 252)  # Slate-50
        self.set_draw_color(226, 232, 240)  # Slate-200
        
        # Box dimensions
        box_width = 180
        box_height = 25
        x_start = self.get_x()
        y_start = self.get_y()
        
        self.rect(x_start, y_start, box_width, box_height, 'DF')
        
        # Nutrition values
        nutrients = [
            ("Protein", f"{recipe['protein']}g"),
            ("Calories", f"{recipe['calories']}"),
            ("Carbs", f"{recipe['carbs']}g"),
            ("Fat", f"{recipe['fat']}g"),
            ("Fiber", f"{recipe['fiber']}g")
        ]
        
        col_width = box_width / len(nutrients)
        
        for i, (label, value) in enumerate(nutrients):
            x_pos = x_start + (i * col_width)
            
            # Value
            self.set_xy(x_pos, y_start + 3)
            self.set_font('Helvetica', 'B', 12)
            self.set_text_color(245, 158, 11)
            self.cell(col_width, 6, value, 0, 0, 'C')
            
            # Label
            self.set_xy(x_pos, y_start + 12)
            self.set_font('Helvetica', '', 8)
            self.set_text_color(100, 116, 139)
            self.cell(col_width, 6, label, 0, 0, 'C')
        
        self.set_y(y_start + box_height + 8)
    
    def recipe_details(self, recipe):
        self.set_font('Helvetica', '', 9)
        self.set_text_color(71, 85, 105)
        
        details = f"Prep: {recipe['prepTime']} min | Cook: {recipe['cookTime']} min | Total: {recipe['totalTime']} min | Yield: {recipe['yield']} | Difficulty: {recipe['difficulty']}"
        self.cell(0, 6, details, 0, 1, 'L')
        self.ln(5)
    
    def ingredients_section(self, ingredients):
        self.set_font('Helvetica', 'B', 11)
        self.set_text_color(30, 41, 59)
        self.cell(0, 8, "INGREDIENTS", 0, 1, 'L')
        
        self.set_font('Helvetica', '', 10)
        self.set_text_color(51, 65, 85)
        
        for ingredient in ingredients:
            if ingredient.startswith("For "):
                self.set_font('Helvetica', 'I', 10)
                self.cell(0, 6, ingredient, 0, 1, 'L')
                self.set_font('Helvetica', '', 10)
            else:
                self.cell(5, 6, "-", 0, 0, 'L')
                self.cell(0, 6, ingredient, 0, 1, 'L')
        self.ln(5)
    
    def instructions_section(self, instructions):
        self.set_font('Helvetica', 'B', 11)
        self.set_text_color(30, 41, 59)
        self.cell(0, 8, "INSTRUCTIONS", 0, 1, 'L')
        
        for i, instruction in enumerate(instructions, 1):
            # Step number
            self.set_font('Helvetica', 'B', 10)
            self.set_text_color(245, 158, 11)
            self.cell(8, 6, f"{i}.", 0, 0, 'L')
            
            # Step title
            self.set_font('Helvetica', 'B', 10)
            self.set_text_color(30, 41, 59)
            self.cell(0, 6, instruction['step'], 0, 1, 'L')
            
            # Step text
            self.set_x(self.get_x() + 8)
            self.set_font('Helvetica', '', 9)
            self.set_text_color(71, 85, 105)
            self.multi_cell(0, 5, instruction['text'])
            self.ln(2)
        self.ln(5)


def create_pdf():
    # Load recipes
    with open('/home/ubuntu/protein-empire/data/recipes/gluten-free-dairy-free-recipes.json', 'r') as f:
        recipes_data = json.load(f)
    
    pdf = RecipePDF()
    pdf.set_margins(15, 15, 15)
    
    # Cover Page
    pdf.add_page()
    pdf.ln(40)
    pdf.set_font('Helvetica', 'B', 36)
    pdf.set_text_color(245, 158, 11)
    pdf.cell(0, 20, 'GLUTEN-FREE &', 0, 1, 'C')
    pdf.cell(0, 20, 'DAIRY-FREE', 0, 1, 'C')
    pdf.set_font('Helvetica', 'B', 28)
    pdf.set_text_color(30, 41, 59)
    pdf.cell(0, 15, 'PROTEIN RECIPE PACK', 0, 1, 'C')
    pdf.ln(10)
    pdf.set_font('Helvetica', '', 14)
    pdf.set_text_color(100, 116, 139)
    pdf.cell(0, 10, '22 Macro-Verified Recipes for Every Diet', 0, 1, 'C')
    pdf.ln(30)
    
    # Subtitle
    pdf.set_font('Helvetica', 'I', 12)
    pdf.set_text_color(71, 85, 105)
    pdf.multi_cell(0, 6, 'Delicious high-protein recipes that are both gluten-free AND dairy-free friendly.\nPerfect for those with dietary restrictions who refuse to compromise on taste or nutrition.', 0, 'C')
    
    pdf.ln(40)
    pdf.set_font('Helvetica', '', 10)
    pdf.set_text_color(128, 128, 128)
    pdf.cell(0, 8, 'From the Protein Empire Network', 0, 1, 'C')
    pdf.cell(0, 6, f'Generated: {datetime.now().strftime("%B %Y")}', 0, 1, 'C')
    
    # Table of Contents
    pdf.add_page()
    pdf.chapter_title('Table of Contents')
    
    site_names = {
        'protein-bread-com': 'Protein Bread',
        'proteinbars-co': 'Protein Bars',
        'proteinbites-co': 'Protein Bites',
        'proteinbrownies-co': 'Protein Brownies',
        'proteincheesecake-co': 'Protein Cheesecake',
        'proteincookies-co': 'Protein Cookies',
        'proteindonuts-co': 'Protein Donuts',
        'proteinoatmeal-co': 'Protein Oatmeal',
        'proteinpancakes-co': 'Protein Pancakes',
        'proteinpizzas-co': 'Protein Pizzas',
        'proteinpudding-co': 'Protein Pudding'
    }
    
    pdf.set_font('Helvetica', '', 11)
    pdf.set_text_color(51, 65, 85)
    
    page_num = 3
    for site_key, site_name in site_names.items():
        if site_key in recipes_data:
            gf_recipe = recipes_data[site_key]['gluten_free']
            df_recipe = recipes_data[site_key]['dairy_free']
            
            pdf.set_font('Helvetica', 'B', 11)
            pdf.set_text_color(245, 158, 11)
            pdf.cell(0, 8, site_name.upper(), 0, 1, 'L')
            
            pdf.set_font('Helvetica', '', 10)
            pdf.set_text_color(51, 65, 85)
            pdf.cell(5, 6, '', 0, 0)
            pdf.cell(0, 6, f"- {gf_recipe['title']} (Gluten-Free)", 0, 1, 'L')
            pdf.cell(5, 6, '', 0, 0)
            pdf.cell(0, 6, f"- {df_recipe['title']} (Dairy-Free)", 0, 1, 'L')
            pdf.ln(3)
    
    # Introduction Page
    pdf.add_page()
    pdf.chapter_title('Welcome to Your', 'Allergy-Friendly Recipe Collection')
    
    pdf.set_font('Helvetica', '', 11)
    pdf.set_text_color(51, 65, 85)
    
    intro_text = """Living with dietary restrictions doesn't mean sacrificing flavor or nutrition. This carefully curated collection brings together 22 delicious, macro-verified recipes designed specifically for those following gluten-free or dairy-free diets.

Each recipe in this pack has been developed with your health goals in mind:

- HIGH PROTEIN: Every recipe is optimized for maximum protein content to support muscle building, recovery, and satiety.

- MACRO-VERIFIED: All nutritional information has been calculated and verified, making it easy to track your intake.

- ALLERGY-FRIENDLY: Recipes are clearly labeled as either gluten-free or dairy-free, with many being both!

- DELICIOUS: We never compromise on taste. These recipes prove that healthy eating can be incredibly satisfying.

Whether you're managing celiac disease, lactose intolerance, or simply choosing to avoid gluten and dairy for health reasons, this collection has something for every meal and craving.

From fluffy pancakes to fudgy brownies, crispy pizza crusts to creamy puddings - enjoy all your favorites without the worry!"""

    pdf.multi_cell(0, 6, intro_text)
    
    pdf.ln(10)
    pdf.set_font('Helvetica', 'B', 12)
    pdf.set_text_color(245, 158, 11)
    pdf.cell(0, 8, 'Tips for Success:', 0, 1, 'L')
    
    tips = [
        "Always check that your protein powder is certified gluten-free if you have celiac disease.",
        "For dairy-free recipes, ensure your protein powder is plant-based (pea, rice, or hemp protein work great).",
        "Certified gluten-free oats are safe for most people with celiac disease, but check with your doctor.",
        "Many recipes can be made both gluten-free AND dairy-free with simple substitutions.",
        "Store homemade protein treats in the refrigerator for best texture and freshness."
    ]
    
    pdf.set_font('Helvetica', '', 10)
    pdf.set_text_color(51, 65, 85)
    for tip in tips:
        pdf.cell(5, 6, "-", 0, 0, 'L')
        pdf.multi_cell(0, 6, tip)
    
    # Recipe Pages
    for site_key, site_name in site_names.items():
        if site_key in recipes_data:
            site_data = recipes_data[site_key]
            
            # Section header page
            pdf.add_page()
            pdf.ln(20)
            pdf.set_font('Helvetica', 'B', 28)
            pdf.set_text_color(245, 158, 11)
            pdf.cell(0, 15, site_name.upper(), 0, 1, 'C')
            pdf.set_font('Helvetica', '', 12)
            pdf.set_text_color(100, 116, 139)
            pdf.cell(0, 10, '2 Allergy-Friendly Recipes', 0, 1, 'C')
            
            # Gluten-Free Recipe
            pdf.add_page()
            gf_recipe = site_data['gluten_free']
            pdf.recipe_title(gf_recipe['title'], 'gluten_free')
            pdf.recipe_description(gf_recipe['description'])
            pdf.nutrition_box(gf_recipe)
            pdf.recipe_details(gf_recipe)
            pdf.ingredients_section(gf_recipe['ingredients'])
            pdf.instructions_section(gf_recipe['instructions'])
            
            # Dairy-Free Recipe
            pdf.add_page()
            df_recipe = site_data['dairy_free']
            pdf.recipe_title(df_recipe['title'], 'dairy_free')
            pdf.recipe_description(df_recipe['description'])
            pdf.nutrition_box(df_recipe)
            pdf.recipe_details(df_recipe)
            pdf.ingredients_section(df_recipe['ingredients'])
            pdf.instructions_section(df_recipe['instructions'])
    
    # Final Page
    pdf.add_page()
    pdf.ln(30)
    pdf.set_font('Helvetica', 'B', 24)
    pdf.set_text_color(245, 158, 11)
    pdf.cell(0, 15, 'Thank You!', 0, 1, 'C')
    
    pdf.ln(10)
    pdf.set_font('Helvetica', '', 12)
    pdf.set_text_color(51, 65, 85)
    
    thank_you_text = """We hope you enjoy these gluten-free and dairy-free protein recipes!

For more delicious, macro-friendly recipes, visit our network of protein recipe sites:

- ProteinBread.com - Breads, bagels & loaves
- ProteinBars.co - Homemade protein bars
- ProteinBites.co - No-bake energy bites
- ProteinBrownies.co - Fudgy brownies & blondies
- ProteinCheesecake.co - Creamy cheesecakes
- ProteinCookies.co - Soft & chewy cookies
- ProteinDonuts.co - Baked protein donuts
- ProteinOatmeal.co - Overnight oats & proats
- ProteinPancakes.co - Pancakes, waffles & crepes
- ProteinPizzas.co - High-protein pizza crusts
- ProteinPudding.co - Puddings & chia bowls

Each site offers free recipe packs, detailed nutrition information, and tips for making the perfect protein treats.

Happy cooking!

The Protein Empire Team"""

    pdf.multi_cell(0, 6, thank_you_text, 0, 'C')
    
    # Save PDF
    output_path = '/home/ubuntu/protein-empire/data/pdfs/gluten-free-dairy-free-protein-recipe-pack.pdf'
    import os
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    pdf.output(output_path)
    print(f"PDF generated successfully: {output_path}")
    return output_path


if __name__ == "__main__":
    create_pdf()
