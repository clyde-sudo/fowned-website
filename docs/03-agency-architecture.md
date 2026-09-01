# 3. Agency architecture

## 3.1 The mapping decision

The required hierarchy maps onto existing Citability primitives. Only one level
needs new work.

    AGENCY                  -> organizations                        EXISTS_REUSABLE
    TEAM / USERS            -> users + memberships(role)            EXISTS_REUSABLE
    PROSPECTS               -> prospects                            NEEDS_GENERALIZATION (P0)
    CLIENTS                 -> projects (org-scoped)                EXISTS_REUSABLE
    SITES                   -> domains (project-scoped)             EXISTS_REUSABLE
    SUBSCRIPTIONS/ENTITLE   -> monitoring_subscriptions             NEEDS_GENERALIZATION (populate FKs)
    AUDITS                  -> prospect_audits (pre-sale)           EXISTS_REUSABLE
                               audits + audit_checks (post-sale)    EXISTS_REUSABLE
    INFRASTRUCTURE SNAPSHOT -> monitoring_snapshots kind=infrastructure  EXISTS_REUSABLE
    CITATION SNAPSHOT       -> monitoring_snapshots kind=citation    EXISTS_REUSABLE
    REPORTS                 -> monitoring_reports                    EXISTS_REUSABLE
    LEADS / CONVERSIONS     -> prospects + conversions               NEEDS_GENERALIZATION (org scope)

Rejected alternative: a separate `agencies` table with `agency_clients`. It would
duplicate `organizations`/`projects` and force every existing scoped query to
learn a second tenancy axis. Fowned becomes `organizations.slug = 'fowned'`,
tenant #1 of the generalized layer, with no exception path.

Consequence: a Fowned client is a `project` inside the Fowned org, and that
client's website is a `domain` inside that project. Both unique indexes are
already per-parent, so two Fowned clients may hold the same hostname as two
clients of a different agency without collision. This is already correct today.

## 3.2 The one required migration

    ALTER TABLE prospects ADD COLUMN organization_id integer REFERENCES organizations(id);
    -- backfill existing rows to the Citability seed org
    DROP INDEX prospects_domain_unique;
    CREATE UNIQUE INDEX prospects_org_domain_unique ON prospects(organization_id, domain);

Until this lands, multi-agency prospecting is unsafe: `app/api/scan/route.ts:87`
upserts on the global domain key, so agency B scanning a domain agency A already
holds rewrites A's row. This is the single P0 for tenancy and the whole reason
Phase A cannot be declared done without it.

## 3.3 Tenant isolation model

Single-resolver pattern, no per-route ad hoc checks.

    resolveTenantScope(session) -> { userId, orgIds[] }
      derived ONLY from memberships; never from a request parameter.

    Every read:   WHERE <table>.organization_id IN scope.orgIds
    Every nested: join up to the org and filter there
                  (domain -> project.organization_id, snapshot -> subscription.organization_id)
    Every write:  organization_id is SET FROM scope, never accepted from the body.

Direct ID manipulation is defeated structurally: requesting `/prospects/9999`
produces a query that returns zero rows rather than a row plus a check that can
be forgotten. Background jobs (the monitoring cron) do not carry a session; they
scope by the subscription row they are already iterating, which is why
`dueMonitoringSubscriptions` needs no change.

Required proof suite before any second brand exists (all P0):

    T1 agency A user cannot read agency B prospect by direct id
    T2 agency A user cannot read agency B project / domain / snapshot / report
    T3 agency A user cannot write into agency B (org id from body is ignored)
    T4 within agency A, a client-portal session for client 1 cannot read client 2
    T5 report export and lead list respect the same scope
    T6 the cron writes snapshots only against the subscription's own org
    T7 API-key and agent-credential paths carry the same scope

Any failure is P0 and blocks the second tenant.

