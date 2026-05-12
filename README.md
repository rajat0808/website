# Sindh Emporio Website

Static multi-page marketing site for Sindh Emporio.

## Project Layout

- `index.html`: Home page.
- `brand.html`: Brand listing and spotlight page.
- `events.html`: Events page.
- `*.html` (brand pages): Individual brand detail pages.
- `style.css`: Shared global stylesheet for all pages.
- `assets/`: Images, videos, logos, and icon/font assets.

## Local Development

Serve the project root with a static HTTP server.

PowerShell:

```powershell
cd "D:\New folder (3)\emporio"
python -m http.server 8000
```

Then open:

`http://localhost:8000/index.html`

## Deploy Build

Build the publishable artifact into `dist/`:

```powershell
cd "D:\New folder (3)\emporio"
python -m pip install -r requirements-build.txt
python build_site.py
```

Preview the deploy output locally:

```powershell
python -m http.server 8000 --directory dist
```

The GitHub Pages workflow now deploys `dist/` instead of the whole repository.

## Maintenance Notes

- Keep page-specific CSS in `style.css` using page-scoped selectors (for example `.index-page ...`) rather than inline `<style>` blocks.
- When `style.css` changes, bump the cache-bust query in HTML links:
  - `style.css?v=...`
- Run `python build_site.py --check` after content edits to catch missing local files before deploy.
- Keep generated screenshots and local logs out of git (covered by `.gitignore`).
