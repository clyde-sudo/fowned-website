import { head, answer, cta, table, relatedGuides } from "../ui.mjs";
import { SITE } from "../layout.mjs";

/* Primary query: "why does chatgpt give different answers to the same question"
 * (Google autocomplete, 2026-10-29, with seven sibling phrasings), plus whether
 * AI recommendations can be trusted and why AI referrals dip. Every study
 * figure below is from the DrBicuspid article (2026-10-28), read in full; keep
 * it that way. FAQ answers are shared constants so the schema text matches the
 * visible text exactly. Funnel job: informational spoke -> /audit/. */
const Q_WHY = "Why does ChatGPT give different answers to the same question?";
const A_WHY = "An assistant writes each answer fresh. It chooses its words with some randomness built in, and when web search is on it reads whatever pages its search returns at that moment. Change the wording, the assistant or the location and the list changes again. Two askings of the same question are two separate samples, not two looks at one fixed ranking.";
const Q_RANDOM = "Are AI recommendations for local businesses random?";
const A_RANDOM = "Not entirely. An assistant can only name a business it can find and read, and the study below shows the best rated are not always the ones named. A site the assistant can fetch, pages that say plainly what the business does and where, and outside listings that agree are the parts of being named that a business controls.";
const Q_DIP = "Why did my AI referrals go down this month?";
const A_DIP = "Check four things before concluding anything. Answers vary, so one month can be noise; compare several. AI apps often send visitors with no referrer, so they read as direct visits. The analytics tag on your site may report to a different account than the one you are reading, which can happen when more than one agency has worked on the site. And many categories are seasonal. Only a trend across months, measured the same way each time, says the recommendations themselves changed.";
const STUDY = "https://www.drbicuspid.com/dental-practice/patient-communication/marketing/article/15838262/asking-ai-to-recommend-dentists-isnt-going-well";

