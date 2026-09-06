import { head, answer, cta, table } from "../ui.mjs";
import { SITE, bookHref } from "../layout.mjs";

/* Primary query: "how to choose an ai seo agency" / "geo agency for local
 * business". Funnel job: commercial spoke -> /services/ and /audit/. This is
 * the one guide where booking is a legitimate secondary action. */
const BOOK_HREF = bookHref();

export default {
  path: "/guides/how-to-choose-an-ai-seo-agency-for-a-local-business/",
  title: "How to choose an AI SEO or GEO agency for a local business | Fowned",
  description:
    "Nine questions to ask any AI SEO or GEO agency before a local business signs, the answers that should end the call, and how to read a proposal.",
  schema: [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Resources", item: `${SITE.origin}/resources/` },
        { "@type": "ListItem", position: 2, name: "How to choose an AI SEO or GEO agency for a local business", item: `${SITE.origin}/guides/how-to-choose-an-ai-seo-agency-for-a-local-business/` },
      ],
    },
  ],
  body: `  <section class="page-hero">
    <div class="container narrow">
      <span class="label">Guide</span>
      <h1>How to choose an AI SEO or GEO agency for a local business.</h1>
      <p class="hero-sub">We are one of the agencies you might be choosing between, so read this as a checklist to hold us to as much as anyone else. The questions are the same either way.</p>
    </div>
  </section>

  <section>
    <div class="container narrow">
${head({ label: "Nine questions", h: "Ask these before any proposal is discussed." })}
${answer(
  "1. What did you measure on my site before writing this proposal?",
  "The answer should name specific checks with specific results. If the proposal arrived before anyone looked at your site, it is a template, and the price on it was set before your problem was known."
)}
${answer(
  "2. Which of my problems is a fetch problem, a content problem, or a corroboration problem?",
  "These are the three separate reasons a business is absent from AI answers, and they have three separate fixes. An agency that cannot sort your findings into those buckets will apply the same fix to all of them."
)}
${answer(
  "3. How will you measure whether an assistant names me, and how often?",
  "The only honest answer is a sampled measurement: a fixed set of questions asked on a schedule, with the number of questions stated every time. One screenshot of one good answer is not a measurement, and a percentage without a denominator is a guess with a decimal point."
)}
${answer(
  "4. Can you show the denominator on your last three client reports?",
  "Not the clients, just the number of questions sampled. If the reports show a percentage and no sample size, the percentage was chosen for its shape."
)}
${answer(
  "5. What will you refuse to claim?",
  "A good answer includes: that they can make an assistant recommend you, that there is a ranking to hold, that a lead came from an AI tool when no referrer was recorded. An agency with no list of refusals has no list of limits, and the limits are where your money goes missing."
)}
${answer(
  "6. What is the first change you would make, and how would we know if it worked?",
  "A named rule, a named page, a date, and the measurement that runs afterward. A first change of we will optimize your content for AI is not a change; it is a category."
)}
${answer(
  "7. Do you build city pages or service pages at scale?",
  "For a local business the correct answer is usually no, or one at a time with evidence. Mass-generated location pages are cheap to produce, easy to bill, and the fastest way to make every page on your site look like every other page."
)}
${answer(
  "8. Who owns the measurement if we part ways?",
  "You should. The history of what was measured on your site is yours, and an agency that keeps it hostage is selling you a dependency rather than a result."
)}
${answer(
  "9. What does the first month cost if the audit finds nothing to fix?",
  "There is a correct answer here and it is a small number. Some sites are already retrievable, consistent and machine-readable. An agency whose price does not change when the diagnosis changes is not selling a diagnosis."
)}
    </div>
  </section>

  <section>
    <div class="container narrow">
${head({ label: "Reading a proposal", h: "Phrases that mean less than they sound." })}
${table(
  ["Phrase in the proposal", "What it usually means", "What to ask instead"],
  [
    ["AI visibility score", "A weighted average with the weights undisclosed", "Which checks, which verdicts, and where is the could-not-measure column?"],
    ["Get listed in ChatGPT", "A directory submission", "Which source is being updated, and can I do it myself in an afternoon?"],
    ["Guaranteed AI rankings", "Nothing, since there is no ranking", "What is the sampled answer presence today, and what is the sample?"],
    ["Proprietary GEO framework", "A checklist", "May I see the checklist?"],
    ["AI traffic increased by a percentage", "Referrers, if you are lucky; a guess, if you are not", "How many visits carried an observed AI referrer, and how many arrived with no referrer at all?"],
  ]
)}
    </div>
  </section>

  <section>
    <div class="container narrow">
${head({ label: "Our answers", h: "How we answer the nine, so you can compare." })}
      <p>Every engagement starts with the <a class="inline-link" href="/audit/">free audit</a>, and the proposal is written from its results. Findings are sorted into fetch, content and corroboration. Answer presence is measured with <a class="inline-link" href="https://citability.dev/" rel="noopener">Citability</a> on a schedule with the denominator on every report, and the measurement history belongs to you. We do not build location pages at scale. The list of what we refuse to claim is on <a class="inline-link" href="/ai-visibility/">the measurement page</a>, and the three service levels are on <a class="inline-link" href="/services/">the services page</a>. If the audit finds nothing to fix, we say so and the first month costs nothing.</p>
    </div>
  </section>

${cta({
  h: "Start with the diagnosis, whoever you hire.",
  p: "The free audit gives you the answer to question one before you ask it of anyone.",
  primary: { href: "/audit/", text: "Run my free audit →", ev: "guide_choose_agency" },
  secondary: { href: BOOK_HREF, text: "Book a call after the audit", ev: "guide_choose_agency_book", booking: true },
})}`,
};