## 3.4 Brand / engine separation

    CITABILITY CORE   (server, shared, Citability-owned)
      scan + audit engine, infrastructure probe, citation engine, freshness
      contract, scheduler, snapshots, reports, entitlement, attribution
      primitives, tenant scope resolver

    FOWNED SHELL      (presentation, Fowned-owned)
      marketing site, funnel copy, lead capture UI, agency workspace UI,
      client portal chrome, brand tokens, portal hostname

Boundary rule: the shell may not contain scanning, scheduling, persistence, or
scoring logic; the core may not contain a hardcoded brand string on any surface
a tenant can reach. Brand reaches the UI as data:

    tenant_brands(organization_id PK, product_name, wordmark_asset, palette jsonb,
                  portal_host, support_email, show_powered_by boolean)

`show_powered_by` is a business-policy switch, defaulting to off for white-label.

## 3.5 Prospect funnel architecture

    LAND (fowned marketing page)
      -> enter domain
      -> POST /api/agency/{orgSlug}/scan       reuses getCachedWebsiteChecks
      -> render teaser result via selectTeaserChecks   (immediate, useful, honest)
      -> capture email -> prospects row (organization_id = fowned)
      -> prospect_audits row linked to it
      -> optional "request consultation" -> conversions(stage=lead)
      -> Fowned workspace shows the prospect with full audit context

Captured, and nothing more: `organization_id`, `prospect_id`, `domain`,
`email` (only when volunteered), `audit_id`, `run_at`, key findings,
`utm_source/medium/campaign`, `client_kind`, lead stage. No enrichment scraping,
no third-party data purchase, no fields the buyer did not offer.

Quota: the existing IP limiter stays; add a per-org daily scan quota so one
agency's funnel cannot exhaust the shared engine.

## 3.6 Client activation architecture (no founder-only writes)

    Fowned closes a client
      -> agency member creates project + domain in the Fowned workspace
      -> domain_verifications proves control of the hostname
      -> agency initiates monitoring for that domain:
           agency-billed  -> Stripe subscription on the AGENCY customer,
                             monitoring_subscriptions row with
                             organization_id/project_id/domain_id populated
           client-billed  -> checkout link sent to the client, same row shape
      -> canRunInfrastructure()/canRunCitation() decide eligibility unchanged
      -> the SAME /api/cron/monitoring scheduler picks it up via
         dueMonitoringSubscriptions with no code change

No impersonation: the agency acts as itself through membership role, never by
signing in as the client. No hand-edited state: activation is a Stripe event plus
an org-scoped insert, exactly the path the current dogfood certification is
proving. `monitoring_subscriptions.status` is never written by hand.

## 3.7 Telemetry integration

Everything in section 9 of the brief is already produced by the core; the shell
only renders it. The rendering contract is the important part:

    every metric carries one of:
      current   (age < cadence)          value + age
      stale     (age >= cadence)         value + age, visually marked
      partial   (some engines failed)    what succeeded, what did not
      failed    (last attempt errored)   the error class, never a zero
      never     (awaiting first run)     "awaiting first run", never a zero

`lib/monitoring/contract.ts freshnessOf` already returns `never|stale|current`
and `app/monitoring/page.tsx` already renders age beside status. `partial` and
`failed` are the two states the portal must add. Missing measurement is never
rendered as `0`.

## 3.8 Attribution truth assessment

This is the claim Fowned sells hardest, and it is the claim least supported.

**PROVEN today**
- First-touch UTM at the moment of email capture: `prospects.utm_source/medium/campaign`, written together with `email_captured_at`, with the explicit marker `unattributed` rather than null when absent (`lib/attribution.ts normalizeAttribution`).
- Caller provenance: `client_kind` distinguishes a human form-fill from a script (`lib/scan-provenance.ts`).
- Audit-to-prospect linkage: `prospect_audits.prospect_id`.
- Funnel stage progression: `conversions(stage, converted_at)`.

