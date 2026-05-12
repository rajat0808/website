import re
from pathlib import Path

new_version = "20260424-5"
directory = Path(__file__).resolve().parent

for filepath in directory.glob("*.html"):
    content = filepath.read_text(encoding="utf-8")

    updated_content = re.sub(r'style\.css\?v=[^"]*', f"style.css?v={new_version}", content)

    if updated_content != content:
        filepath.write_text(updated_content, encoding="utf-8")
        print(f"Updated {filepath.name}")
