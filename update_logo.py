import os
import glob

html_files = glob.glob("*.html")
print(f"Found {len(html_files)} html files")

old_str = '<strong class="logo-text">Sindh Emporio</strong>'
new_str = '<strong class="logo-text"><span>SINDH</span><span class="sub">EMPORIO</span></strong>'

for filename in html_files:
    try:
        with open(filename, 'r', encoding='utf-8') as f:
            content = f.read()
        
        if old_str in content:
            new_content = content.replace(old_str, new_str)
            with open(filename, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"Updated logo in {filename}")
        else:
            print(f"No matching logo in {filename}")
    except Exception as e:
        print(f"Error updating {filename}: {e}")
