/**
 * tools/crawler-access.mjs, offline. The live run happens in deploy.sh and the
 * daily sensor; here a fake fetch replays what Cloudflare actually did.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { robotsBlocksRoot, checkHost, parseCurl, CRAWLERS } from "../tools/crawler-access.mjs";
import { buildSite } from "./helpers/build.mjs";

test("a named group overrides the * group", () => {
  const txt = "User-agent: *\nAllow: /\n\nUser-agent: GPTBot\nDisallow: /\n";
  assert.equal(robotsBlocksRoot(txt, "GPTBot"), true);
  assert.equal(robotsBlocksRoot(txt, "ClaudeBot"), false);
});

test("consecutive User-agent lines share one group", () => {
  const txt = "User-agent: CCBot\nUser-agent: Bytespider\nDisallow: /\n";
  assert.equal(robotsBlocksRoot(txt, "Bytespider"), true);
  assert.equal(robotsBlocksRoot(txt, "CCBot"), true);
});

test("the most specific name wins, and groups sharing it merge", () => {
  const txt = "User-agent: GPT\nDisallow: /\n\nUser-agent: GPTBot\nDisallow: /private/\n";
  assert.equal(robotsBlocksRoot(txt, "GPTBot"), false);
  assert.equal(robotsBlocksRoot("User-agent: GPTBot\nAllow: /x\n\nUser-agent: GPTBot\nDisallow: /\n", "GPTBot"), true);
});

test("a path-only Disallow does not count as blocking the site", () => {
  assert.equal(robotsBlocksRoot("User-agent: *\nDisallow: /admin/\n", "GPTBot"), false);
  assert.equal(robotsBlocksRoot("User-agent: *\nDisallow:\n", "GPTBot"), false);
});

test("the robots.txt we ship allows every crawler the check cares about", () => {
  const robots = readFileSync(buildSite({ SITE_ORIGIN: "https://fowned.live" }) + "/robots.txt", "utf8");
  for (const { name } of CRAWLERS) assert.equal(robotsBlocksRoot(robots, name), false, name);
});

// What fowned.live served until 2026-10-26: robots.txt allowed everyone, and
// Cloudflare's Training=Disallow policy answered the training crawlers with 403.
const TRAINING = ["GPTBot", "ClaudeBot", "anthropic-ai", "CCBot", "Amazonbot"];
const cloudflare = (codeFor) => async (url, opts = {}) => {
  if (url.endsWith("/robots.txt")) return new Response("User-agent: *\nAllow: /\n");
  const ua = opts.headers?.["User-Agent"] || "";
  return new Response("", { status: codeFor(ua) });
};

test("the 2026-10-26 Cloudflare training block fails the check, crawler by crawler", async () => {
  const fetchImpl = cloudflare((ua) => (TRAINING.some((t) => ua.startsWith(t) || ua.includes(`${t}/`)) ? 403 : 200));
  const rows = await checkHost("example.test", { fetchImpl, retryDelayMs: 0 });
  const failed = rows.filter((r) => !r.ok).map((r) => r.ua).sort();
  assert.deepEqual(failed, [...TRAINING].sort());
});

test("a fully open site passes", async () => {
  const rows = await checkHost("example.test", { fetchImpl: cloudflare(() => 200), retryDelayMs: 0 });
  assert.ok(rows.every((r) => r.ok));
});

test("a 429 or 5xx is unmeasured, never a pass and never a refusal", async () => {
  const rows = await checkHost("example.test", { fetchImpl: cloudflare(() => 503), retryDelayMs: 0 });
  assert.ok(rows.every((r) => r.actual === "unmeasured" && !r.ok));
});

test("a robots.txt that will not load is an error, not an empty file that allows everything", async () => {
  const fetchImpl = async () => new Response("", { status: 404 });
  await assert.rejects(checkHost("example.test", { fetchImpl, retryDelayMs: 0 }), /robots.txt returned 404/);
});

test("a Vercel challenge is unmeasured, never a refusal", async () => {
  const fetchImpl = async (url) =>
    url.endsWith("/robots.txt")
      ? new Response("User-agent: *\nAllow: /\n")
      : new Response("", { status: 403, headers: { "x-vercel-mitigated": "challenge" } });
  const rows = await checkHost("example.test", { fetchImpl, retryDelayMs: 0 });
  assert.ok(rows.every((r) => r.actual === "unmeasured" && !r.ok));
});

test("one throttled answer is retried before it is judged", async () => {
  const seen = new Map();
  const fetchImpl = async (url, opts = {}) => {
    if (url.endsWith("/robots.txt")) return new Response("User-agent: *\nAllow: /\n");
    const ua = opts.headers["User-Agent"];
    seen.set(ua, (seen.get(ua) || 0) + 1);
    return new Response("", { status: seen.get(ua) === 1 ? 403 : 200 });
  };
  const rows = await checkHost("example.test", { fetchImpl, retryDelayMs: 0 });
  assert.ok(rows.every((r) => r.ok));
});

test("a Vercel challenge is asked again through the fallback client", async () => {
  const challenged = async (url) =>
    url.endsWith("/robots.txt")
      ? new Response("User-agent: *\nAllow: /\n")
      : new Response("", { status: 403, headers: { "x-vercel-mitigated": "challenge" } });
  const fallbackImpl = async () => new Response("", { status: 200 });
  const rows = await checkHost("example.test", { fetchImpl: challenged, retryDelayMs: 0, fallbackImpl });
  assert.ok(rows.every((r) => r.ok));
});

test("curl output is read as status, headers and body; anything else is an error", () => {
  const res = parseCurl("HTTP/2 403\r\nx-vercel-mitigated: challenge\r\n\r\nbody");
  assert.equal(res.status, 403);
  assert.equal(res.headers.get("x-vercel-mitigated"), "challenge");
  assert.throws(() => parseCurl("garbage data"), /no HTTP response/);
  assert.throws(() => parseCurl("garbage\r\n\r\nbody"), /no HTTP response/);
});
