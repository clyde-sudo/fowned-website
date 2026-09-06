import { head, answer, cta, table } from "../ui.mjs";
import { SITE, bookBtn, bookHref } from "../layout.mjs";

const BOOK_HREF = bookHref();

export default {
  path: "/services/",
  title: "Services | audit, fix and monitor AI visibility | Fowned",
  description:
    "Three service levels for a local business: repair the footprint AI reads, engineer the pages it cites, track leads from AI tools. Each starts from an audit.",
  schema: [
    {
      "@context": "https://schema.org",
      "@type": "Service",
      serviceType: "Generative engine optimization",
      provider: { "@type": "Organization", name: "Fowned", url: SITE.origin },
      description:
        "Audit, repair and ongoing monitoring of the signals AI assistants use to describe and recommend a business.",
      areaServed: "United States",
    },
  ],
  body: `  <section class="page-hero">
    <div class="container narrow">
      <span class="label">Services</span>
      <h1>Audit. Fix. Track. In that order.</h1>
      <p class="hero-sub">Each level builds on the one before it. We do not sell a fix before an audit says what is broken, because a recommendation without a diagnosis is a guess with an invoice attached.</p>
    </div>
  </section>

  <section>
    <div class="container">
      <div class="tier-grid">
        <div class="tier-card">
          <span class="label">01 / Get found</span>
          <h2>Footprint repair</h2>
          <p>The directories, listings and pages AI assistants read are cleaned up and made consistent. Contradictory addresses, stale phone numbers and missing hours are the most common reasons a business is described wrongly.</p>
          <ul class="tick-list">
            <li>Directory and listing audit</li>
            <li>Name, address and phone consistency</li>
            <li>Business entity and category correction</li>
            <li>Monthly measurement report</li>
          </ul>
          <p class="tier-who">Best for a business that is described inconsistently or not at all.</p>
          ${bookBtn("Talk about this level &rarr;", "services_book_found", "btn btn-secondary tier-cta")}
        </div>
        <div class="tier-card">
          <span class="label">02 / Get cited</span>
          <h2>On-site engineering</h2>
          <p>Everything in Get found, plus the pages themselves. Content is restructured so an assistant can lift a complete answer out of it, and the business is identified in machine-readable form.</p>
          <ul class="tick-list">
            <li>Answer-ready page structure</li>
            <li>Structured data for the business and its services</li>
            <li>Retrieval access review, including robots and WAF rules</li>
            <li>Server-rendered content where it is currently JavaScript-only</li>
          </ul>
          <p class="tier-who">Best for a business that is found but never quoted as the answer.</p>
          ${bookBtn("Talk about this level &rarr;", "services_book_cited", "btn btn-secondary tier-cta")}
        </div>
        <div class="tier-card">
          <span class="label">03 / Get leads</span>
          <h2>Attribution and pipeline</h2>
          <p>Everything above, plus the lead side. Each enquiry is labelled with where it actually came from, and the unknowns stay labelled unknown.</p>
          <ul class="tick-list">
            <li>Referrer capture and source classification</li>
            <li>Qualified lead handoff to your team</li>
            <li>Scheduled re-measurement</li>
            <li>Opportunity and intervention tracking</li>
          </ul>
          <p class="tier-who">Best for a business that needs the work to show up as booked calls.</p>
          ${bookBtn("Talk about this level &rarr;", "services_book_leads", "btn btn-secondary tier-cta")}
        </div>
      </div>
      <p class="center-link"><a class="inline-link" href="/demo/client/">See the client monitoring surface &rarr;</a></p>
    </div>
  </section>

  <section class="band">
    <div class="container narrow">
${head({ label: "Scope", h: "What each level actually delivers." })}
${table(
  ["", "Get found", "Get cited", "Get leads"],
  [
    ["Visibility audit", "Yes", "Yes", "Yes"],
    ["Listing and directory repair", "Yes", "Yes", "Yes"],
    ["On-page structure work", "&mdash;", "Yes", "Yes"],
    ["Structured data", "&mdash;", "Yes", "Yes"],
    ["Scheduled re-measurement", "Monthly", "Monthly", "Weekly"],
    ["Lead source labelling", "&mdash;", "&mdash;", "Yes"],
    ["Opportunity tracking", "&mdash;", "&mdash;", "Yes"],
  ]
)}
      <p class="fineprint">Pricing is set on the call, against what the audit finds. We do not publish a rate card because the work is scoped to the gap, and a fixed price before a diagnosis is either padded or unprofitable.</p>
    </div>
  </section>

  <section>
    <div class="container narrow">
${head({ label: "Common questions", h: "Before you ask us on a call." })}
${answer(
  "How long before anything changes?",
  "Retrieval and infrastructure fixes are visible to us on the next scheduled measurement, usually within a week. Whether an assistant starts naming you is a separate question with a longer and less predictable timeline, and we report the two separately rather than blending them into one number."
)}
${answer(
  "Do you guarantee AI will recommend my business?",
  "No, and nobody can. We can guarantee that the signals assistants rely on are present, correct and retrievable, and we can show you what is measured before and after. What we will not do is claim a specific answer changed because of us when we only observed a correlation."
)}
${answer(
  "Do you replace our SEO?",
  "No. Conventional search work and this overlap heavily on the technical side and diverge on content. If you have an SEO agency we work alongside them, and we will tell you when a recommendation of ours conflicts with one of theirs."
)}
    </div>
  </section>

${cta({
  h: "Start with the audit.",
  p: "It takes about a minute and tells us both what we are actually dealing with.",
  primary: { href: "/audit/", text: "Run my free audit →", ev: "services_audit" },
  secondary: { href: BOOK_HREF, text: "Book a call after the audit", ev: "services_book_footer", booking: true },
})}`,
};
