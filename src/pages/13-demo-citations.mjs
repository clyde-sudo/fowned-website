import { esc, truth, table } from "../ui.mjs";
import { CITATIONS } from "../data.mjs";

export default {
  path: "/demo/client/citations/",
  shell: "demo",
  title: "Cited pages (demo) | Fowned",
  description: "Demonstration of cited-page tracking. All citations shown are fictional demo data.",
  body: `      <header class="demo-head">
        <span class="label">Demo client &middot; citations</span>
        <h1>Cited pages</h1>
        <p>Which of the client's own pages were seen referenced as a source in a sampled answer, and when each was first observed. A page that has never been cited is listed as never, not as zero.</p>
      </header>

${table(
  ["Page", "Surface", "First observed", "State"],
  CITATIONS.map((c) => [
    `<code>${esc(c.url)}</code>`,
    esc(c.surface),
    c.first ? esc(c.first) : '<span class="unmeasured">Never observed</span>',
    truth(c.state),
  ])
)}

      <section class="demo-block">
        <h2>Reading this table honestly</h2>
        <ul class="claim-list">
          <li><strong>Stale</strong> on a row means the citation was real when last seen and has not been re-confirmed since. It does not mean the citation was removed.</li>
          <li><strong>Never observed</strong> means this page has not appeared as a source in any sampled answer. Since sampling is not exhaustive, that is an absence of evidence and not evidence of absence.</li>
          <li>The count of cited pages is not a ranking, a score or a share. It is a count of observations.</li>
        </ul>
      </section>

      <div class="demo-note">
        <span class="label">How this connects</span>
        <p>In production a citation row is written when a sampled answer references a URL on the client's domain. Nothing on this screen was observed; the client, the pages and the dates are all invented.</p>
      </div>`,
};
