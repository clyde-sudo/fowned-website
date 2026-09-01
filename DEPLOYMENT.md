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

---

## Launching on fowned.live

Everything below the two operator steps is already built. Nothing here needs
code changes.

### Step 1 (operator) — put the zone in Cloudflare

The current API token has `zone (read)` only, so zone creation returns
`Requires permission "com.cloudflare.api.account.zone.create"`. Add the zone
from the dashboard: **Add a site → fowned.live → Free plan**.

Apex domains on Pages need the zone inside Cloudflare. Squarespace DNS has no
ALIAS/ANAME at the apex and Pages publishes no stable IPs, so a CNAME at the
root only works with Cloudflare's CNAME flattening. Adding the zone changes
nothing live until the nameservers move, so it is a safe, reversible step.

### Step 2 (operator) — move the nameservers at Squarespace

Point fowned.live at the two Cloudflare nameservers the dashboard gives you.

Checked before writing this: fowned.live has **no MX records** and its SPF is
`v=spf1 -all`. No email depends on this domain, so the nameserver change
cannot break mail.

### Step 3 — attach and rebuild

    npx wrangler pages domain add fowned.live --project-name=fowned
    npx wrangler pages domain add www.fowned.live --project-name=fowned
    SITE_ORIGIN=https://fowned.live node build.mjs
    npx wrangler pages deploy dist --project-name=fowned

`SITE_ORIGIN` is what puts the real host into canonical tags, `og:url`, the
sitemap and the JSON-LD. It stays pointed at pages.dev until DNS resolves,
because a canonical naming a host that does not answer is wrong, not "ready".

### Step 4 — verify by probe, not by assumption

    curl -sI https://fowned.live/            # expect NO x-robots-tag header
    curl -s  https://fowned.live/robots.txt  # expect Allow: / and the sitemap line
    curl -sI https://www.fowned.live/        # expect 301 to the apex
    curl -sI https://fowned.pages.dev/       # expect x-robots-tag: noindex, nofollow

All four already pass against a local `wrangler pages dev` run with the Host
header set, and the pages.dev pair passes in production. Only the two
fowned.live rows are unproven, because the host does not resolve yet.

### Booking

    BOOKING_URL=https://cal.com/<the-real-one> SITE_ORIGIN=https://fowned.live node build.mjs

One variable. Set it and every booking CTA on the site points at the calendar,
the contact page grows a "Book a call" card, and the audit result offers it.
Leave it unset and every one of those falls back to /contact/, which submits
for real. No calendar URL is guessed anywhere in the codebase.

### Reading the telemetry

    npx wrangler pages deployment tail --project-name=fowned

`FOWNED_EVENT` lines are anonymous traffic. `FOWNED_LEAD` lines are people who
asked to be contacted. **A log is a fragile place for a lead.** Choosing the
durable sink (KV, an email forward, or the Citability pipeline once the agency
backend opens) is the last decision in this funnel and it is an operator call.
Until it is made, somebody has to read the tail.
