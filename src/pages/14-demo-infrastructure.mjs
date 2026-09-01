import { esc, truth } from "../ui.mjs";
import { INFRA_CHECKS } from "../data.mjs";

const row = (c) => {
  const mark = c.ok === null ? '<span class="mark mark-unknown">?</span>'
    : c.ok ? '<span class="mark mark-pass">&#10003;</span>'
    : '<span class="mark mark-fail">&#10005;</span>';
  const verdict = c.ok === null ? '<span class="unmeasured">Not measured</span>' : c.ok ? "Passing" : "Failing";
  return `          <li class="check ${c.ok === null ? "is-unknown" : c.ok ? "is-pass" : "is-fail"}">
            ${mark}
            <span class="check-name">${esc(c.name)}</span>
            <span class="check-verdict">${verdict}</span>
            ${truth(c.state)}
          </li>`;
};

export default {
  path: "/demo/client/infrastructure/",
  shell: "demo",
  title: "Retrieval infrastructure (demo) | Fowned",
  description: "Demonstration of retrieval-health checks. All results shown are fictional demo data.",
  body: `      <header class="demo-head">
        <span class="label">Demo client &middot; infrastructure</span>
        <h1>Retrieval health</h1>
        <p>Whether an automated client can fetch these pages and find the facts in them. This is the only one of the three measurement families that is fully under the client's control, and the only one that is pass or fail rather than sampled.</p>
      </header>

      <div class="summary-line">
        <span><strong>8 of 10</strong> checks passing</span>
        ${truth("PARTIAL")}
        <span class="summary-note">Eleven checks exist. One could not be measured, so the denominator is ten rather than eleven. The unmeasured check is not counted as a failure.</span>
      </div>

      <ul class="check-list">
${INFRA_CHECKS.map(row).join("\n")}
      </ul>

      <section class="demo-block">
        <h2>Why the denominator moves</h2>
        <p>If an unmeasured check were counted as failing, a broken instrument would look identical to a broken website, and the client would be sold a fix for something that was never diagnosed. Shrinking the denominator keeps the two distinguishable at the cost of a score that moves for a boring reason, which is the correct trade.</p>
      </section>

      <div class="demo-note">
        <span class="label">How this connects</span>
        <p>In production these are the same checks the public free audit runs, executed on a schedule against every page rather than once against one. Every verdict on this screen is fictional.</p>
      </div>`,
};
