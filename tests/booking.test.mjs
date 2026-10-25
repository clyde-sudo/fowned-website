/**
 * Slice B: booking attribution. Every Calendly link is built by one function,
 * Calendly loads only when a visitor clicks, and a scheduled booking reaches the
 * leads table once, from the page that produced it, without reading anyone's
 * name or email from Calendly.
 */
import { test, before } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { bookingUrl } from "../src/layout.mjs";
import { onRequestPost } from "../functions/api/lead.js";
import { runScript, fakeElement } from "./helpers/browser-sandbox.mjs";
import { fakeD1 } from "./helpers/fake-d1.mjs";

const EVENT = "https://api.calendly.com/scheduled_events/GBGBDCAADAEDCRZ2";
const INVITEE = EVENT + "/invitees/AAAAAAAAAAAAAAAA";

/* ---- one URL builder ------------------------------------------------- */

test("bookingUrl builds the agreed Calendly URL from a page path", () => {
  assert.equal(
    bookingUrl("/"),
    "https://calendly.com/clyde-thrulead/30min?utm_source=fowned.live&utm_medium=site&utm_campaign=book_call&utm_content=home"
  );
  assert.equal(
    new URL(bookingUrl("/guides/geo-for-local-businesses/")).searchParams.get("utm_content"),
    "guides-geo-for-local-businesses"
  );
  assert.equal(new URL(bookingUrl("/llms.txt")).searchParams.get("utm_content"), "llms-txt");
});

let built = [];
before(() => {
  execFileSync(process.execPath, ["build.mjs"], { stdio: "ignore" });
  const walk = (d) => readdirSync(d).flatMap((f) => {
    const p = join(d, f);
    return statSync(p).isDirectory() ? walk(p) : p.endsWith(".html") ? [p] : [];
  });
  built = walk("dist").map((p) => {
    const rel = p.slice("dist".length).replace(/index\.html$/, "").replace(/\.html$/, "/");
    return { path: rel, html: readFileSync(p, "utf8") };
  });
});

