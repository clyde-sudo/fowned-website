# Fowned deployment

## What this is

The live Fowned marketing site, published at **https://fowned.live**. The
marketing pages are real: the lead form writes to D1 and the calendar link books
a real call. The subtree under `/demo/` is the part that is a demonstration, a
browser-verifiable walkthrough of the whole intended experience from a cold
visitor arriving to an agency operator working the resulting lead. That subtree
is seeded with invented companies and every surface of it says so.

## /demo/ retired (6 September 2026)

The `/demo/` subtree described below no longer builds. Its eight pages and
`js/demo.js` were removed and `_redirects` sends `/demo/*` to `/audit/` with a
301. The paragraphs that mention `/demo/` are kept as the record of why it was
noindex while it existed; the sitemap and `llms.txt` filters in `build.mjs` are
now no-ops.

## Indexing decision (host-aware, launched 3 September 2026)

The rule is no longer one blanket answer. Two questions are being asked at once
and they have opposite answers, so they are enforced in two different places:

| Scope | Answer | Mechanism |
|---|---|---|
| Marketing pages on `fowned.live` | **index** | nothing suppresses them; `robots.txt` sends `Allow: /` |
| Every path on any `*.pages.dev` host | **noindex** | `X-Robots-Tag: noindex, nofollow`, set per-request in `functions/_middleware.js` |
| Anything under `/demo/`, on every host | **noindex** | `<meta name="robots" content="noindex, nofollow">`, baked in by `src/layout.mjs` |

**Why the split, and why not `_headers`.** `_headers` cannot see the request
Host, and this one Pages project answers on both the launch domain that must
index and the temporary hostnames that must not. A blanket `X-Robots-Tag` there
would silently deindex the launch domain, so the host-dependent half lives in
middleware, which can read the Host. The `/demo/` rule is the opposite kind: it
is host-INDEPENDENT, because invented companies must never index anywhere, and
that is exactly what makes it safe to bake into the HTML.

**Why `/demo/` is crawlable rather than disallowed.** A disallowed URL is never
fetched, so its `noindex` is never read, while a followed internal link can
still put the bare URL into an index with no snippet. Crawlable-and-noindex is
the only combination that reliably keeps a page out. Four pages link into
`/demo/` (ai-visibility, how-it-works, services, 404), so the followed-link path
is real rather than hypothetical. `/demo/` is additionally absent from the
sitemap and from `llms.txt`, which are two more readers being told the same
thing a third way.

**Crawler groups are named explicitly.** `robots.txt` lists ten AI crawlers by
name rather than leaving them to the wildcard. The wildcard permits them today,
but that is an accident of the wildcard rather than a stated intent, and a later
edit to it would silently change the answer. Retrieval and training crawlers are
also different agents: `GPTBot` trains, while `OAI-SearchBot` builds the index
ChatGPT actually retrieves from. For a citation goal the retrieval half is the
one that matters, and it was the half originally missing.

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

**Current mode: FIXTURE.** `scanUrl` is empty in the config object served on
`/audit/`, verified 3 September 2026, so the switch has never been flipped and
every audit result carries its `DEMO AUDIT RESULT` badge.

**What has to be true before the switch is flipped.** The endpoint
(`/api/agency/fowned/scan`) is deployed on the Citability side. It answers only
when BOTH of these are true there. Neither was true as of 31 August 2026 and
neither has been re-checked since, because checking means a real POST to
Citability production:

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

    git switch main && git pull upstream main && ./deploy.sh

`deploy.sh` is the only supported production deploy. It refuses unless you are
on `main`, with no uncommitted tracked changes, at exactly `upstream/main`.

**Why (11 September 2026).** Production used to be deployable from any branch,
because `--branch=main` labels every upload "main". A local branch holding nine
commits (guide links, menu fix, Sprint price, GA4) was deployed straight to
production without being merged. The next deploy, from real `upstream/main`,
replaced it, and all nine vanished from fowned.live while every row in the
deploy list still said `main`. Merge through a PR first, then deploy. A branch
you want to look at goes to a preview: drop `--branch=main`.

