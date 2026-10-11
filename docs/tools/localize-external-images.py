#!/usr/bin/env python3
"""Localize image URLs that HTTrack rewrote outside the deployable root."""

from __future__ import annotations

import concurrent.futures
import re
import urllib.request
from pathlib import Path


REFERENCE_RE = re.compile(
    r"(?:\.\./)+(img\.youtube\.com|image\.mux\.com|ibkrguides\.com)/([^\"')\s]+\.(?:jpg|jpeg|png|gif|webp))",
    re.IGNORECASE,
)


def main() -> int:
    root = Path(__file__).resolve().parent.parent
    html_files = list(root.rglob("*.html"))
    references: set[tuple[str, str]] = set()
    bodies: dict[Path, str] = {}

    for path in html_files:
        body = path.read_text(encoding="utf-8", errors="ignore")
        bodies[path] = body
        references.update((match.group(1), match.group(2)) for match in REFERENCE_RE.finditer(body))

    def fetch(item: tuple[str, str]) -> tuple[tuple[str, str], bytes]:
        host, remote_path = item
        path = Path(remote_path)
        remote_paths = [remote_path]
        if re.search(r"[0-9a-f]{4}$", path.stem, re.IGNORECASE):
            remote_paths.insert(0, str(path.with_name(path.stem[:-4] + path.suffix)).replace("\\", "/"))
        for candidate in remote_paths:
            url = f"https://{host}/{candidate}"
            request = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 Arclight-static-repair/1.0"})
            try:
                with urllib.request.urlopen(request, timeout=12) as response:
                    return item, response.read()
            except OSError:
                continue
        raise OSError(f"Unable to fetch {host}/{remote_path}")

    failures: set[tuple[str, str]] = set()
    with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
        futures = {executor.submit(fetch, item): item for item in references}
        for future in concurrent.futures.as_completed(futures):
            item = futures[future]
            try:
                (_, remote_path), payload = future.result()
                target = root / "images" / "external" / item[0] / remote_path
                target.parent.mkdir(parents=True, exist_ok=True)
                target.write_bytes(payload)
                print(f"Localized {item[0]}/{remote_path}")
            except OSError:
                failures.add(item)

    replacements = {
        item: f"/images/external/{item[0]}/{item[1]}"
        for item in references - failures
    }
    changed = 0
    for path, body in bodies.items():
        revised = REFERENCE_RE.sub(
            lambda match: replacements.get((match.group(1), match.group(2)), match.group(0)),
            body,
        )
        if revised != body:
            path.write_text(revised, encoding="utf-8")
            changed += 1

    print(f"Localized: {len(replacements)}; changed HTML files: {changed}; failed: {len(failures)}")
    return 0 if not failures else 1


if __name__ == "__main__":
    raise SystemExit(main())
