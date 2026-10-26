/**
 * POST /api/lead  ->  Fowned lead intake.
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
 *   LEAD_NOTIFY_FROM  sender; unset falls back to DEFAULT_NOTIFY_FROM
 *   LEAD_NOTIFY_TO    comma-separated recipients
 * Missing any of them degrades to store-only, which is still better than the
 * behaviour this replaces.
 *
 *   SLACK_WEBHOOK_URL      optional. One or MORE comma-separated Slack Incoming
 *                          Webhooks. One webhook reaches one channel in one
 *                          workspace, so two watchers in different workspaces
 *                          need two URLs. Unset makes the Slack path a silent
 *                          no-op, so this file behaves exactly as it did before
 *                          with or without Slack.
 *   SLACK_NOTIFY_MENTIONS  optional. Comma-separated Slack MEMBER IDs (the
 *                          `U…`/`W…` string from a profile, NOT a display name;
 *                          a name renders as literal text and pings nobody).
 *                          Rendered as <@U…> so named people get a real
 *                          notification instead of relying on channel-watching.
 *
 *   TURNSTILE_SECRET_KEY  optional. Set it and the bot challenge is enforced;
 *                         leave it unset and the challenge is skipped entirely
 *                         (see the gate comments below).
 */

import { leadAlertEmail, auditStatus } from "../../src/email.mjs";

/** Whoever picks the lead up. UNASSIGNED until a human claims it; a free-audit
 * request starts as CHUDI, who produces audits. */
const OWNERS = new Set(["PHOENIX", "CLYDE", "CHUDI", "UNASSIGNED"]);

/* js/audit.js opens every free-audit request with this sentence. It is the only
 * sign that a person now owes this lead an audit within 2 business days.
 * Exported so tests/audit-marker.test.mjs can hold the two files to it. */
export const AUDIT_REQUEST_MARKER = "Free audit request.";

/**
 * MM/DD/YYYY, 2 business days after `now`, counted on the Pacific calendar.
 * ponytail: weekends are skipped, public holidays are not; add a holiday list
 * if a due date ever lands on one.
 */
export function auditDueDate(now = new Date()) {
  const [m, d, y] = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Los_Angeles", year: "numeric", month: "2-digit", day: "2-digit",
  }).format(now).split("/");
  const t = new Date(Date.UTC(+y, +m - 1, +d));
  for (let left = 2; left > 0; ) {
    t.setUTCDate(t.getUTCDate() + 1);
    if (t.getUTCDay() % 6 !== 0) left--;
  }
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(t.getUTCMonth() + 1)}/${pad(t.getUTCDate())}/${t.getUTCFullYear()}`;
}

const str = (v, max = 256) =>
  typeof v === "string" && v.trim().length ? v.trim().slice(0, max) : null;

const json = (payload, status) =>
  new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json" },
  });

/* The only domain verified in Resend today. A fowned.live sender needs its DNS
 * records first; after that, setting LEAD_NOTIFY_FROM is the whole switch. */
export const DEFAULT_NOTIFY_FROM = "leads@citability.dev";

async function notify(env, record) {
  const key = env.RESEND_API_KEY;
  const from = env.LEAD_NOTIFY_FROM || DEFAULT_NOTIFY_FROM;
  const to = (env.LEAD_NOTIFY_TO || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (!key || !from || !to.length) return "NOTIFY_NOT_CONFIGURED";

  /* Built by src/email.mjs, the only place a Fowned email body is composed.
   * html and text are the same facts, not a rich version and a lesser one. */
  const mail = leadAlertEmail(record);

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to,
      reply_to: record.CONTACT.includes("@") ? record.CONTACT : undefined,
      subject: mail.subject,
      html: mail.html,
      text: mail.text,
    }),
  });

  if (!res.ok) return `RESEND_${res.status}: ${(await res.text()).slice(0, 400)}`;
  return null;
}

/**
 * Slack's documented mrkdwn escape set.
 *
 * This is a trust boundary, not cosmetics. Every field below reaches us from a
 * public form, and `<https://evil.example|Approve invoice>` is VALID mrkdwn: an
 * unescaped company name renders in the team's own channel as a disguised
 * clickable link that looks like it came from us. Escaping these three
 * characters kills link and mention syntax. Residual `*`/`_` are cosmetic only
 * and deliberately left alone.
 */
