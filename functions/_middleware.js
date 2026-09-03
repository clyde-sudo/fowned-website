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

  /* Only the temporary host needs a robots.txt this layer can generate; it is
   * the one body that has to differ from what the build produced. Every other
   * host falls through to the static dist/robots.txt, which is why that file
   * is now the single source of the real property's crawler policy instead of
   * a second copy maintained in parallel with this one.
   *
   * The short cache TTL that used to be set here moved to _headers, and it is
   * not a nicety: without it the response inherits the zone-wide Browser Cache
   * TTL of four hours, and a deploy does NOT evict an already-cached edge
   * response. That combination cost a real verification once, when a corrected
   * robots.txt shipped and the edge kept serving the old body for hours while
   * every check looked like the deploy had failed. */
  if (temporary && url.pathname === "/robots.txt") {
    return new Response(ROBOTS_TEMPORARY, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "public, max-age=300",
      },
    });
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
