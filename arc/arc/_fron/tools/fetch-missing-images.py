#!/usr/bin/env python3
"""Fetch genuinely absent mirror images from their original public paths."""

from __future__ import annotations

import argparse
import concurrent.futures
import io
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

from PIL import Image


ORIGINS = (
    "https://www.interactivebrokers.com/",
    "https://interactivebrokers.com/",
    "https://www.ibkrcampus.com/",
    "https://ibkrcampus.com/",
)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--report", type=Path, default=Path("image-audit-unresolved.txt"))
    args = parser.parse_args()

    root = Path(__file__).resolve().parent.parent
    report = args.report if args.report.is_absolute() else root / args.report
    targets = [root / line.split("\t", 1)[0] for line in report.read_text(encoding="utf-8").splitlines() if line]
    def fetch(target: Path) -> tuple[str, str | None, bytes | None]:
        relative = target.relative_to(root).as_posix()
        paths = [relative]
        if relative.startswith("campus/"):
            paths.append(relative.removeprefix("campus/"))

        for origin in ORIGINS:
            for path in paths:
                url = origin + urllib.parse.quote(path, safe="/@:+")
                request = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 Arclight-static-repair/1.0"})
                try:
                    with urllib.request.urlopen(request, timeout=6) as response:
                        payload = response.read()
                    with Image.open(io.BytesIO(payload)) as image:
                        image.verify()
                    return relative, url, payload
                except (OSError, ValueError, urllib.error.URLError):
                    continue
        return relative, None, None

    fetched = 0
    remaining: list[str] = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=12) as executor:
        for relative, url, payload in executor.map(fetch, targets):
            if payload is None:
                remaining.append(relative)
                continue
            target = root / relative
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_bytes(payload)
            print(f"Fetched {relative} <- {url}")
            fetched += 1

    report.write_text("\n".join(remaining), encoding="utf-8")
    print(f"Fetched: {fetched}; still unavailable: {len(remaining)}")
    return 0 if not remaining else 1


if __name__ == "__main__":
    raise SystemExit(main())
