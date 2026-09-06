import { head, answer, cta, table } from "../ui.mjs";

export default {
  path: "/ai-visibility/",
  title: "How we measure AI visibility and attribute leads | Fowned",
  description:
    "What we measure, how each measurement can fail, and the closed vocabulary we use to label where a lead came from. Observed, inferred and unknown stay separate.",
  body: `  <section class="page-hero">
    <div class="container narrow">
      <span class="label">Measurement</span>
      <h1>What we measure, and what we refuse to guess.</h1>
      <p class="hero-sub">Most of this page is about the limits. The limits are the part that determines whether a number you are shown means anything.</p>
    </div>
  </section>

  <section>
    <div class="container narrow">
${head({ label: "Method", h: "Three things get measured, separately." })}
      <p>Retrieval health comes from the free audit on this site. Answer presence is measured with <a class="inline-link" href="https://citability.dev/" rel="noopener">Citability</a>, the measurement platform this service is built on; it runs the question set, keeps the history and records the denominator. Fowned does the implementation work a measurement points to. The two are separate on purpose, so the instrument is never grading its own repair.</p>
${answer(
  "Retrieval health",
  "Whether an automated client can fetch your pages and find the facts in them. This is directly observable, it either works or it does not, and it is the only one of the three that is fully under your control. Checks include server-rendered content, structured data, access rules and consistency of business details."
)}
${answer(
  "Answer presence",
  "Whether your business is named when a set of category questions is asked. This is sampled, not exhaustive: we ask a fixed set of questions on a schedule and record what came back. A sample is evidence about the sample. We report the denominator every time, so two of six never gets rounded up into a percentage that implies a survey."
)}
${answer(
  "Lead source",
  "Where a visitor who contacted you actually arrived from, taken from the referrer their browser sent. Present or absent, never inferred. When no referrer arrives we record unknown, because AI surfaces routinely strip it and folding those into direct traffic would quietly convert a missing measurement into a claim."
)}
    </div>
  </section>

  <section class="band">
    <div class="container narrow">
${head({ label: "Vocabulary", h: "Every lead gets exactly one of these labels." })}
${table(
  ["Class", "What was seen", "Evidence"],
  [
    ["Google organic", "Referrer named a Google search property", "Observed"],
    ["Bing organic", "Referrer named a Bing search property", "Observed"],
    ["AI referrer", "Referrer named an AI assistant surface", "Observed"],
    ["Other referrer", "Referrer named some other site", "Observed"],
    ["Direct or unknown", "No referrer arrived at all", "Unknown"],
  ]
)}
      <p class="fineprint">The list is closed. A fourth evidence class does not get added unless something new is genuinely observable, because an unobservable label is a place for a guess to hide.</p>
    </div>
  </section>

  <section>
    <div class="container narrow">
${head({ label: "Failure states", h: "A measurement that did not happen is not a zero." })}
      <p>Every figure on a Fowned report carries one of five states. This is the whole reason a report can be trusted: you can see the difference between a bad result and no result.</p>
      <ul class="claim-list">
        <li><strong>Current.</strong> Measured in the most recent scheduled run.</li>
        <li><strong>Stale.</strong> The last successful measurement is older than the agreed cadence. The number shown is real but out of date.</li>
        <li><strong>Partial.</strong> Some checks returned and some did not. The denominator shrinks rather than the numerator, so an unmeasured check never reads as a failure.</li>
        <li><strong>Failed.</strong> The run executed and could not produce a verdict.</li>
        <li><strong>Never.</strong> This has never been successfully measured. It is not zero, and it is not drawn as zero.</li>
      </ul>
      <p class="center-link"><a class="inline-link" href="/demo/client/">See the five states on a live-shaped dashboard &rarr;</a></p>
    </div>
  </section>

${cta({
  h: "See your own numbers.",
  p: "The free audit runs the retrieval-health checks described above and reports each one as itself.",
  primary: { href: "/audit/", text: "Run my free audit &rarr;", ev: "aiv_audit" },
  secondary: { href: "/demo/client/", text: "See the dashboard", ev: "aiv_demo" },
})}`,
};