export function esc(v) {
  return String(v == null ? "" : v)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Build the Slack card. Split out from the POST so it is callable, and
 * therefore testable, without a webhook or a network (tools/slack-card-test.mjs).
 *
 * Shape is chosen for a phone: who + how to reach them first, context second,
 * the visitor's own words last. The mentions line is separate from the body so
 * an unset SLACK_NOTIFY_MENTIONS changes nothing else about the card.
 */
export function slackCard(record, mentionIds) {
  const who = record.BOOKING_FROM
    ? `Booking: scheduled from ${record.BOOKING_FROM}`
    : record.COMPANY || record.DOMAIN || record.CONTACT;
  const heat = record.AUDIT_COMPLETED ? "\u{1F525}" : "\u{1F4E5}";

  const facts = [
    record.DOMAIN ? `*Domain:* ${esc(record.DOMAIN)}` : null,
    `*${record.CONTACT.includes("@") ? "Email" : "Invitee"}:* ${esc(record.CONTACT)}`,
    record.CONTACT_NAME ? `*Name:* ${esc(record.CONTACT_NAME)}` : null,
    `*Source:* ${esc(record.SOURCE)}`,
    record.LANDING_PAGE ? `*Landed:* ${esc(record.LANDING_PAGE)}` : null,
    auditStatus(record) ? `*Audit:* ${auditStatus(record)}` : null,
    record.BOOKING_FROM
      ? `*Booking:* scheduled from ${esc(record.BOOKING_FROM)}`
      : record.BOOKING_CLICK ? "*Booking:* clicked" : null,
    `*Owner:* ${esc(record.OWNER)}`,
  ].filter(Boolean);

  const blocks = [
    {
      type: "section",
      text: { type: "mrkdwn", text: `${heat} *New Fowned lead:* ${esc(who)}` },
    },
    { type: "section", text: { type: "mrkdwn", text: facts.join("\n") } },
  ];

  if (record.KEY_AUDIT_FINDINGS.length) {
    blocks.push({
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text:
            "*They saw:* " +
            record.KEY_AUDIT_FINDINGS.map((f) => esc(f)).join(" \u00b7 "),
        },
      ],
    });
  }

  if (record.MESSAGE) {
    blocks.push({
      type: "context",
      elements: [{ type: "mrkdwn", text: `\u201c${esc(record.MESSAGE)}\u201d` }],
    });
  }

  if (mentionIds.length) {
    blocks.push({
      type: "context",
      elements: [
        { type: "mrkdwn", text: mentionIds.map((id) => `<@${id}>`).join(" ") },
      ],
    });
  }

  return {
    // Fallback text is what a phone lock screen and a screen reader get, so it
    // has to stand alone rather than say "New lead" and hide the detail in
    // blocks nothing in that path renders. It is ALSO rendered as mrkdwn, so it
    // needs the same escaping as the blocks: this line shipped unescaped once
    // and tools/slack-card-test.mjs is what caught it.
    text: `New Fowned lead: ${esc(who)} (${esc(record.CONTACT)})`,
    blocks,
  };
}

/**
 * Post the card. Same contract as notify(): returns null on success or a short
 * reason string, never throws, and never blocks the visitor's response for more
 * than the timeout. A Slack outage must not cost a lead.
 */
export async function notifySlack(env, record) {
  /* Comma-separated, because ONE incoming webhook reaches exactly one channel
   * in one workspace. Fowned's two watchers do not necessarily share a
   * workspace, and the single-URL version of this quietly served whichever of
   * them happened to be in the workspace the webhook was minted in. A list is
   * the difference between "both are notified" and "one is, and nothing says
   * which". */
  const urls = (env.SLACK_WEBHOOK_URL || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (!urls.length) return "SLACK_NOT_CONFIGURED";

  const mentionIds = (env.SLACK_NOTIFY_MENTIONS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const body = JSON.stringify(slackCard(record, mentionIds));

  const results = await Promise.allSettled(
    urls.map((url) =>
      fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        signal: AbortSignal.timeout(5000),
      }).then(async (res) =>
        // Slack answers a webhook with a plain-text body ("ok" /
        // "invalid_payload"), not JSON, and a revoked webhook is a 403 with
        // "no_service". Carrying that word out is the difference between a
        // five-second diagnosis and re-reading this file.
        res.ok ? null : `${res.status}: ${(await res.text()).slice(0, 120)}`
      )
    )
  );

  /* Report by INDEX, never by URL: a webhook URL is a credential, and
   * notify_error is stored in D1 and read in a terminal. "webhook 2 of 2
   * failed" is enough to act on and leaks nothing. */
  const errors = results
    .map((r, i) => {
      const reason = r.status === "fulfilled" ? r.value : String(r.reason).slice(0, 120);
      return reason ? `webhook ${i + 1}/${urls.length} ${reason}` : null;
    })
    .filter(Boolean);

  return errors.length ? errors.join("; ") : null;
}

