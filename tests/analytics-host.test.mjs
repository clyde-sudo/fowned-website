/**
 * Slice A: production telemetry describes real visitors only. GA4 property
 * 553534903 may hear from fowned.live and www.fowned.live and nothing else, so
 * a preview deploy, a local build or a test run can never inflate it.
 */
import { test, before } from "node:test";
import { buildSite } from "./helpers/build.mjs";
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { ga4Tag } from "../src/layout.mjs";
import { runScript } from "./helpers/browser-sandbox.mjs";

const PRODUCTION = ["fowned.live", "www.fowned.live"];
const NOT_PRODUCTION = [
  "fowned.pages.dev",
  "ga4-event-contract.fowned.pages.dev",
  "fix-trust-defects-20261010.fowned.pages.dev",
  "localhost",
  "127.0.0.1",
  "fowned.live.example.com",
  "notfowned.live",
];
const GOOGLE = /googletagmanager\.com|google-analytics\.com/;

/** The loader exactly as every page carries it, run as the browser would. */
function runLoader(hostname) {
  const tag = ga4Tag();
  assert.doesNotMatch(tag, /<script[^>]*\ssrc=/, "the loader must not be a static <script src>, which loads on every host");
  const source = [...tag.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => m[1]).join("\n");
  return runScript("ga4-loader", { hostname, source });
}

for (const host of PRODUCTION) {
  test(`loader starts gtag on ${host}`, () => {
    const page = runLoader(host);
    assert.equal(typeof page.window.gtag, "function");
    assert.ok(page.appended.some((n) => /googletagmanager\.com\/gtag\/js\?id=G-/.test(n.src || "")), "gtag.js was not requested");
  });
}

for (const host of NOT_PRODUCTION) {
  test(`loader sends nothing to Google on ${host}`, () => {
    const page = runLoader(host);
    assert.equal(page.window.gtag, undefined, "gtag defined off production");
    assert.equal(page.window.dataLayer, undefined, "dataLayer defined off production");
    assert.deepEqual(page.appended.filter((n) => GOOGLE.test(n.src || "")), []);
    assert.deepEqual(page.requests.filter((r) => GOOGLE.test(r.url)), []);
  });

  test(`instrument.js forwards nothing to GA4 on ${host}, even if gtag exists`, () => {
    const calls = [];
    const page = runScript("js/instrument.js", { hostname: host, globals: { gtag: (...a) => calls.push(a) } });
    page.window.FownedInstrument.track("audit_request", { form: "audit" });
    page.window.FownedInstrument.track("booking_click", { label: "Book" });
    assert.deepEqual(calls, []);
  });
}

test("instrument.js forwards key events to GA4 on fowned.live", () => {
  const calls = [];
  const page = runScript("js/instrument.js", { hostname: "fowned.live", globals: { gtag: (...a) => calls.push(a) } });
  page.window.FownedInstrument.track("audit_request", { form: "audit" });
  assert.deepEqual(calls.map((c) => c[1]), ["audit_request"]);
});

describeBuild();
function describeBuild() {
  let pages = [];
  before(() => {
    const out = buildSite();
    const walk = (d) => readdirSync(d).flatMap((f) => {
      const p = join(d, f);
      return statSync(p).isDirectory() ? walk(p) : p.endsWith(".html") ? [p] : [];
    });
    pages = walk(out).map((p) => [p, readFileSync(p, "utf8")]);
  });

  test("every built page loads gtag through the shared loader and nowhere else", () => {
    assert.ok(pages.length > 20, `only ${pages.length} pages built`);
    const tag = ga4Tag();
    for (const [path, html] of pages) {
      assert.equal(html.split(tag).length - 1, 1, `${path} does not carry the shared loader exactly once`);
      const rest = html.replace(tag, "");
      assert.doesNotMatch(rest, GOOGLE, `${path} references Google analytics outside the loader`);
      assert.doesNotMatch(rest, /\bgtag\(/, `${path} calls gtag outside the loader`);
    }
  });
}
