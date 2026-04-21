import os
import glob
from datetime import datetime

base_url = "https://sindhemporio.com" # Placeholder Domain
html_files = glob.glob("*.html")

xml_content = '<?xml version="1.0" encoding="UTF-8"?>\n'
xml_content += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'

for file in html_files:
    priority = "1.0" if file == "index.html" else "0.8"
    xml_content += '  <url>\n'
    xml_content += f'    <loc>{base_url}/{file}</loc>\n'
    xml_content += f'    <lastmod>{datetime.now().strftime("%Y-%m-%d")}</lastmod>\n'
    xml_content += f'    <priority>{priority}</priority>\n'
    xml_content += '  </url>\n'

xml_content += '</urlset>\n'

with open("sitemap.xml", "w", encoding="utf-8") as f:
    f.write(xml_content)

with open("robots.txt", "w", encoding="utf-8") as f:
    f.write("User-agent: *\nAllow: /\n\nSitemap: https://sindhemporio.com/sitemap.xml\n")
    
print("Generated sitemap.xml and robots.txt.")
