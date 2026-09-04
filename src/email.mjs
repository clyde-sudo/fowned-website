/**
 * Fowned transactional email, and the ONLY place an email body is built.
 *
 * Why this file exists: the audit-delivery email was hand-built as a static
 * file in tools/ and reviewed once. Nothing imported it, so it could not
 * constrain the next email anyone wrote, and the lead alert shipped as a
 * plain-text field dump. A design system that lives in an artifact instead of
 * on the send path does not bind. Every Fowned email is built here or it is
 * not a Fowned email.
 *
 * The four constraints email adds on top of DESIGN.md, each of which is why a
 * normal stylesheet cannot be reused:
 *
 *   1. No CSS custom properties. Outlook's Word renderer drops them, so every
 *      token is resolved to a literal hex below. TOKENS is the single point
 *      where DESIGN.md is transcribed; nothing else may write a hex value.
 *   2. No external stylesheet, no <style> that matters. Gmail strips much of
 *      it, so layout is tables and every rule is inline.
 *   3. No web fonts. Instrument Sans, Space Grotesk and IBM Plex Mono do not
 *      load in most mail clients, so each family ships a real fallback stack
 *      and the design must still read correctly in the fallback.
 *   4. Every value is visitor-controlled and lands in an HTML document, so
 *      escaping is a trust boundary here exactly as it is in the Slack card.
 *      `"` is escaped alongside `&<>` because these values reach attributes.
 *
 * Design rules carried over from DESIGN.md, each easy to break by accident:
 *   - IBM Plex Mono appears ONLY on small uppercase labels and system
 *     readouts. Never a paragraph, heading, or button label.
 *   - Indigo carries meaning (link / citation). It is never a button fill.
 *     A primary button is black on white, always.
 *   - Highlight yellow is for badges and health state, nothing else.
 *   - No Citability token appears anywhere. Fowned is a tenant of that
 *     backend, which carries no visual consequence.
 */

/** DESIGN.md resolved to literals. The only hex values in the system. */
export const TOKENS = {
  black: "#111111",
  white: "#ffffff",
  gray: "#767676",
  hairline: "#eaeaea",
  blush: "#e8eef2",
  indigo: "#2f45d0",
  highlight: "#ffd23f",
};

const SANS =
  "'Instrument Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif";
const DISPLAY = "'Space Grotesk'," + SANS;
const MONO = "'IBM Plex Mono',ui-monospace,Menlo,Consolas,monospace";

/**
 * HTML escape. Wider than the Slack escape by one character: `"` must go too,
 * because these values are interpolated into attributes (a mailto href), where
 * an unescaped quote ends the attribute and starts a new one.
 */
// Human-readable Pacific time. ISO strings are for machines; a person reads
// "Fri, Sep 4, 12:12 PM PDT". Falls back to the raw value if it does not parse.
export function humanTime(ts) {
  const d = new Date(ts);
  if (isNaN(d)) return ts || "-";
  return d.toLocaleString("en-US", {
    timeZone: "America/Los_Angeles", weekday: "short", month: "short",
    day: "numeric", hour: "numeric", minute: "2-digit", timeZoneName: "short",
  });
}

