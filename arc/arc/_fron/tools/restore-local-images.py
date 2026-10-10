#!/usr/bin/env python3
"""Restore missing local raster assets from hashed mirror downloads.

Run without --apply for a dry run. The script only accepts high-confidence
matches: the same directory and logical filename, optionally without a
responsive breakpoint suffix. Raster format conversion is handled by Pillow.
"""

from __future__ import annotations

import argparse
import html
import re
import shutil
from collections import defaultdict
from pathlib import Path
from urllib.parse import unquote

from PIL import Image


RASTER_EXTENSIONS = {".png", ".jpg", ".jpeg", ".webp", ".gif", ".avif"}
SOURCE_EXTENSIONS = RASTER_EXTENSIONS | {".css", ".html"}
ATTRIBUTE_RE = re.compile(
    r"(?:src|srcset|poster|data-src|data-lazy-src)\s*=\s*['\"]([^'\"]+)['\"]",
    re.IGNORECASE,
)
CSS_URL_RE = re.compile(r"url\(\s*['\"]?([^\)'\"]+)", re.IGNORECASE)
HASH_RE = re.compile(r"[0-9a-f]{4}$", re.IGNORECASE)
BREAKPOINT_RE = re.compile(r"-(?:xl|lg|md|sm|xs)$", re.IGNORECASE)
IGNORED_PREFIXES = ("data:", "http:", "https:", "//", "#", "javascript:", "about:", "blob:")


def logical_stem(path: Path) -> str:
    return HASH_RE.sub("", path.stem).lower()


def family_stem(path: Path) -> str:
    return BREAKPOINT_RE.sub("", logical_stem(path))


def iter_references(source: Path) -> set[str]:
    body = source.read_text(encoding="utf-8", errors="ignore")
    values: list[str] = []
    for match in ATTRIBUTE_RE.finditer(body):
        values.extend(part.strip().split()[0] for part in match.group(1).split(",") if part.strip())
    values.extend(match.group(1).strip() for match in CSS_URL_RE.finditer(body))

    references = set()
    for value in values:
        value = html.unescape(value).strip()
        if not value or value.lower().startswith(IGNORED_PREFIXES):
            continue
        clean = unquote(re.split(r"[?#]", value, maxsplit=1)[0])
        if Path(clean).suffix.lower() in RASTER_EXTENSIONS:
            references.add(clean)
    return references


def resolve_target(root: Path, source: Path, reference: str) -> Path:
    if reference.startswith("/"):
        return (root / reference.lstrip("/")).resolve()
    return (source.parent / reference).resolve()


def choose_candidate(target: Path, directory_index: dict[Path, list[Path]]) -> tuple[Path | None, str]:
    target_stem = target.stem.lower()
    base_stem = BREAKPOINT_RE.sub("", target_stem)
    candidates = directory_index.get(target.parent, [])

    exact = [item for item in candidates if logical_stem(item) == target_stem]
    if exact:
        same_format = [item for item in exact if item.suffix.lower() == target.suffix.lower()]
        return (same_format or exact)[0], "exact"

    responsive_base = [item for item in candidates if logical_stem(item) == base_stem]
    if base_stem != target_stem and responsive_base:
        same_format = [item for item in responsive_base if item.suffix.lower() == target.suffix.lower()]
        return (same_format or responsive_base)[0], "responsive-base"

    responsive_sibling = [item for item in candidates if family_stem(item) == base_stem]
    if responsive_sibling:
        same_format = [item for item in responsive_sibling if item.suffix.lower() == target.suffix.lower()]
        return (same_format or responsive_sibling)[0], "responsive-sibling"

    ltr_stem = target_stem.replace("-rtl-", "-").removesuffix("-rtl")
    ltr_base = BREAKPOINT_RE.sub("", ltr_stem)
    ltr = [item for item in candidates if family_stem(item) == ltr_base]
    if ltr_stem != target_stem and ltr:
        same_format = [item for item in ltr if item.suffix.lower() == target.suffix.lower()]
        return (same_format or ltr)[0], "rtl-mirror"

    return None, ""


def materialize(source: Path, target: Path, mirror: bool = False) -> None:
    target.parent.mkdir(parents=True, exist_ok=True)
    if source.suffix.lower() == target.suffix.lower() and not mirror:
        shutil.copy2(source, target)
        return

    with Image.open(source) as image:
        if mirror:
            image = image.transpose(Image.Transpose.FLIP_LEFT_RIGHT)
        if target.suffix.lower() in {".jpg", ".jpeg"} and image.mode not in {"RGB", "L"}:
            background = Image.new("RGB", image.size, "white")
            if "A" in image.getbands():
                background.paste(image, mask=image.getchannel("A"))
            else:
                background.paste(image)
            image = background
        save_options = {"quality": 86, "method": 2} if target.suffix.lower() == ".webp" else {}
        image.save(target, **save_options)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true", help="write restored assets")
    parser.add_argument("--report", type=Path, help="write unresolved references")
    args = parser.parse_args()

    root = Path(__file__).resolve().parent.parent
    sources = [path for path in root.rglob("*") if path.is_file() and path.suffix.lower() in {".html", ".css"}]
    missing: dict[Path, set[Path]] = defaultdict(set)
    for source in sources:
        for reference in iter_references(source):
            try:
                target = resolve_target(root, source, reference)
            except OSError:
                continue
            if root not in target.parents or target.exists():
                continue
            missing[target].add(source)

    directory_index: dict[Path, list[Path]] = defaultdict(list)
    for path in root.rglob("*"):
        if path.is_file() and path.suffix.lower() in RASTER_EXTENSIONS:
            directory_index[path.parent].append(path)

    restored: list[tuple[Path, Path, str]] = []
    unresolved: list[Path] = []
    for target in sorted(missing):
        candidate, reason = choose_candidate(target, directory_index)
        if candidate is None:
            unresolved.append(target)
            continue
        restored.append((target, candidate, reason))
        if args.apply:
            materialize(candidate, target, mirror=reason == "rtl-mirror")

    action = "Restored" if args.apply else "Restorable"
    print(f"Scanned {len(sources)} HTML/CSS files; {len(missing)} missing raster targets.")
    print(f"{action}: {len(restored)}; unresolved: {len(unresolved)}")
    for target, candidate, reason in restored:
        print(f"[{reason}] {target.relative_to(root)} <- {candidate.relative_to(root)}")

    report = args.report or root / "image-audit-unresolved.txt"
    report.write_text(
        "\n".join(
            f"{target.relative_to(root)}\tused by: "
            + "; ".join(str(path.relative_to(root)) for path in sorted(missing[target]))
            for target in unresolved
        ),
        encoding="utf-8",
    )
    print(f"Unresolved report: {report}")
    return 0 if not unresolved else 1


if __name__ == "__main__":
    raise SystemExit(main())
