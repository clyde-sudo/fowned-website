import { head, answer, cta } from "../ui.mjs";

export default {
  path: "/how-it-works/",
  title: "How Fowned works | the six-step loop | Fowned",
  description:
    "Observation, diagnosis, opportunity, recommendation, intervention, re-measure. The loop we run, and the rule that a step is never skipped forward.",
  schema: [
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "How long does the first audit take?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "The automated retrieval checks run in about a minute. The reviewed version, where a person reads the result and writes the diagnosis, is returned within two business days.",
          },
        },
        {
          "@type": "Question",
          name: "What happens if a measurement fails?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "It is reported as failed and excluded from the score. A check that produced no verdict is never counted as a failing check, because that would make a broken measurement look like a broken website.",
          },
        },
        {
          "@type": "Question",
          name: "Do you need access to our website?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Not for the audit, which only reads public pages. Implementation work needs either access or a developer on your side to apply the changes. We are equally happy handing a specification to your team.",
          },
        },
      ],
    },
  ],
  body: `  <section class="page-hero">
    <div class="container narrow">
      <span class="label">Method</span>
      <h1>Six steps, and none of them skip ahead.</h1>
      <p class="hero-sub">The order is the method. An observation is not a diagnosis, a diagnosis is not a proven cause, and an intervention has no effect until it is re-measured.</p>
    </div>
  </section>

  <section>
    <div class="container">
      <ol class="loop-list">
        <li><span class="loop-num">1</span><div><h2>Observation</h2><p>Something measurable is recorded. "Search agents received a 403 on every request for nine days." No interpretation yet, just what was seen and when.</p></div></li>
        <li><span class="loop-num">2</span><div><h2>Diagnosis</h2><p>The mechanism behind the observation, identified and stated as a claim that could be wrong. "A firewall rule is challenging non-browser clients." This is where most agencies skip straight to selling.</p></div></li>
        <li><span class="loop-num">3</span><div><h2>Opportunity</h2><p>What would be worth having if the diagnosis is correct, sized honestly. Not a revenue projection, because that would require causal evidence we do not have yet.</p></div></li>
        <li><span class="loop-num">4</span><div><h2>Recommendation</h2><p>The specific change, at the level of a named rule or a named page. Vague advice cannot be checked afterwards, which is precisely why vague advice is popular.</p></div></li>
        <li><span class="loop-num">5</span><div><h2>Intervention</h2><p>The change is applied, by us or by your team, and the date is recorded. Without a date, before and after are not distinguishable.</p></div></li>
        <li><span class="loop-num">6</span><div><h2>Re-measure</h2><p>The same measurement runs again on schedule. Until it returns, the intervention has an unknown effect, and that is exactly how it is reported.</p></div></li>
      </ol>
      <p class="center-link"><a class="inline-link" href="/demo/client/opportunities/">See the loop on a worked example &rarr;</a></p>
    </div>
  </section>

  <section class="band">
    <div class="container narrow">
${head({ label: "Questions", h: "What people ask before signing." })}
${answer(
  "How long does the first audit take?",
  "The automated retrieval checks run in about a minute. The reviewed version, where a person reads the result and writes the diagnosis, is returned within two business days."
)}
${answer(
  "What happens if a measurement fails?",
  "It is reported as failed and excluded from the score. A check that produced no verdict is never counted as a failing check, because that would make a broken measurement look like a broken website."
)}
${answer(
  "Do you need access to our website?",
  "Not for the audit, which only reads public pages. Implementation work needs either access or a developer on your side to apply the changes. We are equally happy handing a specification to your team."
)}
    </div>
  </section>

${cta({
  h: "Step one is free.",
  p: "The audit is the observation stage of the loop. Everything else follows from what it finds.",
  primary: { href: "/audit/", text: "Run my free audit &rarr;", ev: "how_audit" },
  secondary: { href: "/services/", text: "See service levels", ev: "how_services" },
})}`,
};
