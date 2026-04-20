import os
import glob

for filename in glob.glob("*.html"):
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()
    
    new_content = content.replace("style.css?v=20260420-8", "style.css?v=20260420-9")
    
    if content != new_content:
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {filename}")
