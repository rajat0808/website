import os
import glob

html_files = glob.glob("*.html")
print(f"Found {len(html_files)} html files")

for filename in html_files:
    try:
        with open(filename, 'r', encoding='utf-8') as f:
            content = f.read()
        
        if "style.css?v=20260420-9" in content:
            new_content = content.replace("style.css?v=20260420-9", "style.css?v=20260420-10")
            with open(filename, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"Updated {filename} to v10")
        else:
            print(f"No match in {filename}")
    except Exception as e:
        print(f"Error updating {filename}: {e}")
