from __future__ import annotations

import argparse
import posixpath
import re
import shutil
from collections import Counter, deque
from dataclasses import dataclass
from datetime import datetime, timezone
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit, urlunsplit

from PIL import Image, ImageOps, UnidentifiedImageError

ROOT = Path(__file__).resolve().parent
DIST = ROOT / "dist"
BASE_URL = "https://sindhemporio.com"
TOP_LEVEL_EXTRAS = ("favicon.ico", "CNAME")
TEXT_EXTENSIONS = {".html", ".css"}
RASTER_EXTENSIONS = {".png", ".jpg", ".jpeg", ".webp"}
MIN_RASTER_BYTES = 700 * 1024
MAX_RASTER_LONG_EDGE = 2800
WEBP_QUALITY = 82
SOCIAL_IMAGE_MARKERS = {"og:image", "twitter:image"}


@dataclass(frozen=True)
class LocalRef:
    source: Path
    raw: str
    target: Path
    fragment: str


@dataclass(frozen=True)
class AssetPlan:
    source: Path
    build_source: Path
    output: Path
    transform: str


@dataclass
class SiteScan:
    text_files: set[Path]
    asset_files: set[Path]
    refs_by_file: dict[Path, list[LocalRef]]
    missing: list[str]
    bad_anchors: list[str]
    external_refs: int

    @property
    def has_errors(self) -> bool:
        return bool(self.missing or self.bad_anchors)


class HtmlReferenceParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.refs: list[str] = []
        self.ids: set[str] = set()

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        attributes = dict(attrs)
        element_id = attributes.get("id")
        if element_id:
            self.ids.add(element_id)

        for attribute in ("src", "href", "poster"):
            value = attributes.get(attribute)
            if value:
                self.refs.append(value)

        srcset = attributes.get("srcset")
        if srcset:
            for candidate in srcset.split(","):
                value = candidate.strip().split()[0]
                if value:
                    self.refs.append(value)

        if tag == "meta":
            marker = (attributes.get("property") or attributes.get("name") or "").lower()
            if marker in SOCIAL_IMAGE_MARKERS:
                value = attributes.get("content")
                if value:
                    self.refs.append(value)


def iter_site_html() -> list[Path]:
    return sorted(path.relative_to(ROOT) for path in ROOT.glob("*.html"))


def read_text(path: Path) -> str:
    return (ROOT / path).read_text(encoding="utf-8")


def extract_html_refs(path: Path) -> tuple[list[str], set[str]]:
    parser = HtmlReferenceParser()
    parser.feed(read_text(path))
    return parser.refs, parser.ids


def extract_css_refs(path: Path) -> list[str]:
    refs: list[str] = []
    content = read_text(path)
    for match in re.finditer(r"url\(([^)]+)\)", content):
        value = match.group(1).strip().strip("\"'")
        if value:
            refs.append(value)
    return refs


def normalize_local_ref(source: Path, raw: str) -> tuple[LocalRef | None, str | None, bool]:
    value = raw.strip()
    if not value or value.startswith(("data:", "mailto:", "tel:", "javascript:", "#")):
        return None, None, False

    parsed = urlsplit(value)
    if parsed.scheme in {"http", "https"}:
        return None, None, True

    path_text = unquote(parsed.path)
    if not path_text:
        return None, None, False

    if path_text.startswith("/"):
        return None, f"{source.as_posix()}: root-relative reference is not supported in static export: {raw}", False

    candidate = (ROOT / source.parent / Path(path_text)).resolve()
    try:
        target = candidate.relative_to(ROOT)
    except ValueError:
        return None, f"{source.as_posix()}: reference escapes project root: {raw}", False

    return LocalRef(source=source, raw=raw, target=target, fragment=parsed.fragment), None, False


