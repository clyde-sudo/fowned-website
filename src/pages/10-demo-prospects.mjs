import { esc, truth, source, health } from "../ui.mjs";
import { PROSPECTS, LIFECYCLE, OWNERS } from "../data.mjs";

const card = (p) => `        <article class="prospect" data-owner="${esc(p.owner)}" data-status="${esc(p.status)}">
          <div class="prospect-head">
            <div>
              <h2>${esc(p.company)}</h2>
              <p class="prospect-domain">${esc(p.domain)}</p>
            </div>
            <div class="prospect-marks">
              ${health(p.health)}
              <span class="status-chip status-${esc(p.status)}">${esc(p.status)}</span>
            </div>
          </div>
          <dl class="prospect-fields">
            <div><dt>Contact</dt><dd><!--email_off-->${esc(p.contact)}<!--/email_off--></dd></div>
            <div><dt>Source</dt><dd>${source(p.source)}</dd></div>
            <div><dt>Landing page</dt><dd><code>${esc(p.landing)}</code></dd></div>
            <div><dt>Audit health</dt><dd>${esc(p.score)} checks passing</dd></div>
            <div><dt>AI visibility signal</dt><dd>${esc(p.aiSignal)}</dd></div>
            <div><dt>Opportunity score</dt><dd><span class="score-bar"><span style="width:${p.opportunity}%"></span></span> ${p.opportunity} / 100</dd></div>
            <div><dt>Confidence</dt><dd><span class="conf conf-${esc(p.confidence)}">${esc(p.confidence)}</span></dd></div>
            <div><dt>Owner</dt><dd><span class="owner owner-${esc(p.owner)}">${esc(p.owner)}</span></dd></div>
          </dl>
          <div class="prospect-findings">
            <span class="label">Major findings</span>
            <ul>${p.findings.map((f) => `<li>${esc(f)}</li>`).join("")}</ul>
          </div>
          <p class="prospect-next"><span class="label">Recommended next action</span> ${esc(p.next)}</p>
        </article>`;

export default {
  path: "/demo/prospects/",
  shell: "demo",
  title: "Agency prospect pipeline (demo) | Fowned",
  description: "Demonstration of the Fowned agency prospect workspace. All records are fictional demo data.",
  scripts: ["/js/demo.js"],
  body: `      <header class="demo-head">
        <span class="label">Agency workspace</span>
        <h1>Prospect pipeline</h1>
        <p>Every lead that runs an audit arrives here with the audit attached, so the first conversation starts from evidence instead of a script. Filter by owner to see what lands on each desk.</p>
      </header>

      <div class="demo-filters" role="group" aria-label="Filter prospects">
        <div class="filter-set">
          <span class="label">Owner</span>
          <button class="chip is-on" data-filter="owner" data-value="ALL">All</button>
${OWNERS.map((o) => `          <button class="chip" data-filter="owner" data-value="${esc(o)}">${esc(o)}</button>`).join("\n")}
        </div>
        <div class="filter-set">
          <span class="label">Lifecycle</span>
          <button class="chip is-on" data-filter="status" data-value="ALL">All</button>
${LIFECYCLE.map((s) => `          <button class="chip" data-filter="status" data-value="${esc(s)}">${esc(s)}</button>`).join("\n")}
        </div>
      </div>
      <p class="filter-count" id="filterCount" role="status"></p>

      <div class="prospect-grid" id="prospectGrid">
${PROSPECTS.map(card).join("\n")}
      </div>

      <div class="demo-note">
        <span class="label">How this connects</span>
        <p>In production each row is a prospect record in the client's own workspace on the measurement platform, scoped so one agency's prospects are never reachable from another's. The audit result, the referrer and the landing path are captured at the moment the visitor runs the audit; owner, lifecycle and next action are set by the agency. Nothing on this screen is a real company.</p>
      </div>`,
};
