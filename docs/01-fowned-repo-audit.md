# 1. Fowned upstream repo audit (exact, as of clone 2026-08-24)

Source: `https://github.com/clyde-sudo/fowned-website.git` @ `47b2974`, last pushed 2026-08-13T18:08:27Z.

## Architecture

Static HTML/CSS/JS. **Verified**: no build step, no package.json, no server, no
backend, no API call anywhere in the repo.

    index.html      10,747 B    one page, 8 sections
    css/style.css   19,599 B    hand-written design system on CSS custom properties
    js/main.js       3,045 B    loader, menu toggle, portrait scroll, link table
    images/*        ~2.8 MB     9 assets (2 x ~1 MB unoptimised PNG banners)

Total repo 2,778 KB, of which ~99% is images. Git history is 5 commits, all design work.

## Every surface, functional vs placeholder

| Surface | State | Evidence |
|---|---|---|
| Hero CTA "Run my free audit" | **DEAD** | `href="#audit"`, anchors to a section whose own CTA is `href="#"` |
| Nav "Book a call" | **DEAD** | `js/main.js` `LINKS.bookCall = '#'` with comment `// still need this one` |
| Nav "Run free audit" | **DEAD** | `js/main.js` `LINKS.audit = '#'` with comment `// still need this one` |
| Inline audit form (`#tiers`) | **NO-OP** | `onsubmit="event.preventDefault();"`, no handler, input value discarded |
| Final audit CTA (`#audit`) | **DEAD** | `<a href="#">` |
| Newsletter subscribe form | **NO-OP** | `onsubmit="event.preventDefault();"`, no handler, email discarded |
| Email link | **PLACEHOLDER** | `mailto:placeholder@fowned.com` |
| Phone link | **REAL** | `tel:+18313320184` |
| LinkedIn | **REAL** | `linkedin.com/company/fowned/` |
| Privacy Policy / Terms | **DEAD** | both `href="#"`, no documents exist |
| Client logo row | **PLACEHOLDER** | 4 x literal `<div class="logo-slot">Client logo</div>` under the heading "Businesses getting named" |
| Testimonial | **PLACEHOLDER, self-labelled** | `<span class="quote-flag">Testimonial (placeholder)</span>`, body `"Client quote 🔥"` |
| Hero AI-answer card | **SIMULATED, self-labelled** | `<span class="geo-tag">AI answer · simulated</span>` |
| Attribution card (`#why`) | **FABRICATED, NOT labelled** | three hardcoded rows ("ChatGPT / New consult request / 2m ago") presented as product output with no simulated marker |

Zero functional surfaces exist. The site is a design artefact, not a funnel.

## Claim audit (buyer-facing truth)

| Claim | Verdict |
|---|---|
| "We audit your visibility" | **UNBACKED** — no audit exists in this repo |
| "keep you cited as those answers change" | **UNBACKED** — no monitoring exists in this repo |
| "every lead is tagged with the AI answer that sent them" | **FALSE AS STATED** — see `docs/03`, attribution section. No implementation exists in Fowned OR Citability that can prove which AI answer produced a lead |
| "See which visitors arrived from an AI answer" (Tier 03) | **NOT_IMPLEMENTED** |
| "Businesses getting named" over 4 empty logo slots | **IMPLIES CLIENTS THAT DO NOT EXIST** |
| "AUDIT -> FIX -> TRACK" | **TRUTHFUL MODEL, preserve** — this maps cleanly onto real Citability capabilities |

The two self-labelled placeholders (testimonial, simulated answer) are honest and
were built correctly. The attribution card and the logo row are the two surfaces
that would mislead a real buyer, and the Tier-03 / `#why` copy is the single
claim that must change before this page is used as a cold-outreach destination.

## Design identity to preserve (inventory)

Design tokens are already centralised in `css/style.css :root`, so the identity
is portable to any framework without redrawing it.

    --color-black      #111111   text, wordmark, buttons
    --color-white      #ffffff   primary background
    --color-gray       #767676   secondary/body
    --color-hairline   #eaeaea   borders, dividers
    --color-blush      #e8eef2   soft section background
    --color-indigo     #2f45d0   links, citations, badges (never on primary buttons)
    --color-indigo-deep #1e2fa0
    --color-highlight  #ffd23f   +  --color-highlight-soft rgba(255,210,63,.35)

    --font-sans     Instrument Sans      body / UI
    --font-display  Space Grotesk        h1-h3, footer logo, blockquote
    --font-mono     IBM Plex Mono        small uppercase labels ONLY, never body

    space  xs 16 / sm 24 / md 40 / lg 64 / xl 96      radius 8px      container 1120px

Assets: `fowned_logo.svg` (1.2 KB, the working mark), `face_logo.svg/png`,
`fowned-portrait-transparent.png`, 3 starry banners, `swirl-bg.svg`.

Interaction patterns worth keeping: 1s-minimum loader, hamburger panel that
closes on outside-click and on link-click, scroll-scaled portrait that already
respects `prefers-reduced-motion`, and the centralised `LINKS` + `data-link`
table (which is exactly the right seam to point at real destinations).

Sections in buyer order: hero -> credibility -> three tiers -> why GEO ->
how it works -> testimonial -> audit CTA -> contact footer.
