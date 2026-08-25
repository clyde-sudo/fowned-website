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

export const SITE = {
  name: "Fowned",
  // The demo lives on a temporary hostname. Canonicals point at THIS host on
  // purpose: pointing them at a production domain that does not serve the page
  // yet would be a lie that outlives the demo.
  origin: "https://fowned.pages.dev",
  phoneHref: "tel:+18313320184",
  phoneText: "+1 (831) 332 0184",
  linkedin: "https://www.linkedin.com/company/fowned/",
};

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
  { path: "/case-studies/", title: "Case study" },
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

const esc = (s) =>
  String(s == null ? "" : s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );

function head(page) {
  const canonical = SITE.origin + page.path;
  const ogImage = SITE.origin + "/images/og-fowned.jpg";
  const schema = page.schema ? page.schema.map((s) => JSON.stringify(s, null, 2)) : [];
  return `  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(page.title)}</title>
  <meta name="description" content="${esc(page.description)}">

  <!-- Temporary demo hostname: see DEPLOYMENT.md, "Indexing decision".
       Search equity belongs on the owned production domain, not stranded here,
       so this build is noindex everywhere and the header sends X-Robots-Tag too
       (a header a crawler cannot miss even if it never parses the HTML). -->
  <meta name="robots" content="noindex, nofollow">
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
  <link rel="stylesheet" href="/css/style.css">
  <link rel="stylesheet" href="/css/app.css">
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
          <a href="/audit/" class="btn btn-primary nav-cta" data-ev="cta_click" data-ev-label="header_audit">Run free audit</a>
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
        <a href="/demo/prospects/">Agency demo</a>
        <a href="/demo/client/">Client demo</a>
        <div class="menu-divider"></div>
        <a href="/audit/" class="btn btn-primary menu-btn-primary" data-ev="cta_click" data-ev-label="menu_audit">Run free audit</a>
      </div>
    </div>
  </header>`;
}

function footer() {
  const col = (label, items) =>
    `      <div class="contact-col">
        <span class="label">${esc(label)}</span>
${items.join("\n")}
      </div>`;
  return `<footer id="contact">
  <div class="container">
    <div class="contact-top">
      <h2>Start with the audit. Then we talk.</h2>
      <p class="contact-sub">Run the free audit and leave your email with the result. If you would rather speak to someone first, the number below reaches us directly.</p>
      <a href="/audit/" class="btn btn-primary" data-ev="cta_click" data-ev-label="footer_audit">Run my free audit &rarr;</a>
    </div>

    <div class="contact-grid">
${col("Services", [
  '        <a href="/services/">What we do</a>',
  '        <a href="/geo/">What is GEO</a>',
  '        <a href="/ai-visibility/">AI visibility</a>',
])}
${col("Company", [
  '        <a href="/how-it-works/">How it works</a>',
  '        <a href="/case-studies/">Case study</a>',
  '        <a href="/about/">About</a>',
  '        <a href="/resources/">Resources</a>',
])}
${col("Product demo", [
  '        <a href="/demo/prospects/">Agency pipeline</a>',
  '        <a href="/demo/client/">Client monitoring</a>',
])}
${col("Contact", [
  `        <a href="${SITE.phoneHref}">${SITE.phoneText}</a>`,
  '        <a href="/contact/">Contact us</a>',
  `        <a href="${SITE.linkedin}" target="_blank" rel="noopener noreferrer">LinkedIn</a>`,
])}
    </div>

    <div class="contact-bottom">
      <span>&copy; 2026 Fowned. All rights reserved.</span>
      <span class="footer-note">Demo build. Product surfaces marked DEMO DATA are illustrative.</span>
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

  return `<!DOCTYPE html>
<html lang="en">
<head>
${head(page)}
</head>
<body${isDemo ? ' class="is-demo"' : ""}>
  <a class="skip-link" href="#main">Skip to content</a>
${header(page)}
${body}
${footer()}
<script src="/js/instrument.js"></script>
<script src="/js/main.js"></script>
${page.scripts ? page.scripts.map((s) => `<script src="${s}"></script>`).join("\n") : ""}
</body>
</html>`;
}
