# Website attribution and regulatory audit — 2026-10-11

Branch: audit/correct-company-attribution-20261011
Status: Incomplete; not approved for deployment.

## Verified source-code observations
- arc/arc/_fron/index.html: around lines 3393–3418 contains foreign regulator and membership assertions, including CIRO, FCA 208159, CBI C423427, AFSL 453554, Hong Kong SFC, Japan registration No.187, and Singapore CMS100917.
- arc/arc/_fron/about.html: around lines 2768–2793 repeats these assertions.
- arc/arc/_fron/compliance.html: around lines 3572–3604 additionally claims NYSE–FINRA–SIPC membership and US SEC/CFTC oversight.
- All three files include a request to https://interactivebrokers.com/webrest/relpages/pages-list-by-id; investigate dependency and data transfer before any change.
- All three files contain HTTrack provenance comments referencing interactivebrokers.com. Preserve provenance for audit; do not treat deletion as proof of independent ownership.
- Earlier branch commits corrected compliance JSON-LD organization logo/social links and removed an unsupported trademark ownership assertion.

## Blocking verification
Before attributing any regulatory membership, license, company affiliation, founder identity, award, performance metric, or trading product to Yameira Capital, obtain documentary evidence establishing the exact legal entity and relevant jurisdiction. Do not transfer another company's registration numbers or product claims by renaming.

## Pending technical work
- Locate the deployed source file for /en/accounts/legalDocuments/brokerPerformanceReports and verify Thomas Peterffy attribution; that route was not found at the guessed repository path.
- Crawl deployed links and check actual deployment target against repository main.
- Verify that removal/replacement of remote IBKR requests does not break site functionality.
- Review all related pages and ensure truthful attribution before merging.

No merge or deployment authorized by this audit.
