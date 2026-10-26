/**
 * Shared page shell for every Fowned surface.
 *
 * One layout, two chromes. The marketing chrome is the brand surface the
 * existing homepage already established (logo + hamburger panel); the demo
 * chrome adds a sidebar and a standing DEMO banner. They share the same head,
 * the same tokens and the same footer so a visitor never crosses a seam.
 *
 * Design contract: DESIGN.md. Tokens come from css/style.css only. No
 * Citability token is imported here, ever - Fowned is a tenant of that
 * backend, which is a backend fact with no visual consequence.
 */

/* ------------------------------------------------------------------------ *
 * CONFIGURATION POINT. Everything an operator needs to change at launch is
 * in this one object. Nothing below it needs editing.
 * ------------------------------------------------------------------------ */

/* Canonical origin. Defaults to the temporary Pages hostname and is overridden
 * at build time once the real domain actually serves the site:
 *
 *     SITE_ORIGIN=https://fowned.live node build.mjs
 *
 * It is an env var rather than a constant because a canonical, a sitemap entry
 * and an og:url that name a host which does not resolve yet are not "ready for
 * launch", they are wrong. The flip happens when DNS does, not before.
 *
 * DNS flipped, so the default flipped with it (2026-08-31). It defaulted to the
 * pages.dev host for the pre-launch window, and every production build after
 * launch quietly inherited that default because nobody remembered to export the
 * variable. The result was the whole site telling search engines its canonical
 * URL was on fowned.pages.dev, a host whose robots.txt disallows everything, so
 * the real domain was pointing crawlers at a page they are forbidden to read.
 * A default that has to be remembered on every deploy is not a default. The
 * real domain is now the default and the temporary host is the override, which
 * is also harmless there: _middleware.js already serves the pages.dev host a
 * noindex, so a canonical naming the real site is exactly what it should say. */
const ORIGIN = process.env.SITE_ORIGIN || "https://fowned.live";

/* Booking link. Calendly, Clyde Sada's 30-minute slot, supplied by the operator
 * 2026-08-25 and verified live (HTTP 200) before it was written here. The
 * earlier note expected a Cal.com link from Jack; the real one is Calendly, so
 * the provider is named as what it is rather than what was anticipated.
 *
 * A literal default rather than env-var-only: BOOKING_URL still overrides it,
 * but a build that forgets the flag now ships the real link instead of silently
 * reverting every BOOK A CALL button to /contact/. Set this back to "" to
 * deliberately route bookings at the contact form again. */
const BOOKING_URL = process.env.BOOKING_URL || "https://calendly.com/clyde-thrulead/30min";

/* RB2B visitor-identification key. Empty string = not installed, which is the
 * correct state today. Deliberately NOT populated with the Citability key: that
 * key is scoped to a different tenant, so firing it here would attribute Fowned
 * visitors to Citability's dashboard and poison both. When Fowned has its own
 * key, set RB2B_KEY at build time; nothing else needs to change. */
const RB2B_KEY = process.env.RB2B_KEY || "";

/* GA4 measurement ID for the fowned.live property (account 366810033, web
 * stream 15749588848, created 2026-09-09). The ID is public by design, so the
 * live value is the default and a missing variable cannot silently ship an
 * untagged site. Set GA4_MEASUREMENT_ID="" at build time to omit the tag. */
const GA4_ID = process.env.GA4_MEASUREMENT_ID ?? "G-EJZ4SZ1GY9";

/* Turnstile is wired end to end but INERT until both keys exist: the public
 * site key here (build time) and TURNSTILE_SECRET_KEY as a Pages secret (run
 * time). Shipping the widget with an empty key would render a permanently
 * failing challenge and block every real enquiry, so an unset key means the
 * widget is simply not emitted and the honeypot plus the origin check carry
 * the load on their own. */
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

