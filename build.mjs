/**
 * Fowned static build.
 *
 * Cloudflare Pages direct-upload publishes whatever directory it is handed, so
 * the deployable surface is assembled by ALLOWLIST here rather than trimmed by
 * exclusion later. docs/ and legacy-site/ are tracked in this repo and must
 * never reach the CDN.
 *
 * Also enforced here, because a build is the only place a rule actually holds:
 *   - every internal href resolves to a page this build produced (no dead links)
 *   - only referenced images are copied (2 unused 1MB PNGs used to ship)
 */
import { mkdirSync, rmSync, writeFileSync, cpSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { execFileSync } from "node:child_process";
import { render, NAV, DEMO_NAV, SITE, bookingUrl } from "./src/layout.mjs";

/* BUILD_OUT exists for the tests: each test file builds into its own temp dir,
 * because parallel files sharing dist/ deleted each other's output mid-read.
 * deploy.sh never sets it, so production still builds and uploads dist/. */
const OUT = process.env.BUILD_OUT || "dist";
rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

/* ---- pages ------------------------------------------------------------- */
const files = readdirSync("src/pages").filter((f) => f.endsWith(".mjs")).sort();
const pages = [];

/* Content dates come from git, per page module: the last commit that touched
 * the file is dateModified (and sitemap lastmod), the first is datePublished.
 * A layout or CSS change is not a content change, so it does not bump them.
 *
 * A shallow clone (CI's default checkout) holds one commit, so every page
 * would report that commit's date: confidently wrong rather than missing. In a
 * shallow clone, outside git, or for an uncommitted file the dates are omitted
 * rather than invented, and the warning says why. tests/seo-structure.test.mjs
 * fails on missing dates, so CI must check out full history. */
let shallow = false;
try {
  shallow = execFileSync("git", ["rev-parse", "--is-shallow-repository"], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim() === "true";
} catch {
  console.warn("WARN: not a git checkout; Article dates and sitemap lastmod omitted");
}
if (shallow) console.warn("WARN: shallow git clone; Article dates and sitemap lastmod omitted");
const gitDates = (file) => {
  if (shallow) return {};
  try {
    const out = execFileSync("git", ["log", "--follow", "--format=%cs", "--", file], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] })
      .trim().split("\n").filter(Boolean);
    return out.length ? { dateModified: out[0], datePublished: out.at(-1) } : {};
  } catch {
    return {};
  }
};

for (const f of files) {
  const mod = await import("./src/pages/" + f);
  pages.push({ ...mod.default, ...gitDates("src/pages/" + f) });
}

for (const p of pages) {
  const rel = p.path === "/" ? "index.html" : join(p.path.replace(/^\/|\/$/g, ""), "index.html");
  const dest = join(OUT, rel);
  mkdirSync(dirname(dest), { recursive: true });
  writeFileSync(dest, render(p));
}

/* 404: Pages serves this for any unmatched path. Without it every bad URL
 * silently returns the homepage with a 200, which is a soft-404 - bad for
 * crawlers and worse in a demo, where a typo looks like the app working. */
const notFound = pages.find((p) => p.path === "/404/");
if (notFound) writeFileSync(join(OUT, "404.html"), render(notFound));

/* ---- assets ------------------------------------------------------------ */
cpSync("css", join(OUT, "css"), { recursive: true });
cpSync("js", join(OUT, "js"), { recursive: true });

const html = pages.map((p) => render(p)).join("\n") + readFileSync("css/style.css", "utf8");
mkdirSync(join(OUT, "images"), { recursive: true });
/* The BIMI logo is referenced by a DNS TXT record, never by a page, so the
 * unreferenced-image prune below would silently drop it and the BIMI record
 * would point at a 404. ponytail: one-name allowlist; widen to an array if a
 * second DNS-referenced asset ever appears. */
const ALWAYS_COPY = new Set(["fowned-bimi.svg"]);

