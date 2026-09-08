import { head, answer, cta, table, relatedGuides } from "../ui.mjs";
import { SITE } from "../layout.mjs";

/* Primary query: "what sources does chatgpt use to recommend local businesses".
 * Funnel job: informational spoke -> /audit/. Claims here are limited to what
 * is publicly documented or directly observable in a browser session. */
export default {
  path: "/guides/what-sources-chatgpt-uses-to-recommend-local-businesses/",
  title: "What sources ChatGPT uses to recommend local businesses | Fowned",
  description:
    "What is observable about where ChatGPT gets local business recommendations, what is only claimed, and what a local business can do about each source.",
  schema: [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Resources", item: `${SITE.origin}/resources/` },
        { "@type": "ListItem", position: 2, name: "What sources ChatGPT uses to recommend local businesses", item: `${SITE.origin}/guides/what-sources-chatgpt-uses-to-recommend-local-businesses/` },
      ],
    },
  ],
  body: `  <section class="page-hero">
    <div class="container narrow">
      <span class="label">Guide</span>
      <h1>What sources ChatGPT uses to recommend local businesses.</h1>
      <p class="hero-sub">Nobody outside OpenAI can see the full retrieval pipeline. Quite a lot is observable from the outside anyway, and the difference between the two is the whole point of this page.</p>
    </div>
  </section>

  <section>
    <div class="container narrow">
${head({ label: "Observable", h: "What you can see for yourself." })}
${answer(
  "It searches the live web when the question is local",
  "Ask ChatGPT for a plumber in a named town with search enabled and the reply shows a search step and a list of cited pages. The citations are visible in the interface. Open them and you will find what it read: a mix of the business's own site, directories, review platforms and local press. This is observable in any session and does not depend on anyone's claim about the model."
)}
${answer(
  "It reads the page text, not the page as you see it",
  "The retrieval client fetches HTML and reads the text in it. Content that appears only after a script runs in a browser, or only inside an image, is not in what it reads. You can check what it sees by viewing your own page source, or by running the free audit, which reports whether the key facts are present in the served text."
)}
${answer(
  "It is blocked when you block it",
  "OpenAI publishes the names of its crawlers and the rule files they honor. A firewall rule or a robots.txt line that denies them denies retrieval. This is one of the checks in the audit because it is the single most common reason a business with a good website is absent from answers: the answer engine was never allowed in."
)}
${answer(
  "It prefers agreement across sources",
  "This one is inferred, not documented, so it is labeled as such. When the same business name, address and service list appear on the business site, on Google, on Yelp and in a local news item, the business is named more reliably than when those sources disagree. We observe the pattern in sampled answers; we do not have a published mechanism for it."
)}
    </div>
  </section>

  <section>
    <div class="container narrow">
${head({ label: "Source classes", h: "Where the citations tend to point." })}
${table(
  ["Source class", "What you control", "What to do"],
  [
    ["Your own website", "Everything", "Serve the facts as text; keep name, address, phone, hours and service area on a page a crawler can fetch"],
    ["Google Business Profile", "Most of it", "Complete every field; keep categories and hours current; it is often the first corroborating source"],
    ["Review platforms", "Responses, not reviews", "Claim the listing; make the name and address match your site exactly"],
    ["Directories and aggregators", "Your listing", "Fix contradictions before adding new listings; one wrong phone number outweighs ten new directories"],
    ["Local press and community sites", "Little", "Earn a mention by being mentionable; do not buy one"],
    ["Wikipedia and knowledge bases", "Almost none", "Ignore unless you are genuinely notable; a deleted entry is worse than none"],
  ]
)}
    </div>
  </section>

  <section>
    <div class="container narrow">
${head({ label: "Not observable", h: "What is sold as known but is not." })}
      <ul class="check-list">
        <li><strong>A ranking.</strong> There is no position to hold. Two people asking the same question in the same hour can get different businesses, and the sample size in most agency reports is one.</li>
        <li><strong>A submission form.</strong> There is no list to be added to. Anyone offering to submit your business to ChatGPT is describing a directory listing with new packaging.</li>
        <li><strong>A guaranteed recommendation.</strong> The assistant selects from what it retrieved. You can make yourself retrievable and consistent. You cannot make it choose you.</li>
        <li><strong>A causal lift number.</strong> Without a sampled baseline before a change and the same sample after, any percentage improvement is a story. Measurement of answer presence is what <a class="inline-link" href="https://citability.dev/" rel="noopener">Citability</a> does; this site does the repair work it points to.</li>
      </ul>
    </div>
  </section>

${relatedGuides("/guides/what-sources-chatgpt-uses-to-recommend-local-businesses/")}

${cta({
  h: "See which of these sources can reach you today.",
  p: "The free audit checks whether AI retrieval crawlers are permitted, whether your facts are in the served text and whether your identity is machine-readable.",
  primary: { href: "/audit/", text: "Run my free audit →", ev: "guide_chatgpt_sources" },
  secondary: { href: "/answers/how-to-get-chatgpt-to-recommend-my-business/", text: "The two levers that exist", ev: "guide_chatgpt_sources_answer" },
})}`,
};