/* Cache-bust local assets by content hash.
 *
 * /css/* and /js/* are served with max-age=3600 and no fingerprint in the
 * filename, and a Pages deploy does NOT evict an object the edge already
 * holds. Correct CSS shipped twice in one session and stayed invisible to
 * real visitors for up to an hour each time, which is not a caching nicety:
 * it means a shipped fix is not actually delivered. A content hash in the
 * query string changes the cache key, so a changed file is fetched at once
 * and an unchanged one still gets a cache hit. Verified on this zone that
 * the query string is part of the cache key. */
const assetVersions = new Map();
function v(path) {
  if (!assetVersions.has(path)) {
    let out = path;
    try {
      const hash = createHash("sha256")
        .update(readFileSync("." + path))
        .digest("hex")
        .slice(0, 8);
      out = `${path}?v=${hash}`;
    } catch {
      /* A missing asset is the build's link checker to report, not ours to
       * crash on. Fall back to the bare path. */
    }
    assetVersions.set(path, out);
  }
  return assetVersions.get(path);
}

/* The site key is PUBLIC by design: Cloudflare ships it in the HTML for every
 * visitor to read. It is checked in deliberately, because when it lived only
 * in a shell env var a plain `node build.mjs` silently dropped the widget from
 * every page, and with TURNSTILE_SECRET_KEY set the API is fail-closed, so
 * that build would have 403'd every real lead. The env var still overrides,
 * for staging keys. The SECRET key is a Pages secret and is never in git. */
const TURNSTILE_SITE_KEY =
  process.env.TURNSTILE_SITE_KEY || "0x4AAAAAAEmXEc7D3kVZl4Hn";

export const SITE = {
  turnstileSiteKey: TURNSTILE_SITE_KEY,
  name: "Fowned",
  origin: ORIGIN,
  bookingUrl: BOOKING_URL,
  /* Published on the upstream Fowned site and inherited from it. The meeting
   * notes referenced a different suffix (821-2282), which does NOT match this
   * number. Unreconciled, so the verified on-site number stands and the
   * conflict is reported rather than silently resolved by guessing. */
  phoneHref: "tel:+18313320184",
  phoneText: "+1 (831) 332 0184",
  linkedin: "https://www.linkedin.com/company/fowned/",
};

/** Booking destination. External Cal.com when configured, /contact/ otherwise.
 *  Chosen over an embedded Cal.com widget deliberately: an embed loads a
 *  third-party bundle on first paint, is the least reliable element on mobile
 *  Safari, and hides the referrer that tells us which page produced the
 *  booking. A plain link keeps the page weight flat and keeps attribution. */
export const bookHref = () => SITE.bookingUrl || "/contact/";

/** The one Calendly URL builder. render() rewrites every booking link on a page
 *  to this, so a booking names the page that produced it (utm_content) and no
 *  page module has to know its own path. */
export const bookingUrl = (path) => {
  const u = new URL(BOOKING_URL);
  u.search = new URLSearchParams({
    utm_source: "fowned.live",
    utm_medium: "site",
    utm_campaign: "book_call",
    utm_content: path.replace(/^\/+|\/+$/g, "").replace(/[^a-z0-9]+/gi, "-").toLowerCase() || "home",
  }).toString();
  return u.href;
};

/** RB2B snippet, or "" when no key is configured. Emitting nothing is the
 *  point: an unconfigured tag must not become a third-party request. */
export const rb2bTag = () =>
  RB2B_KEY
    ? `<script>!function(){var r=document.createElement("script");r.async=!0,r.src="https://ddwl4m2hdecbv.cloudfront.net/b/"+${JSON.stringify(RB2B_KEY)}+"/rb2b.js.gz",document.head.appendChild(r)}();</script>`
    : "";
/** The only hosts allowed to talk to GA4. js/instrument.js holds the same list;
 *  tests/analytics-host.test.mjs holds the two to it. */
export const GA4_HOSTS = ["fowned.live", "www.fowned.live"];

/** The one gtag.js loader, or "" when disabled. It starts gtag only on the
 *  production hosts, so a *.pages.dev preview, a local build or a test run never
 *  reaches the GA4 property. A static <script src> would load on every host.
 *  anonymize_ip is the GA4 default already. */
