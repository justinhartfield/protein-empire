#!/usr/bin/env python3
"""Check for mismatches between pack pages and PDF files."""

import os
import re
from pathlib import Path

SITES = [
    "highprotein.recipes",
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

def main():
    apps_dir = Path(__file__).parent.parent / "apps"
    
    mismatches = []
    
    for site in SITES:
        site_dir = apps_dir / site / "dist"
        guides_dir = site_dir / "guides"
        
        # Get all pack pages
        pack_pages = list(site_dir.glob("pack-*.html"))
        
        # Get all PDFs
        if guides_dir.exists():
            pdfs = {p.stem for p in guides_dir.glob("*.pdf")}
        else:
            pdfs = set()
        
        # Check each pack page
        for pack_page in pack_pages:
            pack_name = pack_page.stem.replace("pack-", "")
            
            # Read the page to find the PDF URL
            content = pack_page.read_text()
            match = re.search(r"pdfUrl:.*?'/guides/([^']+\.pdf)'", content)
            
            if match:
                pdf_name = match.group(1).replace(".pdf", "")
                if pdf_name not in pdfs:
                    mismatches.append({
                        "site": site,
                        "pack_page": pack_page.name,
                        "expected_pdf": match.group(1),
                        "available_pdfs": sorted(pdfs)
                    })
    
    if mismatches:
        print(f"Found {len(mismatches)} mismatches:\n")
        for m in mismatches:
            print(f"Site: {m['site']}")
            print(f"  Pack page: {m['pack_page']}")
            print(f"  Expected PDF: {m['expected_pdf']}")
            print(f"  Available PDFs: {', '.join(m['available_pdfs'][:3])}...")
            print()
    else:
        print("No mismatches found!")

if __name__ == "__main__":
    main()