/**
 * Three cheap gates, in cost order, all of them BEFORE the database is touched.
 *
 *   1. Honeypot. A field real people never see and never fill. A bot that
 *      posts every input it finds fills it, and gets a 200 with nothing
 *      stored, so it has no failure to learn from.
 *   2. Origin. A browser attaches Origin to a cross-site POST and cannot forge
 *      it. A request with a foreign Origin is somebody else's page posting
 *      into our database. A request with NO Origin is curl, which is how the
 *      deploy proof (tools/notify-test.sh) submits, so absence is allowed
 *      deliberately: this stops embedded abuse, not scripted abuse. The
 *      honeypot and Turnstile are what cover the scripted case.
 *   3. Turnstile, only when TURNSTILE_SECRET_KEY is set. Unset means the keys
 *      have not been minted yet, and a challenge that cannot be verified must
 *      not reject real enquiries, so it stays off rather than failing closed.
 */
function originAllowed(request) {
  const origin = request.headers.get("Origin");
  if (!origin) return true;
  try {
    return new URL(origin).host === new URL(request.url).host;
  } catch {
    return false;
  }
}

async function turnstileOk(env, token, ip) {
  const secret = env.TURNSTILE_SECRET_KEY;
  if (!secret) return true; // not configured yet, so not enforced
  if (!token) return false;
  const form = new FormData();
  form.append("secret", secret);
  form.append("response", token);
  if (ip) form.append("remoteip", ip);
  try {
    const res = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      { method: "POST", body: form }
    );
    const out = await res.json();
    return Boolean(out.success);
  } catch {
    // Cloudflare's own verifier being unreachable is our outage, not the
    // visitor's fault. Let the lead through rather than lose it.
    return true;
  }
}

/* A Calendly booking is reported by the visitor's browser, so these are the
 * only shapes accepted: the invitee must belong to the event it came with. */
const EVENT_URI = /^https:\/\/api\.calendly\.com\/scheduled_events\/([A-Za-z0-9-]{8,64})$/;
const INVITEE_URI = /^https:\/\/api\.calendly\.com\/scheduled_events\/([A-Za-z0-9-]{8,64})\/invitees\/[A-Za-z0-9-]{8,64}$/;

/** More than 10 posts from one IP in 10 minutes gets a 429. Counted in D1 so the
 * limit holds across Pages isolates. Fails open: a counter that cannot be read
 * must not cost a real lead. */
const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 10 * 60 * 1000;
async function rateLimited(db, ip) {
  if (!db || !ip) return false;
  try {
    const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(ip));
    const ipHash = [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
    const since = new Date(Date.now() - RATE_WINDOW_MS).toISOString();
    await db.prepare("DELETE FROM lead_posts WHERE at < ?").bind(since).run();
    const row = await db
      .prepare("SELECT COUNT(*) AS n FROM lead_posts WHERE ip_hash = ? AND at >= ?")
      .bind(ipHash, since)
      .first();
    if ((row?.n ?? 0) >= RATE_LIMIT) return true;
    await db.prepare("INSERT INTO lead_posts (ip_hash, at) VALUES (?, ?)").bind(ipHash, new Date().toISOString()).run();
  } catch {
    return false;
  }
  return false;
}

