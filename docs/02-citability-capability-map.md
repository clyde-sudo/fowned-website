# 2. Citability capability reuse map

Every row below was read from live source in `/Users/chudinnorukam/Projects/citability-dev`
on 2026-08-24. Line references are to that tree.

## EXISTS_REUSABLE — use unchanged, do not reimplement

| Capability | Where | Note |
|---|---|---|
| Audit/scan engine | `lib/scan-checks.ts:238 runWebsiteChecks`, `axisScore:654` | single evaluator shared by free and paid pipelines |
| Scan cache | `lib/scan-cache.ts getCachedWebsiteChecks` | the correct entry point; `/api/scan` uses it |
| SSRF guard | `lib/scan-checks.ts:16 isPrivateUrl` | rejects private/internal targets |
| Host denylist | `lib/scan-denylist.ts` | |
| Rate limiting | `lib/rate-limit.ts checkScanLimit` | IP-scoped |
| Teaser gating | `lib/scan/teaser.ts selectTeaserChecks` | free-vs-paid result withholding already solved |
| Infrastructure probe | `lib/monitoring/infrastructure.ts:83 probeInfrastructure`, `:108 infrastructureRegressions` | robots / llms.txt / sitemap / canonical / schema / availability |
| Freshness + entitlement contract | `lib/monitoring/contract.ts:105 canRunInfrastructure`, `canRunCitation`, `freshnessOf` | never-vs-stale-vs-current, the section-9 requirement |
| Scheduler | `app/api/cron/monitoring/route.ts` + `lib/monitoring/service.ts dueMonitoringSubscriptions` | per-UTC-day idempotency key, `nextUtcDayStart` anchor |
| Cron liveness | `lib/heartbeat.ts withHeartbeat` + `cron_heartbeats` + `/api/cron-health` | dead-man's switch |
| Snapshot persistence | `monitoring_snapshots` (kind = infrastructure \| citation), `monitoring_reports` | |
| Citation/AVR machinery | `scans`, `scan_queries`, `prompt_runs`, `model_responses`, `extracted_citations`, `extracted_mentions`, `brand_match_results`, `avr_scores`, `score_components`, `receipts`, `competitors` | full multi-engine citation stack already modelled |
| Tenancy primitives | `organizations`, `memberships` (role enum), `projects`, `domains`, `domain_verifications` | correct unique constraints already in place |
| Membership-scoped resolver | `lib/workspace.ts getCurrentClient` | scopes by `clients.organizationId IN (user's orgs)`, not by userId |
| Public self-serve auth | `auth.ts` | **sign-in is NOT allowlisted.** Any verified Google account signs in and gets a `users` row upserted. The allowlist (`lib/oauth-allowlist.ts`) gates operator surfaces only, via `requireOperatorSession()` |
| Billing + entitlement | Stripe checkout, `lib/monitoring/stripe-webhook.ts`, portal route, `monitoring_subscriptions` | |
| Prospect funnel tables | `prospects`, `prospect_audits`, `outreach_status`, `conversions` | `outreach_status` is documented DRAFT-ONLY, no live send path — matches section 7 |
| Scan provenance | `lib/scan-provenance.ts clientKindFromHeaders` | answers "was a human on the other end" |

**The single most important finding:** three of the five middle levels of the
required agency hierarchy already exist with tenant-correct unique indexes.
`organizations.slug` is unique globally, `projects (organization_id, slug)` is
unique per org, `domains (project_id, hostname)` is unique per project. Nothing
needs to be invented there.

## EXISTS_NEEDS_GENERALIZATION

| Concept | Problem | Fix |
|---|---|---|
| `prospects` | **P0 TENANCY BLOCKER.** `prospects_domain_unique` is a GLOBAL unique index on `domain`, and the table has no `organization_id` at all (`db/schema.ts:1398`). Two agencies cannot prospect the same domain; one agency's write silently updates the other's row (`app/api/scan/route.ts:87` does `onConflictDoUpdate` on that key) | add `organization_id`, replace the index with `(organization_id, domain)` |
| `clients.organizationId` | nullable "during the transition window" (`db/schema.ts:89`) | tighten to NOT NULL once all writers populate it |
| `monitoring_subscriptions` scoping | the columns `organizationId / projectId / domainId` all exist and are all nullable; the live read path keys off `customer_email` (`app/monitoring/page.tsx:16`) | populate the FKs on agency-activated rows and add an org-scoped read path alongside the email path |
| `getCurrentClient()` | returns the single most-recent client across all of the user's orgs | agency needs an explicit active-org + active-client selection |
| Customer dashboard | Citability-branded, hardcoded wordmark | inject brand tokens from a tenant brand config |
| `/api/scan` | writes a prospect with no agency context and no campaign metadata | agency-scoped variant carrying `organization_id` + source/campaign |
| `lib/attribution.ts` | UTM only, client-side cookie, 4 exports, zero referrer logic | add server-side referrer capture and classification |

## MISSING_REQUIRED

1. Tenant brand configuration (logo, palette, product name, portal host, sender identity). Grep for `whiteLabel|white_label|tenantBrand` across `app/` and `lib/` returns exactly one unrelated hit.
2. Agency-to-client activation path that does not impersonate the client and does not hand-edit DB state.
3. AI-referrer classification producing `OBSERVED_SOURCE` / `INFERRED_AI_SOURCE` / `UNKNOWN`.
4. Lead capture with a consultation/booking event.
5. Agency prospect workspace UI.
6. Cross-tenant isolation test suite (see `docs/03`, isolation section).
7. White-label portal routing and navigation.
8. Obvious SIGN IN / ACCOUNT navigation — the defect the Citability dogfood surfaced (`/` through `/blog` carry zero login links; only `/monitoring` has one).

## DEFER

- Frontier intelligence loop (observation -> diagnosis -> opportunity -> recommendation -> intervention -> remeasure -> outcome). Phase E.
- Autonomous outbound sending. Explicitly forbidden; `outreach_status` stays draft-only.
- Agency billing / revenue share.
- Convex-side tenanting (`monitoring_subscriptions.convexTenant` exists but is out of Phase A scope).