export default {
  path: "/guides/why-chatgpt-gives-different-answers/",
  title: "Why ChatGPT gives different answers to the same question | Fowned",
  description:
    "Why ChatGPT, Gemini and other assistants recommend different businesses each time you ask, what a 2026 study of dentist recommendations found, and how a local business should measure through it.",
  schema: [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Resources", item: `${SITE.origin}/resources/` },
        { "@type": "ListItem", position: 2, name: "Why ChatGPT gives different answers", item: `${SITE.origin}/guides/why-chatgpt-gives-different-answers/` },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        { "@type": "Question", name: Q_WHY, acceptedAnswer: { "@type": "Answer", text: A_WHY } },
        { "@type": "Question", name: Q_RANDOM, acceptedAnswer: { "@type": "Answer", text: A_RANDOM } },
        { "@type": "Question", name: Q_DIP, acceptedAnswer: { "@type": "Answer", text: A_DIP } },
      ],
    },
  ],
  body: `  <section class="page-hero">
    <div class="container narrow">
      <span class="label">Guide</span>
      <h1>Why ChatGPT gives a different answer every time you ask.</h1>
      <p class="hero-sub">If you asked an assistant to recommend a business like yours, asked again, and got a different list, nothing broke. This page explains why it happens, what one large study found, and how to measure a business's AI visibility when no single answer can be trusted on its own.</p>
    </div>
  </section>

  <section>
    <div class="container narrow">
${head({ label: "Short answer", h: "Each answer is a new sample." })}
${answer(Q_WHY, A_WHY)}
    </div>
  </section>

  <section>
    <div class="container narrow">
${head({ label: "The causes", h: "Four reasons the list changes." })}
${answer(
  "1. The answer is written, not looked up",
  "There is no stored list of the best dentists in your town that the assistant reads out. Each answer is generated word by word, and the model is built to vary its choices slightly each time. On a question with many reasonable answers, such as which local business to choose, that small variation is enough to change who gets named."
)}
${answer(
  "2. Live search returns different pages",
  "When an assistant searches the web before it answers, it reads some of the pages that come back, and what comes back changes over time. A business named on a page the assistant happened to read is in the answer. The same business, missing from the pages read the next time, is not."
)}
${answer(
  "3. The wording and the place change the question",
  "Best orthodontist near me, best reviewed orthodontist in a named town, and how much braces cost nearby are three different questions to an assistant, and each one sends it to different sources. Where the person is, or which town the question names, changes the candidates before anything else happens."
)}
${answer(
  "4. Each assistant is a different system",
  "ChatGPT, Gemini, Claude and Perplexity are built by different companies, search the web through different systems and can rely on different sources. A business named by one is not automatically named by the others, which is why each one has to be checked on its own."
)}
    </div>
  </section>

  <section>
    <div class="container narrow">
${head({ label: "The evidence", h: "What a 2026 study of dentist recommendations found." })}
      <p>Dental.me, a dental directory, asked ChatGPT, Gemini and Claude one question, who are the best dentists, in each of the 50 largest US cities. <a class="inline-link" href="${STUDY}" rel="noopener">DrBicuspid reported the results</a> on 28 October 2026.</p>
${table(
  ["Finding", "Result"],
  [
    ["Different practices named as best, across all three assistants", "560"],
    ["Practices named by all three", "30"],
    ["Cities where the three had no consensus on the best practice", "28"],
    ["Recommended practices that changed when the same question was asked again, in the 10 largest cities", "38%"],
    ["A Baltimore practice Gemini included in its five highly rated picks", "3.1 stars on 24 Google reviews"],
    ["Baltimore practices in the directory's own data at 4.8 stars or higher with more than 100 reviews", "49"],
  ]
)}
      <p>Two cautions. The study comes from a dental directory, and it asked the broadest question possible. The article reports a repeat question only for the 10 largest cities. The Baltimore rows are the ones for a business owner to note: one of Gemini's five picks had 3.1 stars on 24 reviews, in a city where 49 practices have 4.8 stars or higher on more than 100 reviews. A strong rating on its own did not decide who was named.</p>
    </div>
  </section>

  <section>
    <div class="container narrow">
${head({ label: "What it means for you", h: "Variable is not the same as random." })}
${answer(Q_RANDOM, A_RANDOM)}
      <p>The work behind those parts is described in <a class="inline-link" href="/guides/geo-for-local-businesses/">GEO for local businesses</a>.</p>
${answer(
  "Is one AI answer good evidence either way?",
  "No. One answer is one sample. A screenshot showing your business named proves it can be named, not that it usually is, and a screenshot showing a competitor proves just as little. Anyone selling or judging AI visibility from a single answer is reporting a sample of one."
)}
${answer(Q_DIP, A_DIP)}
      <p><a class="inline-link" href="/guides/how-to-track-leads-from-chatgpt/">Tracking leads from ChatGPT</a> covers the measurement side.</p>
    </div>
  </section>

  <section>
    <div class="container narrow">
${head({ label: "Measuring through it", h: "How to get a number you can trust." })}
      <ol class="check-list">
        <li><strong>Write the questions the way customers ask them.</strong> Include the town, the service and the price questions, not only the business name. A business can be recognised by name and still be missing from every recommendation.</li>
        <li><strong>Ask each question more than once, on a schedule.</strong> The same set, the same way, every time. A change in the set is a change in the instrument, and it breaks the comparison with last month.</li>
        <li><strong>Report a share with its denominator.</strong> Named in 7 of 20 answers says what was measured. A percentage with no count behind it does not.</li>
        <li><strong>Keep each assistant separate.</strong> A combined score hides the assistant where you are missing.</li>
        <li><strong>Read the trend, not the day.</strong> A single run is a snapshot. Movement that holds across several runs is a finding.</li>
      </ol>
    </div>
  </section>

${relatedGuides("/guides/why-chatgpt-gives-different-answers/")}

${cta({
  h: "Find out whether assistants can read your site.",
  p: "The free audit checks whether AI retrieval can fetch and read your site, the part of being named that you control. A person emails it to you within 2 business days.",
  primary: { href: "/audit/", text: "Request my free audit →", ev: "guide_why_answers_change" },
  secondary: { href: "/guides/geo-for-local-businesses/", text: "GEO for local businesses", ev: "guide_why_answers_change_geo" },
})}`,
};
