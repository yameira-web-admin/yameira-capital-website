#!/usr/bin/env python3
"""Convert site-root image references to file://-safe relative paths."""

from __future__ import annotations

import os
import re
from pathlib import Path


ROOT_IMAGE_RE = re.compile(r"(?<![A-Za-z0-9._:/-])/images/")
SOURCE_EXTENSIONS = {".html", ".css", ".js"}


def main() -> int:
    root = Path(__file__).resolve().parent.parent
    changed_files = 0
    changed_references = 0

    for source in root.rglob("*"):
        if not source.is_file() or source.suffix.lower() not in SOURCE_EXTENSIONS:
            continue

        body = source.read_text(encoding="utf-8", errors="surrogateescape")
        relative_root = os.path.relpath(root, source.parent).replace("\\", "/")
        prefix = "" if relative_root == "." else relative_root + "/"
        replacement = prefix + "images/"
        revised, count = ROOT_IMAGE_RE.subn(replacement, body)
        if not count:
            continue

        source.write_text(revised, encoding="utf-8", errors="surrogateescape")
        changed_files += 1
        changed_references += count

    print(f"Changed {changed_references} image references in {changed_files} files.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
