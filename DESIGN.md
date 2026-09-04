# Fowned Design System

**Property:** Fowned (fowned-web) · **Type:** own brand, own token base
**Cloud project:** `a713c61d-36e2-43ed-b0ac-7ca2bc8f4e7f` ("Fowned Design System")
**Ground truth:** `css/style.css` lines 4-32 (the `:root` block). Everything below reads off those variables.
**Reconcile model:** 3-way — live CSS wins on facts, this file is the brief, the cloud project is the mirror.

---

## The routing rule that matters most

Fowned runs on Citability's backend. It is a **tenant** of the Citability platform, not a fork of it.
That is a backend fact and it carries **no** visual consequence.

> **Never import a Citability token into Fowned.** Citability's Forensic Telemetry palette
> and Fowned's palette are unrelated systems that happen to share a database.

The failure mode is specific and easy to fall into: a Fowned surface gets built inside
`citability-dev` (the funnel API lives there), the builder reaches for the tokens in the repo they
have open, and Fowned silently drifts into looking like the engine behind it. The whole point of
the white-label is that the visitor never sees Citability. Resolve the property first, then build.

Same rule in the other direction: Fowned tokens never leak into Citability or chudi.dev.

---

## Colors

| Token | Value | Use |
|---|---|---|
| `--color-black` | `#111111` | Text, wordmark, primary button fill |
| `--color-white` | `#ffffff` | Primary background |
| `--color-gray` | `#767676` | Secondary / body text |
| `--color-hairline` | `#eaeaea` | Borders, dividers, fills |
| `--color-blush` | `#e8eef2` | Soft section background |
| `--color-indigo` | `#2f45d0` | Links, citations, focus ring, HEALTHY badge |
| `--color-indigo-deep` | `#1e2fa0` | Indigo hover / pressed |
| `--color-highlight` | `#ffd23f` | Badges, NEEDS_WORK health state |
| `--color-highlight-soft` | `rgba(255,210,63,.35)` | Inline text highlight wash |

**Accents never appear on primary buttons.** A primary button is black fill on white, always.
Indigo and highlight carry meaning (link, citation, health state). Spending them on a generic CTA
removes that meaning.

**Known gap:** the primary-button hover `#2a2a2a` is hard-coded in six places in `style.css` and
has no token. It should become `--color-black-hover`. Until it does, a hover change means six edits.

## Typography

| Token | Family | Job |
|---|---|---|
| `--font-sans` | Instrument Sans | Body and UI — the default, needs no class |
| `--font-display` | Space Grotesk | `h1 h2 h3`, `.footer-logo`, `.quote blockquote` |
| `--font-mono` | IBM Plex Mono | `.label` and small system readouts **only** |

**IBM Plex Mono is not body typography.** It appears as `.label` (12px / 500 / uppercase /
letter-spacing `.08em` / `--color-gray`) and in small system readouts: health badge 11px,
score 13px, scanned hostname 12px, attribution legend 10px. Setting a paragraph, a heading, or a
button label in mono breaks the system. This is the single easiest rule for a generator to violate
and the one that most visibly separates Fowned from a template.

## Spacing, radius, layout

| Token | Value |
|---|---|
| `--space-xs` | `16px` |
| `--space-sm` | `24px` |
| `--space-md` | `40px` |
| `--space-lg` | `64px` |
| `--space-xl` | `96px` |
| `--radius` | `8px` (badges use `6px`) |

- `.container` — `max-width: 1120px`, `margin: 0 auto`, padding `0 var(--space-xs)`.
- Reading column — the audit form and result panel both cap at **560px** and center.
  Anything the visitor reads under stress stays in that column.
- Sticky-header offset — `scroll-margin-top: 76px` on `#why #how #tiers #contact #audit`.
  A new jump target must join that selector list or it lands underneath the header.
- Focus ring — `outline: 2px solid var(--color-indigo)`, `outline-offset: 2px`. Never removed;
  it is the only visible focus affordance in the funnel.

## Buttons

Base `.btn`: `inline-flex`, gap `8px`, `--font-sans`, weight `600`, size `15px`,
padding `12px 22px`, `border-radius: var(--radius)`, `border: 1px solid var(--color-black)`.

