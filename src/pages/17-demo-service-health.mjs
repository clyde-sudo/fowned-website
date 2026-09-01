import { esc, truth, table } from "../ui.mjs";
import { SERVICE_HEALTH } from "../data.mjs";

export default {
  path: "/demo/client/service-health/",
  shell: "demo",
  title: "Service health (demo) | Fowned",
  description: "Demonstration of the service-health surface. All statuses shown are fictional demo data.",
  body: `      <header class="demo-head">
        <span class="label">Demo client &middot; service health</span>
        <h1>Service health</h1>
        <p>Whether the measurement service itself is working. A client should be able to tell the difference between "your visibility got worse" and "our instrument stopped reporting", and that requires showing the instrument.</p>
      </header>

${table(
  ["Component", "State", "Detail"],
  SERVICE_HEALTH.map((s) => [esc(s.name), truth(s.state), esc(s.detail)])
)}

      <section class="demo-block">
        <h2>Why this page is shown to clients</h2>
        <p>Most measurement products hide their own failures, which means a silent outage reads as a flat line in the data. Publishing the instrument's state to the client makes that impossible: an alerting component marked stale is a visible admission, and a visible admission is one a client can act on.</p>
        <p>Competitor sampling is marked never because it is not enabled on this plan. That is a scope fact, not a failure, and it is shown rather than omitted so nobody assumes it is running.</p>
      </section>

      <div class="demo-note">
        <span class="label">How this connects</span>
        <p>In production each row reflects the real state of a scheduled component. Every status on this screen is fictional.</p>
      </div>`,
};
