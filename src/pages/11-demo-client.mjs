import { esc, truth } from "../ui.mjs";
import { DEMO_CLIENT, OVERVIEW_TILES, TRUTH_STATES } from "../data.mjs";

export default {
  path: "/demo/client/",
  shell: "demo",
  title: "Client monitoring overview (demo) | Fowned",
  description: "Demonstration of the Fowned client monitoring overview. All telemetry shown is fictional demo data.",
  body: `      <header class="demo-head">
        <span class="label">Demo client</span>
        <h1>${esc(DEMO_CLIENT.name)}</h1>
        <p class="demo-sub"><code>${esc(DEMO_CLIENT.domain)}</code> &middot; ${esc(DEMO_CLIENT.cadence)}</p>
        <div class="run-line">
          <span><span class="label">Last run</span> ${esc(DEMO_CLIENT.lastRun)}</span>
          <span><span class="label">Next run</span> ${esc(DEMO_CLIENT.nextRun)}</span>
        </div>
      </header>

      <div class="tile-grid">
${OVERVIEW_TILES.map(
  (t) => `        <div class="tile">
          <span class="label">${esc(t.label)}</span>
          <p class="tile-value${t.state === "NEVER" ? " is-unmeasured" : ""}">${esc(t.value)}</p>
          <p class="tile-note">${esc(t.note)}</p>
          ${truth(t.state)}
        </div>`
).join("\n")}
      </div>

      <section class="demo-block">
        <h2>The five states, and why they exist</h2>
        <p>Every figure on every screen in this workspace carries one of these. The distinction that does the most work is the last one: a metric that has never been measured has no value, and drawing it as zero would invent a data point.</p>
        <div class="state-legend">
${Object.entries(TRUTH_STATES)
  .map(([k, v]) => `          <div class="state-row">${truth(k)}<span>${esc(v.note)}</span></div>`)
  .join("\n")}
        </div>
      </section>

      <div class="demo-note">
        <span class="label">How this connects</span>
        <p>In production these tiles read from scheduled measurement runs against the client's own domain. The state on each tile is derived from the run record, not chosen by hand: a run that failed sets FAILED, a metric with no successful run ever sets NEVER. Every number on this screen is fictional.</p>
      </div>`,
};