let copied = 0, skipped = [];
for (const img of readdirSync("images")) {
  if (html.includes("images/" + img) || ALWAYS_COPY.has(img)) {
    cpSync(join("images", img), join(OUT, "images", img));
    copied++;
  } else skipped.push(img);
}

cpSync("_headers", join(OUT, "_headers"));
cpSync("_redirects", join(OUT, "_redirects"));

/* ---- IndexNow key ------------------------------------------------------ */
/* IndexNow lets us TELL Bing (and Yandex, Seznam, Naver) a URL changed instead
 * of waiting to be recrawled. Ownership is proved by serving the key as a
 * plain-text file at the site root whose contents are the key itself.
 *
 * The key is committed at indexnow.key rather than generated here on purpose.
 * A key regenerated per build would invalidate every previously submitted URL
 * the moment the old file stopped being served, which is the one thing that
 * turns this from free into actively harmful.
 *
 * The PING is deliberately not done here. A build produces dist/; it does not
 * publish it. Pinging from this file would announce URLs whose new content is
 * not live yet and whose key file cannot be fetched, so the engines would
 * either read stale content or reject the submission outright. The ping is
 * tools/indexnow-ping.sh, run after a deploy lands. */
const indexNowKey = readFileSync("indexnow.key", "utf8").trim();
if (!/^[a-zA-Z0-9-]{8,128}$/.test(indexNowKey)) {
  console.error(`indexnow.key must be 8-128 chars of [a-zA-Z0-9-]; got ${indexNowKey.length}`);
  process.exit(1);
}
writeFileSync(join(OUT, `${indexNowKey}.txt`), indexNowKey);
// Bing Webmaster Tools file verification. Root-served, contents never logged.
cpSync("BingSiteAuth.xml", join(OUT, "BingSiteAuth.xml"));

/* ---- robots + sitemap -------------------------------------------------- */
/* THE robots.txt for the real property. Not a fallback: functions/_middleware.js
 * now intercepts /robots.txt only on the temporary *.pages.dev hostnames, and
 * lets every other host fall through to this file.
 *
 * It used to be a fallback behind a second, near-identical copy of this body
 * inside the middleware. Two copies of a rule that must agree is not redundancy,
 * it is a drift bug with a delay on it: an edit landing in one copy and not the
 * other produces a site whose crawler policy depends on which layer answered.
 * One copy, one owner.
 *
 * The permissiveness here is deliberate and the failure modes are not
 * symmetric. A stray Disallow on fowned.live costs the entire launch and does
 * it silently, while the temporary host being crawlable costs a duplicate
 * nobody links to. Both hostnames are still verified by live probe after every
 * deploy rather than assumed. */
writeFileSync(join(OUT, "robots.txt"), `User-agent: *
Allow: /

# This file states crawler intent only. Cloudflare's bot settings sit in front
# of it and can refuse a crawler this file allows, so a change here is checked
# by fetching a page with each user agent, not by reading this file.

# AI assistants are named explicitly rather than left to the wildcard above.
# Without a matching group these crawlers fall through to "User-agent: *", which
# happens to permit them today, but that is an accident of the wildcard rather
# than a stated intent, and a later edit to the wildcard would silently change
# it. The rule below states the intent: Fowned WANTS to be read and cited by
# assistants.
#
# Retrieval and training crawlers are different agents and being permissive to
# one says nothing about the other. GPTBot trains; OAI-SearchBot builds the
# index ChatGPT actually retrieves from, and it was missing from this list while
# GPTBot was present, which is the wrong half to name for a citation goal.
User-agent: ClaudeBot
User-agent: Claude-SearchBot
User-agent: anthropic-ai
User-agent: GPTBot
User-agent: OAI-SearchBot
User-agent: ChatGPT-User
User-agent: PerplexityBot
User-agent: Perplexity-User
User-agent: Google-Extended
User-agent: Applebot-Extended
Allow: /

# GSC Wizard on-page SEO checker. Fetches one page at a time, only when the
# site owner opens the report. https://www.gscwizard.com/onpage-seo-bot.html
User-agent: GSCWizard-Bot
Allow: /

Sitemap: ${SITE.origin}/sitemap.xml
`);

