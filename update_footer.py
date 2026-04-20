import os
import glob
import re

html_files = glob.glob('d:/New folder (3)/emporio/*.html')

for file in html_files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Pattern to match <div class="footer-left"> and anything up to <p class="tagline">
    # We want to replace whatever is between them with the new logo code.
    # Note: re.DOTALL allows . to match newlines
    pattern = r'(<div class="footer-left">)\s*(?:<h2 class="footer-logo">.*?</h2>\s*)?(?:<br>)?\s*(<p class="tagline">)'
    
    replacement = r'\1\n          <h2 class="footer-logo">SINDH EMPORIO</h2>\n          \2'
    
    new_content = re.sub(pattern, replacement, content, flags=re.DOTALL)
    
    if new_content != content:
        with open(file, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {file}")
    else:
        print(f"No match/Already updated: {file}")
