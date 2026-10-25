import { head, answer, cta, table, relatedGuides } from "../ui.mjs";
import { SITE } from "../layout.mjs";

/* Primary query: "local seo vs geo vs aeo" (and "geo vs aeo for local business").
 * Funnel job: informational spoke -> /audit/. Citability owns the measurement
 * definitions; this page owns the three-way comparison. The qualification
 * family ("geo for local businesses", "does my business need geo", "aeo for
 * local business") is owned by /guides/geo-for-local-businesses/. */
export default {
  path: "/guides/local-seo-vs-geo-vs-aeo/",
  title: "Local SEO vs GEO vs AEO: which to fund first | Fowned",
  description:
    "Local SEO, GEO and AEO compared: what each one optimizes, what it costs, how it is measured, and which one to fund first.",
  schema: [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Resources", item: `${SITE.origin}/resources/` },
        { "@type": "ListItem", position: 2, name: "Local SEO vs GEO vs AEO", item: `${SITE.origin}/guides/local-seo-vs-geo-vs-aeo/` },
      ],
    },
  ],
  body: `  <section class="page-hero">
    <div class="container narrow">
      <span class="label">Guide</span>
      <h1>Local SEO vs GEO vs AEO: which to fund first.</h1>
      <p class="hero-sub">Three acronyms, three different units of output, one plain comparison. The order to fund them in is at the end, and it is not the order they are sold in.</p>
    </div>
  </section>

  <section>
    <div class="container narrow">
${head({ label: "Definitions", h: "What each one is actually optimizing for." })}
${answer(
  "Local SEO",
  "Local search optimization competes for a position in a list: the map pack and the organic results Google shows for a query with local intent. The unit of output is a ranking position. It is measured with rank tracking and Google Business Profile insights, both of which have existed for years and both of which you can read yourself."
)}
${answer(
  "AEO, answer engine optimization",
  "Answer engine optimization competes to be the text an engine lifts directly into an answer box, a featured snippet or a voice reply. The unit of output is a quoted passage. The work is mostly content shape: a question asked in the heading, a self-contained answer beneath it, and facts stated in plain text rather than inside an image."
)}
${answer(
  "GEO, generative engine optimization",
  "Generative engine optimization competes to be the business a generated answer names when a customer asks an assistant such as ChatGPT or Perplexity for a recommendation. The unit of output is being named, with or without a link. The work overlaps AEO on content shape and adds two things: the assistant must be able to fetch your pages at all, and sources outside your own site must agree about who you are. Whether your business needs it at all is a separate question, answered in <a class=\"inline-link\" href=\"/guides/geo-for-local-businesses/\">GEO for local businesses</a>."
)}
    </div>
  </section>

  <section>
    <div class="container narrow">
${head({ label: "Comparison", h: "Side by side, without the sales gloss." })}
${table(
  ["", "Local SEO", "AEO", "GEO"],
  [
    ["What it optimizes", "A position in a list", "A passage lifted into an answer box", "Being named in a generated answer"],
    ["Where the customer sees it", "Google Maps and organic results", "Featured snippets, voice replies, AI overviews", "ChatGPT, Perplexity, Gemini, Copilot"],
    ["What you control", "Profile, reviews, citations, pages", "Content shape on your own pages", "Retrieval access, content shape, off-site consistency"],
    ["How it is measured", "Rank position, profile insights", "Snippet ownership per query", "Sampled answer presence with a stated denominator"],
    ["Maturity of the measurement", "Mature, self-serve", "Mature, self-serve", "Young; sampling and history required"],
    ["Typical first fix", "Profile completeness and categories", "Rewrite headings as questions", "Unblock crawlers, add machine-readable identity"],
  ]
)}
    </div>
  </section>

  <section>
    <div class="container narrow">
${head({ label: "Overlap", h: "Why one fix often serves all three." })}
      <p>A page a crawler cannot fetch is invisible to all three. A business whose name, address and phone differ across directories is untrustworthy to all three. A fact stated only inside an image is unreadable to all three. Most of what a local business needs to do first sits in that shared foundation, which is why the cheapest useful action is usually a diagnosis rather than a new campaign.</p>
      <p>Where they diverge is the top layer. Local SEO rewards review volume and proximity. AEO rewards answer shape. GEO rewards corroboration from sources the assistant already trusts. Funding the top layer of one before the shared foundation is sound produces the common outcome: a report that says the work was done, and a customer who still cannot find you.</p>
    </div>
  </section>

  <section>
    <div class="container narrow">
${head({ label: "Order", h: "Which one to fund first." })}
      <ol class="check-list">
        <li><strong>Fix retrieval and consistency first.</strong> It is the only layer where a check either passes or fails, and every one of the three benefits.</li>
        <li><strong>Then local SEO, if the map pack is where your customers already look.</strong> Its measurement is mature enough that you will know within weeks whether the spend worked.</li>
        <li><strong>Then AEO, because it is cheap.</strong> Reshaping existing pages into question and answer form costs editing time, not new pages.</li>
        <li><strong>GEO last, and only with a measurement in place.</strong> Without a sampled baseline and a schedule, no one can tell you whether the assistant started naming you or whether you got lucky on the day someone checked.</li>
      </ol>
      <p>The honest version of GEO for a local business is not a separate service. It is the shared foundation, measured on a schedule, with the answer-presence number reported against its denominator. That is what the audit on this site checks, and what <a class="inline-link" href="/services/">the services</a> repair.</p>
    </div>
  </section>

${relatedGuides("/guides/local-seo-vs-geo-vs-aeo/")}

${cta({
  h: "Find out which layer is broken on your site.",
  p: "The free audit runs the retrieval and consistency checks and reports each one as pass, fail or could not measure. A person emails it to you within 2 business days.",
  primary: { href: "/audit/", text: "Request my free audit →", ev: "guide_local_seo_vs_geo_vs_aeo" },
  secondary: { href: "/geo/", text: "What GEO is, in full", ev: "guide_local_seo_vs_geo_vs_aeo_geo" },
})}`,
};