def scan_site() -> SiteScan:
    html_files = iter_site_html()
    queue = deque(html_files)
    text_files = set(html_files)
    asset_files: set[Path] = set()
    refs_by_file: dict[Path, list[LocalRef]] = {}
    anchor_ids: dict[Path, set[str]] = {}
    missing: list[str] = []
    bad_anchors: list[str] = []
    external_refs = 0
    seen: set[Path] = set()

    while queue:
        source = queue.popleft()
        if source in seen:
            continue
        seen.add(source)

        source_path = ROOT / source
        if not source_path.exists():
            missing.append(f"{source.as_posix()}: file is missing")
            continue

        if source.suffix.lower() == ".html":
            raw_refs, ids = extract_html_refs(source)
            anchor_ids[source] = ids
        else:
            raw_refs = extract_css_refs(source)

        refs: list[LocalRef] = []
        for raw in raw_refs:
            ref, error, is_external = normalize_local_ref(source, raw)
            if is_external:
                external_refs += 1
                continue
            if error:
                missing.append(error)
                continue
            if ref is None:
                continue

            refs.append(ref)
            target_path = ROOT / ref.target
            if not target_path.exists():
                missing.append(f"{source.as_posix()}: missing file for reference {raw}")
                continue

            if ref.target.suffix.lower() in TEXT_EXTENSIONS:
                text_files.add(ref.target)
                queue.append(ref.target)
            else:
                asset_files.add(ref.target)

        refs_by_file[source] = refs

    for name in TOP_LEVEL_EXTRAS:
        extra = Path(name)
        if (ROOT / extra).exists():
            asset_files.add(extra)

    for refs in refs_by_file.values():
        for ref in refs:
            if not ref.fragment or ref.target.suffix.lower() != ".html":
                continue
            if ref.target not in anchor_ids and (ROOT / ref.target).exists():
                _, ids = extract_html_refs(ref.target)
                anchor_ids[ref.target] = ids
            if ref.fragment not in anchor_ids.get(ref.target, set()):
                bad_anchors.append(
                    f"{ref.source.as_posix()}: missing anchor #{ref.fragment} in {ref.target.as_posix()}"
                )

    return SiteScan(
        text_files=text_files,
        asset_files=asset_files,
        refs_by_file=refs_by_file,
        missing=sorted(set(missing)),
        bad_anchors=sorted(set(bad_anchors)),
        external_refs=external_refs,
    )


def build_asset_plan(path: Path) -> AssetPlan:
    source_path = ROOT / path
    suffix = path.suffix.lower()
    if suffix not in RASTER_EXTENSIONS or source_path.stat().st_size < MIN_RASTER_BYTES:
        return AssetPlan(source=path, build_source=path, output=path, transform="copy")

    sibling_webp = path.with_suffix(".webp")
    sibling_webp_path = ROOT / sibling_webp
    if suffix != ".webp" and sibling_webp_path.exists():
        if sibling_webp_path.stat().st_size < source_path.stat().st_size:
            return AssetPlan(
                source=path,
                build_source=sibling_webp,
                output=sibling_webp,
                transform="reuse-webp",
            )

    output = path.with_suffix(".webp")
    transform = "reencode-webp" if suffix == ".webp" else "convert-webp"
    return AssetPlan(source=path, build_source=path, output=output, transform=transform)


def relative_url(source: Path, target: Path) -> str:
    return posixpath.relpath(target.as_posix(), source.parent.as_posix())


def remap_ref(ref: LocalRef, plans: dict[Path, AssetPlan]) -> str:
    plan = plans.get(ref.target)
    if plan is None or plan.output == ref.target:
        return ref.raw
    new_path = relative_url(ref.source, plan.output)
    return urlunsplit(("", "", new_path, "", ref.fragment))


def rewrite_text_file(path: Path, refs: list[LocalRef], plans: dict[Path, AssetPlan]) -> str:
    content = read_text(path)
    replacements: dict[str, str] = {}
    for ref in refs:
        updated = remap_ref(ref, plans)
        if updated != ref.raw:
            replacements[ref.raw] = updated

    for raw, updated in sorted(replacements.items(), key=lambda item: len(item[0]), reverse=True):
        content = content.replace(raw, updated)
    return content


def has_real_alpha(image: Image.Image) -> bool:
    if "A" in image.getbands():
        extrema = image.getchannel("A").getextrema()
        return extrema != (255, 255)
    return "transparency" in image.info


def optimize_raster(source: Path, destination: Path) -> None:
    with Image.open(source) as image:
        if getattr(image, "n_frames", 1) > 1:
            image.seek(0)
        image = ImageOps.exif_transpose(image)

        if image.mode == "P":
            image = image.convert("RGBA")

        alpha = has_real_alpha(image)
        if alpha and image.mode not in {"RGBA", "LA"}:
            image = image.convert("RGBA")
        elif not alpha and image.mode != "RGB":
            image = image.convert("RGB")

        if max(image.size) > MAX_RASTER_LONG_EDGE:
            image.thumbnail((MAX_RASTER_LONG_EDGE, MAX_RASTER_LONG_EDGE), Image.Resampling.LANCZOS)

        destination.parent.mkdir(parents=True, exist_ok=True)
        image.save(destination, format="WEBP", quality=WEBP_QUALITY, method=6)


