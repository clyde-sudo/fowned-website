import { head, answer, cta, table, relatedGuides } from "../ui.mjs";
import { SITE } from "../layout.mjs";

/* Primary query: "how do i know which leads found me from chatgpt?" (GSC,
 * position 7.3, 39 impressions, 0 clicks through 2026-10-27), plus "how to
 * track leads from chatgpt". The title and short answer lead with that
 * question. The "When AI referrals dip" section answers the follow-up a
 * practice owner asked a client team in October 2026; no client is named.
 * Funnel job: informational spoke -> /audit/, with /ai-visibility/ as the hub.
 * The source vocabulary named here mirrors js/instrument.js; keep in sync. */
const Q_WHICH = "How do I know which leads found me from ChatGPT?";
const A_WHICH = "Use three records together. First, the referrer: a visitor who clicks a link in ChatGPT often arrives with chatgpt.com as the referring site, sometimes with utm_source=chatgpt.com added to the address, and your analytics can report it. Second, ask every new lead how they heard about you, and include an AI assistant such as ChatGPT as one of the answers. Third, put a campaign tag on the links you control, such as the website link on your Google Business Profile. No one record catches every lead; together they show which leads were observed coming from AI and which are unknown.";
const Q_DIP = "Why did my AI referrals go down?";
const A_DIP = "Check four things before concluding anything. AI answers vary from one asking to the next, so one month can be noise. AI apps often open links with no referrer, so those visitors are counted as direct. The analytics tag on your site may report to a different account than the one you are reading, which happens when more than one agency has worked on the site. And many categories are seasonal. Only a trend across several months, measured the same way each time, says the recommendations changed.";

export default {
  path: "/guides/how-to-track-leads-from-chatgpt/",
  title: "Which leads found you from ChatGPT, and how to track them | Fowned",
  description:
    "How to tell which leads found you from ChatGPT or AI search: the referrer, the intake question and campaign tags, what each one can prove, and what to check when AI referrals dip.",
  schema: [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Resources", item: `${SITE.origin}/resources/` },
        { "@type": "ListItem", position: 2, name: "How to track leads from ChatGPT and AI search", item: `${SITE.origin}/guides/how-to-track-leads-from-chatgpt/` },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        { "@type": "Question", name: Q_WHICH, acceptedAnswer: { "@type": "Answer", text: A_WHICH } },
        { "@type": "Question", name: Q_DIP, acceptedAnswer: { "@type": "Answer", text: A_DIP } },
      ],
    },
  ],
  body: `  <section class="page-hero">
    <div class="container narrow">
      <span class="label">Guide</span>
      <h1>Which leads found you from ChatGPT, and how to track them.</h1>
      <p class="hero-sub">Most AI traffic reports infer a source from its absence. This page covers the three records that show which leads came from ChatGPT or another assistant, what each one can prove, and what to check when the numbers drop.</p>
    </div>
  </section>

  <section>
    <div class="container narrow">
${head({ label: "Short answer", h: "Three records, read together." })}
${answer(Q_WHICH, A_WHICH)}
${answer(
  "Why ask the lead as well as reading analytics?",
  "Because analytics misses the visitors who arrive with no referrer, and the person who called or booked does not. A lead who says they asked ChatGPT is first-hand evidence. Write the answer down with the date, in the same place every time, so it can be counted next to the analytics."
)}
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
      <p>This is the vocabulary used on <a class="inline-link" href="/ai-visibility/">the measurement page</a> and in the attribution tier of <a class="inline-link" href="/services/">the services</a>.</p>
    </div>
  </section>

  <section>
    <div class="container narrow">
${head({ label: "When AI referrals dip", h: "Four checks before reading a drop as a loss." })}
${answer(Q_DIP, A_DIP)}
      <ol class="check-list">
        <li><strong>Compare several months, not one.</strong> Assistants write each answer fresh, and a repeat question can name different businesses. <a class="inline-link" href="/guides/why-chatgpt-gives-different-answers/">Why ChatGPT gives different answers</a> covers why, and what one large study of dentist recommendations found.</li>
        <li><strong>Count the unknowns.</strong> If direct visits rose while AI referrals fell, some of the AI visitors may simply have arrived without a referrer.</li>
        <li><strong>Confirm which account the site reports to.</strong> Open your site, find the analytics measurement ID it sends, and check that it matches the account you are reading. An account that shows no data at all is the usual sign of a mismatch.</li>
        <li><strong>Check the season.</strong> Compare with the same month last year before comparing with last month.</li>
      </ol>
    </div>
  </section>

${relatedGuides("/guides/how-to-track-leads-from-chatgpt/")}

${cta({
  h: "Before tracking leads, make sure you can be found.",
  p: "The free audit checks whether AI retrieval can reach your site at all. Attribution on a site nothing can fetch measures nothing.",
  primary: { href: "/audit/", text: "Request my free audit →", ev: "guide_track_leads" },
})}`,
};
