import { head, answer, cta, table, relatedGuides } from "../ui.mjs";
import { SITE, bookHref } from "../layout.mjs";

/* Primary query (Search Console, 28 days to 2026-11-19): "who should own geo
 * in my organization? free" (5 impressions, position 7, shown on
 * /guides/geo-for-local-businesses/, which does not answer who owns the work).
 * This page owns the ownership question only. Whether a business needs GEO at
 * all stays with /guides/geo-for-local-businesses/, and the questions to ask an
 * agency stay with /guides/how-to-choose-an-ai-seo-agency-for-a-local-business/.
 * Funnel job: buyer-stage spoke -> /audit/, with a booked call as the second
 * action. FAQ answers are shared constants so schema text matches visible text. */
const BOOK_HREF = bookHref();

const Q_WHO = "Who should own GEO at a local business?";
const A_WHO = "The owner of the business, or the one manager the owner names, should own GEO. That person decides what the business wants to be known for, approves every fact stated about it, and reads the results. Staff or an agency can do the tasks, but nobody outside the business can own the facts about it.";
const Q_STAFF = "Can one employee run GEO?";
const A_STAFF = "Yes, for the parts that need an afternoon a month. One employee can keep the business name, address, phone number and hours identical across the listings, keep a dated sheet of the questions customers ask an assistant, and read the free audit. The technical checks, such as whether an AI crawler is blocked, usually need whoever controls the website.";
const Q_AGENCY = "Should I hire an agency or do GEO in house?";
const A_AGENCY = "Do the foundation in house when one person has the time and the site is easy to change. Hire when the fixes sit on the website platform, when nobody owns the site, or when you need a measurement kept on a schedule. Either way the decision, the facts and the history stay with you.";
const Q_KEEP = "What should I keep control of if I hire an agency?";
const A_KEEP = "Keep the logins for your website, domain and Google Business Profile in your own name. Keep the history of what was measured and when. Keep approval of every claim made about your business. An agency that holds any of these three has made itself hard to leave.";
const Q_TIME = "How much time does owning GEO take?";
const A_TIME = "The first pass is a few hours: run the free audit, fix what it names, and write down ten customer questions. After that the work is a short monthly check against the same ten questions. Time spent beyond that should buy a named fix with a date, not more reporting.";