/* Sitemap carries the marketing property only. The demo workspace is invented
 * data, and a sitemap is a positive request to index every URL in it, which is
 * the opposite of what those pages need. Their exclusion is enforced at the
 * page level by the robots meta tag in src/layout.mjs; leaving them out here
 * keeps this file from asking for the thing that tag refuses. */
const urls = pages.filter((p) => !["/404/", "/410/"].includes(p.path) && !p.path.startsWith("/demo/"));
const lastmod = (p) => (p.dateModified ? `<lastmod>${p.dateModified}</lastmod>` : "");
writeFileSync(join(OUT, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((p) => `  <url><loc>${SITE.origin}${p.path}</loc>${lastmod(p)}</url>`).join("\n")}
</urlset>
`);

/* ---- llms.txt ---------------------------------------------------------- */
/* A plain-text map of the site for assistants that fetch it, generated from the
 * same page list the sitemap uses so the two can never disagree. citability
 * scores this as a CRAWL-ACCESS signal, not a citation lever: there is no
 * published evidence that the file lifts citation rates, so it is here because
 * it makes the site legible in one request, not because it buys rankings.
 *
 * The demo workspace is excluded here too, which is the point: the page-level
 * noindex, the sitemap and llms.txt are three different readers being told the
 * same thing, and a page that is invented data should be missing from all three
 * or it will be quoted as fact by whichever one was forgotten. */
const listed = pages.filter((p) => !["/404/", "/410/"].includes(p.path) && !p.path.startsWith("/demo/"));
writeFileSync(join(OUT, "llms.txt"), `# ${SITE.name}

> ${SITE.name} is a generative engine optimization agency. We audit how AI assistants describe a business, repair the signals they read, and report which leads arrived from an AI tool.

## Pages

${listed.map((p) => `- [${p.title.replace(/ \| Fowned$/, "")}](${SITE.origin}${p.path}): ${p.description}`).join("\n")}

## Contact

- Book a call: ${SITE.bookingUrl ? bookingUrl("/llms.txt") : SITE.origin + "/contact/"}
- Phone: ${SITE.phoneText}
- LinkedIn: ${SITE.linkedin}
`);

/* ---- link check: fail the build on a dead internal link ---------------- */
const known = new Set(pages.map((p) => p.path));
const dead = [];
for (const p of pages) {
  const out = render(p);
  for (const m of out.matchAll(/href="(\/[^"#?]*)"/g)) {
    const href = m[1];
    if (href.startsWith("/css/") || href.startsWith("/js/") || href.startsWith("/images/")) continue;
    if (href === "/sitemap.xml" || href === "/robots.txt") continue;
    if (!known.has(href)) dead.push(`${p.path} -> ${href}`);
  }
}
if (dead.length) {
  console.error("DEAD INTERNAL LINKS:\n  " + [...new Set(dead)].join("\n  "));
  process.exit(1);
}

/* ---- report ------------------------------------------------------------ */
const walk = (d) => readdirSync(d, { withFileTypes: true }).flatMap((e) =>
  e.isDirectory() ? walk(join(d, e.name)) : [join(d, e.name)]);
const all = walk(OUT);
const bytes = all.reduce((n, f) => n + statSync(f).size, 0);
console.log(`built ${pages.length} pages, ${all.length} files, ${(bytes / 1024).toFixed(0)} KB`);
console.log(`images copied ${copied}, skipped unreferenced: ${skipped.join(", ") || "none"}`);
console.log(`internal links: all ${known.size} routes resolve`);
console.log(`indexnow key file: ${indexNowKey.slice(0, 4)}...${indexNowKey.slice(-4)}.txt`);
