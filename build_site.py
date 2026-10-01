"""Validate and package the site using only Python's standard library."""
import argparse
from html.parser import HTMLParser
from pathlib import Path
import re
import shutil
import tempfile
from urllib.parse import unquote, urlsplit
from zipfile import ZipFile, ZIP_DEFLATED

ROOT = Path(__file__).resolve().parent
ASSET_TYPES = {'.css', '.js', '.png', '.jpg', '.jpeg', '.webp', '.avif', '.gif',
               '.svg', '.ico', '.mp4', '.webm', '.woff', '.woff2', '.ttf', '.eot', '.otf'}


class References(HTMLParser):
    def __init__(self):
        super().__init__()
        self.urls = []

    def handle_starttag(self, tag, attrs):
        for key, value in attrs:
            if value and key in {'src', 'href', 'poster', 'data-src'}:
                self.urls.append(value)
            elif value and key == 'srcset':
                self.urls.extend(part.strip().split()[0] for part in value.split(',') if part.strip())


def site_files(target):
    files = list(ROOT.glob('*.html'))
    files += [ROOT / name for name in ('style.css', 'saresa-page.css', 'favicon.ico', 'robots.txt', 'sitemap.xml')]
    files += [p for p in (ROOT / 'assets').rglob('*') if p.is_file()
              and p.suffix.lower() in ASSET_TYPES and not any(part.startswith('.') for part in p.relative_to(ROOT).parts)]
    if target == 'apache':
        files += [ROOT / 'CNAME', ROOT / '.htaccess', ROOT / 'api/instagram-reels.php']
    return sorted(files)


def validate(files):
    errors = []
    for page in files:
        if not page.is_file():
            errors.append(f'Missing deployment file: {page.relative_to(ROOT)}')
            continue
        if page.suffix not in {'.html', '.css'}:
            continue
        content = page.read_text(encoding='utf-8-sig')
        refs = References()
        if page.suffix == '.html':
            refs.feed(content)
        urls = refs.urls + re.findall(r'''url\(\s*["']?([^\s)'";]+)''', content)
        for url in urls:
            parsed = urlsplit(url)
            if parsed.scheme or parsed.netloc or not parsed.path:
                continue
            path = unquote(parsed.path)
            local = ((ROOT / path.lstrip('/')) if path.startswith('/') else page.parent / path).resolve()
            if not local.is_relative_to(ROOT):
                errors.append(f'{page.name}: path outside site: {url}')
                continue
            if local.is_dir():
                local = local / 'index.html'
            if not local.exists() and not local.suffix:
                local = local.with_suffix('.html')
            if local not in files:
                errors.append(f'{page.relative_to(ROOT)}: missing packaged asset/page: {url}')
    if errors:
        raise SystemExit('\n'.join(sorted(set(errors))))
    print(f'PASS: checked local references in {sum(p.suffix == ".html" for p in files)} pages and packaged CSS.')


def rewrite_pages_root_links(content):
    page_names = {page.stem for page in ROOT.glob('*.html')}
    pattern = re.compile(r'''(?P<prefix>\b(?:href|src|poster|data-src)\s*=\s*)(?P<quote>["'])/(?P<path>[^"']*)(?P=quote)''', re.IGNORECASE)

    def rewrite(match):
        path = match.group('path')
        if not path:
            path = 'index.html'
        else:
            route, suffix = re.match(r'^([^?#]*)(.*)$', path).groups()
            if route and '/' not in route and '.' not in route and route in page_names:
                route += '.html'
            path = route + suffix
        return f"{match.group('prefix')}{match.group('quote')}/website/{path}{match.group('quote')}"

    return pattern.sub(rewrite, content)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true', help='Validate without producing output')
    parser.add_argument('--target', choices=['apache', 'pages'], default='apache')
    args = parser.parse_args()
    files = site_files(args.target)
    validate(files)
    if args.check:
        return
    output = ROOT / 'dist'
    if output.is_symlink() or (output.exists() and output.resolve() != ROOT / 'dist'):
        raise SystemExit('Refusing to replace a redirected dist directory.')
    # Only replace the generated output directory within this workspace.
    with tempfile.TemporaryDirectory(prefix='sindh-build-') as temporary:
        staging = Path(temporary) / 'site'
        for source in files:
            destination = staging / source.relative_to(ROOT)
            destination.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(source, destination)
        for page in staging.glob('*.html'):
            content = page.read_text(encoding='utf-8-sig')
            if args.target == 'pages':
                content = rewrite_pages_root_links(content)
            if 'assets/cookie-consent.css' not in content:
                content = content.replace('</head>', '  <link rel="stylesheet" href="assets/cookie-consent.css?v=1" />\n</head>', 1)
            if 'assets/cookie-consent.js' not in content:
                content = content.replace('</body>', '    <script defer src="assets/cookie-consent.js?v=1"></script>\n  </body>', 1)
            page.write_text(content, encoding='utf-8')
        if args.target == 'pages':
            (staging / '.nojekyll').touch()
        if output.exists():
            shutil.rmtree(output)
        shutil.copytree(staging, output)
    archive = ROOT / 'tmp' / f'sindh-emporio-{args.target}-deploy.zip'
    archive.parent.mkdir(exist_ok=True)
    with ZipFile(archive, 'w', ZIP_DEFLATED) as bundle:
        for path in sorted(output.rglob('*')):
            if path.is_file():
                bundle.write(path, path.relative_to(output).as_posix())
    print(f'Built {len(files)} files in {output}')
    print(f'Upload package: {archive} ({archive.stat().st_size / 1024 / 1024:.1f} MiB)')


if __name__ == '__main__':
    main()