export default {
  path: "/guides/who-should-own-geo-at-a-local-business/",
  title: "Who should own GEO at a local business? | Fowned",
  description:
    "Who should own GEO at a local business: the three jobs (decide, state the facts, measure), who should hold each one, what staff can do, and what to keep if you hire an agency.",
  schema: [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Resources", item: `${SITE.origin}/resources/` },
        { "@type": "ListItem", position: 2, name: "Who should own GEO at a local business", item: `${SITE.origin}/guides/who-should-own-geo-at-a-local-business/` },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        { "@type": "Question", name: Q_WHO, acceptedAnswer: { "@type": "Answer", text: A_WHO } },
        { "@type": "Question", name: Q_STAFF, acceptedAnswer: { "@type": "Answer", text: A_STAFF } },
        { "@type": "Question", name: Q_AGENCY, acceptedAnswer: { "@type": "Answer", text: A_AGENCY } },
        { "@type": "Question", name: Q_KEEP, acceptedAnswer: { "@type": "Answer", text: A_KEEP } },
        { "@type": "Question", name: Q_TIME, acceptedAnswer: { "@type": "Answer", text: A_TIME } },
      ],
    },
  ],
  body: `  <section class="page-hero">
    <div class="container narrow">
      <span class="label">Guide</span>
      <h1>Who should own GEO at a local business?</h1>
      <p class="hero-sub">GEO is the work of being named when a customer asks an assistant such as ChatGPT for a recommendation. Someone has to own it, and the answer is not always the person you hire.</p>
    </div>
  </section>

  <section>
    <div class="container narrow">
${head({ label: "Short answer", h: "Who should own GEO in my organization?" })}
${answer(Q_WHO, A_WHO)}
      <p>Ownership here means three separate jobs. They often get handed to one person, and that is where the confusion starts.</p>
${table(
  ["Job", "Who should hold it", "Why"],
  [
    ["Decide what the business wants to be known for", "The owner or the one manager they name", "It is a business choice about services, area and customers, and no outside party can make it for you"],
    ["State the facts about the business, and keep them identical", "One named employee, with the owner approving", "Name, address, phone, hours and services must match across your site and the listings an assistant reads. Only you know which version is true"],
    ["Run the technical checks and measure on a schedule", "Staff if they control the website, otherwise an agency", "Crawler access and page structure live on the website platform, and a measurement needs a fixed question set asked on dates"],
  ]
)}
      <p>If you cannot name the person for the first two rows, hiring for the third row buys a report that nobody is able to act on.</p>
    </div>
  </section>

  <section>
    <div class="container narrow">
${head({ label: "In house", h: "What can the owner or one employee do themselves?" })}
${answer(Q_STAFF, A_STAFF)}
      <ol class="check-list">
        <li><strong>Write down ten questions.</strong> Use the words a customer would type, with your town in them, and keep the wording fixed. <a class="inline-link" href="/guides/chatgpt-tracking-for-local-businesses/">ChatGPT tracking for local businesses</a> shows the sheet.</li>
        <li><strong>Make the facts match.</strong> Compare your site, your Google Business Profile and the main directories for your trade, and correct the ones that differ.</li>
        <li><strong>Test the front door.</strong> The check in the next section takes a few minutes if you can open a terminal, and the free audit checks your robots.txt for you if you cannot.</li>
        <li><strong>Ask new customers how they found you.</strong> Write the answer down with the date. It is often the only record that shows an assistant helped when no referrer arrives.</li>
      </ol>
    </div>
  </section>

  <section>
    <div class="container narrow">
${head({ label: "A dated check", h: "How do I check whether the technical part is open?" })}
      <p>On 2026-11-22 we requested one page of this site, <a class=\"inline-link\" href=\"/guides/local-seo-vs-geo-vs-aeo/\">the local SEO, GEO and AEO comparison</a>, three times, each time identifying as a different OpenAI crawler, and wrote down the result. OpenAI documents these names on its <a class="inline-link" href="https://developers.openai.com/api/docs/bots" rel="noopener">crawler overview page</a>: OAI-SearchBot builds the search results in ChatGPT, ChatGPT-User fetches a page when a person's question calls for it, and GPTBot collects content that may be used for training.</p>
${table(
  ["Crawler name sent", "What OpenAI says it is for", "Response from this site, 2026-11-22"],
  [
    ["OAI-SearchBot", "Search results in ChatGPT", "200, the page was served"],
    ["ChatGPT-User", "A fetch triggered by a person's question", "200, the page was served"],
    ["GPTBot", "Content that may be used for training", "200, the page was served"],
  ]
)}
      <p>You can run the same check on your own site with one line per crawler, such as <code>curl -sL -o /dev/null -w "%{http_code}\\n" -A "OAI-SearchBot" https://your-site.example/</code>, and read the number it prints. A 200 means the page was served. A 403 means something between the visitor and your site, often a security setting at your host, refused the crawler. That setting is the usual reason the technical row needs whoever controls the website, and it is the first thing worth knowing before you pay anyone.</p>
      <p>Also open <code>your-site.example/robots.txt</code> in a browser and look for a <code>Disallow</code> line under the crawler's name or under <code>User-agent: *</code>, because a request made with curl ignores that file and a real crawler obeys it. One check is a sample from one place on one day, sent from an ordinary machine and not from OpenAI's network. A security setting can treat the real crawler differently. The check shows the door was open to that request, and it does not show that ChatGPT will name you.</p>
    </div>
  </section>

  <section>
    <div class="container narrow">
${head({ label: "Hiring", h: "When does it make sense to hire an agency to own GEO?" })}
${answer(Q_AGENCY, A_AGENCY)}
      <p>The questions to put to any provider, including us, are in <a class="inline-link" href="/guides/how-to-choose-an-ai-seo-agency-for-a-local-business/">how to choose an AI SEO or GEO agency</a>. Before that call, settle the first two rows of the table above, so the agency knows who approves what.</p>
${answer(Q_KEEP, A_KEEP)}
    </div>
  </section>

  <section>
    <div class="container narrow">
${head({ label: "Time", h: "How much of my time does this take?" })}
${answer(Q_TIME, A_TIME)}
      <p>Whether your business needs GEO at all is a separate question with its own three questions, set out in <a class="inline-link" href="/guides/geo-for-local-businesses/">GEO for local businesses</a>. Settle that first, then settle who owns it.</p>
    </div>
  </section>

${relatedGuides("/guides/who-should-own-geo-at-a-local-business/")}

${cta({
  h: "Start with the part that either passes or fails.",
  p: "The free audit checks whether your robots.txt allows AI crawlers to retrieve your pages. A person emails it to you within 2 business days, and a call afterward is optional.",
  primary: { href: "/audit/", text: "Request my free audit →", ev: "guide_who_owns_geo" },
  secondary: { href: BOOK_HREF, text: "Book a call after the audit", ev: "guide_who_owns_geo_book", booking: true },
})}`,
};
