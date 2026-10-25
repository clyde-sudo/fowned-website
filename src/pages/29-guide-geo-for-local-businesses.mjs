import { head, answer, cta, table, relatedGuides } from "../ui.mjs";
import { SITE } from "../layout.mjs";

/* Primary query: "geo for local businesses" (and "does my business need geo",
 * "aeo for local business", "local aeo"). Search Console showed this family
 * landing on the vs-guide at position 77 to 90 for 28 days: the searcher wants
 * a qualification answer, not a three-way comparison. This page owns the
 * decision; /guides/local-seo-vs-geo-vs-aeo/ keeps the comparison.
 * Funnel job: informational spoke -> /audit/. */
export default {
  path: "/guides/geo-for-local-businesses/",
  title: "GEO for local businesses: does yours need it? | Fowned",
  description:
    "Whether a local business needs generative engine optimization, decided by three questions you can answer today, what the work is, and how to tell if it worked.",
  schema: [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Resources", item: `${SITE.origin}/resources/` },
        { "@type": "ListItem", position: 2, name: "GEO for local businesses", item: `${SITE.origin}/guides/geo-for-local-businesses/` },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "Does a local business need GEO?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "A local business needs generative engine optimization when customers already ask an assistant such as ChatGPT or Perplexity for its category, when the assistant can fetch its pages, and when outside sources agree about who it is. If the first is true and either of the other two is false, the business is losing recommendations it could have had. If customers do not ask an assistant for the category yet, the same foundation work still pays off in local search and the GEO label adds nothing.",
          },
        },
        {
          "@type": "Question",
          name: "What is GEO for a local business, in practice?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Making the business fetchable and legible to the retrieval systems behind AI assistants, keeping name, address, phone and services consistent across the sources those assistants read, and measuring answer presence on a schedule against a stated denominator. It is foundation work plus measurement, not a separate content campaign.",
          },
        },
        {
          "@type": "Question",
          name: "How do you know GEO worked?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Only by sampling the same set of customer questions on a schedule and reporting how often the business is named, with the number of questions asked stated alongside the number of times it appeared. One screenshot of one answer on one day proves nothing either way.",
          },
        },
      ],
    },
  ],
  body: `  <section class="page-hero">
    <div class="container narrow">
      <span class="label">Guide</span>
      <h1>GEO for local businesses: does yours need it?</h1>
      <p class="hero-sub">Three questions decide it, and you can answer all three today without buying anything. The honest version of the work is smaller than the pitch and easier to check.</p>
    </div>
  </section>

  <section>
    <div class="container narrow">
${head({ label: "Short answer", h: "Need is a function of three things, not of the acronym." })}
${answer(
  "Does a local business need GEO?",
  "It does when three things are true at once: customers already ask an assistant such as ChatGPT or Perplexity for your category, the assistant can fetch your pages, and the sources outside your site agree about who you are. If the first is true and either of the other two is false, you are losing recommendations you could have had. If customers do not ask an assistant for your category yet, the foundation work still pays off in ordinary local search, and the GEO label adds nothing to it."
)}
      <p>Generative engine optimization is the practice of being the business a generated answer names when someone asks an assistant for a recommendation. The <a class="inline-link" href="/guides/local-seo-vs-geo-vs-aeo/">comparison with local SEO and AEO</a> covers what each one optimizes. This page covers the narrower question a business owner actually has: is this for me, and if so, what is the work.</p>
    </div>
  </section>

  <section>
    <div class="container narrow">
${head({ label: "The three questions", h: "Answer these before you fund anything." })}
${answer(
  "1. Do customers ask an assistant for your category?",
  "Ask five recent customers how they found you, and ask the assistant yourself: type the question a customer would type, with your town in it, and read what comes back. Categories where people compare options before calling, such as dentists, contractors, lawyers, clinics, and restaurants for an occasion, show up in assistant answers today. Categories people find by walking past, or by opening a map and tapping the nearest one, mostly do not. If your category never appears in the answer at all, that is your result, and you should record it before doing anything else."
)}
${answer(
  "2. Can the assistant fetch your pages?",
  "A retrieval client reads the HTML your server sends. It does not run your JavaScript app, it does not read text inside images, and it obeys robots.txt. A site whose menu, prices, service area or phone number live only in images, a site built as an app shell that renders on the client, and a site whose robots.txt blocks AI retrieval crawlers are all empty to it. This is a pass or fail check, and the free audit on this site includes it."
)}
${answer(
  "3. Do outside sources agree about who you are?",
  "Assistants lean on sources they already trust: directories, review platforms, the map listing, and local press. If your name, address, phone number, hours or category differ across them, the assistant either picks one version or leaves you out. Consistency across those sources is work you can do yourself in an afternoon, and it is the part of GEO that most resembles what local SEO has always required."
)}
    </div>
  </section>

  <section>
    <div class="container narrow">
${head({ label: "Reading the answers", h: "What each combination means." })}
${table(
  ["Customers ask an assistant", "Pages fetchable", "Sources agree", "What it means"],
  [
    ["Yes", "Yes", "Yes", "You are eligible to be named. Measure answer presence on a schedule; fix nothing until the baseline exists."],
    ["Yes", "No", "Any", "You are invisible to the assistant regardless of everything else. Fix retrieval first; it is the cheapest fix and the only one that is binary."],
    ["Yes", "Yes", "No", "You may be named inconsistently or replaced by a competitor with cleaner data. Reconcile the directories, then measure."],
    ["No", "Any", "Any", "Do the foundation work for local search, which needs it anyway, and re-ask question one in six months. Do not buy GEO as a service."],
  ]
)}
    </div>
  </section>

  <section>
    <div class="container narrow">
${head({ label: "The work", h: "What GEO for a local business actually consists of." })}
${answer(
  "What is GEO for a local business, in practice?",
  "Three layers, in this order. Retrieval: robots.txt permits AI crawlers, the page is readable without JavaScript, the sitemap is current, and the canonical URL is declared. Legibility: the page states who you are and what you sell in plain text, business name, address and phone are machine-readable, and Organization and Service schema describe the entity. Corroboration: the sources outside your site say the same thing your site says. Everything above that layer, such as new content shaped for answer engines, is optional until those three are sound."
)}
      <p>Notice what is not on the list. There is no separate GEO content campaign, no AI-specific page type, and no tool that submits you to ChatGPT. Local businesses are sold all three. The <a class="inline-link" href="/guides/what-sources-chatgpt-uses-to-recommend-local-businesses/">guide to what sources ChatGPT uses</a> separates what is observable about assistant retrieval from what is only claimed, and the <a class="inline-link" href="/guides/how-to-choose-an-ai-seo-agency-for-a-local-business/">agency guide</a> lists the questions that end a sales call early.</p>
    </div>
  </section>

  <section>
    <div class="container narrow">
${head({ label: "Proof", h: "How you know it worked." })}
${answer(
  "How do you know GEO worked?",
  "Only by sampling. Take the set of questions a customer would ask, ask them on a schedule, and record how often the business is named. Report that number next to the number of questions asked. One screenshot of one answer on one day proves nothing in either direction, because assistants vary their answers between sessions. A provider who cannot show you the denominator is not measuring; they are checking."
)}
      <p>The audit on this site runs the retrieval and legibility checks and reports each as pass, fail or could not measure. It does not measure answer presence, which is a separate instrument. <a class="inline-link" href="/guides/ai-visibility-audit-for-local-businesses/">What the audit checks</a> lists every question and why it exists, and <a class="inline-link" href="/guides/how-to-track-leads-from-chatgpt/">tracking leads from ChatGPT</a> covers what the referrer can and cannot prove once customers do arrive.</p>
    </div>
  </section>

${relatedGuides("/guides/geo-for-local-businesses/")}

${cta({
  h: "Answer question two with the free audit.",
  p: "The free audit runs the retrieval and legibility checks on your site and reports each one as pass, fail or could not measure. A person emails it to you within 2 business days.",
  primary: { href: "/audit/", text: "Request my free audit →", ev: "guide_geo_for_local_businesses" },
  secondary: { href: "/guides/local-seo-vs-geo-vs-aeo/", text: "Local SEO vs GEO vs AEO", ev: "guide_geo_for_local_businesses_vs" },
})}`,
};
