import os
import glob
import re

html_files = glob.glob('d:/New folder (3)/emporio/*.html')

for file in html_files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # regex to match style.css?v=... 
    pattern = r'style\.css\?v=[0-9\-]+'
    new_version_string = 'style.css?v=20260420-13'
    
    new_content = re.sub(pattern, new_version_string, content)
    
    if new_content != content:
        with open(file, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated cache buster in {file}")