export async function onRequestPost(context) {
  const ip = context.request.headers.get("CF-Connecting-IP");
  if (await rateLimited(context.env.fowned_leads, ip)) {
    return json({ ok: false, error: "RATE_LIMITED" }, 429);
  }

  let body;
  try {
    body = await context.request.json();
  } catch {
    return json({ ok: false, error: "BAD_JSON" }, 400);
  }

  // Honeypot: answered means a bot. 200 so it learns nothing, no row written.
  if (str(body?.company_url, 256)) {
    return json({ ok: true, owner: "UNASSIGNED" }, 200);
  }

  if (!originAllowed(context.request)) {
    return json({ ok: false, error: "BAD_ORIGIN" }, 403);
  }

  const a = body?.attribution || {};
  const booking = body?.kind === "BOOKING_SCHEDULED";
  let eventUri = null;
  let inviteeUri = null;
  let bookingFrom = null;

  if (booking) {
    /* No Turnstile token exists for a booking (the visitor passed Calendly,
     * not our form), so the Origin header is required here instead of merely
     * checked. Name and email are never read from the post: Calendly holds
     * them, and Clyde reads them there. */
    if (!context.request.headers.get("Origin")) {
      return json({ ok: false, error: "BAD_ORIGIN" }, 403);
    }
    eventUri = str(body?.eventUri, 256);
    inviteeUri = str(body?.inviteeUri, 320);
    bookingFrom = str(body?.pagePath, 256);
    const ev = eventUri && EVENT_URI.exec(eventUri);
    const inv = inviteeUri && INVITEE_URI.exec(inviteeUri);
    if (!ev || !inv || ev[1] !== inv[1] || !bookingFrom || !bookingFrom.startsWith("/") || bookingFrom.startsWith("//")) {
      return json({ ok: false, error: "BAD_BOOKING" }, 400);
    }
  } else if (!(await turnstileOk(context.env, str(body?.turnstileToken, 2048), ip))) {
    return json({ ok: false, error: "CHALLENGE_FAILED" }, 403);
  }

  const contact = booking ? inviteeUri : str(body?.contact, 160);
  if (!booking && (!contact || contact.indexOf("@") < 1)) {
    return json({ ok: false, error: "CONTACT_REQUIRED" }, 400);
  }

  const message = booking ? `Booking: scheduled from ${bookingFrom}.` : str(body?.message, 2000);
  const auditRequest = Boolean(message && message.startsWith(AUDIT_REQUEST_MARKER));

  const record = {
    kind: booking ? "BOOKING_SCHEDULED" : "FOWNED_LEAD",
    DOMAIN: booking ? null : str(body?.domain, 253),
    COMPANY: booking ? null : str(body?.company, 160),
    CONTACT: contact,
    CONTACT_NAME: booking ? null : str(body?.name, 120),
    MESSAGE: message,
    SOURCE: str(a?.source, 48) || "DIRECT_OR_UNKNOWN",
    LANDING_PAGE: str(a?.landingPath, 256),
    AUDIT_COMPLETED: Boolean(body?.auditCompleted),
    KEY_AUDIT_FINDINGS: !booking && Array.isArray(body?.findings)
      ? body.findings.slice(0, 6).map((f) => str(f, 200)).filter(Boolean)
      : [],
    BOOKING_CLICK: booking || Boolean(body?.bookingClick),
    BOOKING_FROM: bookingFrom,
    EVENT_URI: eventUri,
    AUDIT_DUE: auditRequest ? auditDueDate() : null,
    OWNER: booking ? "CLYDE" : OWNERS.has(body?.owner) ? body.owner : auditRequest ? "CHUDI" : "UNASSIGNED",
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

  if (booking) {
    const dupe = await db.prepare("SELECT id FROM leads WHERE event_uri = ?").bind(eventUri).first().catch(() => null);
    if (dupe) return json({ ok: false, error: "DUPLICATE_BOOKING" }, 409);
  }

  let id;
  try {
    const stored = await db
      .prepare(
        `INSERT INTO leads
           (domain, company, contact, contact_name, message, source,
            landing_page, audit_completed, key_audit_findings, booking_click,
            owner, status, timestamp, kind, event_uri, invitee_uri)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
        record.TIMESTAMP,
        record.kind,
        eventUri,
        inviteeUri
      )
      .first();
    id = stored?.id;
  } catch (err) {
    // Two tabs racing past the pre-check land here, on the unique index.
    if (booking && /UNIQUE/i.test(String(err))) {
      return json({ ok: false, error: "DUPLICATE_BOOKING" }, 409);
    }
    console.log("FOWNED_LEAD_STORE_FAILED " + String(err) + " " + JSON.stringify(record));
    return json({ ok: false, error: "STORE_FAILED" }, 503);
  }

  // The lead is safe from here on. Everything below is best effort.
  //
  // Two independent channels, run CONCURRENTLY. Sequentially they would stack
  // their timeouts onto the visitor's wait for a form that has already done its
  // job. Neither can reject the other's promise, because allSettled is what is
  // being awaited, so one channel being down cannot suppress the other.
  const [mailed, slacked] = await Promise.allSettled([
    notify(context.env, record),
    notifySlack(context.env, record),
  ]);
  const reason = (r) =>
    r.status === "fulfilled" ? r.value : String(r.reason).slice(0, 400);
  const emailError = reason(mailed);
  const slackError = reason(slacked);

  /* `notified` answers one question: did ANY human hear about this lead? So a
   * Slack card landing is enough to clear it even when email is down, and the
   * idx_leads_unnotified index keeps meaning what its name says. The prefixes
   * matter because "which channel failed" is otherwise unrecoverable from a
   * single column. */
  const heard = !emailError || !slackError;
  const notifyError =
    [
      emailError ? `EMAIL ${emailError}` : null,
      slackError ? `SLACK ${slackError}` : null,
    ]
      .filter(Boolean)
      .join(" | ") || null;

  try {
    await db
      .prepare(`UPDATE leads SET notified = ?, notify_error = ? WHERE id = ?`)
      .bind(heard ? 1 : 0, notifyError, id)
      .run();
  } catch {
    // A lost flag is not worth failing a stored lead over.
  }

  console.log("FOWNED_LEAD " + JSON.stringify({ ...record, ID: id, NOTIFY_ERROR: notifyError }));

  return json({ ok: true, owner: record.OWNER }, 200);
}

export const onRequestGet = () =>
  new Response("Fowned lead intake. POST only.\n", {
    status: 405,
    headers: { "Content-Type": "text/plain; charset=utf-8", Allow: "POST" },
  });