The two env vars inside `deploy.sh` are load-bearing and both fail silently if omitted.

`SITE_ORIGIN` and `BOOKING_URL` are read at BUILD time. Without them the build
succeeds and produces canonicals, `og:url`, the sitemap and the JSON-LD pointing
at the pages.dev host, and every booking CTA falling back to `/contact/`. That
is a correct build of the wrong site, and nothing in the output says so.

`--branch=main` is what makes it a production deploy. `wrangler pages deploy`
infers the branch from git, and Pages promotes only the PRODUCTION branch to the
custom domain. Deploying from a feature branch yields a preview URL, a green
deploy log, and an untouched `fowned.live`. Every production deployment of this
project has used branch `main`.

Secrets live in Wrangler secret storage and never in the repo, the bundle, the
HTML, this file or the logs. `wrangler pages secret put` reads the value from
STDIN, never from argv, and a secret only takes effect on the NEXT deployment.

| Name | Where | Missing means |
|---|---|---|
| `fowned_leads` | D1 binding, `wrangler.toml` | `/api/lead` returns 503 and stores nothing |
| `RESEND_API_KEY` | Pages secret | Leads still store; nobody is emailed |
| `LEAD_NOTIFY_FROM` / `LEAD_NOTIFY_TO` | Pages secret | Same as above |
| `TURNSTILE_SECRET_KEY` | Pages secret | The bot challenge is not enforced. The honeypot and the origin check still are |
| `SLACK_WEBHOOK_URL` | Pages secret | Leads still store and still email; no Slack card. Comma-separate to post to more than one workspace |
| `SLACK_NOTIFY_MENTIONS` | Pages secret | The card posts without pinging anyone by name |
| `TURNSTILE_SITE_KEY` | Build-time env | The Turnstile widget is not rendered at all |
| `AUDIT_SCAN_URL` | Build-time env | The audit runs in fixture mode |

### Slack lead alerts

Every lead posts a card to Slack as well as an email. Both channels are best
effort and run concurrently; the D1 row is still the only authoritative sink,
and `notified` now means *any* channel landed, so a Slack card clears it even
while email is down. `notify_error` prefixes each failure with `EMAIL` or
`SLACK` because one column otherwise cannot say which half broke.

`SLACK_WEBHOOK_URL` is comma-separated on purpose. **One incoming webhook
reaches exactly one channel in one workspace**, so two people in two different
workspaces need two URLs. A failure is reported by position (`webhook 2/2 403:
no_service`) and never by URL, because that URL is a credential and this string
is stored in D1.

To mint one: <https://api.slack.com/apps> -> Create New App -> From scratch ->
pick the workspace -> Incoming Webhooks -> On -> Add New Webhook to Workspace ->
choose the channel. Then, per workspace:

    printf %s 'https://hooks.slack.com/services/AAA/BBB/CCC' \
      | npx wrangler pages secret put SLACK_WEBHOOK_URL --project-name=fowned

