import { esc, truth, table } from "../ui.mjs";
import { REPORTS } from "../data.mjs";

export default {
  path: "/demo/client/reports/",
  shell: "demo",
  title: "Reports (demo) | Fowned",
  description: "Demonstration of the client reporting surface. All periods shown are fictional demo data.",
  body: `      <header class="demo-head">
        <span class="label">Demo client &middot; reports</span>
        <h1>Reports</h1>
        <p>One report per period, each carrying the state of the runs behind it. A period with a failed run says so rather than averaging over a denominator that includes a run which never happened.</p>
      </header>

${table(
  ["Period", "State", "Note"],
  REPORTS.map((r) => [esc(r.period), truth(r.state), esc(r.note)])
)}

      <section class="demo-block">
        <h2>The rule this table exists to hold</h2>
        <p>August shows three of four weekly runs. The tempting presentation is a monthly average over four weeks, which silently treats a missing run as an average one. Reporting three of four keeps the missing run visible, and a client who can see a gap can ask about it.</p>
        <p>May is marked never, not zero. Monitoring started in June. A chart that plotted May at zero would show a dramatic improvement that never occurred.</p>
      </section>

      <div class="demo-note">
        <span class="label">How this connects</span>
        <p>In production a report is generated from the stored run records for the period, and its state is derived from them rather than set by hand. Every period on this screen is fictional.</p>
      </div>`,
};
