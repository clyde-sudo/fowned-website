/**
 * Offline checks on the Fowned email builder.
 *
 * Two jobs. The first is the trust boundary: every field below arrives from a
 * public form and lands inside an HTML document, one of them inside a mailto
 * attribute. The second is the design system: the rules in DESIGN.md that are
 * easy to break by accident are asserted here, so breaking one fails a test
 * instead of shipping an email that looks like a template.
 *
 *   node tools/email-test.mjs              run the checks
 *   node tools/email-test.mjs --preview    also write a previewable file
 */
import { leadAlertEmail, escapeHtml, TOKENS } from "../src/email.mjs";
import { writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

let pass = 0;
const fail = [];
const ok = (name, cond) => {
  if (cond) { pass++; console.log("  ok    " + name); }
  else { fail.push(name); console.log("  FAIL  " + name); }
};

/* Every visitor-controlled field carries an injection payload. */
const HOSTILE = {
  COMPANY: '<script>alert(1)</script>',
  DOMAIN: '"><img src=x onerror=alert(1)>',
  CONTACT_NAME: 'Ada "><b>bold</b>',
  CONTACT: 'a@b.com"><script>x</script>',
  SOURCE: "AI_ASSISTANT & <friends>",
  LANDING_PAGE: "/audit/?q=<x>",
  AUDIT_COMPLETED: 1,
  BOOKING_CLICK: 1,
  OWNER: "UNASSIGNED",
  TIMESTAMP: "2026-09-04T19:12:33.428Z",
  KEY_AUDIT_FINDINGS: ["<b>robots.txt</b> blocks GPTBot", 'x" onload="y'],
  MESSAGE: 'Line one\nLine two <script>alert("hi")</script>',
};

const h = leadAlertEmail(HOSTILE).html;

console.log("\nescaping (trust boundary)");
ok("no executable script tag from input", !/<script/i.test(h));
ok("no img onerror from input", !/<img[^>]*onerror/i.test(h));
/* The payload `x" onload="y` renders as `x&quot; onload=&quot;y`. The handler text
 * survives, inert, because the quote that would have closed the attribute is an
 * entity. So the check is for a LIVE quote next to a handler, not for the word. */
ok("no inline handler behind a live quote", !/["'][^<>]{0,20}\son\w+\s*=/i.test(h));
ok("every input quote became an entity", !/onload="|onerror="/i.test(h));
ok("angle brackets from input are entities", h.includes("&lt;script&gt;"));
ok("quotes from input are entities", h.includes("&quot;"));
ok("ampersand escaped", h.includes("AI_ASSISTANT &amp;"));
ok("escapeHtml covers all four characters",
  escapeHtml('&<>"') === "&amp;&lt;&gt;&quot;");

console.log("\ndesign system (DESIGN.md)");
const MONO = "IBM Plex Mono";
const button = h.slice(h.indexOf("background-color:" + TOKENS.black + ";color:"));
ok("mono never on the button label", !button.slice(0, 300).includes(MONO));
ok("mono never on the headline", !h.slice(h.indexOf("font-size:24px") - 200,
  h.indexOf("font-size:24px")).includes(MONO));
ok("indigo is never a fill", !h.includes("background-color:" + TOKENS.indigo));
ok("indigo is used as a link colour", h.includes("color:" + TOKENS.indigo));
ok("primary button is black on white",
  h.includes("background-color:" + TOKENS.black + ";color:" + TOKENS.white));
ok("no Citability token leaks in", !/#0e141b|#f5c518|Forensic/i.test(h));
ok("every family has a fallback stack",
  !/font-family:'[^']+';/.test(h) && h.includes("Helvetica,Arial,sans-serif"));

console.log("\nemail client constraints");
ok("no CSS custom properties", !h.includes("var(--"));
ok("no external stylesheet", !/<link[^>]+stylesheet/i.test(h));
ok("table-based layout", h.includes('role="presentation"'));
ok("no ISO timestamp reaches the reader", !/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(h));
ok("fluid card capped at 600px", h.includes('width="600"') && h.includes("width:100%;max-width:600px"));
ok("declares a doctype", h.startsWith("<!doctype html>"));
ok("has a preheader", h.includes("max-height:0;overflow:hidden"));
ok("pins colour scheme against dark-mode inversion",
  h.includes('name="color-scheme"') && h.includes("supported-color-schemes"));

console.log("\ntext alternative");
const t = leadAlertEmail(HOSTILE).text;
ok("text part exists and is not the html", t.length > 0 && !t.includes("<table"));
ok("text part carries the contact", t.includes(HOSTILE.CONTACT));
ok("text part carries the findings", t.includes("blocks GPTBot"));

/* An optional field that is absent must not render an empty row. */
const bare = leadAlertEmail({
  COMPANY: null, DOMAIN: "acme.com", CONTACT_NAME: null, CONTACT: "z@acme.com",
  SOURCE: "DIRECT_OR_UNKNOWN", LANDING_PAGE: null, AUDIT_COMPLETED: 0,
  BOOKING_CLICK: 0, OWNER: "UNASSIGNED", TIMESTAMP: "2026-09-04T00:00:00.000Z",
  KEY_AUDIT_FINDINGS: [], MESSAGE: null,
}).html;
console.log("\nabsent fields");
ok("no empty Company row", !bare.includes(">Company<"));
ok("no message block when there is no message", !bare.includes("What they asked for"));
ok("no findings block when there are none", !bare.includes("Findings the visitor saw"));
ok("no audit badge when the audit did not run", !bare.includes("Audit completed"));

if (process.argv.includes("--preview")) {
  const out = process.env.PREVIEW_OUT || "/tmp/fowned-lead-email.html";
  writeFileSync(out, leadAlertEmail({
    COMPANY: "Velora Interiors", DOMAIN: "velora.example",
    CONTACT_NAME: "Dana Whitfield", CONTACT: "dana@velora.example",
    SOURCE: "AI_ASSISTANT", LANDING_PAGE: "/audit/", AUDIT_COMPLETED: 1,
    BOOKING_CLICK: 1, OWNER: "UNASSIGNED",
    TIMESTAMP: "2026-09-04T19:12:33.428Z",
    KEY_AUDIT_FINDINGS: [
      "robots.txt blocks GPTBot and PerplexityBot",
      "No Organization schema on the home page",
      "Opening hours appear only inside an image",
    ],
    MESSAGE: "We show up on Google but ChatGPT never names us.\nCan you tell us why?",
  }).html);
  console.log("\npreview written to " + out);
  // ponytail: macOS only; opens the preview on screen so no one has to go find the file
  if (process.platform === "darwin" && !process.argv.includes("--no-open")) spawnSync("open", [out]);
}

console.log("\n" + (fail.length ? fail.length + " FAILED: " + fail.join(", ")
  : "all " + pass + " checks passed"));
process.exit(fail.length ? 1 : 0);
