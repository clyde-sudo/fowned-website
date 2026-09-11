/** Small shared render helpers. Markup lives here so every surface renders the
 *  same concept the same way - a truth state in particular. */
import { TRUTH_STATES, SOURCES } from "./data.mjs";
import { bookRel, guideList } from "./layout.mjs";

/* GUIDES and guideList live in layout.mjs beside NAV: one registry for every
 * surface that links a guide (nav panel, footer, homepage, /resources/,
 * sibling block). Re-exported so page modules keep importing it from here. */
export { guideList };

export const esc = (s) =>
  String(s == null ? "" : s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );

/* A section head reserves --space-xl (96px) below itself, which is correct when
 * it carries a subhead and a button and leaves an obvious hole when it is only
 * an eyebrow and a heading. `is-tight` restores proportion for that second case
 * instead of nudging the shared margin and breaking the first. */
export const head = ({ label, h, sub, cta }) => `      <div class="section-head${!sub && !cta ? " is-tight" : ""}">
        ${label ? `<span class="label">${esc(label)}</span>` : ""}
        <h2>${esc(h)}</h2>
        ${sub ? `<p class="sub">${esc(sub)}</p>` : ""}
        ${cta ? `<a href="${cta.href}" class="btn btn-primary" data-ev="cta_click" data-ev-label="${esc(cta.ev || "section")}">${esc(cta.text)}</a>` : ""}
      </div>`;

/** One truth state, always drawn the same way, always with its meaning on hover. */
export const truth = (s) =>
  `<span class="tstate tstate-${esc(s)}" title="${esc((TRUTH_STATES[s] || {}).note || "")}">${esc((TRUTH_STATES[s] || {}).label || s)}</span>`;

export const source = (s) => {
  const m = SOURCES[s] || { label: s, evidence: "UNKNOWN" };
  const cls = m.evidence === "OBSERVED" ? "" : " attr-src-muted";
  return `<span class="attr-src${cls}">${esc(m.label)}</span>`;
};

export const health = (h) =>
  `<span class="audit-health audit-health-${esc(h)}">${esc(
    { CRITICAL: "Critical", NEEDS_WORK: "Needs work", HEALTHY: "Healthy" }[h] || h
  )}</span>`;

/** A definition block. AEO section 13: an answer-ready paragraph that stands
 *  alone when lifted out of the page, because that is how it gets retrieved. */
export const answer = (q, a) => `        <div class="answer-block">
          <h3>${esc(q)}</h3>
          <p>${a}</p>
        </div>`;

export const table = (cols, rows) => `        <div class="table-wrap">
          <table class="dtable">
            <thead><tr>${cols.map((c) => `<th scope="col">${esc(c)}</th>`).join("")}</tr></thead>
            <tbody>
${rows.map((r) => `              <tr>${r.map((c, i) => (i === 0 ? `<th scope="row">${c}</th>` : `<td>${c}</td>`)).join("")}</tr>`).join("\n")}
            </tbody>
          </table>
        </div>`;

export const cta = ({ h, p, primary, secondary }) => `  <section class="band">
    <div class="container">
      <div class="final-cta">
        <h2>${esc(h)}</h2>
        <p>${esc(p)}</p>
        <div class="hero-ctas">
          <a href="${primary.href}" class="btn btn-primary" data-ev="cta_click" data-ev-label="${esc(primary.ev)}">${esc(primary.text)}</a>
          ${secondary ? `<a href="${secondary.href}"${secondary.booking ? bookRel() : ""} class="btn btn-secondary" data-ev="${secondary.booking ? "booking_click" : "cta_click"}" data-ev-label="${esc(secondary.ev)}">${esc(secondary.text)}</a>` : ""}
        </div>
      </div>
    </div>
  </section>`;

/* ------------------------------------------------------------------------ *
 * GUIDE REGISTRY.
 *
 * The five guides were published (2026-09-06) reachable only from /resources/,
 * with no link between them and none from the homepage: three clicks from the
 * front door down a single path, and no sibling link to pass authority along.
 * Google had them as "discovered, currently not indexed", which is what thin
 * internal linking looks like from the crawler's side.
 *
 * One list, read by the guide cross-link block and the homepage section, so a
 * new guide is linked from every place it should be by adding one row here.
 * ------------------------------------------------------------------------ */
/** Sibling-guide block for the foot of a guide, above its CTA band. */
export const relatedGuides = (currentPath) => `  <section>
    <div class="container narrow">
${head({ label: "Keep reading", h: "The other guides in this set." })}
${guideList(currentPath)}
      <p class="center-link"><a class="inline-link" href="/resources/">Every guide and answer &rarr;</a></p>
    </div>
  </section>`;
