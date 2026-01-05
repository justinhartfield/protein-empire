#!/usr/bin/env python3
import os
import re

# List of domains to process
DOMAINS = [
    "protein-bread.com",
    "proteinbars.co",
    "proteinbites.co",
    "proteinbrownies.co",
    "proteincheesecake.co",
    "proteincookies.co",
    "proteindonuts.co",
    "proteinoatmeal.co",
    "proteinpancakes.co",
    "proteinpizzas.co",
    "proteinpudding.co"
]

def replace_logos_in_file(file_path, domain):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Replace Navigation Logo
    # Current structure:
    # <div class="flex items-center">
    #     <a href="/" class="flex items-center">
    #         <img src="/images/logo.png" alt="ProteinBread" class="h-12 w-12 rounded-lg mr-3">
    #         <span class="anton-text text-2xl text-slate-900 tracking-wider uppercase">PROTEINBREAD</span>
    #     </a>
    # </div>
    
    # We want to replace the entire content of the <a> tag with just the new logo image
    # The new logo image should be larger and not have the text span.
    
    # Regex to find the logo link in navigation
    nav_logo_pattern = re.compile(
        r'(<a href="/" class="flex items-center">\s*)<img src="/images/logo\.png" alt="[^"]*" class="h-12 w-12 rounded-lg mr-3">\s*<span class="anton-text text-2xl text-slate-900 tracking-wider uppercase">[^<]*</span>(\s*</a>)',
        re.IGNORECASE | re.MULTILINE
    )
    
    new_nav_logo = r'\1<img src="/images/logo.png" alt="' + domain + r'" class="h-12 md:h-16 w-auto">\2'
    content = nav_logo_pattern.sub(new_nav_logo, content)

    # 2. Replace Footer Logo
    # Current structure:
    # <a href="/" class="flex items-center mb-4">
    #     <img src="/images/logo.png" alt="ProteinBread" class="h-12 w-12 rounded-lg mr-3">
    #     <span class="anton-text text-xl tracking-wider">PROTEINBREAD</span>
    # </a>
    
    footer_logo_pattern = re.compile(
        r'(<a href="/" class="flex items-center mb-4">\s*)<img src="/images/logo\.png" alt="[^"]*" class="h-12 w-12 rounded-lg mr-3">\s*<span class="anton-text text-xl tracking-wider">[^<]*</span>(\s*</a>)',
        re.IGNORECASE | re.MULTILINE
    )
    
    new_footer_logo = r'\1<img src="/images/logo.png" alt="' + domain + r'" class="h-12 w-auto">\2'
    content = footer_logo_pattern.sub(new_footer_logo, content)

    # 3. Handle Mobile Menu Logo (if present)
    # Some sites might have the logo in the mobile menu too
    mobile_logo_pattern = re.compile(
        r'(<a href="/" class="flex items-center mb-6">\s*)<img src="/images/logo\.png" alt="[^"]*" class="h-12 w-12 rounded-lg mr-3">\s*<span class="anton-text text-2xl text-slate-900 tracking-wider uppercase">[^<]*</span>(\s*</a>)',
        re.IGNORECASE | re.MULTILINE
    )
    content = mobile_logo_pattern.sub(new_nav_logo, content)

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

def main():
    base_apps_dir = "/home/ubuntu/protein-empire/apps"
    
    for domain in DOMAINS:
        site_dist_dir = os.path.join(base_apps_dir, domain, "dist")
        if not os.path.exists(site_dist_dir):
            print(f"Skipping {domain}, dist directory not found.")
            continue
            
        print(f"Processing {domain}...")
        count = 0
        for root, dirs, files in os.walk(site_dist_dir):
            for file in files:
                if file.endswith(".html"):
                    file_path = os.path.join(root, file)
                    replace_logos_in_file(file_path, domain)
                    count += 1
        print(f"Updated {count} files in {domain}.")

if __name__ == "__main__":
    main()