export const ga4Tag = () =>
  GA4_ID
    ? `  <script>(function(){if(${JSON.stringify(GA4_HOSTS)}.indexOf(location.hostname)<0)return;var id=${JSON.stringify(GA4_ID)};window.dataLayer=window.dataLayer||[];window.gtag=function(){window.dataLayer.push(arguments)};window.gtag("js",new Date());window.gtag("config",id);var s=document.createElement("script");s.async=true;s.src="https://www.googletagmanager.com/gtag/js?id="+encodeURIComponent(id);document.head.appendChild(s)})();</script>`
    : "";
export const bookRel = () =>
  SITE.bookingUrl ? ' target="_blank" rel="noopener noreferrer"' : "";

/** A BOOK A CALL button. Always instrumented as booking_click so the funnel
 *  reads the same whether the destination is Cal.com or the contact page. */
export const bookBtn = (text, label, cls = "btn btn-primary") =>
  `<a href="${bookHref()}"${bookRel()} class="${cls}" data-ev="booking_click" data-ev-label="${label}">${text}</a>`;

/* Every route in one place. The nav, the sitemap and the link checker all read
 * this, so a page cannot exist without being reachable or be linked without
 * existing. */
export const NAV = [
  { path: "/", title: "Home" },
  { path: "/audit/", title: "Free audit" },
  { path: "/services/", title: "Services" },
  { path: "/how-it-works/", title: "How it works" },
  { path: "/ai-visibility/", title: "AI visibility" },
  { path: "/geo/", title: "What is GEO" },
  { path: "/resources/", title: "Resources" },
  { path: "/about/", title: "About" },
  { path: "/contact/", title: "Contact" },
];

export const DEMO_NAV = [
  { path: "/demo/prospects/", title: "Prospects", group: "Agency" },
  { path: "/demo/client/", title: "Overview", group: "Client" },
  { path: "/demo/client/visibility/", title: "Visibility", group: "Client" },
  { path: "/demo/client/citations/", title: "Citations", group: "Client" },
  { path: "/demo/client/infrastructure/", title: "Infrastructure", group: "Client" },
  { path: "/demo/client/opportunities/", title: "Opportunities", group: "Client" },
  { path: "/demo/client/reports/", title: "Reports", group: "Client" },
  { path: "/demo/client/service-health/", title: "Service health", group: "Client" },
];

export const GUIDES = [
  {
    path: "/guides/local-seo-vs-geo-vs-aeo/",
    short: "Local SEO vs GEO vs AEO",
    title: "Local SEO vs GEO vs AEO for local businesses",
    blurb: "Three acronyms, one plain comparison table, and which one to fund first.",
  },
  {
    path: "/guides/geo-for-local-businesses/",
    short: "GEO for local businesses",
    title: "GEO for local businesses: does yours need it?",
    blurb: "Three questions that decide it, what the work actually is, and how to prove it worked.",
  },
  {
    path: "/guides/what-sources-chatgpt-uses-to-recommend-local-businesses/",
    short: "What sources ChatGPT uses",
    title: "What sources ChatGPT uses to recommend local businesses",
    blurb: "What is observable about its retrieval, and what is only claimed.",
  },
  {
    path: "/guides/ai-visibility-audit-for-local-businesses/",
    short: "What the audit checks",
    title: "AI visibility audit for local businesses: what we check and why",
    blurb: "Every check in the free audit, with the reason it exists.",
  },
  {
    path: "/guides/how-to-choose-an-ai-seo-agency-for-a-local-business/",
    short: "How to choose an agency",
    title: "How to choose an AI SEO or GEO agency for a local business",
    blurb: "Nine questions to ask, and the answers that should end the call.",
  },
  {
    path: "/guides/how-to-track-leads-from-chatgpt/",
    short: "Tracking leads from ChatGPT",
    title: "How to track leads from ChatGPT and AI search without guessing",
    blurb: "What the referrer can prove, what it cannot, and what to record instead.",
  },
];

/* The guide list. The titles used to sit in a plain .check-list, where
 * `a { color: inherit }` and a missing li rule rendered five links and five
 * blurbs as one unbroken paragraph: crawlable, but invisible to a reader.
 * The title is now its own line and carries its own class, so it reads as a
 * link without depending on a global anchor colour. */
