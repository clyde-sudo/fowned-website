/**
 * Proves that the crawlers robots.txt invites can actually reach the site.
 *
 * robots.txt states intent; Cloudflare sits in front of it and answers first.
 * From launch until 2026-10-26 the zone's "Configure AI bot policies" had
 * Training set to Disallow, so GPTBot, ClaudeBot, anthropic-ai, CCBot and
 * Amazonbot got a 403 while robots.txt said Allow. Every audit read robots.txt
 * and none of them fetched the site as the crawler, so nothing caught it until
 * the operator asked. This check fetches as each crawler and fails when the CDN
 * refuses one that robots.txt allows (or allows one that robots.txt refuses).
 *
 * Limits: the request comes from this machine with a crawler's user agent, not
 * from the crawler's own IPs. Cloudflare's AI block matches on the user agent,
 * so a 403 here is a real refusal; a 200 does not prove the real crawler gets
 * through. AI Crawl Control > Metrics in the dashboard shows real crawler hits.
 *
 * Usage:  node tools/crawler-access.mjs [host ...]   (default: fowned.live)
 * Exit:   0 every crawler gets the answer robots.txt gives it
 *         1 at least one does not (a real finding)
 *         2 a host could not be measured (network error, 429, 5xx); that is
 *           not a pass, and it is not a finding either
 * deploy.sh runs it after every production deploy, and
 * ~/.claude/scripts/crawler_access_sensor.sh runs it daily, because a
 * Cloudflare setting changes without any deploy.
 */

import { execFile } from "node:child_process";

