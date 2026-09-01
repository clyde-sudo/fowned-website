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

## The audit has two modes, and the mode is a build-time switch

`js/audit.js` runs the real eight-state machine. What feeds it depends on one
environment variable at build time:

| `AUDIT_SCAN_URL` | Mode | Result |
|---|---|---|
| unset (default) | fixture | Deterministic verdicts hashed from the entered domain, badged `DEMO AUDIT RESULT` on every render |
| set | live | One POST to the tenant-scoped Citability endpoint, real verdicts, no demo badge |

It is a build-time switch, not a runtime probe, because the audit page must
never ship a live path that 404s while a visitor watches it spin. In live mode a
failed scan says it failed; it never falls back to the fixture, because a made-up
result wearing a live badge is worse than either mode on its own.

**What has to be true before the switch is flipped.** The endpoint
(`/api/agency/fowned/scan`) is deployed on the Citability side. It answers only
when BOTH of these are true there, and neither is true as of 31 August 2026:

1. An `organizations` row with `slug = 'fowned'` exists in the Citability
   production database. Without it the endpoint returns
   `404 {"state":"FAILED","message":"Unknown agency."}`.
2. `https://fowned.live` is in `AGENCY_ALLOWED_ORIGINS` in that project's
   Vercel production environment, followed by a redeploy. Without it no CORS
   headers are returned and the browser rejects the response, even though curl
   would see a body.

Both are changes to Citability production, not to this repository. Verify with a
real POST before setting `AUDIT_SCAN_URL`.

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

Secrets live in Wrangler secret storage and never in the repo, the bundle, the
HTML, this file or the logs. `wrangler pages secret put` reads the value from
STDIN, never from argv, and a secret only takes effect on the NEXT deployment.

| Name | Where | Missing means |
|---|---|---|
| `fowned_leads` | D1 binding, `wrangler.toml` | `/api/lead` returns 503 and stores nothing |
| `RESEND_API_KEY` | Pages secret | Leads still store; nobody is emailed |
| `LEAD_NOTIFY_FROM` / `LEAD_NOTIFY_TO` | Pages secret | Same as above |
| `TURNSTILE_SECRET_KEY` | Pages secret | The bot challenge is not enforced. The honeypot and the origin check still are |
| `TURNSTILE_SITE_KEY` | Build-time env | The Turnstile widget is not rendered at all |
| `AUDIT_SCAN_URL` | Build-time env | The audit runs in fixture mode |

The two Turnstile keys are minted together in the Cloudflare dashboard and are
useless apart: a site key with no secret means the widget renders and nothing
verifies it, and a secret with no site key means every submission is rejected
for a token no form produced. Set both, then rebuild AND redeploy.

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