const CALENDLY = /calendly\.com[^"'\s<)]*/g;
const decode = (s) => s.replace(/&amp;/g, "&");

test("every Calendly link in the built site and llms.txt comes from bookingUrl", () => {
  let links = 0;
  for (const { path, html } of built) {
    for (const m of html.match(CALENDLY) || []) {
      links++;
      assert.equal("https://" + decode(m), bookingUrl(path), `${path} has a Calendly URL bookingUrl did not build`);
    }
  }
  assert.ok(links >= 40, `only ${links} Calendly links found`);
  const llms = readFileSync("dist/llms.txt", "utf8").match(CALENDLY) || [];
  assert.deepEqual(llms.map((m) => "https://" + m), [bookingUrl("/llms.txt")]);
  console.log(`# calendly links checked: ${links} in html + ${llms.length} in llms.txt`);
});

test("no page loads a Calendly script or stylesheet on page load", () => {
  for (const { path, html } of built) {
    assert.doesNotMatch(html, /<(script|link)[^>]+calendly/i, `${path} loads Calendly up front`);
    if (CALENDLY.test(html)) assert.match(html, /\/js\/booking\.js/, `${path} has a booking link but no booking.js`);
    CALENDLY.lastIndex = 0;
  }
});

/* ---- js/booking.js --------------------------------------------------- */

function bookingPage({ pathname = "/audit/" } = {}) {
  const tracked = [];
  const instrument = {
    track: (name, detail) => tracked.push([name, detail]),
    attribution: () => ({ source: "GOOGLE_ORGANIC", landingPath: "/guides/x/", evidence: "OBSERVED" }),
  };
  const page = runScript("js/booking.js", { pathname, globals: { FownedInstrument: instrument } });
  return { page, tracked };
}

function clickCalendly(page, extra = {}) {
  const anchor = fakeElement({ tagName: "A", href: bookingUrl("/audit/") });
  const target = fakeElement({ closest: (sel) => (sel.includes("calendly") ? anchor : null) });
  let prevented = false;
  page.fireDocument("click", { target, button: 0, preventDefault() { prevented = true; }, ...extra });
  return { anchor, prevented: () => prevented };
}

const calendlyAssets = (page) => page.appended.filter((n) => /calendly/.test(n.src || n.href || ""));

test("booking.js loads nothing from Calendly until a booking link is clicked", () => {
  const { page } = bookingPage();
  assert.deepEqual(calendlyAssets(page), []);
});

test("a click on a booking link opens the Calendly popup with that link's URL", () => {
  const { page } = bookingPage();
  const { anchor, prevented } = clickCalendly(page);
  assert.ok(prevented(), "the link navigated instead of opening the popup");
  const script = calendlyAssets(page).find((n) => /widget\.js$/.test(n.src || ""));
  assert.ok(script, "widget.js was not requested on click");
  const popups = [];
  page.window.Calendly = { initPopupWidget: (o) => popups.push(o) };
  script.onload();
  assert.deepEqual(JSON.parse(JSON.stringify(popups)), [{ url: anchor.href }]); // built in the vm realm
});

test("a modified click (new tab) is left to the browser", () => {
  const { page } = bookingPage();
  const { prevented } = clickCalendly(page, { metaKey: true });
  assert.equal(prevented(), false);
  assert.deepEqual(calendlyAssets(page), []);
});

const scheduled = (origin, uri = EVENT, extra = {}) => ({
  origin,
  data: {
    event: "calendly.event_scheduled",
    payload: { event: { uri }, invitee: { uri: uri + "/invitees/AAAAAAAAAAAAAAAA", email: "person@example.com", name: "A Person" } },
    ...extra,
  },
});

test("event_scheduled is accepted only from exactly https://calendly.com", async () => {
  const { page, tracked } = bookingPage();
  for (const origin of ["https://calendly.com.evil.test", "https://evil.test", "http://calendly.com", "https://www.calendly.com", "null"]) {
    page.fireWindow("message", scheduled(origin));
  }
  page.fireWindow("message", { origin: "https://calendly.com", data: { event: "calendly.event_type_viewed", payload: {} } });
  await page.flush();
  assert.deepEqual(page.requests, []);
  assert.deepEqual(tracked, []);
});

test("event_scheduled posts one BOOKING_SCHEDULED lead and one GA4 event per event URI", async () => {
  const { page, tracked } = bookingPage({ pathname: "/audit/" });
  page.fireWindow("message", scheduled("https://calendly.com"));
  page.fireWindow("message", scheduled("https://calendly.com"));
  await page.flush();

  const leads = page.requests.filter((r) => r.url === "/api/lead");
  assert.equal(leads.length, 1, "duplicate event URI posted twice");
  const body = leads[0].body;
  assert.equal(body.kind, "BOOKING_SCHEDULED");
  assert.equal(body.eventUri, EVENT);
  assert.equal(body.inviteeUri, INVITEE);
  assert.equal(body.pagePath, "/audit/");
  assert.equal(body.attribution.source, "GOOGLE_ORGANIC");
  assert.doesNotMatch(JSON.stringify(body), /person@example\.com|A Person/, "read a name or email from Calendly");

  // JSON round trip: the objects were built inside the vm, in another realm.
  assert.deepEqual(JSON.parse(JSON.stringify(tracked)), [["booking_scheduled", { page_path: "/audit/", source_class: "GOOGLE_ORGANIC" }]]);
});

test("instrument.js forwards booking_scheduled to GA4 with page_path and source_class", () => {
  const calls = [];
  const page = runScript("js/instrument.js", { globals: { gtag: (...a) => calls.push(a) } });
  page.window.FownedInstrument.track("booking_scheduled", { page_path: "/audit/", source_class: "GOOGLE_ORGANIC" });
  const ev = calls.find((c) => c[1] === "booking_scheduled");
  assert.ok(ev, "booking_scheduled not forwarded");
  assert.equal(ev[2].page_path, "/audit/");
  assert.equal(ev[2].source_class, "GOOGLE_ORGANIC");
});

/* ---- POST /api/lead -------------------------------------------------- */

function server() {
  const db = fakeD1();
  const outbound = [];
  globalThis.fetch = async (url, init = {}) => {
    outbound.push({ url: String(url), body: init.body });
    if (String(url).includes("turnstile")) return Response.json({ success: false });
    return new Response("ok", { status: 200 });
  };
  const env = {
    fowned_leads: db,
    TURNSTILE_SECRET_KEY: "enforced",
    SLACK_WEBHOOK_URL: "https://hooks.slack.test/one",
    RESEND_API_KEY: "test",
    LEAD_NOTIFY_FROM: "leads@test.invalid",
    LEAD_NOTIFY_TO: "team@test.invalid",
  };
  const post = (body, { ip = "203.0.113.7", origin = "https://fowned.live" } = {}) => {
    const headers = { "Content-Type": "application/json", "CF-Connecting-IP": ip };
    if (origin) headers.Origin = origin;
    const request = new Request("https://fowned.live/api/lead", {
      method: "POST", headers, body: typeof body === "string" ? body : JSON.stringify(body),
    });
    return onRequestPost({ request, env });
  };
  const rows = () => db.raw.prepare("SELECT * FROM leads").all();
  return { db, env, post, rows, outbound };
}

const booking = (over = {}) => ({
  kind: "BOOKING_SCHEDULED",
  eventUri: EVENT,
  inviteeUri: INVITEE,
  pagePath: "/audit/",
  attribution: { source: "GOOGLE_ORGANIC", landingPath: "/guides/x/" },
  ...over,
});

test("a BOOKING_SCHEDULED post stores one lead owned by CLYDE and alerts with the page path", async () => {
  const s = server();
  const res = await s.post(booking({ name: "Should Not Be Read", contact: "nobody@example.com" }));
  assert.equal(res.status, 200);
  const rows = s.rows();
  assert.equal(rows.length, 1);
  const r = rows[0];
  assert.equal(r.kind, "BOOKING_SCHEDULED");
  assert.equal(r.event_uri, EVENT);
  assert.equal(r.invitee_uri, INVITEE);
  assert.equal(r.owner, "CLYDE");
  assert.equal(r.status, "NEW");
  assert.equal(r.source, "GOOGLE_ORGANIC");
  assert.equal(r.landing_page, "/guides/x/");
  assert.equal(r.contact_name, null);
  assert.doesNotMatch(JSON.stringify(r), /nobody@example\.com|Should Not Be Read/);

  assert.ok(!s.outbound.some((o) => o.url.includes("turnstile")), "a booking has no Turnstile token to verify");
  const flat = (t) => String(t).replace(/\*/g, "").replace(/\\n/g, " ").replace(/\s+/g, " ");
  const slack = s.outbound.find((o) => o.url.includes("hooks.slack.test"));
  const mail = s.outbound.find((o) => o.url.includes("resend"));
  assert.match(flat(slack.body), /Booking: scheduled from \/audit\//);
  assert.match(flat(JSON.parse(mail.body).text), /Booking: scheduled from \/audit\//);
  assert.match(JSON.parse(mail.body).subject, /Booking: scheduled from \/audit\//);
  assert.equal(JSON.parse(mail.body).reply_to, undefined, "reply_to must be an address, and a booking has none");
});

test("a second post with the same event URI is rejected", async () => {
  const s = server();
  assert.equal((await s.post(booking())).status, 200);
  const again = await s.post(booking());
  assert.equal(again.status, 409);
  assert.equal(s.rows().length, 1);
});

test("a booking post with a malformed or mismatched URI, or no Origin, is refused", async () => {
  const s = server();
  assert.equal((await s.post(booking({ eventUri: "https://evil.test/scheduled_events/GBGBDCAADAEDCRZ2" }))).status, 400);
  assert.equal((await s.post(booking({ inviteeUri: "https://api.calendly.com/scheduled_events/OTHEROTHEROTHER1/invitees/AAAAAAAAAAAAAAAA" }))).status, 400);
  assert.equal((await s.post(booking({ pagePath: "https://evil.test/" }))).status, 400);
  assert.equal((await s.post(booking(), { origin: null })).status, 403);
  assert.equal(s.rows().length, 0);
});

test("an ordinary lead still needs a Turnstile pass", async () => {
  const s = server();
  const res = await s.post({ contact: "owner@example.com", message: "hello" });
  assert.equal(res.status, 403);
});

test("more than 10 posts from one IP in 10 minutes returns 429", async () => {
  const s = server();
  for (let i = 0; i < 10; i++) assert.notEqual((await s.post("not json")).status, 429, `post ${i + 1} was limited`);
  assert.equal((await s.post("not json")).status, 429);
  assert.equal((await s.post(booking())).status, 429, "the limit covers bookings too");
  assert.notEqual((await s.post("not json", { ip: "198.51.100.2" })).status, 429, "another IP was limited");
});

test("posts older than 10 minutes do not count toward the limit", async () => {
  const s = server();
  const ipHash = createHash("sha256").update("192.0.2.9").digest("hex");
  const old = new Date(Date.now() - 11 * 60 * 1000).toISOString();
  for (let i = 0; i < 10; i++) s.db.raw.prepare("INSERT INTO lead_posts (ip_hash, at) VALUES (?, ?)").run(ipHash, old);
  assert.notEqual((await s.post("not json", { ip: "192.0.2.9" })).status, 429);
});