`SLACK_NOTIFY_MENTIONS` takes Slack **member IDs** (`U...`/`W...`, from a
profile's "Copy member ID"), not display names. A display name renders as
literal text and pings nobody, which looks identical to working.

A secret only takes effect on the NEXT deployment. Verify the card renders
before trusting it, since Slack validates blocks server-side:

    node tools/slack-card-test.mjs          # offline, 17 checks, no webhook needed
    SLACK_WEBHOOK_URL=... node tools/slack-card-test.mjs --live-post

**The cache rules in `_headers` depend on a zone setting.** Cloudflare's
zone-level Browser Cache TTL takes the GREATER of the zone value and the
origin `Cache-Control`. It is a floor, not an override, so any `_headers` rule
asking for a SHORTER max-age is ignored with no error anywhere. The zone was on
`4 hours`, which silently raised the 300 on `/robots.txt` and the 3600 on
`/css/*` and `/js/*` to 14400 while `/images/*` at 86400 passed through
untouched. It was set to **Respect Existing Headers** on 3 September 2026 and
`/robots.txt` now serves 300 as written. If a cache rule here ever appears to be
ignored, check that setting before editing this file.

Related and separate: changing a TTL does not evict an object already in the
edge cache, and neither does a deploy. A corrected `robots.txt` once shipped
while the edge kept serving the stale body for hours and every check read as a
failed deploy. Read origin truth with a cache-busting query string
(`curl -sI 'https://fowned.live/robots.txt?cb=1'`) before concluding a deploy
did not land.

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

## Launch: DONE

`fowned.live` is live and indexable. The zone is in Cloudflare, the nameservers
moved off Squarespace, both hostnames are attached to the Pages project, and the
site was built with the real origin. Kept here because the reasoning still
explains the shape of the setup:

Apex domains on Pages need the zone inside Cloudflare. Squarespace DNS has no
ALIAS/ANAME at the apex and Pages publishes no stable IPs, so a CNAME at the
root only works with Cloudflare's CNAME flattening. Before the nameservers
moved, `fowned.live` had **no MX records** and an SPF of `v=spf1 -all`, so no
email depended on the domain and the change could not break mail.

The API token still has `zone (read)` only, with no `zone (edit)` and no cache
purge. Zone creation, zone settings and cache purges are therefore dashboard
work, not scriptable from this repository.

### The four-probe regression check

These are the standing probes. Run them after any deploy that touches routing,
`_headers`, `functions/_middleware.js` or `robots.txt`. All four pass in
production as of 3 September 2026:

    curl -sI https://fowned.live/            # expect NO x-robots-tag header
    curl -s  https://fowned.live/robots.txt  # expect Allow: / and the sitemap line
    curl -sI https://www.fowned.live/        # expect 301 to the apex
    curl -sI https://fowned.pages.dev/       # expect x-robots-tag: noindex, nofollow

Two more worth running, because they cover the `/demo/` half that the four above
do not touch:

    curl -s https://fowned.live/demo/prospects/ | grep -o '<meta name="robots"[^>]*>'
    curl -s https://fowned.live/sitemap.xml | grep -c '/demo/'   # expect 0

### Booking: SET

`BOOKING_URL` is `https://calendly.com/clyde-thrulead/30min`, confirmed live in
the `FOWNED` config object served on `/audit/`. Every booking CTA points at that
calendar, the contact page carries a "Book a call" card, and the audit result
offers it.

It is a build-time variable, so it must be passed on every rebuild or the site
silently reverts to `/contact/` on the next deploy. That is why it is part of
the deploy command above rather than a footnote. No calendar URL is guessed
anywhere in the codebase.

### Turnstile: NOT ACTIVE

`turnstileSiteKey` is empty in the live config object, so the widget is not
rendered and the bot challenge is not enforced. The honeypot and the origin
check still are. Both Turnstile keys are needed together, per the table above.

### Where a lead actually goes

The durable sink was chosen and built. A lead is written to the D1 `leads` table
by `functions/api/lead.js`, then emailed through Resend, and the outcome of that
send is recorded back onto the row as `notified` and `notify_error`. Nobody has
to read a log to find a lead, and a failed email does not lose one.

**The log lines are now failure paths, not the sink.** `FOWNED_LEAD_NO_BINDING`
means the D1 binding was missing and the lead exists only in the log.
`FOWNED_LEAD_STORE_FAILED` means the insert threw. Either one is an incident:
that lead is not in the table.

`tools/notify-test.sh` exercises the whole path end to end against remote D1,
posting a stamped lead and then asserting the row exists and its `notified` flag
is set. Run it after any change to the lead path.

### Reading the telemetry

    npx wrangler pages deployment tail --project-name=fowned

`FOWNED_EVENT` lines are anonymous traffic. The two `FOWNED_LEAD_*` lines above
are the ones worth alerting on.
