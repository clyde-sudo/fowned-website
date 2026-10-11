/**
 * Proves the Slack lead card, without needing Slack.
 *
 * The card is built from PUBLIC FORM INPUT, so the check that matters is the
 * injection one: `<https://evil.example|Approve invoice>` is valid Slack
 * mrkdwn, and an unescaped company name would render in the team's own channel
 * as a disguised clickable link that appears to come from us. Every other
 * assertion here is about not shipping an empty-looking alert.
 *
 * Usage:  node tools/slack-card-test.mjs
 *         SLACK_WEBHOOK_URL=... node tools/slack-card-test.mjs --live-post
 *
 * --live-post posts one real card to the webhook, which is the only way to prove
 * Slack accepts the block structure; Slack validates blocks server-side and
 * answers `invalid_payload` in plain text, not JSON.
 */
import { slackCard, esc, notifySlack, auditDueDate } from "../functions/api/lead.js";

let failed = 0;
const check = (name, cond) => {
  console.log(`  ${cond ? "ok  " : "FAIL"}  ${name}`);
  if (!cond) failed++;
};

// Every visitor-controlled field carries an attack, so a leak anywhere shows.
const hostile = {
  DOMAIN: "evil<b>.com",
  COMPANY: "<https://evil.example|Approve invoice>",
  CONTACT: "attacker@evil.example",
  CONTACT_NAME: "<!channel>",
  MESSAGE: "ping <@U000AAA> & <https://evil.example|click me>",
  SOURCE: "LINKEDIN",
  LANDING_PAGE: "/audit/",
  AUDIT_COMPLETED: true,
  KEY_AUDIT_FINDINGS: ["No llms.txt", "<https://evil.example|Missing schema>"],
  BOOKING_CLICK: true,
  OWNER: "CLYDE",
};

const card = slackCard(hostile, ["U111CHUDI", "U222CLYDE"]);
const rendered = JSON.stringify(card);

// The mention block is the ONLY place `<@` may legitimately appear, so strip
// exactly those before asserting nothing else survived.
const withoutMentions = rendered.replace(/<@U111CHUDI>|<@U222CLYDE>/g, "");

check("no raw < survives from visitor input", !withoutMentions.includes("<"));
check("no raw > survives from visitor input", !withoutMentions.includes(">"));
check("the disguised link is neutralised", rendered.includes("&lt;https://evil.example"));
check("<!channel> cannot ping the channel", !withoutMentions.includes("<!channel>"));
check("both mentions render", rendered.includes("<@U111CHUDI>") && rendered.includes("<@U222CLYDE>"));
check("fallback text carries who and how to reach", card.text.includes("attacker@evil.example"));
check("findings are shown", rendered.includes("No llms.txt"));
check("esc is idempotent on safe text", esc("Acme Ltd") === "Acme Ltd");

// A lead with only an email must still produce a usable card: that is the
// shape the audit form posts (no name, no company).
const minimal = slackCard(
  {
    DOMAIN: null, COMPANY: null, CONTACT: "solo@example.com", CONTACT_NAME: null,
    MESSAGE: null, SOURCE: "DIRECT_OR_UNKNOWN", LANDING_PAGE: null,
    AUDIT_COMPLETED: false, KEY_AUDIT_FINDINGS: [], BOOKING_CLICK: false,
    OWNER: "UNASSIGNED",
  },
  []
);
check("minimal lead still names the contact", minimal.text.includes("solo@example.com"));
check("minimal lead emits no empty blocks", minimal.blocks.every((b) =>
  b.type === "section" ? Boolean(b.text?.text?.trim()) : b.elements.length > 0));

// A free-audit request is owed within 2 business days on the Pacific calendar.
check("due date skips the weekend (Sat 10/10/2026 is due Tue 10/13/2026)",
  auditDueDate(new Date("2026-10-10T20:00:00Z")) === "10/13/2026");
check("due date counts the Pacific day, not UTC (Thu 8 pm PDT is due Mon 10/12/2026)",
  auditDueDate(new Date("2026-10-09T03:00:00Z")) === "10/12/2026");
const owed = JSON.stringify(slackCard({ ...JSON.parse(JSON.stringify(hostile)), AUDIT_DUE: "10/13/2026", OWNER: "CHUDI" }, []));
check("audit request card names the due date", owed.includes("*Audit:* requested, send by 10/13/2026 (2 business days, Pacific)"));
check("audit request card names the owner", owed.includes("*Owner:* CHUDI"));
check("other leads carry no Audit line", !JSON.stringify(minimal).includes("Audit:") && !JSON.stringify(card).includes("Audit:"));

if (process.argv.includes("--live-post")) {
  const url = process.env.SLACK_WEBHOOK_URL;
  if (!url) { console.log("\n  FAIL  --live-post needs SLACK_WEBHOOK_URL"); failed++; }
  else {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(slackCard({ ...hostile, COMPANY: "Slack card test (ignore)" },
        (process.env.SLACK_NOTIFY_MENTIONS || "").split(",").map(s => s.trim()).filter(Boolean))),
    });
    const body = await res.text();
    check(`Slack accepted the blocks (${res.status} ${body})`, res.ok && body.trim() === "ok");
  }
}


/* ---------------------------------------------------------------------------
 * Fan-out, against a local server rather than Slack.
 *
 * This is the half that cannot be proved by inspecting the card: that TWO
 * webhooks both get posted, that one failing does not suppress the other, and
 * that the error names the webhook by INDEX and never by URL (the URL is a
 * credential and notify_error lands in D1).
 * ------------------------------------------------------------------------ */
{
  const { createServer } = await import("node:http");
  const hits = [];
  const server = createServer((req, res) => {
    let body = "";
    req.on("data", (c) => (body += c));
    req.on("end", () => {
      hits.push({ path: req.url, body });
      if (req.url === "/dead") { res.writeHead(403); res.end("no_service"); }
      else { res.writeHead(200); res.end("ok"); }
    });
  });
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  const base = `http://127.0.0.1:${server.address().port}`;

  const both = await notifySlack(
    { SLACK_WEBHOOK_URL: `${base}/good-a, ${base}/good-b`, SLACK_NOTIFY_MENTIONS: "U111,U222" },
    hostile
  );
  check("two healthy webhooks both receive the card", hits.length === 2);
  check("two healthy webhooks report no error", both === null);

  hits.length = 0;
  const mixed = await notifySlack({ SLACK_WEBHOOK_URL: `${base}/dead, ${base}/good-c` }, hostile);
  check("a dead webhook does not suppress the healthy one", hits.length === 2);
  check("the failure is reported", typeof mixed === "string" && mixed.includes("403"));
  check("the failure names the index, not the URL", mixed.includes("webhook 1/2") && !mixed.includes("127.0.0.1"));
  check("carries Slack's own reason", mixed.includes("no_service"));

  const unset = await notifySlack({}, hostile);
  check("unset webhook is a clean no-op", unset === "SLACK_NOT_CONFIGURED" && hits.length === 2);

  server.close();
}

console.log(failed ? `\n${failed} check(s) FAILED` : "\nall checks passed");
process.exit(failed ? 1 : 0);