export const guideList = (excludePath = "") =>
  `      <ul class="guide-list">
${GUIDES.filter((g) => g.path !== excludePath)
  .map(
    (g) => `        <li>
          <a class="guide-link" href="${g.path}">${esc(g.title)}</a>
          <span class="guide-blurb">${esc(g.blurb)}</span>
        </li>`
  )
  .join("\n")}
      </ul>`;

/** Short guide labels for the nav panel and the footer, where the full
 *  sentence-length titles do not fit. */
export const guideLinks = (indent) =>
  [...GUIDES.map((g) => `${indent}<a href="${g.path}">${esc(g.short)}</a>`), `${indent}<a href="/guides/">All guides &rarr;</a>`].join("\n");

const esc = (s) =>
  String(s == null ? "" : s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );

/* A robots meta tag is emitted for /demo/ pages ONLY. The asymmetry IS the
 * rule, not an oversight.
 *
 * Marketing pages must not carry one. The same file is served on the real
 * property (must index) and on the temporary Cloudflare hostname (must not),
 * and a tag baked into the HTML cannot tell those apart. Only
 * functions/_middleware.js can, because it is the one layer that reads the
 * request Host.
 *
 * Demo pages are different in kind. They are seeded with invented companies,
 * so they must never index on ANY host. That makes the rule host-independent,
 * which is exactly what makes it safe to bake in.
 *
 * This tag is also what lets robots.txt stop disallowing /demo/. A disallowed
 * URL is never fetched, so its noindex is never read, while a followed
 * internal link can still put the bare URL in an index with no snippet.
 * Crawlable-and-noindex is the only combination that actually keeps a page
 * out. Four pages link into /demo/ (ai-visibility, how-it-works, services,
 * 404), so the followed-link path is real rather than hypothetical.
 *
 * Nothing in this comment reaches the output: naming internal hostnames and
 * file paths in an HTML comment ships them on every page. */
/* One entity, defined on every page under a stable @id, so every Article and
 * WebSite block can point at it instead of restating it. It used to live on
 * the homepage only, which left 20 of 21 pages describing nobody. */
const ORG_ID = () => `${SITE.origin}/#organization`;
const siteSchema = () => [
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": ORG_ID(),
    name: SITE.name,
    /* The domain is how people type the name, so it is named as one. */
    alternateName: [new URL(SITE.origin).host],
    url: SITE.origin,
    description:
      "Generative engine optimization agency. Audits, fixes and monitors how AI assistants describe a business.",
    telephone: "+1-831-332-0184",
    /* Raster on purpose: Google Images does not accept SVG for a logo. This
     * reference is also what keeps face_logo.png in dist/, because the build
     * copies an image only when rendered HTML names it. */
    logo: SITE.origin + "/images/face_logo.png",
    sameAs: [SITE.linkedin],
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE.origin}/#website`,
    name: SITE.name,
    url: SITE.origin,
    publisher: { "@id": ORG_ID() },
  },
];

/* Guides and answers are articles. Their dates come from git via build.mjs and
 * are left out, never guessed, when a page has none. The author is the
 * organization because no individual byline is published on these pages. */
const isArticle = (page) => /^\/(guides|answers)\/[^/]+\/$/.test(page.path);
const headline = (page) => page.title.replace(/ \| Fowned$/, "");
function articleSchema(page) {
  if (!isArticle(page)) return [];
  const url = SITE.origin + page.path;
  const out = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: headline(page).slice(0, 110),
      description: page.description,
      url,
      mainEntityOfPage: url,
      image: SITE.origin + "/images/og-fowned.jpg",
      inLanguage: "en",
      ...(page.datePublished && { datePublished: page.datePublished }),
      ...(page.dateModified && { dateModified: page.dateModified }),
      author: { "@type": "Organization", "@id": ORG_ID(), name: SITE.name, url: SITE.origin },
      publisher: { "@type": "Organization", "@id": ORG_ID(), name: SITE.name, url: SITE.origin },
    },
  ];
  /* Guides already carry a hand-written breadcrumb; answers had none. */
  if (!(page.schema || []).some((s) => s["@type"] === "BreadcrumbList")) {
    out.push({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Resources", item: `${SITE.origin}/resources/` },
        { "@type": "ListItem", position: 2, name: headline(page), item: url },
      ],
    });
  }
  return out;
}

