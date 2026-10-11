# YMC Static Frontend

This directory is a deployable static reconstruction of the Interactive
Brokers website. The customized homepage and compact local pages live at the
project root. Navigation targets restored from the HTTrack source mirror keep
their original URL paths under `en/`, `cn/`, `es/`, `pt/`, `campus/`, and the
other mirror namespaces.

## Run locally

Serve the directory over HTTP so absolute and relative browser behavior match a
production static host:

```powershell
python -m http.server 4173
```

Then open `http://127.0.0.1:4173/`. There is no build step or package install.

## Project structure

- `index.html`: preserved homepage markup and page-specific upstream styles.
- Root `*.html`: compact locally maintained product and account entry pages.
- `en/`, `cn/`, `es/`, `pt/`: restored mirror pages required by site navigation.
- `campus/`, `docs/`, `lib/`: restored educational and documentation pages.
- `css/ibkr/`: upstream YMC layout and theme snapshot.
- `css/local-home.css`: small, documented offline and accessibility overrides.
- `css/components/financial-data-background.css`: scoped Canvas layer styling.
- `scripts/common/`: upstream UI dependencies used by navigation and modals.
- `scripts/local-home.js`: local cookie-consent and keyboard-focus behavior.
- `scripts/components/financial-data-background.js`: self-contained, responsive
  financial data background used only by the homepage Hero region.
- `images/dam/home/`: homepage artwork, including local responsive fallbacks.
- `tools/verify-local-links.ps1`: verifies every local HTML target linked from
  the homepage before deployment or cleanup.
- `tools/verify-local-images.ps1`: verifies local raster image references in
  all HTML and CSS files; pass `-IncludeSvg` to include SVG assets.
- `tools/harden-static-pages.ps1`: normalizes render-blocking CSS, script
  ordering, and first-paint behavior for maintained root pages.
- `tools/verify-site.ps1`: checks maintained root pages for missing assets,
  obsolete dynamic dependencies, and malformed script blocks.
- `tools/predeploy-check.ps1`: runs the release checks as one deploy gate.
- `tools/make-image-paths-file-safe.py`: converts site-root image references
  to relative paths so pages also work when opened directly with `file://`.

Keep new project-specific changes in `local-home.css` and `local-home.js` where
possible. This keeps the upstream snapshot comparable with the mirror and makes
future visual updates easier to review.

Do not bulk-delete nested HTML files. The mega-menu uses the original mirrored
paths directly. Run the link verifier before and after any cleanup:

```powershell
powershell -ExecutionPolicy Bypass -File tools/verify-local-links.ps1
powershell -ExecutionPolicy Bypass -File tools/verify-local-images.ps1
```

## Deployment

Deploy the contents of this directory as the document root of a static host or
CDN. Preserve the directory hierarchy and filename casing. No build step,
package manager, server-side runtime, or database is required. Run the gate
before every upload:

```powershell
powershell -ExecutionPolicy Bypass -File tools/predeploy-check.ps1
```

Do not use an account-less Cloudflare Quick Tunnel as the production origin.
It has no uptime guarantee and a stopped local server produces partial HTML
loads where CSS, JavaScript, or images fail independently. Use a static host
such as Cloudflare Pages/R2, or a named Cloudflare Tunnel with a supervised
origin service and health checks. Publish a complete directory atomically so
HTML and its assets always come from the same release.

The content security policy blocks analytics, fingerprinting, remote requests,
and embedded third-party content. External web links are intentionally disabled
across all static pages by `scripts/disable-external-links.js`; the accompanying
stylesheet also removes link affordances and share controls. Run
`tools/install-disable-external-links.ps1` and
`tools/convert-static-external-links.ps1` after adding new static pages.
