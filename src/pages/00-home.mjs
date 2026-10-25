import { head, cta, guideList, auditForm } from "../ui.mjs";
import { SITE, bookBtn } from "../layout.mjs";

export default {
  path: "/",
  title: "Fowned | Be the business AI recommends",
  ogTitle: "Fowned | Be the business AI recommends",
  description:
    "Fowned audits how AI assistants describe your business, fixes what they cannot read, and tracks which leads arrive from an AI tool. Start with a free audit.",
  scripts: ["/js/audit.js"],
  schema: [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "Fowned",
      url: SITE.origin,
      description:
        "Generative engine optimization agency. Audits, fixes and monitors how AI assistants describe a business.",
      telephone: "+1-831-332-0184",
      /* Required by schema.org Organization and flagged by the GSC Wizard
       * on-page audit 2026-09-18. Raster on purpose: Google Images does not
       * accept SVG, so fowned_logo.svg would satisfy the validator and still
       * be unusable for a rich result. The build copies an image only when
       * the rendered HTML names it, and this JSON-LD is rendered HTML, so
       * this reference is what keeps face_logo.png in dist/. */
      logo: SITE.origin + "/images/face_logo.png",
      sameAs: [SITE.linkedin],
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "Fowned",
      url: SITE.origin,
    },
  ],
  body: `  <section id="hero">
    <div class="container hero-grid">
      <div class="hero-text">
        <span class="brand-tag">Generative Engine Optimization</span>
        <h1>Be the business AI recommends.</h1>
        <p class="hero-sub">GEO gets your business named when AI tools like ChatGPT and Perplexity answer a customer's question. We audit your visibility, fix what's missing, and keep you cited as those answers change.</p>
        <div class="hero-ctas">
          <a href="/audit/" class="btn btn-primary" data-ev="cta_click" data-ev-label="hero_audit">Request my free audit &rarr;</a>
          <a href="/how-it-works/" class="btn btn-secondary" data-ev="cta_click" data-ev-label="hero_how">See how it works</a>
        </div>
        <div class="ai-badges">
          <span class="ai-badge">ChatGPT</span>
          <span class="ai-badge">Perplexity</span>
          <span class="ai-badge">Gemini</span>
          <span class="ai-badge">Claude</span>
        </div>
      </div>
      <div class="hero-visual">
        <div class="geo-card">
          <div class="geo-top">
            <span class="geo-dot"></span><span class="geo-dot"></span><span class="geo-dot"></span>
            <span class="geo-tag">AI answer &middot; simulated</span>
          </div>
          <div class="geo-body">
            <p class="geo-query">"what's the <b>best [service] near me?</b>"</p>
            <p class="geo-answer">
              Based on reviews and local reputation, a strong option is
              <span class="named">your business<span class="cite">[1]</span></span>,
              known for fast response times and clear pricing. Other choices include
              two nearby competitors, though they have fewer recent mentions.
            </p>
          </div>
          <div class="geo-foot">
            <span class="pill">Named first</span>
            <span class="geo-meta">Illustration of an AI answer, not a measurement</span>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section id="tiers">
    <div class="container">
${head({
  label: "Three levels of visibility",
  h: "Every plan starts from your audit.",
  sub: "Pick the outcome you want. Where you start depends on what the audit finds. Pricing is set on the call.",
  cta: { href: "/audit/", text: "Request free audit", ev: "tiers_audit" },
})}
      <img src="/images/fowned-portrait-transparent.png" alt="" class="tiers-portrait" width="320" height="320" loading="lazy" decoding="async">
      <div class="tier-grid">
        <div class="tier-card">
          <span class="label">01 / Get found</span>
          <h3>Get found</h3>
          <p>Footprint repair and listing cleanup so the directories and pages AI reads actually mention you. Monthly report included.</p>
          <a href="/services/" class="btn btn-secondary">What this covers &rarr;</a>
        </div>
        <div class="tier-card">
          <span class="label">02 / Get cited</span>
          <h3>Get cited</h3>
          <p>Everything in Get found, plus on-site structure and content engineered so AI tools quote you as the answer, not a footnote.</p>
          <a href="/services/" class="btn btn-secondary">What this covers &rarr;</a>
        </div>
        <div class="tier-card">
          <span class="label">03 / Get leads</span>
          <h3>Get leads</h3>
          <p>See which visitors arrived from an AI tool, and who to follow up with. A labelled list to act on, with the unknowns shown as unknown.</p>
          <a href="/ai-visibility/" class="btn btn-secondary">What this covers &rarr;</a>
        </div>
      </div>
      <div class="tier-foot">
        <p>Where you start depends on what the audit finds, so the level and the price are set together on the call rather than off a rate card.</p>
        ${bookBtn("Book a call &rarr;", "tiers_book")}
      </div>
    </div>
  </section>

  <section id="why">
    <div class="container">
      <div class="feature">
        <div>
          <span class="label feature-eyebrow">What we can actually show you</span>
          <h2>See which leads arrived from an AI tool.</h2>
          <p>When someone reaches you from an AI assistant, their browser usually tells us where they came from. We record that referrer on the lead and classify it. What we cannot do is prove which specific answer caused the visit, so we do not claim it. Leads that arrive with no referrer are labelled unknown rather than guessed at.</p>
          <p><a class="inline-link" href="/ai-visibility/">How attribution works &rarr;</a></p>
        </div>
        <div class="attr-card">
          <span class="attr-legend">How every lead is labelled</span>
          <div class="attr-row">
            <span class="attr-src">AI referrer</span>
            <span class="attr-name">Arrived from ChatGPT, Perplexity, Gemini, Claude or Copilot</span>
          </div>
          <div class="attr-row">
            <span class="attr-src attr-src-alt">Other referrer</span>
            <span class="attr-name">Arrived from a search engine, a link, or another site</span>
          </div>
          <div class="attr-row">
            <span class="attr-src attr-src-muted">Unknown</span>
            <span class="attr-name">No referrer sent. Not counted as direct, and never counted as AI</span>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section id="how">
    <div class="container">
${head({ label: "How it works", h: "Three steps, one loop." })}
      <div class="steps">
        <div class="step">
          <div class="step-num">1</div>
          <h3>Audit</h3>
          <p>We check your site against what AI tools rely on when they decide who to name, and record what is missing.</p>
        </div>
        <div class="step">
          <div class="step-num">2</div>
          <h3>Fix</h3>
          <p>We repair listings, citations, and on-site structure so the answers start naming you.</p>
        </div>
        <div class="step">
          <div class="step-num">3</div>
          <h3>Track</h3>
          <p>We re-measure on a schedule and record where each lead arrived from, so you can see what changed and what did not.</p>
        </div>
      </div>
      <p class="center-link"><a class="inline-link" href="/how-it-works/">The full method, step by step &rarr;</a></p>
    </div>
  </section>

  <section id="guides">
    <div class="container">
${head({ label: "Guides", h: "Read before you buy anything.", sub: "Six plain guides for a local business owner working out what AI visibility actually is and who to trust with it." })}
${guideList()}
      <p class="center-link"><a class="inline-link" href="/resources/">All guides and short answers &rarr;</a></p>
    </div>
  </section>

  <section id="audit">
    <div class="container">
      <div class="final-cta">
        <h2>See how AI describes your business.</h2>
        <p>We check your site against the things AI tools rely on when they decide who to name. No account needed.</p>
${auditForm()}
      </div>
    </div>
  </section>`,
};
