import os
import glob

html_files = glob.glob("*.html")
print(f"Found {len(html_files)} html files")

# Logo Replacements
old_header = '<strong class="logo-text">Sindh Emporio</strong>'
new_header = '<strong class="logo-text"><span>SINDH</span><span class="sub">EMPORIO</span></strong>'

old_footer = '<h2 class="footer-logo">SINDH EMPORIO</h2>'
new_footer = '<h2 class="footer-logo"><span>SINDH</span><span class="logo-sub">EMPORIO</span></h2>'

for filename in html_files:
    try:
        with open(filename, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Replacement 1: Header Logo
        content = content.replace(old_header, new_header)
        # Replacement 2: Footer Logo
        content = content.replace(old_footer, new_footer)
        # Replacement 3: Version Bump (from 9, 10, or 11 to 12)
        content = content.replace("style.css?v=20260420-9", "style.css?v=20260420-12")
        content = content.replace("style.css?v=20260420-10", "style.css?v=20260420-12")
        content = content.replace("style.css?v=20260420-11", "style.css?v=20260420-12")
        
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Verified & Updated {filename}")
        
    except Exception as e:
        print(f"Error processing {filename}: {e}")
