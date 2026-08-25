/**
 * Lead capture. Separate endpoint, separate stream, on purpose.
 *
 * /api/event is anonymous by construction and refuses to carry a person.
 * This endpoint carries a person, because a visitor deliberately handed one
 * over. Keeping them apart is what lets the anonymous stream stay honestly
 * anonymous instead of "anonymous except when it isn't".
 *
 * It structured-logs the record in the shape the sales side agreed to and
 * stores nothing. It is NOT a prospect database: the system of record for
 * prospects is the Citability agency backend, and standing up a second one
 * here would be the thing we most need not to do.
 *
 * OPEN ITEM (reported, not hidden): a log is a fragile place for a lead. The
 * durable sink is one operator decision away and is the last piece of this
 * funnel. Until it lands, the on-page copy promises only a human reply, which
 * is a promise a log CAN keep as long as somebody reads the log.
 */

/** Whoever picks the lead up. UNASSIGNED until a human claims it. */
const OWNERS = new Set(["PHOENIX", "CLYDE", "UNASSIGNED"]);

const str = (v, max = 256) =>
  typeof v === "string" && v.trim().length ? v.trim().slice(0, max) : null;

export async function onRequestPost(context) {
  let body;
  try {
    body = await context.request.json();
  } catch {
    return new Response(JSON.stringify({ ok: false, error: "BAD_JSON" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const contact = str(body?.contact, 160);
  if (!contact || contact.indexOf("@") < 1) {
    return new Response(JSON.stringify({ ok: false, error: "CONTACT_REQUIRED" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const a = body?.attribution || {};

  /* The §10 contract, field for field. A field nobody supplied is null, never
   * a plausible-looking default: an invented COMPANY is worse to a salesperson
   * than an empty one, because an empty one tells them to go and find out. */
  const record = {
    kind: "FOWNED_LEAD",
    DOMAIN: str(body?.domain, 253),
    COMPANY: str(body?.company, 160),
    CONTACT: contact,
    CONTACT_NAME: str(body?.name, 120),
    MESSAGE: str(body?.message, 2000),
    SOURCE: str(a?.source, 48) || "DIRECT_OR_UNKNOWN",
    LANDING_PAGE: str(a?.landingPath, 256),
    AUDIT_COMPLETED: Boolean(body?.auditCompleted),
    KEY_AUDIT_FINDINGS: Array.isArray(body?.findings)
      ? body.findings.slice(0, 6).map((f) => str(f, 200)).filter(Boolean)
      : [],
    BOOKING_CLICK: Boolean(body?.bookingClick),
    OWNER: OWNERS.has(body?.owner) ? body.owner : "UNASSIGNED",
    STATUS: "NEW",
    TIMESTAMP: new Date().toISOString(),
  };

  console.log("FOWNED_LEAD " + JSON.stringify(record));

  return new Response(JSON.stringify({ ok: true, owner: record.OWNER }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

export const onRequestGet = () =>
  new Response("Fowned lead intake. POST only.\n", {
    status: 405,
    headers: { "Content-Type": "text/plain; charset=utf-8", Allow: "POST" },
  });
