/**
 * Link-graph and title fixes from the 2026-10-26 audit. The three /answers/
 * pages had 1 to 3 internal inlinks each (one of them was linked only from
 * /resources/), and four titles ran long or named the brand twice.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync } from "node:fs";
import { render } from "../src/layout.mjs";

const pages = await Promise.all(
  readdirSync("src/pages").filter((f) => f.endsWith(".mjs")).sort()
    .map(async (f) => (await import("../src/pages/" + f)).default)
);
const answers = pages.filter((p) => p.path.startsWith("/answers/"));

test("every page's footer links every answer page", () => {
  assert.equal(answers.length, 3);
  for (const p of pages) {
    const footer = render(p).split("<footer")[1];
    for (const a of answers) assert.ok(footer.includes(`href="${a.path}"`), `${p.path} footer lacks ${a.path}`);
  }
});

test("the retitled pages fit in 60 characters and name the brand once", () => {
  for (const path of ["/geo/", "/how-it-works/", "/about/", "/guides/ai-visibility-audit-for-local-businesses/"]) {
    const p = pages.find((x) => x.path === path);
    assert.ok(p.title.length <= 60, `${path}: ${p.title.length} chars`);
    assert.equal(p.title.match(/Fowned/g).length, 1, `${path}: ${p.title}`);
  }
});

test("the /guides/ description fits in 160 characters", () => {
  const p = pages.find((x) => x.path === "/guides/");
  assert.ok(p.description.length <= 160, `${p.description.length} chars`);
});