function head(page) {
  const canonical = SITE.origin + page.path;
  const ogImage = SITE.origin + "/images/og-fowned.jpg";
  const indexable = !["/404/", "/410/"].includes(page.path) && !page.path.startsWith("/demo/");
  const schema = [...(indexable ? siteSchema() : []), ...(page.schema || []), ...articleSchema(page)].map((s) =>
    JSON.stringify(s, null, 2)
  );
  const robots = page.path.startsWith("/demo/")
    ? `\n  <meta name="robots" content="noindex, nofollow">`
    : "";
  return `  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(page.title)}</title>
  <meta name="description" content="${esc(page.description)}">${robots}
  <link rel="canonical" href="${esc(canonical)}">

  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Fowned">
  <meta property="og:title" content="${esc(page.ogTitle || page.title)}">
  <meta property="og:description" content="${esc(page.description)}">
  <meta property="og:url" content="${esc(canonical)}">
  <meta property="og:image" content="${esc(ogImage)}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(page.ogTitle || page.title)}">
  <meta name="twitter:description" content="${esc(page.description)}">
  <meta name="twitter:image" content="${esc(ogImage)}">

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Instrument+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">

  <link rel="icon" type="image/svg+xml" href="/images/fowned_logo.svg">
${ga4Tag()}
  <link rel="stylesheet" href="${v("/css/style.css")}">
  <link rel="stylesheet" href="${v("/css/app.css")}">
${schema.map((s) => `  <script type="application/ld+json">\n${s}\n  </script>`).join("\n")}`;
}

function header(page) {
  const links = NAV.filter((n) => n.path !== "/")
    .map(
      (n) =>
        `        <a href="${n.path}"${page.path === n.path ? ' aria-current="page"' : ""}>${esc(n.title)}</a>`
    )
    .join("\n");
  return `  <header>
    <div class="container">
      <nav>
        <a class="logo" href="/" aria-label="Fowned home">
          <span class="logo-mark">
            <img src="/images/fowned_logo.svg" alt="Fowned" width="28" height="28">
          </span>
        </a>
        <div class="nav-right">
          <a href="/audit/" class="btn btn-primary nav-cta" data-ev="cta_click" data-ev-label="header_audit">Request free audit</a>
          <button class="menu-toggle" id="menuToggle" aria-label="Open menu" aria-expanded="false" aria-controls="menuPanel">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <line x1="3" y1="6" x2="21" y2="6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              <line x1="3" y1="12" x2="21" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              <line x1="3" y1="18" x2="21" y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
      </nav>
      <div class="menu-panel" id="menuPanel">
${links}
        <div class="menu-divider"></div>
        <span class="menu-label">Guides</span>
        <div class="menu-guides">
${guideLinks("          ")}
        </div>
        <div class="menu-divider"></div>
        <a href="/audit/" class="btn btn-primary menu-btn-primary" data-ev="cta_click" data-ev-label="menu_audit">Request free audit</a>
        ${bookBtn("Book a call", "menu_book", "btn btn-secondary menu-btn-secondary")}
      </div>
    </div>
  </header>`;
}

/* The "Demo build" note is scoped to the demo shell on purpose. On a public
 * marketing page it reads as "this whole company is a mock-up", which is the
 * opposite of true and costs real enquiries; inside /demo/ it is the honest
 * label the fixture screens need. */
