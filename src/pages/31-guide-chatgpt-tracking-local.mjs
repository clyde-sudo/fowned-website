import { head, answer, cta, table, relatedGuides } from "../ui.mjs";
import { SITE } from "../layout.mjs";

/* Primary queries, all from Search Console (2026-08-12..11-09), all shown on
 * /guides/how-to-track-leads-from-chatgpt/ with the phrase absent from that
 * page: "chatgpt tracking" (500 impressions), "chatgpt search tracking" (252),
 * "tracking chatgpt" (12), "track chatgpt" (11), "chatgpt presence tracker"
 * (8), "tools that track chatgpt", "track my business in chatgpt".
 * That guide owns lead attribution and says presence is a separate
 * measurement; this page owns the presence side. Do not move lead queries
 * here. FAQ answers are shared constants so schema text matches visible text.
 * Funnel job: informational spoke -> /audit/, with /ai-visibility/ as the hub. */
const Q_WHAT = "What is ChatGPT tracking?";
const A_WHAT = "ChatGPT tracking is keeping a dated record of how ChatGPT treats your business. For a local business there are four things worth recording: whether its crawlers can fetch your site, whether your business is named when a customer asks for a recommendation, which sources it cites when it searches the web, and how many visitors arrive from it. Each one is read from a different place, and no single report shows all four.";
const Q_HOW = "How do I track my business in ChatGPT?";
const A_HOW = "Write down ten questions a customer would ask, such as the best provider of your service in your town. Ask them in ChatGPT on the same day each month, with the same wording, in a new chat. Record the date, whether your business was named, and which sources were shown. Report the result as a count out of the number asked, such as three of ten. One asking is an anecdote; the same ten questions over several months is a measurement.";
const Q_TOOLS = "What do tools that track ChatGPT actually do?";
const A_TOOLS = "A ChatGPT presence tracker asks a set of questions on a schedule and counts how often a business is named. That is the same method as the sheet above, automated. The differences that matter are how many questions it asks, how often, from what location, and whether it shows the count behind every percentage.";

