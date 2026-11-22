import { head, answer, cta, table, relatedGuides } from "../ui.mjs";
import { SITE, bookHref } from "../layout.mjs";

/* Queries (Search Console, 28 days to 2026-11-19): "local aeo" (78 impressions,
 * position 68.9), "aeo for local businesses" (65, position 79.8), "aeo for local
 * business" (6), "seo vs aeo for local businesses" (3, position 24.7). All were
 * shown on /guides/local-seo-vs-geo-vs-aeo/, which compares the three terms and
 * does not walk through the work. This page is the how-to. It does not repeat the
 * comparison table. Funnel job: how-to spoke -> /audit/.
 * FAQ answers are shared constants so schema text matches visible text. */
const BOOK_HREF = bookHref();

const Q_WHAT = "What is AEO for a local business?";
const A_WHAT = "Answer engine optimization is the work of writing your pages so a search feature or an AI assistant can lift a clear answer from them and name your business in it. For a local business that means a question as a heading, a short direct answer beneath it, and plain-text facts about your services, area and contact details.";
const Q_SCHEMA = "Do I need special schema or an AI text file for AEO?";
const A_SCHEMA = "Google says there is no special schema.org markup, no new machine-readable file and no AI text file required to appear in its AI features. The page must be indexed and eligible to show a snippet, and any structured data you add must match the visible text. Add markup only where the page really shows the same question and answer.";
const Q_GUARANTEE = "Can I make Google or ChatGPT name my business?";
const A_GUARANTEE = "No. Google states that you cannot mark a page as a featured snippet, because its systems decide, and that indexing and serving are not guaranteed. Anyone who promises a placement is promising something outside their control. You can make your pages easy to fetch, easy to read and consistent with your other listings.";
const Q_TIME = "How long does AEO take to show a result?";
const A_TIME = "For search results, the change takes effect only after the crawler that builds the index returns. OpenAI says a robots.txt update can take about 24 hours to reach its search systems, and Google says a recrawl can take anywhere from a few days to a few weeks. Write down a baseline of ten questions before you edit, then ask them again after four weeks.";
const Q_SEO = "Is AEO different from local SEO?";
const A_SEO = "Local SEO competes for a position in a list, and AEO competes to be the text that answers the question. They share a foundation: pages a crawler can fetch, facts that match across listings, and content written for people. The full side-by-side is in our comparison guide, and this page covers only the AEO steps.";

