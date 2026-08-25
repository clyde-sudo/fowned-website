/**
 * Demo fixtures.
 *
 * EVERY value in this file is invented. The companies do not exist, the
 * telemetry was never measured, and none of it is a Fowned customer record.
 * That is why each surface that reads this file also renders the DEMO DATA
 * banner: a fixture that is not labelled is a lie with a delay on it.
 *
 * Fixtures are deterministic on purpose. A demo that reshuffles between
 * refreshes cannot be walked through twice in the same meeting.
 */

/* ---- section 7: agency pipeline ---------------------------------------- */

export const OWNERS = ["PHOENIX", "CLYDE", "UNASSIGNED"];
export const LIFECYCLE = [
  "NEW", "QUALIFIED", "ASSIGNED", "CONTACTED",
  "ENGAGED", "MEETING", "OPPORTUNITY", "WON", "LOST", "NURTURE",
];

/* Source classes are the closed vocabulary from section 11. OBSERVED_AI_REFERRER
 * means a referrer header naming an AI surface was actually seen. It does NOT
 * mean an AI answer caused the visit; nothing on the client can observe that. */
export const SOURCES = {
  GOOGLE_ORGANIC:     { label: "Google organic",   evidence: "OBSERVED" },
  BING_ORGANIC:       { label: "Bing organic",     evidence: "OBSERVED" },
  OBSERVED_AI_REFERRER:{ label: "AI referrer",     evidence: "OBSERVED" },
  OTHER_REFERRER:     { label: "Other referrer",   evidence: "OBSERVED" },
  DIRECT_OR_UNKNOWN:  { label: "Direct or unknown", evidence: "UNKNOWN" },
};

export const PROSPECTS = [
  {
    company: "Harborline Plumbing", domain: "harborline-plumbing.example",
    contact: "dispatch@harborline-plumbing.example", source: "OBSERVED_AI_REFERRER",
    landing: "/geo/?utm_source=perplexity", health: "CRITICAL", score: "3 of 11",
    findings: ["No organization schema", "Business hours absent from every page", "Service area never stated in text"],
    aiSignal: "Not named in 0 of 6 sampled category answers",
    opportunity: 87, confidence: "MEDIUM",
    next: "Send the full audit, lead with the missing service area",
    owner: "PHOENIX", status: "QUALIFIED",
  },
  {
    company: "Verdigris Roofing Co", domain: "verdigris-roofing.example",
    contact: "owner@verdigris-roofing.example", source: "GOOGLE_ORGANIC",
    landing: "/audit/", health: "NEEDS_WORK", score: "7 of 11",
    findings: ["Reviews not marked up", "Two competing address formats", "Thin service pages"],
    aiSignal: "Named 2 of 6, always after a competitor",
    opportunity: 74, confidence: "HIGH",
    next: "Book the roofing walkthrough call",
    owner: "CLYDE", status: "MEETING",
  },
  {
    company: "Northgate Dental Studio", domain: "northgate-dental.example",
    contact: "hello@northgate-dental.example", source: "OBSERVED_AI_REFERRER",
    landing: "/ai-visibility/", health: "NEEDS_WORK", score: "6 of 11",
    findings: ["No FAQ content answering treatment questions", "Practitioner entities unlinked"],
    aiSignal: "Named 3 of 6, description outdated by one location",
    opportunity: 81, confidence: "MEDIUM",
    next: "Confirm the closed second location before outreach",
    owner: "PHOENIX", status: "CONTACTED",
  },
  {
    company: "Sable & Finch Interiors", domain: "sablefinch.example",
    contact: "studio@sablefinch.example", source: "DIRECT_OR_UNKNOWN",
    landing: "/", health: "CRITICAL", score: "2 of 11",
    findings: ["Site is a single JavaScript page with no server-rendered text", "No business entity anywhere"],
    aiSignal: "Not measured - retrieval blocked",
    opportunity: 92, confidence: "LOW",
    next: "Technical call first, the site cannot be read at all",
    owner: "UNASSIGNED", status: "NEW",
  },
  {
    company: "Cadence Physio", domain: "cadence-physio.example",
    contact: "front@cadence-physio.example", source: "BING_ORGANIC",
    landing: "/services/", health: "HEALTHY", score: "10 of 11",
    findings: ["Only gap is missing appointment availability markup"],
    aiSignal: "Named 5 of 6, described accurately",
    opportunity: 41, confidence: "HIGH",
    next: "Nurture. Revisit at the next quarterly re-measure",
    owner: "CLYDE", status: "NURTURE",
  },
  {
    company: "Ironwood Landscaping", domain: "ironwood-landscaping.example",
    contact: "quotes@ironwood-landscaping.example", source: "OTHER_REFERRER",
    landing: "/case-studies/", health: "NEEDS_WORK", score: "5 of 11",
    findings: ["Seasonal pages deindexed", "No pricing signal of any kind"],
    aiSignal: "Named 1 of 6",
    opportunity: 68, confidence: "MEDIUM",
    next: "Proposal sent, awaiting reply",
    owner: "PHOENIX", status: "OPPORTUNITY",
  },
  {
    company: "Larkspur Veterinary", domain: "larkspur-vet.example",
    contact: "care@larkspur-vet.example", source: "OBSERVED_AI_REFERRER",
    landing: "/geo/", health: "HEALTHY", score: "9 of 11",
    findings: ["Emergency-hours page is the only weak surface"],
    aiSignal: "Named 6 of 6",
    opportunity: 55, confidence: "HIGH",
    next: "Won. Onboarding scheduled",
    owner: "CLYDE", status: "WON",
  },
  {
    company: "Copperfield Auto Body", domain: "copperfield-auto.example",
    contact: "service@copperfield-auto.example", source: "DIRECT_OR_UNKNOWN",
    landing: "/audit/", health: "CRITICAL", score: "4 of 11",
    findings: ["Contact details differ across four directories"],
    aiSignal: "Named 1 of 6 with the wrong phone number",
    opportunity: 79, confidence: "MEDIUM",
    next: "Lost to an in-house hire. Revisit in two quarters",
    owner: "UNASSIGNED", status: "LOST",
  },
];

