/**
 * First-party acquisition telemetry sink.
 *
 * Validates against a closed vocabulary, redacts, then stores to D1
 * (env.fowned_leads, table `events`). It used to only console.log, on the
 * argument that a durable store was a product decision not yet made. That
 * argument is settled: Cloudflare Pages keeps no log history, so the previous
 * version was not deferring the decision, it was discarding the data.
 *
 * Volume: this fires on every page view, so the write is deliberately cheap
 * and deliberately non-blocking. It runs in waitUntil, after the 204 has
 * already gone back to the client, because a beacon sent during page unload
 * must never wait on a database. A failed insert is swallowed for the same
 * reason: analytics that can break a page is worse than analytics with a gap.
 *
 * PRIVACY: the allowlist below is exhaustive, and the table mirrors it. What
 * is not on the list is dropped rather than stored, so a future edit to the
 * client cannot quietly start recording an email address by adding a field.
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
  "lead_success",
  "outbound_click",
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

  /* The client is answered first. Storage happens after, in the background,
   * and its failure is invisible on purpose: see the volume note at the top. */
  const db = context.env.fowned_leads;
  if (db) {
    context.waitUntil(
      db
        .prepare(
          `INSERT INTO events
             (ev, at, path, label, state, landing, referrer, source, evidence,
              utm_source, utm_medium, utm_campaign, utm_content, country)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
        .bind(
          record.ev,
          record.at,
          record.path,
          record.label,
          record.state,
          record.landing,
          record.referrer,
          record.source,
          record.evidence,
          record.utm_source,
          record.utm_medium,
          record.utm_campaign,
          record.utm_content,
          record.country
        )
        .run()
        .catch((err) => {
          console.log("FOWNED_EVENT_STORE_FAILED " + String(err));
        })
    );
  }

  console.log("FOWNED_EVENT " + JSON.stringify(record));
  return new Response(null, { status: 204 });
}

/* A GET is a human or a scanner poking the endpoint, not a client. Say so
 * plainly rather than 405-ing, so the surface is self-describing in a QA pass. */
export const onRequestGet = () =>
  new Response("Fowned first-party event sink. POST only.\n", {
    status: 405,
    headers: { "Content-Type": "text/plain; charset=utf-8", Allow: "POST" },
  });
