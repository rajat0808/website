import os
import glob

html_files = glob.glob("*.html")
print(f"Found {len(html_files)} html files")

old_footer = '<h2 class="footer-logo">SINDH EMPORIO</h2>'
new_footer = '<h2 class="footer-logo"><span>SINDH</span><span class="logo-sub">EMPORIO</span></h2>'

for filename in html_files:
    try:
        with open(filename, 'r', encoding='utf-8') as f:
            content = f.read()
        
        if old_footer in content:
            new_content = content.replace(old_footer, new_footer)
            with open(filename, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"Updated footer logo in {filename}")
        else:
            print(f"No matching footer logo in {filename}")
    except Exception as e:
        print(f"Error updating {filename}: {e}")