export default {
  path: "/guides/aeo-for-local-businesses/",
  title: "AEO for local businesses: how to get named in AI answers | Fowned",
  description:
    "A plain how-to for local AEO: pick the questions, write a short answer under each, state your facts in text, keep listings consistent, check access, and re-ask the same questions on a schedule.",
  schema: [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Resources", item: `${SITE.origin}/resources/` },
        { "@type": "ListItem", position: 2, name: "AEO for local businesses", item: `${SITE.origin}/guides/aeo-for-local-businesses/` },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        { "@type": "Question", name: Q_WHAT, acceptedAnswer: { "@type": "Answer", text: A_WHAT } },
        { "@type": "Question", name: Q_SCHEMA, acceptedAnswer: { "@type": "Answer", text: A_SCHEMA } },
        { "@type": "Question", name: Q_GUARANTEE, acceptedAnswer: { "@type": "Answer", text: A_GUARANTEE } },
        { "@type": "Question", name: Q_TIME, acceptedAnswer: { "@type": "Answer", text: A_TIME } },
        { "@type": "Question", name: Q_SEO, acceptedAnswer: { "@type": "Answer", text: A_SEO } },
      ],
    },
  ],
  body: `  <section class="page-hero">
    <div class="container narrow">
      <span class="label">Guide</span>
      <h1>AEO for local businesses: how to get named in AI answers.</h1>
      <p class="hero-sub">Six steps, in the order to do them. Most of it is work you can do yourself, and each step ends with something you can check.</p>
    </div>
  </section>

  <section>
    <div class="container narrow">
${head({ label: "Short answer", h: "What is local AEO?" })}
${answer(Q_WHAT, A_WHAT)}
      <p>Nobody controls whether an assistant names you. The steps below raise the chance by removing the reasons a page cannot be used, and each step can be checked.</p>
    </div>
  </section>

  <section>
    <div class="container narrow">
${head({ label: "The steps", h: "How do I do AEO for a local business?" })}
${table(
  ["Step", "What to do", "How you check it"],
  [
    ["1. Pick ten questions", "Write the questions customers ask before they call you, in their words, with your town in them. Use your phone log, your reviews and Search Console", "The list exists and the wording is fixed"],
    ["2. Answer first", "Under each question, put a direct answer of 40 to 60 words, then the detail", "Read the answer alone. It should make sense without the page around it"],
    ["3. State facts in text", "Put services, service area, prices you are willing to publish, hours and phone in plain text, not inside an image or a PDF", "View the page source and search for the first sentence of an answer. If it is not there, a crawler that does not run scripts cannot read it"],
    ["4. Make the listings match", "Compare your site with your Google Business Profile and main directories for name, address, phone and hours", "Every field is identical in every place"],
    ["5. Open the door", "Confirm robots.txt and any security setting at your host allow the crawlers you want", "Open your robots.txt and read it, as the paragraph in the dated check below describes"],
    ["6. Re-ask on a schedule", "Ask the same ten questions on the same day each month and write down who was named", "A dated sheet with the count of questions asked"],
  ]
)}
    </div>
  </section>

  <section>
    <div class="container narrow">
${head({ label: "Steps 1 and 2", h: "What should an answer under a question look like?" })}
      <p>Write the heading as the question itself. Directly under it, answer in two or three sentences that name the business, the service and the place. A reader, a search feature and an assistant can all lift that paragraph without the rest of the page. Most sections of this guide follow the same pattern, and the <a class="inline-link" href="/guides/local-seo-vs-geo-vs-aeo/">comparison guide</a> shows it on definitions.</p>
      <p>Google describes the quoted result as a featured snippet and says in its <a class="inline-link" href="https://developers.google.com/search/docs/appearance/featured-snippets" rel="noopener">featured snippets documentation</a> that you cannot mark a page as one. Its systems decide whether a page would make a good snippet. That is why the work is the quality and shape of the answer, and not a tag.</p>
    </div>
  </section>

  <section>
    <div class="container narrow">
${head({ label: "Steps 3 and 4", h: "Which facts need to be in the text, and where else must they match?" })}
      <p>Google's <a class="inline-link" href="https://developers.google.com/search/docs/appearance/ai-features" rel="noopener">guide to AI features and your website</a> lists the same basics for AI Overviews and AI Mode: allow crawling in robots.txt and by any CDN or hosting layer, make important content available in text, link your pages to each other, keep structured data matching the visible text, and check that Business Profile information is up to date. It adds that there are no extra requirements and no special optimization needed beyond those fundamentals.</p>
${answer(Q_SCHEMA, A_SCHEMA)}
    </div>
  </section>

  <section>
    <div class="container narrow">
${head({ label: "A dated check", h: "How can I check that my answers can be read?" })}
      <p>On 2026-11-22 we requested our own comparison guide with a plain HTTP client, which does not run JavaScript. The page returned 200, and the raw HTML already contained its three definition headings (local SEO, AEO and GEO), each with its answer paragraph beneath. That is the property this step tests: the answer exists in the text the server sends, before any script runs.</p>
      <p>You can repeat it on your own site. Open a page, choose View Source, and search for the first sentence of an answer. If the sentence is there, a crawler that does not run scripts can read it. If it is missing, the page builds its text in the browser, and that is the first thing to fix.</p>
      <p>Then check access. OpenAI documents on its <a class="inline-link" href="https://developers.openai.com/api/docs/bots" rel="noopener">crawler overview page</a> that OAI-SearchBot surfaces sites in ChatGPT search results, that a site opted out of it is not shown in those answers (though it can still appear as a navigational link), and that GPTBot is a separate setting. A site can allow one and block the other. To check yours, open <code>your-site.example/robots.txt</code> in a browser and look for a <code>Disallow</code> line under the crawler's name or under <code>User-agent: *</code>. One check is a sample from one place on one day, and it does not show that any assistant will name you.</p>
    </div>
  </section>

  <section>
    <div class="container narrow">
${head({ label: "Step 6", h: "How long does it take, and what counts as a result?" })}
${answer(Q_TIME, A_TIME)}
      <p>The recrawl range comes from Google's <a class="inline-link" href="https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl" rel="noopener">recrawl guidance</a>.</p>
      <p>A result is a count with its denominator, such as named in 3 of 10 questions, next to the date. One screenshot of one answer proves nothing, because answers vary between sessions. <a class="inline-link" href="/guides/chatgpt-tracking-for-local-businesses/">ChatGPT tracking for local businesses</a> explains how to keep the sheet.</p>
${answer(Q_GUARANTEE, A_GUARANTEE)}
${answer(Q_SEO, A_SEO)}
    </div>
  </section>

${relatedGuides("/guides/aeo-for-local-businesses/")}

${cta({
  h: "Let the audit run steps 3 and 5 for you.",
  p: "The free audit checks whether your pages are readable as delivered text and whether your robots.txt allows AI crawlers. A person emails it to you within 2 business days.",
  primary: { href: "/audit/", text: "Request my free audit →", ev: "guide_aeo_local" },
  secondary: { href: BOOK_HREF, text: "Book a call after the audit", ev: "guide_aeo_local_book", booking: true },
})}`,
};