/* ---- section 8: client monitoring -------------------------------------- */

/* The five truth states. NEVER is the one most dashboards quietly omit, and it
 * is the one that matters most: a metric that has never been measured is not a
 * zero, and drawing it as a zero invents a data point. */
export const TRUTH_STATES = {
  CURRENT: { label: "Current", note: "Measured in the last scheduled run" },
  STALE:   { label: "Stale",   note: "Last successful measurement is older than the cadence" },
  PARTIAL: { label: "Partial", note: "Some checks returned, some did not. The denominator shrinks" },
  FAILED:  { label: "Failed",  note: "The run executed and could not produce a verdict" },
  NEVER:   { label: "Never",   note: "Never successfully measured. Not a zero" },
};

export const DEMO_CLIENT = {
  name: "Verdigris Roofing Co",
  domain: "verdigris-roofing.example",
  cadence: "Weekly, Mondays 06:15 UTC",
  lastRun: "2026-08-24 06:15 UTC",
  nextRun: "2026-08-31 06:15 UTC",
};

export const OVERVIEW_TILES = [
  { label: "Answer presence", value: "2 of 6", state: "CURRENT", note: "Sampled category questions naming the client" },
  { label: "Retrieval health", value: "9 of 11", state: "CURRENT", note: "Infrastructure checks passing" },
  { label: "Cited pages", value: "3", state: "PARTIAL", note: "One source could not be re-read this run" },
  { label: "Competitor gap", value: "Not measured", state: "NEVER", note: "Competitor sampling not enabled on this plan" },
];

export const VISIBILITY_ROWS = [
  { q: "best roofing contractor near me", named: true,  pos: "2nd of 3 named", state: "CURRENT" },
  { q: "emergency roof repair cost", named: false, pos: "Not named", state: "CURRENT" },
  { q: "metal vs asphalt roof which lasts longer", named: true, pos: "1st of 4 named", state: "CURRENT" },
  { q: "roof inspection before buying a house", named: false, pos: "Not named", state: "CURRENT" },
  { q: "storm damage roof insurance claim help", named: false, pos: "Not measured", state: "FAILED" },
  { q: "gutter replacement local", named: null, pos: "Not measured", state: "NEVER" },
];