**PARTIAL**
- Landing source and referrer: capturable but not currently captured server-side. `lib/attribution.ts` is client-side and UTM-only; it has no referrer logic at all.
- Conversion-to-revenue: `conversions.stripe_ref` exists but nothing writes the agency-side path yet.

**NOT_IMPLEMENTED**
- Any detection that a visitor arrived from an AI assistant.
- Any linkage between a specific AI answer and a specific lead.
- Call tracking ("Called the office" in the Fowned mockup).
- Session identity across visits.

**Therefore the live claim "every lead is tagged with the AI answer that sent
them" is false and must be removed from the Fowned page before the page is used
as a cold-outreach destination.** Same for tier 03's "See which visitors arrived
from an AI answer" as an unqualified promise.

The honest ceiling, and what to build:

    OBSERVED_SOURCE     document.referrer host, utm_*, landing path.
                        Fact. Store verbatim.
    INFERRED_AI_SOURCE  referrer host matches a known assistant origin
                        (chatgpt.com, perplexity.ai, copilot.microsoft.com,
                        gemini.google.com and similar), OR a first-touch with
                        no referrer on a page that an assistant is known to
                        cite. Labelled INFERRED, never presented as proof.
    UNKNOWN             everything else. The majority. Say so.

Assistants frequently strip or generalise the referrer, so INFERRED is the
strongest label the telemetry can honestly carry. Sellable version of the
promise: "when the AI tool passes a referrer we can see it, and we show you what
we could and could not attribute." Never fabricate a source.

## 3.9 Frontier intelligence layer (design only, Phase E)

Reuses the evidence discipline already in the codebase (`audit_checks.evidence`
enum verified/best-effort, `receipts`, `calibration_receipts`) rather than
importing the Chiron harness, which stays out of the customer product.

    observations(domain_id, observed_at, metric, value, source_snapshot_id)
    diagnoses(observation_id, hypothesis, confidence, evidence_refs[])
    opportunities(domain_id, kind, estimated_effect, effort, rationale)
    recommendations(opportunity_id, action, status)
    interventions(recommendation_id, applied_at, applied_by, change_ref)
    remeasures(intervention_id, window_start, window_end, delta, verdict)

Answering the five agency questions:
"What changed?" = snapshot diff. "Why?" = diagnosis with confidence and evidence
refs. "What next?" = ranked opportunities. "Did it work?" = remeasure verdict
against a pre-committed window. "What should we repeat?" = intervention kinds
with positive verdicts across clients. Every verdict must be pre-committed
before the intervention, or the remeasure is not evidence.

## 3.10 White-label client portal

    portal.fowned.com (or fowned.com/portal)  ->  same Next.js app,
    tenant resolved by host or by /a/{orgSlug} path prefix

    OVERVIEW | VISIBILITY | CITATIONS | INFRASTRUCTURE | OPPORTUNITIES | REPORTS | SERVICE HEALTH

Chrome, palette, wordmark and product name come from `tenant_brands`. No
Citability string renders unless `show_powered_by` is true.

## 3.11 Account discoverability (the dogfood defect, made a platform rule)

The Citability dogfood found that a signed-in buyer had no way to reach their own
dashboard: a link grep across `/`, `/pricing`, `/services`, `/proof`, `/docs`,
`/scan`, `/blog` returned zero login links; only `/monitoring` had one.

Platform rule for every tenant shell, enforced by a test, not by prose:
every page renders a persistent account affordance — SIGN IN when signed out,
ACCOUNT / DASHBOARD when signed in, RETURN TO PORTAL from any client-facing
sub-surface. The test asserts the affordance is present on every top-level route.
Ship this in the shared shell component so future agency tenants inherit it.

## 3.12 Fowned self-dogfood

`fowned.com` becomes a `domain` inside a `project` inside the Fowned org, with
its own monitoring subscription. Fowned then experiences audit, activation,
monitoring, a failure, freshness decay, recovery, and a report before client #1
is promised the same. This mirrors exactly what citability.dev is proving now,
and it is the acceptance gate for Phase C.