- `.btn-primary` — black fill, white text; hover `#2a2a2a`
- `.btn-secondary` — transparent, black text; hover `var(--color-hairline)`

**Busy state:** the submit button *is* the progress indicator. It disables and its label is
replaced in sequence — "Run my free audit →" → "Checking…" → "Running your audit…" → back to idle.
There is no spinner and no separate loader element.

## Forms

- Audit form: `flex`, gap `12px`, 560px cap, stacks below `640px`.
- Audit input font-size is **16px, not 15px**. Anything smaller makes iOS Safari zoom on focus,
  which throws the visitor out of the funnel layout mid-entry. Deliberate exception to the 15px UI size.
- Lead input is 15px (it is inside an already-committed flow, so the zoom cost is lower than the
  visual cost of a second 16px field).

## Audit funnel states

Keyed by `data-state` on `.audit-panel`. Every state renders as itself; a state that did not
happen is never borrowed from one that did.

`SCANNING` · `INVALID_DOMAIN` · `RATE_LIMITED` · `FAILED` · `SUCCESS` · `PARTIAL`

Failure-class states (`FAILED`, `INVALID_DOMAIN`, `RATE_LIMITED`) carry
`border-left: 3px solid var(--color-indigo)` so a failure looks like a failure and not a neutral note.

Health badges: `CRITICAL` black-on-white, `NEEDS_WORK` highlight-on-black, `HEALTHY` indigo-on-white.

**Two rules this component exists to hold:**

1. A check that produced no verdict renders as *not measured* on its own line (`.audit-partial`) —
   never as a zero, never as a failure. The denominator shrinks instead of the numerator.
2. A failing finding is marked in indigo, a passing one in gray. The inversion is deliberate:
   what is broken is what is being sold, so it carries the accent.

Two terminal gate states exist and must both be kept:
- **lead CAPTURED** — form removed, replaced by confirmation plus the phone number.
- **`prospectId == null`** — the scan ran but was not stored, so the email form is replaced with
  the phone number. Showing a form that cannot work is worse than saying so.

## Attribution vocabulary is closed

Only `observed`, `inferred`, `unknown`. A missing referrer is `unknown`, never "direct" —
AI surfaces routinely strip `Referer`, so the two must stay distinguishable. `.attr-src-muted`
exists so "no referrer" cannot read as an achievement. Do not add a fourth class without a
source that can actually be observed.

## Email

Every message from `send.fowned.live` is built by `src/email.mjs`. That module is the only
place a Fowned email body is composed, and the Pages Function imports it rather than
hand-writing a payload. This is the point: the previous design system lived in a standalone
file under `tools/`, so nothing imported it, so it could not constrain the next email anyone
wrote, and the lead alert went out as a plain field dump.

**Every email carries both parts.** `html` and `text` are the same facts, not a rich version
and a lesser one. A recipient reading the text alternative must not learn less.

Four constraints apply to email that do not apply to the site, all of them because the
renderer is Gmail, Outlook, or Apple Mail rather than a browser:

1. **No CSS custom properties.** The tokens are the same values as the site, but resolved to
   literal hex at author time. Outlook renders through Word, which drops `var(--x)`.
2. **No external stylesheet and no web font.** Gmail strips `<link>`. Instrument Sans, Space
   Grotesk, and IBM Plex Mono will not load, so every family ships with a real fallback stack
   and the layout must survive the fallback.
3. **Tables, not flex or grid.** `role="presentation"` tables with inline styles, one 600px
   card with `max-width:100%`.
4. **The colour scheme is pinned.** `color-scheme` and `supported-color-schemes` are declared
   so a dark-mode client does not invert the card into something Fowned never designed.

The site rules still bind, and these three are the ones a generator breaks first:

- **IBM Plex Mono is for labels only** — the small uppercase field names and the badge.
  Never a heading, never body copy, never a button label.
- **Indigo is a link colour, never a fill.** A primary button is black fill on white, always.
- **Never a Citability token.** Fowned is a tenant, not a fork.

Visitor input reaches the HTML through `escapeHtml`, which covers `& < > "`. The quote is in
that set because values land inside attributes, `mailto:` hrefs among them, where an
unescaped quote closes the attribute and the rest becomes markup. `tools/email-test.mjs`
asserts all of the above against a record whose every field carries an injection payload.
Run it before changing the module.
