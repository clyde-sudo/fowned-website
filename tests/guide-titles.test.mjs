/**
 * Slice D: the four guides that compete for "GEO / local SEO / ChatGPT" search
 * get titles and metas that fit in a results page, and the two GEO pages stop
 * competing with each other. Reads the built HTML, which is what Google gets.
 */
import { test, before } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const PAGES = {
  compare: "/guides/local-seo-vs-geo-vs-aeo/",
  geo: "/guides/geo-for-local-businesses/",
  track: "/guides/how-to-track-leads-from-chatgpt/",
  sources: "/guides/what-sources-chatgpt-uses-to-recommend-local-businesses/",
};
// Each GEO page's primary phrase, which the other must not carry in its title or h1.
const PRIMARY = { compare: /local seo vs geo vs aeo/i, geo: /geo for (a )?local business(es)?/i };

const html = {};
const decode = (s) => s.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
const title = (h) => decode(h.match(/<title>([^<]*)<\/title>/)[1]);
const meta = (h) => decode(h.match(/<meta name="description" content="([^"]*)"/)[1]);
const h1 = (h) => decode(h.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)[1].replace(/<[^>]+>/g, "").trim());
const mainText = (h) =>
  decode(h.slice(h.indexOf("<main"), h.indexOf("</main>")).replace(/<script[\s\S]*?<\/script>/g, " ").replace(/<[^>]+>/g, " "))
    .toLowerCase().replace(/[^a-z0-9' ]+/g, " ").split(/\s+/).filter(Boolean);
const shingles = (words, n = 5) => new Set(words.slice(0, words.length - n + 1).map((_, i) => words.slice(i, i + n).join(" ")));

before(() => {
  execFileSync(process.execPath, ["build.mjs"], { stdio: "ignore" });
  for (const [k, p] of Object.entries(PAGES)) html[k] = readFileSync(`dist${p}index.html`, "utf8");
});

test("the brief's titles are live", () => {
  assert.match(title(html.compare), /^Local SEO vs GEO vs AEO: which to fund first/);
  assert.match(title(html.geo), /^GEO for local businesses: does yours need it\?/);
  assert.match(title(html.track), /^How do I know which leads found me from ChatGPT\?/);
  assert.match(title(html.sources), /^What sources does ChatGPT use to recommend local businesses\?/);
});

for (const [k, p] of Object.entries(PAGES)) {
  test(`${p}: title of 60 characters or fewer, meta of 160 or fewer`, () => {
    const t = title(html[k]);
    const m = meta(html[k]);
    assert.ok(t.length <= 60, `title is ${t.length}: ${t}`);
    assert.ok(m.length <= 160, `meta is ${m.length}: ${m}`);
  });
}

test("neither GEO page carries the other's primary phrase in its title or h1", () => {
  for (const s of [title(html.compare), h1(html.compare)]) assert.doesNotMatch(s, PRIMARY.geo, s);
  for (const s of [title(html.geo), h1(html.geo)]) assert.doesNotMatch(s, PRIMARY.compare, s);
});

test("the comparison page's title, meta and h1 are comparison-only", () => {
  for (const s of [title(html.compare), meta(html.compare), h1(html.compare)]) {
    assert.doesNotMatch(s, /for (a )?local business(es)?/i, s);
  }
});

test("the comparison page links to the GEO guide once in its body, with the anchor 'GEO for local businesses'", () => {
  const body = html.compare.slice(html.compare.indexOf("<main"), html.compare.indexOf("</main>"));
  const links = [...body.matchAll(/<a [^>]*href="\/guides\/geo-for-local-businesses\/"[^>]*>([^<]*)<\/a>/g)].map((m) => m[1]);
  assert.equal(links.filter((t) => t === "GEO for local businesses").length, 1, JSON.stringify(links));
});

test("the two GEO pages share 30 percent or less of their 5-word shingles", (t) => {
  const a = shingles(mainText(html.compare));
  const b = shingles(mainText(html.geo));
  const shared = [...a].filter((s) => b.has(s)).length;
  const overlap = shared / Math.min(a.size, b.size);
  t.diagnostic(`5-word shingle overlap: ${(overlap * 100).toFixed(1)}% (${shared} shared of ${a.size} and ${b.size})`);
  assert.ok(overlap <= 0.3, `overlap ${(overlap * 100).toFixed(1)}%`);
});