export function escapeHtml(v) {
  return String(v == null ? "" : v)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** A small uppercase mono label. The ONLY sanctioned use of the mono face. */
export function label(text, color = TOKENS.gray) {
  return (
    '<span style="font-family:' + MONO + ";font-size:11px;font-weight:500;" +
    "letter-spacing:.08em;text-transform:uppercase;color:" + color + ';">' +
    escapeHtml(text) +
    "</span>"
  );
}

/** A badge. Highlight yellow is documented for exactly this. */
export function badge(text) {
  return (
    '<span style="display:inline-block;background-color:' + TOKENS.highlight +
    ";border-radius:4px;padding:4px 8px;font-family:" + MONO +
    ";font-size:11px;font-weight:500;letter-spacing:.08em;" +
    "text-transform:uppercase;color:" + TOKENS.black + ';">' +
    escapeHtml(text) +
    "</span>"
  );
}

/**
 * A label/value fact list. Labels are mono because they are system readouts;
 * values are sans because they are content. Getting that backwards is the
 * single most visible way to make a Fowned email look like a template.
 */
export function facts(pairs) {
  const rows = pairs
    .filter(function (p) { return p && p[1] != null && p[1] !== ""; })
    .map(function (p) {
      return (
        "<tr>" +
        '<td valign="top" style="padding:0 16px 10px 0;white-space:nowrap;">' +
        label(p[0]) +
        "</td>" +
        '<td valign="top" style="padding:0 0 10px 0;font-family:' + SANS +
        ";font-size:14px;line-height:20px;color:" + TOKENS.black + ';">' +
        (p[2] === "raw" ? p[1] : escapeHtml(p[1])) +
        "</td>" +
        "</tr>"
      );
    })
    .join("");
  return (
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">' +
    rows +
    "</table>"
  );
}

/** Primary button. Black fill on white. Never indigo, never an accent. */
export function button(href, text) {
  return (
    '<a href="' + escapeHtml(href) + '" style="display:inline-block;' +
    "background-color:" + TOKENS.black + ";color:" + TOKENS.white +
    ";text-decoration:none;border-radius:8px;padding:12px 20px;font-family:" +
    SANS + ';font-size:14px;font-weight:600;">' +
    escapeHtml(text) +
    "</a>"
  );
}

/**
 * The shell every Fowned email shares: blush ground, 600px white card, hairline
 * border, masthead, footer. `blocks` are already-built <tr> strings.
 *
 * The colour-scheme meta tags are not decoration: without them Gmail and Apple
 * Mail in dark mode invert the card and the black button independently, which
 * turns the one high-contrast element into an unreadable one.
 */
export function shell(opts) {
  const preheader = opts.preheader || "";
  return (
    "<!doctype html><html><head>" +
    '<meta charset="utf-8">' +
    '<meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<meta name="color-scheme" content="light">' +
    '<meta name="supported-color-schemes" content="light">' +
    "<title>" + escapeHtml(opts.title || "Fowned") + "</title>" +
    "</head>" +
    '<body style="margin:0;padding:0;background-color:' + TOKENS.blush + ';">' +
    '<div style="display:none;max-height:0;overflow:hidden;opacity:0;">' +
    escapeHtml(preheader) +
    "</div>" +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"' +
    ' bgcolor="' + TOKENS.blush + '" style="background-color:' + TOKENS.blush + ';">' +
    '<tr><td align="center" style="padding:40px 16px;">' +
    '<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0"' +
    ' bgcolor="' + TOKENS.white + '" style="width:100%;max-width:600px;background-color:' +
    TOKENS.white + ";border:1px solid " + TOKENS.hairline + ';border-radius:8px;">' +

    // masthead
    '<tr><td style="padding:24px 32px;border-bottom:1px solid ' + TOKENS.hairline + ';">' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>' +
    '<td align="left" style="font-family:' + DISPLAY + ";font-size:18px;font-weight:700;" +
    "color:" + TOKENS.black + ';letter-spacing:-0.01em;">Fowned</td>' +
    '<td align="right">' + label(opts.kicker || "") + "</td>" +
    "</tr></table></td></tr>" +

    opts.blocks.join("") +

    // footer
    '<tr><td style="padding:20px 32px 24px;border-top:1px solid ' + TOKENS.hairline + ";" +
    "font-family:" + SANS + ";font-size:12px;line-height:18px;color:" + TOKENS.gray + ';">' +
    escapeHtml(opts.footer || "") +
    "</td></tr>" +

    "</table></td></tr></table></body></html>"
  );
}

/** A padded content row inside the card. */
export function row(inner, extra) {
  return (
    '<tr><td style="padding:' + (extra || "24px 32px") + ';">' + inner + "</td></tr>"
  );
}

/* ------------------------------------------------------------------ *
 * Templates
 * ------------------------------------------------------------------ */

/**
 * Plain text alternative. Kept deliberately: a lead alert is read on a phone in
 * three seconds, some clients still prefer text, and a text part measurably
 * helps deliverability. It is the same facts, not a lesser email.
 */
export function leadAlertText(record) {
  const lines = [
    "Company:  " + (record.COMPANY || "-"),
    "Domain:   " + (record.DOMAIN || "-"),
    "Name:     " + (record.CONTACT_NAME || "-"),
    "Email:    " + record.CONTACT,
    "",
    "Source:   " + record.SOURCE,
    "Landed:   " + (record.LANDING_PAGE || "-"),
    "Audit:    " + (record.AUDIT_COMPLETED ? "completed on site" : "not run"),
    "Booking:  " + (record.BOOKING_CLICK ? "clicked" : "no"),
    "Owner:    " + record.OWNER,
    "Time:     " + humanTime(record.TIMESTAMP),
  ];
  if (record.KEY_AUDIT_FINDINGS && record.KEY_AUDIT_FINDINGS.length) {
    lines.push("", "Findings the visitor saw:");
    for (const f of record.KEY_AUDIT_FINDINGS) lines.push("  - " + f);
  }
  if (record.MESSAGE) lines.push("", "Message:", record.MESSAGE);
  return lines.join("\n");
}

/** The internal lead alert sent to whoever works the pipeline. */
export function leadAlertEmail(record) {
  const who = record.CONTACT_NAME || record.COMPANY || record.DOMAIN || record.CONTACT;
  const mailto = "mailto:" + encodeURIComponent(record.CONTACT).replace(/%40/g, "@");

  const blocks = [];

  // Headline: who this is, and the one badge that changes how it is worked.
  blocks.push(
    row(
      label("New lead") +
      '<div style="margin:8px 0 0;font-family:' + DISPLAY + ";font-size:24px;" +
      "line-height:30px;font-weight:700;letter-spacing:-0.01em;color:" +
      TOKENS.black + ';">' + escapeHtml(who) + "</div>" +
      '<div style="margin:10px 0 0;font-family:' + SANS + ";font-size:14px;" +
      "line-height:20px;\">" +
      '<a href="' + escapeHtml(mailto) + '" style="color:' + TOKENS.indigo +
      ';text-decoration:none;">' + escapeHtml(record.CONTACT) + "</a></div>" +
      (record.AUDIT_COMPLETED
        ? '<div style="margin:14px 0 0;">' + badge("Audit completed on site") + "</div>"
        : ""),
      "28px 32px 4px"
    )
  );

  // The facts, as a system readout.
  blocks.push(
    row(
      facts([
        ["Company", record.COMPANY],
        ["Domain", record.DOMAIN],
        ["Source", record.SOURCE],
        ["Landed", record.LANDING_PAGE],
        ["Booking", record.BOOKING_CLICK ? "Clicked" : "No"],
        ["Owner", record.OWNER],
        ["Time", humanTime(record.TIMESTAMP)],
      ]),
      "20px 32px 4px"
    )
  );

  // What the visitor actually typed, given its own weight.
  if (record.MESSAGE) {
    blocks.push(
      row(
        label("What they asked for") +
        '<div style="margin:10px 0 0;background-color:' + TOKENS.blush +
        ";border-radius:8px;padding:16px;font-family:" + SANS +
        ";font-size:15px;line-height:22px;color:" + TOKENS.black + ';">' +
        escapeHtml(record.MESSAGE).replace(/\n/g, "<br>") +
        "</div>",
        "12px 32px 4px"
      )
    );
  }

  // Findings the visitor already saw, so the reply does not repeat them.
  if (record.KEY_AUDIT_FINDINGS && record.KEY_AUDIT_FINDINGS.length) {
    const items = record.KEY_AUDIT_FINDINGS.map(function (f) {
      return (
        '<li style="margin:0 0 6px;font-family:' + SANS + ";font-size:14px;" +
        "line-height:20px;color:" + TOKENS.black + ';">' + escapeHtml(f) + "</li>"
      );
    }).join("");
    blocks.push(
      row(
        label("Findings the visitor saw") +
        '<ul style="margin:10px 0 0;padding-left:20px;">' + items + "</ul>",
        "12px 32px 4px"
      )
    );
  }

  blocks.push(row(button(mailto, "Reply to " + who), "20px 32px 28px"));

  const html = shell({
    title: "New Fowned lead: " + who,
    kicker: "Lead alert",
    preheader:
      who + " · " + (record.DOMAIN || record.SOURCE) +
      (record.MESSAGE ? " · " + record.MESSAGE.slice(0, 80) : ""),
    footer:
      "Sent by fowned.live because the consultation form was submitted. " +
      "Reply goes straight to the person who filled it in.",
    blocks: blocks,
  });

  return {
    subject: "Fowned lead: " + (record.COMPANY || record.DOMAIN || record.CONTACT),
    html: html,
    text: leadAlertText(record),
  };
}
