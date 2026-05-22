#!/usr/bin/env python3
"""Copy WordPress upload originals (non-thumbnail) into repo media/ by type."""

from __future__ import annotations

import argparse
import json
import re
import shutil
from collections import Counter
from pathlib import Path

DEFAULT_SOURCE = Path(
    "/Users/user/Local Sites/hope-sews-legacy-staging-2/app/public/wp-content/uploads"
)
DEFAULT_DEST = Path(__file__).resolve().parents[1] / "media"

YEAR_DIRS = {str(year) for year in range(2000, 2100)}
SIZE_RE = re.compile(r"-\d+x\d+$", re.I)
SCALED_RE = re.compile(r"-scaled$", re.I)
SKIP_PREFIXES = ("woocommerce-placeholder",)

MEDIA_EXT: dict[str, set[str]] = {
    "img": {".jpg", ".jpeg", ".png", ".gif", ".svg", ".webp", ".avif", ".heic"},
    "video": {".mp4", ".mov", ".webm", ".m4v", ".avi", ".mkv"},
    "audio": {".mp3", ".wav", ".ogg", ".m4a"},
    "document": {".pdf", ".doc", ".docx"},
    "font": {".ttf", ".otf", ".woff", ".woff2", ".eot"},
}


def category(ext: str) -> str | None:
    lowered = ext.lower()
    for cat, extensions in MEDIA_EXT.items():
        if lowered in extensions:
            return cat
    return None


def is_thumbnail_basename(stem: str) -> bool:
    return bool(SIZE_RE.search(stem) or SCALED_RE.search(stem))


def is_original_file(path: Path, names_in_dir: set[str]) -> bool:
    name = path.name
    if any(name.startswith(prefix) for prefix in SKIP_PREFIXES):
        return False
    if name.endswith(".webp"):
        without_webp = name[:-5]
        if without_webp in names_in_dir:
            return False
        if is_thumbnail_basename(Path(without_webp).stem):
            return False
        return True
    if is_thumbnail_basename(path.stem) or ".bk." in name:
        return False
    return True


def in_media_library(relative: Path) -> bool:
    return len(relative.parts) >= 1 and relative.parts[0] in YEAR_DIRS


def unique_dest_name(dest_dir: Path, source: Path, relative: Path) -> str:
    candidate = source.name
    if not (dest_dir / candidate).exists():
        return candidate
    prefix = "-".join(relative.parts[:2]) if len(relative.parts) >= 2 else relative.parts[0]
    stem = source.stem
    suffix = "".join(source.suffixes) or source.suffix
    return f"{prefix}-{stem}{suffix}"


def collect_originals(source: Path) -> list[tuple[str, Path, Path]]:
    items: list[tuple[str, Path, Path]] = []
    for root, _, files in source.walk():
        relative_dir = root.relative_to(source)
        if not in_media_library(relative_dir):
            continue
        names = set(files)
        for filename in files:
            path = root / filename
            if not path.is_file():
                continue
            cat = category(path.suffix)
            if not cat or not is_original_file(path, names):
                continue
            items.append((cat, path, relative_dir / filename))
    return items


def extract(source: Path, dest: Path, dry_run: bool = False) -> dict:
    items = collect_originals(source)
    counts: Counter[str] = Counter()
    manifest: list[dict[str, str]] = []

    for cat, source_path, relative in items:
        out_dir = dest / cat
        if not dry_run:
            out_dir.mkdir(parents=True, exist_ok=True)
        out_name = unique_dest_name(out_dir, source_path, relative)
        out_path = out_dir / out_name
        if not dry_run:
            shutil.copy2(source_path, out_path)
        counts[cat] += 1
        manifest.append(
            {
                "category": cat,
                "source": str(source_path),
                "dest": str(out_path),
            }
        )

    if not dry_run:
        dest.mkdir(parents=True, exist_ok=True)
        (dest / "manifest.json").write_text(json.dumps(manifest, indent=2) + "\n")

    return {"total": len(items), "by_category": dict(counts)}


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source", type=Path, default=DEFAULT_SOURCE)
    parser.add_argument("--dest", type=Path, default=DEFAULT_DEST)
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    if not args.source.is_dir():
        raise SystemExit(f"Source not found: {args.source}")

    summary = extract(args.source, args.dest, dry_run=args.dry_run)
    print(json.dumps(summary, indent=2))


if __name__ == "__main__":
    main()
