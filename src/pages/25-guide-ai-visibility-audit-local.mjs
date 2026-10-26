import { head, answer, cta, table, relatedGuides } from "../ui.mjs";
import { SITE } from "../layout.mjs";

/* Primary query: "ai visibility audit for local business" / "what does an ai
 * visibility audit check". Funnel job: pre-audit explainer -> /audit/. The
 * twelve checks named here are the twelve in js/audit.js; keep them in sync. */
export default {
  path: "/guides/ai-visibility-audit-for-local-businesses/",
  title: "Local business AI visibility audit: what we check | Fowned",
  description:
    "Every check in the free AI visibility audit for a local business, the reason each one exists, and what pass, fail and could not measure mean.",
  schema: [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Resources", item: `${SITE.origin}/resources/` },
        { "@type": "ListItem", position: 2, name: "AI visibility audit for local businesses", item: `${SITE.origin}/guides/ai-visibility-audit-for-local-businesses/` },
      ],
    },
  ],
  body: `  <section class="page-hero">
    <div class="container narrow">
      <span class="label">Guide</span>
      <h1>AI visibility audit for local businesses: what we check and why.</h1>
      <p class="hero-sub">Twelve checks, each with a reason. Nothing on this list is a score, a grade or a promise. Each one is a question about your site that has a yes, a no, or a could not tell.</p>
    </div>
  </section>

  <section>
    <div class="container narrow">
${head({ label: "Three verdicts", h: "What the results mean before you read them." })}
${answer(
  "Pass",
  "The check ran against your live site and the condition held. A pass is evidence about that page on that day. It is not evidence that an assistant names you; that is a separate measurement with a separate instrument."
)}
${answer(
  "Fail",
  "The check ran and the condition did not hold. Every fail on this list has a specific repair, and the repair is named in the result. A fail is the most useful outcome of the audit because it is the one that changes what you do next."
)}
${answer(
  "Could not measure",
  "The check could not reach a verdict, usually because the page could not be fetched or timed out. This is reported as itself and never folded into a fail, because a broken instrument reporting zero is worse than one reporting unmeasured. If most checks land here, the first fix is reachability."
)}
    </div>
  </section>

  <section>
    <div class="container narrow">
${head({ label: "The checks", h: "Twelve questions, grouped by what they protect." })}
${table(
  ["Check", "Why it exists"],
  [
    ["Page states who you are and what you sell in plain text", "An assistant reads text. If the answer to what do you do lives in a hero image or a tagline graphic, it reads nothing."],
    ["Business name, address and phone are machine-readable", "Local answers hinge on where you are. A phone number in an image or a map embed is invisible."],
    ["Organization schema present and valid", "Structured data removes doubt about which entity the page describes when several businesses share a name."],
    ["Service or Product schema describes what you sell", "Same reason, applied to the thing a customer is actually asking for."],
    ["Headings describe the content beneath them", "Retrieval systems use headings to find the passage that answers the question. A heading that says Welcome answers nothing."],
    ["Answers appear as text, not only inside images", "Menus, price lists and service areas published as images are common and unreadable."],
    ["Canonical URL declared", "Without it, the same page at four addresses splits whatever trust it has earned four ways."],
    ["robots.txt permits AI retrieval crawlers", "The most common single cause of absence. A rule written to stop scrapers often stops the answer engine too."],
    ["Sitemap reachable and current", "A positive list of what you want fetched. Stale entries send crawlers to pages that no longer exist."],
    ["Page reachable without running JavaScript", "The retrieval client does not run your app. If the served HTML is an empty shell, the page is empty to it."],
    ["Titles and descriptions unique per page", "Duplicate titles make every page look like the same page, so none of them is the best answer for anything."],
    ["Contact route reachable in one step", "When an assistant does name you, the customer still has to reach you. A contact path buried three clicks deep leaks the lead."],
  ]
)}
    </div>
  </section>

  <section>
    <div class="container narrow">
${head({ label: "What is not on the list", h: "And why." })}
      <ul class="check-list">
        <li><strong>Whether ChatGPT names you.</strong> That is answer presence, and it is sampled on a schedule with a stated denominator rather than checked once. The instrument for it is <a class="inline-link" href="https://citability.dev/" rel="noopener">Citability</a>; the audit here covers what you can fix on your own site before that measurement means anything.</li>
        <li><strong>A visibility score out of 100.</strong> Twelve checks with three possible verdicts do not become a percentage without hiding the could-not-measure column, and hiding that column is how a broken site gets reported as a healthy one.</li>
        <li><strong>Review counts and star ratings.</strong> They matter for the map pack and they are not something a website audit can repair.</li>
      </ul>
      <p>The audit is free because the diagnosis is the cheap part. What you do with a fail is described on <a class="inline-link" href="/services/">the services page</a>, and the first conversation about it happens after the results, not before.</p>
    </div>
  </section>

${relatedGuides("/guides/ai-visibility-audit-for-local-businesses/")}

${cta({
  h: "Get the twelve checks run on your site.",
  p: "A person runs them and emails the audit within 2 business days. Each check reports as pass, fail or could not measure, with the repair named next to every fail.",
  primary: { href: "/audit/", text: "Request my free audit →", ev: "guide_audit_checks" },
  secondary: { href: "/how-it-works/", text: "How the results turn into work", ev: "guide_audit_checks_hiw" },
})}`,
};
