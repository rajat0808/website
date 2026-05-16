import os

files = ['brand.html', 'index.html']
block_brands = [
    'armani-exchange.html',
    'boss.html',
    'charles-tyrwhitt.html',
    'gas.html',
    'la-martina.html',
    'lacoste.html',
    'levis.html',
    'superdry.html'
]

dir_path = r'd:\New folder (3)\emporio'

for file_name in files:
    path = os.path.join(dir_path, file_name)
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    for brand in block_brands:
        # replace standard link
        content = content.replace(f'href="{brand}"', f'href="javascript:void(0)" style="cursor: default;"')
        
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

print("Done blocking brands")
