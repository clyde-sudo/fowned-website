import { esc, truth, table } from "../ui.mjs";
import { VISIBILITY_ROWS, DEMO_CLIENT } from "../data.mjs";

const named = (r) =>
  r.named === null
    ? '<span class="unmeasured">Not measured</span>'
    : r.named
    ? '<span class="yes">Named</span>'
    : '<span class="no">Not named</span>';

export default {
  path: "/demo/client/visibility/",
  shell: "demo",
  title: "Answer presence (demo) | Fowned",
  description: "Demonstration of answer-presence sampling. All results shown are fictional demo data.",
  body: `      <header class="demo-head">
        <span class="label">Demo client &middot; visibility</span>
        <h1>Answer presence</h1>
        <p>A fixed set of category questions is asked on each scheduled run and the result recorded. This is a <strong>sample</strong>, and a sample is evidence about the sample. The denominator is shown every time so two of six is never quietly presented as a percentage.</p>
      </header>

      <div class="summary-line">
        <span><strong>2 of 6</strong> questions named ${esc(DEMO_CLIENT.name)}</span>
        ${truth("PARTIAL")}
        <span class="summary-note">One question failed to return and one has never been sampled. Both are excluded from the denominator rather than counted as not-named.</span>
      </div>

${table(
  ["Question sampled", "Result", "Position", "State"],
  VISIBILITY_ROWS.map((r) => [esc(r.q), named(r), esc(r.pos), truth(r.state)])
)}

      <section class="demo-block">
        <h2>What this does not tell you</h2>
        <ul class="claim-list">
          <li>It does not measure how often real customers ask these questions. The question set is chosen with the client, not derived from observed demand.</li>
          <li>It does not prove an answer is stable. Assistants can answer the same question differently on the same day, which is why a single run is never reported as a trend.</li>
          <li>It does not connect an answer to an enquiry. That link is not observable from here, and the lead source page keeps the two separate on purpose.</li>
        </ul>
      </section>

      <div class="demo-note">
        <span class="label">How this connects</span>
        <p>In production each row is one sampled question from one scheduled run, stored with its timestamp so successive runs are comparable. Every question and result on this screen is fictional.</p>
      </div>`,
};
