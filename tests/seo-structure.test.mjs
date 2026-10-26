/**
 * Crawl-facing structure the audit found missing on 2026-10-26: one site-wide
 * entity, Article dates on the content pages, breadcrumbs on the answers,
 * sitemap lastmod, and a robots.txt whose comments describe the site that
 * actually ships.
 */
import { test, before } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { buildSite } from "./helpers/build.mjs";

const ORIGIN = "https://fowned.live";
const ORG_ID = `${ORIGIN}/#organization`;
let out = "";
let pages = [];

const ld = (html) =>
  [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1]));

before(() => {
  out = buildSite({ SITE_ORIGIN: ORIGIN });
  const walk = (d) => readdirSync(d).flatMap((f) => {
    const p = join(d, f);
    return statSync(p).isDirectory() ? walk(p) : p.endsWith("index.html") ? [p] : [];
  });
  pages = walk(out).map((p) => {
    const path = p.slice(out.length).replace(/index\.html$/, "");
    return { path, html: readFileSync(p, "utf8") };
  });
});

const content = () => pages.filter((p) => /^\/(guides|answers)\/[^/]+\/$/.test(p.path));
const indexable = () => pages.filter((p) => !["/404/", "/410/"].includes(p.path));

test("BUILD_OUT is honoured, so parallel test files cannot delete each other's output", () => {
  assert.ok(pages.length > 20, `only ${pages.length} pages in ${out}`);
});

test("every indexable page names the one Organization entity, defined exactly once", () => {
  for (const p of indexable()) {
    const orgs = ld(p.html).filter((s) => s["@type"] === "Organization");
    assert.equal(orgs.length, 1, `${p.path} has ${orgs.length} Organization blocks`);
    assert.equal(orgs[0]["@id"], ORG_ID, p.path);
    assert.ok(orgs[0].sameAs.includes("https://www.linkedin.com/company/fowned/"), p.path);
  }
});

test("every guide and answer is an Article with dates and the organization as author", () => {
  assert.ok(content().length >= 9, `only ${content().length} guide/answer pages`);
  for (const p of content()) {
    const a = ld(p.html).find((s) => s["@type"] === "Article");
    assert.ok(a, `${p.path} has no Article`);
    assert.match(a.dateModified || "", /^\d{4}-\d{2}-\d{2}$/, `${p.path} dateModified`);
    assert.match(a.datePublished || "", /^\d{4}-\d{2}-\d{2}$/, `${p.path} datePublished`);
    assert.ok(a.datePublished <= a.dateModified, p.path);
    assert.equal(a.author["@id"], ORG_ID, p.path);
    assert.equal(a.mainEntityOfPage, ORIGIN + p.path, p.path);
  }
});

test("every guide and answer carries exactly one BreadcrumbList ending at itself", () => {
  for (const p of content()) {
    const crumbs = ld(p.html).filter((s) => s["@type"] === "BreadcrumbList");
    assert.equal(crumbs.length, 1, `${p.path} has ${crumbs.length} BreadcrumbList blocks`);
    const items = crumbs[0].itemListElement;
    assert.equal(items.at(-1).item, ORIGIN + p.path, p.path);
  }
});

test("the 404 and gone pages carry no structured data", () => {
  for (const f of ["404.html", "410/index.html"]) {
    assert.doesNotMatch(readFileSync(join(out, f), "utf8"), /application\/ld\+json/, f);
  }
});

test("content dates come from history, not from one shallow-clone commit", () => {
  const dates = new Set(content().map((p) => ld(p.html).find((s) => s["@type"] === "Article").datePublished));
  assert.ok(dates.size > 1, `every guide and answer reports the same datePublished: ${[...dates]}`);
});

test("sitemap gives every URL a lastmod date", () => {
  const xml = readFileSync(join(out, "sitemap.xml"), "utf8");
  const urls = [...xml.matchAll(/<url>([\s\S]*?)<\/url>/g)].map((m) => m[1]);
  assert.ok(urls.length > 20);
  for (const u of urls) assert.match(u, /<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/, u);
});

test("robots.txt no longer describes the retired /demo/ workspace as live", () => {
  const robots = readFileSync(join(out, "robots.txt"), "utf8");
  assert.doesNotMatch(robots, /four internal links/);
  assert.match(robots, /^User-agent: \*\nAllow: \//);
  assert.match(robots, /Sitemap: https:\/\/fowned\.live\/sitemap\.xml/);
});

test("HSTS is sent on every path", () => {
  const headers = readFileSync(join(out, "_headers"), "utf8");
  assert.match(headers, /\/\*\n(?:  .*\n)*  Strict-Transport-Security: max-age=31536000\n/);
});
