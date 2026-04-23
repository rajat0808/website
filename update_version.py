import os
import re

new_version = "20260423-15"
directory = r"d:\New folder (3)\emporio"

for filename in os.listdir(directory):
    if filename.endswith(".html"):
        filepath = os.path.join(directory, filename)
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Replace style.css?v=... with the new version
        updated_content = re.sub(r'style\.css\?v=[^"]*', f'style.css?v={new_version}', content)
        
        if updated_content != content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(updated_content)
            print(f"Updated {filename}")