export default {
  path: "/guides/chatgpt-tracking-for-local-businesses/",
  title: "ChatGPT tracking: how to track your business in ChatGPT | Fowned",
  description:
    "ChatGPT tracking for a local business: the four things you can track, where each one is read, how to build a presence tracker in a spreadsheet, and what tracking tools do.",
  schema: [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Resources", item: `${SITE.origin}/resources/` },
        { "@type": "ListItem", position: 2, name: "ChatGPT tracking", item: `${SITE.origin}/guides/chatgpt-tracking-for-local-businesses/` },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        { "@type": "Question", name: Q_WHAT, acceptedAnswer: { "@type": "Answer", text: A_WHAT } },
        { "@type": "Question", name: Q_HOW, acceptedAnswer: { "@type": "Answer", text: A_HOW } },
        { "@type": "Question", name: Q_TOOLS, acceptedAnswer: { "@type": "Answer", text: A_TOOLS } },
      ],
    },
  ],
  body: `  <section class="page-hero">
    <div class="container narrow">
      <span class="label">Guide</span>
      <h1>ChatGPT tracking: how to track your business in ChatGPT.</h1>
      <p class="hero-sub">ChatGPT gives a business no dashboard of its own. This page covers the four things you can still track, where each one is read, and how to tell a measurement from a screenshot.</p>
    </div>
  </section>

  <section>
    <div class="container narrow">
${head({ label: "Short answer", h: "Four records, each read from a different place." })}
${answer(Q_WHAT, A_WHAT)}
${table(
  ["What you track", "Where it is read", "What it proves"],
  [
    ["Crawler access", "Your server logs and robots.txt", "ChatGPT's crawlers were allowed in and did fetch a page"],
    ["Presence", "A fixed set of questions, asked on a schedule", "How often your business was named, out of the number asked"],
    ["Sources", "The links shown under an answer when ChatGPT searches the web", "Which pages the answer leaned on that day"],
    ["Visits", "Your analytics, by referrer", "A visitor clicked a link in ChatGPT and arrived with the referrer intact"],
  ]
)}
      <p>The first row is a pass or a fail. The other three are samples, and a sample is only as good as its size and its dates.</p>
    </div>
  </section>

  <section>
    <div class="container narrow">
${head({ label: "Presence", h: "Tracking whether ChatGPT names your business." })}
${answer(Q_HOW, A_HOW)}
${answer(
  "Why the same questions every time?",
  "Because ChatGPT writes each answer fresh, and a change of wording changes the list. If the questions move, you cannot tell whether the answer changed or the question did. <a class=\"inline-link\" href=\"/guides/why-chatgpt-gives-different-answers/\">Why ChatGPT gives different answers</a> covers how much the list can vary between two askings."
)}
${answer(
  "What a presence record cannot tell you",
  "It cannot tell you what another person in another place was shown, and it cannot tell you why you were or were not named. It tells you what came back for your questions on your dates. That is enough to see a trend across months, which is the only thing worth acting on."
)}
    </div>
  </section>

  <section>
    <div class="container narrow">
${head({ label: "Search and crawlers", h: "ChatGPT search tracking: sources and fetches." })}
${answer(
  "Tracking the sources ChatGPT search cites",
  "When ChatGPT searches the web it shows the pages it used. Record them next to each answer in your sheet. Over a few months the same directories, review sites and competitors tend to repeat, and that list is the most useful output of the whole exercise: it names the outside sources worth getting right. <a class=\"inline-link\" href=\"/guides/what-sources-chatgpt-uses-to-recommend-local-businesses/\">What sources ChatGPT uses</a> covers what is observable about them."
)}
${answer(
  "Tracking ChatGPT's crawlers on your site",
  "OpenAI documents three crawlers by name: OAI-SearchBot, which builds its search results; ChatGPT-User, which fetches a page when a person's question calls for it; and GPTBot, which collects training data. Your server logs show whether each one visited and whether it was served the page or refused. A site that refuses them cannot be read, whatever else you track."
)}
    </div>
  </section>

  <section>
    <div class="container narrow">
${head({ label: "Visits", h: "Tracking visitors who arrive from ChatGPT." })}
      <p>A visitor who clicks a link in ChatGPT may arrive with chatgpt.com as the referrer, and your analytics can count those visits. Many arrive with no referrer at all and are counted as direct, so the number you see is a floor, not a total. Which of those visitors became leads is a separate job with its own records, set out in <a class="inline-link" href="/guides/how-to-track-leads-from-chatgpt/">which leads found you from ChatGPT</a>.</p>
    </div>
  </section>

  <section>
    <div class="container narrow">
${head({ label: "Tools", h: "Tools that track ChatGPT, and what to ask of one." })}
${answer(Q_TOOLS, A_TOOLS)}
      <ul class="check-list">
        <li><strong>How many questions, and who wrote them?</strong> Ten questions your customers would ask beat a hundred a tool generated.</li>
        <li><strong>Where is the count?</strong> A percentage with no number of questions behind it cannot be checked.</li>
        <li><strong>Is it asking the app or a developer interface?</strong> The two can answer differently. A tracker should say which one it reads.</li>
        <li><strong>Who keeps the history?</strong> The record of what was asked and what came back should be yours to export.</li>
      </ul>
      <p>A spreadsheet is enough to start. A tool earns its price when the question set is large enough, or the schedule frequent enough, that a person would stop doing it by hand. We measure answer presence with <a class="inline-link" href="https://citability.dev/" rel="noopener">Citability</a>, and the way we report it is on <a class="inline-link" href="/ai-visibility/">the measurement page</a>.</p>
    </div>
  </section>

${relatedGuides("/guides/chatgpt-tracking-for-local-businesses/")}

${cta({
  h: "Start with the row that either passes or fails.",
  p: "The free audit checks whether AI crawlers can fetch your site at all. A person emails it to you within 2 business days.",
  primary: { href: "/audit/", text: "Request my free audit →", ev: "guide_chatgpt_tracking" },
})}`,
};
