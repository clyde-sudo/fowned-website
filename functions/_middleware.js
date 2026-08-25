/**
 * Host-aware edge rules for the Fowned Pages project.
 *
 * WHY THIS EXISTS
 * One deployment answers on several hostnames: the real property
 * (fowned.live), its www alias, and the temporary Cloudflare hostnames
 * (fowned.pages.dev plus a per-deployment subdomain). Those hostnames need
 * OPPOSITE indexing rules, and neither `_headers` nor a <meta> tag baked into
 * the HTML can tell them apart, because both are host-blind by construction.
 * So the rule is applied here, where the request Host is actually readable.
 *
 * Getting this wrong is expensive in one specific direction: a stray
 * `X-Robots-Tag: noindex` left on the real domain silently keeps the launch
 * property out of the index while every dashboard reports a healthy site.
 * The allowlist below is therefore written so the temporary host is the case
 * that must be positively matched, and the real domain is the default.
 */

/** Hostnames Cloudflare hands out for free. Never the canonical property. */
const isTemporaryHost = (host) => host.endsWith(".pages.dev");

/** Canonical apex. www redirects here so link equity lands on one hostname. */
const CANONICAL_HOST = "fowned.live";

const ROBOTS_INDEXABLE = (origin) => `User-agent: *
Allow: /

# The demo workspace is seeded with invented companies. It is reachable for a
# human being walked through it, but it is not content anyone should find in a
# search result, so it is excluded here rather than left to chance.
Disallow: /demo/

# AI assistants are named explicitly rather than left to the wildcard above.
# Without a matching group these crawlers fall through to "User-agent: *", which
# happens to permit them today, but that is an accident of the wildcard rather
# than a stated intent, and a later edit to the wildcard would silently change
# it. The rule below states the intent: Fowned WANTS to be read and cited by
# assistants, and the only exclusion is the invented-company demo workspace.
User-agent: ClaudeBot
User-agent: anthropic-ai
User-agent: GPTBot
User-agent: ChatGPT-User
User-agent: PerplexityBot
User-agent: Google-Extended
Allow: /
Disallow: /demo/

Sitemap: ${origin}/sitemap.xml
`;

const ROBOTS_TEMPORARY = `# Temporary Cloudflare hostname, not the Fowned property.
# The real site is https://fowned.live and search equity belongs there. Equity
# earned on a *.pages.dev host cannot be moved later, and a full duplicate of
# the real site competing with it in the index is a net loss.
User-agent: *
Disallow: /
`;

export async function onRequest(context) {
  const { request, next } = context;
  const url = new URL(request.url);
  const host = url.hostname.toLowerCase();

  /* www -> apex, permanently, preserving path and query. Done before anything
   * else so a redirected request never also pays for asset work. */
  if (host === "www." + CANONICAL_HOST) {
    url.hostname = CANONICAL_HOST;
    return Response.redirect(url.toString(), 301);
  }

  const temporary = isTemporaryHost(host);

  if (url.pathname === "/robots.txt") {
    return new Response(
      temporary ? ROBOTS_TEMPORARY : ROBOTS_INDEXABLE(url.origin),
      { headers: { "Content-Type": "text/plain; charset=utf-8" } }
    );
  }

  const response = await next();

  if (temporary) {
    /* Mutable copy: the response from next() has immutable headers. */
    const out = new Response(response.body, response);
    out.headers.set("X-Robots-Tag", "noindex, nofollow");
    return out;
  }

  return response;
}
