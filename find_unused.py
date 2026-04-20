import os
import glob
import re

html_files = glob.glob('*.html')
used_classes = set()
used_ids = set()

for file in html_files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()

    class_matches = re.findall(r'class=["\']([^"\']+)["\']', content)
    for match in class_matches:
        for c in match.split():
            used_classes.add(c)
            
    id_matches = re.findall(r'id=["\']([^"\']+)["\']', content)
    for match in id_matches:
        used_ids.add(match)

with open('style.css', 'r', encoding='utf-8') as f:
    css_content = f.read()

css_content = re.sub(r'/\*.*?\*/', '', css_content, flags=re.DOTALL)

defined_classes_matches = re.findall(r'\.([a-zA-Z_][a-zA-Z0-9_-]*)', css_content)
defined_classes = set(defined_classes_matches)

defined_ids_matches = re.findall(r'\#([a-zA-Z_][a-zA-Z0-9_-]*)', css_content)
defined_ids = set(defined_ids_matches)

unused_classes = defined_classes - used_classes
unused_ids = defined_ids - used_ids - set(['000', 'fff', '333', '111', 'e8e8e8', 'f8f9fa', 'ccc'])

print(f'Unused classes (sample): {list(unused_classes)[:20]}')
print(f'Total unused classes: {len(unused_classes)}')
