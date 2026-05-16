import os

files = [
    r'd:\New folder (3)\emporio\dist\brand.html',
    r'd:\New folder (3)\emporio\dist\index.html'
]
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

for path in files:
    if os.path.exists(path):
        with open(path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        for brand in block_brands:
            content = content.replace(f'href="{brand}"', f'href="javascript:void(0)" style="cursor: default;"')
            
        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)

print("Done blocking brands in dist")
