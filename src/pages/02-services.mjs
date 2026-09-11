import { head, answer, cta, table } from "../ui.mjs";
import { SITE, bookBtn, bookHref } from "../layout.mjs";

const BOOK_HREF = bookHref();

export default {
  path: "/services/",
  title: "AI SEO and GEO agency for local businesses | Fowned",
  description:
    "AI SEO and generative engine optimization for local service businesses. We repair the business record AI assistants read and engineer the pages they quote. Every engagement starts from an audit.",
  schema: [
    {
      "@context": "https://schema.org",
      "@type": "Service",
      name: "AI SEO and generative engine optimization for local businesses",
      serviceType: "Generative engine optimization",
      audience: { "@type": "Audience", audienceType: "Local service businesses" },
      provider: { "@type": "Organization", name: "Fowned", url: SITE.origin },
      description:
        "Audit, repair and ongoing monitoring of the signals AI assistants use to describe and recommend a business.",
      areaServed: "United States",
    },
  ],
  body: `  <section class="page-hero">
    <div class="container narrow">
      <span class="label">Services</span>
      <h1>An AI SEO and GEO agency for local businesses.</h1>
      <p class="hero-sub">Audit. Fix. Track. In that order. Each level builds on the one before it. We do not sell a fix before an audit says what is broken, because a recommendation without a diagnosis is a guess with an invoice attached.</p>
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
      <p class="fineprint">Pricing is set on the call, against what the audit finds. The one exception is the Visibility Sprint, which starts at a published $4,500 because its scope is fixed in advance. Everything else is scoped to the gap, and a fixed price before a diagnosis is either padded or unprofitable.</p>
    </div>
  </section>

  <section>
    <div class="container narrow">
${head({ label: "Common questions", h: "What you are hiring, and what you are not." })}
${answer(
  "Who is this for?",
  "Local service businesses that sell inside a defined service area and rely on being recommended: home services and contractors, dental and medical practices, med spas, law firms, cleaners, and the agencies that manage them. The work assumes you have a website you can change and a person who answers enquiries. If you sell nationally from a product page, the on-page half still applies and the local record half does not, so you would be paying for less than the page describes."
)}
${answer(
  "How is this different from a generic AI SEO or GEO agency?",
  "Two differences you can check before you pay anyone. First, the audit that scopes the work is an instrument rather than an opinion: it runs on Citability, a separate AI visibility product, and a check it could not complete is reported as unmeasured instead of being counted as a failure. Second, the work is scoped to the gap that audit finds. A provider who quotes before measuring is pricing a guess."
)}
${answer(
  "What does Citability measure, and where does it fit?",
  "Citability is the measurement side. It reads a page the way a retrieval agent does and reports whether the business is identifiable in the served HTML, whether structured data describes the business and its services, and whether an assistant is permitted to fetch the page at all. Fowned is the implementation side: we act on what that report says. Presence of those signals is a precondition for being named by an assistant, never a guarantee of it, and we do not report it as one."
)}
${answer(
  "Why hire an agency instead of buying a measurement tool?",
  "A tool tells you which signals are missing. It does not rewrite the page, reconcile the listing that disagrees with your website, unblock the crawler your firewall is refusing, or carry the change through your web developer. If you have people who will do that work, buy the tool at <a href=\"https://citability.dev/\">citability.dev</a> and keep the rest of the money. Hire us when the finding needs hands."
)}
${answer(
  "What happens after the audit?",
  "You receive the full result, and a call that reads it with you: what is broken, what to fix first, and what fixing it would take. Pricing is set on that call against what the audit found. If your gap turns out to be small enough to close yourself, we will say so on the call rather than sell you a level you do not need."
)}
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
      <p class="fineprint">Still comparing providers? The questions we would ask in your position are written up in <a href="/guides/how-to-choose-an-ai-seo-agency-for-a-local-business/">how to choose an AI SEO agency for a local business</a>, including the ones we find least comfortable to answer.</p>
    </div>
  </section>

${cta({
  h: "Start with the audit.",
  p: "It takes about a minute and tells us both what we are actually dealing with.",
  primary: { href: "/audit/", text: "Run my free audit →", ev: "services_audit" },
  secondary: { href: BOOK_HREF, text: "Book a call after the audit", ev: "services_book_footer", booking: true },
})}`,
};