export const CITATIONS = [
  { url: "/services/metal-roofing/", surface: "Perplexity", state: "CURRENT", first: "2026-07-14" },
  { url: "/guides/roof-lifespan/", surface: "Perplexity", state: "CURRENT", first: "2026-06-30" },
  { url: "/about/", surface: "ChatGPT", state: "STALE", first: "2026-05-02" },
  { url: "/services/storm-damage/", surface: "Gemini", state: "NEVER", first: null },
];

export const INFRA_CHECKS = [
  { name: "Server-rendered business name", ok: true,  state: "CURRENT" },
  { name: "Organization schema present", ok: true,  state: "CURRENT" },
  { name: "Service area stated in text", ok: true,  state: "CURRENT" },
  { name: "Opening hours machine-readable", ok: true,  state: "CURRENT" },
  { name: "Review markup valid", ok: false, state: "CURRENT" },
  { name: "Consistent NAP across directories", ok: false, state: "CURRENT" },
  { name: "Sitemap reachable", ok: true,  state: "CURRENT" },
  { name: "robots.txt allows search agents", ok: false, state: "CURRENT" },
  { name: "Canonical tags consistent", ok: true,  state: "CURRENT" },
  { name: "Core content in HTML, not JS-only", ok: true,  state: "CURRENT" },
  { name: "llms.txt served", ok: null, state: "PARTIAL" },
];

/* ---- section 9: frontier intelligence ---------------------------------- */

/* Each row is a full chain. The rule the shape enforces: an OBSERVATION is not
 * a DIAGNOSIS, and neither is a claim about cause. REMEASURE is what closes the
 * loop, and until it returns, an intervention has no proven effect. */
export const INTELLIGENCE = [
  {
    observation: "Search-agent user agents received 403 on every request for 9 days",
    diagnosis: "A WAF managed rule set is challenging non-browser clients, so retrieval never reaches the page",
    opportunity: "Restore search-agent accessibility across the whole site",
    recommendation: "Allow the documented retrieval user agents in the WAF rule, keep the training-crawler rule as-is",
    intervention: "COMPLETED 2026-08-18",
    remeasure: "AWAITING next scheduled run 2026-08-31",
    confidence: "HIGH",
    caution: "Access was restored. Whether citations follow is not yet measured.",
  },
  {
    observation: "Review markup fails validation on 14 service pages",
    diagnosis: "The review widget writes its markup after hydration, so it is absent from the served HTML",
    opportunity: "Make review signal readable without executing JavaScript",
    recommendation: "Render the aggregate rating server-side alongside the widget",
    intervention: "PENDING client approval",
    remeasure: "NOT SCHEDULED",
    confidence: "MEDIUM",
    caution: "Observation only. No claim that this is what suppresses answer presence.",
  },
  {
    observation: "Business phone number differs across four directory listings",
    diagnosis: "Two legacy listings were never updated after the 2025 number change",
    opportunity: "Remove the contradictory phone signal",
    recommendation: "Correct the two stale listings, then re-check the aggregators that syndicate them",
    intervention: "IN PROGRESS",
    remeasure: "AWAITING next scheduled run 2026-08-31",
    confidence: "HIGH",
    caution: "One AI answer was seen quoting the old number. One observation is not a rate.",
  },
];

export const REPORTS = [
  { period: "August 2026", state: "PARTIAL", note: "One of four weekly runs failed. Reported as three of four, not averaged over four." },
  { period: "July 2026", state: "CURRENT", note: "All four weekly runs returned" },
  { period: "June 2026", state: "CURRENT", note: "All four weekly runs returned" },
  { period: "May 2026", state: "NEVER", note: "Monitoring began 2026-06-01. No data exists for this period" },
];

export const SERVICE_HEALTH = [
  { name: "Scheduled measurement run", state: "CURRENT", detail: "Last completed 2026-08-24 06:15 UTC" },
  { name: "Answer sampling", state: "CURRENT", detail: "6 questions sampled per run on this plan" },
  { name: "Citation discovery", state: "PARTIAL", detail: "One source timed out on the last run" },
  { name: "Competitor sampling", state: "NEVER", detail: "Not enabled on this plan" },
  { name: "Alerting", state: "STALE", detail: "No alert delivered since 2026-08-03" },
];