// Crawlers that decide whether Fowned is found, cited or known: search
// indexes, AI search and user-triggered fetchers, and the training crawlers
// that teach models the entity exists. Each sends the user agent its operator
// publishes, because Cloudflare matches on the real string.
const AI = (token, url) => `Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; ${token}; +${url})`;
export const CRAWLERS = [
  ["Googlebot", "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"],
  ["Bingbot", "Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)"],
  ["Applebot", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15 (Applebot/0.1; +http://www.apple.com/go/applebot)"],
  ["DuckDuckBot", "DuckDuckBot/1.1; (+http://duckduckgo.com/duckduckbot.html)"],
  ["OAI-SearchBot", AI("OAI-SearchBot/1.0", "https://openai.com/searchbot")],
  ["ChatGPT-User", AI("ChatGPT-User/1.0", "https://openai.com/bot")],
  ["GPTBot", AI("GPTBot/1.2", "https://openai.com/gptbot")],
  ["Claude-SearchBot", AI("Claude-SearchBot/1.0", "Claude-SearchBot@anthropic.com")],
  ["Claude-User", AI("Claude-User/1.0", "Claude-User@anthropic.com")],
  ["ClaudeBot", AI("ClaudeBot/1.0", "claudebot@anthropic.com")],
  ["anthropic-ai", "anthropic-ai"],
  ["PerplexityBot", AI("PerplexityBot/1.0", "https://perplexity.ai/perplexitybot")],
  ["Perplexity-User", AI("Perplexity-User/1.0", "https://perplexity.ai/perplexity-user")],
  ["Google-Extended", "Mozilla/5.0 (compatible; Google-Extended)"],
  ["Applebot-Extended", "Mozilla/5.0 (compatible; Applebot-Extended/0.1; +http://www.apple.com/go/applebot)"],
  ["CCBot", "CCBot/2.0 (https://commoncrawl.org/faq/)"],
  ["Amazonbot", AI("Amazonbot/0.1", "https://developer.amazon.com/support/amazonbot")],
  ["meta-externalagent", "meta-externalagent/1.1 (+https://developers.facebook.com/docs/sharing/webmasters/crawler)"],
].map(([name, ua]) => ({ name, ua }));

/**
 * True when robots.txt disallows the whole site ("Disallow: /") for this user
 * agent. Follows Google's group choice: the most specific (longest) matching
 * User-agent name wins, so "GPTBot" beats "GPT"; groups that share that name
 * are merged (RFC 9309); "*" applies only when no named group matches.
 */
export function robotsBlocksRoot(robotsTxt, ua) {
  const groups = [];
  let cur = null;
  let lastWasAgent = false;
  for (const raw of robotsTxt.split(/\r?\n/)) {
    const line = raw.replace(/#.*/, "").trim();
    const m = line.match(/^([A-Za-z-]+)\s*:\s*(.*)$/);
    if (!m) continue;
    const key = m[1].toLowerCase();
    const value = m[2].trim();
    if (key === "user-agent") {
      if (!lastWasAgent) groups.push((cur = { agents: [], rules: [] }));
      cur.agents.push(value.toLowerCase());
      lastWasAgent = true;
    } else {
      lastWasAgent = false;
      if (cur && (key === "allow" || key === "disallow")) cur.rules.push({ key, value });
    }
  }
  const name = ua.toLowerCase();
  const best = Math.max(0, ...groups.flatMap((g) => g.agents.filter((a) => a !== "*" && name.includes(a)).map((a) => a.length)));
  const named = groups.filter((g) => g.agents.some((a) => a !== "*" && name.includes(a) && a.length === best));
  const chosen = named.length ? named : groups.filter((g) => g.agents.includes("*"));
  const rules = chosen.flatMap((g) => g.rules);
  // Longest matching rule wins; Allow beats Disallow on a tie.
  const hits = rules.filter((r) => r.value && "/".startsWith(r.value));
  hits.sort((a, b) => b.value.length - a.value.length || (a.key === "allow" ? -1 : 1));
  return hits.length > 0 && hits[0].key === "disallow";
}

// Vercel's firewall challenges bursts from one IP whatever the user agent
// (x-vercel-mitigated: challenge) and lets verified crawlers through by IP, so
// a Vercel challenge here says nothing about the real crawler. A Cloudflare
// challenge is different: no crawler can solve one, so it counts as a refusal.
const vercelChallenge = (res) => res.headers.get("x-vercel-mitigated") === "challenge";

// One retry after a pause, so a single throttled request is not read as a
// finding. A real block answers the same way twice.
// Vercel challenges Node's HTTP client by its fingerprint but not curl's, so
// a challenged request is asked again through curl before it is given up on.
async function get(url, init, fetchImpl, retryDelayMs, fallbackImpl) {
  let res = await fetchImpl(url, init);
  if (res.status !== 200 && retryDelayMs >= 0) {
    await new Promise((r) => setTimeout(r, retryDelayMs));
    res = await fetchImpl(url, init);
  }
  if (vercelChallenge(res) && fallbackImpl) res = await fallbackImpl(url, init);
  return res;
}

// fetch-shaped wrapper over curl: no redirects followed, same user agent.
export function curlFetch(url, init = {}) {
  return new Promise((resolve, reject) => {
    const ua = init.headers?.["User-Agent"] || "curl";
    execFile("curl", ["-s", "-i", "--max-time", "20", "-A", ua, url], { maxBuffer: 4 << 20 }, (err, out) => {
      if (err) return reject(err);
      const split = out.indexOf("\r\n\r\n");
      const head = out.slice(0, split).split("\r\n");
      const headers = new Headers();
      for (const line of head.slice(1)) {
        const i = line.indexOf(":");
        if (i > 0) headers.append(line.slice(0, i).trim(), line.slice(i + 1).trim());
      }
      resolve(new Response(out.slice(split + 4), { status: Number(head[0].split(" ")[1]), headers }));
    });
  });
}

// A 429, a 5xx or a Vercel challenge says the request was not judged, so it
// cannot count as either a refusal or a pass.
const unmeasured = (res) => res.status === 429 || res.status >= 500 || vercelChallenge(res);

export async function checkHost(host, { crawlers = CRAWLERS, fetchImpl = fetch, retryDelayMs = 2000, fallbackImpl = null } = {}) {
  const ROBOTS_UA = CRAWLERS[0].ua;
  const res = await get(`https://${host}/robots.txt`, { headers: { "User-Agent": ROBOTS_UA } }, fetchImpl, retryDelayMs, fallbackImpl);
  if (res.status !== 200) throw new Error(`robots.txt returned ${res.status}${vercelChallenge(res) ? " (Vercel challenge)" : ""}`);
  const robots = await res.text();
  const rows = [];
  for (const { name, ua } of crawlers) {
    const page = await get(`https://${host}/`, { headers: { "User-Agent": ua }, redirect: "manual" }, fetchImpl, retryDelayMs, fallbackImpl);
    const code = page.status;
    const intended = robotsBlocksRoot(robots, name) ? "blocked" : "allowed";
    const actual = unmeasured(page) ? "unmeasured" : code === 200 ? "allowed" : "blocked";
    rows.push({ ua: name, code, intended, actual, ok: intended === actual });
  }
  return rows;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const hosts = process.argv.slice(2).length ? process.argv.slice(2) : ["fowned.live"];
  let bad = 0;
  let unknown = 0;
  for (const host of hosts) {
    console.log(host);
    let rows;
    try {
      rows = await checkHost(host, { fallbackImpl: curlFetch });
    } catch (err) {
      console.log(`  UNMEASURED  ${err.message}`);
      unknown++;
      continue;
    }
    for (const r of rows) {
      const tag = r.actual === "unmeasured" ? "????" : r.ok ? "ok  " : "FAIL";
      console.log(`  ${tag}  ${r.ua.padEnd(19)} ${r.code}  robots.txt: ${r.intended}`);
      if (r.actual === "unmeasured") unknown++;
      else if (!r.ok) bad++;
    }
  }
  if (bad) {
    console.log(`\nFAIL: ${bad} crawler(s) get a different answer from the CDN than robots.txt gives them.`);
    console.log("Check Cloudflare: Security > Settings > Configure AI bot policies, and AI Crawl Control.");
    process.exit(1);
  }
  if (unknown) {
    console.log(`\nUNMEASURED: ${unknown} check(s) got no answer. This is not a pass.`);
    process.exit(2);
  }
}