function footer(isDemo) {
  const col = (label, items) =>
    `      <div class="contact-col">
        <span class="label">${esc(label)}</span>
${items.join("\n")}
      </div>`;
  return `<footer id="contact">
  <div class="container">
    <div class="contact-top">
      <h2>Start with the audit. Then we talk.</h2>
      <p class="contact-sub">Request the free audit and a person emails it to you within 2 business days. If you would rather speak to someone first, book a call or use the number below.</p>
      <div class="hero-ctas contact-ctas">
        <a href="/audit/" class="btn btn-primary" data-ev="cta_click" data-ev-label="footer_audit">Request my free audit &rarr;</a>
        ${bookBtn("Book a call", "footer_book", "btn btn-secondary")}
      </div>
    </div>

    <div class="contact-grid">
${col("Services", [
  '        <a href="/services/">What we do</a>',
  '        <a href="/geo/">What is GEO</a>',
  '        <a href="/ai-visibility/">AI visibility</a>',
])}
${col("Company", [
  '        <a href="/how-it-works/">How it works</a>',
  '        <a href="/about/">About</a>',
  '        <a href="/resources/">Resources</a>',
])}
${col("Guides", guideLinks("        ").split("\n"))}
${col("Contact", [
  `        <a href="${SITE.phoneHref}">${SITE.phoneText}</a>`,
  '        <a href="/contact/">Contact us</a>',
  `        <a href="${SITE.linkedin}" target="_blank" rel="noopener noreferrer">LinkedIn</a>`,
])}
    </div>

    <div class="contact-bottom">
      <span>&copy; 2026 Fowned. All rights reserved.</span>
      <span class="contact-legal">
        <a href="/privacy/">Privacy</a>
        <a href="/terms/">Terms</a>
      </span>
${isDemo ? '      <span class="footer-note">Demo build. Product surfaces marked DEMO DATA are illustrative.</span>' : ""}
    </div>
  </div>
</footer>`;
}

function demoSidebar(page) {
  const groups = [...new Set(DEMO_NAV.map((n) => n.group))];
  return `    <aside class="demo-side">
${groups
  .map(
    (g) => `      <div class="demo-side-group">
        <span class="label">${esc(g)}</span>
${DEMO_NAV.filter((n) => n.group === g)
  .map(
    (n) =>
      `        <a href="${n.path}" class="demo-side-link${page.path === n.path ? " is-active" : ""}"${
        page.path === n.path ? ' aria-current="page"' : ""
      }>${esc(n.title)}</a>`
  )
  .join("\n")}
      </div>`
  )
  .join("\n")}
      <div class="demo-side-group">
        <span class="label">Back</span>
        <a href="/" class="demo-side-link">Fowned website</a>
      </div>
    </aside>`;
}

/** Standing, unmissable banner. Section 23: no ambiguous fake-live telemetry. */
const DEMO_BANNER = `  <div class="demo-banner" role="note">
    <span class="demo-chip">DEMO DATA</span>
    <p>Every figure on this screen is a fixture for an invented example client. It is not live telemetry, and no real company shown here is a Fowned customer.</p>
  </div>`;

export function render(page) {
  const isDemo = page.shell === "demo";
  const body = isDemo
    ? `${DEMO_BANNER}
  <div class="demo-shell container">
${demoSidebar(page)}
    <main class="demo-main" id="main">
${page.body}
    </main>
  </div>`
    : `  <main id="main">
${page.body}
  </main>`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
${head(page)}
</head>
<body${isDemo ? ' class="is-demo"' : ""}>
  <a class="skip-link" href="#main">Skip to content</a>
${header(page)}
${body}
${footer(isDemo)}
<script>window.FOWNED = { phoneHref: ${JSON.stringify(SITE.phoneHref)}, phoneText: ${JSON.stringify(SITE.phoneText)}, turnstileSiteKey: ${JSON.stringify(SITE.turnstileSiteKey)} };</script>
${SITE.turnstileSiteKey ? '<script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>' : ""}
<script src="${v("/js/instrument.js")}"></script>
<script src="${v("/js/booking.js")}"></script>
${rb2bTag()}
<script src="${v("/js/main.js")}"></script>
${page.scripts ? page.scripts.map((s) => `<script src="${v(s)}"></script>`).join("\n") : ""}
</body>
</html>`;
  return SITE.bookingUrl
    ? html.replaceAll(`href="${BOOKING_URL}"`, `href="${esc(bookingUrl(page.path))}"`)
    : html;
}