def copy_asset(plan: AssetPlan, dist_root: Path) -> None:
    source = ROOT / plan.build_source
    destination = dist_root / plan.output
    destination.parent.mkdir(parents=True, exist_ok=True)

    if plan.transform in {"convert-webp", "reencode-webp"}:
        try:
            optimize_raster(source, destination)
            return
        except UnidentifiedImageError:
            pass

    shutil.copy2(source, destination)


def ensure_parent(path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)


def write_text_output(dist_root: Path, path: Path, content: str) -> None:
    destination = dist_root / path
    ensure_parent(destination)
    destination.write_text(content, encoding="utf-8")


def write_support_files(dist_root: Path, html_files: list[Path]) -> None:
    robots = "User-agent: *\nAllow: /\n\nSitemap: https://sindhemporio.com/sitemap.xml\n"
    (dist_root / "robots.txt").write_text(robots, encoding="utf-8")

    lines = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    for html_file in html_files:
        source_path = ROOT / html_file
        lastmod = datetime.fromtimestamp(source_path.stat().st_mtime, tz=timezone.utc).date().isoformat()
        loc = BASE_URL + ("/" if html_file.name == "index.html" else f"/{html_file.as_posix()}")
        priority = "1.0" if html_file.name == "index.html" else "0.8"
        lines.extend(
            [
                "  <url>",
                f"    <loc>{loc}</loc>",
                f"    <lastmod>{lastmod}</lastmod>",
                f"    <priority>{priority}</priority>",
                "  </url>",
            ]
        )
    lines.append("</urlset>")
    (dist_root / "sitemap.xml").write_text("\n".join(lines) + "\n", encoding="utf-8")
    (dist_root / ".nojekyll").write_text("", encoding="utf-8")


def total_size(paths: set[Path]) -> int:
    return sum((ROOT / path).stat().st_size for path in paths if (ROOT / path).exists())


def dist_size(dist_root: Path) -> int:
    return sum(path.stat().st_size for path in dist_root.rglob("*") if path.is_file())


def print_validation_report(scan: SiteScan) -> None:
    print(
        f"Validated {len(scan.text_files)} text files, "
        f"{len(scan.asset_files)} asset files, and {scan.external_refs} external references."
    )
    if scan.missing:
        print("Missing local references:")
        for issue in scan.missing:
            print(f"  - {issue}")
    if scan.bad_anchors:
        print("Broken in-page references:")
        for issue in scan.bad_anchors:
            print(f"  - {issue}")
    if not scan.has_errors:
        print("No missing local files or broken internal anchors found.")


def build(dist_root: Path) -> int:
    scan = scan_site()
    print_validation_report(scan)
    if scan.has_errors:
        return 1

    if dist_root.exists():
        shutil.rmtree(dist_root)
    dist_root.mkdir(parents=True, exist_ok=True)

    html_files = sorted(path for path in scan.text_files if path.suffix.lower() == ".html")
    text_files = sorted(scan.text_files)
    plans = {path: build_asset_plan(path) for path in sorted(scan.asset_files)}

    for text_file in text_files:
        content = rewrite_text_file(text_file, scan.refs_by_file.get(text_file, []), plans)
        write_text_output(dist_root, text_file, content)

    copied_outputs: set[Path] = set()
    for asset_file in sorted(scan.asset_files):
        plan = plans[asset_file]
        if plan.output in copied_outputs:
            continue
        copy_asset(plan, dist_root)
        copied_outputs.add(plan.output)

    write_support_files(dist_root, html_files)

    plan_summary = Counter(plan.transform for plan in plans.values())
    source_bytes = total_size(scan.text_files | scan.asset_files)
    dist_bytes = dist_size(dist_root)

    print(f"Built {dist_root.relative_to(ROOT).as_posix()} successfully.")
    print(
        f"Publishable site size: {source_bytes / (1024 * 1024):.1f} MB -> "
        f"{dist_bytes / (1024 * 1024):.1f} MB"
    )
    print(
        "Asset transforms: "
        + ", ".join(f"{name}={count}" for name, count in sorted(plan_summary.items()))
    )
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(description="Validate and build the Sindh Emporio static site.")
    parser.add_argument("--check", action="store_true", help="Validate references without building dist/")
    parser.add_argument("--dist", type=Path, default=DIST, help="Output directory for the built site.")
    args = parser.parse_args()

    dist_root = args.dist if args.dist.is_absolute() else ROOT / args.dist
    if args.check:
        scan = scan_site()
        print_validation_report(scan)
        return 1 if scan.has_errors else 0
    return build(dist_root)


if __name__ == "__main__":
    raise SystemExit(main())
