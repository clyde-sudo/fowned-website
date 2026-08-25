/**
 * First-party acquisition telemetry sink.
 *
 * Deliberately the smallest thing that is genuinely observable: it validates,
 * redacts and structured-logs. It does NOT store. Reading the stream is
 * `wrangler pages deployment tail --project-name fowned` or the Workers Logs
 * view in the Cloudflare dashboard.
 *
 * The reason it stores nothing is not laziness, it is scope. A durable store
 * for these events is a product decision (retention, access, who owns the
 * record) and the system of record for customer telemetry already exists in
 * the Citability backend. Standing up a second one here to have somewhere to
 * put a page_view would be the expensive mistake.
 *
 * PRIVACY: the allowlist below is exhaustive. Anything a client sends that is
 * not on it is dropped rather than logged, so a future edit to the client
 * cannot quietly start logging an email address by adding a field.
 */

/** The closed event vocabulary. An unknown name is dropped, not logged. */
const EVENTS = new Set([
  "page_view",
  "cta_click",
  "audit_start",
  "audit_complete",
  "lead_start",
  "lead_submit",
  "booking_click",
]);

/** The closed source vocabulary. Mirrors js/instrument.js. */
const SOURCES = new Set([
  "GOOGLE_ORGANIC",
  "BING_ORGANIC",
  "OBSERVED_AI_REFERRER",
  "OTHER_REFERRER",
  "DIRECT_OR_UNKNOWN",
]);

const str = (v, max = 256) =>
  typeof v === "string" && v.length ? v.slice(0, max) : null;

export async function onRequestPost(context) {
  let body;
  try {
    body = await context.request.json();
  } catch {
    return new Response(null, { status: 204 });
  }

  const name = str(body?.event, 64);
  if (!name || !EVENTS.has(name)) return new Response(null, { status: 204 });

  const a = body?.attribution || {};
  const source = SOURCES.has(a?.source) ? a.source : "DIRECT_OR_UNKNOWN";

  /* Evidence travels with the source, always. A missing Referer is UNKNOWN and
   * must never be reported as "direct": AI surfaces strip the header, so
   * collapsing the two would quietly convert unmeasured traffic into a
   * measured claim about where visitors came from. */
  const evidence = source === "DIRECT_OR_UNKNOWN" ? "UNKNOWN" : "OBSERVED";

  const record = {
    ev: name,
    at: new Date().toISOString(),
    path: str(body?.path, 256),
    label: str(body?.detail?.label, 128),
    state: str(body?.detail?.state, 32),
    landing: str(a?.landingPath, 256),
    referrer: str(a?.referrer, 256),
    source,
    evidence,
    utm_source: str(a?.utmSource, 64),
    utm_medium: str(a?.utmMedium, 64),
    utm_campaign: str(a?.utmCampaign, 64),
    utm_content: str(a?.utmContent, 64),
    /* Country only. Cloudflare offers city and coordinates on the same object;
     * they are not collected, because nothing in this funnel needs them and
     * they narrow a visitor far more than the analysis is worth. */
    country: context.request.cf?.country || null,
  };

  console.log("FOWNED_EVENT " + JSON.stringify(record));
  return new Response(null, { status: 204 });
}

/* A GET is a human or a scanner poking the endpoint, not a client. Say so
 * plainly rather than 405-ing, so the surface is self-describing in a QA pass. */
export const onRequestGet = () =>
  new Response("Fowned first-party event sink. POST only. Nothing is stored.\n", {
    status: 405,
    headers: { "Content-Type": "text/plain; charset=utf-8", Allow: "POST" },
  });
