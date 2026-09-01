# 4. Migration plan, Phase A scope, blockers

Every phase leaves a deployable product. No one-shot rewrite.

## Phases

| Phase | Outcome | Leaves working |
|---|---|---|
| **A** | ownership + architecture + a real audit funnel on a truthful Fowned page | a Fowned marketing site whose audit actually runs and captures leads |
| **B** | agency tenancy + prospect workspace | Fowned staff can see and work their prospect list |
| **C** | client activation + current telemetry, Fowned self-dogfood | a Fowned client can be activated and monitored by the shared scheduler |
| **D** | white-label client portal | clients log into a Fowned-branded portal |
| **E** | frontier diagnosis / opportunity / remeasure loop | the agency can answer what changed, why, what next, did it work |

## Phase A scope

    A1  canonical repo + upstream remote                          DONE (this arc)
    A2  truth pass on the Fowned page                             remove the false attribution
                                                                  claim, the empty client-logo
                                                                  row, label or drop the
                                                                  fabricated attribution card;
                                                                  keep the design and the
                                                                  AUDIT -> FIX -> TRACK model
    A3  POST /api/agency/{orgSlug}/scan                            reuses getCachedWebsiteChecks
                                                                  + selectTeaserChecks; org-scoped
                                                                  quota on top of the IP limiter
    A4  wire the two dead forms and the LINKS table to A3          audit form + newsletter; the
                                                                  data-link seam already exists
    A5  lead capture -> prospects(organization_id) + prospect_audits
                        + conversions(stage=lead)
    A6  prospects tenancy migration (see docs/03 section 3.2)      P0, prod schema change
    A7  cross-tenant isolation tests T1-T7                          P0, gates Phase B
    A8  account-affordance test on every top-level route           the dogfood defect, as a rule

Phase A is done when a stranger can land on the Fowned page, enter a domain, get
a real Citability-powered result, leave an email, and appear in the Fowned org's
prospect list, with no claim on the page that the telemetry cannot support.

## Blockers

| # | Blocker | Severity | Resolution |
|---|---|---|---|
| B1 | `prospects` has a GLOBAL unique domain index and no `organization_id` | **P0** | migration in docs/03 sec 3.2; requires a production DB schema change, which is operator-gated |
| B2 | **The 2026-08-25 / 2026-08-26 cadence observation is live.** No production schema or scheduler change may land before it closes | **P0, time-boxed** | B1 waits until the observation reports. Local/staging work is unaffected |
| B3 | No verified deploy destination for Fowned | **P1** | no Vercel project, no verified `fowned.com`, and I hold push-but-not-admin on `clyde-sudo/fowned-website`. Destination is an ownership decision, not a technical one |
| B4 | The headline attribution claim is false as written | **P1** | A2. It is also a legal/trust exposure the moment the page is used for outreach |
| B5 | `placeholder@fowned.com` is the only email identity | **P2** | real inbox needed before lead capture means anything |
| B6 | Shared scan engine has only IP-scoped rate limiting | **P2** | per-org quota in A3 |
| B7 | `clients.organizationId` still nullable | **P2** | tighten after all writers populate it |

## Highest-EV next implementation step

**A2 + A3 + A4 together, against the staging database.**

Rationale: it is the only sequence that converts Fowned from a design artefact
into a working cold-outreach destination, it is blocked by nothing (B1/B2 are
production-schema blockers and this work is local), and it forces the truth pass
that has to happen before any outreach is legitimate. A6 is the more fundamental
fix but cannot start until the cadence observation closes on 2026-08-26.

## Repo ownership

    UPSTREAM_AGENCY_REPO   https://github.com/clyde-sudo/fowned-website.git
                           owner clyde-sudo, public, read/reconcile only
                           my permissions: pull true, push true, triage true,
                                           maintain FALSE, admin FALSE
    MY_CANONICAL_BUILD     /Users/chudinnorukam/Projects/fowned-web
                           git initialised, remote `upstream` recorded,
                           NO `origin`, nothing pushed anywhere

The upstream working tree is preserved verbatim at `legacy-site/` so the design
inventory in docs/01 stays checkable against the original bytes.
