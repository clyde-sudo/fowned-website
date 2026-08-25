# Fowned demo deployment

## What this is

A browser-verifiable demonstration of the whole intended Fowned experience, from
a cold visitor arriving to an agency operator working the resulting lead and a
client reading their monitoring. It is a **demo**. It is not the product running
on live customer data, and every surface says which it is.

## Indexing decision (deliberate: NOINDEX)

This build is **not indexable**, enforced in three places:

| Layer | Mechanism |
|---|---|
| Response header | `X-Robots-Tag: noindex, nofollow` on every path, via `_headers` |
| HTML | `<meta name="robots" content="noindex, nofollow">` on every page |
| Crawl | `robots.txt` sends `Disallow: /` |

**Why.** Search equity should accumulate on the owned production domain, never on
a temporary `*.pages.dev` hostname. Anything indexed here would have to be
migrated or killed later, and a redirect from a hostname we do not own is not a
migration. There is a second reason that is not about SEO at all: the demo
workspace is populated with invented companies. A fictional prospect list that
gets indexed becomes a fictional prospect list that gets *found*.

A sitemap is still generated and still served. It is there so the crawl surface
can be inspected and so the eventual production launch inherits a correct file,
not to invite crawling that `robots.txt` is simultaneously refusing.

**When this reverses.** On the move to the owned production domain: drop the
`X-Robots-Tag` line from `_headers`, drop the meta tag from `layout.mjs`, change
`robots.txt` to `Allow: /`, and re-point `SITE.origin` so canonicals and the
sitemap follow. The demo routes under `/demo/` should stay excluded at that
point, because they are still fiction.

## The audit is a labelled fixture, not a live scan

`js/audit.js` runs the real eight-state machine against a deterministic fixture
and shows a `DEMO AUDIT RESULT` badge on every result.

It is not wired to a live scan, on purpose. The tenant-scoped endpoint
(`/api/agency/fowned/scan`) is written and committed on the Citability side but
is **not deployed**. The one scan endpoint that is live in production writes rows
to the prospect table and fires an external notification, so pointing a public
demo at it would create real records for whatever domain a stranger types. The
fixture is derived from the entered domain by hash, so the same domain always
returns the same audit and a walkthrough repeats exactly.

**When this reverses.** When the tenant-scoped endpoint deploys, replace the
`setTimeout` fixture lookup in `runScan` with the `fetch` it stands in for. The
states, the labels, and the partial-measurement rule are already correct.

## Build

`node build.mjs` writes `dist/` by **allowlist**, not by exclusion. Cloudflare
Pages direct upload publishes whatever directory it is handed and offers no
ignore mechanism, so an exclusion-based build is one forgotten rule away from
publishing internal docs. The build additionally:

- writes a real `404.html`, without which Pages serves `index.html` at HTTP 200
  for every unmatched path, making internal files *appear* published
- copies only images that a page actually references (this alone dropped the
  payload from roughly 2.8 MB to 638 KB)
- **fails the build** if any internal `href` does not resolve to a generated
  route, so a dead link cannot ship

## Deploy

    node build.mjs && npx wrangler pages deploy dist --project-name=fowned

No secrets are involved: there are no Functions, no environment variables and no
bindings. If that ever changes, the secret goes in Wrangler secret storage and
never in the repo, the bundle, the HTML, this file or the logs.

## Data honesty rules that must survive any edit

1. Anything invented carries a visible `DEMO DATA` or `DEMO AUDIT RESULT` label.
2. A never-measured metric renders as `NEVER`, never as `0`. Zero is a
   measurement. Nothing is not.
3. An unmeasured check leaves the denominator rather than counting as a failure,
   otherwise a broken instrument looks identical to a broken website.
4. A missing referrer is `DIRECT_OR_UNKNOWN`, never "direct". AI surfaces strip
   `Referer`, and collapsing the two would invent attribution.
5. No opportunity chain claims causality. Each one carries an explicit note
   naming what it does not claim.
