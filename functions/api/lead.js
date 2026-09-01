/**
 * POST /api/lead  ->  Fownd lead intake.
 *
 * Two sinks, and they fail differently on purpose.
 *
 *   1. D1 (env.fowned_leads) is AUTHORITATIVE. If the row does not land, the
 *      visitor gets a 5xx and their form tells them to try again. Returning
 *      {ok:true} on a failed write is how the previous version lost every lead
 *      it ever received: it logged to console, Cloudflare Pages keeps no log
 *      history, and the visitor was told someone would reply.
 *
 *   2. Email (Resend) is a NOTIFICATION. A lead already on disk is not lost
 *      because a mail API had a bad minute, so a send failure is recorded in
 *      the row (notified / notify_error) and never fails the request. The
 *      idx_leads_unnotified index makes "which leads did nobody hear about"
 *      one query rather than a scan somebody has to remember to run.
 *
 * Env, all set as Pages secrets and NOT in wrangler.toml, deliberately:
 *   RESEND_API_KEY    transactional send
 *   LEAD_NOTIFY_FROM  verified sender
 *   LEAD_NOTIFY_TO    comma-separated recipients
 * Missing any of them degrades to store-only, which is still better than the
 * behaviour this replaces.
 */

/** Whoever picks the lead up. UNASSIGNED until a human claims it. */
const OWNERS = new Set(["PHOENIX", "CLYDE", "UNASSIGNED"]);

const str = (v, max = 256) =>
  typeof v === "string" && v.trim().length ? v.trim().slice(0, max) : null;

const json = (payload, status) =>
  new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json" },
  });

/** Plain text, because a lead alert is read on a phone in three seconds. */
function notificationBody(record) {
  const lines = [
    `Company:  ${record.COMPANY || "-"}`,
    `Domain:   ${record.DOMAIN || "-"}`,
    `Name:     ${record.CONTACT_NAME || "-"}`,
    `Email:    ${record.CONTACT}`,
    ``,
    `Source:   ${record.SOURCE}`,
    `Landed:   ${record.LANDING_PAGE || "-"}`,
    `Audit:    ${record.AUDIT_COMPLETED ? "completed on site" : "not run"}`,
    `Booking:  ${record.BOOKING_CLICK ? "clicked" : "no"}`,
    `Owner:    ${record.OWNER}`,
    `Time:     ${record.TIMESTAMP}`,
  ];
  if (record.KEY_AUDIT_FINDINGS.length) {
    lines.push(``, `Findings the visitor saw:`);
    for (const f of record.KEY_AUDIT_FINDINGS) lines.push(`  - ${f}`);
  }
  if (record.MESSAGE) lines.push(``, `Message:`, record.MESSAGE);
  return lines.join("\n");
}

async function notify(env, record) {
  const key = env.RESEND_API_KEY;
  const from = env.LEAD_NOTIFY_FROM;
  const to = (env.LEAD_NOTIFY_TO || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (!key || !from || !to.length) return "NOTIFY_NOT_CONFIGURED";

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to,
      reply_to: record.CONTACT,
      subject: `Fownd lead: ${record.COMPANY || record.DOMAIN || record.CONTACT}`,
      text: notificationBody(record),
    }),
  });

  if (!res.ok) return `RESEND_${res.status}: ${(await res.text()).slice(0, 400)}`;
  return null;
}

export async function onRequestPost(context) {
  let body;
  try {
    body = await context.request.json();
  } catch {
    return json({ ok: false, error: "BAD_JSON" }, 400);
  }

  const contact = str(body?.contact, 160);
  if (!contact || contact.indexOf("@") < 1) {
    return json({ ok: false, error: "CONTACT_REQUIRED" }, 400);
  }

  const a = body?.attribution || {};

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

  const db = context.env.fowned_leads;
  if (!db) {
    // The binding is missing, so there is nowhere durable to put this. Say so
    // rather than accepting the lead and dropping it.
    console.log("FOWNED_LEAD_NO_BINDING " + JSON.stringify(record));
    return json({ ok: false, error: "STORE_UNAVAILABLE" }, 503);
  }

  let id;
  try {
    const stored = await db
      .prepare(
        `INSERT INTO leads
           (domain, company, contact, contact_name, message, source,
            landing_page, audit_completed, key_audit_findings, booking_click,
            owner, status, timestamp)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         RETURNING id`
      )
      .bind(
        record.DOMAIN,
        record.COMPANY,
        record.CONTACT,
        record.CONTACT_NAME,
        record.MESSAGE,
        record.SOURCE,
        record.LANDING_PAGE,
        record.AUDIT_COMPLETED ? 1 : 0,
        JSON.stringify(record.KEY_AUDIT_FINDINGS),
        record.BOOKING_CLICK ? 1 : 0,
        record.OWNER,
        record.STATUS,
        record.TIMESTAMP
      )
      .first();
    id = stored?.id;
  } catch (err) {
    console.log("FOWNED_LEAD_STORE_FAILED " + String(err) + " " + JSON.stringify(record));
    return json({ ok: false, error: "STORE_FAILED" }, 503);
  }

  // The lead is safe from here on. Everything below is best effort.
  let notifyError = null;
  try {
    notifyError = await notify(context.env, record);
  } catch (err) {
    notifyError = String(err).slice(0, 400);
  }

  try {
    await db
      .prepare(`UPDATE leads SET notified = ?, notify_error = ? WHERE id = ?`)
      .bind(notifyError ? 0 : 1, notifyError, id)
      .run();
  } catch {
    // A lost flag is not worth failing a stored lead over.
  }

  console.log("FOWNED_LEAD " + JSON.stringify({ ...record, ID: id, NOTIFY_ERROR: notifyError }));

  return json({ ok: true, owner: record.OWNER }, 200);
}

export const onRequestGet = () =>
  new Response("Fownd lead intake. POST only.\n", {
    status: 405,
    headers: { "Content-Type": "text/plain; charset=utf-8", Allow: "POST" },
  });
