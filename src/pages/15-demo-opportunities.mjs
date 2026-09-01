import { esc } from "../ui.mjs";
import { INTELLIGENCE } from "../data.mjs";

const chain = (r, i) => `        <article class="chain">
          <div class="chain-rank"><span class="label">Chain ${i + 1}</span><span class="conf conf-${esc(r.confidence)}">${esc(r.confidence)} confidence</span></div>
          <ol class="chain-steps">
            <li><span class="label">Observation</span><p>${esc(r.observation)}</p></li>
            <li><span class="label">Diagnosis</span><p>${esc(r.diagnosis)}</p></li>
            <li><span class="label">Opportunity</span><p>${esc(r.opportunity)}</p></li>
            <li><span class="label">Recommendation</span><p>${esc(r.recommendation)}</p></li>
            <li><span class="label">Intervention</span><p><span class="iv iv-${r.intervention.split(" ")[0]}">${esc(r.intervention)}</span></p></li>
            <li><span class="label">Re-measure</span><p><span class="iv iv-${r.remeasure.split(" ")[0]}">${esc(r.remeasure)}</span></p></li>
          </ol>
          <p class="chain-caution"><span class="label">What this does not claim</span> ${esc(r.caution)}</p>
        </article>`;

export default {
  path: "/demo/client/opportunities/",
  shell: "demo",
  title: "Opportunities and interventions (demo) | Fowned",
  description: "Demonstration of the observation-to-re-measure chain. All chains shown are fictional demo data.",
  body: `      <header class="demo-head">
        <span class="label">Demo client &middot; opportunities</span>
        <h1>From observation to re-measure</h1>
        <p>Each chain runs the same six steps in the same order. The order is the point: an observation is not a diagnosis, a diagnosis is not a proven cause, and an intervention has no measured effect until the re-measure returns.</p>
      </header>

      <div class="chain-list">
${INTELLIGENCE.map(chain).join("\n")}
      </div>

      <section class="demo-block">
        <h2>Why every chain carries a caution</h2>
        <p>The step most often skipped in this industry is the last one. A change is made, a number moves, and the change is credited. Here the intervention date and the re-measure schedule are both recorded, so the gap between "we changed something" and "we know what it did" stays visible instead of being closed by assertion.</p>
        <p>Confidence describes the <strong>diagnosis</strong>, not the outcome. A high-confidence diagnosis with an awaited re-measure is still an unproven effect.</p>
      </section>

      <div class="demo-note">
        <span class="label">How this connects</span>
        <p>In production an observation is written by a scheduled measurement run, the diagnosis and recommendation by the agency, and the re-measure state advances automatically when the next run returns. Every chain on this screen is fictional.</p>
      </div>`,
};
