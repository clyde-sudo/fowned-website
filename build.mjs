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
import { render, NAV, DEMO_NAV, SITE } from "./src/layout.mjs";

const OUT = "dist";
rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

/* ---- pages ------------------------------------------------------------- */
const files = readdirSync("src/pages").filter((f) => f.endsWith(".mjs")).sort();
const pages = [];
for (const f of files) {
  const mod = await import("./src/pages/" + f);
  pages.push(mod.default);
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
let copied = 0, skipped = [];
for (const img of readdirSync("images")) {
  if (html.includes("images/" + img)) {
    cpSync(join("images", img), join(OUT, "images", img));
    copied++;
  } else skipped.push(img);
}

cpSync("_headers", join(OUT, "_headers"));

/* ---- robots + sitemap -------------------------------------------------- */
/* robots.txt is normally served by functions/_middleware.js, which picks the
 * body per hostname. This static file is the FALLBACK for the case where the
 * Function fails to deploy, and it is deliberately the permissive one.
 *
 * The two failure modes are not symmetric. A stray Disallow on fowned.live
 * costs the entire launch and does it silently, while the temporary pages.dev
 * host being crawlable costs a duplicate nobody links to. So the fallback
 * favours the real domain, and the middleware is verified by live probe on
 * both hostnames rather than assumed. */
writeFileSync(join(OUT, "robots.txt"), `User-agent: *
Allow: /

# Seeded with invented companies. Reachable for a walkthrough, not for a SERP.
Disallow: /demo/

Sitemap: ${SITE.origin}/sitemap.xml
`);

/* Sitemap carries the marketing property only. The demo workspace is excluded
 * for the same reason robots excludes it, and listing a URL in a sitemap while
 * disallowing it in robots is a contradiction crawlers report as an error. */
const urls = pages
  .filter((p) => p.path !== "/404/" && !p.path.startsWith("/demo/"))
  .map((p) => p.path);
writeFileSync(join(OUT, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${SITE.origin}${u}</loc></url>`).join("\n")}
</urlset>
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
