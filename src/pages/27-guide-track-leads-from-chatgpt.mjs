import { head, answer, cta, table } from "../ui.mjs";
import { SITE } from "../layout.mjs";

/* Primary query: "how to track leads from chatgpt" / "track ai search traffic".
 * Funnel job: informational spoke -> /audit/, with /ai-visibility/ as the hub.
 * The source vocabulary named here mirrors js/instrument.js; keep in sync. */
export default {
  path: "/guides/how-to-track-leads-from-chatgpt/",
  title: "How to track leads from ChatGPT and AI search without guessing | Fowned",
  description:
    "What a referrer proves about a lead from ChatGPT or AI search, what it cannot, the five source labels we record, and how to set it up on a local business site.",
  schema: [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Resources", item: `${SITE.origin}/resources/` },
        { "@type": "ListItem", position: 2, name: "How to track leads from ChatGPT and AI search", item: `${SITE.origin}/guides/how-to-track-leads-from-chatgpt/` },
      ],
    },
  ],
  body: `  <section class="page-hero">
    <div class="container narrow">
      <span class="label">Guide</span>
      <h1>How to track leads from ChatGPT and AI search without guessing.</h1>
      <p class="hero-sub">Most AI traffic reports are built by inferring a source from its absence. This page is about recording what was observed and labeling the rest unknown, which is less flattering and considerably more useful.</p>
    </div>
  </section>

  <section>
    <div class="container narrow">
${head({ label: "The instrument", h: "What the browser actually tells you." })}
${answer(
  "The referrer is the only direct evidence",
  "When a visitor clicks a link in ChatGPT, Perplexity or Gemini, their browser may send the address of the page they came from. When it does, you have an observed AI referrer, and that is a fact. When it does not, you have nothing, and the correct label for nothing is unknown."
)}
${answer(
  "AI surfaces strip the referrer often",
  "Links opened from a chat interface frequently arrive with no referrer at all. The visitor then looks identical to someone who typed your address by hand. Analytics tools label this direct, and reports built on that label quietly convert a missing measurement into a claim that the visitor was not from AI, or worse, that they were."
)}
${answer(
  "Campaign tags survive when the referrer does not",
  "A link you control, such as the website field in your Google Business Profile, can carry a campaign tag. That tag arrives regardless of the referrer. It cannot tell you the visitor came from an assistant, but it can tell you which of your listings they came through, which is a narrower and more honest fact."
)}
    </div>
  </section>

  <section>
    <div class="container narrow">
${head({ label: "Closed vocabulary", h: "The five labels we record, and nothing else." })}
${table(
  ["Label", "When it is applied", "Evidence"],
  [
    ["Observed AI referrer", "The referrer host is a known assistant, such as chatgpt.com or perplexity.ai", "Observed"],
    ["Google organic", "The referrer host is a Google search domain", "Observed"],
    ["Bing organic", "The referrer host is bing.com", "Observed"],
    ["Other referrer", "A referrer arrived from somewhere else", "Observed"],
    ["Direct or unknown", "No referrer arrived, or it could not be read", "Unknown"],
  ]
)}
      <p>The list is closed on purpose. Adding a label requires something newly observable, not a better guess. Direct and unknown share one label because they are indistinguishable from the browser's side, and splitting them would be inventing a distinction the instrument cannot make.</p>
    </div>
  </section>

  <section>
    <div class="container narrow">
${head({ label: "The chain", h: "From first visit to booked meeting." })}
      <ol class="check-list">
        <li><strong>Record the first touch and keep it.</strong> The source label, the landing page and the referrer are stored once per session and travel with every later event. A visitor who arrives from an assistant, reads two pages and then books is still an observed AI referrer at the booking, not a direct visit.</li>
        <li><strong>Name the events, and keep the list short.</strong> Page view, audit started, audit completed, lead form started, lead form submitted, booking clicked. Six events reconstruct the whole path. A hundred events reconstruct nothing anyone reads.</li>
        <li><strong>Join on the landing page.</strong> Which article a visitor landed on is recorded with every event, so article to audit to booking is a query, not an inference.</li>
        <li><strong>Qualify by hand and record the date.</strong> Whether a booked meeting was a real prospect is a judgment a person makes on the call. Write it down with the date. It is the one step no script can do, and the step most reports skip.</li>
      </ol>
    </div>
  </section>

  <section>
    <div class="container narrow">
${head({ label: "What this cannot tell you", h: "Stated once, so no report has to imply otherwise." })}
      <ul class="check-list">
        <li><strong>How many AI visitors you had.</strong> Only how many carried an observed AI referrer. The unknown column is a floor on your uncertainty, not a rounding error.</li>
        <li><strong>Whether an assistant recommended you.</strong> A referrer proves a click on a link, not what the answer said. Answer presence is a separate measurement, sampled on a schedule, and it is what <a class="inline-link" href="https://citability.dev/" rel="noopener">Citability</a> exists to do.</li>
        <li><strong>Revenue caused by AI.</strong> A booked meeting with an observed AI referrer is a correlated fact. Causation would need the counterfactual, and nobody has it.</li>
      </ul>
      <p>This is the vocabulary used on <a class="inline-link" href="/ai-visibility/">the measurement page</a> and in the attribution tier of <a class="inline-link" href="/services/">the services</a>. It is also what the demonstration dashboard shows, with all five labels visible and the unknown column left unhidden.</p>
    </div>
  </section>

${cta({
  h: "Before tracking leads, make sure you can be found.",
  p: "The free audit checks whether AI retrieval can reach your site at all. Attribution on a site nothing can fetch measures nothing.",
  primary: { href: "/audit/", text: "Run my free audit →", ev: "guide_track_leads" },
  secondary: { href: "/demo/client/", text: "See the five labels on a dashboard", ev: "guide_track_leads_demo" },
})}`,
};
